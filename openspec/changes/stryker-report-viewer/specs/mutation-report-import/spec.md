# Spec Delta

## Purpose

Pozwala użytkownikowi wczytać plik raportu JSON ze Stryker Mutator w przeglądarce i sprawdza, czy plik nadaje się do analizy. Dzięki temu dalsze widoki pracują wyłącznie na poprawnych danych.

## ADDED Requirements

### Requirement: Wczytanie pliku przez upuszczenie lub wybór
Aplikacja SHALL umożliwiać wczytanie pliku raportu na dwa sposoby: przez przeciągnięcie i upuszczenie pliku na wyznaczony obszar oraz przez wybór pliku w systemowym oknie dialogowym.

#### Scenario: Upuszczenie pliku
- **WHEN** użytkownik upuszcza poprawny plik `report.json` na obszar wczytywania
- **THEN** aplikacja wczytuje raport i wyświetla jego podsumowanie

#### Scenario: Wybór pliku z dysku
- **WHEN** użytkownik klika obszar wczytywania i wybiera poprawny plik raportu
- **THEN** aplikacja wczytuje raport i wyświetla jego podsumowanie

### Requirement: Przetwarzanie wyłącznie lokalne
Aplikacja MUST przetwarzać zawartość raportu wyłącznie w przeglądarce użytkownika. Zawartość pliku MUST NOT być wysyłana na żaden serwer.

#### Scenario: Brak ruchu sieciowego z zawartością raportu
- **WHEN** użytkownik wczytuje plik raportu
- **THEN** żadne żądanie sieciowe nie zawiera zawartości pliku

### Requirement: Rozpoznanie poprawnego raportu
Aplikacja SHALL uznać plik za poprawny raport, gdy jest poprawnym JSON-em zawierającym obiekt `files`, a każdy wpis w `files` ma tablicę `mutants`. Każdy mutant ma `id`, `mutatorName`, `status` i `location` z polami `start.line` oraz `start.column`. Pola dodatkowe i opcjonalne (np. `testFiles`, `performance`, `framework`) SHALL być ignorowane bez błędu.

#### Scenario: Raport z polami opcjonalnymi
- **WHEN** użytkownik wczytuje raport zawierający `testFiles`, `performance` i `framework`
- **THEN** aplikacja wczytuje raport bez błędu

#### Scenario: Raport bez plików
- **WHEN** użytkownik wczytuje raport, w którym `files` jest pustym obiektem
- **THEN** aplikacja wyświetla informację, że raport nie zawiera mutantów

### Requirement: Komunikat o błędnym pliku
Gdy plik nie jest poprawnym JSON-em albo nie spełnia wymagań poprawnego raportu, aplikacja SHALL wyświetlić czytelny komunikat z przyczyną i pozostawić możliwość wczytania innego pliku. Aplikacja MUST NOT przerywać działania.

#### Scenario: Plik nie jest JSON-em
- **WHEN** użytkownik wczytuje plik, którego zawartość nie jest poprawnym JSON-em
- **THEN** aplikacja wyświetla komunikat, że plik nie jest poprawnym JSON-em

#### Scenario: JSON bez wymaganej struktury
- **WHEN** użytkownik wczytuje poprawny JSON bez pola `files`
- **THEN** aplikacja wyświetla komunikat, że plik nie wygląda na raport Strykera

#### Scenario: Ponowna próba po błędzie
- **WHEN** po komunikacie o błędzie użytkownik wczytuje poprawny raport
- **THEN** komunikat znika i aplikacja wyświetla podsumowanie raportu

### Requirement: Zastąpienie wczytanego raportu
Aplikacja SHALL pozwalać wczytać kolejny plik, gdy raport jest już wyświetlony. Nowy raport SHALL w całości zastąpić poprzedni.

#### Scenario: Wczytanie drugiego raportu
- **WHEN** wyświetlony jest raport A i użytkownik wczytuje raport B
- **THEN** aplikacja wyświetla wyłącznie dane z raportu B
