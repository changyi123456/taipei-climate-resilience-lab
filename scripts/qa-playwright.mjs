import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';

const outputDir = new URL('../qa/', import.meta.url);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const qaErrors = [];

async function captureViewport(width, height, label) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      qaErrors.push(`${label} console ${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (error) => qaErrors.push(`${label} pageerror: ${error.message}`));

  await page.goto('http://127.0.0.1:5177/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#game-canvas', { timeout: 10000 });
  await page.waitForSelector('[data-live-data]', { timeout: 10000 });
  await page.locator('[data-live-data]').click();
  await page.waitForSelector('.data-briefing-card', { timeout: 25000 });
  await page.waitForSelector('.data-source-row', { timeout: 10000 });
  await page.waitForSelector('.data-signal-card', { timeout: 10000 });
  const dataSourceCount = await page.locator('.data-source-row').count();
  const dataSignalCount = await page.locator('.data-signal-card').count();
  await page.locator('.data-briefing-card [data-start-mission]').click();
  await page.waitForSelector('.mission-chip', { timeout: 10000 });
  await page.waitForSelector('.mission-objective', { timeout: 10000 });
  const missionObjectiveCount = await page.locator('.mission-objective').count();
  const districtMiniStatCount = await page.locator('.district-chip-panel .mini-stat').count();
  await page.locator('[data-open-policy-board]').click();
  await page.waitForSelector('.policy-board-panel', { timeout: 10000 });
  await page.waitForSelector('.policy-card', { timeout: 10000 });
  await page.waitForTimeout(400);

  const initialTurn = await page.locator('.brand-lockup small').innerText();
  const budgetBefore = await page.locator('.metric').first().innerText();

  await page.locator('[data-policy="urban-tree-canopy"]').click();
  await page.waitForSelector('.policy-detail-card', { timeout: 10000 });
  const policyModalTitle = await page.locator('.policy-detail-card h1').innerText();
  await page.locator('[data-confirm-policy="urban-tree-canopy"]').click();
  await page.waitForTimeout(250);
  const budgetAfterFirstPolicy = await page.locator('.metric').first().innerText();

  await page.locator('[data-policy="cooling-shelters"]').click();
  await page.waitForSelector('.policy-detail-card', { timeout: 10000 });
  await page.locator('[data-confirm-policy="cooling-shelters"]').click();
  await page.waitForTimeout(250);

  await page.locator('[data-policy="citizen-science-network"]').click();
  await page.waitForSelector('.policy-detail-card', { timeout: 10000 });
  const policyLimitDisabled = await page.locator('[data-confirm-policy="citizen-science-network"]').isDisabled();
  await page.locator('[data-close-policy]').click();
  await page.locator('[data-close-policy-board]').click();

  await page.locator('[data-advance]').click();
  await page.waitForSelector('.year-transition-panel', { timeout: 10000 });
  await page.waitForTimeout(1000);
  const transitionScreenshot = await page.screenshot({ fullPage: false });
  await writeFile(new URL(`${label}-transition.png`, outputDir), transitionScreenshot);
  await page.waitForTimeout(5700);
  const afterTurn = await page.locator('.brand-lockup small').innerText();
  const hasResolution = (await page.locator('.year-feed [data-open-guide="resolution"]').count()) > 0 || width < 1100;

  const screenshot = await page.screenshot({ fullPage: false });
  await writeFile(new URL(`${label}.png`, outputDir), screenshot);

  const png = PNG.sync.read(screenshot);
  let lit = 0;
  let dark = 0;
  let saturated = 0;

  for (let i = 0; i < png.data.length; i += 4 * 40) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (luma > 18) lit += 1;
    if (luma < 8) dark += 1;
    if (Math.max(r, g, b) - Math.min(r, g, b) > 35) saturated += 1;
  }

  await page.close();

  return {
    label,
    width,
    height,
    initialTurn,
    afterTurn,
    policyModalTitle,
    policyChangedBudget: budgetBefore !== budgetAfterFirstPolicy,
    policyLimitDisabled,
    dataSourceCount,
    dataSignalCount,
    missionObjectiveCount,
    districtMiniStatCount,
    hasResolution,
    pixelSample: { lit, dark, saturated }
  };
}

const desktop = await captureViewport(1440, 900, 'desktop');
const tablet = await captureViewport(820, 1180, 'tablet');
await browser.close();

const report = {
  url: 'http://127.0.0.1:5177/',
  desktop,
  tablet,
  qaErrors
};

await writeFile(new URL('report.json', outputDir), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
