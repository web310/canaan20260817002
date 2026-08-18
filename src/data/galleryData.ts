import { GalleryPhoto, GalleryCategory, GoogleAlbum } from '../types';
import choirImg from '../assets/images/canaan_worship_choir_1786671374150.jpg';
import baptismImg from '../assets/images/canaan_baptism_service_1786671385015.jpg';
import retreatImg from '../assets/images/canaan_retreat_camp_1786671399070.jpg';
import christmasImg from '../assets/images/canaan_christmas_praise_1786671410013.jpg';
import feastImg from '../assets/images/canaan_love_feast_1786671419624.jpg';
import familyImg from '../assets/images/canaan_family_sunday_1786671430385.jpg';
import fellowshipImg from '../assets/images/canaan_fellowship_1786434097997.jpg';
import cellGroupImg from '../assets/images/chinese_fellowship_photo_1786495882516.jpg';
import churchHeroImg from '../assets/images/canaan_church_hero_1786434083190.jpg';
import outdoorImg from '../assets/images/chinese_church_hero_1786495867006.jpg';

export const GOOGLE_PHOTOS_HISTORICAL_ALBUM_URL = "https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7";
export const GOOGLE_SITES_GALLERY_URL = "https://sites.google.com/a/canaannewlife.org/cnl/%E7%85%A7%E7%89%87%E8%B5%B0%E5%BB%8A";
export const GOOGLE_PHOTOS_DEFAULT_URL = "https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7";

// Church Google Photos Albums with direct links and details
export const INITIAL_GOOGLE_ALBUMS: GoogleAlbum[] = [
  {
    id: 'album-2015-dumplings',
    date: '2015-03-21',
    titleZh: '包水餃活動',
    titleEn: 'Dumpling Making Fellowship',
    albumUrl: 'https://photos.app.goo.gl/fVquNuixhEV9E2s36',
    coverImageUrl: feastImg,
    category: 'fellowship',
    descriptionZh: '2015年3月21日弟兄姊妹齊聚一堂包水餃，溫馨交通與主內團契美好時光。',
    descriptionEn: 'Brothers and sisters gathered for joyful dumpling making and sweet fellowship in Christ.'
  },
  {
    id: 'album-2015-easter-outdoor',
    date: '2015-04-05',
    titleZh: 'RPV的Hesse Park舉行復活節野外禮拜',
    titleEn: 'Easter Outdoor Worship at Hesse Park (RPV)',
    albumUrl: 'https://photos.app.goo.gl/Y1tftVX8Aimc1umi7',
    coverImageUrl: outdoorImg,
    category: 'outdoor',
    descriptionZh: '2015年4月5日復活節主日於 Rancho Palos Verdes Hesse Park 舉行戶外崇拜與草地野餐。',
    descriptionEn: 'Joyful Easter outdoor service and scenic picnic at Hesse Park in Rancho Palos Verdes.'
  },
  {
    id: 'album-2015-big-bear-retreat',
    date: '2015-05-29',
    titleZh: '大熊湖靈修會',
    titleEn: 'Big Bear Lake Spiritual Retreat',
    albumUrl: 'https://photos.app.goo.gl/3vpzX6JWTuXpb1eM8',
    coverImageUrl: retreatImg,
    category: 'retreat',
    descriptionZh: '2015年5月29日大熊湖退修會營會，在山明水秀中親近主，領受屬靈更新與豐盛恩典。',
    descriptionEn: 'Spiritual retreat at Big Bear Lake drawing close to God in prayer, quiet reflection, and fellowship.'
  },
  {
    id: 'album-2016-thanksgiving',
    date: '2016-11-24',
    titleZh: '感恩節一家一菜聚會',
    titleEn: '2016 Thanksgiving Potluck',
    albumUrl: 'https://photos.app.goo.gl/fKoVTZqTc1uVrJTeA',
    coverImageUrl: christmasImg,
    category: 'christmas',
    descriptionZh: '2016年感恩節全教會愛宴，每家預備一道佳餚一同數算神恩，同享主內喜樂。',
    descriptionEn: '2016 Thanksgiving Potluck dinner celebrating God’s faithful provision and love.'
  },
  {
    id: 'album-robotics-camp',
    date: '2018-07-15',
    titleZh: '機器人科技營',
    titleEn: 'Robotics & Science Camp',
    albumUrl: 'https://photos.app.goo.gl/JAexLD9A5wNyfdd69',
    coverImageUrl: churchHeroImg,
    category: 'children',
    descriptionZh: '加南兒童主日學與機器人科技營，激發孩童創造力與科技啟發，建立神喜悅的智慧品格。',
    descriptionEn: 'Hands-on robotics camp and STEM learning inspiring youth with creativity and Biblical values.'
  },
  {
    id: 'album-2023-small-group',
    date: '2023-02-18',
    titleZh: '2023 2月小組聚會',
    titleEn: 'February Small Group Fellowship 2023',
    albumUrl: 'https://photos.app.goo.gl/Snc8FnTzCvqKV68q9',
    coverImageUrl: cellGroupImg,
    category: 'fellowship',
    descriptionZh: '2023年2月家庭小組團契聚會，讀經分享、彼此代禱、同沐主恩。',
    descriptionEn: 'Warm small group gathering for Bible study, prayers, and community fellowship in Christ.'
  }
];

// Categories directly structured according to Canaan Official Google Sites Gallery
// and Church Ministries
export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { key: 'all', labelZh: '全部照片', labelEn: 'All Photos', icon: 'Sparkles', isSystem: true },
  { key: 'worship', labelZh: '主日崇拜與聖禮', labelEn: 'Worship & Sacraments', icon: 'Church' },
  { key: 'fellowship', labelZh: '團契與小組生活', labelEn: 'Fellowship & Small Groups', icon: 'Users' },
  { key: 'children', labelZh: '兒童主日學與機器人', labelEn: 'Children & Robotics', icon: 'Bot' },
  { key: 'retreat', labelZh: '靈修退修會營會', labelEn: 'Spiritual Retreats', icon: 'Sun' },
  { key: 'christmas', labelZh: '耶誕節與節慶愛宴', labelEn: 'Christmas & Love Feast', icon: 'Gift' },
  { key: 'outdoor', labelZh: '室外禮拜與野餐', labelEn: 'Outdoor Worship & Picnic', icon: 'Trees' },
  { key: 'lunar', labelZh: '農曆新年新春聚會', labelEn: 'Lunar New Year', icon: 'Utensils' },
  { key: 'heritage', labelZh: '教會歷史與台福加盟', labelEn: 'Church History & EFC', icon: 'History' },
];

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [
  // 1. 本地照片 (Local Church Photos)
  {
    id: 'canaan-worship-choir',
    title: 'Sunday Worship Choir & Sanctuary Praise',
    titleZh: '主日崇拜詩班讚美與主堂禮拜',
    category: 'worship',
    date: '2024-05',
    imageUrl: choirImg,
    description: 'Brothers and sisters lifting their voices in worship, praising God with hymns and reverent prayer at Canaan Shin Sheng Christian Church.',
    descriptionZh: '加南新生基督教會主日崇拜，詩班同心獻詩，全體會眾同唱讚美聖詩，在莊嚴與喜樂中朝見三一真神。',
    albumName: 'Sunday Worship & Sacraments',
    albumNameZh: '主日崇拜與聖禮',
    location: 'Main Sanctuary, 25226 S. Western Ave',
    locationZh: '加南教會大禮拜堂',
    source: 'local'
  },
  {
    id: 'canaan-baptism-service',
    title: 'Holy Communion & Baptismal Service',
    titleZh: '聖餐聖禮與受洗歸主浸禮聖會',
    category: 'worship',
    date: '2024-03',
    imageUrl: baptismImg,
    description: 'Reverent communion service and joyful baptism celebrating new lives in Christ Jesus.',
    descriptionZh: '主日聖餐紀念主耶穌在十字架上的捨命大愛，並見證新受洗弟兄姊妹歸入基督名下的喜樂與新生。',
    albumName: 'Sacraments & Baptism',
    albumNameZh: '主日崇拜與聖禮',
    location: 'Main Sanctuary Pulpit',
    locationZh: '加南教會大禮拜堂聖台',
    source: 'local'
  },
  {
    id: 'canaan-retreat-camp',
    title: 'Annual Church Spiritual Retreat & Mountain Camp',
    titleZh: '全教會靈修退修會營會與清晨親近神',
    category: 'retreat',
    date: '2023-08',
    imageUrl: retreatImg,
    description: 'Church members gathering in the quiet mountain retreat for spiritual renewal, prayer, and deep fellowship.',
    descriptionZh: '全體會友在清幽營地親近神，透過專題研討、晨更靈修與同心禱告，靈命得蒙深切更新，重新得力。',
    albumName: 'Spiritual Retreat Camp',
    albumNameZh: '靈修退修會營會',
    location: 'California Retreat Center Grounds',
    locationZh: '加州山區靈修營地',
    source: 'local'
  },
  {
    id: 'canaan-christmas-praise',
    title: 'Christmas Praise Celebration & Candlelight Caroling',
    titleZh: '耶誕節感恩讚美禮拜與燭光報佳音',
    category: 'christmas',
    date: '2023-12',
    imageUrl: christmasImg,
    description: 'Celebrating the birth of Jesus Christ with joyful choir anthems, candlelight carols, and community blessings.',
    descriptionZh: '聖誕佳節全教會歡聚慶祝救主耶穌基督降生，以燭光頌歌、聖誕詩班與報佳音向社區傳遞和平與盼望。',
    albumName: 'Christmas Celebration & Feast',
    albumNameZh: '耶誕節與節慶愛宴',
    location: 'Main Sanctuary',
    locationZh: '加南教會大禮拜堂',
    source: 'local'
  },
  {
    id: 'canaan-love-feast',
    title: 'Sunday Fellowship Love Feast & Dining Fellowship',
    titleZh: '主日聖徒交通愛宴與豐盛會餐',
    category: 'christmas',
    date: '2024-04',
    imageUrl: feastImg,
    description: 'Congregation enjoying warm fellowship meal together after Sunday service, sharing love and thanksgiving.',
    descriptionZh: '主日崇拜結束後同工備辦豐盛美味愛宴，弟兄姊妹同桌交通，其樂融融，彰顯主內一家親。',
    albumName: 'Fellowship Love Feast',
    albumNameZh: '耶誕節與節慶愛宴',
    location: 'Fellowship Dining Hall',
    locationZh: '教會副堂愛筵廳',
    source: 'local'
  },
  {
    id: 'canaan-family-sunday',
    title: 'Children Sunday School & Creative Robotics Workshop',
    titleZh: '兒童主日學歡樂敬拜與機器人探索課程',
    category: 'children',
    date: '2024-02',
    imageUrl: familyImg,
    description: 'Nurturing the next generation with Bible stories, worship songs, and engaging STEM robotics activities.',
    descriptionZh: '主日學老師悉心教導孩子聖經真理，結合兒童機器人科學創意課程，在愛與探索中健康成長。',
    albumName: 'Children & NextGen Ministry',
    albumNameZh: '兒童主日學與機器人',
    location: 'Youth & Children Center',
    locationZh: '兒童事工副堂教室',
    source: 'local'
  },
  {
    id: 'canaan-cell-group',
    title: 'Home Cell Group Bible Study & Prayer Meeting',
    titleZh: '家庭細胞小組查經交通與同心代禱',
    category: 'fellowship',
    date: '2024-01',
    imageUrl: cellGroupImg,
    description: 'Small group gathering in homes for Bible study, life testimony sharing, and caring prayer support.',
    descriptionZh: '每兩週於弟兄姊妹家中舉行家庭小組聚會，深入研讀經文、切實相愛、互相代禱扶持。',
    albumName: 'Cell Group Fellowship',
    albumNameZh: '團契與小組生活',
    location: 'Member Homes & Fellowship Lounge',
    locationZh: '小組家庭與團契室',
    source: 'local'
  },
  {
    id: 'canaan-fellowship-joy',
    title: 'Joyful Brothers & Sisters Fellowship Time',
    titleZh: '弟兄姊妹喜樂團契交通與關懷分享',
    category: 'fellowship',
    date: '2023-11',
    imageUrl: fellowshipImg,
    description: 'Warm Christian fellowship sharing God\'s grace, mutual encouragement, and spiritual companionship.',
    descriptionZh: '團契聚會中彼此勉勵，數算神的恩典與慈愛，在基督裡建立深厚屬靈情誼。',
    albumName: 'Fellowship & Community',
    albumNameZh: '團契與小組生活',
    location: 'Fellowship Lounge',
    locationZh: '教會交誼大廳',
    source: 'local'
  },
  {
    id: 'canaan-outdoor-picnic',
    title: 'Outdoor Nature Worship Service & Family Picnic',
    titleZh: '室外禮拜：公園野外崇拜與主內家庭野餐',
    category: 'outdoor',
    date: '2023-06',
    imageUrl: outdoorImg,
    description: 'Annual outdoor worship in the park, praising God under open skies and enjoying family games.',
    descriptionZh: '全教會前往公園舉行戶外野外崇拜，在藍天綠蔭下歌頌造物主，享受烤肉野餐與戶外活動。',
    albumName: 'Outdoor Worship & Picnic',
    albumNameZh: '室外禮拜與野餐',
    location: 'Community Regional Park, CA',
    locationZh: '加州社區綠地公園',
    source: 'local'
  },
  {
    id: 'canaan-church-heritage',
    title: 'Church History & EFC 1st Anniversary Milestone',
    titleZh: '教會歷史里程碑：加盟台福一週年感恩紀念',
    category: 'heritage',
    date: '2013-10',
    imageUrl: churchHeroImg,
    description: 'Commemorating church dedication, history, and anniversary of joining Evangelical Formosan Church.',
    descriptionZh: '數算加南新生基督教會自 1984 年建堂以來神的豐富恩典，長執同工同心奉獻事奉。',
    albumName: 'Church History & Heritage',
    albumNameZh: '教會歷史與台福加盟',
    location: 'Main Sanctuary Pulpit',
    locationZh: '教會大禮拜堂聖台',
    source: 'local'
  },

  // 2. 歷史走廊 Google Photos 相簿集相片
  {
    id: 'gp-canaan-groups-1',
    title: '2023 Small Group Fellowship & Home Gatherings',
    titleZh: '2023 加南家庭小組聚會與肢體交通',
    category: 'fellowship',
    date: '2023-08',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOnZK92G9Askuyq9kjfEejC-NoUpRZvccN8ANTt8IV9ZzCD9A_yT7kARvB39obsIKaYpA116HiJsdDd3E6BA_tmkRSta7BUaGk1K6yiQqSbRzrbXQ=w1200-h800',
    fallbackImageUrl: cellGroupImg,
    description: '2023 Church small group gatherings in homes and fellowship rooms, sharing testimonies, Bible study, and prayers.',
    descriptionZh: '加南新生基督教會 2023 年度小組聚會，弟兄姊妹在家庭與團契室查考神的話語、同心代禱，分享生命見證。',
    albumName: '2023 Small Groups',
    albumNameZh: '2023 小組聚會',
    location: 'Canaan Fellowship Hall & Member Homes',
    locationZh: '教會副堂與弟兄姊妹家庭',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-robotics-1',
    title: 'Children STEM & Robotics Learning Workshop',
    titleZh: '兒童機器人課程與創意啟蒙工作坊',
    category: 'children',
    date: '2023-06',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczNCdrrM7g4nl7SZv2zLC09tYyx2_CoPvUXIxT1RItjPNGbCV5kDsTNpvmjnWOxYKiiGrQFXv1Ke98aSPcVVj1xL4jfEx9nw-w2lqcUpo36eCH5eWw=w1200-h800',
    fallbackImageUrl: familyImg,
    description: 'Children exploring robotics and science with creative hands-on projects, fostering teamwork and Christian values.',
    descriptionZh: '加南教會開辦兒童機器人與科學探索課程，透過動手實作啟發孩子們的探索精神，融入信仰價值觀與品格教育。',
    albumName: 'Children Robotics & NextGen',
    albumNameZh: '兒童機器人課程',
    location: 'Youth & Children Center',
    locationZh: '兒童事工教室',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-christmas-1',
    title: '2016 Christmas Celebration & Nativity Service',
    titleZh: '2016 耶誕節讚美禮拜與救主降生慶典',
    category: 'christmas',
    date: '2016-12',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPflx4_FBmw0Z-h9-2YbRBrEy2YVoWSyomPpNoE_z-1p8cOaBhswEQIyU3Lm7ulqGHJ2CsLqCnmzuplQuTIGLT2_cu4PkcZsBLNDR79tfNQ9d1TPw=w1200-h800',
    fallbackImageUrl: christmasImg,
    description: 'Celebrating the birth of our Savior Jesus Christ with choir anthems, candlelight, and joyous carols in 2016.',
    descriptionZh: '2016 年全教會齊聚舉行聖誕節感恩讚美禮拜，以詩班頌歌與燭光紀念救主耶穌基督降生，傳揚平安佳音。',
    albumName: '2016 Christmas Celebration',
    albumNameZh: '2016 耶誕節',
    location: 'Main Sanctuary',
    locationZh: '教會大禮拜堂',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-christmas-2',
    title: '2016 Christmas Love Feast & Fellowship Banquet',
    titleZh: '2016 耶誕節愛宴豐盛會餐與主內同歡',
    category: 'christmas',
    date: '2016-12',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPrP1tOWPCYuLbzsgk781isgsWajgYvim6ng4ywVD9gg43dI80Zcbr2GDf1zNkB3hlHZZ4GR7Jk1GZ59Eiq2Sqor1XgoJpd6S_ZOMIghmO8VYS3HQ=w1200-h800',
    fallbackImageUrl: feastImg,
    description: '2016 Christmas Fellowship banquet where church families enjoyed delicious dishes and blessed fellowship together.',
    descriptionZh: '2016 年聖誕禮拜後舉行全教會愛宴，同工們精心備辦豐盛美食，弟兄姊妹同桌互祝聖誕蒙恩。',
    albumName: '2016 Christmas Love Feast',
    albumNameZh: '2016 耶誕節愛宴',
    location: 'Fellowship Dining Hall',
    locationZh: '教會副堂愛筵餐廳',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-retreat-1',
    title: '2015 Spiritual Retreat Part 1: Quiet Time & Devotion',
    titleZh: '2015 靈修會-1：親近恩主與晨更靈修',
    category: 'retreat',
    date: '2015-08',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczNYpMwIWlZ8yGDsaX_tUxkc-x76v4fZ5HgKy4drK_kf790xzCFxdet9b07_mkTK_7ZnDM4A8EAo-tc31bxH31VSHdtDCk2LnjDtiC_bldW7QTdmxQ=w1200-h800',
    fallbackImageUrl: retreatImg,
    description: '2015 Church Spiritual Retreat in the quiet mountains, spending dedicated time in prayer and biblical reflection.',
    descriptionZh: '2015 年加南全教會靈修退修營（第一部分），營友們在晨曦中親近神，聆聽主聲，靈裡深得甦醒。',
    albumName: '2015 Spiritual Retreat 1',
    albumNameZh: '2015 靈修會-1',
    location: 'Retreat Center Mountain Grounds',
    locationZh: '加州靈修營地',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-retreat-2',
    title: '2015 Spiritual Retreat Part 2: Workshops & Seminars',
    titleZh: '2015 靈修會-2：專題研討與真理造就',
    category: 'retreat',
    date: '2015-08',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczP767jj2syfE3wzeNulP8b9vJ6Kt106VTnckUIc9Jqsj_8RLiAWdTRHkWAMwpxU5uGWiV0Jc939bfM9kKikK79l0LqgiNIJIchHZPOyuOlOoNc_0Q=w1200-h800',
    fallbackImageUrl: retreatImg,
    description: 'In-depth spiritual seminars and small group discussions diving into God\'s Word during the 2015 retreat.',
    descriptionZh: '2015 靈修會第二部分：講員深入宣講真理專題，分組熱烈探討屬靈操練，堅定信仰根基。',
    albumName: '2015 Spiritual Retreat 2',
    albumNameZh: '2015 靈修會-2',
    location: 'Retreat Seminar Hall',
    locationZh: '營地專題禮堂',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-outdoor-1',
    title: '2015 Outdoor Nature Worship Service & Picnic',
    titleZh: '2015 室外禮拜：公園野外崇拜與主內野餐',
    category: 'outdoor',
    date: '2015-06',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczNAYtoqg3t7fQfFSAHVIU-mJK2hABNJmKiNrwBv8_6I2QjdZVgarG7Hwg6jo8tXJe3CQuI6sJVJBq5Ukv7B5VDnbMzQmbR9PNyqY7E6vs0frL427g=w1200-h800',
    fallbackImageUrl: outdoorImg,
    description: '2015 Outdoor worship service under the blue skies, praising the Creator in nature followed by a joyful picnic.',
    descriptionZh: '2015 年加南教會舉行公園戶外主日崇拜，在藍天綠樹下揚聲歌頌神的造化奇功，禮拜後共享戶外野餐與各項趣味活動。',
    albumName: '2015 Outdoor Worship',
    albumNameZh: '2015 室外禮拜',
    location: 'Community Regional Park, CA',
    locationZh: '加州社區綠地公園',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-lunar-1',
    title: '2015 Lunar New Year Thanksgiving & Dumpling Feast',
    titleZh: '2015 農曆新年：新春感恩禮拜與包水餃團圓',
    category: 'lunar',
    date: '2015-02',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPrP1tOWPCYuLbzsgk781isgsWajgYvim6ng4ywVD9gg43dI80Zcbr2GDf1zNkB3hlHZZ4GR7Jk1GZ59Eiq2Sqor1XgoJpd6S_ZOMIghmO8VYS3HQ=w1200-h800',
    fallbackImageUrl: feastImg,
    description: 'Celebrating 2015 Lunar New Year with thanksgiving testimonies, spring feast, and warm blessings for all generations.',
    descriptionZh: '2015 年新春農曆新年感恩聚會，長執與會友同包水餃，發送新春紅包與聖經祝福卡，其樂融融。',
    albumName: '2015 Lunar New Year',
    albumNameZh: '2015 農曆新年',
    location: 'Fellowship Dining Hall',
    locationZh: '教會副堂大廳',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-heritage-1',
    title: '2013 1st Anniversary of Joining EFC (Evangelical Formosan Church)',
    titleZh: '2013 加盟台福一週年 感恩禮拜與歷史見證',
    category: 'heritage',
    date: '2013-10',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczPJm9jpkB6ggkHLgjtrz7k0a3yXmmVbRoqebD-6UlNV5NptV4TMqqQ-rtY4XLPuSjyHg8RXQdAYCvSSTRQAk0NJgonEH_e5ENsqxXrtBF3TvU6Pxw=w1200-h800',
    fallbackImageUrl: churchHeroImg,
    description: 'Celebrating the 1st Anniversary of joining Evangelical Formosan Church (EFC) General Assembly in 2013.',
    descriptionZh: '2013 年 10 月舉行加南新生基督教會加盟台福總會一週年感恩禮拜，數算神帶領教會步入全新里程碑的奇妙恩典。',
    albumName: '2013 EFC 1st Anniversary',
    albumNameZh: '2013 加盟台福一週年 感恩禮拜',
    location: 'Main Sanctuary',
    locationZh: '教會大禮拜堂',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-worship-1',
    title: 'Sunday Worship Service Praise & Message',
    titleZh: '主日崇拜詩班讚美與真理證道',
    category: 'worship',
    date: '2024-05',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczMnPCKFLKGGrsTIe4UeL-aoWu2gEZ0VnucuNdRDM-hbSbHHUF6PNYVrFBcU4ERVv1o6Q9AV1gJ_irbU6FLiYlbpE9PNa-PKDA0mtEFw7NT8owcSKQ=w1200-h800',
    fallbackImageUrl: choirImg,
    description: 'Sunday worship service praising God in unity and receiving God\'s truth at Canaan Shin Sheng Christian Church.',
    descriptionZh: '加南主堂主日崇拜，全體弟兄姊妹同心讚美主，聆聽陳家強牧師與講員宣講神的話語，心靈得著飽足與更新。',
    albumName: 'Sunday Worship Services',
    albumNameZh: '主日崇拜與聖餐',
    location: 'Main Sanctuary, 25226 S. Western Ave',
    locationZh: '教會大禮拜堂',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  },
  {
    id: 'gp-canaan-worship-2',
    title: 'Holy Communion & Lord\'s Table Service',
    titleZh: '主日聖餐禮拜記念主恩擘餅飲杯',
    category: 'worship',
    date: '2024-03',
    imageUrl: 'https://lh3.googleusercontent.com/pw/AP1GczOSPjJP2gcOBKgiALOmqj1k__G-mHpisuYJlMd93vckpSOuO0vOa7ILkDOD9GoIMc6F9tZ-4gqRwbBZBdmWRHXByYfwRyu--jg6kP8hfpeQV-izNw=w1200-h800',
    fallbackImageUrl: baptismImg,
    description: 'Reverent communion service remembering Christ\'s sacrifice on the cross and proclaiming His resurrection.',
    descriptionZh: '崇拜中全體會眾心存敬畏同領主的身體與寶血，記念十字架上的捨命救贖，同歸於一。',
    albumName: 'Sacraments & Worship',
    albumNameZh: '主日崇拜與聖餐',
    location: 'Main Sanctuary',
    locationZh: '教會大禮拜堂聖台',
    source: 'google-photos',
    account: 'web@canaannewlife.org',
    syncedAt: '2026-08-13T21:00:00Z'
  }
];

export const isPhotoInCategory = (
  photo: GalleryPhoto,
  activeCategoryKey: string,
  categoriesList: GalleryCategory[] = []
): boolean => {
  if (!photo) return false;
  if (!activeCategoryKey || activeCategoryKey === 'all') return true;
  if (activeCategoryKey === 'google-photos') {
    return (
      photo.source === 'google-photos' ||
      photo.account === 'web@canaannewlife.org' ||
      (Boolean(photo.id) && photo.id.startsWith('gp-'))
    );
  }

  const pCat = (photo.category || '').trim().toLowerCase();
  const targetKey = activeCategoryKey.trim().toLowerCase();

  // 1. Direct match with target key
  if (pCat === targetKey) return true;

  // 2. Match target category label
  const targetCat = categoriesList.find(c => c.key.toLowerCase() === targetKey);
  if (targetCat) {
    if (photo.category === targetCat.labelZh || photo.category === targetCat.labelEn) return true;
    if (photo.albumNameZh === targetCat.labelZh || photo.albumName === targetCat.labelEn) return true;
  }

  // 3. Synonym dictionary matching for Canaan historical gallery categories & ministries
  const ALIAS_MAP: Record<string, string[]> = {
    worship: [
      'worship',
      'sunday',
      'communion',
      'sacraments',
      'baptism',
      '主日崇拜與聖禮',
      '主日崇拜與聖餐',
      '主日崇拜',
      '崇拜',
      '主日',
      '聖餐',
      '浸禮',
      '洗禮'
    ],
    fellowship: [
      'fellowship',
      'groups',
      'group',
      'smallgroup',
      'smallgroups',
      'small-group',
      'small-groups',
      'cell',
      'cellgroup',
      '2023 小組聚會',
      '2023小組聚會',
      '小組聚會',
      '家庭小組',
      '小組',
      '團契',
      '團契與小組生活'
    ],
    children: [
      'children',
      'child',
      'kids',
      'robotics',
      'stem',
      'nextgen',
      'sunday school',
      'sundayschool',
      '兒童主日學與機器人',
      '兒童機器人課程',
      '兒童機器人',
      '機器人',
      '兒童',
      '主日學',
      '青少年'
    ],
    retreat: [
      'retreat',
      'retreats',
      'camp',
      'spiritual retreats',
      '靈修退修會營會',
      '2015 靈修會營會',
      '2015 靈修會',
      '2015靈修會營會',
      '靈修會營會',
      '靈修會',
      '退修會',
      '營會'
    ],
    christmas: [
      'christmas',
      'xmas',
      'celebrations',
      'feast',
      'love feast',
      '耶誕節與節慶愛宴',
      '2016 耶誕節與愛宴',
      '2016 耶誕節',
      '2016耶誕節與愛宴',
      '耶誕節與愛宴',
      '耶誕節',
      '聖誕節',
      '愛宴',
      '節慶'
    ],
    outdoor: [
      'outdoor',
      'outdoors',
      'picnic',
      '室外禮拜與野餐',
      '2015 室外禮拜',
      '2015室外禮拜',
      '室外禮拜',
      '戶外禮拜',
      '戶外',
      '野餐'
    ],
    lunar: [
      'lunar',
      'newyear',
      'cny',
      '農曆新年新春聚會',
      '2015 農曆新年',
      '2015農曆新年',
      '農曆新年',
      '春節',
      '新春',
      '過年'
    ],
    heritage: [
      'heritage',
      'anniversary',
      'history',
      'efc',
      '教會歷史與台福加盟',
      '2013 加盟台福一週年',
      '2013加盟台福一週年',
      '加盟台福一週年',
      '加盟台福',
      '台福',
      '歷史',
      '建堂',
      '紀念'
    ]
  };

  const aliasesForTarget = ALIAS_MAP[targetKey] || [];
  if (aliasesForTarget.some(alias => pCat === alias.toLowerCase() || pCat.includes(alias.toLowerCase()))) {
    return true;
  }

  // Also check if photo.albumNameZh or photo.titleZh contains alias
  if (photo.albumNameZh && aliasesForTarget.some(alias => photo.albumNameZh.toLowerCase().includes(alias.toLowerCase()))) {
    return true;
  }

  return false;
};
