import { Fragment, useState } from 'react';
import type { FileMetrics } from '../report/metrics';
import type { Thresholds } from '../report/types';
import { ScoreBadge } from './ScoreBadge';
import { SurvivorList } from './SurvivorList';

interface FileTableProps {
  files: FileMetrics[];
  thresholds: Thresholds;
}

export function FileTable({ files, thresholds }: FileTableProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  function toggle(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div className="table-wrap">
      <table className="file-table">
        <thead>
          <tr>
            <th scope="col">Plik</th>
            <th scope="col" className="num">Mutanty</th>
            <th scope="col" className="num">Survived</th>
            <th scope="col" className="num">NoCoverage</th>
            <th scope="col" className="num">Score</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const isOpen = expanded.has(file.path);
            return (
              <Fragment key={file.path}>
                <tr className={isOpen ? 'is-open' : undefined}>
                  <th scope="row">
                    <button
                      type="button"
                      className="file-table__toggle"
                      aria-expanded={isOpen}
                      onClick={() => toggle(file.path)}
                    >
                      <span className="file-table__chevron" aria-hidden="true">
                        {isOpen ? '▾' : '▸'}
                      </span>
                      {file.path}
                    </button>
                  </th>
                  <td className="num">{file.counts.total}</td>
                  <td className="num">{file.counts.byStatus.Survived ?? 0}</td>
                  <td className="num">{file.counts.byStatus.NoCoverage ?? 0}</td>
                  <td className="num">
                    <ScoreBadge score={file.mutationScore} thresholds={thresholds} />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="file-table__details">
                    <td colSpan={5}>
                      <SurvivorList survivors={file.survivors} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
