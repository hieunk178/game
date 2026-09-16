/**
 * ============================================================================
 * VOCABULARY DATABASE — 5 KHU VỰC TRONG HÀNH TRÌNH
 * Phòng ngủ → Phòng khách → Phòng bếp → Đường phố → Công viên
 * ============================================================================
 */

import { getSvgIcon } from '../ui/icons.js';

// --- ZONE 1: PHÒNG NGỦ (臥室) ---
export const BEDROOM_VOCAB = {
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
  },
  monitor: {
    id: 'monitor',
    nameVi: 'Màn hình máy tính',
    chinese: '螢幕',
    pinyin: 'yíng mù',
    english: 'Monitor / Screen',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
    meaning: 'Màn hình hiển thị của máy tính, dùng để xem hình ảnh và làm việc.',
    exampleCn: '這台螢幕很大，打電動很過癮。',
    examplePinyin: 'Zhè tái yíngmù hěn dà, dǎ diàndòng hěn guòyǐn.',
    exampleVi: 'Cái màn hình này rất to, chơi game rất đã.',
    category: 'Thiết bị công nghệ',
    icon: '🖥️',
    quiz: {
      question: 'Từ "螢幕" (yíngmù) có nghĩa là gì?',
      options: ['Màn hình', 'Bàn phím', 'Máy in'],
      correct: 0
    }
  },
  keyboard: {
    id: 'keyboard',
    nameVi: 'Bàn phím',
    chinese: '鍵盤',
    pinyin: 'jiàn pán',
    english: 'Keyboard',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
    meaning: 'Bàn phím máy tính, dùng để gõ chữ và nhập dữ liệu.',
    exampleCn: '我的鍵盤打起來很安靜。',
    examplePinyin: 'Wǒ de jiànpán dǎ qǐlái hěn ānjìng.',
    exampleVi: 'Bàn phím của tôi gõ rất êm.',
    category: 'Thiết bị công nghệ',
    icon: '⌨️',
    quiz: {
      question: 'Muốn gõ chữ vào máy tính, bạn dùng "鍵盤" — đó là gì?',
      options: ['Bàn phím', 'Chuột máy tính', 'Tai nghe'],
      correct: 0
    }
  },
  wardrobe: {
    id: 'wardrobe',
    nameVi: 'Tủ quần áo',
    chinese: '衣櫃',
    pinyin: 'yī guì',
    english: 'Wardrobe / Closet',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
    meaning: 'Tủ đứng dùng để treo và cất quần áo trong phòng ngủ.',
    exampleCn: '我的衣服都掛在衣櫃裡。',
    examplePinyin: 'Wǒ de yīfú dōu guà zài yīguì lǐ.',
    exampleVi: 'Quần áo của tôi đều treo trong tủ.',
    category: 'Nội thất & Đồ dùng',
    icon: '🚪',
    quiz: {
      question: 'Từ "衣櫃" (yīguì) dùng để cất gì?',
      options: ['Quần áo', 'Sách vở', 'Bát đĩa'],
      correct: 0
    }
  },
  curtain: {
    id: 'curtain',
    nameVi: 'Rèm cửa',
    chinese: '窗簾',
    pinyin: 'chuāng lián',
    english: 'Curtain',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 幅 (fú) / 個 (ge)',
    meaning: 'Rèm che cửa sổ, dùng để chắn nắng và giữ sự riêng tư.',
    exampleCn: '早上我會拉開窗簾讓陽光進來。',
    examplePinyin: 'Zǎoshang wǒ huì lākāi chuānglián ràng yángguāng jìnlái.',
    exampleVi: 'Buổi sáng tôi sẽ kéo rèm ra cho nắng vào.',
    category: 'Nội thất & Đồ dùng',
    icon: '🪟',
    quiz: {
      question: 'Từ "窗簾" (chuānglián) là đồ vật gắn ở đâu?',
      options: ['Ở cửa sổ', 'Trên bàn học', 'Dưới sàn nhà'],
      correct: 0
    }
  },
  rug: {
    id: 'rug',
    nameVi: 'Thảm trải sàn',
    chinese: '地毯',
    pinyin: 'dì tǎn',
    english: 'Rug / Carpet',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 塊 (kuài) / 張 (zhāng)',
    meaning: 'Tấm thảm trải trên sàn nhà cho ấm chân và đẹp phòng.',
    exampleCn: '這塊地毯又軟又暖和。',
    examplePinyin: 'Zhè kuài dìtǎn yòu ruǎn yòu nuǎnhuo.',
    exampleVi: 'Tấm thảm này vừa mềm vừa ấm.',
    category: 'Nội thất & Đồ dùng',
    icon: '🧶',
    quiz: {
      question: 'Từ "地毯" (dìtǎn) được đặt ở đâu?',
      options: ['Trên sàn nhà', 'Trên trần nhà', 'Trong tủ lạnh'],
      correct: 0
    }
  }
};

// --- ZONE 2: PHÒNG KHÁCH (客廳) ---
export const LIVING_VOCAB = {
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
export const KITCHEN_VOCAB = {
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
export const STREET_VOCAB = {
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
export const PARK_VOCAB = {
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

// --- CỬA & LỐI ĐI GIỮA CÁC KHU VỰC ---
// ============================================================================
// KHU VỰC 5: CỬA HÀNG TIỆN LỢI (便利商店 - CONVENIENCE STORE)
// ============================================================================
export const STORE_VOCAB = {
  sh_shelf: {
    id: 'sh_shelf',
    nameVi: 'Kệ hàng',
    chinese: '貨架',
    pinyin: 'huò jià',
    english: 'Shelf / Rack',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge) / 排 (pái)',
    meaning: 'Giá kệ trong cửa hàng dùng để bày biện và sắp xếp hàng hoá.',
    exampleCn: '貨架上擺滿了各種商品。',
    examplePinyin: 'Huòjià shàng bǎi mǎn le gèzhǒng shāngpǐn.',
    exampleVi: 'Trên kệ hàng bày đầy đủ mọi loại hàng hoá.',
    category: 'Cửa hàng tiện lợi',
    icon: '🗄️',
    quiz: {
      question: '"貨架" (huòjià) là gì?',
      options: ['Kệ bày hàng', 'Xe đẩy hàng', 'Kho chứa hàng'],
      correct: 0
    }
  },
  sh_fridge: {
    id: 'sh_fridge',
    nameVi: 'Tủ mát đồ uống',
    chinese: '冰櫃',
    pinyin: 'bīng guì',
    english: 'Cooler / Refrigerated Case',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái) / 個 (ge)',
    meaning: 'Tủ kính làm lạnh đặt sát tường để giữ đồ uống và thực phẩm luôn mát.',
    exampleCn: '冰櫃裡的飲料很冰。',
    examplePinyin: 'Bīngguì lǐ de yǐnliào hěn bīng.',
    exampleVi: 'Đồ uống trong tủ mát rất lạnh.',
    category: 'Cửa hàng tiện lợi',
    icon: '🧊',
    quiz: {
      question: '"冰" (bīng) trong "冰櫃" mang nghĩa gì?',
      options: ['Lạnh / băng', 'Nóng', 'Khô'],
      correct: 0
    }
  },
  sh_drink: {
    id: 'sh_drink',
    nameVi: 'Đồ uống',
    chinese: '飲料',
    pinyin: 'yǐn liào',
    english: 'Drink / Beverage',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 瓶 (píng) / 罐 (guàn)',
    meaning: 'Các loại nước giải khát đóng chai, đóng lon bán trong cửa hàng.',
    exampleCn: '我想買一瓶飲料。',
    examplePinyin: 'Wǒ xiǎng mǎi yì píng yǐnliào.',
    exampleVi: 'Tôi muốn mua một chai nước.',
    category: 'Cửa hàng tiện lợi',
    icon: '🥤',
    quiz: {
      question: 'Lượng từ "瓶" (píng) dùng cho vật gì?',
      options: ['Chai / lọ', 'Cái bàn', 'Con cá'],
      correct: 0
    }
  },
  sh_noodle: {
    id: 'sh_noodle',
    nameVi: 'Mì ăn liền',
    chinese: '泡麵',
    pinyin: 'pào miàn',
    english: 'Instant Noodles',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 碗 (wǎn) / 包 (bāo)',
    meaning: 'Mì ăn liền chỉ cần chế nước sôi là ăn được — món quen thuộc ở cửa hàng tiện lợi.',
    exampleCn: '泡麵要用熱水泡三分鐘。',
    examplePinyin: 'Pàomiàn yào yòng rèshuǐ pào sān fēnzhōng.',
    exampleVi: 'Mì ăn liền phải chế nước nóng ba phút.',
    category: 'Cửa hàng tiện lợi',
    icon: '🍜',
    quiz: {
      question: '"泡" (pào) trong "泡麵" nghĩa là gì?',
      options: ['Ngâm / chế nước', 'Chiên', 'Nướng'],
      correct: 0
    }
  },
  sh_bread: {
    id: 'sh_bread',
    nameVi: 'Bánh mì',
    chinese: '麵包',
    pinyin: 'miàn bāo',
    english: 'Bread',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge) / 條 (tiáo)',
    meaning: 'Bánh mì đóng gói sẵn bày trên kệ, thường dùng cho bữa sáng nhanh.',
    exampleCn: '我早餐吃了一個麵包。',
    examplePinyin: 'Wǒ zǎocān chī le yí ge miànbāo.',
    exampleVi: 'Bữa sáng tôi ăn một cái bánh mì.',
    category: 'Cửa hàng tiện lợi',
    icon: '🍞',
    quiz: {
      question: '"早餐" (zǎocān) là bữa nào?',
      options: ['Bữa sáng', 'Bữa trưa', 'Bữa tối'],
      correct: 0
    }
  },
  sh_snack: {
    id: 'sh_snack',
    nameVi: 'Đồ ăn vặt',
    chinese: '零食',
    pinyin: 'líng shí',
    english: 'Snacks',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 包 (bāo) / 袋 (dài)',
    meaning: 'Bánh kẹo, snack ăn vặt đóng gói bày kín một dãy kệ trong cửa hàng.',
    exampleCn: '別吃太多零食。',
    examplePinyin: 'Bié chī tài duō língshí.',
    exampleVi: 'Đừng ăn quá nhiều đồ ăn vặt.',
    category: 'Cửa hàng tiện lợi',
    icon: '🍪',
    quiz: {
      question: '"別" (bié) đứng đầu câu mang nghĩa gì?',
      options: ['Đừng / chớ', 'Hãy', 'Rất'],
      correct: 0
    }
  },
  sh_counter: {
    id: 'sh_counter',
    nameVi: 'Quầy thu ngân',
    chinese: '收銀台',
    pinyin: 'shōu yín tái',
    english: 'Checkout Counter',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge) / 座 (zuò)',
    meaning: 'Quầy nơi nhân viên tính tiền và khách hàng thanh toán trước khi ra về.',
    exampleCn: '請到收銀台結帳。',
    examplePinyin: 'Qǐng dào shōuyíntái jiézhàng.',
    exampleVi: 'Mời bạn ra quầy thu ngân thanh toán.',
    category: 'Cửa hàng tiện lợi',
    icon: '🧾',
    quiz: {
      question: '"結帳" (jiézhàng) nghĩa là gì?',
      options: ['Thanh toán tiền', 'Gói hàng', 'Đổi hàng'],
      correct: 0
    }
  },
  sh_register: {
    id: 'sh_register',
    nameVi: 'Máy tính tiền',
    chinese: '收銀機',
    pinyin: 'shōu yín jī',
    english: 'Cash Register',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 台 (tái)',
    meaning: 'Máy tính tiền đặt trên quầy, dùng quét mã vạch và in hoá đơn cho khách.',
    exampleCn: '店員在收銀機前刷條碼。',
    examplePinyin: 'Diànyuán zài shōuyínjī qián shuā tiáomǎ.',
    exampleVi: 'Nhân viên quét mã vạch trước máy tính tiền.',
    category: 'Cửa hàng tiện lợi',
    icon: '🖨️',
    quiz: {
      question: '"店員" (diànyuán) là ai?',
      options: ['Nhân viên cửa hàng', 'Khách hàng', 'Chủ nhà'],
      correct: 0
    }
  },
  sh_basket: {
    id: 'sh_basket',
    nameVi: 'Giỏ mua hàng',
    chinese: '購物籃',
    pinyin: 'gòu wù lán',
    english: 'Shopping Basket',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 個 (ge)',
    meaning: 'Chiếc giỏ nhựa khách xách theo để đựng hàng khi đi chọn đồ trong cửa hàng.',
    exampleCn: '請拿一個購物籃。',
    examplePinyin: 'Qǐng ná yí ge gòuwùlán.',
    exampleVi: 'Bạn hãy lấy một chiếc giỏ mua hàng.',
    category: 'Cửa hàng tiện lợi',
    icon: '🧺',
    quiz: {
      question: '"購物" (gòuwù) nghĩa là gì?',
      options: ['Mua sắm', 'Nấu ăn', 'Dọn dẹp'],
      correct: 0
    }
  },
  sh_money: {
    id: 'sh_money',
    nameVi: 'Tiền',
    chinese: '錢',
    pinyin: 'qián',
    english: 'Money',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 塊 (kuài) / 元 (yuán)',
    meaning: 'Tiền dùng để mua hàng — thứ không thể thiếu khi bước vào cửa hàng tiện lợi.',
    exampleCn: '這個多少錢？',
    examplePinyin: 'Zhè ge duōshǎo qián?',
    exampleVi: 'Cái này bao nhiêu tiền?',
    category: 'Cửa hàng tiện lợi',
    icon: '💰',
    quiz: {
      question: '"多少錢" (duōshǎo qián) dùng để hỏi gì?',
      options: ['Giá bao nhiêu tiền', 'Ở đâu', 'Mấy giờ'],
      correct: 0
    }
  }
};

export const GATE_VOCAB = {
  door: {
    id: 'door',
    nameVi: 'Cửa phòng ngủ',
    chinese: '門',
    pinyin: 'mén',
    english: 'Door',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 扇 (shàn) / 道 (dào)',
    meaning: 'Cánh cửa phòng ngủ, mở ra là bước thẳng sang phòng khách của gia đình.',
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
  store_door: {
    id: 'store_door',
    nameVi: 'Cửa hàng tiện lợi',
    chinese: '便利商店',
    pinyin: 'biàn lì shāng diàn',
    english: 'Convenience Store',
    partOfSpeech: 'Danh từ (Noun) • Lượng từ: 家 (jiā) / 間 (jiān)',
    meaning: 'Cửa hàng tiện lợi mở cửa 24 giờ trên phố — chặng khám phá đầu tiên trong thành phố.',
    exampleCn: '我去便利商店買東西。',
    examplePinyin: 'Wǒ qù biànlì shāngdiàn mǎi dōngxi.',
    exampleVi: 'Tôi đi cửa hàng tiện lợi mua đồ.',
    category: 'Địa điểm thành phố',
    icon: '🏪',
    quiz: {
      question: '"便利商店" (biànlì shāngdiàn) là nơi nào?',
      options: ['Cửa hàng tiện lợi', 'Bưu điện', 'Nhà hàng lớn'],
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
    meaning: 'Cổng vào công viên thành phố — chặng cuối của hành trình khám phá.',
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
export const ROOM_VOCAB_DATA = {};

const stampZone = (dict, zoneId, isGate = false) => {
  Object.keys(dict).forEach(key => {
    const entry = { ...dict[key] };
    entry.zone = zoneId;
    entry.isGate = isGate;
    // Tự động gán icon vector SVG sắc nét tương ứng với ID từ vựng hoặc cổng
    entry.icon = getSvgIcon(key, { size: 22 });
    entry.iconSvg = entry.icon;
    ROOM_VOCAB_DATA[key] = entry;
  });
};

stampZone(BEDROOM_VOCAB, 'bedroom');
stampZone(LIVING_VOCAB, 'living');
stampZone(KITCHEN_VOCAB, 'kitchen');
stampZone(STREET_VOCAB, 'street');
stampZone(STORE_VOCAB, 'store');
stampZone(PARK_VOCAB, 'park');
stampZone(GATE_VOCAB, 'gate', true);

export const TOTAL_VOCAB_COUNT = Object.values(ROOM_VOCAB_DATA).filter(it => !it.isGate).length;


