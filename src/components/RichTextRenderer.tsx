import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  HEX_REGEX,
  normalizeCertainty,
} from '../utils/reportParser';
import { isSafePublicHttpUrl } from '../utils/urlValidation';
import { CertaintyBadge } from './CertaintyBadge';
import { InlineHexSwatch } from './HexSwatch';

interface RichTextRendererProps {
  content: string;
  onHexCopied?: (hex: string) => void;
  compact?: boolean;
}

/**
 * Safe inline token renderer:
 * Supports markdown links, bare safe URLs, [Cao]/[Trung bình]/[Thấp] certainty badges,
 * HEX codes with interactive swatches, **bold**, *italic*, and `inline code`.
 */
export function renderInlineTokens(
  text: string,
  onHexCopied?: (hex: string) => void,
  keyPrefix = 'tok'
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  const tokenRegex =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\[(Cao|Trung bình|Thấp)\])|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*\n]+)\*)|(https?:\/\/[^\s<>)\]"']+)|((?<![A-Za-z0-9_/-])#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})(?![0-9A-Fa-f]))/i;

  while (remaining.length > 0) {
    const match = remaining.match(tokenRegex);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const key = `${keyPrefix}-${idx++}`;

    if (match[1]) {
      // Markdown link [label](url)
      const label = match[2];
      const url = match[3].replace(/[.,;]+$/, '');
      if (isSafePublicHttpUrl(url)) {
        nodes.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[#1D4ED8] dark:text-[#60A5FA] underline decoration-[#1D4ED8]/35 dark:decoration-[#60A5FA]/40 underline-offset-2 hover:decoration-[#1D4ED8] dark:hover:decoration-[#93C5FD] transition-colors break-words"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 shrink-0 inline" aria-hidden="true" />
          </a>
        );
      } else {
        nodes.push(label);
      }
    } else if (match[4]) {
      // Certainty badge [Cao] / [Trung bình] / [Thấp]
      const level = normalizeCertainty(match[5]);
      if (level) {
        nodes.push(
          <span key={key} className="mx-0.5 inline-block">
            <CertaintyBadge level={level} />
          </span>
        );
      } else {
        nodes.push(match[4]);
      }
    } else if (match[6]) {
      // Bold **...**
      nodes.push(
        <strong key={key} className="font-semibold text-[#171513] dark:text-[#F3F1ED]">
          {renderInlineTokens(match[7], onHexCopied, `${key}-b`)}
        </strong>
      );
    } else if (match[8]) {
      // Inline code `...`
      const codeInner = match[9];
      if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(codeInner.trim())) {
        nodes.push(
          <InlineHexSwatch key={key} hex={codeInner.trim()} onCopied={onHexCopied} />
        );
      } else {
        nodes.push(
          <code
            key={key}
            className="px-1.5 py-0.5 rounded bg-[#F2EFEA] dark:bg-[#23221F] font-mono text-[13px] text-[#171513] dark:text-[#E7E4DE]"
          >
            {codeInner}
          </code>
        );
      }
    } else if (match[10]) {
      // Italic *...*
      nodes.push(
        <em key={key} className="italic">
          {renderInlineTokens(match[11], onHexCopied, `${key}-i`)}
        </em>
      );
    } else if (match[12]) {
      // Bare URL
      const url = match[12].replace(/[.,;]+$/, '');
      const trailing = match[12].slice(url.length);
      if (isSafePublicHttpUrl(url)) {
        nodes.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[#1D4ED8] dark:text-[#60A5FA] underline decoration-[#1D4ED8]/35 underline-offset-2 hover:decoration-[#1D4ED8] break-all"
          >
            <span>{url}</span>
            <ExternalLink className="w-3 h-3 shrink-0 inline" aria-hidden="true" />
          </a>
        );
        if (trailing) nodes.push(trailing);
      } else {
        nodes.push(match[12]);
      }
    } else if (match[13]) {
      // HEX color swatch
      const hex = match[13];
      if (HEX_REGEX.test(hex)) {
        HEX_REGEX.lastIndex = 0;
        nodes.push(<InlineHexSwatch key={key} hex={hex} onCopied={onHexCopied} />);
      } else {
        nodes.push(hex);
      }
    }

    remaining = remaining.slice(match.index + match[0].length);
  }

  return nodes;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line.trim());
}

export function RichTextRenderer({
  content,
  onHexCopied,
  compact = false,
}: RichTextRendererProps) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre
          key={`pre-${i}`}
          className="p-4 rounded-lg border border-[#E6E2DC] dark:border-[#2B2A27] bg-[#FAF9F7] dark:bg-[#141413] text-xs font-mono text-[#171513] dark:text-[#E7E4DE] overflow-x-auto leading-relaxed whitespace-pre-wrap"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Markdown table
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headerCells = splitTableRow(trimmed);
      i += 2; // skip header and separator
      const rows: string[][] = [];
      while (
        i < lines.length &&
        lines[i].trim().includes('|') &&
        lines[i].trim() !== ''
      ) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }

      blocks.push(
        <div
          key={`table-${i}`}
          className="overflow-x-auto rounded-lg border border-[#E6E2DC] dark:border-[#2B2A27] bg-white dark:bg-[#191917]"
        >
          <table className="w-full text-left border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-[#E6E2DC] dark:border-[#2B2A27] bg-[#FAF9F7] dark:bg-[#1E1E1B]">
                {headerCells.map((cell, cIdx) => (
                  <th
                    key={cIdx}
                    className="py-3 px-4 text-xs font-semibold text-[#4B4640] dark:text-[#C8C3BC] align-top"
                  >
                    {renderInlineTokens(cell, onHexCopied, `th-${i}-${cIdx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEAE4] dark:divide-[#262522]">
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-[#FAF9F7]/70 dark:hover:bg-[#20201D]/60 transition-colors"
                >
                  {headerCells.map((_, cIdx) => (
                    <td
                      key={cIdx}
                      className="py-3 px-4 text-[#2B2825] dark:text-[#DDD9D2] align-top leading-relaxed"
                    >
                      {renderInlineTokens(row[cIdx] ?? '', onHexCopied, `td-${i}-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push(
        <hr
          key={`hr-${i}`}
          className="border-t border-[#E6E2DC] dark:border-[#2B2A27] my-4"
        />
      );
      i++;
      continue;
    }

    // Subheadings ### / ####
    const headingMatch = trimmed.match(/^(#{3,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      blocks.push(
        level === 3 ? (
          <h3
            key={`h3-${i}`}
            className="text-base font-semibold text-[#171513] dark:text-[#F3F1ED] pt-2"
          >
            {renderInlineTokens(text, onHexCopied, `h3-${i}`)}
          </h3>
        ) : (
          <h4
            key={`h4-${i}`}
            className="text-sm font-semibold text-[#3C3834] dark:text-[#D7D3CC] pt-1"
          >
            {renderInlineTokens(text, onHexCopied, `h4-${i}`)}
          </h4>
        )
      );
      i++;
      continue;
    }

    // Blockquote (clean top/bottom hairline, no thick left accent border)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="py-3 px-4 rounded-lg border border-[#E6E2DC] dark:border-[#2B2A27] bg-[#FAF9F7] dark:bg-[#1E1D1B] text-sm text-[#4B4640] dark:text-[#CBC6BE] leading-relaxed"
        >
          {renderInlineTokens(quoteLines.join(' '), onHexCopied, `q-${i}`)}
        </blockquote>
      );
      continue;
    }

    // Ordered list
    if (/^\d+[\.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[\.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[\.)]\s+/, ''));
        i++;
      }
      blocks.push(
        <ol
          key={`ol-${i}`}
          className="space-y-2.5 text-[15px] leading-relaxed text-[#2B2825] dark:text-[#DDD9D2]"
        >
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="font-mono text-xs tabular-nums text-[#66605A] dark:text-[#9A948C] pt-1 shrink-0 w-5">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <span className="flex-1">
                {renderInlineTokens(item, onHexCopied, `ol-${i}-${idx}`)}
              </span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul
          key={`ul-${i}`}
          className={`space-y-2 ${compact ? 'text-sm' : 'text-[15px]'} leading-relaxed text-[#2B2825] dark:text-[#DDD9D2]`}
        >
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="text-[#8E877F] dark:text-[#78726B] select-none shrink-0"
              >
                —
              </span>
              <span className="flex-1">
                {renderInlineTokens(item, onHexCopied, `ul-${i}-${idx}`)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph (group contiguous plain lines)
    const paraLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{2,4}\s+|[-*•]\s+|\d+[\.)]\s+|```|>|\|)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    blocks.push(
      <p
        key={`p-${i}`}
        className={`${compact ? 'text-sm' : 'text-[15px]'} leading-relaxed text-[#2B2825] dark:text-[#DDD9D2]`}
      >
        {renderInlineTokens(paraLines.join(' '), onHexCopied, `p-${i}`)}
      </p>
    );
  }

  return <div className={compact ? 'space-y-2.5' : 'space-y-4'}>{blocks}</div>;
}
