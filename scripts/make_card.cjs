#!/usr/bin/env node
// Генерирует карточку 1080x1350 из фото + заголовка + места, рендеря HTML-шаблон в headless Chromium.
// Варианты шаблона (--variant): classic (заголовок + место) | impression (заголовок-впечатление в виде цитаты + место)
// Пример:
//   node scripts/make_card.cjs --photo in.jpg --title "Закат на крыше" --location "Лиссабон, Португалия" --out out.png --brand "@mytravel"
//   node scripts/make_card.cjs --variant impression --photo in.jpg --title "Будто попал в другую эпоху" --location "Лиссабон, Португалия" --out out.png

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
  const { photo, title, location, out, brand = '', variant = 'classic' } = args;

  if (!photo || !title || !location || !out) {
    console.error('Нужны параметры: --photo <файл> --title "<текст>" --location "<текст>" --out <файл.png> [--brand "<текст>"] [--variant classic|impression]');
    process.exit(1);
  }

  const templateFiles = {
    classic: 'card.html',
    impression: 'card-impression.html',
  };
  const templateFile = templateFiles[variant];
  if (!templateFile) {
    console.error(`Неизвестный --variant "${variant}". Доступны: ${Object.keys(templateFiles).join(', ')}`);
    process.exit(1);
  }

  const templatePath = resolve(__dirname, '../template', templateFile);
  const html = readFileSync(templatePath, 'utf-8');

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

  await page.waitForTimeout(100);
  await page.screenshot({ path: resolve(out) });
  await browser.close();

  console.log(`Готово: ${resolve(out)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
