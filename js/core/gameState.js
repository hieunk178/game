/**
 * ============================================================================
 * GAME STATE MANAGER — TIẾN ĐỘ THEO TỪNG KHU VỰC
 * ============================================================================
 */

import { SoundFX } from './audio.js';
import { SRSEngine } from './srsEngine.js';
import { QuestManager } from './questSystem.js';
import { ROOM_VOCAB_DATA, TOTAL_VOCAB_COUNT } from '../data/vocabData.js';
import { ZONES, ZONE_ORDER } from '../data/zones.js';

export class GameState {
  constructor() {
    this.discovered = new Set();
    this.score = 0;
    this.quizStats = { total: 0, correct: 0 };
    this.quizStreak = 0;
    this.sentenceCount = 0;
    this.completedDialogues = new Set();
    this.activeItem = null;
    this.isPaused = false;
    this.soundFX = new SoundFX();
    this.sensitivity = 5;
    this.langMode = 'both';
    this.cameraMode = 'third_person';

    // Engine gắn callback vào đây để hiện thông báo khi xong nhiệm vụ/thành tựu
    this.onProgress = null;

    // Hành trình: khu vực hiện tại & những khu vực đã mở khoá
    this.currentZone = 'bedroom';
    this.unlockedZones = new Set(['bedroom']);
    this.hasWokenUp = false;
    this.selectedAvatar = null; // 'man' | 'woman' | null

    // Giai đoạn 2: SRS Engine & Quest System
    this.srs = new SRSEngine();
    this.questManager = new QuestManager();

    this.loadStorage();
  }

  loadStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = localStorage.getItem('3d_vocab_quest_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.discovered)) {
          parsed.discovered.forEach(id => this.discovered.add(id));
        }
        this.score = parsed.score || 0;
        this.quizStats = parsed.quizStats || { total: 0, correct: 0 };
        this.quizStreak = parsed.quizStreak || 0;
        this.sentenceCount = parsed.sentenceCount || 0;
        if (Array.isArray(parsed.completedDialogues)) {
          parsed.completedDialogues.forEach(id => this.completedDialogues.add(id));
        }
        if (parsed.selectedAvatar) this.selectedAvatar = parsed.selectedAvatar;

        // Cài đặt người chơi: trước đây không hề được lưu nên reset mỗi lần tải lại
        if (typeof parsed.sensitivity === 'number') {
          this.sensitivity = Math.min(10, Math.max(1, parsed.sensitivity));
        }
        if (typeof parsed.langMode === 'string') this.langMode = parsed.langMode;
        if (typeof parsed.cameraMode === 'string') this.cameraMode = parsed.cameraMode;
        if (typeof parsed.soundEnabled === 'boolean') this.soundFX.enabled = parsed.soundEnabled;
        if (Array.isArray(parsed.unlockedZones)) {
          parsed.unlockedZones.forEach(z => { if (ZONES[z]) this.unlockedZones.add(z); });
        }
        if (parsed.currentZone && ZONES[parsed.currentZone]) {
          this.currentZone = parsed.currentZone;
        }
        if (parsed.srsData) {
          this.srs.importData(parsed.srsData);
        }
        if (parsed.questData) {
          this.questManager.importData(parsed.questData);
        }
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.syncUnlockedZones();
    this.evaluateQuestsAndAchievements();
  }

  saveStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem('3d_vocab_quest_data', JSON.stringify({
        discovered: Array.from(this.discovered),
        score: this.score,
        quizStats: this.quizStats,
        quizStreak: this.quizStreak,
        sentenceCount: this.sentenceCount,
        completedDialogues: Array.from(this.completedDialogues),
        currentZone: this.currentZone,
        unlockedZones: Array.from(this.unlockedZones),
        selectedAvatar: this.selectedAvatar,
        sensitivity: this.sensitivity,
        langMode: this.langMode,
        cameraMode: this.cameraMode,
        soundEnabled: this.soundFX.enabled,
        srsData: this.srs.exportData(),
        questData: this.questManager.exportData(),
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  evaluateQuestsAndAchievements() {
    const zoneStats = {};
    ZONE_ORDER.forEach(z => {
      zoneStats[z] = this.zoneFoundCount(z);
    });

    const context = {
      discoveredSet: this.discovered,
      zoneStats,
      currentZone: this.currentZone,
      completedDialogues: this.completedDialogues
    };

    // Game không có màn hình "nhận thưởng" nên nhiệm vụ trước đây hoàn thành
    // xong là hết — rewardXP/rewardScore khai báo trong dữ liệu chẳng ai cộng.
    // Tự nhận ngay qua claimQuest(), hàm này tự chặn nhận trùng.
    const claimedQuests = [];
    this.questManager.evaluateQuests(context).forEach(quest => {
      const reward = this.questManager.claimQuest(quest.id);
      if (!reward) return;
      this.score += reward.rewardScore || 0;
      claimedQuests.push(quest);
    });
    const newQuests = claimedQuests;

    const srsStats = this.srs.getStats(TOTAL_VOCAB_COUNT);

    const newAch = this.questManager.evaluateAchievements({
      totalDiscovered: this.totalFound(),
      totalVocab: TOTAL_VOCAB_COUNT,
      quizStreak: this.quizStreak,
      srsMasteredCount: srsStats.masteredCount,
      sentenceCount: this.sentenceCount
    });

    if (this.onProgress && (newQuests.length || newAch.length)) {
      this.onProgress({ newQuests, newAch });
    }

    return { newQuests, newAch };
  }

  // --- TIẾN ĐỘ THEO KHU VỰC ---
  zoneFoundCount(zoneId) {
    const zone = ZONES[zoneId];
    if (!zone) return 0;
    return zone.items.filter(id => this.discovered.has(id)).length;
  }

  zoneTotal(zoneId) {
    const zone = ZONES[zoneId];
    return zone ? zone.items.length : 0;
  }

  zoneRemaining(zoneId) {
    return this.zoneTotal(zoneId) - this.zoneFoundCount(zoneId);
  }

  isZoneComplete(zoneId) {
    return this.zoneRemaining(zoneId) <= 0;
  }

  missingItems(zoneId) {
    const zone = ZONES[zoneId];
    if (!zone) return [];
    return zone.items.filter(id => !this.discovered.has(id)).map(id => ROOM_VOCAB_DATA[id]);
  }

  // Mở khoá từng chặng theo đúng lộ trình khám phá
  syncUnlockedZones() {
    // Dựng lại danh sách từ đầu chứ không cộng dồn: bản lưu cũ (từ lộ trình
    // trước) có thể đang mở sẵn đường phố / công viên, nếu chỉ thêm vào thì
    // tiến độ sai đó không bao giờ được thu hồi.
    const unlocked = new Set(['bedroom']);

    if (this.isZoneComplete('bedroom')) {
      unlocked.add('living');      // Phòng ngủ → Phòng khách
    }
    if (unlocked.has('living') && this.isZoneComplete('living')) {
      unlocked.add('kitchen');     // Phòng khách → Bếp
    }
    if (unlocked.has('kitchen') && this.isZoneComplete('kitchen')) {
      unlocked.add('street');      // Cửa lớn phòng khách → Đại lộ
      unlocked.add('store');       // Ra tới phố: cửa hàng tiện lợi mở cửa
    }
    if (unlocked.has('store') && this.isZoneComplete('store')) {
      unlocked.add('park');        // Xong cửa hàng → Công viên mở cổng
    }

    this.unlockedZones = unlocked;

    if (!this.unlockedZones.has(this.currentZone)) {
      this.currentZone = 'bedroom';
    }
  }

  isAllComplete() {
    return ZONE_ORDER.every(z => this.isZoneComplete(z));
  }

  totalFound() {
    return ZONE_ORDER.reduce((sum, z) => sum + this.zoneFoundCount(z), 0);
  }

  markDiscovered(id) {
    const isNew = !this.discovered.has(id);
    if (isNew) {
      this.discovered.add(id);
      const entry = ROOM_VOCAB_DATA[id];
      this.score += (entry && entry.isGate) ? 20 : 100;
      // Khởi tạo SRS record cho từ mới
      if (entry && !entry.isGate) {
        this.srs.getRecord(id);
      }
      this.syncUnlockedZones();
      this.evaluateQuestsAndAchievements();
      this.saveStorage();
      this.soundFX.playDiscover();
    }
    return isNew;
  }

  recordQuizResult(vocabId, isCorrect, quality = null) {
    this.quizStats.total++;
    if (isCorrect) {
      this.quizStats.correct++;
      this.quizStreak++;
      this.score += 50;
      const q = quality !== null ? quality : 4;
      this.srs.processReview(vocabId, q);
    } else {
      this.quizStreak = 0;
      const q = quality !== null ? quality : 1;
      this.srs.processReview(vocabId, q);
    }
    this.evaluateQuestsAndAchievements();
    this.saveStorage();
  }

  recordSentenceSuccess(vocabId) {
    this.sentenceCount++;
    this.score += 75;
    this.questManager.addXP(40);
    this.srs.processReview(vocabId, 5);
    this.evaluateQuestsAndAchievements();
    this.saveStorage();
  }

  recordDialogueComplete(npcId) {
    this.completedDialogues.add(npcId);
    this.score += 100;
    this.questManager.addXP(100);
    this.evaluateQuestsAndAchievements();
    this.saveStorage();
  }

  resetProgress() {
    this.discovered.clear();
    this.score = 0;
    this.quizStats = { total: 0, correct: 0 };
    this.quizStreak = 0;
    this.sentenceCount = 0;
    this.completedDialogues.clear();
    this.currentZone = 'bedroom';
    this.unlockedZones = new Set(['bedroom']);
    this.hasWokenUp = false;
    this.srs = new SRSEngine();
    this.questManager = new QuestManager();
    this.saveStorage();
  }
}
