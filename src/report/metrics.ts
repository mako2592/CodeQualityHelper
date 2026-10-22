import type { Mutant, MutantStatus, MutationReport, Thresholds } from './types';

export const DEFAULT_THRESHOLDS: Thresholds = { high: 80, low: 60 };

const DETECTED: ReadonlySet<MutantStatus> = new Set(['Killed', 'Timeout']);
const UNDETECTED: ReadonlySet<MutantStatus> = new Set(['Survived', 'NoCoverage']);

export interface Counts {
  /** Killed + Timeout */
  detected: number;
  /** Survived + NoCoverage */
  undetected: number;
  /** detected + undetected */
  valid: number;
  total: number;
  byStatus: Record<string, number>;
}

export interface FileMetrics {
  path: string;
  counts: Counts;
  /** Procent 0–100, `null` gdy brak ważnych mutantów. */
  mutationScore: number | null;
  /** Mutanty Survived i NoCoverage posortowane po linii, a potem kolumnie. */
  survivors: Mutant[];
}

export interface ReportMetrics {
  totals: Counts;
  mutationScore: number | null;
  coveredScore: number | null;
  thresholds: Thresholds;
  /** Rosnąco po mutationScore, `null` na końcu, remis po ścieżce. */
  files: FileMetrics[];
}

function emptyCounts(): Counts {
  return { detected: 0, undetected: 0, valid: 0, total: 0, byStatus: {} };
}

function addMutant(counts: Counts, status: MutantStatus): void {
  counts.total++;
  counts.byStatus[status] = (counts.byStatus[status] ?? 0) + 1;
  if (DETECTED.has(status)) {
    counts.detected++;
    counts.valid++;
  } else if (UNDETECTED.has(status)) {
    counts.undetected++;
    counts.valid++;
  }
}

function percent(part: number, whole: number): number | null {
  return whole === 0 ? null : (part / whole) * 100;
}

export function mutationScore(counts: Counts): number | null {
  return percent(counts.detected, counts.valid);
}

export function coveredScore(counts: Counts): number | null {
  return percent(counts.detected, counts.detected + (counts.byStatus.Survived ?? 0));
}

function byLocation(a: Mutant, b: Mutant): number {
  return a.location.start.line - b.location.start.line || a.location.start.column - b.location.start.column;
}

function byScore(a: FileMetrics, b: FileMetrics): number {
  if (a.mutationScore !== b.mutationScore) {
    if (a.mutationScore === null) return 1;
    if (b.mutationScore === null) return -1;
    return a.mutationScore - b.mutationScore;
  }
  return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}

export function computeMetrics(report: MutationReport): ReportMetrics {
  const totals = emptyCounts();

  const files = Object.entries(report.files).map(([path, file]): FileMetrics => {
    const counts = emptyCounts();
    for (const mutant of file.mutants) {
      addMutant(counts, mutant.status);
      addMutant(totals, mutant.status);
    }
    return {
      path,
      counts,
      mutationScore: mutationScore(counts),
      survivors: file.mutants.filter((m) => UNDETECTED.has(m.status)).sort(byLocation),
    };
  });

  return {
    totals,
    mutationScore: mutationScore(totals),
    coveredScore: coveredScore(totals),
    thresholds: report.thresholds ?? DEFAULT_THRESHOLDS,
    files: files.sort(byScore),
  };
}
