const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/HP/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const PORT = 8192;
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Simple static file server
function startServer() {
  const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/website/index.html';

    const filePath = path.join(PROJECT_ROOT, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[Static Server] Running on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function recordSession() {
  const server = await startServer();
  const capturesDir = path.resolve(__dirname, 'captures');
  if (!fs.existsSync(capturesDir)) {
    fs.mkdirSync(capturesDir, { recursive: true });
  }

  console.log('[Playwright] Launching Google Chrome...');
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true
  });

  // 1080x1080 high-def square recording canvas
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1080 },
    recordVideo: {
      dir: capturesDir,
      size: { width: 1080, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    console.log('[Playwright] Loading Pixel Pet Website & Playground...');
    await page.goto(`http://127.0.0.1:${PORT}/website/index.html`, { waitUntil: 'networkidle' });
    await sleep(1000);

    // Center on hero playground
    await page.evaluate(() => {
      const stage = document.getElementById('heroPlayground');
      if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await sleep(1500);

    const petBtn = await page.$('#heroPetBtn');
    if (petBtn) {
      console.log('[Action] Loving clicks on pet...');
      const box = await petBtn.boundingBox();
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;

      // Click 1 - Happy
      await page.mouse.move(cx, cy, { steps: 15 });
      await sleep(300);
      await page.mouse.click(cx, cy);
      await sleep(1500);

      // Click 2 - Heart particles
      await page.mouse.click(cx, cy);
      await sleep(1800);
    }

    // Adopt Neko
    console.log('[Action] Adopting Neko the Cat...');
    const nekoCard = await page.$('.adopt-card[data-character="neko"]');
    if (nekoCard) {
      await nekoCard.click();
      await sleep(2200);
    }

    // Adopt Boo
    console.log('[Action] Adopting Boo the Ghost...');
    const booCard = await page.$('.adopt-card[data-character="boo"]');
    if (booCard) {
      await booCard.click();
      await sleep(2200);
    }

    // Back to Mochi
    console.log('[Action] Back to Mochi...');
    const mochiCard = await page.$('.adopt-card[data-character="mochi"]');
    if (mochiCard) {
      await mochiCard.click();
      await sleep(1500);
    }

    // Now record the standalone desktop pet with the full real Shake Reaction (Confused -> Angry -> Normal)
    console.log('[Playwright] Loading Desktop Pet Component for Shake Reaction...');
    await page.goto(`http://127.0.0.1:${PORT}/dist/pet.html`, { waitUntil: 'networkidle' });

    // Inject nice background styling so it looks like a cozy desktop
    await page.evaluate(() => {
      document.documentElement.style.background = '#18191E';
      document.body.style.backgroundColor = '#18191E';
      document.body.style.background = 'radial-gradient(circle at center, #262838 0%, #12131A 100%)';
      document.body.style.display = 'flex';
      document.body.style.alignItems = 'center';
      document.body.style.justifyContent = 'center';
      document.body.style.height = '100vh';
      document.body.style.margin = '0';
      const root = document.getElementById('root');
      if (root) {
        root.style.width = '100vw';
        root.style.height = '100vh';
        root.style.display = 'flex';
        root.style.alignItems = 'center';
        root.style.justifyContent = 'center';
      }
    });
    await sleep(1500);

    const interactiveArea = await page.$('.pet-interactive-area');
    if (interactiveArea) {
      const box = await interactiveArea.boundingBox();
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;

      console.log(`[Action] Moving to desktop pet at (${cx}, ${cy})...`);
      await page.mouse.move(cx, cy, { steps: 20 });
      await sleep(600);

      // Gentle click test
      await page.mouse.click(cx, cy);
      await sleep(1800);

      // Grab and drag smoothly
      console.log('[Action] Grabbing and dragging pet...');
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await sleep(200);

      // Drag slightly right
      await page.mouse.move(cx + 60, cy - 30, { steps: 10 });
      await sleep(200);

      // RAPID SHAKE GESTURE: left -> right -> left -> right
      console.log('[Action] Rapidly shaking pet to trigger Confused -> Angry reaction...');
      const curX = cx + 60;
      const curY = cy - 30;

      // Fast back-and-forth strokes with 45ms per reversal to register distinct timestamps
      for (let s = 0; s < 5; s++) {
        await page.mouse.move(curX - 70, curY, { steps: 6 });
        await sleep(45);
        await page.mouse.move(curX + 70, curY, { steps: 6 });
        await sleep(45);
      }

      console.log('[Reaction] Shaking complete! Waiting for Confused state (orbiting stars)...');
      // Check if reaction triggered
      const hasConfused = await page.evaluate(() => {
        return !!document.querySelector('.orbiting-stars-wrapper');
      });
      console.log('[Reaction] Orbiting stars present in DOM?:', hasConfused);

      // Hold drag for 1.2s while confused
      await sleep(1200);

      // Release mouse
      console.log('[Action] Releasing mouse cursor...');
      await page.mouse.up();

      // Wait remaining confused phase (0.8s) + Angry phase (1.0s) + return to normal
      console.log('[Reaction] Observing Confused -> Angry (red !!!) -> Normal return...');
      await sleep(1000);
      const hasAngry = await page.evaluate(() => {
        return !!document.querySelector('.angry-exclamation-wrapper');
      });
      console.log('[Reaction] Angry exclamation marks present in DOM?:', hasAngry);

      await sleep(2500);

      // Feed pet snack
      console.log('[Action] Feeding treat to pet...');
      await page.evaluate(() => {
        // Trigger feeding animation
        const event = new MouseEvent('contextmenu', { clientX: 540, clientY: 540 });
        document.querySelector('.pet-window-root')?.dispatchEvent(event);
      });
      await sleep(800);

      // Click feed from menu if present or trigger click
      const feedItem = await page.$('.menu-item');
      if (feedItem) {
        await feedItem.click();
      } else {
        await page.mouse.click(cx, cy);
      }
      await sleep(2500);

      // Final peaceful idle & cozy nap
      console.log('[Action] Final peaceful chill...');
      await sleep(2000);
    }
  } catch (err) {
    console.error('[Error during capture]:', err);
  } finally {
    console.log('[Playwright] Closing page and saving video...');
    const video = page.video();
    await context.close();
    await browser.close();
    server.close();

    if (video) {
      const videoPath = await video.path();
      console.log(`[Success] Raw gameplay video recorded to: ${videoPath}`);
      return videoPath;
    }
  }
}

recordSession().then((p) => {
  console.log('Capture script finished.');
  process.exit(0);
}).catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
