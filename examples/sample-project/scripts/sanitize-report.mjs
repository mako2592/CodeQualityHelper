// Usuwa z raportu Strykera pola zdradzające lokalne środowisko
// (ścieżkę projektu na dysku i informacje o maszynie) i zapisuje go z wcięciami.
import { readFileSync, writeFileSync } from 'node:fs';

const reportPath = new URL('../../sample-report.json', import.meta.url);

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
delete report.projectRoot;
delete report.system;

writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`Oczyszczono raport: ${reportPath.pathname}`);
