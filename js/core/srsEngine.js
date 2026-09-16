/**
 * ============================================================================
 * SPACED REPETITION SYSTEM (SRS) — SUPERMEMO SM-2 ALGORITHM
 * ============================================================================
 * Calculates optimal review intervals based on learning quality (0-5)
 * to transfer vocabulary from short-term to long-term memory.
 */

export const MASTERY_LEVELS = {
  NEW: 'new',           // Chưa học hoặc mới khám phá
  LEARNING: 'learning', // Đang học (repetition < 2)
  REVIEW: 'review',     // Đã nhớ, cần ôn theo lịch
  MASTERED: 'mastered'  // Đã thành thạo (interval >= 21 ngày và streak >= 4)
};

export class SRSEngine {
  constructor(initialData = {}) {
    // Map of vocabId -> { interval, repetition, easeFactor, nextReview, lastReview, history }
    this.records = { ...initialData };
  }

  /**
   * Initializes or gets record for a vocabulary item
   */
  getRecord(vocabId) {
    if (!this.records[vocabId]) {
      this.records[vocabId] = {
        interval: 0,          // Khoảng cách ngày đến lần ôn tiếp theo
        repetition: 0,        // Số lần ôn tập thành công liên tiếp
        easeFactor: 2.5,      // Hệ số dễ (SM-2 default: 2.5, min: 1.3)
        nextReview: 0,        // Timestamp lần ôn tiếp theo
        lastReview: null,     // Timestamp lần ôn gần nhất
        masteryLevel: MASTERY_LEVELS.NEW,
        totalReviews: 0,
        correctReviews: 0
      };
    }
    return this.records[vocabId];
  }

  /**
   * Calculates next review using SuperMemo SM-2 algorithm
   * @param {string} vocabId
   * @param {number} quality - 0: Blackout, 1: Wrong, 2: Wrong with faint recall, 3: Hard correct, 4: Good correct, 5: Easy perfect
   * @param {number} customNow - Optional custom timestamp for testing/simulation
   */
  processReview(vocabId, quality, customNow = Date.now()) {
    const q = Math.max(0, Math.min(5, Math.round(quality)));
    const rec = this.getRecord(vocabId);

    rec.totalReviews += 1;
    rec.lastReview = customNow;

    if (q >= 3) {
      // Correct response
      rec.correctReviews += 1;
      if (rec.repetition === 0) {
        rec.interval = 1; // 1 ngày
      } else if (rec.repetition === 1) {
        rec.interval = 3; // 3 ngày
      } else if (rec.repetition === 2) {
        rec.interval = 7; // 7 ngày
      } else {
        rec.interval = Math.round(rec.interval * rec.easeFactor);
      }
      rec.repetition += 1;
    } else {
      // Incorrect response: reset repetition streak
      rec.repetition = 0;
      rec.interval = 1; // Ôn lại vào ngày mai
    }

    // Update Ease Factor (EF)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const deltaEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    rec.easeFactor = Math.max(1.3, Number((rec.easeFactor + deltaEF).toFixed(2)));

    // Calculate next review timestamp (interval in days)
    const msInDay = 24 * 60 * 60 * 1000;
    rec.nextReview = customNow + rec.interval * msInDay;

    // Update mastery level
    if (rec.interval >= 21 && rec.repetition >= 4) {
      rec.masteryLevel = MASTERY_LEVELS.MASTERED;
    } else if (rec.repetition >= 2) {
      rec.masteryLevel = MASTERY_LEVELS.REVIEW;
    } else if (rec.repetition >= 1) {
      rec.masteryLevel = MASTERY_LEVELS.LEARNING;
    } else {
      rec.masteryLevel = MASTERY_LEVELS.LEARNING;
    }

    return { ...rec };
  }

  /**
   * Returns items that are due for review
   * @param {Array<string>} vocabIds - List of vocabIds to check
   * @param {number} now - Timestamp to compare against
   */
  getDueItems(vocabIds, now = Date.now()) {
    return vocabIds.filter(id => {
      const rec = this.records[id];
      if (!rec) return false;
      return rec.nextReview > 0 && rec.nextReview <= now;
    });
  }

  /**
   * Gets summary statistics of SRS learning progress
   */
  getStats(totalVocabCount) {
    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let masteredCount = 0;
    let dueCount = 0;
    const now = Date.now();

    const tracked = Object.keys(this.records);
    tracked.forEach(id => {
      const rec = this.records[id];
      if (rec.nextReview > 0 && rec.nextReview <= now) {
        dueCount += 1;
      }
      switch (rec.masteryLevel) {
        case MASTERY_LEVELS.MASTERED: masteredCount++; break;
        case MASTERY_LEVELS.REVIEW: reviewCount++; break;
        case MASTERY_LEVELS.LEARNING: learningCount++; break;
        default: newCount++; break;
      }
    });

    const untracked = Math.max(0, totalVocabCount - tracked.length);
    newCount += untracked;

    return {
      newCount,
      learningCount,
      reviewCount,
      masteredCount,
      dueCount,
      retentionRate: tracked.length > 0
        ? Math.round((masteredCount + reviewCount) / totalVocabCount * 100)
        : 0
    };
  }

  exportData() {
    return { ...this.records };
  }

  importData(data) {
    if (data && typeof data === 'object') {
      this.records = { ...data };
    }
  }
}
