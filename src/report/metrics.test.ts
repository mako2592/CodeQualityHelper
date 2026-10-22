import { describe, expect, it } from 'vitest';
import { computeMetrics } from './metrics';
import { parseReport } from './parse';
import type { MutationReport } from './types';
import validReport from './fixtures/valid-report.json?raw';

let nextId = 0;

/** Buduje raport z plików opisanych jako lista statusów mutantów. */
function report(files: Record<string, string[]>, thresholds?: MutationReport['thresholds']): MutationReport {
  return {
    thresholds,
    files: Object.fromEntries(
      Object.entries(files).map(([path, statuses]) => [
        path,
        {
          mutants: statuses.map((status, i) => ({
            id: String(nextId++),
            mutatorName: 'ArithmeticOperator',
            status,
            location: { start: { line: i + 1, column: 1 } },
          })),
        },
      ]),
    ),
  };
}

const repeat = (status: string, n: number) => Array<string>(n).fill(status);

describe('computeMetrics: wyniki', () => {
  it('liczy mutation score i score dla pokrytego kodu', () => {
    const metrics = computeMetrics(
      report({ 'a.ts': [...repeat('Killed', 6), 'Timeout', ...repeat('Survived', 2), 'NoCoverage'] }),
    );

    expect(metrics.mutationScore).toBeCloseTo(70, 10);
    expect(metrics.coveredScore).toBeCloseTo(77.777777, 5);
  });

  it('nie wlicza CompileError do wyniku', () => {
    const metrics = computeMetrics(
      report({ 'a.ts': [...repeat('Killed', 8), ...repeat('Survived', 2), ...repeat('CompileError', 5)] }),
    );

    expect(metrics.totals.valid).toBe(10);
    expect(metrics.totals.total).toBe(15);
    expect(metrics.totals.byStatus.CompileError).toBe(5);
    expect(metrics.mutationScore).toBe(80);
  });

  it('zwraca null, gdy nie ma ważnych mutantów', () => {
    const metrics = computeMetrics(report({ 'a.ts': ['CompileError', 'Ignored', 'RuntimeError'] }));

    expect(metrics.mutationScore).toBeNull();
    expect(metrics.coveredScore).toBeNull();
  });

  it('zwraca null dla pokrytego kodu, gdy są tylko NoCoverage', () => {
    const metrics = computeMetrics(report({ 'a.ts': ['NoCoverage', 'NoCoverage'] }));

    expect(metrics.mutationScore).toBe(0);
    expect(metrics.coveredScore).toBeNull();
  });

  it('liczy nieznany status tylko w licznikach', () => {
    const metrics = computeMetrics(report({ 'a.ts': ['Killed', 'SomeFutureStatus'] }));

    expect(metrics.totals.byStatus.SomeFutureStatus).toBe(1);
    expect(metrics.totals.valid).toBe(1);
    expect(metrics.mutationScore).toBe(100);
  });

  it('zlicza statusy w podsumowaniu', () => {
    const metrics = computeMetrics(
      report({
        'a.ts': [...repeat('Killed', 120), ...repeat('Survived', 30)],
        'b.ts': [...repeat('NoCoverage', 12), ...repeat('Timeout', 4)],
      }),
    );

    expect(metrics.totals.total).toBe(166);
    expect(metrics.totals.byStatus).toEqual({ Killed: 120, Survived: 30, NoCoverage: 12, Timeout: 4 });
  });

  it('obsługuje raport bez plików', () => {
    const metrics = computeMetrics(report({}));

    expect(metrics.totals.total).toBe(0);
    expect(metrics.mutationScore).toBeNull();
    expect(metrics.files).toEqual([]);
  });
});

describe('computeMetrics: progi', () => {
  it('używa progów z raportu', () => {
    expect(computeMetrics(report({}, { high: 90, low: 50 })).thresholds).toEqual({ high: 90, low: 50 });
  });

  it('przyjmuje 80/60, gdy raport nie ma progów', () => {
    expect(computeMetrics(report({})).thresholds).toEqual({ high: 80, low: 60 });
  });
});

describe('computeMetrics: pliki', () => {
  it('stawia najsłabszy plik na górze', () => {
    const metrics = computeMetrics(
      report({
        'src/a.ts': [...repeat('Killed', 19), 'Survived'],
        'src/b.ts': [...repeat('Killed', 11), ...repeat('Survived', 9)],
      }),
    );

    expect(metrics.files.map((f) => f.path)).toEqual(['src/b.ts', 'src/a.ts']);
    expect(metrics.files[0].mutationScore).toBeCloseTo(55, 10);
    expect(metrics.files[1].mutationScore).toBeCloseTo(95, 10);
  });

  it('stawia plik bez ważnych mutantów na końcu z wynikiem null', () => {
    const metrics = computeMetrics(
      report({
        'src/a-ignored.ts': ['Ignored', 'Ignored'],
        'src/b.ts': ['Killed', 'Survived'],
        'src/c.ts': ['Killed'],
      }),
    );

    expect(metrics.files.map((f) => f.path)).toEqual(['src/b.ts', 'src/c.ts', 'src/a-ignored.ts']);
    expect(metrics.files[2].mutationScore).toBeNull();
  });

  it('przy równym wyniku sortuje alfabetycznie po ścieżce', () => {
    const metrics = computeMetrics(report({ 'z.ts': ['Killed'], 'a.ts': ['Killed'], 'm.ts': ['Killed'] }));

    expect(metrics.files.map((f) => f.path)).toEqual(['a.ts', 'm.ts', 'z.ts']);
  });

  it('zbiera Survived i NoCoverage posortowane po linii i kolumnie', () => {
    const parsed = parseReport(validReport);
    if (!parsed.ok) throw new Error('oczekiwano poprawnego raportu');

    const calc = computeMetrics(parsed.report).files.find((f) => f.path === 'src/calc.ts')!;

    expect(calc.survivors.map((m) => [m.location.start.line, m.location.start.column, m.status])).toEqual([
      [3, 7, 'NoCoverage'],
      [3, 44, 'Survived'],
      [12, 5, 'Survived'],
    ]);
  });

  it('zwraca pustą listę, gdy wszystkie mutanty są wykryte', () => {
    const metrics = computeMetrics(report({ 'a.ts': ['Killed', 'Timeout'] }));

    expect(metrics.files[0].survivors).toEqual([]);
  });
});

describe('computeMetrics: przykładowy raport', () => {
  it('liczy metryki pełnego fixture', () => {
    const parsed = parseReport(validReport);
    if (!parsed.ok) throw new Error('oczekiwano poprawnego raportu');

    const metrics = computeMetrics(parsed.report);

    expect(metrics.totals).toMatchObject({ total: 17, detected: 10, undetected: 4, valid: 14 });
    expect(metrics.mutationScore).toBeCloseTo((10 / 14) * 100, 10);
    expect(metrics.coveredScore).toBeCloseTo((10 / 13) * 100, 10);
    expect(metrics.files.map((f) => f.path)).toEqual(['src/calc.ts', 'src/strings.ts', 'src/utils.ts', 'src/legacy.ts']);
  });
});
