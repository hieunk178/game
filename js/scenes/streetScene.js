/**
 * ============================================================================
 * ZONE 4: ĐƯỜNG PHỐ (街道 - STREET) SCENE BUILDER
 * ============================================================================
 */

/* global THREE */

import { createRoundedBoxGeometry } from '../utils/textures.js';

export function makeTree(scale = 1, trunkColor = 0x6b4423, leafColor = 0x15803d, isMobile = false, withPlanter = false) {
  const g = new THREE.Group();

  if (withPlanter) {
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.85 });
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.95 });
    const border = new THREE.Mesh(createRoundedBoxGeometry(1.2 * scale, 0.08, 1.2 * scale, 0.02, 2), curbMat);
    border.position.y = 0.04;
    border.castShadow = true;
    g.add(border);
    const soil = new THREE.Mesh(new THREE.PlaneGeometry(1.02 * scale, 1.02 * scale), soilMat);
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = 0.085;
    g.add(soil);
  }

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13 * scale, 0.19 * scale, 1.7 * scale, 10),
    new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.95 })
  );
  trunk.position.y = 0.85 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.85 });
  const blobs = isMobile
    ? [[0, 2.3, 0, 0.95], [0.12, 2.8, 0.08, 0.55]]
    : [
        [0, 2.25, 0, 0.85], [-0.35, 1.95, 0.2, 0.58],
        [0.4, 2.05, -0.15, 0.54], [0.08, 2.7, 0.1, 0.52]
      ];
  blobs.forEach(([bx, by, bz, br]) => {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(br * scale, 1), leafMat);
    blob.position.set(bx * scale, by * scale, bz * scale);
    blob.castShadow = true;
    g.add(blob);
  });
  return g;
}

export function makeStreetLamp() {
  const g = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.75 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.3, 14), metalMat);
  base.position.y = 0.15; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.4, 14), metalMat);
  pole.position.y = 2.4; pole.castShadow = true; g.add(pole);
  const armCurve = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 20, Math.PI / 2), metalMat);
  armCurve.position.set(0.0, 4.55, 0); armCurve.rotation.z = Math.PI; armCurve.rotation.y = Math.PI / 2;
  g.add(armCurve);
  const headArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.9), metalMat);
  headArm.position.set(0, 4.6, 0.5); g.add(headArm);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.3, 0.24, 14), metalMat);
  shade.position.set(0, 4.48, 0.92); g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0xfff7d6, emissive: 0xfde68a, emissiveIntensity: 1.5 }));
  bulb.position.set(0, 4.32, 0.92); g.add(bulb);
  const lampLight = new THREE.PointLight(0xffedb8, 0.55, 9, 1.6);
  lampLight.position.set(0, 4.2, 0.92); g.add(lampLight);
  return g;
}

export function makeCar(bodyColor = 0xdc2626) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.28, metalness: 0.55 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.85 });
  const tyreMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });

  const lower = new THREE.Mesh(createRoundedBoxGeometry(1.85, 0.62, 4.15, 0.22, 4), bodyMat);
  lower.position.y = 0.66; lower.castShadow = true; g.add(lower);
  const cabin = new THREE.Mesh(createRoundedBoxGeometry(1.62, 0.62, 2.1, 0.24, 4), bodyMat);
  cabin.position.set(0, 1.20, -0.15); cabin.castShadow = true; g.add(cabin);
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.5), glassMat);
  windshield.position.set(0, 1.22, 0.92); windshield.rotation.x = -0.28; g.add(windshield);
  const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.5), glassMat);
  rearGlass.position.set(0, 1.22, -1.22); rearGlass.rotation.x = 0.28; rearGlass.rotation.y = Math.PI; g.add(rearGlass);
  [-1, 1].forEach(sx => {
    const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.44), glassMat);
    sideGlass.position.set(sx * 0.82, 1.24, -0.15);
    sideGlass.rotation.y = sx * Math.PI / 2; g.add(sideGlass);
  });
  [[-0.86, 1.35], [0.86, 1.35], [-0.86, -1.35], [0.86, -1.35]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 18), tyreMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.36, wz); g.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.27, 14),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.25, metalness: 0.85 }));
    hub.rotation.z = Math.PI / 2; hub.position.set(wx, 0.36, wz); g.add(hub);
  });
  [[-0.6, 2.05], [0.6, 2.05]].forEach(([hx, hz]) => {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xfff8dc, emissive: 0xfde68a, emissiveIntensity: 0.9 }));
    head.scale.z = 0.5; head.position.set(hx, 0.72, hz); g.add(head);
  });
  [[-0.6, -2.05], [0.6, -2.05]].forEach(([hx, hz]) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.1 }));
    tail.position.set(hx, 0.78, hz); g.add(tail);
  });
  return g;
}

export function makeBuilding(width, depth, floors, baseColor, accentColor, isMobile = false) {
  const g = new THREE.Group();
  const floorH = 3.0;
  const height = floors * floorH;
  const wallMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const cols = Math.max(2, Math.floor(width / 1.5));

  if (isMobile) {
    const cv = document.createElement('canvas');
    cv.width = 64; cv.height = 128;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#' + baseColor.toString(16).padStart(6, '0');
    cx.fillRect(0, 0, 64, 128);
    for (let f = 0; f < 8; f++) {
      for (let c = 0; c < 4; c++) {
        const lit = ((f * 7 + c * 3) % 4) !== 0;
        cx.fillStyle = lit ? '#9fc6f2' : '#22405f';
        cx.fillRect(6 + c * 14, 6 + f * 16, 9, 9);
      }
      cx.fillStyle = '#' + accentColor.toString(16).padStart(6, '0');
      cx.fillRect(0, f * 16, 64, 2);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(Math.max(1, Math.round(width / 4)), Math.max(1, Math.round(floors / 8 * 1)) || 1);
    body.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  } else {
    const winMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x60a5fa, emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.4 });
    const winDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.2, metalness: 0.3 });
    for (let f = 0; f < floors; f++) {
      const y = f * floorH + floorH * 0.62;
      for (let c = 0; c < cols; c++) {
        const x = -width / 2 + (width / cols) * (c + 0.5);
        const lit = ((f * 7 + c * 3) % 4) !== 0;
        [1, -1].forEach(sz => {
          const w = new THREE.Mesh(new THREE.PlaneGeometry(width / cols * 0.55, 1.35), lit ? winMat : winDarkMat);
          w.position.set(x, y, sz * (depth / 2 + 0.02));
          if (sz < 0) w.rotation.y = Math.PI;
          g.add(w);
        });
      }
      const band = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 0.16, depth + 0.14),
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.6 }));
      band.position.y = f * floorH + 0.08;
      g.add(band);
    }
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.3, depth + 0.3),
    new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.7 }));
  roof.position.y = height + 0.15;
  g.add(roof);
  return g;
}

export function buildStreetScene(game) {
  const isMobile = game.state?.device?.isMobile || false;
  game.roomBounds = { minX: -9.5, maxX: 9.5, minZ: -20.0, maxZ: 25 };

  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.95 });
  const walkMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.9 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.85 });
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.6 });

  // Distant grass ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160),
    new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.06;
  ground.receiveShadow = true;
  game.scene.add(ground);

  // 1. Road (馬路)
  const roadGroup = new THREE.Group();
  const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 66), asphaltMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, 0);
  road.receiveShadow = true;
  roadGroup.add(road);

  for (let z = -30; z <= 30; z += 3.4) {
    if (Math.abs(z + 10) < 3) continue;
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.9), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, z);
    roadGroup.add(dash);
  }
  roadGroup.position.set(0, 0, 0);
  game.objectMeshFactories.st_road = () => {
    const g = new THREE.Group();
    const seg = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 9), asphaltMat);
    seg.position.y = -0.06; g.add(seg);
    for (let z = -3.4; z <= 3.4; z += 3.4) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 1.9), lineMat);
      dash.position.set(0, 0.01, z); g.add(dash);
    }
    [-1, 1].forEach(side => {
      const walk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 9), walkMat);
      walk.position.set(side * 4.8, -0.02, 0); g.add(walk);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 9), curbMat);
      curb.position.set(side * 4.05, 0.0, 0); g.add(curb);
    });
    return g;
  };
  game.registerInteractable(roadGroup, 'st_road');
  game.scene.add(roadGroup);

  // 2. Sidewalks
  [-1, 1].forEach(side => {
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(5, 66), walkMat);
    walk.rotation.x = -Math.PI / 2;
    walk.position.set(side * 6.5, 0.06, 0);
    walk.receiveShadow = true;
    game.scene.add(walk);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 66), curbMat);
    curb.position.set(side * 4.1, 0.05, 0);
    game.scene.add(curb);
  });

  // 3. Crosswalk (斑馬線)
  const crossGroup = new THREE.Group();
  for (let i = -3; i <= 3; i++) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.6), whiteMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(i * 1.1, 0.03, 0);
    crossGroup.add(stripe);
  }
  crossGroup.position.set(0, 0, -10);
  game.registerInteractable(crossGroup, 'st_crosswalk');
  game.scene.add(crossGroup);

  // 4. Traffic Light (紅綠燈)
  const lightGroup = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4, metalness: 0.7 });
  const tlPole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 4.2, 12), poleMat);
  tlPole.position.y = 2.1; tlPole.castShadow = true; lightGroup.add(tlPole);
  const tlBox = new THREE.Mesh(createRoundedBoxGeometry(0.42, 1.15, 0.34, 0.05, 3), poleMat);
  tlBox.position.set(0, 3.9, 0.22); lightGroup.add(tlBox);
  const lampColors = [
    { c: 0xef4444, e: 0xdc2626, y: 4.28 },
    { c: 0xfacc15, e: 0xeab308, y: 3.90 },
    { c: 0x22c55e, e: 0x16a34a, y: 3.52 }
  ];
  const tlLamps = [];
  lampColors.forEach(lc => {
    const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20),
      new THREE.MeshStandardMaterial({ color: lc.c, emissive: lc.e, emissiveIntensity: 0.25 }));
    bulb.position.set(0, lc.y, 0.395);
    lightGroup.add(bulb);
    tlLamps.push(bulb);
  });
  lightGroup.position.set(4.9, 0, -7.6);
  lightGroup.rotation.y = Math.PI;

  game.objectMeshFactories.st_trafficLight = () => {
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 2.2, 12), poleMat);
    p.position.y = 1.1; g.add(p);
    const box = new THREE.Mesh(createRoundedBoxGeometry(0.46, 1.2, 0.36, 0.05, 3), poleMat);
    box.position.set(0, 2.75, 0.1); g.add(box);
    lampColors.forEach((lc, i) => {
      const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20),
        new THREE.MeshStandardMaterial({ color: lc.c, emissive: lc.e, emissiveIntensity: 1.7 }));
      bulb.position.set(0, 3.13 - i * 0.38, 0.285); g.add(bulb);
      const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 16, 1, true), poleMat);
      visor.rotation.x = Math.PI / 2;
      visor.position.set(0, 3.13 - i * 0.38, 0.315); g.add(visor);
    });
    return g;
  };
  game.registerInteractable(lightGroup, 'st_trafficLight');
  game.scene.add(lightGroup);

  game.animatedProps.push({
    type: 'trafficLight', lamps: tlLamps, t: 0,
    update(delta) {
      this.t += delta;
      const phase = Math.floor(this.t / 3) % 3;
      this.lamps.forEach((l, i) => {
        l.material.emissiveIntensity = (i === phase) ? 1.8 : 0.18;
      });
    }
  });

  // 5. Street Lamps (路燈)
  const lampZs = [16, 6, -4, -14, -22];
  lampZs.forEach((lz, i) => {
    const lamp = makeStreetLamp();
    const side = (i % 2 === 0) ? 1 : -1;
    lamp.position.set(side * 4.55, 0.06, lz);
    lamp.rotation.y = side > 0 ? Math.PI : 0;
    if (i === 1) {
      game.registerInteractable(lamp, 'st_streetLamp');
    }
    game.scene.add(lamp);
  });

  // 6. Bus Stop (公車站)
  const busStop = new THREE.Group();
  const bsMetal = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.35, metalness: 0.6 });
  const bsGlass = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  [[-1.6], [1.6]].forEach(([px]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), bsMetal);
    post.position.set(px, 1.25, -0.7); busStop.add(post);
    const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), bsMetal);
    post2.position.set(px, 1.25, 0.7); busStop.add(post2);
  });
  const bsRoof = new THREE.Mesh(createRoundedBoxGeometry(3.6, 0.12, 1.8, 0.05, 3), bsMetal);
  bsRoof.position.y = 2.55; bsRoof.castShadow = true; busStop.add(bsRoof);
  const bsBack = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.3), bsGlass);
  bsBack.position.set(0, 1.3, -0.72); busStop.add(bsBack);
  const bsBench = new THREE.Mesh(createRoundedBoxGeometry(2.6, 0.1, 0.42, 0.03, 2),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 }));
  bsBench.position.set(0, 0.48, -0.35); busStop.add(bsBench);
  const bsSignPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 10), bsMetal);
  bsSignPost.position.set(2.1, 1.3, 0.5); busStop.add(bsSignPost);
  const bsSign = new THREE.Mesh(createRoundedBoxGeometry(0.72, 0.5, 0.05, 0.04, 3),
    new THREE.MeshStandardMaterial({ color: 0x0369a1, emissive: 0x0284c7, emissiveIntensity: 0.5 }));
  bsSign.position.set(2.1, 2.5, 0.5); busStop.add(bsSign);
  busStop.position.set(7.6, 0.06, 15);
  busStop.rotation.y = -Math.PI / 2;
  game.registerInteractable(busStop, 'st_busStop');
  game.scene.add(busStop);

  // 7. Bench (長椅)
  const bench = game.placeZoneModel('st_bench', { x: 7.7, y: 0.06, z: 5.5 },
    { targetHeight: 0.92, alignBottomY: true, rotationY: -Math.PI / 2 }, () => {
      const g = new THREE.Group();
      const woodM = new THREE.MeshStandardMaterial({ color: 0x9a6a3c, roughness: 0.85 });
      const ironM = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 });
      for (let i = 0; i < 3; i++) {
        const slat = new THREE.Mesh(createRoundedBoxGeometry(1.8, 0.06, 0.16, 0.02, 2), woodM);
        slat.position.set(0, 0.45, -0.2 + i * 0.2); g.add(slat);
      }
      for (let i = 0; i < 3; i++) {
        const slat = new THREE.Mesh(createRoundedBoxGeometry(1.8, 0.14, 0.05, 0.02, 2), woodM);
        slat.position.set(0, 0.62 + i * 0.19, -0.32); g.add(slat);
      }
      [-0.78, 0.78].forEach(lx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.5), ironM);
        leg.position.set(lx, 0.22, -0.1); g.add(leg);
      });
      return g;
    });
  if (bench) {
    bench.rotation.y = -Math.PI / 2;
    game.registerInteractable(bench, 'st_bench');
  }

  // 8. Trees (樹) - Trồng sát mép vỉa hè có bồn cây, cách tường nhà 2.4m
  const treeZs = [19, 10, 1, -8, -15, -23];
  treeZs.forEach((tz, i) => {
    [-1, 1].forEach(side => {
      const tree = makeTree(1 + (i % 3) * 0.12, 0x6b4423, [0x15803d, 0x166534, 0x22c55e][i % 3], isMobile, true);
      tree.position.set(side * 5.15, 0.06, tz);
      if (i === 2 && side === 1) {
        game.registerInteractable(tree, 'st_tree');
      }
      game.scene.add(tree);
    });
  });

  // 9. Cars (汽車)
  const car = makeCar(0xdc2626);
  car.position.set(-2.2, 0.01, 8);
  game.registerInteractable(car, 'st_car');
  game.scene.add(car);

  const car2 = makeCar(0x2563eb);
  car2.position.set(2.2, 0.01, -18);
  car2.rotation.y = Math.PI;
  game.scene.add(car2);

  // 10. Buildings (大樓)
  const blocks = [
    { x: 13, z: 12, w: 9, d: 11, f: 7, c: 0x94a3b8, a: 0x475569, tag: 'tall' },
    { x: 13, z: -2, w: 9, d: 10, f: 5, c: 0xa8a29e, a: 0x57534e },
    { x: 13, z: -16, w: 9, d: 10, f: 6, c: 0x9ca3af, a: 0x4b5563 },
    { x: -13, z: 18, w: 9, d: 10, f: 4, c: 0xcbb69a, a: 0x78716c },
    { x: -13, z: 4, w: 9, d: 10, f: 6, c: 0x93a5b8, a: 0x475569 },
    { x: -13, z: -12, w: 9, d: 12, f: 5, c: 0xb8a99a, a: 0x6b5b4b }
  ];
  blocks.forEach(b => {
    const bl = makeBuilding(b.w, b.d, b.f, b.c, b.a, isMobile);
    bl.position.set(b.x, 0, b.z);
    if (b.tag === 'tall') {
      game.registerInteractable(bl, 'st_building');
    }
    game.scene.add(bl);
  });

  // 11. Convenience Store (商店)
  const shop = new THREE.Group();
  const shopBody = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.6, 5.2),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 }));
  shopBody.position.y = 1.8; shopBody.castShadow = true; shop.add(shopBody);
  const shopGlass = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.1),
    new THREE.MeshStandardMaterial({ color: 0xdbeafe, emissive: 0xbfdbfe, emissiveIntensity: 0.5, roughness: 0.05, metalness: 0.3 }));
  shopGlass.position.set(0, 1.5, 2.62); shop.add(shopGlass);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.16, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 }));
  awning.position.set(0, 3.0, 3.1); awning.rotation.x = 0.16; shop.add(awning);
  const signBoard = new THREE.Mesh(createRoundedBoxGeometry(5.2, 0.9, 0.16, 0.06, 3),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.6 }));
  signBoard.position.set(0, 3.55, 2.6); shop.add(signBoard);
  const shopLight = new THREE.PointLight(0xfff0c4, 0.9, 9, 1.5);
  shopLight.position.set(0, 2.6, 3.4); shop.add(shopLight);
  shop.position.set(9.6, 0.06, -4);
  shop.rotation.y = -Math.PI / 2;
  game.registerInteractable(shop, 'st_shop');
  game.scene.add(shop);

  // --- 12. CÁC CĂN NHÀ TRÊN ĐẠI LỘ (HOUSE ENTRANCES ALONG THE BOULEVARD) ---
  function makeHouseEntrance() {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.55 });
    const signBoardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 });

    // Bậc thềm đá trước cửa
    const porch = new THREE.Mesh(createRoundedBoxGeometry(2.4, 0.14, 1.4, 0.03, 2),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 }));
    porch.position.set(0, 0.07, 0.7);
    g.add(porch);

    // Khung cửa dày dặn nhô ra ngoài tường
    [[-0.85], [0.85]].forEach(([px]) => {
      const post = new THREE.Mesh(createRoundedBoxGeometry(0.18, 2.75, 0.28, 0.03, 2), frameMat);
      post.position.set(px, 1.38, 0.14); g.add(post);
    });
    const top = new THREE.Mesh(createRoundedBoxGeometry(1.88, 0.2, 0.28, 0.03, 2), frameMat);
    top.position.set(0, 2.75, 0.14); g.add(top);

    // Cánh cửa gỗ dày
    const leaf = new THREE.Mesh(createRoundedBoxGeometry(1.52, 2.6, 0.12, 0.03, 2), doorMat);
    leaf.position.set(0, 1.3, 0.12); g.add(leaf);

    // Ô kính cửa ấm áp
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.5, roughness: 0.1 }));
    win.position.set(0, 1.85, 0.19); g.add(win);

    // Tay nắm cửa bằng đồng thau
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 }));
    knob.position.set(0.55, 1.15, 0.21); g.add(knob);

    // Mái hiên che cửa xinh xắn nhô ra phía trước
    const awning = new THREE.Mesh(createRoundedBoxGeometry(2.4, 0.12, 1.1, 0.03, 2), awningMat);
    awning.position.set(0, 3.0, 0.62);
    awning.rotation.x = 0.22;
    awning.castShadow = true;
    g.add(awning);

    // Biển hiệu 3D
    const signBoard = new THREE.Mesh(createRoundedBoxGeometry(2.3, 0.5, 0.1, 0.03, 2), signBoardMat);
    signBoard.position.set(0, 3.48, 0.24);
    g.add(signBoard);

    // Đèn tín hiệu trạng thái cửa (xanh khi mở, đỏ khi khoá)
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
    sign.position.set(0, 3.48, 0.30);
    sign.userData.isGateSign = true;
    g.add(sign);

    // Đèn lồng treo trước cửa
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.32, 8),
      new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xfde68a, emissiveIntensity: 1.5 }));
    lantern.position.set(0, 2.7, 0.7);
    g.add(lantern);

    const gateLight = new THREE.PointLight(0xef4444, 0.75, 5, 1.5);
    gateLight.position.set(0, 2.7, 0.75);
    gateLight.userData.isGateLight = true;
    g.add(gateLight);

    return g;
  }

  // Mặt tiền cửa hàng tiện lợi: cửa kính trượt tự động + mái hiên xanh
  function makeStoreEntrance() {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.55 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xdbeafe, emissive: 0xbfdbfe, emissiveIntensity: 0.55,
      roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.55
    });

    const doorW = 2.4, doorH = 2.7;

    // Bậc thềm lát gạch trước cửa
    const step = new THREE.Mesh(createRoundedBoxGeometry(3.0, 0.12, 1.2, 0.03, 2),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.9 }));
    step.position.set(0, 0.06, 0.6);
    g.add(step);

    // Khung nhôm cửa trượt
    [-1, 1].forEach(side => {
      const post = new THREE.Mesh(createRoundedBoxGeometry(0.16, doorH, 0.26, 0.02, 2), frameMat);
      post.position.set(side * (doorW / 2 + 0.08), doorH / 2, 0.1);
      g.add(post);
      // Cánh kính trượt
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(doorW / 2 - 0.08, doorH - 0.3), glassMat);
      leaf.position.set(side * doorW / 4, doorH / 2, 0.14);
      g.add(leaf);
    });
    const rail = new THREE.Mesh(createRoundedBoxGeometry(doorW + 0.5, 0.18, 0.26, 0.02, 2), frameMat);
    rail.position.set(0, doorH - 0.09, 0.1);
    g.add(rail);

    // Mái hiên sọc xanh trắng đặc trưng
    const awning = new THREE.Mesh(createRoundedBoxGeometry(4.2, 0.14, 1.3, 0.03, 2),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 }));
    awning.position.set(0, 3.15, 0.72);
    awning.rotation.x = 0.2;
    awning.castShadow = true;
    g.add(awning);
    for (let i = -2; i <= 2; i++) {
      const stripe = new THREE.Mesh(createRoundedBoxGeometry(0.42, 0.16, 1.32, 0.02, 2),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }));
      stripe.position.set(i * 0.84, 3.15, 0.72);
      stripe.rotation.x = 0.2;
      g.add(stripe);
    }

    // Biển hiệu 便利商店 phát sáng
    const signBoard = new THREE.Mesh(createRoundedBoxGeometry(3.6, 0.62, 0.14, 0.04, 3),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
    signBoard.position.set(0, 3.75, 0.3);
    g.add(signBoard);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
    sign.position.set(0, 3.75, 0.38);
    sign.userData.isGateSign = true;
    g.add(sign);

    // Đèn 24H trên vách kính bên cạnh
    const badge = new THREE.Mesh(createRoundedBoxGeometry(0.7, 0.7, 0.08, 0.06, 3),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.9 }));
    badge.position.set(-2.1, 2.1, 0.2);
    g.add(badge);

    const gateLight = new THREE.PointLight(0xef4444, 0.85, 6, 1.5);
    gateLight.position.set(0, 3.0, 0.85);
    gateLight.userData.isGateLight = true;
    g.add(gateLight);

    // Ánh đèn trắng ấm hắt ra vỉa hè từ trong tiệm
    const spill = new THREE.PointLight(0xfff4dc, 0.7, 7, 1.6);
    spill.position.set(0, 1.6, 1.2);
    g.add(spill);

    return g;
  }

  // Căn nhà của nhân vật (phòng ngủ + phòng khách + bếp / 臥室・客廳・廚房)
  const house1 = new THREE.Group();
  const h1Body = new THREE.Mesh(new THREE.BoxGeometry(8.0, 4.4, 7.0),
    new THREE.MeshStandardMaterial({ color: 0xfde9d0, roughness: 0.85 }));
  h1Body.position.y = 2.2; h1Body.castShadow = true; house1.add(h1Body);
  const h1Roof = new THREE.Mesh(new THREE.ConeGeometry(7.0, 2.6, 4),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }));
  h1Roof.rotation.y = Math.PI / 4; h1Roof.position.y = 5.7; house1.add(h1Roof);

  // Ống khói trên mái nhà
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
  chimney.position.set(2.4, 5.4, 1.2); house1.add(chimney);

  // Cửa sổ mặt tiền cạnh cửa chính
  const winFront = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.55 }));
  winFront.position.set(2.2, 2.3, -3.52);
  winFront.rotation.y = Math.PI;
  house1.add(winFront);

  const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
  const winCross = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.08, 0.06), winFrameMat);
  winCross.position.set(2.2, 2.3, -3.54); house1.add(winCross);
  const winCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.44, 0.06), winFrameMat);
  winCrossV.position.set(2.2, 2.3, -3.54); house1.add(winCrossV);

  // Cửa sổ bên hông nhìn ra đường
  const winSide = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 0.55 }));
  winSide.position.set(-4.02, 2.3, 0);
  winSide.rotation.y = -Math.PI / 2;
  house1.add(winSide);

  house1.position.set(11.0, 0.06, 22.5);
  game.scene.add(house1);

  // Cửa chính căn nhà: bước vào là trở lại phòng khách để ôn lại từ vựng
  const house1Gate = makeHouseEntrance();
  house1Gate.position.set(8.8, 0.06, 19.0);
  house1Gate.rotation.y = Math.PI; // Quay mặt tiền ra hướng -Z đón người chơi
  game.scene.add(house1Gate);
  game.registerGate(house1Gate, 'front_door', 'living', { direction: 'back', label: 'Về Nhà (Phòng Khách)' });
  game.applyGateLockVisual(house1Gate, null); // Cửa nhà mình -> luôn mở

  // Cửa vào Cửa Hàng Tiện Lợi (便利商店) — chặng khám phá đầu tiên trong thành phố
  const storeGate = makeStoreEntrance();
  storeGate.position.set(6.88, 0.06, -4.0);
  storeGate.rotation.y = -Math.PI / 2; // mặt tiền quay ra lòng đường (-X)
  game.scene.add(storeGate);
  game.registerGate(storeGate, 'store_door', 'store', {
    requireZoneComplete: 'kitchen',
    label: 'Vào Cửa Hàng Tiện Lợi'
  });
  game.applyGateLockVisual(storeGate, 'kitchen');

  // 13. Cổng Công Viên (to Park)
  const parkGate = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
  [[-2.2], [2.2]].forEach(([px]) => {
    const pillar = new THREE.Mesh(createRoundedBoxGeometry(0.85, 3.9, 0.85, 0.06, 3), stoneMat);
    pillar.position.set(px, 1.95, 0); pillar.castShadow = true; parkGate.add(pillar);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 }));
    cap.position.set(px, 4.05, 0); parkGate.add(cap);
  });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 12, 28, Math.PI), stoneMat);
  arch.position.set(0, 3.6, 0); parkGate.add(arch);
  const gateSignBoard = new THREE.Mesh(createRoundedBoxGeometry(2.5, 0.6, 0.14, 0.05, 3),
    new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 }));
  gateSignBoard.position.set(0, 4.35, 0.05); parkGate.add(gateSignBoard);
  const gateSign = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.44),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
  gateSign.position.set(0, 4.35, 0.14);
  gateSign.userData.isGateSign = true;
  parkGate.add(gateSign);
  const gateLight = new THREE.PointLight(0xef4444, 0.7, 6, 1.5);
  gateLight.position.set(0, 4.4, 0.6);
  gateLight.userData.isGateLight = true;
  parkGate.add(gateLight);

  [-1, 1].forEach(side => {
    const barCount = isMobile ? 4 : 8;
    for (let i = 0; i < barCount; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 }));
      bar.position.set(side * (2.9 + i * (8 / barCount) * 0.55), 0.85, 0);
      parkGate.add(bar);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.09, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 }));
    rail.position.set(side * 4.85, 1.6, 0); parkGate.add(rail);
  });

  game.objectMeshFactories.park_gate = () => {
    const g = new THREE.Group();
    [[-2.2], [2.2]].forEach(([px]) => {
      const pillar = new THREE.Mesh(createRoundedBoxGeometry(0.85, 3.9, 0.85, 0.06, 3), stoneMat);
      pillar.position.set(px, 1.95, 0); g.add(pillar);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 }));
      cap.position.set(px, 4.05, 0); g.add(cap);
    });
    const a = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 12, 28, Math.PI), stoneMat);
    a.position.set(0, 3.6, 0); g.add(a);
    const sb = new THREE.Mesh(createRoundedBoxGeometry(2.5, 0.6, 0.14, 0.05, 3),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 }));
    sb.position.set(0, 4.35, 0.05); g.add(sb);
    return g;
  };
  parkGate.position.set(-6.2, 0.06, -22.5);
  game.scene.add(parkGate);
  // Cổng công viên chỉ mở sau khi khám phá xong cửa hàng tiện lợi
  game.registerGate(parkGate, 'park_gate', 'park', {
    requireZoneComplete: 'store',
    label: 'Vào Công Viên Trung Tâm'
  });
  game.applyGateLockVisual(parkGate, 'store');

  for (let i = 0; i < 7; i++) {
    const t = makeTree(1.25, 0x5c3a1e, 0x166534, isMobile);
    t.position.set(-14 + i * 2.6, 0.06, -28.5 - (i % 2) * 2.5);
    game.scene.add(t);
  }

  game.buildPlayerAvatar();

  game.colliders = [
    { name: 'building_r1', minX: 8.5, maxX: 18, minZ: 6.5, maxZ: 17.5 },
    { name: 'building_r2', minX: 8.5, maxX: 18, minZ: -7, maxZ: 3 },
    { name: 'building_r3', minX: 8.5, maxX: 18, minZ: -21, maxZ: -11 },
    { name: 'shop', minX: 7.0, maxX: 12.3, minZ: -7.2, maxZ: -0.8 },
    { name: 'home', minX: 7.0, maxX: 15.0, minZ: 19.3, maxZ: 26.5 },
    { name: 'building_l1', minX: -18, maxX: -8.5, minZ: 13, maxZ: 23 },
    { name: 'building_l2', minX: -18, maxX: -8.5, minZ: -1, maxZ: 9 },
    { name: 'building_l3', minX: -18, maxX: -8.5, minZ: -18, maxZ: -6 },
    { name: 'busstop', minX: 6.7, maxX: 8.6, minZ: 13.2, maxZ: 16.8 },
    { name: 'car1', minX: -3.2, maxX: -1.2, minZ: 5.8, maxZ: 10.2 },
    { name: 'car2', minX: 1.2, maxX: 3.2, minZ: -20.2, maxZ: -15.8 },
    { name: 'traffic_light', minX: 4.6, maxX: 5.2, minZ: -7.9, maxZ: -7.3 },
    { name: 'bench_walk', minX: 7.0, maxX: 8.4, minZ: 4.6, maxZ: 6.4 }
  ];

  lampZs.forEach((lz, i) => {
    const side = (i % 2 === 0) ? 1 : -1;
    game.colliders.push({
      name: `lamp_${i}`,
      minX: side * 4.55 - 0.28, maxX: side * 4.55 + 0.28,
      minZ: lz - 0.28, maxZ: lz + 0.28
    });
  });
  treeZs.forEach((tz, i) => {
    [-1, 1].forEach(side => {
      const tx = side * 5.15;
      const tzz = tz;
      game.colliders.push({
        name: `tree_${i}_${side}`,
        minX: tx - 0.45, maxX: tx + 0.45,
        minZ: tzz - 0.45, maxZ: tzz + 0.45
      });
    });
  });
}
