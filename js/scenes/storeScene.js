/**
 * ============================================================================
 * ZONE 5: CỬA HÀNG TIỆN LỢI (便利商店 - CONVENIENCE STORE) SCENE BUILDER
 * ============================================================================
 * Chặng khám phá đầu tiên trong thành phố: người chơi bước từ đại lộ vào
 * cửa hàng tiện lợi, khám phá 10 món hàng rồi ra lại đường phố — lúc đó
 * cổng công viên mới mở.
 */

/* global THREE */

import { createRoundedBoxGeometry } from '../utils/textures.js';

export function buildStoreScene(game) {
  const isMobile = game.state?.device?.isMobile || false;

  const roomW = 11.0;   // trục X
  const roomL = 9.0;    // trục Z
  const roomH = 3.2;
  game.roomBounds = { minX: -4.9, maxX: 4.9, minZ: -3.9, maxZ: 4.0 };

  const doorX = 0;            // cửa ra vào nằm trên tường trước (+Z)
  const doorW = 2.0;
  const doorH = 2.6;

  // --- Vật liệu chung ---
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.92 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.95 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.3, metalness: 0.75 });
  const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.6 });
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe, roughness: 0.05, metalness: 0.25,
    transparent: true, opacity: 0.32
  });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });

  const goodsPalette = [
    0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7,
    0xec4899, 0x14b8a6, 0xf97316, 0x84cc16, 0x0ea5e9
  ];

  /** Xếp một hàng "hộp hàng hoá" nhiều màu lên mặt kệ. */
  const fillGoodsRow = (parent, y, z, x0, x1, count, w, h, d, seed = 0) => {
    const step = (x1 - x0) / count;
    for (let i = 0; i < count; i++) {
      const box = new THREE.Mesh(
        createRoundedBoxGeometry(w, h, d, 0.012, 2),
        new THREE.MeshStandardMaterial({
          color: goodsPalette[(i + seed) % goodsPalette.length],
          roughness: 0.55
        })
      );
      box.position.set(x0 + step * (i + 0.5), y + h / 2, z);
      parent.add(box);
    }
  };

  // ==========================================================================
  // 1. SÀN GẠCH VINYL BÓNG
  // ==========================================================================
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 256;
  const fctx = floorCanvas.getContext('2d');
  fctx.fillStyle = '#f1f5f9';
  fctx.fillRect(0, 0, 256, 256);
  fctx.strokeStyle = 'rgba(148,163,184,0.55)';
  fctx.lineWidth = 3;
  for (let i = 0; i <= 2; i++) {
    fctx.beginPath(); fctx.moveTo(i * 128, 0); fctx.lineTo(i * 128, 256); fctx.stroke();
    fctx.beginPath(); fctx.moveTo(0, i * 128); fctx.lineTo(256, i * 128); fctx.stroke();
  }
  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(5, 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.22, metalness: 0.08 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  game.scene.add(floor);

  // ==========================================================================
  // 2. TRẦN & DÀN ĐÈN HUỲNH QUANG
  // ==========================================================================
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), ceilMat);
  ceil.position.y = roomH;
  ceil.rotation.x = Math.PI / 2;
  game.scene.add(ceil);

  const tubeRows = isMobile ? [-2.0, 1.4] : [-2.8, -0.6, 1.6, 3.2];
  tubeRows.forEach((tz, i) => {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(roomW - 1.6, 0.08, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf1f8ff, emissiveIntensity: 1.0 }));
    tube.position.set(0, roomH - 0.06, tz);
    game.scene.add(tube);
    if (!isMobile || i % 2 === 0) {
      const l = new THREE.PointLight(0xf2f8ff, 0.85, 12, 1.3);
      l.position.set(0, roomH - 0.35, tz);
      game.scene.add(l);
    }
  });

  // ==========================================================================
  // 3. TƯỜNG (tường trước chừa ô cửa ra vào)
  // ==========================================================================
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.16), wallMat);
  backWall.position.set(0, roomH / 2, -roomL / 2);
  backWall.receiveShadow = true;
  game.scene.add(backWall);

  [-1, 1].forEach(side => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH, roomL), wallMat);
    w.position.set(side * roomW / 2, roomH / 2, 0);
    game.scene.add(w);
  });

  // Tường trước: hai mảng tường + kính lớn hai bên ô cửa
  const frontZ = roomL / 2;
  const segL = roomW / 2 + doorX - doorW / 2;
  const wallFL = new THREE.Mesh(new THREE.BoxGeometry(segL, roomH, 0.16), wallMat);
  wallFL.position.set(-roomW / 2 + segL / 2, roomH / 2, frontZ);
  game.scene.add(wallFL);
  const segR = roomW / 2 - doorX - doorW / 2;
  const wallFR = new THREE.Mesh(new THREE.BoxGeometry(segR, roomH, 0.16), wallMat);
  wallFR.position.set(roomW / 2 - segR / 2, roomH / 2, frontZ);
  game.scene.add(wallFR);
  const wallFTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, roomH - doorH, 0.16), wallMat);
  wallFTop.position.set(doorX, roomH - (roomH - doorH) / 2, frontZ);
  game.scene.add(wallFTop);

  // Kính mặt tiền nhìn ra đại lộ
  [[-3.4, 3.0], [3.4, 3.0]].forEach(([gx, gw]) => {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(gw, 1.9), glassMat);
    pane.position.set(gx, 1.55, frontZ - 0.1);
    pane.rotation.y = Math.PI;
    game.scene.add(pane);
    const frame = new THREE.Mesh(createRoundedBoxGeometry(gw + 0.1, 0.08, 0.08, 0.02, 2), darkSteelMat);
    frame.position.set(gx, 0.58, frontZ - 0.1);
    game.scene.add(frame);
    const frameTop = frame.clone();
    frameTop.position.y = 2.52;
    game.scene.add(frameTop);
  });

  // ==========================================================================
  // 4. TỦ MÁT ĐỒ UỐNG (冰櫃) — chạy dọc tường sau
  // ==========================================================================
  const coolerGroup = new THREE.Group();
  const coolerW = 6.6, coolerH = 2.35, coolerD = 0.9;
  const coolerShell = new THREE.Mesh(createRoundedBoxGeometry(coolerW, coolerH, coolerD, 0.05, 3), steelMat);
  coolerShell.position.set(0, coolerH / 2, 0);
  coolerShell.castShadow = true;
  coolerGroup.add(coolerShell);

  // Ba cánh kính tủ mát
  for (let d = -1; d <= 1; d++) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.95), glassMat);
    pane.position.set(d * 2.15, 1.2, coolerD / 2 + 0.01);
    coolerGroup.add(pane);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 10), darkSteelMat);
    handle.position.set(d * 2.15 + 0.9, 1.2, coolerD / 2 + 0.05);
    coolerGroup.add(handle);
  }

  // Ánh sáng lạnh hắt ra từ trong tủ
  const coolerLight = new THREE.PointLight(0xbfe6ff, 0.9, 6, 1.6);
  coolerLight.position.set(0, 1.6, coolerD / 2 + 0.5);
  coolerGroup.add(coolerLight);

  // Nhãn 冰櫃 phát sáng trên nóc tủ
  const coolerSign = new THREE.Mesh(createRoundedBoxGeometry(coolerW - 0.6, 0.34, 0.1, 0.04, 2),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.9 }));
  coolerSign.position.set(0, coolerH + 0.22, coolerD / 2 - 0.1);
  coolerGroup.add(coolerSign);

  coolerGroup.position.set(0, 0, -roomL / 2 + coolerD / 2 + 0.1);
  game.registerInteractable(coolerGroup, 'sh_fridge');
  game.scene.add(coolerGroup);

  // ==========================================================================
  // 5. ĐỒ UỐNG (飲料) — giá chai lon trước tủ mát
  // ==========================================================================
  const drinkGroup = new THREE.Group();
  const drinkRack = new THREE.Mesh(createRoundedBoxGeometry(2.2, 0.06, 0.55, 0.02, 2), shelfMat);
  drinkRack.position.set(0, 0.95, 0);
  drinkGroup.add(drinkRack);
  const drinkRack2 = drinkRack.clone();
  drinkRack2.position.y = 1.55;
  drinkGroup.add(drinkRack2);
  [-1.05, 1.05].forEach(px => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.05), darkSteelMat);
    post.position.set(px, 0.85, 0);
    drinkGroup.add(post);
  });
  [0.98, 1.58].forEach((by, row) => {
    for (let i = 0; i < 7; i++) {
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.34, 12),
        new THREE.MeshStandardMaterial({
          color: goodsPalette[(i + row * 3) % goodsPalette.length],
          roughness: 0.25, metalness: 0.1
        }));
      bottle.position.set(-0.9 + i * 0.3, by + 0.17, 0);
      drinkGroup.add(bottle);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.07, 10), darkSteelMat);
      cap.position.set(-0.9 + i * 0.3, by + 0.38, 0);
      drinkGroup.add(cap);
    }
  });
  drinkGroup.position.set(-3.0, 0, -2.4);
  game.registerInteractable(drinkGroup, 'sh_drink');
  game.scene.add(drinkGroup);

  // ==========================================================================
  // 6. KỆ HÀNG (貨架) — dãy kệ giữa cửa hàng
  // ==========================================================================
  const makeGondola = (len = 3.4, tiers = 4) => {
    const g = new THREE.Group();
    const base = new THREE.Mesh(createRoundedBoxGeometry(len, 0.18, 0.9, 0.03, 2), darkSteelMat);
    base.position.y = 0.09;
    g.add(base);
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(len, 1.85, 0.06), shelfMat);
    backPanel.position.set(0, 1.05, 0);
    g.add(backPanel);
    for (let t = 0; t < tiers; t++) {
      const y = 0.42 + t * 0.44;
      [-1, 1].forEach(side => {
        const board = new THREE.Mesh(createRoundedBoxGeometry(len, 0.045, 0.4, 0.015, 2), shelfMat);
        board.position.set(0, y, side * 0.24);
        board.castShadow = true;
        g.add(board);
      });
    }
    [-len / 2 + 0.05, len / 2 - 0.05].forEach(px => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.0, 0.86), darkSteelMat);
      post.position.set(px, 1.0, 0);
      g.add(post);
    });
    return g;
  };

  const shelfA = makeGondola(3.4, 4);
  for (let t = 0; t < 4; t++) {
    const y = 0.42 + t * 0.44 + 0.022;
    fillGoodsRow(shelfA, y, 0.24, -1.6, 1.6, 8, 0.3, 0.3, 0.24, t);
    fillGoodsRow(shelfA, y, -0.24, -1.6, 1.6, 8, 0.3, 0.3, 0.24, t + 4);
  }
  shelfA.position.set(-2.4, 0, 0.6);
  game.registerInteractable(shelfA, 'sh_shelf');
  game.scene.add(shelfA);

  // ==========================================================================
  // 7. MÌ ĂN LIỀN (泡麵) — dãy kệ ly mì
  // ==========================================================================
  const noodleGroup = makeGondola(3.0, 3);
  for (let t = 0; t < 3; t++) {
    const y = 0.42 + t * 0.44 + 0.022;
    [-1, 1].forEach(side => {
      for (let i = 0; i < 7; i++) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.3, 14),
          new THREE.MeshStandardMaterial({ color: (i % 2) ? 0xdc2626 : 0xf5f5f4, roughness: 0.6 }));
        cup.position.set(-1.35 + i * 0.45, y + 0.15, side * 0.24);
        noodleGroup.add(cup);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.03, 14),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45, metalness: 0.4 }));
        lid.position.set(-1.35 + i * 0.45, y + 0.31, side * 0.24);
        noodleGroup.add(lid);
      }
    });
  }
  noodleGroup.position.set(1.4, 0, 0.6);
  game.registerInteractable(noodleGroup, 'sh_noodle');
  game.scene.add(noodleGroup);

  // ==========================================================================
  // 8. ĐỒ ĂN VẶT (零食) — kệ treo túi snack sát tường trái
  // ==========================================================================
  const snackGroup = new THREE.Group();
  const snackFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 2.6), darkSteelMat);
  snackFrame.position.set(0, 1.15, 0);
  snackGroup.add(snackFrame);
  for (let row = 0; row < 4; row++) {
    const hookBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.5, 8), steelMat);
    hookBar.rotation.x = Math.PI / 2;
    hookBar.position.set(0.12, 0.65 + row * 0.5, 0);
    snackGroup.add(hookBar);
    for (let i = 0; i < 6; i++) {
      const bag = new THREE.Mesh(createRoundedBoxGeometry(0.06, 0.34, 0.3, 0.05, 2),
        new THREE.MeshStandardMaterial({
          color: goodsPalette[(i + row * 2) % goodsPalette.length],
          roughness: 0.35, metalness: 0.25
        }));
      bag.position.set(0.2, 0.65 + row * 0.5 - 0.2, -1.05 + i * 0.42);
      snackGroup.add(bag);
    }
  }
  snackGroup.position.set(-roomW / 2 + 0.16, 0, 2.0);
  game.registerInteractable(snackGroup, 'sh_snack');
  game.scene.add(snackGroup);

  // ==========================================================================
  // 9. BÁNH MÌ (麵包) — quầy gỗ bày bánh
  // ==========================================================================
  const breadGroup = new THREE.Group();
  const breadCase = new THREE.Mesh(createRoundedBoxGeometry(2.2, 0.9, 0.75, 0.04, 2), woodMat);
  breadCase.position.y = 0.45;
  breadCase.castShadow = true;
  breadGroup.add(breadCase);
  const breadTop = new THREE.Mesh(createRoundedBoxGeometry(2.3, 0.06, 0.85, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 }));
  breadTop.position.y = 0.93;
  breadGroup.add(breadTop);
  for (let i = 0; i < 5; i++) {
    const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd9a066 : 0xc98a4b, roughness: 0.85 }));
    loaf.scale.set(1.5, 0.75, 1.0);
    loaf.position.set(-0.8 + i * 0.4, 1.06, -0.15);
    breadGroup.add(loaf);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xe8b475, roughness: 0.85 }));
    bun.scale.set(1.2, 0.8, 1.0);
    bun.position.set(-0.8 + i * 0.4, 1.02, 0.22);
    breadGroup.add(bun);
  }
  const breadSign = new THREE.Mesh(createRoundedBoxGeometry(1.0, 0.24, 0.05, 0.03, 2),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.5 }));
  breadSign.position.set(0, 1.45, -0.3);
  breadGroup.add(breadSign);
  breadGroup.position.set(roomW / 2 - 1.3, 0, -2.0);
  breadGroup.rotation.y = -Math.PI / 2;
  game.registerInteractable(breadGroup, 'sh_bread');
  game.scene.add(breadGroup);

  // ==========================================================================
  // 10. QUẦY THU NGÂN (收銀台) — ngay bên phải cửa ra vào
  // ==========================================================================
  const counterGroup = new THREE.Group();
  const counterBody = new THREE.Mesh(createRoundedBoxGeometry(2.8, 1.0, 0.8, 0.04, 3),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 }));
  counterBody.position.y = 0.5;
  counterBody.castShadow = true;
  counterGroup.add(counterBody);
  const counterTop = new THREE.Mesh(createRoundedBoxGeometry(3.0, 0.08, 0.95, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.25, metalness: 0.15 }));
  counterTop.position.y = 1.03;
  counterGroup.add(counterTop);
  const counterStripe = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.12, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.45 }));
  counterStripe.position.set(0, 0.78, 0.41);
  counterGroup.add(counterStripe);
  counterGroup.position.set(2.6, 0, 2.6);
  game.registerInteractable(counterGroup, 'sh_counter');
  game.scene.add(counterGroup);

  // ==========================================================================
  // 11. MÁY TÍNH TIỀN (收銀機) — đặt trên mặt quầy
  // ==========================================================================
  const registerGroup = new THREE.Group();
  const regBody = new THREE.Mesh(createRoundedBoxGeometry(0.5, 0.28, 0.42, 0.03, 2), darkSteelMat);
  regBody.position.y = 0.14;
  registerGroup.add(regBody);
  const regScreen = new THREE.Mesh(createRoundedBoxGeometry(0.42, 0.3, 0.04, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
  regScreen.position.set(0, 0.44, -0.08);
  regScreen.rotation.x = -0.22;
  registerGroup.add(regScreen);
  const regGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 1.1 }));
  regGlow.position.set(0, 0.44, -0.05);
  regGlow.rotation.x = -0.22;
  registerGroup.add(regGlow);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.07),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 }));
      key.position.set(-0.15 + c * 0.1, 0.29, 0.02 + r * 0.09);
      registerGroup.add(key);
    }
  }
  registerGroup.position.set(2.6, 1.07, 2.6);
  game.registerInteractable(registerGroup, 'sh_register');
  game.scene.add(registerGroup);

  // ==========================================================================
  // 12. TIỀN (錢) — khay tiền lẻ cạnh máy tính tiền
  // ==========================================================================
  const moneyGroup = new THREE.Group();
  const tray = new THREE.Mesh(createRoundedBoxGeometry(0.62, 0.06, 0.4, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 }));
  tray.position.y = 0.03;
  moneyGroup.add(tray);
  [[-0.16, 0xfef9c3], [0.02, 0xbbf7d0], [0.2, 0xfecaca]].forEach(([bx, col]) => {
    const notes = new THREE.Mesh(createRoundedBoxGeometry(0.15, 0.05, 0.3, 0.01, 2),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 }));
    notes.position.set(bx, 0.085, 0);
    moneyGroup.add(notes);
  });
  for (let i = 0; i < 5; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.9 }));
    coin.position.set(0.36, 0.07 + i * 0.013, -0.06 + (i % 2) * 0.12);
    moneyGroup.add(coin);
  }
  moneyGroup.position.set(1.65, 1.07, 2.75);
  game.registerInteractable(moneyGroup, 'sh_money');
  game.scene.add(moneyGroup);

  // ==========================================================================
  // 13. GIỎ MUA HÀNG (購物籃) — chồng giỏ cạnh cửa vào
  // ==========================================================================
  const basketGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const basket = new THREE.Group();
    const shellMat = new THREE.MeshStandardMaterial({
      color: i % 2 ? 0xdc2626 : 0xb91c1c, roughness: 0.55
    });
    const bottom = new THREE.Mesh(createRoundedBoxGeometry(0.52, 0.04, 0.36, 0.02, 2), shellMat);
    basket.add(bottom);
    [[0, -0.18, 0.52, 0.04], [0, 0.18, 0.52, 0.04]].forEach(([bx, bz, bw, bd]) => {
      const wall = new THREE.Mesh(createRoundedBoxGeometry(bw, 0.22, bd, 0.01, 2), shellMat);
      wall.position.set(bx, 0.11, bz);
      basket.add(wall);
    });
    [[-0.26, 0], [0.26, 0]].forEach(([bx, bz]) => {
      const wall = new THREE.Mesh(createRoundedBoxGeometry(0.04, 0.22, 0.36, 0.01, 2), shellMat);
      wall.position.set(bx, 0.11, bz);
      basket.add(wall);
    });
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 16, Math.PI), darkSteelMat);
    handle.position.set(0, 0.23, 0);
    handle.rotation.y = Math.PI / 2;
    basket.add(handle);
    basket.position.y = i * 0.16;
    basket.rotation.y = i * 0.05;
    basketGroup.add(basket);
  }
  basketGroup.position.set(-1.6, 0, 3.1);
  game.registerInteractable(basketGroup, 'sh_basket');
  game.scene.add(basketGroup);

  // ==========================================================================
  // 14. TRANG TRÍ PHỤ: thùng rác, ghế cao, thảm chùi chân
  // ==========================================================================
  game.placeZoneModel('sh_trashcan', { x: -4.2, y: 0, z: 3.3 },
    { targetHeight: 0.62, alignBottomY: true }, () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.55, 18), darkSteelMat);
      body.position.y = 0.28;
      g.add(body);
      return g;
    });

  game.placeZoneModel('sh_stool', { x: 4.0, y: 0, z: 1.4 },
    { targetHeight: 0.75, alignBottomY: true }, () => {
      const g = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), woodMat);
      seat.position.y = 0.72;
      g.add(seat);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 12), darkSteelMat);
      pole.position.y = 0.36;
      g.add(pole);
      return g;
    });

  game.placeZoneModel('sh_rug', { x: doorX, y: 0.01, z: roomL / 2 - 0.9 },
    { targetWidth: 1.6, alignBottomY: true }, () => {
      const g = new THREE.Group();
      const mat0 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 }));
      mat0.rotation.x = -Math.PI / 2;
      g.add(mat0);
      return g;
    });

  // ==========================================================================
  // 15. CỬA TỰ ĐỘNG RA LẠI ĐẠI LỘ (回去)
  // ==========================================================================
  const exitGate = new THREE.Group();
  [-1, 1].forEach(side => {
    const post = new THREE.Mesh(createRoundedBoxGeometry(0.12, doorH, 0.22, 0.02, 2), darkSteelMat);
    post.position.set(side * (doorW / 2 - 0.06), doorH / 2, 0);
    exitGate.add(post);
    // Hai cánh kính trượt
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(doorW / 2 - 0.14, doorH - 0.24), glassMat);
    leaf.position.set(side * doorW / 4, doorH / 2, -0.02);
    exitGate.add(leaf);
  });
  const gateTop = new THREE.Mesh(createRoundedBoxGeometry(doorW + 0.1, 0.16, 0.24, 0.02, 2), darkSteelMat);
  gateTop.position.set(0, doorH - 0.08, 0);
  exitGate.add(gateTop);

  const exitSignBox = new THREE.Mesh(createRoundedBoxGeometry(1.0, 0.26, 0.07, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  exitSignBox.position.set(0, doorH + 0.2, -0.06);
  exitGate.add(exitSignBox);
  const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.19),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2 }));
  exitSign.position.set(0, doorH + 0.2, -0.1);
  exitSign.rotation.y = Math.PI;
  exitGate.add(exitSign);
  const exitLight = new THREE.PointLight(0x38bdf8, 0.6, 4, 1.5);
  exitLight.position.set(0, doorH + 0.25, -0.4);
  exitGate.add(exitLight);

  exitGate.position.set(doorX, 0, roomL / 2 - 0.1);
  game.scene.add(exitGate);
  game.registerGate(exitGate, 'back_door', 'street', { direction: 'back', label: 'Ra Lại Đại Lộ' });

  game.buildPlayerAvatar();

  game.colliders = [
    { name: 'cooler', minX: -3.4, maxX: 3.4, minZ: -4.5, maxZ: -3.4 },
    { name: 'drink_rack', minX: -4.2, maxX: -1.8, minZ: -2.8, maxZ: -2.0 },
    { name: 'shelf_a', minX: -4.2, maxX: -0.6, minZ: 0.1, maxZ: 1.1 },
    { name: 'shelf_noodle', minX: -0.2, maxX: 3.0, minZ: 0.1, maxZ: 1.1 },
    { name: 'snack_rack', minX: -5.0, maxX: -4.2, minZ: 0.6, maxZ: 3.4 },
    { name: 'bread_case', minX: 3.7, maxX: 4.9, minZ: -3.2, maxZ: -0.8 },
    { name: 'counter', minX: 1.1, maxX: 4.1, minZ: 2.1, maxZ: 3.1 },
    { name: 'basket_stack', minX: -1.95, maxX: -1.25, minZ: 2.85, maxZ: 3.35 }
  ];
}
