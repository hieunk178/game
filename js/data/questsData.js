/**
 * ============================================================================
 * QUESTS & ACHIEVEMENTS DATABASE
 * ============================================================================
 */

export const QUEST_TYPES = {
  STORY: 'story',           // Nhiệm vụ cốt truyện khu vực
  DISCOVERY: 'discovery',   // Khám phá vật thể cụ thể
  MINIGAME: 'minigame',     // Hoàn thành thử thách mini-game
  DIALOGUE: 'dialogue',     // Trò chuyện với NPC
  DAILY: 'daily'            // Nhiệm vụ hàng ngày
};

export const QUESTS_DATA = [
  // --- ZONE 1: PHÒNG NGỦ (BEDROOM) ---
  {
    id: 'q_bedroom_morning',
    zone: 'bedroom',
    type: QUEST_TYPES.STORY,
    title: 'Chào Buổi Sáng Năng Động',
    description: 'Thức dậy và kiểm tra các vật dụng quan trọng trên bàn học trước khi ra ngoài.',
    requiredItems: ['desk', 'chair', 'laptop', 'coffee', 'clock'],
    rewardXP: 150,
    rewardScore: 200,
    badge: '🌅 Khởi Đầu Mới',
    dialogueRequirement: null
  },
  {
    id: 'q_bedroom_scholar',
    zone: 'bedroom',
    type: QUEST_TYPES.DISCOVERY,
    title: 'Góc Học Tập Gọn Gàng',
    description: 'Khám phá sách vở, cúp danh dự và quả địa cầu trong phòng ngủ.',
    requiredItems: ['bookshelf', 'trophy', 'globe', 'backpack'],
    rewardXP: 120,
    rewardScore: 180,
    badge: '📚 Mọt Sách 3D'
  },
  {
    id: 'q_bedroom_setup',
    zone: 'bedroom',
    type: QUEST_TYPES.DISCOVERY,
    title: 'Set-up Góc Gaming',
    description: 'Kiểm tra góc học tập kiêm gaming mới: màn hình, bàn phím, tủ quần áo, rèm cửa và thảm trải sàn.',
    requiredItems: ['monitor', 'keyboard', 'wardrobe', 'curtain', 'rug'],
    rewardXP: 140,
    rewardScore: 200,
    badge: '🎮 Streamer Tập Sự'
  },
  {
    id: 'q_bedroom_master',
    zone: 'bedroom',
    type: QUEST_TYPES.STORY,
    title: 'Chinh Phục Phòng Ngủ',
    description: 'Khám phá toàn bộ 20 đồ vật trong phòng ngủ để sẵn sàng mở cửa ra phòng khách.',
    requiredCount: 20,
    rewardXP: 300,
    rewardScore: 500,
    badge: '🔑 Chìa Khóa Phòng Khách'
  },

  // --- ZONE 2: PHÒNG KHÁCH (LIVING ROOM) ---
  {
    id: 'q_living_cozy',
    zone: 'living',
    type: QUEST_TYPES.STORY,
    title: 'Không Gian Thư Giãn',
    description: 'Tìm kiếm bộ sofa, tivi và bàn trà trong phòng khách sang trọng.',
    requiredItems: ['lr_sofa', 'lr_tv', 'lr_coffeeTable', 'lr_chandelier'],
    rewardXP: 200,
    rewardScore: 300,
    badge: '🛋️ Chuyên Gia Nội Thất'
  },
  {
    id: 'q_living_teacher',
    zone: 'living',
    type: QUEST_TYPES.DIALOGUE,
    title: 'Gặp Gỡ Thầy Giáo Vương',
    description: 'Trò chuyện cùng thầy Vương (王老師) trong phòng khách để nhận lời khuyên học từ vựng.',
    targetNpc: 'npc_teacher_wang',
    rewardXP: 180,
    rewardScore: 250,
    badge: '🎓 Học Trò Ngoan'
  },
  {
    id: 'q_living_master',
    zone: 'living',
    type: QUEST_TYPES.STORY,
    title: 'Làm Chủ Phòng Khách',
    description: 'Khám phá tất cả 12 đồ vật trong phòng khách để mở đường sang phòng bếp.',
    requiredCount: 12,
    rewardXP: 350,
    rewardScore: 600,
    badge: '🚪 Cửa Bếp Rộng Mở'
  },

  // --- ZONE 3: PHÒNG BẾP (KITCHEN) ---
  {
    id: 'q_kitchen_chef',
    zone: 'kitchen',
    type: QUEST_TYPES.STORY,
    title: 'Bếp Trưởng Tập Sự',
    description: 'Khám phá tủ lạnh, bếp gas, bồn rửa chén và lò vi sóng.',
    requiredItems: ['kt_fridge', 'kt_stove', 'kt_sink', 'kt_microwave'],
    rewardXP: 220,
    rewardScore: 350,
    badge: '🍳 Đầu Bếp Siêu Hạng'
  },
  {
    id: 'q_kitchen_breakfast',
    zone: 'kitchen',
    type: QUEST_TYPES.DISCOVERY,
    title: 'Bữa Sáng Chu Đáo',
    description: 'Tìm máy pha cà phê, máy nướng bánh mì và bàn ăn gia đình.',
    requiredItems: ['kt_coffeeMachine', 'kt_toaster', 'kt_table'],
    rewardXP: 180,
    rewardScore: 280,
    badge: '☕ Bữa Sáng Hoàn Hảo'
  },

  // --- ZONE 4: ĐƯỜNG PHỐ (STREET) ---
  {
    id: 'q_street_traffic',
    zone: 'street',
    type: QUEST_TYPES.STORY,
    title: 'Tham Gia Giao Thông An Toàn',
    description: 'Tìm hiểu đèn giao thông, vạch kẻ đường và trạm dừng xe buýt.',
    requiredItems: ['st_trafficLight', 'st_crosswalk', 'st_busStop', 'st_car'],
    rewardXP: 280,
    rewardScore: 400,
    badge: '🚦 Người Đi Bộ Thông Thái'
  },
  {
    id: 'q_street_police',
    zone: 'street',
    type: QUEST_TYPES.DIALOGUE,
    title: 'Hỏi Đường Bác Cảnh Sát Lý',
    description: 'Trò chuyện cùng bác cảnh sát Lý (李警官) trên vỉa hè để học cách hỏi đường.',
    targetNpc: 'npc_policeman_li',
    rewardXP: 200,
    rewardScore: 300,
    badge: '👮 Công Dân Gương Mẫu'
  },

  // --- ZONE 5: CỬA HÀNG TIỆN LỢI (CONVENIENCE STORE) ---
  {
    id: 'q_store_shopping',
    zone: 'store',
    type: QUEST_TYPES.STORY,
    title: 'Đi Mua Đồ Ở Cửa Hàng Tiện Lợi',
    description: 'Lấy giỏ mua hàng rồi tìm đồ uống trong tủ mát, mì ăn liền và bánh mì trên kệ.',
    requiredItems: ['sh_basket', 'sh_drink', 'sh_noodle', 'sh_bread'],
    rewardXP: 280,
    rewardScore: 400,
    badge: '🛒 Khách Quen Của Tiệm'
  },
  {
    id: 'q_store_checkout',
    zone: 'store',
    type: QUEST_TYPES.DIALOGUE,
    title: 'Thanh Toán Cùng Chị Trần',
    description: 'Trò chuyện với chị Trần (陳店員) ở quầy thu ngân để học cách hỏi giá và trả tiền.',
    targetNpc: 'npc_clerk_chen',
    rewardXP: 220,
    rewardScore: 320,
    badge: '💰 Biết Hỏi Giá'
  },
  {
    id: 'q_store_master',
    zone: 'store',
    type: QUEST_TYPES.STORY,
    title: 'Chinh Phục Cửa Hàng Tiện Lợi',
    description: 'Khám phá trọn 10 món hàng trong cửa hàng để mở cổng công viên trung tâm.',
    requiredCount: 10,
    rewardXP: 320,
    rewardScore: 520,
    badge: '🔑 Chìa Khoá Công Viên'
  },

  // --- ZONE 5: CÔNG VIÊN (PARK) ---
  {
    id: 'q_park_nature',
    zone: 'park',
    type: QUEST_TYPES.STORY,
    title: 'Hòa Mình Cùng Thiên Nhiên',
    description: 'Thưởng ngoạn đài phun nước, cầu hồ nước và khóm hoa rực rỡ.',
    requiredItems: ['pk_fountain', 'pk_bridge', 'pk_flower', 'pk_lake'],
    rewardXP: 300,
    rewardScore: 450,
    badge: '🌸 Nhà Thám Hiểm Thiên Nhiên'
  },
  {
    id: 'q_park_friend',
    zone: 'park',
    type: QUEST_TYPES.DIALOGUE,
    title: 'Vui Chơi Cùng Tiểu Minh',
    description: 'Gặp gỡ bạn học Tiểu Minh (小明) bên xích đu công viên.',
    targetNpc: 'npc_friend_xiaoming',
    rewardXP: 250,
    rewardScore: 350,
    badge: '🤝 Tình Bạn Diệu Kỳ'
  }
];

export const ACHIEVEMENTS_DATA = [
  {
    id: 'ach_first_discovery',
    title: 'Bước Chân Đầu Tiên',
    description: 'Khám phá đồ vật 3D đầu tiên.',
    icon: '✨',
    rewardXP: 50
  },
  {
    id: 'ach_streak_5',
    title: 'Tia Chớp Trí Nhớ',
    description: 'Trả lời đúng 5 câu trắc nghiệm liên tiếp không sai.',
    icon: '⚡',
    rewardXP: 150
  },
  {
    id: 'ach_srs_master_10',
    title: 'Bậc Thầy Trí Nhớ Dài Hạn',
    description: 'Đưa 10 từ vựng đạt cấp độ Thành thạo (Mastered) qua hệ thống SRS.',
    icon: '🧠',
    rewardXP: 300
  },
  {
    id: 'ach_sentence_builder_5',
    title: 'Nhà Soạn Thảo Cú Pháp',
    description: 'Hoàn thành 5 thử thách sắp xếp câu hoàn chỉnh.',
    icon: '✍️',
    rewardXP: 200
  },
  {
    id: 'ach_polyglot_all',
    title: 'Đại Sứ Tiếng Trung TOCFL',
    description: 'Khám phá và làm chủ toàn bộ từ vựng trên cả 6 chặng hành trình.',
    icon: '🏆',
    rewardXP: 1000
  }
];
