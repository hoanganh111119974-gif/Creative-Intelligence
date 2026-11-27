import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';
import {
  INDUSTRY_OPTIONS,
  MARKET_OPTIONS,
  SYSTEM_INSTRUCTION,
  getIndustryDisplay,
} from './src/constants/systemInstruction.ts';
import type {
  GroundingSource,
  IndustryOption,
  MarketOption,
  ReportRequestInput,
} from './src/types/report.ts';
import { buildReportTitle, buildUserPrompt } from './src/utils/reportParser.ts';
import { extractDomain, isSafePublicHttpUrl } from './src/utils/urlValidation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const VALID_MARKETS = new Set<string>(MARKET_OPTIONS.map((m) => m.value));
const VALID_INDUSTRIES = new Set<string>(INDUSTRY_OPTIONS.map((i) => i.value));
const MONTH_YEAR_REGEX = /^(0[1-9]|1[0-2])\/(20\d{2})$/;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw Object.assign(
      new Error(
        'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng kiểm tra khóa API trong phần Settings > Secrets.'
      ),
      { statusCode: 503 }
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractGroundingData(response: GenerateContentResponse): {
  sources: GroundingSource[];
  searchQueries: string[];
} {
  const candidate = response.candidates?.[0];
  const metadata = candidate?.groundingMetadata;
  const chunks = metadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri?.trim();
    const title = chunk?.web?.title?.trim();
    if (!uri || !isSafePublicHttpUrl(uri) || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({
      title: title || extractDomain(uri),
      uri,
      domain: extractDomain(uri),
      fromGrounding: true,
    });
  }

  const searchQueries = (metadata?.webSearchQueries ?? [])
    .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    .slice(0, 12);

  return { sources, searchQueries };
}

function mapGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const customStatus =
    typeof err === 'object' && err !== null && 'statusCode' in err
      ? Number((err as { statusCode?: unknown }).statusCode)
      : 0;

  if (customStatus >= 400 && customStatus < 600) {
    return { status: customStatus, message: rawMessage };
  }

  if (/API_KEY_INVALID|PERMISSION_DENIED|403|401/i.test(rawMessage)) {
    return {
      status: 403,
      message:
        'Khóa Gemini API không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra lại trong Settings > Secrets.',
    };
  }

  if (/RESOURCE_EXHAUSTED|429|quota/i.test(rawMessage)) {
    return {
      status: 429,
      message:
        'Đã vượt giới hạn lượt gọi Gemini API (429). Vui lòng thử lại sau ít phút hoặc kiểm tra hạn mức API key trong Settings > Secrets.',
    };
  }

  if (/NOT_FOUND|404/i.test(rawMessage)) {
    return {
      status: 502,
      message:
        'Không tìm thấy mô hình Gemini được yêu cầu. Vui lòng thử lại sau.',
    };
  }

  return {
    status: 500,
    message:
      'Không thể tạo Trend Report lúc này do lỗi kết nối tới Gemini API. Vui lòng thử lại.',
  };
}

async function generateWithGrounding(
  ai: GoogleGenAI,
  userPrompt: string,
  hasReferenceUrls: boolean
): Promise<GenerateContentResponse> {
  const model = 'gemini-4-hydrogen';

  if (hasReferenceUrls) {
    try {
      return await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }, { urlContext: {} }],
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Fallback to googleSearch-only if urlContext is rejected for the request
      if (/urlContext|url_context|tool|400|INVALID_ARGUMENT/i.test(msg)) {
        return await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
          },
        });
      }
      throw err;
    }
  }

  return await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
    },
  });
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/generate-report', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const monthYear = typeof body.monthYear === 'string' ? body.monthYear.trim() : '';
      const market = typeof body.market === 'string' ? body.market.trim() : '';
      const industry = typeof body.industry === 'string' ? body.industry.trim() : '';
      const customIndustry =
        typeof body.customIndustry === 'string' ? body.customIndustry.trim().slice(0, 80) : '';
      const rawUrls = Array.isArray(body.referenceUrls) ? body.referenceUrls : [];

      if (!MONTH_YEAR_REGEX.test(monthYear)) {
        res.status(400).json({
          error: 'Định dạng Tháng/Năm không hợp lệ. Vui lòng chọn theo chuẩn MM/YYYY.',
        });
        return;
      }

      if (!VALID_MARKETS.has(market)) {
        res.status(400).json({
          error: 'Thị trường không hợp lệ. Chỉ chấp nhận Hàn Quốc, Trung Quốc hoặc Cả hai.',
        });
        return;
      }

      if (!VALID_INDUSTRIES.has(industry)) {
        res.status(400).json({
          error: 'Ngành hàng không hợp lệ.',
        });
        return;
      }

      const validatedUrls: string[] = [];
      const seenUrls = new Set<string>();
      for (const item of rawUrls) {
        if (typeof item !== 'string') continue;
        const trimmed = item.trim();
        if (!trimmed) continue;
        if (!isSafePublicHttpUrl(trimmed)) {
          res.status(400).json({
            error: `URL tham khảo không hợp lệ hoặc không được hỗ trợ: "${trimmed}". Chỉ chấp nhận liên kết công khai http:// hoặc https://.`,
          });
          return;
        }
        if (!seenUrls.has(trimmed) && validatedUrls.length < 10) {
          seenUrls.add(trimmed);
          validatedUrls.push(trimmed);
        }
      }

      const requestInput: ReportRequestInput = {
        monthYear,
        market: market as MarketOption,
        industry: industry as IndustryOption,
        customIndustry,
        referenceUrls: validatedUrls,
      };

      const userPrompt = buildUserPrompt(requestInput);
      const industryLabel = getIndustryDisplay(
        requestInput.industry,
        requestInput.customIndustry
      );
      const title = buildReportTitle(monthYear, requestInput.market, industryLabel);

      const ai = getGeminiClient();
      const response = await generateWithGrounding(
        ai,
        userPrompt,
        validatedUrls.length > 0
      );

      const markdown = response.text?.trim() ?? '';
      if (!markdown) {
        res.status(502).json({
          error:
            'Mô hình không trả về nội dung báo cáo. Vui lòng thử lại hoặc điều chỉnh bộ lọc.',
        });
        return;
      }

      const { sources, searchQueries } = extractGroundingData(response);

      res.json({
        title,
        monthYear,
        market: requestInput.market,
        industry: requestInput.industry,
        industryLabel,
        referenceUrls: validatedUrls,
        userPrompt,
        markdown,
        sources,
        searchQueries,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      const mapped = mapGeminiError(err);
      console.error('[Creative_Intelligence] /api/generate-report error:', err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Creative_Intelligence server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
