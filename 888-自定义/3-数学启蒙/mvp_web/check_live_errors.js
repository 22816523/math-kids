const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`[UNCAUGHT EXCEPTION] ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to live URL...');
  try {
    await page.goto('https://22816523.github.io/math-kids/baisu.html', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Page loaded. Waiting 3 seconds for runtime errors...');
    await page.waitForTimeout(3000);
    
    console.log('Clicking 认数字...');
    const tabs = await page.$$('.mode-tab');
    if (tabs.length > 0) {
       await tabs[0].click();
       await page.waitForTimeout(1000);
    }
  } catch(e) {
    console.log('Error during navigation/execution:', e.message);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
