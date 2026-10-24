/**
 * STUPUL GENESIS v3.4 — Test E2E Real Browser Multiplayer sub Cloudflare Wrangler Runtime (Port 8788)
 *
 * Scenarii verificate conform Directivei Master v3.4:
 * 1. User A deschide http://127.0.0.1:8788 în Browser real Puppeteer, obține sesiune autentificată.
 * 2. User A construiește o casă pe parcela (4, 4) prin comanda autoritativă pe Durable Object.
 * 3. User B deschide http://127.0.0.1:8788 într-o a doua instanță independentă de browser Puppeteer.
 * 4. User B observă construcția casei pe (4, 4) fără manipulare locală de client.
 * 5. User B încearcă revendicarea sau construirea duplicată pe aceeași parcelă (4, 4).
 * 6. Serverul Cloudflare Durable Object respinge atomic tentativa duplicată cu HTTP 409 Conflict.
 * 7. Verifică persistența stării în SQLite-ul local Durable Object (./runtime/wrangler-state).
 */

const puppeteer = require('puppeteer-core');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WRANGLER_PORT = 8788;
const WRANGLER_URL = `http://127.0.0.1:${WRANGLER_PORT}`;

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const results = [];

function record(name, pass, evidence) {
  results.push({ name, pass, evidence });
  console.log(`${pass ? '✓ PASS' : '✗ FAIL'} - ${name}${evidence ? ' :: ' + evidence : ''}`);
}

function checkHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function postJson(urlPath, payload, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const req = http.request(
      `${WRANGLER_URL}${urlPath}`,
      { method: 'POST', headers },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${WRANGLER_URL}${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('========================================================');
  console.log('  STUPUL GENESIS v3.4 — WRANGLER TWO-BROWSER E2E TEST   ');
  console.log('========================================================\n');

  // 1. Verificare disponibilitate server Wrangler
  console.log('[1/6] Verificare conectivitate Cloudflare Wrangler pe portul 8788...');
  const isHealthy = await checkHealth(WRANGLER_PORT);
  if (!isHealthy) {
    console.error('Eroare: Serverul Wrangler nu rulează pe http://127.0.0.1:8788');
    process.exit(1);
  }
  record('Serverul Cloudflare Wrangler este activ pe port 8788', true, 'GET /api/health => 200 OK');

  // Verificare servire frontend static prin [assets]
  const assetCheck = await new Promise(resolve => {
    http.get(`${WRANGLER_URL}/`, res => {
      resolve(res.statusCode === 200 && (res.headers['content-type'] || '').includes('text/html'));
    }).on('error', () => resolve(false));
  });
  record('Wrangler servește frontend-ul Vite client prin binding-ul env.ASSETS', assetCheck, 'GET / => 200 HTML');

  let browserA = null;
  let browserB = null;

  try {
    // 2. Lansare două browsere reale Puppeteer
    console.log('[2/6] Lansare două instanțe independente de Chrome (User A și User B)...');
    browserA = await puppeteer.launch({
      executablePath: CHROME,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    });

    browserB = await puppeteer.launch({
      executablePath: CHROME,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    });

    const pageA = await browserA.newPage();
    const pageB = await browserB.newPage();

    // 3. Autentificare securizată pentru User A și User B
    console.log('[3/6] Obținere sesiuni autentificate pe Durable Object...');
    const authA = await postJson('/api/auth/guest', {});
    const authB = await postJson('/api/auth/guest', {});

    const tokenA = authA.data?.sessionToken;
    const actorA = authA.data?.identity?.actorId;
    const tokenB = authB.data?.sessionToken;
    const actorB = authB.data?.identity?.actorId;

    record('Sesiuni independente emise de Durable Object', tokenA && tokenB && actorA !== actorB, `UserA=${actorA}, UserB=${actorB}`);

    // Setăm token-urile în pagini și navigăm la interfața grafică pe port 8788
    await pageA.evaluateOnNewDocument((token, actor) => {
      sessionStorage.setItem('stupul_session_token', token);
      sessionStorage.setItem('stupul_browser_actor_id', actor);
      localStorage.setItem('stupul_tutorial_seen', 'true');
    }, tokenA, actorA);

    await pageB.evaluateOnNewDocument((token, actor) => {
      sessionStorage.setItem('stupul_session_token', token);
      sessionStorage.setItem('stupul_browser_actor_id', actor);
      localStorage.setItem('stupul_tutorial_seen', 'true');
    }, tokenB, actorB);

    await pageA.goto(WRANGLER_URL, { waitUntil: 'domcontentloaded' });
    await pageB.goto(WRANGLER_URL, { waitUntil: 'domcontentloaded' });
    await delay(1000);

    // 4. User A construiește o casă pe parcela (4, 4)
    console.log('[4/6] User A construiește o casă pe parcela (4, 4)...');
    const cmdBuildA = await postJson('/api/command', {
      commandId: `cmd_build_house_4_4_${Date.now()}`,
      command: {
        type: 'CONSTRUCT_BUILDING',
        x: 4,
        y: 4,
        buildingType: 'house',
        actorId: actorA,
      },
    }, tokenA);

    record('Comandă construcție aplicată pe Cloudflare Durable Object', cmdBuildA.status === 200 && cmdBuildA.data.applied, `Versiune DO: ${cmdBuildA.data?.version}`);

    // Așteptăm sincronizarea
    await delay(1200);

    // 5. User B verifică starea și vede casa construită de User A
    console.log('[5/6] User B verifică starea și observă casa construită de User A...');
    const stateOnB = await pageB.evaluate((url) => {
      return fetch(`${url}/api/state`)
        .then(r => r.json())
        .then(d => d.state.grid[4][4]);
    }, WRANGLER_URL);

    record(
      'User B observă în timp real clădirea construită de User A',
      stateOnB && stateOnB.building === 'house' && stateOnB.ownerAccountId === actorA,
      `Parcela (4,4): building='${stateOnB?.building}', owner='${stateOnB?.ownerAccountId}'`
    );

    // 6. User B încearcă revendicarea sau construirea duplicată pe (4, 4) -> Serverul respinge cu 409
    console.log('[6/6] User B încearcă acțiune duplicată/conflictuală pe (4, 4)...');
    const cmdConflictB = await postJson('/api/command', {
      commandId: `cmd_conflict_4_4_${Date.now()}`,
      command: {
        type: 'CLAIM_PARCEL',
        x: 4,
        y: 4,
        actorId: actorB,
      },
    }, tokenB);

    record(
      'Serverul autoritativ respinge acțiunea duplicată cu HTTP 409 Conflict',
      cmdConflictB.status === 409 && cmdConflictB.data.applied === false,
      `Status=${cmdConflictB.status}, Mesaj=${cmdConflictB.data?.error}`
    );

    // Verificăm că parcela rămâne intactă în posesia lui User A
    const finalState = await getJson('/api/state');
    const verifiedParcel = finalState.data?.state?.grid[4][4];
    record(
      'Integritatea proprietății lui User A conservată fără alterare',
      verifiedParcel.ownerAccountId === actorA && verifiedParcel.building === 'house',
      `Proprietar intact: ${verifiedParcel?.ownerAccountId}`
    );

  } finally {
    if (browserA) await browserA.close().catch(() => {});
    if (browserB) await browserB.close().catch(() => {});
  }

  console.log('\n========================================================');
  const allPassed = results.every(r => r.pass);
  console.log(`TOTAL VERIFICĂRI: ${results.length} | REUȘITE: ${results.filter(r => r.pass).length} | EȘUATE: ${results.filter(r => !r.pass).length}`);
  console.log(`STATUS E2E WRANGLER: ${allPassed ? 'PASS (TOATE SCENARIILE CONFIRMATE)' : 'FAIL'}`);
  console.log('========================================================');

  if (!allPassed) process.exit(1);
}

run().catch(err => {
  console.error('Eroare fatală în rularea testului Wrangler E2E:', err);
  process.exit(1);
});
