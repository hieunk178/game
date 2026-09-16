import { SVG_ICONS, getSvgIcon } from './js/ui/icons.js';
import { ROOM_VOCAB_DATA, TOTAL_VOCAB_COUNT } from './js/data/vocabData.js';
import { ZONES, ZONE_ORDER } from './js/data/zones.js';

console.log('====================================================');
console.log('🧪 TESTING SVG ICON SYSTEM & EMOJI REPLACEMENT');
console.log('====================================================');

// 1. Check SVG Icon Registry
const totalIcons = Object.keys(SVG_ICONS).length;
console.log(`Total SVG icons registered in SVG_ICONS: ${totalIcons}`);
if (totalIcons < 60) {
  throw new Error(`Expected at least 60 SVG icons, got ${totalIcons}`);
}

// 2. Test getSvgIcon helper
const testDesk = getSvgIcon('desk', { size: 24, className: 'test-icon' });
if (!testDesk.includes('<svg') || !testDesk.includes('test-icon') || !testDesk.includes('width="24"')) {
  throw new Error('getSvgIcon failed to generate correct SVG string');
}
console.log('✅ getSvgIcon helper function works correctly');

// 3. Test Zones SVG icons
ZONE_ORDER.forEach(zoneId => {
  const zone = ZONES[zoneId];
  if (!zone.icon || !zone.icon.includes('<svg')) {
    throw new Error(`Zone ${zoneId} does not have a valid SVG icon: ${zone.icon}`);
  }
});
console.log(`✅ All ${ZONE_ORDER.length} zones have valid vector SVG icons`);

// 4. Test all vocab items (phai khop TOTAL_VOCAB_COUNT)
const items = Object.values(ROOM_VOCAB_DATA).filter(it => !it.isGate);
if (items.length !== TOTAL_VOCAB_COUNT) {
  throw new Error(`Expected ${TOTAL_VOCAB_COUNT} vocab items, got ${items.length}`);
}

items.forEach(item => {
  if (!item.icon || !item.icon.includes('<svg')) {
    throw new Error(`Item ${item.id} does not have a valid SVG icon: ${item.icon}`);
  }
});
console.log(`✅ All ${items.length} vocabulary items have valid vector SVG icons`);

// 5. Test Gates
const gates = Object.values(ROOM_VOCAB_DATA).filter(it => it.isGate);
gates.forEach(gate => {
  if (!gate.icon || !gate.icon.includes('<svg')) {
    throw new Error(`Gate ${gate.id} does not have a valid SVG icon: ${gate.icon}`);
  }
});
console.log(`✅ All ${gates.length} gate items have valid vector SVG icons`);

console.log('====================================================');
console.log('🎉 SVG ICON SYSTEM VERIFICATION PASSED (100%)');
console.log('====================================================');
