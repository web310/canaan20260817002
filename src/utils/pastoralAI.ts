// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - HIGH-SPEED PASTORAL AI ENGINE
// Provides instant Biblical wisdom, customized prayers, scripture search,
// and devotional reflections with zero latency.
// ============================================================================

export interface PastoralAIResponse {
  reply: string;
  scriptures?: Array<{ reference: string; text: string }>;
  suggestedQuestions?: string[];
  category?: 'scripture' | 'prayer' | 'devotional' | 'church' | 'comfort';
}

export function generateInstantPastoralReply(
  userInput: string,
  lang: 'zh' | 'en' = 'zh'
): PastoralAIResponse {
  const query = userInput.trim().toLowerCase();

  // 1. Church Schedule / Information
  if (
    query.includes('時間') ||
    query.includes('聚會') ||
    query.includes('主日') ||
    query.includes('禱告會') ||
    query.includes('zoom') ||
    query.includes('地址') ||
    query.includes('地點') ||
    query.includes('service') ||
    query.includes('time') ||
    query.includes('address') ||
    query.includes('schedule')
  ) {
    if (lang === 'zh') {
      return {
        reply: `平安！歡迎您參加【加南新生基督教會】各項實體與線上聚會：

🏛️ **主日崇拜 (Sunday Service)**：
• 時間：每週日上午 10:00（9:45 讚美敬拜預備心）
• 地點：Harbor City, CA（加南教會會堂）
• 內容：詩歌敬拜、牧師證道、聖餐禮（每月第一主日）、兒童主日學與愛筵團契。

💻 **每週四線上 Zoom 守望禱告會**：
• 時間：每週四晚上 8:00 - 9:00 (PST)
• **Zoom ID**：\`310-626-6103\`
• **密碼**：\`25226\`
• 同心為教會聖工、宣教外展、肢體健康與家庭平安守望。

🌲 **細胞小組與健行團契**：
• 每月隔週六上午舉辦戶外靈修健行與家庭小組分享。

✉️ **教會聯絡信箱**：web@canaannewlife.org
歡迎您與家人一同來到神的家中，同沐主恩！`,
        scriptures: [
          { reference: '希伯來書 10:24-25', text: '又要彼此相顧，激發愛心，勉勵行善。你們不可停止聚會，好像那些停止慣了的人，倒要彼此勸勉。' },
          { reference: '詩篇 122:1', text: '人對我說：「我們往耶和華的殿去」，我就歡喜。' }
        ],
        suggestedQuestions: [
          '請問如何參加每週四 Zoom 禱告會？',
          '請為我提供這週主日讀經進度',
          '請為我寫一段今日早晨出門前的祝福禱告'
        ],
        category: 'church'
      };
    } else {
      return {
        reply: `Peace be with you! Welcome to Canaan Shin Sheng Christian Church:

🏛️ **Sunday Worship Service**:
• Time: Every Sunday at 10:00 AM PST
• Location: Harbor City, CA
• Includes: Praise & Worship, Sermon, Communion (1st Sunday), Children's Ministry & Fellowship.

💻 **Thursday Online Zoom Prayer Meeting**:
• Time: Every Thursday 8:00 PM - 9:00 PM PST
• **Zoom ID**: \`310-626-6103\`
• **Passcode**: \`25226\`

✉️ **Contact Email**: web@canaannewlife.org
We warmly invite you and your family to worship the Lord together with us!`,
        scriptures: [
          { reference: 'Hebrews 10:24-25', text: 'And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together.' }
        ],
        suggestedQuestions: [
          'How do I join the Thursday Zoom prayer meeting?',
          'Give me a daily Bible verse for strength',
          'Write a short prayer for family peace'
        ],
        category: 'church'
      };
    }
  }

  // 2. Anxiety, Fear, Worry, Stress, Insomnia
  if (
    query.includes('焦慮') ||
    query.includes('擔心') ||
    query.includes('壓力') ||
    query.includes('害怕') ||
    query.includes('失眠') ||
    query.includes('憂慮') ||
    query.includes('平安') ||
    query.includes('恐懼') ||
    query.includes('anxiety') ||
    query.includes('worry') ||
    query.includes('stress') ||
    query.includes('fear') ||
    query.includes('peace')
  ) {
    if (lang === 'zh') {
      return {
        reply: `親愛的弟兄姊妹，平安！當您感到焦慮或壓力沉重時，請深吸一口氣，知道神始終與您同在，祂愛您並親自掌管一切。

🌿 **靈修默想與真理安慰**：
世上的風浪雖大，但耶穌早已勝過了世界。神沒有應許天色常藍，但祂應許祂的恩典在我們的軟弱上顯得完全。您可以把一切重擔完全交託給祂。

📖 **安慰應許經文**：
1. **腓立比書 4:6-7**：「應當一無掛慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜、出人意外的平安必在基督耶穌裡保守你們的心懷意念。」
2. **彼得前書 5:7**：「你們要將一切的憂慮卸給神，因為他顧念你們。」
3. **約翰福音 14:27**：「我留下平安給你們；我將我的平安賜給你們。我所賜的，不像世人所賜的。你們心裡不要憂愁，也不要膽怯。」

🙏 **為您獻上的平安禱告**：
「親愛的天父，求祢此刻將出人意外的屬天平安傾倒在我的心裡。拔除我內心一切的恐懼與憂慮，賜給我安穩的睡眠與堅定的信心。奉主耶穌基督的聖名禱告，阿們！」`,
        scriptures: [
          { reference: '以賽亞書 41:10', text: '你不要害怕，因為我與你同在；不要驚惶，因為我是你的神。我必堅固你，我必幫助你；我必用我公義的右手扶持你。' },
          { reference: '詩篇 23:4', text: '我雖然行過死陰的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。' }
        ],
        suggestedQuestions: [
          '請為我寫一段睡前釋放焦慮的禱告文',
          '當面臨重大決定時，如何明白神的心意？',
          '請提供 3 節賜予勇氣與信心的經文'
        ],
        category: 'comfort'
      };
    } else {
      return {
        reply: `Peace be with you! When worry or anxiety tries to overwhelm you, remember that the Lord is close to the brokenhearted and cares for every detail of your life.

🌿 **Biblical Encouragement**:
God invites you to cast every single burden upon Him. His peace surpasses all human understanding.

📖 **Scripture Promises**:
1. **Philippians 4:6-7**: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."
2. **1 Peter 5:7**: "Cast all your anxiety on him because he cares for you."
3. **John 14:27**: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid."

🙏 **A Prayer for Peace**:
"Heavenly Father, pour Your comforting peace into my heart right now. Calm every anxious thought, and remind me of Your faithful love. In Jesus' name, Amen."`,
        scriptures: [
          { reference: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.' }
        ],
        suggestedQuestions: [
          'Give me a bedtime prayer for sound sleep',
          'How can I find peace during difficult seasons?'
        ],
        category: 'comfort'
      };
    }
  }

  // 3. Health, Surgery, Sickness, Recovery, Care
  if (
    query.includes('病') ||
    query.includes('醫治') ||
    query.includes('手術') ||
    query.includes('健康') ||
    query.includes('痛') ||
    query.includes('康復') ||
    query.includes('身體') ||
    query.includes('跌倒') ||
    query.includes('health') ||
    query.includes('healing') ||
    query.includes('surgery') ||
    query.includes('sick') ||
    query.includes('pain')
  ) {
    if (lang === 'zh') {
      return {
        reply: `主內平安！我們深知身體的病痛與手術過程需要極大的勇氣與忍耐。耶和華拉法（耶和華是醫治者）親自看顧您與您的家人。

🌿 **醫治與看顧的真理應許**：
神是我們的避難所，是我們在患難中隨時的幫助。祂深知我們的軟弱，親手扶持我們走過康復的每一天。

📖 **醫治經文**：
1. **詩篇 103:2-3**：「我的心哪，你要稱頌耶和華！不可忘記他的一切恩惠！他赦免你的一切罪孽，醫治你的一切疾病。」
2. **耶利米書 17:14**：「耶和華啊，求你醫治我，我便得醫治；拯救我，我便得救；因你是我所讚美的。」
3. **以賽亞書 53:5**：「因他受的刑罰，我們得平安；因他受的鞭傷，我們得醫治。」

🙏 **專屬康復與醫治代禱文**：
「愛我們的主耶穌，祢是大能的醫治者。我們將身體軟弱、即將接受治療或正在康復中的肢體交託在祢恩手之中。求祢賜下智慧給醫療團隊，保守手術與治療過程順利；減輕身體的一切疼痛，賜下充足的體力與安息。求祢的平安臨到他們的家庭，使他們在康復中親身經歷祢豐盛的恩典。奉主耶穌基督的聖名求，阿們！」`,
        scriptures: [
          { reference: '詩篇 41:3', text: '他病重在榻，耶和華必扶持他；他在病中，你必給他鋪床。' },
          { reference: '出埃及記 15:26', text: '因為我耶和華是醫治你的。' }
        ],
        suggestedQuestions: [
          '請為即將進手術房的家人寫一段代禱文',
          '如何為長輩的健康與日常平安守望代求？',
          '在病痛等候中如何維持對神的信心？'
        ],
        category: 'prayer'
      };
    } else {
      return {
        reply: `Peace be with you! Jehovah Rapha, the Lord who heals, holds you and your loved ones in His loving hands.

📖 **Healing Scriptures**:
1. **Psalm 103:2-3**: "Praise the LORD, my soul, and forget not all his benefits—who forgives all your sins and heals all your diseases."
2. **Jeremiah 17:14**: "Heal me, LORD, and I will be healed; save me and I will be saved, for you are the one I praise."

🙏 **Prayer for Healing & Recovery**:
"Lord Jesus, the Great Physician, we place our bodies and recovery into Your hands. Guide every medical decision, relieve all pain, and grant swift restoration. Surround our family with Your peace. In Jesus' name, Amen."`,
        scriptures: [
          { reference: 'Exodus 15:26', text: 'For I am the LORD who heals you.' }
        ],
        suggestedQuestions: [
          'Prayer for someone undergoing surgery',
          'Verses of strength during illness'
        ],
        category: 'prayer'
      };
    }
  }

  // 4. Daily Devotional, Morning/Evening Scripture, Bible Reading
  if (
    query.includes('靈修') ||
    query.includes('經文') ||
    query.includes('金句') ||
    query.includes('每日') ||
    query.includes('讀經') ||
    query.includes('早晨') ||
    query.includes('晚禱') ||
    query.includes('devotion') ||
    query.includes('verse') ||
    query.includes('daily') ||
    query.includes('scripture') ||
    query.includes('morning')
  ) {
    if (lang === 'zh') {
      return {
        reply: `平安！為您送上今日充滿恩典與力量的靈修默想：

☀️ **今日靈修金句**：
**約書亞記 1:9**：「我豈沒有吩咐你嗎？你當剛強壯膽！不要懼怕，也不要驚惶；因為你無論往哪裡去，耶和華你的神必與你同在。」

🌱 **靈修短文默想【步步跟隨，滿有指望】**：
每一個清晨都是神施恩的起點。無論今天擺在您眼前的是挑戰、繁重的工作還是未知的路程，請記得：神總在您前頭引路。當我們專心倚靠祂時，祂必為我們修平崎嶇的道路。

📖 **精選對照經文**：
• **詩篇 119:105**：「你的話是我腳前的燈，是我路上的光。」
• **箴言 3:5-6**：「你要專心仰賴耶和華，不可倚靠自己的聰明，在你一切所行的事上都要認定他，他必指引你的路。」
• **哀歌 3:22-23**：「我們不至消滅，是出於耶和華諸般的慈愛；是因他的憐憫不致斷絕。每早晨，這都是新的；你的誠實極其廣大！」

✨ **今日生活實踐**：
今天在遇到焦慮或急躁時，停下 10 秒鐘，默念「耶穌與我同在」，帶著平安去祝福周遭的一個人！`,
        scriptures: [
          { reference: '詩篇 23:1-3', text: '耶和華是我的牧者，我必不致缺乏。他使我躺臥在青草地上，領我在可安歇的水邊。他使我的靈魂甦醒，為自己的名引導我走義路。' }
        ],
        suggestedQuestions: [
          '請為我提供適合今天下班後的晚禱經文',
          '這週教會主日講道的題目與經文是什麼？',
          '如何在繁忙的工作中保持靈修生活？'
        ],
        category: 'devotional'
      };
    } else {
      return {
        reply: `Peace be with you! Here is your daily spiritual reflection and golden verse:

☀️ **Daily Golden Verse**:
**Joshua 1:9**: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."

🌱 **Devotional Thought**:
Every morning is a fresh start of God's abundant grace. As you step into this day, remember that God goes before you to prepare the way.

📖 **Accompanying Scriptures**:
• **Psalm 119:105**: "Your word is a lamp for my feet, a light on my path."
• **Proverbs 3:5-6**: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."`,
        scriptures: [
          { reference: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' }
        ],
        suggestedQuestions: [
          'Give me an evening reflection prayer',
          'What is a good scripture for guidance?'
        ],
        category: 'devotional'
      };
    }
  }

  // 5. Family, Children, Marriage, Work, Career
  if (
    query.includes('家庭') ||
    query.includes('孩子') ||
    query.includes('兒女') ||
    query.includes('婚姻') ||
    query.includes('工作') ||
    query.includes('事業') ||
    query.includes('夫妻') ||
    query.includes('職場') ||
    query.includes('family') ||
    query.includes('marriage') ||
    query.includes('work') ||
    query.includes('job') ||
    query.includes('children')
  ) {
    if (lang === 'zh') {
      return {
        reply: `平安！家庭與職場都是神設立我們作光作鹽、經歷祂恩典的美好禾場。

🏡 **家庭與職場真理根基**：
神的心意是要讓我們的家成為充滿愛與敬畏神的避風港，在工作中榮神益人。

📖 **智慧與祝福經文**：
1. **約書亞記 24:15**：「至於我和我家，我們必定事奉耶和華。」
2. **歌羅西書 3:23-24**：「無論做什麼，都要從心裡做，像是給主做的，不是給人做的...因你們所事奉的乃是主基督。」
3. **箴言 22:6**：「教養孩童，使他走當行的道，就是到老他也不偏離。」
4. **以弗所書 4:2-3**：「凡事謙虛、溫柔、忍耐，用愛心互相寬容，用和平彼此聯絡，竭力保守聖靈所賜合而為一的心。」

🙏 **為家庭與工作的祝福禱告**：
「愛我們的主，求祢親自作我們家庭的主宰，賜下合一、愛與包容在夫妻與親子關係中；也求祢祝福我們手中的工作，賜下智慧、誠實與創意，使我們在職場上成為眾人的祝福。奉耶穌的名求，阿們！」`,
        scriptures: [
          { reference: '詩篇 127:1', text: '若不是耶和華建造房屋，建造的人就枉然勞力；若不是耶和華看守城池，看守的人就枉然警醒。' }
        ],
        suggestedQuestions: [
          '如何為孩子的升學與品格成長禱告？',
          '面臨職場人際關係摩擦時，聖經有何智慧？',
          '請為全家人的健康與出入平安寫一段祝禱詞'
        ],
        category: 'prayer'
      };
    } else {
      return {
        reply: `Peace be with you! Family and work are sacred places where God calls us to shine His light and reflect His unconditional love.

📖 **Biblical Wisdom**:
1. **Joshua 24:15**: "As for me and my household, we will serve the LORD."
2. **Colossians 3:23**: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."

🙏 **Prayer for Family & Work**:
"Lord, bless our home with unity, joy, and peace. Guide our daily work with integrity and wisdom so that we may honor You in all we do. In Jesus' name, Amen."`,
        scriptures: [
          { reference: 'Psalm 127:1', text: 'Unless the LORD builds the house, the builders labor in vain.' }
        ],
        suggestedQuestions: [
          'Prayer for children and education',
          'Wisdom for career decisions'
        ],
        category: 'prayer'
      };
    }
  }

  // 6. Default General Spiritual Guidance
  if (lang === 'zh') {
    return {
      reply: `弟兄姊妹平安！感謝您來到加南聖經與靈修 AI 導師。

🌿 **神對您的寶貴應許**：
「耶和華說：我知道我向你們所懷的意念是賜平安的意念，不是降災禍的意念，要叫你們末後有指望。」（耶利米書 29:11）

無論您目前面臨什麼樣的處境，神的慈愛永遠不離開您。您可以隨時詢問我任何聖經問題、請我為特定事項撰寫代禱文、或是索取今日專屬靈修經文。

📖 **推薦精選金句**：
• **羅馬書 8:28**：「我們曉得萬事都互相效力，叫愛神的人得益處，就是按他旨意被召的人。」
• **箴言 3:5-6**：「你要專心仰賴耶和華，不可倚靠自己的聰明，在你一切所行的事上都要認定他，他必指引你的路。」

您可以點擊下方的快捷問題，或直接在輸入框中寫下您的心聲！`,
      scriptures: [
        { reference: '詩篇 23:1', text: '耶和華是我的牧者，我必不致缺乏。' },
        { reference: '馬太福音 11:28', text: '凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。' }
      ],
      suggestedQuestions: [
        '請為我提供今日平安靈修經文與金句',
        '當我面對焦慮與壓力時，聖經有何安慰？',
        '請為我的家人身體健康寫一段簡短代禱文',
        '加南新生基督教會每週主日與線上禱告會時間'
      ],
      category: 'scripture'
    };
  } else {
    return {
      reply: `Peace be with you! Welcome to Canaan AI Bible & Pastoral Guide.

🌿 **God's Promise For You**:
"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future." (Jeremiah 29:11)

Feel free to ask any Biblical question, request a prayer, or ask for Scripture encouragement!`,
      scriptures: [
        { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him.' }
      ],
      suggestedQuestions: [
        'Give me a daily Bible verse for peace',
        'How can I find comfort in difficult times?',
        'What are the church service times?'
      ],
      category: 'scripture'
    };
  }
}
