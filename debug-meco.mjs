import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  console.log('Launching browser with saved auth...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'meco_auth.json' });
  const page = await context.newPage();

  console.log('Navigating to https://app.meco.app/inbox...');
  await page.goto('https://app.meco.app/inbox', { waitUntil: 'load' });
  
  await page.waitForTimeout(5000);
  
  console.log('Current URL after 5 seconds:', page.url());
  
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('--- Page Text Snippet ---');
  console.log(pageText.slice(0, 1000));
  console.log('-------------------------');
  
  await browser.close();
})();
