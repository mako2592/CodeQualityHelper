# Design

## Context

Repozytorium nie zawiera jeszcze kodu aplikacji. Jest w nim tylko `package.json` z `typescript` 7.0.2 (natywny kompilator, binarka `tsc`) i `vitest` 5.0.5. Vitest dostarcza przechodnio `vite` 8.3.5, ale nie jest to jawna zależność projektu. Środowisko to Node 24 na Windows. Motywacja i zakres: zob. proposal.md. Wymagania: zob. `specs/mutation-report-import` oraz `specs/mutation-report-dashboard`.

## Goals / Non-Goals

**Goals:**
- Logika raportu (parsowanie, walidacja, metryki) to czyste funkcje TypeScript bez zależności od DOM ani Reacta. Testujemy je w Vitest.
- Warstwa React jest cienka: odczyt pliku, stan aplikacji i prezentacja gotowych danych.
- Statyczny build (`vite build`) da się otworzyć z dowolnego hostingu plików.

**Non-Goals:**
- Automatyczne testy komponentów React (bez jsdom i Testing Library).
- Biblioteka komponentów, CSS-in-JS czy Tailwind.
- Obsługa bardzo dużych raportów (setki MB) przez streaming lub web workery.
- Routing, wiele ekranów, trwałe przechowywanie raportu.

## Decisions

### 1. Struktura modułów

```
index.html
src/
  main.tsx                 punkt wejścia, render <App/>
  App.tsx                  stan: idle | error | loaded
  App.css                  style + zmienne kolorów
  report/
    types.ts               typy raportu (podzbiór schematu Strykera)
    parse.ts               parseReport(text) -> ParseResult
    metrics.ts             computeMetrics(report) -> ReportMetrics
    format.ts              formatScore, ocena względem progów
    *.test.ts              testy Vitest
    fixtures/              małe przykładowe raporty JSON do testów
  components/
    FileDrop.tsx           drag&drop + <input type="file">
    Summary.tsx            score, progi, liczniki statusów
    FileTable.tsx          tabela plików + rozwijane wiersze
    SurvivorList.tsx       lista mutantów Survived/NoCoverage
```

Wymagany przez spec podział na import i dashboard odpowiada podziałowi `parse.ts` oraz `metrics.ts` z komponentami.

### 2. Walidacja: ręczne type guardy, bez biblioteki schematów

`parseReport` przyjmuje tekst i zwraca unię dyskryminowaną:

```ts
type ParseResult =
  | { ok: true; report: MutationReport }
  | { ok: false; error: 'invalid-json' | 'not-a-report'; detail?: string };
```

Sprawdzamy tylko pola, z których korzystamy (`files`, `mutants[]`, `id`, `mutatorName`, `status`, `location.start.line/column`, opcjonalnie `thresholds` i `replacement`). Pozostałe pola są ignorowane.

- *Alternatywa: zod lub valibot.* Wygodniejsze przy rozbudowie, ale to dodatkowa zależność przy kilkunastu sprawdzeniach.
- *Alternatywa: pełna walidacja z oficjalnym `mutation-testing-report-schema` (ajv).* Odrzucona, bo jest poza zakresem i jest zbyt restrykcyjna. Nowsze lub starsze wersje schematu mogłyby zostać niepotrzebnie odrzucone.
- Nieznany `status` nie jest błędem. Mutant trafia do licznika danego statusu, ale nie wchodzi do grupy ważnych. Dzięki temu nowy status w przyszłej wersji Strykera nie zablokuje aplikacji.

### 3. Metryki jako jedna funkcja zwracająca gotowy model

`computeMetrics(report)` zwraca:

```ts
interface ReportMetrics {
  totals: Counts;                 // detected, undetected, valid, total, byStatus
  mutationScore: number | null;   // null = n/d
  coveredScore: number | null;
  thresholds: { high: number; low: number };  // z raportu lub 80/60
  files: FileMetrics[];           // już posortowane wg specu
}
interface FileMetrics {
  path: string;
  counts: Counts;
  mutationScore: number | null;
  survivors: Mutant[];            // Survived + NoCoverage, sortowane linia/kolumna
}
```

Wyniki przechowujemy jako surowe liczby. Zaokrąglenie do dwóch miejsc po przecinku i tekst „n/d” powstają dopiero w `format.ts`, w jednym miejscu. Dzięki temu sortowanie działa na dokładnych wartościach, a testy mogą sprawdzać zarówno liczby, jak i sformatowany tekst. Ocena (`good`, `warning`, `bad`) to osobna czysta funkcja `rateScore(score, thresholds)`.

### 4. Odczyt pliku: `File.text()`

`FileDrop` obsługuje `onDrop` i `onChange` inputa, a potem wywołuje `file.text()` i przekazuje tekst do `parseReport`. Kod pozostaje asynchroniczny, ale prostszy niż `FileReader`. Przy upuszczeniu kilku plików bierzemy pierwszy. Nie ma żadnego `fetch`, więc wymaganie o przetwarzaniu lokalnym jest spełnione z konstrukcji.

### 5. Stan aplikacji w `App` przez `useState`

```ts
type AppState =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; fileName: string; metrics: ReportMetrics };
```

`metrics` wyliczamy raz przy wczytaniu. Nowy plik zawsze nadpisuje cały stan, co spełnia wymaganie zastąpienia raportu. `FileDrop` jest widoczny w każdym stanie, a po wczytaniu raportu w wersji kompaktowej nad podsumowaniem. Stan rozwinięcia wierszy żyje w `FileTable` (`Set<string>` ścieżek) i resetuje się przez `key={fileName}` przy zmianie raportu. Redux i Context są zbędne.

### 6. Narzędzia i konfiguracja

- Jawne devDependencies: `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`. Zależności: `react`, `react-dom` (19.x). Wersję `vite` przypinamy do zgodnej z już zainstalowaną 8.x, żeby nie dublować jej z Vitestem.
- Jeden `tsconfig.json` (`jsx: react-jsx`, `strict`, `noEmit`, `moduleResolution: bundler`). Sprawdzanie typów uruchamia `tsc --noEmit`, a transpilacją zajmuje się Vite.
- `package.json`: `"type": "module"` (dziś `commonjs`). Skrypty: `dev`, `build`, `preview`, `test` (`vitest run`), `typecheck`.
- Testy Vitest działają w środowisku `node`, bo logika nie dotyka DOM.

### 7. Style

Jeden plik CSS ze zmiennymi na `:root`: kolory ocen good/warning/bad oraz neutralne. Wersja ciemna przez `prefers-color-scheme`. Tabela to natywny `<table>`, a rozwinięcie to dodatkowy `<tr>` z listą. Ocenę pokazujemy kolorem i tekstem (np. „poniżej progu”), żeby nie polegać na samym kolorze.

## Risks / Trade-offs

- [TypeScript 7 to nowy natywny kompilator i ekosystem może mieć z nim drobne niezgodności, np. w typach Reacta.] → Transpilacja i tak idzie przez Vite, a TS służy tylko do sprawdzania typów. Jeśli `tsc` 7 zgłosi problem niezwiązany z naszym kodem, opisujemy go w zadaniu i rozważamy powrót do TS 5.x.
- [Duży raport (wiele MB, bo zawiera pełny `source` każdego pliku) może na chwilę zablokować UI przy `JSON.parse`.] → Akceptujemy to w tej wersji. Pole `source` nie jest używane, więc nie trzymamy go w modelu metryk. Web worker to możliwe rozszerzenie później.
- [Ręczna walidacja może przepuścić raport z nietypowymi danymi, np. `line` jako tekstem.] → Type guardy sprawdzają typy pól, z których faktycznie korzystamy. Reszta nie wpływa na widok.
- [Zmiana `"type"` w `package.json` na `module`.] → Projekt nie ma jeszcze kodu, więc nic się nie psuje. Vite i Vitest oczekują ESM.
- [Brak testów komponentów.] → Logika jest w czystych funkcjach z testami. UI weryfikujemy ręcznie na przykładowym raporcie według scenariuszy ze specu.
