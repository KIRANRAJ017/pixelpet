const { chromium } = require('C:/Users/HP/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8193;
const PROJECT_ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  const filePath = path.join(PROJECT_ROOT, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 500, height: 500 } });
  await page.goto(`http://127.0.0.1:${PORT}/dist/pet.html`);
  const el = await page.waitForSelector('.pet-interactive-area', { timeout: 10000 });
  const box = await el.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(cx - 70, cy, { steps: 5 });
    await page.waitForTimeout(45);
    await page.mouse.move(cx + 70, cy, { steps: 5 });
    await page.waitForTimeout(45);
  }
  await page.waitForTimeout(400);

  const confusedHtml = await page.evaluate(() => {
    return document.querySelector('.orbiting-stars-wrapper')?.outerHTML || 'NONE';
  });
  console.log('Confused HTML:', confusedHtml);
  await page.screenshot({ path: path.join(__dirname, 'captures/test_confused.png') });

  await page.waitForTimeout(1800);
  const angryHtml = await page.evaluate(() => {
    return document.querySelector('.angry-exclamation-wrapper')?.outerHTML || 'NONE';
  });
  console.log('Angry HTML:', angryHtml);
  await page.screenshot({ path: path.join(__dirname, 'captures/test_angry.png') });

  await page.mouse.up();
  await browser.close();
  server.close();
  process.exit(0);
});
