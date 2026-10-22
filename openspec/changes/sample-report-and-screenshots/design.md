# Design

## Context

Aplikacja z change `stryker-report-viewer` jest gotowa: React + Vite, testy Vitest 5 w `src/`, Node 24. Główna konfiguracja Vitest (`vite.config.ts`) nie ma dziś `include`, więc domyślnie zbiera `**/*.test.ts` z całego repozytorium. Zrzuty ekranu z rozszerzenia Chrome w tej sesji przekraczały limit czasu, więc zrzuty muszą powstawać przez niezależny, powtarzalny skrypt. Motywacja: zob. proposal.md.

## Goals / Non-Goals

**Goals:**
- Raport w `examples/sample-report.json` pochodzi z prawdziwego uruchomienia StrykerJS i zawiera co najmniej statusy `Killed`, `Survived`, `NoCoverage` i `Timeout`, w kilku plikach o wyraźnie różnych wynikach.
- Raport i zrzuty da się odtworzyć jednym poleceniem każde.
- Zależności Strykera nie trafiają do aplikacji.

**Non-Goals:**
- Uruchamianie Strykera na kodzie samej aplikacji ani w CI.
- Testy wizualne (porównywanie zrzutów) i Playwright jako test runner.
- Zmiany w zachowaniu aplikacji.

## Decisions

### 1. Osobny projekt przykładowy z własnym `package.json`

```
examples/
  sample-report.json          <- wynik, commitowany
  sample-project/
    package.json              vitest 4, @stryker-mutator/core, @stryker-mutator/vitest-runner
    stryker.config.json
    vitest.config.ts
    src/
      cart.ts       + cart.test.ts        dobre testy, wysoki wynik
      discount.ts   + discount.test.ts    testy bez warunków brzegowych -> Survived
      shipping.ts                         bez testów -> NoCoverage
      retry.ts      + retry.test.ts       pętla -> Timeout po mutacji warunku/inkrementacji
      legacy.ts     + legacy.test.ts      // Stryker disable -> Ignored
```

Kod to prosta domena „koszyk w sklepie”, kilkadziesiąt linii na plik. Testy są celowo zróżnicowane, żeby raport wyglądał jak z prawdziwego projektu: jeden plik powyżej progu high, jeden między progami, jeden poniżej low i jeden bez ważnych mutantów.

- *Alternatywa: Stryker na kodzie samej aplikacji (`src/report`).* Ciekawy „dogfooding”, ale nasze testy są dokładne, więc raport miałby mało przeżywających mutantów i słabo pokazywałby aplikację. Doszłyby też zależności Strykera w głównym projekcie.
- *Alternatywa: Stryker w głównym `package.json`.* Odrzucona, bo te zależności nie są potrzebne do budowania ani testowania aplikacji.

Projekt przykładowy używa **Vitest 4**, nie 5 jak aplikacja. `@stryker-mutator/vitest-runner` 10.0.0 jest budowany na Vitest 4.1.x. Z Vitest 5 Stryker po cichu nie aktywuje mutantów: testy przechodzą na zmutowanym kodzie i prawie wszystko trafia do `Survived` (sprawdzone: 1.75% przy Vitest 5 i 71.93% przy Vitest 4 na tym samym kodzie). Aplikacja zostaje na Vitest 5. Po wydaniu Strykera obsługującego Vitest 5 można ujednolicić wersje.

Projekt przykładowy instaluje się osobno (`cd examples/sample-project && npm install`). Jego `node_modules/` jest ignorowany przez istniejący wzorzec `node_modules/` w `.gitignore`. Bez sprawdzarki TypeScript (`typescript-checker`) w Strykerze, żeby konfiguracja została prosta. Statusu `CompileError` w raporcie więc zwykle nie będzie, ale to akceptowalne.

### 2. Raport zapisywany od razu do `examples/sample-report.json` i oczyszczany

`stryker.config.json` ustawia `reporters: ["json", "clear-text", "progress"]` i `jsonReporter.fileName: "../sample-report.json"`. Skrypt `npm run mutation` w projekcie przykładowym uruchamia `stryker run`, a następnie małą funkcję Node (`scripts/sanitize-report.mjs` w projekcie przykładowym). Usuwa ona z raportu `projectRoot` i `system`, bo zawierają ścieżkę z dysku autora i informacje o maszynie. Formatuje też JSON z wcięciami, żeby diff był czytelny.

Pole `source` zostaje: raport ma być wierny oryginałowi, a pliki są małe.

### 3. Zrzuty przez bibliotekę `playwright` i API Vite, w jednym skrypcie Node

`npm run screenshots` = `vite build && node scripts/screenshots.mjs`. Skrypt:
1. uruchamia `preview()` z API Vite na wolnym porcie (bez osobnego procesu do zatrzymywania),
2. uruchamia Chromium przez `playwright`,
3. dla każdego ujęcia ustawia rozmiar okna i `colorScheme`, wczytuje raport przez `setInputFiles` na `<input type="file">`, czeka na selektory i zapisuje PNG,
4. zamyka przeglądarkę i serwer także w razie błędu (`finally`).

Ujęcia (`docs/screenshots/`):

| Plik | Okno | Motyw | Stan |
|---|---|---|---|
| `start.png` | 1280x720 | jasny | ekran startowy |
| `dashboard.png` | 1280x900 | jasny | wczytany raport |
| `file-details.png` | 1280x900 | jasny | rozwinięty `src/discount.ts` (mutanty Survived z zamianami; najsłabszy `shipping.ts` ma tylko 25 pozycji NoCoverage i gorzej ilustruje widok) |
| `dark.png` | 1280x900 | ciemny | wczytany raport z rozwiniętym plikiem |
| `mobile.png` | 390x844 | jasny | wczytany raport, cała strona |

- *Alternatywa: `@playwright/test`.* Odrzucona, bo to runner testów, a my nie piszemy testów, tylko generujemy obrazy.
- *Alternatywa: `vite` jako osobny proces + `wait-on`.* Więcej elementów i ryzyko „wiszących” procesów na Windows.
- Skrypt jest w `.mjs`, bez TypeScriptu, więc nie potrzebuje dodatkowych narzędzi do uruchomienia. `tsconfig.json` go nie obejmuje.

### 4. Ograniczenie głównego Vitest do `src/`

W `vite.config.ts` dochodzi `test.include: ['src/**/*.test.ts']`. Bez tego `npm test` w katalogu głównym uruchomiłby testy z `examples/sample-project` (w tym celowo słabe testy) i katalogi tymczasowe Strykera.

### 5. README

Sekcja „Zrzuty ekranu” zaraz po opisie: `dashboard.png` i `file-details.png` w pełnej szerokości, a `dark.png` i `mobile.png` w tabeli obok siebie. Sekcja „Przykładowy raport” wyjaśnia, skąd się wziął i jak go odtworzyć. W tabeli skryptów dochodzi `npm run screenshots` z informacją o `npx playwright install chromium`. Ścieżki obrazów są względne, więc działają na GitHubie.

## Risks / Trade-offs

- [Wynik Strykera zależy od wersji: nowe mutatory mogą zmienić liczby przy ponownym wygenerowaniu.] → Commitujemy wygenerowany raport. README mówi, że liczby mogą się nieznacznie różnić po odtworzeniu.
- [Status `Timeout` nie musi się pojawić, jeśli Stryker nie wygeneruje mutanta, który zapętla kod.] → `retry.ts` zawiera pętlę `while` z licznikiem, której mutacje (np. `<` → `<=`, `attempt++` → `attempt--`) zwykle kończą się przekroczeniem czasu. Jeśli mimo to `Timeout` się nie pojawi, dostosowujemy kod przykładowy, a nie raport.
- [Pobranie Chromium dla Playwright to około 150 MB i wymaga sieci.] → Jednorazowo i tylko dla osób odświeżających zrzuty. Aplikacja tego nie potrzebuje.
- [Rejestr npm na tej maszynie działa przez `http`.] → Bez wpływu na projekt, ale dotyczy nowych instalacji. Odnotowane wcześniej, decyzja należy do użytkownika.
- [PNG w repozytorium zwiększają jego rozmiar.] → 5 obrazów, każdy kilkadziesiąt–kilkaset kB. Akceptowalne.
- [Zrzuty mogą się różnić między systemami przez fonty systemowe.] → Akceptujemy. Zrzuty są ilustracją, a nie testem.
