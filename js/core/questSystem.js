/**
 * ============================================================================
 * QUEST & ACHIEVEMENT MANAGER SYSTEM
 * ============================================================================
 */

import { QUESTS_DATA, ACHIEVEMENTS_DATA } from '../data/questsData.js';

export class QuestManager {
  constructor(initialData = {}) {
    this.completedQuests = new Set(initialData.completedQuests || []);
    this.claimedQuests = new Set(initialData.claimedQuests || []);
    this.completedAchievements = new Set(initialData.completedAchievements || []);
    this.xp = initialData.xp || 0;
    this.level = this.calculateLevel(this.xp);
    this.listeners = [];
  }

  calculateLevel(xp) {
    // 100 XP per level with gentle scaling: Lvl = floor(sqrt(XP / 80)) + 1
    return Math.floor(Math.sqrt(Math.max(0, xp) / 80)) + 1;
  }

  getXPForNextLevel() {
    const nextLvl = this.level;
    return Math.round(nextLvl * nextLvl * 80);
  }

  addXP(amount) {
    this.xp += Math.max(0, amount);
    const newLevel = this.calculateLevel(this.xp);
    const leveledUp = newLevel > this.level;
    this.level = newLevel;
    return { xp: this.xp, level: this.level, leveledUp };
  }

  /**
   * Evaluates quest progress based on player state
   * @param {Object} context - { discoveredSet, zoneStats, currentZone, completedDialogues, miniGameStats }
   */
  evaluateQuests(context) {
    const newlyCompleted = [];

    QUESTS_DATA.forEach(quest => {
      if (this.completedQuests.has(quest.id)) return;

      let isDone = false;

      if (quest.requiredItems && Array.isArray(quest.requiredItems)) {
        isDone = quest.requiredItems.every(id => context.discoveredSet.has(id));
      } else if (quest.requiredCount && quest.zone) {
        const foundInZone = context.zoneStats[quest.zone] || 0;
        isDone = foundInZone >= quest.requiredCount;
      } else if (quest.targetNpc && context.completedDialogues) {
        isDone = context.completedDialogues.has(quest.targetNpc);
      }

      if (isDone) {
        this.completedQuests.add(quest.id);
        newlyCompleted.push(quest);
      }
    });

    return newlyCompleted;
  }

  /**
   * Evaluates achievements based on game milestones
   * @param {Object} stats - { totalDiscovered, quizStreak, srsMasteredCount, sentenceCount }
   */
  evaluateAchievements(stats) {
    const newlyUnlocked = [];

    ACHIEVEMENTS_DATA.forEach(ach => {
      if (this.completedAchievements.has(ach.id)) return;

      let unlocked = false;
      switch (ach.id) {
        case 'ach_first_discovery':
          unlocked = stats.totalDiscovered >= 1;
          break;
        case 'ach_streak_5':
          unlocked = stats.quizStreak >= 5;
          break;
        case 'ach_srs_master_10':
          unlocked = stats.srsMasteredCount >= 10;
          break;
        case 'ach_sentence_builder_5':
          unlocked = stats.sentenceCount >= 5;
          break;
        case 'ach_polyglot_all':
          // Bám theo tổng từ vựng thật sự, không cứng số 55 như trước
          unlocked = stats.totalVocab > 0 && stats.totalDiscovered >= stats.totalVocab;
          break;
      }

      if (unlocked) {
        this.completedAchievements.add(ach.id);
        this.addXP(ach.rewardXP);
        newlyUnlocked.push(ach);
      }
    });

    return newlyUnlocked;
  }

  claimQuest(questId) {
    if (!this.completedQuests.has(questId) || this.claimedQuests.has(questId)) {
      return null;
    }
    const quest = QUESTS_DATA.find(q => q.id === questId);
    if (!quest) return null;

    this.claimedQuests.add(questId);
    const xpResult = this.addXP(quest.rewardXP);

    return {
      quest,
      rewardXP: quest.rewardXP,
      rewardScore: quest.rewardScore,
      badge: quest.badge,
      xp: xpResult.xp,
      level: xpResult.level,
      leveledUp: xpResult.leveledUp
    };
  }

  getActiveQuestsForZone(zoneId) {
    return QUESTS_DATA.filter(q => q.zone === zoneId && !this.claimedQuests.has(q.id));
  }

  exportData() {
    return {
      completedQuests: Array.from(this.completedQuests),
      claimedQuests: Array.from(this.claimedQuests),
      completedAchievements: Array.from(this.completedAchievements),
      xp: this.xp,
      level: this.level
    };
  }

  importData(data) {
    if (!data) return;
    this.completedQuests = new Set(data.completedQuests || []);
    this.claimedQuests = new Set(data.claimedQuests || []);
    this.completedAchievements = new Set(data.completedAchievements || []);
    this.xp = data.xp || 0;
    this.level = this.calculateLevel(this.xp);
  }
}
