/**
 * ============================================================================
 * NPC DEFINITIONS & BRANCHING DIALOGUE SCRIPTS
 * ============================================================================
 */

export const NPCS_DATA = {
  // NPC 1: Thầy giáo Vương (Phòng khách)
  npc_teacher_wang: {
    id: 'npc_teacher_wang',
    name: 'Thầy Vương (王老師)',
    chinese: '王老師',
    pinyin: 'Wáng Lǎoshī',
    zone: 'living',
    role: 'Giáo viên tiếng Trung',
    avatarColor: '#2563eb',
    position: { x: -3.2, y: 0, z: 2.2 },
    rotationY: Math.PI * 0.25,
    dialogueTree: {
      start: {
        textCn: '你好！我是王老師。歡迎來到客廳！你的中文學得怎麼樣？',
        textPinyin: 'Nǐ hǎo! Wǒ shì Wáng lǎoshī. Huānyíng lái dào kètīng! Nǐ de zhōngwén xué de zěnmeyàng?',
        textVi: 'Chào em! Thầy là thầy Vương. Chào mừng em tới phòng khách! Việc học tiếng Trung của em thế nào rồi?',
        options: [
          {
            text: '很好！我剛剛在臥室學了很多單詞。 (Rất tốt! Em vừa học nhiều từ trong phòng ngủ.)',
            nextNode: 'praise_bedroom'
          },
          {
            text: '有點難，但我會努力的！ (Hơi khó một chút, nhưng em sẽ cố gắng!)',
            nextNode: 'encourage'
          },
          {
            text: '老師，客廳裡有什麼好玩的東西？ (Thầy ơi, phòng khách có gì thú vị ạ?)',
            nextNode: 'introduce_living'
          }
        ]
      },
      praise_bedroom: {
        textCn: '太棒了！循序漸進是學好中文的最佳方法。記得去看看沙發和電視喔！',
        textPinyin: 'Tài bàng le! Xúnxù jiànjìn shì xué hǎo zhōngwén de zuì jiā fāngfǎ. Jìde qù kànkan shāfā hé diànshì ō!',
        textVi: 'Tuyệt vời! Học từng bước là phương pháp tốt nhất để giỏi tiếng Trung. Nhớ khám phá ghế sofa và tivi nhé!',
        options: [
          { text: '謝謝老師！我這就去！ (Cảm ơn thầy! Em đi ngay đây ạ!)', nextNode: 'finish' }
        ]
      },
      encourage: {
        textCn: '別擔心，多聽多說多練習，你一定能通過華語文能力測驗 (TOCFL)！',
        textPinyin: 'Bié dānxīn, duō tīng duō shuō duō liànxí, nǐ yídìng néng tōngguò Huáyǔwén Nénglì Cèyàn (TOCFL)!',
        textVi: 'Đừng lo lắng, nghe nhiều nói nhiều luyện tập nhiều, em nhất định sẽ vượt qua kỳ thi TOCFL!',
        options: [
          { text: '我明白了，謝謝老師鼓勵！ (Em hiểu rồi, cảm ơn thầy đã động viên!)', nextNode: 'finish' }
        ]
      },
      introduce_living: {
        textCn: '這裡有大沙發 (沙發)、智能電視 (電視) 還有美麗的吊燈 (吊燈)。快去看看吧！',
        textPinyin: 'Zhèlǐ yǒu dà shāfā (shāfā), zhìnéng diànshì (diànshì) hái yǒu měilì de diàodēng (diàodēng). Kuài qù kànkan ba!',
        textVi: 'Ở đây có ghế sofa êm ái, tivi thông minh và đèn chùm lộng lẫy. Hãy mau đi khám phá nhé!',
        options: [
          { text: '好的，我馬上去找！ (Vâng, em đi tìm ngay đây ạ!)', nextNode: 'finish' }
        ]
      },
      finish: {
        textCn: '加油！祝你學習愉快！',
        textPinyin: 'Jiāyóu! Zhù nǐ xuéxí yúkuài!',
        textVi: 'Cố lên nhé! Chúc em học tập thật vui!',
        isEnd: true,
        rewardXP: 100
      }
    }
  },

  // NPC 4: Chị Trần thu ngân (Cửa hàng tiện lợi)
  npc_clerk_chen: {
    id: 'npc_clerk_chen',
    name: 'Chị Trần (陳店員)',
    chinese: '陳店員',
    pinyin: 'Chén Diànyuán',
    zone: 'store',
    role: 'Nhân viên cửa hàng tiện lợi',
    avatarColor: '#16a34a',
    position: { x: 2.6, y: 0, z: 3.5 },
    rotationY: Math.PI,
    dialogueTree: {
      start: {
        textCn: '歡迎光臨！我們的便利商店二十四小時營業。你要買什麼？',
        textPinyin: 'Huānyíng guānglín! Wǒmen de biànlì shāngdiàn èrshísì xiǎoshí yíngyè. Nǐ yào mǎi shénme?',
        textVi: 'Hoan nghênh quý khách! Cửa hàng tiện lợi của chúng tôi mở cửa 24 giờ. Bạn muốn mua gì ạ?',
        options: [
          {
            text: '我想買一瓶飲料。 (Tôi muốn mua một chai nước.)',
            nextNode: 'buy_drink'
          },
          {
            text: '請問泡麵在哪裡？ (Cho hỏi mì ăn liền ở đâu ạ?)',
            nextNode: 'find_noodle'
          },
          {
            text: '這個多少錢？ (Cái này bao nhiêu tiền?)',
            nextNode: 'ask_price'
          }
        ]
      },
      buy_drink: {
        textCn: '飲料在後面的冰櫃裡，很冰喔！拿了以後到收銀台結帳。',
        textPinyin: 'Yǐnliào zài hòumiàn de bīngguì lǐ, hěn bīng ō! Ná le yǐhòu dào shōuyíntái jiézhàng.',
        textVi: 'Đồ uống ở trong tủ mát phía sau, lạnh lắm đó! Lấy xong mời bạn ra quầy thu ngân thanh toán.',
        options: [
          { text: '好的，謝謝你！ (Vâng, cảm ơn chị!)', nextNode: 'finish' }
        ]
      },
      find_noodle: {
        textCn: '泡麵在中間的貨架上，旁邊還有麵包跟零食。',
        textPinyin: 'Pàomiàn zài zhōngjiān de huòjià shàng, pángbiān hái yǒu miànbāo gēn língshí.',
        textVi: 'Mì ăn liền nằm trên kệ hàng ở giữa, bên cạnh còn có bánh mì và đồ ăn vặt nữa.',
        options: [
          { text: '我先拿一個購物籃。 (Để em lấy một cái giỏ mua hàng trước.)', nextNode: 'finish' }
        ]
      },
      ask_price: {
        textCn: '這個三十五塊。請問你要付現金還是刷卡？',
        textPinyin: 'Zhè ge sānshíwǔ kuài. Qǐngwèn nǐ yào fù xiànjīn háishì shuākǎ?',
        textVi: 'Cái này ba mươi lăm tệ. Bạn muốn trả tiền mặt hay quẹt thẻ ạ?',
        options: [
          { text: '我付現金，謝謝。 (Tôi trả tiền mặt, cảm ơn.)', nextNode: 'finish' }
        ]
      },
      finish: {
        textCn: '謝謝光臨，歡迎下次再來！',
        textPinyin: 'Xièxie guānglín, huānyíng xiàcì zài lái!',
        textVi: 'Cảm ơn bạn đã ghé, hẹn gặp lại lần sau nhé!',
        isEnd: true,
        rewardXP: 120
      }
    }
  },

  // NPC 2: Bác cảnh sát Lý (Đường phố)
  npc_policeman_li: {
    id: 'npc_policeman_li',
    name: 'Bác cảnh sát Lý (李警官)',
    chinese: '李警官',
    pinyin: 'Lǐ Jǐngguān',
    zone: 'street',
    role: 'Cảnh sát giao thông',
    avatarColor: '#0284c7',
    position: { x: 3.5, y: 0, z: 2.0 },
    rotationY: -Math.PI * 0.4,
    dialogueTree: {
      start: {
        textCn: '你好，同學！在街道上行走要注意交通安全喔。',
        textPinyin: 'Nǐ hǎo, tóngxué! Zài jiēdào shàng xíngzǒu yào zhùyì jiāotōng ānquán ō.',
        textVi: 'Chào cháu! Đi bộ trên đường phố nhớ chú ý an toàn giao thông nhé.',
        options: [
          {
            text: '請問去公園要怎麼走？ (Xin hỏi đi tới công viên thì đi đường nào ạ?)',
            nextNode: 'directions_park'
          },
          {
            text: '警官好！過馬路要注意什麼？ (Chào bác! Qua đường cần chú ý điều gì ạ?)',
            nextNode: 'traffic_rules'
          }
        ]
      },
      directions_park: {
        textCn: '沿著這條斑馬線直走，經過紅綠燈和公車站，前面就是公園大門了！',
        textPinyin: 'Yánzhe zhè tiáo bānmǎxiàn zhí zǒu, jīngguò hónglǜdēng hé gōngchēzhàn, qiánmiàn jiù shì gōngyuán dàmén le!',
        textVi: 'Đi thẳng theo vạch kẻ đường này, qua cột đèn giao thông và trạm xe buýt, phía trước chính là cổng công viên!',
        options: [
          { text: '非常感謝李警官！ (Cháu cảm ơn bác cảnh sát Lý rất nhiều!)', nextNode: 'finish' }
        ]
      },
      traffic_rules: {
        textCn: '紅燈停、綠燈行，過馬路一定要走斑馬線！這樣才安全。',
        textPinyin: 'Hóng dēng tíng, lǜ dēng xíng, guò mǎlù yídìng yào zǒu bānmǎxiàn! Zhèyàng cái ānquán.',
        textVi: 'Đèn đỏ dừng, đèn xanh đi, qua đường nhất định phải đi trên vạch kẻ đường! Như vậy mới an toàn.',
        options: [
          { text: 'Cháu ghi nhớ rồi ạ! 謝謝您！', nextNode: 'finish' }
        ]
      },
      finish: {
        textCn: '好樣的！祝你路上平安！',
        textPinyin: 'Hǎoyàng de! Zhù nǐ lùshang píng\'ān!',
        textVi: 'Tốt lắm! Chúc cháu đi đường bình an!',
        isEnd: true,
        rewardXP: 100
      }
    }
  },

  // NPC 3: Bạn học Tiểu Minh (Công viên)
  npc_friend_xiaoming: {
    id: 'npc_friend_xiaoming',
    name: 'Bạn học Tiểu Minh (小明)',
    chinese: '小明',
    pinyin: 'Xiǎo Míng',
    zone: 'park',
    role: 'Bạn học cùng lớp',
    avatarColor: '#10b981',
    position: { x: -3.8, y: 0, z: 8.0 },
    rotationY: Math.PI * 0.6,
    dialogueTree: {
      start: {
        textCn: '嘿！你也來公園玩啊！這裡風景真好，空氣很清新。',
        textPinyin: 'Hēi! Nǐ yě lái gōngyuán wán a! Zhèlǐ fēngjǐng zhēn hǎo, kōngqì hěn qīngxīn.',
        textVi: 'Ê! Cậu cũng tới công viên chơi hả! Phong cảnh ở đây đẹp thật, không khí trong lành quá.',
        options: [
          {
            text: '我們一起去盪鞦韆好嗎？ (Chúng mình cùng đi chơi xích đu nhé?)',
            nextNode: 'play_swing'
          },
          {
            text: '你看見噴水池和鴿子了嗎？ (Cậu đã thấy đài phun nước và chim bồ câu chưa?)',
            nextNode: 'look_birds'
          }
        ]
      },
      play_swing: {
        textCn: '好啊！鞦韆 (qiūqiān) 就在那邊，旁邊還有滑梯 (huátī) 呢！走吧！',
        textPinyin: 'Hǎo a! Qiūqiān jiù zài nàbiān, pángbiān hái yǒu huátī ne! Zǒu ba!',
        textVi: 'Được chứ! Xích đu ở ngay đằng kia, bên cạnh còn có cả cầu trượt nữa đó! Đi thôi!',
        options: [
          { text: '太好玩了！走吧！ (Vui quá! Đi nào!)', nextNode: 'finish' }
        ]
      },
      look_birds: {
        textCn: '看見了！那隻白色的鴿子 (gēzi) 正在吃飼料呢，太可愛了！',
        textPinyin: 'Kànjiàn le! Nà zhī báisè de gēzi zhèngzài chī sìliào ne, tài kě\'ài le!',
        textVi: 'Thấy rồi! Chú chim bồ câu màu trắng đang ăn thức ăn kìa, dễ thương ghê!',
        options: [
          { text: 'Chúng mình cùng cho chim ăn nhé! 一起餵鴿子！', nextNode: 'finish' }
        ]
      },
      finish: {
        textCn: '今天真是開心的一天！很高興遇到你！',
        textPinyin: 'Jīntiān zhēn shì kāixīn de yì tiān! Hěn gāoxìng yù dào nǐ!',
        textVi: 'Hôm nay đúng là một ngày vui vẻ! Rất vui được gặp cậu!',
        isEnd: true,
        rewardXP: 100
      }
    }
  }
};
