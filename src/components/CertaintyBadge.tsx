import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import type { CertaintyLevel } from '../types/report';

interface CertaintyBadgeProps {
  level: CertaintyLevel;
}

const BADGE_CONFIG: Record<
  CertaintyLevel,
  {
    label: string;
    title: string;
    classes: string;
    Icon: typeof CheckCircle2;
  }
> = {
  Cao: {
    label: 'Chắc chắn: Cao',
    title: 'Độ chắc chắn Cao — xác thực từ nhiều nguồn độc lập',
    classes:
      'text-[#14532D] bg-[#F0FDF4] border-[#BBF7D0] dark:text-[#86EFAC] dark:bg-[#052E16]/70 dark:border-[#166534]',
    Icon: CheckCircle2,
  },
  'Trung bình': {
    label: 'Chắc chắn: Trung bình',
    title: 'Độ chắc chắn Trung bình — quan sát từ một số nguồn tham chiếu',
    classes:
      'text-[#92400E] bg-[#FFFBEB] border-[#FDE68A] dark:text-[#FCD34D] dark:bg-[#451A03]/60 dark:border-[#92400E]',
    Icon: AlertCircle,
  },
  Thấp: {
    label: 'Chắc chắn: Thấp',
    title: 'Độ chắc chắn Thấp — nhận định mang tính suy luận, cần theo dõi thêm',
    classes:
      'text-[#991B1B] bg-[#FEF2F2] border-[#FECACA] dark:text-[#FCA5A5] dark:bg-[#450A0A]/60 dark:border-[#991B1B]',
    Icon: HelpCircle,
  },
};

export function CertaintyBadge({ level }: CertaintyBadgeProps) {
  const config = BADGE_CONFIG[level];
  const Icon = config.Icon;

  return (
    <span
      title={config.title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap shrink-0 align-middle ${config.classes}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>[{level}]</span>
    </span>
  );
}
