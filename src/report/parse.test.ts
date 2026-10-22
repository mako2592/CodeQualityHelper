import { describe, expect, it } from 'vitest';
import { parseReport } from './parse';
import emptyFiles from './fixtures/empty-files.json?raw';
import invalid from './fixtures/invalid.json?raw';
import noFiles from './fixtures/no-files.json?raw';
import noThresholds from './fixtures/no-thresholds.json?raw';
import validReport from './fixtures/valid-report.json?raw';

const fixtures: Record<string, string> = {
  'valid-report.json': validReport,
  'no-thresholds.json': noThresholds,
  'empty-files.json': emptyFiles,
  'no-files.json': noFiles,
  'invalid.json': invalid,
};

const fixture = (name: string) => fixtures[name];

const mutant = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  mutatorName: 'ArithmeticOperator',
  status: 'Killed',
  location: { start: { line: 1, column: 1 } },
  ...overrides,
});

const reportWith = (m: unknown) => JSON.stringify({ files: { 'a.ts': { mutants: [m] } } });

describe('parseReport', () => {
  it('wczytuje poprawny raport z polami opcjonalnymi', () => {
    const result = parseReport(fixture('valid-report.json'));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.report.files)).toEqual([
      'src/calc.ts',
      'src/utils.ts',
      'src/strings.ts',
      'src/legacy.ts',
    ]);
    expect(result.report.thresholds).toEqual({ high: 80, low: 60 });
    expect(result.report.files['src/calc.ts'].mutants[0]).toEqual({
      id: '1',
      mutatorName: 'ArithmeticOperator',
      status: 'Survived',
      location: { start: { line: 12, column: 5 } },
      replacement: 'a - b',
    });
  });

  it('pomija pole source i pola nieużywane', () => {
    const result = parseReport(fixture('valid-report.json'));

    if (!result.ok) throw new Error('oczekiwano poprawnego raportu');
    expect(result.report.files['src/calc.ts']).not.toHaveProperty('source');
    expect(result.report).not.toHaveProperty('testFiles');
    expect(result.report).not.toHaveProperty('performance');
  });

  it('wczytuje raport bez progów', () => {
    const result = parseReport(fixture('no-thresholds.json'));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.report.thresholds).toBeUndefined();
  });

  it('wczytuje raport z pustym files', () => {
    const result = parseReport(fixture('empty-files.json'));

    expect(result).toEqual({ ok: true, report: { files: {}, thresholds: { high: 80, low: 60 } } });
  });

  it('zgłasza invalid-json dla pliku, który nie jest JSON-em', () => {
    const result = parseReport(fixture('invalid.json'));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('invalid-json');
  });

  it('zgłasza not-a-report dla JSON-a bez files', () => {
    const result = parseReport(fixture('no-files.json'));

    expect(result).toMatchObject({ ok: false, error: 'not-a-report' });
  });

  it.each([['null'], ['[]'], ['"tekst"'], ['{"files": []}']])(
    'zgłasza not-a-report dla %s',
    (text) => {
      expect(parseReport(text)).toMatchObject({ ok: false, error: 'not-a-report' });
    },
  );

  it('zgłasza not-a-report, gdy plik nie ma tablicy mutants', () => {
    const result = parseReport(JSON.stringify({ files: { 'a.ts': { language: 'ts' } } }));

    expect(result).toMatchObject({ ok: false, error: 'not-a-report' });
    if (!result.ok) expect(result.detail).toContain('files["a.ts"].mutants');
  });

  it.each([
    ['id', { id: undefined }],
    ['mutatorName', { mutatorName: 42 }],
    ['status', { status: null }],
    ['location.start', { location: {} }],
    ['location.start.line', { location: { start: { line: '3', column: 1 } } }],
    ['location.start.column', { location: { start: { line: 3 } } }],
  ])('zgłasza not-a-report, gdy mutant ma niepoprawne pole %s', (field, overrides) => {
    const result = parseReport(reportWith(mutant(overrides)));

    expect(result).toMatchObject({ ok: false, error: 'not-a-report' });
    if (!result.ok) expect(result.detail).toContain(`mutants[0].${field}`);
  });

  it('akceptuje nieznany status mutanta', () => {
    const result = parseReport(reportWith(mutant({ status: 'SomeFutureStatus' })));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.report.files['a.ts'].mutants[0].status).toBe('SomeFutureStatus');
  });

  it('zamienia liczbowe id na tekst', () => {
    const result = parseReport(reportWith(mutant({ id: 7 })));

    if (!result.ok) throw new Error('oczekiwano poprawnego raportu');
    expect(result.report.files['a.ts'].mutants[0].id).toBe('7');
  });

  it('ignoruje niepoprawne progi', () => {
    const result = parseReport(JSON.stringify({ thresholds: { high: '80' }, files: {} }));

    if (!result.ok) throw new Error('oczekiwano poprawnego raportu');
    expect(result.report.thresholds).toBeUndefined();
  });
});
