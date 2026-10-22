# Tasks

## 1. Sekcja w README

- [x] 1.1 Dopisać na końcu `README.md` sekcję „Jak powstała ta aplikacja” zgodnie z proposal.md: kontekst (Claude Code + OpenSpec 1.14.3, spec-driven) z linkiem do projektu OpenSpec, diagram cyklu w bloku kodu, tabela dwóch zarchiwizowanych change z linkami do `openspec/changes/archive/2026-10-22-*`, użyte komendy `/opsx:*` z ogólnymi placeholderami, podsekcja „Jak czytać `openspec/`” z `openspec list --specs` i `openspec show mutation-report-dashboard --type spec`, dwie decyzje (`skip_specs`, Vitest 4). Weryfikacja: sekcja ma około 30–40 linii, nie zawiera cytatów promptów ani opisu `openspec init` jako wykonanego kroku.
- [x] 1.2 Sprawdzić odnośniki i komendy z sekcji: każda ścieżka względna w README istnieje w repozytorium, link do projektu OpenSpec prowadzi na właściwą stronę, a obie komendy CLI działają i zwracają opisany wynik. Weryfikacja: skrypt sprawdzający ścieżki z README nie zgłasza brakujących plików, a komendy zwracają listę 2 specyfikacji i treść `mutation-report-dashboard`.

## Workflow follow-up

- Po przeglądzie zarchiwizować change przez `/opsx:archive` (bez synchronizacji specyfikacji, bo change ma `skip_specs`).
