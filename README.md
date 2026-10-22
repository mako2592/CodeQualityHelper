# Stryker Report Viewer

Prosta aplikacja webowa do przeglądania raportów JSON ze [Stryker Mutator](https://stryker-mutator.io/).
Wczytujesz plik raportu, a aplikacja pokazuje:

- mutation score z oceną względem progów z raportu (domyślnie low 60 / high 80),
- score dla pokrytego kodu i liczniki mutantów według statusu,
- tabelę plików od najniższego wyniku,
- po rozwinięciu pliku: listę mutantów, które przeżyły (`Survived`, `NoCoverage`).

Plik jest analizowany wyłącznie w przeglądarce i nie jest nigdzie wysyłany.

## Zrzuty ekranu

Podsumowanie raportu i tabela plików:

![Podsumowanie raportu i tabela plików](docs/screenshots/dashboard.png)

Rozwinięty plik z listą mutantów, które przeżyły:

![Rozwinięty plik z listą przeżywających mutantów](docs/screenshots/file-details.png)

| Tryb ciemny | Telefon |
|---|---|
| ![Widok w trybie ciemnym](docs/screenshots/dark.png) | <img src="docs/screenshots/mobile.png" alt="Widok na telefonie" width="300"> |

Zrzuty pokazują [przykładowy raport](#przykładowy-raport) z `examples/sample-report.json`.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz adres wypisany przez Vite (domyślnie http://localhost:5173) i upuść plik raportu na stronę.
Na start możesz użyć przykładowego raportu `examples/sample-report.json`.

## Skąd wziąć raport JSON

Włącz reporter `json` w konfiguracji Strykera, np. w `stryker.config.json`:

```json
{
  "reporters": ["html", "clear-text", "progress", "json"]
}
```

Po uruchomieniu `npx stryker run` raport znajdziesz w `reports/mutation/mutation.json`.

## Przykładowy raport

`examples/sample-report.json` to prawdziwy raport StrykerJS wygenerowany na małym projekcie
`examples/sample-project/` (koszyk w sklepie). Testy są w nim celowo zróżnicowane, żeby w raporcie
pojawiły się różne statusy mutantów i pliki o różnych wynikach. Z raportu usunięto pola
`projectRoot` i `system`, które opisują maszynę, na której go wygenerowano.

Aby wygenerować raport ponownie:

```bash
cd examples/sample-project
npm install
npm run mutation
```

Liczby mogą się nieznacznie różnić między wersjami Strykera.

> Projekt przykładowy używa Vitest 4, bo `@stryker-mutator/vitest-runner` 10 nie działa jeszcze
> z Vitest 5: nie zgłasza błędu, ale nie aktywuje mutantów, więc prawie wszystkie wychodzą jako `Survived`.

## Skrypty

| Polecenie | Opis |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd buildu produkcyjnego |
| `npm test` | testy jednostkowe (Vitest) |
| `npm run typecheck` | sprawdzenie typów (`tsc --noEmit`) |
| `npm run screenshots` | buduje aplikację i zapisuje zrzuty ekranu do `docs/screenshots/` (Playwright) |

Przed pierwszym `npm run screenshots` zainstaluj przeglądarkę dla Playwright:

```bash
npx playwright install chromium
```

## Jak powstała ta aplikacja

Aplikacja powstała w Claude Code z użyciem [OpenSpec](https://github.com/Fission-AI/OpenSpec) 1.14.3
(schemat `spec-driven`). Każda zmiana zaczynała się od planu w katalogu `openspec/`, a dopiero potem był kod:

```
/opsx:explore  -->  /opsx:propose  -->  /opsx:apply  -->  /opsx:archive
 (rozmowa,           (proposal, specs,   (kod według      (specs do openspec/specs,
  bez kodu)           design, tasks)      tasks.md)        change do archiwum)
```

| Change | Co wniósł |
|---|---|
| [`stryker-report-viewer`](openspec/changes/archive/2026-10-22-stryker-report-viewer/) | aplikacja, specyfikacje `mutation-report-import` i `mutation-report-dashboard`, 15 zadań |
| [`sample-report-and-screenshots`](openspec/changes/archive/2026-10-22-sample-report-and-screenshots/) | przykładowy raport, zrzuty ekranu, układ mobilny, 9 zadań |

Użyte komendy (w Claude Code):

```
/opsx:explore <pomysł>              # rozmowa o zakresie i technologii
/opsx:propose <nazwa-change>        # proposal, specs, design i tasks w jednym kroku
/opsx:apply                         # implementacja zadań z tasks.md
/opsx:archive                       # synchronizacja specyfikacji i przeniesienie do archiwum
```

**Jak czytać `openspec/`:** zacznij od `openspec/specs/`, gdzie jest opis tego, co aplikacja robi teraz.
Uzasadnienia są w archiwum: w każdym change czytaj kolejno `proposal.md`, `design.md` i `tasks.md`.
Z CLI: `openspec list --specs` oraz `openspec show mutation-report-dashboard --type spec`.

Dwie decyzje warte uwagi:

- **`skip_specs`:** change z przykładowym raportem i zrzutami nie zmienia zachowania aplikacji,
  więc nie ma specyfikacji. OpenSpec pozwala to jawnie zaznaczyć w `.openspec.yaml`.
- **Vitest 4 w projekcie przykładowym:** niezgodność Strykera z Vitest 5 wyszła dopiero w trakcie
  `/opsx:apply`. Implementacja została wstrzymana, a decyzja trafiła do `design.md` tego change.
