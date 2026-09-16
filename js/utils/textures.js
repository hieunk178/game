/**
 * ============================================================================
 * PROCEDURAL TEXTURE & GEOMETRY GENERATORS
 * ============================================================================
 */

/* global THREE */

export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 0, 512, 512);

  // Wood grain lines
  ctx.fillStyle = 'rgba(60, 35, 15, 0.15)';
  for (let i = 0; i < 500; i++) {
    const y = Math.random() * 512;
    const h = Math.random() * 6 + 1;
    ctx.fillRect(0, y, 512, h);
  }

  // Parquet planks
  ctx.strokeStyle = 'rgba(40, 20, 10, 0.4)';
  ctx.lineWidth = 2;
  const plankW = 128;
  const plankH = 32;
  for (let x = 0; x < 512; x += plankW) {
    for (let y = 0; y < 512; y += plankH) {
      ctx.strokeRect(x, y, plankW, plankH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createRugTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2c4b69';
  ctx.fillRect(0, 0, 512, 512);

  // Intricate geometric mandala pattern
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 220, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 170, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.fillRect(-15, 60, 30, 90);
    ctx.restore();
  }

  return new THREE.CanvasTexture(canvas);
}

export function createOnyxMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base background: soft pearl grey stone with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  bgGrad.addColorStop(0, '#ebe6db');
  bgGrad.addColorStop(0.5, '#dad3c3');
  bgGrad.addColorStop(1, '#eee9de');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Golden amber glowing clouds in center
  const centerGrad = ctx.createRadialGradient(512, 512, 60, 512, 512, 480);
  centerGrad.addColorStop(0, 'rgba(240, 180, 45, 0.7)');
  centerGrad.addColorStop(0.3, 'rgba(220, 145, 25, 0.5)');
  centerGrad.addColorStop(0.65, 'rgba(180, 105, 18, 0.3)');
  centerGrad.addColorStop(1, 'rgba(110, 80, 30, 0)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Bookmatched symmetry: draw symmetric gold & dark marble veins
  function drawVein(points, color, width, blur = 0) {
    ctx.save();
    if (blur > 0) ctx.filter = `blur(${blur}px)`;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Left half
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Mirror right half (bookmatch)
    ctx.beginPath();
    ctx.moveTo(1024 - points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(1024 - points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Organic marble veining patterns
  for (let v = 0; v < 16; v++) {
    const pts = [];
    let x = 512 - (v * 24 + (v % 2) * 20);
    let y = 0;
    pts.push({ x, y });
    while (y < 1024) {
      y += 45 + ((v * 17) % 50);
      x += ((v % 3) - 1) * 35 + ((y % 11) - 5) * 6;
      pts.push({ x, y });
    }
    const isGold = v % 3 !== 0;
    const col = isGold 
      ? 'rgba(230, 170, 35, 0.65)'
      : 'rgba(50, 60, 70, 0.45)';
    drawVein(pts, col, isGold ? 10 : 6, 2);
    drawVein(pts, isGold ? '#ffe680' : '#ffffff', isGold ? 3 : 2, 0);
  }

  return new THREE.CanvasTexture(canvas);
}

export function createLuxuryRugTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm beige/cream woven base
  ctx.fillStyle = '#e8e2d8';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle cross-hatch woven texture
  ctx.fillStyle = 'rgba(190, 180, 165, 0.3)';
  for (let x = 0; x < 512; x += 4) {
    ctx.fillRect(x, 0, 2, 512);
  }
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 2);
  }

  // Elegant subtle border
  ctx.strokeStyle = '#cbbeab';
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 480, 480);
  ctx.strokeStyle = '#dfd5c5';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 448, 448);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createDarkWalnutTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich dark walnut base (gỗ óc chó)
  ctx.fillStyle = '#3a2012';
  ctx.fillRect(0, 0, 512, 512);

  // Fine organic wood grain lines
  ctx.fillStyle = 'rgba(25, 12, 6, 0.35)';
  for (let i = 0; i < 400; i++) {
    const y = Math.random() * 512;
    const h = Math.random() * 5 + 1;
    ctx.fillRect(0, y, 512, h);
  }

  // Warm amber grain highlights
  ctx.fillStyle = 'rgba(160, 95, 45, 0.15)';
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * 512;
    const h = Math.random() * 3 + 1;
    ctx.fillRect(0, y, 512, h);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createLeatherTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich dark chocolate / espresso leather base
  ctx.fillStyle = '#381e11';
  ctx.fillRect(0, 0, 512, 512);

  // Leather grain cells / pore pattern
  for (let i = 0; i < 2200; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const cr = Math.random() * 2.5 + 0.8;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(20, 10, 5, 0.4)' : 'rgba(90, 50, 25, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle leather creasing lines
  ctx.strokeStyle = 'rgba(20, 10, 5, 0.18)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 35; i++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.moveTo(x, y);
    for (let j = 0; j < 4; j++) {
      x += (Math.random() - 0.5) * 45;
      y += (Math.random() - 0.5) * 45;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createRoundedBoxGeometry(width, height, depth, radius = 0.04, smoothness = 3) {
  const r = Math.min(radius, width / 2 - 0.001, height / 2 - 0.001, depth / 2 - 0.001);
  const shape = new THREE.Shape();
  const w = width - r * 2;
  const h = height - r * 2;
  const x = -w / 2;
  const y = -h / 2;

  shape.absarc(x + w, y + h, r, 0, Math.PI / 2, false);
  shape.absarc(x, y + h, r, Math.PI / 2, Math.PI, false);
  shape.absarc(x, y, r, Math.PI, Math.PI * 3 / 2, false);
  shape.absarc(x + w, y, r, Math.PI * 3 / 2, Math.PI * 2, false);

  const extrudeSettings = {
    depth: Math.max(depth - r * 2, 0.01),
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
    curveSegments: smoothness * 2
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  return geometry;
}

export function createAbstractArtTexture(theme = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  if (theme === 0) {
    // Golden Marble & Midnight Blue Abstract
    const grad = ctx.createLinearGradient(0, 0, 512, 700);
    grad.addColorStop(0, '#081426');
    grad.addColorStop(0.5, '#162e4c');
    grad.addColorStop(1, '#0a101d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 700);

    // Gold swirling liquid arcs
    ctx.lineWidth = 26;
    ctx.strokeStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(256, 350, 180, 0.2, Math.PI * 1.4);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffe082';
    ctx.beginPath();
    ctx.arc(256, 350, 220, 0.8, Math.PI * 1.8);
    ctx.stroke();

    // Fluid gold & white wave strokes
    ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.bezierCurveTo(200, 300, 100, 500, 450, 600);
    ctx.bezierCurveTo(300, 400, 400, 200, 50, 100);
    ctx.fill();
  } else if (theme === 1) {
    // Warm Amber & Minimalist Bauhaus Shapes
    const grad = ctx.createLinearGradient(0, 0, 512, 700);
    grad.addColorStop(0, '#faf7f2');
    grad.addColorStop(1, '#ede5d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 700);

    // Bold terracotta and dark walnut circles & arches
    ctx.fillStyle = '#c85a32';
    ctx.beginPath();
    ctx.arc(256, 260, 140, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#2c1810';
    ctx.beginPath();
    ctx.arc(256, 440, 110, 0, Math.PI * 2);
    ctx.fill();

    // Golden accent circle
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(380, 200, 45, 0, Math.PI * 2);
    ctx.fill();

    // Modern black minimalist line
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(80, 580);
    ctx.lineTo(432, 580);
    ctx.stroke();
  } else {
    // Emerald & Gold Luxury Geode
    const grad = ctx.createRadialGradient(256, 350, 50, 256, 350, 320);
    grad.addColorStop(0, '#042f2e');
    grad.addColorStop(0.6, '#0f766e');
    grad.addColorStop(1, '#021e1d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 700);

    // Gold veining
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(120, 50);
    ctx.bezierCurveTo(300, 200, 150, 450, 380, 650);
    ctx.stroke();

    ctx.strokeStyle = '#fff8db';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(120, 50);
    ctx.bezierCurveTo(300, 200, 150, 450, 380, 650);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

export function createScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // IDE / App UI background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 320);

  // Window top bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 36);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(20, 18, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.arc(40, 18, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#10b981';
  ctx.beginPath(); ctx.arc(60, 18, 6, 0, Math.PI * 2); ctx.fill();

  // Code lines & Vocab preview
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('TOCFL Flash Cards 3D', 80, 24);

  ctx.fillStyle = '#a855f7';
  ctx.font = '16px monospace';
  ctx.fillText('import { Learn } from "chinese";', 25, 75);

  ctx.fillStyle = '#3b82f6';
  ctx.fillText('const todayVocab = [', 25, 110);
  ctx.fillStyle = '#22c55e';
  ctx.fillText('  "桌子", "椅子", "電腦", "檯燈"', 45, 140);
  ctx.fillStyle = '#3b82f6';
  ctx.fillText('];', 25, 170);

  ctx.fillStyle = '#f59e0b';
  ctx.fillText('console.log("Score: 100%!");', 25, 210);

  // Glowing logo
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.fillRect(320, 60, 160, 220);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('學習', 365, 175);

  return new THREE.CanvasTexture(canvas);
}

export function createWindowSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.6, '#93c5fd');
  grad.addColorStop(1, '#fef08a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Sun
  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.arc(380, 120, 50, 0, Math.PI * 2);
  ctx.fill();

  // Mountains in distance
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.lineTo(150, 300);
  ctx.lineTo(280, 380);
  ctx.lineTo(440, 270);
  ctx.lineTo(512, 390);
  ctx.lineTo(512, 512);
  ctx.lineTo(0, 512);
  ctx.fill();

  // Fluffy clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(140, 160, 40, 0, Math.PI * 2);
  ctx.arc(180, 150, 55, 0, Math.PI * 2);
  ctx.arc(230, 160, 45, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

export function createBackpackFabricTexture(baseHex = '#1e3a8a', patternHex = '#172554', accentHex = '#38bdf8') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base High-Density Oxford Weave
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Diamond Ripstop Grid Weave Texture
  ctx.fillStyle = patternHex;
  const grid = 20;
  for (let x = 0; x < 512; x += grid) {
    for (let y = 0; y < 512; y += grid) {
      ctx.fillRect(x + 1, y + 1, grid - 2, grid - 2);
    }
  }

  // Micro-fiber weave noise
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 2500; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Double Stitched Seams along borders
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(14, 14, 484, 484);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.strokeRect(22, 22, 468, 468);
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createClockFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.stroke();

  // Hour numbers
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  numbers.forEach((num, i) => {
    const angle = (i * Math.PI) / 6 - Math.PI / 2;
    const x = 128 + Math.cos(angle) * 90;
    const y = 128 + Math.sin(angle) * 90;
    ctx.fillText(num.toString(), x, y);
  });

  return new THREE.CanvasTexture(canvas);
}
