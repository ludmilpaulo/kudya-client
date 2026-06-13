import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.resolve(__dirname, 'tiktok-login-demo.mp4');

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

console.log('Opening TikTok Developer Portal — log in if prompted (90s)...');
await page.goto('https://developers.tiktok.com/app/7646571159442327559/pending#app_review', {
  waitUntil: 'domcontentloaded',
  timeout: 120000,
});

await page.waitForTimeout(90000);

await page.evaluate(() => {
  window.location.hash = '#app_review';
  document.querySelector('a[href*="app_review"]')?.click();
});
await page.waitForTimeout(3000);

const uploadBtn = page.getByRole('button', { name: 'Upload' }).first();
if (await uploadBtn.isVisible().catch(() => false)) {
  await uploadBtn.click();
  await page.waitForTimeout(1000);
}

const fileInput = page.locator('input[type="file"]').filter({ has: page.locator('[accept*="video"]') });
const videoInput = page.locator('input[accept*="video"]');
await videoInput.waitFor({ state: 'attached', timeout: 30000 });
await videoInput.setInputFiles(videoPath);
console.log('Uploaded:', videoPath);

await page.waitForTimeout(10000);
await browser.close();
