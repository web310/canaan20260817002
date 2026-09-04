// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - DAILY SCRIPTURE & ENCOURAGEMENT
// 每日經文與靈修勉勵（每日自動更新）
// ============================================================================

export interface DailyDevotionItem {
  id: number;
  verseZh: string;
  verseEn: string;
  referenceZh: string;
  referenceEn: string;
  thoughtZh: string;
  thoughtEn: string;
}

export const DAILY_DEVOTIONS: DailyDevotionItem[] = [
  {
    id: 1,
    verseZh: "你當剛強壯膽！不要懼怕，也不要驚惶；因為你無論往哪裡去，耶和華你的神必與你同在。",
    verseEn: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
    referenceZh: "約書亞記 1:9",
    referenceEn: "Joshua 1:9",
    thoughtZh: "清晨醒來，新的恩典已為您預備。無論今天擺在眼前的是怎樣的挑戰或未知的路，請深知：神總在您前頭引路，祂的同在是您最堅固的後盾，放膽迎向美好的一天！",
    thoughtEn: "His mercies are new every morning. No matter what unknown paths lie ahead today, rest in the assurance that God goes before you. His presence is your strongest anchor."
  },
  {
    id: 2,
    verseZh: "應當一無掛慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜、出人意外的平安必在基督耶穌裡保守你們的心懷意念。",
    verseEn: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    referenceZh: "腓立比書 4:6-7",
    referenceEn: "Philippians 4:6-7",
    thoughtZh: "焦慮是心靈沉重的行囊，但禱告是通往平安的鑰匙。將您今日心中的擔憂一件一件交給主，祂必以屬天的平安環繞您，使您的腳步輕快安穩。",
    thoughtEn: "Worry weighs the heart down, but prayer unlocks divine peace. Surrender your concerns one by one to the Lord today, and let His gentle peace guard your spirit."
  },
  {
    id: 3,
    verseZh: "你的話是我腳前的燈，是我路上的光。",
    verseEn: "Your word is a lamp for my feet, a light on my path.",
    referenceZh: "詩篇 119:105",
    referenceEn: "Psalm 119:105",
    thoughtZh: "有時候我們不需要看清整條未來的道路，只需要看見下一步。神的話語如同夜行中的明燈，當我們依循真理而行，前面的方向自然清晰明亮。",
    thoughtEn: "We don't need to see the entire road ahead, only the next step. God's Word illuminates our path step by step as we walk faithfully in His truth."
  },
  {
    id: 4,
    verseZh: "你要專心仰賴耶和華，不可倚靠自己的聰明，在你一切所行的事上都要認定他，他必指引你的路。",
    verseEn: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    referenceZh: "箴言 3:5-6",
    referenceEn: "Proverbs 3:5-6",
    thoughtZh: "放下緊抓不放的焦慮，把今天的大事小事都交給全知全能的上帝。當您願意全心信靠祂時，祂必引導您走在蒙福且亨通的義路之上。",
    thoughtEn: "Release the need to control every outcome. When you trust God wholeheartedly and acknowledge Him in all your steps, He will smooth out the crooked roads before you."
  },
  {
    id: 5,
    verseZh: "耶和華是我的牧者，我必不致缺乏。他使我躺臥在青草地上，領我在可安歇的水邊。",
    verseEn: "The LORD is my shepherd; I shall not want. He makes me lie down in green pastures, he leads me beside quiet waters.",
    referenceZh: "詩篇 23:1-2",
    referenceEn: "Psalm 23:1-2",
    thoughtZh: "在忙碌喧囂的生活節奏中，好牧人耶穌正在呼喚您的心回到安息之處。停下匆忙的心思，在祂充足的供應與看顧中重新得力。",
    thoughtEn: "Amid the bustling demands of life, the Good Shepherd invites you to rest in His loving care. You lack nothing when you are walking with Him."
  },
  {
    id: 6,
    verseZh: "我們曉得萬事都互相效力，叫愛神的人得益處，就是按他旨意被召的人。",
    verseEn: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    referenceZh: "羅馬書 8:28",
    referenceEn: "Romans 8:28",
    thoughtZh: "即使偶爾遭遇不如意或期待落空，請深信神的編織永不失誤。今日所有的際遇，都在神美善的旨意中化為祝福與屬靈生命的滋養。",
    thoughtEn: "Even when things don't go as planned, trust that God is weaving every thread for your good. What seems like a setback is often God's divine setup for blessing."
  },
  {
    id: 7,
    verseZh: "但那等候耶和華的必從新得力。他們必如鷹展翅上騰；他們奔跑卻不困倦，行走卻不疲乏。",
    verseEn: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    referenceZh: "以賽亞書 40:31",
    referenceEn: "Isaiah 40:31",
    thoughtZh: "當您覺得體力或心力消耗殆盡時，不必硬靠自己苦撐。安靜在主面前等候仰望，祂必將超然的勇氣與翅膀賜給您，讓您逆風高飛！",
    thoughtEn: "When your own strength runs dry, you do not have to struggle alone. Wait upon the Lord; He will grant you renewed vitality to soar above life's storms."
  },
  {
    id: 8,
    verseZh: "神是我們的避難所，是我們的力量，是我們在患難中隨時的幫助。",
    verseEn: "God is our refuge and strength, an ever-present help in trouble.",
    referenceZh: "詩篇 46:1",
    referenceEn: "Psalm 46:1",
    thoughtZh: "世界也許隨時在變動，但上帝是永不動搖的高台。今天不管遇到任何風浪，隨時向祂呼求，祂就是您身邊最及時的倚靠與安慰。",
    thoughtEn: "The world around us may shift, but God remains an unshakeable fortress. Turn to Him in any storm today—He is always near and ready to help."
  },
  {
    id: 9,
    verseZh: "凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。我心裡柔和謙卑，你們當負我的軛，學我的樣式；這樣，你們心裡就必得享安息。",
    verseEn: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.",
    referenceZh: "馬太福音 11:28-29",
    referenceEn: "Matthew 11:28-29",
    thoughtZh: "耶穌從未要求我們獨自背負生活的千斤重擔。來到祂面前歇一歇，將煩惱卸在祂腳前，讓基督溫柔的愛撫慰您疲倦的心靈。",
    thoughtEn: "Jesus never intended for you to carry life's heavy burdens alone. Come to Him today, rest at His feet, and let His gentle grace restore your soul."
  },
  {
    id: 10,
    verseZh: "我們不至消滅，是出於耶和華諸般的慈愛；是因他的憐憫不致斷絕。每早晨，這都是新的；你的誠實極其廣大！",
    verseEn: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    referenceZh: "耶利米哀歌 3:22-23",
    referenceEn: "Lamentations 3:22-23",
    thoughtZh: "昨日的懊悔與軟弱都已隨昨夜過去，今天黎明的日光是神嶄新慈愛的印記。帶著感恩與盼望，微笑開始這滿有恩典的一天！",
    thoughtEn: "Yesterday's regrets are in the past; today's morning sun is a sign of God's renewed faithfulness. Step into this day with grateful joy and fresh hope!"
  },
  {
    id: 11,
    verseZh: "你不要害怕，因為我與你同在；不要驚惶，因為我是你的神。我必堅固你，我必幫助你；我必用我公義的右手扶持你。",
    verseEn: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
    referenceZh: "以賽亞書 41:10",
    referenceEn: "Isaiah 41:10",
    thoughtZh: "感到孤單或不確定時，請記得有一雙大能且充滿慈愛的手正緊緊牽著您。神絕不丟棄屬祂的兒女，祂必賜您剛強勇敢的心。",
    thoughtEn: "Whenever feelings of loneliness or hesitation arise, remember the mighty hand holding yours. God will never let you slip; He upholds you with righteous love."
  },
  {
    id: 12,
    verseZh: "耶和華說：我知道我向你們所懷的意念是賜平安的意念，不是降災禍的意念，要叫你們末後有指望。",
    verseEn: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
    referenceZh: "耶利米書 29:11",
    referenceEn: "Jeremiah 29:11",
    thoughtZh: "上帝對您的人生有著至美至善的藍圖。即使當下的風景看似朦朧，祂的計劃裡始終充滿了平安、盼望與豐盛的未來。",
    thoughtEn: "God has an extraordinary plan for your life. Even when the current view seems cloudy, His blueprints are filled with peace, blessing, and a bright future."
  },
  {
    id: 13,
    verseZh: "我靠著那加給我力量的，凡事都能做。",
    verseEn: "I can do all this through him who gives me strength.",
    referenceZh: "腓立比書 4:13",
    referenceEn: "Philippians 4:13",
    thoughtZh: "信心的源頭不是自己的才能有多大，而是加力量給我們的基督有多真實。靠著主豐盛的恩典，今天您將有足夠的智慧與能力度過每個考驗。",
    thoughtEn: "True confidence rests not in our own limitations, but in Christ's limitless power within us. Through Him, you have the grace needed for every task today."
  },
  {
    id: 14,
    verseZh: "你們要將一切的憂慮卸給神，因為他顧念你們。",
    verseEn: "Cast all your anxiety on him because he cares for you.",
    referenceZh: "彼得前書 5:7",
    referenceEn: "1 Peter 5:7",
    thoughtZh: "「卸給神」意味著完全的交託與釋懷。神深刻關心您生活中的每一個微小細節，今天就大膽將壓在心頭的事完全放手交給祂吧！",
    thoughtEn: "Casting your anxiety means full release into God's capable hands. He cares intimately about every detail of your life—let go and let Him lead."
  },
  {
    id: 15,
    verseZh: "喜樂的心乃是良藥；憂傷的靈使骨枯乾。",
    verseEn: "A cheerful heart is good medicine, but a crushed spirit dries up the bones.",
    referenceZh: "箴言 17:22",
    referenceEn: "Proverbs 17:22",
    thoughtZh: "喜樂不是因為環境一帆風順，而是因為深知主的愛永不改變。今天多一個微笑、多一句讚美與感謝，喜樂的良藥將使身心靈滿有生氣！",
    thoughtEn: "Joy does not depend on perfect circumstances, but on God's unchanging love. Choose a grateful smile today—a cheerful heart breathes life into your soul."
  },
  {
    id: 16,
    verseZh: "我留下平安給你們；我將我的平安賜給你們。我所賜的，不像世人所賜的。你們心裡不要憂愁，也不要膽怯。",
    verseEn: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    referenceZh: "約翰福音 14:27",
    referenceEn: "John 14:27",
    thoughtZh: "世上的平安常常隨著環境變化而消逝，但主耶穌所賜的平安是在風暴中依然安靜穩固的磐石。願這屬天的平安此刻就充盈您的心房。",
    thoughtEn: "Worldly peace fades with circumstance, but the peace Christ gives is a rock that stands secure through every storm. Let His peace guard your heart today."
  },
  {
    id: 17,
    verseZh: "耶和華的聖名是堅固台；義人奔入便得安穩。",
    verseEn: "The name of the LORD is a fortified tower; the righteous run to it and are safe.",
    referenceZh: "箴言 18:10",
    referenceEn: "Proverbs 18:10",
    thoughtZh: "無論外面世事如何紛擾，只要我們回到神面前呼求祂的名，就如同進入了無法攻破的避難所，得享真實的遮蓋與安穩。",
    thoughtEn: "In the name of the Lord is ultimate protection. Whenever feelings of vulnerability strike, run to Him in prayer and find deep sanctuary."
  },
  {
    id: 18,
    verseZh: "你們要先求他的國和他的義，這些東西都要加給你們了。所以，不要為明天憂慮，因為明天自有明天的憂慮；一天的難處一天當就夠了。",
    verseEn: "But seek first his kingdom and his righteousness, and all these things will be given to you as well. Therefore do not worry about tomorrow, for tomorrow will worry about itself.",
    referenceZh: "馬太福音 6:33-34",
    referenceEn: "Matthew 6:33-34",
    thoughtZh: "將生活的焦點調整對準神的心意，明天的主必親自負責明天的事。專注於活好今天、愛好身邊的人，天父自會妥善供應一切所需。",
    thoughtEn: "Anchor your focus on God's kingdom and purpose today. Tomorrow's grace will arrive with tomorrow's dawn; live today in the abundance of His love."
  },
  {
    id: 19,
    verseZh: "耶和華必然等候，要施恩給你們；必然興起，好憐憫你們。因為耶和華是公義的神；凡等候他的都是有福的！",
    verseEn: "Yet the LORD longs to be gracious to you; therefore he will rise up to show you compassion. For the LORD is a God of justice. Blessed are all who wait for him!",
    referenceZh: "以賽亞書 30:18",
    referenceEn: "Isaiah 30:18",
    thoughtZh: "在等候禱告蒙應允的時刻，不要灰心。上帝不是耽延，而是在最美好的時機為您傾倒最適切的恩雨。耐心等候祂的人必不落空！",
    thoughtEn: "Do not lose heart in seasons of waiting. God is never late; He is preparing the perfect timing to pour out His boundless compassion upon you."
  },
  {
    id: 20,
    verseZh: "那賜諸般恩典的神曾在基督裡召你們，得享他永遠的榮耀，等你們暫受苦難之後，必要親自成全你們，堅固你們，賜力量給你們，建立你們。",
    verseEn: "And the God of all grace, who called you to his eternal glory in Christ, after you have suffered a little while, will himself restore you and make you strong, firm and steadfast.",
    referenceZh: "彼得前書 5:10",
    referenceEn: "1 Peter 5:10",
    thoughtZh: "苦難與考驗只是暫時的客旅，神正在其中塑造我們更堅韌成熟的生命。經過試煉後，您必如精金一般閃耀，滿有屬靈的剛強與光彩。",
    thoughtEn: "Current trials are only temporary. God uses each trial to refine our character, strengthen our foundation, and reveal His steadfast love."
  },
  {
    id: 21,
    verseZh: "這是我所立的約：凡敬畏耶和華、遵行他道的人便為有福！你妻子在你的內室，好像多結果子的葡萄樹；你兒女圍繞你的桌子，好像橄欖樹苗。",
    verseEn: "Blessed are all who fear the LORD, who walk in obedience to him. Your wife will be like a fruitful vine within your house; your children will be like olive shoots around your table.",
    referenceZh: "詩篇 128:1,3",
    referenceEn: "Psalm 128:1, 3",
    thoughtZh: "家庭是上帝親手栽植的花園。今天帶著溫柔的心向家人說一句讚賞與感謝的話，神的祝福與喜樂必如同甘霖滋潤您家的每一位成員。",
    thoughtEn: "Family is God's beloved garden. Water it today with kind words, patience, and love; watch God's peace flourish around your home."
  },
  {
    id: 22,
    verseZh: "慈愛和誠實彼此相遇；公義和平安彼此相親。",
    verseEn: "Love and faithfulness meet together; righteousness and peace kiss each other.",
    referenceZh: "詩篇 85:10",
    referenceEn: "Psalm 85:10",
    thoughtZh: "在待人處事上，願基督的愛與誠實引導我們。當我們以仁愛對待他人、以正直保守己心，屬天的和睦與喜樂便在我們當中自然顯明。",
    thoughtEn: "Walk with both kindness and integrity today. Where love and truth meet, God's heavenly peace creates a beautiful atmosphere of reconciliation."
  },
  {
    id: 23,
    verseZh: "他使我的靈魂甦醒，為自己的名引導我走義路。我雖然行過死陰的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。",
    verseEn: "He refreshes my soul. He guides me along the right paths for his name's sake. Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
    referenceZh: "詩篇 23:3-4",
    referenceEn: "Psalm 23:3-4",
    thoughtZh: "就算周圍的環境看似幽暗陰沈，也不必驚惶，因為大牧者正手持恩典的杖與竿在您身旁護衛。幽谷只是通向豐盛之地的必經通道，勇敢前行！",
    thoughtEn: "Dark valleys are not dead ends—they are merely pathways to higher ground. The Shepherd's protective rod and comforting staff are guiding every step."
  },
  {
    id: 24,
    verseZh: "若不是耶和華建造房屋，建造的人就枉然勞力；若不是耶和華看守城池，看守的人就枉然警醒。",
    verseEn: "Unless the LORD builds the house, the builders labor in vain. Unless the LORD watches over the city, the guards stand watch in vain.",
    referenceZh: "詩篇 127:1",
    referenceEn: "Psalm 127:1",
    thoughtZh: "放下焦躁的自我堅持，邀請主成為您工作、家庭與人際關係的首席建築師。在祂的主權之下，每一次的付出都將結出永恆豐盛的果實。",
    thoughtEn: "Invite God to be the master builder of your projects, family, and relationships. With His wisdom laying the cornerstone, your efforts will bear lasting fruit."
  },
  {
    id: 25,
    verseZh: "求你指教我們怎樣數算自己的日子，好叫我們得著智慧的心。",
    verseEn: "Teach us to number our days, that we may gain a heart of wisdom.",
    referenceZh: "詩篇 90:12",
    referenceEn: "Psalm 90:12",
    thoughtZh: "每一個今天都是神賜予的無價禮物。不為昨天悔恨，不為明天憂慮，用心珍惜眼前的每一刻，用愛心去對待身邊遇見的每一個人。",
    thoughtEn: "Today is a precious gift entrusted to your care. Live it with intentionality, warmth, and gratitude, reflecting God's love to everyone you encounter."
  },
  {
    id: 26,
    verseZh: "主耶和華的靈在我身上；因為耶和華用膏膏我，叫我傳好信息給謙卑的人，差遣我醫好傷心的人，報告被擄的得釋放，被囚的出監牢。",
    verseEn: "The Spirit of the Sovereign LORD is on me, because the LORD has anointed me to proclaim good news to the poor. He has sent me to bind up the brokenhearted, to proclaim freedom for the captives.",
    referenceZh: "以賽亞書 61:1",
    referenceEn: "Isaiah 61:1",
    thoughtZh: "今天您就是基督散播愛與香氣的器皿。用一句溫柔的話安慰身邊沮喪的心靈，在小事上流露恩慈，把屬天的盼望帶入周遭世界。",
    thoughtEn: "You are an instrument of Christ's gentle comfort today. A kind word or a patient listening ear can bring healing light to someone carrying a heavy heart."
  },
  {
    id: 27,
    verseZh: "弟兄們，我不是以為自己已經得著了；我只有一件事，就是忘記背後，努力面前的，向著標竿直跑，要得神在基督耶穌裡從上面召我來得的獎賞。",
    verseEn: "Brothers and sisters, I do not consider myself yet to have taken hold of it. But one thing I do: Forgetting what is behind and straining toward what is ahead, I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus.",
    referenceZh: "腓立比書 3:13-14",
    referenceEn: "Philippians 3:13-14",
    thoughtZh: "不要讓過去的遺憾或過犯攔阻您前進的腳步。耶穌的寶血已經赦免了一切，挺起胸膛，定睛在天上的標竿，帶著喜樂奔跑前面的屬天賽程！",
    thoughtEn: "Do not let yesterday's stumbles hold you back. Through Christ's grace you are made new—fix your gaze forward on the heavenly calling and press on with joy!"
  },
  {
    id: 28,
    verseZh: "要常常喜樂，不住的禱告，凡事謝恩；因為這是神在基督耶穌裡向你們所定的旨意。",
    verseEn: "Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
    referenceZh: "帖撒羅尼迦前書 5:16-18",
    referenceEn: "1 Thessalonians 5:16-18",
    thoughtZh: "喜樂、禱告與謝恩是點亮心靈的三重燈火。即使在平凡瑣碎的日常中，當我們數算神的恩典時，生活處處都將充滿奇蹟與美好。",
    thoughtEn: "Joy, prayer, and gratitude are three lanterns that brighten the soul. Count God's blessings even in mundane moments, and your heart will overflow with thankfulness."
  },
  {
    id: 29,
    verseZh: "主耶和華是我的力量；他使我的腳快如母鹿的蹄，又使我穩行在高處。",
    verseEn: "The Sovereign LORD is my strength; he makes my feet like the feet of a deer, he enables me to tread on the heights.",
    referenceZh: "哈巴谷書 3:19",
    referenceEn: "Habakkuk 3:19",
    thoughtZh: "高山險阻不會阻擋倚靠耶和華的人。神必使您的腳步如同母鹿般靈巧穩當，在崎嶇的高處仍能穩步前進，躍上屬靈的高峰！",
    thoughtEn: "Steep mountains cannot stop those who rely on the Lord. He gives you sure-footed grace to navigate rough paths and stride joyfully upon the heights."
  },
  {
    id: 30,
    verseZh: "神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。",
    verseEn: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    referenceZh: "約翰福音 3:16",
    referenceEn: "John 3:16",
    thoughtZh: "在浩瀚宇宙中，造物主如此深切熱烈地愛著您。無論世事如何變遷，這份在十架上被證實的愛永不更改，您是神眼中極為珍貴的至寶！",
    thoughtEn: "You are deeply, unconditionally loved by the Creator of the universe. Anchor your heart in this eternal truth: in Christ, you are cherished beyond measure."
  },
  {
    id: 31,
    verseZh: "願耶和華賜福給你，保護你。願耶和華使他的臉光照你，賜恩給你。願耶和華向你仰臉，賜你平安。",
    verseEn: "The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you; the LORD turn his face toward you and give you peace.",
    referenceZh: "民數記 6:24-26",
    referenceEn: "Numbers 6:24-26",
    thoughtZh: "願這古老而莊嚴的亞倫祝禱成為您今天最真實的遮蓋。願神的榮光常照亮您的道路，祂的慈愛與屬天平安陪伴您及全家，直到永永遠遠！",
    thoughtEn: "May this timeless Aaronic blessing rest upon you and your loved ones today. May the Lord's face shine upon you and grant you boundless peace!"
  }
];

/**
 * Deterministically returns the Daily Devotion for today's date
 * Changes automatically at midnight every day.
 */
export function getTodayDevotion(customDate?: Date): {
  devotion: DailyDevotionItem;
  formattedDateZh: string;
  formattedDateEn: string;
  dayOfYear: number;
} {
  const d = customDate || new Date();
  
  // Calculate day of the year (1 - 366)
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Modulo over the available devotions
  const index = Math.abs(dayOfYear - 1) % DAILY_DEVOTIONS.length;
  const devotion = DAILY_DEVOTIONS[index];

  // Format date nicely
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const formattedDateZh = `${month}月${day}日 ${weekdaysZh[d.getDay()]}`;
  const formattedDateEn = `${monthsEn[d.getMonth()]} ${day}, ${weekdaysEn[d.getDay()]}`;

  return {
    devotion,
    formattedDateZh,
    formattedDateEn,
    dayOfYear
  };
}
