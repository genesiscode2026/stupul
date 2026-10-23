const puppeteer = require('puppeteer-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.env.STUPUL_URL || 'http://127.0.0.1:5174/';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,800'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + err.message));

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 }).catch(e => console.log('goto warn:', e.message));
  await new Promise(r => setTimeout(r, 1500));

  const diag = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const root = document.getElementById('root');
    const bodyText = document.body.innerText.slice(0, 600);
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: (b.textContent || '').trim().slice(0, 40),
      title: b.title || '',
      rect: (() => { const r = b.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
    })).filter(b => b.text || b.title);
    const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
    const modal = document.querySelector('.fixed.inset-0');
    return {
      rootSize: root ? { w: root.clientWidth, h: root.clientHeight } : null,
      canvas: canvas ? {
        clientW: canvas.clientWidth, clientH: canvas.clientHeight,
        attrW: canvas.width, attrH: canvas.height,
        rect: canvasRect ? { x: Math.round(canvasRect.x), y: Math.round(canvasRect.y), w: Math.round(canvasRect.width), h: Math.round(canvasRect.height) } : null,
        hasPixels: (() => { try { return canvas.toDataURL('image/png').length > 20000; } catch { return false; } })(),
      } : null,
      modalFixedOverlayPresent: !!modal,
      buttonCount: buttons.length,
      buttons,
      bodyText,
    };
  });

  console.log(JSON.stringify(diag, null, 2));
  console.log('\n=== CONSOLE ERRORS (' + consoleErrors.length + ') ===');
  consoleErrors.slice(0, 20).forEach(e => console.log(' -', e));

  await page.screenshot({ path: '/tmp/stupul_diag.png', fullPage: false });
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
