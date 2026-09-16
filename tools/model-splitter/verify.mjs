// Renders the original scene and the manifest-rebuilt scene from identical cameras
// and reports the pixel difference between them.
import fs from 'fs'; import path from 'path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

const PARTS = 'models/bedroom_parts';
const OUT = 'tools/model-splitter/preview';
const VIEWS = ['a', 'b', 'c'];
fs.mkdirSync(OUT, { recursive: true });
const fileUrl = p => 'file:///' + path.resolve(p).split(String.fromCharCode(92)).join('/');
const manifest = JSON.parse(fs.readFileSync(path.join(PARTS, 'manifest.json'), 'utf8'));

const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files', '--no-sandbox'], protocolTimeout: 900000 });
async function render(setup) {
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 200)));
  await page.goto(fileUrl('tools/model-splitter/verify.html'), { waitUntil: 'load' });
  await page.waitForFunction('window.READY===true', { timeout: 120000 });
  console.log(' loaded:', await setup(page));
  const shots = {};
  for (const v of VIEWS) {
    const png = await page.evaluate(x => window.shoot(x), v);
    shots[v] = Buffer.from(png.split(',')[1], 'base64');
  }
  await page.close();
  return shots;
}

console.log('rendering rebuilt scene...');
const rebuilt = await render(p => p.evaluate((d, parts) => window.loadParts(d, parts), fileUrl(PARTS), manifest.parts));
console.log('rendering original scene...');
const original = await render(p => p.evaluate(u => window.loadOriginal(u), fileUrl('models/bedroom__modern_cozy_bedroom_interior.glb')));
await browser.close();

for (const v of VIEWS) {
  const a = await sharp(original[v]).raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(rebuilt[v]).raw().toBuffer();
  let diff = 0;
  for (let i = 0; i < a.data.length; i++) if (Math.abs(a.data[i] - b[i]) > 12) diff++;
  console.log(`view ${v}: ${(100 * diff / a.data.length).toFixed(2)}% of channel samples differ`);
  await sharp({ create: { width: 1280, height: 500, channels: 3, background: '#ffffff' } })
    .composite([{ input: original[v], left: 0, top: 20 }, { input: rebuilt[v], left: 640, top: 20 },
      { input: Buffer.from(`<svg width="1280" height="20"><text x="240" y="15" font-family="monospace" font-size="14">ORIGINAL</text><text x="880" y="15" font-family="monospace" font-size="14">REBUILT FROM PARTS</text></svg>`), left: 0, top: 0 }])
    .png().toFile(path.join(OUT, `compare-${v}.png`));
}
console.log('comparisons ->', OUT);
