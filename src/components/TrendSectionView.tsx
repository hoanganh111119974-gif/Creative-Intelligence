import { LayoutGrid, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { parseTrendsFromSection } from '../utils/reportParser';
import { CertaintyBadge } from './CertaintyBadge';
import { PaletteStrip } from './HexSwatch';
import { RichTextRenderer, renderInlineTokens } from './RichTextRenderer';

interface TrendSectionViewProps {
  sectionId: string;
  content: string;
  onHexCopied?: (hex: string) => void;
}

export function TrendSectionView({
  sectionId,
  content,
  onHexCopied,
}: TrendSectionViewProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const trends = useMemo(() => parseTrendsFromSection(content), [content]);

  if (trends.length === 0) {
    return <RichTextRenderer content={content} onHexCopied={onHexCopied} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-[#66605A] dark:text-[#A09B93] tabular-nums">
          {trends.length} xu hướng nổi bật
        </p>

        <div
          role="group"
          aria-label={`Chế độ hiển thị mục ${sectionId}`}
          className="inline-flex items-center p-1 rounded-lg border border-[#E6E2DC] dark:border-[#2B2A27] bg-[#FAF9F7] dark:bg-[#141413]"
        >
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            aria-pressed={viewMode === 'cards'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-[#242320] text-[#171513] dark:text-[#F3F1ED] shadow-xs'
                : 'text-[#66605A] dark:text-[#A09B93] hover:text-[#171513] dark:hover:text-[#F3F1ED]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Thẻ chi tiết</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-pressed={viewMode === 'table'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#242320] text-[#171513] dark:text-[#F3F1ED] shadow-xs'
                : 'text-[#66605A] dark:text-[#A09B93] hover:text-[#171513] dark:hover:text-[#F3F1ED]'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bảng so sánh</span>
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="space-y-5">
          {trends.map((trend) => (
            <article
              key={trend.id}
              className="rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#EFECE6] dark:border-[#262522]">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#66605A] dark:text-[#A09B93] font-mono tabular-nums">
                    <span>{String(trend.index).padStart(2, '0')}</span>
                    {trend.lifecycle && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-sans">Vòng đời: {trend.lifecycle}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#171513] dark:text-[#F3F1ED] leading-snug">
                    {trend.title}
                  </h3>
                </div>

                {trend.certainty && (
                  <div className="shrink-0">
                    <CertaintyBadge level={trend.certainty} />
                  </div>
                )}
              </div>

              {trend.hexColors.length > 0 && (
                <PaletteStrip
                  colors={trend.hexColors}
                  label="Bảng màu gợi ý (nhấn vào ô màu để sao chép HEX)"
                  onCopied={onHexCopied}
                />
              )}

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {trend.visualLanguage && (
                  <div className="md:col-span-2 space-y-1">
                    <dt className="text-xs font-semibold text-[#66605A] dark:text-[#A09B93]">
                      Ngôn ngữ thị giác
                    </dt>
                    <dd className="text-[#2B2825] dark:text-[#DDD9D2] leading-relaxed">
                      <RichTextRenderer
                        content={trend.visualLanguage}
                        onHexCopied={onHexCopied}
                        compact
                      />
                    </dd>
                  </div>
                )}

                {trend.posterApplication && (
                  <div className="space-y-1">
                    <dt className="text-xs font-semibold text-[#66605A] dark:text-[#A09B93]">
                      Ứng dụng cho poster quảng cáo
                    </dt>
                    <dd className="text-[#2B2825] dark:text-[#DDD9D2] leading-relaxed">
                      {renderInlineTokens(trend.posterApplication, onHexCopied, `${trend.id}-poster`)}
                    </dd>
                  </div>
                )}

                {trend.industries && (
                  <div className="space-y-1">
                    <dt className="text-xs font-semibold text-[#66605A] dark:text-[#A09B93]">
                      Ngành áp dụng tốt
                    </dt>
                    <dd className="text-[#2B2825] dark:text-[#DDD9D2] leading-relaxed">
                      {renderInlineTokens(trend.industries, onHexCopied, `${trend.id}-ind`)}
                    </dd>
                  </div>
                )}

                {trend.extraFields.map((field, fIdx) => (
                  <div key={fIdx} className="space-y-1">
                    <dt className="text-xs font-semibold text-[#66605A] dark:text-[#A09B93]">
                      {field.label}
                    </dt>
                    <dd className="text-[#2B2825] dark:text-[#DDD9D2] leading-relaxed">
                      {renderInlineTokens(field.value, onHexCopied, `${trend.id}-ex-${fIdx}`)}
                    </dd>
                  </div>
                ))}

                {trend.sourcesText && (
                  <div className="md:col-span-2 pt-3 border-t border-[#EFECE6] dark:border-[#262522] space-y-1">
                    <dt className="text-xs font-semibold text-[#66605A] dark:text-[#A09B93]">
                      Độ chắc chắn & Nguồn tham chiếu
                    </dt>
                    <dd className="text-[#2B2825] dark:text-[#DDD9D2] leading-relaxed">
                      {renderInlineTokens(trend.sourcesText, onHexCopied, `${trend.id}-src`)}
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917]">
          <table className="w-full text-left border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-[#E6E2DC] dark:border-[#2B2A27] bg-[#FAF9F7] dark:bg-[#1E1E1B] text-xs font-semibold text-[#4B4640] dark:text-[#C8C3BC]">
                <th className="py-3 px-4 w-48">Xu hướng</th>
                <th className="py-3 px-4 w-44">Bảng màu HEX</th>
                <th className="py-3 px-4">Ứng dụng Poster & Ngôn ngữ</th>
                <th className="py-3 px-4 w-36">Độ chắc chắn</th>
                <th className="py-3 px-4 w-28">Vòng đời</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEAE4] dark:divide-[#262522]">
              {trends.map((trend) => (
                <tr
                  key={trend.id}
                  className="hover:bg-[#FAF9F7]/70 dark:hover:bg-[#20201D]/60 transition-colors align-top"
                >
                  <td className="py-3.5 px-4 font-medium text-[#171513] dark:text-[#F3F1ED]">
                    <div className="font-mono text-xs text-[#66605A] dark:text-[#A09B93] mb-0.5">
                      {String(trend.index).padStart(2, '0')}
                    </div>
                    <div>{trend.title}</div>
                    {trend.industries && (
                      <div className="text-xs font-normal text-[#66605A] dark:text-[#A09B93] mt-1">
                        {trend.industries}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {trend.hexColors.length > 0 ? (
                      <PaletteStrip colors={trend.hexColors} onCopied={onHexCopied} />
                    ) : (
                      <span className="text-xs text-[#8E877F]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#2B2825] dark:text-[#DDD9D2] leading-relaxed space-y-2">
                    {trend.posterApplication && (
                      <p>
                        {renderInlineTokens(trend.posterApplication, onHexCopied, `tbl-p-${trend.id}`)}
                      </p>
                    )}
                    {trend.visualLanguage && (
                      <p className="text-xs text-[#66605A] dark:text-[#A09B93]">
                        {renderInlineTokens(trend.visualLanguage.slice(0, 220), onHexCopied, `tbl-v-${trend.id}`)}
                        {trend.visualLanguage.length > 220 ? '…' : ''}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {trend.certainty ? (
                      <CertaintyBadge level={trend.certainty} />
                    ) : (
                      <span className="text-xs text-[#8E877F]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#4B4640] dark:text-[#C8C3BC] whitespace-nowrap">
                    {trend.lifecycle || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
