/**
 * ============================================================================
 * ZONE 2: PHÒNG KHÁCH (客廳 - LIVING ROOM) SCENE BUILDER
 * ============================================================================
 */

/* global THREE */

import {
  createDarkWalnutTexture,
  createOnyxMarbleTexture,
  createLuxuryRugTexture,
  createLeatherTexture,
  createRoundedBoxGeometry,
  createAbstractArtTexture
} from '../utils/textures.js';

export function buildLivingScene(game) {
  const roomW = 10.0;
  const roomL = 10.0;
  const roomH = 4.0;
  const gapW = 1.45;
  const gapH = 2.85;

  game.roomBounds = { minX: -4.6, maxX: 4.6, minZ: -4.6, maxZ: 4.6 };

  // Textures
  const walnutTex = createDarkWalnutTexture();
  walnutTex.repeat.set(3, 3);
  const floorMat = new THREE.MeshStandardMaterial({ map: walnutTex, roughness: 0.35, metalness: 0.05 });

  const onyxTex = createOnyxMarbleTexture();
  const onyxMat = new THREE.MeshStandardMaterial({ map: onyxTex, roughness: 0.12, metalness: 0.08 });

  const rugTex = createLuxuryRugTexture();
  rugTex.repeat.set(1, 1);
  const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.9 });

  const leatherTex = createLeatherTexture();
  leatherTex.repeat.set(2, 2);
  const leatherMat = new THREE.MeshStandardMaterial({ map: leatherTex, color: 0x5a321c, roughness: 0.55 });
  const leatherDarkMat = new THREE.MeshStandardMaterial({ map: leatherTex, color: 0x3d2012, roughness: 0.6 });

  const darkWoodMat = new THREE.MeshStandardMaterial({ map: walnutTex, color: 0x422414, roughness: 0.4, metalness: 0.05 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9 });
  const whitePlasterMat = new THREE.MeshStandardMaterial({ color: 0xf6f3ed, roughness: 0.9 });
  const glassBlackMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.03, metalness: 0.3 });

  // 1. Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  game.scene.add(floor);

  // 2. Ceiling
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.16, roomL), whitePlasterMat);
  ceiling.position.set(0, roomH, 0);
  game.scene.add(ceiling);

  const trayCeil = new THREE.Mesh(new THREE.BoxGeometry(roomW - 1.6, 0.14, roomL - 1.6), whitePlasterMat);
  trayCeil.position.set(0, roomH + 0.08, 0);
  game.scene.add(trayCeil);

  // Warm Cove Lights
  const coveLight1 = new THREE.PointLight(0xffd59e, 1.4, 11, 1.3);
  coveLight1.position.set(0, roomH - 0.05, -2.2);
  game.scene.add(coveLight1);
  const coveLight2 = new THREE.PointLight(0xffd59e, 1.4, 11, 1.3);
  coveLight2.position.set(0, roomH - 0.05, 1.8);
  game.scene.add(coveLight2);

  // 3. Walls
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.18), darkWoodMat);
  backWall.position.set(0, roomH / 2, -roomL / 2);
  backWall.receiveShadow = true;
  game.scene.add(backWall);

  // Tường trước có hai ô cửa: lối quay về phòng ngủ và cửa lớn ra thành phố
  const bedDoorX = -3.0;                 // lối sang phòng ngủ (chặng 1)
  const cityDoorX = 1.6;                 // cửa lớn ra đại lộ (chặng 4)
  const cityGapW = 2.1;
  const cityGapH = 3.15;

  const frontOpenings = [
    { x: bedDoorX, w: gapW, h: gapH },
    { x: cityDoorX, w: cityGapW, h: cityGapH }
  ].sort((a, b) => a.x - b.x);

  // Các mảng tường đặc xen giữa những ô cửa
  let cursorX = -roomW / 2;
  frontOpenings.forEach(op => {
    const segW = (op.x - op.w / 2) - cursorX;
    if (segW > 0.01) {
      const seg = new THREE.Mesh(new THREE.BoxGeometry(segW, roomH, 0.18), whitePlasterMat);
      seg.position.set(cursorX + segW / 2, roomH / 2, roomL / 2);
      game.scene.add(seg);
    }
    // Lanh tô phía trên mỗi ô cửa
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(op.w, roomH - op.h, 0.18), whitePlasterMat);
    lintel.position.set(op.x, roomH - (roomH - op.h) / 2, roomL / 2);
    game.scene.add(lintel);
    cursorX = op.x + op.w / 2;
  });
  const lastSegW = roomW / 2 - cursorX;
  if (lastSegW > 0.01) {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(lastSegW, roomH, 0.18), whitePlasterMat);
    seg.position.set(cursorX + lastSegW / 2, roomH / 2, roomL / 2);
    game.scene.add(seg);
  }

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH, roomL), whitePlasterMat);
  leftWall.position.set(-roomW / 2, roomH / 2, 0);
  game.scene.add(leftWall);

  const kDoorZ = 2.6;
  const kGapW = 1.5;
  const kGapH = 2.85;
  const rightSegA = (roomL / 2 + kDoorZ - kGapW / 2);
  const rightWallA = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH, rightSegA), whitePlasterMat);
  rightWallA.position.set(roomW / 2, roomH / 2, -roomL / 2 + rightSegA / 2);
  game.scene.add(rightWallA);
  const rightSegB = (roomL / 2 - kDoorZ - kGapW / 2);
  const rightWallB = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH, rightSegB), whitePlasterMat);
  rightWallB.position.set(roomW / 2, roomH / 2, roomL / 2 - rightSegB / 2);
  game.scene.add(rightWallB);
  const rightWallTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH - kGapH, kGapW), whitePlasterMat);
  rightWallTop.position.set(roomW / 2, roomH - (roomH - kGapH) / 2, kDoorZ);
  game.scene.add(rightWallTop);

  // Helper to place GLB or fallback
  const placeModel = (id, pos, opts = {}, fallbackFn = null) => {
    return game.placeZoneModel(id, pos, opts, fallbackFn);
  };

  // 4. Back Wall: Onyx Slab + TV + Credenza + Display Shelves
  const marbleW = 4.8;
  const marbleH = 3.2;
  const onyxGeo = createRoundedBoxGeometry(marbleW, marbleH, 0.06, 0.08, 4);
  const onyxSlab = new THREE.Mesh(onyxGeo, onyxMat);
  onyxSlab.position.set(0, 1.95, -roomL / 2 + 0.08);
  game.scene.add(onyxSlab);

  const goldFrameGeo = createRoundedBoxGeometry(marbleW + 0.12, marbleH + 0.12, 0.04, 0.09, 3);
  const goldFrame = new THREE.Mesh(goldFrameGeo, goldMat);
  goldFrame.position.set(0, 1.95, -roomL / 2 + 0.05);
  game.scene.add(goldFrame);

  const onyxGlow = new THREE.PointLight(0xffb703, 1.6, 7.5, 1.2);
  onyxGlow.position.set(0, 2.1, -roomL / 2 + 0.35);
  game.scene.add(onyxGlow);

  // 75-inch TV
  const tvGroup = new THREE.Group();
  const tvFrameGeo = createRoundedBoxGeometry(2.35, 1.35, 0.05, 0.03, 3);
  const tvFrame = new THREE.Mesh(tvFrameGeo, new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.15 }));
  tvGroup.add(tvFrame);
  const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.25), new THREE.MeshStandardMaterial({ color: 0x060c18, emissive: 0x081224, emissiveIntensity: 0.5 }));
  tvScreen.position.z = 0.03;
  tvGroup.add(tvScreen);
  tvGroup.position.set(0, 1.95, -roomL / 2 + 0.18);
  game.registerInteractable(tvGroup, 'lr_tv');
  game.scene.add(tvGroup);

  // TV Credenza
  const credenzaGroup = new THREE.Group();
  const credenzaMainGeo = createRoundedBoxGeometry(4.2, 0.48, 0.52, 0.06, 4);
  const credenzaMain = new THREE.Mesh(credenzaMainGeo, darkWoodMat);
  credenzaMain.position.y = 0.26;
  credenzaMain.castShadow = true;
  credenzaGroup.add(credenzaMain);
  const credenzaPlinth = new THREE.Mesh(createRoundedBoxGeometry(4.0, 0.04, 0.46, 0.02, 2), goldMat);
  credenzaPlinth.position.y = 0.02;
  credenzaGroup.add(credenzaPlinth);
  credenzaGroup.position.set(0, 0, -roomL / 2 + 0.48);
  game.scene.add(credenzaGroup);

  // Display Cabinets (Left & Right)
  const buildDisplayCabinet = (side) => {
    const cabX = side * 3.4;
    const cabGroup = new THREE.Group();

    const backP = new THREE.Mesh(createRoundedBoxGeometry(1.6, 3.6, 0.03, 0.02, 2), darkWoodMat);
    backP.position.set(0, 1.8, -0.22);
    cabGroup.add(backP);

    for (let sx of [-0.78, 0.78]) {
      const sideP = new THREE.Mesh(createRoundedBoxGeometry(0.04, 3.6, 0.44, 0.02, 2), darkWoodMat);
      sideP.position.set(sx, 1.8, 0);
      cabGroup.add(sideP);
      const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.02, 3.6, 0.02), goldMat);
      goldTrim.position.set(sx, 1.8, 0.22);
      cabGroup.add(goldTrim);
    }

    for (let sy of [0.03, 3.58]) {
      const cap = new THREE.Mesh(createRoundedBoxGeometry(1.6, 0.06, 0.46, 0.02, 2), darkWoodMat);
      cap.position.set(0, sy, 0);
      cabGroup.add(cap);
      const goldCapTrim = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.02), goldMat);
      goldCapTrim.position.set(0, sy, 0.23);
      cabGroup.add(goldCapTrim);
    }

    const shelfYs = [0.7, 1.4, 2.1, 2.8];
    shelfYs.forEach(sy => {
      const shelf = new THREE.Mesh(createRoundedBoxGeometry(1.52, 0.03, 0.42, 0.01, 2), darkWoodMat);
      shelf.position.set(0, sy, 0);
      cabGroup.add(shelf);
      const goldShelfTrim = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.015, 0.015), goldMat);
      goldShelfTrim.position.set(0, sy, 0.21);
      cabGroup.add(goldShelfTrim);

      const spot = new THREE.PointLight(0xffd875, 0.5, 1.6, 1.8);
      spot.position.set(0, sy + 0.55, 0.08);
      cabGroup.add(spot);
    });

    const topSpot = new THREE.PointLight(0xffd875, 0.5, 1.6, 1.8);
    topSpot.position.set(0, 3.5, 0.08);
    cabGroup.add(topSpot);

    cabGroup.position.set(cabX, 0, -roomL / 2 + 0.38);
    game.scene.add(cabGroup);
    return cabGroup;
  };

  const leftCabinet = buildDisplayCabinet(-1);
  buildDisplayCabinet(1);
  game.registerInteractable(leftCabinet, 'lr_bookcase');

  // Populate Left Display Shelves
  const lCabX = -3.4;
  const lCabZ = -roomL / 2 + 0.38;

  placeModel('lr_books', { x: lCabX - 0.35, y: 0.72, z: lCabZ }, { targetHeight: 0.38, alignBottomY: true });
  const radioProp = placeModel('lr_radio', { x: lCabX + 0.32, y: 0.72, z: lCabZ }, { targetHeight: 0.26, alignBottomY: true }, () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(createRoundedBoxGeometry(0.34, 0.22, 0.16, 0.03, 3), new THREE.MeshStandardMaterial({ color: 0x7c4a21, roughness: 0.5 }));
    body.position.y = 0.11; g.add(body);
    const grille = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.14), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 }));
    grille.position.set(-0.07, 0.11, 0.081); g.add(grille);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), goldMat);
    dial.rotation.x = Math.PI / 2; dial.position.set(0.09, 0.11, 0.082); g.add(dial);
    return g;
  });
  if (radioProp) game.registerInteractable(radioProp, 'lr_radio');

  const bearProp = placeModel('lr_bear', { x: lCabX - 0.28, y: 1.42, z: lCabZ }, { targetHeight: 0.42, alignBottomY: true, rotationY: 0.2 }, () => {
    const g = new THREE.Group();
    const furMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), furMat);
    body.position.y = 0.14; body.scale.y = 1.15; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), furMat);
    head.position.y = 0.33; g.add(head);
    [[-0.07, 0.40], [0.07, 0.40]].forEach(([ex, ey]) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), furMat);
      ear.position.set(ex, ey, 0); g.add(ear);
    });
    return g;
  });
  if (bearProp) game.registerInteractable(bearProp, 'lr_bear');
  placeModel('lr_plantSmall', { x: lCabX + 0.32, y: 1.42, z: lCabZ }, { targetHeight: 0.34, alignBottomY: true });

  placeModel('lr_plantSmall2', { x: lCabX - 0.32, y: 2.12, z: lCabZ }, { targetHeight: 0.32, alignBottomY: true });
  const goldStatue1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 0.36, 16), goldMat);
  goldStatue1.position.set(lCabX + 0.3, 2.30, lCabZ);
  game.scene.add(goldStatue1);

  placeModel('lr_plantSmall3', { x: lCabX + 0.30, y: 2.82, z: lCabZ }, { targetHeight: 0.32, alignBottomY: true });
  placeModel('lr_books', { x: lCabX - 0.32, y: 2.82, z: lCabZ }, { targetHeight: 0.36, alignBottomY: true });

  const goldVase1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.34, 16), goldMat);
  goldVase1.position.set(lCabX, 3.77, lCabZ);
  game.scene.add(goldVase1);

  // Populate Right Display Shelves
  const rCabX = 3.4;
  const rCabZ = -roomL / 2 + 0.38;

  placeModel('lr_tvVintage', { x: rCabX - 0.28, y: 0.72, z: rCabZ }, { targetHeight: 0.38, alignBottomY: true, rotationY: -0.15 });
  placeModel('lr_speakerSmall', { x: rCabX + 0.38, y: 0.72, z: rCabZ }, { targetHeight: 0.30, alignBottomY: true });

  placeModel('lr_lampTable', { x: rCabX - 0.32, y: 1.42, z: rCabZ }, { targetHeight: 0.38, alignBottomY: true });
  placeModel('lr_books', { x: rCabX + 0.32, y: 1.42, z: rCabZ }, { targetHeight: 0.36, alignBottomY: true });

  placeModel('lr_bear', { x: rCabX + 0.28, y: 2.12, z: rCabZ }, { targetHeight: 0.40, alignBottomY: true, rotationY: -0.2 });
  placeModel('lr_plantSmall', { x: rCabX - 0.32, y: 2.12, z: rCabZ }, { targetHeight: 0.32, alignBottomY: true });

  placeModel('lr_plantSmall2', { x: rCabX - 0.30, y: 2.82, z: rCabZ }, { targetHeight: 0.32, alignBottomY: true });
  const goldTrophy = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 16), goldMat);
  goldTrophy.position.set(rCabX + 0.3, 2.98, rCabZ);
  game.scene.add(goldTrophy);

  const goldVase2 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 16, 32), goldMat);
  goldVase2.position.set(rCabX, 3.77, rCabZ);
  game.scene.add(goldVase2);

  // 5. Center Lounge: Rug + Coffee Table + Sofa + Armchairs
  const rugMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 4.6), rugMat);
  rugMesh.rotation.x = -Math.PI / 2;
  rugMesh.receiveShadow = true;
  const rugGroup = new THREE.Group();
  rugGroup.add(rugMesh);
  rugMesh.position.set(0, 0.006, 0);
  rugGroup.position.set(0, 0, -1.0);
  game.registerInteractable(rugGroup, 'lr_rug');
  game.scene.add(rugGroup);

  const tableGroup = new THREE.Group();
  const tableBaseGeo = createRoundedBoxGeometry(2.35, 0.38, 1.3, 0.08, 4);
  const tableBase = new THREE.Mesh(tableBaseGeo, darkWoodMat);
  tableBase.position.y = 0.19;
  tableBase.castShadow = true;
  tableGroup.add(tableBase);
  const tableTopGeo = createRoundedBoxGeometry(2.37, 0.04, 1.32, 0.06, 4);
  const tableTop = new THREE.Mesh(tableTopGeo, glassBlackMat);
  tableTop.position.y = 0.40;
  tableGroup.add(tableTop);
  const tableGoldTrim = new THREE.Mesh(createRoundedBoxGeometry(2.39, 0.02, 1.34, 0.06, 3), goldMat);
  tableGoldTrim.position.y = 0.38;
  tableGroup.add(tableGoldTrim);
  tableGroup.position.set(0, 0, -1.0);
  game.registerInteractable(tableGroup, 'lr_coffeeTable');
  game.scene.add(tableGroup);

  placeModel('lr_plantSmall', { x: 0, y: 0.42, z: -1.0 }, { targetHeight: 0.42, alignBottomY: true });
  const trayGeo = createRoundedBoxGeometry(0.38, 0.02, 0.28, 0.02, 2);
  const tray = new THREE.Mesh(trayGeo, goldMat);
  tray.position.set(0.60, 0.43, -1.0);
  game.scene.add(tray);
  const decanter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.05, transparent: true, opacity: 0.85 }));
  decanter.position.set(0.56, 0.54, -1.0);
  game.scene.add(decanter);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.09, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.6 }));
  glass.position.set(0.68, 0.48, -1.0);
  game.scene.add(glass);

  // Left Sofa
  const sofaGroup = new THREE.Group();
  const sofaWoodBase = new THREE.Mesh(createRoundedBoxGeometry(3.9, 0.34, 1.05, 0.08, 4), darkWoodMat);
  sofaWoodBase.position.y = 0.17;
  sofaWoodBase.castShadow = true;
  sofaGroup.add(sofaWoodBase);

  for (let side of [-1, 1]) {
    const armGeo = createRoundedBoxGeometry(0.26, 0.58, 1.06, 0.08, 4);
    const arm = new THREE.Mesh(armGeo, darkWoodMat);
    arm.position.set(side * 1.82, 0.38, 0);
    arm.castShadow = true;
    sofaGroup.add(arm);
  }

  for (let i = 0; i < 3; i++) {
    const cx = (i - 1) * 1.15;
    const seatGeo = createRoundedBoxGeometry(1.12, 0.24, 0.92, 0.06, 4);
    const seatCushion = new THREE.Mesh(seatGeo, leatherMat);
    seatCushion.position.set(cx, 0.40, 0.04);
    seatCushion.castShadow = true;
    sofaGroup.add(seatCushion);

    const backGeo = createRoundedBoxGeometry(1.12, 0.62, 0.22, 0.06, 4);
    const backCushion = new THREE.Mesh(backGeo, leatherDarkMat);
    backCushion.position.set(cx, 0.68, -0.36);
    backCushion.rotation.x = -0.12;
    backCushion.castShadow = true;
    sofaGroup.add(backCushion);
  }

  for (let fx of [-1.6, 1.6]) {
    for (let fz of [-0.38, 0.38]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.16, 12), darkWoodMat);
      foot.position.set(fx, 0.06, fz);
      sofaGroup.add(foot);
    }
  }

  sofaGroup.rotation.y = Math.PI / 2;
  sofaGroup.position.set(-2.8, 0, -1.0);
  game.registerInteractable(sofaGroup, 'lr_sofa');
  game.scene.add(sofaGroup);

  // Pillows on Sofa
  for (let pz of [-2.4, -1.7, -1.0, -0.3, 0.4]) {
    const isWhite = Math.abs(pz + 1.7) < 0.1 || Math.abs(pz - 0.4) < 0.1;
    const pMat = new THREE.MeshStandardMaterial({
      color: isWhite ? 0xf8f6f0 : 0x3d2012,
      roughness: isWhite ? 0.7 : 0.55
    });
    const pGeo = createRoundedBoxGeometry(0.24, 0.40, 0.42, 0.06, 3);
    const pillowMesh = new THREE.Mesh(pGeo, pMat);
    pillowMesh.rotation.z = -0.18;
    if (Math.abs(pz + 1.0) < 0.01) {
      const pillowGroup = new THREE.Group();
      pillowGroup.add(pillowMesh);
      pillowMesh.position.set(0, 0.58, 0);
      pillowGroup.position.set(-2.85, 0, pz);
      game.registerInteractable(pillowGroup, 'lr_pillow');
      game.scene.add(pillowGroup);
    } else {
      pillowMesh.position.set(-2.85, 0.58, pz);
      game.scene.add(pillowMesh);
    }
  }

  // Right Armchairs & Side Table
  const buildLuxuryArmchair = () => {
    const g = new THREE.Group();
    const baseFrame = new THREE.Mesh(createRoundedBoxGeometry(0.98, 0.14, 0.92, 0.04, 3), darkWoodMat);
    baseFrame.position.y = 0.07;
    baseFrame.castShadow = true;
    g.add(baseFrame);

    for (let s of [-1, 1]) {
      const armGeo = createRoundedBoxGeometry(0.14, 0.58, 0.94, 0.06, 3);
      const arm = new THREE.Mesh(armGeo, darkWoodMat);
      arm.position.set(s * 0.42, 0.35, 0);
      arm.castShadow = true;
      g.add(arm);

      const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.48, 0.02), goldMat);
      goldTrim.position.set(s * 0.42, 0.35, 0.47);
      g.add(goldTrim);
    }

    const seatGeo = createRoundedBoxGeometry(0.68, 0.20, 0.78, 0.06, 3);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.set(0, 0.23, 0.05);
    seat.castShadow = true;
    g.add(seat);

    const backGeo = createRoundedBoxGeometry(0.68, 0.52, 0.18, 0.06, 3);
    const back = new THREE.Mesh(backGeo, leatherDarkMat);
    back.position.set(0, 0.56, -0.32);
    back.rotation.x = -0.15;
    back.castShadow = true;
    g.add(back);

    for (let fx of [-0.38, 0.38]) {
      for (let fz of [-0.35, 0.35]) {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.12, 12), darkWoodMat);
        foot.position.set(fx, 0.06, fz);
        g.add(foot);
      }
    }

    const pGeo = createRoundedBoxGeometry(0.28, 0.28, 0.12, 0.04, 2);
    const pillow = new THREE.Mesh(pGeo, new THREE.MeshStandardMaterial({ color: 0xf8f6f0, roughness: 0.7 }));
    pillow.position.set(0, 0.38, -0.20);
    pillow.rotation.x = -0.18;
    g.add(pillow);

    return g;
  };

  const arm1 = buildLuxuryArmchair();
  arm1.rotation.y = -Math.PI / 2;
  arm1.position.set(2.65, 0, -2.1);
  game.registerInteractable(arm1, 'lr_armchair');
  game.scene.add(arm1);

  const arm2 = buildLuxuryArmchair();
  arm2.rotation.y = -Math.PI / 2;
  arm2.position.set(2.65, 0, 0.1);
  game.scene.add(arm2);

  const sideTableGroup = new THREE.Group();
  const stTopGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32);
  const stTop = new THREE.Mesh(stTopGeo, darkWoodMat);
  stTop.position.y = 0.62;
  sideTableGroup.add(stTop);
  const stStem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.58, 16), goldMat);
  stStem.position.y = 0.31;
  sideTableGroup.add(stStem);
  const stBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 24), darkWoodMat);
  stBase.position.y = 0.02;
  sideTableGroup.add(stBase);
  sideTableGroup.position.set(2.9, 0, -1.0);
  game.scene.add(sideTableGroup);

  const vaseProp = placeModel('lr_plant',
    { x: 2.9, y: 0.65, z: -1.0 },
    { targetHeight: 0.45, alignBottomY: true },
    () => {
      const g = new THREE.Group();
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.26, 20), new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.25 }));
      vase.position.y = 0.13; g.add(vase);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0x15803d }));
        stem.position.set(Math.cos(a) * 0.03, 0.35, Math.sin(a) * 0.03);
        stem.rotation.z = Math.cos(a) * 0.2; stem.rotation.x = Math.sin(a) * 0.2;
        g.add(stem);
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshStandardMaterial({ color: [0xf472b6, 0xfbbf24, 0xf87171, 0xa78bfa, 0xfda4af][i], roughness: 0.7 }));
        bloom.position.set(Math.cos(a) * 0.06, 0.47, Math.sin(a) * 0.06);
        g.add(bloom);
      }
      return g;
    }
  );
  if (vaseProp) game.registerInteractable(vaseProp, 'lr_vase');

  // 6. Chandelier
  const chandeGroup = new THREE.Group();
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.3,
    transparent: true,
    opacity: 0.88
  });

  const tiers = [
    { radius: 0.82, y: 0.0, height: 0.16 },
    { radius: 0.56, y: -0.19, height: 0.15 },
    { radius: 0.34, y: -0.36, height: 0.13 }
  ];
  tiers.forEach(t => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(t.radius, 0.025, 12, 36), goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = t.y;
    chandeGroup.add(ring);

    const count = Math.floor(t.radius * 26);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const prismGeo = createRoundedBoxGeometry(0.04, t.height, 0.015, 0.004, 2);
      const prism = new THREE.Mesh(prismGeo, crystalMat);
      prism.position.set(Math.cos(angle) * t.radius, t.y - t.height / 2, Math.sin(angle) * t.radius);
      chandeGroup.add(prism);
    }
  });

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 12), goldMat);
  rod.position.y = 0.28;
  chandeGroup.add(rod);

  const chandeLight = new THREE.PointLight(0xffecd1, 2.2, 12, 1.2);
  chandeLight.position.set(0, -0.15, 0);
  chandeGroup.add(chandeLight);

  chandeGroup.position.set(0, roomH - 0.45, -1.0);
  game.registerInteractable(chandeGroup, 'lr_chandelier');
  game.scene.add(chandeGroup);

  for (let [lx, lz] of [[-2.5, -3.2], [2.5, -3.2], [-2.5, 1.5], [2.5, 1.5]]) {
    const spot = new THREE.PointLight(0xfff3db, 0.7, 8, 1.2);
    spot.position.set(lx, roomH - 0.15, lz);
    game.scene.add(spot);
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.05, 16), darkWoodMat);
    fixture.position.set(lx, roomH - 0.03, lz);
    game.scene.add(fixture);
  }

  // 7. Left Wall Art Paintings
  const galleryWallX = -roomW / 2 + 0.10;
  const paintings = [
    { z: -2.5, theme: 0, title: 'Midnight Gold' },
    { z: 0.0, theme: 1, title: 'Warm Bauhaus' },
    { z: 2.5, theme: 2, title: 'Emerald Geode' }
  ];

  paintings.forEach(p => {
    const artGroup = new THREE.Group();
    const frameW = 1.35;
    const frameH = 1.85;
    const backing = new THREE.Mesh(new THREE.BoxGeometry(0.04, frameH, frameW), new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.8 }));
    backing.position.set(0, 2.1, 0);
    artGroup.add(backing);

    const frameThick = 0.045;
    const frameDepth = 0.06;
    for (let fy of [2.1 + frameH / 2 - frameThick / 2, 2.1 - frameH / 2 + frameThick / 2]) {
      const bar = new THREE.Mesh(createRoundedBoxGeometry(frameDepth, frameThick, frameW, 0.01, 2), goldMat);
      bar.position.set(0.01, fy, 0);
      artGroup.add(bar);
    }
    for (let fz of [-frameW / 2 + frameThick / 2, frameW / 2 - frameThick / 2]) {
      const bar = new THREE.Mesh(createRoundedBoxGeometry(frameDepth, frameH, frameThick, 0.01, 2), goldMat);
      bar.position.set(0.01, 2.1, fz);
      artGroup.add(bar);
    }

    const canvasTex = createAbstractArtTexture(p.theme);
    const artMat = new THREE.MeshStandardMaterial({ map: canvasTex, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide });
    const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(frameW - frameThick * 2, frameH - frameThick * 2), artMat);
    canvasMesh.position.set(0.025, 2.1, 0);
    canvasMesh.rotation.y = Math.PI / 2;
    artGroup.add(canvasMesh);

    const sconceArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 12), goldMat);
    sconceArm.rotation.z = Math.PI / 2;
    sconceArm.position.set(0.14, 3.15, 0);
    artGroup.add(sconceArm);

    const sconceBar = new THREE.Mesh(createRoundedBoxGeometry(0.04, 0.03, 0.45, 0.01, 2), goldMat);
    sconceBar.position.set(0.28, 3.15, 0);
    artGroup.add(sconceBar);

    const artLight = new THREE.PointLight(0xfffae6, 0.7, 3.5, 1.8);
    artLight.position.set(0.40, 3.10, 0);
    artGroup.add(artLight);

    artGroup.position.set(galleryWallX, 0, p.z);
    if (p.theme === 1) game.registerInteractable(artGroup, 'lr_painting');
    game.scene.add(artGroup);
  });

  for (let sz of [-3.8, -1.25, 1.25, 3.8]) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.04, roomH - 0.2, 0.12), darkWoodMat);
    slat.position.set(-roomW / 2 + 0.04, roomH / 2, sz);
    game.scene.add(slat);
  }

  placeModel('plant', { x: -roomW / 2 + 0.8, y: 0, z: -roomL / 2 + 0.8 }, { targetHeight: 2.1, alignBottomY: true });

  // 8. Right Wall Moldings & Sconces
  const rightWallX = roomW / 2 - 0.05;
  for (let rz of [-2.1, 0.1]) {
    const moldGroup = new THREE.Group();
    const mW = 1.6;
    const mH = 2.4;
    const mThick = 0.02;
    for (let my of [2.0 + mH / 2, 2.0 - mH / 2]) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, mThick, mW), goldMat);
      hBar.position.set(0, my, 0);
      moldGroup.add(hBar);
    }
    for (let mz of [-mW / 2, mW / 2]) {
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, mH, mThick), goldMat);
      vBar.position.set(0, 2.0, mz);
      moldGroup.add(vBar);
    }

    const sconceBody = new THREE.Mesh(createRoundedBoxGeometry(0.04, 0.55, 0.05, 0.01, 2), goldMat);
    sconceBody.position.set(-0.02, 2.0, 0);
    moldGroup.add(sconceBody);

    const sconceLight = new THREE.PointLight(0xffd59e, 0.6, 3.5, 1.8);
    sconceLight.position.set(-0.15, 2.0, 0);
    moldGroup.add(sconceLight);

    moldGroup.position.set(rightWallX, 0, rz);
    game.scene.add(moldGroup);
  }

  // 9. Cửa quay lại Phòng Ngủ (chặng 1)
  const backDoorGroup = new THREE.Group();
  const doorRaw = game.loadedModels['lr_door'];
  if (doorRaw) {
    const doorMesh = game.fitModelToBounds(doorRaw, { targetHeight: gapH, alignBottomY: true });
    if (doorMesh) backDoorGroup.add(doorMesh);
  } else {
    const bFrameMat = darkWoodMat;
    [[-0.7, 1.35, 0.1, 2.7, 0.12], [0.7, 1.35, 0.1, 2.7, 0.12]].forEach(([x, y, w, h, d]) => {
      const post = new THREE.Mesh(createRoundedBoxGeometry(w, h, d, 0.02, 2), bFrameMat);
      post.position.set(x, y, 0); backDoorGroup.add(post);
    });
    const top = new THREE.Mesh(createRoundedBoxGeometry(1.4, 0.1, 0.12, 0.02, 2), bFrameMat);
    top.position.set(0, 2.75, 0); backDoorGroup.add(top);
    const leaf = new THREE.Mesh(createRoundedBoxGeometry(1.18, 2.62, 0.06, 0.02, 2), darkWoodMat);
    leaf.position.set(0, 1.35, 0); backDoorGroup.add(leaf);
  }

  const backSignBox = new THREE.Mesh(createRoundedBoxGeometry(0.76, 0.22, 0.06, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  backSignBox.position.set(0, 2.95, 0.05); backDoorGroup.add(backSignBox);
  const backSign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2 }));
  backSign.position.set(0, 2.95, 0.082); backDoorGroup.add(backSign);
  const backLight = new THREE.PointLight(0x38bdf8, 0.5, 3, 1.5);
  backLight.position.set(0, 3.0, 0.3); backDoorGroup.add(backLight);
  backDoorGroup.position.set(bedDoorX, 0, roomL / 2 - 0.05);
  game.scene.add(backDoorGroup);
  game.registerGate(backDoorGroup, 'back_door', 'bedroom', { direction: 'back', label: 'Quay Lại Phòng Ngủ' });

  // 10. Lối sang Phòng Bếp (chặng 3)
  const kitchenDoorGroup = new THREE.Group();
  const kdRaw = game.loadedModels['lr_door'];
  if (kdRaw) {
    const kdMesh = game.fitModelToBounds(kdRaw, { targetHeight: kGapH, alignBottomY: true });
    if (kdMesh) kitchenDoorGroup.add(kdMesh);
  } else {
    [[-0.72, 0], [0.72, 0]].forEach(([px]) => {
      const post = new THREE.Mesh(createRoundedBoxGeometry(0.1, kGapH, 0.14, 0.02, 2), darkWoodMat);
      post.position.set(px, kGapH / 2, 0); kitchenDoorGroup.add(post);
    });
    const kdTop = new THREE.Mesh(createRoundedBoxGeometry(1.54, 0.12, 0.14, 0.02, 2), darkWoodMat);
    kdTop.position.set(0, kGapH - 0.06, 0); kitchenDoorGroup.add(kdTop);
  }

  const kdSignBox = new THREE.Mesh(createRoundedBoxGeometry(0.82, 0.24, 0.06, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  kdSignBox.position.set(0, kGapH + 0.2, 0.05);
  kitchenDoorGroup.add(kdSignBox);
  const kdSign = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.17),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
  kdSign.position.set(0, kGapH + 0.2, 0.085);
  kdSign.userData.isGateSign = true;
  kitchenDoorGroup.add(kdSign);
  const kdLight = new THREE.PointLight(0xef4444, 0.6, 3.2, 1.5);
  kdLight.position.set(0, kGapH + 0.25, 0.3);
  kdLight.userData.isGateLight = true;
  kitchenDoorGroup.add(kdLight);

  const kitchenGlow = new THREE.PointLight(0xffd9a0, 0.9, 5, 1.6);
  kitchenGlow.position.set(0.5, 1.6, 0);
  kitchenDoorGroup.add(kitchenGlow);

  kitchenDoorGroup.rotation.y = -Math.PI / 2;
  kitchenDoorGroup.position.set(roomW / 2 - 0.12, 0, kDoorZ);
  game.scene.add(kitchenDoorGroup);
  game.registerGate(kitchenDoorGroup, 'kitchen_door', 'kitchen', { requireComplete: true, label: 'Sang Phòng Bếp' });
  game.applyGateLockVisual(kitchenDoorGroup, 'living');

  // 11. CỬA LỚN RA THÀNH PHỐ (大門) — chỉ mở sau khi khám phá xong cả bếp
  const cityDoorGroup = new THREE.Group();
  const cityFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.35 });

  // Khung cửa hai cánh bề thế
  [-1, 1].forEach(side => {
    const post = new THREE.Mesh(createRoundedBoxGeometry(0.16, cityGapH, 0.3, 0.03, 2), cityFrameMat);
    post.position.set(side * (cityGapW / 2 - 0.08), cityGapH / 2, 0);
    cityDoorGroup.add(post);
  });
  const cityTop = new THREE.Mesh(createRoundedBoxGeometry(cityGapW + 0.12, 0.2, 0.3, 0.03, 2), cityFrameMat);
  cityTop.position.set(0, cityGapH - 0.1, 0);
  cityDoorGroup.add(cityTop);

  // Hai cánh cửa gỗ óc chó nạm chỉ vàng
  [-1, 1].forEach(side => {
    const leafW = cityGapW / 2 - 0.14;
    const leaf = new THREE.Mesh(createRoundedBoxGeometry(leafW, cityGapH - 0.28, 0.1, 0.02, 2), darkWoodMat);
    leaf.position.set(side * cityGapW / 4, (cityGapH - 0.28) / 2, -0.02);
    cityDoorGroup.add(leaf);

    const inlay = new THREE.Mesh(new THREE.PlaneGeometry(leafW - 0.24, cityGapH - 0.9), goldMat);
    inlay.position.set(side * cityGapW / 4, (cityGapH - 0.28) / 2, -0.08);
    inlay.rotation.y = Math.PI;
    cityDoorGroup.add(inlay);

    // Ô kính mờ nhìn thoáng ra phố
    const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(leafW - 0.4, 0.75),
      new THREE.MeshStandardMaterial({
        color: 0xbfdbfe, emissive: 0x93c5fd, emissiveIntensity: 0.6, roughness: 0.1
      }));
    glassPane.position.set(side * cityGapW / 4, cityGapH - 0.85, -0.09);
    glassPane.rotation.y = Math.PI;
    cityDoorGroup.add(glassPane);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.5, 12), goldMat);
    handle.position.set(side * 0.18, 1.15, -0.11);
    cityDoorGroup.add(handle);
  });

  // Biển hiệu trạng thái (đỏ khi còn khoá, xanh khi đã mở)
  const cdSignBox = new THREE.Mesh(createRoundedBoxGeometry(1.15, 0.3, 0.07, 0.02, 2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  cdSignBox.position.set(0, cityGapH + 0.24, -0.06);
  cityDoorGroup.add(cdSignBox);
  const cdSign = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
  cdSign.position.set(0, cityGapH + 0.24, -0.1);
  cdSign.rotation.y = Math.PI;
  cdSign.userData.isGateSign = true;
  cityDoorGroup.add(cdSign);
  const cdLight = new THREE.PointLight(0xef4444, 0.7, 4, 1.5);
  cdLight.position.set(0, cityGapH + 0.3, -0.45);
  cdLight.userData.isGateLight = true;
  cityDoorGroup.add(cdLight);

  cityDoorGroup.position.set(cityDoorX, 0, roomL / 2 - 0.1);
  game.scene.add(cityDoorGroup);
  // Cửa lớn ra phố chỉ mở khi đã khám phá xong phòng bếp (chặng 3)
  game.registerGate(cityDoorGroup, 'front_door', 'street', {
    requireZoneComplete: 'kitchen',
    label: 'Ra Thành Phố'
  });
  game.applyGateLockVisual(cityDoorGroup, 'kitchen');

  game.buildPlayerAvatar();

  game.colliders = [
    { name: 'sofa_left', minX: -3.5, maxX: -2.1, minZ: -3.0, maxZ: 1.0 },
    { name: 'coffee_table', minX: -1.3, maxX: 1.3, minZ: -1.8, maxZ: -0.2 },
    { name: 'armchair_1', minX: 1.9, maxX: 3.3, minZ: -2.8, maxZ: -1.4 },
    { name: 'armchair_2', minX: 1.9, maxX: 3.3, minZ: -0.6, maxZ: 0.8 },
    { name: 'side_table', minX: 2.3, maxX: 3.4, minZ: -1.5, maxZ: -0.5 },
    { name: 'tv_credenza', minX: -2.8, maxX: 2.8, minZ: -4.9, maxZ: -4.1 },
    { name: 'cabinet_left', minX: -4.2, maxX: -2.5, minZ: -4.9, maxZ: -4.1 },
    { name: 'cabinet_right', minX: 2.5, maxX: 4.2, minZ: -4.9, maxZ: -4.1 }
  ];
}
