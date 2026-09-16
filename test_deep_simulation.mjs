// Deep Logic & Scene Simulation Test
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
import { ROOM_VOCAB_DATA, TOTAL_VOCAB_COUNT } from './js/data/vocabData.js';
import { buildBedroomScene } from './js/scenes/bedroomScene.js';
import { buildLivingScene } from './js/scenes/livingScene.js';
import { buildKitchenScene } from './js/scenes/kitchenScene.js';
import { buildStreetScene } from './js/scenes/streetScene.js';
import { buildStoreScene } from './js/scenes/storeScene.js';
import { buildParkScene } from './js/scenes/parkScene.js';

console.log('--- TEST 1: GAME STATE SIMULATION ---');
const state = new GameState();
console.log('Initial score:', state.score);
console.log('Initial currentZone:', state.currentZone);
console.log('Initial unlockedZones:', Array.from(state.unlockedZones));

// Discover all items in bedroom
ZONES.bedroom.items.forEach(id => state.markDiscovered(id));
console.log('Bedroom complete?', state.isZoneComplete('bedroom'));
console.log('Bedroom remaining:', state.zoneRemaining('bedroom'));
state.syncUnlockedZones();
console.log('Unlocked zones after bedroom complete:', Array.from(state.unlockedZones));
if (!state.unlockedZones.has('living')) throw new Error('Living room should be unlocked after bedroom completion');

// Discover remaining items across all zones
ZONE_ORDER.forEach(zid => {
  ZONES[zid].items.forEach(id => state.markDiscovered(id));
});
state.syncUnlockedZones();
console.log('Total discovered items:', state.totalFound());
console.log('Is all complete?', state.isAllComplete());
if (state.totalFound() !== TOTAL_VOCAB_COUNT) {
  throw new Error(`Total found ${state.totalFound()} does not match total count ${TOTAL_VOCAB_COUNT}`);
}
console.log('GameState logic tests: PASS');

console.log('\n--- TEST 2: PROCEDURAL SCENE BUILDERS SIMULATION ---');
class MockGame {
  constructor() {
    this.scene = new MockObject3D();
    this.colliders = [];
    this.interactiveObjects = [];
    this.objectMeshFactories = {};
    this.loadedModels = {};
    this.animatedProps = [];
    this.smokeParticles = [];
  }
  buildPlayerAvatar() {}
  placeZoneModel(id, pos, opts, fallbackFn) {
    if (fallbackFn) {
      const fb = fallbackFn();
      fb.position.set(pos.x, pos.y || 0, pos.z);
      this.scene.add(fb);
      return fb;
    }
    return new MockObject3D();
  }
  cloneForInspector(root) {
    return root.clone();
  }
  registerInteractable(obj, vocabId) {
    obj.userData.vocabId = vocabId;
    obj.userData.vocabData = ROOM_VOCAB_DATA[vocabId];
    this.interactiveObjects.push(obj);
  }
  registerGate(obj, gateVocabId, targetZoneId, opts) {
    obj.userData.vocabId = gateVocabId;
    obj.userData.gateTarget = targetZoneId;
    this.interactiveObjects.push(obj);
    return obj;
  }
  applyGateLockVisual() {}
}

const testScene = (name, builderFn) => {
  const g = new MockGame();
  builderFn(g);
  console.log(`[${name}] Interactive objects registered: ${g.interactiveObjects.length}, Colliders: ${g.colliders.length}`);
  if (g.interactiveObjects.length === 0) throw new Error(`${name} registered 0 interactive objects`);
};

testScene('Bedroom Scene', buildBedroomScene);
testScene('Living Scene', buildLivingScene);
testScene('Kitchen Scene', buildKitchenScene);
testScene('Street Scene', buildStreetScene);
testScene('Store Scene', buildStoreScene);
testScene('Park Scene', buildParkScene);

console.log('\n=== ALL DEEP LOGIC & SCENE TESTS PASSED SUCCESSFULLY! ===');
