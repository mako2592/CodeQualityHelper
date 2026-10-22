import { formatScore } from '../report/format';
import type { ReportMetrics } from '../report/metrics';
import { KNOWN_STATUSES } from '../report/types';
import { ScoreBadge } from './ScoreBadge';

const KNOWN: readonly string[] = KNOWN_STATUSES;

/** Znane statusy w stałej kolejności, nieznane na końcu alfabetycznie. */
function orderedStatuses(byStatus: Record<string, number>): [string, number][] {
  const known = KNOWN.filter((s) => s in byStatus).map((s): [string, number] => [s, byStatus[s]]);
  const unknown = Object.entries(byStatus)
    .filter(([s]) => !KNOWN.includes(s))
    .sort(([a], [b]) => a.localeCompare(b));
  return [...known, ...unknown];
}

export function Summary({ metrics }: { metrics: ReportMetrics }) {
  const { totals, thresholds } = metrics;

  return (
    <section className="summary" aria-label="Podsumowanie raportu">
      <div className="summary__main">
        <div className="summary__title">Mutation score</div>
        <ScoreBadge score={metrics.mutationScore} thresholds={thresholds} />
        <div className="muted">
          progi: low {thresholds.low} / high {thresholds.high}
        </div>
      </div>

      <dl className="summary__stats">
        <div>
          <dt>Score dla pokrytego kodu</dt>
          <dd>{formatScore(metrics.coveredScore)}</dd>
        </div>
        <div>
          <dt>Mutanty łącznie</dt>
          <dd>{totals.total}</dd>
        </div>
      </dl>

      <ul className="status-counts">
        {orderedStatuses(totals.byStatus).map(([status, count]) => (
          <li key={status} className={`status status--${status}`}>
            <span>{status}</span> <strong>{count}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
