import { formatScore, RATING_LABELS, rateScore } from '../report/format';
import type { Thresholds } from '../report/types';

interface ScoreBadgeProps {
  score: number | null;
  thresholds: Thresholds;
}

/** Wynik z oceną pokazaną kolorem i tekstem, żeby nie polegać na samym kolorze. */
export function ScoreBadge({ score, thresholds }: ScoreBadgeProps) {
  const rating = rateScore(score, thresholds);
  return (
    <span className={`score score--${rating ?? 'none'}`}>
      <span className="score__value">{formatScore(score)}</span>
      {rating && <span className="score__label">{RATING_LABELS[rating]}</span>}
    </span>
  );
}
