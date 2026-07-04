const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Taking screenshot for Home...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'public/home.png' });

  console.log('Taking screenshot for Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'public/dashboard.png' });

  console.log('Taking screenshot for Explore...');
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'public/explore.png' });

  console.log('Taking screenshot for Mentor...');
  await page.goto('http://localhost:3000/mentor/1', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'public/mentor.png' });

  await browser.close();
  console.log('Done!');
})();
