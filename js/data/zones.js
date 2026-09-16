/**
 * ============================================================================
 * ZONE DEFINITIONS & 3D MODEL MAPPINGS
 * ============================================================================
 */

import {
  BEDROOM_VOCAB,
  LIVING_VOCAB,
  KITCHEN_VOCAB,
  STREET_VOCAB,
  STORE_VOCAB,
  PARK_VOCAB
} from './vocabData.js';
import { getSvgIcon } from '../ui/icons.js';

/**
 * LỘ TRÌNH KHÁM PHÁ (tuyến tính, mỗi chặng mở khoá chặng kế tiếp):
 *   Phòng ngủ → Phòng khách → Bếp → (quay lại Phòng khách)
 *   → Cửa lớn ra Đại lộ → Cửa hàng tiện lợi → (ra lại Đại lộ) → Công viên
 * Đại lộ là con đường nối các địa điểm trong thành phố; các địa điểm dọc
 * đường chỉ lần lượt mở cửa khi người chơi hoàn thành địa điểm trước đó.
 */
export const ZONE_ORDER = ['bedroom', 'living', 'kitchen', 'street', 'store', 'park'];

export const ZONES = {
  bedroom: {
    id: 'bedroom',
    name: 'Phòng Ngủ',
    chinese: '臥室',
    pinyin: 'wò shì',
    icon: getSvgIcon('zone_bedroom', { size: 22 }),
    iconSvg: getSvgIcon('zone_bedroom', { size: 22 }),
    items: Object.keys(BEDROOM_VOCAB),
    next: 'living',
    prev: null,
    nextHint: 'Mở cửa phòng ngủ để bước sang phòng khách.',
    exitGate: 'door',
    exitLabel: 'Sang Phòng Khách',
    objective: 'Bạn vừa thức dậy. Khám phá toàn bộ 20 đồ vật trong phòng ngủ để mở cửa bước sang phòng khách.',
    // Đứng cạnh giường sau khi thức dậy: collider giường là x 2.55..4.95,
    // cộng bán kính người chơi 0.32 nên điểm đứng phải có x < 2.23
    spawn: { x: 1.75, z: -2.6, yaw: Math.PI * 0.75 },
    spawnsFrom: {
      living: { x: 0, z: 3.9, yaw: 0 }
    }
  },
  living: {
    id: 'living',
    name: 'Phòng Khách',
    chinese: '客廳',
    pinyin: 'kè tīng',
    icon: getSvgIcon('zone_living', { size: 22 }),
    iconSvg: getSvgIcon('zone_living', { size: 22 }),
    items: Object.keys(LIVING_VOCAB),
    next: 'kitchen',
    prev: 'bedroom',
    nextHint: 'Lối bên phải phòng khách đã mở — sang phòng bếp nào!',
    exitGate: 'kitchen_door',
    exitLabel: 'Sang Phòng Bếp',
    objective: 'Khám phá 12 đồ đạc trong phòng khách để mở lối sang phòng bếp. Khi xong cả bếp, cửa lớn ra thành phố mới mở.',
    spawn: { x: 0, z: 3.4, yaw: 0 },
    spawnsFrom: {
      bedroom: { x: -3.0, z: 3.9, yaw: 0 },
      kitchen: { x: 3.6, z: 2.6, yaw: Math.PI / 2 },
      street: { x: 0, z: 3.9, yaw: 0 }
    }
  },
  kitchen: {
    id: 'kitchen',
    name: 'Bếp Ăn',
    chinese: '廚房',
    pinyin: 'chú fáng',
    icon: getSvgIcon('zone_kitchen', { size: 22 }),
    iconSvg: getSvgIcon('zone_kitchen', { size: 22 }),
    items: Object.keys(KITCHEN_VOCAB),
    next: 'street',
    prev: 'living',
    nextHint: 'Quay lại phòng khách — cửa lớn ra thành phố vừa mở khoá.',
    exitGate: 'back_door',
    exitLabel: 'Quay Lại Phòng Khách',
    objective: 'Khám phá 10 đồ dùng nhà bếp. Xong rồi hãy quay lại phòng khách — cửa lớn ra thành phố sẽ mở.',
    spawn: { x: 3.4, z: 2.7, yaw: Math.PI / 2 },
    spawnsFrom: {
      living: { x: 3.4, z: 2.7, yaw: Math.PI / 2 }
    }
  },
  street: {
    id: 'street',
    name: 'Đại Lộ Thành Phố',
    chinese: '街道',
    pinyin: 'jiē dào',
    icon: getSvgIcon('zone_street', { size: 22 }),
    iconSvg: getSvgIcon('zone_street', { size: 22 }),
    items: Object.keys(STREET_VOCAB),
    outdoor: true,
    next: 'store',
    prev: 'living',
    exitGate: 'store_door',
    exitLabel: 'Vào Cửa Hàng Tiện Lợi',
    // Đại lộ là con đường nối các địa điểm (hub), không phải màn phải vượt qua:
    // đồ vật dọc phố chỉ là từ vựng tuỳ chọn, nhưng các địa điểm hai bên đường
    // chỉ lần lượt mở cửa theo đúng lộ trình khám phá.
    isHub: true,
    objective: 'Con đường dẫn bạn đi khắp thành phố. Điểm dừng đầu tiên: cửa hàng tiện lợi vừa mở cửa. Đồ vật dọc phố là từ vựng tuỳ chọn.',
    spawn: { x: 7.0, z: 17.2, yaw: 0 },
    spawnsFrom: {
      living: { x: 7.0, z: 17.2, yaw: 0 },
      store: { x: 5.6, z: -4.0, yaw: Math.PI / 2 },
      park: { x: -6.2, z: -20.0, yaw: Math.PI }
    }
  },
  store: {
    id: 'store',
    name: 'Cửa Hàng Tiện Lợi',
    chinese: '便利商店',
    pinyin: 'biàn lì shāng diàn',
    icon: getSvgIcon('zone_store', { size: 22 }),
    iconSvg: getSvgIcon('zone_store', { size: 22 }),
    items: Object.keys(STORE_VOCAB),
    next: 'park',
    prev: 'street',
    nextHint: 'Ra lại đại lộ — cổng công viên vừa mở cho bạn vào.',
    exitGate: 'back_door',
    exitLabel: 'Ra Lại Đại Lộ',
    objective: 'Khám phá 10 món hàng trong cửa hàng tiện lợi. Xong rồi ra lại đại lộ — cổng công viên sẽ mở.',
    spawn: { x: 0, z: 3.5, yaw: 0 },
    spawnsFrom: {
      street: { x: 0, z: 3.5, yaw: 0 }
    }
  },
  park: {
    id: 'park',
    name: 'Công Viên Trung Tâm',
    chinese: '公園',
    pinyin: 'gōng yuán',
    icon: getSvgIcon('zone_park', { size: 22 }),
    iconSvg: getSvgIcon('zone_park', { size: 22 }),
    items: Object.keys(PARK_VOCAB),
    outdoor: true,
    next: null,
    prev: 'street',
    exitGate: 'back_door',
    exitLabel: 'Quay Lại Đại Lộ',
    objective: 'Điểm đến cuối hành trình — khám phá trọn vẹn công viên trung tâm.',
    spawn: { x: 0, z: 12.5, yaw: 0 },
    spawnsFrom: {
      street: { x: 0, z: 12.5, yaw: 0 }
    }
  }
};

/** Khu vực ngoài trời dùng ánh sáng/tầm nhìn/tầm với khác khu vực trong nhà. */
export function isOutdoorZone(zoneId) {
  return !!(ZONES[zoneId] && ZONES[zoneId].outdoor);
}

export const TOTAL_VOCAB_COUNT = ZONE_ORDER.reduce((sum, z) => sum + ZONES[z].items.length, 0);

// --- 3D MODEL FILES ---
export const AVATAR_FILES = {
  man: 'player-man.glb',
  woman: 'player-woman.glb'
};

export function getSelectedAvatarFile() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('3d_vocab_quest_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedAvatar && AVATAR_FILES[parsed.selectedAvatar]) {
          return AVATAR_FILES[parsed.selectedAvatar];
        }
      }
    }
  } catch (e) { /* ignore */ }
  return AVATAR_FILES.man; // Mặc định là nam
}

export const MODEL_FILES = {
  // Study Room / Bedroom — bộ model tách từ phòng ngủ hiện đại (xem tools/model-splitter)
  desk: 'bedroom/desk.glb',
  chair: 'bedroom/office-chair.glb',
  lamp: 'bedroom/table-lamp.glb',
  bookshelf: 'bedroom/wardrobe.glb',      // tủ kệ treo tường có sách + figure
  plant: 'bedroom/plant-monstera-pot.glb',
  bed: 'bedroom/bed.glb',
  window: 'bedroom/window.glb',
  coffee: 'bedroom/cup-blue.glb',
  mini_plant: 'bedroom/plant-bush-small.glb',
  monitor: 'bedroom/monitor.glb',
  keyboard: 'bedroom/keyboard.glb',
  curtain: 'bedroom/curtain.glb',
  rug: 'bedroom/rug.glb',
  // Đồ trang trí phòng ngủ (không phải từ vựng)
  bd_curtainTied: 'bedroom/curtain-tied.glb',
  bd_mouse: 'bedroom/mouse.glb',
  bd_mousePad: 'bedroom/mouse-pad.glb',
  bd_nightstand: 'bedroom/nightstand-cube-1.glb',
  bd_nightstand2: 'bedroom/nightstand-cube-2.glb',
  bd_cupRed: 'bedroom/cup-red.glb',
  bd_books1: 'bedroom/books-stack-1.glb',
  bd_books2: 'bedroom/books-stack-2.glb',
  bd_bookOpen: 'bedroom/book-open.glb',
  bd_toyCar: 'bedroom/toy-car.glb',
  bd_toyPenguin: 'bedroom/toy-penguin.glb',
  bd_toyRocket: 'bedroom/toy-rocket.glb',
  bd_toyOctopus: 'bedroom/toy-octopus.glb',
  bd_paintingPortrait: 'bedroom/painting-portrait.glb',
  bd_paintingDark: 'bedroom/painting-dark.glb',
  bd_ceilingFan: 'bedroom/ceiling-fan.glb',
  bd_plantPothos: 'bedroom/plant-pothos-hanging.glb',
  bd_plantFicus: 'bedroom/plant-ficus-desk.glb',
  bd_wallShelf: 'bedroom/wall-shelf.glb',
  // Living Room
  lr_sofa: 'loungeSofaLong.glb',
  lr_armchair: 'loungeChair.glb',
  lr_coffeeTable: 'tableCoffeeGlass.glb',
  lr_tvCabinet: 'cabinetTelevision.glb',
  lr_tv: 'televisionModern.glb',
  lr_floorLamp: 'lampSquareFloor.glb',
  lr_bookcase: 'bookcaseOpen.glb',
  lr_plant: 'pottedPlant.glb',
  lr_plantSmall: 'plantSmall1.glb',
  lr_plantSmall2: 'plantSmall2.glb',
  lr_plantSmall3: 'plantSmall3.glb',
  lr_books: 'books.glb',
  lr_bear: 'bear.glb',
  lr_radio: 'radio.glb',
  lr_speakerSmall: 'speakerSmall.glb',
  lr_tvVintage: 'televisionVintage.glb',
  lr_lampTable: 'lampRoundTable.glb',
  lr_speaker: 'speaker.glb',
  lr_coatRack: 'coatRackStanding.glb',
  lr_ceilingFan: 'ceilingFan.glb',
  lr_rug: 'rugRectangle.glb',
  lr_sideTable: 'sideTable.glb',
  lr_pillow: 'pillow.glb',
  lr_door: 'doorway.glb',
  // Kitchen
  kt_fridge: 'kitchenFridgeLarge.glb',
  kt_stove: 'kitchenStove.glb',
  kt_sink: 'kitchenSink.glb',
  kt_microwave: 'kitchenMicrowave.glb',
  kt_cabinet: 'kitchenCabinet.glb',
  kt_cabinetDrawer: 'kitchenCabinetDrawer.glb',
  kt_cabinetUpper: 'kitchenCabinetUpper.glb',
  kt_cabinetUpperDouble: 'kitchenCabinetUpperDouble.glb',
  kt_coffeeMachine: 'kitchenCoffeeMachine.glb',
  kt_toaster: 'toaster.glb',
  kt_blender: 'kitchenBlender.glb',
  kt_table: 'table.glb',
  kt_chair: 'chairRounded.glb',
  kt_trashcan: 'trashcan.glb',
  kt_hood: 'hoodModern.glb',
  kt_bar: 'kitchenBar.glb',
  kt_stool: 'stoolBar.glb',
  kt_rug: 'rugDoormat.glb',
  // Street & Park
  st_trashcan: 'trashcan.glb',
  pk_plant: 'plantSmall1.glb',
  // Convenience Store
  sh_trashcan: 'trashcan.glb',
  sh_stool: 'stoolBar.glb',
  sh_rug: 'rugDoormat.glb',
  // Player avatar
  player_avatar: getSelectedAvatarFile()
};

export const BEDROOM_MODEL_IDS = [
  'desk', 'chair', 'lamp', 'bookshelf', 'plant', 'bed',
  'window', 'coffee', 'mini_plant', 'monitor', 'keyboard', 'curtain', 'rug'
].concat(Object.keys(MODEL_FILES).filter(k => k.startsWith('bd_')));

export const ZONE_MODEL_IDS = {
  bedroom: BEDROOM_MODEL_IDS,
  living:  Object.keys(MODEL_FILES).filter(k => k.startsWith('lr_')),
  kitchen: Object.keys(MODEL_FILES).filter(k => k.startsWith('kt_')),
  street:  Object.keys(MODEL_FILES).filter(k => k.startsWith('st_')),
  store:   Object.keys(MODEL_FILES).filter(k => k.startsWith('sh_')),
  park:    Object.keys(MODEL_FILES).filter(k => k.startsWith('pk_'))
};

export const AVATAR_RIG_SPECS = {
  man: {
    targetHeight: 1.62,
    faceYaw: -Math.PI / 2,
    ankleY: 0.050,
    kneeY: 0.185,
    hipY: 0.300,
    spineY: 0.450,
    chestY: 0.555,
    shoulderY: 0.660,
    neckY: 0.720,
    legX: 0.059,
    shoulderX: 0.115,
    elbowX: 0.300,
    wristX: 0.440,
    handX: 0.528,
    armZ: 0.032,
    footZ: 0.086,
    restArmRotZ: 1.40,
    weightFalloff: 4.0,
    weightEpsilon: 0.012
  },
  woman: {
    targetHeight: 1.62,
    faceYaw: -Math.PI / 2,
    ankleY: 0.055,
    kneeY: 0.200,
    hipY: 0.364,
    spineY: 0.480,
    chestY: 0.600,
    shoulderY: 0.728,
    neckY: 0.765,
    legX: 0.055,
    shoulderX: 0.120,
    elbowX: 0.285,
    wristX: 0.415,
    handX: 0.496,
    armZ: -0.053,
    footZ: 0.00,
    restArmRotZ: 1.36,
    weightFalloff: 4.5,
    weightEpsilon: 0.012
  }
};
