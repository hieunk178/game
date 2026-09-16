/**
 * ============================================================================
 * INTERACTIVE LEARNING MINI-GAMES ENGINE
 * ============================================================================
 * 1. Sentence Builder (Sắp xếp câu chuẩn ngữ pháp)
 * 2. Tone & Pinyin Challenge (Thử thách thanh điệu phản xạ nhanh)
 * 3. Audio Echo Quest (Nghe âm thanh định vị đồ vật 3D)
 */

export class MiniGamesEngine {
  constructor(game) {
    this.game = game;
  }

  // --- 1. SENTENCE BUILDER MINI-GAME ---
  /**
   * Prepares a sentence unscramble challenge from a vocab item's example sentence
   * @param {Object} vocabItem - Item from ROOM_VOCAB_DATA
   */
  createSentenceChallenge(vocabItem) {
    const rawSentence = vocabItem.exampleCn;
    // Split Chinese sentence into natural 1-3 character tokens (excluding ending punctuation)
    const cleanSentence = rawSentence.replace(/[。？！，、]/g, '').trim();

    // Natural Chinese tokenization chunks
    const tokens = [];
    let i = 0;
    while (i < cleanSentence.length) {
      // Chunk length 1 or 2 characters
      const len = (cleanSentence.length - i >= 3 && Math.random() > 0.5) ? 2 : (Math.random() > 0.4 ? 2 : 1);
      const chunk = cleanSentence.substring(i, Math.min(cleanSentence.length, i + len));
      tokens.push(chunk);
      i += chunk.length;
    }

    // Shuffle tokens
    const shuffled = [...tokens];
    for (let j = shuffled.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }

    return {
      vocabId: vocabItem.id,
      chinese: vocabItem.chinese,
      targetSentence: cleanSentence,
      fullSentenceWithPunctuation: rawSentence,
      pinyin: vocabItem.examplePinyin,
      meaningVi: vocabItem.exampleVi,
      tokens: shuffled,
      originalTokens: tokens
    };
  }

  /**
   * Validates if player's arranged tokens match target sentence
   * @param {Array<string>} selectedTokens
   * @param {string} targetSentence
   */
  validateSentence(selectedTokens, targetSentence) {
    const joined = selectedTokens.join('');
    return joined === targetSentence;
  }

  // --- 2. TONE & PINYIN CHALLENGE MINI-GAME ---
  /**
   * Generates 4 plausible Pinyin/Tone choices for a given vocabulary item
   * @param {Object} vocabItem
   */
  createToneChallenge(vocabItem) {
    const correctPinyin = vocabItem.pinyin;
    // Generate distractors with modified tone marks
    const distractors = new Set();
    const cleanLetters = correctPinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const toneMap = {
      'a': ['ā', 'á', 'ǎ', 'à'],
      'o': ['ō', 'ó', 'ǒ', 'ò'],
      'e': ['ē', 'é', 'ě', 'è'],
      'i': ['ī', 'í', 'ǐ', 'ì'],
      'u': ['ū', 'ú', 'ǔ', 'ù'],
      'v': ['ǖ', 'ǘ', 'ǚ', 'ǜ']
    };

    let attempts = 0;
    while (distractors.size < 3 && attempts < 20) {
      attempts++;
      let fake = '';
      for (let char of cleanLetters) {
        if (toneMap[char] && Math.random() > 0.4) {
          const randTone = toneMap[char][Math.floor(Math.random() * 4)];
          fake += randTone;
        } else {
          fake += char;
        }
      }
      if (fake !== correctPinyin && fake.length === correctPinyin.length) {
        distractors.add(fake);
      }
    }

    const options = Array.from(distractors).slice(0, 3);
    // Có những âm không sinh nổi 3 đáp án nhiễu (vòng lặp hết 20 lượt thử).
    // Trước đây danh sách dự phòng được tính ra rồi bỏ quên, khiến câu hỏi
    // chỉ còn 1–3 lựa chọn. Nay bù cho đủ 4 phương án.
    const fallbackOptions = [
      cleanLetters,
      cleanLetters + ' (thanh 1)',
      cleanLetters + ' (thanh 2)',
      cleanLetters + ' (thanh 4)'
    ];
    for (let f = 0; options.length < 3 && f < fallbackOptions.length; f++) {
      const candidate = fallbackOptions[f];
      if (candidate !== correctPinyin && !options.includes(candidate)) {
        options.push(candidate);
      }
    }
    options.push(correctPinyin);

    // Shuffle options
    for (let j = options.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [options[j], options[k]] = [options[k], options[j]];
    }

    const correctIndex = options.indexOf(correctPinyin);

    return {
      vocabId: vocabItem.id,
      chinese: vocabItem.chinese,
      meaningVi: vocabItem.meaning,
      correctPinyin,
      options,
      correctIndex
    };
  }

  // --- 3. AUDIO ECHO QUEST MINI-GAME ---
  /**
   * Selects a target vocabulary item in current zone for audio location hunt
   * @param {Array<Object>} zoneItems
   */
  createAudioEchoHunt(zoneItems) {
    if (!zoneItems || zoneItems.length === 0) return null;
    const target = zoneItems[Math.floor(Math.random() * zoneItems.length)];
    return {
      targetId: target.id,
      chinese: target.chinese,
      pinyin: target.pinyin,
      nameVi: target.nameVi,
      timeLimit: 25 // 25 giây để tìm
    };
  }
}
