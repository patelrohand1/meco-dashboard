import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser for manual login...');
  // Launch visible browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to Meco
  await page.goto('https://meco.app/');
  console.log('===========================================================');
  console.log('Please log in to your Meco account in the browser window.');
  console.log('Once you are fully logged in and can see your newsletters,');
  console.log('return to this terminal and press ENTER to save your session.');
  console.log('===========================================================');
  
  // Wait for user to manually signal completion
  process.stdin.once('data', async () => {
      console.log('Saving session state...');
      await context.storageState({ path: 'meco_auth.json' });
      console.log('Session saved to meco_auth.json! You can now close this terminal and run the dashboard.');
      await browser.close();
      process.exit(0);
  });
})();
