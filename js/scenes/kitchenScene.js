/**
 * ============================================================================
 * ZONE 3: PHÒNG BẾP (廚房 - KITCHEN) SCENE BUILDER
 * ============================================================================
 */

/* global THREE */

import {
  createWoodTexture,
  createRoundedBoxGeometry
} from '../utils/textures.js';

export function buildKitchenScene(game) {
  const roomW = 9.0;
  const roomL = 7.6;
  const roomH = 3.4;
  game.roomBounds = { minX: -4.0, maxX: 4.0, minZ: -3.3, maxZ: 3.3 };

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
  const splashMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.15 });
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.25, metalness: 0.25 });
  const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5 });
  const woodMat = new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.5 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.2, metalness: 0.85 });

  // 1. Checkered tile floor
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 256;
  const fctx = floorCanvas.getContext('2d');
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      fctx.fillStyle = ((x + y) % 2 === 0) ? '#e7e5e4' : '#d6d3d1';
      fctx.fillRect(x * 64, y * 64, 64, 64);
    }
  }
  fctx.strokeStyle = 'rgba(120,113,108,0.45)';
  fctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    fctx.beginPath(); fctx.moveTo(i * 64, 0); fctx.lineTo(i * 64, 256); fctx.stroke();
    fctx.beginPath(); fctx.moveTo(0, i * 64); fctx.lineTo(256, i * 64); fctx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(3, 2.5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  game.scene.add(floor);

  // 2. Ceiling & Lights
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), wallMat);
  ceil.position.y = roomH;
  ceil.rotation.x = Math.PI / 2;
  game.scene.add(ceil);
  [[-2.2, -1.0], [2.2, -1.0], [-2.2, 1.6], [2.2, 1.6]].forEach(([lx, lz]) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4e0, emissiveIntensity: 0.9 }));
    panel.position.set(lx, roomH - 0.04, lz);
    game.scene.add(panel);
    const l = new THREE.PointLight(0xfff2dd, 0.85, 8, 1.3);
    l.position.set(lx, roomH - 0.25, lz);
    game.scene.add(l);
  });

  // 3. Walls
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.16), wallMat);
  backWall.position.set(0, roomH / 2, -roomL / 2);
  backWall.receiveShadow = true;
  game.scene.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH, roomL), wallMat);
  leftWall.position.set(-roomW / 2, roomH / 2, 0);
  game.scene.add(leftWall);

  const gapW = 1.5, gapH = 2.6;
  const livDoorZ = 2.4;
  const rSegA = roomL / 2 + livDoorZ - gapW / 2;
  const rwA = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH, rSegA), wallMat);
  rwA.position.set(roomW / 2, roomH / 2, -roomL / 2 + rSegA / 2);
  game.scene.add(rwA);
  const rSegB = roomL / 2 - livDoorZ - gapW / 2;
  const rwB = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH, rSegB), wallMat);
  rwB.position.set(roomW / 2, roomH / 2, roomL / 2 - rSegB / 2);
  game.scene.add(rwB);
  const rwTop = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH - gapH, gapW), wallMat);
  rwTop.position.set(roomW / 2, roomH - (roomH - gapH) / 2, livDoorZ);
  game.scene.add(rwTop);

  const frontDoorX = -2.6;
  const fSegA = roomW / 2 + frontDoorX - gapW / 2;
  const fwA = new THREE.Mesh(new THREE.BoxGeometry(fSegA, roomH, 0.16), wallMat);
  fwA.position.set(-roomW / 2 + fSegA / 2, roomH / 2, roomL / 2);
  game.scene.add(fwA);
  const fSegB = roomW / 2 - frontDoorX - gapW / 2;
  const fwB = new THREE.Mesh(new THREE.BoxGeometry(fSegB, roomH, 0.16), wallMat);
  fwB.position.set(roomW / 2 - fSegB / 2, roomH / 2, roomL / 2);
  game.scene.add(fwB);
  const fwTop = new THREE.Mesh(new THREE.BoxGeometry(gapW, roomH - gapH, 0.16), wallMat);
  fwTop.position.set(frontDoorX, roomH - (roomH - gapH) / 2, roomL / 2);
  game.scene.add(fwTop);

  // 4. Backsplash
  const splash = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.95, 0.03), splashMat);
  splash.position.set(-0.6, 1.42, -roomL / 2 + 0.09);
  game.scene.add(splash);

  // 5. Kitchen Counter
  const counterZ = -roomL / 2 + 0.42;
  [[-4.00, -2.98], [-2.02, 0.34], [1.26, 2.80]].forEach(([x0, x1]) => {
    const seg = new THREE.Mesh(createRoundedBoxGeometry(x1 - x0, 0.06, 0.72, 0.02, 3), counterMat);
    seg.position.set((x0 + x1) / 2, 0.92, counterZ);
    seg.castShadow = true;
    game.scene.add(seg);
  });

  const cabinetXs = [-3.4, -1.6, -0.7, 1.6, 2.4];
  cabinetXs.forEach((cx, i) => {
    const modelId = (i % 2 === 0) ? 'kt_cabinet' : 'kt_cabinetDrawer';
    game.placeZoneModel(modelId, { x: cx, y: 0, z: counterZ }, { targetHeight: 0.9, alignBottomY: true }, () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(createRoundedBoxGeometry(0.86, 0.88, 0.68, 0.02, 2), cabinetMat);
      body.position.y = 0.44; body.castShadow = true; g.add(body);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 10), steelMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, 0.72, 0.36); g.add(handle);
      return g;
    });
  });

  // Interactive Cabinet
  const cabinetProp = new THREE.Group();
  const cabBody = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.9, 0.7, 0.03, 3), cabinetMat);
  cabBody.position.y = 0.45; cabBody.castShadow = true;
  cabinetProp.add(cabBody);
  for (let dy of [0.28, 0.62]) {
    const dh = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.4, 12), steelMat);
    dh.rotation.z = Math.PI / 2; dh.position.set(0, dy, 0.37);
    cabinetProp.add(dh);
  }
  cabinetProp.position.set(-0.7, 0, counterZ);
  game.registerInteractable(cabinetProp, 'kt_cabinet');
  game.scene.add(cabinetProp);

  // Upper Cabinets
  [-3.2, -2.2, 1.6, 2.6].forEach(cx => {
    game.placeZoneModel('kt_cabinetUpper', { x: cx, y: 1.95, z: -roomL / 2 + 0.28 },
      { targetHeight: 0.72, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(createRoundedBoxGeometry(0.94, 0.7, 0.36, 0.02, 2), cabinetMat);
        body.position.y = 0.35; g.add(body);
        return g;
      });
  });

  // 6. Sink
  const sink = game.placeZoneModel('kt_sink', { x: -2.5, y: 0.0, z: counterZ }, { targetHeight: 0.95, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const base = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.9, 0.68, 0.02, 2), cabinetMat);
    base.position.y = 0.45; g.add(base);
    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.46), steelMat);
    basin.position.y = 0.94; g.add(basin);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.4), new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.7 }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0.98; g.add(water);
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 12), steelMat);
    tap.position.set(0, 1.14, -0.24); g.add(tap);
    const spout = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 20, Math.PI), steelMat);
    spout.position.set(0, 1.30, -0.13); spout.rotation.y = Math.PI / 2; g.add(spout);
    return g;
  });
  if (sink) game.registerInteractable(sink, 'kt_sink');

  // 7. Stove & Hood
  const stove = game.placeZoneModel('kt_stove', { x: 0.8, y: 0, z: counterZ }, { targetHeight: 0.95, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.9, 0.68, 0.02, 2), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.35, metalness: 0.5 }));
    body.position.y = 0.45; g.add(body);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.66), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.3 }));
    top.position.y = 0.92; g.add(top);
    [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.18], [0.2, 0.18]].forEach(([bx, bz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 8, 24), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(bx, 0.95, bz); g.add(ring);
    });
    const flame = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24), new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 1.6 }));
    flame.rotation.x = -Math.PI / 2; flame.position.set(-0.2, 0.96, -0.16); g.add(flame);
    return g;
  });
  if (stove) game.registerInteractable(stove, 'kt_stove');

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.18, 20), steelMat);
  pot.position.set(0.6, 1.02, counterZ - 0.16);
  game.scene.add(pot);
  const stoveGlow = new THREE.PointLight(0xfb923c, 0.5, 2.2, 2);
  stoveGlow.position.set(0.6, 1.0, counterZ);
  game.scene.add(stoveGlow);

  game.placeZoneModel('kt_hood', { x: 0.8, y: 1.85, z: -roomL / 2 + 0.3 }, { targetHeight: 0.85, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 0.4, 4), steelMat);
    funnel.rotation.y = Math.PI / 4; funnel.position.y = 0.2; g.add(funnel);
    const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.26), steelMat);
    pipe.position.y = 0.66; g.add(pipe);
    return g;
  });

  // 8. Microwave
  const micro = game.placeZoneModel('kt_microwave', { x: 2.0, y: 0.95, z: counterZ - 0.05 }, { targetHeight: 0.34, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(createRoundedBoxGeometry(0.62, 0.34, 0.42, 0.02, 2), new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.3, metalness: 0.6 }));
    body.position.y = 0.17; g.add(body);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.22), new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x1f2937, emissiveIntensity: 0.6, roughness: 0.1 }));
    win.position.set(-0.08, 0.18, 0.212); g.add(win);
    return g;
  });
  if (micro) game.registerInteractable(micro, 'kt_microwave');

  // 9. Refrigerator
  const fridge = game.placeZoneModel('kt_fridge', { x: 3.4, y: 0, z: -roomL / 2 + 0.55 }, { targetHeight: 1.95, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(createRoundedBoxGeometry(0.92, 1.95, 0.75, 0.05, 3), new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.25, metalness: 0.7 }));
    body.position.y = 0.98; body.castShadow = true; g.add(body);
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: 0x9ca3af }));
    seam.position.set(0, 1.32, 0.38); g.add(seam);
    for (let hy of [1.55, 1.05]) {
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 12), steelMat);
      h.position.set(0.34, hy, 0.39); g.add(h);
    }
    return g;
  });
  if (fridge) game.registerInteractable(fridge, 'kt_fridge');

  // 10. Left Side Counter: Coffee Machine, Toaster, Blender
  const sideCounterZ = -0.4;
  const sideTop = new THREE.Mesh(createRoundedBoxGeometry(0.72, 0.06, 2.6, 0.02, 3), counterMat);
  sideTop.position.set(-roomW / 2 + 0.45, 0.92, sideCounterZ);
  game.scene.add(sideTop);
  for (let cz of [-1.3, -0.4, 0.5]) {
    game.placeZoneModel('kt_cabinet', { x: -roomW / 2 + 0.45, y: 0, z: cz }, { targetHeight: 0.9, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(createRoundedBoxGeometry(0.68, 0.88, 0.86, 0.02, 2), cabinetMat);
      body.position.y = 0.44; g.add(body);
      return g;
    });
  }

  const coffeeM = game.placeZoneModel('kt_coffeeMachine', { x: -roomW / 2 + 0.5, y: 0.95, z: -1.2 }, { targetHeight: 0.4, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(createRoundedBoxGeometry(0.3, 0.42, 0.26, 0.03, 3), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.5 }));
    body.position.y = 0.21; g.add(body);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.07, 14), new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.3 }));
    cup.position.set(0.16, 0.06, 0); g.add(cup);
    const led = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.03), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1.4 }));
    led.position.set(0.152, 0.32, 0); led.rotation.y = Math.PI / 2; g.add(led);
    return g;
  });
  if (coffeeM) game.registerInteractable(coffeeM, 'kt_coffeeMachine');

  const toaster = game.placeZoneModel('kt_toaster', { x: -roomW / 2 + 0.5, y: 0.95, z: -0.35 }, { targetHeight: 0.24, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(createRoundedBoxGeometry(0.34, 0.22, 0.2, 0.04, 3), steelMat);
    body.position.y = 0.11; g.add(body);
    for (let bx of [-0.07, 0.07]) {
      const slice = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: 0xd6a05a, roughness: 0.9 }));
      slice.position.set(bx, 0.26, 0); g.add(slice);
    }
    return g;
  });
  if (toaster) game.registerInteractable(toaster, 'kt_toaster');

  const blender = game.placeZoneModel('kt_blender', { x: -roomW / 2 + 0.5, y: 0.95, z: 0.5 }, { targetHeight: 0.42, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
    const g = new THREE.Group();
    const base = new THREE.Mesh(createRoundedBoxGeometry(0.2, 0.12, 0.2, 0.03, 3), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4 }));
    base.position.y = 0.06; g.add(base);
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.26, 16), new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.05, transparent: true, opacity: 0.6 }));
    jar.position.y = 0.25; g.add(jar);
    const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.066, 0.14, 16), new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.4 }));
    juice.position.y = 0.2; g.add(juice);
    return g;
  });
  if (blender) game.registerInteractable(blender, 'kt_blender');

  // 11. Dining Table & Chairs
  const table = game.placeZoneModel('kt_table', { x: 0.6, y: 0, z: 1.4 }, { targetHeight: 0.76, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const top = new THREE.Mesh(createRoundedBoxGeometry(1.7, 0.07, 1.0, 0.03, 3), woodMat);
    top.position.y = 0.72; top.castShadow = true; g.add(top);
    [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.7, 12), woodMat);
      leg.position.set(lx, 0.35, lz); g.add(leg);
    });
    return g;
  });
  if (table) game.registerInteractable(table, 'kt_table');

  [[-0.35, 1.4, Math.PI / 2], [1.55, 1.4, -Math.PI / 2], [0.6, 0.55, 0], [0.6, 2.25, Math.PI]].forEach(([cx, cz, ry]) => {
    game.placeZoneModel('kt_chair', { x: cx, y: 0, z: cz }, { targetHeight: 0.92, alignBottomY: true, rotationY: ry }, () => {
      const g = new THREE.Group();
      const seat = new THREE.Mesh(createRoundedBoxGeometry(0.42, 0.06, 0.42, 0.02, 2), woodMat);
      seat.position.y = 0.46; g.add(seat);
      const back = new THREE.Mesh(createRoundedBoxGeometry(0.42, 0.44, 0.05, 0.02, 2), woodMat);
      back.position.set(0, 0.7, -0.18); g.add(back);
      [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 10), woodMat);
        leg.position.set(lx, 0.23, lz); g.add(leg);
      });
      g.rotation.y = ry;
      return g;
    });
  });

  [[0.15, 1.15], [1.05, 1.65]].forEach(([px, pz]) => {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.025, 24), new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25 }));
    plate.position.set(px, 0.79, pz);
    game.scene.add(plate);
  });

  // 12. Trashcan
  const trash = game.placeZoneModel('kt_trashcan', { x: 3.3, y: 0, z: 1.9 }, { targetHeight: 0.62, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.55, 20), new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.4, metalness: 0.5 }));
    body.position.y = 0.28; g.add(body);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.35, metalness: 0.6 }));
    lid.position.y = 0.58; g.add(lid);
    return g;
  });
  if (trash) game.registerInteractable(trash, 'kt_trashcan');

  // 13. Back Gate (to Living Room)
  const backGate = new THREE.Group();
  const bgFrameMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45 });
  [[-0.72], [0.72]].forEach(([px]) => {
    const post = new THREE.Mesh(createRoundedBoxGeometry(0.1, gapH, 0.16, 0.02, 2), bgFrameMat);
    post.position.set(px, gapH / 2, 0); backGate.add(post);
  });
  const bgTop = new THREE.Mesh(createRoundedBoxGeometry(1.54, 0.12, 0.16, 0.02, 2), bgFrameMat);
  bgTop.position.set(0, gapH - 0.06, 0); backGate.add(bgTop);
  const bgSign = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2 }));
  bgSign.position.set(0, gapH + 0.18, 0.09); backGate.add(bgSign);
  const bgLight = new THREE.PointLight(0x38bdf8, 0.5, 3, 1.5);
  bgLight.position.set(0, gapH + 0.22, 0.3); backGate.add(bgLight);
  backGate.rotation.y = -Math.PI / 2;
  backGate.position.set(roomW / 2 - 0.12, 0, livDoorZ);
  game.scene.add(backGate);
  game.registerGate(backGate, 'back_door', 'living', { direction: 'back', label: 'Quay Lại Phòng Khách' });

  // 14. Cửa sau căn nhà (chỉ trang trí — bếp là ngõ cụt, lối ra là phòng khách)
  const frontGate = new THREE.Group();
  const fgFrame = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  const fgLeafMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.5 });
  [[-0.72], [0.72]].forEach(([px]) => {
    const post = new THREE.Mesh(createRoundedBoxGeometry(0.11, gapH, 0.18, 0.02, 2), fgFrame);
    post.position.set(px, gapH / 2, 0); frontGate.add(post);
  });
  const fgTop = new THREE.Mesh(createRoundedBoxGeometry(1.56, 0.13, 0.18, 0.02, 2), fgFrame);
  fgTop.position.set(0, gapH - 0.065, 0); frontGate.add(fgTop);
  const fgLeaf = new THREE.Mesh(createRoundedBoxGeometry(1.28, gapH - 0.16, 0.07, 0.02, 2), fgLeafMat);
  fgLeaf.position.set(0, (gapH - 0.16) / 2, 0); frontGate.add(fgLeaf);
  const fgWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xbfdbfe, emissive: 0x93c5fd, emissiveIntensity: 0.55, roughness: 0.1 }));
  fgWindow.position.set(0, 1.85, 0.04); frontGate.add(fgWindow);
  const fgKnob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.9 }));
  fgKnob.position.set(0.48, 1.15, 0.06); frontGate.add(fgKnob);
  const fgSignBox = new THREE.Mesh(createRoundedBoxGeometry(0.86, 0.24, 0.06, 0.02, 2), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  fgSignBox.position.set(0, gapH + 0.2, 0.05); frontGate.add(fgSignBox);
  const fgSign = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.17),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 }));
  fgSign.position.set(0, gapH + 0.2, 0.085);
  frontGate.add(fgSign);
  frontGate.rotation.y = Math.PI;
  frontGate.position.set(frontDoorX, 0, roomL / 2 - 0.12);
  game.scene.add(frontGate);

  game.placeZoneModel('kt_rug', { x: frontDoorX, y: 0.008, z: roomL / 2 - 0.85 }, { targetWidth: 1.05, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const mat0 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 }));
    mat0.rotation.x = -Math.PI / 2; g.add(mat0);
    return g;
  });

  game.buildPlayerAvatar();

  game.colliders = [
    { name: 'counter_run', minX: -4.0, maxX: 2.6, minZ: -3.9, maxZ: -3.3 },
    { name: 'fridge', minX: 2.9, maxX: 3.9, minZ: -3.9, maxZ: -2.9 },
    { name: 'side_counter', minX: -4.1, maxX: -3.3, minZ: -1.8, maxZ: 0.95 },
    { name: 'dining_table', minX: -0.35, maxX: 1.55, minZ: 0.8, maxZ: 2.0 },
    { name: 'trashcan', minX: 3.05, maxX: 3.55, minZ: 1.65, maxZ: 2.15 }
  ];
}
