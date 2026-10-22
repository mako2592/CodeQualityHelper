# Proposal

## Why

Repozytorium zawiera katalog `openspec/` z głównymi specyfikacjami i archiwum zmian, ale README nie wyjaśnia, skąd się wziął ani jak go czytać. Kto przegląda repozytorium, nie wie, że cała aplikacja powstała w cyklu OpenSpec (explore → propose → apply → archive) i że uzasadnienia decyzji leżą w archiwum.

## What Changes

- Nowa sekcja „Jak powstała ta aplikacja” na końcu `README.md`, po „Skryptach”, około 30–40 linii, dla osoby, która chce zrozumieć repozytorium:
  - 1–2 zdania kontekstu: Claude Code + OpenSpec 1.14.3, schemat spec-driven,
  - diagram cyklu explore → propose → apply → archive,
  - tabela historii zmian (`stryker-report-viewer`, `sample-report-and-screenshots`) z linkami do archiwum,
  - użyte komendy `/opsx:*` z ogólnymi opisami w miejsce treści (np. `<pomysł>`), bez cytowania promptów,
  - „jak czytać `openspec/`”: najpierw `openspec/specs/`, potem archiwum (proposal → design → tasks), plus 2 komendy CLI do podglądu,
  - dwie decyzje warte uwagi: `skip_specs` dla zmian bez wpływu na zachowanie oraz Vitest 4 w projekcie przykładowym wykryty w trakcie apply.
- Poza zakresem: instrukcja instalacji i nauka OpenSpec od podstaw (zamiast tego link do projektu OpenSpec), osobny plik w `docs/`, prawdziwe prompty, opis `openspec init` jako kroku wykonanego w tym projekcie (katalog `openspec/` już istniał).

## Capabilities

### New Capabilities

Brak. Zmiana dotyczy wyłącznie dokumentacji i nie zmienia zachowania aplikacji, dlatego ustawia `skip_specs: true`.

### Modified Capabilities

Brak.

## Impact

- Tylko `README.md`. Bez zmian w kodzie, zależnościach i konfiguracji.
- Ta zmiana sama przejdzie przez archiwum, ale w tabeli historii nie będzie jej opisywać, żeby README nie wymagało aktualizacji po archiwizacji.
