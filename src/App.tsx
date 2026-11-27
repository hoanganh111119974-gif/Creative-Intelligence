import {
  Check,
  Download,
  History,
  Moon,
  Plus,
  Sun,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HistorySidebar } from './components/HistorySidebar';
import { ReportForm } from './components/ReportForm';
import { ReportViewer } from './components/ReportViewer';
import type { ReportRequestInput, SavedReport } from './types/report';
import { buildMarkdownExport } from './utils/reportParser';
import {
  type ThemeMode,
  loadReportHistory,
  loadThemePreference,
  saveReportHistory,
  saveThemePreference,
} from './utils/storage';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadThemePreference());
  const [reports, setReports] = useState<SavedReport[]>(() => loadReportHistory());
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [formPrefill, setFormPrefill] = useState<Partial<ReportRequestInput> | undefined>(
    undefined
  );
  const [formKey, setFormKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const activeReport =
    activeReportId !== null
      ? reports.find((r) => r.id === activeReportId) ?? null
      : null;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    saveReportHistory(reports);
  }, [reports]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleCreateNew = () => {
    setActiveReportId(null);
    setFormPrefill(undefined);
    setErrorMessage(null);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReport = (report: SavedReport) => {
    setActiveReportId(report.id);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (activeReportId === id) {
      setActiveReportId(null);
    }
    showToast('Đã xóa báo cáo khỏi lịch sử');
  };

  const handleEditParameters = (report: SavedReport) => {
    setFormPrefill({
      monthYear: report.monthYear,
      market: report.market,
      industry: report.industry,
      customIndustry:
        report.industry === 'other' ? report.industryLabel : undefined,
      referenceUrls: report.referenceUrls,
    });
    setActiveReportId(null);
    setErrorMessage(null);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportMarkdown = useCallback(
    (report: SavedReport) => {
      const { filename, content } = buildMarkdownExport(report);
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Đã tải xuống ${filename}`);
    },
    [showToast]
  );

  const handleGenerateReport = async (input: ReportRequestInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' && payload.error
            ? payload.error
            : `Lỗi máy chủ (${response.status}). Vui lòng thử lại.`
        );
      }

      const newReport: SavedReport = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `report-${Date.now()}`,
        title: payload.title,
        monthYear: payload.monthYear,
        market: payload.market,
        industry: payload.industry,
        industryLabel: payload.industryLabel,
        referenceUrls: Array.isArray(payload.referenceUrls)
          ? payload.referenceUrls
          : [],
        userPrompt: payload.userPrompt,
        markdown: payload.markdown,
        sources: Array.isArray(payload.sources) ? payload.sources : [],
        searchQueries: Array.isArray(payload.searchQueries)
          ? payload.searchQueries
          : [],
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      setReports((prev) => [newReport, ...prev]);
      setActiveReportId(newReport.id);
      showToast('Đã tạo và lưu Trend Report vào lịch sử');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Không thể kết nối máy chủ để tạo báo cáo.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F7] dark:bg-[#111110] text-[#171513] dark:text-[#F3F1ED] transition-colors">
      {/* Top Navigation Bar — strict 3-zone contract */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#E6E2DC] dark:border-[#2B2A27] bg-[#FAF9F7]/95 dark:bg-[#111110]/95 backdrop-blur-xs">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-8">
          {/* Zone 1: Single-line Wordmark */}
          <button
            type="button"
            onClick={handleCreateNew}
            className="font-editorial text-base sm:text-lg font-semibold tracking-tight text-[#171513] dark:text-[#F3F1ED] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded"
          >
            Creative_Intelligence
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Điều hướng chính"
            className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-[#57524C] dark:text-[#B3AEA6] shrink-0"
          >
            <button
              type="button"
              onClick={handleCreateNew}
              className={`hidden sm:inline hover:text-[#171513] dark:hover:text-[#F3F1ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeReport === null
                  ? 'text-[#171513] dark:text-[#F3F1ED] underline underline-offset-4 decoration-[#1D4ED8] dark:decoration-[#60A5FA]'
                  : ''
              }`}
            >
              Tạo báo cáo
            </button>

            <button
              type="button"
              onClick={() => setMobileHistoryOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 min-h-[36px] px-2 rounded-md hover:text-[#171513] dark:hover:text-[#F3F1ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Lịch sử ({reports.length})</span>
            </button>

            {reports.length > 0 && activeReport === null && (
              <button
                type="button"
                onClick={() => handleSelectReport(reports[0])}
                className="hidden md:inline hover:text-[#171513] dark:hover:text-[#F3F1ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Báo cáo gần nhất
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={
                theme === 'light'
                  ? 'Chuyển sang giao diện tối'
                  : 'Chuyển sang giao diện sáng'
              }
              className="inline-flex items-center justify-center gap-1.5 min-w-[36px] min-h-[36px] rounded-md hover:text-[#171513] dark:hover:text-[#F3F1ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Giao diện tối</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Giao diện sáng</span>
                </>
              )}
            </button>
          </nav>

          {/* Zone 3: Single Primary Action (desktop/tablet; mobile uses inline action in report/drawer) */}
          <div className="hidden sm:block shrink-0">
            {activeReport ? (
              <button
                type="button"
                onClick={() => handleExportMarkdown(activeReport)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-lg bg-[#171513] dark:bg-[#F3F1ED] text-white dark:text-[#171513] hover:opacity-90 text-xs font-medium transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Xuất Markdown</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (reports.length > 0) {
                    handleSelectReport(reports[0]);
                  } else {
                    handleCreateNew();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-white dark:bg-[#191917] hover:border-[#1D4ED8] dark:hover:border-[#60A5FA] text-xs font-medium text-[#171513] dark:text-[#F3F1ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{reports.length > 0 ? 'Xem mẫu' : 'Báo cáo mới'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex min-w-0">
        <HistorySidebar
          reports={reports}
          activeReportId={activeReportId}
          onSelectReport={handleSelectReport}
          onDeleteReport={handleDeleteReport}
          onNewReport={handleCreateNew}
          mobileOpen={mobileHistoryOpen}
          onCloseMobile={() => setMobileHistoryOpen(false)}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
          {isLoading ? (
            <section
              aria-live="polite"
              aria-label="Đang tạo báo cáo xu hướng"
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] p-6 sm:p-8 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#1D4ED8] dark:text-[#60A5FA]">
                    Đang truy vấn Google Search Grounding
                  </p>
                  <h2 className="text-2xl font-semibold text-[#171513] dark:text-[#F3F1ED]">
                    Đang tổng hợp xu hướng thiết kế Hàn Quốc & Trung Quốc...
                  </h2>
                  <p className="text-sm text-[#66605A] dark:text-[#A09B93] leading-relaxed">
                    Quá trình tìm kiếm nguồn trong 30–60 ngày gần nhất, đối chiếu mức độ chắc chắn và xây dựng brief poster thường mất khoảng 15–35 giây.
                  </p>
                </div>

                <div className="space-y-3 pt-2" aria-hidden="true">
                  <div className="h-4 w-3/4 rounded bg-[#EFECE6] dark:bg-[#262522] animate-pulse" />
                  <div className="h-4 w-full rounded bg-[#EFECE6] dark:bg-[#262522] animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-[#EFECE6] dark:bg-[#262522] animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                    <div className="h-28 rounded-lg bg-[#F5F2EC] dark:bg-[#201F1D] animate-pulse" />
                    <div className="h-28 rounded-lg bg-[#F5F2EC] dark:bg-[#201F1D] animate-pulse" />
                  </div>
                </div>
              </div>
            </section>
          ) : activeReport ? (
            <ReportViewer
              report={activeReport}
              onExportMarkdown={handleExportMarkdown}
              onEditParameters={handleEditParameters}
              onNotify={showToast}
            />
          ) : (
            <ReportForm
              key={formKey}
              onSubmit={handleGenerateReport}
              isLoading={isLoading}
              errorMessage={errorMessage}
              initialValues={formPrefill}
            />
          )}
        </main>
      </div>

      {/* Live Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DCD7CF] dark:border-[#34332F] bg-[#171513] dark:bg-[#F3F1ED] text-white dark:text-[#171513] text-xs font-medium shadow-lg"
        >
          <Check className="w-3.5 h-3.5 text-[#4ADE80] dark:text-[#15803D]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
