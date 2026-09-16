/**
 * ============================================================================
 * KIỂM TRA GAME CHẠY THẬT TRONG TRÌNH DUYỆT (PUPPETEER)
 * ============================================================================
 * Các test_*.mjs khác chỉ kiểm tra logic bằng mock. File này mở game thật với
 * WebGL để bắt những lỗi chỉ lộ ra khi chạy: rò rỉ tài nguyên GPU khi chuyển
 * cảnh, người chơi spawn kẹt trong vật cản, cài đặt không được lưu…
 *
 * Chạy:  python serve.py 8099     (mở ở một cửa sổ terminal khác)
 *        pnpm run test:runtime
 *
 * Đổi địa chỉ khác qua biến môi trường GAME_URL nếu dùng cổng khác.
 */

import puppeteer from 'puppeteer';

const URL = process.env.GAME_URL || 'http://localhost:8099/index.html';
const ZONE_ROUTE = ['bedroom', 'living', 'kitchen', 'street', 'store', 'park'];

const problems = [];
const log = (...a) => console.log(...a);
const check = (label, ok, extra = '') => {
  log(`  ${ok ? '✅' : '❌'}  ${label}${ok ? '' : '  → ' + extra}`);
  if (!ok) problems.push(`${label} ${extra}`);
};

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--enable-webgl', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

page.on('pageerror', e => {
  // Pointer Lock cần thao tác thật của người dùng — không tính là lỗi
  if (!/Pointer Lock/.test(e.message)) problems.push(`[lỗi trang] ${e.message}`);
});
page.on('console', m => {
  if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) {
    problems.push(`[console] ${m.text()}`);
  }
});

const boot = async ({ clear = false } = {}) => {
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  if (clear) {
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
  }
  await page.waitForFunction(() => window.vocabGame && window.vocabGame.sceneReady === true, { timeout: 60000 });
  await page.evaluate(() => window.vocabGame.switchScreen('game'));
  await new Promise(r => setTimeout(r, 500));
};

const goTo = async zone => {
  await page.evaluate(z => window.vocabGame.goToZone(z), zone);
  await page.waitForFunction(() => window.vocabGame.isTransitioning === false, { timeout: 30000 });
  await new Promise(r => setTimeout(r, 220));
};

const gpuStats = () => page.evaluate(() => {
  const info = window.vocabGame.renderer.info;
  return {
    geometries: info.memory.geometries,
    textures: info.memory.textures,
    programs: info.programs ? info.programs.length : -1,
    sceneLights: window.vocabGame.scene.children.filter(c => c.isLight).length
  };
});

await boot({ clear: true });
log('=== 1. KHỞI ĐỘNG ===');
check('game khởi động và dựng xong cảnh đầu tiên', true);

// ---------------------------------------------------------------------------
log('\n=== 2. ĐIỂM SPAWN CỦA TỪNG CHẶNG KHÔNG KẸT TRONG VẬT CẢN ===');
for (const zone of ZONE_ROUTE) {
  await goTo(zone);
  const s = await page.evaluate(() => {
    const g = window.vocabGame;
    const p = g.player.pos;
    const b = g.roomBounds;
    return {
      pos: { x: +p.x.toFixed(2), z: +p.z.toFixed(2) },
      inBounds: !b || (p.x >= b.minX - 0.01 && p.x <= b.maxX + 0.01 && p.z >= b.minZ - 0.01 && p.z <= b.maxZ + 0.01),
      stuckIn: (g.colliders || []).filter(c =>
        p.x > c.minX - 0.32 && p.x < c.maxX + 0.32 &&
        p.z > c.minZ - 0.32 && p.z < c.maxZ + 0.32).map(c => c.name)
    };
  });
  check(`${zone}: spawn (${s.pos.x}, ${s.pos.z}) nằm trong biên và không đè vật cản`,
    s.inBounds && s.stuckIn.length === 0,
    s.stuckIn.length ? `kẹt trong: ${s.stuckIn.join(', ')}` : 'ra ngoài roomBounds');
}

// ---------------------------------------------------------------------------
log('\n=== 3. KHÔNG RÒ RỈ TÀI NGUYÊN GPU KHI ĐI LẠI GIỮA CÁC CHẶNG ===');
for (const z of ZONE_ROUTE) await goTo(z);
const base = await gpuStats();
for (let round = 0; round < 3; round++) {
  for (const z of ZONE_ROUTE) await goTo(z);
}
const after = await gpuStats();
log(`     mốc đầu: ${JSON.stringify(base)}`);
log(`     sau 18 lần chuyển cảnh: ${JSON.stringify(after)}`);
check('số geometry không tăng', after.geometries <= base.geometries,
  `${base.geometries} → ${after.geometries}`);
check('số texture không tăng', after.textures <= base.textures,
  `${base.textures} → ${after.textures}`);
check('số shader program không tăng', after.programs <= base.programs,
  `${base.programs} → ${after.programs}`);
check('đèn của khu vực cũ không chồng sang khu vực mới',
  after.sceneLights === base.sceneLights, `${base.sceneLights} → ${after.sceneLights}`);

// ---------------------------------------------------------------------------
log('\n=== 4. MỞ THẺ TỪ VỰNG CỦA MỌI TỪ MÀ KHÔNG LỖI ===');
const modalErrs = await page.evaluate(() => {
  const g = window.vocabGame;
  const errs = [];
  Object.values(window.VOCAB_DATA).forEach(item => {
    try { g.openVocabModal(item.id); g.closeVocabModal(true); }
    catch (e) { errs.push(`${item.id}: ${e.message}`); }
  });
  return errs;
});
check(`mở ${await page.evaluate(() => Object.keys(window.VOCAB_DATA).length)} thẻ từ vựng`,
  modalErrs.length === 0, modalErrs.slice(0, 3).join(' | '));

// ---------------------------------------------------------------------------
log('\n=== 5. STUDIO 3D CHỈ CHẠY KHI THẺ TỪ VỰNG ĐANG MỞ ===');
const insp = await page.evaluate(() => {
  const g = window.vocabGame;
  const closed = g.inspector.isActive;
  g.openVocabModal('desk');
  const opened = g.inspector.isActive;
  g.closeVocabModal(true);
  return { closed, opened, afterClose: g.inspector.isActive };
});
check('đóng thẻ → studio ngừng render',
  insp.closed === false && insp.afterClose === false, JSON.stringify(insp));
check('mở thẻ → studio render lại', insp.opened === true);

// ---------------------------------------------------------------------------
log('\n=== 6. VÒNG LẶP RENDER DỪNG KHI VỀ MENU ===');
const loop = await page.evaluate(() => {
  const g = window.vocabGame;
  g.switchScreen('start');
  const atMenu = g.isSceneVisible;
  g.switchScreen('game');
  return { atMenu, atGame: g.isSceneVisible };
});
check('ở menu → không render', loop.atMenu === false);
check('vào game → render lại', loop.atGame === true);

// ---------------------------------------------------------------------------
log('\n=== 7. HẸN GIỜ CẢNH THỨC DẬY BỊ HUỶ KHI RỜI PHÒNG NGỦ ===');
const wake = await page.evaluate(() => {
  const g = window.vocabGame;
  g.state.hasWokenUp = false;
  g.startWakeUpSequence();
  const before = g._wakeUpTimers.length;
  g.cancelWakeUpSequence();
  return { before, after: g._wakeUpTimers.length, waking: g.isWakingUp };
});
check(`đặt ${wake.before} hẹn giờ, huỷ sạch khi rời phòng`,
  wake.before > 0 && wake.after === 0 && wake.waking === false, JSON.stringify(wake));

// ---------------------------------------------------------------------------
log('\n=== 8. NHIỆM VỤ TRAO ĐÚNG XP + ĐIỂM, KHÔNG TRAO TRÙNG ===');
await boot({ clear: true });
const quest = await page.evaluate(() => {
  const g = window.vocabGame;
  const before = { xp: g.state.questManager.xp, score: g.state.score };
  ['desk', 'chair', 'laptop', 'coffee', 'clock'].forEach(id => g.state.markDiscovered(id));
  const after = { xp: g.state.questManager.xp, score: g.state.score };
  return {
    done: g.state.questManager.completedQuests.has('q_bedroom_morning'),
    dXP: after.xp - before.xp,
    dScore: after.score - before.score,
    reclaim: g.state.questManager.claimQuest('q_bedroom_morning')
  };
});
check('nhiệm vụ q_bedroom_morning được ghi nhận hoàn thành', quest.done);
check(`XP tăng +${quest.dXP} (nhiệm vụ thưởng 150)`, quest.dXP >= 150);
check(`điểm tăng +${quest.dScore} (5 từ × 100 + thưởng 200)`, quest.dScore >= 700);
check('không nhận thưởng lần hai', quest.reclaim === null);

// ---------------------------------------------------------------------------
log('\n=== 9. CÀI ĐẶT ĐƯỢC GHI NHỚ QUA LẦN TẢI LẠI ===');
await page.evaluate(() => {
  const g = window.vocabGame;
  g.state.sensitivity = 9;
  g.state.langMode = 'chinese';
  g.state.soundFX.enabled = false;
  g.setCameraMode('first_person');
  g.state.saveStorage();
});
await boot();
const settings = await page.evaluate(() => {
  const g = window.vocabGame;
  return {
    sensitivity: g.state.sensitivity,
    langMode: g.state.langMode,
    sound: g.state.soundFX.enabled,
    cameraMode: g.cameraMode,
    uiSens: document.getElementById('settingMouseSensitivity').value,
    uiLang: document.getElementById('settingLangMode').value,
    uiCam: document.getElementById('settingCameraMode').value,
    uiSfx: document.getElementById('settingSfxToggle').checked
  };
});
check('độ nhạy chuột = 9', settings.sensitivity === 9, JSON.stringify(settings));
check('chế độ ngôn ngữ = chinese', settings.langMode === 'chinese');
check('âm thanh vẫn tắt', settings.sound === false);
check('góc nhìn = first_person', settings.cameraMode === 'first_person');
check('các ô trong bảng Cài đặt khớp trạng thái đã lưu',
  settings.uiSens === '9' && settings.uiLang === 'chinese' &&
  settings.uiCam === 'first_person' && settings.uiSfx === false, JSON.stringify(settings));

// ---------------------------------------------------------------------------
log('\n=== 10. CHẾ ĐỘ NGÔN NGỮ THẬT SỰ ĐỔI NỘI DUNG THẺ TỪ VỰNG ===');
const langVis = await page.evaluate(() => {
  const g = window.vocabGame;
  const visible = id => {
    const el = document.getElementById(id);
    return !!el && el.getClientRects().length > 0;
  };
  const out = {};
  ['both', 'chinese', 'english'].forEach(mode => {
    g.state.langMode = mode;
    g.applyLangMode();
    g.openVocabModal('desk');
    out[mode] = { pinyin: visible('modalPinyin'), english: visible('modalEnglish') };
    g.closeVocabModal(true);
  });
  return out;
});
check('both → hiện cả bính âm lẫn tiếng Anh',
  langVis.both.pinyin && langVis.both.english, JSON.stringify(langVis));
check('chinese → ẩn dòng tiếng Anh',
  langVis.chinese.pinyin && !langVis.chinese.english, JSON.stringify(langVis));
check('english → ẩn dòng bính âm',
  !langVis.english.pinyin && langVis.english.english, JSON.stringify(langVis));

// ---------------------------------------------------------------------------
log('\n============== KẾT QUẢ ==============');
if (!problems.length) {
  log('✅ TOÀN BỘ KIỂM TRA RUNTIME ĐỀU ĐẠT');
} else {
  problems.forEach(p => log(' ❌ ' + p));
}

await browser.close();
process.exit(problems.length ? 1 : 0);
