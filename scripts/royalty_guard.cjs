#!/usr/bin/env node
// royalty_guard.cjs — CI guard pentru invarianții contractuali GENESIS (redevență 5%).
// Detectează: eliminarea modulului, modificarea procentului/formulei, eliminarea
// verificărilor juridice, eliminarea trasabilității licențelor și scurgeri de chei private.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failed = 0;

function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ' :: ' + detail : ''}`);
  if (!ok) failed++;
}
function read(p) { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return null; } }

const giConstants = read('packages/genesis-integrity/src/royaltyConstants.ts');
check('genesis-integrity/royaltyConstants.ts există', !!giConstants);
check('ROYALTY_RATE = 0.05', !!giConstants && giConstants.includes('ROYALTY_RATE = 0.05'));
check('ROYALTY_RATE_BASIS_POINTS = 500', !!giConstants && giConstants.includes('ROYALTY_RATE_BASIS_POINTS = 500'));

const domRoyalties = read('packages/domain/src/royalties.ts');
check('domain/royalties.ts conține 0.05', !!domRoyalties && domRoyalties.includes('0.05'));
check('domain/royalties.ts excludere cheltuieli generale', !!domRoyalties && domRoyalties.includes('General operational expenses'));

const lg = read('packages/domain/src/legalGates.ts');
check('legalGates.ts DEFAULT_LOCKED_LEGAL_GATE (fail-closed)', !!lg && lg.includes('DEFAULT_LOCKED_LEGAL_GATE') && lg.includes('operatorVerified: false'));

const verify = read('packages/genesis-integrity/src/verify.ts');
check('genesis-integrity/verify.ts verifică 5%', !!verify && verify.includes('royaltyRateBasisPoints'));

const rec = read('packages/genesis-integrity/src/reconciliation.ts');
check('genesis-integrity/reconciliation.ts există', !!rec);

const bad = [];
function scan(dir, exts) {
  let entries;
  try { entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'royalty_guard.cjs') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { scan(full, exts); continue; }
    if (exts.some(x => e.name.endsWith(x))) {
      const c = fs.readFileSync(path.join(ROOT, full), 'utf8');
      if (c.includes('BEGIN PRIVATE KEY') || c.includes('BEGIN RSA PRIVATE KEY')) bad.push(full);
    }
  }
}
scan('', ['.ts', '.tsx', '.js', '.cjs', '.json', '.md']);
check('fără chei private în repository', bad.length === 0, bad.join(','));

console.log(failed ? `\n${failed} CHECKS FAILED` : '\nALL ROYALTY INVARIANTS OK');
process.exit(failed ? 1 : 0);
