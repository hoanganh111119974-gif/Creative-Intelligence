import { SAMPLE_REPORT } from '../data/sampleReport';
import type { SavedReport } from '../types/report';

const HISTORY_KEY = 'creative_intelligence_history_v1';
const SEEDED_KEY = 'creative_intelligence_seeded_v1';
const THEME_KEY = 'creative_intelligence_theme_v1';

export type ThemeMode = 'light' | 'dark';

export function loadReportHistory(): SavedReport[] {
  if (typeof window === 'undefined') return [SAMPLE_REPORT];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as SavedReport[];
      }
    }
    const alreadySeeded = window.localStorage.getItem(SEEDED_KEY) === '1';
    if (!alreadySeeded) {
      window.localStorage.setItem(SEEDED_KEY, '1');
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify([SAMPLE_REPORT]));
      return [SAMPLE_REPORT];
    }
    return [];
  } catch {
    return [SAMPLE_REPORT];
  }
}

export function saveReportHistory(reports: SavedReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SEEDED_KEY, '1');
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(reports.slice(0, 50)));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadThemePreference(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}
