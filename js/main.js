/**
 * ============================================================================
 * MAIN APPLICATION BOOTSTRAPPER (ES6 MODULE ENTRY)
 * ============================================================================
 */

import { VocabRoomGame } from './gameEngine.js';
import { ROOM_VOCAB_DATA, TOTAL_VOCAB_COUNT } from './data/vocabData.js';
import { ZONES, ZONE_ORDER } from './data/zones.js';

window.addEventListener('DOMContentLoaded', () => {
  window.vocabGame = new VocabRoomGame();

  // Global variables for console debugging / external inspection
  window.VOCAB_DATA = ROOM_VOCAB_DATA;
  window.ZONES = ZONES;
  window.ZONE_ORDER = ZONE_ORDER;
  window.TOTAL_VOCAB_COUNT = TOTAL_VOCAB_COUNT;
});
