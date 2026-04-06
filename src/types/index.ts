// ── Domain models ──────────────────────────────────────────────────────────

export interface Entity {
  id: string;
  label: string;
}

export interface Language {
  code: string;
  label: string;
  installed: boolean;
}

export type OperatorId = 'replace' | 'redact' | 'mask' | 'hash';

export interface Operator {
  id: OperatorId;
  label: string;
}

export interface EntitySpan {
  type: string;
  start: number;
  end: number;
  score: number;
}

// ── API response types ─────────────────────────────────────────────────────

export interface ProcessResponse {
  original_text: string;
  redacted_text: string;
  entities_found: EntitySpan[];
  entity_counts: Record<string, number>;
  detected_language: string;
}

export interface RedactResponse {
  redacted_text: string;
  entities_found: EntitySpan[];
  entity_counts: Record<string, number>;
}

export interface SummarizeResponse {
  summary: string;
}

export interface EntitiesResponse {
  entities: Entity[];
}

export interface LanguagesResponse {
  languages: Language[];
}

// ── Admin / patterns ───────────────────────────────────────────────────────

export interface BusinessUnit {
  id: string;
  label: string;
}

export interface Pattern {
  id: string;
  entity_type: string;
  label: string;
  description?: string;
  unit: string;
  patterns: string[];
  context: string[];
  score: number;
  builtin: boolean;
}

export interface UnitsResponse {
  units: BusinessUnit[];
}

export interface PatternsResponse {
  patterns: Pattern[];
}

export interface PatternTestMatch {
  match: string;
  start: number;
  end: number;
}

export interface PatternTestResponse {
  match_count: number;
  matches: PatternTestMatch[];
}

export type SummaryLength = 'short' | 'medium' | 'detailed';
