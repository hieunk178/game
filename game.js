/**
 * ============================================================================
 * 3D VOCAB QUEST - CORE ENGINE & GAME LOGIC
 * Powered by Three.js (r128)
 * ============================================================================
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.lastStepTime = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playFootstep() {
      if (!this.enabled || !this.ctx) return;
      const now = performance.now();
      if (now - this.lastStepTime < 320) return;
      this.lastStepTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    playHover() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playDiscover() {
      if (!this.enabled || !this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.07);
        osc.stop(this.ctx.currentTime + i * 0.07 + 0.35);
      });
    }

    playCorrect() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.09); // A5

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    }

    playWrong() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    }

    playVictory() {
      if (!this.enabled || !this.ctx) return;
      const chords = [
        [523.25, 659.25, 783.99], // C major
        [587.33, 739.99, 880.00], // D major
        [659.25, 830.61, 987.77], // E major
        [1046.5, 1318.5, 1567.98] // C high
      ];
      chords.forEach((chord, step) => {
        const time = this.ctx.currentTime + step * 0.16;
        chord.forEach(f => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, time);
          gain.gain.setValueAtTime(0.15, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time);
          osc.stop(time + 0.4);
        });
      });
    }
  }

  // --- VOCABULARY DATABASE FOR LEVEL 1 (STUDY ROOM) ---
  const ROOM_VOCAB_DATA = {
    desk: {
      id: 'desk',
      nameVi: 'Bàn làm việc',
      chinese: '桌子',
      pinyin: 'zhuō zi',
      english: 'Desk / Table',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 張 (zhāng)',
      meaning: 'Bàn, bàn làm việc, bàn học để đặt sách vở và máy tính.',
      exampleCn: '這張桌子很乾淨，適合讀書。',
      examplePinyin: 'Zhè zhāng zhuōzi hěn gānjìng, shìhé dúshū.',
      exampleVi: 'Cái bàn này rất sạch sẽ, thích hợp để đọc sách.',
      category: 'Nội thất & Đồ dùng',
      icon: '🪵',
      quiz: {
        question: 'Từ "桌子" (zhuōzi) có nghĩa là gì?',
        options: ['Bàn làm việc', 'Cái ghế', 'Tủ quần áo'],
        correct: 0
      }
    },
    chair: {
      id: 'chair',
      nameVi: 'Ghế xoay làm việc',
      chinese: '椅子',
      pinyin: 'yǐ zi',
      english: 'Chair',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 把 (bǎ)',
      meaning: 'Ghế ngồi, ghế tựa giúp ngồi học và làm việc thoải mái.',
      exampleCn: '請坐在這把椅子上。',
      examplePinyin: 'Qǐng zuò zài zhè bǎ yǐzi shàng.',
      exampleVi: 'Xin mời ngồi trên chiếc ghế này.',
      category: 'Nội thất & Đồ dùng',
      icon: '🪑',
      quiz: {
        question: 'Lượng từ đi kèm với "椅子" (yǐzi) là gì?',
        options: ['把 (bǎ)', '張 (zhāng)', '本 (běn)'],
        correct: 0
      }
    },
    laptop: {
      id: 'laptop',
      nameVi: 'Máy tính xách tay',
      chinese: '電腦',
      pinyin: 'diàn nǎo',
      english: 'Laptop / Computer',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Máy vi tính, máy tính xách tay dùng để học tập và tra cứu.',
      exampleCn: '我每天用電腦學習中文。',
      examplePinyin: 'Wǒ měitiān yòng diànnǎo xuéxí zhōngwén.',
      exampleVi: 'Tôi dùng máy tính để học tiếng Trung mỗi ngày.',
      category: 'Thiết bị điện tử',
      icon: '💻',
      quiz: {
        question: 'Từ "電腦" được cấu tạo từ 2 chữ Hán nào?',
        options: ['Điện (Điện lực) + Não (Bộ não)', 'Điện + Thoại', 'Điện + Thị'],
        correct: 0
      }
    },
    lamp: {
      id: 'lamp',
      nameVi: 'Đèn để bàn',
      chinese: '檯燈',
      pinyin: 'tái dēng',
      english: 'Desk Lamp',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 盞 (zhǎn) / 臺 (tái)',
      meaning: 'Đèn bàn chiếu sáng dịu mắt để đọc sách ban đêm.',
      exampleCn: '晚上看書時請打開檯燈。',
      examplePinyin: 'Wǎnshàng kànshū shí qǐng dǎkāi táidēng.',
      exampleVi: 'Buổi tối khi đọc sách hãy bật đèn bàn lên nhé.',
      category: 'Thiết bị điện tử',
      icon: '💡',
      quiz: {
        question: 'Phiên âm chuẩn của "檯燈" là gì?',
        options: ['tái dēng', 'diàn dēng', 'kāi dēng'],
        correct: 0
      }
    },
    coffee: {
      id: 'coffee',
      nameVi: 'Tách cà phê nóng',
      chinese: '咖啡',
      pinyin: 'kā fēi',
      english: 'Coffee Cup',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 杯 (bēi)',
      meaning: 'Cà phê, thức uống giúp tỉnh táo và tập trung học tập.',
      exampleCn: '我想要一杯熱咖啡。',
      examplePinyin: 'Wǒ xiǎng yào yì bēi rè kāfēi.',
      exampleVi: 'Tôi muốn một tách cà phê nóng.',
      category: 'Đồ uống & Ẩm thực',
      icon: '☕',
      quiz: {
        question: 'Lượng từ "một tách cà phê" trong tiếng Trung là:',
        options: ['一杯咖啡 (yì bēi kāfēi)', '一張咖啡', '一本咖啡'],
        correct: 0
      }
    },
    clock: {
      id: 'clock',
      nameVi: 'Đồng hồ treo tường',
      chinese: '時鐘',
      pinyin: 'shí zhōng',
      english: 'Wall Clock',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge) / 座 (zuò)',
      meaning: 'Đồng hồ, dụng cụ chỉ giờ giấc giúp quản lý thời gian hiệu quả.',
      exampleCn: '牆上有一個漂亮的時鐘。',
      examplePinyin: 'Qiáng shàng yǒu yí ge piàoliang de shízhōng.',
      exampleVi: 'Trên tường có một chiếc đồng hồ rất đẹp.',
      category: 'Đồ trang trí trong phòng',
      icon: '⏰',
      quiz: {
        question: 'Từ "時鐘" (shízhōng) có nghĩa là gì?',
        options: ['Đồng hồ', 'Thời gian', 'Chuông cửa'],
        correct: 0
      }
    },
    bookshelf: {
      id: 'bookshelf',
      nameVi: 'Kệ sách & Sách vở',
      chinese: '書',
      pinyin: 'shū',
      english: 'Book & Bookshelf',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 本 (běn)',
      meaning: 'Sách, tài liệu kiến thức quý báu được xếp ngay ngắn trên giá.',
      exampleCn: '書架上有很多中文書。',
      examplePinyin: 'Shūjià shàng yǒu hěn duō zhōngwén shū.',
      exampleVi: 'Trên giá sách có rất nhiều sách tiếng Trung.',
      category: 'Học tập & Giáo dục',
      icon: '📚',
      quiz: {
        question: 'Lượng từ chuẩn của "書" (sách) là:',
        options: ['本 (běn)', '個 (ge)', '張 (zhāng)'],
        correct: 0
      }
    },
    plant: {
      id: 'plant',
      nameVi: 'Chậu cây cảnh',
      chinese: '植物',
      pinyin: 'zhí wù',
      english: 'Indoor Plant',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 棵 (kē) / 盆 (pén)',
      meaning: 'Cây cối, thực vật xanh mang lại không khí tươi mát và thư giãn.',
      exampleCn: '房間裡擺放著綠色植物。',
      examplePinyin: 'Fángjiān lǐ bǎifàng zhe lǜsè zhíwù.',
      exampleVi: 'Trong phòng có đặt những chậu cây xanh tươi mát.',
      category: 'Thiên nhiên & Trang trí',
      icon: '🪴',
      quiz: {
        question: 'Từ "植物" mang nghĩa gì?',
        options: ['Cây cảnh / Thực vật', 'Động vật', 'Đồ vật'],
        correct: 0
      }
    },
    bed: {
      id: 'bed',
      nameVi: 'Giường ngủ',
      chinese: '床',
      pinyin: 'chuáng',
      english: 'Bed',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 張 (zhāng)',
      meaning: 'Giường ngủ êm ái để nghỉ ngơi và nạp lại năng lượng.',
      exampleCn: '這張床非常舒服。',
      examplePinyin: 'Zhè zhāng chuáng fēicháng shūfu.',
      exampleVi: 'Chiếc giường này vô cùng êm ái thoải mái.',
      category: 'Nội thất phòng ngủ',
      icon: '🛏️',
      quiz: {
        question: 'Câu "這張床很舒服" nghĩa là gì?',
        options: ['Chiếc giường này rất thoải mái', 'Cái bàn này rất to', 'Căn phòng này rất đẹp'],
        correct: 0
      }
    },
    window: {
      id: 'window',
      nameVi: 'Cửa sổ ngắm cảnh',
      chinese: '窗戶',
      pinyin: 'chuāng hu',
      english: 'Window',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 扇 (shàn)',
      meaning: 'Cửa sổ đón ánh nắng tự nhiên và gió mát vào phòng.',
      exampleCn: '打開窗戶可以看到藍天。',
      examplePinyin: 'Dǎkāi chuānghu kěyǐ kàndào lántiān.',
      exampleVi: 'Mở cửa sổ ra có thể ngắm nhìn bầu trời xanh biếc.',
      category: 'Kiến trúc căn phòng',
      icon: '🪟',
      quiz: {
        question: '"打開窗戶" (dǎkāi chuānghu) nghĩa là gì?',
        options: ['Mở cửa sổ', 'Đóng cửa sổ', 'Lau cửa sổ'],
        correct: 0
      }
    },
    guitar: {
      id: 'guitar',
      nameVi: 'Đàn Guitar Acoustic',
      chinese: '吉他',
      pinyin: 'jí tā',
      english: 'Acoustic Guitar',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 把 (bǎ)',
      meaning: 'Đàn guitar, nhạc cụ mộc mạc dùng để giải trí sau giờ học.',
      exampleCn: '他喜歡在放學後彈吉他。',
      examplePinyin: 'Tā xǐhuan zài fàngxué hòu tán jítā.',
      exampleVi: 'Anh ấy thích đánh đàn guitar sau khi tan học.',
      category: 'Âm nhạc & Nghệ thuật',
      icon: '🎸',
      quiz: {
        question: 'Động từ "chơi đàn guitar" trong tiếng Trung là gì?',
        options: ['彈吉他 (tán jítā)', '踢吉他', '打吉他'],
        correct: 0
      }
    },
    backpack: {
      id: 'backpack',
      nameVi: 'Balo đi học',
      chinese: '書包',
      pinyin: 'shū bāo',
      english: 'Backpack / School Bag',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Cặp sách, balo đựng sách vở, bút và máy tính mang đến trường.',
      exampleCn: '我的書包裡有很多文具。',
      examplePinyin: 'Wǒ de shūbāo lǐ yǒu hěn duō wénjù.',
      exampleVi: 'Trong cặp sách của tôi có rất nhiều đồ dùng học tập.',
      category: 'Dụng cụ học tập',
      icon: '🎒',
      quiz: {
        question: 'Từ "書包" (shūbāo) nghĩa là:',
        options: ['Balo / Cặp sách', 'Bao thư', 'Quyển sách'],
        correct: 0
      }
    },
    trophy: {
      id: 'trophy',
      nameVi: 'Cúp vinh danh',
      chinese: '獎盃',
      pinyin: 'jiǎng bēi',
      english: 'Trophy / Award Cup',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 座 (zuò) / 個 (ge)',
      meaning: 'Cúp vinh danh, phần thưởng tượng trưng cho thành tích và nỗ lực học tập xuất sắc.',
      exampleCn: '他贏得了這次比賽的冠軍獎盃。',
      examplePinyin: 'Tā yíngdé le zhè cì bǐsài de guànjūn jiǎngbēi.',
      exampleVi: 'Anh ấy đã giành được chiếc cúp vô địch trong cuộc thi lần này.',
      category: 'Thành tựu & Vinh danh',
      icon: '🏆',
      quiz: {
        question: 'Từ "獎盃" (jiǎngbēi) có nghĩa là gì?',
        options: ['Cúp vinh danh / Cúp thưởng', 'Huy chương', 'Bằng khen'],
        correct: 0
      }
    },
    mini_plant: {
      id: 'mini_plant',
      nameVi: 'Chậu cây mini để bàn',
      chinese: '盆栽',
      pinyin: 'pén zāi',
      english: 'Potted Succulent / Bonsai',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 盆 (pén)',
      meaning: 'Cây cảnh trong chậu, chậu cây nhỏ trang trí trên bàn học hoặc kệ sách.',
      exampleCn: '書架上的綠色盆栽讓房間更有生氣。',
      examplePinyin: 'Shūjià shàng de lǜsè pénzāi ràng fángjiān gèng yǒu shēngqì.',
      exampleVi: 'Chậu cây cảnh trên kệ sách làm cho căn phòng thêm tràn đầy sức sống.',
      category: 'Trang trí & Không gian',
      icon: '🪴',
      quiz: {
        question: 'Lượng từ chuẩn cho "盆栽" (cây trồng trong chậu) là:',
        options: ['盆 (pén)', '張 (zhāng)', '把 (bǎ)'],
        correct: 0
      }
    },
    globe: {
      id: 'globe',
      nameVi: 'Quả địa cầu để bàn',
      chinese: '地球儀',
      pinyin: 'dì qiú yí',
      english: 'Desktop Globe',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge) / 座 (zuò)',
      meaning: 'Quả địa cầu, mô hình Trái Đất thu nhỏ giúp khám phá các quốc gia và địa lý thế giới.',
      exampleCn: '我們可以用地球儀查找世界各國的位置。',
      examplePinyin: 'Wǒmen kěyǐ yòng dìqiúyí cházhǎo shìjiè gèguó de wèizhì.',
      exampleVi: 'Chúng ta có thể dùng quả địa cầu để tra cứu vị trí các quốc gia trên thế giới.',
      category: 'Dụng cụ học tập & Địa lý',
      icon: '🌐',
      quiz: {
        question: 'Từ "地球儀" (dìqiúyí) chỉ đồ vật nào?',
        options: ['Quả địa cầu', 'Bản đồ treo tường', 'Kính viễn vọng'],
        correct: 0
      }
    }
  };

  // --- PROCEDURAL TEXTURE GENERATORS ---
  function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, 0, 512, 512);

    // Wood grain lines
    ctx.fillStyle = 'rgba(60, 35, 15, 0.15)';
    for (let i = 0; i < 500; i++) {
      const y = Math.random() * 512;
      const h = Math.random() * 6 + 1;
      ctx.fillRect(0, y, 512, h);
    }

    // Parquet planks
    ctx.strokeStyle = 'rgba(40, 20, 10, 0.4)';
    ctx.lineWidth = 2;
    const plankW = 128;
    const plankH = 32;
    for (let x = 0; x < 512; x += plankW) {
      for (let y = 0; y < 512; y += plankH) {
        ctx.strokeRect(x, y, plankW, plankH);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createRugTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2c4b69';
    ctx.fillRect(0, 0, 512, 512);

    // Intricate geometric mandala pattern
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 170, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.save();
      ctx.translate(256, 256);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.fillRect(-15, 60, 30, 90);
      ctx.restore();
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createOnyxMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base background: soft pearl grey stone with subtle gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    bgGrad.addColorStop(0, '#ebe6db');
    bgGrad.addColorStop(0.5, '#dad3c3');
    bgGrad.addColorStop(1, '#eee9de');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Golden amber glowing clouds in center
    const centerGrad = ctx.createRadialGradient(512, 512, 60, 512, 512, 480);
    centerGrad.addColorStop(0, 'rgba(240, 180, 45, 0.7)');
    centerGrad.addColorStop(0.3, 'rgba(220, 145, 25, 0.5)');
    centerGrad.addColorStop(0.65, 'rgba(180, 105, 18, 0.3)');
    centerGrad.addColorStop(1, 'rgba(110, 80, 30, 0)');
    ctx.fillStyle = centerGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Bookmatched symmetry: draw symmetric gold & dark marble veins
    function drawVein(points, color, width, blur = 0) {
      ctx.save();
      if (blur > 0) ctx.filter = `blur(${blur}px)`;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Left half
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Mirror right half (bookmatch)
      ctx.beginPath();
      ctx.moveTo(1024 - points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(1024 - points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Organic marble veining patterns
    for (let v = 0; v < 16; v++) {
      const pts = [];
      let x = 512 - (v * 24 + (v % 2) * 20);
      let y = 0;
      pts.push({ x, y });
      while (y < 1024) {
        y += 45 + ((v * 17) % 50);
        x += ((v % 3) - 1) * 35 + ((y % 11) - 5) * 6;
        pts.push({ x, y });
      }
      const isGold = v % 3 !== 0;
      const col = isGold 
        ? 'rgba(230, 170, 35, 0.65)'
        : 'rgba(50, 60, 70, 0.45)';
      drawVein(pts, col, isGold ? 10 : 6, 2);
      drawVein(pts, isGold ? '#ffe680' : '#ffffff', isGold ? 3 : 2, 0);
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createLuxuryRugTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm beige/cream woven base
    ctx.fillStyle = '#e8e2d8';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle cross-hatch woven texture
    ctx.fillStyle = 'rgba(190, 180, 165, 0.3)';
    for (let x = 0; x < 512; x += 4) {
      ctx.fillRect(x, 0, 2, 512);
    }
    for (let y = 0; y < 512; y += 4) {
      ctx.fillRect(0, y, 512, 2);
    }

    // Elegant subtle border
    ctx.strokeStyle = '#cbbeab';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, 480, 480);
    ctx.strokeStyle = '#dfd5c5';
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, 448, 448);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createDarkWalnutTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich dark walnut base (gỗ óc chó)
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(0, 0, 512, 512);

    // Fine organic wood grain lines
    ctx.fillStyle = 'rgba(25, 12, 6, 0.35)';
    for (let i = 0; i < 400; i++) {
      const y = Math.random() * 512;
      const h = Math.random() * 5 + 1;
      ctx.fillRect(0, y, 512, h);
    }

    // Warm amber grain highlights
    ctx.fillStyle = 'rgba(160, 95, 45, 0.15)';
    for (let i = 0; i < 200; i++) {
      const y = Math.random() * 512;
      const h = Math.random() * 3 + 1;
      ctx.fillRect(0, y, 512, h);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createLeatherTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich dark chocolate / espresso leather base
    ctx.fillStyle = '#381e11';
    ctx.fillRect(0, 0, 512, 512);

    // Leather grain cells / pore pattern
    for (let i = 0; i < 2200; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      const cr = Math.random() * 2.5 + 0.8;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(20, 10, 5, 0.4)' : 'rgba(90, 50, 25, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle leather creasing lines
    ctx.strokeStyle = 'rgba(20, 10, 5, 0.18)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - 0.5) * 45;
        y += (Math.random() - 0.5) * 45;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // --- PROCEDURAL 3D ROUNDED BOX GEOMETRY GENERATOR (Bo góc cho vật thể) ---
  function createRoundedBoxGeometry(width, height, depth, radius = 0.04, smoothness = 3) {
    const r = Math.min(radius, width / 2 - 0.001, height / 2 - 0.001, depth / 2 - 0.001);
    const shape = new THREE.Shape();
    const w = width - r * 2;
    const h = height - r * 2;
    const x = -w / 2;
    const y = -h / 2;

    shape.absarc(x + w, y + h, r, 0, Math.PI / 2, false);
    shape.absarc(x, y + h, r, Math.PI / 2, Math.PI, false);
    shape.absarc(x, y, r, Math.PI, Math.PI * 3 / 2, false);
    shape.absarc(x + w, y, r, Math.PI * 3 / 2, Math.PI * 2, false);

    const extrudeSettings = {
      depth: Math.max(depth - r * 2, 0.01),
      bevelEnabled: true,
      bevelSegments: smoothness,
      steps: 1,
      bevelSize: r,
      bevelThickness: r,
      curveSegments: smoothness * 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  }

  function createAbstractArtTexture(theme = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    if (theme === 0) {
      // Golden Marble & Midnight Blue Abstract
      const grad = ctx.createLinearGradient(0, 0, 512, 700);
      grad.addColorStop(0, '#081426');
      grad.addColorStop(0.5, '#162e4c');
      grad.addColorStop(1, '#0a101d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 700);

      // Gold swirling liquid arcs
      ctx.lineWidth = 26;
      ctx.strokeStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(256, 350, 180, 0.2, Math.PI * 1.4);
      ctx.stroke();

      ctx.lineWidth = 12;
      ctx.strokeStyle = '#ffe082';
      ctx.beginPath();
      ctx.arc(256, 350, 220, 0.8, Math.PI * 1.8);
      ctx.stroke();

      // Fluid gold & white wave strokes
      ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.beginPath();
      ctx.moveTo(50, 100);
      ctx.bezierCurveTo(200, 300, 100, 500, 450, 600);
      ctx.bezierCurveTo(300, 400, 400, 200, 50, 100);
      ctx.fill();
    } else if (theme === 1) {
      // Warm Amber & Minimalist Bauhaus Shapes
      const grad = ctx.createLinearGradient(0, 0, 512, 700);
      grad.addColorStop(0, '#faf7f2');
      grad.addColorStop(1, '#ede5d8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 700);

      // Bold terracotta and dark walnut circles & arches
      ctx.fillStyle = '#c85a32';
      ctx.beginPath();
      ctx.arc(256, 260, 140, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#2c1810';
      ctx.beginPath();
      ctx.arc(256, 440, 110, 0, Math.PI * 2);
      ctx.fill();

      // Golden accent circle
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(380, 200, 45, 0, Math.PI * 2);
      ctx.fill();

      // Modern black minimalist line
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(80, 580);
      ctx.lineTo(432, 580);
      ctx.stroke();
    } else {
      // Emerald & Gold Luxury Geode
      const grad = ctx.createRadialGradient(256, 350, 50, 256, 350, 320);
      grad.addColorStop(0, '#042f2e');
      grad.addColorStop(0.6, '#0f766e');
      grad.addColorStop(1, '#021e1d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 700);

      // Gold veining
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(120, 50);
      ctx.bezierCurveTo(300, 200, 150, 450, 380, 650);
      ctx.stroke();

      ctx.strokeStyle = '#fff8db';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(120, 50);
      ctx.bezierCurveTo(300, 200, 150, 450, 380, 650);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // IDE / App UI background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 320);

    // Window top bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 36);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(20, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(40, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(60, 18, 6, 0, Math.PI * 2); ctx.fill();

    // Code lines & Vocab preview
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('TOCFL Flash Cards 3D', 80, 24);

    ctx.fillStyle = '#a855f7';
    ctx.font = '16px monospace';
    ctx.fillText('import { Learn } from "chinese";', 25, 75);

    ctx.fillStyle = '#3b82f6';
    ctx.fillText('const todayVocab = [', 25, 110);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('  "桌子", "椅子", "電腦", "檯燈"', 45, 140);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('];', 25, 170);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('console.log("Score: 100%!");', 25, 210);

    // Glowing logo
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(320, 60, 160, 220);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('學習', 365, 175);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createWindowSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.6, '#93c5fd');
    grad.addColorStop(1, '#fef08a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Sun
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(380, 120, 50, 0, Math.PI * 2);
    ctx.fill();

    // Mountains in distance
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.lineTo(150, 300);
    ctx.lineTo(280, 380);
    ctx.lineTo(440, 270);
    ctx.lineTo(512, 390);
    ctx.lineTo(512, 512);
    ctx.lineTo(0, 512);
    ctx.fill();

    // Fluffy clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(140, 160, 40, 0, Math.PI * 2);
    ctx.arc(180, 150, 55, 0, Math.PI * 2);
    ctx.arc(230, 160, 45, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createBackpackFabricTexture(baseHex = '#1e3a8a', patternHex = '#172554', accentHex = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base High-Density Oxford Weave
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Diamond Ripstop Grid Weave Texture
    ctx.fillStyle = patternHex;
    const grid = 20;
    for (let x = 0; x < 512; x += grid) {
      for (let y = 0; y < 512; y += grid) {
        ctx.fillRect(x + 1, y + 1, grid - 2, grid - 2);
      }
    }

    // Micro-fiber weave noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 2500; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Double Stitched Seams along borders
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(14, 14, 484, 484);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.strokeRect(22, 22, 468, 468);
    ctx.setLineDash([]);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createClockFaceTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Hour numbers
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    numbers.forEach((num, i) => {
      const angle = (i * Math.PI) / 6 - Math.PI / 2;
      const x = 128 + Math.cos(angle) * 90;
      const y = 128 + Math.sin(angle) * 90;
      ctx.fillText(num.toString(), x, y);
    });

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // --- GAME STATE MANAGER ---
  class GameState {
    constructor() {
      this.discovered = new Set();
      this.score = 0;
      this.quizStats = { total: 0, correct: 0 };
      this.activeItem = null;
      this.isPaused = false;
      this.soundFX = new SoundFX();
      this.sensitivity = 5;
      this.langMode = 'both';

      this.loadStorage();
    }

    loadStorage() {
      try {
        const saved = localStorage.getItem('3d_vocab_quest_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.discovered)) {
            parsed.discovered.forEach(id => this.discovered.add(id));
          }
          this.score = parsed.score || 0;
          this.quizStats = parsed.quizStats || { total: 0, correct: 0 };
        }
      } catch (e) {
        console.warn('Storage read error:', e);
      }
    }

    saveStorage() {
      try {
        localStorage.setItem('3d_vocab_quest_data', JSON.stringify({
          discovered: Array.from(this.discovered),
          score: this.score,
          quizStats: this.quizStats
        }));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
    }

    markDiscovered(id) {
      const isNew = !this.discovered.has(id);
      if (isNew) {
        this.discovered.add(id);
        this.score += 100;
        this.saveStorage();
        this.soundFX.playDiscover();
      }
      return isNew;
    }

    resetProgress() {
      this.discovered.clear();
      this.score = 0;
      this.quizStats = { total: 0, correct: 0 };
      this.saveStorage();
    }
  }

  // --- 3D INSPECTOR STUDIO (MODAL SECONDARY VIEWER) ---
  class InspectorStudio {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.objectGroup = new THREE.Group();
      this.scene.add(this.objectGroup);

      this.isAutoRotate = true;
      this.isDragging = false;
      this.prevMousePos = { x: 0, y: 0 };
      this.rotationVelocity = { x: 0, y: 0 };
      this.currentZoom = 5;

      this.setupLighting();
      this.setupEvents();
      this.animate();
    }

    setupLighting() {
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
      keyLight.position.set(5, 8, 5);
      keyLight.castShadow = true;
      this.scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffeedd, 0.8);
      fillLight.position.set(-5, 3, -5);
      this.scene.add(fillLight);

      // Studio pedestal shadow catcher
      const pedestalGeo = new THREE.CylinderGeometry(2, 2.2, 0.2, 32);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.8,
        metalness: 0.2
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -1.1;
      pedestal.receiveShadow = true;
      this.scene.add(pedestal);
    }

    setupEvents() {
      const el = this.canvas;
      const onDown = (clientX, clientY) => {
        this.isDragging = true;
        this.prevMousePos = { x: clientX, y: clientY };
        this.rotationVelocity = { x: 0, y: 0 };
      };

      const onMove = (clientX, clientY) => {
        if (!this.isDragging) return;
        const dx = clientX - this.prevMousePos.x;
        const dy = clientY - this.prevMousePos.y;
        this.prevMousePos = { x: clientX, y: clientY };

        this.objectGroup.rotation.y += dx * 0.012;
        this.objectGroup.rotation.x += dy * 0.012;
        this.rotationVelocity = { x: dy * 0.005, y: dx * 0.005 };
      };

      const onUp = () => {
        this.isDragging = false;
      };

      el.addEventListener('mousedown', e => onDown(e.clientX, e.clientY));
      window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onUp);

      el.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          onDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchmove', e => {
        if (e.touches.length === 1) {
          onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchend', onUp);

      el.addEventListener('wheel', e => {
        e.preventDefault();
        this.currentZoom = THREE.MathUtils.clamp(this.currentZoom + e.deltaY * 0.005, 2.5, 9);
        this.updateCameraPos();
      }, { passive: false });
    }

    updateCameraPos() {
      this.camera.position.set(0, 1.2, this.currentZoom);
      this.camera.lookAt(0, 0, 0);
    }

    showObject(objectFactoryFn) {
      // Clear previous meshes
      while (this.objectGroup.children.length > 0) {
        this.objectGroup.remove(this.objectGroup.children[0]);
      }

      // Generate isolated clone mesh
      const mesh = objectFactoryFn();
      // Center and scale normalized
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.0 / maxDim;
      mesh.scale.set(scale, scale, scale);
      mesh.position.sub(center.multiplyScalar(scale));

      this.objectGroup.add(mesh);
      this.objectGroup.rotation.set(0.15, 0.4, 0);
      this.currentZoom = 4.2;
      this.updateCameraPos();
      this.resize();
    }

    resetView() {
      this.objectGroup.rotation.set(0.15, 0.4, 0);
      this.currentZoom = 4.2;
      this.updateCameraPos();
    }

    toggleAutoRotate() {
      this.isAutoRotate = !this.isAutoRotate;
      return this.isAutoRotate;
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const w = rect.width || 360;
      const h = rect.height || 280;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      if (this.isAutoRotate && !this.isDragging) {
        this.objectGroup.rotation.y += 0.008;
      } else if (!this.isDragging) {
        this.objectGroup.rotation.y += this.rotationVelocity.y;
        this.objectGroup.rotation.x += this.rotationVelocity.x;
        this.rotationVelocity.y *= 0.92;
        this.rotationVelocity.x *= 0.92;
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  // --- 3D ROOM SCENE BUILDER & FPS ENGINE ---
  class VocabRoomGame {
    constructor() {
      this.state = new GameState();
      this.container = document.getElementById('canvas3dContainer');
      this.hud = document.getElementById('gameHud');
      this.promptEl = document.getElementById('interactionPrompt');
      this.promptTargetName = document.getElementById('promptTargetName');
      this.crosshair = document.getElementById('fpsCrosshair');
      this.lockOverlay = document.getElementById('pointerLockPrompt');

      // Three.js Main Setup
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

      // Camera Mode & 3D Avatar (Third-Person View as Default)
      this.cameraMode = 'third_person'; // 'third_person' or 'first_person'
      this.cameraDistance = 2.4;
      this.playerMesh = null;
      this.playerBones = {};
      this.walkAnimPhase = 0;
      this.idleTime = 0;

      // Obstacle collision boxes (Furniture collision in room)
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
      this.touchLook = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };
      this.joystickDir = { x: 0, y: 0 };
      this.currentRoom = 'study';

      // Inspector Studio
      this.inspector = new InspectorStudio('inspectorCanvas');

      // GLB Model Loader (Three.js r128 global GLTFLoader)
      this.gltfLoader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;
      this.loadedModels = {}; // Cache: vocabId → THREE.Group

      this.initScene();
      this.setupControls();
      this.setupUI();
      this.updateProgressUI();

      this.clock = new THREE.Clock();
      this.animate();
    }

    // --- GLB MODEL LOADING & SCALING SYSTEM ---
    loadGLBModel(vocabId, fileName = `${vocabId}.glb`) {
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
          undefined,
          (err) => {
            // Model file not found — silently fall back to procedural
            resolve(null);
          }
        );
      });
    }

    async loadAllModels() {
      const aliasMap = {
        // Study Room
        desk: 'desk.glb',
        chair: 'chairDesk.glb',
        lamp: 'lampSquareTable.glb',
        bookshelf: 'bookcaseClosedWide.glb',
        plant: 'pottedPlant.glb',
        bed: 'bedSingle.glb',
        laptop: 'laptop.glb',
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
      };

      const modelIds = Object.keys(aliasMap);
      const results = await Promise.all(modelIds.map(id => this.loadGLBModel(id, aliasMap[id])));
      const loaded = modelIds.filter((id, i) => results[i] !== null);
      if (loaded.length > 0) {
        console.log(`🎮 Loaded ${loaded.length} GLB models: ${loaded.join(', ')}`);
      } else {
        console.log('🔧 No GLB models found in /game/models/ — using procedural meshes');
      }
    }

    // Normalizes GLB models to target real-world human-scale dimensions and ground-level pivot
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
      this.scene.background = new THREE.Color(0x0f172a);
      this.scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

      // 1. Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0xffeedd, 0.85);
      this.scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
      sunLight.position.set(4, 7, 3);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 25;
      sunLight.shadow.camera.left = -6;
      sunLight.shadow.camera.right = 6;
      sunLight.shadow.camera.top = 6;
      sunLight.shadow.camera.bottom = -6;
      sunLight.shadow.bias = -0.0005;
      this.scene.add(sunLight);

      // Warm Ceiling light
      const ceilingLight = new THREE.PointLight(0xffe8d6, 0.9, 12, 1.2);
      ceilingLight.position.set(0, 3.8, 0);
      ceilingLight.castShadow = true;
      this.scene.add(ceilingLight);

      // 2. Room Shell (Floor, Walls, Ceiling, Carpet) & Player Avatar
      this.buildRoomArchitecture();
      this.buildPlayerAvatar();

      // 3. Load GLB models first, then create furniture
      this.loadAllModels().then(() => {
        this.buildInteractiveObjects();
      });
    }

    buildPlayerAvatar() {
      this.playerMesh = new THREE.Group();
      this.playerBones = {};

      // Materials
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
      const backpackMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // --- TORSO ---
      const torsoGroup = new THREE.Group();
      torsoGroup.position.set(0, 0.85, 0);

      // Main Torso Body
      const torsoGeo = new THREE.BoxGeometry(0.46, 0.50, 0.28);
      const torsoMesh = new THREE.Mesh(torsoGeo, jacketMat);
      torsoMesh.castShadow = true;
      torsoMesh.receiveShadow = true;
      torsoGroup.add(torsoMesh);

      // Jacket Zipper & Collar Accent
      const zipGeo = new THREE.BoxGeometry(0.04, 0.50, 0.02);
      const zipMesh = new THREE.Mesh(zipGeo, innerMat);
      zipMesh.position.set(0, 0, 0.141);
      torsoGroup.add(zipMesh);

      const collarGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.10, 16);
      const collarMesh = new THREE.Mesh(collarGeo, innerMat);
      collarMesh.position.set(0, 0.26, 0);
      collarMesh.castShadow = true;
      torsoGroup.add(collarMesh);

      // Backpack on the back with 3D piping & textures
      const playerBagTex = createBackpackFabricTexture('#1e293b', '#0f172a', '#38bdf8');
      const playerBagMat = new THREE.MeshStandardMaterial({ map: playerBagTex, roughness: 0.7 });

      const bagGeo = new THREE.BoxGeometry(0.34, 0.38, 0.16);
      const bagMesh = new THREE.Mesh(bagGeo, playerBagMat);
      bagMesh.position.set(0, 0.02, -0.17);
      bagMesh.castShadow = true;
      torsoGroup.add(bagMesh);

      // 3D Piping around player's backpack
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

      // --- HEAD & FACE (Child of Torso for 100% stable attachment atop body) ---
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.46, 0);

      // Head Base
      const headGeo = new THREE.SphereGeometry(0.22, 24, 24);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // Hair Cap
      const hairTopGeo = new THREE.SphereGeometry(0.24, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
      hairTop.position.set(0, 0.03, -0.01);
      headGroup.add(hairTop);

      // Hair Bangs on Forehead
      for (let i = -2; i <= 2; i++) {
        const bangGeo = new THREE.ConeGeometry(0.045, 0.14, 8);
        const bang = new THREE.Mesh(bangGeo, hairMat);
        bang.position.set(i * 0.07, 0.11, 0.19);
        bang.rotation.set(0.3, 0, -i * 0.12);
        headGroup.add(bang);
      }

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.035, 12, 12);
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.08, 0.02, 0.2);
      headGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.08, 0.02, 0.2);
      headGroup.add(rightEye);

      // Eye Catchlights
      const catchlightGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const leftGlint = new THREE.Mesh(catchlightGeo, eyeHighlightMat);
      leftGlint.position.set(-0.07, 0.032, 0.225);
      headGroup.add(leftGlint);

      const rightGlint = new THREE.Mesh(catchlightGeo, eyeHighlightMat);
      rightGlint.position.set(0.09, 0.032, 0.225);
      headGroup.add(rightGlint);

      // Headphones with glowing cyan LED
      const hpBandGeo = new THREE.TorusGeometry(0.24, 0.025, 12, 24, Math.PI);
      const hpBand = new THREE.Mesh(hpBandGeo, hairMat);
      hpBand.rotation.x = Math.PI / 2;
      hpBand.position.set(0, 0.06, 0);
      headGroup.add(hpBand);

      const earpieceGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16);
      const leftEar = new THREE.Mesh(earpieceGeo, cyanGlowMat);
      leftEar.rotation.z = Math.PI / 2;
      leftEar.position.set(-0.23, 0.02, 0);
      headGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earpieceGeo, cyanGlowMat);
      rightEar.rotation.z = Math.PI / 2;
      rightEar.position.set(0.23, 0.02, 0);
      headGroup.add(rightEar);

      torsoGroup.add(headGroup);
      this.playerMesh.add(torsoGroup);
      this.playerBones.torso = torsoGroup;
      this.playerBones.head = headGroup;

      // --- ARMS WITH ELBOW JOINTS (Khớp khuỷu tay) ---
      const createArticulatedArm = (isLeft) => {
        const side = isLeft ? -1 : 1;
        const shoulderGroup = new THREE.Group();
        shoulderGroup.position.set(side * 0.28, 1.10, 0);

        // Shoulder Ball
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jacketMat);
        shoulderGroup.add(shoulder);

        // Upper Arm (Bắp tay)
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.052, 0.18, 12), jacketMat);
        upperArm.position.set(0, -0.09, 0);
        upperArm.castShadow = true;
        shoulderGroup.add(upperArm);

        // Elbow Joint (Khớp khuỷu tay)
        const elbowGroup = new THREE.Group();
        elbowGroup.position.set(0, -0.18, 0);

        const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), innerMat);
        elbowJoint.castShadow = true;
        elbowGroup.add(elbowJoint);

        // Forearm (Cẳng tay)
        const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.18, 12), skinMat);
        forearm.position.set(0, -0.09, 0);
        forearm.castShadow = true;
        elbowGroup.add(forearm);

        // Hand (Bàn tay)
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

      // --- LEGS WITH KNEE JOINTS (Khớp đầu gối) ---
      const createArticulatedLeg = (isLeft) => {
        const side = isLeft ? -1 : 1;
        const hipGroup = new THREE.Group();
        hipGroup.position.set(side * 0.14, 0.62, 0);

        // Thigh (Đùi)
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.26, 12), pantsMat);
        thigh.position.set(0, -0.13, 0);
        thigh.castShadow = true;
        hipGroup.add(thigh);

        // Knee Joint (Khớp đầu gối)
        const kneeGroup = new THREE.Group();
        kneeGroup.position.set(0, -0.26, 0);

        const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), pantsMat);
        kneeJoint.castShadow = true;
        kneeGroup.add(kneeJoint);

        // Shin / Calf (Cẳng chân)
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.055, 0.24, 12), pantsMat);
        shin.position.set(0, -0.12, 0);
        shin.castShadow = true;
        kneeGroup.add(shin);

        // Ankle & Shoe (Giày)
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

      // --- CONTACT SHADOW DISC ---
      const shadowGeo = new THREE.CircleGeometry(0.42, 24);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.015;
      this.playerMesh.add(shadowMesh);

      // Scale avatar to human proportions
      this.playerMesh.scale.set(0.85, 0.85, 0.85);
      this.playerMesh.rotation.y = Math.PI; // Face forward into the room towards desk
      this.playerMesh.position.set(this.player.pos.x, 0, this.player.pos.z);
      this.scene.add(this.playerMesh);
    }

    buildRoomArchitecture() {
      const roomW = 10;
      const roomL = 10;
      const roomH = 4.2;

      // Floor (Wooden Parquet)
      const floorTex = createWoodTexture();
      floorTex.repeat.set(4, 4);
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.5,
        metalness: 0.1
      });
      const floorGeo = new THREE.PlaneGeometry(roomW, roomL);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);

      // Ceiling
      const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
      const ceilMesh = new THREE.Mesh(floorGeo, ceilMat);
      ceilMesh.position.y = roomH;
      ceilMesh.rotation.x = Math.PI / 2;
      this.scene.add(ceilMesh);

      // Walls (Warm modern plaster)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
      const wallAccentMat = new THREE.MeshStandardMaterial({ color: 0x0f253e, roughness: 0.8 });

      // Back Wall (-Z)
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallAccentMat);
      backWall.position.set(0, roomH / 2, -roomL / 2);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      // Front Wall (+Z)
      const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      frontWall.position.set(0, roomH / 2, roomL / 2);
      frontWall.rotation.y = Math.PI;
      frontWall.receiveShadow = true;
      this.scene.add(frontWall);

      // Left Wall (-X)
      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), wallMat);
      leftWall.position.set(-roomW / 2, roomH / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);

      // Right Wall (+X)
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), wallMat);
      rightWall.position.set(roomW / 2, roomH / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.receiveShadow = true;
      this.scene.add(rightWall);

      // Baseboards (Trang trí chân tường)
      const trimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const trimGeoX = new THREE.BoxGeometry(roomW, 0.16, 0.06);
      const trimGeoZ = new THREE.BoxGeometry(0.06, 0.16, roomL);

      const trimBack = new THREE.Mesh(trimGeoX, trimMat);
      trimBack.position.set(0, 0.08, -roomL / 2 + 0.03);
      this.scene.add(trimBack);

      const trimFront = new THREE.Mesh(trimGeoX, trimMat);
      trimFront.position.set(0, 0.08, roomL / 2 - 0.03);
      this.scene.add(trimFront);

      const trimLeft = new THREE.Mesh(trimGeoZ, trimMat);
      trimLeft.position.set(-roomW / 2 + 0.03, 0.08, 0);
      this.scene.add(trimLeft);

      const trimRight = new THREE.Mesh(trimGeoZ, trimMat);
      trimRight.position.set(roomW / 2 - 0.03, 0.08, 0);
      this.scene.add(trimRight);

      // Round Cozy Center Carpet
      const rugTex = createRugTexture();
      const rugMat = new THREE.MeshStandardMaterial({
        map: rugTex,
        roughness: 0.9,
        metalness: 0.05
      });
      const rug = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), rugMat);
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(0, 0.005, 0.4);
      rug.receiveShadow = true;
      this.scene.add(rug);
    }

    buildInteractiveObjects() {
      const DESK_SURFACE_Y = 0.92;

      // 1. DESK (Bàn làm việc)
      this.objectMeshFactories.desk = () => {
        if (this.loadedModels.desk) {
          return this.fitModelToBounds(this.loadedModels.desk, { targetHeight: DESK_SURFACE_Y });
        }
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5, metalness: 0.1 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });

        // Tabletop
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.2), woodMat);
        top.position.y = DESK_SURFACE_Y - 0.04;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);

        // Desk mat
        const mat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.01, 0.6), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
        mat.position.set(0, DESK_SURFACE_Y + 0.005, 0.05);
        group.add(mat);

        // 4 Legs
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, DESK_SURFACE_Y - 0.08, 16);
        const legOffsets = [
          [-1.0, (DESK_SURFACE_Y - 0.08) / 2, -0.5],
          [1.0, (DESK_SURFACE_Y - 0.08) / 2, -0.5],
          [-1.0, (DESK_SURFACE_Y - 0.08) / 2, 0.5],
          [1.0, (DESK_SURFACE_Y - 0.08) / 2, 0.5]
        ];
        legOffsets.forEach(pos => {
          const leg = new THREE.Mesh(legGeo, metalMat);
          leg.position.set(pos[0], pos[1], pos[2]);
          leg.castShadow = true;
          group.add(leg);
        });

        // Drawer unit
        const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 1.0), woodMat);
        drawer.position.set(0.7, 0.65, 0);
        drawer.castShadow = true;
        group.add(drawer);

        return group;
      };

      const desk = this.objectMeshFactories.desk();
      desk.position.set(0, 0, -3.4);
      this.registerInteractable(desk, 'desk');
      this.scene.add(desk);

      // 2. CHAIR (Ghế xoay làm việc)
      this.objectMeshFactories.chair = () => {
        if (this.loadedModels.chair) {
          return this.fitModelToBounds(this.loadedModels.chair, { targetHeight: 1.05, rotationY: Math.PI });
        }
        const group = new THREE.Group();
        const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.85 });

        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.65), cushionMat);
        seat.position.y = 0.52;
        seat.castShadow = true;
        group.add(seat);

        // Backrest
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.08), cushionMat);
        back.position.set(0, 0.82, 0.28);
        back.castShadow = true;
        group.add(back);

        // Central pole & Base
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.48, 16), metalMat);
        pole.position.y = 0.24;
        pole.castShadow = true;
        group.add(pole);

        // 5 Star base wheels
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.35), metalMat);
          arm.position.set(Math.sin(angle) * 0.18, 0.05, Math.cos(angle) * 0.18);
          arm.rotation.y = angle;
          group.add(arm);
        }

        return group;
      };

      const chair = this.objectMeshFactories.chair();
      chair.position.set(0, 0, -2.15);
      this.registerInteractable(chair, 'chair');
      this.scene.add(chair);

      // 3. LAPTOP (Máy tính xách tay)
      this.objectMeshFactories.laptop = () => {
        if (this.loadedModels.laptop) {
          return this.fitModelToBounds(this.loadedModels.laptop, { targetWidth: 0.50, rotationY: Math.PI });
        }
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
        const screenTex = createScreenTexture();
        const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });

        // Base Keyboard
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.34), bodyMat);
        base.position.y = 0.01;
        base.castShadow = true;
        group.add(base);

        // Keyboard keys area
        const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.005, 0.19), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        kb.position.set(0, 0.022, -0.04);
        group.add(kb);

        // Screen Lid (Tilted back ~110 deg)
        const lidGroup = new THREE.Group();
        lidGroup.position.set(0, 0.02, -0.16);

        const lid = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.015), bodyMat);
        lid.position.set(0, 0.16, 0);
        lid.castShadow = true;
        lidGroup.add(lid);

        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.29), screenMat);
        screen.position.set(0, 0.16, 0.009);
        lidGroup.add(screen);

        lidGroup.rotation.x = THREE.MathUtils.degToRad(-20);
        group.add(lidGroup);

        return group;
      };

      const laptop = this.objectMeshFactories.laptop();
      laptop.position.set(0, DESK_SURFACE_Y, -3.38);
      this.registerInteractable(laptop, 'laptop');
      this.scene.add(laptop);

      // 4. DESK LAMP (Đèn bàn phát sáng)
      this.objectMeshFactories.lamp = () => {
        if (this.loadedModels.lamp) {
          return this.fitModelToBounds(this.loadedModels.lamp, { targetHeight: 0.60 });
        }
        const group = new THREE.Group();
        const metalMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
        const jointMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
        const shadeOuterMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7, side: THREE.DoubleSide });
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });

        // Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.028, 32), metalMat);
        base.position.y = 0.014;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Power switch button on base
        const pBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 16), jointMat);
        pBtn.position.set(0, 0.032, 0.08);
        group.add(pBtn);

        // Lower swivel bracket
        const lowerJoint = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), jointMat);
        lowerJoint.position.set(0, 0.045, -0.04);
        group.add(lowerJoint);

        // Lower arm (Tilted backward slightly)
        const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 16), metalMat);
        arm1.position.set(0, 0.20, -0.08);
        arm1.rotation.x = -0.26;
        arm1.castShadow = true;
        group.add(arm1);

        // Middle elbow joint
        const midJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16), jointMat);
        midJoint.position.set(0, 0.36, -0.12);
        midJoint.rotation.z = Math.PI / 2;
        group.add(midJoint);

        // Upper arm (Reaching forward over the table)
        const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 16), metalMat);
        arm2.position.set(0, 0.46, 0.03);
        arm2.rotation.x = 0.85;
        arm2.castShadow = true;
        group.add(arm2);

        // Head joint
        const headJoint = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), jointMat);
        headJoint.position.set(0, 0.58, 0.17);
        group.add(headJoint);

        // Lamp Shade & Bulb Group (Hanging downward from arm joint)
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.58, 0.17);

        // Conical lampshade — rotated 180° so wide opening faces DOWN
        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.20, 28, 1, true), shadeOuterMat);
        shade.rotation.x = Math.PI;
        shade.position.y = -0.10;
        shade.castShadow = true;
        headGroup.add(shade);

        // Bulb inside shade
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 20), bulbMat);
        bulb.position.y = -0.07;
        headGroup.add(bulb);

        group.add(headGroup);

        return group;
      };

      const lamp = this.objectMeshFactories.lamp();
      lamp.position.set(-0.65, DESK_SURFACE_Y, -3.3);
      lamp.rotation.y = 0.2;
      this.registerInteractable(lamp, 'lamp');
      this.scene.add(lamp);

      // Local spotlight for lamp pointing directly at desk surface
      this.lampLight = new THREE.SpotLight(0xfffae0, 1.8, 6, Math.PI / 3.5, 0.4, 1.2);
      this.lampLight.position.set(-0.65, DESK_SURFACE_Y + 0.60, -3.1);
      this.lampLight.target.position.set(-0.25, DESK_SURFACE_Y, -3.4);
      this.scene.add(this.lampLight);
      this.scene.add(this.lampLight.target);

      // 5. COFFEE CUP (Tách cà phê bốc khói)
      this.objectMeshFactories.coffee = () => {
        const group = new THREE.Group();
        const cupMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3f2211, roughness: 0.1 });

        // Cup body
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 24), cupMat);
        body.position.y = 0.06;
        body.castShadow = true;
        group.add(body);

        // Coffee liquid
        const liquid = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), coffeeMat);
        liquid.position.y = 0.11;
        liquid.rotation.x = -Math.PI / 2;
        group.add(liquid);

        // Handle
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 12, 24), cupMat);
        handle.position.set(0.07, 0.06, 0);
        group.add(handle);

        // Saucer plate
        const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.015, 24), cupMat);
        saucer.position.y = 0.008;
        group.add(saucer);

        return group;
      };

      const coffee = this.objectMeshFactories.coffee();
      coffee.position.set(0.60, DESK_SURFACE_Y, -3.3);
      this.registerInteractable(coffee, 'coffee');
      this.scene.add(coffee);

      // Coffee Steam Particles
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25
      });
      const steamBaseY = DESK_SURFACE_Y + 0.12;
      for (let i = 0; i < 6; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), smokeMat);
        p.position.set(0.60 + (Math.random() - 0.5) * 0.04, steamBaseY + i * 0.06, -3.3 + (Math.random() - 0.5) * 0.04);
        p.userData = { speedY: 0.003 + Math.random() * 0.002, initY: steamBaseY };
        this.smokeParticles.push(p);
        this.scene.add(p);
      }

      // 6. WALL CLOCK (Đồng hồ treo tường kim quay chuẩn tâm)
      this.objectMeshFactories.clock = () => {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
        const innerRimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const faceTex = createClockFaceTexture();
        const faceMat = new THREE.MeshBasicMaterial({ map: faceTex });
        const handMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const secMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

        // Outer Rim (Gold bezel)
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 48), frameMat);
        rim.rotation.x = Math.PI / 2;
        rim.castShadow = true;
        group.add(rim);

        // Inner dark border ring
        const innerRim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.082, 48), innerRimMat);
        innerRim.rotation.x = Math.PI / 2;
        group.add(innerRim);

        // Dial Face
        const face = new THREE.Mesh(new THREE.CircleGeometry(0.44, 48), faceMat);
        face.position.z = 0.044;
        group.add(face);

        // Hour Hand Pivot (Center = 0, 0)
        const hourPivot = new THREE.Group();
        hourPivot.position.set(0, 0, 0.048);
        const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.22, 0.006), handMat);
        hourHand.position.y = 0.09; // Offset from center pivot
        hourPivot.add(hourHand);
        hourPivot.rotation.z = -Math.PI * 0.32; // ~2:00
        group.add(hourPivot);

        // Minute Hand Pivot (Center = 0, 0)
        const minPivot = new THREE.Group();
        minPivot.position.set(0, 0, 0.051);
        const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.32, 0.006), handMat);
        minHand.position.y = 0.14; // Offset from center pivot
        minPivot.add(minHand);
        minPivot.rotation.z = -Math.PI * 0.02; // ~12:00
        group.add(minPivot);

        // Second Hand Pivot (Center = 0, 0)
        const secPivot = new THREE.Group();
        secPivot.position.set(0, 0, 0.054);
        const secHand = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.34, 0.004), secMat);
        secHand.position.y = 0.12; // Pointing outward
        secPivot.add(secHand);

        const secTail = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.08, 0.004), secMat);
        secTail.position.y = -0.035; // Counterbalance tail
        secPivot.add(secTail);

        group.add(secPivot);
        group.userData.secPivot = secPivot;

        // Center Pin / Cap covering center of all hands
        const centerPin = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 24), frameMat);
        centerPin.rotation.x = Math.PI / 2;
        centerPin.position.set(0, 0, 0.058);
        group.add(centerPin);

        return group;
      };

      const clock = this.objectMeshFactories.clock();
      clock.position.set(0, 2.9, -4.95);
      this.clockHandSec = clock.userData.secPivot;
      this.registerInteractable(clock, 'clock');
      this.scene.add(clock);

      // 7. BOOKSHELF & BOOKS (Kệ sách & Sách phong phú)
      this.objectMeshFactories.bookshelf = () => {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c2b0c, roughness: 0.65, metalness: 0.08 });
        const backPanelMat = new THREE.MeshStandardMaterial({ color: 0x3d1c07, roughness: 0.8 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });
        const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });

        // Bookcase Outer Frame
        const frameW = 2.2;
        const frameH = 2.5;
        const frameD = 0.48;
        const wallThick = 0.06;

        // Back wall of bookcase
        const backPanel = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, 0.03), backPanelMat);
        backPanel.position.set(0, frameH / 2, -frameD / 2 + 0.015);
        backPanel.receiveShadow = true;
        group.add(backPanel);

        // Left & Right Outer Sides
        const sideL = new THREE.Mesh(new THREE.BoxGeometry(wallThick, frameH, frameD), woodMat);
        sideL.position.set(-frameW / 2 + wallThick / 2, frameH / 2, 0);
        sideL.castShadow = true;
        sideL.receiveShadow = true;
        group.add(sideL);

        const sideR = new THREE.Mesh(new THREE.BoxGeometry(wallThick, frameH, frameD), woodMat);
        sideR.position.set(frameW / 2 - wallThick / 2, frameH / 2, 0);
        sideR.castShadow = true;
        sideR.receiveShadow = true;
        group.add(sideR);

        // Top Crown & Bottom Plinth
        const topCrown = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.08, wallThick + 0.02, frameD + 0.06), woodMat);
        topCrown.position.set(0, frameH - wallThick / 2, 0);
        topCrown.castShadow = true;
        group.add(topCrown);

        const bottomBase = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.04, 0.10, frameD + 0.04), woodMat);
        bottomBase.position.set(0, 0.05, 0);
        bottomBase.receiveShadow = true;
        group.add(bottomBase);

        // Shelf Colors Palette for realistic variety
        const bookPalettes = [
          0xd97706, 0x2563eb, 0xdc2626, 0x16a34a, 0x7c3aed,
          0x0284c7, 0xe11d48, 0x059669, 0x9333ea, 0xb45309,
          0x4338ca, 0x0891b2, 0xbe123c, 0x15803d, 0x6d28d9,
          0x1e293b, 0x854d0e, 0x9f1239, 0x1e40af, 0x065f46
        ];

        const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });

        // Helper to generate a single book
        const createBook = (bW, bH, bD, color, tiltZ = 0) => {
          const bGroup = new THREE.Group();
          const coverMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.15 });

          // Hardcover
          const cover = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), coverMat);
          cover.position.set(0, bH / 2, 0);
          cover.castShadow = true;
          cover.receiveShadow = true;
          bGroup.add(cover);

          // White/Cream Pages Edge (set slightly inward)
          const pages = new THREE.Mesh(new THREE.BoxGeometry(bW - 0.008, bH - 0.016, bD - 0.016), pagesMat);
          pages.position.set(0, bH / 2, -0.006);
          bGroup.add(pages);

          // Golden embossed spine band (facing front +Z)
          const spineBand = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.002, 0.024, 0.008), goldMat);
          spineBand.position.set(0, bH * 0.72, bD / 2 + 0.001);
          bGroup.add(spineBand);

          const spineBand2 = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.002, 0.024, 0.008), goldMat);
          spineBand2.position.set(0, bH * 0.28, bD / 2 + 0.001);
          bGroup.add(spineBand2);

          if (tiltZ !== 0) {
            bGroup.rotation.z = tiltZ;
          }
          return bGroup;
        };

        // Helper to generate a horizontal pile of books
        const createBookStack = (count, startColorIdx) => {
          const stackGroup = new THREE.Group();
          let stackY = 0;
          for (let i = 0; i < count; i++) {
            const bW = 0.30 + Math.random() * 0.06;
            const bH = 0.05 + Math.random() * 0.025;
            const bD = 0.24 + Math.random() * 0.04;
            const col = bookPalettes[(startColorIdx + i * 3) % bookPalettes.length];
            const coverMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45 });

            const book = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), coverMat);
            book.position.set((Math.random() - 0.5) * 0.02, stackY + bH / 2, (Math.random() - 0.5) * 0.02);
            book.castShadow = true;
            stackGroup.add(book);

            stackY += bH;
          }
          return stackGroup;
        };

        // 4 Horizontal Shelves
        const shelfYPositions = [0.12, 0.68, 1.24, 1.80];

        shelfYPositions.forEach((shelfY, shelfIdx) => {
          // Shelf Board
          const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(frameW - wallThick * 2, wallThick, frameD - 0.02), woodMat);
          shelfMesh.position.set(0, shelfY, 0);
          shelfMesh.receiveShadow = true;
          shelfMesh.castShadow = true;
          group.add(shelfMesh);

          const innerW = frameW - wallThick * 2 - 0.16;
          const shelfTopY = shelfY + wallThick / 2;
          let curX = -innerW / 2;

          // Populate Shelf with diverse, realistic sets of books
          if (shelfIdx === 0) {
            // SHELF 0: Heavy Dictionaries, Encyclopedias & Reference Volumes
            while (curX < innerW / 2 - 0.4) {
              const bW = 0.07 + Math.random() * 0.045;
              const bH = 0.44 + Math.random() * 0.08;
              const bD = 0.32 + Math.random() * 0.04;
              const col = bookPalettes[Math.floor(Math.random() * bookPalettes.length)];
              const b = createBook(bW, bH, bD, col);
              b.position.set(curX + bW / 2, shelfTopY, 0.02);
              group.add(b);
              curX += bW + 0.008;
            }

            // Stack of 3 large textbooks on the right
            const stack = createBookStack(3, 4);
            stack.position.set(innerW / 2 - 0.18, shelfTopY, 0.02);
            group.add(stack);

          } else if (shelfIdx === 1) {
            // SHELF 1: Language Courses (TOCFL / HSK), Leaning Books & Bookends
            // Section 1: Upright Series
            for (let i = 0; i < 9; i++) {
              const bW = 0.065 + Math.random() * 0.03;
              const bH = 0.38 + Math.random() * 0.08;
              const bD = 0.28 + Math.random() * 0.04;
              const col = bookPalettes[(i * 2 + 1) % bookPalettes.length];
              const b = createBook(bW, bH, bD, col);
              b.position.set(curX + bW / 2, shelfTopY, 0.02);
              group.add(b);
              curX += bW + 0.006;
            }

            // 2 Leaning Books
            const lean1 = createBook(0.065, 0.40, 0.30, 0xdc2626, -0.22);
            lean1.position.set(curX + 0.08, shelfTopY, 0.02);
            group.add(lean1);

            const lean2 = createBook(0.065, 0.42, 0.30, 0xd97706, -0.24);
            lean2.position.set(curX + 0.14, shelfTopY, 0.02);
            group.add(lean2);
            curX += 0.26;

            // Section 2: More study books
            while (curX < innerW / 2 - 0.35) {
              const bW = 0.06 + Math.random() * 0.035;
              const bH = 0.36 + Math.random() * 0.08;
              const bD = 0.28 + Math.random() * 0.03;
              const col = bookPalettes[(curX.toFixed(2) * 100) % bookPalettes.length | 0];
              const b = createBook(bW, bH, bD, col);
              b.position.set(curX + bW / 2, shelfTopY, 0.02);
              group.add(b);
              curX += bW + 0.006;
            }

            // Stack on right
            const stack = createBookStack(4, 8);
            stack.position.set(innerW / 2 - 0.16, shelfTopY, 0.02);
            group.add(stack);

          } else if (shelfIdx === 2) {
            // SHELF 2: Colorful Novels, Study Guides (Space on left for interactive mini_plant)
            curX += 0.28;

            // Dense series of colorful books
            while (curX < innerW / 2 - 0.22) {
              const bW = 0.055 + Math.random() * 0.035;
              const bH = 0.35 + Math.random() * 0.10;
              const bD = 0.27 + Math.random() * 0.04;
              const col = bookPalettes[Math.floor(Math.random() * bookPalettes.length)];
              const b = createBook(bW, bH, bD, col);
              b.position.set(curX + bW / 2, shelfTopY, 0.02);
              group.add(b);
              curX += bW + 0.007;
            }

            // Leaning book at right edge
            const leanR = createBook(0.06, 0.38, 0.28, 0x7c3aed, 0.20);
            leanR.position.set(innerW / 2 - 0.08, shelfTopY, 0.02);
            group.add(leanR);

          } else if (shelfIdx === 3) {
            // SHELF 3: Literature, Notebooks (Space on right for interactive trophy)
            // Left stack
            const stackL = createBookStack(3, 12);
            stackL.position.set(curX + 0.16, shelfTopY, 0.02);
            group.add(stackL);
            curX += 0.38;

            // Books across middle
            while (curX < innerW / 2 - 0.40) {
              const bW = 0.06 + Math.random() * 0.04;
              const bH = 0.34 + Math.random() * 0.09;
              const bD = 0.26 + Math.random() * 0.04;
              const col = bookPalettes[Math.floor(Math.random() * bookPalettes.length)];
              const b = createBook(bW, bH, bD, col);
              b.position.set(curX + bW / 2, shelfTopY, 0.02);
              group.add(b);
              curX += bW + 0.008;
            }
          }
        });

        return group;
      };

      const bookshelf = this.objectMeshFactories.bookshelf();
      bookshelf.position.set(-4.55, 0, -2.0);
      bookshelf.rotation.y = Math.PI / 2;
      this.registerInteractable(bookshelf, 'bookshelf');
      this.scene.add(bookshelf);

      // 7b. TROPHY ON TOP SHELF (Cúp vinh danh trên kệ sách)
      this.objectMeshFactories.trophy = () => {
        const group = new THREE.Group();
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.25,
          metalness: 0.85,
          emissive: 0x78350f,
          emissiveIntensity: 0.2
        });
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 });
        const gemMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.5 });

        // Octagonal/Cylindrical Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.08, 16), baseMat);
        base.position.y = 0.04;
        base.castShadow = true;
        group.add(base);

        // Gold Plaque on base
        const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.01), goldMat);
        plaque.position.set(0, 0.04, 0.115);
        group.add(plaque);

        // Stem
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.10, 16), goldMat);
        stem.position.y = 0.13;
        stem.castShadow = true;
        group.add(stem);

        // Main Cup Body
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.04, 0.22, 24), goldMat);
        cup.position.y = 0.29;
        cup.castShadow = true;
        group.add(cup);

        // Cup Rim Torus
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 12, 24), goldMat);
        rim.position.y = 0.40;
        rim.rotation.x = Math.PI / 2;
        group.add(rim);

        // Side Handles (Tai cúp 2 bên)
        for (let side of [-1, 1]) {
          const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 12, 20, Math.PI), goldMat);
          handle.position.set(side * 0.16, 0.32, 0);
          handle.rotation.z = side * Math.PI / 2;
          group.add(handle);
        }

        // Star on Top / Gem
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), gemMat);
        star.position.y = 0.40;
        group.add(star);

        return group;
      };

      const trophy = this.objectMeshFactories.trophy();
      trophy.position.set(-4.53, 1.83, -2.72);
      this.registerInteractable(trophy, 'trophy');
      this.scene.add(trophy);

      // 7c. MINI POTTED SUCCULENT (Chậu cây sen đá mini trên kệ sách)
      this.objectMeshFactories.mini_plant = () => {
        const group = new THREE.Group();
        const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x3f2211, roughness: 0.9 });
        const plantMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
        const tipMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });

        // Ceramic Geometric Pot
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.14, 8), potMat);
        pot.position.y = 0.07;
        pot.castShadow = true;
        group.add(pot);

        // Soil
        const soil = new THREE.Mesh(new THREE.CircleGeometry(0.10, 16), soilMat);
        soil.position.y = 0.138;
        soil.rotation.x = -Math.PI / 2;
        group.add(soil);

        // Succulent Rosette Petals (Lá sen đá xòe nhiều tầng)
        for (let tier = 0; tier < 3; tier++) {
          const count = 6 + tier * 2;
          const radius = 0.08 - tier * 0.02;
          const y = 0.15 + tier * 0.035;
          for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count + tier * 0.4;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), tier === 2 ? tipMat : plantMat);
            petal.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            petal.rotation.set(0.6 * Math.cos(angle), -angle, -0.6 * Math.sin(angle));
            petal.castShadow = true;
            group.add(petal);
          }
        }

        return group;
      };

      const miniPlant = this.objectMeshFactories.mini_plant();
      miniPlant.position.set(-4.51, 1.27, -1.25);
      this.registerInteractable(miniPlant, 'mini_plant');
      this.scene.add(miniPlant);

      // 7d. DESKTOP GLOBE (Quả địa cầu để bàn trên kệ sách)
      this.objectMeshFactories.globe = () => {
        const group = new THREE.Group();
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
        const landMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });

        // Wooden Circular Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.035, 24), baseMat);
        base.position.y = 0.017;
        base.castShadow = true;
        group.add(base);

        // Brass Center Stem
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 16), brassMat);
        stem.position.y = 0.08;
        stem.castShadow = true;
        group.add(stem);

        // Meridian Semi-Circle Arm (Vòng cung đỡ địa cầu)
        const armGeo = new THREE.TorusGeometry(0.16, 0.014, 12, 24, Math.PI * 1.15);
        const arm = new THREE.Mesh(armGeo, brassMat);
        arm.position.set(0, 0.23, 0);
        arm.rotation.z = Math.PI * 0.42;
        group.add(arm);

        // Globe Sphere (tilted at 23.5 degrees)
        const sphereGroup = new THREE.Group();
        sphereGroup.position.set(0, 0.23, 0);
        sphereGroup.rotation.z = 0.41; // 23.5 degrees axial tilt

        const ocean = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), oceanMat);
        ocean.castShadow = true;
        sphereGroup.add(ocean);

        // Continents / Green patches on Earth
        for (let i = 0; i < 7; i++) {
          const lat = (Math.random() - 0.5) * Math.PI * 0.8;
          const lon = Math.random() * Math.PI * 2;
          const land = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.035, 12, 12), landMat);
          land.position.set(
            0.125 * Math.cos(lat) * Math.sin(lon),
            0.125 * Math.sin(lat),
            0.125 * Math.cos(lat) * Math.cos(lon)
          );
          sphereGroup.add(land);
        }

        group.add(sphereGroup);
        return group;
      };

      const globe = this.objectMeshFactories.globe();
      globe.position.set(-4.52, 0.71, -2.65);
      this.registerInteractable(globe, 'globe');
      this.scene.add(globe);

      // 8. INDOOR PLANT (Chậu cây cảnh)
      this.objectMeshFactories.plant = () => {
        if (this.loadedModels.plant) {
          return this.fitModelToBounds(this.loadedModels.plant, { targetHeight: 1.50 });
        }
        const group = new THREE.Group();
        const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

        // Ceramic Pot
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.55, 24), potMat);
        pot.position.y = 0.275;
        pot.castShadow = true;
        group.add(pot);

        // Soil
        const soil = new THREE.Mesh(new THREE.CircleGeometry(0.33, 24), new THREE.MeshStandardMaterial({ color: 0x3f2211 }));
        soil.position.y = 0.54;
        soil.rotation.x = -Math.PI / 2;
        group.add(soil);

        // Lush Leaves
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI * 2) / 12;
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), leafMat);
          leaf.scale.set(0.45, 1.4, 0.12);
          leaf.position.set(Math.sin(angle) * 0.22, 0.85 + (i % 4) * 0.12, Math.cos(angle) * 0.22);
          leaf.rotation.set(0.45 * Math.cos(angle), angle, -0.45 * Math.sin(angle));
          leaf.castShadow = true;
          group.add(leaf);
        }

        return group;
      };

      const plant = this.objectMeshFactories.plant();
      plant.position.set(-4.3, 0, 1.8);
      this.registerInteractable(plant, 'plant');
      this.scene.add(plant);

      // 9. BED (Giường ngủ)
      this.objectMeshFactories.bed = () => {
        if (this.loadedModels.bed) {
          return this.fitModelToBounds(this.loadedModels.bed, { targetDepth: 2.40 });
        }
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
        const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
        const duvetMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.8 });
        const pillowMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });

        // Bed Frame & Legs
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.30, 2.40), frameMat);
        frame.position.set(0, 0.20, 0);
        frame.castShadow = true;
        group.add(frame);

        // Headboard
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.10, 0.12), frameMat);
        headboard.position.set(0, 0.75, -1.14);
        headboard.castShadow = true;
        group.add(headboard);

        // Mattress
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 2.25), mattressMat);
        mattress.position.set(0, 0.45, 0.05);
        group.add(mattress);

        // Duvet Blanket
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.16, 1.6), duvetMat);
        duvet.position.set(0, 0.56, 0.35);
        duvet.castShadow = true;
        group.add(duvet);

        // Pillows
        const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.48), pillowMat);
        pillow1.position.set(-0.50, 0.65, -0.75);
        group.add(pillow1);

        const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.48), pillowMat);
        pillow2.position.set(0.50, 0.65, -0.75);
        group.add(pillow2);

        return group;
      };

      const bed = this.objectMeshFactories.bed();
      bed.position.set(3.6, 0, -3.2);
      this.registerInteractable(bed, 'bed');
      this.scene.add(bed);

      // 10. WINDOW (Cửa sổ ngắm cảnh)
      this.objectMeshFactories.window = () => {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const skyTex = createWindowSkyTexture();
        const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });

        // Outer Frame
        const wW = 2.6;
        const wH = 2.2;
        const frame = new THREE.Mesh(new THREE.BoxGeometry(wW, wH, 0.08), frameMat);
        group.add(frame);

        // Glass Pane with outdoor landscape
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(wW - 0.16, wH - 0.16), skyMat);
        glass.position.z = 0.045;
        group.add(glass);

        // Cross Grids
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, wH, 0.06), frameMat);
        vBar.position.z = 0.05;
        group.add(vBar);

        const hBar = new THREE.Mesh(new THREE.BoxGeometry(wW, 0.04, 0.06), frameMat);
        hBar.position.z = 0.05;
        group.add(hBar);

        // Window Sill
        const sill = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.3, 0.08, 0.25), frameMat);
        sill.position.set(0, -wH / 2, 0.1);
        group.add(sill);

        return group;
      };

      const win = this.objectMeshFactories.window();
      win.position.set(4.95, 2.2, 0.2);
      win.rotation.y = -Math.PI / 2;
      this.registerInteractable(win, 'window');
      this.scene.add(win);

      // 11. GUITAR (Đàn Guitar Acoustic)
      this.objectMeshFactories.guitar = () => {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
        const neckMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

        // Body 8-shape
        const lowerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.10, 24), woodMat);
        lowerBody.rotation.x = Math.PI / 2;
        lowerBody.position.y = 0.32;
        group.add(lowerBody);

        const upperBody = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.10, 24), woodMat);
        upperBody.rotation.x = Math.PI / 2;
        upperBody.position.y = 0.70;
        group.add(upperBody);

        // Sound Hole
        const hole = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), holeMat);
        hole.position.set(0, 0.60, 0.052);
        group.add(hole);

        // Neck
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.65, 0.045), neckMat);
        neck.position.set(0, 1.12, 0);
        group.add(neck);

        // Headstock
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.18, 0.038), woodMat);
        head.position.set(0, 1.50, 0.01);
        group.add(head);

        return group;
      };

      const guitar = this.objectMeshFactories.guitar();
      guitar.position.set(4.4, 0, 2.8);
      guitar.rotation.set(-0.25, -Math.PI / 3, 0.15);
      this.registerInteractable(guitar, 'guitar');
      this.scene.add(guitar);

      // 12. BACKPACK (Balo đi học - Chi tiết cao cấp có bo viền & texture)
      this.objectMeshFactories.backpack = () => {
        const group = new THREE.Group();

        // Procedural Textures
        const mainFabricTex = createBackpackFabricTexture('#1e3a8a', '#172554', '#38bdf8');
        const frontFabricTex = createBackpackFabricTexture('#0284c7', '#0369a1', '#7dd3fc');
        const strapFabricTex = createBackpackFabricTexture('#0f172a', '#1e293b', '#0ea5e9');

        // High-Quality Materials
        const mainBagMat = new THREE.MeshStandardMaterial({
          map: mainFabricTex,
          roughness: 0.65,
          metalness: 0.05
        });
        const frontPocketMat = new THREE.MeshStandardMaterial({
          map: frontFabricTex,
          roughness: 0.6,
          metalness: 0.05
        });
        const strapMat = new THREE.MeshStandardMaterial({
          map: strapFabricTex,
          roughness: 0.8
        });
        const pipingMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          roughness: 0.35,
          metalness: 0.2
        });
        const rubberBaseMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.9,
          metalness: 0.1
        });
        const metalZipMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.25,
          metalness: 0.9
        });
        const reflectiveStripMat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.6,
          roughness: 0.2
        });
        const bottleMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.2,
          metalness: 0.85
        });
        const bottleCapMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.4
        });
        const badgeMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.4,
          metalness: 0.3
        });

        const bW = 0.40;
        const bD = 0.24;
        const baseH = 0.05;
        const boxH = 0.32;
        const domeR = bW / 2; // 0.20
        const domeHeight = 0.14;
        const pipeRadius = 0.012;

        // --- 1. REINFORCED RUBBER BOTTOM BASE ---
        const baseBox = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.01, baseH, bD + 0.01), rubberBaseMat);
        baseBox.position.y = baseH / 2;
        baseBox.castShadow = true;
        group.add(baseBox);

        // 4 Bottom Rubber Feet Studs
        for (let sx of [-1, 1]) {
          for (let sz of [-1, 1]) {
            const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.012, 12), rubberBaseMat);
            foot.position.set(sx * (bW / 2 - 0.035), 0.006, sz * (bD / 2 - 0.035));
            group.add(foot);
          }
        }

        // --- 2. MAIN POUCH LOWER BOX ---
        const mainBox = new THREE.Mesh(new THREE.BoxGeometry(bW, boxH, bD), mainBagMat);
        mainBox.position.set(0, baseH + boxH / 2, 0); // Center at y = 0.21
        mainBox.castShadow = true;
        mainBox.receiveShadow = true;
        group.add(mainBox);

        // --- 3. TOP DOME CROWN (Khối vòm đầu balo mượt mà khít liền) ---
        const domeGeo = new THREE.SphereGeometry(domeR, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeo, mainBagMat);
        domeMesh.scale.set(1.0, domeHeight / domeR, bD / (domeR * 2));
        domeMesh.position.set(0, baseH + boxH, 0); // y = 0.37
        domeMesh.castShadow = true;
        group.add(domeMesh);

        // --- 4. DECORATIVE TRIM LINES (Đường chỉ viền mặt trước, không có khung lộ) ---
        const pZ = bD / 2; // 0.12
        const pY_boxCenter = baseH + boxH / 2;

        // Horizontal trim strip bottom of main body (Đường viền ngang dưới thân)
        const trimBottom = new THREE.Mesh(
          new THREE.BoxGeometry(bW + 0.005, 0.012, 0.012),
          pipingMat
        );
        trimBottom.position.set(0, baseH + 0.025, 0);
        group.add(trimBottom);

        // Horizontal trim strip upper of main body (Đường viền ngang giữa thân)
        const trimMid = new THREE.Mesh(
          new THREE.BoxGeometry(bW + 0.005, 0.010, 0.012),
          pipingMat
        );
        trimMid.position.set(0, baseH + boxH - 0.025, 0);
        group.add(trimMid);

        // Side edge accent strips (chạy dọc hai cạnh bên mỏng hơn)
        for (let side of [-1, 1]) {
          const edgeTrim = new THREE.Mesh(
            new THREE.BoxGeometry(0.010, boxH, 0.012),
            pipingMat
          );
          edgeTrim.position.set(side * (bW / 2 + 0.003), pY_boxCenter, 0);
          group.add(edgeTrim);
        }

        // --- 5. MAIN ZIPPER TRACK & METAL PULL TABS (dọc theo đỉnh vòm) ---
        const zipTrack = new THREE.Mesh(
          new THREE.TorusGeometry(domeR * 0.92, 0.007, 8, 24, Math.PI),
          metalZipMat
        );
        zipTrack.scale.set(1.0, (domeHeight) / (domeR * 0.92), 1.0);
        zipTrack.position.set(0, baseH + boxH, 0);
        group.add(zipTrack);

        // Zipper sliders & pull tabs on crown
        for (let pullX of [-0.025, 0.025]) {
          const slider = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.020, 0.018), metalZipMat);
          slider.position.set(pullX, baseH + boxH + domeHeight + 0.003, 0);
          group.add(slider);

          const pullTab = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.032, 0.005), pipingMat);
          pullTab.position.set(pullX, baseH + boxH + domeHeight - 0.018, 0.01);
          pullTab.rotation.x = 0.15;
          group.add(pullTab);
        }

        // --- 6. FRONT UTILITY POCKET (Ngăn phụ trước có viền & dải phản quang) ---
        const fW = 0.30;
        const fH = 0.22;
        const fD = 0.07;
        const fY = baseH + 0.12; // 0.17
        const fZ = pZ + fD / 2; // 0.12 + 0.035 = 0.155

        const frontPocket = new THREE.Mesh(new THREE.BoxGeometry(fW, fH, fD), frontPocketMat);
        frontPocket.position.set(0, fY, fZ);
        frontPocket.castShadow = true;
        frontPocket.receiveShadow = true;
        group.add(frontPocket);

        // Front Pocket 3D Piping Border
        for (let side of [-1, 1]) {
          const fSidePipe = new THREE.Mesh(
            new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, fH, 10),
            pipingMat
          );
          fSidePipe.position.set(side * (fW / 2), fY, fZ + fD / 2);
          group.add(fSidePipe);
        }
        const fTopPipe = new THREE.Mesh(
          new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, fW, 10),
          pipingMat
        );
        fTopPipe.rotation.z = Math.PI / 2;
        fTopPipe.position.set(0, fY + fH / 2, fZ + fD / 2);
        group.add(fTopPipe);

        // Horizontal Reflective Safety Strip across pocket (Dải phản quang phát sáng)
        const refStrip = new THREE.Mesh(new THREE.BoxGeometry(fW + 0.004, 0.026, 0.005), reflectiveStripMat);
        refStrip.position.set(0, fY + 0.02, fZ + fD / 2 + 0.003);
        group.add(refStrip);

        // Front Pocket Zipper Track & Pull Tab
        const fZip = new THREE.Mesh(new THREE.BoxGeometry(fW - 0.04, 0.012, 0.008), metalZipMat);
        fZip.position.set(0, fY + fH / 2 - 0.015, fZ + fD / 2 + 0.002);
        group.add(fZip);

        const fPull = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.038, 0.005), pipingMat);
        fPull.position.set(0.06, fY + fH / 2 - 0.035, fZ + fD / 2 + 0.01);
        fPull.rotation.x = 0.2;
        group.add(fPull);

        // Circular Embroidered TOCFL Emblem Badge on upper front
        const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.006, 20), badgeMat);
        badge.rotation.x = Math.PI / 2;
        badge.position.set(0, baseH + boxH - 0.05, pZ + 0.004);
        group.add(badge);

        const starDeco = new THREE.Mesh(new THREE.OctahedronGeometry(0.018, 0), reflectiveStripMat);
        starDeco.position.set(0, baseH + boxH - 0.05, pZ + 0.01);
        group.add(starDeco);

        // --- 7. SIDE POCKETS (Túi hông: Bình nước & Túi phụ kiện) ---
        // Right Side: Mesh Bottle Pocket with Stainless Thermos Flask
        const meshPocket = new THREE.Mesh(
          new THREE.CylinderGeometry(0.065, 0.06, 0.16, 16, 1, true),
          frontPocketMat
        );
        meshPocket.position.set(bW / 2 + 0.035, baseH + 0.10, 0);
        group.add(meshPocket);

        const thermos = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.24, 20), bottleMat);
        thermos.position.set(bW / 2 + 0.035, baseH + 0.15, 0);
        thermos.castShadow = true;
        group.add(thermos);

        const thermosCap = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.045, 0.05, 20), bottleCapMat);
        thermosCap.position.set(bW / 2 + 0.035, baseH + 0.29, 0);
        group.add(thermosCap);

        const bottleHandle = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 8, 16), bottleCapMat);
        bottleHandle.position.set(bW / 2 + 0.035, baseH + 0.32, 0);
        group.add(bottleHandle);

        // Left Side: Zipper Utility Pouch
        const lPouch = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.16, 0.14), frontPocketMat);
        lPouch.position.set(-bW / 2 - 0.028, baseH + 0.12, 0);
        lPouch.castShadow = true;
        group.add(lPouch);

        const lPouchPipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.7, pipeRadius * 0.7, 0.14, 8), pipingMat);
        lPouchPipe.rotation.x = Math.PI / 2;
        lPouchPipe.position.set(-bW / 2 - 0.058, baseH + 0.20, 0);
        group.add(lPouchPipe);

        // --- 8. ERGONOMIC PADDED SHOULDER STRAPS & BACK PADS ---
        // Back breathable mesh pads
        for (let py of [baseH + 0.08, baseH + 0.24]) {
          const bPad = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.02), rubberBaseMat);
          bPad.position.set(0, py, -pZ - 0.01);
          group.add(bPad);
        }

        // S-Curve Shoulder Straps (Quai đeo ôm sát lưng)
        for (let side of [-1, 1]) {
          const strapTop = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.26, 0.025), strapMat);
          strapTop.position.set(side * 0.10, baseH + 0.26, -pZ - 0.025);
          strapTop.rotation.x = 0.10;
          strapTop.castShadow = true;
          group.add(strapTop);

          const strapBot = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.02), strapMat);
          strapBot.position.set(side * 0.11, baseH + 0.10, -pZ - 0.015);
          strapBot.rotation.x = -0.10;
          group.add(strapBot);

          // Quick-release Buckle
          const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.015), rubberBaseMat);
          buckle.position.set(side * 0.11, baseH + 0.08, -pZ - 0.022);
          group.add(buckle);

          // Dangling webbing tail
          const strapTail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.006), strapMat);
          strapTail.position.set(side * 0.11, baseH + 0.03, -pZ - 0.025);
          group.add(strapTail);
        }

        // Chest Cross-Strap Buckle
        const chestStrap = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.022, 0.008), strapMat);
        chestStrap.position.set(0, baseH + 0.24, -pZ - 0.035);
        group.add(chestStrap);

        const chestBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.028, 0.014), pipingMat);
        chestBuckle.position.set(0, baseH + 0.24, -pZ - 0.04);
        group.add(chestBuckle);

        // --- 9. TOP REINFORCED CARRY HANDLE (Quai xách ôm gọn đỉnh vòm) ---
        const handleArch = new THREE.Mesh(
          new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI),
          strapMat
        );
        handleArch.position.set(0, baseH + boxH + domeHeight - 0.02, -0.03);
        handleArch.castShadow = true;
        group.add(handleArch);

        const handleGrip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, 0.055, 12),
          pipingMat
        );
        handleGrip.rotation.z = Math.PI / 2;
        handleGrip.position.set(0, baseH + boxH + domeHeight + 0.04, -0.03);
        group.add(handleGrip);

        return group;
      };

      const backpack = this.objectMeshFactories.backpack();
      backpack.position.set(-1.8, 0, -3.5);
      backpack.rotation.y = 0.35;
      this.registerInteractable(backpack, 'backpack');
      this.scene.add(backpack);

      // 13. EXIT DOOR (Cửa phòng ra vào & Lối thoát)
      this.objectMeshFactories.door = () => {
        const group = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c2b0c, roughness: 0.55, metalness: 0.08 });
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });
        const neonMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x16a34a,
          emissiveIntensity: 1.0,
          roughness: 0.2
        });
        const signMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

        const dW = 1.45;
        const dH = 2.80;
        const frameThick = 0.09;

        // Outer Door Frame
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(frameThick, dH, 0.12), frameMat);
        frameL.position.set(-dW / 2 + frameThick / 2, dH / 2, 0);
        group.add(frameL);

        const frameR = new THREE.Mesh(new THREE.BoxGeometry(frameThick, dH, 0.12), frameMat);
        frameR.position.set(dW / 2 - frameThick / 2, dH / 2, 0);
        group.add(frameR);

        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(dW, frameThick, 0.12), frameMat);
        frameTop.position.set(0, dH - frameThick / 2, 0);
        group.add(frameTop);

        // Door Leaf
        const leafW = dW - frameThick * 2 - 0.01;
        const leafH = dH - frameThick - 0.02;
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.06), woodMat);
        leaf.position.set(0, leafH / 2 + 0.01, 0);
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        group.add(leaf);

        // Molded Panels on Door
        for (let row = 0; row < 2; row++) {
          const panelH = row === 0 ? 0.95 : 1.15;
          const panelY = row === 0 ? 0.65 : 1.95;
          const panel = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.20, panelH, 0.02), panelMat);
          panel.position.set(0, panelY, 0.032);
          group.add(panel);
        }

        // Brass Lever Handle & Backplate
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.01), brassMat);
        plate.position.set(0.40, 1.18, 0.04);
        group.add(plate);

        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 16), brassMat);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0.46, 1.22, 0.065);
        group.add(handle);

        // Illuminated EXIT / 離開 Sign above the door
        const signBox = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.06), signMat);
        signBox.position.set(0, dH + 0.16, 0.04);
        group.add(signBox);

        const neonPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.16), neonMat);
        neonPlate.position.set(0, dH + 0.16, 0.072);
        group.add(neonPlate);

        // Green light glow on door
        const exitLight = new THREE.PointLight(0x22c55e, 0.6, 3.5, 1.5);
        exitLight.position.set(0, dH + 0.2, 0.25);
        group.add(exitLight);

        return group;
      };

      const door = this.objectMeshFactories.door();
      door.position.set(0, 0, 4.90);
      door.rotation.y = Math.PI;
      this.registerInteractable(door, 'door');
      this.scene.add(door);
    }

    registerInteractable(object3d, vocabId) {
      object3d.userData.vocabId = vocabId;
      object3d.userData.vocabData = ROOM_VOCAB_DATA[vocabId];
      this.interactiveObjects.push(object3d);
    }

    // --- CONTROLS & INPUT SYSTEM ---
    setupControls() {
      // 1. Desktop Keyboard
      window.addEventListener('keydown', e => {
        if (this.state.isPaused || !this.isPointerLocked) {
          if (e.code === 'KeyE' && this.targetedObject) {
            this.openVocabModal(this.targetedObject.userData.vocabId);
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
            if (this.targetedObject) {
              if (this.targetedObject.userData.vocabId === 'door') {
                this.handleDoorInteraction();
              } else if (this.targetedObject.userData.vocabId === 'back_door') {
                this.enterStudyRoom();
              } else {
                this.openVocabModal(this.targetedObject.userData.vocabId);
              }
            }
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

      // 2. Mouse Look & Pointer Lock
      const canvasEl = this.container;
      this.lockOverlay.addEventListener('click', () => {
        this.requestPointerLock();
      });

      canvasEl.addEventListener('click', () => {
        if (!this.isPointerLocked) {
          this.requestPointerLock();
        } else if (this.targetedObject) {
          if (this.targetedObject.userData.vocabId === 'door') {
            this.handleDoorInteraction();
          } else if (this.targetedObject.userData.vocabId === 'back_door') {
            this.enterStudyRoom();
          } else {
            this.openVocabModal(this.targetedObject.userData.vocabId);
          }
        }
      });

      // Mouse Wheel Zoom for Third-Person View
      canvasEl.addEventListener('wheel', e => {
        if (this.cameraMode === 'third_person') {
          e.preventDefault();
          this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance + (e.deltaY > 0 ? 0.22 : -0.22), 1.2, 3.8);
        }
      }, { passive: false });

      document.addEventListener('pointerlockchange', () => {
        this.isPointerLocked = document.pointerLockElement === canvasEl;
        if (this.isPointerLocked) {
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

      // 3. Mobile Virtual Joystick & Touch Look
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

      // Mobile Touch Drag Screen to Look
      canvasEl.addEventListener('touchstart', e => {
        if (e.touches.length === 1 && joyTouchId !== e.touches[0].identifier) {
          this.touchLook.active = true;
          this.touchLook.startX = e.touches[0].clientX;
          this.touchLook.startY = e.touches[0].clientY;
        }
      }, { passive: true });

      canvasEl.addEventListener('touchmove', e => {
        if (!this.touchLook.active) return;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier !== joyTouchId) {
            const dx = e.touches[i].clientX - this.touchLook.startX;
            const dy = e.touches[i].clientY - this.touchLook.startY;
            this.touchLook.startX = e.touches[i].clientX;
            this.touchLook.startY = e.touches[i].clientY;

            const sens = (this.state.sensitivity / 5) * 0.004;
            this.player.yaw -= dx * sens;
            this.player.pitch -= dy * sens;
            this.player.pitch = THREE.MathUtils.clamp(this.player.pitch, -Math.PI / 3.0, Math.PI / 2.8);
            break;
          }
        }
      }, { passive: true });

      canvasEl.addEventListener('touchend', () => {
        this.touchLook.active = false;
      });

      // Mobile Interact Button
      const btnMobile = document.getElementById('btnMobileInteract');
      if (btnMobile) {
        btnMobile.addEventListener('click', () => {
          if (this.targetedObject) {
            if (this.targetedObject.userData.vocabId === 'door') {
              this.handleDoorInteraction();
            } else if (this.targetedObject.userData.vocabId === 'back_door') {
              this.enterStudyRoom();
            } else {
              this.openVocabModal(this.targetedObject.userData.vocabId);
            }
          }
        });
      }

      // Resize
      window.addEventListener('resize', () => this.onWindowResize());
    }

    requestPointerLock() {
      this.state.soundFX.init();
      this.container.requestPointerLock = this.container.requestPointerLock || this.container.mozRequestPointerLock;
      if (this.container.requestPointerLock) {
        this.container.requestPointerLock();
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

    // --- FULLSCREEN & ORIENTATION HANDLING ---
    toggleFullscreen() {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFs) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
        this.lockMobileLandscape();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      }
      setTimeout(() => this.onWindowResize(), 180);
    }

    lockMobileLandscape() {
      const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent) || ('ontouchstart' in window);
      if (isMobile) {
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
      // 1. Play Button on Start Screen (Auto Fullscreen & Landscape on Mobile)
      document.getElementById('btnPlayLevel1').addEventListener('click', () => {
        const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent) || ('ontouchstart' in window);
        if (isMobile) {
          const docEl = document.documentElement;
          if (!document.fullscreenElement) {
            if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
            else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
          }
          this.lockMobileLandscape();
        }
        this.switchScreen('game');
        this.requestPointerLock();
      });

      // 1.1 Fullscreen Toggle Buttons (Header & Game HUD)
      const btnHeaderFs = document.getElementById('btnHeaderFullscreen');
      if (btnHeaderFs) {
        btnHeaderFs.addEventListener('click', () => this.toggleFullscreen());
      }
      const btnGameFs = document.getElementById('btnToggleFullscreen');
      if (btnGameFs) {
        btnGameFs.addEventListener('click', () => this.toggleFullscreen());
      }

      // Sync Fullscreen UI State
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

      // 2. Pause / Return to Menu
      document.getElementById('btnPauseGame').addEventListener('click', () => {
        if (document.exitPointerLock) document.exitPointerLock();
        this.switchScreen('start');
      });

      // 3. Sound Toggle Button
      const btnSound = document.getElementById('btnSoundToggle');
      const soundIcon = document.getElementById('soundIcon');
      btnSound.addEventListener('click', () => {
        this.state.soundFX.enabled = !this.state.soundFX.enabled;
        soundIcon.textContent = this.state.soundFX.enabled ? '🔊' : '🔇';
        btnSound.title = this.state.soundFX.enabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt';
      });

      // 4. Camera View Toggle Button
      const btnCam = document.getElementById('btnToggleCamera');
      if (btnCam) {
        btnCam.addEventListener('click', () => {
          this.toggleCameraMode();
        });
      }

      // 5. Modal Close & Continue Exploration
      document.getElementById('btnCloseModal').addEventListener('click', () => this.closeVocabModal());
      document.getElementById('btnContinueExplore').addEventListener('click', () => this.closeVocabModal());

      // 6. Speech Synthesis Pronunciation
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

      // 7. Inspector Tools
      document.getElementById('btnReset3dView').addEventListener('click', () => {
        this.inspector.resetView();
      });

      const btnRotate = document.getElementById('btnToggleAutoRotate');
      const rotateIcon = document.getElementById('rotateIcon');
      btnRotate.addEventListener('click', () => {
        const isAuto = this.inspector.toggleAutoRotate();
        rotateIcon.textContent = isAuto ? '⏸️ Dừng xoay' : '▶️ Tự xoay';
      });

      // 8. Notebook Drawer
      const drawer = document.getElementById('notebookDrawer');
      document.getElementById('btnToggleBook').addEventListener('click', () => {
        if (document.exitPointerLock) document.exitPointerLock();
        this.renderNotebookDrawer();
        drawer.classList.add('active');
      });
      document.getElementById('btnCloseDrawer').addEventListener('click', () => {
        drawer.classList.remove('active');
      });

      // 9. Settings Modal
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
      });

      document.getElementById('settingLangMode').addEventListener('change', e => {
        this.state.langMode = e.target.value;
      });

      document.getElementById('btnResetProgress').addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn xóa toàn bộ tiến độ khám phá và học lại từ đầu?')) {
          this.state.resetProgress();
          this.updateProgressUI();
          settingsModal.classList.remove('active');
        }
      });

      // 10. Victory Modal Actions
      document.getElementById('btnReplayLevel').addEventListener('click', () => {
        document.getElementById('victoryModal').classList.remove('active');
        this.state.resetProgress();
        this.updateProgressUI();
        this.requestPointerLock();
      });

      document.getElementById('btnBackToMenu').addEventListener('click', () => {
        document.getElementById('victoryModal').classList.remove('active');
        this.switchScreen('start');
      });

      // 11. Exit Door Modal Actions
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
          this.enterLivingRoom();
        });
      }

      const btnLearnDoor = document.getElementById('btnLearnDoorCard');
      if (btnLearnDoor) {
        btnLearnDoor.addEventListener('click', () => {
          doorModal.classList.remove('active');
          this.openVocabModal('door');
        });
      }
    }

    handleDoorInteraction() {
      if (document.exitPointerLock) document.exitPointerLock();
      const isNew = this.state.markDiscovered('door');
      this.updateProgressUI();
      this.state.soundFX.playDiscover();

      const total = Object.keys(ROOM_VOCAB_DATA).length;
      const count = this.state.discovered.size;
      const foundEl = document.getElementById('doorFoundCount');
      if (foundEl) foundEl.textContent = `${count}/${total}`;
      const scoreEl = document.getElementById('doorScoreCount');
      if (scoreEl) scoreEl.textContent = this.state.score;

      const doorModal = document.getElementById('doorModal');
      if (doorModal) doorModal.classList.add('active');
    }

    enterLivingRoom() {
      const roomTitle = document.querySelector('.room-title');
      if (roomTitle) roomTitle.innerHTML = '<span class="icon">🛋️</span> Phòng Khách';

      if (document.exitPointerLock) document.exitPointerLock();
      const doorModal = document.getElementById('doorModal');
      if (doorModal) doorModal.classList.remove('active');
      this.closeVocabModal();

      // Fade to black
      const overlay = document.getElementById('roomTransitionOverlay');
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
      }

      setTimeout(() => {
        this.clearScene();
        this.currentRoom = 'living';
        this.buildLivingRoom();
        this.resetPlayerToLivingRoomSpawn();
        this.state.soundFX.playDiscover();

        // Fade back in after 500ms build time
        setTimeout(() => {
          if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
          }
        }, 500);
      }, 650);
    }

    enterStudyRoom() {
      const roomTitle = document.querySelector('.room-title');
      if (roomTitle) roomTitle.innerHTML = '<span class="icon">🎒</span> Căn Phòng Học Tập';

      if (document.exitPointerLock) document.exitPointerLock();
      const overlay = document.getElementById('roomTransitionOverlay');
      if (overlay) {
        const label = overlay.querySelector('div:last-child');
        if (label) label.textContent = 'Quay về phòng học...';
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
      }

      setTimeout(() => {
        this.clearScene();
        this.currentRoom = 'study';
        this.buildStudyRoomScene();
        this.player.pos.set(0, 0, 2.5);
        this.player.yaw = 0;
        this.state.soundFX.playDiscover();

        setTimeout(() => {
          if (overlay) {
            const label = overlay.querySelector('div:last-child');
            if (label) label.textContent = 'Đang mở cửa...';
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
          }
        }, 500);
      }, 650);
    }

    clearScene() {
      // Remove everything except lights
      const toRemove = [];
      this.scene.traverse((obj) => {
        if (obj !== this.scene && !obj.isLight) toRemove.push(obj);
      });
      toRemove.forEach(obj => {
        if (obj.parent) obj.parent.remove(obj);
        if (!obj.userData.fromGLB) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        }
      });
      this.interactiveObjects = [];
      this.playerMesh = null;
      this.playerBones = {};
      this.walkAnimPhase = 0;
      this.idleTime = 0;
      this.lampLight = null;
      this.smokeParticles = [];
    }

    buildStudyRoomScene() {
      this.roomBounds = { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 };
      this.buildRoomArchitecture();
      this.buildPlayerAvatar();
      this.buildInteractiveObjects();
    }

    resetPlayerToLivingRoomSpawn() {
      this.player.pos.set(0, 0, 3.4);
      this.player.yaw = Math.PI;
    }

    buildLivingRoom() {
      // ---- LUXURY LIVING ROOM (HANSEM WALNUT & GOLD ONYX MARBLE DESIGN) ----
      const roomW = 10.0;
      const roomL = 10.0;
      const roomH = 4.0;
      const gapW = 1.45; // Exact width for doorway.glb
      const gapH = 2.85; // Exact height (3.8 * 0.75)

      this.roomBounds = { minX: -4.6, maxX: 4.6, minZ: -4.6, maxZ: 4.6 };

      // Textures
      const walnutTex = createDarkWalnutTexture();
      walnutTex.repeat.set(3, 3);
      const floorMat = new THREE.MeshStandardMaterial({ map: walnutTex, roughness: 0.35, metalness: 0.05 });
      
      const onyxTex = createOnyxMarbleTexture();
      const onyxMat = new THREE.MeshStandardMaterial({ map: onyxTex, roughness: 0.12, metalness: 0.08 });
      
      const rugTex = createLuxuryRugTexture();
      rugTex.repeat.set(1, 1);
      const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.9 });

      const leatherTex = createLeatherTexture();
      leatherTex.repeat.set(2, 2);
      const leatherMat = new THREE.MeshStandardMaterial({ map: leatherTex, color: 0x5a321c, roughness: 0.55 });
      const leatherDarkMat = new THREE.MeshStandardMaterial({ map: leatherTex, color: 0x3d2012, roughness: 0.6 });

      const darkWoodMat = new THREE.MeshStandardMaterial({ map: walnutTex, color: 0x422414, roughness: 0.4, metalness: 0.05 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9 });
      const whitePlasterMat = new THREE.MeshStandardMaterial({ color: 0xf6f3ed, roughness: 0.9 });
      const glassBlackMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.03, metalness: 0.3 });

      // 1. Floor (Dark Walnut Parquet with Rounded Skirting)
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      // 2. Ceiling (Recessed Tray Ceiling with Warm LED Cove Lighting)
      const ceiling = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.16, roomL), whitePlasterMat);
      ceiling.position.set(0, roomH, 0);
      this.scene.add(ceiling);

      const trayCeil = new THREE.Mesh(new THREE.BoxGeometry(roomW - 1.6, 0.14, roomL - 1.6), whitePlasterMat);
      trayCeil.position.set(0, roomH + 0.08, 0);
      this.scene.add(trayCeil);

      // Warm Cove Light Strips
      const coveLight1 = new THREE.PointLight(0xffd59e, 1.4, 11, 1.3);
      coveLight1.position.set(0, roomH - 0.05, -2.2);
      this.scene.add(coveLight1);
      const coveLight2 = new THREE.PointLight(0xffd59e, 1.4, 11, 1.3);
      coveLight2.position.set(0, roomH - 0.05, 1.8);
      this.scene.add(coveLight2);

      // 3. Walls (Back Wall: Walnut & Marble; Front, Left, Right: Painted White)
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.18), darkWoodMat);
      backWall.position.set(0, roomH / 2, -roomL / 2);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const wSide = (roomW - gapW) / 2;
      const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(wSide, roomH, 0.18), whitePlasterMat);
      frontWallL.position.set(-roomW / 2 + wSide / 2, roomH / 2, roomL / 2);
      this.scene.add(frontWallL);
      const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(wSide, roomH, 0.18), whitePlasterMat);
      frontWallR.position.set(roomW / 2 - wSide / 2, roomH / 2, roomL / 2);
      this.scene.add(frontWallR);
      const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(gapW, roomH - gapH, 0.18), whitePlasterMat);
      frontWallTop.position.set(0, roomH - (roomH - gapH) / 2, roomL / 2);
      this.scene.add(frontWallTop);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH, roomL), whitePlasterMat);
      leftWall.position.set(-roomW / 2, roomH / 2, 0);
      this.scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH, roomL), whitePlasterMat);
      rightWall.position.set(roomW / 2, roomH / 2, 0);
      this.scene.add(rightWall);

      // Helper: place GLB or fallback
      const placeModel = (id, pos, opts = {}, fallbackFn = null) => {
        const raw = this.loadedModels[id];
        if (raw) {
          const m = this.fitModelToBounds(raw, opts);
          if (m) {
            m.position.set(pos.x, pos.y, pos.z);
            this.scene.add(m);
            return m;
          }
        }
        if (fallbackFn) {
          const fb = fallbackFn();
          fb.position.set(pos.x, pos.y, pos.z);
          if (opts.rotationY) fb.rotation.y = opts.rotationY;
          this.scene.add(fb);
          return fb;
        }
        return null;
      };

      // =========================================================================
      // 4. BACK WALL: BOOKMATCHED ONYX SLAB + TV + WALNUT TV CONSOLE + TALL DISPLAY
      // =========================================================================

      // Giant Bookmatched Golden Onyx Slab with Rounded Corners & Bevel
      const marbleW = 4.8;
      const marbleH = 3.2;
      const onyxGeo = createRoundedBoxGeometry(marbleW, marbleH, 0.06, 0.08, 4);
      const onyxSlab = new THREE.Mesh(onyxGeo, onyxMat);
      onyxSlab.position.set(0, 1.95, -roomL / 2 + 0.08);
      this.scene.add(onyxSlab);

      // Gold Trim Frame around Marble Slab
      const goldFrameGeo = createRoundedBoxGeometry(marbleW + 0.12, marbleH + 0.12, 0.04, 0.09, 3);
      const goldFrame = new THREE.Mesh(goldFrameGeo, goldMat);
      goldFrame.position.set(0, 1.95, -roomL / 2 + 0.05);
      this.scene.add(goldFrame);

      // Warm Golden LED Halo Glow on Onyx Marble
      const onyxGlow = new THREE.PointLight(0xffb703, 1.6, 7.5, 1.2);
      onyxGlow.position.set(0, 2.1, -roomL / 2 + 0.35);
      this.scene.add(onyxGlow);

      // 75-inch Modern Flat Screen TV with Rounded Corners
      const tvGroup = new THREE.Group();
      const tvFrameGeo = createRoundedBoxGeometry(2.35, 1.35, 0.05, 0.03, 3);
      const tvFrame = new THREE.Mesh(tvFrameGeo, new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.15 }));
      tvGroup.add(tvFrame);
      const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.25), new THREE.MeshStandardMaterial({ color: 0x060c18, emissive: 0x081224, emissiveIntensity: 0.5 }));
      tvScreen.position.z = 0.03;
      tvGroup.add(tvScreen);
      tvGroup.position.set(0, 1.95, -roomL / 2 + 0.18);
      this.scene.add(tvGroup);

      // Long Low Walnut TV Credenza with Rounded Cylindrical Ends (Bo tròn 2 đầu)
      const credenzaGroup = new THREE.Group();
      const credenzaMainGeo = createRoundedBoxGeometry(4.2, 0.48, 0.52, 0.06, 4);
      const credenzaMain = new THREE.Mesh(credenzaMainGeo, darkWoodMat);
      credenzaMain.position.y = 0.26;
      credenzaMain.castShadow = true;
      credenzaGroup.add(credenzaMain);
      // Gold plinth base
      const credenzaPlinth = new THREE.Mesh(createRoundedBoxGeometry(4.0, 0.04, 0.46, 0.02, 2), goldMat);
      credenzaPlinth.position.y = 0.02;
      credenzaGroup.add(credenzaPlinth);
      credenzaGroup.position.set(0, 0, -roomL / 2 + 0.48);
      this.scene.add(credenzaGroup);

      // Two Tall Open Lighted Display Shelving Units (Left & Right of Marble Slab)
      const buildDisplayCabinet = (side) => {
        const cabX = side * 3.4;
        const cabGroup = new THREE.Group();

        // 1. Back Panel (Dark Walnut)
        const backP = new THREE.Mesh(createRoundedBoxGeometry(1.6, 3.6, 0.03, 0.02, 2), darkWoodMat);
        backP.position.set(0, 1.8, -0.22);
        cabGroup.add(backP);

        // 2. Left & Right Side Panels (Dark Walnut with Gold Front Inlay)
        for (let sx of [-0.78, 0.78]) {
          const sideP = new THREE.Mesh(createRoundedBoxGeometry(0.04, 3.6, 0.44, 0.02, 2), darkWoodMat);
          sideP.position.set(sx, 1.8, 0);
          cabGroup.add(sideP);
          const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.02, 3.6, 0.02), goldMat);
          goldTrim.position.set(sx, 1.8, 0.22);
          cabGroup.add(goldTrim);
        }

        // 3. Top & Bottom Caps (Dark Walnut with Gold Front Inlay)
        for (let sy of [0.03, 3.58]) {
          const cap = new THREE.Mesh(createRoundedBoxGeometry(1.6, 0.06, 0.46, 0.02, 2), darkWoodMat);
          cap.position.set(0, sy, 0);
          cabGroup.add(cap);
          const goldCapTrim = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.02), goldMat);
          goldCapTrim.position.set(0, sy, 0.23);
          cabGroup.add(goldCapTrim);
        }

        // 4. Open Shelves at y = 0.7, 1.4, 2.1, 2.8 with Gold Front Trim & LED Downlights
        const shelfYs = [0.7, 1.4, 2.1, 2.8];
        shelfYs.forEach(sy => {
          const shelf = new THREE.Mesh(createRoundedBoxGeometry(1.52, 0.03, 0.42, 0.01, 2), darkWoodMat);
          shelf.position.set(0, sy, 0);
          cabGroup.add(shelf);
          const goldShelfTrim = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.015, 0.015), goldMat);
          goldShelfTrim.position.set(0, sy, 0.21);
          cabGroup.add(goldShelfTrim);

          // LED Spotlight on underside of each shelf shining down on items
          const spot = new THREE.PointLight(0xffd875, 0.5, 1.6, 1.8);
          spot.position.set(0, sy + 0.55, 0.08);
          cabGroup.add(spot);
        });

        // Top shelf spotlight
        const topSpot = new THREE.PointLight(0xffd875, 0.5, 1.6, 1.8);
        topSpot.position.set(0, 3.5, 0.08);
        cabGroup.add(topSpot);

        cabGroup.position.set(cabX, 0, -roomL / 2 + 0.38);
        this.scene.add(cabGroup);
        return cabGroup;
      };

      buildDisplayCabinet(-1);
      buildDisplayCabinet(1);

      // --- POPULATE LEFT DISPLAY SHELVES (x = -3.4, z = -4.62) ---
      const lCabX = -3.4;
      const lCabZ = -roomL / 2 + 0.38;

      // Shelf 1 (y = 0.72): Books & Vintage Radio
      placeModel('lr_books', { x: lCabX - 0.35, y: 0.72, z: lCabZ }, { targetHeight: 0.38, alignBottomY: true });
      placeModel('lr_radio', { x: lCabX + 0.32, y: 0.72, z: lCabZ }, { targetHeight: 0.26, alignBottomY: true });

      // Shelf 2 (y = 1.42): Teddy Bear & Potted Plant
      placeModel('lr_bear', { x: lCabX - 0.28, y: 1.42, z: lCabZ }, { targetHeight: 0.42, alignBottomY: true, rotationY: 0.2 });
      placeModel('lr_plantSmall', { x: lCabX + 0.32, y: 1.42, z: lCabZ }, { targetHeight: 0.34, alignBottomY: true });

      // Shelf 3 (y = 2.12): Potted Plant & Gold Statue
      placeModel('lr_plantSmall2', { x: lCabX - 0.32, y: 2.12, z: lCabZ }, { targetHeight: 0.32, alignBottomY: true });
      const goldStatue1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 0.36, 16), goldMat);
      goldStatue1.position.set(lCabX + 0.3, 2.30, lCabZ);
      this.scene.add(goldStatue1);

      // Shelf 4 (y = 2.82): Potted Plant & Books
      placeModel('lr_plantSmall3', { x: lCabX + 0.30, y: 2.82, z: lCabZ }, { targetHeight: 0.32, alignBottomY: true });
      placeModel('lr_books', { x: lCabX - 0.32, y: 2.82, z: lCabZ }, { targetHeight: 0.36, alignBottomY: true });

      // Shelf 5 (Top, y = 3.60): Gold Urn / Vase
      const goldVase1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.34, 16), goldMat);
      goldVase1.position.set(lCabX, 3.77, lCabZ);
      this.scene.add(goldVase1);

      // --- POPULATE RIGHT DISPLAY SHELVES (x = 3.4, z = -4.62) ---
      const rCabX = 3.4;
      const rCabZ = -roomL / 2 + 0.38;

      // Shelf 1 (y = 0.72): Vintage TV & Speaker
      placeModel('lr_tvVintage', { x: rCabX - 0.28, y: 0.72, z: rCabZ }, { targetHeight: 0.38, alignBottomY: true, rotationY: -0.15 });
      placeModel('lr_speakerSmall', { x: rCabX + 0.38, y: 0.72, z: rCabZ }, { targetHeight: 0.30, alignBottomY: true });

      // Shelf 2 (y = 1.42): Table Lamp & Books
      placeModel('lr_lampTable', { x: rCabX - 0.32, y: 1.42, z: rCabZ }, { targetHeight: 0.38, alignBottomY: true });
      placeModel('lr_books', { x: rCabX + 0.32, y: 1.42, z: rCabZ }, { targetHeight: 0.36, alignBottomY: true });

      // Shelf 3 (y = 2.12): Teddy Bear & Small Plant
      placeModel('lr_bear', { x: rCabX + 0.28, y: 2.12, z: rCabZ }, { targetHeight: 0.40, alignBottomY: true, rotationY: -0.2 });
      placeModel('lr_plantSmall', { x: rCabX - 0.32, y: 2.12, z: rCabZ }, { targetHeight: 0.32, alignBottomY: true });

      // Shelf 4 (y = 2.82): Small Plant & Gold Sculpture
      placeModel('lr_plantSmall2', { x: rCabX - 0.30, y: 2.82, z: rCabZ }, { targetHeight: 0.32, alignBottomY: true });
      const goldTrophy = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 16), goldMat);
      goldTrophy.position.set(rCabX + 0.3, 2.98, rCabZ);
      this.scene.add(goldTrophy);

      // Shelf 5 (Top, y = 3.60): Gold Bowl / Sculpture
      const goldVase2 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 16, 32), goldMat);
      goldVase2.position.set(rCabX, 3.77, rCabZ);
      this.scene.add(goldVase2);

      // =========================================================================
      // 5. CENTER LOUNGE: PLUSH RUG + COFFEE TABLE + SOFA (LEFT) + ARMCHAIRS (RIGHT)
      // =========================================================================

      // Large Plush Beige/Cream Area Rug
      const rugMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 4.6), rugMat);
      rugMesh.rotation.x = -Math.PI / 2;
      rugMesh.position.set(0, 0.006, -1.0);
      rugMesh.receiveShadow = true;
      this.scene.add(rugMesh);

      // Large Walnut Coffee Table with Rounded 4 Corners & Inset Glossy Black Glass
      const tableGroup = new THREE.Group();
      const tableBaseGeo = createRoundedBoxGeometry(2.35, 0.38, 1.3, 0.08, 4);
      const tableBase = new THREE.Mesh(tableBaseGeo, darkWoodMat);
      tableBase.position.y = 0.19;
      tableBase.castShadow = true;
      tableGroup.add(tableBase);
      const tableTopGeo = createRoundedBoxGeometry(2.37, 0.04, 1.32, 0.06, 4);
      const tableTop = new THREE.Mesh(tableTopGeo, glassBlackMat);
      tableTop.position.y = 0.40;
      tableGroup.add(tableTop);
      const tableGoldTrim = new THREE.Mesh(createRoundedBoxGeometry(2.39, 0.02, 1.34, 0.06, 3), goldMat);
      tableGoldTrim.position.y = 0.38;
      tableGroup.add(tableGoldTrim);
      tableGroup.position.set(0, 0, -1.0);
      this.scene.add(tableGroup);

      // Centerpieces on Coffee Table: White Orchid Bouquet + Gold Drink Tray
      placeModel('lr_plantSmall',
        { x: 0, y: 0.42, z: -1.0 },
        { targetHeight: 0.42, alignBottomY: true }
      );
      const trayGeo = createRoundedBoxGeometry(0.38, 0.02, 0.28, 0.02, 2);
      const tray = new THREE.Mesh(trayGeo, goldMat);
      tray.position.set(0.60, 0.43, -1.0);
      this.scene.add(tray);
      const decanter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.05, transparent: true, opacity: 0.85 }));
      decanter.position.set(0.56, 0.54, -1.0);
      this.scene.add(decanter);
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.09, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.6 }));
      glass.position.set(0.68, 0.48, -1.0);
      this.scene.add(glass);

      // --- LEFT SIDE: LONG LUXURY LEATHER SOFA (HANSEM STYLE WITH CURVED S-LEGS) ---
      const sofaGroup = new THREE.Group();
      // Curved Walnut Base
      const sofaWoodBase = new THREE.Mesh(createRoundedBoxGeometry(3.9, 0.34, 1.05, 0.08, 4), darkWoodMat);
      sofaWoodBase.position.y = 0.17;
      sofaWoodBase.castShadow = true;
      sofaGroup.add(sofaWoodBase);

      // Curved Walnut Armrests on both ends
      for (let side of [-1, 1]) {
        const armGeo = createRoundedBoxGeometry(0.26, 0.58, 1.06, 0.08, 4);
        const arm = new THREE.Mesh(armGeo, darkWoodMat);
        arm.position.set(side * 1.82, 0.38, 0);
        arm.castShadow = true;
        sofaGroup.add(arm);
      }

      // Plush Tufted Leather Seat Cushions
      for (let i = 0; i < 3; i++) {
        const cx = (i - 1) * 1.15;
        const seatGeo = createRoundedBoxGeometry(1.12, 0.24, 0.92, 0.06, 4);
        const seatCushion = new THREE.Mesh(seatGeo, leatherMat);
        seatCushion.position.set(cx, 0.40, 0.04);
        seatCushion.castShadow = true;
        sofaGroup.add(seatCushion);

        // Angled Leather Back Cushion
        const backGeo = createRoundedBoxGeometry(1.12, 0.62, 0.22, 0.06, 4);
        const backCushion = new THREE.Mesh(backGeo, leatherDarkMat);
        backCushion.position.set(cx, 0.68, -0.36);
        backCushion.rotation.x = -0.12;
        backCushion.castShadow = true;
        sofaGroup.add(backCushion);
      }

      // Elegant S-curved wooden feet
      for (let fx of [-1.6, 1.6]) {
        for (let fz of [-0.38, 0.38]) {
          const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.16, 12), darkWoodMat);
          foot.position.set(fx, 0.06, fz);
          sofaGroup.add(foot);
        }
      }

      // Position long sofa on left side facing right (+X)
      sofaGroup.rotation.y = Math.PI / 2;
      sofaGroup.position.set(-2.8, 0, -1.0);
      this.scene.add(sofaGroup);

      // Alternating Brown Leather & Cream White Accent Pillows on Sofa
      for (let pz of [-2.4, -1.7, -1.0, -0.3, 0.4]) {
        const isWhite = Math.abs(pz + 1.7) < 0.1 || Math.abs(pz - 0.4) < 0.1;
        const pMat = new THREE.MeshStandardMaterial({
          color: isWhite ? 0xf8f6f0 : 0x3d2012,
          roughness: isWhite ? 0.7 : 0.55
        });
        const pGeo = createRoundedBoxGeometry(0.24, 0.40, 0.42, 0.06, 3);
        const pillowMesh = new THREE.Mesh(pGeo, pMat);
        pillowMesh.position.set(-2.85, 0.58, pz);
        pillowMesh.rotation.z = -0.18;
        this.scene.add(pillowMesh);
      }

      // --- RIGHT SIDE: TWO LUXURY LEATHER ARMCHAIRS + SIDE TABLE ---
      const buildLuxuryArmchair = () => {
        const g = new THREE.Group();

        // 1. Low Bottom Base Frame (Khung đáy ghế)
        const baseFrame = new THREE.Mesh(createRoundedBoxGeometry(0.98, 0.14, 0.92, 0.04, 3), darkWoodMat);
        baseFrame.position.y = 0.07;
        baseFrame.castShadow = true;
        g.add(baseFrame);

        // 2. Left & Right Curved Wooden Armrests (Thành ghế 2 bên - cao hơn mặt ghế)
        // Armrests height = 0.58m, top at y = 0.64m
        for (let s of [-1, 1]) {
          const armGeo = createRoundedBoxGeometry(0.14, 0.58, 0.94, 0.06, 3);
          const arm = new THREE.Mesh(armGeo, darkWoodMat);
          arm.position.set(s * 0.42, 0.35, 0);
          arm.castShadow = true;
          g.add(arm);

          // Subtle gold accent trim on front of armrest
          const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.48, 0.02), goldMat);
          goldTrim.position.set(s * 0.42, 0.35, 0.47);
          g.add(goldTrim);
        }

        // 3. Plush Leather Seat Cushion (Mặt đệm ghế ở giữa - THẤP HƠN thành ghế rõ rệt)
        // Seat top at y = 0.33m (thấp hơn thành ghế y = 0.64m tới 31cm!)
        const seatGeo = createRoundedBoxGeometry(0.68, 0.20, 0.78, 0.06, 3);
        const seat = new THREE.Mesh(seatGeo, leatherMat);
        seat.position.set(0, 0.23, 0.05);
        seat.castShadow = true;
        g.add(seat);

        // 4. Plush Leather Backrest Cushion (Tựa lưng bọc da - cao hơn tay vịn)
        const backGeo = createRoundedBoxGeometry(0.68, 0.52, 0.18, 0.06, 3);
        const back = new THREE.Mesh(backGeo, leatherDarkMat);
        back.position.set(0, 0.56, -0.32);
        back.rotation.x = -0.15;
        back.castShadow = true;
        g.add(back);

        // 5. Wooden S-curved Feet
        for (let fx of [-0.38, 0.38]) {
          for (let fz of [-0.35, 0.35]) {
            const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.12, 12), darkWoodMat);
            foot.position.set(fx, 0.06, fz);
            g.add(foot);
          }
        }

        // 6. Accent Pillow on Armchair
        const pGeo = createRoundedBoxGeometry(0.28, 0.28, 0.12, 0.04, 2);
        const pillow = new THREE.Mesh(pGeo, new THREE.MeshStandardMaterial({ color: 0xf8f6f0, roughness: 0.7 }));
        pillow.position.set(0, 0.38, -0.20);
        pillow.rotation.x = -0.18;
        g.add(pillow);

        return g;
      };

      // Armchair 1 (Top right) facing left (-X)
      const arm1 = buildLuxuryArmchair();
      arm1.rotation.y = -Math.PI / 2;
      arm1.position.set(2.65, 0, -2.1);
      this.scene.add(arm1);

      // Armchair 2 (Bottom right) facing left (-X)
      const arm2 = buildLuxuryArmchair();
      arm2.rotation.y = -Math.PI / 2;
      arm2.position.set(2.65, 0, 0.1);
      this.scene.add(arm2);

      // Round Walnut Side Table with Beveled Edge between Armchairs
      const sideTableGroup = new THREE.Group();
      const stTopGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32);
      const stTop = new THREE.Mesh(stTopGeo, darkWoodMat);
      stTop.position.y = 0.62;
      sideTableGroup.add(stTop);
      const stStem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.58, 16), goldMat);
      stStem.position.y = 0.31;
      sideTableGroup.add(stStem);
      const stBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 24), darkWoodMat);
      stBase.position.y = 0.02;
      sideTableGroup.add(stBase);
      sideTableGroup.position.set(2.9, 0, -1.0);
      this.scene.add(sideTableGroup);

      // Flower vase on side table
      placeModel('lr_plant',
        { x: 2.9, y: 0.65, z: -1.0 },
        { targetHeight: 0.45, alignBottomY: true }
      );

      // =========================================================================
      // 6. CEILING: GRAND 3-TIER CRYSTAL CHANDELIER
      // =========================================================================
      const chandeGroup = new THREE.Group();
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0.3,
        transparent: true,
        opacity: 0.88
      });

      const tiers = [
        { radius: 0.82, y: 0.0, height: 0.16 },
        { radius: 0.56, y: -0.19, height: 0.15 },
        { radius: 0.34, y: -0.36, height: 0.13 }
      ];
      tiers.forEach(t => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(t.radius, 0.025, 12, 36), goldMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = t.y;
        chandeGroup.add(ring);

        const count = Math.floor(t.radius * 26);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const prismGeo = createRoundedBoxGeometry(0.04, t.height, 0.015, 0.004, 2);
          const prism = new THREE.Mesh(prismGeo, crystalMat);
          prism.position.set(Math.cos(angle) * t.radius, t.y - t.height / 2, Math.sin(angle) * t.radius);
          chandeGroup.add(prism);
        }
      });

      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 12), goldMat);
      rod.position.y = 0.28;
      chandeGroup.add(rod);

      const chandeLight = new THREE.PointLight(0xffecd1, 2.2, 12, 1.2);
      chandeLight.position.set(0, -0.15, 0);
      chandeGroup.add(chandeLight);

      chandeGroup.position.set(0, roomH - 0.45, -1.0);
      this.scene.add(chandeGroup);

      // Downlights across ceiling
      for (let [lx, lz] of [[-2.5, -3.2], [2.5, -3.2], [-2.5, 1.5], [2.5, 1.5]]) {
        const spot = new THREE.PointLight(0xfff3db, 0.7, 8, 1.2);
        spot.position.set(lx, roomH - 0.15, lz);
        this.scene.add(spot);
        const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.05, 16), darkWoodMat);
        fixture.position.set(lx, roomH - 0.03, lz);
        this.scene.add(fixture);
      }

      // =========================================================================
      // 7. LEFT WALL: ART GALLERY WITH 3 FRAMED ABSTRACT PAINTINGS & PICTURE LIGHTS
      // =========================================================================
      const galleryWallX = -roomW / 2 + 0.10;

      // 3 Framed Modern Abstract Paintings
      const paintings = [
        { z: -2.5, theme: 0, title: 'Midnight Gold' },
        { z: 0.0,  theme: 1, title: 'Warm Bauhaus' },
        { z: 2.5,  theme: 2, title: 'Emerald Geode' }
      ];

      paintings.forEach(p => {
        const artGroup = new THREE.Group();

        // 1. Dark Canvas Backing Board
        const frameW = 1.35;
        const frameH = 1.85;
        const backing = new THREE.Mesh(new THREE.BoxGeometry(0.04, frameH, frameW), new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.8 }));
        backing.position.set(0, 2.1, 0);
        artGroup.add(backing);

        // 2. Gold Frame Borders (Top, Bottom, Left, Right)
        const frameThick = 0.045;
        const frameDepth = 0.06;
        // Top & Bottom Bars
        for (let fy of [2.1 + frameH / 2 - frameThick / 2, 2.1 - frameH / 2 + frameThick / 2]) {
          const bar = new THREE.Mesh(createRoundedBoxGeometry(frameDepth, frameThick, frameW, 0.01, 2), goldMat);
          bar.position.set(0.01, fy, 0);
          artGroup.add(bar);
        }
        // Left & Right Bars
        for (let fz of [-frameW / 2 + frameThick / 2, frameW / 2 - frameThick / 2]) {
          const bar = new THREE.Mesh(createRoundedBoxGeometry(frameDepth, frameH, frameThick, 0.01, 2), goldMat);
          bar.position.set(0.01, 2.1, fz);
          artGroup.add(bar);
        }

        // 3. Art Canvas with Procedural Masterpiece Texture
        const canvasTex = createAbstractArtTexture(p.theme);
        const artMat = new THREE.MeshStandardMaterial({ map: canvasTex, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide });
        const canvasMesh = new THREE.Mesh(new THREE.PlaneGeometry(frameW - frameThick * 2, frameH - frameThick * 2), artMat);
        canvasMesh.position.set(0.025, 2.1, 0);
        canvasMesh.rotation.y = Math.PI / 2;
        artGroup.add(canvasMesh);

        // 4. Modern Picture Light / Gallery Sconce above the frame
        const sconceArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 12), goldMat);
        sconceArm.rotation.z = Math.PI / 2;
        sconceArm.position.set(0.14, 3.15, 0);
        artGroup.add(sconceArm);

        const sconceBar = new THREE.Mesh(createRoundedBoxGeometry(0.04, 0.03, 0.45, 0.01, 2), goldMat);
        sconceBar.position.set(0.28, 3.15, 0);
        artGroup.add(sconceBar);

        // Focused Gallery Spotlight shining down on the painting
        const artLight = new THREE.PointLight(0xfffae6, 0.7, 3.5, 1.8);
        artLight.position.set(0.40, 3.10, 0);
        artGroup.add(artLight);

        artGroup.position.set(galleryWallX, 0, p.z);
        this.scene.add(artGroup);
      });

      // Vertical Walnut Slat Accent Panels between paintings
      for (let sz of [-3.8, -1.25, 1.25, 3.8]) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.04, roomH - 0.2, 0.12), darkWoodMat);
        slat.position.set(-roomW / 2 + 0.04, roomH / 2, sz);
        this.scene.add(slat);
      }

      // Large Potted Luxury Tree / Plant in the corner
      placeModel('plant',
        { x: -roomW / 2 + 0.8, y: 0, z: -roomL / 2 + 0.8 },
        { targetHeight: 2.1, alignBottomY: true }
      );

      // =========================================================================
      // 8. RIGHT WALL: WHITE WALL WITH LUXURY GOLD MOLDINGS & WALL SCONCES
      // =========================================================================
      const rightWallX = roomW / 2 - 0.05;
      
      // Modern Gold Decorative Molding Frames on Right White Wall
      for (let rz of [-2.1, 0.1]) {
        const moldGroup = new THREE.Group();
        const mW = 1.6;
        const mH = 2.4;
        const mThick = 0.02;
        // Molding Border
        for (let my of [2.0 + mH / 2, 2.0 - mH / 2]) {
          const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, mThick, mW), goldMat);
          hBar.position.set(0, my, 0);
          moldGroup.add(hBar);
        }
        for (let mz of [-mW / 2, mW / 2]) {
          const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, mH, mThick), goldMat);
          vBar.position.set(0, 2.0, mz);
          moldGroup.add(vBar);
        }

        // Modern Minimalist Vertical LED Wall Sconce inside each frame
        const sconceBody = new THREE.Mesh(createRoundedBoxGeometry(0.04, 0.55, 0.05, 0.01, 2), goldMat);
        sconceBody.position.set(-0.02, 2.0, 0);
        moldGroup.add(sconceBody);

        const sconceLight = new THREE.PointLight(0xffd59e, 0.6, 3.5, 1.8);
        sconceLight.position.set(-0.15, 2.0, 0);
        moldGroup.add(sconceLight);

        moldGroup.position.set(rightWallX, 0, rz);
        this.scene.add(moldGroup);
      }

      // =========================================================================
      // 9. FRONT WALL: DOORWAY BACK TO STUDY ROOM
      // =========================================================================
      const backDoorGroup = new THREE.Group();
      const doorRaw = this.loadedModels['lr_door'];
      if (doorRaw) {
        const doorMesh = this.fitModelToBounds(doorRaw, { targetHeight: gapH, alignBottomY: true });
        if (doorMesh) backDoorGroup.add(doorMesh);
      } else {
        const bFrameMat = darkWoodMat;
        [[-0.7, 1.35, 0.1, 2.7, 0.12], [0.7, 1.35, 0.1, 2.7, 0.12]].forEach(([x, y, w, h, d]) => {
          const post = new THREE.Mesh(createRoundedBoxGeometry(w, h, d, 0.02, 2), bFrameMat);
          post.position.set(x, y, 0); backDoorGroup.add(post);
        });
        const top = new THREE.Mesh(createRoundedBoxGeometry(1.4, 0.1, 0.12, 0.02, 2), bFrameMat);
        top.position.set(0, 2.75, 0); backDoorGroup.add(top);
        const leaf = new THREE.Mesh(createRoundedBoxGeometry(1.18, 2.62, 0.06, 0.02, 2), darkWoodMat);
        leaf.position.set(0, 1.35, 0); backDoorGroup.add(leaf);
      }
      // Cyan neon return sign
      const backSignBox = new THREE.Mesh(createRoundedBoxGeometry(0.76, 0.22, 0.06, 0.02, 2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
      backSignBox.position.set(0, 2.95, 0.05); backDoorGroup.add(backSignBox);
      const backSign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2 }));
      backSign.position.set(0, 2.95, 0.082); backDoorGroup.add(backSign);
      const backLight = new THREE.PointLight(0x38bdf8, 0.5, 3, 1.5);
      backLight.position.set(0, 3.0, 0.3); backDoorGroup.add(backLight);
      backDoorGroup.position.set(0, 0, roomL / 2 - 0.05);
      this.scene.add(backDoorGroup);

      // Register back door as interactable
      backDoorGroup.userData = { vocabId: 'back_door', interactable: true };
      backDoorGroup.traverse(c => { c.userData = { vocabId: 'back_door', interactable: true }; });
      this.interactiveObjects.push(backDoorGroup);

      // Player avatar
      this.buildPlayerAvatar();

      // Colliders matching the luxury layout
      this.colliders = [
        { name: 'sofa_left',      minX: -3.5, maxX: -2.1, minZ: -3.0, maxZ: 1.0 },
        { name: 'coffee_table',   minX: -1.3, maxX: 1.3,  minZ: -1.8, maxZ: -0.2 },
        { name: 'armchair_1',     minX: 1.9,  maxX: 3.3,  minZ: -2.8, maxZ: -1.4 },
        { name: 'armchair_2',     minX: 1.9,  maxX: 3.3,  minZ: -0.6, maxZ: 0.8 },
        { name: 'side_table',     minX: 2.3,  maxX: 3.4,  minZ: -1.5, maxZ: -0.5 },
        { name: 'tv_credenza',    minX: -2.8, maxX: 2.8,  minZ: -4.9, maxZ: -4.1 },
        { name: 'cabinet_left',   minX: -4.2, maxX: -2.5, minZ: -4.9, maxZ: -4.1 },
        { name: 'cabinet_right',  minX: 2.5,  maxX: 4.2,  minZ: -4.9, maxZ: -4.1 },
      ];

      this.currentRoom = 'living';
    }

    exitRoomToMenu() {
      if (document.exitPointerLock) document.exitPointerLock();
      const doorModal = document.getElementById('doorModal');
      if (doorModal) doorModal.classList.remove('active');
      this.closeVocabModal();
      this.state.soundFX.playDiscover();
      this.switchScreen('start');
    }


    toggleCameraMode() {
      const newMode = this.cameraMode === 'third_person' ? 'first_person' : 'third_person';
      this.setCameraMode(newMode);
    }

    setCameraMode(mode) {
      this.cameraMode = mode;
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

    switchScreen(screenName) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      if (screenName === 'start') {
        document.getElementById('screenStart').classList.add('active');
        this.updateProgressUI();
      } else if (screenName === 'game') {
        document.getElementById('screenGame').classList.add('active');
        this.onWindowResize();
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

      this.state.activeItem = data;
      const isNew = this.state.markDiscovered(vocabId);
      this.updateProgressUI();

      // Fill text fields
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
      discText.textContent = isNew ? '✨ Mới phát hiện! +100 Điểm vào sổ tay' : '✓ Đã từng khám phá đồ vật này';

      // Setup Mini Quiz
      this.renderMiniQuiz(data.quiz);

      // Render 3D Isolated Model in Inspector
      const modal = document.getElementById('vocabModal');
      modal.classList.add('active');
      if (document.exitPointerLock) document.exitPointerLock();

      setTimeout(() => {
        if (this.objectMeshFactories[vocabId]) {
          this.inspector.showObject(this.objectMeshFactories[vocabId]);
        }
      }, 50);

      // Auto pronounce word on open
      setTimeout(() => {
        this.speakText(data.chinese, 'zh-TW');
      }, 350);

      // Check Victory Condition (12/12)
      if (this.state.discovered.size >= Object.keys(ROOM_VOCAB_DATA).length && isNew) {
        setTimeout(() => {
          this.showVictoryScreen();
        }, 1200);
      }
    }

    closeVocabModal() {
      const modal = document.getElementById('vocabModal');
      modal.classList.remove('active');
      this.state.activeItem = null;
      this.requestPointerLock();
    }

    renderMiniQuiz(quiz) {
      const qBox = document.getElementById('miniQuizBox');
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
          if (idx === quiz.correct) {
            btn.classList.add('correct');
            qStatus.textContent = '🎉 Chính xác! (+50 Điểm)';
            qStatus.style.color = 'var(--accent-emerald)';
            this.state.score += 50;
            this.state.quizStats.correct++;
            this.state.quizStats.total++;
            this.state.saveStorage();
            this.state.soundFX.playCorrect();
          } else {
            btn.classList.add('wrong');
            qOpts.children[quiz.correct].classList.add('correct');
            qStatus.textContent = '❌ Chưa đúng, hãy ôn lại nhé!';
            qStatus.style.color = 'var(--accent-rose)';
            this.state.quizStats.total++;
            this.state.saveStorage();
            this.state.soundFX.playWrong();
          }
          this.updateProgressUI();
        });
        qOpts.appendChild(btn);
      });
    }

    renderNotebookDrawer() {
      const container = document.getElementById('drawerVocabList');
      const count = document.getElementById('drawerSummaryCount');
      const total = Object.keys(ROOM_VOCAB_DATA).length;
      count.textContent = `Đã khám phá ${this.state.discovered.size}/${total} đồ vật`;

      container.innerHTML = '';
      Object.values(ROOM_VOCAB_DATA).forEach(item => {
        const isFound = this.state.discovered.has(item.id);
        const card = document.createElement('div');
        card.className = 'drawer-vocab-item';
        card.innerHTML = `
          <div class="drawer-item-left">
            <span class="drawer-item-icon">${isFound ? item.icon : '❓'}</span>
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
    }

    updateProgressUI() {
      const count = this.state.discovered.size;
      const total = Object.keys(ROOM_VOCAB_DATA).length;
      const pct = Math.round((count / total) * 100);

      // Start Screen Stats
      document.getElementById('totalDiscoveredStats').textContent = `${count}/${total}`;
      document.getElementById('totalScoreStats').textContent = this.state.score;
      document.getElementById('level1ProgressFill').style.width = `${pct}%`;
      document.getElementById('level1ProgressText').textContent = `Đã tìm: ${count}/${total} (${pct}%)`;

      // Gameplay HUD
      document.getElementById('hudDiscoveredCount').textContent = `${count} / ${total}`;
      document.getElementById('hudMiniFill').style.width = `${pct}%`;
      document.getElementById('hudDiscoveredBadge').textContent = count;
    }

    showVictoryScreen() {
      if (document.exitPointerLock) document.exitPointerLock();
      const modal = document.getElementById('victoryModal');
      document.getElementById('victoryScore').textContent = this.state.score;
      const totalQ = this.state.quizStats.total || 1;
      const acc = Math.round((this.state.quizStats.correct / totalQ) * 100);
      document.getElementById('victoryAccuracy').textContent = `${acc}%`;

      modal.classList.add('active');
      this.state.soundFX.playVictory();
    }

    // --- COLLISION RESOLUTION (SOLID FURNITURE & BOUNDARIES) ---
    resolveMovementCollisions(pos, moveStep) {
      const radius = 0.32;
      const targetPos = pos.clone().add(moveStep);

      // Room boundaries
      const bounds = this.roomBounds || { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 };
      targetPos.x = THREE.MathUtils.clamp(targetPos.x, bounds.minX, bounds.maxX);
      targetPos.z = THREE.MathUtils.clamp(targetPos.z, bounds.minZ, bounds.maxZ);

      // Obstacle collision boxes (with sliding resolution)
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

    // --- GAME LOOP & PHYSICS UPDATE ---
    updatePlayer(delta) {
      const isInputActive = this.isPointerLocked || this.joystickDir.x !== 0 || this.joystickDir.y !== 0;

      // Forward & Right vectors from Yaw
      const forward = new THREE.Vector3(-Math.sin(this.player.yaw), 0, -Math.cos(this.player.yaw));
      const right = new THREE.Vector3(Math.cos(this.player.yaw), 0, -Math.sin(this.player.yaw));

      const moveDir = new THREE.Vector3();

      if (isInputActive) {
        // Keyboard input
        if (this.keys.forward) moveDir.add(forward);
        if (this.keys.backward) moveDir.sub(forward);
        if (this.keys.right) moveDir.add(right);
        if (this.keys.left) moveDir.sub(right);

        // Virtual Joystick input
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

        // Solid sliding collision resolution
        this.player.pos = this.resolveMovementCollisions(this.player.pos, moveStep);
        this.state.soundFX.playFootstep();

        // Real character locomotion animation
        this.walkAnimPhase += delta * (this.keys.sprint ? 14 : 9.5);
        const isSprinting = this.keys.sprint;
        const legSwing = Math.sin(this.walkAnimPhase) * (isSprinting ? 0.85 : 0.62);
        const armSwing = Math.sin(this.walkAnimPhase) * (isSprinting ? 0.75 : 0.52);

        // Thighs (Đùi)
        if (this.playerBones.leftLeg) this.playerBones.leftLeg.rotation.x = legSwing;
        if (this.playerBones.rightLeg) this.playerBones.rightLeg.rotation.x = -legSwing;

        // Knees (Đầu gối uốn cong tự nhiên về phía sau khi nhấc chân)
        if (this.playerBones.leftKnee) this.playerBones.leftKnee.rotation.x = Math.max(0, -legSwing * 0.95);
        if (this.playerBones.rightKnee) this.playerBones.rightKnee.rotation.x = Math.max(0, legSwing * 0.95);

        // Arms & Elbows (Tay & Khớp khuỷu tay gập tự nhiên)
        if (this.playerBones.leftArm) {
          this.playerBones.leftArm.rotation.x = -armSwing;
          if (this.playerBones.leftElbow) {
            this.playerBones.leftElbow.rotation.x = -0.28 - Math.abs(armSwing) * 0.35;
          }
        }
        if (this.playerBones.rightArm) {
          this.playerBones.rightArm.rotation.x = armSwing;
          if (this.playerBones.rightElbow) {
            this.playerBones.rightElbow.rotation.x = -0.28 - Math.abs(armSwing) * 0.35;
          }
        }

        if (this.playerBones.torso) {
          this.playerBones.torso.rotation.z = Math.sin(this.walkAnimPhase) * 0.04;
          const bounce = Math.abs(Math.sin(this.walkAnimPhase * 2)) * 0.035;
          this.playerBones.torso.position.y = 0.85 + bounce;
        }
      } else {
        // Idle breathing and resetting limbs
        this.idleTime += delta;
        const blendFactor = Math.min(1, delta * 8);
        if (this.playerBones.leftLeg) this.playerBones.leftLeg.rotation.x = THREE.MathUtils.lerp(this.playerBones.leftLeg.rotation.x, 0, blendFactor);
        if (this.playerBones.rightLeg) this.playerBones.rightLeg.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightLeg.rotation.x, 0, blendFactor);
        if (this.playerBones.leftKnee) this.playerBones.leftKnee.rotation.x = THREE.MathUtils.lerp(this.playerBones.leftKnee.rotation.x, 0.04, blendFactor);
        if (this.playerBones.rightKnee) this.playerBones.rightKnee.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightKnee.rotation.x, 0.04, blendFactor);

        if (this.playerBones.leftArm) {
          this.playerBones.leftArm.rotation.x = THREE.MathUtils.lerp(this.playerBones.leftArm.rotation.x, 0.08, blendFactor);
          if (this.playerBones.leftElbow) {
            this.playerBones.leftElbow.rotation.x = THREE.MathUtils.lerp(this.playerBones.leftElbow.rotation.x, -0.20, blendFactor);
          }
        }
        if (this.playerBones.rightArm) {
          this.playerBones.rightArm.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightArm.rotation.x, 0.08, blendFactor);
          if (this.playerBones.rightElbow) {
            this.playerBones.rightElbow.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightElbow.rotation.x, -0.20, blendFactor);
          }
        }

        if (this.playerBones.torso) {
          this.playerBones.torso.rotation.z = THREE.MathUtils.lerp(this.playerBones.torso.rotation.z, 0, blendFactor);
          const breathe = Math.sin(this.idleTime * 2.2) * 0.01;
          this.playerBones.torso.position.y = 0.85 + breathe;
        }
      }

      // --- RIGHT ARM DYNAMIC AIMING AT CROSSHAIR (UP/DOWN PITCH SYNC) ---
      if (this.playerBones.rightArm) {
        const targetArmPitch = -Math.PI / 2 + this.player.pitch * 0.95;
        this.playerBones.rightArm.rotation.x = THREE.MathUtils.lerp(this.playerBones.rightArm.rotation.x, targetArmPitch, Math.min(1, delta * 20));
        this.playerBones.rightArm.rotation.y = -0.15; // Slightly inwards towards crosshair line
        this.playerBones.rightArm.rotation.z = 0.04;
      }

      // Align the character to the actual movement direction so the body does not drift
      // to the right while the camera yaw changes. When idle, keep facing the camera.
      if (this.playerMesh) {
        const desiredBodyYaw = isMoving ? Math.atan2(moveDir.x, moveDir.z) : this.player.yaw + Math.PI;
        let diff = desiredBodyYaw - this.playerMesh.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.playerMesh.rotation.y += diff * Math.min(1, delta * 12);
        this.playerMesh.position.set(this.player.pos.x, 0, this.player.pos.z);
      }

      // --- CAMERA PLACEMENT (THIRD PERSON OVER-THE-SHOULDER VS FIRST PERSON) ---
      if (this.cameraMode === 'third_person') {
        if (this.playerMesh) this.playerMesh.visible = true;

        const dist = this.cameraDistance;
        const cosPitch = Math.cos(this.player.pitch);
        const sinPitch = Math.sin(this.player.pitch);

        // Position camera behind and to the RIGHT shoulder (+0.40m)
        const shoulderOffset = 0.40;
        const headHeight = 1.50;

        let camX = this.player.pos.x + right.x * shoulderOffset - forward.x * (dist * cosPitch);
        let camZ = this.player.pos.z + right.z * shoulderOffset - forward.z * (dist * cosPitch);
        let camY = this.player.pos.y + headHeight - sinPitch * dist;

        // Room boundary protection to prevent camera clipping outside walls or ceiling
        camX = THREE.MathUtils.clamp(camX, -4.55, 4.55);
        camZ = THREE.MathUtils.clamp(camZ, -4.55, 4.55);
        camY = THREE.MathUtils.clamp(camY, 0.35, 3.9);

        // Aim straight ahead through the crosshair (aim point forward in the room)
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

    updateRaycaster() {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      raycaster.far = 6.0;

      // Flatten interactive child meshes for intersection test
      const targetMeshes = [];
      this.interactiveObjects.forEach(group => {
        group.traverse(child => {
          if (child.isMesh) {
            child.userData.rootGroup = group;
            targetMeshes.push(child);
          }
        });
      });

      let foundTarget = null;
      const intersects = raycaster.intersectObjects(targetMeshes, false);

      if (intersects.length > 0) {
        const root = intersects[0].object.userData.rootGroup;
        if (root && root.userData.vocabData) {
          const distToPlayer = this.player.pos.distanceTo(root.position);
          if (distToPlayer < 4.5) {
            foundTarget = root;
          }
        }
      }

      // Proximity assist for Third-Person Mode
      if (!foundTarget && this.cameraMode === 'third_person') {
        let closestDist = 2.5;
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
          this.targetedObject = foundTarget;
          this.crosshair.classList.add('active');
          this.promptEl.classList.add('visible');
          if (foundTarget.userData.vocabId === 'door') {
            this.promptTargetName.textContent = `門 (mén - Cửa phòng) • [E / Click] Vào Phòng Khách 🛋️`;
          } else if (foundTarget.userData.vocabId === 'back_door') {
            this.promptTargetName.textContent = `🚪 Cửa Phòng Học • [E / Click] Quay Về Phòng Học`;
          } else {
            this.promptTargetName.textContent = `${foundTarget.userData.vocabData.chinese} (${foundTarget.userData.vocabData.nameVi})`;
          }
          this.state.soundFX.playHover();
        }
        return;
      }

      if (this.targetedObject !== null) {
        this.targetedObject = null;
        this.crosshair.classList.remove('active');
        this.promptEl.classList.remove('visible');
      }
    }

    updateAnimations(delta) {
      // 1. Wall clock ticking hand
      if (this.clockHandSec) {
        this.clockHandSec.rotation.z -= delta * 1.5;
      }

      // 2. Coffee steam rising animation
      this.smokeParticles.forEach(p => {
        p.position.y += p.userData.speedY;
        p.material.opacity = Math.max(0, 0.3 - (p.position.y - p.userData.initY) * 0.8);
        if (p.position.y > p.userData.initY + 0.35) {
          p.position.y = p.userData.initY;
          p.position.x = 0.65 + (Math.random() - 0.5) * 0.04;
          p.position.z = -3.5 + (Math.random() - 0.5) * 0.04;
        }
      });
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.updatePlayer(delta);
      this.updateRaycaster();
      this.updateAnimations(delta);

      this.renderer.render(this.scene, this.camera);
    }
  }

  // --- INITIALIZE ON DOM READY ---
  window.addEventListener('DOMContentLoaded', () => {
    window.vocabGame = new VocabRoomGame();
  });

})();
