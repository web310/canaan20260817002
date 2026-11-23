// Cloudflare Pages Function: /api/sermons
const DEFAULT_SERMONS = [
  {
    "id": "sermon-20261122",
    "title": "Understanding God's Building",
    "titleZh": "認識神的建造",
    "speaker": "Brother Shaoxin Li",
    "speakerZh": "李紹信 弟兄",
    "date": "2026-11-22",
    "scripture": "Psalm 127:1-5",
    "scriptureZh": "詩篇 127 篇 1-5 節",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Brother Shaoxin Li on \"Understanding God's Building\", reflecting on Psalm 127:1-5, reminding believers at year's end of God's heart for building His church and His children by trusting the Lord in church ministry and family life.",
    "summaryZh": "加南新生基督教會主日崇拜，李紹信 弟兄證道傳講《認識神的建造》，分享經文「詩篇 127 篇 1-5 節」。歲末年終之際，提醒弟兄姊妹再次認識神對「建造神的教會、建造神的兒女」的心意：若不是耶和華建造，所做的一切都是枉然；求主幫助我們在教會服事與家庭生活中凡事倚靠主、尋求主心意，使教會更加合一。",
    "points": [
      "Theme: At year's end, renewing our understanding of God's heart for building His church and His children",
      "1. Unless the Lord builds the house, the builders labor in vain (Psalm 127:1)",
      "2. For He grants sleep to those He loves (Psalm 127:2)",
      "3. Children are a heritage and reward from the Lord (Psalm 127:3-5)",
      "4. Relying on the Lord and seeking His will in church ministry and family life to grow in unity"
    ],
    "pointsZh": [
      "主旨：歲末年終，再次認識神對【建造神的教會、建造神的兒女】的心意",
      "一、若不是耶和華建造房屋，建造的人就枉然勞力（詩篇 127:1）",
      "二、惟有耶和華所親愛的，必叫他安然睡覺（詩篇 127:2）",
      "三、兒女是耶和華所賜的產業與賞賜（詩篇 127:3-5）",
      "四、在教會服事與家庭生活中凡事倚靠主、尋求主心意，使教會更加合一"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20261115",
    "title": "The Tent of Life and Living as in a Tent",
    "titleZh": "人生帳棚與帳棚人生",
    "speaker": "Brother Fengzhi Cai",
    "speakerZh": "蔡豐智 弟兄",
    "date": "2026-11-15",
    "scripture": "2 Corinthians 5:1, Hebrews 11:8-10",
    "scriptureZh": "哥林多後書第 5 章第 1 節，希伯來書第 11 章第 8-10 節",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Brother Fengzhi Cai on \"The Tent of Life and Living as in a Tent\", reflecting on 2 Corinthians 5:1 and Hebrews 11:8-10, encouraging believers to recognize the temporary nature of earthly life and walk in faith toward the eternal city built by God.",
    "summaryZh": "加南新生基督教會主日崇拜，蔡豐智 弟兄證道傳講《人生帳棚與帳棚人生》，經文取自「哥林多後書第 5 章第 1 節，希伯來書第 11 章第 8-10 節」，勉勵弟兄姊妹看清地上人生帳棚的短暫本質，如亞伯拉罕憑信心輕裝同行，常存盼望仰望神所經營建造、那座有根基的永恆家鄉。",
    "points": [
      "1. Where Do We Dwell: A Tent or a House?",
      "2. Seeing the True Nature of Life's Tent",
      "3. The Pilgrim's Tent-Dwelling Life",
      "4. Hope at the Journey's End: The City with Foundations",
      "5. Traveling Light Together Toward Eternity"
    ],
    "pointsZh": [
      "一、住在那裡：帳棚房屋？",
      "二、看清人生帳棚的本質",
      "三、天路歷程的帳棚人生",
      "四、終點的盼望：有根基的城",
      "五、輕裝同行，奔向永恆"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20261108",
    "title": "The True Freedom Given by Jesus",
    "titleZh": "耶穌所賜的真自由",
    "speaker": "Brother Zhengyi Qiu",
    "speakerZh": "邱正一 弟兄",
    "date": "2026-11-08",
    "scripture": "John 8:34-36",
    "scriptureZh": "約翰福音第 8 章第 34-36 節",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Brother Zhengyi Qiu on \"The True Freedom Given by Jesus\", reflecting on John 8:34-36.",
    "summaryZh": "加南新生基督教會主日崇拜，邱正一 弟兄證道傳講《耶穌所賜的真自由》，經文取自「約翰福音第 8 章第 34-36 節」，勉勵弟兄姊妹經歷神持久的愛，識破罪的誘騙，在基督裡享受真實的救恩與自由。",
    "points": [
      "1. God has always loved me",
      "2. Sin has always deceived me",
      "3. Jesus has already accomplished salvation for me!"
    ],
    "pointsZh": [
      "一、原來神一直愛我",
      "二、原來罪一直騙我",
      "三、原來耶穌已為我成就救恩！"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20261101",
    "title": "Living a Life Walking with the Lord",
    "titleZh": "過一個與主同行的生活",
    "speaker": "Elder Wansi",
    "speakerZh": "萬四 長老",
    "date": "2026-11-01",
    "scripture": "1 John 2:17, Romans 12:2, Isaiah 55:8-9, John 14:17, Proverbs 12:15",
    "scriptureZh": "約翰一書 2:17, 羅馬書 12:2, 以賽亞書 55:8-9, 約翰福音 14:17, 箴言 12:15",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Elder Wansi on \"Living a Life Walking with the Lord\", reflecting on 1 John 2:17, Romans 12:2, Isaiah 55:8-9, John 14:17, Proverbs 12:15.",
    "summaryZh": "加南新生基督教會主日崇拜，萬四 長老證道傳講《過一個與主同行的生活》，分享明白神旨意的先決條件與途徑，勉勵弟兄姊妹降服己心、順服聖靈的引導，在日常操練中與主同行。",
    "points": [
      "1. Introduction",
      "2. Three Prerequisites to Knowing God's Will (Resolve to obey, practice known commands, wait in faith)",
      "3. Three Pathways of God's Guidance (Prompting of the Spirit, circumstantial confirmation, counsel of spiritual elders)",
      "4. Daily discipline of walking with the Lord"
    ],
    "pointsZh": [
      "（一）序言",
      "（二）明白神旨意的三個先決條件（決心遵行、先遵行已知命令、不怕等候）",
      "（三）神引導我們的三個途徑（聖靈內在感動、環境外在印證、順服屬靈長輩提醒）",
      "（四）與主同行的操練"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20261025",
    "title": "From Wheel to Wheel",
    "titleZh": "從輪到輪",
    "speaker": "Rev. Jiasheng Huang",
    "speakerZh": "黃嘉生 牧師",
    "date": "2026-10-25",
    "scripture": "Jeremiah 18:3-6",
    "scriptureZh": "耶利米書 18 章 3-6 節",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Rev. Jiasheng Huang on \"From Wheel to Wheel\", reflecting on Jeremiah 18:3-6.",
    "summaryZh": "加南新生基督教會主日崇拜，黃嘉生 牧師證道傳講《從輪到輪》，分享經文「耶利米書 18 章 3-6 節」，勉勵弟兄姊妹如同窯匠手中的泥土，甘心交在神手中接受陶造與更新，活出合主心意的榮美器皿。",
    "points": [
      "1. The clay marred in the hands of the potter (Human frailty and flaws)",
      "2. Remade on the wheel into another vessel (The re-creation of God's grace)",
      "3. Yielding completely to the potter's sovereign hand (A vessel fit for the Master's use)"
    ],
    "pointsZh": [
      "一、泥在窯匠手中做壞（生命的軟弱與瑕疵）",
      "二、轉輪上重塑新器皿（上帝恩典的再造）",
      "三、全然順服主手陶造（活出合乎主用的器皿）"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20261018",
    "title": "From Many to One",
    "titleZh": "從許多到一個",
    "speaker": "Rev. Yijun Guo",
    "speakerZh": "郭易君 牧師",
    "date": "2026-10-18",
    "scripture": "Philippians 3:1-11",
    "scriptureZh": "腓立比書三章 1-11 節",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Rev. Yijun Guo on \"From Many to One\", reflecting on Philippians 3:1-11.",
    "summaryZh": "加南新生基督教會主日崇拜，郭易君 牧師證道傳講《從許多到一個》，分享經文「腓立比書三章 1-11 節」，勉勵弟兄姊妹放下世上諸多世俗牽掛，以認識耶穌基督為至寶，專一倚靠主並活出以基督為中心的生命。",
    "points": [
      "1. Guard against confidence in the flesh (Philippians 3:1-6)",
      "2. Counting all things as loss compared to knowing Christ (Philippians 3:7-9)",
      "3. Knowing the power of His resurrection and the fellowship of His suffering (Philippians 3:10-11)"
    ],
    "pointsZh": [
      "一、防備肉體的自誇與虛榮（腓立比書 3:1-6）",
      "二、以認識主基督耶穌為至寶（腓立比書 3:7-9）",
      "三、曉得基督復活的大能與同受苦（腓立比書 3:10-11）"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20261011",
    "title": "The Lord Is the Vine, I Am the Branch",
    "titleZh": "主是葡萄樹，我是枝子",
    "speaker": "Brother Zhengyi Qiu",
    "speakerZh": "邱正一 弟兄",
    "date": "2026-10-11",
    "scripture": "John 15:4-5",
    "scriptureZh": "約翰福音十五章 4-5 節",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Brother Zhengyi Qiu on \"The Lord Is the Vine, I Am the Branch\", reflecting on John 15:4-5.",
    "summaryZh": "加南新生基督教會主日崇拜，邱正一 弟兄證道傳講《主是葡萄樹，我是枝子》，經文取自「約翰福音十五章 4-5 節」，勉勵弟兄姊妹常在主裡面，連於真葡萄樹，結出豐盛常存的屬靈果子。",
    "points": [
      "1. Abiding in Christ: The vital life connection (John 15:4)",
      "2. Apart from Him we can do nothing (John 15:5a)",
      "3. Bearing much fruit to glorify God the Father (John 15:5b)"
    ],
    "pointsZh": [
      "一、常在主裡面的生命連結（約翰福音 15:4）",
      "二、離了基督我們不能做什麼（約翰福音 15:5a）",
      "三、多結果子榮耀父神（約翰福音 15:5b）"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20261004",
    "title": "How to Open Our Spiritual Eyes",
    "titleZh": "如何打開屬靈的眼睛",
    "speaker": "Elder Wansi",
    "speakerZh": "萬四 長老",
    "date": "2026-10-04",
    "scripture": "Ephesians 1:17-18, John 17:3, Philippians 3:10, Romans 8:18",
    "scriptureZh": "以弗所書 1:17-18, 約翰福音 17:3, 腓立比書 3:10, 羅馬書 8:18",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Elder Wansi on \"How to Open Our Spiritual Eyes\", reflecting on Ephesians 1:17-18, John 17:3, Philippians 3:10, Romans 8:18.",
    "summaryZh": "加南新生基督教會主日崇拜，萬四 長老證道傳講《如何打開屬靈的眼睛》，分享經文「以弗所書 1:17-18, 約翰福音 17:3, 腓立比書 3:10, 羅馬書 8:18」，勸勉弟兄姊妹憑信心看見神的作為，用愛看待身邊人，滿懷盼望仰望主。",
    "points": [
      "1. Opening the eyes of faith (Ephesians 1:17-18)",
      "2. Opening the eyes of love (John 17:3, Philippians 3:10)",
      "3. Opening the eyes of hope (Romans 8:18)"
    ],
    "pointsZh": [
      "一、打開信心的眼睛（以弗所書 1:17-18）",
      "二、打開愛的眼睛（約翰福音 17:3、腓立比書 3:10）",
      "三、打開盼望的眼睛（羅馬書 8:18）"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  },
  {
    "id": "sermon-20260927",
    "title": "Knowing the Gospel of Jesus Christ",
    "titleZh": "認識耶穌基督的福音",
    "speaker": "Brother Shaoxin Li",
    "speakerZh": "李紹信 弟兄",
    "date": "2026-09-27",
    "scripture": "Mark 1:1-15",
    "scriptureZh": "馬可福音第一章",
    "series": "Sunday Message",
    "seriesZh": "主日證道",
    "summary": "Sunday sermon delivered at Canaan Shin Sheng Christian Church by Brother Shaoxin Li on \"Knowing the Gospel of Jesus Christ\", reflecting on Mark 1.",
    "summaryZh": "加南新生基督教會主日崇拜，李紹信 弟兄證道傳講《認識耶穌基督的福音》，分享馬可福音第一章，帶領弟兄姊妹認識福音的根基、核心、傳揚與使命，忠心跟隨基督並傳承信仰。",
    "points": [
      "1. True vs. false gospel",
      "2. The foundation and core of the gospel",
      "3. Proclamation and heritage of the gospel",
      "4. The great mission of the gospel"
    ],
    "pointsZh": [
      "一、福音的真假與根基",
      "二、福音的核心與真理",
      "三、福音的傳揚與傳承",
      "四、福音的使命與行動"
    ],
    "videoUrl": "",
    "videoPasscode": "25226",
    "showVideo": false,
    "showAudio": false
  }
];

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const assetUrl = new URL('/canaan_master_data.json', url);
    const masterRes = context.env && context.env.ASSETS
      ? await context.env.ASSETS.fetch(assetUrl)
      : await fetch(assetUrl);
    if (masterRes && masterRes.ok) {
      const masterData = await masterRes.json();
      if (masterData && Array.isArray(masterData.data?.sermons) && masterData.data.sermons.length > 0) {
        return new Response(
          JSON.stringify({
            success: true,
            sermons: masterData.data.sermons,
            count: masterData.data.sermons.length,
            source: 'canaan_master_data.json'
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-cache, no-store, must-revalidate"
            }
          }
        );
      }
    }
  } catch (err) {
    console.warn("Could not read canaan_master_data.json:", err);
  }

  return new Response(
    JSON.stringify({
      success: true,
      sermons: DEFAULT_SERMONS,
      count: DEFAULT_SERMONS.length,
      source: 'edge_function_fallback'
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    }
  );
}

export async function onRequestPost(context) {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
