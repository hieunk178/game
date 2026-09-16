// Chụp phòng ngủ trong game thật (WebGL) từ vài góc máy để soi bố cục.
import fs from 'fs';
import puppeteer from 'puppeteer';

const URL = process.env.GAME_URL || 'http://localhost:8099/index.html';
const OUT = 'tools/model-splitter/preview-room';
fs.mkdirSync(OUT, { recursive: true });

const VIEWS = {
  overview: { pos: [7.5, 6.5, 7.5], look: [-0.5, 1.0, -1.0] },
  desk: { pos: [-0.6, 2.2, -0.6], look: [-4.3, 0.9, -1.5] },
  bed: { pos: [-0.2, 2.6, -0.5], look: [3.6, 0.8, -3.6] },
  north: { pos: [0.2, 2.2, 2.6], look: [0.2, 1.8, -4.9] },
  door: { pos: [0.0, 2.4, -1.0], look: [-3.5, 1.2, 4.0] },
  fromDoor: { pos: [0.0, 1.9, 4.3], look: [0.4, 1.6, -4.9] },
  topdown: { pos: [0.2, 9.0, 0.4], look: [0.2, 0, -0.6] }
};

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--enable-webgl', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
await page.setViewport({ width: 1100, height: 720 });
const errors = [];
page.on('pageerror', e => { if (!/Pointer Lock/.test(e.message)) errors.push(String(e.message)); });
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForFunction(() => window.vocabGame && window.vocabGame.sceneReady === true, { timeout: 90000 });
await page.evaluate(() => window.vocabGame.switchScreen('game'));
await new Promise(r => setTimeout(r, 2500));   // chờ GLB của khu vực tải xong

// tắt lớp phủ "Nhấp để bắt đầu" (nó làm mờ canvas) và ẩn HUD cho ảnh sạch
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /Bắt đầu khám phá/i.test(b.textContent || ''));
  if (btn) btn.click();
});
await new Promise(r => setTimeout(r, 400));
await page.addStyleTag({ content: `
  #hud, .hud, .game-header, .top-bar, .bottom-bar, .overlay, .modal, .panel,
  [class*="hud"], [class*="overlay"], [class*="toolbar"], [class*="header"],
  [class*="hint"], [class*="objective"], [class*="minimap"], [class*="quest"] { display: none !important; }
  canvas { filter: none !important; }
` });

const missing = await page.evaluate(() => {
  const g = window.vocabGame;
  const want = window.__BEDROOM_IDS || [];
  return {
    loaded: Object.keys(g.loadedModels),
    interactive: g.interactiveObjects.map(o => o.userData.vocabId),
    want
  };
});
console.log('model đã tải:', missing.loaded.length);
console.log('vật tương tác:', missing.interactive.join(', '));

// dừng vòng lặp animate (nó ghi đè camera mỗi khung hình) rồi tự render từng góc
await page.evaluate(() => { window.vocabGame.isSceneVisible = false; });

for (const [name, v] of Object.entries(VIEWS)) {
  await page.evaluate((view) => {
    const g = window.vocabGame;
    g.camera.position.set(...view.pos);
    g.camera.lookAt(...view.look);
    g.camera.updateProjectionMatrix();
    g.renderer.render(g.scene, g.camera);
  }, v);
  await new Promise(r => setTimeout(r, 350));
  await page.screenshot({ path: `${OUT}/${name}.png` });
  process.stdout.write(name + ' ');
}
await browser.close();
console.log('\nảnh →', OUT);
if (errors.length) { console.log('LỖI TRANG:'); errors.slice(0, 10).forEach(e => console.log(' -', e)); }
