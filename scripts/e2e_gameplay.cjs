const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.env.STUPUL_URL || 'http://127.0.0.1:5174/';
const SHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];

function record(test, pass, evidence) {
  results.push({ test, pass, evidence });
  console.log(`${pass ? 'PASS' : 'FAIL'} - ${test}${evidence ? ' :: ' + evidence : ''}`);
}

async function readState(page) {
  return await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('stupul_game_save_v1_1');
      return raw ? JSON.parse(raw).state : null;
    } catch { return null; }
  });
}

async function clickByText(page, text) {
  return await page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent || '').trim().includes(t));
    if (btn) { btn.click(); return true; }
    return false;
  }, text);
}

async function clickByTitle(page, title) {
  return await page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.title || '').includes(t));
    if (btn) { btn.click(); return true; }
    return false;
  }, title);
}

async function closeTutorial(page) {
  await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (!modal) return;
    const btn = Array.from(modal.querySelectorAll('button')).find(b => !(b.textContent || '').trim() && !b.title);
    if (btn) btn.click();
  });
  await delay(300);
}

async function clickTile(page, gx, gy) {
  const pos = await page.evaluate(([x, y]) => {
    const canvas = document.querySelector('canvas');
    const r = canvas.getBoundingClientRect();
    const tileW = 64, tileH = 32;
    const offX = r.width / 2, offY = r.height / 5;
    const sx = (x - y) * (tileW / 2) + offX;
    const sy = (x + y) * (tileH / 2) + offY;
    return { x: r.left + sx, y: r.top + sy };
  }, [gx, gy]);
  await page.mouse.click(pos.x, pos.y);
  await delay(300);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,800'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(800);

  await page.screenshot({ path: path.join(SHOT_DIR, '01_start.png') });

  // TEST E
  let nav = true;
  for (let i = 0; i < 4; i++) {
    nav = (await clickByText(page, 'Următorul')) && nav;
    await delay(150);
  }
  const startClicked = await clickByText(page, 'Începe Jocul');
  await delay(2500);
  const t0 = (await readState(page)) || {};
  const tutGone = await page.evaluate(() => !document.body.innerText.includes('Ghidul Pionierului'));
  record('TEST E: tutorial 5 pași + „Începe Jocul" pornește simularea', nav && startClicked && (t0.tick > 0) && tutGone, `startClicked=${startClicked}, tick=${t0.tick}, tutorialGone=${tutGone}`);

  await clickByTitle(page, 'Pauză').catch(() => {});
  await delay(200);

  await page.screenshot({ path: path.join(SHOT_DIR, '02_initial_city.png') });

  // TEST A
  const sA0 = await readState(page);
  await clickByText(page, 'Muncă');
  await delay(300);
  const woodcut = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => (b.textContent || '').includes('Muncește'));
    for (const btn of btns) {
      const card = btn.closest('.frontier-panel') || btn.parentElement;
      if (card && (card.textContent || '').includes('Tăiere Lemne')) { btn.click(); return true; }
    }
    return false;
  });
  await delay(400);
  await clickByText(page, 'Închide');
  await delay(200);
  const sA1 = await readState(page);
  const materialsGained = sA1.resources.materials - sA0.resources.materials;

  await clickByText(page, 'Casă');
  await delay(200);
  await clickTile(page, 4, 4);
  await delay(400);
  const sA2 = await readState(page);
  const houseBuilt = sA2.grid[4][4].building === 'house';
  const materialsSpent = sA1.resources.materials - sA2.resources.materials;
  record('TEST A: lemn +15, construcție Casă pe parcelă', woodcut && materialsGained >= 15 && houseBuilt && materialsSpent >= 30, `materialsGained=${materialsGained}, houseBuilt=${houseBuilt}, materialsSpent=${materialsSpent}`);

  await page.screenshot({ path: path.join(SHOT_DIR, '03_first_building.png') });

  // TEST B
  const sB0 = await readState(page);
  await clickByText(page, 'Ia Parcelă');
  await delay(200);
  await clickTile(page, 5, 5);
  await delay(400);
  const sB1 = await readState(page);
  const ownerSet = sB1.grid[5][5].ownerAccountId === 'cetatean_local';
  const creditsSpent = sB0.resources.virtualCredits - sB1.resources.virtualCredits;

  await clickTile(page, 5, 5);
  await delay(400);
  const sB2 = await readState(page);
  const noChange = sB2.resources.virtualCredits === sB1.resources.virtualCredits;
  record('TEST B: parcelă (-50c, proprietar) + respingere dublă', ownerSet && creditsSpent >= 50 && noChange, `ownerSet=${ownerSet}, creditsSpent=${creditsSpent}, duplicateRejected=${noChange}`);

  // TEST C: 10 ticks + play/pause stability
  const sC0 = await readState(page);
  for (let i = 0; i < 10; i++) { await clickByTitle(page, 'Avansează un pas'); await delay(120); }
  await delay(300);
  const sC1 = await readState(page);
  const ticksAdvanced = sC1.tick - sC0.tick;

  await clickByTitle(page, 'Pornire Simulare');
  await delay(2500);
  await clickByTitle(page, 'Pauză');
  await delay(200);
  const sC2 = await readState(page);
  await delay(2500);
  const sC3 = await readState(page);
  const stableAfterPause = sC3.tick === sC2.tick;
  record('TEST C: 10 tick-uri + Play/Pauză stabilă', ticksAdvanced >= 10 && stableAfterPause, `ticksAdvanced=${ticksAdvanced}, stableAfterPause=${stableAfterPause}`);

  await page.screenshot({ path: path.join(SHOT_DIR, '04_evolved_city.png') });

  // TEST D: save + reload
  const sD0 = await readState(page);
  await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
  await delay(800);
  await closeTutorial(page);
  const sD1 = await readState(page);
  const restored = sD1.tick === sD0.tick && sD1.grid[4][4].building === 'house' && sD1.grid[5][5].ownerAccountId === 'cetatean_local';
  record('TEST D: salvare + reîncărcare pagină', restored, `tick=${sD1.tick} (was ${sD0.tick}), house=${sD1.grid[4][4].building}, owner=${sD1.grid[5][5].ownerAccountId}`);

  // TEST G: resolutions
  const layout = async (w, h, label) => {
    await page.setViewport({ width: w, height: h });
    await delay(600);
    const info = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      const r = c ? c.getBoundingClientRect() : null;
      const btns = Array.from(document.querySelectorAll('button')).length;
      return { canvasW: r ? Math.round(r.width) : 0, canvasH: r ? Math.round(r.height) : 0, buttons: btns, hasPixels: c ? (() => { try { return c.toDataURL('image/png').length > 20000; } catch { return false; } })() : false };
    });
    const ok = info.canvasW >= 300 && info.canvasH >= 250 && info.hasPixels && info.buttons >= 10;
    record(`TEST G: rezoluție ${label} (${w}x${h})`, ok, `canvas=${info.canvasW}x${info.canvasH}, pixels=${info.hasPixels}, buttons=${info.buttons}`);
    await page.screenshot({ path: path.join(SHOT_DIR, `05_${label}.png`) });
    return ok;
  };
  await layout(1280, 800, 'desktop');
  await layout(360, 740, 'mobile360');

  await browser.close();
  console.log('\n=== SUMMARY ===');
  console.log('console errors:', consoleErrors.length ? consoleErrors : 'none');
  const failed = results.filter(r => !r.pass);
  console.log(`${results.length - failed.length}/${results.length} PASS`);
  if (failed.length) console.log('FAILED:', failed.map(f => f.test).join(' | '));
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
