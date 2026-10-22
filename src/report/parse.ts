import type { FileResult, Mutant, MutationReport, Thresholds } from './types';

export type ParseError = 'invalid-json' | 'not-a-report';

export type ParseResult =
  | { ok: true; report: MutationReport }
  | { ok: false; error: ParseError; detail?: string };

class NotAReport extends Error {}

type Obj = Record<string, unknown>;

function isObject(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function fail(path: string, expected: string): never {
  throw new NotAReport(`${path}: oczekiwano ${expected}`);
}

function parseMutant(raw: unknown, path: string): Mutant {
  if (!isObject(raw)) fail(path, 'obiektu');

  const { id, mutatorName, status, location, replacement } = raw;
  if (typeof id !== 'string' && !isNumber(id)) fail(`${path}.id`, 'tekstu');
  if (typeof mutatorName !== 'string') fail(`${path}.mutatorName`, 'tekstu');
  if (typeof status !== 'string') fail(`${path}.status`, 'tekstu');
  if (!isObject(location) || !isObject(location.start)) fail(`${path}.location.start`, 'obiektu');

  const { line, column } = location.start;
  if (!isNumber(line)) fail(`${path}.location.start.line`, 'liczby');
  if (!isNumber(column)) fail(`${path}.location.start.column`, 'liczby');

  const mutant: Mutant = {
    id: String(id),
    mutatorName,
    status,
    location: { start: { line, column } },
  };
  if (typeof replacement === 'string') mutant.replacement = replacement;
  return mutant;
}

function parseFile(raw: unknown, path: string): FileResult {
  if (!isObject(raw)) fail(path, 'obiektu');
  if (!Array.isArray(raw.mutants)) fail(`${path}.mutants`, 'tablicy');
  // Pole `source` i inne pola pliku celowo pomijamy, bo bywają duże i nie są używane.
  return { mutants: raw.mutants.map((m, i) => parseMutant(m, `${path}.mutants[${i}]`)) };
}

function parseThresholds(raw: unknown): Thresholds | undefined {
  // Niepoprawne progi traktujemy jak brak progów, czyli wartości domyślne.
  if (isObject(raw) && isNumber(raw.high) && isNumber(raw.low)) {
    return { high: raw.high, low: raw.low };
  }
  return undefined;
}

export function parseReport(text: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: 'invalid-json', detail: e instanceof Error ? e.message : undefined };
  }

  try {
    if (!isObject(json)) fail('raport', 'obiektu');
    if (!isObject(json.files)) fail('files', 'obiektu');

    const files: Record<string, FileResult> = {};
    for (const [name, file] of Object.entries(json.files)) {
      files[name] = parseFile(file, `files["${name}"]`);
    }

    const report: MutationReport = { files };
    const thresholds = parseThresholds(json.thresholds);
    if (thresholds) report.thresholds = thresholds;
    return { ok: true, report };
  } catch (e) {
    if (e instanceof NotAReport) return { ok: false, error: 'not-a-report', detail: e.message };
    throw e;
  }
}
