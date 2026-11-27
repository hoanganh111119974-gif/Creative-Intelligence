import test from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_INSTRUCTION } from '../constants/systemInstruction';
import { SAMPLE_REPORT } from '../data/sampleReport';
import {
  buildMarkdownExport,
  buildReportTitle,
  buildUserPrompt,
  detectCertaintyInText,
  detectInsufficientData,
  extractHexCodes,
  parseFullReport,
  parsePromptsFromSection,
  parseTrendsFromSection,
} from './reportParser';
import { isSafePublicHttpUrl, parseReferenceUrlsInput } from './urlValidation';

test('SYSTEM_INSTRUCTION preserves exact required sections and rules verbatim', () => {
  assert.ok(SYSTEM_INSTRUCTION.startsWith('# VAI TRÒ\nBạn là Senior Art Director kiêm Trend Analyst'));
  assert.ok(SYSTEM_INSTRUCTION.includes('LUÔN dùng Google Search grounding để lấy thông tin trong 30-60 ngày gần nhất.'));
  assert.ok(SYSTEM_INSTRUCTION.includes('[Cao] có nhiều nguồn độc lập / [Trung bình] / [Thấp] suy luận.'));
  assert.ok(SYSTEM_INSTRUCTION.includes('nói thẳng "chưa đủ dữ liệu" thay vì đoán.'));
  assert.ok(SYSTEM_INSTRUCTION.includes('## 7. Prompt phụ trợ: tạo 3 prompt (cho Midjourney/Imagen/Firefly) mô tả moodboard'));
  assert.ok(
    SYSTEM_INSTRUCTION.endsWith(
      'Nếu người dùng không trả lời, tự đặt giả định và ghi rõ giả định đó.'
    )
  );
});

test('URL validation accepts public HTTP(S) URLs and blocks unsafe schemes and private addresses', () => {
  assert.equal(isSafePublicHttpUrl('https://www.behance.net/gallery/12345'), true);
  assert.equal(isSafePublicHttpUrl('http://example.com/trend-2026'), true);
  assert.equal(isSafePublicHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafePublicHttpUrl('data:text/html,<h1>hi</h1>'), false);
  assert.equal(isSafePublicHttpUrl('http://localhost:3000/api'), false);
  assert.equal(isSafePublicHttpUrl('http://127.0.0.1/secret'), false);
  assert.equal(isSafePublicHttpUrl('http://169.254.169.254/latest/meta-data'), false);
  assert.equal(isSafePublicHttpUrl('http://192.168.1.10/admin'), false);
  assert.equal(isSafePublicHttpUrl('http://10.0.0.5/internal'), false);
  assert.equal(isSafePublicHttpUrl('not-a-url'), false);

  const parsed = parseReferenceUrlsInput(
    'https://www.behance.net/a\nnot-valid\nhttps://www.behance.net/a\nhttps://dribbble.com/shots'
  );
  assert.deepEqual(parsed.validUrls, [
    'https://www.behance.net/a',
    'https://dribbble.com/shots',
  ]);
  assert.deepEqual(parsed.invalidLines, ['not-valid']);
});

test('buildUserPrompt formats month, market, industry, and optional URLs cleanly', () => {
  const prompt = buildUserPrompt({
    monthYear: '11/2026',
    market: 'Both',
    industry: 'cosmetics',
    referenceUrls: ['https://www.behance.net/gallery/1'],
  });
  assert.ok(prompt.includes('Trend Report tháng 11/2026'));
  assert.ok(prompt.includes('Hàn Quốc & Trung Quốc'));
  assert.ok(prompt.includes('Mỹ phẩm'));
  assert.ok(prompt.includes('https://www.behance.net/gallery/1'));

  const title = buildReportTitle('11/2026', 'Korea', 'F&B');
  assert.equal(title, '11/2026 · Hàn Quốc · F&B');
});

test('extractHexCodes finds all unique normalized HEX codes and ignores URLs', () => {
  const text =
    'Bảng màu: #f7f5f0, #2E4A62, #abc, trùng #F7F5F0 và link https://example.com/#deadbe không tính.';
  const codes = extractHexCodes(text);
  assert.deepEqual(codes, ['#F7F5F0', '#2E4A62', '#AABBCC']);
});

test('detectCertaintyInText identifies [Cao], [Trung bình], and [Thấp]', () => {
  assert.equal(detectCertaintyInText('Độ chắc chắn: [Cao] từ 4 nguồn.'), 'Cao');
  assert.equal(detectCertaintyInText('Độ chắc chắn: [Trung bình] quan sát.'), 'Trung bình');
  assert.equal(detectCertaintyInText('Mức [Thấp] suy luận.'), 'Thấp');
  assert.equal(detectCertaintyInText('Không có nhãn nào'), null);
});

test('detectInsufficientData surfaces clear warning when model reports insufficient data', () => {
  const positive = detectInsufficientData(
    '## 1. Tóm tắt\n- Hiện tại chưa đủ dữ liệu cho tháng 12/2027 tại thị trường Hàn Quốc.'
  );
  assert.equal(positive.hasNotice, true);
  assert.equal(positive.excerpts.length, 1);

  const negative = detectInsufficientData(SAMPLE_REPORT.markdown);
  assert.equal(negative.hasNotice, false);
});

test('parseFullReport splits 7 sections, trend cards, prompts, HEX codes, and merged sources', () => {
  const parsed = parseFullReport(SAMPLE_REPORT.markdown, SAMPLE_REPORT.sources);
  assert.equal(parsed.sections.length, 7);
  assert.equal(parsed.sections[0].kind, 'summary');
  assert.equal(parsed.sections[1].kind, 'korea');
  assert.equal(parsed.sections[2].kind, 'china');
  assert.equal(parsed.sections[6].kind, 'prompts');

  const krTrends = parseTrendsFromSection(parsed.sections[1].content);
  assert.equal(krTrends.length, 2);
  assert.equal(krTrends[0].certainty, 'Cao');
  assert.equal(krTrends[0].lifecycle, 'Đang lên');
  assert.ok(krTrends[0].hexColors.includes('#F7F5F0'));
  assert.ok(krTrends[0].hexColors.includes('#2E4A62'));

  const cnTrends = parseTrendsFromSection(parsed.sections[2].content);
  assert.equal(cnTrends.length, 2);
  assert.equal(cnTrends[1].certainty, 'Thấp');

  const prompts = parsePromptsFromSection(parsed.sections[6].content);
  assert.equal(prompts.length, 3);
  assert.ok(prompts[0].promptText.includes('frosted glass dropper serum bottle'));
  assert.equal(prompts[0].toolHint, 'Midjourney');
  assert.equal(prompts[1].toolHint, 'Imagen');
  assert.equal(prompts[2].toolHint, 'Adobe Firefly');

  assert.ok(parsed.mergedSources.length >= 3);
});

test('buildMarkdownExport generates sanitized filename and includes grounded sources', () => {
  const exported = buildMarkdownExport(SAMPLE_REPORT);
  assert.equal(
    exported.filename,
    'Creative_Intelligence_11-2026_both_my-pham-cosmetics.md'
  );
  assert.ok(exported.content.includes('TREND REPORT THÁNG 11/2026'));
  assert.ok(exported.content.includes('## Nguồn tham khảo'));
  assert.ok(exported.content.includes('https://www.behance.net/search/projects?search=seoul+cosmetics+poster'));
});
