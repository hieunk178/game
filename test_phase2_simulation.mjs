/**
 * ============================================================================
 * PHASE 2 AUTOMATED TEST SUITE: EDTECH & GAMEPLAY ENHANCEMENTS
 * ============================================================================
 */

// Node.js DOM & Three.js Environment Mocks
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
      fillText: () => {},
      measureText: () => ({ width: 50 }),
      save: () => {},
      restore: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} })
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
    this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } };
    this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } };
    this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }, setScalar(s) { this.x = s; this.y = s; this.z = s; return this; } };
    this.userData = {};
    this.isMesh = true;
  }
  add(child) { this.children.push(child); child.parent = this; return this; }
  remove(child) { const idx = this.children.indexOf(child); if (idx !== -1) this.children.splice(idx, 1); }
  traverse(cb) {
    cb(this);
    for (const c of [...this.children]) if (c && c.traverse) c.traverse(cb);
  }
}

global.THREE = {
  Scene: MockObject3D,
  Group: MockObject3D,
  Mesh: class extends MockObject3D { constructor(geo, mat) { super(); this.geometry = geo; this.material = mat; } },
  BoxGeometry: class {},
  SphereGeometry: class {},
  CylinderGeometry: class {},
  CircleGeometry: class {},
  MeshStandardMaterial: class { constructor(o) { Object.assign(this, o); } },
  MeshBasicMaterial: class { constructor(o) { Object.assign(this, o); } }
};

import { SRSEngine, MASTERY_LEVELS } from './js/core/srsEngine.js';
import { QuestManager } from './js/core/questSystem.js';
import { QUESTS_DATA, ACHIEVEMENTS_DATA } from './js/data/questsData.js';
import { NPCS_DATA } from './js/data/dialogueData.js';
import { MiniGamesEngine } from './js/ui/miniGames.js';
import { NPCManager } from './js/scenes/npcManager.js';
import { GameState } from './js/core/gameState.js';
import { ROOM_VOCAB_DATA, TOTAL_VOCAB_COUNT } from './js/data/vocabData.js';

let passedTests = 0;
const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(msg);
  }
  passedTests++;
};

console.log('====================================================');
console.log('🧪 RUNNING PHASE 2 AUTOMATED TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. TEST SRS (SPACED REPETITION SM-2)
// ----------------------------------------------------
console.log('--- 1. TESTING SRS ENGINE (SUPERMEMO SM-2) ---');
const srs = new SRSEngine();
const rec0 = srs.getRecord('desk');
assert(rec0.interval === 0, 'Initial interval must be 0');
assert(rec0.repetition === 0, 'Initial repetition must be 0');
assert(rec0.easeFactor === 2.5, 'Default easeFactor must be 2.5');
assert(rec0.masteryLevel === MASTERY_LEVELS.NEW, 'Initial mastery level must be NEW');

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

// Review 1: Good recall (q=4)
const rec1 = srs.processReview('desk', 4, now);
assert(rec1.interval === 1, 'First successful review interval must be 1 day');
assert(rec1.repetition === 1, 'First repetition must be 1');
assert(rec1.masteryLevel === MASTERY_LEVELS.LEARNING, 'Mastery level after 1 rep is LEARNING');

// Review 2: Easy recall (q=5) 1 day later
const rec2 = srs.processReview('desk', 5, now + 1 * oneDayMs);
assert(rec2.interval === 3, 'Second successful review interval must be 3 days');
assert(rec2.repetition === 2, 'Second repetition must be 2');
assert(rec2.masteryLevel === MASTERY_LEVELS.REVIEW, 'Mastery level after 2 reps is REVIEW');

// Review 3: Easy recall (q=5) 3 days later
const rec3 = srs.processReview('desk', 5, now + 4 * oneDayMs);
assert(rec3.interval === 7, 'Third successful review interval must be 7 days');
assert(rec3.repetition === 3, 'Third repetition must be 3');

// Review 4: Easy recall (q=5) 7 days later -> reaches Mastery
const rec4 = srs.processReview('desk', 5, now + 11 * oneDayMs);
assert(rec4.interval >= 18, 'Fourth interval should be multiplied by EF');
assert(rec4.repetition === 4, 'Fourth repetition must be 4');

// Test Due Items filtering
const dueNow = srs.getDueItems(['desk'], now + 2 * oneDayMs);
assert(dueNow.length === 0, 'desk should not be due before nextReview');
const dueLater = srs.getDueItems(['desk'], now + 40 * oneDayMs);
assert(dueLater.length === 1 && dueLater[0] === 'desk', 'desk must be due after nextReview passes');

// Test Fail Reset (q=1)
const recFail = srs.processReview('desk', 1, now + 40 * oneDayMs);
assert(recFail.interval === 1, 'Failed review must reset interval to 1');
assert(recFail.repetition === 0, 'Failed review must reset repetition to 0');
console.log('✅ SRS SM-2 Algorithm & Due Item Filtering: PASSED');

// ----------------------------------------------------
// 2. TEST QUESTS & ACHIEVEMENTS SYSTEM
// ----------------------------------------------------
console.log('\n--- 2. TESTING QUESTS & ACHIEVEMENTS SYSTEM ---');
const qm = new QuestManager();
assert(QUESTS_DATA.length >= 10, `Expected at least 10 quests, found ${QUESTS_DATA.length}`);
assert(ACHIEVEMENTS_DATA.length >= 5, `Expected at least 5 achievements, found ${ACHIEVEMENTS_DATA.length}`);

// Simulate discovering bedroom items
const discovered = new Set(['desk', 'chair', 'laptop', 'coffee', 'clock']);
const newQuests = qm.evaluateQuests({
  discoveredSet: discovered,
  zoneStats: { bedroom: 5 },
  currentZone: 'bedroom'
});

assert(newQuests.some(q => q.id === 'q_bedroom_morning'), 'q_bedroom_morning quest must be completed');
assert(qm.completedQuests.has('q_bedroom_morning'), 'Quest must be registered as completed');

// Claim quest reward
const claimRes = qm.claimQuest('q_bedroom_morning');
assert(claimRes !== null, 'Claim result should not be null');
assert(claimRes.rewardXP === 150, 'Reward XP must be 150');
assert(claimRes.badge === '🌅 Khởi Đầu Mới', 'Badge must match quest data');
assert(qm.xp === 150, 'Player XP must be 150');
assert(qm.level >= 1, 'Player level must be at least 1');

// Double claiming should fail
const secondClaim = qm.claimQuest('q_bedroom_morning');
assert(secondClaim === null, 'Double claim must return null');

// Achievements evaluation
const newAchs = qm.evaluateAchievements({
  totalDiscovered: 1,
  quizStreak: 5,
  srsMasteredCount: 10,
  sentenceCount: 5
});
assert(newAchs.some(a => a.id === 'ach_first_discovery'), 'ach_first_discovery unlocked');
assert(newAchs.some(a => a.id === 'ach_streak_5'), 'ach_streak_5 unlocked');
assert(newAchs.some(a => a.id === 'ach_srs_master_10'), 'ach_srs_master_10 unlocked');
console.log('✅ Quests Progression, XP Leveling & Achievements: PASSED');

// ----------------------------------------------------
// 3. TEST NPC & BRANCHING DIALOGUE SCRIPTS
// ----------------------------------------------------
console.log('\n--- 3. TESTING NPC & BRANCHING DIALOGUES ---');
const npcs = Object.values(NPCS_DATA);
assert(npcs.length === 4, 'Must have exactly 4 NPCs');

npcs.forEach(npc => {
  assert(npc.id && npc.name && npc.zone, `NPC ${npc.id} must have id, name, zone`);
  assert(npc.dialogueTree && npc.dialogueTree.start, `NPC ${npc.id} must have a start dialogue node`);

  // Traverse dialogue tree to verify no broken node references
  const visited = new Set();
  const queue = ['start'];

  while (queue.length > 0) {
    const nodeKey = queue.shift();
    if (visited.has(nodeKey)) continue;
    visited.add(nodeKey);

    const node = npc.dialogueTree[nodeKey];
    assert(node !== undefined, `NPC ${npc.id} referenced missing node: ${nodeKey}`);
    assert(node.textCn && node.textPinyin && node.textVi, `Node ${nodeKey} must have textCn, textPinyin, textVi`);

    if (node.options && Array.isArray(node.options)) {
      node.options.forEach(opt => {
        assert(opt.text && opt.nextNode, `Option in node ${nodeKey} must have text and nextNode`);
        assert(npc.dialogueTree[opt.nextNode] !== undefined, `Target node ${opt.nextNode} must exist in tree`);
        queue.push(opt.nextNode);
      });
    }
  }
  console.log(`  ✓ NPC [${npc.name}] dialogue tree has ${visited.size} verified connected nodes`);
});
console.log('✅ NPC Branching Dialogue Trees: ALL NODES VALID & CONNECTED');

// ----------------------------------------------------
// 4. TEST MINI-GAMES ENGINE
// ----------------------------------------------------
console.log('\n--- 4. TESTING MINI-GAMES ENGINE ---');
const miniEngine = new MiniGamesEngine({});

// 4.1 Sentence Builder
const sampleItem = ROOM_VOCAB_DATA.desk; // "這張桌子很乾淨，適合讀書。"
const challenge = miniEngine.createSentenceChallenge(sampleItem);
assert(challenge.tokens.length >= 2, 'Tokens array must have at least 2 tokens');
assert(challenge.targetSentence.length > 0, 'Target sentence must not be empty');

// Validation test
const correctReconstructed = challenge.originalTokens;
assert(miniEngine.validateSentence(correctReconstructed, challenge.targetSentence), 'Sentence builder validation should pass for original tokens');
assert(!miniEngine.validateSentence(['sai', 'hoan_toan'], challenge.targetSentence), 'Sentence builder validation must fail for wrong order');

// 4.2 Tone Challenge
const toneChallenge = miniEngine.createToneChallenge(sampleItem);
assert(toneChallenge.options.length === 4, 'Tone challenge must provide 4 options');
assert(toneChallenge.correctIndex >= 0 && toneChallenge.correctIndex < 4, 'correctIndex must be between 0 and 3');
assert(toneChallenge.options[toneChallenge.correctIndex] === sampleItem.pinyin, 'Option at correctIndex must match true pinyin');

// 4.3 Audio Echo Quest
const echoHunt = miniEngine.createAudioEchoHunt(Object.values(ROOM_VOCAB_DATA).slice(0, 10));
assert(echoHunt !== null, 'Echo hunt target must be generated');
assert(echoHunt.targetId && echoHunt.chinese, 'Echo hunt must have targetId and chinese text');
console.log('✅ Mini-Games Engine (Sentence Builder, Tone Challenge, Audio Echo): PASSED');

// ----------------------------------------------------
// 5. TEST GAMESTATE INTEGRATION (PERSISTENCE & FLOW)
// ----------------------------------------------------
console.log('\n--- 5. TESTING GAMESTATE INTEGRATION & PERSISTENCE ---');
const gameState = new GameState();

// Discover 10 items
const vocabKeys = Object.keys(ROOM_VOCAB_DATA).slice(0, 10);
vocabKeys.forEach(k => gameState.markDiscovered(k));

// Record quizzes
gameState.recordQuizResult('desk', true, 5);
gameState.recordQuizResult('chair', true, 4);
gameState.recordQuizResult('laptop', false, 1);

// Record sentence success & NPC dialogue
gameState.recordSentenceSuccess('desk');
gameState.recordDialogueComplete('npc_teacher_wang');

// Verify state
assert(gameState.quizStats.total === 3, 'quizStats.total must be 3');
assert(gameState.quizStats.correct === 2, 'quizStats.correct must be 2');
assert(gameState.sentenceCount === 1, 'sentenceCount must be 1');
assert(gameState.completedDialogues.has('npc_teacher_wang'), 'npc_teacher_wang dialogue marked complete');

// Verify serialization & deserialization
const savedJson = global.localStorage.getItem('3d_vocab_quest_data');
assert(savedJson !== null, 'LocalStorage must have saved data');

const loadedState = new GameState();
assert(loadedState.totalFound() === 10, 'Loaded state must preserve 10 discovered items');
assert(loadedState.sentenceCount === 1, 'Loaded state must preserve sentence count');
assert(loadedState.completedDialogues.has('npc_teacher_wang'), 'Loaded state must preserve completed dialogue');
console.log('✅ GameState SRS & Quest Persistence: PASSED');

// ----------------------------------------------------
// 6. TEST NPC 3D MESH GENERATION & TICKS
// ----------------------------------------------------
console.log('\n--- 6. TESTING NPC 3D SCENE MANAGER ---');
const mockGame = {
  scene: new MockObject3D(),
  interactiveObjects: [],
  colliders: []
};
const npcMgr = new NPCManager(mockGame);
npcMgr.spawnNpcsForZone('living');
assert(npcMgr.activeNpcs.length === 1, 'Living room must spawn 1 NPC (Teacher Wang)');
assert(mockGame.interactiveObjects.length === 1, 'NPC must be registered as interactive object');
assert(mockGame.colliders.length === 1, 'NPC must have a collision box');

// Test animation tick
npcMgr.update(0.016);
assert(npcMgr.activeNpcs[0].time > 0, 'NPC animation timer must advance');
console.log('✅ NPC 3D Mesh Generation & Animation Ticks: PASSED');

console.log('\n====================================================');
console.log(`🎉 ALL ${passedTests} TEST ASSERTIONS PASSED SUCCESSFULLY!`);
console.log('====================================================');
