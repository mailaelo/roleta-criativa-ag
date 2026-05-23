const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 800});
  await page.goto('http://localhost:5173/');
  // Wait for network idle or 3 seconds
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({path: '/Users/mailasouza/.gemini/antigravity-ide/brain/16e8581f-05ff-44f5-a545-0214af36750c/screenshot.png'});
  await browser.close();
})();
