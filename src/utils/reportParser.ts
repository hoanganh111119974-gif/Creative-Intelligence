import {
  getIndustryDisplay,
  getMarketDisplay,
  getMarketPromptLabel,
} from '../constants/systemInstruction';
import type {
  CertaintyLevel,
  GroundingSource,
  InsufficientDataNotice,
  ParsedPromptItem,
  ParsedReport,
  ParsedSection,
  ParsedTrend,
  ParsedTrendField,
  ReportRequestInput,
  SavedReport,
} from '../types/report';
import { extractDomain, isSafePublicHttpUrl } from './urlValidation';

export const HEX_REGEX = /(?<![A-Za-z0-9_/-])#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})(?![0-9A-Fa-f])/g;
export const CERTAINTY_REGEX = /\[(Cao|Trung bình|Thấp)\]/gi;

export function normalizeHex(hex: string): string {
  const clean = hex.trim().toUpperCase();
  if (/^#[0-9A-F]{3}$/.test(clean)) {
    const r = clean[1];
    const g = clean[2];
    const b = clean[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return clean;
}

export function extractHexCodes(text: string): string[] {
  // Strip markdown link URLs first so URL fragments like https://site.com/#abc123 aren't treated as colors
  const withoutUrls = text.replace(/https?:\/\/[^\s)>\]]+/gi, ' ');
  const seen = new Set<string>();
  const results: string[] = [];

  for (const match of withoutUrls.matchAll(HEX_REGEX)) {
    const raw = `#${match[1].toUpperCase()}`;
    const normalized = normalizeHex(raw);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      results.push(normalized);
    }
  }
  return results;
}

export function normalizeCertainty(raw: string): CertaintyLevel | null {
  const lowered = raw.trim().toLowerCase();
  if (lowered === 'cao') return 'Cao';
  if (lowered === 'trung bình' || lowered === 'trung binh') return 'Trung bình';
  if (lowered === 'thấp' || lowered === 'thap') return 'Thấp';
  return null;
}

export function detectCertaintyInText(text: string): CertaintyLevel | null {
  const match = text.match(/\[(Cao|Trung bình|Thấp)\]/i);
  if (match) {
    return normalizeCertainty(match[1]);
  }
  const plainMatch = text.match(/độ chắc chắn\s*:?\s*(Cao|Trung bình|Thấp)/i);
  if (plainMatch) {
    return normalizeCertainty(plainMatch[1]);
  }
  return null;
}

export function detectLifecycleInText(text: string): string | null {
  const lifecycleKeywords = [
    'Mới nổi',
    'Đang lên',
    'Bão hòa',
    'Sắp lỗi thời',
  ];
  const lineMatch = text.match(/vòng đời[^:\n]*:\s*([^\n]+)/i);
  if (lineMatch) {
    const line = lineMatch[1].replace(/\*\*/g, '').trim();
    for (const kw of lifecycleKeywords) {
      if (line.toLowerCase().includes(kw.toLowerCase())) {
        return kw;
      }
    }
    return line.slice(0, 40);
  }
  for (const kw of lifecycleKeywords) {
    if (text.toLowerCase().includes(kw.toLowerCase())) {
      return kw;
    }
  }
  return null;
}

export function buildUserPrompt(input: ReportRequestInput): string {
  const marketLabel = getMarketPromptLabel(input.market);
  const industryLabel = getIndustryDisplay(input.industry, input.customIndustry);

  let prompt = `Trend Report tháng ${input.monthYear}, thị trường ${marketLabel}, ngành ${industryLabel}.`;

  if (input.market === 'Korea') {
    prompt +=
      '\n\nLưu ý phạm vi thị trường: Tập trung sâu vào thị trường Hàn Quốc (mục 2); mục 3 và mục 4 có thể nêu ngắn gọn bối cảnh đối chiếu hoặc ghi rõ người dùng chỉ chọn thị trường Hàn Quốc.';
  } else if (input.market === 'China') {
    prompt +=
      '\n\nLưu ý phạm vi thị trường: Tập trung sâu vào thị trường Trung Quốc (mục 3); mục 2 và mục 4 có thể nêu ngắn gọn bối cảnh đối chiếu hoặc ghi rõ người dùng chỉ chọn thị trường Trung Quốc.';
  }

  const safeUrls = input.referenceUrls.filter((u) => isSafePublicHttpUrl(u));
  if (safeUrls.length > 0) {
    prompt +=
      '\n\nTài liệu tham khảo đính kèm (hãy đọc các URL sau làm ngữ cảnh bổ sung cho báo cáo):\n' +
      safeUrls.map((url) => `- ${url}`).join('\n');
  }

  return prompt;
}

export function buildReportTitle(
  monthYear: string,
  market: ReportRequestInput['market'],
  industryLabel: string
): string {
  return `${monthYear} · ${getMarketDisplay(market)} · ${industryLabel}`;
}

export function detectInsufficientData(markdown: string): InsufficientDataNotice {
  const patterns = [
    /chưa đủ dữ liệu/i,
    /không đủ dữ liệu/i,
    /thiếu dữ liệu/i,
    /không tìm được dữ liệu/i,
    /không tìm thấy dữ liệu/i,
    /chưa có đủ dữ liệu/i,
    /insufficient data/i,
  ];

  const lines = markdown.split('\n');
  const excerpts: string[] = [];

  for (const rawLine of lines) {
    const clean = rawLine.replace(/^#+\s*/, '').replace(/^[-*•]\s*/, '').replace(/\*\*/g, '').trim();
    if (!clean) continue;
    if (patterns.some((p) => p.test(clean))) {
      if (!excerpts.includes(clean)) {
        excerpts.push(clean);
      }
    }
  }

  return {
    hasNotice: excerpts.length > 0,
    excerpts: excerpts.slice(0, 4),
  };
}

function classifySectionKind(
  heading: string,
  number: number | null
): ParsedSection['kind'] {
  const lower = heading.toLowerCase();
  if (number === 1 || lower.includes('tóm tắt')) return 'summary';
  if (
    number === 2 ||
    (lower.includes('hàn quốc') && !lower.includes('trung') && !lower.includes('giao thoa'))
  ) {
    return 'korea';
  }
  if (
    number === 3 ||
    (lower.includes('trung quốc') && !lower.includes('hàn') && !lower.includes('giao thoa'))
  ) {
    return 'china';
  }
  if (number === 4 || lower.includes('giao thoa') || lower.includes('khác biệt')) {
    return 'comparison';
  }
  if (number === 5 || lower.includes('khuyến nghị')) return 'recommendations';
  if (number === 6 || lower.includes('brief')) return 'brief';
  if (number === 7 || lower.includes('prompt')) return 'prompts';
  return 'other';
}

export function parseReportSections(markdown: string): {
  reportTitle: string;
  preamble: string;
  sections: ParsedSection[];
} {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n');

  let reportTitle = '';
  const preambleLines: string[] = [];
  const sections: ParsedSection[] = [];

  let currentSection: {
    rawHeading: string;
    title: string;
    number: number | null;
    lines: string[];
  } | null = null;

  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match && !reportTitle && sections.length === 0 && !currentSection) {
      reportTitle = h1Match[1].replace(/\*\*/g, '').trim();
      continue;
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (currentSection) {
        const cleanTitle = currentSection.title;
        sections.push({
          id: `section-${sections.length + 1}`,
          number: currentSection.number,
          title: cleanTitle,
          rawHeading: currentSection.rawHeading,
          content: currentSection.lines.join('\n').trim(),
          kind: classifySectionKind(cleanTitle, currentSection.number),
        });
      }
      const rawHeading = h2Match[1].replace(/\*\*/g, '').trim();
      const numMatch = rawHeading.match(/^(\d+)\.\s*(.+)$/);
      currentSection = {
        rawHeading,
        number: numMatch ? parseInt(numMatch[1], 10) : null,
        title: numMatch ? numMatch[2].trim() : rawHeading,
        lines: [],
      };
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(line);
    } else {
      preambleLines.push(line);
    }
  }

  if (currentSection) {
    sections.push({
      id: `section-${sections.length + 1}`,
      number: currentSection.number,
      title: currentSection.title,
      rawHeading: currentSection.rawHeading,
      content: currentSection.lines.join('\n').trim(),
      kind: classifySectionKind(currentSection.title, currentSection.number),
    });
  }

  return {
    reportTitle,
    preamble: preambleLines.join('\n').trim(),
    sections,
  };
}

function parseTrendBlock(title: string, body: string, index: number): ParsedTrend {
  const cleanTitle = title
    .replace(/^#+\s*/, '')
    .replace(/^\d+[\.)]\s*/, '')
    .replace(/^Xu hướng\s*\d+\s*[:–-]\s*/i, '')
    .replace(/\*\*/g, '')
    .trim();

  let visualLanguage = '';
  let industries = '';
  let posterApplication = '';
  let sourcesText = '';
  const extraFields: ParsedTrendField[] = [];

  const lines = body.split('\n');
  let activeTarget: 'visual' | 'industries' | 'poster' | 'sources' | 'extra' | null = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const fieldMatch = trimmed.match(/^(?:[-*•]\s*)?\*\*([^*:]+):?\*\*\s*:?\s*(.*)$/) ||
      trimmed.match(/^(?:[-*•]\s*)?([^:]{3,42}):\s+(.+)$/);

    if (fieldMatch) {
      const label = fieldMatch[1].replace(/\*\*/g, '').trim();
      const value = fieldMatch[2].trim();
      const lowerLabel = label.toLowerCase();

      if (lowerLabel.includes('tên xu hướng')) {
        // Already captured in title unless title was generic
        continue;
      } else if (
        lowerLabel.includes('ngôn ngữ thị giác') ||
        lowerLabel.includes('bảng màu') ||
        lowerLabel.includes('typography') ||
        lowerLabel.includes('bố cục') ||
        lowerLabel.includes('chất liệu') ||
        lowerLabel.includes('mood')
      ) {
        if (lowerLabel.includes('ngôn ngữ thị giác')) {
          if (value) {
            visualLanguage = visualLanguage ? `${visualLanguage}\n${value}` : value;
          }
        } else {
          const entry = `- **${label}:** ${value}`;
          visualLanguage = visualLanguage ? `${visualLanguage}\n${entry}` : entry;
        }
        activeTarget = 'visual';
      } else if (lowerLabel.includes('ngành')) {
        industries = industries ? `${industries}; ${value}` : value;
        activeTarget = 'industries';
      } else if (lowerLabel.includes('ứng dụng') || lowerLabel.includes('poster')) {
        posterApplication = posterApplication ? `${posterApplication}\n${value}` : value;
        activeTarget = 'poster';
      } else if (lowerLabel.includes('độ chắc chắn') || lowerLabel.includes('nguồn')) {
        sourcesText = sourcesText ? `${sourcesText}\n${value}` : value;
        activeTarget = 'sources';
      } else if (lowerLabel.includes('vòng đời')) {
        // Captured separately by detectLifecycleInText
        activeTarget = null;
      } else {
        extraFields.push({ label, value });
        activeTarget = 'extra';
      }
      continue;
    }

    // Continuation bullet line
    const bulletText = trimmed.replace(/^[-*•]\s+/, '');
    if (activeTarget === 'visual') {
      visualLanguage = visualLanguage ? `${visualLanguage}\n${bulletText}` : bulletText;
    } else if (activeTarget === 'poster') {
      posterApplication = posterApplication ? `${posterApplication}\n${bulletText}` : bulletText;
    } else if (activeTarget === 'sources') {
      sourcesText = sourcesText ? `${sourcesText}\n${bulletText}` : bulletText;
    } else if (activeTarget === 'industries') {
      industries = industries ? `${industries} ${bulletText}` : bulletText;
    } else if (activeTarget === 'extra' && extraFields.length > 0) {
      extraFields[extraFields.length - 1].value += `\n${bulletText}`;
    } else {
      visualLanguage = visualLanguage ? `${visualLanguage}\n${bulletText}` : bulletText;
    }
  }

  return {
    id: `trend-${index}-${cleanTitle.slice(0, 16).replace(/\W+/g, '-').toLowerCase()}`,
    index,
    title: cleanTitle || `Xu hướng ${index}`,
    hexColors: extractHexCodes(`${title}\n${body}`),
    certainty: detectCertaintyInText(`${title}\n${body}`),
    lifecycle: detectLifecycleInText(body),
    visualLanguage: visualLanguage.trim(),
    industries: industries.trim(),
    posterApplication: posterApplication.trim(),
    sourcesText: sourcesText.trim(),
    extraFields,
    rawBody: body.trim(),
  };
}

export function parseTrendsFromSection(content: string): ParsedTrend[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  // Strategy 1: Split by ### headings (most common Gemini output)
  const h3Matches = [...trimmed.matchAll(/^###\s+(.+)$/gm)];
  if (h3Matches.length > 0) {
    const trends: ParsedTrend[] = [];
    for (let i = 0; i < h3Matches.length; i++) {
      const startIdx = h3Matches[i].index! + h3Matches[i][0].length;
      const endIdx = i + 1 < h3Matches.length ? h3Matches[i + 1].index! : trimmed.length;
      const body = trimmed.slice(startIdx, endIdx).trim();
      trends.push(parseTrendBlock(h3Matches[i][1], body, i + 1));
    }
    return trends;
  }

  // Strategy 2: Split by bold numbered headers like "1. **Trend Name**" or "**1. Trend Name**"
  const numberedMatches = [
    ...trimmed.matchAll(/^(?:\*\*)?(?:Xu hướng\s*)?(\d+)[\.)]\s+\*{0,2}([^\n*]+)\*{0,2}$/gm),
  ];
  if (numberedMatches.length > 0) {
    const trends: ParsedTrend[] = [];
    for (let i = 0; i < numberedMatches.length; i++) {
      const startIdx = numberedMatches[i].index! + numberedMatches[i][0].length;
      const endIdx =
        i + 1 < numberedMatches.length ? numberedMatches[i + 1].index! : trimmed.length;
      const body = trimmed.slice(startIdx, endIdx).trim();
      if (body.length > 20) {
        trends.push(parseTrendBlock(numberedMatches[i][2], body, i + 1));
      }
    }
    if (trends.length > 0) return trends;
  }

  return [];
}

export function parsePromptsFromSection(content: string): ParsedPromptItem[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const prompts: ParsedPromptItem[] = [];

  // Helper to infer tool hint
  const inferToolHint = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('midjourney') || lower.includes('--ar') || lower.includes('--v')) {
      return 'Midjourney';
    }
    if (lower.includes('imagen')) return 'Imagen';
    if (lower.includes('firefly')) return 'Adobe Firefly';
    return 'Midjourney / Imagen / Firefly';
  };

  // Strategy 1: Split by ### subheadings or numbered/bold prompt headers
  const headingRegex =
    /^(?:###\s+(.+)|(?:\*\*)?(?:Prompt|Moodboard)\s*(\d+)[^:\n]*(?:\*\*)?:?(.*)|(\d+)[\.)]\s+\*\*([^*]+)\*\*:?(.*))$/gim;
  const matches = [...trimmed.matchAll(headingRegex)];

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const startIdx = matches[i].index! + matches[i][0].length;
      const endIdx = i + 1 < matches.length ? matches[i + 1].index! : trimmed.length;
      const rawHeading = matches[i][0].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      const trailingOnLine = (matches[i][3] || matches[i][6] || '').trim();
      const blockBody = [trailingOnLine, trimmed.slice(startIdx, endIdx).trim()]
        .filter(Boolean)
        .join('\n')
        .trim();

      // Prefer fenced code block or blockquote inside the prompt block if present
      const codeMatch = blockBody.match(/```(?:\w*)\n([\s\S]*?)```/);
      const quoteLines = blockBody
        .split('\n')
        .filter((l) => l.trim().startsWith('>'))
        .map((l) => l.trim().replace(/^>\s?/, ''));

      let promptText = '';
      let notes = '';

      if (codeMatch) {
        promptText = codeMatch[1].trim();
        notes = blockBody.replace(codeMatch[0], '').trim();
      } else if (quoteLines.length > 0) {
        promptText = quoteLines.join('\n').trim();
        notes = blockBody
          .split('\n')
          .filter((l) => !l.trim().startsWith('>'))
          .join('\n')
          .trim();
      } else {
        // Look for inline backtick or quoted prompt text
        const inlineCodeMatch = blockBody.match(/`([^`]{30,})`/);
        if (inlineCodeMatch) {
          promptText = inlineCodeMatch[1].trim();
          notes = blockBody.replace(inlineCodeMatch[0], '').trim();
        } else {
          promptText = blockBody.replace(/^[-*•]\s*/, '').replace(/^["“]|["”]$/g, '').trim();
        }
      }

      if (promptText) {
        prompts.push({
          id: `prompt-${i + 1}`,
          index: i + 1,
          title: rawHeading.replace(/:$/, '') || `Prompt ${i + 1}`,
          toolHint: inferToolHint(`${rawHeading} ${promptText}`),
          promptText,
          notes,
        });
      }
    }
  }

  // Strategy 2: Fenced code blocks anywhere in the section
  if (prompts.length === 0) {
    const codeBlocks = [...trimmed.matchAll(/```(?:\w*)\n([\s\S]*?)```/g)];
    codeBlocks.forEach((match, idx) => {
      const promptText = match[1].trim();
      if (promptText) {
        prompts.push({
          id: `prompt-${idx + 1}`,
          index: idx + 1,
          title: `Prompt Moodboard ${idx + 1}`,
          toolHint: inferToolHint(promptText),
          promptText,
          notes: '',
        });
      }
    });
  }

  // Strategy 3: Numbered or bulleted paragraphs
  if (prompts.length === 0) {
    const items = trimmed
      .split(/\n(?=\d+[\.)]\s+|[-*•]\s+)/)
      .map((s) => s.replace(/^(?:\d+[\.)]|[-*•])\s+/, '').trim())
      .filter((s) => s.length > 25);

    items.forEach((item, idx) => {
      prompts.push({
        id: `prompt-${idx + 1}`,
        index: idx + 1,
        title: `Prompt Moodboard ${idx + 1}`,
        toolHint: inferToolHint(item),
        promptText: item.replace(/\*\*/g, '').replace(/^["“]|["”]$/g, '').trim(),
        notes: '',
      });
    });
  }

  return prompts;
}

export function extractInlineSources(markdown: string): GroundingSource[] {
  const sources: GroundingSource[] = [];
  const seen = new Set<string>();

  // 1. Markdown links: [Title](https://...)
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
  for (const match of markdown.matchAll(mdLinkRegex)) {
    const title = match[1].trim();
    const uri = match[2].trim().replace(/[.,;]+$/, '');
    if (isSafePublicHttpUrl(uri) && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        title: title || extractDomain(uri),
        uri,
        domain: extractDomain(uri),
        fromGrounding: false,
      });
    }
  }

  // 2. Bare URLs
  const strippedMd = markdown.replace(mdLinkRegex, ' ');
  const bareUrlRegex = /https?:\/\/[^\s<>)\]"']+/gi;
  for (const match of strippedMd.matchAll(bareUrlRegex)) {
    const uri = match[0].trim().replace(/[.,;]+$/, '');
    if (isSafePublicHttpUrl(uri) && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        title: extractDomain(uri),
        uri,
        domain: extractDomain(uri),
        fromGrounding: false,
      });
    }
  }

  return sources;
}

export function mergeSources(
  groundingSources: GroundingSource[],
  inlineSources: GroundingSource[]
): GroundingSource[] {
  const seen = new Set<string>();
  const merged: GroundingSource[] = [];

  for (const src of [...groundingSources, ...inlineSources]) {
    if (!isSafePublicHttpUrl(src.uri)) continue;
    if (seen.has(src.uri)) continue;
    seen.add(src.uri);
    merged.push({
      ...src,
      domain: src.domain || extractDomain(src.uri),
      title: src.title?.trim() || extractDomain(src.uri),
    });
  }

  return merged;
}

export function parseFullReport(
  markdown: string,
  groundingSources: GroundingSource[] = []
): ParsedReport {
  const { reportTitle, preamble, sections } = parseReportSections(markdown);
  const insufficientData = detectInsufficientData(markdown);
  const allHexColors = extractHexCodes(markdown);
  const inlineSources = extractInlineSources(markdown);
  const mergedSources = mergeSources(groundingSources, inlineSources);

  return {
    reportTitle,
    preamble,
    sections,
    insufficientData,
    allHexColors,
    mergedSources,
  };
}

export function buildMarkdownExport(report: SavedReport): {
  filename: string;
  content: string;
} {
  const safeMonth = report.monthYear.replace('/', '-');
  const safeMarket = report.market.toLowerCase();
  const safeIndustry = report.industryLabel
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const filename = `Creative_Intelligence_${safeMonth}_${safeMarket}_${safeIndustry || 'report'}.md`;

  const lines: string[] = [
    `<!-- Creative_Intelligence Export -->`,
    `<!-- Báo cáo: ${report.title} -->`,
    `<!-- Ngày tạo: ${report.createdAt} -->`,
    '',
    report.markdown.trim(),
  ];

  const inlineSources = extractInlineSources(report.markdown);
  const mergedSources = mergeSources(report.sources, inlineSources);

  if (mergedSources.length > 0) {
    lines.push('', '---', '', '## Nguồn tham khảo (Google Search Grounding & Trích dẫn)', '');
    mergedSources.forEach((src, i) => {
      lines.push(`${i + 1}. [${src.title}](${src.uri}) (${src.domain})`);
    });
  }

  return {
    filename,
    content: lines.join('\n') + '\n',
  };
}
