// Рендерит scripts/og/og.html в public/og.png (1200×630) через Playwright.
// Нужен установленный playwright: npx playwright ... или глобальный пакет.
const path = require('path');
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, 'og.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.resolve(__dirname, '../../public/og.png') });
  await browser.close();
  console.log('public/og.png готов');
})();
