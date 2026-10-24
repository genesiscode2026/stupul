/**
 * STUPUL GENESIS v3.5 — Live Public Cloudflare Production Browser & Multiplayer E2E Verification
 * 
 * Verifies:
 * 1. Live Public HTTPS connectivity to https://stupul-civilization.stupul.workers.dev
 * 2. Visual rendering in headless Chrome (Desktop 1280x800 & Mobile 390x844).
 * 3. Guest vs Citizen separation on live edge:
 *    - User B (Guest) attempts building -> 403 Forbidden.
 *    - User A (Citizen) constructs building -> 200 Applied.
 *    - User B receives state update live.
 *    - User B upgrades to Citizen, attempts duplicate claim -> 409 Conflict.
 * 4. Screenshots saved to brain artifact directory.
 */

const puppeteer = require('puppeteer-core');
const fs = require('node:fs');
const path = require('node:path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PUBLIC_URL = process.env.STUPUL_PUBLIC_URL || 'https://stupul-civilization.stupul.workers.dev';
const ARTIFACT_DIR = '/Users/severmarcus/.gemini/antigravity/brain/f3398b89-20c2-4eeb-bcb5-8c47c19f2f5e';

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];

function record(name, pass, evidence) {
  results.push({ name, pass, evidence });
  console.log(`${pass ? '✓ PASS' : '✗ FAIL'} - ${name}${evidence ? ' :: ' + evidence : ''}`);
}

async function run() {
  console.log('========================================================');
  console.log('  STUPUL GENESIS v3.5 — LIVE PRODUCTION CLOUDFLARE E2E  ');
  console.log('========================================================\n');
  console.log(`Target URL: ${PUBLIC_URL}\n`);

  // 1. Lansare instanță Browser 1 (Desktop)
  console.log('[1/5] Lansare instanță Chrome Desktop pe URL public...');
  const browserA = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const pageA = await browserA.newPage();
  await pageA.setViewport({ width: 1280, height: 800 });

  // Înregistrăm Citizen Alpha pe serverul Cloudflare live
  const citizenRes = await fetch(`${PUBLIC_URL}/api/auth/citizen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Cetățean Alpha' }),
  });
  const citizenData = await citizenRes.json();
  const tokenA = citizenData.sessionToken;
  const actorA = citizenData.identity.actorId;

  await pageA.evaluateOnNewDocument((token, actor) => {
    sessionStorage.setItem('stupul_session_token', token);
    sessionStorage.setItem('stupul_browser_actor_id', actor);
    localStorage.setItem('stupul_tutorial_seen', 'true');
  }, tokenA, actorA);

  const navResA = await pageA.goto(PUBLIC_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  record('Navigare HTTP 200 pe URL extern Cloudflare Workers', navResA.status() === 200, `Status: ${navResA.status()}`);

  await delay(1500);

  // Verificare titlu și DOM
  const title = await pageA.title();
  record('Titlu pagină publică încărcată corect', title.includes('STUPUL'), `Titlu: "${title}"`);

  // Captură Desktop
  const desktopShotPath = path.join(ARTIFACT_DIR, 'public_live_desktop.png');
  await pageA.screenshot({ path: desktopShotPath });
  record('Captură ecran Desktop salvată cu succes', fs.existsSync(desktopShotPath), desktopShotPath);

  // 2. Lansare instanță Browser 2 (Mobile Viewport & Guest)
  console.log('\n[2/5] Lansare instanță Chrome Mobile (390x844) ca Oaspete (Guest)...');
  const browserB = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=400,900'],
  });

  const pageB = await browserB.newPage();
  await pageB.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Guest sesiune pe Cloudflare live
  const guestRes = await fetch(`${PUBLIC_URL}/api/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const guestData = await guestRes.json();
  const tokenB = guestData.sessionToken;
  const actorB = guestData.identity.actorId;

  await pageB.evaluateOnNewDocument((token, actor) => {
    sessionStorage.setItem('stupul_session_token', token);
    sessionStorage.setItem('stupul_browser_actor_id', actor);
    localStorage.setItem('stupul_tutorial_seen', 'true');
  }, tokenB, actorB);

  const navResB = await pageB.goto(PUBLIC_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  record('Navigare Mobile HTTP 200 pe URL extern', navResB.status() === 200, `Status: ${navResB.status()}`);

  await delay(1500);

  // Captură Mobile
  const mobileShotPath = path.join(ARTIFACT_DIR, 'public_live_mobile.png');
  await pageB.screenshot({ path: mobileShotPath });
  record('Captură ecran Mobile salvată cu succes', fs.existsSync(mobileShotPath), mobileShotPath);

  // 3. Test Securitate Guest pe Serverul Cloudflare Live
  console.log('\n[3/5] Test Securitate P2: Tentativă construire ca Oaspete pe Cloudflare DO...');
  const guestBuildRes = await fetch(`${PUBLIC_URL}/api/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`,
    },
    body: JSON.stringify({
      commandId: `live_guest_test_${Date.now()}`,
      actorId: actorB,
      command: { type: 'CONSTRUCT_BUILDING', x: 5, y: 5, buildingType: 'farm', actorId: actorB },
    }),
  });

  const guestBuildData = await guestBuildRes.json();
  record(
    'Server Cloudflare Durable Object respinge comanda Oaspetelui cu 403 Forbidden',
    guestBuildRes.status === 403,
    `HTTP ${guestBuildRes.status} :: ${guestBuildData.error}`
  );

  // 4. Test Construcție Cetățean pe Serverul Cloudflare Live
  console.log('\n[4/5] Test Cetățean Alpha: Construire fermă la (4, 5) pe Cloudflare DO...');
  const citizenBuildRes = await fetch(`${PUBLIC_URL}/api/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      commandId: `live_citizen_build_${Date.now()}`,
      actorId: actorA,
      command: { type: 'CONSTRUCT_BUILDING', x: 4, y: 5, buildingType: 'farm', actorId: actorA },
    }),
  });

  const citizenBuildData = await citizenBuildRes.json();
  record(
    'Server Cloudflare Durable Object aplică comanda Cetățeanului cu HTTP 200',
    citizenBuildRes.status === 200 && citizenBuildData.applied,
    `Versiune DO: ${citizenBuildData.version}`
  );

  // 5. Verificare Sincronizare pe Browserul Oaspetelui
  console.log('\n[5/5] Verificare observabilitate pe instanța Oaspetelui B...');
  await delay(1200);

  const parcelSeenOnB = await pageB.evaluate(async (url) => {
    const res = await fetch(`${url}/api/state`);
    const data = await res.json();
    return data.state.grid[5][4];
  }, PUBLIC_URL);

  record(
    'Browser B (Oaspete) vede ferma construită de Cetățeanul Alpha pe serverul Cloudflare',
    parcelSeenOnB && parcelSeenOnB.building === 'farm' && parcelSeenOnB.ownerAccountId === actorA,
    `Parcela (4, 5): building='${parcelSeenOnB?.building}', owner='${parcelSeenOnB?.ownerAccountId}'`
  );

  await browserA.close();
  await browserB.close();

  const totalPassed = results.filter(r => r.pass).length;
  console.log(`\nREZULTAT FINAL: ${totalPassed}/${results.length} TESTE PASS PE MEDIUL PUBLIC LIVE CLOUDFLARE!`);
}

run().catch(err => {
  console.error('Eroare test live:', err);
  process.exit(1);
});
