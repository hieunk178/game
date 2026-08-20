/**
 * ============================================================================
 * 3D VOCAB QUEST - CORE ENGINE & GAME LOGIC
 * Powered by Three.js (r128)
 * ============================================================================
 */

(function () {
  'use strict';


  // ==========================================================================
  // HỒ SƠ THIẾT BỊ — quyết định mức đồ hoạ & cách điều khiển
  // ==========================================================================
  const DEVICE = (() => {
    const ua = navigator.userAgent;
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
    const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(ua);
    // Kiểm tra UA có chứa "Mobile" (nhưng loại trừ desktop browsers)
    const uaHasMobile = /Mobile/i.test(ua) && !/Windows NT|Macintosh|CrOS|Linux x86/i.test(ua);
    // Nhận diện desktop platform qua UA
    const isDesktopPlatform = /Windows NT|Macintosh|CrOS|Linux x86_64/i.test(ua);

    const shortSide = Math.min(screen.width, screen.height);
    // Chỉ coi là mobile khi:
    // 1. UA rõ ràng là thiết bị di động, HOẶC
    // 2. UA có "Mobile" và không phải desktop, HOẶC
    // 3. Có touch + màn hình nhỏ thật sự (<=768) + KHÔNG PHẢI desktop platform
    const isMobile = uaMobile || uaHasMobile ||
                     (hasTouch && shortSide <= 768 && !isDesktopPlatform);

    // Điện thoại thật sự (không tính máy tính bảng) — dùng để rút gọn trang chủ
    const isPhone = isMobile && shortSide <= 520;
    const dpr = window.devicePixelRatio || 1;

    // useTouchUI: quyết định GIAO DIỆN (joystick, nút cảm ứng, ẩn pointer lock)
    // = true CHỈ trên thiết bị di động thật sự, KHÔNG phải desktop có cảm ứng
    // hasTouch: cho biết thiết bị CÓ KHẢ NĂNG cảm ứng (dùng để đăng ký sự kiện touch)
    const useTouchUI = isMobile;

    return {
      hasTouch: hasTouch || uaMobile,
      useTouchUI,
      isMobile,
      isPhone,
      isDesktopPlatform,
      // Điện thoại: giảm độ phân giải render, tắt khử răng cưa, bóng đổ nhẹ hơn
      pixelRatio: isMobile ? Math.min(dpr, 1.5) : Math.min(dpr, 2),
      antialias: !isMobile,
      shadowMapSize: isMobile ? 1024 : 2048,
      softShadows: !isMobile,
      // GPU di động rất chậm khi shader phải lặp qua nhiều nguồn sáng
      maxPointLights: isMobile ? 6 : 64,
      ambientBoost: isMobile ? 1.28 : 1,
      // Bớt chi tiết trang trí ở cảnh ngoài trời
      detailLevel: isMobile ? 0.55 : 1
    };
  })();

  if (DEVICE.hasTouch) document.documentElement.classList.add('is-touch');
  if (DEVICE.useTouchUI) document.documentElement.classList.add('is-touch-ui');
  if (DEVICE.isMobile) document.documentElement.classList.add('is-mobile');
  if (DEVICE.isPhone) document.documentElement.classList.add('is-phone');

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

  // ==========================================================================
  // VOCABULARY DATABASE — CHIA THEO TỪNG KHU VỰC (ZONE) TRONG HÀNH TRÌNH
  // Phòng ngủ → Phòng khách → Phòng bếp → Đường phố → Công viên
  // ==========================================================================

  // --- ZONE 1: PHÒNG NGỦ (臥室) ---
  const BEDROOM_VOCAB = {
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

  // --- ZONE 2: PHÒNG KHÁCH (客廳) ---
  const LIVING_VOCAB = {
    lr_sofa: {
      id: 'lr_sofa',
      nameVi: 'Ghế sofa da dài',
      chinese: '沙發',
      pinyin: 'shā fā',
      english: 'Sofa / Couch',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 張 (zhāng) / 套 (tào)',
      meaning: 'Ghế sofa, ghế dài bọc da hoặc vải để cả nhà ngồi nghỉ ngơi, xem tivi.',
      exampleCn: '我喜歡坐在沙發上看電視。',
      examplePinyin: 'Wǒ xǐhuan zuò zài shāfā shàng kàn diànshì.',
      exampleVi: 'Tôi thích ngồi trên ghế sofa xem tivi.',
      category: 'Nội thất phòng khách',
      icon: '🛋️',
      quiz: {
        question: 'Từ "沙發" (shāfā) là từ mượn của tiếng Anh nào?',
        options: ['Sofa', 'Safe', 'Surface'],
        correct: 0
      }
    },
    lr_tv: {
      id: 'lr_tv',
      nameVi: 'Ti vi màn hình phẳng',
      chinese: '電視',
      pinyin: 'diàn shì',
      english: 'Television / TV',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Ti vi, thiết bị xem phim và tin tức, cách luyện nghe tiếng Trung rất tốt.',
      exampleCn: '客廳裡有一台很大的電視。',
      examplePinyin: 'Kètīng lǐ yǒu yì tái hěn dà de diànshì.',
      exampleVi: 'Trong phòng khách có một chiếc ti vi rất lớn.',
      category: 'Thiết bị điện tử',
      icon: '📺',
      quiz: {
        question: '"看電視" (kàn diànshì) nghĩa là gì?',
        options: ['Xem ti vi', 'Mua ti vi', 'Sửa ti vi'],
        correct: 0
      }
    },
    lr_coffeeTable: {
      id: 'lr_coffeeTable',
      nameVi: 'Bàn trà giữa phòng',
      chinese: '茶几',
      pinyin: 'chá jī',
      english: 'Coffee Table / Tea Table',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 張 (zhāng)',
      meaning: 'Bàn trà thấp đặt giữa phòng khách để bày ấm trà, hoa và đồ trang trí.',
      exampleCn: '茶几上放著一壺熱茶。',
      examplePinyin: 'Chájī shàng fàng zhe yì hú rè chá.',
      exampleVi: 'Trên bàn trà có đặt một ấm trà nóng.',
      category: 'Nội thất phòng khách',
      icon: '🫖',
      quiz: {
        question: 'Chữ "茶" trong "茶几" mang nghĩa gì?',
        options: ['Trà', 'Ghế', 'Nhà'],
        correct: 0
      }
    },
    lr_rug: {
      id: 'lr_rug',
      nameVi: 'Thảm trải sàn',
      chinese: '地毯',
      pinyin: 'dì tǎn',
      english: 'Carpet / Rug',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 塊 (kuài) / 張 (zhāng)',
      meaning: 'Thảm trải sàn êm ái giúp căn phòng ấm cúng và sang trọng hơn.',
      exampleCn: '這塊地毯又軟又暖和。',
      examplePinyin: 'Zhè kuài dìtǎn yòu ruǎn yòu nuǎnhuo.',
      exampleVi: 'Tấm thảm này vừa mềm vừa ấm áp.',
      category: 'Trang trí & Không gian',
      icon: '🧶',
      quiz: {
        question: 'Chữ "地" trong "地毯" nghĩa là gì?',
        options: ['Mặt đất / Sàn nhà', 'Bầu trời', 'Bức tường'],
        correct: 0
      }
    },
    lr_armchair: {
      id: 'lr_armchair',
      nameVi: 'Ghế bành có tay vịn',
      chinese: '扶手椅',
      pinyin: 'fú shǒu yǐ',
      english: 'Armchair',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 把 (bǎ)',
      meaning: 'Ghế bành có tay vịn hai bên, ngồi đọc sách hoặc tiếp khách rất thoải mái.',
      exampleCn: '爺爺坐在扶手椅上看報紙。',
      examplePinyin: 'Yéye zuò zài fúshǒuyǐ shàng kàn bàozhǐ.',
      exampleVi: 'Ông ngồi trên ghế bành đọc báo.',
      category: 'Nội thất phòng khách',
      icon: '💺',
      quiz: {
        question: '"扶手" trong "扶手椅" chỉ bộ phận nào của ghế?',
        options: ['Tay vịn', 'Chân ghế', 'Lưng ghế'],
        correct: 0
      }
    },
    lr_chandelier: {
      id: 'lr_chandelier',
      nameVi: 'Đèn chùm pha lê',
      chinese: '吊燈',
      pinyin: 'diào dēng',
      english: 'Chandelier / Pendant Lamp',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 盞 (zhǎn)',
      meaning: 'Đèn chùm treo trên trần nhà, toả ánh sáng lộng lẫy cho phòng khách.',
      exampleCn: '天花板上掛著一盞水晶吊燈。',
      examplePinyin: 'Tiānhuābǎn shàng guà zhe yì zhǎn shuǐjīng diàodēng.',
      exampleVi: 'Trên trần nhà treo một chiếc đèn chùm pha lê.',
      category: 'Chiếu sáng & Trang trí',
      icon: '💎',
      quiz: {
        question: 'Chữ "吊" (diào) trong "吊燈" mang nghĩa gì?',
        options: ['Treo lên', 'Đặt xuống', 'Bật lên'],
        correct: 0
      }
    },
    lr_painting: {
      id: 'lr_painting',
      nameVi: 'Bức tranh treo tường',
      chinese: '畫',
      pinyin: 'huà',
      english: 'Painting / Picture',
      partOfSpeech: 'Danh từ & Động từ • Lượng từ: 幅 (fú)',
      meaning: 'Bức tranh nghệ thuật treo tường; "畫" cũng là động từ "vẽ".',
      exampleCn: '牆上掛著三幅漂亮的畫。',
      examplePinyin: 'Qiáng shàng guà zhe sān fú piàoliang de huà.',
      exampleVi: 'Trên tường treo ba bức tranh rất đẹp.',
      category: 'Nghệ thuật & Trang trí',
      icon: '🖼️',
      quiz: {
        question: 'Lượng từ chuẩn của "畫" (bức tranh) là:',
        options: ['幅 (fú)', '本 (běn)', '把 (bǎ)'],
        correct: 0
      }
    },
    lr_bookcase: {
      id: 'lr_bookcase',
      nameVi: 'Tủ trưng bày / Kệ sách',
      chinese: '書架',
      pinyin: 'shū jià',
      english: 'Bookshelf / Display Cabinet',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Giá sách, tủ trưng bày để xếp sách và đồ lưu niệm trong phòng khách.',
      exampleCn: '書架上擺滿了書和紀念品。',
      examplePinyin: 'Shūjià shàng bǎi mǎn le shū hé jìniànpǐn.',
      exampleVi: 'Trên kệ sách bày đầy sách và đồ lưu niệm.',
      category: 'Nội thất phòng khách',
      icon: '🗄️',
      quiz: {
        question: '"書架" khác "書包" ở chỗ nào?',
        options: ['書架 là giá sách, 書包 là cặp sách', 'Hai từ giống hệt nhau', '書架 là quyển sách'],
        correct: 0
      }
    },
    lr_bear: {
      id: 'lr_bear',
      nameVi: 'Gấu bông',
      chinese: '玩具熊',
      pinyin: 'wán jù xióng',
      english: 'Teddy Bear',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 隻 (zhī)',
      meaning: 'Gấu bông đồ chơi mềm mại, món quà đáng yêu đặt trên kệ trang trí.',
      exampleCn: '妹妹最喜歡那隻玩具熊。',
      examplePinyin: 'Mèimei zuì xǐhuan nà zhī wánjùxióng.',
      exampleVi: 'Em gái thích nhất chú gấu bông kia.',
      category: 'Đồ chơi & Trang trí',
      icon: '🧸',
      quiz: {
        question: 'Từ "玩具" (wánjù) nghĩa là gì?',
        options: ['Đồ chơi', 'Dụng cụ', 'Đồ ăn'],
        correct: 0
      }
    },
    lr_radio: {
      id: 'lr_radio',
      nameVi: 'Đài radio cổ điển',
      chinese: '收音機',
      pinyin: 'shōu yīn jī',
      english: 'Radio',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Máy radio thu sóng phát thanh, nghe tin tức và nhạc để luyện nghe.',
      exampleCn: '爸爸每天早上都聽收音機。',
      examplePinyin: 'Bàba měitiān zǎoshang dōu tīng shōuyīnjī.',
      exampleVi: 'Bố nghe radio mỗi buổi sáng.',
      category: 'Thiết bị điện tử',
      icon: '📻',
      quiz: {
        question: '"收音機" ghép từ 3 chữ có nghĩa đen là:',
        options: ['Máy thu âm thanh', 'Máy phát hình', 'Máy ghi chép'],
        correct: 0
      }
    },
    lr_vase: {
      id: 'lr_vase',
      nameVi: 'Bình hoa trang trí',
      chinese: '花瓶',
      pinyin: 'huā píng',
      english: 'Flower Vase',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Bình hoa dùng để cắm hoa tươi, làm đẹp không gian phòng khách.',
      exampleCn: '桌上的花瓶裡插著新鮮的花。',
      examplePinyin: 'Zhuō shàng de huāpíng lǐ chā zhe xīnxiān de huā.',
      exampleVi: 'Trong bình hoa trên bàn có cắm những bông hoa tươi.',
      category: 'Trang trí & Không gian',
      icon: '🏺',
      quiz: {
        question: 'Chữ "瓶" (píng) nghĩa là gì?',
        options: ['Cái bình / chai', 'Bông hoa', 'Cái bàn'],
        correct: 0
      }
    },
    lr_pillow: {
      id: 'lr_pillow',
      nameVi: 'Gối tựa lưng',
      chinese: '抱枕',
      pinyin: 'bào zhěn',
      english: 'Cushion / Throw Pillow',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Gối ôm, gối tựa đặt trên sofa để ngồi tựa lưng thoải mái hơn.',
      exampleCn: '沙發上有幾個柔軟的抱枕。',
      examplePinyin: 'Shāfā shàng yǒu jǐ ge róuruǎn de bàozhěn.',
      exampleVi: 'Trên ghế sofa có mấy chiếc gối tựa mềm mại.',
      category: 'Nội thất phòng khách',
      icon: '🛏️',
      quiz: {
        question: 'Chữ "抱" (bào) trong "抱枕" nghĩa là gì?',
        options: ['Ôm', 'Ngủ', 'Ngồi'],
        correct: 0
      }
    }
  };

  // --- ZONE 3: PHÒNG BẾP (廚房) ---
  const KITCHEN_VOCAB = {
    kt_fridge: {
      id: 'kt_fridge',
      nameVi: 'Tủ lạnh',
      chinese: '冰箱',
      pinyin: 'bīng xiāng',
      english: 'Refrigerator / Fridge',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Tủ lạnh dùng để bảo quản thực phẩm, rau củ và đồ uống luôn tươi mát.',
      exampleCn: '冰箱裡有牛奶和水果。',
      examplePinyin: 'Bīngxiāng lǐ yǒu niúnǎi hé shuǐguǒ.',
      exampleVi: 'Trong tủ lạnh có sữa và trái cây.',
      category: 'Thiết bị nhà bếp',
      icon: '🧊',
      quiz: {
        question: '"冰箱" ghép từ 2 chữ nghĩa đen là gì?',
        options: ['Băng (đá lạnh) + Hòm (thùng)', 'Lửa + Hộp', 'Nước + Tủ'],
        correct: 0
      }
    },
    kt_stove: {
      id: 'kt_stove',
      nameVi: 'Bếp nấu / Bếp ga',
      chinese: '爐子',
      pinyin: 'lú zi',
      english: 'Stove / Cooker',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Bếp lò, bếp ga dùng để nấu nướng các món ăn hằng ngày.',
      exampleCn: '媽媽在爐子上煮湯。',
      examplePinyin: 'Māma zài lúzi shàng zhǔ tāng.',
      exampleVi: 'Mẹ đang nấu canh trên bếp.',
      category: 'Thiết bị nhà bếp',
      icon: '🔥',
      quiz: {
        question: 'Động từ "煮" (zhǔ) nghĩa là gì?',
        options: ['Nấu / luộc', 'Rửa', 'Cắt'],
        correct: 0
      }
    },
    kt_sink: {
      id: 'kt_sink',
      nameVi: 'Bồn rửa chén',
      chinese: '水槽',
      pinyin: 'shuǐ cáo',
      english: 'Kitchen Sink',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Bồn rửa trong bếp để rửa rau, rửa bát đĩa sau bữa ăn.',
      exampleCn: '請把碗放進水槽裡。',
      examplePinyin: 'Qǐng bǎ wǎn fàng jìn shuǐcáo lǐ.',
      exampleVi: 'Hãy bỏ bát vào bồn rửa nhé.',
      category: 'Thiết bị nhà bếp',
      icon: '🚰',
      quiz: {
        question: '"洗碗" (xǐ wǎn) nghĩa là gì?',
        options: ['Rửa bát', 'Nấu cơm', 'Lau bàn'],
        correct: 0
      }
    },
    kt_microwave: {
      id: 'kt_microwave',
      nameVi: 'Lò vi sóng',
      chinese: '微波爐',
      pinyin: 'wéi bō lú',
      english: 'Microwave Oven',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Lò vi sóng hâm nóng thức ăn nhanh chóng chỉ trong vài phút.',
      exampleCn: '用微波爐熱一下飯吧。',
      examplePinyin: 'Yòng wéibōlú rè yíxià fàn ba.',
      exampleVi: 'Dùng lò vi sóng hâm nóng cơm một chút nhé.',
      category: 'Thiết bị nhà bếp',
      icon: '📡',
      quiz: {
        question: '"微波" trong "微波爐" nghĩa là gì?',
        options: ['Vi sóng (sóng nhỏ)', 'Nước nóng', 'Không khí'],
        correct: 0
      }
    },
    kt_cabinet: {
      id: 'kt_cabinet',
      nameVi: 'Tủ bếp đựng đồ',
      chinese: '櫥櫃',
      pinyin: 'chú guì',
      english: 'Kitchen Cabinet / Cupboard',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Tủ bếp để cất giữ bát đĩa, gia vị và các dụng cụ nấu ăn.',
      exampleCn: '碗盤都收在櫥櫃裡。',
      examplePinyin: 'Wǎnpán dōu shōu zài chúguì lǐ.',
      exampleVi: 'Bát đĩa đều được cất trong tủ bếp.',
      category: 'Nội thất nhà bếp',
      icon: '🗃️',
      quiz: {
        question: 'Chữ "櫥" (chú) liên quan tới đồ vật nào?',
        options: ['Cái tủ', 'Cái nồi', 'Cái bếp'],
        correct: 0
      }
    },
    kt_coffeeMachine: {
      id: 'kt_coffeeMachine',
      nameVi: 'Máy pha cà phê',
      chinese: '咖啡機',
      pinyin: 'kā fēi jī',
      english: 'Coffee Machine',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Máy pha cà phê tự động, pha một ly espresso thơm lừng buổi sáng.',
      exampleCn: '早上我用咖啡機煮一杯咖啡。',
      examplePinyin: 'Zǎoshang wǒ yòng kāfēijī zhǔ yì bēi kāfēi.',
      exampleVi: 'Buổi sáng tôi dùng máy pha một ly cà phê.',
      category: 'Thiết bị nhà bếp',
      icon: '☕',
      quiz: {
        question: 'Hậu tố "機" (jī) trong tên đồ vật thường mang nghĩa gì?',
        options: ['Máy móc', 'Đồ ăn', 'Con người'],
        correct: 0
      }
    },
    kt_toaster: {
      id: 'kt_toaster',
      nameVi: 'Máy nướng bánh mì',
      chinese: '烤麵包機',
      pinyin: 'kǎo miàn bāo jī',
      english: 'Toaster',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Máy nướng bánh mì giòn rụm cho bữa sáng nhanh gọn.',
      exampleCn: '我用烤麵包機烤了兩片吐司。',
      examplePinyin: 'Wǒ yòng kǎomiànbāojī kǎo le liǎng piàn tǔsī.',
      exampleVi: 'Tôi đã nướng hai lát bánh mì bằng máy nướng.',
      category: 'Thiết bị nhà bếp',
      icon: '🍞',
      quiz: {
        question: '"麵包" (miànbāo) nghĩa là gì?',
        options: ['Bánh mì', 'Mì sợi', 'Bánh bao thịt'],
        correct: 0
      }
    },
    kt_blender: {
      id: 'kt_blender',
      nameVi: 'Máy xay sinh tố',
      chinese: '果汁機',
      pinyin: 'guǒ zhī jī',
      english: 'Blender / Juicer',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
      meaning: 'Máy xay ép trái cây thành nước ép và sinh tố mát lạnh.',
      exampleCn: '她用果汁機打了一杯果汁。',
      examplePinyin: 'Tā yòng guǒzhījī dǎ le yì bēi guǒzhī.',
      exampleVi: 'Cô ấy dùng máy xay làm một ly nước ép.',
      category: 'Thiết bị nhà bếp',
      icon: '🥤',
      quiz: {
        question: '"果汁" (guǒzhī) nghĩa là gì?',
        options: ['Nước ép trái cây', 'Trái cây khô', 'Rau củ'],
        correct: 0
      }
    },
    kt_table: {
      id: 'kt_table',
      nameVi: 'Bàn ăn gia đình',
      chinese: '餐桌',
      pinyin: 'cān zhuō',
      english: 'Dining Table',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 張 (zhāng)',
      meaning: 'Bàn ăn nơi cả gia đình quây quần dùng bữa và trò chuyện.',
      exampleCn: '全家人圍著餐桌吃晚飯。',
      examplePinyin: 'Quánjiā rén wéi zhe cānzhuō chī wǎnfàn.',
      exampleVi: 'Cả nhà quây quần bên bàn ăn dùng bữa tối.',
      category: 'Nội thất nhà bếp',
      icon: '🍽️',
      quiz: {
        question: 'Chữ "餐" (cān) liên quan tới việc gì?',
        options: ['Bữa ăn', 'Giấc ngủ', 'Việc học'],
        correct: 0
      }
    },
    kt_trashcan: {
      id: 'kt_trashcan',
      nameVi: 'Thùng rác',
      chinese: '垃圾桶',
      pinyin: 'lè sè tǒng',
      english: 'Trash Can / Bin',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Thùng rác để bỏ rác, giữ căn bếp luôn sạch sẽ gọn gàng.',
      exampleCn: '請把垃圾丟進垃圾桶。',
      examplePinyin: 'Qǐng bǎ lèsè diū jìn lèsètǒng.',
      exampleVi: 'Hãy vứt rác vào thùng rác nhé.',
      category: 'Đồ dùng nhà bếp',
      icon: '🗑️',
      quiz: {
        question: '"垃圾" ở Đài Loan đọc là "lèsè", ở Đại lục đọc là:',
        options: ['lājī', 'lèlè', 'lǐshì'],
        correct: 0
      }
    }
  };

  // --- ZONE 4: ĐƯỜNG PHỐ (街道) ---
  const STREET_VOCAB = {
    st_road: {
      id: 'st_road',
      nameVi: 'Con đường lớn',
      chinese: '馬路',
      pinyin: 'mǎ lù',
      english: 'Road / Street',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 條 (tiáo)',
      meaning: 'Đường cái, mặt đường lớn nơi xe cộ qua lại tấp nập.',
      exampleCn: '過馬路要小心車子。',
      examplePinyin: 'Guò mǎlù yào xiǎoxīn chēzi.',
      exampleVi: 'Qua đường phải cẩn thận xe cộ.',
      category: 'Giao thông & Thành phố',
      icon: '🛣️',
      quiz: {
        question: '"過馬路" (guò mǎlù) nghĩa là gì?',
        options: ['Qua đường', 'Xây đường', 'Quét đường'],
        correct: 0
      }
    },
    st_trafficLight: {
      id: 'st_trafficLight',
      nameVi: 'Đèn giao thông',
      chinese: '紅綠燈',
      pinyin: 'hóng lǜ dēng',
      english: 'Traffic Light',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge) / 盞 (zhǎn)',
      meaning: 'Đèn tín hiệu giao thông đỏ - vàng - xanh điều khiển xe và người đi bộ.',
      exampleCn: '紅燈停，綠燈行。',
      examplePinyin: 'Hóng dēng tíng, lǜ dēng xíng.',
      exampleVi: 'Đèn đỏ thì dừng, đèn xanh thì đi.',
      category: 'Giao thông & Thành phố',
      icon: '🚦',
      quiz: {
        question: '"紅綠燈" ghép từ những màu nào?',
        options: ['Đỏ + Xanh lá', 'Đỏ + Vàng', 'Xanh dương + Trắng'],
        correct: 0
      }
    },
    st_crosswalk: {
      id: 'st_crosswalk',
      nameVi: 'Vạch kẻ qua đường',
      chinese: '斑馬線',
      pinyin: 'bān mǎ xiàn',
      english: 'Crosswalk / Zebra Crossing',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 條 (tiáo)',
      meaning: 'Vạch sang đường kẻ sọc trắng, người đi bộ phải đi đúng vạch này.',
      exampleCn: '行人要走斑馬線過馬路。',
      examplePinyin: 'Xíngrén yào zǒu bānmǎxiàn guò mǎlù.',
      exampleVi: 'Người đi bộ phải đi trên vạch kẻ để qua đường.',
      category: 'Giao thông & Thành phố',
      icon: '🦓',
      quiz: {
        question: '"斑馬" (bānmǎ) trong "斑馬線" là con vật nào?',
        options: ['Ngựa vằn', 'Con bò', 'Con hổ'],
        correct: 0
      }
    },
    st_streetLamp: {
      id: 'st_streetLamp',
      nameVi: 'Cột đèn đường',
      chinese: '路燈',
      pinyin: 'lù dēng',
      english: 'Street Lamp',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 盞 (zhǎn) / 支 (zhī)',
      meaning: 'Đèn đường chiếu sáng vỉa hè và lòng đường vào ban đêm.',
      exampleCn: '天黑了，路燈都亮了。',
      examplePinyin: 'Tiān hēi le, lùdēng dōu liàng le.',
      exampleVi: 'Trời tối rồi, đèn đường đều đã bật sáng.',
      category: 'Giao thông & Thành phố',
      icon: '🏮',
      quiz: {
        question: '"亮" (liàng) trong câu "路燈亮了" nghĩa là gì?',
        options: ['Sáng lên', 'Tắt đi', 'Hỏng rồi'],
        correct: 0
      }
    },
    st_busStop: {
      id: 'st_busStop',
      nameVi: 'Trạm xe buýt',
      chinese: '公車站',
      pinyin: 'gōng chē zhàn',
      english: 'Bus Stop',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
      meaning: 'Trạm dừng xe buýt, nơi hành khách đứng chờ và lên xe.',
      exampleCn: '我在公車站等了十分鐘。',
      examplePinyin: 'Wǒ zài gōngchēzhàn děng le shí fēnzhōng.',
      exampleVi: 'Tôi đã đợi mười phút ở trạm xe buýt.',
      category: 'Giao thông & Thành phố',
      icon: '🚏',
      quiz: {
        question: 'Chữ "站" (zhàn) trong "公車站" nghĩa là gì?',
        options: ['Trạm / bến', 'Xe cộ', 'Con người'],
        correct: 0
      }
    },
    st_tree: {
      id: 'st_tree',
      nameVi: 'Cây xanh ven đường',
      chinese: '樹',
      pinyin: 'shù',
      english: 'Tree',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 棵 (kē)',
      meaning: 'Cây xanh trồng dọc vỉa hè, cho bóng mát và không khí trong lành.',
      exampleCn: '路邊種了很多棵大樹。',
      examplePinyin: 'Lù biān zhòng le hěn duō kē dà shù.',
      exampleVi: 'Ven đường trồng rất nhiều cây lớn.',
      category: 'Thiên nhiên & Thành phố',
      icon: '🌳',
      quiz: {
        question: 'Lượng từ chuẩn của "樹" (cây) là:',
        options: ['棵 (kē)', '條 (tiáo)', '張 (zhāng)'],
        correct: 0
      }
    },
    st_building: {
      id: 'st_building',
      nameVi: 'Toà nhà cao tầng',
      chinese: '大樓',
      pinyin: 'dà lóu',
      english: 'Building / High-rise',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 棟 (dòng) / 座 (zuò)',
      meaning: 'Toà nhà cao tầng, cao ốc văn phòng hoặc chung cư trong thành phố.',
      exampleCn: '這棟大樓有三十層。',
      examplePinyin: 'Zhè dòng dàlóu yǒu sānshí céng.',
      exampleVi: 'Toà nhà này có ba mươi tầng.',
      category: 'Kiến trúc & Thành phố',
      icon: '🏢',
      quiz: {
        question: '"層" (céng) trong "三十層" chỉ đơn vị gì?',
        options: ['Tầng lầu', 'Mét', 'Phòng'],
        correct: 0
      }
    },
    st_car: {
      id: 'st_car',
      nameVi: 'Xe ô tô',
      chinese: '汽車',
      pinyin: 'qì chē',
      english: 'Car / Automobile',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 輛 (liàng)',
      meaning: 'Xe hơi, ô tô chạy trên đường phố, phương tiện đi lại phổ biến.',
      exampleCn: '路上有很多輛汽車。',
      examplePinyin: 'Lù shàng yǒu hěn duō liàng qìchē.',
      exampleVi: 'Trên đường có rất nhiều chiếc ô tô.',
      category: 'Giao thông & Thành phố',
      icon: '🚗',
      quiz: {
        question: 'Lượng từ đi với "汽車" là:',
        options: ['輛 (liàng)', '隻 (zhī)', '本 (běn)'],
        correct: 0
      }
    },
    st_shop: {
      id: 'st_shop',
      nameVi: 'Cửa hàng tiện lợi',
      chinese: '商店',
      pinyin: 'shāng diàn',
      english: 'Shop / Store',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 家 (jiā)',
      meaning: 'Cửa hàng, tiệm bán đồ ăn thức uống và đồ dùng hằng ngày.',
      exampleCn: '轉角有一家便利商店。',
      examplePinyin: 'Zhuǎnjiǎo yǒu yì jiā biànlì shāngdiàn.',
      exampleVi: 'Ở góc phố có một cửa hàng tiện lợi.',
      category: 'Mua sắm & Thành phố',
      icon: '🏪',
      quiz: {
        question: 'Lượng từ dùng cho cửa hàng "商店" là:',
        options: ['家 (jiā)', '個 (ge)', '座 (zuò)'],
        correct: 0
      }
    },
    st_bench: {
      id: 'st_bench',
      nameVi: 'Ghế dài công cộng',
      chinese: '長椅',
      pinyin: 'cháng yǐ',
      english: 'Bench',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 張 (zhāng)',
      meaning: 'Ghế băng dài đặt ở vỉa hè và công viên để mọi người ngồi nghỉ.',
      exampleCn: '他坐在長椅上休息。',
      examplePinyin: 'Tā zuò zài chángyǐ shàng xiūxi.',
      exampleVi: 'Anh ấy ngồi nghỉ trên chiếc ghế dài.',
      category: 'Tiện ích công cộng',
      icon: '🪑',
      quiz: {
        question: '"休息" (xiūxi) nghĩa là gì?',
        options: ['Nghỉ ngơi', 'Chạy bộ', 'Làm việc'],
        correct: 0
      }
    }
  };

  // --- ZONE 5: CÔNG VIÊN (公園) ---
  const PARK_VOCAB = {
    pk_fountain: {
      id: 'pk_fountain',
      nameVi: 'Đài phun nước',
      chinese: '噴泉',
      pinyin: 'pēn quán',
      english: 'Fountain',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 座 (zuò)',
      meaning: 'Đài phun nước giữa công viên, nước bắn lên lấp lánh dưới ánh nắng.',
      exampleCn: '公園中央有一座漂亮的噴泉。',
      examplePinyin: 'Gōngyuán zhōngyāng yǒu yí zuò piàoliang de pēnquán.',
      exampleVi: 'Giữa công viên có một đài phun nước rất đẹp.',
      category: 'Cảnh quan công viên',
      icon: '⛲',
      quiz: {
        question: 'Chữ "噴" (pēn) nghĩa là gì?',
        options: ['Phun / vọt ra', 'Chảy chậm', 'Đóng băng'],
        correct: 0
      }
    },
    pk_flower: {
      id: 'pk_flower',
      nameVi: 'Luống hoa',
      chinese: '花',
      pinyin: 'huā',
      english: 'Flower',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 朵 (duǒ) / 束 (shù)',
      meaning: 'Hoa tươi khoe sắc trong vườn, mỗi mùa lại có một loài hoa khác nhau.',
      exampleCn: '花園裡開滿了紅色的花。',
      examplePinyin: 'Huāyuán lǐ kāi mǎn le hóngsè de huā.',
      exampleVi: 'Trong vườn nở đầy những bông hoa đỏ.',
      category: 'Thiên nhiên & Cây cỏ',
      icon: '🌸',
      quiz: {
        question: 'Lượng từ cho "một bông hoa" là:',
        options: ['一朵花 (yì duǒ huā)', '一本花', '一台花'],
        correct: 0
      }
    },
    pk_grass: {
      id: 'pk_grass',
      nameVi: 'Bãi cỏ xanh',
      chinese: '草地',
      pinyin: 'cǎo dì',
      english: 'Lawn / Grass',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 片 (piàn)',
      meaning: 'Thảm cỏ xanh mướt để mọi người ngồi chơi, dã ngoại cuối tuần.',
      exampleCn: '孩子們在草地上玩遊戲。',
      examplePinyin: 'Háizimen zài cǎodì shàng wán yóuxì.',
      exampleVi: 'Bọn trẻ chơi trò chơi trên bãi cỏ.',
      category: 'Cảnh quan công viên',
      icon: '🌱',
      quiz: {
        question: '"玩遊戲" (wán yóuxì) nghĩa là gì?',
        options: ['Chơi trò chơi', 'Học bài', 'Đi ngủ'],
        correct: 0
      }
    },
    pk_lake: {
      id: 'pk_lake',
      nameVi: 'Hồ nước trong công viên',
      chinese: '湖',
      pinyin: 'hú',
      english: 'Lake / Pond',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 座 (zuò) / 個 (ge)',
      meaning: 'Hồ nước yên ả phản chiếu bóng cây và bầu trời xanh.',
      exampleCn: '湖水又清又涼。',
      examplePinyin: 'Hú shuǐ yòu qīng yòu liáng.',
      exampleVi: 'Nước hồ vừa trong vừa mát.',
      category: 'Cảnh quan công viên',
      icon: '🏞️',
      quiz: {
        question: 'Cấu trúc "又…又…" (yòu…yòu…) dùng để làm gì?',
        options: ['Nêu hai tính chất cùng lúc', 'So sánh hơn kém', 'Đặt câu hỏi'],
        correct: 0
      }
    },
    pk_bridge: {
      id: 'pk_bridge',
      nameVi: 'Cây cầu nhỏ',
      chinese: '橋',
      pinyin: 'qiáo',
      english: 'Bridge',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 座 (zuò)',
      meaning: 'Chiếc cầu bắc qua hồ nước, đứng trên cầu ngắm cá bơi rất thư giãn.',
      exampleCn: '我們一起走過那座小橋。',
      examplePinyin: 'Wǒmen yìqǐ zǒu guò nà zuò xiǎo qiáo.',
      exampleVi: 'Chúng tôi cùng nhau đi qua cây cầu nhỏ đó.',
      category: 'Kiến trúc công viên',
      icon: '🌉',
      quiz: {
        question: 'Lượng từ đi với "橋" (cầu) là:',
        options: ['座 (zuò)', '條 (tiáo)', '把 (bǎ)'],
        correct: 0
      }
    },
    pk_bird: {
      id: 'pk_bird',
      nameVi: 'Chú chim nhỏ',
      chinese: '鳥',
      pinyin: 'niǎo',
      english: 'Bird',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 隻 (zhī)',
      meaning: 'Những chú chim đậu trên cành cây, hót vang cả góc công viên.',
      exampleCn: '樹上有兩隻小鳥在唱歌。',
      examplePinyin: 'Shù shàng yǒu liǎng zhī xiǎo niǎo zài chànggē.',
      exampleVi: 'Trên cây có hai chú chim nhỏ đang hót.',
      category: 'Động vật & Thiên nhiên',
      icon: '🐦',
      quiz: {
        question: '"唱歌" (chànggē) nghĩa là gì?',
        options: ['Hát / hót', 'Bay lượn', 'Ăn uống'],
        correct: 0
      }
    },
    pk_swing: {
      id: 'pk_swing',
      nameVi: 'Xích đu trẻ em',
      chinese: '鞦韆',
      pinyin: 'qiū qiān',
      english: 'Swing',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge) / 架 (jià)',
      meaning: 'Xích đu ở khu vui chơi, trẻ em thích đu qua đu lại rất vui.',
      exampleCn: '小朋友最愛盪鞦韆。',
      examplePinyin: 'Xiǎopéngyǒu zuì ài dàng qiūqiān.',
      exampleVi: 'Các bé thích nhất là chơi xích đu.',
      category: 'Khu vui chơi',
      icon: '🎠',
      quiz: {
        question: 'Động từ đi với "鞦韆" là gì?',
        options: ['盪 (dàng - đu)', '吃 (chī - ăn)', '寫 (xiě - viết)'],
        correct: 0
      }
    },
    pk_statue: {
      id: 'pk_statue',
      nameVi: 'Tượng đài đá',
      chinese: '雕像',
      pinyin: 'diāo xiàng',
      english: 'Statue / Sculpture',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 座 (zuò) / 尊 (zūn)',
      meaning: 'Bức tượng điêu khắc đặt trong công viên để kỷ niệm hoặc trang trí.',
      exampleCn: '公園裡有一座石頭雕像。',
      examplePinyin: 'Gōngyuán lǐ yǒu yí zuò shítou diāoxiàng.',
      exampleVi: 'Trong công viên có một bức tượng bằng đá.',
      category: 'Nghệ thuật & Cảnh quan',
      icon: '🗿',
      quiz: {
        question: '"石頭" (shítou) nghĩa là gì?',
        options: ['Đá / hòn đá', 'Gỗ', 'Sắt thép'],
        correct: 0
      }
    }
  };

  // --- CỬA & LỐI ĐI GIỮA CÁC KHU VỰC (không tính vào nhiệm vụ khám phá) ---
  const GATE_VOCAB = {
    door: {
      id: 'door',
      nameVi: 'Cửa phòng ngủ',
      chinese: '門',
      pinyin: 'mén',
      english: 'Door',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 扇 (shàn) / 道 (dào)',
      meaning: 'Cánh cửa ra vào, mở cửa ra là bước sang một không gian mới.',
      exampleCn: '請幫我開門，我要出去。',
      examplePinyin: 'Qǐng bāng wǒ kāi mén, wǒ yào chūqù.',
      exampleVi: 'Làm ơn mở cửa giúp tôi, tôi muốn ra ngoài.',
      category: 'Kiến trúc căn nhà',
      icon: '🚪',
      quiz: {
        question: '"開門" (kāi mén) nghĩa là gì?',
        options: ['Mở cửa', 'Đóng cửa', 'Khoá cửa'],
        correct: 0
      }
    },
    kitchen_door: {
      id: 'kitchen_door',
      nameVi: 'Lối sang phòng bếp',
      chinese: '廚房門',
      pinyin: 'chú fáng mén',
      english: 'Kitchen Doorway',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 扇 (shàn)',
      meaning: 'Lối đi thông từ phòng khách sang phòng bếp của căn nhà.',
      exampleCn: '穿過這扇門就到廚房了。',
      examplePinyin: 'Chuānguò zhè shàn mén jiù dào chúfáng le.',
      exampleVi: 'Đi qua cánh cửa này là tới phòng bếp.',
      category: 'Kiến trúc căn nhà',
      icon: '🚪',
      quiz: {
        question: '"廚房" (chúfáng) là căn phòng nào?',
        options: ['Phòng bếp', 'Phòng ngủ', 'Phòng tắm'],
        correct: 0
      }
    },
    front_door: {
      id: 'front_door',
      nameVi: 'Cửa chính ra thành phố',
      chinese: '大門',
      pinyin: 'dà mén',
      english: 'Front Door / Main Gate',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 扇 (shàn) / 道 (dào)',
      meaning: 'Cửa chính của căn nhà, bước qua là ra tới đường phố ngoài kia.',
      exampleCn: '他打開大門，走到街上。',
      examplePinyin: 'Tā dǎkāi dàmén, zǒu dào jiē shàng.',
      exampleVi: 'Anh ấy mở cửa chính rồi bước ra ngoài phố.',
      category: 'Kiến trúc căn nhà',
      icon: '🏠',
      quiz: {
        question: '"街上" (jiē shàng) nghĩa là gì?',
        options: ['Trên phố / ngoài đường', 'Trong nhà', 'Trên núi'],
        correct: 0
      }
    },
    park_gate: {
      id: 'park_gate',
      nameVi: 'Cổng công viên',
      chinese: '公園大門',
      pinyin: 'gōng yuán dà mén',
      english: 'Park Gate',
      partOfSpeech: 'Danh từ (Noun) • Lượng từ: 座 (zuò)',
      meaning: 'Cổng vào công viên thành phố — điểm đến tiếp theo của hành trình.',
      exampleCn: '我們在公園大門口見面吧。',
      examplePinyin: 'Wǒmen zài gōngyuán ménkǒu jiànmiàn ba.',
      exampleVi: 'Chúng ta gặp nhau ở cổng công viên nhé.',
      category: 'Địa điểm thành phố',
      icon: '🌳',
      quiz: {
        question: '"公園" (gōngyuán) là nơi nào?',
        options: ['Công viên', 'Công ty', 'Bệnh viện'],
        correct: 0
      }
    },
    back_door: {
      id: 'back_door',
      nameVi: 'Lối quay lại',
      chinese: '回去',
      pinyin: 'huí qù',
      english: 'Go Back',
      partOfSpeech: 'Động từ (Verb)',
      meaning: 'Quay trở lại khu vực trước đó để ôn lại từ vựng đã học.',
      exampleCn: '我想回去看看。',
      examplePinyin: 'Wǒ xiǎng huíqù kànkan.',
      exampleVi: 'Tôi muốn quay lại xem thử.',
      category: 'Di chuyển',
      icon: '↩️',
      quiz: {
        question: '"回去" (huíqù) nghĩa là gì?',
        options: ['Quay trở lại', 'Đi tiếp', 'Dừng lại'],
        correct: 0
      }
    }
  };

  // --- HỢP NHẤT TOÀN BỘ TỪ VỰNG & GẮN NHÃN KHU VỰC ---
  const ROOM_VOCAB_DATA = {};
  const stampZone = (dict, zoneId, isGate = false) => {
    Object.keys(dict).forEach(key => {
      const entry = dict[key];
      entry.zone = zoneId;
      entry.isGate = isGate;
      ROOM_VOCAB_DATA[key] = entry;
    });
  };
  stampZone(BEDROOM_VOCAB, 'bedroom');
  stampZone(LIVING_VOCAB, 'living');
  stampZone(KITCHEN_VOCAB, 'kitchen');
  stampZone(STREET_VOCAB, 'street');
  stampZone(PARK_VOCAB, 'park');
  stampZone(GATE_VOCAB, 'gate', true);

  // ==========================================================================
  // CẤU HÌNH HÀNH TRÌNH — CÁC KHU VỰC NỐI TIẾP NHAU
  // ==========================================================================
  const ZONE_ORDER = ['bedroom', 'living', 'kitchen', 'street', 'park'];

  const ZONES = {
    bedroom: {
      id: 'bedroom',
      name: 'Phòng Ngủ',
      chinese: '臥室',
      pinyin: 'wò shì',
      icon: '🛏️',
      items: Object.keys(BEDROOM_VOCAB),
      next: 'living',
      prev: null,
      exitGate: 'door',
      exitLabel: 'Ra Phòng Khách',
      objective: 'Bạn vừa thức dậy. Hãy khám phá mọi đồ vật trong phòng ngủ trước khi mở cửa ra ngoài.',
      spawn: { x: 2.6, z: -2.2, yaw: Math.PI * 0.75 },
      returnSpawn: { x: 0, z: 3.9, yaw: 0 }
    },
    living: {
      id: 'living',
      name: 'Phòng Khách',
      chinese: '客廳',
      pinyin: 'kè tīng',
      icon: '🛋️',
      items: Object.keys(LIVING_VOCAB),
      next: 'kitchen',
      prev: 'bedroom',
      exitGate: 'kitchen_door',
      exitLabel: 'Sang Phòng Bếp',
      objective: 'Khám phá hết đồ đạc trong phòng khách để mở lối sang phòng bếp.',
      spawn: { x: 0, z: 3.4, yaw: Math.PI },
      returnSpawn: { x: 3.5, z: 2.6, yaw: Math.PI / 2 }
    },
    kitchen: {
      id: 'kitchen',
      name: 'Phòng Bếp',
      chinese: '廚房',
      pinyin: 'chú fáng',
      icon: '🍳',
      items: Object.keys(KITCHEN_VOCAB),
      next: 'street',
      prev: 'living',
      exitGate: 'front_door',
      exitLabel: 'Ra Ngoài Thành Phố',
      objective: 'Học hết đồ dùng nhà bếp rồi mới có thể mở cửa chính ra thành phố.',
      spawn: { x: 2.5, z: 1.9, yaw: Math.PI / 2 },
      returnSpawn: { x: -2.6, z: 1.9, yaw: 0 }
    },
    street: {
      id: 'street',
      name: 'Đường Phố',
      chinese: '街道',
      pinyin: 'jiē dào',
      icon: '🏙️',
      items: Object.keys(STREET_VOCAB),
      next: 'park',
      prev: 'kitchen',
      exitGate: 'park_gate',
      exitLabel: 'Vào Công Viên',
      objective: 'Đi dọc con đường, khám phá mọi thứ trên phố rồi tiến tới công viên.',
      spawn: { x: 6.2, z: 21.5, yaw: 0 },
      returnSpawn: { x: -6.2, z: -19.8, yaw: Math.PI }
    },
    park: {
      id: 'park',
      name: 'Công Viên',
      chinese: '公園',
      pinyin: 'gōng yuán',
      icon: '🌳',
      items: Object.keys(PARK_VOCAB),
      next: null,
      prev: 'street',
      exitGate: null,
      exitLabel: null,
      objective: 'Điểm đến cuối hành trình — khám phá trọn vẹn công viên thành phố.',
      spawn: { x: 0, z: 12.5, yaw: 0 }
    }
  };

  const TOTAL_VOCAB_COUNT = ZONE_ORDER.reduce((sum, z) => sum + ZONES[z].items.length, 0);



  // ==========================================================================
  // DANH SÁCH MODEL GLB — CHIA THEO KHU VỰC ĐỂ TẢI DẦN (lazy load)
  // Trước đây game tải cả 54 file trước khi dựng cảnh đầu tiên → mở rất lâu
  // trên mạng di động. Giờ chỉ tải model của khu vực đang vào.
  // ==========================================================================
  // Tên file model nhân vật người chơi — thay đổi theo lựa chọn của người dùng
  const AVATAR_FILES = { man: 'player-man.glb', woman: 'player-woman.glb' };
  function getSelectedAvatarFile() {
    try {
      const saved = localStorage.getItem('3d_vocab_quest_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedAvatar && AVATAR_FILES[parsed.selectedAvatar]) {
          return AVATAR_FILES[parsed.selectedAvatar];
        }
      }
    } catch (e) { /* ignore */ }
    return AVATAR_FILES.man; // Mặc định là nam
  }
  let PLAYER_AVATAR_FILE = getSelectedAvatarFile();

  const MODEL_FILES = {
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
        // Street & Park (ghế công viên dùng mesh tự dựng cho đúng tỉ lệ người thật)
        st_trashcan: 'trashcan.glb',
        pk_plant: 'plantSmall1.glb',
        // Nhân vật người chơi (mesh tĩnh — khung xương được gắn tự động khi dựng cảnh)
        player_avatar: PLAYER_AVATAR_FILE,
  };

  const BEDROOM_MODEL_IDS = ['desk', 'chair', 'lamp', 'bookshelf', 'plant', 'bed', 'laptop'];

  const ZONE_MODEL_IDS = {
    bedroom: BEDROOM_MODEL_IDS,
    living:  Object.keys(MODEL_FILES).filter(k => k.startsWith('lr_')),
    kitchen: Object.keys(MODEL_FILES).filter(k => k.startsWith('kt_')),
    street:  Object.keys(MODEL_FILES).filter(k => k.startsWith('st_')),
    park:    Object.keys(MODEL_FILES).filter(k => k.startsWith('pk_'))
  };

  // ==========================================================================
  // NHÂN VẬT NGƯỜI CHƠI: MODEL GLB TĨNH + KHUNG XƯƠNG GẮN TỰ ĐỘNG
  // Model gốc không có skin/bone/animation, nên game tự dựng bộ xương humanoid
  // rồi tính trọng số (skin weight) cho từng đỉnh theo khoảng cách tới đốt xương.
  // ==========================================================================

  const AVATAR_RIG_SPECS = {
    man: {
      targetHeight: 1.62,        // chiều cao nhân vật trong game (mét)
      faceYaw: -Math.PI / 2,     // xoay model để mặt hướng về +Z (hướng "trước" của avatar)
      ankleY: 0.050,
      kneeY: 0.185,
      hipY: 0.300,               // đáy quần / hạ bộ
      spineY: 0.450,
      chestY: 0.555,
      shoulderY: 0.660,          // tâm dải cánh tay dang ngang
      neckY: 0.720,
      legX: 0.059,               // khoảng cách tâm chân so với trục giữa
      shoulderX: 0.115,          // khớp vai
      elbowX: 0.300,             // khuỷu tay
      wristX: 0.440,             // cổ tay
      handX: 0.528,              // đầu ngón tay
      armZ: 0.032,
      footZ: 0.086,              // mũi bàn chân chìa về phía trước
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
      shoulderY: 0.728,          // vai và cánh tay của model nữ nằm cao hơn (Y = 1.18m)
      neckY: 0.765,
      legX: 0.055,
      shoulderX: 0.120,
      elbowX: 0.285,
      wristX: 0.415,
      handX: 0.496,
      armZ: -0.053,              // cánh tay model nữ lùi nhẹ về -Z
      footZ: 0.00,
      restArmRotZ: 1.36,
      weightFalloff: 4.5,
      weightEpsilon: 0.012
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
  // --- GAME STATE MANAGER (TIẾN ĐỘ THEO TỪNG KHU VỰC) ---
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

      // Hành trình: khu vực hiện tại & những khu vực đã mở khoá
      this.currentZone = 'bedroom';
      this.unlockedZones = new Set(['bedroom']);
      this.hasWokenUp = false;
      this.selectedAvatar = null; // 'man' | 'woman' | null

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
          if (parsed.selectedAvatar) this.selectedAvatar = parsed.selectedAvatar;
          if (Array.isArray(parsed.unlockedZones)) {
            parsed.unlockedZones.forEach(z => { if (ZONES[z]) this.unlockedZones.add(z); });
          }
          if (parsed.currentZone && ZONES[parsed.currentZone]) {
            this.currentZone = parsed.currentZone;
          }
        }
      } catch (e) {
        console.warn('Storage read error:', e);
      }
      // Đồng bộ lại khoá mở dựa trên số đồ vật đã khám phá (phòng khi dữ liệu cũ)
      this.syncUnlockedZones();
    }

    saveStorage() {
      try {
        localStorage.setItem('3d_vocab_quest_data', JSON.stringify({
          discovered: Array.from(this.discovered),
          score: this.score,
          quizStats: this.quizStats,
          currentZone: this.currentZone,
          unlockedZones: Array.from(this.unlockedZones),
          selectedAvatar: this.selectedAvatar
        }));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
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

    // Mở khoá khu vực kế tiếp khi khu vực trước đã hoàn thành
    syncUnlockedZones() {
      this.unlockedZones.add('bedroom');
      for (let i = 0; i < ZONE_ORDER.length - 1; i++) {
        const zoneId = ZONE_ORDER[i];
        if (this.unlockedZones.has(zoneId) && this.isZoneComplete(zoneId)) {
          this.unlockedZones.add(ZONE_ORDER[i + 1]);
        }
      }
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
        this.syncUnlockedZones();
        this.saveStorage();
        this.soundFX.playDiscover();
      }
      return isNew;
    }

    resetProgress() {
      this.discovered.clear();
      this.score = 0;
      this.quizStats = { total: 0, correct: 0 };
      this.currentZone = 'bedroom';
      this.unlockedZones = new Set(['bedroom']);
      this.hasWokenUp = false;
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

    // Thẻ 3D thay thế khi từ vựng thuộc khu vực khác (mô hình chưa được dựng)
    showPlaceholder(item) {
      this.showObject(() => {
        const group = new THREE.Group();

        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 10;
        ctx.strokeRect(22, 22, 468, 468);
        ctx.textAlign = 'center';
        ctx.font = '150px serif';
        ctx.fillText(item.icon || '📦', 256, 210);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 128px serif';
        ctx.fillText(item.chinese || '', 256, 350);
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '52px sans-serif';
        ctx.fillText(item.pinyin || '', 256, 420);

        const tex = new THREE.CanvasTexture(canvas);
        const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 });
        const sideMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.25 });
        const card = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 0.22),
          [sideMat, sideMat, sideMat, sideMat, faceMat, faceMat]
        );
        card.castShadow = true;
        group.add(card);
        return group;
      });
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
      this.touchLook = { id: null, moved: false, startTime: 0, startX: 0, startY: 0 };
      this.joystickDir = { x: 0, y: 0 };

      // --- HÀNH TRÌNH: KHU VỰC HIỆN TẠI & TRẠNG THÁI CHUYỂN CẢNH ---
      this.currentZone = this.state.currentZone || 'bedroom';
      this.currentRoom = this.currentZone; // giữ tương thích tên cũ
      this.isTransitioning = false;
      this.isWakingUp = false;
      this.wakeUpTimer = 0;
      this.animatedProps = [];
      this.toastTimer = null;

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

    // Model cần cho một khu vực (nhân vật luôn nằm trong danh sách)
    modelsForZone(zoneId) {
      return ['player_avatar'].concat(ZONE_MODEL_IDS[zoneId] || []);
    }

    // Tải (một lần duy nhất) đúng những model được yêu cầu
    ensureModels(ids) {
      if (!this._modelJobs) this._modelJobs = {};
      const jobs = ids.map(id => {
        if (!MODEL_FILES[id]) return Promise.resolve(null);
        if (!this._modelJobs[id]) {
          this._modelJobs[id] = this.loadGLBModel(id, MODEL_FILES[id]);
        }
        return this._modelJobs[id];
      });
      return Promise.all(jobs);
    }

    // Tải nốt model của các khu vực còn lại ở chế độ nền, sau khi đã vào được game
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

    // Giữ tên cũ cho tương thích: tải toàn bộ model
    async loadAllModels() {
      await this.ensureModels(Object.keys(MODEL_FILES));
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
      this.scene.background = new THREE.Color(0xdbeafe);
      this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.015);

      // 1. Ambient & Directional Lighting
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

      // Warm Ceiling light
      const ceilingLight = new THREE.PointLight(0xffecd2, 0.95, 12, 1.2);
      this.ceilingLight = ceilingLight;
      ceilingLight.position.set(0, 3.8, 0);
      ceilingLight.castShadow = !DEVICE.isMobile;
      this.scene.add(ceilingLight);

      // 2. Chỉ tải model của khu vực đang đứng → vào game nhanh hơn nhiều.
      //    Model của các khu sau được tải nền trong lúc người chơi khám phá.
      this.ensureModels(this.modelsForZone(this.currentZone)).then(() => {
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

    // ======================================================================
    // HỆ THỐNG KHU VỰC: DỰNG CẢNH, ÁNH SÁNG & ĐIỂM XUẤT PHÁT
    // ======================================================================
    applyZoneLighting(zoneId) {
      const isOutdoor = (zoneId === 'street' || zoneId === 'park');

      if (zoneId === 'street') {
        this.scene.background = new THREE.Color(0x9dc4e8);
        this.scene.fog = new THREE.FogExp2(0xb9d4ec, 0.018);
      } else if (zoneId === 'park') {
        this.scene.background = new THREE.Color(0xa9d8f0);
        this.scene.fog = new THREE.FogExp2(0xc8e6f5, 0.014);
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

    // Dựng toàn bộ hình khối của một khu vực (đã xoá cảnh cũ từ trước)
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
        case 'park': this.buildPark(); break;
        default: this.buildBedroom(); break;
      }

      this.optimizeSceneForDevice();
      this.setCameraMode(this.cameraMode);
      this.updateZoneHud();
      this.updateProgressUI();
    }

    // ------------------------------------------------------------------
    // TỐI ƯU CHO MÁY YẾU / ĐIỆN THOẠI
    // GPU di động phải lặp qua TỪNG nguồn sáng cho TỪNG điểm ảnh, nên 20–30 đèn
    // điểm là nguyên nhân giật lag nặng nhất. Giữ lại vài đèn mạnh nhất và bù
    // bằng ánh sáng môi trường.
    // ------------------------------------------------------------------
    optimizeSceneForDevice() {
      if (!DEVICE.isMobile) return;

      const pointLights = [];
      this.scene.traverse(obj => {
        if (obj.isPointLight) pointLights.push(obj);
      });

      if (pointLights.length > DEVICE.maxPointLights) {
        // Đèn "quan trọng" = sáng mạnh và toả xa
        pointLights.sort((a, b) =>
          (b.intensity * (b.distance || 10)) - (a.intensity * (a.distance || 10))
        );
        pointLights.slice(DEVICE.maxPointLights).forEach(light => {
          if (light.parent) light.parent.remove(light);
        });
      }

      // Chỉ mặt trời đổ bóng; bóng từ đèn điểm rất đắt trên di động
      this.scene.traverse(obj => {
        if (obj.isPointLight || obj.isSpotLight) obj.castShadow = false;
      });

      if (this.renderer) this.renderer.shadowMap.needsUpdate = true;
    }

    // Đặt người chơi về điểm xuất phát của khu vực
    spawnPlayerInZone(zoneId, fromZoneId = null) {
      const zone = ZONES[zoneId] || ZONES.bedroom;
      let spawn = zone.spawn;
      // Nếu đi ngược lại từ khu vực sau, xuất hiện ngay tại cửa vừa bước vào
      if (fromZoneId && zone.next === fromZoneId && zone.returnSpawn) {
        spawn = zone.returnSpawn;
      }
      this.player.pos.set(spawn.x, 0, spawn.z);
      this.player.yaw = spawn.yaw;
      this.player.pitch = 0.05;
      this.player.velocity.set(0, 0, 0);
    }

    // Chuyển cảnh sang khu vực khác kèm hiệu ứng fade
    goToZone(zoneId, opts = {}) {
      if (this.isTransitioning) return;
      const zone = ZONES[zoneId];
      if (!zone) return;

      this.isTransitioning = true;
      const fromZone = this.currentZone;

      if (document.exitPointerLock) document.exitPointerLock();
      const doorModal = document.getElementById('doorModal');
      if (doorModal) doorModal.classList.remove('active');
      this.closeVocabModal(true);

      const overlay = document.getElementById('roomTransitionOverlay');
      if (overlay) {
        const label = overlay.querySelector('.transition-label') || overlay.querySelector('div:last-child');
        if (label) label.textContent = opts.label || `Đang tới ${zone.name}...`;
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
      }

      // Chờ model của khu vực đích tải xong (thường đã có sẵn nhờ tải nền)
      const ready = this.ensureModels(this.modelsForZone(zone.id));
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

    // ======================================================================
    // AUTO-RIG: GẮN KHUNG XƯƠNG CHO MODEL GLB TĨNH
    // ======================================================================

    // Chuẩn hoá hình học: xoay cho mặt hướng +Z, scale về đúng chiều cao người,
    // đặt gót chân ở y = 0 và căn giữa theo trục X/Z.
    prepareAvatarGeometry(rawModel, avatarKey = 'man') {
      let source = null;
      rawModel.traverse(child => {
        if (!source && child.isMesh && child.geometry) source = child;
      });
      if (!source) return null;

      const S = AVATAR_RIG_SPECS[avatarKey] || AVATAR_RIG_SPECS.man;
      const geo = source.geometry.clone();
      // Model có morph targets khuôn mặt. Reset để không làm sai bounding box
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

    // Danh sách đốt xương + đoạn xương dùng để tính trọng số.
    // Toạ độ tuyệt đối trong không gian đã chuẩn hoá (mét).
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

      // side = +1 cho bên trái nhân vật (+X), -1 cho bên phải
      const limb = (side, tag) => ([
        { name: `arm${tag}`,     parent: 'chest',        pos: [side * shX, shY, armZ],
          tail: [side * elX, shY, armZ], group: 'arm' },
        { name: `foreArm${tag}`, parent: `arm${tag}`,    pos: [side * elX, shY, armZ],
          tail: [side * wrX, shY, armZ], group: 'arm' },
        { name: `hand${tag}`,    parent: `foreArm${tag}`, pos: [side * wrX, shY, armZ],
          tail: [side * haX, shY, armZ], group: 'arm' },
        { name: `leg${tag}`,     parent: 'hips',         pos: [side * legX, hipY, 0],
          tail: [side * legX, kneeY, 0], group: 'leg' },
        { name: `shin${tag}`,    parent: `leg${tag}`,    pos: [side * legX, kneeY, 0],
          tail: [side * legX, ankleY, 0], group: 'leg' },
        { name: `foot${tag}`,    parent: `shin${tag}`,   pos: [side * legX, ankleY, 0],
          tail: [side * legX, 0.012, ftZ], group: 'leg' }
      ]);

      return [
        { name: 'hips',  parent: null,    pos: [0, hipY, 0],   tail: [0, spineY, 0], group: 'core' },
        { name: 'spine', parent: 'hips',  pos: [0, spineY, 0], tail: [0, chestY, 0], group: 'core' },
        { name: 'chest', parent: 'spine', pos: [0, chestY, 0], tail: [0, neckY, 0],  group: 'core' },
        { name: 'neck',  parent: 'chest', pos: [0, neckY, 0],  tail: [0, neckY + 0.05, 0], group: 'headTop' },
        { name: 'head',  parent: 'neck',  pos: [0, neckY + 0.02, 0], tail: [0, H, 0], group: 'headTop' },
        ...limb(1, 'L'),
        ...limb(-1, 'R')
      ];
    }

    // Trọng số vùng: chặn tay/đầu ăn vào chân và ngược lại, có dải chuyển mượt
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
        // Chân chỉ ảnh hưởng phần dưới hông
        case 'leg':     return 1 - smooth(hipY - band, hipY + band, py);
        // Tay chỉ ảnh hưởng phần thân trên
        case 'arm':     return smooth(chestY - 2.2 * band, chestY, py);
        // Cổ & đầu chỉ ảnh hưởng từ ngực trở lên
        case 'headTop': return smooth(chestY - band, chestY + band, py);
        default:        return 1;
      }
    }

    // Tính skinIndex / skinWeight cho từng đỉnh dựa trên khoảng cách tới đoạn xương
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

          // Khoảng cách từ đỉnh tới đoạn thẳng head→tail
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

    // Dựng (một lần) hình học đã gắn trọng số + vật liệu bật skinning, rồi cache lại
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

        // r128 yêu cầu material.skinning = true thì shader mới biến dạng theo xương
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

    // Tạo một bản nhân vật có xương cho cảnh hiện tại
    buildSkinnedAvatar() {
      const rig = this.getAvatarRigCache();
      if (!rig) return false;

      // Nhóm bọc ngoài: dùng cho hiệu ứng nhún người & nghiêng thân khi đi bộ
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
      // Hình học & vật liệu dùng chung giữa các cảnh — không cho clearScene giải phóng
      mesh.userData.fromGLB = true;
      mesh.add(bones[0]);
      mesh.updateMatrixWorld(true);
      mesh.bind(new THREE.Skeleton(bones));

      bodyGroup.add(mesh);
      this.playerMesh.add(bodyGroup);

      // Bóng đổ tiếp đất
      const shadowMesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.34, 24),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.015;
      this.playerMesh.add(shadowMesh);

      // Ánh xạ sang tên đốt xương mà vòng lặp hoạt hình đang dùng
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

      // Tay dang ngang trong T-pose → hạ xuống dọc thân làm tư thế nghỉ
      this.avatarIsSkinned = true;
      this.applySkinnedRestPose();
      return true;
    }

    // Gập khuỷu tay: khung xương GLB có cẳng tay nằm dọc thân nên gập quanh trục Y,
    // còn nhân vật hình khối cũ gập quanh trục X.
    setElbowBend(bone, bend, side, blend = 1) {
      if (!bone) return;
      if (this.avatarIsSkinned) {
        const target = bend * side;
        bone.rotation.y = blend >= 1 ? target : THREE.MathUtils.lerp(bone.rotation.y, target, blend);
      } else {
        bone.rotation.x = blend >= 1 ? bend : THREE.MathUtils.lerp(bone.rotation.x, bend, blend);
      }
    }

    // T-pose → tư thế đứng tự nhiên (tay xuôi theo thân)
    applySkinnedRestPose() {
      const b = this.playerBones;
      if (!b || !this.avatarIsSkinned) return;
      const avatarKey = this.state.selectedAvatar || 'man';
      const S = AVATAR_RIG_SPECS[avatarKey] || AVATAR_RIG_SPECS.man;
      const rotZ = S.restArmRotZ || 1.38;
      // Xoay quanh trục Z để hạ tay từ ngang xuống dọc thân (T-pose → đứng nghỉ)
      if (b.leftArm) { b.leftArm.rotation.z = -rotZ; b.leftArm.rotation.y = 0; b.leftArm.rotation.x = 0; }
      if (b.rightArm) { b.rightArm.rotation.z = rotZ; b.rightArm.rotation.y = 0; b.rightArm.rotation.x = 0; }
      // Cẳng tay giữ thẳng theo cánh tay; độ gập do vòng lặp hoạt hình điều khiển
      if (b.leftElbow) { b.leftElbow.rotation.z = 0; b.leftElbow.rotation.x = 0; b.leftElbow.rotation.y = 0; }
      if (b.rightElbow) { b.rightElbow.rotation.z = 0; b.rightElbow.rotation.x = 0; b.rightElbow.rotation.y = 0; }
    }

    buildPlayerAvatar() {
      this.playerMesh = new THREE.Group();
      this.playerBones = {};
      this.avatarIsSkinned = false;

      // Ưu tiên nhân vật GLB đã được gắn xương tự động
      if (this.buildSkinnedAvatar()) {
        this.playerMesh.rotation.y = Math.PI;
        this.playerMesh.position.set(this.player.pos.x, 0, this.player.pos.z);
        this.scene.add(this.playerMesh);
        return;
      }

      // Không có model → dùng nhân vật dựng bằng hình khối như trước

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

          // Chi tiết gáy sách chỉ dựng trên máy khoẻ — mỗi quyển 4 mesh là quá nhiều
          // với hàng trăm quyển trên kệ.
          if (!DEVICE.isMobile) {
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
          }

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
        neonPlate.userData.isGateSign = true;
        group.add(neonPlate);

        // Đèn báo trạng thái khoá / mở của cửa
        const exitLight = new THREE.PointLight(0x22c55e, 0.6, 3.5, 1.5);
        exitLight.position.set(0, dH + 0.2, 0.25);
        exitLight.userData.isGateLight = true;
        group.add(exitLight);

        return group;
      };

      const door = this.objectMeshFactories.door();
      door.position.set(0, 0, 4.90);
      door.rotation.y = Math.PI;
      this.registerGate(door, 'door', 'living', { requireComplete: true });
      this.applyGateLockVisual(door, 'bedroom');
      this.scene.add(door);
    }

    // Đèn báo trên cửa: đỏ = còn khoá, xanh = đã mở khoá
    applyGateLockVisual(gateObj, zoneId) {
      const unlocked = this.state.isZoneComplete(zoneId);
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
      gateObj.userData.lockVisualZone = zoneId;
    }

    // Nhân bản vật thể cho khung xem 3D — bỏ userData vì có tham chiếu vòng (rootGroup)
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
      // Mô hình xem 3D: dùng bản sao của chính vật thể nếu chưa có factory riêng
      if (!this.objectMeshFactories[vocabId]) {
        this.objectMeshFactories[vocabId] = () => this.cloneForInspector(object3d);
      }
      this.interactiveObjects.push(object3d);
    }

    // --- CONTROLS & INPUT SYSTEM ---
    setupControls() {
      // 1. Desktop Keyboard
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

      // 2. Mouse Look & Pointer Lock
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
        } else if (!DEVICE.useTouchUI) {
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

      // ---- KÉO MÀN HÌNH ĐỂ XOAY CAMERA ----
      // Theo dõi riêng từng ngón tay theo identifier, nhờ vậy có thể vừa giữ
      // joystick (một ngón) vừa kéo xoay hướng nhìn (ngón khác) cùng lúc.
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
          const sens = (this.state.sensitivity / 5) * 0.004;
          this.player.yaw -= dx * sens;
          this.player.pitch -= dy * sens;
          this.player.pitch = THREE.MathUtils.clamp(this.player.pitch, -Math.PI / 3.0, Math.PI / 2.8);
          break;
        }
      }, { passive: true });

      const endLook = e => {
        if (this.touchLook.id === null || this.touchLook.id === undefined) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier !== this.touchLook.id) continue;
          // Chạm nhanh mà không kéo = tương tác với đồ vật đang ngắm
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

      // Mobile Interact Button
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

      // Resize & xoay màn hình (iOS phát sinh sự kiện chậm nên gọi lại sau một nhịp)
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

      // Thiết bị cảm ứng không có Pointer Lock. Nếu vẫn hiện lớp phủ "nhấp để điều
      // khiển" thì nó phủ kín màn hình và nuốt mọi thao tác chạm → nút bấm chết.
      if (DEVICE.useTouchUI) {
        this.isPointerLocked = false;
        if (this.lockOverlay) this.lockOverlay.classList.add('hidden');
        return;
      }

      this.container.requestPointerLock = this.container.requestPointerLock || this.container.mozRequestPointerLock;
      if (this.container.requestPointerLock) {
        this.container.requestPointerLock();
      } else {
        // Trình duyệt không hỗ trợ → vẫn cho chơi bằng chuột/phím
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
      // 1. Play Button on Start Screen
      // Nếu chưa chọn nhân vật → hiện màn chọn; nếu đã chọn → vào game luôn
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
          // Đã chọn nhân vật rồi → vào game
          this.switchScreen('game');
          this.startZoneSession();
        } else {
          // Chưa chọn → hiện màn hình chọn nhân vật
          this.switchScreen('charSelect');
        }
      });

      // 1.5 Character Selection Screen
      this.setupCharacterSelect();

      // 1.6 Nút đổi nhân vật nhanh trên Start Screen
      const btnChangeAvatarStart = document.getElementById('btnChangeAvatarStart');
      if (btnChangeAvatarStart) {
        btnChangeAvatarStart.addEventListener('click', () => {
          this.switchScreen('charSelect');
        });
      }

      // 1.0.1 Nút bật toàn màn hình trong lớp nhắc xoay ngang máy
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
        if (confirm('Bạn có chắc muốn xóa toàn bộ tiến độ khám phá và bắt đầu lại từ phòng ngủ?')) {
          this.state.resetProgress();
          this.victoryShown = false;
          this.updateProgressUI();
          settingsModal.classList.remove('active');
          this.restartJourney();
        }
      });

      // 10. Victory Modal Actions
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

    // ======================================================================
    // TƯƠNG TÁC: ĐỒ VẬT & CỬA / LỐI ĐI
    // ======================================================================
    interactWithTarget() {
      if (!this.targetedObject || this.isTransitioning) return;
      const ud = this.targetedObject.userData;
      if (ud.gateTarget) {
        this.handleGateInteraction(this.targetedObject);
      } else if (ud.vocabId) {
        this.openVocabModal(ud.vocabId);
      }
    }

    // Đăng ký một cánh cửa / lối đi dẫn sang khu vực khác
    registerGate(object3d, gateVocabId, targetZoneId, opts = {}) {
      const data = {
        vocabId: gateVocabId,
        vocabData: ROOM_VOCAB_DATA[gateVocabId] || null,
        gateTarget: targetZoneId,
        gateLocked: !!opts.requireComplete,
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

    // Cửa chỉ mở khi khu vực hiện tại đã khám phá xong toàn bộ đồ vật
    handleGateInteraction(gateObj) {
      const ud = gateObj.userData;
      const targetZone = ZONES[ud.gateTarget];
      if (!targetZone) return;

      // Đi ngược lại khu vực trước: luôn cho phép
      if (ud.gateDirection === 'back') {
        this.goToZone(ud.gateTarget, { label: `Quay lại ${targetZone.name}...` });
        return;
      }

      const zone = ZONES[this.currentZone];
      const remaining = this.state.zoneRemaining(this.currentZone);

      if (ud.gateLocked && remaining > 0) {
        // Cửa còn khoá — nhắc người chơi những đồ vật chưa khám phá
        this.state.soundFX.playWrong();
        this.showLockedGateNotice(zone, remaining);
        return;
      }

      // Cửa đã mở khoá → hiện bảng xác nhận bước sang khu vực mới
      this.openGateModal(gateObj);
    }

    showLockedGateNotice(zone, remaining) {
      const missing = this.state.missingItems(zone.id).slice(0, 4)
        .map(it => `${it.icon} ${it.nameVi}`).join(' • ');
      this.showToast(
        `🔒 Cửa còn khoá! Còn <b>${remaining}</b> đồ vật trong ${zone.name} chưa khám phá.` +
        (missing ? `<br><span class="toast-sub">Gợi ý: ${missing}${remaining > 4 ? ' …' : ''}</span>` : ''),
        'locked'
      );
    }

    // Thông báo nổi giữa màn hình (khoá cửa, mở khoá, hoàn thành khu vực)
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

    // Băng nhiệm vụ hiện ra mỗi khi bước vào khu vực mới
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

    // Bảng xác nhận đi qua cửa
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
      setTxt('doorModalDesc', `Bạn đã khám phá xong ${zone.name}! Bước qua ${gateData ? gateData.nameVi.toLowerCase() : 'cánh cửa'} để tới ${targetZone.name} (${targetZone.chinese} – ${targetZone.pinyin}).`);
      setTxt('doorFoundCount', `${this.state.zoneFoundCount(zone.id)}/${this.state.zoneTotal(zone.id)}`);
      setTxt('doorScoreCount', this.state.score);
      setHtml('btnConfirmExitDoorTxt', `${targetZone.icon} Đi tới ${targetZone.name}`);

      const doorModal = document.getElementById('doorModal');
      if (doorModal) doorModal.classList.add('active');
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

    // --- ZONE 1: PHÒNG NGỦ ---
    buildBedroom() {
      this.roomBounds = { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 };
      this.colliders = [
        { name: 'desk', minX: -1.1, maxX: 1.1, minZ: -4.3, maxZ: -2.6 },
        { name: 'chair', minX: -0.65, maxX: 0.65, minZ: -2.75, maxZ: -1.55 },
        { name: 'bookshelf', minX: -4.95, maxX: -3.7, minZ: -3.3, maxZ: -0.7 },
        { name: 'plant', minX: -4.8, maxX: -3.8, minZ: 1.3, maxZ: 2.3 },
        { name: 'bed', minX: 2.5, maxX: 4.8, minZ: -4.6, maxZ: -1.8 },
        { name: 'guitar', minX: 3.9, maxX: 4.9, minZ: 2.3, maxZ: 3.3 },
        { name: 'backpack', minX: -2.2, maxX: -1.4, minZ: -3.9, maxZ: -3.1 }
      ];
      this.buildRoomArchitecture();
      this.buildPlayerAvatar();
      this.buildInteractiveObjects();
    }

    // Giữ tên cũ để tương thích
    buildStudyRoomScene() {
      this.buildBedroom();
    }

    // Đặt model GLB (nếu có) hoặc mesh dự phòng vào cảnh
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

    // --- ZONE 3: PHÒNG BẾP (廚房) ---
    buildKitchen() {
      const roomW = 9.0;   // theo trục X
      const roomL = 7.6;   // theo trục Z
      const roomH = 3.4;
      this.roomBounds = { minX: -4.0, maxX: 4.0, minZ: -3.3, maxZ: 3.3 };

      const tileMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.35, metalness: 0.05 });
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
      const splashMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.15 });
      const counterMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.25, metalness: 0.25 });
      const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5 });
      const woodMat = new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.5 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.2, metalness: 0.85 });

      // 1. Sàn gạch caro
      const floorCanvas = document.createElement('canvas');
      floorCanvas.width = floorCanvas.height = 256;
      const fctx = floorCanvas.getContext('2d');
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          fctx.fillStyle = ((x + y) % 2 === 0) ? '#e7e5e4' : '#d6d3d1';
          fctx.fillRect(x * 64, y * 64, 64, 64);
        }
      }
      fctx.strokeStyle = 'rgba(120,113,108,0.45)';
      fctx.lineWidth = 2;
      for (let i = 0; i <= 4; i++) {
        fctx.beginPath(); fctx.moveTo(i * 64, 0); fctx.lineTo(i * 64, 256); fctx.stroke();
        fctx.beginPath(); fctx.moveTo(0, i * 64); fctx.lineTo(256, i * 64); fctx.stroke();
      }
      const floorTex = new THREE.CanvasTexture(floorCanvas);
      floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(3, 2.5);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL),
        new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4, metalness: 0.05 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      // 2. Trần & đèn
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomL), wallMat);
      ceil.position.y = roomH;
      ceil.rotation.x = Math.PI / 2;
      this.scene.add(ceil);
      [[-2.2, -1.0], [2.2, -1.0], [-2.2, 1.6], [2.2, 1.6]].forEach(([lx, lz]) => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4e0, emissiveIntensity: 0.9 }));
        panel.position.set(lx, roomH - 0.04, lz);
        this.scene.add(panel);
        const l = new THREE.PointLight(0xfff2dd, 0.85, 8, 1.3);
        l.position.set(lx, roomH - 0.25, lz);
        this.scene.add(l);
      });

      // 3. Tường (chừa 2 ô cửa: sang phòng khách ở tường phải, ra phố ở tường trước)
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.16), wallMat);
      backWall.position.set(0, roomH / 2, -roomL / 2);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH, roomL), wallMat);
      leftWall.position.set(-roomW / 2, roomH / 2, 0);
      this.scene.add(leftWall);

      const gapW = 1.5, gapH = 2.6;
      // Tường phải với ô cửa về phòng khách tại z = 2.4
      const livDoorZ = 2.4;
      const rSegA = roomL / 2 + livDoorZ - gapW / 2;
      const rwA = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH, rSegA), wallMat);
      rwA.position.set(roomW / 2, roomH / 2, -roomL / 2 + rSegA / 2);
      this.scene.add(rwA);
      const rSegB = roomL / 2 - livDoorZ - gapW / 2;
      const rwB = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH, rSegB), wallMat);
      rwB.position.set(roomW / 2, roomH / 2, roomL / 2 - rSegB / 2);
      this.scene.add(rwB);
      const rwTop = new THREE.Mesh(new THREE.BoxGeometry(0.16, roomH - gapH, gapW), wallMat);
      rwTop.position.set(roomW / 2, roomH - (roomH - gapH) / 2, livDoorZ);
      this.scene.add(rwTop);

      // Tường trước với cửa chính ra phố tại x = -2.6
      const frontDoorX = -2.6;
      const fSegA = roomW / 2 + frontDoorX - gapW / 2;
      const fwA = new THREE.Mesh(new THREE.BoxGeometry(fSegA, roomH, 0.16), wallMat);
      fwA.position.set(-roomW / 2 + fSegA / 2, roomH / 2, roomL / 2);
      this.scene.add(fwA);
      const fSegB = roomW / 2 - frontDoorX - gapW / 2;
      const fwB = new THREE.Mesh(new THREE.BoxGeometry(fSegB, roomH, 0.16), wallMat);
      fwB.position.set(roomW / 2 - fSegB / 2, roomH / 2, roomL / 2);
      this.scene.add(fwB);
      const fwTop = new THREE.Mesh(new THREE.BoxGeometry(gapW, roomH - gapH, 0.16), wallMat);
      fwTop.position.set(frontDoorX, roomH - (roomH - gapH) / 2, roomL / 2);
      this.scene.add(fwTop);

      // 4. Backsplash gạch men sau bàn bếp
      const splash = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.95, 0.03), splashMat);
      splash.position.set(-0.6, 1.42, -roomL / 2 + 0.09);
      this.scene.add(splash);

      // 5. Dãy tủ bếp dưới + mặt đá (dọc tường sau)
      const counterZ = -roomL / 2 + 0.42;
      // Mặt đá chia đoạn, chừa chỗ cho bồn rửa (x = -2.5) và bếp nấu (x = 0.8)
      [[-4.00, -2.98], [-2.02, 0.34], [1.26, 2.80]].forEach(([x0, x1]) => {
        const seg = new THREE.Mesh(createRoundedBoxGeometry(x1 - x0, 0.06, 0.72, 0.02, 3), counterMat);
        seg.position.set((x0 + x1) / 2, 0.92, counterZ);
        seg.castShadow = true;
        this.scene.add(seg);
      });

      const cabinetXs = [-3.4, -1.6, -0.7, 1.6, 2.4];
      cabinetXs.forEach((cx, i) => {
        const modelId = (i % 2 === 0) ? 'kt_cabinet' : 'kt_cabinetDrawer';
        this.placeZoneModel(modelId, { x: cx, y: 0, z: counterZ }, { targetHeight: 0.9, alignBottomY: true }, () => {
          const g = new THREE.Group();
          const body = new THREE.Mesh(createRoundedBoxGeometry(0.86, 0.88, 0.68, 0.02, 2), cabinetMat);
          body.position.y = 0.44; body.castShadow = true; g.add(body);
          const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 10), steelMat);
          handle.rotation.z = Math.PI / 2;
          handle.position.set(0, 0.72, 0.36); g.add(handle);
          return g;
        });
      });

      // Tủ bếp có thể tương tác (櫥櫃)
      const cabinetProp = new THREE.Group();
      const cabBody = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.9, 0.7, 0.03, 3), cabinetMat);
      cabBody.position.y = 0.45; cabBody.castShadow = true;
      cabinetProp.add(cabBody);
      for (let dy of [0.28, 0.62]) {
        const dh = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.4, 12), steelMat);
        dh.rotation.z = Math.PI / 2; dh.position.set(0, dy, 0.37);
        cabinetProp.add(dh);
      }
      cabinetProp.position.set(-0.7, 0, counterZ);
      this.registerInteractable(cabinetProp, 'kt_cabinet');
      this.scene.add(cabinetProp);

      // Tủ treo phía trên
      [-3.2, -2.2, 1.6, 2.6].forEach(cx => {
        this.placeZoneModel('kt_cabinetUpper', { x: cx, y: 1.95, z: -roomL / 2 + 0.28 },
          { targetHeight: 0.72, alignBottomY: true }, () => {
            const g = new THREE.Group();
            const body = new THREE.Mesh(createRoundedBoxGeometry(0.94, 0.7, 0.36, 0.02, 2), cabinetMat);
            body.position.y = 0.35; g.add(body);
            return g;
          });
      });

      // 6. BỒN RỬA (水槽)
      const sink = this.placeZoneModel('kt_sink', { x: -2.5, y: 0.0, z: counterZ }, { targetHeight: 0.95, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const base = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.9, 0.68, 0.02, 2), cabinetMat);
        base.position.y = 0.45; g.add(base);
        const basin = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.46), steelMat);
        basin.position.y = 0.94; g.add(basin);
        const water = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.4), new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.7 }));
        water.rotation.x = -Math.PI / 2; water.position.y = 0.98; g.add(water);
        const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 12), steelMat);
        tap.position.set(0, 1.14, -0.24); g.add(tap);
        const spout = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 20, Math.PI), steelMat);
        spout.position.set(0, 1.30, -0.13); spout.rotation.y = Math.PI / 2; g.add(spout);
        return g;
      });
      if (sink) this.registerInteractable(sink, 'kt_sink');

      // 7. BẾP NẤU (爐子) + máy hút mùi
      const stove = this.placeZoneModel('kt_stove', { x: 0.8, y: 0, z: counterZ }, { targetHeight: 0.95, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.9, 0.68, 0.02, 2), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.35, metalness: 0.5 }));
        body.position.y = 0.45; g.add(body);
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.66), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.3 }));
        top.position.y = 0.92; g.add(top);
        [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.18], [0.2, 0.18]].forEach(([bx, bz]) => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 8, 24), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 }));
          ring.rotation.x = -Math.PI / 2; ring.position.set(bx, 0.95, bz); g.add(ring);
        });
        const flame = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24), new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 1.6 }));
        flame.rotation.x = -Math.PI / 2; flame.position.set(-0.2, 0.96, -0.16); g.add(flame);
        return g;
      });
      if (stove) this.registerInteractable(stove, 'kt_stove');

      // Nồi trên bếp + ánh lửa
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.18, 20), steelMat);
      pot.position.set(0.6, 1.02, counterZ - 0.16);
      this.scene.add(pot);
      const stoveGlow = new THREE.PointLight(0xfb923c, 0.5, 2.2, 2);
      stoveGlow.position.set(0.6, 1.0, counterZ);
      this.scene.add(stoveGlow);

      this.placeZoneModel('kt_hood', { x: 0.8, y: 1.85, z: -roomL / 2 + 0.3 }, { targetHeight: 0.85, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 0.4, 4), steelMat);
        funnel.rotation.y = Math.PI / 4; funnel.position.y = 0.2; g.add(funnel);
        const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.26), steelMat);
        pipe.position.y = 0.66; g.add(pipe);
        return g;
      });

      // 8. LÒ VI SÓNG (微波爐)
      const micro = this.placeZoneModel('kt_microwave', { x: 2.0, y: 0.95, z: counterZ - 0.05 }, { targetHeight: 0.34, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(createRoundedBoxGeometry(0.62, 0.34, 0.42, 0.02, 2), new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.3, metalness: 0.6 }));
        body.position.y = 0.17; g.add(body);
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.22), new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x1f2937, emissiveIntensity: 0.6, roughness: 0.1 }));
        win.position.set(-0.08, 0.18, 0.212); g.add(win);
        return g;
      });
      if (micro) this.registerInteractable(micro, 'kt_microwave');

      // 9. TỦ LẠNH (冰箱)
      const fridge = this.placeZoneModel('kt_fridge', { x: 3.4, y: 0, z: -roomL / 2 + 0.55 }, { targetHeight: 1.95, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(createRoundedBoxGeometry(0.92, 1.95, 0.75, 0.05, 3), new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.25, metalness: 0.7 }));
        body.position.y = 0.98; body.castShadow = true; g.add(body);
        const seam = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: 0x9ca3af }));
        seam.position.set(0, 1.32, 0.38); g.add(seam);
        for (let hy of [1.55, 1.05]) {
          const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 12), steelMat);
          h.position.set(0.34, hy, 0.39); g.add(h);
        }
        return g;
      });
      if (fridge) this.registerInteractable(fridge, 'kt_fridge');

      // 10. MÁY PHA CÀ PHÊ / MÁY NƯỚNG / MÁY XAY trên quầy trái
      const sideCounterZ = -0.4;
      const sideTop = new THREE.Mesh(createRoundedBoxGeometry(0.72, 0.06, 2.6, 0.02, 3), counterMat);
      sideTop.position.set(-roomW / 2 + 0.45, 0.92, sideCounterZ);
      this.scene.add(sideTop);
      for (let cz of [-1.3, -0.4, 0.5]) {
        this.placeZoneModel('kt_cabinet', { x: -roomW / 2 + 0.45, y: 0, z: cz }, { targetHeight: 0.9, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
          const g = new THREE.Group();
          const body = new THREE.Mesh(createRoundedBoxGeometry(0.68, 0.88, 0.86, 0.02, 2), cabinetMat);
          body.position.y = 0.44; g.add(body);
          return g;
        });
      }

      const coffeeM = this.placeZoneModel('kt_coffeeMachine', { x: -roomW / 2 + 0.5, y: 0.95, z: -1.2 }, { targetHeight: 0.4, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(createRoundedBoxGeometry(0.3, 0.42, 0.26, 0.03, 3), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.5 }));
        body.position.y = 0.21; g.add(body);
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.07, 14), new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.3 }));
        cup.position.set(0.16, 0.06, 0); g.add(cup);
        const led = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.03), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1.4 }));
        led.position.set(0.152, 0.32, 0); led.rotation.y = Math.PI / 2; g.add(led);
        return g;
      });
      if (coffeeM) this.registerInteractable(coffeeM, 'kt_coffeeMachine');

      const toaster = this.placeZoneModel('kt_toaster', { x: -roomW / 2 + 0.5, y: 0.95, z: -0.35 }, { targetHeight: 0.24, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(createRoundedBoxGeometry(0.34, 0.22, 0.2, 0.04, 3), steelMat);
        body.position.y = 0.11; g.add(body);
        for (let bx of [-0.07, 0.07]) {
          const slice = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: 0xd6a05a, roughness: 0.9 }));
          slice.position.set(bx, 0.26, 0); g.add(slice);
        }
        return g;
      });
      if (toaster) this.registerInteractable(toaster, 'kt_toaster');

      const blender = this.placeZoneModel('kt_blender', { x: -roomW / 2 + 0.5, y: 0.95, z: 0.5 }, { targetHeight: 0.42, alignBottomY: true, rotationY: Math.PI / 2 }, () => {
        const g = new THREE.Group();
        const base = new THREE.Mesh(createRoundedBoxGeometry(0.2, 0.12, 0.2, 0.03, 3), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4 }));
        base.position.y = 0.06; g.add(base);
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.26, 16), new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.05, transparent: true, opacity: 0.6 }));
        jar.position.y = 0.25; g.add(jar);
        const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.066, 0.14, 16), new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.4 }));
        juice.position.y = 0.2; g.add(juice);
        return g;
      });
      if (blender) this.registerInteractable(blender, 'kt_blender');

      // 11. BÀN ĂN (餐桌) + ghế
      const table = this.placeZoneModel('kt_table', { x: 0.6, y: 0, z: 1.4 }, { targetHeight: 0.76, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const top = new THREE.Mesh(createRoundedBoxGeometry(1.7, 0.07, 1.0, 0.03, 3), woodMat);
        top.position.y = 0.72; top.castShadow = true; g.add(top);
        [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.7, 12), woodMat);
          leg.position.set(lx, 0.35, lz); g.add(leg);
        });
        return g;
      });
      if (table) this.registerInteractable(table, 'kt_table');

      [[-0.35, 1.4, Math.PI / 2], [1.55, 1.4, -Math.PI / 2], [0.6, 0.55, 0], [0.6, 2.25, Math.PI]].forEach(([cx, cz, ry]) => {
        this.placeZoneModel('kt_chair', { x: cx, y: 0, z: cz }, { targetHeight: 0.92, alignBottomY: true, rotationY: ry }, () => {
          const g = new THREE.Group();
          const seat = new THREE.Mesh(createRoundedBoxGeometry(0.42, 0.06, 0.42, 0.02, 2), woodMat);
          seat.position.y = 0.46; g.add(seat);
          const back = new THREE.Mesh(createRoundedBoxGeometry(0.42, 0.44, 0.05, 0.02, 2), woodMat);
          back.position.set(0, 0.7, -0.18); g.add(back);
          [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 10), woodMat);
            leg.position.set(lx, 0.23, lz); g.add(leg);
          });
          g.rotation.y = ry;
          return g;
        });
      });

      // Bát đĩa trên bàn ăn
      [[0.15, 1.15], [1.05, 1.65]].forEach(([px, pz]) => {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.025, 24), new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25 }));
        plate.position.set(px, 0.79, pz);
        this.scene.add(plate);
      });

      // 12. THÙNG RÁC (垃圾桶)
      const trash = this.placeZoneModel('kt_trashcan', { x: 3.3, y: 0, z: 1.9 }, { targetHeight: 0.62, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.55, 20), new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.4, metalness: 0.5 }));
        body.position.y = 0.28; g.add(body);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.35, metalness: 0.6 }));
        lid.position.y = 0.58; g.add(lid);
        return g;
      });
      if (trash) this.registerInteractable(trash, 'kt_trashcan');

      // 13. CỬA VỀ PHÒNG KHÁCH (tường phải)
      const backGate = new THREE.Group();
      const bgFrameMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45 });
      [[-0.72], [0.72]].forEach(([px]) => {
        const post = new THREE.Mesh(createRoundedBoxGeometry(0.1, gapH, 0.16, 0.02, 2), bgFrameMat);
        post.position.set(px, gapH / 2, 0); backGate.add(post);
      });
      const bgTop = new THREE.Mesh(createRoundedBoxGeometry(1.54, 0.12, 0.16, 0.02, 2), bgFrameMat);
      bgTop.position.set(0, gapH - 0.06, 0); backGate.add(bgTop);
      const bgSign = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2 }));
      bgSign.position.set(0, gapH + 0.18, 0.09); backGate.add(bgSign);
      const bgLight = new THREE.PointLight(0x38bdf8, 0.5, 3, 1.5);
      bgLight.position.set(0, gapH + 0.22, 0.3); backGate.add(bgLight);
      backGate.rotation.y = -Math.PI / 2;
      backGate.position.set(roomW / 2 - 0.12, 0, livDoorZ);
      this.scene.add(backGate);
      this.registerGate(backGate, 'back_door', 'living', { direction: 'back' });

      // 14. CỬA CHÍNH RA THÀNH PHỐ (tường trước) — khoá tới khi học xong phòng bếp
      const frontGate = new THREE.Group();
      const fgFrame = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
      const fgLeafMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.5 });
      [[-0.72], [0.72]].forEach(([px]) => {
        const post = new THREE.Mesh(createRoundedBoxGeometry(0.11, gapH, 0.18, 0.02, 2), fgFrame);
        post.position.set(px, gapH / 2, 0); frontGate.add(post);
      });
      const fgTop = new THREE.Mesh(createRoundedBoxGeometry(1.56, 0.13, 0.18, 0.02, 2), fgFrame);
      fgTop.position.set(0, gapH - 0.065, 0); frontGate.add(fgTop);
      const fgLeaf = new THREE.Mesh(createRoundedBoxGeometry(1.28, gapH - 0.16, 0.07, 0.02, 2), fgLeafMat);
      fgLeaf.position.set(0, (gapH - 0.16) / 2, 0); frontGate.add(fgLeaf);
      const fgWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xbfdbfe, emissive: 0x93c5fd, emissiveIntensity: 0.55, roughness: 0.1 }));
      fgWindow.position.set(0, 1.85, 0.04); frontGate.add(fgWindow);
      const fgKnob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.9 }));
      fgKnob.position.set(0.48, 1.15, 0.06); frontGate.add(fgKnob);
      const fgSignBox = new THREE.Mesh(createRoundedBoxGeometry(0.86, 0.24, 0.06, 0.02, 2), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
      fgSignBox.position.set(0, gapH + 0.2, 0.05); frontGate.add(fgSignBox);
      const fgSign = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.17),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
      fgSign.position.set(0, gapH + 0.2, 0.085);
      fgSign.userData.isGateSign = true;
      frontGate.add(fgSign);
      const fgLight = new THREE.PointLight(0xef4444, 0.6, 3.2, 1.5);
      fgLight.position.set(0, gapH + 0.25, 0.32);
      fgLight.userData.isGateLight = true;
      frontGate.add(fgLight);
      frontGate.rotation.y = Math.PI;
      frontGate.position.set(frontDoorX, 0, roomL / 2 - 0.12);
      this.scene.add(frontGate);
      this.registerGate(frontGate, 'front_door', 'street', { requireComplete: true });
      this.applyGateLockVisual(frontGate, 'kitchen');

      // Thảm chùi chân trước cửa
      this.placeZoneModel('kt_rug', { x: frontDoorX, y: 0.008, z: roomL / 2 - 0.85 }, { targetWidth: 1.05, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const mat0 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 }));
        mat0.rotation.x = -Math.PI / 2; g.add(mat0);
        return g;
      });

      this.buildPlayerAvatar();

      this.colliders = [
        { name: 'counter_run',  minX: -4.0, maxX: 2.6,  minZ: -3.9, maxZ: -3.3 },
        { name: 'fridge',       minX: 2.9,  maxX: 3.9,  minZ: -3.9, maxZ: -2.9 },
        { name: 'side_counter', minX: -4.1, maxX: -3.3, minZ: -1.8, maxZ: 0.95 },
        { name: 'dining_table', minX: -0.35, maxX: 1.55, minZ: 0.8, maxZ: 2.0 },
        { name: 'trashcan',     minX: 3.05, maxX: 3.55, minZ: 1.65, maxZ: 2.15 }
      ];
    }

    // ------------------------------------------------------------------
    // TIỆN ÍCH DỰNG CẢNH NGOÀI TRỜI (đường phố & công viên)
    // ------------------------------------------------------------------
    makeTree(scale = 1, trunkColor = 0x6b4423, leafColor = 0x15803d) {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13 * scale, 0.19 * scale, 1.7 * scale, 10),
        new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.95 })
      );
      trunk.position.y = 0.85 * scale;
      trunk.castShadow = true;
      g.add(trunk);
      const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.85 });
      const blobs = DEVICE.isMobile
        ? [[0, 2.3, 0, 1.05], [0.15, 2.85, 0.1, 0.6]]
        : [
            [0, 2.25, 0, 0.95], [-0.5, 1.95, 0.25, 0.66],
            [0.55, 2.05, -0.2, 0.6], [0.1, 2.75, 0.15, 0.58]
          ];
      blobs.forEach(([bx, by, bz, br]) => {
        const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(br * scale, 1), leafMat);
        blob.position.set(bx * scale, by * scale, bz * scale);
        blob.castShadow = true;
        g.add(blob);
      });
      return g;
    }

    makeStreetLamp() {
      const g = new THREE.Group();
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.75 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.3, 14), metalMat);
      base.position.y = 0.15; g.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.4, 14), metalMat);
      pole.position.y = 2.4; pole.castShadow = true; g.add(pole);
      const armCurve = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 20, Math.PI / 2), metalMat);
      armCurve.position.set(0.0, 4.55, 0); armCurve.rotation.z = Math.PI; armCurve.rotation.y = Math.PI / 2;
      g.add(armCurve);
      const headArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.9), metalMat);
      headArm.position.set(0, 4.6, 0.5); g.add(headArm);
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.3, 0.24, 14), metalMat);
      shade.position.set(0, 4.48, 0.92); g.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0xfff7d6, emissive: 0xfde68a, emissiveIntensity: 1.5 }));
      bulb.position.set(0, 4.32, 0.92); g.add(bulb);
      const lampLight = new THREE.PointLight(0xffedb8, 0.55, 9, 1.6);
      lampLight.position.set(0, 4.2, 0.92); g.add(lampLight);
      return g;
    }

    makeCar(bodyColor = 0xdc2626) {
      const g = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.28, metalness: 0.55 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.85 });
      const tyreMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });

      const lower = new THREE.Mesh(createRoundedBoxGeometry(1.85, 0.62, 4.15, 0.22, 4), bodyMat);
      lower.position.y = 0.66; lower.castShadow = true; g.add(lower);
      const cabin = new THREE.Mesh(createRoundedBoxGeometry(1.62, 0.62, 2.1, 0.24, 4), bodyMat);
      cabin.position.set(0, 1.20, -0.15); cabin.castShadow = true; g.add(cabin);
      const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.5), glassMat);
      windshield.position.set(0, 1.22, 0.92); windshield.rotation.x = -0.28; g.add(windshield);
      const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.5), glassMat);
      rearGlass.position.set(0, 1.22, -1.22); rearGlass.rotation.x = 0.28; rearGlass.rotation.y = Math.PI; g.add(rearGlass);
      [-1, 1].forEach(sx => {
        const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.44), glassMat);
        sideGlass.position.set(sx * 0.82, 1.24, -0.15);
        sideGlass.rotation.y = sx * Math.PI / 2; g.add(sideGlass);
      });
      [[-0.86, 1.35], [0.86, 1.35], [-0.86, -1.35], [0.86, -1.35]].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 18), tyreMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.36, wz); g.add(wheel);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.27, 14),
          new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.25, metalness: 0.85 }));
        hub.rotation.z = Math.PI / 2; hub.position.set(wx, 0.36, wz); g.add(hub);
      });
      [[-0.6, 2.05], [0.6, 2.05]].forEach(([hx, hz]) => {
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0xfff8dc, emissive: 0xfde68a, emissiveIntensity: 0.9 }));
        head.scale.z = 0.5; head.position.set(hx, 0.72, hz); g.add(head);
      });
      [[-0.6, -2.05], [0.6, -2.05]].forEach(([hx, hz]) => {
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.06),
          new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.1 }));
        tail.position.set(hx, 0.78, hz); g.add(tail);
      });
      return g;
    }

    makeBuilding(width, depth, floors, baseColor, accentColor) {
      const g = new THREE.Group();
      const floorH = 3.0;
      const height = floors * floorH;
      const wallMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.85 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
      body.position.y = height / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const cols = Math.max(2, Math.floor(width / 1.5));

      if (DEVICE.isMobile) {
        // Mỗi toà nhà từng tốn ~80 mesh cửa sổ. Vẽ cửa sổ vào texture thay vì
        // dựng từng tấm phẳng → 6 toà nhà giảm từ ~440 xuống còn 6 lần vẽ.
        const cv = document.createElement('canvas');
        cv.width = 64; cv.height = 128;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#' + baseColor.toString(16).padStart(6, '0');
        cx.fillRect(0, 0, 64, 128);
        for (let f = 0; f < 8; f++) {
          for (let c = 0; c < 4; c++) {
            const lit = ((f * 7 + c * 3) % 4) !== 0;
            cx.fillStyle = lit ? '#9fc6f2' : '#22405f';
            cx.fillRect(6 + c * 14, 6 + f * 16, 9, 9);
          }
          cx.fillStyle = '#' + accentColor.toString(16).padStart(6, '0');
          cx.fillRect(0, f * 16, 64, 2);
        }
        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(Math.max(1, Math.round(width / 4)), Math.max(1, Math.round(floors / 8 * 1)) || 1);
        body.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
      } else {
        // Viền mỗi tầng + cửa sổ phát sáng
        const winMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x60a5fa, emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.4 });
        const winDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.2, metalness: 0.3 });
        for (let f = 0; f < floors; f++) {
          const y = f * floorH + floorH * 0.62;
          for (let c = 0; c < cols; c++) {
            const x = -width / 2 + (width / cols) * (c + 0.5);
            const lit = ((f * 7 + c * 3) % 4) !== 0;
            [1, -1].forEach(sz => {
              const w = new THREE.Mesh(new THREE.PlaneGeometry(width / cols * 0.55, 1.35), lit ? winMat : winDarkMat);
              w.position.set(x, y, sz * (depth / 2 + 0.02));
              if (sz < 0) w.rotation.y = Math.PI;
              g.add(w);
            });
          }
          const band = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 0.16, depth + 0.14),
            new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.6 }));
          band.position.y = f * floorH + 0.08;
          g.add(band);
        }
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.3, depth + 0.3),
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.7 }));
      roof.position.y = height + 0.15;
      g.add(roof);
      return g;
    }

    // --- ZONE 4: ĐƯỜNG PHỐ THÀNH PHỐ (街道) ---
    buildStreet() {
      this.roomBounds = { minX: -9.5, maxX: 9.5, minZ: -20.0, maxZ: 25 };

      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.95 });
      const walkMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.9 });
      const curbMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.85 });
      const lineMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.6 });

      // Nền cỏ nền xa
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160),
        new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 1 }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.06;
      ground.receiveShadow = true;
      this.scene.add(ground);

      // 1. LÒNG ĐƯỜNG (馬路) — chạy dọc trục Z
      const roadGroup = new THREE.Group();
      const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 66), asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.01, 0);
      road.receiveShadow = true;
      roadGroup.add(road);
      // Vạch tim đường đứt quãng
      for (let z = -30; z <= 30; z += 3.4) {
        if (Math.abs(z + 10) < 3) continue; // chừa chỗ vạch qua đường
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.9), lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.02, z);
        roadGroup.add(dash);
      }
      roadGroup.position.set(0, 0, 0);
      this.objectMeshFactories.st_road = () => {
        const g = new THREE.Group();
        const seg = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 9), asphaltMat);
        seg.position.y = -0.06; g.add(seg);
        for (let z = -3.4; z <= 3.4; z += 3.4) {
          const dash = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 1.9), lineMat);
          dash.position.set(0, 0.01, z); g.add(dash);
        }
        [-1, 1].forEach(side => {
          const walk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 9), walkMat);
          walk.position.set(side * 4.8, -0.02, 0); g.add(walk);
          const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 9), curbMat);
          curb.position.set(side * 4.05, 0.0, 0); g.add(curb);
        });
        return g;
      };
      this.registerInteractable(roadGroup, 'st_road');
      this.scene.add(roadGroup);

      // 2. VỈA HÈ HAI BÊN + bó vỉa
      [-1, 1].forEach(side => {
        const walk = new THREE.Mesh(new THREE.PlaneGeometry(5, 66), walkMat);
        walk.rotation.x = -Math.PI / 2;
        walk.position.set(side * 6.5, 0.06, 0);
        walk.receiveShadow = true;
        this.scene.add(walk);
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 66), curbMat);
        curb.position.set(side * 4.1, 0.05, 0);
        this.scene.add(curb);
      });

      // 3. VẠCH QUA ĐƯỜNG (斑馬線) tại z = -10
      const crossGroup = new THREE.Group();
      for (let i = -3; i <= 3; i++) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 2.6), whiteMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(i * 1.1, 0.03, 0);
        crossGroup.add(stripe);
      }
      crossGroup.position.set(0, 0, -10);
      this.registerInteractable(crossGroup, 'st_crosswalk');
      this.scene.add(crossGroup);

      // 4. ĐÈN GIAO THÔNG (紅綠燈) ở góc vạch qua đường
      const lightGroup = new THREE.Group();
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4, metalness: 0.7 });
      const tlPole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 4.2, 12), poleMat);
      tlPole.position.y = 2.1; tlPole.castShadow = true; lightGroup.add(tlPole);
      const tlBox = new THREE.Mesh(createRoundedBoxGeometry(0.42, 1.15, 0.34, 0.05, 3), poleMat);
      tlBox.position.set(0, 3.9, 0.22); lightGroup.add(tlBox);
      const lampColors = [
        { c: 0xef4444, e: 0xdc2626, y: 4.28 },
        { c: 0xfacc15, e: 0xeab308, y: 3.90 },
        { c: 0x22c55e, e: 0x16a34a, y: 3.52 }
      ];
      const tlLamps = [];
      lampColors.forEach(lc => {
        const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20),
          new THREE.MeshStandardMaterial({ color: lc.c, emissive: lc.e, emissiveIntensity: 0.25 }));
        bulb.position.set(0, lc.y, 0.395);
        lightGroup.add(bulb);
        tlLamps.push(bulb);
      });
      lightGroup.position.set(4.9, 0, -7.6);
      lightGroup.rotation.y = Math.PI;
      // Mô hình xem 3D: cột thấp hơn, hộp đèn quay ra trước và cả 3 bóng cùng sáng
      this.objectMeshFactories.st_trafficLight = () => {
        const g = new THREE.Group();
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 2.2, 12), poleMat);
        p.position.y = 1.1; g.add(p);
        const box = new THREE.Mesh(createRoundedBoxGeometry(0.46, 1.2, 0.36, 0.05, 3), poleMat);
        box.position.set(0, 2.75, 0.1); g.add(box);
        lampColors.forEach((lc, i) => {
          const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20),
            new THREE.MeshStandardMaterial({ color: lc.c, emissive: lc.e, emissiveIntensity: 1.7 }));
          bulb.position.set(0, 3.13 - i * 0.38, 0.285); g.add(bulb);
          const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 16, 1, true), poleMat);
          visor.rotation.x = Math.PI / 2;
          visor.position.set(0, 3.13 - i * 0.38, 0.315); g.add(visor);
        });
        return g;
      };
      this.registerInteractable(lightGroup, 'st_trafficLight');
      this.scene.add(lightGroup);
      // Chu kỳ đèn đỏ → vàng → xanh
      this.animatedProps.push({
        type: 'trafficLight', lamps: tlLamps, t: 0,
        update(delta) {
          this.t += delta;
          const phase = Math.floor(this.t / 3) % 3;
          this.lamps.forEach((l, i) => {
            l.material.emissiveIntensity = (i === phase) ? 1.8 : 0.18;
          });
        }
      });

      // 5. ĐÈN ĐƯỜNG (路燈)
      const lampZs = [16, 6, -4, -14, -22];
      lampZs.forEach((lz, i) => {
        const lamp = this.makeStreetLamp();
        const side = (i % 2 === 0) ? 1 : -1;
        lamp.position.set(side * 4.55, 0.06, lz);
        lamp.rotation.y = side > 0 ? Math.PI : 0;
        if (i === 1) {
          this.registerInteractable(lamp, 'st_streetLamp');
        }
        this.scene.add(lamp);
      });

      // 6. TRẠM XE BUÝT (公車站)
      const busStop = new THREE.Group();
      const bsMetal = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.35, metalness: 0.6 });
      const bsGlass = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      [[-1.6], [1.6]].forEach(([px]) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), bsMetal);
        post.position.set(px, 1.25, -0.7); busStop.add(post);
        const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.12), bsMetal);
        post2.position.set(px, 1.25, 0.7); busStop.add(post2);
      });
      const bsRoof = new THREE.Mesh(createRoundedBoxGeometry(3.6, 0.12, 1.8, 0.05, 3), bsMetal);
      bsRoof.position.y = 2.55; bsRoof.castShadow = true; busStop.add(bsRoof);
      const bsBack = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.3), bsGlass);
      bsBack.position.set(0, 1.3, -0.72); busStop.add(bsBack);
      const bsBench = new THREE.Mesh(createRoundedBoxGeometry(2.6, 0.1, 0.42, 0.03, 2),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 }));
      bsBench.position.set(0, 0.48, -0.35); busStop.add(bsBench);
      const bsSignPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 10), bsMetal);
      bsSignPost.position.set(2.1, 1.3, 0.5); busStop.add(bsSignPost);
      const bsSign = new THREE.Mesh(createRoundedBoxGeometry(0.72, 0.5, 0.05, 0.04, 3),
        new THREE.MeshStandardMaterial({ color: 0x0369a1, emissive: 0x0284c7, emissiveIntensity: 0.5 }));
      bsSign.position.set(2.1, 2.5, 0.5); busStop.add(bsSign);
      busStop.position.set(7.6, 0.06, 15);
      busStop.rotation.y = -Math.PI / 2;
      this.registerInteractable(busStop, 'st_busStop');
      this.scene.add(busStop);

      // 7. GHẾ DÀI (長椅)
      const bench = this.placeZoneModel('st_bench', { x: 7.7, y: 0.06, z: 5.5 },
        { targetHeight: 0.92, alignBottomY: true, rotationY: -Math.PI / 2 }, () => {
          const g = new THREE.Group();
          const woodM = new THREE.MeshStandardMaterial({ color: 0x9a6a3c, roughness: 0.85 });
          const ironM = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 });
          for (let i = 0; i < 3; i++) {
            const slat = new THREE.Mesh(createRoundedBoxGeometry(1.8, 0.06, 0.16, 0.02, 2), woodM);
            slat.position.set(0, 0.45, -0.2 + i * 0.2); g.add(slat);
          }
          for (let i = 0; i < 3; i++) {
            const slat = new THREE.Mesh(createRoundedBoxGeometry(1.8, 0.14, 0.05, 0.02, 2), woodM);
            slat.position.set(0, 0.62 + i * 0.19, -0.32); g.add(slat);
          }
          [-0.78, 0.78].forEach(lx => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.5), ironM);
            leg.position.set(lx, 0.22, -0.1); g.add(leg);
          });
          return g;
        });
      if (bench) {
        bench.rotation.y = -Math.PI / 2;
        this.registerInteractable(bench, 'st_bench');
      }

      // 8. CÂY XANH VEN ĐƯỜNG (樹)
      const treeZs = [16, 9, 1, -7, -15, -24];
      treeZs.forEach((tz, i) => {
        [-1, 1].forEach(side => {
          const tree = this.makeTree(1 + (i % 3) * 0.12, 0x6b4423, [0x15803d, 0x166534, 0x22c55e][i % 3]);
          tree.position.set(side * 8.6, 0.06, tz + side * 1.3);
          if (i === 2 && side === 1) {
            this.registerInteractable(tree, 'st_tree');
          }
          this.scene.add(tree);
        });
      });

      // 9. XE Ô TÔ ĐẬU BÊN ĐƯỜNG (汽車)
      const car = this.makeCar(0xdc2626);
      car.position.set(-2.2, 0.01, 8);
      this.registerInteractable(car, 'st_car');
      this.scene.add(car);

      const car2 = this.makeCar(0x2563eb);
      car2.position.set(2.2, 0.01, -18);
      car2.rotation.y = Math.PI;
      this.scene.add(car2);

      // 10. TÒA NHÀ CAO TẦNG (大樓) & DÃY PHỐ
      const blocks = [
        { x: 13, z: 12, w: 9, d: 11, f: 7, c: 0x94a3b8, a: 0x475569, tag: 'tall' },
        { x: 13, z: -2, w: 9, d: 10, f: 5, c: 0xa8a29e, a: 0x57534e },
        { x: 13, z: -16, w: 9, d: 10, f: 6, c: 0x9ca3af, a: 0x4b5563 },
        { x: -13, z: 18, w: 9, d: 10, f: 4, c: 0xcbb69a, a: 0x78716c },
        { x: -13, z: 4, w: 9, d: 10, f: 6, c: 0x93a5b8, a: 0x475569 },
        { x: -13, z: -12, w: 9, d: 12, f: 5, c: 0xb8a99a, a: 0x6b5b4b }
      ];
      blocks.forEach(b => {
        const bl = this.makeBuilding(b.w, b.d, b.f, b.c, b.a);
        bl.position.set(b.x, 0, b.z);
        if (b.tag === 'tall') {
          this.registerInteractable(bl, 'st_building');
        }
        this.scene.add(bl);
      });

      // 11. CỬA HÀNG TIỆN LỢI (商店)
      const shop = new THREE.Group();
      const shopBody = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.6, 5.2),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 }));
      shopBody.position.y = 1.8; shopBody.castShadow = true; shop.add(shopBody);
      const shopGlass = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.1),
        new THREE.MeshStandardMaterial({ color: 0xdbeafe, emissive: 0xbfdbfe, emissiveIntensity: 0.5, roughness: 0.05, metalness: 0.3 }));
      shopGlass.position.set(0, 1.5, 2.62); shop.add(shopGlass);
      const awning = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.16, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 }));
      awning.position.set(0, 3.0, 3.1); awning.rotation.x = 0.16; shop.add(awning);
      const signBoard = new THREE.Mesh(createRoundedBoxGeometry(5.2, 0.9, 0.16, 0.06, 3),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.6 }));
      signBoard.position.set(0, 3.55, 2.6); shop.add(signBoard);
      const shopLight = new THREE.PointLight(0xfff0c4, 0.9, 9, 1.5);
      shopLight.position.set(0, 2.6, 3.4); shop.add(shopLight);
      shop.position.set(9.6, 0.06, -4);
      shop.rotation.y = -Math.PI / 2;
      this.registerInteractable(shop, 'st_shop');
      this.scene.add(shop);

      // 12. NHÀ CỦA NGƯỜI CHƠI + CỬA VỀ BẾP
      const home = new THREE.Group();
      const homeBody = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.2, 6.5),
        new THREE.MeshStandardMaterial({ color: 0xfde9d0, roughness: 0.85 }));
      homeBody.position.y = 2.1; homeBody.castShadow = true; home.add(homeBody);
      const homeRoof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.2, 4),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }));
      homeRoof.rotation.y = Math.PI / 4;
      homeRoof.position.y = 5.3; home.add(homeRoof);
      [[-2.1, 2.4], [2.1, 2.4]].forEach(([wx, wy]) => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2),
          new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xfde68a, emissiveIntensity: 0.6 }));
        win.position.set(wx, wy, 3.27); home.add(win);
      });
      home.position.set(11.5, 0.06, 24);
      this.scene.add(home);

      const homeGate = new THREE.Group();
      const hgFrame = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.5 });
      [[-0.8], [0.8]].forEach(([px]) => {
        const post = new THREE.Mesh(createRoundedBoxGeometry(0.16, 2.7, 0.2, 0.03, 2), hgFrame);
        post.position.set(px, 1.35, 0); homeGate.add(post);
      });
      const hgTop = new THREE.Mesh(createRoundedBoxGeometry(1.76, 0.18, 0.2, 0.03, 2), hgFrame);
      hgTop.position.set(0, 2.7, 0); homeGate.add(hgTop);
      const hgLeaf = new THREE.Mesh(createRoundedBoxGeometry(1.44, 2.6, 0.08, 0.03, 2),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.55 }));
      hgLeaf.position.set(0, 1.3, 0); homeGate.add(hgLeaf);
      const hgSign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2 }));
      hgSign.position.set(0, 2.95, 0.1); homeGate.add(hgSign);
      homeGate.position.set(8.0, 0.06, 24);
      homeGate.rotation.y = -Math.PI / 2;
      this.scene.add(homeGate);
      this.registerGate(homeGate, 'back_door', 'kitchen', { direction: 'back' });

      // 13. CỔNG CÔNG VIÊN (公園大門) — bên kia đường, phải qua vạch kẻ
      const parkGate = new THREE.Group();
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
      [[-2.2], [2.2]].forEach(([px]) => {
        const pillar = new THREE.Mesh(createRoundedBoxGeometry(0.85, 3.9, 0.85, 0.06, 3), stoneMat);
        pillar.position.set(px, 1.95, 0); pillar.castShadow = true; parkGate.add(pillar);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 }));
        cap.position.set(px, 4.05, 0); parkGate.add(cap);
      });
      const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 12, 28, Math.PI), stoneMat);
      arch.position.set(0, 3.6, 0); parkGate.add(arch);
      const gateSignBoard = new THREE.Mesh(createRoundedBoxGeometry(2.5, 0.6, 0.14, 0.05, 3),
        new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 }));
      gateSignBoard.position.set(0, 4.35, 0.05); parkGate.add(gateSignBoard);
      const gateSign = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.44),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
      gateSign.position.set(0, 4.35, 0.14);
      gateSign.userData.isGateSign = true;
      parkGate.add(gateSign);
      const gateLight = new THREE.PointLight(0xef4444, 0.7, 6, 1.5);
      gateLight.position.set(0, 4.4, 0.6);
      gateLight.userData.isGateLight = true;
      parkGate.add(gateLight);
      // Hàng rào công viên hai bên cổng
      [-1, 1].forEach(side => {
        const barCount = DEVICE.isMobile ? 4 : 8;
        for (let i = 0; i < barCount; i++) {
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8),
            new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 }));
          bar.position.set(side * (2.9 + i * (8 / barCount) * 0.55), 0.85, 0);
          parkGate.add(bar);
        }
        const rail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.09, 0.09),
          new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 }));
        rail.position.set(side * 4.85, 1.6, 0); parkGate.add(rail);
      });
      this.objectMeshFactories.park_gate = () => {
        const g = new THREE.Group();
        [[-2.2], [2.2]].forEach(([px]) => {
          const pillar = new THREE.Mesh(createRoundedBoxGeometry(0.85, 3.9, 0.85, 0.06, 3), stoneMat);
          pillar.position.set(px, 1.95, 0); g.add(pillar);
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12),
            new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 }));
          cap.position.set(px, 4.05, 0); g.add(cap);
        });
        const a = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 12, 28, Math.PI), stoneMat);
        a.position.set(0, 3.6, 0); g.add(a);
        const sb = new THREE.Mesh(createRoundedBoxGeometry(2.5, 0.6, 0.14, 0.05, 3),
          new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 }));
        sb.position.set(0, 4.35, 0.05); g.add(sb);
        return g;
      };
      parkGate.position.set(-6.2, 0.06, -22.5);
      this.scene.add(parkGate);
      this.registerGate(parkGate, 'park_gate', 'park', { requireComplete: true });
      this.applyGateLockVisual(parkGate, 'street');

      // Cây cối phía sau cổng công viên
      for (let i = 0; i < 7; i++) {
        const t = this.makeTree(1.25, 0x5c3a1e, 0x166534);
        t.position.set(-14 + i * 2.6, 0.06, -28.5 - (i % 2) * 2.5);
        this.scene.add(t);
      }

      this.buildPlayerAvatar();

      this.colliders = [
        { name: 'building_r1', minX: 8.5,  maxX: 18,   minZ: 6.5,   maxZ: 17.5 },
        { name: 'building_r2', minX: 8.5,  maxX: 18,   minZ: -7,    maxZ: 3 },
        { name: 'building_r3', minX: 8.5,  maxX: 18,   minZ: -21,   maxZ: -11 },
        { name: 'shop',        minX: 7.0,  maxX: 12.3, minZ: -7.2,  maxZ: -0.8 },
        { name: 'home',        minX: 7.7,  maxX: 15.3, minZ: 20.7,  maxZ: 27.3 },
        { name: 'building_l1', minX: -18,  maxX: -8.5, minZ: 13,    maxZ: 23 },
        { name: 'building_l2', minX: -18,  maxX: -8.5, minZ: -1,    maxZ: 9 },
        { name: 'building_l3', minX: -18,  maxX: -8.5, minZ: -18,   maxZ: -6 },
        { name: 'busstop',     minX: 6.7,  maxX: 8.6,  minZ: 13.2,  maxZ: 16.8 },
        { name: 'car1',        minX: -3.2, maxX: -1.2, minZ: 5.8,   maxZ: 10.2 },
        { name: 'car2',        minX: 1.2,  maxX: 3.2,  minZ: -20.2, maxZ: -15.8 },
        { name: 'traffic_light', minX: 4.6,  maxX: 5.2,  minZ: -7.9,  maxZ: -7.3 },
        { name: 'bench_walk',   minX: 7.0,   maxX: 8.4,  minZ: 4.6,   maxZ: 6.4 }
      ];
      // Cột đèn đường & thân cây cũng là vật cản
      lampZs.forEach((lz, i) => {
        const side = (i % 2 === 0) ? 1 : -1;
        this.colliders.push({
          name: `lamp_${i}`,
          minX: side * 4.55 - 0.28, maxX: side * 4.55 + 0.28,
          minZ: lz - 0.28, maxZ: lz + 0.28
        });
      });
      treeZs.forEach((tz, i) => {
        [-1, 1].forEach(side => {
          const tx = side * 8.6;
          const tzz = tz + side * 1.3;
          this.colliders.push({
            name: `tree_${i}_${side}`,
            minX: tx - 0.26, maxX: tx + 0.26,
            minZ: tzz - 0.26, maxZ: tzz + 0.26
          });
        });
      });
    }

    // --- ZONE 5: CÔNG VIÊN (公園) ---
    buildPark() {
      this.roomBounds = { minX: -15, maxX: 15, minZ: -15, maxZ: 14 };

      const grassMat = new THREE.MeshStandardMaterial({ color: 0x4d9c2f, roughness: 1 });
      const pathMat = new THREE.MeshStandardMaterial({ color: 0xd6c7a1, roughness: 0.95 });
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.9 });
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x2f8fd6, roughness: 0.06, metalness: 0.45, transparent: true, opacity: 0.85
      });

      // 1. BÃI CỎ (草地)
      const lawnGroup = new THREE.Group();
      const lawn = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), grassMat);
      lawn.rotation.x = -Math.PI / 2;
      lawn.receiveShadow = true;
      lawnGroup.add(lawn);
      // Vài mảng cỏ đậm nhạt cho sinh động
      for (let i = 0; i < (DEVICE.isMobile ? 9 : 22); i++) {
        const patch = new THREE.Mesh(new THREE.CircleGeometry(1.2 + (i % 4) * 0.5, 16),
          new THREE.MeshStandardMaterial({ color: (i % 2) ? 0x3f8526 : 0x5aad38, roughness: 1 }));
        patch.rotation.x = -Math.PI / 2;
        patch.position.set(
          Math.sin(i * 2.3) * 11,
          0.011,
          Math.cos(i * 1.7) * 11
        );
        lawnGroup.add(patch);
      }
      this.objectMeshFactories.pk_grass = () => {
        const g = new THREE.Group();
        const patch = new THREE.Mesh(createRoundedBoxGeometry(3.2, 0.22, 3.2, 0.08, 3), grassMat);
        g.add(patch);
        for (let i = 0; i < 40; i++) {
          const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.28, 5),
            new THREE.MeshStandardMaterial({ color: (i % 2) ? 0x3f8526 : 0x6cc248, roughness: 1 }));
          blade.position.set((Math.sin(i * 7.3) * 1.45), 0.24, (Math.cos(i * 3.1) * 1.45));
          blade.rotation.z = Math.sin(i) * 0.25;
          g.add(blade);
        }
        return g;
      };
      this.registerInteractable(lawnGroup, 'pk_grass');
      this.scene.add(lawnGroup);

      // 2. LỐI ĐI LÁT ĐÁ
      const mainPath = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 30), pathMat);
      mainPath.rotation.x = -Math.PI / 2;
      mainPath.position.set(0, 0.02, 0);
      this.scene.add(mainPath);
      const crossPath = new THREE.Mesh(new THREE.PlaneGeometry(24, 3.0), pathMat);
      crossPath.rotation.x = -Math.PI / 2;
      crossPath.position.set(0, 0.02, 0);
      this.scene.add(crossPath);
      const ring = new THREE.Mesh(new THREE.RingGeometry(3.4, 5.0, 48), pathMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.021, 0);
      this.scene.add(ring);

      // 3. ĐÀI PHUN NƯỚC (噴泉) ở trung tâm
      const fountain = new THREE.Group();
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 0.65, 40), stoneMat);
      basin.position.y = 0.32; basin.castShadow = true; fountain.add(basin);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.85, 0.5, 40),
        new THREE.MeshStandardMaterial({ color: 0x8b8b86, roughness: 0.85 }));
      inner.position.y = 0.4; fountain.add(inner);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(2.85, 40), waterMat);
      pool.rotation.x = -Math.PI / 2; pool.position.y = 0.6; fountain.add(pool);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 1.1, 20), stoneMat);
      pedestal.position.y = 1.05; fountain.add(pedestal);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.5, 0.32, 28), stoneMat);
      bowl.position.y = 1.72; fountain.add(bowl);
      const topSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.75, 14), stoneMat);
      topSpout.position.y = 2.25; fountain.add(topSpout);
      // Tia nước động
      const jets = [];
      for (let i = 0; i < 16; i++) {
        const jet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.05, transparent: true, opacity: 0.75 }));
        jet.userData.angle = (i / 16) * Math.PI * 2;
        jet.userData.phase = (i / 16);
        fountain.add(jet);
        jets.push(jet);
      }
      fountain.position.set(0, 0, 0);
      this.registerInteractable(fountain, 'pk_fountain');
      this.scene.add(fountain);
      this.animatedProps.push({
        type: 'fountain', jets, t: 0,
        update(delta) {
          this.t += delta;
          this.jets.forEach(j => {
            const p = (this.t * 0.9 + j.userData.phase) % 1;
            const r = 0.25 + p * 1.5;
            j.position.set(
              Math.cos(j.userData.angle) * r,
              2.65 + p * 1.0 - p * p * 2.3,
              Math.sin(j.userData.angle) * r
            );
            j.material.opacity = 0.8 * (1 - p);
          });
        }
      });

      // 4. HỒ NƯỚC (湖) + CẦU (橋)
      const lakeGroup = new THREE.Group();
      const lakeShape = new THREE.Mesh(new THREE.CircleGeometry(5.2, 44),
        new THREE.MeshStandardMaterial({ color: 0x6b5f45, roughness: 1 }));
      lakeShape.rotation.x = -Math.PI / 2;
      lakeShape.position.y = 0.015;
      lakeShape.scale.set(1.5, 1, 1);
      lakeGroup.add(lakeShape);
      const lakeWater = new THREE.Mesh(new THREE.CircleGeometry(5.0, 44), waterMat);
      lakeWater.rotation.x = -Math.PI / 2;
      lakeWater.position.y = 0.06;
      lakeWater.scale.set(1.5, 1, 1);
      lakeGroup.add(lakeWater);
      // Viền đá quanh hồ
      const rockCount = DEVICE.isMobile ? 14 : 30;
      for (let i = 0; i < rockCount; i++) {
        const a = (i / rockCount) * Math.PI * 2;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 + (i % 3) * 0.09, 0), stoneMat);
        rock.position.set(Math.cos(a) * 7.7, 0.12, Math.sin(a) * 5.15);
        rock.rotation.set(i, i * 0.7, i * 0.3);
        lakeGroup.add(rock);
      }
      lakeGroup.position.set(-9.5, 0, -6);
      this.registerInteractable(lakeGroup, 'pk_lake');
      this.scene.add(lakeGroup);

      const bridge = new THREE.Group();
      const bridgeWood = new THREE.MeshStandardMaterial({ color: 0x9a5b2c, roughness: 0.85 });
      for (let i = 0; i < 14; i++) {
        const t = i / 13;
        const plank = new THREE.Mesh(createRoundedBoxGeometry(1.9, 0.11, 0.42, 0.02, 2), bridgeWood);
        plank.position.set(0, 0.75 + Math.sin(t * Math.PI) * 0.75, -3.4 + i * 0.52);
        plank.rotation.x = Math.cos(t * Math.PI) * 0.28;
        plank.castShadow = true;
        bridge.add(plank);
      }
      [-0.98, 0.98].forEach(rx => {
        for (let i = 0; i < 8; i++) {
          const t = i / 7;
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.85, 8), bridgeWood);
          post.position.set(rx, 1.2 + Math.sin(t * Math.PI) * 0.75, -3.2 + i * 0.92);
          bridge.add(post);
        }
        const railTop = new THREE.Mesh(new THREE.TorusGeometry(3.85, 0.055, 8, 26, Math.PI), bridgeWood);
        railTop.position.set(rx, 0.85, 0.2);
        railTop.rotation.y = Math.PI / 2;
        railTop.scale.set(1, 0.22, 1);
        bridge.add(railTop);
      });
      bridge.position.set(-9.5, 0, -6);
      bridge.rotation.y = Math.PI / 2;
      this.registerInteractable(bridge, 'pk_bridge');
      this.scene.add(bridge);

      // 5. LUỐNG HOA (花)
      const flowerBed = new THREE.Group();
      const bedRing = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.22, 10, 34), stoneMat);
      bedRing.rotation.x = -Math.PI / 2;
      bedRing.position.y = 0.14;
      flowerBed.add(bedRing);
      const soil = new THREE.Mesh(new THREE.CircleGeometry(2.25, 32),
        new THREE.MeshStandardMaterial({ color: 0x5b4025, roughness: 1 }));
      soil.rotation.x = -Math.PI / 2; soil.position.y = 0.09; flowerBed.add(soil);
      const petalColors = [0xf472b6, 0xfbbf24, 0xef4444, 0xa78bfa, 0xfb923c, 0xfda4af];
      const flowerCount = DEVICE.isMobile ? 18 : 46;
      for (let i = 0; i < flowerCount; i++) {
        const a = i * 2.399;
        const r = 0.28 + Math.sqrt(i / flowerCount) * 1.85;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.36, 6),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }));
        stem.position.set(Math.cos(a) * r, 0.27, Math.sin(a) * r);
        flowerBed.add(stem);
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8),
          new THREE.MeshStandardMaterial({ color: petalColors[i % petalColors.length], roughness: 0.7 }));
        bloom.position.set(Math.cos(a) * r, 0.48, Math.sin(a) * r);
        flowerBed.add(bloom);
      }
      flowerBed.position.set(8.5, 0, 3.5);
      this.registerInteractable(flowerBed, 'pk_flower');
      this.scene.add(flowerBed);

      // 6. XÍCH ĐU (鞦韆)
      const swing = new THREE.Group();
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.4, metalness: 0.6 });
      [-1, 1].forEach(side => {
        [-1, 1].forEach(lean => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 2.9, 10), frameMat);
          leg.position.set(side * 1.75, 1.35, lean * 0.75);
          leg.rotation.x = -lean * 0.25;
          leg.castShadow = true;
          swing.add(leg);
        });
      });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 3.9, 12), frameMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.y = 2.72;
      swing.add(beam);
      const seats = [];
      [-0.85, 0.85].forEach(sx => {
        const seatGroup = new THREE.Group();
        [-0.22, 0.22].forEach(cx => {
          const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.75, 6),
            new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.35, metalness: 0.85 }));
          chain.position.set(cx, -0.88, 0);
          seatGroup.add(chain);
        });
        const seat = new THREE.Mesh(createRoundedBoxGeometry(0.62, 0.08, 0.28, 0.03, 2),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }));
        seat.position.y = -1.78;
        seatGroup.add(seat);
        seatGroup.position.set(sx, 2.72, 0);
        swing.add(seatGroup);
        seats.push(seatGroup);
      });
      swing.position.set(9.5, 0, -6.5);
      this.registerInteractable(swing, 'pk_swing');
      this.scene.add(swing);
      this.animatedProps.push({
        type: 'swing', seats, t: 0,
        update(delta) {
          this.t += delta;
          this.seats.forEach((s, i) => {
            s.rotation.x = Math.sin(this.t * 1.35 + i * 1.1) * 0.35;
          });
        }
      });

      // Cầu trượt nhỏ cạnh xích đu
      const slide = new THREE.Group();
      const slideMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.3 });
      const slideRamp = new THREE.Mesh(createRoundedBoxGeometry(0.9, 0.1, 3.4, 0.04, 2), slideMat);
      slideRamp.position.set(0, 1.05, 0.6);
      slideRamp.rotation.x = 0.5;
      slide.add(slideRamp);
      const platform = new THREE.Mesh(createRoundedBoxGeometry(1.0, 0.12, 1.0, 0.04, 2), slideMat);
      platform.position.set(0, 1.85, -1.2);
      slide.add(platform);
      [[-0.42, -1.6], [0.42, -1.6], [-0.42, -0.8], [0.42, -0.8]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.85, 8),
          new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4, metalness: 0.6 }));
        leg.position.set(lx, 0.92, lz);
        slide.add(leg);
      });
      slide.position.set(12.2, 0, -4.5);
      this.scene.add(slide);

      // 7. TƯỢNG ĐÁ (雕像)
      const statue = new THREE.Group();
      const pedestalS = new THREE.Mesh(createRoundedBoxGeometry(1.5, 1.15, 1.5, 0.05, 3), stoneMat);
      pedestalS.position.y = 0.58; pedestalS.castShadow = true; statue.add(pedestalS);
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.42),
        new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.35, metalness: 0.8 }));
      plaque.position.set(0, 0.68, 0.755); statue.add(plaque);
      const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.45 });
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.15, 16), marbleMat);
      torso.position.y = 1.75; torso.castShadow = true; statue.add(torso);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), marbleMat);
      head.position.y = 2.52; statue.add(head);
      const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.95, 12), marbleMat);
      armL.position.set(-0.42, 1.95, 0.05); armL.rotation.z = 0.75; statue.add(armL);
      const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.05, 12), marbleMat);
      armR.position.set(0.44, 2.15, 0.05); armR.rotation.z = -1.15; statue.add(armR);
      statue.position.set(-8.5, 0, 7.5);
      this.registerInteractable(statue, 'pk_statue');
      this.scene.add(statue);

      // 8. CHIM (鳥) đậu trên trụ & bay quanh
      const birdGroup = new THREE.Group();
      const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.9, 10),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
      perch.position.y = 0.95; birdGroup.add(perch);
      const feeder = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 }));
      feeder.position.y = 1.94; birdGroup.add(feeder);
      const roofF = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.45, 4),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }));
      roofF.rotation.y = Math.PI / 4; roofF.position.y = 2.5; birdGroup.add(roofF);
      const birds = [];
      [[0x38bdf8, -0.22], [0xfbbf24, 0.24]].forEach(([bc, bx]) => {
        const b = new THREE.Group();
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10),
          new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 }));
        body.scale.set(1.35, 1, 1); b.add(body);
        const bhead = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10),
          new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 }));
        bhead.position.set(0.16, 0.09, 0); b.add(bhead);
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 8),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 }));
        beak.position.set(0.25, 0.07, 0); beak.rotation.z = -Math.PI / 2; b.add(beak);
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6),
          new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 }));
        tail.position.set(-0.2, 0.02, 0); tail.rotation.z = Math.PI / 2; b.add(tail);
        b.position.set(bx, 2.1, 0);
        birdGroup.add(b);
        birds.push(b);
      });
      birdGroup.position.set(5.5, 0, 8.5);
      this.registerInteractable(birdGroup, 'pk_bird');
      this.scene.add(birdGroup);
      this.animatedProps.push({
        type: 'birds', birds, t: 0,
        update(delta) {
          this.t += delta;
          this.birds.forEach((b, i) => {
            b.position.y = 2.1 + Math.abs(Math.sin(this.t * 2.2 + i * 1.6)) * 0.09;
            b.rotation.y = Math.sin(this.t * 0.8 + i) * 0.6;
          });
        }
      });

      // 9. CÂY & GHẾ TRANG TRÍ QUANH CÔNG VIÊN
      const treeSpots = [
        [-13, 10], [-6, 12], [4, 12], [13, 9], [14, 1],
        [13, -12], [4, -13], [-4, -13], [-13, -12], [-14, 2]
      ];
      treeSpots.forEach(([tx, tz], i) => {
        const tree = this.makeTree(1.15 + (i % 3) * 0.18, 0x5c3a1e, [0x166534, 0x15803d, 0x22c55e][i % 3]);
        tree.position.set(tx, 0, tz);
        this.scene.add(tree);
      });

      const benchSpots = [[-4.2, 3.6, 0], [4.2, 3.6, 0], [-4.2, -3.6, Math.PI], [4.2, -3.6, Math.PI]];
      benchSpots.forEach(([bx, bz, ry]) => {
        this.placeZoneModel('pk_bench', { x: bx, y: 0, z: bz }, { targetHeight: 0.92, alignBottomY: true, rotationY: ry }, () => {
          const g = new THREE.Group();
          const woodM = new THREE.MeshStandardMaterial({ color: 0x9a6a3c, roughness: 0.85 });
          const seat = new THREE.Mesh(createRoundedBoxGeometry(1.7, 0.08, 0.5, 0.02, 2), woodM);
          seat.position.y = 0.45; g.add(seat);
          const back = new THREE.Mesh(createRoundedBoxGeometry(1.7, 0.5, 0.07, 0.02, 2), woodM);
          back.position.set(0, 0.72, -0.22); g.add(back);
          [-0.72, 0.72].forEach(lx => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.45, 0.46),
              new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 }));
            leg.position.set(lx, 0.22, -0.05); g.add(leg);
          });
          g.rotation.y = ry;
          return g;
        });
      });

      // Đèn công viên
      [[-6.5, 5.5], [6.5, 5.5], [-6.5, -6.5], [6.5, -9.5]].forEach(([lx, lz]) => {
        const lamp = this.makeStreetLamp();
        lamp.scale.set(0.72, 0.72, 0.72);
        lamp.position.set(lx, 0, lz);
        lamp.rotation.y = Math.atan2(-lx, -lz);
        this.scene.add(lamp);
      });

      // 10. CỔNG RA — QUAY LẠI ĐƯỜNG PHỐ
      const outGate = new THREE.Group();
      [[-2.2], [2.2]].forEach(([px]) => {
        const pillar = new THREE.Mesh(createRoundedBoxGeometry(0.85, 3.9, 0.85, 0.06, 3), stoneMat);
        pillar.position.set(px, 1.95, 0); outGate.add(pillar);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 }));
        cap.position.set(px, 4.05, 0); outGate.add(cap);
      });
      const outArch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 12, 28, Math.PI), stoneMat);
      outArch.position.set(0, 3.6, 0); outGate.add(outArch);
      const outSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.1 }));
      outSign.position.set(0, 4.3, 0.12); outGate.add(outSign);
      outGate.position.set(0, 0, 14.2);
      this.scene.add(outGate);
      this.registerGate(outGate, 'back_door', 'street', { direction: 'back' });

      // Hàng rào bao quanh công viên
      const fenceMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.7 });
      const buildFenceRun = (x0, z0, x1, z1) => {
        const dx = x1 - x0, dz = z1 - z0;
        const len = Math.hypot(dx, dz);
        const n = Math.max(2, Math.round(len / (DEVICE.isMobile ? 1.5 : 0.62)));
        for (let i = 0; i <= n; i++) {
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 8), fenceMat);
          bar.position.set(x0 + dx * (i / n), 0.85, z0 + dz * (i / n));
          this.scene.add(bar);
        }
      };
      buildFenceRun(-15.5, 14.5, -2.6, 14.5);
      buildFenceRun(2.6, 14.5, 15.5, 14.5);
      buildFenceRun(-15.5, -15.5, 15.5, -15.5);
      buildFenceRun(-15.5, 14.5, -15.5, -15.5);
      buildFenceRun(15.5, 14.5, 15.5, -15.5);

      this.buildPlayerAvatar();

      this.colliders = [
        { name: 'fountain',  minX: -3.4,  maxX: 3.4,   minZ: -3.4,  maxZ: 3.4 },
        { name: 'lake',      minX: -17.5, maxX: -1.6,  minZ: -11.2, maxZ: -0.8 },
        { name: 'flowerbed', minX: 6.2,   maxX: 10.8,  minZ: 1.2,   maxZ: 5.8 },
        { name: 'statue',    minX: -9.4,  maxX: -7.6,  minZ: 6.6,   maxZ: 8.4 },
        { name: 'swing',     minX: 7.6,   maxX: 11.4,  minZ: -7.6,  maxZ: -5.4 },
        { name: 'slide',     minX: 11.4,  maxX: 13.0,  minZ: -6.4,  maxZ: -2.6 }
      ];
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

      // Tường phải chừa một ô cửa dẫn sang phòng bếp (tại z = 2.6)
      const kDoorZ = 2.6;
      const kGapW = 1.5;
      const kGapH = 2.85;
      const rightSegA = (roomL / 2 + kDoorZ - kGapW / 2);
      const rightWallA = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH, rightSegA), whitePlasterMat);
      rightWallA.position.set(roomW / 2, roomH / 2, -roomL / 2 + rightSegA / 2);
      this.scene.add(rightWallA);
      const rightSegB = (roomL / 2 - kDoorZ - kGapW / 2);
      const rightWallB = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH, rightSegB), whitePlasterMat);
      rightWallB.position.set(roomW / 2, roomH / 2, roomL / 2 - rightSegB / 2);
      this.scene.add(rightWallB);
      const rightWallTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, roomH - kGapH, kGapW), whitePlasterMat);
      rightWallTop.position.set(roomW / 2, roomH - (roomH - kGapH) / 2, kDoorZ);
      this.scene.add(rightWallTop);

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
      this.registerInteractable(tvGroup, 'lr_tv');
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

      const leftCabinet = buildDisplayCabinet(-1);
      buildDisplayCabinet(1);
      this.registerInteractable(leftCabinet, 'lr_bookcase');

      // --- POPULATE LEFT DISPLAY SHELVES (x = -3.4, z = -4.62) ---
      const lCabX = -3.4;
      const lCabZ = -roomL / 2 + 0.38;

      // Shelf 1 (y = 0.72): Books & Vintage Radio
      placeModel('lr_books', { x: lCabX - 0.35, y: 0.72, z: lCabZ }, { targetHeight: 0.38, alignBottomY: true });
      const radioProp = placeModel('lr_radio', { x: lCabX + 0.32, y: 0.72, z: lCabZ }, { targetHeight: 0.26, alignBottomY: true }, () => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(createRoundedBoxGeometry(0.34, 0.22, 0.16, 0.03, 3), new THREE.MeshStandardMaterial({ color: 0x7c4a21, roughness: 0.5 }));
        body.position.y = 0.11; g.add(body);
        const grille = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.14), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 }));
        grille.position.set(-0.07, 0.11, 0.081); g.add(grille);
        const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), goldMat);
        dial.rotation.x = Math.PI / 2; dial.position.set(0.09, 0.11, 0.082); g.add(dial);
        return g;
      });
      if (radioProp) this.registerInteractable(radioProp, 'lr_radio');

      // Shelf 2 (y = 1.42): Teddy Bear & Potted Plant
      const bearProp = placeModel('lr_bear', { x: lCabX - 0.28, y: 1.42, z: lCabZ }, { targetHeight: 0.42, alignBottomY: true, rotationY: 0.2 }, () => {
        const g = new THREE.Group();
        const furMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.95 });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), furMat);
        body.position.y = 0.14; body.scale.y = 1.15; g.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), furMat);
        head.position.y = 0.33; g.add(head);
        [[-0.07, 0.40], [0.07, 0.40]].forEach(([ex, ey]) => {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), furMat);
          ear.position.set(ex, ey, 0); g.add(ear);
        });
        return g;
      });
      if (bearProp) this.registerInteractable(bearProp, 'lr_bear');
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
      const rugGroup = new THREE.Group();
      rugGroup.add(rugMesh);
      rugMesh.position.set(0, 0.006, 0);
      rugGroup.position.set(0, 0, -1.0);
      this.registerInteractable(rugGroup, 'lr_rug');
      this.scene.add(rugGroup);

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
      this.registerInteractable(tableGroup, 'lr_coffeeTable');
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
      this.registerInteractable(sofaGroup, 'lr_sofa');
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
        pillowMesh.rotation.z = -0.18;
        if (Math.abs(pz + 1.0) < 0.01) {
          const pillowGroup = new THREE.Group();
          pillowGroup.add(pillowMesh);
          pillowMesh.position.set(0, 0.58, 0);
          pillowGroup.position.set(-2.85, 0, pz);
          this.registerInteractable(pillowGroup, 'lr_pillow');
          this.scene.add(pillowGroup);
        } else {
          pillowMesh.position.set(-2.85, 0.58, pz);
          this.scene.add(pillowMesh);
        }
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
      this.registerInteractable(arm1, 'lr_armchair');
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
      const vaseProp = placeModel('lr_plant',
        { x: 2.9, y: 0.65, z: -1.0 },
        { targetHeight: 0.45, alignBottomY: true },
        () => {
          const g = new THREE.Group();
          const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.26, 20), new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.25 }));
          vase.position.y = 0.13; g.add(vase);
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0x15803d }));
            stem.position.set(Math.cos(a) * 0.03, 0.35, Math.sin(a) * 0.03);
            stem.rotation.z = Math.cos(a) * 0.2; stem.rotation.x = Math.sin(a) * 0.2;
            g.add(stem);
            const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshStandardMaterial({ color: [0xf472b6, 0xfbbf24, 0xf87171, 0xa78bfa, 0xfda4af][i], roughness: 0.7 }));
            bloom.position.set(Math.cos(a) * 0.06, 0.47, Math.sin(a) * 0.06);
            g.add(bloom);
          }
          return g;
        }
      );
      if (vaseProp) this.registerInteractable(vaseProp, 'lr_vase');

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
      this.registerInteractable(chandeGroup, 'lr_chandelier');
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
        if (p.theme === 1) this.registerInteractable(artGroup, 'lr_painting');
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
      this.registerGate(backDoorGroup, 'back_door', 'bedroom', { direction: 'back' });

      // =========================================================================
      // 10. TƯỜNG PHẢI: LỐI ĐI SANG PHÒNG BẾP (khoá tới khi khám phá xong)
      // =========================================================================
      const kitchenDoorGroup = new THREE.Group();
      const kdRaw = this.loadedModels['lr_door'];
      if (kdRaw) {
        const kdMesh = this.fitModelToBounds(kdRaw, { targetHeight: kGapH, alignBottomY: true });
        if (kdMesh) kitchenDoorGroup.add(kdMesh);
      } else {
        [[-0.72, 0], [0.72, 0]].forEach(([px]) => {
          const post = new THREE.Mesh(createRoundedBoxGeometry(0.1, kGapH, 0.14, 0.02, 2), darkWoodMat);
          post.position.set(px, kGapH / 2, 0); kitchenDoorGroup.add(post);
        });
        const kdTop = new THREE.Mesh(createRoundedBoxGeometry(1.54, 0.12, 0.14, 0.02, 2), darkWoodMat);
        kdTop.position.set(0, kGapH - 0.06, 0); kitchenDoorGroup.add(kdTop);
      }
      // Biển hiệu phòng bếp 廚房
      const kdSignBox = new THREE.Mesh(createRoundedBoxGeometry(0.82, 0.24, 0.06, 0.02, 2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
      kdSignBox.position.set(0, kGapH + 0.2, 0.05);
      kitchenDoorGroup.add(kdSignBox);
      const kdSign = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.17),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.2 }));
      kdSign.position.set(0, kGapH + 0.2, 0.085);
      kdSign.userData.isGateSign = true;
      kitchenDoorGroup.add(kdSign);
      const kdLight = new THREE.PointLight(0xef4444, 0.6, 3.2, 1.5);
      kdLight.position.set(0, kGapH + 0.25, 0.3);
      kdLight.userData.isGateLight = true;
      kitchenDoorGroup.add(kdLight);
      // Ánh sáng ấm hắt ra từ bếp
      const kitchenGlow = new THREE.PointLight(0xffd9a0, 0.9, 5, 1.6);
      kitchenGlow.position.set(0.5, 1.6, 0);
      kitchenDoorGroup.add(kitchenGlow);

      kitchenDoorGroup.rotation.y = -Math.PI / 2;
      kitchenDoorGroup.position.set(roomW / 2 - 0.12, 0, kDoorZ);
      this.scene.add(kitchenDoorGroup);
      this.registerGate(kitchenDoorGroup, 'kitchen_door', 'kitchen', { requireComplete: true });
      this.applyGateLockVisual(kitchenDoorGroup, 'living');

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

      // Nút xác nhận → lưu lựa chọn, ẩn màn chọn và vào game ngay lập tức
      if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
          if (!this._pendingAvatar) return;
          this.changeAvatar(this._pendingAvatar);
          this.switchScreen('game');
          this.startZoneSession();
        });
      }

      // Nút quay lại → trở về trang chủ
      if (btnBack) {
        btnBack.addEventListener('click', () => {
          this.switchScreen('start');
        });
      }
    }

    // Đổi nhân vật: cập nhật state, lưu storage, reload model nếu cần
    changeAvatar(avatarKey) {
      if (!AVATAR_FILES[avatarKey]) return;
      this.state.selectedAvatar = avatarKey;
      this.state.saveStorage();
      this.updateProgressUI();

      const newFile = AVATAR_FILES[avatarKey];
      if (newFile !== PLAYER_AVATAR_FILE) {
        PLAYER_AVATAR_FILE = newFile;
        MODEL_FILES.player_avatar = newFile;

        // Xoá cache rig cũ để build lại với model mới
        this._avatarRig = undefined;
        this._avatarRigCacheMap = {};
        delete this._modelJobs['player_avatar'];
        delete this.loadedModels['player_avatar'];

        // Tải model mới và rebuild nhân vật nếu scene đã sẵn sàng
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
    }

    switchScreen(screenName) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      window.scrollTo(0, 0);
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

    // Chơi lại từ đầu: quay về phòng ngủ và phát lại cảnh thức dậy
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

    // Bắt đầu phiên chơi trong khu vực hiện tại
    startZoneSession() {
      // Lần đầu vào phòng ngủ trong phiên này → phát cảnh thức dậy
      if (this.currentZone === 'bedroom' && !this.state.hasWokenUp && !this.state.isZoneComplete('bedroom')) {
        this.startWakeUpSequence();
        this.requestPointerLock();
        return;
      }
      this.requestPointerLock();
      this.showObjectiveBanner(this.currentZone);
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
      const zoneOfItem = ZONES[data.zone];
      if (isNew) {
        discText.textContent = data.isGate
          ? '🚪 Đã ghi lối đi này vào sổ tay (+20 điểm)'
          : '✨ Mới phát hiện! +100 Điểm vào sổ tay';
      } else {
        discText.textContent = '✓ Đã từng khám phá đồ vật này';
      }
      const zoneTag = document.getElementById('modalZoneTag');
      if (zoneTag && zoneOfItem) {
        zoneTag.textContent = `${zoneOfItem.icon} ${zoneOfItem.name} • ${this.state.zoneFoundCount(zoneOfItem.id)}/${this.state.zoneTotal(zoneOfItem.id)}`;
      } else if (zoneTag) {
        zoneTag.textContent = '🚪 Lối đi';
      }

      // Setup Mini Quiz
      this.renderMiniQuiz(data.quiz);

      // Render 3D Isolated Model in Inspector
      const modal = document.getElementById('vocabModal');
      modal.classList.add('active');
      if (document.exitPointerLock) document.exitPointerLock();

      setTimeout(() => {
        if (this.objectMeshFactories[vocabId]) {
          this.inspector.showObject(this.objectMeshFactories[vocabId]);
        } else {
          // Từ vựng thuộc khu vực khác — hiện thẻ chữ Hán 3D thay cho mô hình
          this.inspector.showPlaceholder(data);
        }
      }, 50);

      // Auto pronounce word on open
      setTimeout(() => {
        this.speakText(data.chinese, 'zh-TW');
      }, 350);

      // Vừa hoàn thành khu vực hiện tại → mở khoá cửa & báo cho người chơi
      if (isNew && !data.isGate && data.zone === this.currentZone && this.state.isZoneComplete(this.currentZone)) {
        this.onZoneCompleted(this.currentZone);
      }

      // Hoàn thành toàn bộ hành trình
      if (isNew && this.state.isAllComplete()) {
        setTimeout(() => {
          this.showVictoryScreen();
        }, 1400);
      }
    }

    // Khi khám phá xong một khu vực: mở khoá cửa, đổi đèn báo, thông báo
    onZoneCompleted(zoneId) {
      const zone = ZONES[zoneId];
      if (!zone) return;
      this.state.syncUnlockedZones();
      this.state.saveStorage();

      // Đổi đèn báo trên mọi cánh cửa của khu vực này sang xanh
      this.interactiveObjects.forEach(obj => {
        if (obj.userData && obj.userData.lockVisualZone === zoneId) {
          this.applyGateLockVisual(obj, zoneId);
        }
      });

      const nextZone = zone.next ? ZONES[zone.next] : null;
      setTimeout(() => {
        this.state.soundFX.playVictory();
        if (nextZone) {
          this.showToast(
            `🎉 Hoàn thành <b>${zone.name}</b> (${zone.chinese})! Cửa đã mở khoá.<br>` +
            `<span class="toast-sub">Hãy tới ${nextZone.icon} ${nextZone.name} (${nextZone.chinese} – ${nextZone.pinyin})</span>`,
            'unlock', 5200
          );
        } else {
          this.showToast(`🏆 Bạn đã khám phá trọn vẹn <b>${zone.name}</b>!`, 'unlock', 5000);
        }
      }, 700);
      this.updateZoneHud();
    }

    closeVocabModal(silent = false) {
      const modal = document.getElementById('vocabModal');
      modal.classList.remove('active');
      this.state.activeItem = null;
      if (!silent) this.requestPointerLock();
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

    // Sổ tay từ vựng — nhóm theo từng khu vực trong hành trình
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
          <span class="dz-icon">${unlocked ? zone.icon : '🔒'}</span>
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
      });
    }

    // Cập nhật tên khu vực + nhiệm vụ trên HUD
    updateZoneHud() {
      const zone = ZONES[this.currentZone];
      if (!zone) return;
      const found = this.state.zoneFoundCount(zone.id);
      const total = this.state.zoneTotal(zone.id);
      const remaining = total - found;

      const nameEl = document.getElementById('hudRoomName');
      if (nameEl) nameEl.innerHTML = `${zone.name} <span class="hud-zone-cn">${zone.chinese}</span>`;
      const iconEl = document.getElementById('hudRoomIcon');
      if (iconEl) iconEl.textContent = zone.icon;

      const stepEl = document.getElementById('hudZoneStep');
      if (stepEl) stepEl.textContent = `Chặng ${ZONE_ORDER.indexOf(zone.id) + 1}/${ZONE_ORDER.length}`;

      const taskEl = document.getElementById('hudZoneTask');
      if (taskEl) {
        if (remaining > 0) {
          taskEl.innerHTML = `🎯 Còn <b>${remaining}</b> đồ vật cần khám phá`;
          taskEl.className = 'hud-zone-task';
        } else if (zone.next) {
          taskEl.innerHTML = `✅ Đã xong! Tới ${ZONES[zone.next].icon} ${ZONES[zone.next].name}`;
          taskEl.className = 'hud-zone-task done';
        } else {
          taskEl.innerHTML = `🏆 Hoàn thành toàn bộ hành trình!`;
          taskEl.className = 'hud-zone-task done';
        }
      }

      // Chuỗi chặng đường ở đầu màn hình
      const trackEl = document.getElementById('hudZoneTrack');
      if (trackEl) {
        trackEl.innerHTML = ZONE_ORDER.map(zid => {
          const z = ZONES[zid];
          const done = this.state.isZoneComplete(zid);
          const active = zid === this.currentZone;
          const locked = !this.state.unlockedZones.has(zid);
          const cls = ['zt-node', active ? 'active' : '', done ? 'done' : '', locked ? 'locked' : ''].filter(Boolean).join(' ');
          return `<span class="${cls}" title="${z.name} (${z.chinese})">${locked ? '🔒' : z.icon}</span>`;
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

      // Start Screen Stats — tiến độ toàn hành trình
      set('totalDiscoveredStats', `${totalFound}/${TOTAL_VOCAB_COUNT}`);
      set('totalScoreStats', this.state.score);
      const fill = document.getElementById('level1ProgressFill');
      if (fill) fill.style.width = `${totalPct}%`;
      set('level1ProgressText', `Đã tìm: ${totalFound}/${TOTAL_VOCAB_COUNT} (${totalPct}%)`);
      set('startZoneName', `${zone.icon} ${zone.name}`);

      // Hiển thị nhân vật đã chọn
      const avatarName = this.state.selectedAvatar === 'woman' ? '👩 Nữ Sinh' : (this.state.selectedAvatar === 'man' ? '🧑 Nam Sinh' : 'Chưa chọn');
      set('startAvatarName', avatarName);

      // Gameplay HUD — tiến độ khu vực đang đứng
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

    // ======================================================================
    // CẢNH MỞ ĐẦU: THỨC DẬY TRÊN GIƯỜNG
    // ======================================================================
    startWakeUpSequence() {
      this.isWakingUp = true;
      this.wakeUpTimer = 0;
      this.state.hasWokenUp = true;

      // Nằm trên giường: camera thấp, hơi nghiêng, ban đầu nhìn lên trần
      this.player.pos.set(3.6, 0, -3.0);
      this.player.yaw = Math.PI * 0.78;
      this.player.pitch = 0.80;
      this.wakeCameraY = 0.98;

      // Ẩn tâm ngắm & khung tương tác trong lúc đang mở mắt
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
        setTimeout(() => {
          if (lids) lids.className = `wakeup-eyelids active lid-${step.blink}`;
        }, step.at * 1000);
      });

      setTimeout(() => {
        this.showToast(
          '🌅 <b>早安！</b> (zǎo ān – Chào buổi sáng!)<br>' +
          '<span class="toast-sub">Bạn vừa thức dậy trong phòng ngủ của mình.</span>',
          'wake', 4200
        );
      }, 2000);

      // Ngồi dậy & đứng lên khỏi giường
      setTimeout(() => {
        if (lids) lids.classList.remove('active');
        this.isWakingUp = false;
        this.wakeCameraY = null;
        const spawn = ZONES.bedroom.spawn;
        this.player.pos.set(spawn.x, 0, spawn.z);
        this.player.yaw = spawn.yaw;
        this.player.pitch = 0.05;
        this.showObjectiveBanner('bedroom');
        this.state.saveStorage();
      }, 4200);
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
      // Trong cảnh thức dậy: khoá di chuyển, camera nằm thấp trên giường
      if (this.isWakingUp) {
        this.wakeUpTimer += delta;
        const sway = Math.sin(this.wakeUpTimer * 0.9) * 0.03;
        this.camera.position.set(this.player.pos.x, this.wakeCameraY || 0.62, this.player.pos.z);
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.player.yaw + sway;
        // Ngóc đầu dậy dần: hạ tầm nhìn từ trần nhà xuống ngang phòng
        const t = Math.min(1, this.wakeUpTimer / 4.0);
        this.camera.rotation.x = this.player.pitch * (1 - t * 0.92);
        this.camera.rotation.z = 0.3 * (1 - t);
        if (this.playerMesh) this.playerMesh.visible = false;
        return;
      }
      this.camera.rotation.z = 0;

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
        // Idle breathing and resetting limbs
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

      // --- RIGHT ARM DYNAMIC AIMING AT CROSSHAIR (UP/DOWN PITCH SYNC) ---
      // Chỉ áp dụng cho nhân vật hình khối cũ; nhân vật GLB vung tay tự nhiên khi đi
      if (!this.avatarIsSkinned && this.playerBones.rightArm) {
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

        // Giới hạn camera theo đúng biên của khu vực đang chơi (tránh xuyên tường)
        const cb = this.roomBounds || { minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 };
        const isOutdoorZone = (this.currentZone === 'street' || this.currentZone === 'park');
        const margin = isOutdoorZone ? 2.5 : 0.05; // ngoài trời camera được lùi ra xa hơn
        camX = THREE.MathUtils.clamp(camX, cb.minX - margin, cb.maxX + margin);
        camZ = THREE.MathUtils.clamp(camZ, cb.minZ - margin, cb.maxZ + margin);
        camY = THREE.MathUtils.clamp(camY, 0.35, isOutdoorZone ? 6.5 : 3.9);

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
      if (this.isWakingUp || this.isTransitioning) return;

      const isOutdoor = (this.currentZone === 'street' || this.currentZone === 'park');
      const reach = isOutdoor ? 8.5 : 4.6;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      raycaster.far = reach + (this.cameraMode === 'third_person' ? this.cameraDistance + 1.2 : 1.5);

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
          // Đo từ người chơi tới điểm chạm thực tế → vật thể lớn (đường, toà nhà) vẫn bắt được
          const hit = intersects[0].point;
          const distToPlayer = Math.hypot(hit.x - this.player.pos.x, hit.z - this.player.pos.z);
          if (distToPlayer < reach) {
            foundTarget = root;
          }
        }
      }

      // Proximity assist for Third-Person Mode
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
          this.targetedObject = foundTarget;
          this.crosshair.classList.add('active');
          this.promptEl.classList.add('visible');
          const ud = foundTarget.userData;
          if (ud.gateTarget) {
            const tz = ZONES[ud.gateTarget];
            const gd = ud.vocabData;
            const locked = ud.gateLocked && this.state.zoneRemaining(this.currentZone) > 0;
            if (ud.gateDirection === 'back') {
              this.promptTargetName.innerHTML =
                `↩️ ${gd ? gd.chinese : ''} • [E / Click] Quay lại ${tz ? tz.name : ''}`;
            } else if (locked) {
              this.promptTargetName.innerHTML =
                `🔒 ${gd ? gd.chinese + ' (' + gd.pinyin + ')' : ''} • Còn <b>${this.state.zoneRemaining(this.currentZone)}</b> đồ vật chưa khám phá`;
            } else {
              this.promptTargetName.innerHTML =
                `${gd ? gd.chinese + ' (' + gd.pinyin + ')' : ''} • [E / Click] ${tz ? tz.icon + ' Tới ' + tz.name : 'Đi tiếp'}`;
            }
          } else {
            const found = this.state.discovered.has(ud.vocabId);
            this.promptTargetName.innerHTML =
              `${found ? '✅ ' : '✨ '}${ud.vocabData.chinese} (${ud.vocabData.nameVi})`;
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
      // 0. Props động của từng khu vực (đèn giao thông, đài phun nước, xích đu, chim…)
      if (this.animatedProps && this.animatedProps.length) {
        this.animatedProps.forEach(p => {
          if (typeof p.update === 'function') p.update(delta);
        });
      }

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
    // Dữ liệu hành trình để tiện tra cứu / gỡ lỗi từ console
    window.VOCAB_DATA = ROOM_VOCAB_DATA;
    window.ZONES = ZONES;
    window.ZONE_ORDER = ZONE_ORDER;
    window.TOTAL_VOCAB_COUNT = TOTAL_VOCAB_COUNT;
  });

})();
