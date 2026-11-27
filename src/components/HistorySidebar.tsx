import { FileText, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SavedReport } from '../types/report';

interface HistorySidebarProps {
  reports: SavedReport[];
  activeReportId: string | null;
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (id: string) => void;
  onNewReport: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function formatDateVi(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function HistorySidebar({
  reports,
  activeReportId,
  onSelectReport,
  onDeleteReport,
  onNewReport,
  mobileOpen,
  onCloseMobile,
}: HistorySidebarProps) {
  const [query, setQuery] = useState('');

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.monthYear.toLowerCase().includes(q) ||
        r.industryLabel.toLowerCase().includes(q)
    );
  }, [reports, query]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF9F7] dark:bg-[#141413]">
      <div className="p-4 border-b border-[#E6E2DC] dark:border-[#2B2A27] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans text-xs font-semibold text-[#66605A] dark:text-[#A09B93]">
            Lịch sử báo cáo ({reports.length})
          </h2>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Đóng bảng lịch sử"
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#66605A] dark:text-[#A09B93] hover:bg-[#EFECE6] dark:hover:bg-[#23221F] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onNewReport();
            onCloseMobile();
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[40px] rounded-lg border border-[#DCD7CF] dark:border-[#32312D] bg-white dark:bg-[#1D1C1A] hover:border-[#1D4ED8] dark:hover:border-[#60A5FA] text-xs font-semibold text-[#171513] dark:text-[#F3F1ED] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Tạo báo cáo mới</span>
        </button>

        {reports.length > 1 && (
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 text-[#8E877F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="history-search" className="sr-only">
              Tìm trong lịch sử báo cáo
            </label>
            <input
              id="history-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lọc theo tháng, ngành..."
              className="w-full pl-8 pr-3 py-1.5 min-h-[36px] rounded-lg border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] text-xs text-[#171513] dark:text-[#F3F1ED] placeholder:text-[#969088] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#60A5FA]"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filteredReports.length === 0 ? (
          <div className="px-3 py-8 text-center space-y-2">
            <FileText
              className="w-5 h-5 mx-auto text-[#969088]"
              aria-hidden="true"
            />
            <p className="text-xs text-[#66605A] dark:text-[#A09B93] leading-relaxed">
              {reports.length === 0
                ? 'Chưa có báo cáo nào được lưu. Tạo Trend Report đầu tiên ở khung bên phải.'
                : 'Không tìm thấy báo cáo phù hợp với từ khóa.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredReports.map((report) => {
              const isActive = report.id === activeReportId;
              return (
                <li key={report.id} className="group relative flex items-stretch gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectReport(report);
                      onCloseMobile();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1D4ED8] ${
                      isActive
                        ? 'bg-white dark:bg-[#1F1E1C] border-[#D4CFC7] dark:border-[#3A3935] text-[#171513] dark:text-[#F3F1ED]'
                        : 'bg-transparent border-transparent hover:bg-[#F2EFEA] dark:hover:bg-[#1C1B19] text-[#3C3834] dark:text-[#CFCBC4]'
                    }`}
                  >
                    <p className="text-xs font-semibold leading-snug line-clamp-2 pr-6">
                      {report.title}
                    </p>
                    <p className="mt-1 text-[11px] text-[#7A746C] dark:text-[#8E8981] font-mono tabular-nums flex items-center gap-1.5">
                      <span>{formatDateVi(report.createdAt)}</span>
                      {report.isSample && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans">Mẫu</span>
                        </>
                      )}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteReport(report.id)}
                    aria-label={`Xóa báo cáo ${report.title}`}
                    title="Xóa báo cáo này"
                    className="absolute right-1.5 top-2 inline-flex items-center justify-center w-7 h-7 rounded-md text-[#8E877F] hover:text-[#B91C1C] dark:hover:text-[#F87171] hover:bg-[#FEF2F2] dark:hover:bg-[#450A0A]/50 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Lịch sử báo cáo"
        className="hidden lg:block w-[288px] shrink-0 border-r border-[#E6E2DC] dark:border-[#2B2A27] h-[calc(100vh-56px)] sticky top-14"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Lịch sử báo cáo"
        >
          <button
            type="button"
            aria-label="Đóng nền lịch sử"
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px]"
          />
          <div className="relative z-10 w-[300px] max-w-[85vw] h-full border-r border-[#E6E2DC] dark:border-[#2B2A27] shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
