/**
 * ============================================================================
 * CORE GAME ENGINE (VOCAB ROOM GAME)
 * ============================================================================
 */

/* global THREE */

import { DEVICE } from './core/device.js';
import { GameState } from './core/gameState.js';
import { InspectorStudio } from './ui/inspectorStudio.js';
import { ROOM_VOCAB_DATA, TOTAL_VOCAB_COUNT } from './data/vocabData.js';
import {
  ZONES,
  ZONE_ORDER,
  MODEL_FILES,
  ZONE_MODEL_IDS,
  AVATAR_FILES,
  AVATAR_RIG_SPECS,
  isOutdoorZone
} from './data/zones.js';
import { createBackpackFabricTexture } from './utils/textures.js';
import { buildBedroomScene } from './scenes/bedroomScene.js';
import { buildLivingScene } from './scenes/livingScene.js';
import { buildKitchenScene } from './scenes/kitchenScene.js';
import { buildStreetScene } from './scenes/streetScene.js';
import { buildStoreScene } from './scenes/storeScene.js';
import { buildParkScene } from './scenes/parkScene.js';
import { NPCManager } from './scenes/npcManager.js';

// Mọi khe texture của MeshStandardMaterial cần được giải phóng khi dọn cảnh —
// material.dispose() KHÔNG tự dispose texture bên trong nó.
const DISPOSABLE_TEXTURE_MAPS = [
  'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap',
  'displacementMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'envMap',
  'specularMap', 'gradientMap', 'clearcoatMap', 'clearcoatNormalMap',
  'clearcoatRoughnessMap'
];
import { MiniGamesEngine } from './ui/miniGames.js';
import { NPCS_DATA } from './data/dialogueData.js';
import { getSvgIcon } from './ui/icons.js';

export class VocabRoomGame {
  constructor() {
    this.state = new GameState();
    this.container = document.getElementById('canvas3dContainer');
    this.hud = document.getElementById('gameHud');
    this.promptEl = document.getElementById('interactionPrompt');
    this.promptTargetName = document.getElementById('promptTargetName');
    this.crosshair = document.getElementById('fpsCrosshair');
    this.lockOverlay = document.getElementById('pointerLockPrompt');

    // Giai đoạn 2: NPC Manager & Mini Games Engine
    this.npcManager = new NPCManager(this);
    this.miniGames = new MiniGamesEngine(this);

    // Three.js Main Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({
      antialias: DEVICE.antialias,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(DEVICE.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = DEVICE.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Objects & Interactivity
    this.interactiveObjects = [];
    this.objectMeshFactories = {};
    this.targetedObject = null;
    this.lampLight = null;
    this.clockHandSec = null;
    this.smokeParticles = [];

    // Camera Mode & 3D Avatar (mặc định góc nhìn thứ 3, tôn trọng cài đặt đã lưu)
    this.cameraMode = this.state.cameraMode || 'third_person';
    this.cameraDistance = 2.4;
    this.playerMesh = null;
    this.playerBones = {};
    this.walkAnimPhase = 0;
    this.idleTime = 0;

    // Obstacle collision boxes
    this.colliders = [
      { name: 'desk', minX: -1.1, maxX: 1.1, minZ: -4.3, maxZ: -2.6 },
      { name: 'chair', minX: -0.65, maxX: 0.65, minZ: -2.75, maxZ: -1.55 },
      { name: 'bookshelf', minX: -4.95, maxX: -3.7, minZ: -3.3, maxZ: -0.7 },
      { name: 'plant', minX: -4.8, maxX: -3.8, minZ: 1.3, maxZ: 2.3 },
      { name: 'bed', minX: 2.5, maxX: 4.8, minZ: -4.6, maxZ: -1.8 },
      { name: 'guitar', minX: 3.9, maxX: 4.9, minZ: 2.3, maxZ: 3.3 },
      { name: 'backpack', minX: -2.2, maxX: -1.4, minZ: -3.9, maxZ: -3.1 }
    ];

    // Player Controller
    this.player = {
      pos: new THREE.Vector3(0, 0, 2.5),
      velocity: new THREE.Vector3(),
      pitch: 0.1,
      yaw: 0,
      speed: 4.8,
      sprintSpeed: 8.0,
      height: 1.6,
      radius: 0.4
    };

    this.keys = { forward: false, backward: false, left: false, right: false, sprint: false };
    this.isPointerLocked = false;
    this.touchLook = { id: null, moved: false, startTime: 0, startX: 0, startY: 0 };
    this.joystickDir = { x: 0, y: 0 };

    // Journey State
    this.currentZone = this.state.currentZone || 'bedroom';
    this.currentRoom = this.currentZone;
    this.isTransitioning = false;
    this.isWakingUp = false;
    this.wakeUpTimer = 0;
    this.animatedProps = [];
    this.toastTimer = null;

    // Báo cho người chơi biết khi hoàn thành nhiệm vụ / mở thành tựu
    this.state.onProgress = payload => this.showProgressToast(payload);

    // Inspector Studio
    this.inspector = new InspectorStudio('inspectorCanvas');

    // GLB Model Loader
    this.gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;
    this.loadedModels = {};

    this.initScene();
    this.setupControls();
    this.setupUI();
    this.syncSettingsUI();
    this.updateProgressUI();

    this.clock = new THREE.Clock();
    this.animate();
  }

  // --- GLB MODEL LOADING & SCALING SYSTEM ---
  loadGLBModel(vocabId, fileName = `${vocabId}.glb`, onProgress = null) {
    return new Promise((resolve) => {
      if (!this.gltfLoader) { resolve(null); return; }
      const url = `./models/${encodeURI(fileName)}`;
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.fromGLB = true;
            }
          });
          console.log(`✅ Loaded GLB model: ${vocabId} from ${fileName}`);
          this.loadedModels[vocabId] = model;
          resolve(model);
        },
        (xhr) => {
          if (xhr.lengthComputable && onProgress) {
            const pct = Math.round((xhr.loaded / xhr.total) * 100);
            onProgress(pct);
          }
        },
        () => {
          resolve(null);
        }
      );
    });
  }

  modelsForZone(zoneId) {
    return ['player_avatar'].concat(ZONE_MODEL_IDS[zoneId] || []);
  }

  ensureModels(ids, onProgress = null) {
    if (!this._modelJobs) this._modelJobs = {};
    const validIds = ids.filter(id => MODEL_FILES[id]);
    const total = validIds.length;
    let completed = 0;

    const notify = () => {
      completed++;
      if (onProgress && total > 0) {
        const pct = Math.min(100, Math.round((completed / total) * 100));
        onProgress(pct);
      }
    };

    const jobs = ids.map(id => {
      if (!MODEL_FILES[id]) return Promise.resolve(null);
      if (!this._modelJobs[id]) {
        this._modelJobs[id] = this.loadGLBModel(id, MODEL_FILES[id]).then(res => {
          notify();
          return res;
        });
      } else {
        notify();
      }
      return this._modelJobs[id];
    });

    if (total === 0 && onProgress) onProgress(100);
    return Promise.all(jobs);
  }

  updateBootProgress(percent, labelText = '') {
    const bar = document.getElementById('bootProgressFill');
    const percentEl = document.getElementById('bootPercentText');
    const titleEl = document.getElementById('bootTitle');
    if (bar) bar.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (titleEl && labelText) titleEl.textContent = labelText;
  }

  prefetchRemainingModels() {
    if (this._prefetchStarted) return;
    this._prefetchStarted = true;
    const start = () => {
      this.ensureModels(Object.keys(MODEL_FILES)).then(() => {
        console.log(`🎮 Đã tải sẵn ${Object.keys(this.loadedModels).length}/${Object.keys(MODEL_FILES).length} model GLB`);
      });
    };
    if (window.requestIdleCallback) window.requestIdleCallback(start, { timeout: 4000 });
    else setTimeout(start, 1500);
  }

  async loadAllModels() {
    await this.ensureModels(Object.keys(MODEL_FILES));
  }

  fitModelToBounds(rawModel, {
    targetHeight = null,
    targetWidth = null,
    targetDepth = null,
    scale = null,
    centerXZ = true,
    alignBottomY = true,
    rotationY = 0,
    rotationX = 0,
    rotationZ = 0
  } = {}) {
    if (!rawModel) return null;
    const model = rawModel.clone();
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    if (rotationX) model.rotation.x = rotationX;
    if (rotationY) model.rotation.y = rotationY;
    if (rotationZ) model.rotation.z = rotationZ;

    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    let size = box.getSize(new THREE.Vector3());

    let scaleFactor = 1.0;
    if (scale !== null) {
      scaleFactor = scale;
    } else if (targetHeight !== null) {
      scaleFactor = targetHeight / Math.max(size.y, 0.001);
    } else if (targetWidth !== null) {
      scaleFactor = targetWidth / Math.max(size.x, 0.001);
    } else if (targetDepth !== null) {
      scaleFactor = targetDepth / Math.max(size.z, 0.001);
    }

    model.scale.setScalar(scaleFactor);
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    const wrapper = new THREE.Group();
    const offsetX = centerXZ ? -center.x : 0;
    const offsetY = alignBottomY ? -box.min.y : 0;
    const offsetZ = centerXZ ? -center.z : 0;

    model.position.set(offsetX, offsetY, offsetZ);
    wrapper.add(model);

    const finalBox = new THREE.Box3().setFromObject(wrapper);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    wrapper.userData.modelBounds = {
      width: finalSize.x,
      height: finalSize.y,
      depth: finalSize.z,
      topY: finalBox.max.y
    };

    return wrapper;
  }

  initScene() {
    this.scene.background = new THREE.Color(0xdbeafe);
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.015);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.ambientLight = ambientLight;
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.45);
    this.sunLight = sunLight;
    sunLight.position.set(4, 7, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = DEVICE.shadowMapSize;
    sunLight.shadow.mapSize.height = DEVICE.shadowMapSize;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    const ceilingLight = new THREE.PointLight(0xffecd2, 0.95, 12, 1.2);
    this.ceilingLight = ceilingLight;
    ceilingLight.position.set(0, 3.8, 0);
    ceilingLight.castShadow = !DEVICE.isMobile;
    this.scene.add(ceilingLight);

    this.ensureModels(this.modelsForZone(this.currentZone), (percent) => {
      this.updateBootProgress(percent, 'Đang chuẩn bị không gian 3D...');
    }).then(() => {
      this.updateBootProgress(100, 'Khởi động hoàn tất!');
      this.buildZoneScene(this.currentZone);
      this.spawnPlayerInZone(this.currentZone);
      this.updateProgressUI();
      this.sceneReady = true;
      this.hideBootLoader();
      this.prefetchRemainingModels();
    });
  }

  hideBootLoader() {
    const el = document.getElementById('bootLoader');
    if (el) {
      el.classList.add('done');
      setTimeout(() => { el.style.display = 'none'; }, 450);
    }
  }

  applyZoneLighting(zoneId) {
    const isOutdoor = isOutdoorZone(zoneId);

    if (zoneId === 'street') {
      this.scene.background = new THREE.Color(0x9dc4e8);
      this.scene.fog = new THREE.FogExp2(0xb9d4ec, 0.018);
    } else if (zoneId === 'park') {
      this.scene.background = new THREE.Color(0xa9d8f0);
      this.scene.fog = new THREE.FogExp2(0xc8e6f5, 0.014);
    } else if (zoneId === 'store') {
      this.scene.background = new THREE.Color(0xe6f0f8);
      this.scene.fog = new THREE.FogExp2(0xe6f0f8, 0.012);
    } else {
      this.scene.background = new THREE.Color(0xdbeafe);
      this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.015);
    }

    if (this.ambientLight) {
      this.ambientLight.color.setHex(isOutdoor ? 0xdceaf7 : 0xffffff);
      this.ambientLight.intensity = (isOutdoor ? 1.2 : 0.95) * DEVICE.ambientBoost;
    }
    if (this.sunLight) {
      this.sunLight.color.setHex(isOutdoor ? 0xfff8e8 : 0xfff8ee);
      this.sunLight.intensity = isOutdoor ? 2.0 : 1.45;
      if (isOutdoor) {
        this.sunLight.position.set(12, 22, 10);
        this.sunLight.shadow.camera.left = -30;
        this.sunLight.shadow.camera.right = 30;
        this.sunLight.shadow.camera.top = 30;
        this.sunLight.shadow.camera.bottom = -30;
        this.sunLight.shadow.camera.far = 80;
      } else {
        this.sunLight.position.set(4, 7, 3);
        this.sunLight.shadow.camera.left = -6;
        this.sunLight.shadow.camera.right = 6;
        this.sunLight.shadow.camera.top = 6;
        this.sunLight.shadow.camera.bottom = -6;
        this.sunLight.shadow.camera.far = 25;
      }
      this.sunLight.shadow.camera.updateProjectionMatrix();
    }
    if (this.ceilingLight) {
      this.ceilingLight.intensity = isOutdoor ? 0 : 0.9;
    }
  }

  buildZoneScene(zoneId) {
    const zone = ZONES[zoneId] || ZONES.bedroom;
    this.currentZone = zone.id;
    this.currentRoom = zone.id;
    this.state.currentZone = zone.id;
    this.state.saveStorage();

    this.applyZoneLighting(zone.id);

    switch (zone.id) {
      case 'living': this.buildLivingRoom(); break;
      case 'kitchen': this.buildKitchen(); break;
      case 'street': this.buildStreet(); break;
      case 'store': this.buildStore(); break;
      case 'park': this.buildPark(); break;
      default: this.buildBedroom(); break;
    }

    // Spawn NPCs for current zone
    if (this.npcManager) {
      this.npcManager.spawnNpcsForZone(zone.id);
    }

    this.optimizeSceneForDevice();
    this.setCameraMode(this.cameraMode);
    this.updateZoneHud();
    this.updateProgressUI();
  }

  optimizeSceneForDevice() {
    if (!DEVICE.isMobile) return;

    const pointLights = [];
    this.scene.traverse(obj => {
      if (obj.isPointLight) pointLights.push(obj);
    });

    if (pointLights.length > DEVICE.maxPointLights) {
      pointLights.sort((a, b) =>
        (b.intensity * (b.distance || 10)) - (a.intensity * (a.distance || 10))
      );
      pointLights.slice(DEVICE.maxPointLights).forEach(light => {
        if (light.parent) light.parent.remove(light);
      });
    }

    this.scene.traverse(obj => {
      if (obj.isPointLight || obj.isSpotLight) obj.castShadow = false;
    });

    if (this.renderer) this.renderer.shadowMap.needsUpdate = true;
  }

  spawnPlayerInZone(zoneId, fromZoneId = null) {
    const zone = ZONES[zoneId] || ZONES.bedroom;
    let spawn = zone.spawn;
    if (zone.spawnsFrom && fromZoneId && zone.spawnsFrom[fromZoneId]) {
      spawn = zone.spawnsFrom[fromZoneId];
    } else if (fromZoneId && zone.next === fromZoneId && zone.returnSpawn) {
      spawn = zone.returnSpawn;
    }
    this.player.pos.set(spawn.x, 0, spawn.z);
    this.player.yaw = spawn.yaw;
    this.player.pitch = 0.05;
    this.player.velocity.set(0, 0, 0);
  }

  goToZone(zoneId, opts = {}) {
    if (this.isTransitioning) return;
    const zone = ZONES[zoneId];
    if (!zone) return;

    this.isTransitioning = true;
    const fromZone = this.currentZone;

    this.cancelWakeUpSequence();
    if (document.exitPointerLock) document.exitPointerLock();
    const doorModal = document.getElementById('doorModal');
    if (doorModal) doorModal.classList.remove('active');
    this.closeVocabModal(true);

    const overlay = document.getElementById('roomTransitionOverlay');
    if (overlay) {
      const label = overlay.querySelector('.transition-label') || overlay.querySelector('div:last-child');
      if (label) label.textContent = (opts.label || `Đang tới ${zone.name}...`) + ' 0%';
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
    }

    const ready = this.ensureModels(this.modelsForZone(zone.id), (percent) => {
      if (overlay) {
        const label = overlay.querySelector('.transition-label') || overlay.querySelector('div:last-child');
        if (label) label.textContent = (opts.label || `Đang tới ${zone.name}...`) + ` ${percent}%`;
      }
    });
    const faded = new Promise(res => setTimeout(res, 650));

    Promise.all([ready, faded]).then(() => {
      this.clearScene();
      this.buildZoneScene(zone.id);
      this.spawnPlayerInZone(zone.id, fromZone);
      this.state.soundFX.playDiscover();

      setTimeout(() => {
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
        }
        this.isTransitioning = false;
        this.showObjectiveBanner(zone.id);
        this.requestPointerLock();
      }, 420);
    });
  }

  // --- AUTO-RIG AVATAR ---
  prepareAvatarGeometry(rawModel, avatarKey = 'man') {
    let source = null;
    rawModel.traverse(child => {
      if (!source && child.isMesh && child.geometry) source = child;
    });
    if (!source) return null;

    const S = AVATAR_RIG_SPECS[avatarKey] || AVATAR_RIG_SPECS.man;
    const geo = source.geometry.clone();
    geo.morphAttributes = {};
    geo.morphTargetsRelative = false;
    geo.applyMatrix4(new THREE.Matrix4().makeRotationY(S.faceYaw));
    geo.computeBoundingBox();

    const size = new THREE.Vector3();
    geo.boundingBox.getSize(size);
    const scale = S.targetHeight / Math.max(size.y, 1e-6);
    geo.applyMatrix4(new THREE.Matrix4().makeScale(scale, scale, scale));
    geo.computeBoundingBox();

    const box = geo.boundingBox;
    const center = box.getCenter(new THREE.Vector3());
    geo.applyMatrix4(new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z));
    geo.computeBoundingBox();
    geo.computeVertexNormals();

    return { geometry: geo, material: source.material };
  }

  buildAvatarBoneSpec(avatarKey = 'man') {
    const S = AVATAR_RIG_SPECS[avatarKey] || AVATAR_RIG_SPECS.man;
    const H = S.targetHeight;
    const y = r => r * H;
    const d = r => r * H;

    const hipY = y(S.hipY), spineY = y(S.spineY), chestY = y(S.chestY);
    const shY = y(S.shoulderY), neckY = y(S.neckY);
    const kneeY = y(S.kneeY), ankleY = y(S.ankleY);
    const legX = d(S.legX), shX = d(S.shoulderX), elX = d(S.elbowX);
    const wrX = d(S.wristX), haX = d(S.handX), ftZ = d(S.footZ);
    const armZ = S.armZ || 0;

    const limb = (side, tag) => ([
      { name: `arm${tag}`, parent: 'chest', pos: [side * shX, shY, armZ], tail: [side * elX, shY, armZ], group: 'arm' },
      { name: `foreArm${tag}`, parent: `arm${tag}`, pos: [side * elX, shY, armZ], tail: [side * wrX, shY, armZ], group: 'arm' },
      { name: `hand${tag}`, parent: `foreArm${tag}`, pos: [side * wrX, shY, armZ], tail: [side * haX, shY, armZ], group: 'arm' },
      { name: `leg${tag}`, parent: 'hips', pos: [side * legX, hipY, 0], tail: [side * legX, kneeY, 0], group: 'leg' },
      { name: `shin${tag}`, parent: `leg${tag}`, pos: [side * legX, kneeY, 0], tail: [side * legX, ankleY, 0], group: 'leg' },
      { name: `foot${tag}`, parent: `shin${tag}`, pos: [side * legX, ankleY, 0], tail: [side * legX, 0.012, ftZ], group: 'leg' }
    ]);

    return [
      { name: 'hips', parent: null, pos: [0, hipY, 0], tail: [0, spineY, 0], group: 'core' },
      { name: 'spine', parent: 'hips', pos: [0, spineY, 0], tail: [0, chestY, 0], group: 'core' },
      { name: 'chest', parent: 'spine', pos: [0, chestY, 0], tail: [0, neckY, 0], group: 'core' },
      { name: 'neck', parent: 'chest', pos: [0, neckY, 0], tail: [0, neckY + 0.05, 0], group: 'headTop' },
      { name: 'head', parent: 'neck', pos: [0, neckY + 0.02, 0], tail: [0, H, 0], group: 'headTop' },
      ...limb(1, 'L'),
      ...limb(-1, 'R')
    ];
  }

  avatarRegionMask(group, py, avatarKey = 'man') {
    const S = AVATAR_RIG_SPECS[avatarKey] || AVATAR_RIG_SPECS.man;
    const H = S.targetHeight;
    const hipY = S.hipY * H;
    const chestY = S.chestY * H;
    const band = 0.055 * H;
    const smooth = (edge0, edge1, x) => {
      const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    };
    switch (group) {
      case 'leg': return 1 - smooth(hipY - band, hipY + band, py);
      case 'arm': return smooth(chestY - 2.2 * band, chestY, py);
      case 'headTop': return smooth(chestY - band, chestY + band, py);
      default: return 1;
    }
  }

  computeAvatarSkinWeights(geometry, boneSpec, avatarKey = 'man') {
    const S = AVATAR_RIG_SPECS[avatarKey] || AVATAR_RIG_SPECS.man;
    const pos = geometry.attributes.position;
    const count = pos.count;
    const skinIndices = new Uint16Array(count * 4);
    const skinWeights = new Float32Array(count * 4);

    const segs = boneSpec.map(b => ({
      head: new THREE.Vector3().fromArray(b.pos),
      tail: new THREE.Vector3().fromArray(b.tail),
      group: b.group
    }));

    const p = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const ap = new THREE.Vector3();
    const proj = new THREE.Vector3();
    const scored = [];

    for (let i = 0; i < count; i++) {
      p.fromBufferAttribute(pos, i);
      scored.length = 0;

      for (let b = 0; b < segs.length; b++) {
        const seg = segs[b];
        const mask = this.avatarRegionMask(seg.group, p.y, avatarKey);
        if (mask <= 0.0001) continue;

        ab.subVectors(seg.tail, seg.head);
        ap.subVectors(p, seg.head);
        const len2 = ab.lengthSq();
        const t = len2 > 1e-9 ? THREE.MathUtils.clamp(ap.dot(ab) / len2, 0, 1) : 0;
        proj.copy(seg.head).addScaledVector(ab, t);
        const dist = p.distanceTo(proj);

        const w = mask / Math.pow(dist + S.weightEpsilon, S.weightFalloff);
        scored.push({ b, w });
      }

      scored.sort((x, y) => y.w - x.w);
      const top = scored.slice(0, 4);
      let total = 0;
      for (const it of top) total += it.w;
      if (total <= 0) { skinIndices[i * 4] = 0; skinWeights[i * 4] = 1; continue; }

      for (let k = 0; k < 4; k++) {
        if (k < top.length) {
          skinIndices[i * 4 + k] = top[k].b;
          skinWeights[i * 4 + k] = top[k].w / total;
        } else {
          skinIndices[i * 4 + k] = 0;
          skinWeights[i * 4 + k] = 0;
        }
      }
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  }

  getAvatarRigCache() {
    const avatarKey = this.state.selectedAvatar || 'man';
    if (!this._avatarRigCacheMap) this._avatarRigCacheMap = {};
    if (this._avatarRigCacheMap[avatarKey]) return this._avatarRigCacheMap[avatarKey];

    const raw = this.loadedModels.player_avatar;
    if (!raw) return null;

    try {
      const prepared = this.prepareAvatarGeometry(raw, avatarKey);
      if (!prepared) return null;

      const boneSpec = this.buildAvatarBoneSpec(avatarKey);
      this.computeAvatarSkinWeights(prepared.geometry, boneSpec, avatarKey);

      const srcMat = Array.isArray(prepared.material) ? prepared.material[0] : prepared.material;
      const material = srcMat.clone();
      material.skinning = true;
      material.needsUpdate = true;

      const rig = { geometry: prepared.geometry, material, boneSpec };
      this._avatarRigCacheMap[avatarKey] = rig;
      console.log(`🦴 Đã gắn khung xương tự động cho nhân vật (${avatarKey}): ${boneSpec.length} đốt xương, ${prepared.geometry.attributes.position.count} đỉnh`);
      return rig;
    } catch (e) {
      console.warn('Không dựng được khung xương cho nhân vật:', e);
      return null;
    }
  }

  buildSkinnedAvatar() {
    const rig = this.getAvatarRigCache();
    if (!rig) return false;

    const bodyGroup = new THREE.Group();

    const bones = [];
    const byName = {};
    rig.boneSpec.forEach(spec => {
      const bone = new THREE.Bone();
      bone.name = spec.name;
      byName[spec.name] = bone;
      bones.push(bone);
    });
    rig.boneSpec.forEach((spec, i) => {
      const bone = bones[i];
      if (spec.parent) {
        const parent = byName[spec.parent];
        const pSpec = rig.boneSpec.find(b => b.name === spec.parent);
        bone.position.set(
          spec.pos[0] - pSpec.pos[0],
          spec.pos[1] - pSpec.pos[1],
          spec.pos[2] - pSpec.pos[2]
        );
        parent.add(bone);
      } else {
        bone.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      }
    });

    const mesh = new THREE.SkinnedMesh(rig.geometry, rig.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.fromGLB = true;
    mesh.add(bones[0]);
    mesh.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(bones));

    bodyGroup.add(mesh);
    this.playerMesh.add(bodyGroup);

    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.015;
    this.playerMesh.add(shadowMesh);

    this.playerBones = {
      torso: bodyGroup,
      torsoBaseY: 0,
      hips: byName.hips,
      spine: byName.spine,
      chest: byName.chest,
      head: byName.head,
      leftArm: byName.armL,
      leftElbow: byName.foreArmL,
      rightArm: byName.armR,
      rightElbow: byName.foreArmR,
      leftLeg: byName.legL,
      leftKnee: byName.shinL,
      rightLeg: byName.legR,
      rightKnee: byName.shinR
    };

    this.avatarIsSkinned = true;
    this.applySkinnedRestPose();
    return true;
  }

  setElbowBend(bone, bend, side, blend = 1) {
    if (!bone) return;
    if (this.avatarIsSkinned) {
      const target = bend * side;
      bone.rotation.y = blend >= 1 ? target : THREE.MathUtils.lerp(bone.rotation.y, target, blend);
    } else {
      bone.rotation.x = blend >= 1 ? bend : THREE.MathUtils.lerp(bone.rotation.x, bend, blend);
    }
  }

  applySkinnedRestPose() {
    const b = this.playerBones;
    if (!b || !this.avatarIsSkinned) return;
    const avatarKey = this.state.selectedAvatar || 'man';
    const S = AVATAR_RIG_SPECS[avatarKey] || AVATAR_RIG_SPECS.man;
    const rotZ = S.restArmRotZ || 1.38;
    if (b.leftArm) { b.leftArm.rotation.z = -rotZ; b.leftArm.rotation.y = 0; b.leftArm.rotation.x = 0; }
    if (b.rightArm) { b.rightArm.rotation.z = rotZ; b.rightArm.rotation.y = 0; b.rightArm.rotation.x = 0; }
    if (b.leftElbow) { b.leftElbow.rotation.z = 0; b.leftElbow.rotation.x = 0; b.leftElbow.rotation.y = 0; }
    if (b.rightElbow) { b.rightElbow.rotation.z = 0; b.rightElbow.rotation.x = 0; b.rightElbow.rotation.y = 0; }
  }

  buildPlayerAvatar() {
    this.playerMesh = new THREE.Group();
    this.playerBones = {};
    this.avatarIsSkinned = false;

    if (this.buildSkinnedAvatar()) {
      this.playerMesh.rotation.y = Math.PI;
      this.playerMesh.position.set(this.player.pos.x, 0, this.player.pos.z);
      this.scene.add(this.playerMesh);
      return;
    }

    // Fallback block avatar
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd09b, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5, metalness: 0.1 });
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const shoeAccentMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.85, 0);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.50, 0.28), jacketMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    const zipMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.50, 0.02), innerMat);
    zipMesh.position.set(0, 0, 0.141);
    torsoGroup.add(zipMesh);

    const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.10, 16), innerMat);
    collarMesh.position.set(0, 0.26, 0);
    collarMesh.castShadow = true;
    torsoGroup.add(collarMesh);

    const playerBagTex = createBackpackFabricTexture('#1e293b', '#0f172a', '#38bdf8');
    const playerBagMat = new THREE.MeshStandardMaterial({ map: playerBagTex, roughness: 0.7 });

    const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.16), playerBagMat);
    bagMesh.position.set(0, 0.02, -0.17);
    bagMesh.castShadow = true;
    torsoGroup.add(bagMesh);

    for (let side of [-1, 1]) {
      const pPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.36, 8), cyanGlowMat);
      pPipe.position.set(side * 0.17, 0.02, -0.25);
      torsoGroup.add(pPipe);
    }
    const pTopPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.34, 8), cyanGlowMat);
    pTopPipe.rotation.z = Math.PI / 2;
    pTopPipe.position.set(0, 0.20, -0.25);
    torsoGroup.add(pTopPipe);

    const bagPocket = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.06), playerBagMat);
    bagPocket.position.set(0, -0.06, -0.25);
    torsoGroup.add(bagPocket);

    const bagStrip = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.025, 0.01), cyanGlowMat);
    bagStrip.position.set(0, -0.04, -0.285);
    torsoGroup.add(bagStrip);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.46, 0);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    hairTop.position.set(0, 0.03, -0.01);
    headGroup.add(hairTop);

    for (let i = -2; i <= 2; i++) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 8), hairMat);
      bang.position.set(i * 0.07, 0.11, 0.19);
      bang.rotation.set(0.3, 0, -i * 0.12);
      headGroup.add(bang);
    }

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), eyeMat);
    leftEye.position.set(-0.08, 0.02, 0.2);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), eyeMat);
    rightEye.position.set(0.08, 0.02, 0.2);
    headGroup.add(rightEye);

    const leftGlint = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyeHighlightMat);
    leftGlint.position.set(-0.07, 0.032, 0.225);
    headGroup.add(leftGlint);

    const rightGlint = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyeHighlightMat);
    rightGlint.position.set(0.09, 0.032, 0.225);
    headGroup.add(rightGlint);

    const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 12, 24, Math.PI), hairMat);
    hpBand.rotation.x = Math.PI / 2;
    hpBand.position.set(0, 0.06, 0);
    headGroup.add(hpBand);

    const leftEar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16), cyanGlowMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.23, 0.02, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16), cyanGlowMat);
    rightEar.rotation.z = Math.PI / 2;
    rightEar.position.set(0.23, 0.02, 0);
    headGroup.add(rightEar);

    torsoGroup.add(headGroup);
    this.playerMesh.add(torsoGroup);
    this.playerBones.torso = torsoGroup;
    this.playerBones.head = headGroup;

    const createArticulatedArm = (isLeft) => {
      const side = isLeft ? -1 : 1;
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.28, 1.10, 0);

      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jacketMat);
      shoulderGroup.add(shoulder);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.052, 0.18, 12), jacketMat);
      upperArm.position.set(0, -0.09, 0);
      upperArm.castShadow = true;
      shoulderGroup.add(upperArm);

      const elbowGroup = new THREE.Group();
      elbowGroup.position.set(0, -0.18, 0);

      const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), innerMat);
      elbowJoint.castShadow = true;
      elbowGroup.add(elbowJoint);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.18, 12), skinMat);
      forearm.position.set(0, -0.09, 0);
      forearm.castShadow = true;
      elbowGroup.add(forearm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skinMat);
      hand.position.set(0, -0.19, 0);
      hand.castShadow = true;
      elbowGroup.add(hand);

      shoulderGroup.add(elbowGroup);
      return { shoulderGroup, elbowGroup };
    };

    const leftArmData = createArticulatedArm(true);
    const rightArmData = createArticulatedArm(false);

    this.playerBones.leftArm = leftArmData.shoulderGroup;
    this.playerBones.leftElbow = leftArmData.elbowGroup;
    this.playerBones.rightArm = rightArmData.shoulderGroup;
    this.playerBones.rightElbow = rightArmData.elbowGroup;

    this.playerMesh.add(this.playerBones.leftArm);
    this.playerMesh.add(this.playerBones.rightArm);

    const createArticulatedLeg = (isLeft) => {
      const side = isLeft ? -1 : 1;
      const hipGroup = new THREE.Group();
      hipGroup.position.set(side * 0.14, 0.62, 0);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.26, 12), pantsMat);
      thigh.position.set(0, -0.13, 0);
      thigh.castShadow = true;
      hipGroup.add(thigh);

      const kneeGroup = new THREE.Group();
      kneeGroup.position.set(0, -0.26, 0);

      const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), pantsMat);
      kneeJoint.castShadow = true;
      kneeGroup.add(kneeJoint);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.055, 0.24, 12), pantsMat);
      shin.position.set(0, -0.12, 0);
      shin.castShadow = true;
      kneeGroup.add(shin);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.10, 0.22), shoeMat);
      shoe.position.set(0, -0.25, 0.04);
      shoe.castShadow = true;
      kneeGroup.add(shoe);

      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.028, 0.225), shoeAccentMat);
      sole.position.set(0, -0.30, 0.04);
      kneeGroup.add(sole);

      hipGroup.add(kneeGroup);
      return { hipGroup, kneeGroup };
    };

    const leftLegData = createArticulatedLeg(true);
    const rightLegData = createArticulatedLeg(false);

    this.playerBones.leftLeg = leftLegData.hipGroup;
    this.playerBones.leftKnee = leftLegData.kneeGroup;
    this.playerBones.rightLeg = rightLegData.hipGroup;
    this.playerBones.rightKnee = rightLegData.kneeGroup;

    this.playerMesh.add(this.playerBones.leftLeg);
    this.playerMesh.add(this.playerBones.rightLeg);

    const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.015;
    this.playerMesh.add(shadowMesh);

    this.playerMesh.scale.set(0.85, 0.85, 0.85);
    this.playerMesh.rotation.y = Math.PI;
    this.playerMesh.position.set(this.player.pos.x, 0, this.player.pos.z);
    this.scene.add(this.playerMesh);
  }

  // --- SCENE BUILDERS ---
  buildBedroom() {
    buildBedroomScene(this);
  }

  buildStudyRoomScene() {
    this.buildBedroom();
  }

  buildLivingRoom() {
    buildLivingScene(this);
  }

  buildKitchen() {
    buildKitchenScene(this);
  }

  buildStreet() {
    buildStreetScene(this);
  }

  buildStore() {
    buildStoreScene(this);
  }

  buildPark() {
    buildParkScene(this);
  }

  placeZoneModel(id, pos, opts = {}, fallbackFn = null) {
    const raw = this.loadedModels[id];
    if (raw) {
      const m = this.fitModelToBounds(raw, opts);
      if (m) {
        m.position.set(pos.x, pos.y || 0, pos.z);
        this.scene.add(m);
        return m;
      }
    }
    if (fallbackFn) {
      const fb = fallbackFn();
      fb.position.set(pos.x, pos.y || 0, pos.z);
      if (opts.rotationY) fb.rotation.y = opts.rotationY;
      this.scene.add(fb);
      return fb;
    }
    return null;
  }

  applyGateLockVisual(gateObj, zoneId) {
    const reqZone = gateObj.userData?.requireZoneComplete || zoneId || null;
    // Không kèm điều kiện nào => lối đi luôn mở (đèn/biển hiệu xanh)
    const unlocked = !reqZone || this.state.isZoneComplete(reqZone);
    gateObj.traverse(child => {
      if (child.isMesh && child.material && child.material.emissive) {
        if (child.userData.isGateSign) {
          child.material.color.setHex(unlocked ? 0x22c55e : 0xef4444);
          child.material.emissive.setHex(unlocked ? 0x16a34a : 0xb91c1c);
        }
      }
      if (child.isPointLight && child.userData.isGateLight) {
        child.color.setHex(unlocked ? 0x22c55e : 0xef4444);
      }
    });
    gateObj.userData.lockVisualZone = reqZone;
  }

  cloneForInspector(root) {
    const saved = [];
    root.traverse(c => { saved.push([c, c.userData]); c.userData = {}; });
    let copy = null;
    try {
      copy = root.clone(true);
    } finally {
      saved.forEach(([c, u]) => { c.userData = u; });
    }
    if (copy) copy.position.set(0, 0, 0);
    return copy || new THREE.Group();
  }

  registerInteractable(object3d, vocabId) {
    object3d.userData.vocabId = vocabId;
    object3d.userData.vocabData = ROOM_VOCAB_DATA[vocabId];
    if (!this.objectMeshFactories[vocabId]) {
      this.objectMeshFactories[vocabId] = () => this.cloneForInspector(object3d);
    }
    this.interactiveObjects.push(object3d);
  }

  registerGate(object3d, gateVocabId, targetZoneId, opts = {}) {
    const data = {
      vocabId: gateVocabId,
      vocabData: ROOM_VOCAB_DATA[gateVocabId] || null,
      gateTarget: targetZoneId,
      gateLocked: !!opts.requireComplete,
      requireZoneComplete: opts.requireZoneComplete || null,
      gateDirection: opts.direction || 'forward',
      gateLabel: opts.label || (ROOM_VOCAB_DATA[gateVocabId] ? ROOM_VOCAB_DATA[gateVocabId].nameVi : 'Lối đi')
    };
    object3d.userData = Object.assign({}, object3d.userData, data);
    object3d.traverse(c => {
      if (c !== object3d) c.userData = Object.assign({}, c.userData, { rootGroup: object3d });
    });
    if (!this.objectMeshFactories[gateVocabId]) {
      this.objectMeshFactories[gateVocabId] = () => this.cloneForInspector(object3d);
    }
    this.interactiveObjects.push(object3d);
    return object3d;
  }

  handleGateInteraction(gateObj) {
    const ud = gateObj.userData;
    const targetZone = ZONES[ud.gateTarget];
    if (!targetZone) return;

    if (ud.gateDirection === 'back') {
      this.goToZone(ud.gateTarget, { label: `Quay lại ${targetZone.name}...` });
      return;
    }

    // Check specific required zone completion (for overworld building doors on street)
    if (ud.requireZoneComplete) {
      const reqZone = ZONES[ud.requireZoneComplete];
      if (reqZone && !this.state.isZoneComplete(reqZone.id)) {
        const remaining = this.state.zoneRemaining(reqZone.id);
        this.state.soundFX.playWrong();
        this.showToast(
          `${getSvgIcon('ui_lock', { size: 18 })} Cửa còn khoá! Bạn cần hoàn thành khám phá <b>${reqZone.name}</b> (${reqZone.chinese}) trước (còn ${remaining} đồ vật).`,
          'locked',
          4500
        );
        return;
      }
    }

    // Check current zone completion (for exit doors inside rooms)
    const zone = ZONES[this.currentZone];
    const remaining = this.state.zoneRemaining(this.currentZone);

    if (ud.gateLocked && remaining > 0) {
      this.state.soundFX.playWrong();
      this.showLockedGateNotice(zone, remaining);
      return;
    }

    this.openGateModal(gateObj);
  }

  showLockedGateNotice(zone, remaining) {
    const missing = this.state.missingItems(zone.id).slice(0, 4)
      .map(it => `${it.icon} ${it.nameVi}`).join(' • ');
    this.showToast(
      `${getSvgIcon('ui_lock', { size: 18 })} Cửa còn khoá! Còn <b>${remaining}</b> đồ vật trong ${zone.name} chưa khám phá.` +
      (missing ? `<br><span class="toast-sub">Gợi ý: ${missing}${remaining > 4 ? ' …' : ''}</span>` : ''),
      'locked'
    );
  }

  showToast(html, variant = 'info', duration = 3600) {
    const el = document.getElementById('gameToast');
    if (!el) return;
    const banner = document.getElementById('objectiveBanner');
    if (banner) banner.classList.remove('visible');
    el.innerHTML = html;
    el.className = `game-toast visible toast-${variant}`;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      el.classList.remove('visible');
    }, duration);
  }

  /**
   * Nhiệm vụ và thành tựu trước đây hoàn thành hoàn toàn im lặng — người chơi
   * không hề biết mình vừa đạt được gì. Gom lại thành một thông báo ngắn.
   */
  showProgressToast({ newQuests = [], newAch = [] }) {
    const lines = [];
    newQuests.forEach(q => {
      lines.push(`${getSvgIcon('ui_target', { size: 18 })} Xong nhiệm vụ <b>${q.title}</b>` +
        (q.badge ? ` — ${q.badge}` : '') +
        ` <span class="toast-sub">+${q.rewardXP || 0} XP • +${q.rewardScore || 0} điểm</span>`);
    });
    newAch.forEach(a => {
      lines.push(`${getSvgIcon('ui_trophy', { size: 18 })} Mở thành tựu <b>${a.title}</b>` +
        ` <span class="toast-sub">+${a.rewardXP || 0} XP</span>`);
    });
    if (!lines.length) return;

    // Nhường chỗ cho thông báo "hoàn thành khu vực" nổ ngay sau khi khám phá xong
    if (this._progressToastTimer) clearTimeout(this._progressToastTimer);
    this._progressToastTimer = setTimeout(() => {
      this.showToast(lines.join('<br>'), 'unlock', 4800);
      this.updateProgressUI();
    }, 1600);
  }

  showObjectiveBanner(zoneId) {
    const zone = ZONES[zoneId];
    if (!zone) return;
    const found = this.state.zoneFoundCount(zoneId);
    const total = this.state.zoneTotal(zoneId);
    const el = document.getElementById('objectiveBanner');
    if (!el) return;
    const toast = document.getElementById('gameToast');
    if (toast) toast.classList.remove('visible');
    el.innerHTML = `
      <div class="obj-zone">${zone.icon} ${zone.name} <span class="obj-cn">${zone.chinese} (${zone.pinyin})</span></div>
      <div class="obj-text">${zone.objective}</div>
      <div class="obj-progress">Đã khám phá ${found}/${total} đồ vật</div>
    `;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 5200);
  }

  openGateModal(gateObj) {
    const ud = gateObj.userData;
    const targetZone = ZONES[ud.gateTarget];
    const zone = ZONES[this.currentZone];
    if (document.exitPointerLock) document.exitPointerLock();

    this.pendingGateZone = ud.gateTarget;
    this.pendingGateVocab = ud.vocabId;

    this.state.markDiscovered(ud.vocabId);
    this.updateProgressUI();

    const gateData = ROOM_VOCAB_DATA[ud.vocabId];
    const setTxt = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
    const setHtml = (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; };

    setHtml('doorModalTitle', `${targetZone.icon} Tới ${targetZone.name}`);
    setHtml('doorModalHanzi', gateData ? `${gateData.chinese} <span class="door-pin">${gateData.pinyin}</span>` : '');
    const doorName = gateData ? gateData.nameVi.toLowerCase() : 'cánh cửa';
    const zoneLeft = this.state.zoneRemaining(zone.id);
    const leadIn = zoneLeft > 0
      ? `Bạn đang rời ${zone.name} (còn ${zoneLeft} đồ vật, có thể quay lại khám phá bất cứ lúc nào). `
      : `Bạn đã khám phá xong ${zone.name}! `;
    setTxt('doorModalDesc', `${leadIn}Bước qua ${doorName} để tới ${targetZone.name} (${targetZone.chinese} – ${targetZone.pinyin}).`);
    setTxt('doorFoundCount', `${this.state.zoneFoundCount(zone.id)}/${this.state.zoneTotal(zone.id)}`);
    setTxt('doorScoreCount', this.state.score);
    setHtml('btnConfirmExitDoorTxt', `${targetZone.icon} Đi tới ${targetZone.name}`);

    const doorModal = document.getElementById('doorModal');
    if (doorModal) doorModal.classList.add('active');
  }

  clearScene() {
    // Ba nguồn sáng nền do engine quản lý — giữ lại qua mọi lần dựng cảnh.
    // Mọi đèn khác đều do scene builder tạo ra và PHẢI bị xoá, nếu không đèn
    // của khu vực cũ sẽ chồng chất sang khu vực mới (sai ánh sáng + tụt FPS).
    const persistentLights = [this.ambientLight, this.sunLight, this.ceilingLight];

    const toRemove = [];
    this.scene.traverse((obj) => {
      if (obj === this.scene) return;
      if (persistentLights.indexOf(obj) !== -1) return;
      toRemove.push(obj);
    });

    // Gom texture rồi dispose một lần: nhiều material dùng chung một texture
    const textures = new Set();

    toRemove.forEach(obj => {
      if (obj.parent) obj.parent.remove(obj);

      if (obj.isLight) {
        if (obj.shadow && obj.shadow.map) {
          obj.shadow.map.dispose();
          obj.shadow.map = null;
        }
        if (typeof obj.dispose === 'function') obj.dispose();
        return;
      }

      // Bộ xương của nhân vật được dựng MỚI ở mỗi lần dựng cảnh, và three.js
      // cấp cho nó một bone texture riêng trên GPU. Texture này không nằm
      // trong material nên phải giải phóng tay, nếu không mỗi lần đổi khu vực
      // lại bỏ quên một texture (đo được: +1 texture GPU mỗi lần dựng cảnh).
      if (obj.isSkinnedMesh && obj.skeleton) {
        if (typeof obj.skeleton.dispose === 'function') {
          obj.skeleton.dispose();
        } else if (obj.skeleton.boneTexture) {
          obj.skeleton.boneTexture.dispose();
          obj.skeleton.boneTexture = null;
        }
      }

      // Mô hình GLB dùng chung geometry/material với bản cache trong
      // loadedModels — dispose là hỏng mọi lần dựng cảnh sau đó.
      if (obj.userData.fromGLB) return;

      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          if (!m) return;
          DISPOSABLE_TEXTURE_MAPS.forEach(key => {
            if (m[key] && m[key].isTexture) textures.add(m[key]);
          });
          m.dispose();
        });
      }
    });

    textures.forEach(t => t.dispose());

    // Studio 3D đang giữ bản sao dùng chung geometry/material vừa bị dispose
    if (this.inspector && typeof this.inspector.clearObject === 'function') {
      this.inspector.clearObject();
    }

    this._targetMeshCache = null;
    this.interactiveObjects = [];
    this.objectMeshFactories = {};
    this.targetedObject = null;
    this.playerMesh = null;
    this.playerBones = {};
    this.walkAnimPhase = 0;
    this.idleTime = 0;
    this.lampLight = null;
    this.clockHandSec = null;
    this.smokeParticles = [];
    this.animatedProps = [];
    this.colliders = [];
    if (this.crosshair) this.crosshair.classList.remove('active');
    if (this.promptEl) this.promptEl.classList.remove('visible');
  }

  // --- CONTROLS & INPUT SYSTEM ---
  setupControls() {
    window.addEventListener('keydown', e => {
      if (this.state.isPaused || !this.isPointerLocked) {
        if (e.code === 'KeyE' && this.targetedObject) {
          this.interactWithTarget();
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = true;
          break;
        case 'KeyV':
          this.toggleCameraMode();
          break;
        case 'KeyE':
        case 'Space':
        case 'Enter':
          this.interactWithTarget();
          break;
      }
    });

    window.addEventListener('keyup', e => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = false;
          break;
      }
    });

    const canvasEl = this.container;
    this.lockOverlay.addEventListener('click', () => {
      this.requestPointerLock();
    });

    canvasEl.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.requestPointerLock();
      } else {
        this.interactWithTarget();
      }
    });

    canvasEl.addEventListener('wheel', e => {
      if (this.cameraMode === 'third_person') {
        e.preventDefault();
        this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance + (e.deltaY > 0 ? 0.22 : -0.22), 1.2, 3.8);
      }
    }, { passive: false });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === canvasEl;
      if (this.isPointerLocked || DEVICE.useTouchUI) {
        this.lockOverlay.classList.add('hidden');
      } else {
        if (!this.state.activeItem && !document.getElementById('doorModal').classList.contains('active')) {
          this.lockOverlay.classList.remove('hidden');
        }
      }
    });

    document.addEventListener('mousemove', e => {
      if (!this.isPointerLocked) return;
      const sens = (this.state.sensitivity / 5) * 0.0022;
      this.player.yaw -= e.movementX * sens;
      this.player.pitch -= e.movementY * sens;
      this.player.pitch = THREE.MathUtils.clamp(this.player.pitch, -Math.PI / 3.0, Math.PI / 2.8);
    });

    // Mobile Virtual Joystick & Touch Look
    const joystickBase = document.getElementById('joystickBase');
    const joystickStick = document.getElementById('joystickStick');
    let joyTouchId = null;
    let joyCenter = { x: 0, y: 0 };

    if (joystickBase) {
      joystickBase.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        joyTouchId = touch.identifier;
        const rect = joystickBase.getBoundingClientRect();
        joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }, { passive: false });

      window.addEventListener('touchmove', e => {
        if (joyTouchId === null) return;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === joyTouchId) {
            const t = e.touches[i];
            const dx = t.clientX - joyCenter.x;
            const dy = t.clientY - joyCenter.y;
            const dist = Math.hypot(dx, dy);
            const maxDist = 45;
            const angle = Math.atan2(dy, dx);
            const clampedDist = Math.min(dist, maxDist);

            const stickX = Math.cos(angle) * clampedDist;
            const stickY = Math.sin(angle) * clampedDist;
            joystickStick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

            this.joystickDir.x = stickX / maxDist;
            this.joystickDir.y = stickY / maxDist;
            break;
          }
        }
      }, { passive: false });

      const endJoy = e => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joyTouchId) {
            joyTouchId = null;
            joystickStick.style.transform = 'translate(-50%, -50%)';
            this.joystickDir = { x: 0, y: 0 };
            break;
          }
        }
      };

      window.addEventListener('touchend', endJoy);
      window.addEventListener('touchcancel', endJoy);
    }

    canvasEl.addEventListener('touchstart', e => {
      if (this.touchLook.id !== null && this.touchLook.id !== undefined) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joyTouchId) continue;
        this.state.soundFX.init();
        this.touchLook.id = t.identifier;
        this.touchLook.moved = false;
        this.touchLook.startTime = Date.now();
        this.touchLook.startX = t.clientX;
        this.touchLook.startY = t.clientY;
        break;
      }
    }, { passive: true });

    canvasEl.addEventListener('touchmove', e => {
      if (this.touchLook.id === null || this.touchLook.id === undefined) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== this.touchLook.id) continue;

        const dx = t.clientX - this.touchLook.startX;
        const dy = t.clientY - this.touchLook.startY;
        this.touchLook.startX = t.clientX;
        this.touchLook.startY = t.clientY;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) this.touchLook.moved = true;
        const maxDelta = 80;
        const clampedDx = THREE.MathUtils.clamp(dx, -maxDelta, maxDelta);
        const clampedDy = THREE.MathUtils.clamp(dy, -maxDelta, maxDelta);
        const sens = (this.state.sensitivity / 5) * 0.0035;
        this.player.yaw -= clampedDx * sens;
        this.player.pitch -= clampedDy * sens;
        this.player.pitch = THREE.MathUtils.clamp(this.player.pitch, -Math.PI / 3.0, Math.PI / 2.8);
        break;
      }
    }, { passive: true });

    const endLook = e => {
      if (this.touchLook.id === null || this.touchLook.id === undefined) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier !== this.touchLook.id) continue;
        if (!this.touchLook.moved && Date.now() - this.touchLook.startTime < 300) {
          this.interactWithTarget();
        }
        this.touchLook.id = null;
        this.touchLook.moved = false;
        break;
      }
    };
    canvasEl.addEventListener('touchend', endLook);
    canvasEl.addEventListener('touchcancel', endLook);

    const btnMobile = document.getElementById('btnMobileInteract');
    if (btnMobile) {
      const fireInteract = e => {
        e.preventDefault();
        e.stopPropagation();
        this.state.soundFX.init();
        this.interactWithTarget();
      };
      btnMobile.addEventListener('touchstart', fireInteract, { passive: false });
      btnMobile.addEventListener('click', e => { if (!DEVICE.useTouchUI) fireInteract(e); });
    }

    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('orientationchange', () => {
      this.onWindowResize();
      setTimeout(() => this.onWindowResize(), 350);
    });
    if (window.screen && screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        setTimeout(() => this.onWindowResize(), 200);
      });
    }
  }

  requestPointerLock() {
    this.state.soundFX.init();

    if (DEVICE.useTouchUI) {
      this.isPointerLocked = false;
      if (this.lockOverlay) this.lockOverlay.classList.add('hidden');
      return;
    }

    this.container.requestPointerLock = this.container.requestPointerLock || this.container.mozRequestPointerLock;
    if (this.container.requestPointerLock) {
      this.container.requestPointerLock();
    } else {
      if (this.lockOverlay) this.lockOverlay.classList.add('hidden');
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.inspector) {
      this.inspector.resize();
    }
  }

  toggleFullscreen() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFs) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
      else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
      this.lockMobileLandscape();
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    }
    setTimeout(() => this.onWindowResize(), 180);
  }

  lockMobileLandscape() {
    if (DEVICE.useTouchUI) {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      } else if (screen.webkitLockOrientation) {
        screen.webkitLockOrientation('landscape');
      } else if (screen.mozLockOrientation) {
        screen.mozLockOrientation('landscape');
      }
    }
  }

  // --- UI & SCREEN SWITCHING ---
  setupUI() {
    document.getElementById('btnPlayLevel1').addEventListener('click', () => {
      if (DEVICE.useTouchUI) {
        const docEl = document.documentElement;
        if (!document.fullscreenElement) {
          if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
          else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        }
        this.lockMobileLandscape();
      }
      if (this.state.selectedAvatar) {
        this.switchScreen('game');
        this.startZoneSession();
      } else {
        this.switchScreen('charSelect');
      }
    });

    this.setupCharacterSelect();

    const btnChangeAvatarStart = document.getElementById('btnChangeAvatarStart');
    if (btnChangeAvatarStart) {
      btnChangeAvatarStart.addEventListener('click', () => {
        this.switchScreen('charSelect');
      });
    }

    const btnRotateFs = document.getElementById('btnRotateFullscreen');
    if (btnRotateFs) {
      btnRotateFs.addEventListener('click', () => {
        const docEl = document.documentElement;
        if (!document.fullscreenElement) {
          if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
          else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        }
        this.lockMobileLandscape();
      });
    }

    const btnHeaderFs = document.getElementById('btnHeaderFullscreen');
    if (btnHeaderFs) {
      btnHeaderFs.addEventListener('click', () => this.toggleFullscreen());
    }
    const btnGameFs = document.getElementById('btnToggleFullscreen');
    if (btnGameFs) {
      btnGameFs.addEventListener('click', () => this.toggleFullscreen());
    }

    const updateFsUI = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      document.querySelectorAll('.fs-icon').forEach(el => {
        el.textContent = isFs ? '🗗' : '⛶';
      });
      const fsTxt = document.getElementById('fullscreenTxt');
      if (fsTxt) fsTxt.textContent = isFs ? 'Thu nhỏ' : 'Toàn màn hình';
      this.onWindowResize();
    };
    document.addEventListener('fullscreenchange', updateFsUI);
    document.addEventListener('webkitfullscreenchange', updateFsUI);

    document.getElementById('btnPauseGame').addEventListener('click', () => {
      if (document.exitPointerLock) document.exitPointerLock();
      this.switchScreen('start');
    });

    const btnSound = document.getElementById('btnSoundToggle');
    const soundIcon = document.getElementById('soundIcon');
    btnSound.addEventListener('click', () => {
      this.state.soundFX.enabled = !this.state.soundFX.enabled;
      this.state.saveStorage();
      soundIcon.textContent = this.state.soundFX.enabled ? '🔊' : '🔇';
      btnSound.title = this.state.soundFX.enabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt';
    });

    const btnCam = document.getElementById('btnToggleCamera');
    if (btnCam) {
      btnCam.addEventListener('click', () => {
        this.toggleCameraMode();
      });
    }

    document.getElementById('btnCloseModal').addEventListener('click', () => this.closeVocabModal());
    document.getElementById('btnContinueExplore').addEventListener('click', () => this.closeVocabModal());

    document.getElementById('btnSpeakWord').addEventListener('click', () => {
      if (this.state.activeItem) {
        this.speakText(this.state.activeItem.chinese, 'zh-TW');
      }
    });

    document.getElementById('btnSpeakExample').addEventListener('click', () => {
      if (this.state.activeItem) {
        this.speakText(this.state.activeItem.exampleCn, 'zh-TW');
      }
    });

    document.getElementById('btnReset3dView').addEventListener('click', () => {
      this.inspector.resetView();
    });

    const btnRotate = document.getElementById('btnToggleAutoRotate');
    const rotateIcon = document.getElementById('rotateIcon');
    btnRotate.addEventListener('click', () => {
      const isAuto = this.inspector.toggleAutoRotate();
      rotateIcon.textContent = isAuto ? '⏸️ Dừng xoay' : '▶️ Tự xoay';
    });

    const drawer = document.getElementById('notebookDrawer');
    document.getElementById('btnToggleBook').addEventListener('click', () => {
      if (document.exitPointerLock) document.exitPointerLock();
      this.renderNotebookDrawer();
      drawer.classList.add('active');
    });
    document.getElementById('btnCloseDrawer').addEventListener('click', () => {
      drawer.classList.remove('active');
    });

    const btnFlash = document.getElementById('btnStartReviewFlashcards');
    if (btnFlash) {
      btnFlash.addEventListener('click', () => {
        if (drawer) drawer.classList.remove('active');
        this.openReviewQuizModal();
      });
    }

    const btnCloseRq = document.getElementById('btnCloseReviewQuiz');
    if (btnCloseRq) {
      btnCloseRq.addEventListener('click', () => {
        document.getElementById('reviewQuizModal').classList.remove('active');
      });
    }

    const tutModal = document.getElementById('tutorialModal');
    const closeTut = () => {
      if (tutModal) tutModal.classList.remove('active');
      this.state.hasSeenTutorial = true;
      this.state.saveStorage();
      if (!DEVICE.useTouchUI) this.requestPointerLock();
    };
    const btnCloseTut = document.getElementById('btnCloseTutorial');
    if (btnCloseTut) btnCloseTut.addEventListener('click', closeTut);
    const btnStartTut = document.getElementById('btnStartGameTutorial');
    if (btnStartTut) btnStartTut.addEventListener('click', closeTut);

    const settingsModal = document.getElementById('settingsModal');
    document.getElementById('btnSettings').addEventListener('click', () => {
      if (document.exitPointerLock) document.exitPointerLock();
      settingsModal.classList.add('active');
    });
    document.getElementById('btnCloseSettings').addEventListener('click', () => {
      settingsModal.classList.remove('active');
    });

    const sfxCheck = document.getElementById('settingSfxToggle');
    sfxCheck.addEventListener('change', e => {
      this.state.soundFX.enabled = e.target.checked;
      this.state.saveStorage();
      soundIcon.textContent = this.state.soundFX.enabled ? '🔊' : '🔇';
    });

    const settingCam = document.getElementById('settingCameraMode');
    if (settingCam) {
      settingCam.addEventListener('change', e => {
        this.setCameraMode(e.target.value);
      });
    }

    const sensRange = document.getElementById('settingMouseSensitivity');
    const sensVal = document.getElementById('sensitivityVal');
    sensRange.addEventListener('input', e => {
      this.state.sensitivity = parseInt(e.target.value, 10);
      sensVal.textContent = this.state.sensitivity;
      this.state.saveStorage();
    });

    document.getElementById('settingLangMode').addEventListener('change', e => {
      this.state.langMode = e.target.value;
      this.state.saveStorage();
      this.applyLangMode();
    });

    document.getElementById('btnResetProgress').addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa toàn bộ tiến độ khám phá và bắt đầu lại từ phòng ngủ?')) {
        this.state.resetProgress();
        this.victoryShown = false;
        this.updateProgressUI();
        settingsModal.classList.remove('active');
        this.restartJourney();
      }
    });

    document.getElementById('btnReplayLevel').addEventListener('click', () => {
      document.getElementById('victoryModal').classList.remove('active');
      this.state.resetProgress();
      this.victoryShown = false;
      this.updateProgressUI();
      this.restartJourney();
    });

    document.getElementById('btnBackToMenu').addEventListener('click', () => {
      document.getElementById('victoryModal').classList.remove('active');
      this.switchScreen('start');
    });

    const doorModal = document.getElementById('doorModal');
    const btnCloseDoor = document.getElementById('btnCloseDoorModal');
    if (btnCloseDoor) {
      btnCloseDoor.addEventListener('click', () => {
        doorModal.classList.remove('active');
        this.requestPointerLock();
      });
    }

    const btnCancelExit = document.getElementById('btnCancelExitDoor');
    if (btnCancelExit) {
      btnCancelExit.addEventListener('click', () => {
        doorModal.classList.remove('active');
        this.requestPointerLock();
      });
    }

    const btnConfirmExit = document.getElementById('btnConfirmExitDoor');
    if (btnConfirmExit) {
      btnConfirmExit.addEventListener('click', () => {
        if (this.pendingGateZone) this.goToZone(this.pendingGateZone);
      });
    }

    const btnLearnDoor = document.getElementById('btnLearnDoorCard');
    if (btnLearnDoor) {
      btnLearnDoor.addEventListener('click', () => {
        doorModal.classList.remove('active');
        this.openVocabModal(this.pendingGateVocab || 'door');
      });
    }
  }

  interactWithTarget() {
    if (!this.targetedObject || this.isTransitioning) return;
    const ud = this.targetedObject.userData;
    if (ud.isNpc) {
      this.openNpcDialogue(ud.npcId);
    } else if (ud.gateTarget) {
      this.handleGateInteraction(this.targetedObject);
    } else if (ud.vocabId) {
      this.openVocabModal(ud.vocabId);
    }
  }

  openNpcDialogue(npcId, startNode = 'start') {
    const npc = NPCS_DATA[npcId];
    if (!npc || !npc.dialogueTree) return;

    if (document.exitPointerLock) document.exitPointerLock();

    let currentNodeKey = startNode;
    const renderNode = (nodeKey) => {
      const node = npc.dialogueTree[nodeKey];
      if (!node) return;

      this.speakText(node.textCn, 'zh-TW');

      if (node.isEnd) {
        this.state.recordDialogueComplete(npcId);
        this.showToast(`✨ Đã hoàn thành trò chuyện cùng <b>${npc.chinese}</b> (+100 XP)`, 'unlock', 4000);
      }

      // Check if dialog modal exists in DOM or show interactive toast
      const modal = document.getElementById('dialogueModal');
      if (modal) {
        const titleEl = document.getElementById('dialogueNpcName');
        const roleEl = document.getElementById('dialogueNpcRole');
        const textCnEl = document.getElementById('dialogueTextCn');
        const textPinEl = document.getElementById('dialogueTextPinyin');
        const textViEl = document.getElementById('dialogueTextVi');
        const optionsEl = document.getElementById('dialogueOptions');

        if (titleEl) titleEl.textContent = npc.name;
        if (roleEl) roleEl.textContent = npc.role;
        if (textCnEl) textCnEl.textContent = node.textCn;
        if (textPinEl) textPinEl.textContent = node.textPinyin;
        if (textViEl) textViEl.textContent = node.textVi;

        if (optionsEl) {
          optionsEl.innerHTML = '';
          if (node.options && node.options.length > 0) {
            node.options.forEach(opt => {
              const btn = document.createElement('button');
              btn.className = 'dialogue-opt-btn';
              btn.textContent = opt.text;
              btn.addEventListener('click', () => {
                renderNode(opt.nextNode);
              });
              optionsEl.appendChild(btn);
            });
          } else {
            const btnClose = document.createElement('button');
            btnClose.className = 'dialogue-opt-btn close';
            btnClose.textContent = '👋 Tạm biệt (再見)';
            btnClose.addEventListener('click', () => {
              modal.classList.remove('active');
              this.requestPointerLock();
            });
            optionsEl.appendChild(btnClose);
          }
        }
        modal.classList.add('active');
      } else {
        // Toast fallback when modal is not in DOM
        this.showToast(
          `<b>${npc.name}:</b> ${node.textCn}<br><span class="toast-sub">${node.textVi}</span>`,
          'info',
          4500
        );
      }
    };

    renderNode(currentNodeKey);
  }

  toggleCameraMode() {
    const newMode = this.cameraMode === 'third_person' ? 'first_person' : 'third_person';
    this.setCameraMode(newMode);
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (this.state.cameraMode !== mode) {
      this.state.cameraMode = mode;
      this.state.saveStorage();
    }
    const camTxt = document.getElementById('cameraModeTxt');
    const camIcon = document.getElementById('cameraModeIcon');
    const settingCam = document.getElementById('settingCameraMode');

    if (mode === 'third_person') {
      if (camTxt) camTxt.textContent = 'Góc nhìn: Thứ 3';
      if (camIcon) camIcon.textContent = '🎥';
      if (settingCam) settingCam.value = 'third_person';
      if (this.playerMesh) this.playerMesh.visible = true;
    } else {
      if (camTxt) camTxt.textContent = 'Góc nhìn: Thứ 1';
      if (camIcon) camIcon.textContent = '👁️';
      if (settingCam) settingCam.value = 'first_person';
      if (this.playerMesh) this.playerMesh.visible = false;
    }
  }

  /**
   * Chế độ ngôn ngữ trong Cài đặt trước đây chỉ ghi vào state rồi bỏ đó —
   * ba lựa chọn của ô chọn không hề thay đổi gì trên màn hình.
   *   both    : Hán tự + bính âm + nghĩa Việt + tiếng Anh
   *   chinese : tập trung Hán tự + bính âm (ẩn dòng tiếng Anh)
   *   english : tiếng Anh + nghĩa Việt (ẩn dòng bính âm)
   */
  applyLangMode() {
    const mode = this.state.langMode || 'both';
    const root = document.getElementById('vocabModal');
    if (!root) return;
    root.classList.remove('lang-both', 'lang-chinese', 'lang-english');
    root.classList.add(`lang-${mode}`);
  }

  /** Đưa các ô trong bảng Cài đặt về đúng giá trị đang lưu. */
  syncSettingsUI() {
    const sfx = document.getElementById('settingSfxToggle');
    if (sfx) sfx.checked = this.state.soundFX.enabled;
    const soundIcon = document.getElementById('soundIcon');
    if (soundIcon) soundIcon.textContent = this.state.soundFX.enabled ? '🔊' : '🔇';

    const sens = document.getElementById('settingMouseSensitivity');
    if (sens) sens.value = String(this.state.sensitivity);
    const sensVal = document.getElementById('sensitivityVal');
    if (sensVal) sensVal.textContent = String(this.state.sensitivity);

    const lang = document.getElementById('settingLangMode');
    if (lang) lang.value = this.state.langMode || 'both';
    this.applyLangMode();

    const cam = document.getElementById('settingCameraMode');
    if (cam) cam.value = this.cameraMode;
  }

  // --- CHARACTER SELECTION ---
  updateCharSelectUI() {
    const cards = document.querySelectorAll('.char-card');
    const btnConfirm = document.getElementById('btnCharConfirm');
    cards.forEach(c => c.classList.remove('selected'));

    const current = this._pendingAvatar || this.state.selectedAvatar;
    if (current) {
      const preselected = document.querySelector(`.char-card[data-avatar="${current}"]`);
      if (preselected) {
        preselected.classList.add('selected');
        this._pendingAvatar = current;
        if (btnConfirm) {
          btnConfirm.classList.remove('disabled');
          btnConfirm.disabled = false;
        }
      }
    } else {
      this._pendingAvatar = null;
      if (btnConfirm) {
        btnConfirm.classList.add('disabled');
        btnConfirm.disabled = true;
      }
    }
  }

  setupCharacterSelect() {
    const cards = document.querySelectorAll('.char-card');
    const btnConfirm = document.getElementById('btnCharConfirm');
    const btnBack = document.getElementById('btnCharBack');
    this._pendingAvatar = this.state.selectedAvatar || null;

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this._pendingAvatar = card.dataset.avatar;
        if (btnConfirm) {
          btnConfirm.classList.remove('disabled');
          btnConfirm.disabled = false;
        }
      });
    });

    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => {
        if (!this._pendingAvatar) return;
        this.changeAvatar(this._pendingAvatar);
        this.switchScreen('game');
        this.startZoneSession();
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.switchScreen('start');
      });
    }
  }

  changeAvatar(avatarKey) {
    if (!AVATAR_FILES[avatarKey]) return;
    this.state.selectedAvatar = avatarKey;
    this.state.saveStorage();
    this.updateProgressUI();

    const newFile = AVATAR_FILES[avatarKey];
    MODEL_FILES.player_avatar = newFile;

    this._avatarRig = undefined;
    this._avatarRigCacheMap = {};
    delete this._modelJobs['player_avatar'];
    delete this.loadedModels['player_avatar'];

    if (this.sceneReady) {
      this.ensureModels(['player_avatar']).then(() => {
        this._avatarRig = undefined;
        this._avatarRigCacheMap = {};
        if (this.playerMesh) {
          this.scene.remove(this.playerMesh);
          this.playerMesh = null;
        }
        this.buildPlayerAvatar();
      });
    }
  }

  switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    window.scrollTo(0, 0);
    // Canvas 3D chỉ nằm trong màn hình game -> ngừng render ở các màn khác
    this.isSceneVisible = (screenName === 'game');
    if (screenName === 'start') {
      document.getElementById('screenStart').classList.add('active');
      this.updateProgressUI();
    } else if (screenName === 'charSelect') {
      document.getElementById('screenCharSelect').classList.add('active');
      this.updateCharSelectUI();
    } else if (screenName === 'game') {
      document.getElementById('screenGame').classList.add('active');
      this.onWindowResize();
    }
  }

  restartJourney() {
    this.state.hasWokenUp = false;
    if (this.currentZone === 'bedroom') {
      this.clearScene();
      this.buildZoneScene('bedroom');
      this.spawnPlayerInZone('bedroom');
      this.startZoneSession();
    } else {
      this.goToZone('bedroom', { label: 'Quay về phòng ngủ...' });
    }
  }

  startZoneSession() {
    if (!this.state.hasSeenTutorial) {
      const tutModal = document.getElementById('tutorialModal');
      if (tutModal) tutModal.classList.add('active');
    }
    if (this.currentZone === 'bedroom' && !this.state.hasWokenUp && !this.state.isZoneComplete('bedroom')) {
      this.startWakeUpSequence();
      this.requestPointerLock();
      return;
    }
    this.requestPointerLock();
    this.showObjectiveBanner(this.currentZone);
  }

  openReviewQuizModal() {
    const discoveredIds = Array.from(this.state.discovered);
    if (discoveredIds.length === 0) {
      this.showToast('Bạn chưa khám phá từ vựng nào! Hãy khám phá phòng trước.', 'warning');
      return;
    }
    const modal = document.getElementById('reviewQuizModal');
    if (!modal) return;
    if (document.exitPointerLock) document.exitPointerLock();

    this.reviewQuizList = discoveredIds.map(id => ROOM_VOCAB_DATA[id]).filter(Boolean);
    this.reviewQuizList.sort(() => Math.random() - 0.5);
    this.reviewQuizIndex = 0;
    this.reviewQuizScore = 0;

    this.renderReviewQuizQuestion();
    modal.classList.add('active');
  }

  renderReviewQuizQuestion() {
    if (this.reviewQuizIndex >= this.reviewQuizList.length || this.reviewQuizIndex >= 10) {
      const body = document.getElementById('reviewQuizBody');
      const badge = document.getElementById('rqScoreBadge');
      if (badge) badge.textContent = 'Hoàn thành!';
      if (body) {
        body.innerHTML = `
          <div style="text-align:center; padding: 20px 0;">
            <div style="font-size:3rem; margin-bottom: 10px;">🎉</div>
            <h3 style="font-size:1.4rem; font-weight:800; color:#0f172a;">Chúc Mừng Bạn Đã Ôn Tập Xong!</h3>
            <p style="color:#64748b; font-size:0.95rem; margin-top:8px;">
              Kết quả: <strong style="color:#0284c7;">${this.reviewQuizScore}/${Math.min(this.reviewQuizList.length, 10)}</strong> câu trả lời chính xác.
            </p>
          </div>
        `;
      }
      const btnNext = document.getElementById('btnRqNext');
      if (btnNext) {
        btnNext.style.display = 'block';
        btnNext.querySelector('span').textContent = 'Đóng Ôn Tập';
        btnNext.onclick = () => {
          document.getElementById('reviewQuizModal').classList.remove('active');
        };
      }
      this.state.soundFX.playVictory();
      return;
    }

    const item = this.reviewQuizList[this.reviewQuizIndex];
    const totalQ = Math.min(this.reviewQuizList.length, 10);
    const badge = document.getElementById('rqScoreBadge');
    if (badge) badge.textContent = `Câu ${this.reviewQuizIndex + 1}/${totalQ}`;

    const hanziEl = document.getElementById('rqHanzi');
    const pinyinEl = document.getElementById('rqPinyin');
    const optionsGrid = document.getElementById('rqOptionsGrid');
    const feedback = document.getElementById('rqFeedback');
    const btnNext = document.getElementById('btnRqNext');

    if (hanziEl) hanziEl.textContent = item.chinese;
    if (pinyinEl) pinyinEl.textContent = item.pinyin;
    if (feedback) { feedback.textContent = ''; feedback.className = 'rq-feedback'; }
    if (btnNext) btnNext.style.display = 'none';

    const allItems = Object.values(ROOM_VOCAB_DATA);
    const options = [item];
    while (options.length < 4 && options.length < allItems.length) {
      const rand = allItems[Math.floor(Math.random() * allItems.length)];
      if (!options.find(o => o.id === rand.id)) {
        options.push(rand);
      }
    }
    options.sort(() => Math.random() - 0.5);

    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'rq-opt-btn';
        btn.textContent = opt.meaning;
        btn.addEventListener('click', () => {
          const allBtns = optionsGrid.querySelectorAll('.rq-opt-btn');
          allBtns.forEach(b => b.disabled = true);

          if (opt.id === item.id) {
            btn.classList.add('correct');
            this.reviewQuizScore++;
            this.state.soundFX.playCorrect();
            if (feedback) {
              feedback.textContent = '✨ Chính xác!';
              feedback.style.color = '#15803d';
            }
          } else {
            btn.classList.add('wrong');
            this.state.soundFX.playWrong();
            allBtns.forEach(b => {
              if (b.textContent === item.meaning) b.classList.add('correct');
            });
            if (feedback) {
              feedback.textContent = `❌ Chưa đúng. Nghĩa đúng: ${item.meaning}`;
              feedback.style.color = '#b91c1c';
            }
          }

          if (btnNext) {
            btnNext.style.display = 'block';
            btnNext.querySelector('span').textContent = 'Câu Tiếp Theo →';
            btnNext.onclick = () => {
              this.reviewQuizIndex++;
              this.renderReviewQuizQuestion();
            };
          }
        });
        optionsGrid.appendChild(btn);
      });
    }
  }

  speakText(text, lang = 'zh-TW') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.88;
    window.speechSynthesis.speak(utter);
  }

  // --- VOCABULARY MODAL & QUIZ ---
  openVocabModal(vocabId) {
    const data = ROOM_VOCAB_DATA[vocabId];
    if (!data) return;

    if (this.inspector) this.inspector.setActive(true);
    this.state.activeItem = data;
    const isNew = this.state.markDiscovered(vocabId);
    this.updateProgressUI();

    document.getElementById('modalCategory').textContent = data.category;
    document.getElementById('modalHanzi').textContent = data.chinese;
    document.getElementById('modalPinyin').textContent = data.pinyin;
    document.getElementById('modalMeaningVi').textContent = data.meaning;
    document.getElementById('modalEnglish').textContent = data.english;
    document.getElementById('modalPartOfSpeech').textContent = data.partOfSpeech;
    document.getElementById('modalExampleCn').textContent = data.exampleCn;
    document.getElementById('modalExamplePinyin').textContent = data.examplePinyin;
    document.getElementById('modalExampleVi').textContent = data.exampleVi;

    const discText = document.getElementById('modalDiscoveryText');
    const zoneOfItem = ZONES[data.zone];
    if (isNew) {
      discText.innerHTML = data.isGate
        ? `${getSvgIcon('ui_door', { size: 16 })} Đã ghi lối đi này vào sổ tay (+20 điểm)`
        : `${getSvgIcon('ui_sparkles', { size: 16 })} Mới phát hiện! +100 Điểm vào sổ tay`;
    } else {
      discText.innerHTML = `${getSvgIcon('ui_check', { size: 16 })} Đã từng khám phá đồ vật này`;
    }
    const zoneTag = document.getElementById('modalZoneTag');
    if (zoneTag && zoneOfItem) {
      zoneTag.innerHTML = `${zoneOfItem.icon} ${zoneOfItem.name} • ${this.state.zoneFoundCount(zoneOfItem.id)}/${this.state.zoneTotal(zoneOfItem.id)}`;
    } else if (zoneTag) {
      zoneTag.innerHTML = `${getSvgIcon('ui_door', { size: 16 })} Lối đi`;
    }

    this.renderMiniQuiz(data.quiz);

    const modal = document.getElementById('vocabModal');
    modal.classList.add('active');
    if (document.exitPointerLock) document.exitPointerLock();

    setTimeout(() => {
      if (this.objectMeshFactories[vocabId]) {
        this.inspector.showObject(this.objectMeshFactories[vocabId]);
      } else {
        this.inspector.showPlaceholder(data);
      }
    }, 50);

    setTimeout(() => {
      this.speakText(data.chinese, 'zh-TW');
    }, 350);

    if (isNew && !data.isGate && data.zone === this.currentZone && this.state.isZoneComplete(this.currentZone)) {
      this.onZoneCompleted(this.currentZone);
    }

    if (isNew && this.state.isAllComplete()) {
      setTimeout(() => {
        this.showVictoryScreen();
      }, 1400);
    }
  }

  onZoneCompleted(zoneId) {
    const zone = ZONES[zoneId];
    if (!zone) return;
    this.state.syncUnlockedZones();
    this.state.saveStorage();

    this.interactiveObjects.forEach(obj => {
      if (obj.userData && obj.userData.lockVisualZone === zoneId) {
        this.applyGateLockVisual(obj, zoneId);
      }
    });

    // Khu vực hub (đại lộ) không khoá gì cả nên không quảng cáo "cửa đã mở khoá"
    const nextZone = (!zone.isHub && zone.next) ? ZONES[zone.next] : null;
    setTimeout(() => {
      this.state.soundFX.playVictory();
      if (nextZone) {
        const hint = zone.nextHint
          ? zone.nextHint
          : `Hãy tới ${nextZone.icon} ${nextZone.name} (${nextZone.chinese} – ${nextZone.pinyin})`;
        this.showToast(
          `${getSvgIcon('ui_sparkles', { size: 20 })} Hoàn thành <b>${zone.name}</b> (${zone.chinese})! Chặng kế tiếp đã mở khoá.<br>` +
          `<span class="toast-sub">${hint}</span>`,
          'unlock', 5200
        );
      } else {
        this.showToast(`${getSvgIcon('ui_trophy', { size: 20 })} Bạn đã khám phá trọn vẹn <b>${zone.name}</b>!`, 'unlock', 5000);
      }
    }, 700);
    this.updateZoneHud();
  }

  closeVocabModal(silent = false) {
    const modal = document.getElementById('vocabModal');
    modal.classList.remove('active');
    if (this.inspector) this.inspector.setActive(false);
    this.state.activeItem = null;
    if (!silent) this.requestPointerLock();
  }

  renderMiniQuiz(quiz) {
    const qText = document.getElementById('quizQuestion');
    const qOpts = document.getElementById('quizOptions');
    const qStatus = document.getElementById('quizStatus');

    qText.textContent = quiz.question;
    qOpts.innerHTML = '';
    qStatus.textContent = '';

    const optLetters = ['A', 'B', 'C', 'D'];
    quiz.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `<span class="opt-badge">${optLetters[idx] || (idx + 1)}</span><span class="opt-text">${opt}</span>`;
      btn.addEventListener('click', () => {
        qOpts.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);
        const vocabId = this.state.activeItem ? this.state.activeItem.id : null;
        if (idx === quiz.correct) {
          btn.classList.add('correct');
          qStatus.textContent = '🎉 Chính xác! (+50 Điểm • SRS Cập nhật)';
          qStatus.style.color = 'var(--accent-emerald)';
          if (vocabId) this.state.recordQuizResult(vocabId, true, 4);
          this.state.soundFX.playCorrect();
        } else {
          btn.classList.add('wrong');
          qOpts.children[quiz.correct].classList.add('correct');
          qStatus.textContent = '❌ Chưa đúng, từ này sẽ được lên lịch ôn sớm!';
          qStatus.style.color = 'var(--accent-rose)';
          if (vocabId) this.state.recordQuizResult(vocabId, false, 1);
          this.state.soundFX.playWrong();
        }
        this.updateProgressUI();
      });
      qOpts.appendChild(btn);
    });
  }

  startSentenceBuilder(vocabId) {
    const item = ROOM_VOCAB_DATA[vocabId];
    if (!item) return null;
    return this.miniGames.createSentenceChallenge(item);
  }

  startToneChallenge(vocabId) {
    const item = ROOM_VOCAB_DATA[vocabId];
    if (!item) return null;
    return this.miniGames.createToneChallenge(item);
  }

  renderNotebookDrawer() {
    const container = document.getElementById('drawerVocabList');
    const count = document.getElementById('drawerSummaryCount');
    const found = this.state.totalFound();
    count.textContent = `Đã khám phá ${found}/${TOTAL_VOCAB_COUNT} từ vựng trên toàn hành trình`;

    container.innerHTML = '';
    ZONE_ORDER.forEach(zoneId => {
      const zone = ZONES[zoneId];
      const unlocked = this.state.unlockedZones.has(zoneId);
      const zFound = this.state.zoneFoundCount(zoneId);
      const zTotal = this.state.zoneTotal(zoneId);

      const header = document.createElement('div');
      header.className = 'drawer-zone-header' + (unlocked ? '' : ' zone-locked');
      header.innerHTML = `
        <span class="dz-icon">${unlocked ? zone.icon : getSvgIcon('ui_lock', { size: 18 })}</span>
        <span class="dz-name">${zone.name} <em>${zone.chinese} · ${zone.pinyin}</em></span>
        <span class="dz-count">${zFound}/${zTotal}</span>
      `;
      container.appendChild(header);

      if (!unlocked) {
        const hint = document.createElement('div');
        hint.className = 'drawer-zone-hint';
        hint.textContent = 'Hoàn thành khu vực trước để mở khoá.';
        container.appendChild(hint);
        return;
      }

      zone.items.forEach(itemId => {
        const item = ROOM_VOCAB_DATA[itemId];
        if (!item) return;
        const isFound = this.state.discovered.has(item.id);
        const card = document.createElement('div');
        card.className = 'drawer-vocab-item' + (isFound ? '' : ' not-found');
        card.innerHTML = `
          <div class="drawer-item-left">
            <span class="drawer-item-icon">${isFound ? item.icon : getSvgIcon('ui_question', { size: 20 })}</span>
            <div>
              <div class="drawer-item-hanzi">${isFound ? item.chinese : '????'}</div>
              <div class="drawer-item-pinyin">${isFound ? item.pinyin : 'chưa mở'}</div>
            </div>
          </div>
          <div class="drawer-item-right">
            <div class="drawer-item-meaning">${isFound ? item.nameVi : 'Chưa khám phá'}</div>
            <div class="drawer-item-en">${isFound ? item.english : '???'}</div>
          </div>
        `;
        if (isFound) {
          card.addEventListener('click', () => {
            document.getElementById('notebookDrawer').classList.remove('active');
            this.openVocabModal(item.id);
          });
        }
        container.appendChild(card);
      });
    });
  }

  updateZoneHud() {
    const zone = ZONES[this.currentZone];
    if (!zone) return;
    const found = this.state.zoneFoundCount(zone.id);
    const total = this.state.zoneTotal(zone.id);
    const remaining = total - found;

    const nameEl = document.getElementById('hudRoomName');
    if (nameEl) nameEl.innerHTML = `${zone.name} <span class="hud-zone-cn">${zone.chinese}</span>`;
    const iconEl = document.getElementById('hudRoomIcon');
    if (iconEl) iconEl.innerHTML = zone.icon;

    const stepEl = document.getElementById('hudZoneStep');
    if (stepEl) {
      stepEl.textContent = zone.isHub
        ? 'Trục đường chính'
        : `Chặng ${ZONE_ORDER.indexOf(zone.id) + 1}/${ZONE_ORDER.length}`;
    }

    const taskEl = document.getElementById('hudZoneTask');
    if (taskEl) {
      if (zone.isHub) {
        taskEl.innerHTML = remaining > 0
          ? `${getSvgIcon('ui_arrow_right', { size: 15 })} Tự do đi lại • <b>${remaining}</b> đồ vật tuỳ chọn dọc phố`
          : `${getSvgIcon('ui_check', { size: 15 })} Đã khám phá hết đại lộ • Tự do đi lại`;
        taskEl.className = 'hud-zone-task done';
      } else if (remaining > 0) {
        taskEl.innerHTML = `${getSvgIcon('ui_target', { size: 15 })} Còn <b>${remaining}</b> đồ vật cần khám phá`;
        taskEl.className = 'hud-zone-task';
      } else if (zone.next) {
        taskEl.innerHTML = `${getSvgIcon('ui_check', { size: 15 })} Đã xong! Tới ${ZONES[zone.next].icon} ${ZONES[zone.next].name}`;
        taskEl.className = 'hud-zone-task done';
      } else {
        taskEl.innerHTML = `${getSvgIcon('ui_trophy', { size: 15 })} Hoàn thành toàn bộ hành trình!`;
        taskEl.className = 'hud-zone-task done';
      }
    }

    const trackEl = document.getElementById('hudZoneTrack');
    if (trackEl) {
      trackEl.innerHTML = ZONE_ORDER.map(zid => {
        const z = ZONES[zid];
        const done = this.state.isZoneComplete(zid);
        const active = zid === this.currentZone;
        const locked = !this.state.unlockedZones.has(zid);
        const cls = ['zt-node', active ? 'active' : '', done ? 'done' : '', locked ? 'locked' : ''].filter(Boolean).join(' ');
        return `<span class="${cls}" title="${z.name} (${z.chinese})">${locked ? getSvgIcon('ui_lock', { size: 14 }) : z.icon}</span>`;
      }).join('<span class="zt-line"></span>');
    }
  }

  updateProgressUI() {
    const zone = ZONES[this.currentZone] || ZONES.bedroom;
    const zFound = this.state.zoneFoundCount(zone.id);
    const zTotal = this.state.zoneTotal(zone.id);
    const zPct = zTotal ? Math.round((zFound / zTotal) * 100) : 0;

    const totalFound = this.state.totalFound();
    const totalPct = Math.round((totalFound / TOTAL_VOCAB_COUNT) * 100);

    const set = (id, val, prop = 'textContent') => {
      const el = document.getElementById(id);
      if (el) el[prop] = val;
    };

    set('totalDiscoveredStats', `${totalFound}/${TOTAL_VOCAB_COUNT}`);
    set('totalScoreStats', this.state.score);
    const fill = document.getElementById('level1ProgressFill');
    if (fill) fill.style.width = `${totalPct}%`;
    set('level1ProgressText', `Đã tìm: ${totalFound}/${TOTAL_VOCAB_COUNT} (${totalPct}%)`);
    set('startZoneName', `${zone.icon} ${zone.name}`, 'innerHTML');

    const avatarName = this.state.selectedAvatar === 'woman' ? 'Nữ Sinh' : (this.state.selectedAvatar === 'man' ? 'Nam Sinh' : 'Chưa chọn');
    set('startAvatarName', avatarName);

    set('hudDiscoveredCount', `${zFound} / ${zTotal}`);
    const miniFill = document.getElementById('hudMiniFill');
    if (miniFill) miniFill.style.width = `${zPct}%`;
    set('hudDiscoveredBadge', totalFound);

    this.updateZoneHud();
  }

  showVictoryScreen() {
    if (this.victoryShown) return;
    this.victoryShown = true;
    if (document.exitPointerLock) document.exitPointerLock();
    const modal = document.getElementById('victoryModal');
    const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('victoryItemsCount', `${this.state.totalFound()}/${TOTAL_VOCAB_COUNT}`);
    set('victoryScore', this.state.score);
    const totalQ = this.state.quizStats.total || 1;
    const acc = Math.round((this.state.quizStats.correct / totalQ) * 100);
    set('victoryAccuracy', `${acc}%`);

    modal.classList.add('active');
    this.state.soundFX.playVictory();
  }

  /**
   * Huỷ mọi hẹn giờ còn treo của cảnh thức dậy. Không có bước này, khi người
   * chơi bấm "chơi lại" hoặc rời phòng ngủ trong 4.2s đầu, hẹn giờ cũ vẫn nổ
   * và dịch chuyển nhân vật về điểm spawn phòng ngủ giữa khu vực khác.
   */
  cancelWakeUpSequence() {
    if (this._wakeUpTimers) this._wakeUpTimers.forEach(id => clearTimeout(id));
    this._wakeUpTimers = [];
    this.isWakingUp = false;
    this.wakeCameraY = null;
    const lids = document.getElementById('wakeUpEyelids');
    if (lids) lids.className = 'wakeup-eyelids';
  }

  startWakeUpSequence() {
    this.cancelWakeUpSequence();
    this.isWakingUp = true;
    this.wakeUpTimer = 0;
    this.state.hasWokenUp = true;

    this.player.pos.set(3.6, 0, -3.0);
    this.player.yaw = Math.PI * 0.78;
    this.player.pitch = 0.80;
    this.wakeCameraY = 0.98;

    this.targetedObject = null;
    if (this.crosshair) this.crosshair.classList.remove('active');
    if (this.promptEl) this.promptEl.classList.remove('visible');

    const lids = document.getElementById('wakeUpEyelids');
    if (lids) lids.classList.add('active');
    const overlay = document.getElementById('roomTransitionOverlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }

    const script = [
      { at: 0.2, blink: 'closed' },
      { at: 1.0, blink: 'half' },
      { at: 1.8, blink: 'closed' },
      { at: 2.6, blink: 'open' }
    ];
    script.forEach(step => {
      this._wakeUpTimers.push(setTimeout(() => {
        if (lids) lids.className = `wakeup-eyelids active lid-${step.blink}`;
      }, step.at * 1000));
    });

    this._wakeUpTimers.push(setTimeout(() => {
      this.showToast(
        '🌅 <b>早安！</b> (zǎo ān – Chào buổi sáng!)<br>' +
        '<span class="toast-sub">Bạn vừa thức dậy trong phòng ngủ của mình.</span>',
        'wake', 4200
      );
    }, 2000));

    this._wakeUpTimers.push(setTimeout(() => {
      if (lids) lids.classList.remove('active');
      this.isWakingUp = false;
      this.wakeCameraY = null;
      this._wakeUpTimers = [];
      const spawn = ZONES.bedroom.spawn;
      this.player.pos.set(spawn.x, 0, spawn.z);
      this.player.yaw = spawn.yaw;
      this.player.pitch = 0.05;
      this.showObjectiveBanner('bedroom');
      this.state.saveStorage();
    }, 4200));
  }

  resolveMovementCollisions(pos, moveStep) {
    const radius = 0.32;
    const targetPos = pos.clone().add(moveStep);

    const bounds = this.roomBounds || { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 };
    targetPos.x = THREE.MathUtils.clamp(targetPos.x, bounds.minX, bounds.maxX);
    targetPos.z = THREE.MathUtils.clamp(targetPos.z, bounds.minZ, bounds.maxZ);

    if (this.colliders && this.colliders.length > 0) {
      for (const box of this.colliders) {
        const minX = box.minX - radius;
        const maxX = box.maxX + radius;
        const minZ = box.minZ - radius;
        const maxZ = box.maxZ + radius;

        if (targetPos.x > minX && targetPos.x < maxX && targetPos.z > minZ && targetPos.z < maxZ) {
          const distToMinX = Math.abs(targetPos.x - minX);
          const distToMaxX = Math.abs(targetPos.x - maxX);
          const distToMinZ = Math.abs(targetPos.z - minZ);
          const distToMaxZ = Math.abs(targetPos.z - maxZ);

          const minDist = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);

          if (minDist === distToMinX) targetPos.x = minX;
          else if (minDist === distToMaxX) targetPos.x = maxX;
          else if (minDist === distToMinZ) targetPos.z = minZ;
          else targetPos.z = maxZ;
        }
      }
    }

    return targetPos;
  }

  updatePlayer(delta) {
    if (this.isWakingUp) {
      this.wakeUpTimer += delta;
      const sway = Math.sin(this.wakeUpTimer * 0.9) * 0.03;
      this.camera.position.set(this.player.pos.x, this.wakeCameraY || 0.62, this.player.pos.z);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.player.yaw + sway;
      const t = Math.min(1, this.wakeUpTimer / 4.0);
      this.camera.rotation.x = this.player.pitch * (1 - t * 0.92);
      this.camera.rotation.z = 0.3 * (1 - t);
      if (this.playerMesh) this.playerMesh.visible = false;
      return;
    }
    this.camera.rotation.z = 0;

    const isInputActive = this.isPointerLocked || this.joystickDir.x !== 0 || this.joystickDir.y !== 0;
    const forward = new THREE.Vector3(-Math.sin(this.player.yaw), 0, -Math.cos(this.player.yaw));
    const right = new THREE.Vector3(Math.cos(this.player.yaw), 0, -Math.sin(this.player.yaw));

    const moveDir = new THREE.Vector3();

    if (isInputActive) {
      if (this.keys.forward) moveDir.add(forward);
      if (this.keys.backward) moveDir.sub(forward);
      if (this.keys.right) moveDir.add(right);
      if (this.keys.left) moveDir.sub(right);

      if (this.joystickDir.x !== 0 || this.joystickDir.y !== 0) {
        moveDir.addScaledVector(right, this.joystickDir.x);
        moveDir.addScaledVector(forward, -this.joystickDir.y);
      }
    }

    const isMoving = moveDir.lengthSq() > 0.001;

    if (isMoving) {
      moveDir.normalize();
      const currentSpeed = this.keys.sprint ? this.player.sprintSpeed : this.player.speed;
      const moveStep = moveDir.clone().multiplyScalar(currentSpeed * delta);

      this.player.pos = this.resolveMovementCollisions(this.player.pos, moveStep);
      this.state.soundFX.playFootstep();

      this.walkAnimPhase += delta * (this.keys.sprint ? 14 : 9.5);
      const isSprinting = this.keys.sprint;
      const legSwing = Math.sin(this.walkAnimPhase) * (isSprinting ? 0.85 : 0.62);
      const armSwing = Math.sin(this.walkAnimPhase) * (isSprinting ? 0.75 : 0.52);

      if (this.playerBones.leftLeg) this.playerBones.leftLeg.rotation.x = legSwing;
      if (this.playerBones.rightLeg) this.playerBones.rightLeg.rotation.x = -legSwing;

      if (this.playerBones.leftKnee) this.playerBones.leftKnee.rotation.x = Math.max(0, -legSwing * 0.95);
      if (this.playerBones.rightKnee) this.playerBones.rightKnee.rotation.x = Math.max(0, legSwing * 0.95);

      const elbowBend = -0.28 - Math.abs(armSwing) * 0.35;
      if (this.playerBones.leftArm) {
        this.playerBones.leftArm.rotation.x = -armSwing;
        this.setElbowBend(this.playerBones.leftElbow, elbowBend, 1);
      }
      if (this.playerBones.rightArm) {
        this.playerBones.rightArm.rotation.x = armSwing;
        this.setElbowBend(this.playerBones.rightElbow, elbowBend, -1);
      }

      if (this.playerBones.torso) {
        this.playerBones.torso.rotation.z = Math.sin(this.walkAnimPhase) * 0.04;
        const bounce = Math.abs(Math.sin(this.walkAnimPhase * 2)) * 0.035;
        this.playerBones.torso.position.y = (this.playerBones.torsoBaseY ?? 0.85) + bounce;
      }
    } else {
      this.idleTime += delta;
      const blendFactor = Math.min(1, delta * 8);
      if (this.playerBones.leftLeg) this.playerBones.leftLeg.rotation.x = THREE.MathUtils.lerp(this.playerBones.leftLeg.rotation.x, 0, blendFactor);
      if (this.playerBones.rightLeg) this.playerBones.rightLeg.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightLeg.rotation.x, 0, blendFactor);
      if (this.playerBones.leftKnee) this.playerBones.leftKnee.rotation.x = THREE.MathUtils.lerp(this.playerBones.leftKnee.rotation.x, 0.04, blendFactor);
      if (this.playerBones.rightKnee) this.playerBones.rightKnee.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightKnee.rotation.x, 0.04, blendFactor);

      if (this.playerBones.leftArm) {
        this.playerBones.leftArm.rotation.x = THREE.MathUtils.lerp(this.playerBones.leftArm.rotation.x, 0.08, blendFactor);
        this.setElbowBend(this.playerBones.leftElbow, -0.20, 1, blendFactor);
      }
      if (this.playerBones.rightArm) {
        this.playerBones.rightArm.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightArm.rotation.x, 0.08, blendFactor);
        this.setElbowBend(this.playerBones.rightElbow, -0.20, -1, blendFactor);
      }

      if (this.playerBones.torso) {
        this.playerBones.torso.rotation.z = THREE.MathUtils.lerp(this.playerBones.torso.rotation.z, 0, blendFactor);
        const breathe = Math.sin(this.idleTime * 2.2) * 0.01;
        this.playerBones.torso.position.y = (this.playerBones.torsoBaseY ?? 0.85) + breathe;
      }
    }

    if (!this.avatarIsSkinned && this.playerBones.rightArm) {
      const targetArmPitch = -Math.PI / 2 + this.player.pitch * 0.95;
      this.playerBones.rightArm.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightArm.rotation.x, targetArmPitch, Math.min(1, delta * 20));
      this.playerBones.rightArm.rotation.y = -0.15;
      this.playerBones.rightArm.rotation.z = 0.04;
    }

    if (this.playerMesh) {
      const desiredBodyYaw = isMoving ? Math.atan2(moveDir.x, moveDir.z) : this.player.yaw + Math.PI;
      let diff = desiredBodyYaw - this.playerMesh.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.playerMesh.rotation.y += diff * Math.min(1, delta * 12);
      this.playerMesh.position.set(this.player.pos.x, 0, this.player.pos.z);
    }

    if (this.cameraMode === 'third_person') {
      if (this.playerMesh) this.playerMesh.visible = true;

      const dist = this.cameraDistance;
      const cosPitch = Math.cos(this.player.pitch);
      const sinPitch = Math.sin(this.player.pitch);

      const shoulderOffset = 0.40;
      const headHeight = 1.50;

      let camX = this.player.pos.x + right.x * shoulderOffset - forward.x * (dist * cosPitch);
      let camZ = this.player.pos.z + right.z * shoulderOffset - forward.z * (dist * cosPitch);
      let camY = this.player.pos.y + headHeight - sinPitch * dist;

      const cb = this.roomBounds || { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 };
      const outdoor = isOutdoorZone(this.currentZone);
      const margin = outdoor ? 2.5 : 0.05;
      camX = THREE.MathUtils.clamp(camX, cb.minX - margin, cb.maxX + margin);
      camZ = THREE.MathUtils.clamp(camZ, cb.minZ - margin, cb.maxZ + margin);
      camY = THREE.MathUtils.clamp(camY, 0.35, outdoor ? 6.5 : 3.9);

      const lookDist = 10.0;
      const lookTarget = new THREE.Vector3(
        camX + forward.x * lookDist,
        camY + Math.tan(this.player.pitch) * lookDist,
        camZ + forward.z * lookDist
      );

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookTarget);
    } else {
      if (this.playerMesh) this.playerMesh.visible = false;

      this.camera.position.set(this.player.pos.x, 1.6, this.player.pos.z);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.player.yaw;
      this.camera.rotation.x = this.player.pitch;
    }
  }

  /**
   * Danh sách mesh dùng cho raycast. Trước đây được dựng lại mỗi khung hình
   * (traverse toàn bộ vật thể tương tác 60 lần/giây) — nay chỉ dựng lại khi
   * số vật thể tương tác thay đổi (dựng cảnh mới, NPC spawn thêm).
   */
  getRaycastTargets() {
    if (this._targetMeshCache && this._targetMeshCacheSize === this.interactiveObjects.length) {
      return this._targetMeshCache;
    }
    const meshes = [];
    this.interactiveObjects.forEach(group => {
      group.traverse(child => {
        if (child.isMesh) {
          child.userData.rootGroup = group;
          meshes.push(child);
        }
      });
    });
    this._targetMeshCache = meshes;
    this._targetMeshCacheSize = this.interactiveObjects.length;
    return meshes;
  }

  setTargetHighlight(targetObj, highlight) {
    if (!targetObj) return;
    targetObj.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => {
          if (m.emissive) {
            if (highlight) {
              if (child.userData.origEmissiveHex === undefined) {
                child.userData.origEmissiveHex = m.emissive.getHex();
                child.userData.origEmissiveIntensity = m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1;
              }
              m.emissive.setHex(0x38bdf8);
              m.emissiveIntensity = 0.45;
            } else if (child.userData.origEmissiveHex !== undefined) {
              m.emissive.setHex(child.userData.origEmissiveHex);
              m.emissiveIntensity = child.userData.origEmissiveIntensity;
              delete child.userData.origEmissiveHex;
              delete child.userData.origEmissiveIntensity;
            }
          }
        });
      }
    });
  }

  updateRaycaster() {
    if (this.isWakingUp || this.isTransitioning) return;

    const isOutdoor = isOutdoorZone(this.currentZone);
    const reach = isOutdoor ? 8.5 : 4.6;

    if (!this._raycaster) {
      this._raycaster = new THREE.Raycaster();
      this._screenCenter = new THREE.Vector2(0, 0);
    }
    const raycaster = this._raycaster;
    raycaster.setFromCamera(this._screenCenter, this.camera);
    raycaster.far = reach + (this.cameraMode === 'third_person' ? this.cameraDistance + 1.2 : 1.5);

    const targetMeshes = this.getRaycastTargets();

    let foundTarget = null;
    const intersects = raycaster.intersectObjects(targetMeshes, false);

    if (intersects.length > 0) {
      const root = intersects[0].object.userData.rootGroup;
      if (root && root.userData.vocabData) {
        const hit = intersects[0].point;
        const distToPlayer = Math.hypot(hit.x - this.player.pos.x, hit.z - this.player.pos.z);
        if (distToPlayer < reach) {
          foundTarget = root;
        }
      }
    }

    if (!foundTarget && this.cameraMode === 'third_person') {
      let closestDist = isOutdoor ? 4.0 : 2.5;
      this.interactiveObjects.forEach(group => {
        const d = this.player.pos.distanceTo(group.position);
        if (d < closestDist) {
          const toObj = new THREE.Vector3().subVectors(group.position, this.player.pos).normalize();
          const forward = new THREE.Vector3(-Math.sin(this.player.yaw), 0, -Math.cos(this.player.yaw));
          if (forward.dot(toObj) > 0.25) {
            closestDist = d;
            foundTarget = group;
          }
        }
      });
    }

    if (foundTarget) {
      if (this.targetedObject !== foundTarget) {
        if (this.targetedObject) this.setTargetHighlight(this.targetedObject, false);
        this.targetedObject = foundTarget;
        if (this.targetedObject) this.setTargetHighlight(this.targetedObject, true);
        this.crosshair.classList.add('active');
        this.promptEl.classList.add('visible');
        const ud = foundTarget.userData;
        if (ud.isNpc) {
          this.promptTargetName.innerHTML =
            `💬 <b>${ud.vocabData.chinese}</b> (${ud.vocabData.nameVi}) • [E / Click] Trò chuyện`;
        } else if (ud.gateTarget) {
          const tz = ZONES[ud.gateTarget];
          const gd = ud.vocabData;
          const reqZone = ud.requireZoneComplete ? ZONES[ud.requireZoneComplete] : null;
          const reqLeft = reqZone ? this.state.zoneRemaining(reqZone.id) : 0;
          const selfLeft = ud.gateLocked ? this.state.zoneRemaining(this.currentZone) : 0;
          const locked = reqLeft > 0 || selfLeft > 0;
          if (ud.gateDirection === 'back') {
            this.promptTargetName.innerHTML =
              `${getSvgIcon('ui_arrow_right', { size: 16 })} ${gd ? gd.chinese : ''} • [E / Click] Quay lại ${tz ? tz.name : ''}`;
          } else if (locked) {
            const lockZone = reqLeft > 0 ? reqZone : ZONES[this.currentZone];
            const lockLeft = reqLeft > 0 ? reqLeft : selfLeft;
            this.promptTargetName.innerHTML =
              `${getSvgIcon('ui_lock', { size: 16 })} ${gd ? gd.chinese + ' (' + gd.pinyin + ')' : ''} • Cần khám phá xong ${lockZone ? lockZone.name : ''} (còn <b>${lockLeft}</b> đồ vật)`;
          } else {
            this.promptTargetName.innerHTML =
              `${gd ? gd.chinese + ' (' + gd.pinyin + ')' : ''} • [E / Click] ${tz ? tz.icon + ' Tới ' + tz.name : 'Đi tiếp'}`;
          }
        } else {
          const found = this.state.discovered.has(ud.vocabId);
          this.promptTargetName.innerHTML =
            `${found ? getSvgIcon('ui_check', { size: 16 }) : getSvgIcon('ui_sparkles', { size: 16 })} ${ud.vocabData.chinese} (${ud.vocabData.nameVi})`;
        }
        this.state.soundFX.playHover();
      }
      return;
    }

    if (this.targetedObject !== null) {
      if (this.targetedObject) this.setTargetHighlight(this.targetedObject, false);
      this.targetedObject = null;
      this.crosshair.classList.remove('active');
      this.promptEl.classList.remove('visible');
    }
  }

  updateAnimations(delta) {
    // 0. Update NPCs breathing and subtle gestures
    if (this.npcManager) {
      this.npcManager.update(delta);
    }

    // Props động của từng khu vực (đèn giao thông, đài phun nước, xích đu, chim…)
    if (this.animatedProps && this.animatedProps.length) {
      this.animatedProps.forEach(p => {
        if (typeof p.update === 'function') p.update(delta);
      });
    }

    if (this.clockHandSec) {
      this.clockHandSec.rotation.z -= delta * 1.5;
    }

    this.smokeParticles.forEach(p => {
      p.position.y += p.userData.speedY;
      p.material.opacity = Math.max(0, 0.3 - (p.position.y - p.userData.initY) * 0.8);
      if (p.position.y > p.userData.initY + 0.35) {
        // quay lại đúng miệng cốc của khu vực hiện tại (mỗi scene tự khai báo initX/initZ)
        const baseX = p.userData.initX !== undefined ? p.userData.initX : 0.65;
        const baseZ = p.userData.initZ !== undefined ? p.userData.initZ : -3.5;
        p.position.y = p.userData.initY;
        p.position.x = baseX + (Math.random() - 0.5) * 0.04;
        p.position.z = baseZ + (Math.random() - 0.5) * 0.04;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Luôn rút delta để đồng hồ không dồn thời gian khi tạm dừng
    const delta = Math.min(this.clock.getDelta(), 0.1);
    if (this.isSceneVisible === false) return;

    this.updatePlayer(delta);
    this.updateRaycaster();
    this.updateAnimations(delta);

    this.renderer.render(this.scene, this.camera);
  }
}
