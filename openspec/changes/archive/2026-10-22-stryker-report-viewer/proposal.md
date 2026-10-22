# Proposal

## Why

Raport JSON ze Stryker Mutator zawiera wszystkie dane o testach mutacyjnych, ale bez narzędzia trudno go szybko przejrzeć. Wbudowany raport HTML Strykera jest rozbudowany. Potrzebujemy prostego widoku „na jeden rzut oka”: jaki jest wynik, które pliki wypadają najsłabiej i które mutanty przeżyły.

## What Changes

- Nowa aplikacja webowa (React + Vite + TypeScript) działająca w całości w przeglądarce, bez backendu.
- Wczytywanie pliku raportu przez przeciągnięcie i upuszczenie albo przez wybór pliku. Plik nie jest nigdzie wysyłany.
- Wstępna walidacja struktury raportu i czytelny komunikat, gdy plik nie jest poprawnym raportem Strykera.
- Wyliczanie metryk: mutation score, score dla pokrytego kodu, liczniki mutantów według statusu, metryki per plik.
- Widok podsumowania: score z oceną względem progów `thresholds` z raportu oraz liczniki statusów.
- Tabela plików posortowana od najniższego score. Po rozwinięciu wiersza widać mutanty, które przeżyły (`Survived`, `NoCoverage`), z lokalizacją, nazwą mutatora i zamianą.
- Poza zakresem: podgląd kodu źródłowego z zaznaczonymi mutantami, porównywanie raportów, pełna walidacja z JSON Schema, eksport.

## Capabilities

### New Capabilities
- `mutation-report-import`: wczytanie pliku raportu w przeglądarce, sprawdzenie, czy jest poprawnym raportem Strykera, oraz zgłaszanie błędów.
- `mutation-report-dashboard`: wyliczanie metryk z wczytanego raportu i prezentacja podsumowania, tabeli plików i listy przeżywających mutantów.

### Modified Capabilities

Brak.

## Impact

- Nowy kod w `src/` (logika raportu i komponenty React) oraz `index.html` i konfiguracja Vite.
- `package.json`: nowe zależności `react`, `react-dom`, `@vitejs/plugin-react` i typy Reacta. Nowe skrypty: `dev`, `build`, `test`, `typecheck`. Istniejące `typescript` i `vitest` zostają.
- Nowy `tsconfig.json`.
- Brak wpływu na istniejące systemy. Projekt nie ma jeszcze kodu.
