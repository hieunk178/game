// Renders a thumbnail for every part GLB in a directory and stitches a labelled contact sheet.
import fs from 'fs'; import path from 'path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const DIR = process.argv[2] || 'models/bedroom_parts';
const OUT = process.argv[3] || 'tools/model-splitter/preview';
const COLS = 6, CELL = 300, LABEL = 22;
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.glb')).sort();
const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files', '--no-sandbox'], protocolTimeout: 600000 });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 200)));
const url = 'file:///' + path.resolve('tools/model-splitter/part-preview.html').split(String.fromCharCode(92)).join('/');
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction('window.READY===true', { timeout: 120000 });

const cells = [];
for (const f of files) {
  const fileUrl = 'file:///' + path.resolve(DIR, f).split(String.fromCharCode(92)).join('/');
  try {
    const { png } = await page.evaluate(u => window.shootPart(u), fileUrl);
    const buf = Buffer.from(png.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, f.replace('.glb', '.png')), buf);
    cells.push({ f, buf });
    process.stdout.write('.');
  } catch (e) {
    console.log('\nFAILED', f, String(e).slice(0, 160));
  }
}
await browser.close();
console.log('\nrendered', cells.length, '/', files.length);

// contact sheet with a caption strip under every thumbnail
const rows = Math.ceil(cells.length / COLS);
const svgLabel = (text, i) => Buffer.from(
  `<svg width="${CELL}" height="${LABEL}"><rect width="100%" height="100%" fill="#222"/>` +
  `<text x="6" y="16" font-family="monospace" font-size="14" fill="#fff">${String(i).padStart(2, '0')} ${text.replace(/[<&]/g, '')}</text></svg>`);
const composites = [];
for (let i = 0; i < cells.length; i++) {
  const x = (i % COLS) * CELL, y = Math.floor(i / COLS) * (CELL + LABEL);
  composites.push({ input: cells[i].buf, left: x, top: y });
  composites.push({ input: svgLabel(cells[i].f.replace('.glb', '').slice(0, 30), i), left: x, top: y + CELL });
}
await sharp({ create: { width: COLS * CELL, height: rows * (CELL + LABEL), channels: 3, background: '#ffffff' } })
  .composite(composites).png().toFile(path.join(OUT, 'contact-sheet.png'));
console.log('contact sheet ->', path.join(OUT, 'contact-sheet.png'));
