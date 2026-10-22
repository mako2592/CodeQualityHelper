import { useRef, useState } from 'react';
import { FileDrop } from './components/FileDrop';
import { FileTable } from './components/FileTable';
import { Summary } from './components/Summary';
import { computeMetrics, type ReportMetrics } from './report/metrics';
import { parseReport, type ParseError } from './report/parse';
import './App.css';

type AppState =
  | { kind: 'idle' }
  | { kind: 'error'; message: string; detail?: string }
  | { kind: 'loaded'; loadId: number; fileName: string; metrics: ReportMetrics };

const ERROR_MESSAGES: Record<ParseError, string> = {
  'invalid-json': 'Plik nie jest poprawnym JSON-em.',
  'not-a-report': 'Plik nie wygląda na raport Strykera.',
};

export function App() {
  const [state, setState] = useState<AppState>({ kind: 'idle' });
  // Odczyt pliku jest asynchroniczny, więc ignorujemy wyniki starszych wczytań.
  const loadCounter = useRef(0);

  async function handleFile(file: File) {
    const loadId = ++loadCounter.current;
    let text: string;
    try {
      text = await file.text();
    } catch {
      if (loadId === loadCounter.current) setState({ kind: 'error', message: 'Nie udało się odczytać pliku.' });
      return;
    }
    if (loadId !== loadCounter.current) return;

    const result = parseReport(text);
    setState(
      result.ok
        ? { kind: 'loaded', loadId, fileName: file.name, metrics: computeMetrics(result.report) }
        : { kind: 'error', message: ERROR_MESSAGES[result.error], detail: result.detail },
    );
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Stryker Report Viewer</h1>
        {state.kind === 'loaded' && <span className="muted">{state.fileName}</span>}
      </header>

      <FileDrop onFile={handleFile} compact={state.kind === 'loaded'} />

      {state.kind === 'error' && (
        <div className="alert" role="alert">
          <strong>{state.message}</strong>
          {state.detail && <div className="alert__detail">{state.detail}</div>}
        </div>
      )}

      {state.kind === 'loaded' &&
        (state.metrics.totals.total === 0 ? (
          <p className="notice">Raport nie zawiera mutantów.</p>
        ) : (
          <>
            <Summary metrics={state.metrics} />
            {/* Nowy klucz przy każdym wczytaniu resetuje rozwinięte wiersze. */}
            <FileTable key={state.loadId} files={state.metrics.files} thresholds={state.metrics.thresholds} />
          </>
        ))}
    </main>
  );
}
