const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseDir = path.resolve(__dirname, '..', 'mvp_web');
const outputDir = path.join(__dirname, 'screenshots-detailed');

fs.mkdirSync(outputDir, { recursive: true });

function fileUrl(fileName) {
  const fullPath = path.join(baseDir, fileName).replace(/\\/g, '/');
  return `file:///${fullPath}`;
}

async function waitAndShot(page, outName, delay = 1400) {
  await page.waitForTimeout(delay);
  await page.screenshot({
    path: path.join(outputDir, outName),
    fullPage: false,
  });
}

async function captureTabs(page, htmlFile, selector, values, prefix) {
  await page.goto(fileUrl(htmlFile), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await waitAndShot(page, `${prefix}-default.png`, 400);

  for (const value of values) {
    const target = `${selector}[data-${value.attr}="${value.key}"]`;
    await page.click(target);
    await waitAndShot(page, `${prefix}-${value.name}.png`);
  }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
    deviceScaleFactor: 1,
  });

  await captureTabs(page, 'baisu.html', '.mode-tab', [
    { attr: 'mode', key: 'order', name: 'order' },
    { attr: 'mode', key: 'neighbor', name: 'neighbor' },
    { attr: 'mode', key: 'ninegrid', name: 'ninegrid' },
    { attr: 'mode', key: 'pattern', name: 'pattern' },
    { attr: 'mode', key: 'treasure', name: 'treasure' },
  ], 'baisu');

  await captureTabs(page, 'measure.html', '.mode-tab', [
    { attr: 'mode', key: 'clock', name: 'clock' },
    { attr: 'mode', key: 'money', name: 'money' },
    { attr: 'mode', key: 'compare', name: 'compare' },
    { attr: 'mode', key: 'length', name: 'length' },
    { attr: 'mode', key: 'weight', name: 'weight' },
    { attr: 'mode', key: 'calendar', name: 'calendar' },
  ], 'measure');

  await captureTabs(page, 'shape.html', '.mode-tab', [
    { attr: 'mode', key: 'recognize', name: 'recognize' },
    { attr: 'mode', key: 'classify', name: 'classify' },
    { attr: 'mode', key: 'find', name: 'find' },
    { attr: 'mode', key: 'tangram', name: 'tangram' },
    { attr: 'mode', key: 'spatial', name: 'spatial' },
  ], 'shape');

  await captureTabs(page, 'math.html', '.mode-tab', [
    { attr: 'level', key: '1', name: 'level1' },
    { attr: 'level', key: '2', name: 'level2' },
    { attr: 'level', key: '3', name: 'level3' },
  ], 'math');

  await captureTabs(page, 'sudoku.html', '.mode-tab', [
    { attr: 'stage', key: '4x4-easy', name: '4x4-easy' },
    { attr: 'stage', key: '4x4-advanced', name: '4x4-advanced' },
    { attr: 'stage', key: '6x6-easy', name: '6x6-easy' },
    { attr: 'stage', key: '6x6-advanced', name: '6x6-advanced' },
    { attr: 'stage', key: '9x9-easy', name: '9x9-easy' },
    { attr: 'stage', key: '9x9-advanced', name: '9x9-advanced' },
  ], 'sudoku');

  await page.goto(fileUrl('trace.html'), { waitUntil: 'networkidle' });
  await waitAndShot(page, 'trace-default.png', 1800);

  await page.goto(fileUrl('settings.html'), { waitUntil: 'networkidle' });
  await waitAndShot(page, 'settings-default.png', 1200);

  await page.goto(fileUrl('index.html'), { waitUntil: 'networkidle' });
  await waitAndShot(page, 'index-default.png', 1200);

  await browser.close();

  console.log(JSON.stringify({
    outputDir,
    files: fs.readdirSync(outputDir).sort(),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
