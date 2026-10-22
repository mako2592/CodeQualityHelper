# Tasks

## 1. Konfiguracja projektu

- [x] 1.1 Dodać zależności `react`, `react-dom` oraz devDependencies `vite` (8.x), `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`. Ustawić `"type": "module"` i skrypty `dev`, `build`, `preview`, `test` (`vitest run`), `typecheck` (`tsc --noEmit`). Weryfikacja: `npm install` kończy się bez błędów.
- [x] 1.2 Utworzyć `tsconfig.json` (strict, `jsx: react-jsx`, `moduleResolution: bundler`, `noEmit`), `vite.config.ts` z pluginem React i środowiskiem testów `node`, `index.html`, `src/main.tsx` oraz pusty `src/App.tsx`. Weryfikacja: `npm run typecheck` i `npm run build` przechodzą, a `npm run dev` pokazuje pustą stronę.

## 2. Model i parsowanie raportu

- [x] 2.1 Zdefiniować typy raportu w `src/report/types.ts` (`MutationReport`, `FileResult`, `Mutant`, `MutantStatus`, `Thresholds`) jako podzbiór schematu Strykera. Weryfikacja: `npm run typecheck` przechodzi.
- [x] 2.2 Przygotować fixtures w `src/report/fixtures/`: poprawny raport z wieloma plikami i statusami (z `testFiles`, `performance`, `framework`), raport bez `thresholds`, raport z pustym `files`, JSON bez `files`, plik z niepoprawnym JSON-em. Weryfikacja: pliki istnieją i każdy pokrywa scenariusz ze specu `mutation-report-import`.
- [x] 2.3 Zaimplementować `parseReport(text)` w `src/report/parse.ts` (wynik `ok` albo błąd `invalid-json` / `not-a-report`, pomijanie pola `source` i pól nieużywanych, nieznany status nie jest błędem) wraz z testami w `parse.test.ts` na fixtures z 2.2. Weryfikacja: `npm test` przechodzi.

## 3. Metryki

- [x] 3.1 Zaimplementować `computeMetrics(report)` w `src/report/metrics.ts`: klasyfikacja statusów, liczniki łączne i per plik, mutation score, score dla pokrytego kodu (`null` przy zerowym mianowniku), progi z raportu lub 80/60. Do tego testy w `metrics.test.ts` odwzorowujące scenariusze specu `mutation-report-dashboard` (70.00% i 77.78%, CompileError poza wynikiem, brak ważnych mutantów daje `null`). Weryfikacja: `npm test` przechodzi.
- [x] 3.2 Dodać sortowanie plików (rosnąco po score, `null` na końcu, remis po ścieżce) i listę `survivors` per plik (Survived + NoCoverage, sortowanie linia/kolumna) z testami. Weryfikacja: `npm test` przechodzi i obejmuje scenariusze „Najsłabszy plik na górze” oraz „Plik bez ważnych mutantów”.
- [x] 3.3 Zaimplementować `src/report/format.ts`: `formatScore` (dwa miejsca po przecinku, `null` jako „n/d”) i `rateScore` (good/warning/bad, wartość równa progowi `high` jest dobra) z testami granic progów. Weryfikacja: `npm test` przechodzi.

## 4. Interfejs użytkownika

- [x] 4.1 Zaimplementować `FileDrop` (drag&drop oraz `<input type="file" accept=".json">`, odczyt przez `file.text()`, pierwszy plik przy kilku upuszczonych) i stan `idle | error | loaded` w `App`, z komunikatami dla `invalid-json`, `not-a-report` i raportu bez mutantów. Weryfikacja ręczna w `npm run dev`: niepoprawny JSON i JSON bez `files` pokazują właściwy komunikat, a ponowne wczytanie poprawnego pliku usuwa go.
- [x] 4.2 Zaimplementować `Summary`: score z oceną (kolor i tekst), wartości progów, score dla pokrytego kodu, łączna liczba mutantów i liczniki statusów. Weryfikacja ręczna na poprawnym fixture: wartości zgadzają się z wynikami testów z grupy 3.
- [x] 4.3 Zaimplementować `FileTable` i `SurvivorList`: kolumny ścieżka, mutanty, Survived, NoCoverage, score z oceną. Wiersz rozwija się i zwija kliknięciem, pokazując `linia:kolumna`, mutator, status i `replacement` (jeśli jest) albo informację o braku przeżywających mutantów. Stan rozwinięcia resetuje się przy nowym raporcie. Weryfikacja ręczna: najsłabszy plik jest na górze, a rozwinięcie pokazuje poprawne mutanty.
- [ ] 4.4 Dodać style w `src/App.css`: zmienne kolorów na `:root`, tryb ciemny przez `prefers-color-scheme`, czytelny układ do szerokości telefonu. Weryfikacja ręczna w jasnym i ciemnym motywie systemu.

## 5. Weryfikacja końcowa

- [x] 5.1 Wczytać prawdziwy raport Strykera (np. wygenerowany na małym projekcie albo dołączony fixture) i przejść wszystkie scenariusze z obu specyfikacji. W DevTools (zakładka Network) potwierdzić, że wczytanie pliku nie wysyła żadnych żądań. Weryfikacja: wszystkie scenariusze zachowują się zgodnie ze specem.
- [x] 5.2 Uruchomić `npm run typecheck`, `npm test` i `npm run build`. Weryfikacja: wszystkie trzy kończą się bez błędów.
- [x] 5.3 Dodać krótki `README.md` (czym jest aplikacja, `npm install`, `npm run dev`, gdzie Stryker zapisuje raport JSON, czyli reporter `json` i `reports/mutation/mutation.json`). Weryfikacja: polecenia z README działają w opisanej kolejności.

## Workflow follow-up

- Po implementacji i przeglądzie zarchiwizować change przez `/opsx:archive`.
