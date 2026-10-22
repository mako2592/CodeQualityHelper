# Tasks

## 1. Izolacja głównych testów

- [x] 1.1 Dodać `test.include: ['src/**/*.test.ts']` w `vite.config.ts` i dopisać `reports/` oraz `.stryker-tmp/` do `.gitignore`. Weryfikacja: `npm test` w katalogu głównym uruchamia tylko 3 pliki testów z `src/` (52 testy).

## 2. Projekt przykładowy

- [x] 2.1 Utworzyć `examples/sample-project/` z `package.json` (private, `"type": "module"`, devDependencies `vitest` ^4.1 (Stryker 10 nie działa z Vitest 5, zob. design.md), `@stryker-mutator/core` ^10.0.0, `@stryker-mutator/vitest-runner` ^10.0.0, skrypty `test` i `mutation`) i `vitest.config.ts`. Weryfikacja: `npm install` w tym katalogu kończy się bez błędów.
- [x] 2.2 Napisać moduły `cart.ts`, `discount.ts`, `shipping.ts`, `retry.ts` i `legacy.ts` oraz testy według design.md (dobre testy dla `cart`, niepełne dla `discount`, brak dla `shipping`, pętla w `retry`, `// Stryker disable` w `legacy`). Weryfikacja: `npm test` w projekcie przykładowym przechodzi.
- [x] 2.3 Dodać `stryker.config.json` (runner `vitest`, reportery `json`, `clear-text`, `progress`, `jsonReporter.fileName: "../sample-report.json"`, `mutate: ["src/**/*.ts", "!src/**/*.test.ts"]`) oraz `scripts/sanitize-report.mjs`, który usuwa `projectRoot` i `system` i zapisuje JSON z wcięciami. Skrypt `mutation` uruchamia oba kroki. Weryfikacja: `npm run mutation` tworzy `examples/sample-report.json` bez pól `projectRoot` i `system`.
- [x] 2.4 Sprawdzić wygenerowany raport: zawiera statusy `Killed`, `Survived`, `NoCoverage`, `Timeout` i `Ignored`, ma pliki o wyniku powyżej 80%, między 60 a 80%, poniżej 60% oraz plik z wynikiem „n/d”, a `parseReport` z aplikacji wczytuje go bez błędu. Jeśli czegoś brakuje, dostosować kod przykładowy i wygenerować raport ponownie. Weryfikacja: jednorazowy skrypt Node z `parseReport` i `computeMetrics` wypisuje statusy i wyniki plików spełniające te warunki.

## 3. Zrzuty ekranu

- [x] 3.1 Dodać devDependency `playwright` (^1.64.1) i skrypt `screenshots` (`vite build && node scripts/screenshots.mjs`) w głównym `package.json`, zainstalować Chromium (`npx playwright install chromium`). Weryfikacja: `npx playwright --version` zwraca 1.64.x.
- [x] 3.2 Napisać `scripts/screenshots.mjs`: `preview()` z API Vite, Chromium z Playwright, pięć ujęć z tabeli w design.md (`start`, `dashboard`, `file-details`, `dark`, `mobile`), wczytywanie przez `setInputFiles` z `examples/sample-report.json`, zamykanie przeglądarki i serwera w `finally`. Weryfikacja: `npm run screenshots` tworzy 5 plików PNG w `docs/screenshots/` i kończy się bez wiszących procesów.
- [x] 3.3 Obejrzeć wszystkie zrzuty: są czytelne, pokazują właściwe stany, a jasny i ciemny motyw oraz widok mobilny wyglądają poprawnie. Usterki wyglądu poprawić w `src/App.css` i wygenerować zrzuty ponownie. Weryfikacja: przejrzenie 5 obrazów, `npm run typecheck`, `npm test` i `npm run build` przechodzą.

## 4. Dokumentacja

- [x] 4.1 Zaktualizować `README.md`: sekcja „Zrzuty ekranu” (`dashboard`, `file-details`, `dark` i `mobile` obok siebie), sekcja „Przykładowy raport” (skąd jest `examples/sample-report.json` i jak go odtworzyć), skrypt `npm run screenshots` w tabeli z informacją o instalacji Chromium. Weryfikacja: wszystkie ścieżki obrazów i plików w README istnieją, a opisane polecenia działają w podanej kolejności.

## Workflow follow-up

- Po obejrzeniu zrzutów w jasnym motywie można odhaczyć zadanie 4.4 w change `stryker-report-viewer` i zarchiwizować oba change przez `/opsx:archive`.
