import type {
  EntitiesResponse,
  LanguagesResponse,
  OperatorId,
  PatternTestResponse,
  PatternsResponse,
  ProcessResponse,
  RedactResponse,
  SummarizeResponse,
  SummaryLength,
  UnitsResponse,
} from '@/types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

// Strips a trailing slash so callers can safely append paths.
const api = BASE_URL.replace(/\/$/, '');

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Health ─────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${api}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// ── Entities & Languages ───────────────────────────────────────────────────

export async function fetchEntities(): Promise<EntitiesResponse> {
  const res = await fetch(`${api}/entities`);
  return parseJson<EntitiesResponse>(res);
}

export async function fetchLanguages(): Promise<LanguagesResponse> {
  const res = await fetch(`${api}/languages`);
  return parseJson<LanguagesResponse>(res);
}

// ── Processing ─────────────────────────────────────────────────────────────

export async function processFile(file: File, language: string): Promise<ProcessResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${api}/process?language=${encodeURIComponent(language)}`, {
    method: 'POST',
    body: form,
  });
  return parseJson<ProcessResponse>(res);
}

export async function redactText(
  text: string,
  language: string,
  entities: string[],
  operator: OperatorId,
): Promise<RedactResponse> {
  const res = await fetch(`${api}/redact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language, entities, operator }),
  });
  return parseJson<RedactResponse>(res);
}

export async function summarizeText(
  redactedText: string,
  length: SummaryLength,
): Promise<SummarizeResponse> {
  const res = await fetch(`${api}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redacted_text: redactedText, length }),
  });
  return parseJson<SummarizeResponse>(res);
}

// ── Patterns / Admin ───────────────────────────────────────────────────────

export async function fetchUnits(): Promise<UnitsResponse> {
  const res = await fetch(`${api}/patterns/units`);
  return parseJson<UnitsResponse>(res);
}

export async function fetchPatterns(): Promise<PatternsResponse> {
  const res = await fetch(`${api}/patterns`);
  return parseJson<PatternsResponse>(res);
}

export interface CreatePatternPayload {
  entity_type: string;
  label: string;
  description: string;
  unit: string;
  patterns: string[];
  context: string[];
  score: number;
}

export async function createPattern(payload: CreatePatternPayload): Promise<void> {
  const res = await fetch(`${api}/patterns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await parseJson<unknown>(res);
}

export async function deletePattern(patternId: string): Promise<void> {
  const res = await fetch(`${api}/patterns/${patternId}`, { method: 'DELETE' });
  await parseJson<unknown>(res);
}

export async function testPattern(patterns: string[], sampleText: string): Promise<PatternTestResponse> {
  const res = await fetch(`${api}/patterns/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patterns, sample_text: sampleText }),
  });
  return parseJson<PatternTestResponse>(res);
}
