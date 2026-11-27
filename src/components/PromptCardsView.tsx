import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { extractHexCodes, parsePromptsFromSection } from '../utils/reportParser';
import { PaletteStrip, copyTextToClipboard } from './HexSwatch';
import { RichTextRenderer } from './RichTextRenderer';

interface PromptCardsViewProps {
  content: string;
  onPromptCopied?: (title: string) => void;
  onHexCopied?: (hex: string) => void;
}

export function PromptCardsView({
  content,
  onPromptCopied,
  onHexCopied,
}: PromptCardsViewProps) {
  const prompts = useMemo(() => parsePromptsFromSection(content), [content]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (prompts.length === 0) {
    return <RichTextRenderer content={content} onHexCopied={onHexCopied} />;
  }

  const handleCopyPrompt = async (id: string, title: string, promptText: string) => {
    const ok = await copyTextToClipboard(promptText);
    if (ok) {
      setCopiedId(id);
      onPromptCopied?.(title);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      {prompts.map((item) => {
        const isCopied = copiedId === item.id;
        const hexCodes = extractHexCodes(item.promptText);

        return (
          <article
            key={item.id}
            className="rounded-xl border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917] p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 text-xs text-[#66605A] dark:text-[#A09B93]">
                  <span className="font-mono tabular-nums">
                    {String(item.index).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.toolHint}</span>
                </div>
                <h3 className="text-base font-semibold text-[#171513] dark:text-[#F3F1ED]">
                  {item.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleCopyPrompt(item.id, item.title, item.promptText)}
                aria-label={`Copy prompt ${item.index}: ${item.title}`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                  isCopied
                    ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D] dark:border-[#166534] dark:bg-[#052E16]/70 dark:text-[#86EFAC]'
                    : 'border-[#D8D3CB] dark:border-[#34332F] bg-[#FAF9F7] dark:bg-[#22211F] text-[#171513] dark:text-[#F3F1ED] hover:border-[#1D4ED8] hover:text-[#1D4ED8] dark:hover:border-[#60A5FA] dark:hover:text-[#93C5FD]'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Đã copy</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-lg border border-[#EFECE6] dark:border-[#262522] bg-[#FAF9F7] dark:bg-[#141413] font-mono text-[13px] leading-relaxed text-[#24211E] dark:text-[#E7E4DE] select-all">
              {item.promptText}
            </div>

            {hexCodes.length > 0 && (
              <PaletteStrip
                colors={hexCodes}
                onCopied={onHexCopied}
              />
            )}

            {item.notes && (
              <div className="text-xs text-[#66605A] dark:text-[#A09B93]">
                <RichTextRenderer
                  content={item.notes}
                  onHexCopied={onHexCopied}
                  compact
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
