import type { Thresholds } from './types';

export type Rating = 'good' | 'warning' | 'bad';

export const RATING_LABELS: Record<Rating, string> = {
  good: 'powyżej progu',
  warning: 'między progami',
  bad: 'poniżej progu',
};

/** Zaokrągla tak samo jak formatScore, żeby ocena zgadzała się z wyświetlaną liczbą. */
function round2(score: number): number {
  return Math.round(score * 100) / 100;
}

export function formatScore(score: number | null): string {
  return score === null ? 'n/d' : `${round2(score).toFixed(2)}%`;
}

export function rateScore(score: number | null, thresholds: Thresholds): Rating | null {
  if (score === null) return null;
  const rounded = round2(score);
  if (rounded >= thresholds.high) return 'good';
  if (rounded >= thresholds.low) return 'warning';
  return 'bad';
}
