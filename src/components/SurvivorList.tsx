import type { Mutant } from '../report/types';

export function SurvivorList({ survivors }: { survivors: Mutant[] }) {
  if (survivors.length === 0) {
    return <p className="muted">W tym pliku nie ma przeżywających mutantów.</p>;
  }

  return (
    <ul className="survivors">
      {survivors.map((m) => (
        <li key={m.id}>
          <span className="survivors__location">
            {m.location.start.line}:{m.location.start.column}
          </span>
          <span className="survivors__mutator">{m.mutatorName}</span>
          <span className={`status status--${m.status}`}>{m.status}</span>
          {m.replacement !== undefined && <code className="survivors__replacement">{m.replacement}</code>}
        </li>
      ))}
    </ul>
  );
}
