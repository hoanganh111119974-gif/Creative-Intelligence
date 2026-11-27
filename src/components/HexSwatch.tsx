import { Check } from 'lucide-react';
import { useState } from 'react';
import { normalizeHex } from '../utils/reportParser';

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

interface InlineHexSwatchProps {
  hex: string;
  onCopied?: (hex: string) => void;
}

export function InlineHexSwatch({ hex, onCopied }: InlineHexSwatchProps) {
  const [copied, setCopied] = useState(false);
  const normalized = normalizeHex(hex);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(normalized);
    if (ok) {
      setCopied(true);
      onCopied?.(normalized);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Nhấn để sao chép mã màu ${normalized}`}
      aria-label={`Sao chép mã màu ${normalized}`}
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 mx-0.5 rounded border border-[#E6E2DC] dark:border-[#2E2D2A] bg-[#FAF9F7] dark:bg-[#22211F] hover:border-[#1D4ED8] dark:hover:border-[#60A5FA] text-[13px] font-mono tabular-nums text-[#171513] dark:text-[#F3F1ED] transition-colors align-baseline cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
    >
      <span
        aria-hidden="true"
        className="inline-block w-3 h-3 rounded-[2px] border border-black/15 dark:border-white/20 shrink-0"
        style={{ backgroundColor: normalized }}
      />
      <span>{copied ? 'Đã copy' : normalized}</span>
      {copied && <Check className="w-3 h-3 text-[#15803D] dark:text-[#4ADE80]" aria-hidden="true" />}
    </button>
  );
}

interface PaletteStripProps {
  colors: string[];
  label?: string;
  onCopied?: (hex: string) => void;
}

export function PaletteStrip({ colors, label, onCopied }: PaletteStripProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (colors.length === 0) return null;

  const handleCopy = async (hex: string) => {
    const normalized = normalizeHex(hex);
    const ok = await copyTextToClipboard(normalized);
    if (ok) {
      setCopiedHex(normalized);
      onCopied?.(normalized);
      window.setTimeout(() => {
        setCopiedHex((curr) => (curr === normalized ? null : curr));
      }, 1600);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-[#66605A] dark:text-[#A09B93]">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((hex) => {
          const normalized = normalizeHex(hex);
          const isCopied = copiedHex === normalized;
          return (
            <button
              key={normalized}
              type="button"
              onClick={() => handleCopy(normalized)}
              aria-label={`Sao chép mã màu ${normalized}`}
              title={`Sao chép ${normalized}`}
              className="group flex items-center gap-2 pr-2.5 pl-1.5 py-1.5 min-h-[36px] rounded-md border border-[#E6E2DC] dark:border-[#2E2D2A] bg-white dark:bg-[#1E1D1B] hover:border-[#1D4ED8] dark:hover:border-[#60A5FA] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
            >
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded-[3px] border border-black/15 dark:border-white/20 shrink-0"
                style={{ backgroundColor: normalized }}
              />
              <span className="text-xs font-mono tabular-nums text-[#171513] dark:text-[#F3F1ED]">
                {isCopied ? 'Đã copy' : normalized}
              </span>
              {isCopied && (
                <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
