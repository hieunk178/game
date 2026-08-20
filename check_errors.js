const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`PAGE LOG: ${msg.type()} - ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`PAGE ERROR: ${err.toString()}`);
  });

  await page.goto('http://localhost:8080/index.html?t=202608192208', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
