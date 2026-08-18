import { Sermon, Ministry, ChurchEvent, PrayerRequest, StatementOfFaith } from '../types';
import { INITIAL_SERMONS, RECENT_SERMONS, SERMONS_DATA_VERSION } from './sermonsData';

export { INITIAL_SERMONS, RECENT_SERMONS, SERMONS_DATA_VERSION };

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
  denominationEn: "Independent Christian Church",
  denominationZh: "獨立基督教會 (Independent Church)",
  zoomId: "310-626-6103",
  zoomPasscode: "25226",
  establishedYear: 1984,
  zelleEmail: "ShinShengChurch@Gmail.com",
  zellePhone: "(310) 626-6103",
  checkPayableTo: "Canaan Shin Sheng Christian Church",
  googleMapsUrl: "https://maps.google.com/?q=25226+S.+Western+Ave,+Harbor+City,+CA+90710",
  parkingEntranceZh: "專屬停車場入口位於 W 253rd St（由 Western Ave 轉進 W 253rd St 即可駛入免費停車場）",
  parkingEntranceEn: "Dedicated parking lot entrance is on W 253rd St (Turn into W 253rd St from Western Ave for free on-site parking)",
};

export const WEEKLY_BIBLE_READING = {
  memoryVerseZh: "所以，弟兄們，我以神的慈悲勸你們，將身體獻上，當作活祭，是聖潔的，是神所喜悅的；你們如此事奉乃是理所當然的。（羅馬書 12:1）",
  memoryVerseEn: "Therefore, I urge you, brothers and sisters, in view of God’s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship. (Romans 12:1)",
  verseReference: "羅馬書 12:1 / Romans 12:1",
  readingRange: "8/17 - 8/23",
  schedule: [
    { date: "8/17 (週一)", oldTestament: "詩篇 97-99", newTestament: "羅馬書 16:1-16" },
    { date: "8/18 (週二)", oldTestament: "詩篇 100-101", newTestament: "羅馬書 16:17-27" },
    { date: "8/19 (週三)", oldTestament: "詩篇 102", newTestament: "哥林多前書 1:1-17" },
    { date: "8/20 (週四)", oldTestament: "詩篇 103", newTestament: "哥林多前書 1:18-31" },
    { date: "8/21 (週五)", oldTestament: "詩篇 104", newTestament: "哥林多前書 2" },
    { date: "8/22 (週六)", oldTestament: "詩篇 105", newTestament: "哥林多前書 3" },
    { date: "8/23 (週日)", oldTestament: "詩篇 106", newTestament: "哥林多前書 4" },
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
    date: "2026-08-16",
    time: "11:00 AM - 12:30 PM",
    timeZh: "上午 11:00 - 中午 12:30",
    location: "Main Worship Hall / Live Stream",
    locationZh: "主堂禮拜堂 / 線上禮拜",
    description: "Presided by Brother Zheng Yuqing, message by Evangelist Ito. Followed by fellowship lunch at 12:30 PM.",
    descriptionZh: "由鄭育青弟兄司會，Ito 傳道證道分享神的話語。崇拜後備有 12:30 聖徒交通會餐。",
    category: "worship"
  },
  {
    id: "event-2",
    title: "Thursday Night Zoom Prayer Meeting",
    titleZh: "週四線上守望禱告會",
    date: "2026-08-13",
    time: "8:00 PM - 9:15 PM",
    timeZh: "晚上 8:00 - 9:15",
    location: "Zoom ID: 310-626-6103 (Passcode: 25226)",
    locationZh: "Zoom ID: 310-626-6103 (密碼: 25226)",
    description: "Intercessory prayer for church facility upgrades, youth ministry, sick members, and local outreach.",
    descriptionZh: "同心為教會冷氣安裝工程、青年事工、同工會及肢體健康守望禱告。請大家踴躍參加。",
    category: "prayer",
    zoomId: "3106266103"
  },
  {
    id: "event-3",
    title: "Cell Group Fellowship Gathering",
    titleZh: "細胞小組聚會 (每月兩次)",
    date: "2026-08-22",
    time: "2:00 PM - 4:00 PM",
    timeZh: "下午 2:00 - 4:00",
    location: "Fellowship Hall & Member Homes",
    locationZh: "教會副堂與弟兄姊妹家中",
    description: "Bi-weekly cell group discussion, prayer, and encouragement.",
    descriptionZh: "每月兩次的小組查經分享與愛心關懷，歡迎同心建造。",
    category: "fellowship"
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
    titleEn: "Independent Nondenominational Church",
    titleZh: "自立獨立基督教會",
    descEn: "Operating as an independent nondenominational Christian church led by the board of elders, deacons, and pastoral team.",
    descZh: "成為獨立基督教會，由長執同工會與事工同工共同推動教牧與社區宣教事工。"
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
    category: "general",
    title: "為教會冷氣安裝工程與招牌設計製作代禱",
    content: "感謝神恩領！大堂冷氣已順利完成安裝，目前正進行外牆與主招牌之設計規劃，求主賜下設計與施工同工智慧，使一切工程順暢安全、榮神益人。",
    date: "2026-08-16",
    isConfidential: false,
    prayedCount: 38
  },
  {
    id: "prayer-2",
    author: "教育部同工",
    category: "faith",
    title: "為青年事工與主日學備課同工守望代禱",
    content: "求主聖靈動工，帶領更多年輕弟兄姊妹來到教會在真理中扎根，在團契中彼此相愛；並賜智慧與愛心給主日學講師與備課同工，同心渴慕神的話語。",
    date: "2026-08-15",
    isConfidential: false,
    prayedCount: 32
  },
  {
    id: "prayer-3",
    author: "關懷同工小組",
    category: "health",
    title: "為長老執事與全體會友身體健康關懷代禱",
    content: "請為萬四長老、張文辛長老、馬新民執事及年長、身體欠安的弟兄姊妹代禱，求主施恩醫治，賜下出人意外的平安、充沛體力與喜樂心靈。",
    date: "2026-08-14",
    isConfidential: false,
    prayedCount: 29
  },
  {
    id: "prayer-4",
    author: "教務同工",
    category: "thanksgiving",
    title: "為每週四晚上 8:00 線上 Zoom 禱告會守望",
    content: "邀請全體弟兄姊妹同心參加週四線上禱告會 (Zoom ID: 310-626-6103 / 密碼: 25226)，同心為教會聖工、家庭和宣教事工代求。",
    date: "2026-08-13",
    isConfidential: false,
    prayedCount: 25
  },
  {
    id: "prayer-5",
    author: "宣教外展組",
    category: "family",
    title: "為每月兩次細胞小組與健行團契外展代禱",
    content: "為週六下午細胞小組生活聚會與南灣步道健行小組代禱，願透過愛心交通與大自然健走，接觸更多慕道朋友與家庭，傳揚主愛。",
    date: "2026-08-12",
    isConfidential: false,
    prayedCount: 21
  }
];
