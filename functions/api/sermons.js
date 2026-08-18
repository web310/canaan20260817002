// Cloudflare Pages Function: /api/sermons
const DEFAULT_SERMONS = [
  {
    id: "sermon-1",
    title: "A Life That Never Disappoints",
    titleZh: "永不失望的人生",
    speaker: "Evangelist ITO",
    speakerZh: "ITO 傳道",
    date: "2026-08-16",
    scripture: "Acts 27:20-25; Acts 28:4-8",
    scriptureZh: "使徒行傳第 27 章第 20-25 節、使徒行傳第 28 章第 4-8 節",
    series: "Sunday Message",
    seriesZh: "主日證道",
    summary: "Reflecting on Acts 27:20-25 and Acts 28:4-8 on experiencing peace in the Lord during life's storms, reaching out to care for neighbors, trusting in God's sufficient grace, and wholeheartedly seeking God's guidance.",
    summaryZh: "加南新生基督教會主日崇拜，ITO 傳道透過使徒行傳第 27 章 20-25 節與第 28 章 4-8 節傳講《永不失望的人生》，勉勵弟兄姊妹在風浪中堅定信靠神：在主裡面有平安、挺身來關愛鄰舍、深信主恩典是夠用的，並專心尋求神引領。",
    points: [
      "1. Peace in the Lord — Acts 27:20-25",
      "2. Stepping forward to love and care for neighbors — Acts 28:4-8",
      "3. God's grace is sufficient",
      "4. Wholeheartedly seeking God's guidance"
    ],
    pointsZh: [
      "1. 在主裡面有平安 (使徒行傳 27:20-25)",
      "2. 挺身來關愛鄰舍 (使徒行傳 28:4-8)",
      "3. 主恩典是夠用的",
      "4. 專心尋求神引領"
    ],
    videoPasscode: "25226"
  },
  {
    id: "sermon-2",
    title: "Is Life Really Gone in the Blink of an Eye?",
    titleZh: "人生真的轉眼成空嗎？",
    speaker: "Rev. Meng Sulun",
    speakerZh: "孟蘇倫 牧師",
    date: "2026-08-09",
    scripture: "Ecclesiastes 1:2-3",
    scriptureZh: "傳道書第 1 章第 2-3 節",
    series: "Sunday Message",
    seriesZh: "主日證道",
    summary: "Reflecting on Ecclesiastes on the brevity of earthly labor and discovering eternal purpose and heavenly peace in God.",
    summaryZh: "『傳道者說：虛空的虛空，虛空的虛空，凡事都是虛空。人在日光之下的勞碌，有什麼益處呢？』在日光之下尋找上帝賜予永恆的生命目的與公義冠冕。",
    points: [
      "Vanity under the sun — Ecclesiastes 1:2-3",
      "Everything beautiful in its time — Ecclesiastes 3:11",
      "The whole duty of humanity — Ecclesiastes 12:13"
    ],
    pointsZh: [
      "日光之下的虛空 — 傳道書 1:2-3",
      "神造萬物，各按其時成為美好 — 傳道書 3:11",
      "人所當盡的分 — 傳道書 12:13"
    ],
    videoUrl: "https://us06web.zoom.us/rec/share/FrrAsHVqloU2W0s_2pKXHjhScmH3nBi57pb0wxXTZejCLOgvHjt-ciouOtVXCMPZ.8fEG3je9Hv1syxp6?startTime=1786299508000",
    videoPasscode: "8s4y?JHX"
  },
  {
    id: "sermon-3",
    title: "Those Who Are Well Do Not Need a Physician",
    titleZh: "康健的人用不著醫生",
    speaker: "Rev. Yijun Guo",
    speakerZh: "郭易君 牧師",
    date: "2026-08-02",
    scripture: "Luke 5:27-32",
    scriptureZh: "路加福音第 5 章第 27-32 節",
    series: "Sunday Worship",
    seriesZh: "主日崇拜",
    summary: "Jesus called Levi at the tax booth to 'Follow Me.' Levi left everything and hosted a feast. Jesus proclaimed that the healthy do not need a physician, but those who are sick; He came to call sinners to repentance.",
    summaryZh: "耶穌看見稅吏利未坐在稅關上，呼召他『你跟從我來』。利未就撇下所有的，起來跟從了耶穌，並在自己家裡大擺筵席。耶穌親自宣告：康健的人用不著醫生，有病的人才用得著；祂來本不是召義人悔改，乃是召罪人悔改。",
    points: [
      "1. Sitting at the Tax Booth (5:27a)",
      "2. Follow Me (5:27b)",
      "3. Followed Jesus (5:28)",
      "4. Hosted a Great Feast (5:29-30)",
      "5. Physician of Souls (5:31)"
    ],
    pointsZh: [
      "一、坐在稅關上 （5:27上）",
      "二、你跟從我來 （5:27下）",
      "三、跟從了耶穌 （5:28）",
      "四、他大擺筵席 （5:29-30）",
      "五、靈魂的醫生 （5:31）"
    ]
  },
  {
    id: "sermon-4",
    title: "The Lord Jesus Personally Teaches Service",
    titleZh: "主耶穌親自教導事奉",
    speaker: "Brother Shaoxin Li",
    speakerZh: "李紹信 弟兄",
    date: "2026-07-26",
    scripture: "Luke 10:1-12, 17-21",
    scriptureZh: "路加福音第 10 章第 1-12，17-21 節",
    series: "Sunday Worship",
    seriesZh: "主日崇拜",
    summary: "Hoping that we will better understand the service that pleases the Lord, learning from Jesus sending out the seventy disciples to minister in humility, obedience, and joy.",
    summaryZh: "盼望我們更加認識主喜悅的事奉，學習主耶穌差遣七十個門徒出去傳道的事奉原則，在謙卑、倚靠與聖靈的喜樂中，做主所喜悅的忠心僕人。",
    points: [
      "The Lord Personally Sends Disciples (Luke 10:1-3)",
      "Principles and Attitudes of Ministry (Luke 10:4-12)",
      "Rejoice That Your Names Are Written in Heaven (Luke 10:17-21)"
    ],
    pointsZh: [
      "一、主親自差遣門徒 (路加福音 10:1-3)",
      "二、事奉的原則與態度 (路加福音 10:4-12)",
      "三、因名記在天上而歡喜 (路加福音 10:17-21)"
    ]
  },
  {
    id: "sermon-5",
    title: "Embracing Grace, Walking Steadfastly with the Lord",
    titleZh: "領受恩典，與主同行",
    speaker: "Pastor Jiachang Chen",
    speakerZh: "陳嘉彰 牧師",
    date: "2026-07-19",
    scripture: "Psalm 23:1-6",
    scriptureZh: "詩篇第 23 篇第 1-6 節",
    series: "Sunday Worship",
    seriesZh: "主日崇拜",
    summary: "Reflecting on Psalm 23, experiencing the Good Shepherd's tender guidance, restoration in green pastures, and unfailing goodness throughout all our days.",
    summaryZh: "從詩篇23篇體會耶和華是大牧者的同在與引領，在青草地與可安歇的水邊得著靈魂甦醒，一生一世緊緊跟隨恩惠與慈愛。",
    points: [
      "1. The Lord is My Shepherd, I Lack Nothing (Psalm 23:1-2)",
      "2. He Restores My Soul and Guides My Paths (Psalm 23:3-4)",
      "3. Goodness and Love Follow Me All My Days (Psalm 23:5-6)"
    ],
    pointsZh: [
      "一、耶和華是我的牧者，我必不致缺乏 (詩篇 23:1-2)",
      "二、祂使我的靈魂甦醒，引導走義路 (詩篇 23:3-4)",
      "三、一生一世必有恩惠慈愛隨著我 (詩篇 23:5-6)"
    ],
    videoPasscode: "25226"
  }
];

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      success: true,
      sermons: DEFAULT_SERMONS,
      count: DEFAULT_SERMONS.length
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60"
      }
    }
  );
}

export async function onRequestPost(context) {
  try {
    const { sermons } = await context.request.json();
    if (Array.isArray(sermons)) {
      return new Response(
        JSON.stringify({ success: true, count: sermons.length }),
        {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "Sermons array required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process sermons" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
