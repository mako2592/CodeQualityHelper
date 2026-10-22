# Proposal

## Why

Kto trafia do repozytorium, nie ma pod ręką raportu Strykera, żeby wypróbować aplikację, a z README nie widać, jak aplikacja wygląda. Prawdziwy przykładowy raport i zrzuty ekranu pozwalają ocenić narzędzie w kilka sekund, bez konfigurowania Strykera we własnym projekcie.

## What Changes

- Nowy mały projekt przykładowy `examples/sample-project/` (TypeScript + Vitest + StrykerJS) z celowo niepełnymi testami. Dzięki temu raport zawiera różne statusy mutantów (`Killed`, `Survived`, `NoCoverage`, `Timeout` i inne).
- Prawdziwy raport wygenerowany przez Strykera na tym projekcie, zapisany jako `examples/sample-report.json`, bez pól zdradzających lokalne środowisko (`projectRoot`, `system`).
- Skrypt `npm run screenshots` (Playwright) budujący aplikację, wczytujący przykładowy raport i zapisujący zrzuty ekranu PNG do `docs/screenshots/`.
- README uzupełnione o zrzuty ekranu, opis przykładowego raportu oraz instrukcję ponownego wygenerowania raportu i zrzutów.
- Aplikacja się nie zmienia. Nie ma przycisku „przykładowy raport”, a plik wczytuje się jak każdy inny.

## Capabilities

### New Capabilities

Brak. Change dodaje dane przykładowe, narzędzia deweloperskie i dokumentację, a nie zmienia zachowania aplikacji, dlatego ustawia `skip_specs: true`.

### Modified Capabilities

Brak.

## Impact

- Nowe katalogi: `examples/sample-project/` (własny `package.json` z `@stryker-mutator/core`, `@stryker-mutator/vitest-runner` i `vitest`), `examples/sample-report.json`, `docs/screenshots/*.png`, `scripts/screenshots.mjs`.
- Główny `package.json`: nowa devDependency `playwright` i skrypt `screenshots`. Do uruchomienia skryptu potrzebna jest przeglądarka Chromium dla Playwright (`npx playwright install chromium`).
- Główna konfiguracja Vitest musi ograniczyć testy do `src/`, żeby `npm test` nie uruchamiał testów projektu przykładowego.
- `.gitignore`: katalogi robocze Strykera (`reports/`, `.stryker-tmp/`).
- Zależności Strykera trafiają tylko do projektu przykładowego, nie do aplikacji.
- Zrzuty ekranu pozwolą też obejrzeć wygląd w jasnym motywie, co zamknie otwarte zadanie 4.4 w change `stryker-report-viewer`.
