# Spec Delta

## Purpose

Przedstawia wyniki testów mutacyjnych z wczytanego raportu Strykera w formie prostego podsumowania. Użytkownik szybko widzi ogólny wynik, najsłabsze pliki i mutanty, które przeżyły.

## ADDED Requirements

### Requirement: Klasyfikacja statusów mutantów
Aplikacja SHALL klasyfikować mutanty według statusu. Wykryte to `Killed` i `Timeout`. Niewykryte to `Survived` i `NoCoverage`. Ważne to suma wykrytych i niewykrytych. Statusy `CompileError`, `RuntimeError`, `Ignored` i `Pending` SHALL być liczone osobno i MUST NOT wpływać na mutation score.

#### Scenario: Błędy kompilacji nie zmieniają wyniku
- **WHEN** raport zawiera 8 mutantów `Killed`, 2 `Survived` i 5 `CompileError`
- **THEN** aplikacja liczy 10 mutantów ważnych, a 5 `CompileError` pokazuje tylko w licznikach statusów

### Requirement: Mutation score
Aplikacja SHALL wyliczać mutation score jako procent wykrytych mutantów wśród ważnych, zaokrąglony do dwóch miejsc po przecinku. Gdy nie ma ważnych mutantów, aplikacja SHALL zamiast liczby pokazać „n/d”.

#### Scenario: Wyliczenie wyniku
- **WHEN** raport zawiera 6 `Killed`, 1 `Timeout`, 2 `Survived` i 1 `NoCoverage`
- **THEN** aplikacja pokazuje mutation score 70.00%

#### Scenario: Brak ważnych mutantów
- **WHEN** wszystkie mutanty w raporcie mają status `CompileError` lub `Ignored`
- **THEN** aplikacja pokazuje mutation score jako „n/d”

### Requirement: Score dla pokrytego kodu
Aplikacja SHALL wyliczać score dla pokrytego kodu jako procent wykrytych mutantów wśród sumy wykrytych i `Survived`, czyli bez `NoCoverage`, z dwoma miejscami po przecinku. Gdy ta suma wynosi zero, aplikacja SHALL pokazać „n/d”.

#### Scenario: Wyliczenie score dla pokrytego kodu
- **WHEN** raport zawiera 6 `Killed`, 1 `Timeout`, 2 `Survived` i 1 `NoCoverage`
- **THEN** aplikacja pokazuje score dla pokrytego kodu 77.78%

### Requirement: Ocena względem progów
Aplikacja SHALL oznaczać mutation score jako dobry, gdy wynik jest większy lub równy `thresholds.high`. Gdy jest większy lub równy `thresholds.low`, ale mniejszy od `high`, SHALL oznaczać go jako ostrzegawczy. Poniżej `thresholds.low` SHALL oznaczać go jako zły. Gdy raport nie zawiera `thresholds`, aplikacja SHALL przyjąć `high` = 80 i `low` = 60. Wartości progów SHALL być widoczne obok wyniku.

#### Scenario: Wynik pomiędzy progami
- **WHEN** mutation score wynosi 70.00%, a progi to `high` 80 i `low` 60
- **THEN** wynik jest oznaczony jako ostrzegawczy, a obok widać oba progi

#### Scenario: Wynik równy progowi wysokiemu
- **WHEN** mutation score wynosi 80.00%, a `thresholds.high` to 80
- **THEN** wynik jest oznaczony jako dobry

#### Scenario: Brak progów w raporcie
- **WHEN** raport nie zawiera `thresholds`, a mutation score wynosi 55.00%
- **THEN** wynik jest oznaczony jako zły względem domyślnego progu `low` 60

### Requirement: Podsumowanie raportu
Aplikacja SHALL wyświetlać podsumowanie całego raportu. Składa się na nie mutation score z oceną, score dla pokrytego kodu, łączna liczba mutantów oraz liczba mutantów dla każdego statusu występującego w raporcie.

#### Scenario: Liczniki statusów
- **WHEN** raport zawiera 120 `Killed`, 30 `Survived`, 12 `NoCoverage` i 4 `Timeout`
- **THEN** podsumowanie pokazuje 166 mutantów łącznie oraz osobny licznik dla każdego z tych czterech statusów

### Requirement: Tabela plików
Aplikacja SHALL wyświetlać tabelę z jednym wierszem na plik z raportu. Każdy wiersz pokazuje ścieżkę pliku, liczbę mutantów, liczbę mutantów `Survived` i `NoCoverage` oraz mutation score pliku z oceną względem progów. Wiersze SHALL być posortowane rosnąco według mutation score. Pliki z wynikiem „n/d” trafiają na koniec, a przy równym wyniku decyduje kolejność alfabetyczna ścieżki.

#### Scenario: Najsłabszy plik na górze
- **WHEN** raport zawiera `src/a.ts` ze score 95% i `src/b.ts` ze score 55%
- **THEN** pierwszym wierszem tabeli jest `src/b.ts`

#### Scenario: Plik bez ważnych mutantów
- **WHEN** jeden z plików ma wyłącznie mutanty `Ignored`
- **THEN** jego wiersz pokazuje score „n/d” i znajduje się na końcu tabeli

### Requirement: Lista mutantów, które przeżyły
Rozwinięcie wiersza pliku SHALL pokazywać mutanty tego pliku ze statusem `Survived` lub `NoCoverage`, posortowane według linii, a potem kolumny. Przy każdym mutancie widać lokalizację w formacie `linia:kolumna`, nazwę mutatora, status i zamianę (`replacement`), jeśli raport ją zawiera. Ponowne kliknięcie SHALL zwijać listę.

#### Scenario: Rozwinięcie pliku
- **WHEN** użytkownik rozwija wiersz pliku z mutantem `Survived` w linii 12, kolumnie 5, mutatorem `ArithmeticOperator` i zamianą `a - b`
- **THEN** pod wierszem widać pozycję `12:5`, `ArithmeticOperator`, `Survived` oraz `a - b`

#### Scenario: Plik bez przeżywających mutantów
- **WHEN** użytkownik rozwija wiersz pliku, w którym wszystkie mutanty są wykryte
- **THEN** zamiast listy widać informację, że w pliku nie ma przeżywających mutantów

#### Scenario: Mutant bez zamiany
- **WHEN** mutant `Survived` nie ma pola `replacement`
- **THEN** jego pozycja na liście wyświetla się bez zamiany i bez błędu
