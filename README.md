# Stryker Report Viewer

Prosta aplikacja webowa do przeglądania raportów JSON ze [Stryker Mutator](https://stryker-mutator.io/).
Wczytujesz plik raportu, a aplikacja pokazuje:

- mutation score z oceną względem progów z raportu (domyślnie low 60 / high 80),
- score dla pokrytego kodu i liczniki mutantów według statusu,
- tabelę plików od najniższego wyniku,
- po rozwinięciu pliku: listę mutantów, które przeżyły (`Survived`, `NoCoverage`).

Plik jest analizowany wyłącznie w przeglądarce i nie jest nigdzie wysyłany.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz adres wypisany przez Vite (domyślnie http://localhost:5173) i upuść plik raportu na stronę.

## Skąd wziąć raport JSON

Włącz reporter `json` w konfiguracji Strykera, np. w `stryker.config.json`:

```json
{
  "reporters": ["html", "clear-text", "progress", "json"]
}
```

Po uruchomieniu `npx stryker run` raport znajdziesz w `reports/mutation/mutation.json`.

## Skrypty

| Polecenie | Opis |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd buildu produkcyjnego |
| `npm test` | testy jednostkowe (Vitest) |
| `npm run typecheck` | sprawdzenie typów (`tsc --noEmit`) |
