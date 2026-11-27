import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  PenLine,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getMarketDisplay } from '../constants/systemInstruction';
import type { SavedReport } from '../types/report';
import { buildMarkdownExport, parseFullReport } from '../utils/reportParser';
import { PaletteStrip, copyTextToClipboard } from './HexSwatch';
import { PromptCardsView } from './PromptCardsView';
import { RichTextRenderer } from './RichTextRenderer';
import { TrendSectionView } from './TrendSectionView';

interface ReportViewerProps {
  report: SavedReport;
  onExportMarkdown: (report: SavedReport) => void;
  onEditParameters: (report: SavedReport) => void;
  onNotify: (message: string) => void;
}

function formatDateTimeVi(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ReportViewer({
  report,
  onExportMarkdown,
  onEditParameters,
  onNotify,
}: ReportViewerProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const parsed = useMemo(
    () => parseFullReport(report.markdown, report.sources),
    [report.markdown, report.sources]
  );

  const handleCopyAll = async () => {
    const { content } = buildMarkdownExport(report);
    const ok = await copyTextToClipboard(content);
    if (ok) {
      setCopiedAll(true);
      onNotify('Đã sao chép toàn bộ báo cáo định dạng Markdown');
      window.setTimeout(() => setCopiedAll(false), 1800);
    }
  };

  return (
    <article className="max-w-4xl mx-auto w-full space-y-10 pb-16">
      {/* Editorial Masthead */}
      <header className="space-y-5 pb-7 border-b border-[#E6E2DC] dark:border-[#2B2A27]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#66605A] dark:text-[#A09B93]">
          <span>
            Tháng <span className="font-mono tabular-nums">{report.monthYear}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>Thị trường: {getMarketDisplay(report.market)}</span>
          <span aria-hidden="true">·</span>
          <span>Ngành: {report.industryLabel}</span>
          <span aria-hidden="true">·</span>
          <span>
            Tạo lúc{' '}
            <span className="font-mono tabular-nums">
              {formatDateTimeVi(report.createdAt)}
            </span>
          </span>
          {report.isSample && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-[#1D4ED8] dark:text-[#60A5FA]">
                Báo cáo mẫu minh họa
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171513] dark:text-[#F3F1ED] leading-tight">
          {parsed.reportTitle &&
          parsed.reportTitle !== parsed.reportTitle.toUpperCase()
            ? parsed.reportTitle
            : `Trend Report Tháng ${report.monthYear}${report.isSample ? ' — Mẫu tham khảo' : ''}`}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onExportMarkdown(report)}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Xuất Markdown (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-white dark:bg-[#191917] hover:border-[#1D4ED8] dark:hover:border-[#60A5FA] text-xs font-medium text-[#171513] dark:text-[#F3F1ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" aria-hidden="true" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sao chép Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onEditParameters(report)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-transparent hover:bg-[#F2EFEA] dark:hover:bg-[#1F1E1C] text-xs font-medium text-[#4B4640] dark:text-[#C8C3BC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Chạy lại với tham số này</span>
          </button>
        </div>

        {/* Section Jump Navigation */}
        {parsed.sections.length > 1 && (
          <nav
            aria-label="Mục lục báo cáo"
            className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            {parsed.sections.map((sec) => {
              const shortLabelMap: Record<typeof sec.kind, string> = {
                summary: 'Tóm tắt',
                korea: 'Hàn Quốc',
                china: 'Trung Quốc',
                comparison: 'Giao thoa Hàn–Trung',
                recommendations: 'Khuyến nghị',
                brief: 'Brief mẫu',
                prompts: 'Prompt',
                other: sec.title.split(':')[0],
              };
              const shortLabel = shortLabelMap[sec.kind] || sec.title.split(':')[0];
              return (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-xs font-medium text-[#66605A] dark:text-[#A09B93] hover:text-[#171513] dark:hover:text-[#F3F1ED] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
                >
                  {sec.number !== null ? `${sec.number}. ${shortLabel}` : shortLabel}
                </a>
              );
            })}
            {parsed.mergedSources.length > 0 && (
              <a
                href="#report-sources"
                className="text-xs font-medium text-[#66605A] dark:text-[#A09B93] hover:text-[#171513] dark:hover:text-[#F3F1ED] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
              >
                Nguồn ({parsed.mergedSources.length})
              </a>
            )}
          </nav>
        )}
      </header>

      {/* Insufficient Data Banner (never hide!) */}
      {parsed.insufficientData.hasNotice && (
        <section
          role="status"
          aria-label="Cảnh báo thiếu dữ liệu"
          className="rounded-xl border border-[#FCD34D] dark:border-[#92400E] bg-[#FFFBEB] dark:bg-[#451A03]/45 p-5 space-y-2.5"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[#92400E] dark:text-[#FCD34D]">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Thông báo về mức độ đầy đủ dữ liệu</span>
          </div>
          <p className="text-sm text-[#78350F] dark:text-[#FDE68A] leading-relaxed">
            Hệ thống ghi nhận nội dung có cảnh báo chưa đủ dữ liệu cho một phần hoặc toàn bộ yêu cầu. Nguyên văn ghi nhận từ phân tích:
          </p>
          <ul className="space-y-1.5 text-sm text-[#78350F] dark:text-[#FDE68A]">
            {parsed.insufficientData.excerpts.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Preamble if present */}
      {parsed.preamble && (
        <div className="text-sm">
          <RichTextRenderer
            content={parsed.preamble}
            onHexCopied={(hex) => onNotify(`Đã sao chép mã màu ${hex}`)}
          />
        </div>
      )}

      {/* Master Report Color Palette Overview */}
      {parsed.allHexColors.length > 0 && (
        <section
          aria-label="Tổng hợp bảng màu HEX trong báo cáo"
          className="rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] p-5"
        >
          <PaletteStrip
            colors={parsed.allHexColors}
            label={`Tổng hợp ${parsed.allHexColors.length} mã màu HEX trong báo cáo — nhấn để sao chép`}
            onCopied={(hex) => onNotify(`Đã sao chép mã màu ${hex}`)}
          />
        </section>
      )}

      {/* Report Sections */}
      {parsed.sections.length > 0 ? (
        <div className="space-y-12">
          {parsed.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-20 space-y-5"
            >
              <div className="flex items-baseline gap-3 pb-3 border-b border-[#E6E2DC] dark:border-[#2B2A27]">
                {section.number !== null && (
                  <span className="font-mono text-sm tabular-nums text-[#66605A] dark:text-[#A09B93]">
                    {String(section.number).padStart(2, '0')}.
                  </span>
                )}
                <h2 className="text-2xl font-semibold text-[#171513] dark:text-[#F3F1ED] leading-snug">
                  {section.title}
                </h2>
              </div>

              {section.kind === 'korea' || section.kind === 'china' ? (
                <TrendSectionView
                  sectionId={section.id}
                  content={section.content}
                  onHexCopied={(hex) => onNotify(`Đã sao chép mã màu ${hex}`)}
                />
              ) : section.kind === 'prompts' ? (
                <PromptCardsView
                  content={section.content}
                  onPromptCopied={(title) => onNotify(`Đã copy ${title}`)}
                  onHexCopied={(hex) => onNotify(`Đã sao chép mã màu ${hex}`)}
                />
              ) : (
                <div className="rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] p-5 sm:p-6">
                  <RichTextRenderer
                    content={section.content}
                    onHexCopied={(hex) => onNotify(`Đã sao chép mã màu ${hex}`)}
                  />
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <section className="rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] p-6">
          <RichTextRenderer
            content={report.markdown}
            onHexCopied={(hex) => onNotify(`Đã sao chép mã màu ${hex}`)}
          />
        </section>
      )}

      {/* Grounded Sources & References Section */}
      <section
        id="report-sources"
        aria-labelledby="sources-heading"
        className="scroll-mt-20 pt-8 border-t border-[#E6E2DC] dark:border-[#2B2A27] space-y-5"
      >
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2
            id="sources-heading"
            className="text-xl font-semibold text-[#171513] dark:text-[#F3F1ED]"
          >
            Nguồn tham khảo & Dữ liệu Google Search
          </h2>
          <span className="text-xs font-mono tabular-nums text-[#66605A] dark:text-[#A09B93]">
            {parsed.mergedSources.length} liên kết
          </span>
        </div>

        {parsed.mergedSources.length > 0 ? (
          <ul className="divide-y divide-[#EFECE6] dark:divide-[#262522] rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] overflow-hidden">
            {parsed.mergedSources.map((src, idx) => (
              <li
                key={src.uri}
                className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-[#FAF9F7] dark:hover:bg-[#1F1E1C] transition-colors"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <span className="font-mono text-xs tabular-nums text-[#8E877F] pt-0.5 shrink-0 w-5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <a
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#1D4ED8] dark:text-[#60A5FA] hover:underline underline-offset-2 break-words inline-flex items-center gap-1"
                    >
                      <span>{src.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="text-xs text-[#66605A] dark:text-[#A09B93] flex items-center gap-2 flex-wrap">
                      <span className="font-mono">{src.domain}</span>
                      {src.fromGrounding && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Google Search Grounding</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#66605A] dark:text-[#A09B93]">
            Không có liên kết nguồn cụ thể nào được trả về trong báo cáo này.
          </p>
        )}

        {report.searchQueries.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#66605A] dark:text-[#A09B93]">
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Truy vấn Google Search đã sử dụng</span>
            </p>
            <p className="text-xs text-[#66605A] dark:text-[#9A948C] leading-relaxed">
              {report.searchQueries.join(' · ')}
            </p>
          </div>
        )}

        {report.referenceUrls.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <p className="text-xs font-medium text-[#66605A] dark:text-[#A09B93]">
              URL tham khảo người dùng cung cấp
            </p>
            <ul className="space-y-1 text-xs">
              {report.referenceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1D4ED8] dark:text-[#60A5FA] hover:underline break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </article>
  );
}
