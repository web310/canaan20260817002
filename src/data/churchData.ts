import { Sermon, Ministry, ChurchEvent, PrayerRequest, StatementOfFaith } from '../types';
import { SERMON_CONTENT_LIST, INITIAL_SERMONS, RECENT_SERMONS, SERMONS_DATA_VERSION } from './sermonsData';

export { SERMON_CONTENT_LIST, INITIAL_SERMONS, RECENT_SERMONS, SERMONS_DATA_VERSION };

export const CHURCH_INFO = {
  nameEn: "Canaan Shin Sheng Christian Church",
  nameZh: "加南新生基督教會",
  chineseNameAlt: "Canaan Shin Sheng Christian Church",
  websiteUrl: "www.canaanshinsheng.org",
  annualThemeZh: "同心合一，興旺福音，建造教會",
  annualThemeEn: "United as One, Flourishing the Gospel, Building the Church",
  pastorZh: "孟蘇倫 牧師",
  pastorEn: "Rev. Meng Sulun",
  pastors: [
    { nameZh: "孟蘇倫 牧師", nameEn: "Rev. Meng Sulun", titleZh: "主講牧師", titleEn: "Guest Preacher" },
    { nameZh: "Ito 傳道", nameEn: "Evangelist Ito", titleZh: "傳道", titleEn: "Evangelist" },
    { nameZh: "鄭育青 弟兄", nameEn: "Brother Zheng Yuqing", titleZh: "司會 / 事工同工", titleEn: "Service Presider" },
  ],
  elders: [
    { titleZh: "長老", titleEn: "Elder", nameZh: "萬四 長老", nameEn: "Elder Wan", phone: "(310) 347-2010" },
    { titleZh: "長老", titleEn: "Elder", nameZh: "張文辛 長老", nameEn: "Elder Chang", phone: "(310) 468-3789" },
    { titleZh: "執事", titleEn: "Deacon", nameZh: "馬新民 執事", nameEn: "Deacon Ma", phone: "(310) 989-4528" },
  ],
  address: "25226 S. Western Ave, Harbor City, CA 90710",
  phone1: "(310) 626-6103",
  phone2: "(310) 347-2010",
  email: "web@canaannewlife.org",
  denominationEn: "Christian Church",
  denominationZh: "基督教會 (Christian Church)",
  zoomId: "310-626-6103",
  zoomPasscode: "25226",
  establishedYear: 1984,
  zelleEmail: "ShinShengChurch@Gmail.com",
  zellePhone: "(310) 626-6103",
  checkPayableTo: "Canaan Shin Sheng Christian Church",
  inPersonGivingLocationZh: "禮拜天到教會作禮拜時，在禮拜堂的後面，左右各有一個奉獻箱，可以將奉獻放進裏面，也是教會最鼓勵的方式。",
  inPersonGivingLocationEn: "When attending Sunday service, offering boxes are located at the back of the sanctuary on both the left and right sides. This is our most encouraged way to give.",
  googleMapsUrl: "https://maps.google.com/?q=25226+S.+Western+Ave,+Harbor+City,+CA+90710",
  parkingEntranceZh: "專屬停車場入口位於 W 253rd St（由 Western Ave 轉進 W 253rd St 即可駛入免費停車場）",
  parkingEntranceEn: "Dedicated parking lot entrance is on W 253rd St (Turn into W 253rd St from Western Ave for free on-site parking)",
};

export const WEEKLY_BIBLE_READING = {
  memoryVerseZh: "凡勞苦擔重擔的人，可以到我這裡來，我就使你們得安息。（馬太福音 11:28）",
  memoryVerseEn: "Come to me, all you who are weary and burdened, and I will give you rest. (Matthew 11:28)",
  verseReferenceZh: "馬太福音 11:28",
  verseReferenceEn: "Matthew 11:28",
  verseReference: "馬太福音 11:28 / Matthew 11:28",
  readingRange: "8/24 - 8/30",
  schedule: [
    { date: "8/24 (週一)", dateEn: "8/24 (Mon)", oldTestament: "詩篇 116-118", oldTestamentEn: "Psalms 116-118", newTestament: "哥林多前書 7:1-19", newTestamentEn: "1 Corinthians 7:1-19" },
    { date: "8/25 (週二)", dateEn: "8/25 (Tue)", oldTestament: "詩篇 119:1-88", oldTestamentEn: "Psalms 119:1-88", newTestament: "哥林多前書 7:20-40", newTestamentEn: "1 Corinthians 7:20-40" },
    { date: "8/26 (週三)", dateEn: "8/26 (Wed)", oldTestament: "詩篇 119:89-176", oldTestamentEn: "Psalms 119:89-176", newTestament: "哥林多前書 8", newTestamentEn: "1 Corinthians 8" },
    { date: "8/27 (週四)", dateEn: "8/27 (Thu)", oldTestament: "詩篇 120-122", oldTestamentEn: "Psalms 120-122", newTestament: "哥林多前書 9", newTestamentEn: "1 Corinthians 9" },
    { date: "8/28 (週五)", dateEn: "8/28 (Fri)", oldTestament: "詩篇 123-125", oldTestamentEn: "Psalms 123-125", newTestament: "哥林多前書 10:1-18", newTestamentEn: "1 Corinthians 10:1-18" },
    { date: "8/29 (週六)", dateEn: "8/29 (Sat)", oldTestament: "詩篇 126-128", oldTestamentEn: "Psalms 126-128", newTestament: "哥林多前書 10:19-33", newTestamentEn: "1 Corinthians 10:19-33" },
    { date: "8/30 (週日)", dateEn: "8/30 (Sun)", oldTestament: "詩篇 129-131", oldTestamentEn: "Psalms 129-131", newTestament: "哥林多前書 11:1-16", newTestamentEn: "1 Corinthians 11:1-16" },
  ]
};

export const WEEKLY_SCHEDULE = [
  {
    eventEn: "Sunday Worship Service",
    eventZh: "禮拜聖會 (主日崇拜)",
    timeEn: "Every Sunday at 11:00 AM",
    timeZh: "每個禮拜的星期日 上午 11:00",
    locationEn: "Main Worship Hall / Live Stream",
    locationZh: "主堂禮拜堂 / 線上直播",
  },
  {
    eventEn: "Thursday Online Prayer Meeting",
    eventZh: "線上禱告會 (週四 Zoom)",
    timeEn: "Every Thursday at 8:00 PM",
    timeZh: "每個禮拜四 晚上 8:00",
    locationEn: "Zoom ID: 310-626-6103 (Passcode: 25226)",
    locationZh: "Zoom ID: 310-626-6103 (密碼: 25226)",
  },
  {
    eventEn: "Cell Group Fellowship",
    eventZh: "細胞小組 (每月第1與第3個週六)",
    timeEn: "1st & 3rd Saturday at 2:00 PM",
    timeZh: "每個月第 1 和第 3 個星期六 下午 2:00",
    locationEn: "Member Homes / Church Fellowship Hall",
    locationZh: "弟兄姊妹家中 / 教會副堂",
  },
  {
    eventEn: "Sunday School",
    eventZh: "禮拜前主日學",
    timeEn: "Every Sunday at 10:00 AM",
    timeZh: "每個禮拜的星期日 上午 10:00",
    locationEn: "Main Sanctuary & Classrooms",
    locationZh: "主堂與主日學教室",
  },
  {
    eventEn: "Fellowship Lunch",
    eventZh: "聖徒交通會餐 (愛宴)",
    timeEn: "Every Sunday at 12:30 PM",
    timeZh: "每個禮拜的星期日 下午 12:30",
    locationEn: "Fellowship Dining Hall",
    locationZh: "副堂會餐廳",
  },
  {
    eventEn: "Choir Practice",
    eventZh: "詩班練歌讚美",
    timeEn: "Every Sunday at 1:00 PM",
    timeZh: "每個禮拜的星期日 下午 1:00",
    locationEn: "Choir Room",
    locationZh: "詩班室",
  }
];

// RECENT_SERMONS is managed and re-exported from ./sermonsData.ts for easy GitHub sync

export const MINISTRIES: Ministry[] = [
  {
    id: "sunday-school",
    name: "Sunday School Ministry",
    nameZh: "禮拜前主日學 (成人與兒童)",
    leader: "Sunday School Teachers",
    leaderZh: "主日學教務同工",
    description: "In-depth Bible teaching before morning service, training teachers and lesson preparation for all ages.",
    descriptionZh: "崇拜前的主日學真理教導，裝備弟兄姊妹、栽培主日學講師與備課同工。",
    meetingTime: "Sundays 10:00 AM",
    meetingTimeZh: "星期日 上午 10:00",
    location: "Education Wing Classrooms",
    locationZh: "主堂與教室",
    iconName: "BookOpen",
    tags: ["Education", "Bible Study", "All Ages"]
  },
  {
    id: "worship-choir",
    name: "Choir & Music Ministry",
    nameZh: "詩班獻詩與聖樂讚美",
    leader: "Choir Director",
    leaderZh: "詩班指揮與同工",
    description: "Rehearsing sacred choral anthems and leading congregation praise every Sunday morning.",
    descriptionZh: "每主日早晨與午後進行詩班練歌，引領會眾同心讚美，獻上最美的詩歌。",
    meetingTime: "Sundays 1:00 PM",
    meetingTimeZh: "星期日 下午 1:00",
    location: "Choir Room",
    locationZh: "詩班室",
    iconName: "Music",
    tags: ["Music", "Worship", "Sunday"]
  },
  {
    id: "thursday-prayer",
    name: "Thursday Night Zoom Prayer Meeting",
    nameZh: "週四線上守望禱告會",
    leader: "Pastoral Team",
    leaderZh: "教務同工",
    description: "Gathering online via Zoom every Thursday at 8:00 PM to intercede for church, family health, and community needs.",
    descriptionZh: "每週四晚上 8:00 透過 Zoom 線上連線，同心為肢體健康、空調工程修繕、青年事工與福音外展守望禱告。",
    meetingTime: "Thursdays 8:00 PM",
    meetingTimeZh: "星期四 晚上 8:00",
    location: "Zoom ID: 310-626-6103 (Passcode: 25226)",
    locationZh: "Zoom ID: 310-626-6103 (密碼: 25226)",
    iconName: "HeartHandshake",
    tags: ["Prayer", "Zoom", "Intercession"]
  },
  {
    id: "cell-groups",
    name: "Cell Groups & Small Fellowship",
    nameZh: "細胞小組 (每月第 1 與第 3 個週六)",
    leader: "Cell Group Leaders",
    leaderZh: "小組長與同工",
    description: "Gathering on the 1st and 3rd Saturday of each month for fellowship, Bible discussion, prayer, and caring for member families.",
    descriptionZh: "每個月第 1 與第 3 個星期六下午 2:00 舉行細胞小組，透過聖經研討、生活分享與愛心扶持，建立緊密的屬靈團契。",
    meetingTime: "1st & 3rd Saturday 2:00 PM",
    meetingTimeZh: "每月第 1 與第 3 個星期六 下午 2:00",
    location: "Member Homes / Church",
    locationZh: "弟兄姊妹家中 / 教會副堂",
    iconName: "Users",
    tags: ["Small Group", "Cell", "Fellowship"]
  },
  {
    id: "hiking-group",
    name: "Hiking & Outdoor Wellness Group",
    nameZh: "健行小組 (每月一次)",
    leader: "Outdoor Ministry Team",
    leaderZh: "健行小組同工",
    description: "Monthly Saturday morning trail walks, lunch fellowship, and short spiritual devotions outdoors.",
    descriptionZh: "每月一次於週六上午進行南灣步道健行，享受上帝創造的大自然，並有午餐與短講分享。",
    meetingTime: "Monthly Saturday 9:30 AM",
    meetingTimeZh: "星期六 上午 9:30 (每月一次)",
    location: "South Bay Trails & Parks",
    locationZh: "南灣步道與公園",
    iconName: "Compassion",
    tags: ["Outreach", "Fitness", "Fellowship"]
  },
  {
    id: "youth-ministry",
    name: "NextGen & Youth Ministry",
    nameZh: "青年事工與年輕世代培育",
    leader: "Youth Staff & Pastor",
    leaderZh: "青年事工輔導",
    description: "Nurturing young adults and youth to be rooted in biblical truth and grow together in fellowship.",
    descriptionZh: "帶領更多年輕兄弟姊妹來到教會，在真理中扎根，在團契中彼此扶持、成長，成為神的器皿。",
    meetingTime: "Saturdays / Sundays",
    meetingTimeZh: "週六聚會 / 主日靈修",
    location: "Church Fellowship Hall",
    locationZh: "副堂青少年中心",
    iconName: "Users",
    tags: ["Youth", "NextGen", "Growth"]
  }
];

export const UPCOMING_EVENTS: ChurchEvent[] = [
  {
    id: "event-1",
    title: "Sunday Service & Holy Communion",
    titleZh: "禮拜聖會 (主日崇拜)",
    date: "2026-08-23",
    time: "11:00 AM - 12:30 PM",
    timeZh: "上午 11:00 - 中午 12:30",
    location: "Main Worship Hall / Live Stream",
    locationZh: "主堂禮拜堂 / 線上禮拜",
    description: "Message by Evangelist Tanni: 'A Gentle Whisper in the Wilderness: From Weariness to Renewal' (1 Kings 19:1-18). Followed by fellowship lunch at 12:30 PM.",
    descriptionZh: "談妮傳道主日證道《曠野裡的微聲——從疲憊到更新》（列王記上 19:1-18）。崇拜後備有 12:30 聖徒交通會餐。",
    category: "worship"
  },
  {
    id: "event-2",
    title: "Next Sunday Service: Rev. Zhixia Wan",
    titleZh: "下週主日崇拜 (邀請萬志俠牧師證道)",
    date: "2026-08-30",
    time: "11:00 AM - 12:30 PM",
    timeZh: "上午 11:00 - 中午 12:30",
    location: "Main Worship Hall / Live Stream",
    locationZh: "主堂禮拜堂 / 線上禮拜",
    description: "Inviting Rev. Zhixia Wan for Sunday message. Please pray for her preaching ministry.",
    descriptionZh: "下週將再次邀請萬志俠牧師前來證道，請弟兄姊妹同心代禱預備心。",
    category: "worship"
  },
  {
    id: "event-3",
    title: "Thursday Night Zoom Prayer Meeting",
    titleZh: "週四線上守望禱告會",
    date: "2026-08-27",
    time: "8:00 PM - 9:15 PM",
    timeZh: "晚上 8:00 - 9:15",
    location: "Zoom ID: 310-626-6103 (Passcode: 25226)",
    locationZh: "Zoom ID: 310-626-6103 (密碼: 25226)",
    description: "Intercessory prayer for church venue arrangements, youth ministry, recovering members, and local outreach.",
    descriptionZh: "同心為教會聚會場地與未來發展、年輕事工、跌倒會友康復及同工會守望禱告。請大家踴躍參加。",
    category: "prayer",
    zoomId: "3106266103"
  }
];

export const STATEMENT_OF_FAITH: StatementOfFaith[] = [
  {
    title: "The Holy Trinity",
    titleZh: "三位一體的神",
    content: "We believe in one God, eternally existing in three Persons: Father, Son, and Holy Spirit, co-equal in power and glory.",
    contentZh: "我們相信獨一真神，永恆存在於父、子、聖靈三個位格中，同權、同榮、同尊。",
    verses: ["Matthew 28:19", "2 Corinthians 13:14"]
  },
  {
    title: "Authority of Holy Scripture",
    titleZh: "聖經的權威",
    content: "We believe the Bible, both Old and New Testaments, is the divinely inspired, infallible Word of God and supreme rule for faith and living.",
    contentZh: "我們相信新舊約聖經皆為上帝所默示的無誤神的話語，是我們信仰與生活的最高準則。",
    verses: ["2 Timothy 3:16-17", "Psalm 119:105"]
  },
  {
    title: "Salvation Through Christ Alone",
    titleZh: "唯獨基督的救恩",
    content: "We believe salvation is received purely by grace through faith in Jesus Christ, who died for our sins and rose bodily from the dead.",
    contentZh: "我們相信拯救唯獨靠著神的恩典、因信耶穌基督而得，耶穌為我們的罪釘死在十字架上，並從死裡身體復活。",
    verses: ["Ephesians 2:8-9", "John 14:6"]
  },
  {
    title: "The Church & Great Commission",
    titleZh: "教會與大使命",
    content: "We believe the Church is the body of Christ called to worship God, build up believers, love our neighbors, and make disciples of all nations.",
    contentZh: "我們相信教會是基督的身體，受召敬拜神、建立信徒、愛鄰舍，並廣傳福音使萬民作主的門徒。",
    verses: ["Matthew 28:18-20", "Hebrews 10:24-25"]
  }
];

export const CHURCH_HISTORY_MILESTONES = [
  {
    year: "1984",
    titleEn: "Founding of Canaan Shin Sheng",
    titleZh: "加南新生基督教會創立",
    descEn: "Established as a gospel beacon serving South Bay Taiwanese and Chinese families, holding its inaugural worship service.",
    descZh: "於南灣地區成立，舉行首屆開拓主日崇拜，成為事奉華人與台胞家庭的福音燈塔。"
  },
  {
    year: "1996",
    titleEn: "Sanctuary Acquisition in Harbor City",
    titleZh: "購入海港城現址聖堂",
    descEn: "Acquired and dedicated the permanent church facility located at 25226 S. Western Ave, Harbor City, CA.",
    descZh: "順利購得位於 Harbor City S. Western Ave 現址之自屬聖堂，展開定居深耕與社區宣教。"
  },
  {
    year: "2012",
    titleEn: "Established Christian Church",
    titleZh: "自立基督教會",
    descEn: "Operating as a Christian church led by the board of elders, deacons, and pastoral team.",
    descZh: "成為基督教會，由長執同工會與事工同工共同推動教牧與社區宣教事工。"
  },
  {
    year: "2026",
    titleEn: "United as One, Flourishing the Gospel",
    titleZh: "同心合一，興旺福音，建造教會",
    descEn: "Continuing under our annual theme to build up youth, strengthen Sunday school, update facilities, and praise God together.",
    descZh: "以「同心合一，興旺福音，建造教會」為標題，更新冷氣設備與招牌，推動青年事工、健行小組與週四線上禱告會。"
  }
];

export const INITIAL_PRAYERS: PrayerRequest[] = [
  {
    id: "prayer-1",
    author: "教會同工會",
    authorZh: "教會同工會",
    authorEn: "Church Board",
    category: "general",
    title: "為教會場地租約後續安排與未來聚會發展代禱",
    titleZh: "為教會場地租約後續安排與未來聚會發展代禱",
    titleEn: "Prayer for Lease Transition & Future Gathering Path",
    content: "因 C3 教會總部方面的規劃，我們教會與 C3 教會的租約將於 9/6 結束。求主親自帶領後續各項安排，也求主使這次的變動對 C3 教會及我們教會都有所助益，並為我們教會未來的聚會場地與發展預備合適的道路。",
    contentZh: "因 C3 教會總部方面的規劃，我們教會與 C3 教會的租約將於 9/6 結束。求主親自帶領後續各項安排，也求主使這次的變動對 C3 教會及我們教會都有所助益，並為我們教會未來的聚會場地與發展預備合適的道路。",
    contentEn: "Due to plans from C3 headquarters, our lease with C3 will end on September 6. Pray that the Lord leads all subsequent arrangements, making this change beneficial to both churches, and paving the right path for future venues and ministry growth.",
    date: "2026-08-23",
    isConfidential: false,
    prayedCount: 42
  },
  {
    id: "prayer-2",
    author: "教育部同工",
    authorZh: "教育部同工",
    authorEn: "Christian Education Team",
    category: "faith",
    title: "為青年與年輕事工發展守望代禱",
    titleZh: "為青年與年輕事工發展守望代禱",
    titleEn: "Prayer for NextGen & Youth Ministry Development",
    content: "求主帶領發展年輕事工，預備合適的同工與方向，吸引更多年輕人來教會，在真理中成長、彼此扶持。求主賜下智慧與力量，使年輕事工穩健發展，成為教會的祝福。",
    contentZh: "求主帶領發展年輕事工，預備合適的同工與方向，吸引更多年輕人來教會，在真理中成長、彼此扶持。求主賜下智慧與力量，使年輕事工穩健發展，成為教會的祝福。",
    contentEn: "Pray for the Lord to guide the development of youth ministry, preparing suitable leaders and directions to attract more young people to church to grow in truth and support each other. May He grant wisdom and strength for stable growth.",
    date: "2026-08-23",
    isConfidential: false,
    prayedCount: 36
  },
  {
    id: "prayer-3",
    author: "關懷同工小組",
    authorZh: "關懷同工小組",
    authorEn: "Member Care Team",
    category: "health",
    title: "為近日跌倒會友（Lois、談妮傳道母親及先生）醫治與康復代禱",
    titleZh: "為近日跌倒會友（Lois、談妮傳道母親及先生）醫治與康復代禱",
    titleEn: "Prayer for Healing & Recovery for Fall-Injured Members and Families",
    content: "為近日跌倒的會友，包括 Lois、談妮傳道的母親及先生代禱，求主親自保守、醫治與扶持，使他們身體得著恢復，減少疼痛與不適，也保守後續的檢查、治療及休養都順利。",
    contentZh: "為近日跌倒的會友，包括 Lois、談妮傳道的母親及先生代禱，求主親自保守、醫治與扶持，使他們身體得著恢復，減少疼痛與不適，也保守後續的檢查、治療及休養都順利。",
    contentEn: "Please pray for members and families who recently experienced falls, including Lois, Evangelist Tanni's mother, and her husband. May the Lord grant healing, relieve pain, and bless all upcoming medical care and rehabilitation.",
    date: "2026-08-23",
    isConfidential: false,
    prayedCount: 39
  },
  {
    id: "prayer-4",
    author: "教務同工",
    authorZh: "教務同工",
    authorEn: "Pastoral Ministry Team",
    category: "thanksgiving",
    title: "為下週萬志俠牧師證道服事與會眾心靈預備代禱",
    titleZh: "為下週萬志俠牧師證道服事與會眾心靈預備代禱",
    titleEn: "Prayer for Rev. Zhixia Wan's Preaching Ministry Next Sunday",
    content: "下週將再次邀請萬志俠牧師前來證道，請弟兄姊妹代禱，求主賜福她的服事，賜下智慧與力量，忠心傳講神的話語，也預備我們的心，明白並遵行主的旨意。",
    contentZh: "下週將再次邀請萬志俠牧師前來證道，請弟兄姊妹代禱，求主賜福她的服事，賜下智慧與力量，忠心傳講神的話語，也預備我們的心，明白並遵行主的旨意。",
    contentEn: "Next week we have invited Rev. Zhixia Wan to preach. Pray that the Lord blesses her ministry with wisdom and power, faithfully preaching God's Word, and prepares our hearts to understand and obey His will.",
    date: "2026-08-23",
    isConfidential: false,
    prayedCount: 31
  },
  {
    id: "prayer-5",
    author: "宣教外展組",
    authorZh: "宣教外展組",
    authorEn: "Outreach & Missions Team",
    category: "family",
    title: "為每週四晚上 8:00 線上 Zoom 守望禱告會代禱",
    titleZh: "為每週四晚上 8:00 線上 Zoom 守望禱告會代禱",
    titleEn: "Prayer for Thursday 8:00 PM Zoom Intercessory Meeting",
    content: "邀請全體弟兄姊妹同心參加週四線上禱告會 (Zoom ID: 310-626-6103 / 密碼: 25226)，同心為教會聖工、場地轉換、肢體健康與年輕事工守望。",
    contentZh: "邀請全體弟兄姊妹同心參加週四線上禱告會 (Zoom ID: 310-626-6103 / 密碼: 25226)，同心為教會聖工、場地轉換、肢體健康與年輕事工守望。",
    contentEn: "Inviting all brothers and sisters to join our Thursday online prayer meeting (Zoom ID: 310-626-6103 / Passcode: 25226) to intercede for church transition, family health, and next-gen outreach.",
    date: "2026-08-23",
    isConfidential: false,
    prayedCount: 28
  }
];
