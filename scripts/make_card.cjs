#!/usr/bin/env node
// Renders a 1080x1350 card from a photo + headline + location via an HTML template in headless Chromium.
// Template variants (--variant): classic (headline + location) | impression (headline as a quote + location)
// Example:
//   node scripts/make_card.cjs --photo in.jpg --title "Sunset on the Rooftop" --location "Lisbon, Portugal" --out out.png
//   node scripts/make_card.cjs --variant impression --photo in.jpg --title "Like stepping into another era" --location "Lisbon, Portugal" --out out.png
// --brand defaults to "@mozalera"; pass --brand "" to omit it, or --brand "<other>" to override.

const { chromium } = require('playwright');
const { readFileSync } = require('fs');
const { resolve } = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    args[key] = argv[i + 1];
  }
  return args;
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { photo, title, location, out, brand = '@mozalera', variant = 'classic' } = args;

  if (!photo || !title || !location || !out) {
    console.error('Required: --photo <file> --title "<text>" --location "<text>" --out <file.png> [--brand "<text>"] [--variant classic|impression]');
    process.exit(1);
  }

  const templateFiles = {
    classic: 'card.html',
    impression: 'card-impression.html',
  };
  const templateFile = templateFiles[variant];
  if (!templateFile) {
    console.error(`Unknown --variant "${variant}". Available: ${Object.keys(templateFiles).join(', ')}`);
    process.exit(1);
  }

  const templatePath = resolve(__dirname, '../template', templateFile);
  let html = readFileSync(templatePath, 'utf-8');

  const fontPath = resolve(__dirname, '../template/fonts/archivo-black.ttf');
  const fontBase64 = readFileSync(fontPath).toString('base64');
  const fontFace = `@font-face { font-family: 'Archivo Black'; src: url(data:font/ttf;base64,${fontBase64}) format('truetype'); font-weight: 400; font-display: block; }`;
  html = html.replace('/*FONT_FACES*/', fontFace);

  const photoPath = resolve(photo);
  const photoBuffer = readFileSync(photoPath);
  const ext = photoPath.split('.').pop().toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const photoDataUrl = `data:${mime};base64,${photoBuffer.toString('base64')}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.setContent(html, { waitUntil: 'load' });

  await page.evaluate(({ photoDataUrl, title, location, brand }) => {
    document.getElementById('photo').src = photoDataUrl;
    document.getElementById('title').textContent = title;
    document.getElementById('location-text').textContent = location;
    document.getElementById('brand').textContent = brand;
  }, { photoDataUrl, title: escapeHtml(title), location: escapeHtml(location), brand: escapeHtml(brand) });

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
  await page.screenshot({ path: resolve(out) });
  await browser.close();

  console.log(`Done: ${resolve(out)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
