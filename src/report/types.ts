// Podzbiór schematu mutation-testing-report-schema, z którego korzysta aplikacja.
// Pozostałe pola raportu (source, testFiles, performance, ...) są pomijane przy parsowaniu.

export const KNOWN_STATUSES = [
  'Killed',
  'Survived',
  'NoCoverage',
  'Timeout',
  'CompileError',
  'RuntimeError',
  'Ignored',
  'Pending',
] as const;

export type KnownMutantStatus = (typeof KNOWN_STATUSES)[number];

// Nieznany status z nowszej wersji Strykera nie jest błędem, więc dopuszczamy dowolny string.
export type MutantStatus = KnownMutantStatus | (string & {});

export interface Position {
  line: number;
  column: number;
}

export interface Location {
  start: Position;
  end?: Position;
}

export interface Mutant {
  id: string;
  mutatorName: string;
  status: MutantStatus;
  location: Location;
  replacement?: string;
}

export interface FileResult {
  mutants: Mutant[];
}

export interface Thresholds {
  high: number;
  low: number;
}

export interface MutationReport {
  thresholds?: Thresholds;
  files: Record<string, FileResult>;
}
