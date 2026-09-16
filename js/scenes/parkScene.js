/**
 * ============================================================================
 * ZONE 5: CÔNG VIÊN (公園 - PARK) SCENE BUILDER
 * ============================================================================
 */

/* global THREE */

import { createRoundedBoxGeometry } from '../utils/textures.js';
import { makeTree, makeStreetLamp } from './streetScene.js';

export function buildParkScene(game) {
  const isMobile = game.state?.device?.isMobile || false;
  game.roomBounds = { minX: -15, maxX: 15, minZ: -15, maxZ: 14 };

  const grassMat = new THREE.MeshStandardMaterial({ color: 0x4d9c2f, roughness: 1 });
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd6c7a1, roughness: 0.95 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.9 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2f8fd6, roughness: 0.06, metalness: 0.45, transparent: true, opacity: 0.85
  });

  // 1. Lawn (草地)
  const lawnGroup = new THREE.Group();
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), grassMat);
  lawn.rotation.x = -Math.PI / 2;
  lawn.receiveShadow = true;
  lawnGroup.add(lawn);

  for (let i = 0; i < (isMobile ? 9 : 22); i++) {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(1.2 + (i % 4) * 0.5, 16),
      new THREE.MeshStandardMaterial({ color: (i % 2) ? 0x3f8526 : 0x5aad38, roughness: 1 }));
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      Math.sin(i * 2.3) * 11,
      0.011,
      Math.cos(i * 1.7) * 11
    );
    lawnGroup.add(patch);
  }
  game.objectMeshFactories.pk_grass = () => {
    const g = new THREE.Group();
    const patch = new THREE.Mesh(createRoundedBoxGeometry(3.2, 0.22, 3.2, 0.08, 3), grassMat);
    g.add(patch);
    for (let i = 0; i < 40; i++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.28, 5),
        new THREE.MeshStandardMaterial({ color: (i % 2) ? 0x3f8526 : 0x6cc248, roughness: 1 }));
      blade.position.set((Math.sin(i * 7.3) * 1.45), 0.24, (Math.cos(i * 3.1) * 1.45));
      blade.rotation.z = Math.sin(i) * 0.25;
      g.add(blade);
    }
    return g;
  };
  game.registerInteractable(lawnGroup, 'pk_grass');
  game.scene.add(lawnGroup);

  // 2. Stone Walkways
  const mainPath = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 30), pathMat);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(0, 0.02, 0);
  game.scene.add(mainPath);
  const crossPath = new THREE.Mesh(new THREE.PlaneGeometry(24, 3.0), pathMat);
  crossPath.rotation.x = -Math.PI / 2;
  crossPath.position.set(0, 0.02, 0);
  game.scene.add(crossPath);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.4, 5.0, 48), pathMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.021, 0);
  game.scene.add(ring);

  // 3. Central Fountain (噴泉)
  const fountain = new THREE.Group();
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 0.65, 40), stoneMat);
  basin.position.y = 0.32; basin.castShadow = true; fountain.add(basin);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.85, 0.5, 40),
    new THREE.MeshStandardMaterial({ color: 0x8b8b86, roughness: 0.85 }));
  inner.position.y = 0.4; fountain.add(inner);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.85, 40), waterMat);
  pool.rotation.x = -Math.PI / 2; pool.position.y = 0.6; fountain.add(pool);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 1.1, 20), stoneMat);
  pedestal.position.y = 1.05; fountain.add(pedestal);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.5, 0.32, 28), stoneMat);
  bowl.position.y = 1.72; fountain.add(bowl);
  const topSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.75, 14), stoneMat);
  topSpout.position.y = 2.25; fountain.add(topSpout);

  const jets = [];
  for (let i = 0; i < 16; i++) {
    const jet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.05, transparent: true, opacity: 0.75 }));
    jet.userData.angle = (i / 16) * Math.PI * 2;
    jet.userData.phase = (i / 16);
    fountain.add(jet);
    jets.push(jet);
  }
  fountain.position.set(0, 0, 0);
  game.registerInteractable(fountain, 'pk_fountain');
  game.scene.add(fountain);

  game.animatedProps.push({
    type: 'fountain', jets, t: 0,
    update(delta) {
      this.t += delta;
      this.jets.forEach(j => {
        const p = (this.t * 0.9 + j.userData.phase) % 1;
        const r = 0.25 + p * 1.5;
        j.position.set(
          Math.cos(j.userData.angle) * r,
          2.65 + p * 1.0 - p * p * 2.3,
          Math.sin(j.userData.angle) * r
        );
        j.material.opacity = 0.8 * (1 - p);
      });
    }
  });

  // 4. Lake (湖) & Bridge (橋)
  const lakeGroup = new THREE.Group();
  const lakeShape = new THREE.Mesh(new THREE.CircleGeometry(5.2, 44),
    new THREE.MeshStandardMaterial({ color: 0x6b5f45, roughness: 1 }));
  lakeShape.rotation.x = -Math.PI / 2;
  lakeShape.position.y = 0.015;
  lakeShape.scale.set(1.5, 1, 1);
  lakeGroup.add(lakeShape);
  const lakeWater = new THREE.Mesh(new THREE.CircleGeometry(5.0, 44), waterMat);
  lakeWater.rotation.x = -Math.PI / 2;
  lakeWater.position.y = 0.06;
  lakeWater.scale.set(1.5, 1, 1);
  lakeGroup.add(lakeWater);

  const rockCount = isMobile ? 14 : 30;
  for (let i = 0; i < rockCount; i++) {
    const a = (i / rockCount) * Math.PI * 2;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 + (i % 3) * 0.09, 0), stoneMat);
    rock.position.set(Math.cos(a) * 7.7, 0.12, Math.sin(a) * 5.15);
    rock.rotation.set(i, i * 0.7, i * 0.3);
    lakeGroup.add(rock);
  }
  lakeGroup.position.set(-9.5, 0, -6);
  game.registerInteractable(lakeGroup, 'pk_lake');
  game.scene.add(lakeGroup);

  const bridge = new THREE.Group();
  const bridgeWood = new THREE.MeshStandardMaterial({ color: 0x9a5b2c, roughness: 0.85 });
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const plank = new THREE.Mesh(createRoundedBoxGeometry(1.9, 0.11, 0.42, 0.02, 2), bridgeWood);
    plank.position.set(0, 0.75 + Math.sin(t * Math.PI) * 0.75, -3.4 + i * 0.52);
    plank.rotation.x = Math.cos(t * Math.PI) * 0.28;
    plank.castShadow = true;
    bridge.add(plank);
  }
  [-0.98, 0.98].forEach(rx => {
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.85, 8), bridgeWood);
      post.position.set(rx, 1.2 + Math.sin(t * Math.PI) * 0.75, -3.2 + i * 0.92);
      bridge.add(post);
    }
    const railTop = new THREE.Mesh(new THREE.TorusGeometry(3.85, 0.055, 8, 26, Math.PI), bridgeWood);
    railTop.position.set(rx, 0.85, 0.2);
    railTop.rotation.y = Math.PI / 2;
    railTop.scale.set(1, 0.22, 1);
    bridge.add(railTop);
  });
  bridge.position.set(-9.5, 0, -6);
  bridge.rotation.y = Math.PI / 2;
  game.registerInteractable(bridge, 'pk_bridge');
  game.scene.add(bridge);

  // 5. Flower Bed (花)
  const flowerBed = new THREE.Group();
  const bedRing = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.22, 10, 34), stoneMat);
  bedRing.rotation.x = -Math.PI / 2;
  bedRing.position.y = 0.14;
  flowerBed.add(bedRing);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(2.25, 32),
    new THREE.MeshStandardMaterial({ color: 0x5b4025, roughness: 1 }));
  soil.rotation.x = -Math.PI / 2; soil.position.y = 0.09; flowerBed.add(soil);
  const petalColors = [0xf472b6, 0xfbbf24, 0xef4444, 0xa78bfa, 0xfb923c, 0xfda4af];
  const flowerCount = isMobile ? 18 : 46;
  for (let i = 0; i < flowerCount; i++) {
    const a = i * 2.399;
    const r = 0.28 + Math.sqrt(i / flowerCount) * 1.85;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.36, 6),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }));
    stem.position.set(Math.cos(a) * r, 0.27, Math.sin(a) * r);
    flowerBed.add(stem);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8),
      new THREE.MeshStandardMaterial({ color: petalColors[i % petalColors.length], roughness: 0.7 }));
    bloom.position.set(Math.cos(a) * r, 0.48, Math.sin(a) * r);
    flowerBed.add(bloom);
  }
  flowerBed.position.set(8.5, 0, 3.5);
  game.registerInteractable(flowerBed, 'pk_flower');
  game.scene.add(flowerBed);

  // 6. Swing (鞦韆) & Slide
  const swing = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.4, metalness: 0.6 });
  [-1, 1].forEach(side => {
    [-1, 1].forEach(lean => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 2.9, 10), frameMat);
      leg.position.set(side * 1.75, 1.35, lean * 0.75);
      leg.rotation.x = -lean * 0.25;
      leg.castShadow = true;
      swing.add(leg);
    });
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 3.9, 12), frameMat);
  beam.rotation.z = Math.PI / 2;
  beam.position.y = 2.72;
  swing.add(beam);
  const seats = [];
  [-0.85, 0.85].forEach(sx => {
    const seatGroup = new THREE.Group();
    [-0.22, 0.22].forEach(cx => {
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.75, 6),
        new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.35, metalness: 0.85 }));
      chain.position.set(cx, -0.88, 0);
      seatGroup.add(chain);
    });
    const seat = new THREE.Mesh(createRoundedBoxGeometry(0.62, 0.08, 0.28, 0.03, 2),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }));
    seat.position.y = -1.78;
    seatGroup.add(seat);
    seatGroup.position.set(sx, 2.72, 0);
    swing.add(seatGroup);
    seats.push(seatGroup);
  });
  swing.position.set(9.5, 0, -6.5);
  game.registerInteractable(swing, 'pk_swing');
  game.scene.add(swing);

  game.animatedProps.push({
    type: 'swing', seats, t: 0,
    update(delta) {
      this.t += delta;
      this.seats.forEach((s, i) => {
        s.rotation.x = Math.sin(this.t * 1.35 + i * 1.1) * 0.35;
      });
    }
  });

  const slide = new THREE.Group();
  const slideMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.3 });
  const slideRamp = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.1, 3.4, 0.04, 2), slideMat);
  slideRamp.position.set(0, 1.05, 0.6);
  slideRamp.rotation.x = 0.5;
  slide.add(slideRamp);
  const platform = new THREE.Mesh(createRoundedBoxGeometry(1.0, 0.12, 1.0, 0.04, 2), slideMat);
  platform.position.set(0, 1.85, -1.2);
  slide.add(platform);
  [[-0.42, -1.6], [0.42, -1.6], [-0.42, -0.8], [0.42, -0.8]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.85, 8),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4, metalness: 0.6 }));
    leg.position.set(lx, 0.92, lz);
    slide.add(leg);
  });
  slide.position.set(12.2, 0, -4.5);
  game.scene.add(slide);

  // 7. Statue (雕像)
  const statue = new THREE.Group();
  const pedestalS = new THREE.Mesh(createRoundedBoxGeometry(1.5, 1.15, 1.5, 0.05, 3), stoneMat);
  pedestalS.position.y = 0.58; pedestalS.castShadow = true; statue.add(pedestalS);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.35, metalness: 0.8 }));
  plaque.position.set(0, 0.68, 0.755); statue.add(plaque);
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.45 });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.15, 16), marbleMat);
  torso.position.y = 1.75; torso.castShadow = true; statue.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), marbleMat);
  head.position.y = 2.52; statue.add(head);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.95, 12), marbleMat);
  armL.position.set(-0.42, 1.95, 0.05); armL.rotation.z = 0.75; statue.add(armL);
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.05, 12), marbleMat);
  armR.position.set(0.44, 2.15, 0.05); armR.rotation.z = -1.15; statue.add(armR);
  statue.position.set(-8.5, 0, 7.5);
  game.registerInteractable(statue, 'pk_statue');
  game.scene.add(statue);

  // 8. Birds (鳥) & Feeder
  const birdGroup = new THREE.Group();
  const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.9, 10),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
  perch.position.y = 0.95; birdGroup.add(perch);
  const feeder = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 }));
  feeder.position.y = 1.94; birdGroup.add(feeder);
  const roofF = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.45, 4),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }));
  roofF.rotation.y = Math.PI / 4; roofF.position.y = 2.5; birdGroup.add(roofF);
  const birds = [];
  [[0x38bdf8, -0.22], [0xfbbf24, 0.24]].forEach(([bc, bx]) => {
    const b = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10),
      new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 }));
    body.scale.set(1.35, 1, 1); b.add(body);
    const bhead = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10),
      new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 }));
    bhead.position.set(0.16, 0.09, 0); b.add(bhead);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 }));
    beak.position.set(0.25, 0.07, 0); beak.rotation.z = -Math.PI / 2; b.add(beak);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 }));
    tail.position.set(-0.2, 0.02, 0); tail.rotation.z = Math.PI / 2; b.add(tail);
    b.position.set(bx, 2.1, 0);
    birdGroup.add(b);
    birds.push(b);
  });
  birdGroup.position.set(5.5, 0, 8.5);
  game.registerInteractable(birdGroup, 'pk_bird');
  game.scene.add(birdGroup);

  game.animatedProps.push({
    type: 'birds', birds, t: 0,
    update(delta) {
      this.t += delta;
      this.birds.forEach((b, i) => {
        b.position.y = 2.1 + Math.abs(Math.sin(this.t * 2.2 + i * 1.6)) * 0.09;
        b.rotation.y = Math.sin(this.t * 0.8 + i) * 0.6;
      });
    }
  });

  // 9. Trees & Park Benches
  const treeSpots = [
    [-13, 10], [-6, 12], [4, 12], [13, 9], [14, 1],
    [13, -12], [4, -13], [-4, -13], [-13, -12], [-14, 2]
  ];
  treeSpots.forEach(([tx, tz], i) => {
    const tree = makeTree(1.15 + (i % 3) * 0.18, 0x5c3a1e, [0x166534, 0x15803d, 0x22c55e][i % 3], isMobile);
    tree.position.set(tx, 0, tz);
    game.scene.add(tree);
  });

  const benchSpots = [[-4.2, 3.6, 0], [4.2, 3.6, 0], [-4.2, -3.6, Math.PI], [4.2, -3.6, Math.PI]];
  benchSpots.forEach(([bx, bz, ry]) => {
    game.placeZoneModel('pk_bench', { x: bx, y: 0, z: bz }, { targetHeight: 0.92, alignBottomY: true, rotationY: ry }, () => {
      const g = new THREE.Group();
      const woodM = new THREE.MeshStandardMaterial({ color: 0x9a6a3c, roughness: 0.85 });
      const seat = new THREE.Mesh(createRoundedBoxGeometry(1.7, 0.08, 0.5, 0.02, 2), woodM);
      seat.position.y = 0.45; g.add(seat);
      const back = new THREE.Mesh(createRoundedBoxGeometry(1.7, 0.5, 0.07, 0.02, 2), woodM);
      back.position.set(0, 0.72, -0.22); g.add(back);
      [-0.72, 0.72].forEach(lx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.45, 0.46),
          new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 }));
        leg.position.set(lx, 0.22, -0.05); g.add(leg);
      });
      g.rotation.y = ry;
      return g;
    });
  });

  [[-6.5, 5.5], [6.5, 5.5], [-6.5, -6.5], [6.5, -9.5]].forEach(([lx, lz]) => {
    const lamp = makeStreetLamp();
    lamp.scale.set(0.72, 0.72, 0.72);
    lamp.position.set(lx, 0, lz);
    lamp.rotation.y = Math.atan2(-lx, -lz);
    game.scene.add(lamp);
  });

  // 10. Exit Gate (Return to Street)
  const outGate = new THREE.Group();
  [[-2.2], [2.2]].forEach(([px]) => {
    const pillar = new THREE.Mesh(createRoundedBoxGeometry(0.85, 3.9, 0.85, 0.06, 3), stoneMat);
    pillar.position.set(px, 1.95, 0); outGate.add(pillar);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 }));
    cap.position.set(px, 4.05, 0); outGate.add(cap);
  });
  const outArch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 12, 28, Math.PI), stoneMat);
  outArch.position.set(0, 3.6, 0); outGate.add(outArch);
  const outSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.1 }));
  outSign.position.set(0, 4.3, 0.12); outGate.add(outSign);
  outGate.position.set(0, 0, 14.2);
  game.scene.add(outGate);
  game.registerGate(outGate, 'back_door', 'street', { direction: 'back' });

  // Perimeter Fence
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 });
  const buildFenceRun = (x0, z0, x1, z1) => {
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    const n = Math.max(2, Math.round(len / (isMobile ? 1.5 : 0.62)));
    for (let i = 0; i <= n; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8), fenceMat);
      bar.position.set(x0 + dx * (i / n), 0.85, z0 + dz * (i / n));
      game.scene.add(bar);
    }
  };
  buildFenceRun(-15.5, 14.5, -2.6, 14.5);
  buildFenceRun(2.6, 14.5, 15.5, 14.5);
  buildFenceRun(-15.5, -15.5, 15.5, -15.5);
  buildFenceRun(-15.5, 14.5, -15.5, -15.5);
  buildFenceRun(15.5, 14.5, 15.5, -15.5);

  game.buildPlayerAvatar();

  game.colliders = [
    { name: 'fountain', minX: -3.4, maxX: 3.4, minZ: -3.4, maxZ: 3.4 },
    { name: 'lake', minX: -17.5, maxX: -1.6, minZ: -11.2, maxZ: -0.8 },
    { name: 'flowerbed', minX: 6.2, maxX: 10.8, minZ: 1.2, maxZ: 5.8 },
    { name: 'statue', minX: -9.4, maxX: -7.6, minZ: 6.6, maxZ: 8.4 },
    { name: 'swing', minX: 7.6, maxX: 11.4, minZ: -7.6, maxZ: -5.4 },
    { name: 'slide', minX: 11.4, maxX: 13.0, minZ: -6.4, maxZ: -2.6 }
  ];
}
