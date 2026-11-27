export type MarketOption = 'Korea' | 'China' | 'Both';

export type IndustryOption =
  | 'cosmetics'
  | 'F&B'
  | 'tech'
  | 'fashion'
  | 'game'
  | 'FMCG'
  | 'other';

export type CertaintyLevel = 'Cao' | 'Trung bình' | 'Thấp';

export interface ReportRequestInput {
  monthYear: string; // MM/YYYY
  market: MarketOption;
  industry: IndustryOption;
  customIndustry?: string;
  referenceUrls: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
  domain: string;
  fromGrounding?: boolean;
}

export interface SavedReport {
  id: string;
  title: string;
  monthYear: string;
  market: MarketOption;
  industry: IndustryOption;
  industryLabel: string;
  referenceUrls: string[];
  userPrompt: string;
  markdown: string;
  sources: GroundingSource[];
  searchQueries: string[];
  createdAt: string;
  isSample?: boolean;
}

export interface ParsedSection {
  id: string;
  number: number | null;
  title: string;
  rawHeading: string;
  content: string;
  kind:
    | 'summary'
    | 'korea'
    | 'china'
    | 'comparison'
    | 'recommendations'
    | 'brief'
    | 'prompts'
    | 'other';
}

export interface ParsedTrendField {
  label: string;
  value: string;
}

export interface ParsedTrend {
  id: string;
  index: number;
  title: string;
  hexColors: string[];
  certainty: CertaintyLevel | null;
  lifecycle: string | null;
  visualLanguage: string;
  industries: string;
  posterApplication: string;
  sourcesText: string;
  extraFields: ParsedTrendField[];
  rawBody: string;
}

export interface ParsedPromptItem {
  id: string;
  index: number;
  title: string;
  toolHint: string;
  promptText: string;
  notes: string;
}

export interface InsufficientDataNotice {
  hasNotice: boolean;
  excerpts: string[];
}

export interface ParsedReport {
  reportTitle: string;
  preamble: string;
  sections: ParsedSection[];
  insufficientData: InsufficientDataNotice;
  allHexColors: string[];
  mergedSources: GroundingSource[];
}
