const puppeteer = require('puppeteer-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.env.STUPUL_URL || 'http://127.0.0.1:5174/';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('Testing Bilingual i18n Switch in Google Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,800'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(800);

  // Close tutorial if present
  await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
      const closeBtn = modal.querySelector('button');
      if (closeBtn) closeBtn.click();
    }
  });
  await delay(400);

  // Check initial state (should have RO button)
  const initialText = await page.evaluate(() => document.body.innerText);
  console.log('Initial page has Romanian strings:', initialText.includes('Guvernanță') || initialText.includes('Muncă'));

  // Click language toggle button
  const toggled = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => 
      (b.textContent || '').includes('RO') || (b.textContent || '').includes('EN')
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (!toggled) {
    console.error('FAIL: Language toggle button not found');
    await browser.close();
    process.exit(1);
  }

  await delay(500);

  // Check English strings
  const enText = await page.evaluate(() => document.body.innerText);
  const hasGovernance = enText.includes('Governance');
  const hasCivicWork = enText.includes('Civic Work');
  const hasEnButton = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent || '').includes('EN 🇬🇧'));
    return !!btn;
  });

  console.log('English UI active:', { hasGovernance, hasCivicWork, hasEnButton });

  if (!hasGovernance && !hasCivicWork) {
    console.error('FAIL: UI did not switch to English');
    await browser.close();
    process.exit(1);
  }

  // Toggle back to Romanian
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent || '').includes('EN 🇬🇧'));
    if (btn) btn.click();
  });
  await delay(500);

  const roTextAgain = await page.evaluate(() => document.body.innerText);
  const hasGuvernantaAgain = roTextAgain.includes('Guvernanță');
  console.log('Switched back to Romanian successfully:', hasGuvernantaAgain);

  await browser.close();

  if (hasGuvernantaAgain) {
    console.log('PASS: Bilingual toggle end-to-end verified successfully!');
    process.exit(0);
  } else {
    console.error('FAIL: Could not switch back to Romanian');
    process.exit(1);
  }
})().catch(e => {
  console.error('FATAL', e);
  process.exit(2);
});
