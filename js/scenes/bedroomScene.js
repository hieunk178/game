/**
 * ============================================================================
 * ZONE 1: PHÒNG NGỦ (臥室 - BEDROOM) SCENE BUILDER
 * ============================================================================
 */

/* global THREE */

import {
  createWoodTexture,
  createRugTexture,
  createScreenTexture,
  createClockFaceTexture,
  createWindowSkyTexture,
  createBackpackFabricTexture
} from '../utils/textures.js';

/**
 * BỐ CỤC "GÓC GAMING / STREAMER" (thiết kế lại 2026)
 *
 *          TƯỜNG BẮC z=-5  (tường accent + LED)
 *   +------------------------------------------------+
 *   | [tủ kệ treo]        |  [RÈM][CỬA SỔ][RÈM]      |
 *   | [BÀN GAMING dọc     |                          |
 * T |  tường Tây]         |        GIƯỜNG            | Đ
 * Â | [ghế xoay]          |     (đầu sát tường Bắc)  | Ô
 * Y | [kệ trưng bày]      |  [tủ đầu giường + đèn]   | N
 *   | [tủ quần áo]     ( THẢM )                      | G
 *   | [ba lô] [guitar]         [cây monstera]        |
 *   +------------------ CỬA RA ----------------------+
 *          TƯỜNG NAM z=+5
 */
export function buildBedroomScene(game) {
  const DESK_SURFACE_Y = 0.78;   // mặt bàn thật của model desk sau khi scale
  const roomW = 10;
  const roomL = 10;
  const roomH = 4.2;
  const DESK_X = -4.45;          // bàn dựa sát tường Tây
  const BED_X = 3.55;            // giường dựa tường Đông

  game.roomBounds = { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 };
  game.colliders = [
    { name: 'desk', minX: -4.95, maxX: -4.00, minZ: -2.55, maxZ: -0.15 },
    { name: 'chair', minX: -3.80, maxX: -2.90, minZ: -1.85, maxZ: -0.95 },
    { name: 'wardrobe', minX: -4.95, maxX: -4.05, minZ: 0.85, maxZ: 3.05 },
    { name: 'plant', minX: 3.55, maxX: 4.65, minZ: 1.15, maxZ: 2.25 },
    { name: 'bed', minX: 2.55, maxX: 4.95, minZ: -4.85, maxZ: -1.95 },
    { name: 'nightstand', minX: 4.25, maxX: 4.95, minZ: -1.75, maxZ: -1.05 },
    { name: 'guitar', minX: -4.9, maxX: -4.0, minZ: 3.5, maxZ: 4.4 },
    { name: 'backpack', minX: -3.3, maxX: -2.5, minZ: 3.0, maxZ: 3.8 }
  ];

  // 1. Architecture
  const floorTex = createWoodTexture();
  floorTex.repeat.set(4, 4);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.5,
    metalness: 0.1
  });
  const floorGeo = new THREE.PlaneGeometry(roomW, roomL);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  game.scene.add(floorMesh);

  // Ceiling
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
  const ceilMesh = new THREE.Mesh(floorGeo, ceilMat);
  ceilMesh.position.y = roomH;
  ceilMesh.rotation.x = Math.PI / 2;
  game.scene.add(ceilMesh);

  // Walls — 3 mặt sáng trung tính, tường Bắc là mảng accent tối làm nền cho LED
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe9edf5, roughness: 0.92 });
  const wallAccentMat = new THREE.MeshStandardMaterial({ color: 0x1b1b3a, roughness: 0.85 });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallAccentMat);
  backWall.position.set(0, roomH / 2, -roomL / 2);
  backWall.receiveShadow = true;
  game.scene.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
  frontWall.position.set(0, roomH / 2, roomL / 2);
  frontWall.rotation.y = Math.PI;
  frontWall.receiveShadow = true;
  game.scene.add(frontWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), wallMat);
  leftWall.position.set(-roomW / 2, roomH / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  game.scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), wallMat);
  rightWall.position.set(roomW / 2, roomH / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  game.scene.add(rightWall);

  // Baseboards
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const trimGeoX = new THREE.BoxGeometry(roomW, 0.16, 0.06);
  const trimGeoZ = new THREE.BoxGeometry(0.06, 0.16, roomL);

  const trimBack = new THREE.Mesh(trimGeoX, trimMat);
  trimBack.position.set(0, 0.08, -roomL / 2 + 0.03);
  game.scene.add(trimBack);

  const trimFront = new THREE.Mesh(trimGeoX, trimMat);
  trimFront.position.set(0, 0.08, roomL / 2 - 0.03);
  game.scene.add(trimFront);

  const trimLeft = new THREE.Mesh(trimGeoZ, trimMat);
  trimLeft.position.set(-roomW / 2 + 0.03, 0.08, 0);
  game.scene.add(trimLeft);

  const trimRight = new THREE.Mesh(trimGeoZ, trimMat);
  trimRight.position.set(roomW / 2 - 0.03, 0.08, 0);
  game.scene.add(trimRight);

  // LED viền tường accent + hắt sáng gầm bàn: điểm nhấn "gaming" của phòng
  const ledCyanMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.4, roughness: 0.3
  });
  const ledPinkMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6, emissive: 0xf472b6, emissiveIntensity: 1.3, roughness: 0.3
  });

  const ledTop = new THREE.Mesh(new THREE.BoxGeometry(roomW - 0.5, 0.07, 0.07), ledCyanMat);
  ledTop.position.set(0, roomH - 0.35, -roomL / 2 + 0.09);
  game.scene.add(ledTop);

  [-1, 1].forEach(side => {
    const ledV = new THREE.Mesh(new THREE.BoxGeometry(0.07, roomH - 0.9, 0.07), ledPinkMat);
    ledV.position.set(side * (roomW / 2 - 0.35), (roomH - 0.9) / 2 + 0.2, -roomL / 2 + 0.09);
    game.scene.add(ledV);
  });

  const ledDesk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.3), ledCyanMat);
  ledDesk.position.set(-roomW / 2 + 0.12, 0.16, -1.35);
  game.scene.add(ledDesk);

  const ledGlowN = new THREE.PointLight(0x22d3ee, 0.55, 7, 1.6);
  ledGlowN.position.set(0, roomH - 0.6, -roomL / 2 + 0.6);
  game.scene.add(ledGlowN);

  const ledGlowDesk = new THREE.PointLight(0x38bdf8, 0.45, 4.5, 1.8);
  ledGlowDesk.position.set(-roomW / 2 + 0.5, 0.35, -1.35);
  game.scene.add(ledGlowDesk);

  // THẢM TRẢI SÀN (地毯) — vật tương tác mới
  game.objectMeshFactories.rug = () => {
    if (game.loadedModels.rug) {
      return game.fitModelToBounds(game.loadedModels.rug, { targetWidth: 3.5, alignBottomY: true });
    }
    const rugTex = createRugTexture();
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 3.4),
      new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95, metalness: 0.02 })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    g.add(mesh);
    return g;
  };
  const rug = game.objectMeshFactories.rug();
  rug.position.set(0.30, 0.012, 0.45);
  game.registerInteractable(rug, 'rug');
  game.scene.add(rug);

  // 2. Interactive Furniture & Objects

  // 1. DESK (Bàn làm việc)
  game.objectMeshFactories.desk = () => {
    if (game.loadedModels.desk) {
      return game.fitModelToBounds(game.loadedModels.desk, { targetHeight: DESK_SURFACE_Y });
    }
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5, metalness: 0.1 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });

    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.2), woodMat);
    top.position.y = DESK_SURFACE_Y - 0.04;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const mat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.01, 0.6), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
    mat.position.set(0, DESK_SURFACE_Y + 0.005, 0.05);
    group.add(mat);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, DESK_SURFACE_Y - 0.08, 16);
    const legOffsets = [
      [-1.0, (DESK_SURFACE_Y - 0.08) / 2, -0.5],
      [1.0, (DESK_SURFACE_Y - 0.08) / 2, -0.5],
      [-1.0, (DESK_SURFACE_Y - 0.08) / 2, 0.5],
      [1.0, (DESK_SURFACE_Y - 0.08) / 2, 0.5]
    ];
    legOffsets.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      group.add(leg);
    });

    const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 1.0), woodMat);
    drawer.position.set(0.7, 0.65, 0);
    drawer.castShadow = true;
    group.add(drawer);

    return group;
  };
  const desk = game.objectMeshFactories.desk();
  desk.position.set(DESK_X, 0, -1.35);
  if (!game.loadedModels.desk) desk.rotation.y = Math.PI / 2;  // bàn dự phòng dựng theo trục X
  game.registerInteractable(desk, 'desk');
  game.scene.add(desk);

  // 2. CHAIR (Ghế xoay làm việc)
  game.objectMeshFactories.chair = () => {
    if (game.loadedModels.chair) {
      return game.fitModelToBounds(game.loadedModels.chair, { targetHeight: 1.05 });
    }
    const group = new THREE.Group();
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.85 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.65), cushionMat);
    seat.position.y = 0.52;
    seat.castShadow = true;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.08), cushionMat);
    back.position.set(0, 0.82, 0.28);
    back.castShadow = true;
    group.add(back);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.48, 16), metalMat);
    pole.position.y = 0.24;
    pole.castShadow = true;
    group.add(pole);

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.35), metalMat);
      arm.position.set(Math.sin(angle) * 0.18, 0.05, Math.cos(angle) * 0.18);
      arm.rotation.y = angle;
      group.add(arm);
    }
    return group;
  };
  const chair = game.objectMeshFactories.chair();
  chair.position.set(-3.35, 0, -1.4);
  chair.rotation.y = Math.PI / 2;         // ngồi quay vào bàn
  game.registerInteractable(chair, 'chair');
  game.scene.add(chair);

  // 3. LAPTOP (Máy tính xách tay)
  game.objectMeshFactories.laptop = () => {
    if (game.loadedModels.laptop) {
      return game.fitModelToBounds(game.loadedModels.laptop, { targetWidth: 0.50 });
    }
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const screenTex = createScreenTexture();
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.34), bodyMat);
    base.position.y = 0.01;
    base.castShadow = true;
    group.add(base);

    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.005, 0.19), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    kb.position.set(0, 0.022, -0.04);
    group.add(kb);

    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.02, -0.16);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.015), bodyMat);
    lid.position.set(0, 0.16, 0);
    lid.castShadow = true;
    lidGroup.add(lid);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.29), screenMat);
    screen.position.set(0, 0.16, 0.009);
    lidGroup.add(screen);

    lidGroup.rotation.x = THREE.MathUtils.degToRad(-20);
    group.add(lidGroup);

    return group;
  };
  const laptop = game.objectMeshFactories.laptop();
  laptop.position.set(DESK_X - 0.16, DESK_SURFACE_Y, -0.82);
  laptop.rotation.y = Math.PI / 2;
  game.registerInteractable(laptop, 'laptop');
  game.scene.add(laptop);

  // 4. DESK LAMP (Đèn bàn phát sáng)
  game.objectMeshFactories.lamp = () => {
    if (game.loadedModels.lamp) {
      return game.fitModelToBounds(game.loadedModels.lamp, { targetHeight: 0.52 });
    }
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
    const shadeOuterMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7, side: THREE.DoubleSide });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.028, 32), metalMat);
    base.position.y = 0.014;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const pBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 16), jointMat);
    pBtn.position.set(0, 0.032, 0.08);
    group.add(pBtn);

    const lowerJoint = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), jointMat);
    lowerJoint.position.set(0, 0.045, -0.04);
    group.add(lowerJoint);

    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 16), metalMat);
    arm1.position.set(0, 0.20, -0.08);
    arm1.rotation.x = -0.26;
    arm1.castShadow = true;
    group.add(arm1);

    const midJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16), jointMat);
    midJoint.position.set(0, 0.36, -0.12);
    midJoint.rotation.z = Math.PI / 2;
    group.add(midJoint);

    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 16), metalMat);
    arm2.position.set(0, 0.46, 0.03);
    arm2.rotation.x = 0.85;
    arm2.castShadow = true;
    group.add(arm2);

    const headJoint = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), jointMat);
    headJoint.position.set(0, 0.58, 0.17);
    group.add(headJoint);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0.17);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.20, 28, 1, true), shadeOuterMat);
    shade.rotation.x = Math.PI;
    shade.position.y = -0.10;
    shade.castShadow = true;
    headGroup.add(shade);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 20), bulbMat);
    bulb.position.y = -0.07;
    headGroup.add(bulb);

    group.add(headGroup);
    return group;
  };
  const lamp = game.objectMeshFactories.lamp();
  lamp.position.set(4.62, 0.50, -4.30);
  lamp.rotation.y = -0.4;
  game.registerInteractable(lamp, 'lamp');
  game.scene.add(lamp);

  game.lampLight = new THREE.SpotLight(0xfffae0, 1.8, 6, Math.PI / 3.5, 0.4, 1.2);
  game.lampLight.position.set(4.62, 1.02, -4.30);
  game.lampLight.target.position.set(3.60, 0.55, -3.60);
  game.scene.add(game.lampLight);
  game.scene.add(game.lampLight.target);

  // 5. COFFEE CUP (Tách cà phê bốc khói)
  game.objectMeshFactories.coffee = () => {
    if (game.loadedModels.coffee) {
      return game.fitModelToBounds(game.loadedModels.coffee, { targetHeight: 0.11 });
    }
    const group = new THREE.Group();
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3f2211, roughness: 0.1 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 24), cupMat);
    body.position.y = 0.06;
    body.castShadow = true;
    group.add(body);

    const liquid = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), coffeeMat);
    liquid.position.y = 0.11;
    liquid.rotation.x = -Math.PI / 2;
    group.add(liquid);

    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 12, 24), cupMat);
    handle.position.set(0.07, 0.06, 0);
    group.add(handle);

    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.015, 24), cupMat);
    saucer.position.y = 0.008;
    group.add(saucer);

    return group;
  };
  const coffee = game.objectMeshFactories.coffee();
  coffee.position.set(DESK_X + 0.18, DESK_SURFACE_Y, -0.66);
  game.registerInteractable(coffee, 'coffee');
  game.scene.add(coffee);

  // Coffee Steam Particles
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25
  });
  const steamBaseY = DESK_SURFACE_Y + 0.12;
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), smokeMat);
    p.position.set(DESK_X + 0.18 + (Math.random() - 0.5) * 0.04, steamBaseY + i * 0.06, -0.66 + (Math.random() - 0.5) * 0.04);
    p.userData = { speedY: 0.003 + Math.random() * 0.002, initY: steamBaseY, initX: DESK_X + 0.18, initZ: -0.66 };
    game.smokeParticles.push(p);
    game.scene.add(p);
  }

  // 6. WALL CLOCK (Đồng hồ treo tường)
  game.objectMeshFactories.clock = () => {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
    const innerRimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const faceTex = createClockFaceTexture();
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTex });
    const handMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const secMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 48), frameMat);
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    group.add(rim);

    const innerRim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.082, 48), innerRimMat);
    innerRim.rotation.x = Math.PI / 2;
    group.add(innerRim);

    const face = new THREE.Mesh(new THREE.CircleGeometry(0.44, 48), faceMat);
    face.position.z = 0.044;
    group.add(face);

    const hourPivot = new THREE.Group();
    hourPivot.position.set(0, 0, 0.048);
    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.22, 0.006), handMat);
    hourHand.position.y = 0.09;
    hourPivot.add(hourHand);
    hourPivot.rotation.z = -Math.PI * 0.32;
    group.add(hourPivot);

    const minPivot = new THREE.Group();
    minPivot.position.set(0, 0, 0.051);
    const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.32, 0.006), handMat);
    minHand.position.y = 0.14;
    minPivot.add(minHand);
    minPivot.rotation.z = -Math.PI * 0.02;
    group.add(minPivot);

    const secPivot = new THREE.Group();
    secPivot.position.set(0, 0, 0.054);
    const secHand = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.34, 0.004), secMat);
    secHand.position.y = 0.12;
    secPivot.add(secHand);

    const secTail = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.08, 0.004), secMat);
    secTail.position.y = -0.035;
    secPivot.add(secTail);

    group.add(secPivot);
    group.userData.secPivot = secPivot;

    const centerPin = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 24), frameMat);
    centerPin.rotation.x = Math.PI / 2;
    centerPin.position.set(0, 0, 0.058);
    group.add(centerPin);

    return group;
  };
  const clock = game.objectMeshFactories.clock();
  clock.position.set(0.1, 2.72, -4.93);
  game.clockHandSec = clock.userData.secPivot;
  game.registerInteractable(clock, 'clock');
  game.scene.add(clock);

  // 7. BOOKSHELF & BOOKS
  game.objectMeshFactories.bookshelf = () => {
    if (game.loadedModels.bookshelf) {
      return game.fitModelToBounds(game.loadedModels.bookshelf, { targetHeight: 1.02 });
    }
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c2b0c, roughness: 0.65, metalness: 0.08 });
    const backPanelMat = new THREE.MeshStandardMaterial({ color: 0x3d1c07, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });

    const frameW = 2.2;
    const frameH = 2.5;
    const frameD = 0.48;
    const wallThick = 0.06;

    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, 0.03), backPanelMat);
    backPanel.position.set(0, frameH / 2, -frameD / 2 + 0.015);
    backPanel.receiveShadow = true;
    group.add(backPanel);

    const sideL = new THREE.Mesh(new THREE.BoxGeometry(wallThick, frameH, frameD), woodMat);
    sideL.position.set(-frameW / 2 + wallThick / 2, frameH / 2, 0);
    sideL.castShadow = true;
    sideL.receiveShadow = true;
    group.add(sideL);

    const sideR = new THREE.Mesh(new THREE.BoxGeometry(wallThick, frameH, frameD), woodMat);
    sideR.position.set(frameW / 2 - wallThick / 2, frameH / 2, 0);
    sideR.castShadow = true;
    sideR.receiveShadow = true;
    group.add(sideR);

    const topCrown = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.08, wallThick + 0.02, frameD + 0.06), woodMat);
    topCrown.position.set(0, frameH - wallThick / 2, 0);
    topCrown.castShadow = true;
    group.add(topCrown);

    const bottomBase = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.04, 0.10, frameD + 0.04), woodMat);
    bottomBase.position.set(0, 0.05, 0);
    bottomBase.receiveShadow = true;
    group.add(bottomBase);

    const bookPalettes = [
      0xd97706, 0x2563eb, 0xdc2626, 0x16a34a, 0x7c3aed,
      0x0284c7, 0xe11d48, 0x059669, 0x9333ea, 0xb45309,
      0x4338ca, 0x0891b2, 0xbe123c, 0x15803d, 0x6d28d9,
      0x1e293b, 0x854d0e, 0x9f1239, 0x1e40af, 0x065f46
    ];

    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });

    const createBook = (bW, bH, bD, color, tiltZ = 0) => {
      const bGroup = new THREE.Group();
      const coverMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.15 });

      const cover = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), coverMat);
      cover.position.set(0, bH / 2, 0);
      cover.castShadow = true;
      cover.receiveShadow = true;
      bGroup.add(cover);

      if (!game.state?.device?.isMobile) {
        const pages = new THREE.Mesh(new THREE.BoxGeometry(bW - 0.008, bH - 0.016, bD - 0.016), pagesMat);
        pages.position.set(0, bH / 2, -0.006);
        bGroup.add(pages);

        const spineBand = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.002, 0.024, 0.008), goldMat);
        spineBand.position.set(0, bH * 0.72, bD / 2 + 0.001);
        bGroup.add(spineBand);

        const spineBand2 = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.002, 0.024, 0.008), goldMat);
        spineBand2.position.set(0, bH * 0.28, bD / 2 + 0.001);
        bGroup.add(spineBand2);
      }

      if (tiltZ !== 0) bGroup.rotation.z = tiltZ;
      return bGroup;
    };

    const createBookStack = (count, startColorIdx) => {
      const stackGroup = new THREE.Group();
      let stackY = 0;
      for (let i = 0; i < count; i++) {
        const bW = 0.30 + Math.random() * 0.06;
        const bH = 0.05 + Math.random() * 0.025;
        const bD = 0.24 + Math.random() * 0.04;
        const col = bookPalettes[(startColorIdx + i * 3) % bookPalettes.length];
        const coverMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45 });

        const book = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), coverMat);
        book.position.set((Math.random() - 0.5) * 0.02, stackY + bH / 2, (Math.random() - 0.5) * 0.02);
        book.castShadow = true;
        stackGroup.add(book);
        stackY += bH;
      }
      return stackGroup;
    };

    const shelfYPositions = [0.12, 0.68, 1.24, 1.80];
    shelfYPositions.forEach((shelfY, shelfIdx) => {
      const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(frameW - wallThick * 2, wallThick, frameD - 0.02), woodMat);
      shelfMesh.position.set(0, shelfY, 0);
      shelfMesh.receiveShadow = true;
      shelfMesh.castShadow = true;
      group.add(shelfMesh);

      const innerW = frameW - wallThick * 2 - 0.16;
      const shelfTopY = shelfY + wallThick / 2;
      let curX = -innerW / 2;

      if (shelfIdx === 0) {
        while (curX < innerW / 2 - 0.4) {
          const bW = 0.07 + Math.random() * 0.045;
          const bH = 0.44 + Math.random() * 0.08;
          const bD = 0.32 + Math.random() * 0.04;
          const col = bookPalettes[Math.floor(Math.random() * bookPalettes.length)];
          const b = createBook(bW, bH, bD, col);
          b.position.set(curX + bW / 2, shelfTopY, 0.02);
          group.add(b);
          curX += bW + 0.008;
        }
        const stack = createBookStack(3, 4);
        stack.position.set(innerW / 2 - 0.18, shelfTopY, 0.02);
        group.add(stack);
      } else if (shelfIdx === 1) {
        for (let i = 0; i < 9; i++) {
          const bW = 0.065 + Math.random() * 0.03;
          const bH = 0.38 + Math.random() * 0.08;
          const bD = 0.28 + Math.random() * 0.04;
          const col = bookPalettes[(i * 2 + 1) % bookPalettes.length];
          const b = createBook(bW, bH, bD, col);
          b.position.set(curX + bW / 2, shelfTopY, 0.02);
          group.add(b);
          curX += bW + 0.006;
        }
        const lean1 = createBook(0.065, 0.40, 0.30, 0xdc2626, -0.22);
        lean1.position.set(curX + 0.08, shelfTopY, 0.02);
        group.add(lean1);
        const lean2 = createBook(0.065, 0.42, 0.30, 0xd97706, -0.24);
        lean2.position.set(curX + 0.14, shelfTopY, 0.02);
        group.add(lean2);
        curX += 0.26;
        while (curX < innerW / 2 - 0.35) {
          const bW = 0.06 + Math.random() * 0.035;
          const bH = 0.36 + Math.random() * 0.08;
          const bD = 0.28 + Math.random() * 0.03;
          const col = bookPalettes[(curX.toFixed(2) * 100) % bookPalettes.length | 0];
          const b = createBook(bW, bH, bD, col);
          b.position.set(curX + bW / 2, shelfTopY, 0.02);
          group.add(b);
          curX += bW + 0.006;
        }
        const stack = createBookStack(4, 8);
        stack.position.set(innerW / 2 - 0.16, shelfTopY, 0.02);
        group.add(stack);
      } else if (shelfIdx === 2) {
        curX += 0.28;
        while (curX < innerW / 2 - 0.22) {
          const bW = 0.055 + Math.random() * 0.035;
          const bH = 0.35 + Math.random() * 0.10;
          const bD = 0.27 + Math.random() * 0.04;
          const col = bookPalettes[Math.floor(Math.random() * bookPalettes.length)];
          const b = createBook(bW, bH, bD, col);
          b.position.set(curX + bW / 2, shelfTopY, 0.02);
          group.add(b);
          curX += bW + 0.007;
        }
        const leanR = createBook(0.06, 0.38, 0.28, 0x7c3aed, 0.20);
        leanR.position.set(innerW / 2 - 0.08, shelfTopY, 0.02);
        group.add(leanR);
      } else if (shelfIdx === 3) {
        const stackL = createBookStack(3, 12);
        stackL.position.set(curX + 0.16, shelfTopY, 0.02);
        group.add(stackL);
        curX += 0.38;
        while (curX < innerW / 2 - 0.40) {
          const bW = 0.06 + Math.random() * 0.04;
          const bH = 0.34 + Math.random() * 0.09;
          const bD = 0.26 + Math.random() * 0.04;
          const col = bookPalettes[Math.floor(Math.random() * bookPalettes.length)];
          const b = createBook(bW, bH, bD, col);
          b.position.set(curX + bW / 2, shelfTopY, 0.02);
          group.add(b);
          curX += bW + 0.008;
        }
      }
    });

    return group;
  };
  const bookshelf = game.objectMeshFactories.bookshelf();
  if (game.loadedModels.bookshelf) {
    bookshelf.position.set(-2.45, 1.55, -4.72);   // tủ kệ treo trên mảng tường accent
    bookshelf.rotation.y = Math.PI / 2;
  } else {
    bookshelf.position.set(-4.62, 0, -3.35);      // kệ đứng dự phòng dựa tường Tây
    bookshelf.rotation.y = Math.PI / 2;
  }
  game.registerInteractable(bookshelf, 'bookshelf');
  game.scene.add(bookshelf);

  // 7b. TROPHY
  game.objectMeshFactories.trophy = () => {
    const group = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0x78350f,
      emissiveIntensity: 0.2
    });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
    const gemMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.5 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.08, 16), baseMat);
    base.position.y = 0.04;
    base.castShadow = true;
    group.add(base);

    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.01), goldMat);
    plaque.position.set(0, 0.04, 0.115);
    group.add(plaque);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.10, 16), goldMat);
    stem.position.y = 0.13;
    stem.castShadow = true;
    group.add(stem);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.04, 0.22, 24), goldMat);
    cup.position.y = 0.29;
    cup.castShadow = true;
    group.add(cup);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 12, 24), goldMat);
    rim.position.y = 0.40;
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    for (let side of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 12, 20, Math.PI), goldMat);
      handle.position.set(side * 0.16, 0.32, 0);
      handle.rotation.z = side * Math.PI / 2;
      group.add(handle);
    }

    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), gemMat);
    star.position.y = 0.40;
    group.add(star);

    return group;
  };
  const trophy = game.objectMeshFactories.trophy();
  trophy.position.set(-4.58, 2.12, 1.15);
  game.registerInteractable(trophy, 'trophy');
  game.scene.add(trophy);

  // 7c. MINI POTTED SUCCULENT
  game.objectMeshFactories.mini_plant = () => {
    if (game.loadedModels.mini_plant) {
      return game.fitModelToBounds(game.loadedModels.mini_plant, { targetHeight: 0.30 });
    }
    const group = new THREE.Group();
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3f2211, roughness: 0.9 });
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.14, 8), potMat);
    pot.position.y = 0.07;
    pot.castShadow = true;
    group.add(pot);

    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.10, 16), soilMat);
    soil.position.y = 0.138;
    soil.rotation.x = -Math.PI / 2;
    group.add(soil);

    for (let tier = 0; tier < 3; tier++) {
      const count = 6 + tier * 2;
      const radius = 0.08 - tier * 0.02;
      const y = 0.15 + tier * 0.035;
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count + tier * 0.4;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), tier === 2 ? tipMat : plantMat);
        petal.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        petal.rotation.set(0.6 * Math.cos(angle), -angle, -0.6 * Math.sin(angle));
        petal.castShadow = true;
        group.add(petal);
      }
    }
    return group;
  };
  const miniPlant = game.objectMeshFactories.mini_plant();
  miniPlant.position.set(4.58, 0.50, 0.20);
  game.registerInteractable(miniPlant, 'mini_plant');
  game.scene.add(miniPlant);

  // 7d. DESKTOP GLOBE
  game.objectMeshFactories.globe = () => {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
    const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const landMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.035, 24), baseMat);
    base.position.y = 0.017;
    base.castShadow = true;
    group.add(base);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 16), brassMat);
    stem.position.y = 0.08;
    stem.castShadow = true;
    group.add(stem);

    const armGeo = new THREE.TorusGeometry(0.16, 0.014, 12, 24, Math.PI * 1.15);
    const arm = new THREE.Mesh(armGeo, brassMat);
    arm.position.set(0, 0.23, 0);
    arm.rotation.z = Math.PI * 0.42;
    group.add(arm);

    const sphereGroup = new THREE.Group();
    sphereGroup.position.set(0, 0.23, 0);
    sphereGroup.rotation.z = 0.41;

    const ocean = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), oceanMat);
    ocean.castShadow = true;
    sphereGroup.add(ocean);

    for (let i = 0; i < 7; i++) {
      const lat = (Math.random() - 0.5) * Math.PI * 0.8;
      const lon = Math.random() * Math.PI * 2;
      const land = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.035, 12, 12), landMat);
      land.position.set(
        0.125 * Math.cos(lat) * Math.sin(lon),
        0.125 * Math.sin(lat),
        0.125 * Math.cos(lat) * Math.cos(lon)
      );
      sphereGroup.add(land);
    }

    group.add(sphereGroup);
    return group;
  };
  const globe = game.objectMeshFactories.globe();
  globe.position.set(DESK_X - 0.22, DESK_SURFACE_Y, -2.02);
  game.registerInteractable(globe, 'globe');
  game.scene.add(globe);

  // 8. INDOOR PLANT
  game.objectMeshFactories.plant = () => {
    if (game.loadedModels.plant) {
      return game.fitModelToBounds(game.loadedModels.plant, { targetHeight: 1.35 });
    }
    const group = new THREE.Group();
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.55, 24), potMat);
    pot.position.y = 0.275;
    pot.castShadow = true;
    group.add(pot);

    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.33, 24), new THREE.MeshStandardMaterial({ color: 0x3f2211 }));
    soil.position.y = 0.54;
    soil.rotation.x = -Math.PI / 2;
    group.add(soil);

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), leafMat);
      leaf.scale.set(0.45, 1.4, 0.12);
      leaf.position.set(Math.sin(angle) * 0.22, 0.85 + (i % 4) * 0.12, Math.cos(angle) * 0.22);
      leaf.rotation.set(0.45 * Math.cos(angle), angle, -0.45 * Math.sin(angle));
      leaf.castShadow = true;
      group.add(leaf);
    }
    return group;
  };
  const plant = game.objectMeshFactories.plant();
  plant.position.set(4.10, 0, 1.70);
  game.registerInteractable(plant, 'plant');
  game.scene.add(plant);

  // 9. BED
  game.objectMeshFactories.bed = () => {
    if (game.loadedModels.bed) {
      return game.fitModelToBounds(game.loadedModels.bed, { targetHeight: 1.02 });
    }
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
    const duvetMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.8 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.30, 2.40), frameMat);
    frame.position.set(0, 0.20, 0);
    frame.castShadow = true;
    group.add(frame);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.10, 0.12), frameMat);
    headboard.position.set(0, 0.75, -1.14);
    headboard.castShadow = true;
    group.add(headboard);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 2.25), mattressMat);
    mattress.position.set(0, 0.45, 0.05);
    group.add(mattress);

    const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.16, 1.6), duvetMat);
    duvet.position.set(0, 0.56, 0.35);
    duvet.castShadow = true;
    group.add(duvet);

    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.48), pillowMat);
    pillow1.position.set(-0.50, 0.65, -0.75);
    group.add(pillow1);

    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.48), pillowMat);
    pillow2.position.set(0.50, 0.65, -0.75);
    group.add(pillow2);

    return group;
  };
  const bed = game.objectMeshFactories.bed();
  bed.position.set(3.35, 0, -3.50);
  bed.rotation.y = -Math.PI / 2;          // đầu giường quay vào tường Bắc
  game.registerInteractable(bed, 'bed');
  game.scene.add(bed);

  // 10. WINDOW
  game.objectMeshFactories.window = () => {
    if (game.loadedModels.window) {
      return game.fitModelToBounds(game.loadedModels.window, { targetWidth: 2.45, alignBottomY: true });
    }
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const skyTex = createWindowSkyTexture();
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });

    const wW = 2.6;
    const wH = 2.2;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(wW, wH, 0.08), frameMat);
    group.add(frame);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(wW - 0.16, wH - 0.16), skyMat);
    glass.position.z = 0.045;
    group.add(glass);

    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, wH, 0.06), frameMat);
    vBar.position.z = 0.05;
    group.add(vBar);

    const hBar = new THREE.Mesh(new THREE.BoxGeometry(wW, 0.04, 0.06), frameMat);
    hBar.position.z = 0.05;
    group.add(hBar);

    const sill = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.3, 0.08, 0.25), frameMat);
    sill.position.set(0, -wH / 2, 0.1);
    group.add(sill);

    return group;
  };
  const win = game.objectMeshFactories.window();
  if (game.loadedModels.window) {
    win.position.set(2.35, 0.88, -4.88);
  } else {
    win.position.set(2.35, 2.10, -4.93);
  }
  game.registerInteractable(win, 'window');
  game.scene.add(win);

  // 11. GUITAR
  game.objectMeshFactories.guitar = () => {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const lowerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.10, 24), woodMat);
    lowerBody.rotation.x = Math.PI / 2;
    lowerBody.position.y = 0.32;
    group.add(lowerBody);

    const upperBody = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.10, 24), woodMat);
    upperBody.rotation.x = Math.PI / 2;
    upperBody.position.y = 0.70;
    group.add(upperBody);

    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), holeMat);
    hole.position.set(0, 0.60, 0.052);
    group.add(hole);

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.65, 0.045), neckMat);
    neck.position.set(0, 1.12, 0);
    group.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.18, 0.038), woodMat);
    head.position.set(0, 1.50, 0.01);
    group.add(head);

    return group;
  };
  const guitar = game.objectMeshFactories.guitar();
  guitar.position.set(-4.45, 0, 3.95);
  guitar.rotation.set(0, Math.PI / 2.4, -0.22);   // dựng nghiêng vào tường Tây
  game.registerInteractable(guitar, 'guitar');
  game.scene.add(guitar);

  // 12. BACKPACK
  game.objectMeshFactories.backpack = () => {
    const group = new THREE.Group();

    const mainFabricTex = createBackpackFabricTexture('#1e3a8a', '#172554', '#38bdf8');
    const frontFabricTex = createBackpackFabricTexture('#0284c7', '#0369a1', '#7dd3fc');
    const strapFabricTex = createBackpackFabricTexture('#0f172a', '#1e293b', '#0ea5e9');

    const mainBagMat = new THREE.MeshStandardMaterial({ map: mainFabricTex, roughness: 0.65, metalness: 0.05 });
    const frontPocketMat = new THREE.MeshStandardMaterial({ map: frontFabricTex, roughness: 0.6, metalness: 0.05 });
    const strapMat = new THREE.MeshStandardMaterial({ map: strapFabricTex, roughness: 0.8 });
    const pipingMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.35, metalness: 0.2 });
    const rubberBaseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 });
    const metalZipMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.9 });
    const reflectiveStripMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 0.6, roughness: 0.2 });
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.85 });
    const bottleCapMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.3 });

    const bW = 0.40;
    const bD = 0.24;
    const baseH = 0.05;
    const boxH = 0.32;
    const domeR = bW / 2;
    const domeHeight = 0.14;
    const pipeRadius = 0.012;

    const baseBox = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.01, baseH, bD + 0.01), rubberBaseMat);
    baseBox.position.y = baseH / 2;
    baseBox.castShadow = true;
    group.add(baseBox);

    for (let sx of [-1, 1]) {
      for (let sz of [-1, 1]) {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.012, 12), rubberBaseMat);
        foot.position.set(sx * (bW / 2 - 0.035), 0.006, sz * (bD / 2 - 0.035));
        group.add(foot);
      }
    }

    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(bW, boxH, bD), mainBagMat);
    mainBox.position.set(0, baseH + boxH / 2, 0);
    mainBox.castShadow = true;
    mainBox.receiveShadow = true;
    group.add(mainBox);

    const domeGeo = new THREE.SphereGeometry(domeR, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, mainBagMat);
    domeMesh.scale.set(1.0, domeHeight / domeR, bD / (domeR * 2));
    domeMesh.position.set(0, baseH + boxH, 0);
    domeMesh.castShadow = true;
    group.add(domeMesh);

    const pZ = bD / 2;
    const pY_boxCenter = baseH + boxH / 2;

    const trimBottom = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.005, 0.012, 0.012), pipingMat);
    trimBottom.position.set(0, baseH + 0.025, 0);
    group.add(trimBottom);

    const trimMid = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.005, 0.010, 0.012), pipingMat);
    trimMid.position.set(0, baseH + boxH - 0.025, 0);
    group.add(trimMid);

    for (let side of [-1, 1]) {
      const edgeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.010, boxH, 0.012), pipingMat);
      edgeTrim.position.set(side * (bW / 2 + 0.003), pY_boxCenter, 0);
      group.add(edgeTrim);
    }

    const zipTrack = new THREE.Mesh(new THREE.TorusGeometry(domeR * 0.92, 0.007, 8, 24, Math.PI), metalZipMat);
    zipTrack.scale.set(1.0, domeHeight / (domeR * 0.92), 1.0);
    zipTrack.position.set(0, baseH + boxH, 0);
    group.add(zipTrack);

    for (let pullX of [-0.025, 0.025]) {
      const slider = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.020, 0.018), metalZipMat);
      slider.position.set(pullX, baseH + boxH + domeHeight + 0.003, 0);
      group.add(slider);

      const pullTab = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.032, 0.005), pipingMat);
      pullTab.position.set(pullX, baseH + boxH + domeHeight - 0.018, 0.01);
      pullTab.rotation.x = 0.15;
      group.add(pullTab);
    }

    const fW = 0.30;
    const fH = 0.22;
    const fD = 0.07;
    const fY = baseH + 0.12;
    const fZ = pZ + fD / 2;

    const frontPocket = new THREE.Mesh(new THREE.BoxGeometry(fW, fH, fD), frontPocketMat);
    frontPocket.position.set(0, fY, fZ);
    frontPocket.castShadow = true;
    frontPocket.receiveShadow = true;
    group.add(frontPocket);

    for (let side of [-1, 1]) {
      const fSidePipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, fH, 10), pipingMat);
      fSidePipe.position.set(side * (fW / 2), fY, fZ + fD / 2);
      group.add(fSidePipe);
    }
    const fTopPipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, fW, 10), pipingMat);
    fTopPipe.rotation.z = Math.PI / 2;
    fTopPipe.position.set(0, fY + fH / 2, fZ + fD / 2);
    group.add(fTopPipe);

    const refStrip = new THREE.Mesh(new THREE.BoxGeometry(fW + 0.004, 0.026, 0.005), reflectiveStripMat);
    refStrip.position.set(0, fY + 0.02, fZ + fD / 2 + 0.003);
    group.add(refStrip);

    const fZip = new THREE.Mesh(new THREE.BoxGeometry(fW - 0.04, 0.012, 0.008), metalZipMat);
    fZip.position.set(0, fY + fH / 2 - 0.015, fZ + fD / 2 + 0.002);
    group.add(fZip);

    const fPull = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.038, 0.005), pipingMat);
    fPull.position.set(0.06, fY + fH / 2 - 0.035, fZ + fD / 2 + 0.01);
    fPull.rotation.x = 0.2;
    group.add(fPull);

    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.006, 20), badgeMat);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0, baseH + boxH - 0.05, pZ + 0.004);
    group.add(badge);

    const starDeco = new THREE.Mesh(new THREE.OctahedronGeometry(0.018, 0), reflectiveStripMat);
    starDeco.position.set(0, baseH + boxH - 0.05, pZ + 0.01);
    group.add(starDeco);

    const meshPocket = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.16, 16, 1, true), frontPocketMat);
    meshPocket.position.set(bW / 2 + 0.035, baseH + 0.10, 0);
    group.add(meshPocket);

    const thermos = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.24, 20), bottleMat);
    thermos.position.set(bW / 2 + 0.035, baseH + 0.15, 0);
    thermos.castShadow = true;
    group.add(thermos);

    const thermosCap = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.045, 0.05, 20), bottleCapMat);
    thermosCap.position.set(bW / 2 + 0.035, baseH + 0.29, 0);
    group.add(thermosCap);

    const bottleHandle = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 8, 16), bottleCapMat);
    bottleHandle.position.set(bW / 2 + 0.035, baseH + 0.32, 0);
    group.add(bottleHandle);

    const lPouch = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.16, 0.14), frontPocketMat);
    lPouch.position.set(-bW / 2 - 0.028, baseH + 0.12, 0);
    lPouch.castShadow = true;
    group.add(lPouch);

    const lPouchPipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.7, pipeRadius * 0.7, 0.14, 8), pipingMat);
    lPouchPipe.rotation.x = Math.PI / 2;
    lPouchPipe.position.set(-bW / 2 - 0.058, baseH + 0.20, 0);
    group.add(lPouchPipe);

    for (let py of [baseH + 0.08, baseH + 0.24]) {
      const bPad = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.02), rubberBaseMat);
      bPad.position.set(0, py, -pZ - 0.01);
      group.add(bPad);
    }

    for (let side of [-1, 1]) {
      const strapTop = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.26, 0.025), strapMat);
      strapTop.position.set(side * 0.10, baseH + 0.26, -pZ - 0.025);
      strapTop.rotation.x = 0.10;
      strapTop.castShadow = true;
      group.add(strapTop);

      const strapBot = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.02), strapMat);
      strapBot.position.set(side * 0.11, baseH + 0.10, -pZ - 0.015);
      strapBot.rotation.x = -0.10;
      group.add(strapBot);

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.015), rubberBaseMat);
      buckle.position.set(side * 0.11, baseH + 0.08, -pZ - 0.022);
      group.add(buckle);

      const strapTail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.006), strapMat);
      strapTail.position.set(side * 0.11, baseH + 0.03, -pZ - 0.025);
      group.add(strapTail);
    }

    const chestStrap = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.022, 0.008), strapMat);
    chestStrap.position.set(0, baseH + 0.24, -pZ - 0.035);
    group.add(chestStrap);

    const chestBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.028, 0.014), pipingMat);
    chestBuckle.position.set(0, baseH + 0.24, -pZ - 0.04);
    group.add(chestBuckle);

    const handleArch = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), strapMat);
    handleArch.position.set(0, baseH + boxH + domeHeight - 0.02, -0.03);
    handleArch.castShadow = true;
    group.add(handleArch);

    const handleGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.055, 12), pipingMat);
    handleGrip.rotation.z = Math.PI / 2;
    handleGrip.position.set(0, baseH + boxH + domeHeight + 0.04, -0.03);
    group.add(handleGrip);

    return group;
  };
  const backpack = game.objectMeshFactories.backpack();
  backpack.position.set(-2.90, 0, 3.40);
  backpack.rotation.y = 0.35;
  game.registerInteractable(backpack, 'backpack');
  game.scene.add(backpack);

  // ==========================================================================
  // 13. SET-UP GAMING MỚI: màn hình, bàn phím, tủ quần áo, rèm cửa
  // ==========================================================================

  // 13a. MONITOR (螢幕)
  game.objectMeshFactories.monitor = () => {
    if (game.loadedModels.monitor) {
      return game.fitModelToBounds(game.loadedModels.monitor, { targetHeight: 0.46 });
    }
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.35, metalness: 0.3 });
    const screenMat = new THREE.MeshStandardMaterial({
      map: createScreenTexture(), emissive: 0x1e40af, emissiveIntensity: 0.45, roughness: 0.25
    });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.60), bodyMat);
    panel.position.y = 0.30;
    panel.castShadow = true;
    group.add(panel);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.30), screenMat);
    screen.rotation.y = Math.PI / 2;
    screen.position.set(0.017, 0.30, 0);
    group.add(screen);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), bodyMat);
    neck.position.y = 0.08;
    group.add(neck);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.26), bodyMat);
    base.position.y = 0.01;
    group.add(base);
    return group;
  };
  const monitor = game.objectMeshFactories.monitor();
  monitor.position.set(DESK_X - 0.28, DESK_SURFACE_Y, -1.58);
  game.registerInteractable(monitor, 'monitor');
  game.scene.add(monitor);

  // 13b. KEYBOARD (鍵盤) + chuột & lót chuột (trang trí)
  game.objectMeshFactories.keyboard = () => {
    if (game.loadedModels.keyboard) {
      return game.fitModelToBounds(game.loadedModels.keyboard, { targetDepth: 0.44 });
    }
    const group = new THREE.Group();
    const caseMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const keyMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.018, 0.44), caseMat);
    body.position.y = 0.009;
    body.castShadow = true;
    group.add(body);
    for (let r = 0; r < 4; r++) {
      const row = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.006, 0.40), keyMat);
      row.position.set(0, 0.021, (r - 1.5) * 0.026);
      group.add(row);
    }
    return group;
  };
  game.placeZoneModel('bd_mousePad', { x: DESK_X + 0.06, y: DESK_SURFACE_Y + 0.002, z: -1.42 },
    { targetDepth: 0.78, alignBottomY: true });
  const keyboard = game.objectMeshFactories.keyboard();
  keyboard.position.set(DESK_X + 0.04, DESK_SURFACE_Y + 0.006, -1.56);
  game.registerInteractable(keyboard, 'keyboard');
  game.scene.add(keyboard);
  game.placeZoneModel('bd_mouse', { x: DESK_X + 0.05, y: DESK_SURFACE_Y + 0.006, z: -1.10 },
    { targetDepth: 0.11, alignBottomY: true });

  // 13c. WARDROBE (衣櫃) — tủ đứng dựa tường Tây
  game.objectMeshFactories.wardrobe = () => {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
    const doorMat = new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.6 });
    const mintMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.45 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });

    const W = 0.58, H = 2.10, L = 2.00;   // sâu x cao x dài (dọc theo trục Z)
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, L), bodyMat);
    body.position.y = H / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 2 cánh gỗ + 1 mảng mint cho cảm giác trẻ trung
    [-1, 1].forEach((side, i) => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.03, H - 0.22, L / 2 - 0.06), i === 0 ? doorMat : mintMat);
      door.position.set(W / 2 + 0.015, H / 2, side * (L / 4));
      group.add(door);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.03), handleMat);
      handle.position.set(W / 2 + 0.04, H / 2, side * 0.10);
      group.add(handle);
    });

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(W - 0.06, 0.08, L - 0.06), handleMat);
    plinth.position.y = 0.04;
    group.add(plinth);
    return group;
  };
  const wardrobe = game.objectMeshFactories.wardrobe();
  wardrobe.position.set(-4.62, 0, 1.95);
  game.registerInteractable(wardrobe, 'wardrobe');
  game.scene.add(wardrobe);

  // 13d. CURTAIN (窗簾) — hai bên cửa sổ tường Bắc
  game.objectMeshFactories.curtain = () => {
    if (game.loadedModels.curtain) {
      return game.fitModelToBounds(game.loadedModels.curtain, { targetHeight: 2.55, alignBottomY: true });
    }
    const group = new THREE.Group();
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.95, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
      const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.55, 8, 1, true), clothMat);
      fold.position.set(i * 0.13 - 0.39, 1.275, 0);
      group.add(fold);
    }
    return group;
  };
  const curtain = game.objectMeshFactories.curtain();
  curtain.position.set(0.92, 0.42, -4.80);
  game.registerInteractable(curtain, 'curtain');
  game.scene.add(curtain);
  game.placeZoneModel('bd_curtainTied', { x: 4.05, y: 0.42, z: -4.76 }, { targetHeight: 2.55, alignBottomY: true });

  // ==========================================================================
  // 14. TRANG TRÍ (không phải từ vựng)
  // ==========================================================================
  game.placeZoneModel('bd_nightstand', { x: 4.62, y: 0, z: -4.30 }, { targetHeight: 0.50, alignBottomY: true });
  game.placeZoneModel('bd_nightstand2', { x: 4.58, y: 0, z: 0.20 }, { targetHeight: 0.50, alignBottomY: true });
  game.placeZoneModel('bd_cupRed', { x: 4.40, y: 0.50, z: 0.38 }, { targetHeight: 0.11, alignBottomY: true });
  game.placeZoneModel('bd_wallShelf', { x: -4.80, y: 1.62, z: -1.35 }, { targetHeight: 1.10, alignBottomY: true });
  game.placeZoneModel('bd_books1', { x: -4.60, y: 2.12, z: 1.72 }, { targetHeight: 0.26, alignBottomY: true });
  game.placeZoneModel('bd_books2', { x: -4.74, y: 1.99, z: -1.62 }, { targetHeight: 0.24, alignBottomY: true });
  game.placeZoneModel('bd_bookOpen', { x: DESK_X + 0.10, y: DESK_SURFACE_Y, z: -2.02 }, { targetHeight: 0.22, alignBottomY: true });
  game.placeZoneModel('bd_toyRocket', { x: -4.58, y: 2.12, z: 2.72 }, { targetHeight: 0.30, alignBottomY: true });
  game.placeZoneModel('bd_toyPenguin', { x: 4.58, y: 0.50, z: -0.05 }, { targetHeight: 0.22, alignBottomY: true });
  game.placeZoneModel('bd_toyCar', { x: -4.55, y: 2.12, z: 0.62 }, { targetDepth: 0.32, alignBottomY: true });
  game.placeZoneModel('bd_toyOctopus', { x: -4.72, y: 2.36, z: -1.12 }, { targetWidth: 0.26, alignBottomY: true });
  game.placeZoneModel('bd_plantFicus', { x: -4.20, y: 0, z: 0.20 }, { targetHeight: 0.62, alignBottomY: true });
  game.placeZoneModel('bd_plantPothos', { x: -2.45, y: 2.57, z: -4.70 }, { targetHeight: 0.42, alignBottomY: true });
  game.placeZoneModel('bd_paintingPortrait', { x: 4.92, y: 2.30, z: 1.10 }, { targetHeight: 0.85, alignBottomY: false });
  game.placeZoneModel('bd_paintingDark', { x: -4.92, y: 2.45, z: -3.40 }, { targetHeight: 0.85, alignBottomY: false });

  const ceilingFan = game.placeZoneModel('bd_ceilingFan', { x: 0.20, y: 3.55, z: -1.10 },
    { targetWidth: 1.70, alignBottomY: false });
  if (ceilingFan) {
    game.animatedProps.push({ update: (delta) => { ceilingFan.rotation.y += delta * 1.1; } });
  }

  // 15. EXIT DOOR (Cửa phòng ra vào)
  game.objectMeshFactories.door = () => {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c2b0c, roughness: 0.55, metalness: 0.08 });
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });
    const neonMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });
    const signMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

    const dW = 1.45;
    const dH = 2.80;
    const frameThick = 0.09;

    const frameL = new THREE.Mesh(new THREE.BoxGeometry(frameThick, dH, 0.12), frameMat);
    frameL.position.set(-dW / 2 + frameThick / 2, dH / 2, 0);
    group.add(frameL);

    const frameR = new THREE.Mesh(new THREE.BoxGeometry(frameThick, dH, 0.12), frameMat);
    frameR.position.set(dW / 2 - frameThick / 2, dH / 2, 0);
    group.add(frameR);

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(dW, frameThick, 0.12), frameMat);
    frameTop.position.set(0, dH - frameThick / 2, 0);
    group.add(frameTop);

    const leafW = dW - frameThick * 2 - 0.01;
    const leafH = dH - frameThick - 0.02;
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.06), woodMat);
    leaf.position.set(0, leafH / 2 + 0.01, 0);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    group.add(leaf);

    for (let row = 0; row < 2; row++) {
      const panelH = row === 0 ? 0.95 : 1.15;
      const panelY = row === 0 ? 0.65 : 1.95;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.20, panelH, 0.02), panelMat);
      panel.position.set(0, panelY, 0.032);
      group.add(panel);
    }

    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.01), brassMat);
    plate.position.set(0.40, 1.18, 0.04);
    group.add(plate);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 16), brassMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0.46, 1.22, 0.065);
    group.add(handle);

    const signBox = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.06), signMat);
    signBox.position.set(0, dH + 0.16, 0.04);
    group.add(signBox);

    const neonPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.16), neonMat);
    neonPlate.position.set(0, dH + 0.16, 0.072);
    neonPlate.userData.isGateSign = true;
    group.add(neonPlate);

    const exitLight = new THREE.PointLight(0x22c55e, 0.6, 3.5, 1.5);
    exitLight.position.set(0, dH + 0.2, 0.25);
    exitLight.userData.isGateLight = true;
    group.add(exitLight);

    return group;
  };
  const door = game.objectMeshFactories.door();
  door.position.set(0, 0, 4.90);
  door.rotation.y = Math.PI;
  game.registerGate(door, 'door', 'living', { requireComplete: true, label: 'Sang Phòng Khách' });
  game.applyGateLockVisual(door, 'bedroom');
  game.scene.add(door);

  game.buildPlayerAvatar();
}
