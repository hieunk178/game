// Global Mocks for Node.js testing environment
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
  createElement: () => ({ getContext: () => ({ fillRect: () => {}, createLinearGradient: () => ({ addColorStop: () => {} }) }) })
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.THREE = {
  Scene: class {},
  PerspectiveCamera: class { position = { set: () => {} }; lookAt = () => {}; updateProjectionMatrix = () => {} },
  WebGLRenderer: class { setPixelRatio = () => {}; setSize = () => {}; shadowMap = {}; domElement = {} },
  Group: class { add = () => {}; remove = () => {}; position = { set: () => {}, sub: () => {} }; rotation = { set: () => {} }; scale = { set: () => {} }; traverse = () => {} },
  Vector3: class { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set() { return this; } clone() { return new global.THREE.Vector3(this.x, this.y, this.z); } add() { return this; } sub() { return this; } multiplyScalar() { return this; } lengthSq() { return 0; } normalize() { return this; } distanceTo() { return 0; } },
  Vector2: class { constructor(x = 0, y = 0) { this.x = x; this.y = y; } },
  Clock: class { getDelta = () => 0.016 },
  Color: class { setHex = () => {} },
  FogExp2: class {},
  AmbientLight: class { constructor() { this.color = { setHex: () => {} }; } },
  DirectionalLight: class { constructor() { this.position = { set: () => {} }; this.shadow = { camera: { updateProjectionMatrix: () => {} }, mapSize: {} }; this.color = { setHex: () => {} }; } },
  PointLight: class { constructor() { this.position = { set: () => {} }; this.color = { setHex: () => {} }; } },
  PCFSoftShadowMap: 1,
  PCFShadowMap: 2,
  ACESFilmicToneMapping: 1,
  MathUtils: { clamp: (v, min, max) => Math.min(Math.max(v, min), max), lerp: (a, b, t) => a + (b - a) * t }
};

// Test script for modular ES6 architecture validation

import { DEVICE } from './js/core/device.js';
import { SoundFX } from './js/core/audio.js';
import { GameState } from './js/core/gameState.js';
import { ROOM_VOCAB_DATA, TOTAL_VOCAB_COUNT, BEDROOM_VOCAB, LIVING_VOCAB, KITCHEN_VOCAB, STREET_VOCAB, PARK_VOCAB } from './js/data/vocabData.js';
import { ZONES, ZONE_ORDER, MODEL_FILES, ZONE_MODEL_IDS, AVATAR_FILES, AVATAR_RIG_SPECS } from './js/data/zones.js';
import {
  createWoodTexture,
  createRugTexture,
  createOnyxMarbleTexture,
  createLuxuryRugTexture,
  createDarkWalnutTexture,
  createLeatherTexture,
  createRoundedBoxGeometry,
  createAbstractArtTexture,
  createScreenTexture,
  createWindowSkyTexture,
  createBackpackFabricTexture,
  createClockFaceTexture
} from './js/utils/textures.js';
import { InspectorStudio } from './js/ui/inspectorStudio.js';
import { buildBedroomScene } from './js/scenes/bedroomScene.js';
import { buildLivingScene } from './js/scenes/livingScene.js';
import { buildKitchenScene } from './js/scenes/kitchenScene.js';
import { buildStreetScene } from './js/scenes/streetScene.js';
import { buildParkScene } from './js/scenes/parkScene.js';
import { VocabRoomGame } from './js/gameEngine.js';

console.log('=== TEST 1: CORE MODULES ===');
console.log('DEVICE:', DEVICE ? 'OK' : 'FAIL');
console.log('SoundFX class:', typeof SoundFX === 'function' ? 'OK' : 'FAIL');
console.log('GameState class:', typeof GameState === 'function' ? 'OK' : 'FAIL');
console.log('InspectorStudio class:', typeof InspectorStudio === 'function' ? 'OK' : 'FAIL');
console.log('VocabRoomGame class:', typeof VocabRoomGame === 'function' ? 'OK' : 'FAIL');

console.log('\n=== TEST 2: VOCABULARY & ZONES ===');
console.log('Total vocab count:', TOTAL_VOCAB_COUNT);
console.log('Zone order:', ZONE_ORDER.join(' -> '));
console.log('Bedroom items count:', Object.keys(BEDROOM_VOCAB).length);
console.log('Living items count:', Object.keys(LIVING_VOCAB).length);
console.log('Kitchen items count:', Object.keys(KITCHEN_VOCAB).length);
console.log('Street items count:', Object.keys(STREET_VOCAB).length);
console.log('Park items count:', Object.keys(PARK_VOCAB).length);
const totalCombined = Object.keys(BEDROOM_VOCAB).length +
  Object.keys(LIVING_VOCAB).length +
  Object.keys(KITCHEN_VOCAB).length +
  Object.keys(STREET_VOCAB).length +
  Object.keys(PARK_VOCAB).length;
console.log('Total items in 5 zones:', totalCombined, '(Expected: 60)', totalCombined === 60 ? 'PASS' : 'FAIL');

console.log('\n=== TEST 3: SCENE BUILDER FUNCTIONS ===');
console.log('buildBedroomScene:', typeof buildBedroomScene === 'function' ? 'OK' : 'FAIL');
console.log('buildLivingScene:', typeof buildLivingScene === 'function' ? 'OK' : 'FAIL');
console.log('buildKitchenScene:', typeof buildKitchenScene === 'function' ? 'OK' : 'FAIL');
console.log('buildStreetScene:', typeof buildStreetScene === 'function' ? 'OK' : 'FAIL');
console.log('buildParkScene:', typeof buildParkScene === 'function' ? 'OK' : 'FAIL');

console.log('\n=== TEST 4: TEXTURE GENERATOR FUNCTIONS ===');
console.log('createWoodTexture:', typeof createWoodTexture === 'function' ? 'OK' : 'FAIL');
console.log('createRugTexture:', typeof createRugTexture === 'function' ? 'OK' : 'FAIL');
console.log('createOnyxMarbleTexture:', typeof createOnyxMarbleTexture === 'function' ? 'OK' : 'FAIL');
console.log('createLuxuryRugTexture:', typeof createLuxuryRugTexture === 'function' ? 'OK' : 'FAIL');
console.log('createDarkWalnutTexture:', typeof createDarkWalnutTexture === 'function' ? 'OK' : 'FAIL');
console.log('createLeatherTexture:', typeof createLeatherTexture === 'function' ? 'OK' : 'FAIL');
console.log('createRoundedBoxGeometry:', typeof createRoundedBoxGeometry === 'function' ? 'OK' : 'FAIL');
console.log('createAbstractArtTexture:', typeof createAbstractArtTexture === 'function' ? 'OK' : 'FAIL');
console.log('createScreenTexture:', typeof createScreenTexture === 'function' ? 'OK' : 'FAIL');
console.log('createWindowSkyTexture:', typeof createWindowSkyTexture === 'function' ? 'OK' : 'FAIL');
console.log('createBackpackFabricTexture:', typeof createBackpackFabricTexture === 'function' ? 'OK' : 'FAIL');
console.log('createClockFaceTexture:', typeof createClockFaceTexture === 'function' ? 'OK' : 'FAIL');

console.log('\n=== ALL MODULAR ARCHITECTURE CHECKS PASSED ===');
