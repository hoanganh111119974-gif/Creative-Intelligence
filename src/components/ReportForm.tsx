import { AlertTriangle, Link2, Loader2, Search } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import {
  INDUSTRY_OPTIONS,
  MARKET_OPTIONS,
} from '../constants/systemInstruction';
import type {
  IndustryOption,
  MarketOption,
  ReportRequestInput,
} from '../types/report';
import { parseReferenceUrlsInput } from '../utils/urlValidation';

interface ReportFormProps {
  onSubmit: (input: ReportRequestInput) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  initialValues?: Partial<ReportRequestInput>;
}

const MONTHS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
];

function getDefaultMonthYear(): { month: string; year: string } {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  return { month, year };
}

export function ReportForm({
  onSubmit,
  isLoading,
  errorMessage,
  initialValues,
}: ReportFormProps) {
  const defaults = useMemo(() => getDefaultMonthYear(), []);
  const initialParts = initialValues?.monthYear?.split('/');

  const [month, setMonth] = useState<string>(initialParts?.[0] || defaults.month);
  const [year, setYear] = useState<string>(initialParts?.[1] || defaults.year);
  const [market, setMarket] = useState<MarketOption>(initialValues?.market || 'Both');
  const [industry, setIndustry] = useState<IndustryOption>(
    initialValues?.industry || 'cosmetics'
  );
  const [customIndustry, setCustomIndustry] = useState<string>(
    initialValues?.customIndustry || ''
  );
  const [urlsText, setUrlsText] = useState<string>(
    initialValues?.referenceUrls?.join('\n') || ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const years = useMemo(() => {
    const currentYear = Number(defaults.year);
    return [
      String(currentYear - 2),
      String(currentYear - 1),
      String(currentYear),
      String(currentYear + 1),
    ];
  }, [defaults.year]);

  const parsedUrls = useMemo(() => parseReferenceUrlsInput(urlsText), [urlsText]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (industry === 'other' && !customIndustry.trim()) {
      setValidationError('Vui lòng nhập tên ngành hàng khi chọn "Ngành khác".');
      return;
    }

    if (parsedUrls.invalidLines.length > 0) {
      setValidationError(
        `URL tham khảo không hợp lệ: "${parsedUrls.invalidLines[0]}". Vui lòng nhập liên kết công khai bắt đầu bằng http:// hoặc https://.`
      );
      return;
    }

    const monthYear = `${month}/${year}`;
    await onSubmit({
      monthYear,
      market,
      industry,
      customIndustry: industry === 'other' ? customIndustry.trim() : undefined,
      referenceUrls: parsedUrls.validUrls,
    });
  };

  return (
    <section
      aria-labelledby="form-heading"
      className="max-w-3xl mx-auto w-full space-y-8"
    >
      <header className="space-y-2.5 pb-6 border-b border-[#E6E2DC] dark:border-[#2B2A27]">
        <p className="text-xs font-medium tracking-wide text-[#66605A] dark:text-[#A09B93]">
          Bản tin xu hướng thiết kế · Hàn Quốc & Trung Quốc
        </p>
        <h1
          id="form-heading"
          className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171513] dark:text-[#F3F1ED] leading-tight"
        >
          Tạo Trend Report hằng tháng cho team thiết kế
        </h1>
        <p className="text-sm sm:text-[15px] text-[#57524C] dark:text-[#B3AEA6] leading-relaxed max-w-2xl">
          Tổng hợp xu hướng thị giác poster quảng cáo trong 30–60 ngày gần nhất với Google Search grounding, kèm mã màu HEX, độ chắc chắn, nguồn kiểm chứng và prompt moodboard.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] p-6 sm:p-8 space-y-6"
      >
        {/* Row 1: Month/Year & Market */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-[#4B4640] dark:text-[#C8C3BC]">
              Tháng / Năm báo cáo
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="report-month" className="sr-only">
                  Tháng
                </label>
                <select
                  id="report-month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={isLoading}
                  className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-[#FAF9F7] dark:bg-[#141413] text-sm font-mono tabular-nums text-[#171513] dark:text-[#F3F1ED] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#60A5FA] transition-colors"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="report-year" className="sr-only">
                  Năm
                </label>
                <select
                  id="report-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={isLoading}
                  className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-[#FAF9F7] dark:bg-[#141413] text-sm font-mono tabular-nums text-[#171513] dark:text-[#F3F1ED] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#60A5FA] transition-colors"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-[#4B4640] dark:text-[#C8C3BC]">
              Thị trường phân tích
            </legend>
            <div
              role="group"
              aria-label="Chọn thị trường"
              className="grid grid-cols-3 gap-1 p-1 rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-[#FAF9F7] dark:bg-[#141413]"
            >
              {MARKET_OPTIONS.map((opt) => {
                const active = market === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setMarket(opt.value)}
                    aria-pressed={active}
                    className={`min-h-[34px] px-2 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D4ED8] ${
                      active
                        ? 'bg-white dark:bg-[#272623] text-[#171513] dark:text-[#F3F1ED] shadow-xs border border-[#E6E2DC] dark:border-[#3A3935]'
                        : 'text-[#66605A] dark:text-[#A09B93] hover:text-[#171513] dark:hover:text-[#F3F1ED]'
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Row 2: Industry */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="report-industry"
              className="block text-xs font-semibold text-[#4B4640] dark:text-[#C8C3BC]"
            >
              Ngành hàng mục tiêu
            </label>
            <select
              id="report-industry"
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value as IndustryOption);
                setValidationError(null);
              }}
              disabled={isLoading}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-[#FAF9F7] dark:bg-[#141413] text-sm text-[#171513] dark:text-[#F3F1ED] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#60A5FA] transition-colors"
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {industry === 'other' && (
            <div className="space-y-1.5">
              <label
                htmlFor="custom-industry"
                className="block text-xs font-medium text-[#66605A] dark:text-[#A09B93]"
              >
                Tên ngành hàng cụ thể
              </label>
              <input
                id="custom-industry"
                type="text"
                value={customIndustry}
                onChange={(e) => {
                  setCustomIndustry(e.target.value);
                  setValidationError(null);
                }}
                disabled={isLoading}
                maxLength={80}
                placeholder="Ví dụ: Bất động sản, Giáo dục, Nội thất, Du lịch..."
                className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-[#FAF9F7] dark:bg-[#141413] text-sm text-[#171513] dark:text-[#F3F1ED] placeholder:text-[#969088] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#60A5FA]"
              />
            </div>
          )}
        </div>

        {/* Row 3: Optional Reference URLs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="reference-urls"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B4640] dark:text-[#C8C3BC]"
            >
              <Link2 className="w-3.5 h-3.5 text-[#66605A] dark:text-[#A09B93]" aria-hidden="true" />
              <span>URL tham khảo (tùy chọn)</span>
            </label>
            {parsedUrls.validUrls.length > 0 && (
              <span className="text-xs font-mono tabular-nums text-[#66605A] dark:text-[#A09B93]">
                {parsedUrls.validUrls.length} URL hợp lệ
              </span>
            )}
          </div>
          <textarea
            id="reference-urls"
            rows={3}
            value={urlsText}
            onChange={(e) => {
              setUrlsText(e.target.value);
              setValidationError(null);
            }}
            disabled={isLoading}
            placeholder={'Dán các liên kết tham khảo (mỗi dòng 1 URL), ví dụ:\nhttps://www.behance.net/gallery/...\nhttps://www.pinterest.com/...'}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-[#FAF9F7] dark:bg-[#141413] text-sm font-mono text-[#171513] dark:text-[#F3F1ED] placeholder:font-sans placeholder:text-[#969088] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#60A5FA] resize-y"
          />
          <p className="text-xs text-[#66605A] dark:text-[#9A948C]">
            Hệ thống sẽ đọc nội dung các liên kết hợp lệ làm ngữ cảnh bổ sung bên cạnh kết quả Google Search trong 30–60 ngày gần nhất.
          </p>
        </div>

        {/* Inline Validation or Server Error */}
        {(validationError || errorMessage) && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-lg border border-[#FECACA] dark:border-[#7F1D1D] bg-[#FEF2F2] dark:bg-[#450A0A]/40 text-sm text-[#991B1B] dark:text-[#FCA5A5]"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">{validationError || errorMessage}</p>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#EFECE6] dark:border-[#262522]">
          <p className="text-xs text-[#66605A] dark:text-[#A09B93]">
            Truy vấn mẫu: Tháng{' '}
            <span className="font-mono tabular-nums text-[#171513] dark:text-[#E7E4DE]">
              {month}/{year}
            </span>
            {' · '}
            {MARKET_OPTIONS.find((m) => m.value === market)?.label}
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Đang tìm kiếm & phân tích...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>Tạo Trend Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
