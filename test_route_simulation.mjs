// Route / Journey Progression Simulation Test
global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {}
};
global.document = {
  getElementById: () => ({
    appendChild: () => {},
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    style: {},
    querySelectorAll: () => []
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({
    width: 512,
    height: 512,
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      arc: () => {},
      ellipse: () => {},
      stroke: () => {},
      fill: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 50 }),
      save: () => {},
      restore: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      setLineDash: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} })
    })
  })
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

class MockObject3D {
  constructor() {
    this.children = [];
    this.position = { x: 0, y: 0, z: 0, set: function(x,y,z) { this.x=x; this.y=y; this.z=z; return this; }, sub: function() { return this; } };
    this.rotation = { x: 0, y: 0, z: 0, set: function(x,y,z) { this.x=x; this.y=y; this.z=z; return this; } };
    this.scale = { x: 1, y: 1, z: 1, set: function(x,y,z) { this.x=x; this.y=y; this.z=z; return this; }, setScalar: function(s) { this.x=s; this.y=s; this.z=s; return this; } };
    this.userData = {};
    this.isMesh = true;
  }
  add(child) { this.children.push(child); child.parent = this; return this; }
  remove(child) { const idx = this.children.indexOf(child); if (idx !== -1) this.children.splice(idx, 1); }
  traverse(cb) {
    cb(this);
    for (const c of [...this.children]) if (c && c.traverse) c.traverse(cb);
  }
  clone() {
    const copy = new MockObject3D();
    copy.userData = { ...this.userData };
    return copy;
  }
  updateMatrixWorld() {}
}

global.THREE = {
  Scene: MockObject3D,
  Group: MockObject3D,
  Mesh: class extends MockObject3D { constructor(geo, mat) { super(); this.geometry = geo; this.material = mat; } },
  PointLight: class extends MockObject3D { constructor() { super(); this.isPointLight = true; this.color = { setHex: () => {} }; } },
  SpotLight: class extends MockObject3D { constructor() { super(); this.isSpotLight = true; this.target = new MockObject3D(); } },
  AmbientLight: class extends MockObject3D { constructor() { super(); this.isLight = true; this.color = { setHex: () => {} }; } },
  DirectionalLight: class extends MockObject3D { constructor() { super(); this.isLight = true; this.shadow = { camera: { updateProjectionMatrix: () => {} }, mapSize: {} }; this.color = { setHex: () => {} }; } },
  PlaneGeometry: class { constructor() {} dispose() {} },
  BoxGeometry: class { constructor() {} dispose() {} },
  CylinderGeometry: class { constructor() {} dispose() {} },
  SphereGeometry: class { constructor() {} dispose() {} },
  TorusGeometry: class { constructor() {} dispose() {} },
  ConeGeometry: class { constructor() {} dispose() {} },
  CircleGeometry: class { constructor() {} dispose() {} },
  RingGeometry: class { constructor() {} dispose() {} },
  OctahedronGeometry: class { constructor() {} dispose() {} },
  DodecahedronGeometry: class { constructor() {} dispose() {} },
  IcosahedronGeometry: class { constructor() {} dispose() {} },
  BufferGeometry: class { constructor() { this.setAttribute = () => {}; } dispose() {} },
  BufferAttribute: class { constructor() {} },
  Float32BufferAttribute: class { constructor() {} },
  Uint16BufferAttribute: class { constructor() {} },
  Matrix4: class { makeRotationY() { return this; } makeScale() { return this; } makeTranslation() { return this; } },
  Shape: class { moveTo() {} lineTo() {} quadraticCurveTo() {} bezierCurveTo() {} absarc() {} absellipse() {} },
  ShapeGeometry: class { constructor() {} center() {} computeVertexNormals() {} dispose() {} },
  ExtrudeGeometry: class { constructor() {} center() {} computeVertexNormals() {} dispose() {} },
  MeshStandardMaterial: class { constructor(opts = {}) { Object.assign(this, opts); } dispose() {} },
  MeshBasicMaterial: class { constructor(opts = {}) { Object.assign(this, opts); } dispose() {} },
  CanvasTexture: class { constructor() { this.repeat = { set: () => {} }; } },
  Vector3: class { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x,y,z) { this.x=x; this.y=y; this.z=z; return this; } clone() { return new global.THREE.Vector3(this.x, this.y, this.z); } add() { return this; } sub() { return this; } multiplyScalar() { return this; } lengthSq() { return 0; } normalize() { return this; } distanceTo() { return 0; } },
  Vector2: class { constructor(x = 0, y = 0) { this.x = x; this.y = y; } set() { return this; } },
  Box3: class { setFromObject() { return this; } getSize(v) { v.set(1, 1, 1); return v; } getCenter(v) { v.set(0, 0, 0); return v; } },
  Color: class { setHex() {} },
  FogExp2: class {},
  Clock: class { getDelta() { return 0.016; } },
  MathUtils: {
    clamp: (v, min, max) => Math.min(Math.max(v, min), max),
    lerp: (a, b, t) => a + (b - a) * t,
    degToRad: deg => deg * (Math.PI / 180)
  }
};

import { GameState } from './js/core/gameState.js';
import { ZONES, ZONE_ORDER } from './js/data/zones.js';
import { ROOM_VOCAB_DATA } from './js/data/vocabData.js';
import { buildBedroomScene } from './js/scenes/bedroomScene.js';
import { buildLivingScene } from './js/scenes/livingScene.js';
import { buildKitchenScene } from './js/scenes/kitchenScene.js';
import { buildStreetScene } from './js/scenes/streetScene.js';
import { buildStoreScene } from './js/scenes/storeScene.js';
import { buildParkScene } from './js/scenes/parkScene.js';

const BUILDERS = {
  bedroom: buildBedroomScene,
  living: buildLivingScene,
  kitchen: buildKitchenScene,
  street: buildStreetScene,
  store: buildStoreScene,
  park: buildParkScene
};

let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label} ${extra}`);
  }
};

class MockGame {
  constructor(state) {
    this.state = state;
    this.scene = new MockObject3D();
    this.colliders = [];
    this.interactiveObjects = [];
    this.objectMeshFactories = {};
    this.loadedModels = {};
    this.animatedProps = [];
    this.smokeParticles = [];
    this.gates = [];
  }
  buildPlayerAvatar() {}
  fitModelToBounds() { return null; }
  placeZoneModel(id, pos, opts, fallbackFn) {
    if (fallbackFn) {
      const fb = fallbackFn();
      fb.position.set(pos.x, pos.y || 0, pos.z);
      this.scene.add(fb);
      return fb;
    }
    return new MockObject3D();
  }
  cloneForInspector(root) { return root.clone(); }
  registerInteractable(obj, vocabId) {
    obj.userData.vocabId = vocabId;
    obj.userData.vocabData = ROOM_VOCAB_DATA[vocabId];
    this.interactiveObjects.push(obj);
  }
  registerGate(obj, gateVocabId, targetZoneId, opts = {}) {
    const data = {
      vocabId: gateVocabId,
      gateTarget: targetZoneId,
      gateLocked: !!opts.requireComplete,
      requireZoneComplete: opts.requireZoneComplete || null,
      gateDirection: opts.direction || 'forward',
      gateLabel: opts.label || ''
    };
    Object.assign(obj.userData, data);
    this.interactiveObjects.push(obj);
    this.gates.push(data);
    return obj;
  }
  applyGateLockVisual() {}
}

const buildZone = (zoneId, state) => {
  const g = new MockGame(state);
  BUILDERS[zoneId](g);
  return g;
};

/** Mo phong handleGateInteraction cua gameEngine: co qua duoc cong nay khong? */
const canPass = (state, currentZone, gate) => {
  if (gate.gateDirection === 'back') return true;
  if (gate.requireZoneComplete && !state.isZoneComplete(gate.requireZoneComplete)) return false;
  if (gate.gateLocked && state.zoneRemaining(currentZone) > 0) return false;
  return true;
};

const gateTo = (game, target) => game.gates.find(g => g.gateTarget === target);

console.log('=== TEST 1: MOI MAN DEU DUNG DAY DU & CO DU DO VAT ===');
const probe = new GameState();
for (const zoneId of ZONE_ORDER) {
  const g = buildZone(zoneId, probe);
  const vocabIds = new Set(
    g.interactiveObjects.map(o => o.userData.vocabId).filter(Boolean)
  );
  const missing = ZONES[zoneId].items.filter(i => !vocabIds.has(i));
  check(
    `${zoneId}: ${g.interactiveObjects.length} vat the, ${g.colliders.length} collider, du ${ZONES[zoneId].items.length} tu vung`,
    missing.length === 0,
    missing.length ? `(thieu: ${missing.join(', ')})` : ''
  );
}

console.log('\n=== TEST 2: CAC CONG CUA TUNG MAN DAN DI DUNG NOI ===');
const expectedGates = {
  bedroom: ['living'],
  living: ['bedroom', 'kitchen', 'street'],
  kitchen: ['living'],
  street: ['living', 'store', 'park'],
  store: ['street'],
  park: ['street']
};
for (const zoneId of ZONE_ORDER) {
  const g = buildZone(zoneId, probe);
  const targets = g.gates.map(x => x.gateTarget).sort();
  const want = [...expectedGates[zoneId]].sort();
  check(
    `${zoneId} -> [${targets.join(', ')}]`,
    JSON.stringify(targets) === JSON.stringify(want),
    `(mong doi: ${want.join(', ')})`
  );
}

console.log('\n=== TEST 3: LO TRINH TUYEN TINH DUOC KHOA DUNG THU TU ===');
const state = new GameState();
state.resetProgress();

// --- Chang 1: thuc day o phong ngu ---
let bedroom = buildZone('bedroom', state);
check('Bat dau o phong ngu', state.currentZone === 'bedroom');
check('Chua kham pha xong -> cua phong ngu con khoa',
  !canPass(state, 'bedroom', gateTo(bedroom, 'living')));
check('Phong khach chua mo khoa', !state.unlockedZones.has('living'));

ZONES.bedroom.items.forEach(id => state.markDiscovered(id));
check('Kham pha xong phong ngu -> cua sang phong khach mo',
  canPass(state, 'bedroom', gateTo(bedroom, 'living')));
check('Phong khach da mo khoa', state.unlockedZones.has('living'));
check('Bep VAN con khoa', !state.unlockedZones.has('kitchen'));
check('Duong pho VAN con khoa', !state.unlockedZones.has('street'));

// --- Chang 2: phong khach ---
let living = buildZone('living', state);
check('Chua xong phong khach -> loi sang bep con khoa',
  !canPass(state, 'living', gateTo(living, 'kitchen')));
check('Chua xong bep -> cua lon ra thanh pho con khoa',
  !canPass(state, 'living', gateTo(living, 'street')));
check('Luon quay lai duoc phong ngu',
  canPass(state, 'living', gateTo(living, 'bedroom')));

ZONES.living.items.forEach(id => state.markDiscovered(id));
check('Kham pha xong phong khach -> mo loi sang bep',
  canPass(state, 'living', gateTo(living, 'kitchen')));
check('Bep da mo khoa', state.unlockedZones.has('kitchen'));
check('Cua lon ra thanh pho VAN khoa (chua xong bep)',
  !canPass(state, 'living', gateTo(living, 'street')));

// --- Chang 3: bep ---
let kitchen = buildZone('kitchen', state);
check('Bep chi co mot loi ra: quay lai phong khach',
  kitchen.gates.length === 1 && kitchen.gates[0].gateTarget === 'living');
check('Loi ra bep luon mo', canPass(state, 'kitchen', gateTo(kitchen, 'living')));

ZONES.kitchen.items.forEach(id => state.markDiscovered(id));
check('Xong bep -> duong pho mo khoa', state.unlockedZones.has('street'));
check('Xong bep -> cua hang tien loi mo cua', state.unlockedZones.has('store'));
check('Cong vien VAN con khoa', !state.unlockedZones.has('park'));

living = buildZone('living', state);
check('Quay lai phong khach -> cua lon ra thanh pho da mo',
  canPass(state, 'living', gateTo(living, 'street')));

// --- Chang 4: duong pho ---
let street = buildZone('street', state);
check('Duong pho: cua hang tien loi da mo',
  canPass(state, 'street', gateTo(street, 'store')));
check('Duong pho: cong cong vien CON KHOA (chua xong cua hang)',
  !canPass(state, 'street', gateTo(street, 'park')));
check('Duong pho: luon ve nha duoc',
  canPass(state, 'street', gateTo(street, 'living')));

// --- Chang 5: cua hang tien loi ---
const store = buildZone('store', state);
check('Cua hang: loi ra lai duong pho luon mo',
  canPass(state, 'store', gateTo(store, 'street')));

ZONES.store.items.forEach(id => state.markDiscovered(id));
check('Xong cua hang -> cong vien mo khoa', state.unlockedZones.has('park'));

street = buildZone('street', state);
check('Ra lai duong pho -> cong cong vien da mo',
  canPass(state, 'street', gateTo(street, 'park')));

// --- Chang 6: cong vien ---
ZONES.park.items.forEach(id => state.markDiscovered(id));
check('Xong cong vien nhung do vat doc pho (tuy chon) chua het -> chua 100%',
  !state.isAllComplete());
ZONES.street.items.forEach(id => state.markDiscovered(id));
check('Nhat not do vat doc pho -> hoan thanh 100% hanh trinh', state.isAllComplete());

console.log('\n=== TEST 4: DIEM SPAWN KHI DI QUA TUNG CUA ===');
const spawnPairs = [
  ['bedroom', 'living'], ['living', 'bedroom'], ['living', 'kitchen'],
  ['kitchen', 'living'], ['living', 'street'], ['street', 'living'],
  ['street', 'store'], ['store', 'street'], ['street', 'park'], ['park', 'street']
];
for (const [from, to] of spawnPairs) {
  const zone = ZONES[to];
  const spawn = zone.spawnsFrom && zone.spawnsFrom[from];
  check(
    `${from} -> ${to} spawn tai (${(spawn || zone.spawn).x}, ${(spawn || zone.spawn).z})`,
    !!spawn,
    '(thieu spawnsFrom, se dung spawn mac dinh)'
  );
}

console.log('\n=== KET QUA ===');
if (failures > 0) {
  console.log(`${failures} kiem tra THAT BAI`);
  process.exit(1);
}
console.log('TAT CA KIEM TRA LO TRINH DEU DAT!');
