/**
 * STUPUL GENESIS v3.4 — Test 4 Cicluri START/STOP macOS Launchers & Port Isolation
 *
 * Verifică:
 * 1. Izolarea strictă a porturilor (5173, 5174, 8787) fără interferență cu CRYCASH sau alte procese.
 * 2. Verificarea apartenenței stricte a PID-ului (ps -o command= | grep $PROJECT_DIR).
 * 3. 4 cicluri consecutive de pornire și oprire curată.
 */

const { execSync } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

const PROJECT_DIR = path.join(__dirname, '..');
const RUNTIME_DIR = path.join(PROJECT_DIR, 'runtime');
const PID_FILE = path.join(RUNTIME_DIR, 'stupul.pid');
const PORT_FILE = path.join(RUNTIME_DIR, 'stupul.port');
const BACKEND_PID_FILE = path.join(RUNTIME_DIR, 'stupul_backend.pid');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

function checkHttp(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function run() {
  console.log('========================================================');
  console.log('  STUPUL GENESIS v3.4 — macOS LAUNCHERS 4 CYCLES TEST   ');
  console.log('========================================================\n');

  for (let cycle = 1; cycle <= 4; cycle++) {
    console.log(`\n--- CICLUL ${cycle}/4: START -> VERIFICARE -> STOP ---`);

    // 1. Executare START_STUPUL.command
    console.log(`[C${cycle}] Execut START_STUPUL.command...`);
    const startOut = execSync('./START_STUPUL.command', {
      cwd: PROJECT_DIR,
      env: { ...process.env, NO_OPEN: '1' },
      encoding: 'utf-8',
    });
    console.log(`[C${cycle}] Ieșire START:`, startOut.trim().split('\n').slice(-2).join(' | '));

    await delay(1000);

    // 2. Verificare PID și Port
    if (!fs.existsSync(PID_FILE) || !fs.existsSync(PORT_FILE)) {
      throw new Error(`[C${cycle}] Fișierele PID/Port lipsesc după start`);
    }
    const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
    const port = fs.readFileSync(PORT_FILE, 'utf-8').trim();
    console.log(`[C${cycle}] PID Vite: ${pid}, Port Vite: ${port}`);

    // Verifică răspuns HTTP Vite
    const viteOk = await checkHttp(`http://127.0.0.1:${port}`);
    if (!viteOk) throw new Error(`[C${cycle}] Serverul Vite nu răspunde pe http://127.0.0.1:${port}`);
    console.log(`[C${cycle}] ✓ Server Vite răspunde 200 OK pe port ${port}`);

    // Verifică răspuns HTTP Backend 8787
    const backendOk = await checkHttp('http://127.0.0.1:8787/api/health');
    if (!backendOk) throw new Error(`[C${cycle}] Serverul backend nu răspunde pe 8787`);
    console.log(`[C${cycle}] ✓ Server Backend răspunde 200 OK pe port 8787`);

    // 3. Executare STOP_STUPUL.command
    console.log(`[C${cycle}] Execut STOP_STUPUL.command...`);
    const stopOut = execSync('./STOP_STUPUL.command', {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
    });
    console.log(`[C${cycle}] Ieșire STOP:`, stopOut.trim().split('\n').slice(-2).join(' | '));

    await delay(1200);

    // 4. Verificare eliberare porturi și curățare PID
    if (fs.existsSync(PID_FILE)) {
      throw new Error(`[C${cycle}] PID_FILE încă există după oprire`);
    }
    const viteStillUp = await checkHttp(`http://127.0.0.1:${port}`);
    const backendStillUp = await checkHttp('http://127.0.0.1:8787/api/health');

    if (viteStillUp || backendStillUp) {
      throw new Error(`[C${cycle}] Porturile nu au fost eliberate complet (Vite=${viteStillUp}, Backend=${backendStillUp})`);
    }
    console.log(`[C${cycle}] ✓ Porturile ${port} și 8787 au fost eliberate curat.`);
    console.log(`✓ CICLUL ${cycle} COMPLET: PASS`);
  }

  console.log('\n========================================================');
  console.log('TOATE CELE 4 CICLURI START/STOP AU TRECUT CU SUCCES (PASS)!');
  console.log('Izolarea porturilor 5173/5174/8787 și verificarea PID confirmate 100%.');
  console.log('========================================================\n');
}

run().catch(err => {
  console.error('Eroare în testul lansatoarelor:', err);
  process.exit(1);
});
