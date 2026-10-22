// Generuje zrzuty ekranu do README: uruchamia zbudowaną aplikację (vite preview),
// wczytuje examples/sample-report.json w Chromium i zapisuje PNG do docs/screenshots/.
// Uruchamiaj przez `npm run screenshots` (najpierw buduje aplikację).
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const reportPath = fileURLToPath(new URL('../examples/sample-report.json', import.meta.url));
const outDir = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));

const DESKTOP = { width: 1280, height: 900 };
const EXPANDED_FILE = 'src/discount.ts';

const shots = [
  { name: 'start', viewport: { width: 1280, height: 720 }, colorScheme: 'light', load: false },
  { name: 'dashboard', viewport: DESKTOP, colorScheme: 'light', load: true, fullPage: true },
  { name: 'file-details', viewport: DESKTOP, colorScheme: 'light', load: true, expand: EXPANDED_FILE, fullPage: true },
  { name: 'dark', viewport: DESKTOP, colorScheme: 'dark', load: true, expand: EXPANDED_FILE, fullPage: true },
  { name: 'mobile', viewport: { width: 390, height: 844 }, colorScheme: 'light', load: true, expand: EXPANDED_FILE, fullPage: true, scale: 2 },
];

await mkdir(outDir, { recursive: true });

const server = await preview({ root, logLevel: 'silent', preview: { port: 4173, strictPort: false } });
const browser = await chromium.launch();

try {
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error('vite preview nie zwrócił adresu');

  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      colorScheme: shot.colorScheme,
      deviceScaleFactor: shot.scale ?? 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(url);
    await page.locator('.file-drop').waitFor();

    if (shot.load) {
      await page.locator('.file-drop input[type=file]').setInputFiles(reportPath);
      await page.locator('.summary').waitFor();
    }
    if (shot.expand) {
      await page.getByRole('button', { name: shot.expand }).click();
      await page.locator('.file-table__details').waitFor();
    }

    const file = `${outDir}${shot.name}.png`;
    await page.screenshot({ path: file, fullPage: shot.fullPage ?? false });
    console.log(`zapisano docs/screenshots/${shot.name}.png`);
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}
