/**
 * Capture screenshots of each phase in the winDAGs lifecycle tour.
 * 
 * Usage: node scripts/capture-lifecycle-screenshots.js
 * Requires: Playwright installed, website served on localhost:3333
 */

const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3333/dag/lifecycle';
const OUTPUT_DIR = path.join(__dirname, '..', '.project', 'screenshots', 'windags-lifecycle');

const PHASES = [
  { index: 0, name: '01-problem-input' },
  { index: 1, name: '02-task-decomposition' },
  { index: 2, name: '03-wave1-interview' },
  { index: 3, name: '04-wave2-parallel' },
  { index: 4, name: '05-wave3-design' },
  { index: 5, name: '06-wave4-build' },
  { index: 6, name: '07-human-gate' },
  { index: 7, name: '08-completion' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  console.log('Loading lifecycle tour page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for canvas render

  for (const phase of PHASES) {
    // Click the phase button (they're the numbered buttons at the top)
    const buttons = await page.locator('button').all();
    // Find the button that starts with the phase number
    const phasePrefix = `${phase.index + 1}.`;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.startsWith(phasePrefix)) {
        await btn.click();
        break;
      }
    }
    
    await page.waitForTimeout(1500); // Wait for state update + canvas redraw

    const filepath = path.join(OUTPUT_DIR, `${phase.name}.png`);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`  ✓ ${phase.name}`);
  }

  // Also capture a full-page shot
  await page.screenshot({ 
    path: path.join(OUTPUT_DIR, '00-full-page.png'), 
    fullPage: true 
  });
  console.log('  ✓ full-page overview');

  await browser.close();
  console.log(`\nDone! Screenshots saved to ${OUTPUT_DIR}`);
}

main().catch(console.error);
