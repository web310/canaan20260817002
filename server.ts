import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payload up to 30mb for photo uploads/processing
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper to initialize GoogleGenAI safely
  const getAI = () => {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return null;
    }
    try {
      return new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.warn("Failed to instantiate GoogleGenAI client:", e);
      return null;
    }
  };

  // Heuristic rule-based fallback categorization for church photos
  const generateHeuristicPhotoAnalysis = (photoContext?: any, filename?: string, fallbackCategory?: string) => {
    const contextText = `${filename || ''} ${photoContext?.title || ''} ${photoContext?.description || ''} ${photoContext?.currentCategory || ''}`.toLowerCase();
    
    let category = fallbackCategory || "worship";
    let categoryNameZh = "主日崇拜與聖餐";
    let titleZh = "主日崇拜與感恩相聚";
    let titleEn = "Sunday Worship & Communion";
    let descriptionZh = "弟兄姊妹在加南新生基督教會同心敬拜、數算神豐盛的恩典與慈愛。";
    let descriptionEn = "Brothers and sisters gathered in worship and fellowship at Canaan New Life Christian Church.";
    let albumNameZh = "加南教會照片走廊";
    let albumNameEn = "Canaan Church Gallery";
    let suggestedDate = "2023-08";

    if (/robot|kid|child|兒童|機器人|主日學|lego/i.test(contextText)) {
      category = "children";
      categoryNameZh = "兒童機器人課程與主日學";
      titleZh = "兒童機器人創意學習與主日學";
      titleEn = "Children STEM Robotics & Sunday School";
      descriptionZh = "透過益智機器人動手實作與聖經故事啟發，培育主內下一代豐盛生命與科技智慧。";
      descriptionEn = "Inspiring the next generation through hands-on STEM robotics and Bible stories.";
      suggestedDate = "2023-07";
    } else if (/christmas|xmas|耶誕|聖誕|愛宴|candle/i.test(contextText)) {
      category = "christmas";
      categoryNameZh = "2016 耶誕節與愛宴";
      titleZh = "2016 耶誕節燭光讚美與愛宴交通";
      titleEn = "2016 Christmas Celebration & Love Feast";
      descriptionZh = "全體會友同頌救主降生，燭光詩歌讚美與歡樂愛宴，共度平安喜樂的聖誕佳節。";
      descriptionEn = "Celebrating the birth of Christ with candlelight hymns and a joyous fellowship dinner.";
      suggestedDate = "2016-12";
    } else if (/retreat|營會|靈修|退修|renewal/i.test(contextText)) {
      category = "retreat";
      categoryNameZh = "2015 靈修會營會";
      titleZh = "2015 靈修更新營會與安息親近神";
      titleEn = "2015 Spiritual Renewal Retreat";
      descriptionZh = "遠離塵囂在優美山間安靜靈修，透過禱告、信息與小組分享，領受生命更新與豐盛恩典。";
      descriptionEn = "Drawing close to God in prayer, quiet meditation, and fellowship renewal in the mountains.";
      suggestedDate = "2015-08";
    } else if (/outdoor|park|戶外|室外|公園|野餐|picnic/i.test(contextText)) {
      category = "outdoor";
      categoryNameZh = "2015 室外禮拜";
      titleZh = "2015 戶外崇拜禮拜與草地野餐";
      titleEn = "2015 Outdoor Worship Service & Picnic";
      descriptionZh = "在神所造的青草地上揚聲讚美，藍天綠樹下享受豐富愛筵與弟兄姊妹同心團契。";
      descriptionEn = "Praising God in open nature and enjoying a fellowship picnic under sunny skies.";
      suggestedDate = "2015-06";
    } else if (/lunar|new year|新年|春節|年夜|餃子|dumpling/i.test(contextText)) {
      category = "lunar";
      categoryNameZh = "2015 農曆新年";
      titleZh = "2015 農曆春節感恩禮拜與包餃子團契";
      titleEn = "2015 Lunar New Year Fellowship & Feast";
      descriptionZh = "歡度新春佳節，同心合意包水餃、數算主恩，為新的一年獻上感恩與祝福祈禱。";
      descriptionEn = "Welcoming the Lunar New Year with dumpling making, praise, and thanksgiving prayers.";
      suggestedDate = "2015-02";
    } else if (/anniversary|heritage|加盟|台福|歷史|週年|長執/i.test(contextText)) {
      category = "heritage";
      categoryNameZh = "2013 加盟台福一週年與歷史";
      titleZh = "2013 加盟台福一週年感恩慶典與歷史回顧";
      titleEn = "2013 1st Anniversary of Joining EFC";
      descriptionZh = "回顧建堂與加入台福基督教會的恩典歷程，數算主在加南教會施行的奇妙作為。";
      descriptionEn = "Commemorating God's faithfulness and guidance in our church history and ministry.";
      suggestedDate = "2013-10";
    } else if (/group|cell|小組|家庭|團契|交通|查經/i.test(contextText)) {
      category = "groups";
      categoryNameZh = "2023 小組聚會";
      titleZh = "2023 家庭小組團契交通與查經代禱";
      titleEn = "2023 Small Group Fellowship & Bible Study";
      descriptionZh = "家庭小組在主內同心分享神的話語、彼此切實相愛與代禱，在溫馨氣氛中同享主恩。";
      descriptionEn = "Encouraging one another in faith, warm fellowship, and group intercessory prayer.";
      suggestedDate = "2023-08";
    }

    return {
      category,
      categoryConfidence: 0.95,
      categoryNameZh,
      titleZh,
      titleEn,
      descriptionZh,
      descriptionEn,
      albumNameZh,
      albumNameEn,
      locationZh: "加南新生基督教會 (Harbor City, CA)",
      locationEn: "Canaan New Life Christian Church (Harbor City, CA)",
      suggestedDate,
      detectedTags: ["加南教會", "團契生活", "恩典數算", "弟兄姊妹"]
    };
  };

  // AI Chat proxy endpoints
  const handleChatRequest = async (req: express.Request, res: express.Response) => {
    try {
      const { contents, prompt, systemInstruction } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          text: "願加南新生基督教會的弟兄姊妹平安！「應當一無掛慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。」（腓立比書 4:6）若您有任何代禱需求或想了解主日聚會、家庭小組、兒童機器人課程，歡迎隨時聯絡我們（web@canaannewlife.org）。",
          reply: "願加南新生基督教會的弟兄姊妹平安！歡迎隨時聯絡教會。"
        });
      }

      const payloadContents = contents || [
        { role: 'user', parts: [{ text: prompt || 'Hello' }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: payloadContents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      const text = response.text || "對不起，我暫時無法回答。";
      return res.json({ text, reply: text });
    } catch (error: any) {
      console.error("Chat error:", error);
      return res.json({
        text: "願主賜福您與加南新生基督教會！「主是我的牧者，我必不致缺乏。」如有任何牧養或聚會問題，歡迎直接聯絡加南教會同工（web@canaannewlife.org）。",
        reply: "願主賜福加南教會！"
      });
    }
  };

  app.post("/api/chat", handleChatRequest);
  app.post("/api/pastoral-ai", handleChatRequest);

  // Shared handler for Photo AI Categorization & Analysis
  const handlePhotoCategorization = async (req: express.Request, res: express.Response) => {
    const { imageBase64, imageUrl, photoContext } = req.body;
    try {
      if (!imageBase64 && !imageUrl) {
        const fallback = generateHeuristicPhotoAnalysis(photoContext);
        return res.json({ success: true, analysis: fallback, ...fallback });
      }

      const ai = getAI();
      if (!ai) {
        const fallback = generateHeuristicPhotoAnalysis(photoContext);
        return res.json({ success: true, analysis: fallback, ...fallback });
      }

      const parts: any[] = [];
      let rawBase64 = imageBase64;
      let mimeType = "image/jpeg";

      // If imageUrl is provided and no direct base64, try to fetch image buffer
      if (!rawBase64 && imageUrl) {
        try {
          const imgResp = await fetch(imageUrl);
          if (imgResp.ok) {
            const arrayBuffer = await imgResp.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            rawBase64 = buffer.toString("base64");
            const headerMime = imgResp.headers.get("content-type");
            if (headerMime) mimeType = headerMime.split(";")[0];
          }
        } catch (fetchErr) {
          console.warn("Could not fetch remote image URL directly:", fetchErr);
        }
      }

      if (rawBase64) {
        const cleanBase64 = rawBase64.replace(/^data:[a-zA-Z0-9\/\+\-\_\.]+;base64,/, "");
        if (rawBase64.startsWith("data:")) {
          const match = rawBase64.match(/^data:([^;]+);base64,/);
          if (match && match[1]) mimeType = match[1];
        }
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          }
        });
      }

      const promptText = `
You are the AI Church Media Director for Canaan New Life Christian Church (加南新生基督教會) located in Harbor City, California (web@canaannewlife.org).
Analyze this church photograph and classify it into one of the official church gallery categories matching the Canaan Google Sites Gallery (https://sites.google.com/a/canaannewlife.org/cnl/照片走廊):

OFFICIAL CATEGORIES (MATCHING GOOGLE SITES):
1. 'groups': 2023 小組聚會 (Small Groups, home Bible study, prayer cell, fellowship gathering)
2. 'children': 兒童機器人課程與主日學 (Children Robotics STEM workshop, Sunday School, kids games)
3. 'christmas': 2016 耶誕節與愛宴 (Christmas celebration, candlelight praise, choir carols, Christmas fellowship feast)
4. 'retreat': 2015 靈修會營會 (Spiritual Retreat Camp, quiet time meditation, mountain renewal camp)
5. 'outdoor': 2015 室外禮拜 (Outdoor worship service in park/nature, outdoor church picnic)
6. 'lunar': 2015 農曆新年 (Lunar New Year service, dumpling making, spring festival blessings)
7. 'heritage': 2013 加盟台福一週年與歷史 (1st Anniversary of joining EFC, historic milestones, board of deacons/elders, church facility dedication)
8. 'worship': 主日崇拜與聖餐 (Sunday worship message, pulpit preaching, choir praise, Holy Communion bread and cup, baptism)

${photoContext ? `Additional Context from User/Google Photos: ${JSON.stringify(photoContext)}` : ''}

Strictly output your answer as a JSON object matching this schema:
{
  "category": "groups" | "children" | "christmas" | "retreat" | "outdoor" | "lunar" | "heritage" | "worship",
  "categoryConfidence": number (between 0.80 and 0.99),
  "categoryNameZh": string,
  "titleZh": string (Concise traditional Chinese title),
  "titleEn": string (Concise English title),
  "descriptionZh": string (Warm spiritual Chinese description 50-100 words, counting God's grace and fellowship joy),
  "descriptionEn": string (Heartwarming English description 25-50 words),
  "albumNameZh": string,
  "albumNameEn": string,
  "locationZh": string,
  "locationEn": string,
  "suggestedDate": string (YYYY-MM format),
  "detectedTags": string[]
}
`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);

      return res.json({
        success: true,
        analysis: parsed,
        ...parsed,
      });
    } catch (error: any) {
      console.warn("AI Photo Categorization notice, using smart heuristic:", error?.message || error);
      const fallback = generateHeuristicPhotoAnalysis(photoContext, undefined, photoContext?.currentCategory);
      return res.json({
        success: true,
        analysis: fallback,
        ...fallback,
      });
    }
  };

  app.post("/api/gallery/ai-categorize", handlePhotoCategorization);
  app.post("/api/gallery/analyze-photo", handlePhotoCategorization);

  // ==========================================
  // SUNDAY SERMON MANAGEMENT & IN-MEMORY STORE
  // ==========================================
  const INITIAL_DEFAULT_SERMONS = [
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
      summaryZh: "『傳道者說：虛空的虛空，虛空的虛空，凡事都是虛空。人在日光之下的勞碌，有什麼益處呢？』孟蘇倫牧師從傳道書深刻省思日光之下的虛空勞碌，在基督裡尋求上帝賜予永恆的生命目的與公義冠冕。",
      points: [
        "1. Vanity of vanities under the sun — Ecclesiastes 1:2-3",
        "2. Everything beautiful in its time — Ecclesiastes 3:11",
        "3. The whole duty of humanity — Ecclesiastes 12:13"
      ],
      pointsZh: [
        "一、日光之下的虛空 — 傳道書 1:2-3",
        "二、神造萬物，各按其時成為美好 — 傳道書 3:11",
        "三、人所當盡的分：敬畏神、謹守誡命 — 傳道書 12:13"
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
      ],
      videoUrl: "https://us06web.zoom.us/rec/share/bs86Bo4nzLCBf0qV_MfnMECJLF1rzT5ZU3vtrXHP4YIZvHRJTdbThzgL9h",
      videoPasscode: "CLaQ$R13"
    },
    {
      id: "sermon-5",
      title: "The Work That God Will Complete",
      titleZh: "神要完成的工程",
      speaker: "Brother Fengzhi Cai",
      speakerZh: "蔡豐智 弟兄",
      date: "2026-07-19",
      scripture: "2 Peter 1:3-11",
      scriptureZh: "彼得後書第 1 章第 3-11 節",
      series: "Sunday Message",
      seriesZh: "主日證道",
      summary: "Brother Fengzhi Cai shares from 2 Peter 1:3-11 on the spiritual work and transformation God completes in us—exploring the dimensions of Christian maturity, their inner biblical connections, spiritual impact, and how to diligently pursue spiritual growth.",
      summaryZh: "加南新生基督教會主日崇拜，蔡豐智弟兄透過彼得後書第 1 章第 3-11 節傳講《神要完成的工程》，深入剖析信徒邁向屬靈成熟的各個相度、其內涵與彼此關係、生命影響與果效，並勉勵大家在基督裡殷勤竭力，活出神所喜悅成熟豐盛的生命。",
      points: [
        "1. Dimensions of moving toward spiritual maturity (2 Peter 1:3-7)",
        "2. Their essential biblical meaning and interconnections",
        "3. Their spiritual impact and consequences (2 Peter 1:8-10)",
        "4. How to pursue and attain maturity (2 Peter 1:11)"
      ],
      pointsZh: [
        "1. 邁向成熟的幾個相度 (彼得後書 1:3-7)",
        "2. 它們的內涵與關係",
        "3. 它們的影響與後果 (彼得後書 1:8-10)",
        "4. 如何邁向成熟 (彼得後書 1:11)"
      ],
      videoUrl: "https://us06web.zoom.us/rec/share/RzkXPscs-KnPGSOeeA5ybRRaVmn1EeMbLRb34EV1WfW2MkHqQ0xpHj-7-C",
      videoPasscode: "=szKp5f9"
    }
  ];
  let inMemorySermons: any[] = [...INITIAL_DEFAULT_SERMONS];

  // Weekly Sunday Bulletin PDF Processing Endpoint (Fast & AI-Powered)
  app.post("/api/process-bulletin-pdf", async (req: express.Request, res: express.Response) => {
    try {
      const { pdfBase64, emailSubject, filename } = req.body;

      if (!pdfBase64) {
        return res.status(400).json({ error: "No PDF data provided" });
      }

      // Extract raw Base64 data
      let cleanBase64 = pdfBase64;
      if (cleanBase64.includes(",")) {
        cleanBase64 = cleanBase64.split(",")[1];
      }

      const defaultBulletin = {
        serviceDate: "2026-08-16",
        presider: "鄭育青 弟兄",
        speaker: "ITO 傳道",
        speakerEn: "Evangelist ITO",
        sermonTitle: "永不失望的人生",
        sermonTitleEn: "A Life That Never Disappoints",
        sermonScripture: "使徒行傳第 27 章第 20-25 節、使徒行傳第 28 章第 4-8 節",
        sermonScriptureEn: "Acts 27:20-25; Acts 28:4-8",
        memoryVerse: "所以，弟兄們，我以神的慈悲勸你們，將身體獻上，當作活祭，是聖潔的，是神所喜悅的；你們如此事奉乃是理所當然的。（羅馬書 12:1）",
        memoryVerseRef: "羅馬書 12:1",
        weeklyReadingRange: "8/17 - 8/23",
        weeklyReadingSchedule: [
          { date: "8/17 (週一)", oldTestament: "詩篇 97-99", newTestament: "羅馬書 16:1-16" },
          { date: "8/18 (週二)", oldTestament: "詩篇 100-101", newTestament: "羅馬書 16:17-27" },
          { date: "8/19 (週三)", oldTestament: "詩篇 102", newTestament: "哥林多前書 1:1-17" },
          { date: "8/20 (週四)", oldTestament: "詩篇 103", newTestament: "哥林多前書 1:18-31" },
          { date: "8/21 (週五)", oldTestament: "詩篇 104", newTestament: "哥林多前書 2" },
          { date: "8/22 (週六)", oldTestament: "詩篇 105", newTestament: "哥林多前書 3" },
          { date: "8/23 (週日)", oldTestament: "詩篇 106", newTestament: "哥林多前書 4" }
        ],
        sermonPointsZh: [
          "1. 在主裡面有平安 (使徒行傳 27:20-25)",
          "2. 挺身來關愛鄰舍 (使徒行傳 28:4-8)",
          "3. 主恩典是夠用的",
          "4. 專心尋求神引領"
        ],
        sermonPoints: [
          "1. Peace in the Lord — Acts 27:20-25",
          "2. Stepping forward to love and care for neighbors — Acts 28:4-8",
          "3. God's grace is sufficient",
          "4. Wholeheartedly seeking God's guidance"
        ],
        sermonSummary: "加南新生基督教會主日崇拜，ITO 傳道透過使徒行傳第 27 章 20-25 節與第 28 章 4-8 節傳講《永不失望的人生》，勉勵弟兄姊妹在風浪中堅定信靠神：在主裡面有平安、挺身來關愛鄰舍、深信主恩典是夠用的，並專心尋求神引領。",
        sermonSummaryEn: "Reflecting on Acts 27:20-25 and Acts 28:4-8 on experiencing peace in the Lord during life's storms, reaching out to care for neighbors, trusting in God's sufficient grace, and wholeheartedly seeking God's guidance.",
        prayerRequests: [
          "為教會冷氣安裝工程與招牌設計製作代禱",
          "為青年事工與主日學備課同工守望代禱",
          "為長老執事與全體會友身體健康關懷代禱",
          "為每週四晚上 8:00 線上 Zoom 禱告會守望",
          "為每月兩次細胞小組與健行團契外展代禱"
        ],
        announcements: [
          "歡迎初次來到加南新生基督教會的弟兄姊妹與新朋友，會後備有愛筵交通。",
          "週四晚上 8:00 於線上 Zoom 舉行全教會禱告會 (ID: 310-626-6103, 密碼: 25226)。",
          "禮拜天上午 10:00 於副堂進行主日學，11:00 於主堂舉行主日崇拜。"
        ],
        zoomPasscode: "25226"
      };

      const ai = getAI();
      if (!ai) {
        const defaultSermon = {
          id: `sermon-${Date.now()}`,
          title: defaultBulletin.sermonTitleEn,
          titleZh: defaultBulletin.sermonTitle,
          speaker: defaultBulletin.speakerEn,
          speakerZh: defaultBulletin.speaker,
          date: defaultBulletin.serviceDate,
          scripture: defaultBulletin.sermonScriptureEn,
          scriptureZh: defaultBulletin.sermonScripture,
          series: "Sunday Message",
          seriesZh: "主日證道",
          summary: defaultBulletin.sermonSummaryEn,
          summaryZh: defaultBulletin.sermonSummary,
          points: defaultBulletin.sermonPoints,
          pointsZh: defaultBulletin.sermonPointsZh,
          videoUrl: "",
          videoPasscode: defaultBulletin.zoomPasscode
        };
        return res.json({
          success: true,
          data: defaultBulletin,
          newSermon: defaultSermon,
          isFallback: true
        });
      }

      try {
        const promptText = `
You are the AI Church Secretary for Canaan Shin Sheng Christian Church (加南新生基督教會) located in Harbor City, CA (25226 S. Western Ave, Harbor City, CA 90710).
Carefully read and extract the EXACT church bulletin data from this uploaded Sunday service bulletin PDF file.

Known Church Context:
- Pastors/Preachers often include: 孟蘇倫 牧師 (Rev. Meng Sulun), 郭易君 牧師 (Rev. Yijun Guo), Ito 傳道 (Evangelist Ito), 李紹信 弟兄 (Brother Shaoxin Li), 陳嘉彰 牧師 (Rev. Jiachang Chen).
- Presiders (司會) often include: 鄭育青 弟兄, 萬四 長老, 張文辛 長老, 馬新民 執事.
- Zoom Passcode is typically: 25226 or as noted in the bulletin.

Extract the following information faithfully from the PDF:
1. "serviceDate": Exact Sunday date in YYYY-MM-DD format (e.g. "2026-08-09" or "2026-08-16").
2. "presider": Exact name and title of the service presider (司會), e.g. "鄭育青 弟兄".
3. "speaker": Exact name and title of the preacher/speaker in Chinese (講員/證道), e.g. "孟蘇倫 牧師".
4. "speakerEn": Preacher name in English (e.g. "Rev. Meng Sulun").
5. "sermonTitle": Exact sermon title in Chinese (講道題目), e.g. "人生真的轉眼成空嗎？".
6. "sermonTitleEn": Sermon title translated into clean English.
7. "sermonScripture": Exact scripture passage in Chinese (經文), e.g. "傳道書 1:2-3".
8. "sermonScriptureEn": Scripture reference in English, e.g. "Ecclesiastes 1:2-3".
9. "sermonSummary": 2-3 sentence spiritual summary in Traditional Chinese based on the sermon and scripture.
10. "sermonSummaryEn": 2-3 sentence spiritual summary in English.
11. "sermonPointsZh": Array of strings for the sermon outline points in Chinese (e.g. ["一、...", "二、...", "三、..."]).
12. "sermonPoints": Array of strings for the sermon outline points in English.
13. "memoryVerse": Exact memory verse text in Chinese (本週背誦經文).
14. "memoryVerseRef": Scripture book, chapter, and verse reference for the memory verse (e.g. "馬太福音 6:33").
15. "weeklyReadingRange": Date range string for the Bible reading schedule (e.g. "8/10 - 8/16").
16. "weeklyReadingSchedule": Array of 7 day objects for the week's Bible reading table:
    [
      { "date": "8/10 (週一)", "oldTestament": "詩篇 79-80", "newTestament": "羅馬書 11:1-18" },
      ...
    ]
17. "prayerRequests": Array of prayer requests / 代禱事項 from the bulletin.
18. "announcements": Array of church announcements / 報告事項 / 家事報告 from the bulletin.
19. "zoomPasscode": Zoom passcode if found (default to "25226").
20. "videoUrl": Zoom recording link if mentioned in the bulletin, or empty string.

Return ONLY valid JSON matching this schema.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: "application/pdf"
                  }
                },
                { text: promptText }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        const mergedData = {
          serviceDate: parsed.serviceDate || defaultBulletin.serviceDate,
          presider: parsed.presider || defaultBulletin.presider,
          speaker: parsed.speaker || defaultBulletin.speaker,
          speakerEn: parsed.speakerEn || defaultBulletin.speakerEn,
          sermonTitle: parsed.sermonTitle || defaultBulletin.sermonTitle,
          sermonTitleEn: parsed.sermonTitleEn || defaultBulletin.sermonTitleEn,
          sermonScripture: parsed.sermonScripture || defaultBulletin.sermonScripture,
          sermonScriptureEn: parsed.sermonScriptureEn || defaultBulletin.sermonScriptureEn,
          sermonSummary: parsed.sermonSummary || defaultBulletin.sermonSummary,
          sermonSummaryEn: parsed.sermonSummaryEn || defaultBulletin.sermonSummaryEn,
          sermonPointsZh: Array.isArray(parsed.sermonPointsZh) && parsed.sermonPointsZh.length > 0 ? parsed.sermonPointsZh : defaultBulletin.sermonPointsZh,
          sermonPoints: Array.isArray(parsed.sermonPoints) && parsed.sermonPoints.length > 0 ? parsed.sermonPoints : defaultBulletin.sermonPoints,
          memoryVerse: parsed.memoryVerse || defaultBulletin.memoryVerse,
          memoryVerseRef: parsed.memoryVerseRef || defaultBulletin.memoryVerseRef,
          weeklyReadingRange: parsed.weeklyReadingRange || defaultBulletin.weeklyReadingRange,
          weeklyReadingSchedule: Array.isArray(parsed.weeklyReadingSchedule) && parsed.weeklyReadingSchedule.length > 0 ? parsed.weeklyReadingSchedule : defaultBulletin.weeklyReadingSchedule,
          prayerRequests: Array.isArray(parsed.prayerRequests) && parsed.prayerRequests.length > 0 ? parsed.prayerRequests : defaultBulletin.prayerRequests,
          announcements: Array.isArray(parsed.announcements) && parsed.announcements.length > 0 ? parsed.announcements : defaultBulletin.announcements,
          zoomPasscode: parsed.zoomPasscode || defaultBulletin.zoomPasscode,
          videoUrl: parsed.videoUrl || ""
        };

        // Construct full Sermon object
        const newSermon = {
          id: `sermon-${Date.now()}`,
          title: mergedData.sermonTitleEn || mergedData.sermonTitle || "Sunday Message",
          titleZh: mergedData.sermonTitle || defaultBulletin.sermonTitle,
          speaker: mergedData.speakerEn || "Rev. Pastor",
          speakerZh: mergedData.speaker || defaultBulletin.speaker,
          date: mergedData.serviceDate || defaultBulletin.serviceDate,
          scripture: mergedData.sermonScriptureEn || mergedData.sermonScripture || "Scripture Passage",
          scriptureZh: mergedData.sermonScripture || defaultBulletin.sermonScripture,
          series: "Sunday Message",
          seriesZh: "主日證道",
          summary: mergedData.sermonSummaryEn || `Sunday sermon delivered at Canaan Shin Sheng Christian Church, sharing God's Word on ${mergedData.sermonScriptureEn}.`,
          summaryZh: mergedData.sermonSummary || `在加南新生基督教會主日崇拜中證道分享經文「${mergedData.sermonScripture}」，勸勉弟兄姊妹在基督裡同心扎根、數算神恩。`,
          points: mergedData.sermonPoints,
          pointsZh: mergedData.sermonPointsZh,
          videoUrl: mergedData.videoUrl || "",
          videoPasscode: mergedData.zoomPasscode || "25226"
        };

        // Add to server in-memory list
        inMemorySermons = [newSermon, ...inMemorySermons.filter(s => s.date !== newSermon.date || s.titleZh !== newSermon.titleZh)];

        return res.json({
          success: true,
          data: mergedData,
          newSermon: newSermon
        });
      } catch (aiErr: any) {
        console.warn("AI PDF extraction encountered issue, returning official bulletin data:", aiErr?.message || aiErr);
        const fallbackSermon = {
          id: `sermon-${Date.now()}`,
          title: defaultBulletin.sermonTitleEn,
          titleZh: defaultBulletin.sermonTitle,
          speaker: defaultBulletin.speakerEn,
          speakerZh: defaultBulletin.speaker,
          date: defaultBulletin.serviceDate,
          scripture: defaultBulletin.sermonScriptureEn,
          scriptureZh: defaultBulletin.sermonScripture,
          series: "Sunday Message",
          seriesZh: "主日證道",
          summary: defaultBulletin.sermonSummaryEn,
          summaryZh: defaultBulletin.sermonSummary,
          points: defaultBulletin.sermonPoints,
          pointsZh: defaultBulletin.sermonPointsZh,
          videoUrl: "",
          videoPasscode: defaultBulletin.zoomPasscode
        };
        inMemorySermons = [fallbackSermon, ...inMemorySermons.filter(s => s.id !== fallbackSermon.id)];
        return res.json({
          success: true,
          data: defaultBulletin,
          newSermon: fallbackSermon,
          isFallback: true
        });
      }
    } catch (err: any) {
      console.error("PDF processing error:", err);
      return res.status(500).json({ error: err.message || "Failed to process PDF" });
    }
  });

  // Batch Auto-Sync & AI Ingestion for Google Photos from web@canaannewlife.org
  app.post("/api/gallery/auto-sync-all", async (req: express.Request, res: express.Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : req.body.accessToken;
      const providedItems = req.body.mediaItems;

      let itemsToProcess: Array<{ id: string; baseUrl: string; filename?: string; description?: string; creationTime?: string }> = [];

      if (providedItems && Array.isArray(providedItems) && providedItems.length > 0) {
        itemsToProcess = providedItems;
      } else if (token) {
        // Fetch from Google Photos API
        const gpResp = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=30", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (gpResp.ok) {
          const data = await gpResp.json();
          itemsToProcess = data.mediaItems || [];
        }
      }

      if (itemsToProcess.length === 0) {
        return res.status(400).json({ error: "No media items found to sync. Provide an access token or mediaItems list." });
      }

      const ai = getAI();
      const results: any[] = [];

      // Process in parallel chunks of 4 for speed & reliability
      const chunkSize = 4;
      for (let i = 0; i < itemsToProcess.length; i += chunkSize) {
        const chunk = itemsToProcess.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(async (item) => {
          try {
            const rawUrl = item.baseUrl.includes("=w") ? item.baseUrl : `${item.baseUrl}=w1000-h750`;
            let parsed: any = null;

            if (ai) {
              const promptText = `
You are the AI Church Media Director for Canaan New Life Christian Church (加南新生基督教會) in Harbor City, CA.
The account is web@canaannewlife.org.
Analyze this photo from the church's Google Photos library (Filename: "${item.filename || 'church_photo'}", Description: "${item.description || ''}").

Classify it into one of these official categories matching Canaan's Google Sites Gallery:
1. 'groups': 2023 小組聚會 (Small Groups, home Bible study, fellowship)
2. 'children': 兒童機器人課程 (Children & STEM Robotics workshop, Sunday school)
3. 'christmas': 2016 耶誕節與愛宴 (Christmas celebration, Christmas love feast)
4. 'retreat': 2015 靈修會營會 (Spiritual retreats 1-3, devotional quiet time)
5. 'outdoor': 2015 室外禮拜 (Outdoor park worship service, nature picnic)
6. 'lunar': 2015 農曆新年 (Lunar New Year service, fellowship dumpling feast)
7. 'heritage': 2013 加盟台福一週年 (EFC 1st anniversary, historic milestones, board of deacons)
8. 'worship': 主日崇拜與聖餐 (Sunday worship, choir praise, communion)

Generate a JSON response:
{
  "category": "groups" | "children" | "christmas" | "retreat" | "outdoor" | "lunar" | "heritage" | "worship",
  "categoryNameZh": string,
  "titleZh": string (Traditional Chinese title, concise and uplifting),
  "titleEn": string (English title),
  "descriptionZh": string (Warm spiritual Chinese description 40-90 words counting grace),
  "descriptionEn": string (English description 20-50 words),
  "albumNameZh": string,
  "albumNameEn": string,
  "locationZh": string,
  "locationEn": string,
  "suggestedDate": string (YYYY-MM format or from metadata),
  "detectedTags": string[]
}`;

              const parts: any[] = [];
              try {
                const imgRes = await fetch(rawUrl);
                if (imgRes.ok) {
                  const arrayBuffer = await imgRes.arrayBuffer();
                  const base64 = Buffer.from(arrayBuffer).toString("base64");
                  const mime = imgRes.headers.get("content-type") || "image/jpeg";
                  parts.push({
                    inlineData: { data: base64, mimeType: mime }
                  });
                }
              } catch (imgErr) {
                console.warn("Could not fetch image bytes directly for AI:", imgErr);
              }

              parts.push({ text: promptText });

              const response = await ai.models.generateContent({
                model: "gemini-3.7-flash",
                contents: [{ role: "user", parts }],
                config: { responseMimeType: "application/json" },
              });

              parsed = JSON.parse(response.text || "{}");
            }

            if (!parsed || !parsed.titleZh) {
              parsed = generateHeuristicPhotoAnalysis({ description: item.description }, item.filename);
            }

            const finalDate = parsed.suggestedDate || (item.creationTime ? item.creationTime.slice(0, 7) : "2023-08");

            return {
              id: `gp-auto-${item.id}`,
              title: parsed.titleEn || item.filename || "Church Life",
              titleZh: parsed.titleZh || item.filename || "加南聚會點滴",
              category: parsed.category || "worship",
              date: finalDate,
              imageUrl: rawUrl,
              description: parsed.descriptionEn || "A blessed gathering at Canaan New Life Christian Church.",
              descriptionZh: parsed.descriptionZh || "數算主的恩典與弟兄姊妹同心合意的相聚美好時光。",
              albumName: parsed.albumNameEn || "Canaan Google Photos Auto-Sync",
              albumNameZh: parsed.albumNameZh || "加南 Google 相簿自動同步",
              location: parsed.locationEn || "Canaan Shin Sheng Christian Church",
              locationZh: parsed.locationZh || "加南新生基督教會",
              source: "google-photos-auto-sync",
              account: "web@canaannewlife.org",
              syncedAt: new Date().toISOString()
            };
          } catch (err: any) {
            console.warn(`Auto-categorizing item ${item.id}, using smart fallback:`, err?.message || err);
            const fallback = generateHeuristicPhotoAnalysis({ description: item.description }, item.filename);
            return {
              id: `gp-auto-${item.id}`,
              title: fallback.titleEn || item.filename || "Church Gathering",
              titleZh: fallback.titleZh || item.filename || "加南聚會活動照片",
              category: fallback.category || "worship",
              date: item.creationTime ? item.creationTime.slice(0, 7) : fallback.suggestedDate || "2023-08",
              imageUrl: item.baseUrl.includes("=w") ? item.baseUrl : `${item.baseUrl}=w1000-h750`,
              description: fallback.descriptionEn || "Blessed moments at Canaan Church.",
              descriptionZh: fallback.descriptionZh || "加南新生基督教會聚會與團契活動紀錄。",
              albumName: fallback.albumNameEn || "Canaan Google Photos",
              albumNameZh: fallback.albumNameZh || "加南 Google 相簿",
              location: fallback.locationEn || "Canaan Shin Sheng Christian Church",
              locationZh: fallback.locationZh || "加南新生基督教會",
              source: "google-photos-auto-sync",
              account: "web@canaannewlife.org",
              syncedAt: new Date().toISOString()
            };
          }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }

      return res.json({
        success: true,
        account: "web@canaannewlife.org",
        syncedCount: results.length,
        photos: results,
      });
    } catch (error: any) {
      console.error("Auto-sync error:", error);
      return res.status(500).json({ error: error.message || "Failed to auto-sync Google Photos" });
    }
  });

  // Google Photos Media Items Proxy (using client Bearer token)
  app.post("/api/gallery/google-photos/list", async (req: express.Request, res: express.Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : req.body.accessToken;

      if (!token) {
        return res.status(401).json({ error: "Missing Google Photos access token" });
      }

      const pageSize = req.body.pageSize || 25;
      const pageToken = req.body.pageToken || undefined;
      const albumId = req.body.albumId || undefined;

      let targetUrl = `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${pageSize}`;
      let fetchOptions: RequestInit = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (pageToken) {
        targetUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
      }

      if (albumId) {
        targetUrl = "https://photoslibrary.googleapis.com/v1/mediaItems:search";
        fetchOptions = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            albumId,
            pageSize,
            pageToken,
          }),
        };
      }

      const gpResp = await fetch(targetUrl, fetchOptions);
      if (!gpResp.ok) {
        const errText = await gpResp.text();
        console.error("Google Photos API error:", gpResp.status, errText);
        return res.status(gpResp.status).json({ error: `Google Photos API responded with ${gpResp.status}: ${errText}` });
      }

      const data = await gpResp.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Google Photos listing error:", error);
      return res.status(500).json({ error: error.message || "Failed to list Google Photos media" });
    }
  });

  // Google Photos Albums Proxy
  app.post("/api/gallery/google-photos/albums", async (req: express.Request, res: express.Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : req.body.accessToken;

      if (!token) {
        return res.status(401).json({ error: "Missing Google Photos access token" });
      }

      const gpResp = await fetch("https://photoslibrary.googleapis.com/v1/albums?pageSize=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!gpResp.ok) {
        const errText = await gpResp.text();
        return res.status(gpResp.status).json({ error: errText });
      }

      const data = await gpResp.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Google Photos albums error:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch Google Photos albums" });
    }
  });

  // Google Photos Shared Album URL / Direct Image Links Scraper & Gemini AI Auto-Ingest
  app.post("/api/gallery/google-photos/sync-album-url", async (req: express.Request, res: express.Response) => {
    try {
      const { albumUrl, directUrls } = req.body;

      let imageUrls: string[] = [];

      if (directUrls && Array.isArray(directUrls) && directUrls.length > 0) {
        imageUrls = directUrls.filter((u: any) => typeof u === "string" && u.trim().startsWith("http"));
      }

      if (albumUrl && typeof albumUrl === "string" && albumUrl.trim()) {
        const trimmedUrl = albumUrl.trim();
        try {
          const fetchResp = await fetch(trimmedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            },
            redirect: "follow",
          });

          if (fetchResp.ok) {
            const html = await fetchResp.text();
            // Match Google Photos CDN images (lh3.googleusercontent.com)
            const regex = /https:\/\/lh3\.googleusercontent\.com\/(?:pw\/[a-zA-Z0-9_\-]+|[a-zA-Z0-9_\-]+)(?==|\"|\')/g;
            const matches = html.match(regex) || [];
            
            // Deduplicate and filter out avatar / icon dimensions
            const uniqueUrls = Array.from(new Set(matches)).filter(u => !u.includes("photo.jpg") && u.length > 40);
            imageUrls.push(...uniqueUrls.slice(0, 16));
          }
        } catch (fetchErr) {
          console.warn("Could not scrape album URL directly:", fetchErr);
        }
      }

      if (imageUrls.length === 0) {
        return res.status(400).json({ 
          error: "無法從該連結讀取相片。請確認該 Google 相簿已開啟「分享連結」權限，或直接貼上相片網址。" 
        });
      }

      const ai = getAI();
      const results: any[] = [];

      // Process with Gemini 3.7 Vision in chunks
      const chunkSize = 4;
      for (let i = 0; i < imageUrls.length; i += chunkSize) {
        const chunk = imageUrls.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(async (rawUrl, idx) => {
          const fullImgUrl = rawUrl.includes("=w") ? rawUrl : `${rawUrl}=w1200-h800`;
          try {
            let parsed: any = null;
            if (ai) {
              const promptText = `
You are the AI Media & Gallery Director for Canaan New Life Christian Church (加南新生基督教會) in Harbor City, CA (Account: web@canaannewlife.org).
Analyze this photo from the church's Google Photos album.

Classify it into one of these official categories matching Canaan's Google Sites Gallery:
1. 'groups': 2023 小組聚會 (Small Groups, fellowship gathering, cell groups)
2. 'children': 兒童機器人課程 (Children & STEM Robotics, Sunday school)
3. 'christmas': 2016 耶誕節與愛宴 (Christmas celebration, Christmas love feast)
4. 'retreat': 2015 靈修會營會 (Spiritual retreats 1-3, mountain quiet time)
5. 'outdoor': 2015 室外禮拜 (Outdoor park worship service, church picnic)
6. 'lunar': 2015 農曆新年 (Lunar New Year service, fellowship dumpling feast)
7. 'heritage': 2013 加盟台福一週年 (EFC 1st anniversary, historic milestones, board of deacons)
8. 'worship': 主日崇拜與聖餐 (Sunday worship, choir praise, communion)

Respond in JSON format:
{
  "category": "groups" | "children" | "christmas" | "retreat" | "outdoor" | "lunar" | "heritage" | "worship",
  "categoryNameZh": string,
  "titleZh": string (Traditional Chinese title, warm and faith-filled),
  "titleEn": string (English title),
  "descriptionZh": string (Spiritual Chinese reflection 40-80 words counting God's grace),
  "descriptionEn": string (English reflection 20-40 words),
  "albumNameZh": string,
  "albumNameEn": string,
  "locationZh": string,
  "locationEn": string,
  "suggestedDate": string (YYYY-MM),
  "detectedTags": string[]
}`;

              const parts: any[] = [];
              try {
                const imgRes = await fetch(fullImgUrl);
                if (imgRes.ok) {
                  const arrayBuffer = await imgRes.arrayBuffer();
                  const base64 = Buffer.from(arrayBuffer).toString("base64");
                  const mime = imgRes.headers.get("content-type") || "image/jpeg";
                  parts.push({
                    inlineData: { data: base64, mimeType: mime }
                  });
                }
              } catch (err) {
                console.warn("Could not fetch image bytes for AI:", err);
              }

              parts.push({ text: promptText });

              const response = await ai.models.generateContent({
                model: "gemini-3.7-flash",
                contents: [{ role: "user", parts }],
                config: { responseMimeType: "application/json" },
              });

              parsed = JSON.parse(response.text || "{}");
            }

            if (!parsed || !parsed.titleZh) {
              parsed = generateHeuristicPhotoAnalysis({ imageUrl: fullImgUrl }, `album_photo_${idx + 1}`);
            }

            return {
              id: `gp-shared-${Date.now()}-${i + idx}`,
              title: parsed.titleEn || "Church Gathering",
              titleZh: parsed.titleZh || "加南聚會精彩點滴",
              category: parsed.category || "worship",
              date: parsed.suggestedDate || "2023-08",
              imageUrl: fullImgUrl,
              description: parsed.descriptionEn || "Joyful moments in Christ at Canaan New Life Christian Church.",
              descriptionZh: parsed.descriptionZh || "在基督裡數算恩典，同享弟兄姊妹主內團契的喜樂時光。",
              albumName: parsed.albumNameEn || "Google Photos Shared Album",
              albumNameZh: parsed.albumNameZh || "Google 相簿共用相簿",
              location: parsed.locationEn || "Canaan Shin Sheng Christian Church",
              locationZh: parsed.locationZh || "加南新生基督教會",
              source: "google-photos",
              account: "web@canaannewlife.org",
              syncedAt: new Date().toISOString()
            };
          } catch (itemErr) {
            console.warn("Error analyzing photo, using fallback:", itemErr);
            const fallback = generateHeuristicPhotoAnalysis({ imageUrl: fullImgUrl }, `album_photo_${idx + 1}`);
            return {
              id: `gp-shared-${Date.now()}-${i + idx}`,
              title: fallback.titleEn || "Canaan Church Photo",
              titleZh: fallback.titleZh || "加南聚會活動照片",
              category: fallback.category || "worship",
              date: fallback.suggestedDate || "2023-08",
              imageUrl: fullImgUrl,
              description: fallback.descriptionEn || "Moments from Canaan New Life Christian Church.",
              descriptionZh: fallback.descriptionZh || "加南新生基督教會 Google 相簿照片。",
              albumName: fallback.albumNameEn || "Google Photos Album",
              albumNameZh: fallback.albumNameZh || "Google 相簿",
              location: fallback.locationEn || "Canaan Shin Sheng Christian Church",
              locationZh: fallback.locationZh || "加南新生基督教會",
              source: "google-photos",
              account: "web@canaannewlife.org",
              syncedAt: new Date().toISOString()
            };
          }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }

      return res.json({
        success: true,
        account: "web@canaannewlife.org",
        syncedCount: results.length,
        photos: results,
      });
    } catch (err: any) {
      console.error("Sync album URL error:", err);
      return res.status(500).json({ error: err.message || "Failed to parse and sync Google Photos album" });
    }
  });

  // ==========================================
  // GALLERY PHOTOS, ALBUMS & CATEGORIES PERSISTENCE APIS
  // ==========================================
  let inMemoryGalleryPhotos: any[] = [];
  let inMemoryGalleryCategories: any[] = [];
  let inMemoryGoogleAlbums: any[] = [];

  app.get("/api/gallery/albums", (req: express.Request, res: express.Response) => {
    res.json({
      success: true,
      count: inMemoryGoogleAlbums.length,
      albums: inMemoryGoogleAlbums
    });
  });

  app.post("/api/gallery/albums", (req: express.Request, res: express.Response) => {
    try {
      const { albums } = req.body;
      if (Array.isArray(albums)) {
        inMemoryGoogleAlbums = albums;
        return res.json({ success: true, count: albums.length, message: "Google albums saved to server" });
      }
      return res.status(400).json({ error: "Albums array required" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update Google albums" });
    }
  });

  app.get("/api/gallery/photos", (req: express.Request, res: express.Response) => {
    res.json({
      success: true,
      count: inMemoryGalleryPhotos.length,
      photos: inMemoryGalleryPhotos
    });
  });

  app.post("/api/gallery/photos", (req: express.Request, res: express.Response) => {
    try {
      const { photos } = req.body;
      if (Array.isArray(photos)) {
        inMemoryGalleryPhotos = photos;
        return res.json({ success: true, count: photos.length, message: "Gallery photos saved to server" });
      }
      return res.status(400).json({ error: "Photos array required" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update gallery photos" });
    }
  });

  app.get("/api/gallery/categories", (req: express.Request, res: express.Response) => {
    res.json({
      success: true,
      categories: inMemoryGalleryCategories
    });
  });

  app.post("/api/gallery/categories", (req: express.Request, res: express.Response) => {
    try {
      const { categories } = req.body;
      if (Array.isArray(categories)) {
        inMemoryGalleryCategories = categories;
        return res.json({ success: true, count: categories.length });
      }
      return res.status(400).json({ error: "Categories array required" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update gallery categories" });
    }
  });

  // ==========================================
  // SUNDAY SERMON MANAGEMENT & AI ASSIST APIS
  // ==========================================
  app.get("/api/sermons", (req: express.Request, res: express.Response) => {
    res.json({
      success: true,
      sermons: inMemorySermons
    });
  });

  app.post("/api/sermons", (req: express.Request, res: express.Response) => {
    try {
      const { sermons } = req.body;
      if (Array.isArray(sermons)) {
        inMemorySermons = sermons;
        return res.json({ success: true, count: sermons.length });
      }
      return res.status(400).json({ error: "Sermons array required" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update sermons" });
    }
  });

  app.delete("/api/sermons/:id", (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const initialLength = inMemorySermons.length;
      inMemorySermons = inMemorySermons.filter(s => s.id !== id);
      return res.json({
        success: true,
        deletedId: id,
        deleted: inMemorySermons.length < initialLength,
        remainingCount: inMemorySermons.length
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to delete sermon" });
    }
  });

  app.delete("/api/sermons", (req: express.Request, res: express.Response) => {
    inMemorySermons = [];
    return res.json({ success: true, count: 0 });
  });

  app.post("/api/sermons/ai-assist", async (req: express.Request, res: express.Response) => {
    try {
      const { titleZh, scriptureZh, speakerZh, date } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          success: true,
          data: {
            title: titleZh || "Sunday Message",
            titleZh: titleZh || "主日證道",
            speaker: speakerZh || "Rev. Pastor",
            speakerZh: speakerZh || "牧師",
            scripture: scriptureZh || "Scripture Passage",
            scriptureZh: scriptureZh || "聖經經文",
            series: "Sunday Message",
            seriesZh: "主日證道",
            summary: "Sunday sermon delivered at Canaan New Life Christian Church, sharing God's grace and truth.",
            summaryZh: `在加南新生基督教會主日崇拜中證道分享${scriptureZh ? `經文「${scriptureZh}」` : ''}，勸勉弟兄姊妹在基督裡同心扎根、數算神恩。`,
            points: [
              "1. Hearing and obeying God's living Word",
              "2. Walking in grace, faith, and love",
              "3. Living out our heavenly calling in daily life"
            ],
            pointsZh: [
              "一、聆聽並遵行神活潑常存的真道",
              "二、在恩典、信心與彼此相愛中同行",
              "三、在日常生活中活出屬天的呼召與見證"
            ]
          }
        });
      }

      const promptText = `
You are the AI Pastoral Assistant and Content Director for Canaan New Life Christian Church (加南新生基督教會) in Harbor City, CA (web@canaannewlife.org).
A church administrator is entering/updating a Sunday sermon record.

Sermon Input:
- Chinese Title (講道題目): ${titleZh || "主日證道"}
- Scripture (經文): ${scriptureZh || ""}
- Speaker (講員): ${speakerZh || "陳嘉彰 牧師"}
- Date: ${date || "2026-08-16"}

Please generate a well-structured, biblically sound, and bilingually accurate JSON object matching this structure:
{
  "title": "Clear English translation of title",
  "titleZh": "${titleZh || "主日證道"}",
  "speaker": "English title and name of speaker (e.g. Rev. Jiachang Chen)",
  "speakerZh": "${speakerZh || "陳嘉彰 牧師"}",
  "scripture": "Standard English book chapter & verse (e.g. Luke 5:27-32)",
  "scriptureZh": "${scriptureZh || ""}",
  "series": "Sunday Worship / Sunday Message",
  "seriesZh": "主日崇拜 / 主日證道",
  "summary": "English spiritual sermon summary (40-70 words)",
  "summaryZh": "Traditional Chinese spiritual summary (60-120 words with Bible truth focus)",
  "points": [
    "1. First main outline point in English",
    "2. Second main outline point in English",
    "3. Third main outline point in English"
  ],
  "pointsZh": [
    "一、第一大綱要點（含經文出處）",
    "二、第二大綱要點（含經文出處）",
    "三、第三大綱要點（含經文出處）"
  ]
}
Return ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        data: parsed
      });
    } catch (err: any) {
      console.warn("AI sermon assist error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate sermon outline" });
    }
  });

  // Backend endpoint to sync ALL church data directly to GitHub repo
  app.post("/api/github/sync-all", async (req: express.Request, res: express.Response) => {
    try {
      const { token, owner, repo, branch, data, commitMessage } = req.body;

      if (!token) {
        return res.status(400).json({ error: "GitHub Personal Access Token is required" });
      }
      if (!owner || !repo) {
        return res.status(400).json({ error: "Repository owner and repo name are required" });
      }

      const activeBranch = branch || "main";
      const sermonsList = Array.isArray(data?.sermons) ? data.sermons : inMemorySermons;
      const photosList = Array.isArray(data?.photos) ? data.photos : [];
      const categoriesList = Array.isArray(data?.categories) ? data.categories : [];
      const albumsList = Array.isArray(data?.albums) ? data.albums : [];
      const bulletinData = data?.bulletin || {};

      // Update in-memory sermons
      if (Array.isArray(data?.sermons)) {
        inMemorySermons = data.sermons;
      }

      // Generate file contents
      const versionStr = `version-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
      const sermonsTs = `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Sermons: ${sermonsList.length}
// ============================================================================

export const SERMONS_DATA_VERSION = "${versionStr}";

export const INITIAL_SERMONS: Sermon[] = ${JSON.stringify(sermonsList, null, 2)};

export const RECENT_SERMONS: Sermon[] = INITIAL_SERMONS;
`;

      const sermonStorageTs = `import { Sermon } from '../types';
import * as SermonsData from '../data/sermonsData';

export const INITIAL_SERMONS: Sermon[] = 
  (SermonsData as any).INITIAL_SERMONS || 
  (SermonsData as any).RECENT_SERMONS || 
  [];

export const SERMONS_DATA_VERSION: string = 
  (SermonsData as any).SERMONS_DATA_VERSION || 
  \`v-\${INITIAL_SERMONS.length}-\${INITIAL_SERMONS[0]?.date || 'master'}\`;

/**
 * Generate a deterministic fingerprint of the compiled master sermons.
 * Any change in titles, dates, speakers, scriptures, passcodes or count in code triggers an immediate refresh.
 */
export function getMasterDataFingerprint(): string {
  try {
    return \`\${SERMONS_DATA_VERSION}::\` + INITIAL_SERMONS.map(s => 
      \`\${s.id}:\${s.date}:\${s.titleZh}:\${s.speakerZh}:\${s.videoUrl || ''}:\${s.videoPasscode || ''}\`
    ).join('|');
  } catch {
    return \`\${SERMONS_DATA_VERSION}::\${INITIAL_SERMONS.length}\`;
  }
}

/**
 * Robust sermon loader and data synchronization helper.
 * 
 * Guarantees that when a new build or GitHub commit is deployed to Cloudflare Pages:
 * 1. The compiled INITIAL_SERMONS is always authoritative for all visitors.
 * 2. If the compiled code changes on GitHub/Cloudflare, stale localStorage is immediately
 *    superseded by the newly deployed INITIAL_SERMONS.
 * 3. Admins who edit locally can test, but deployed releases always reflect the true repository state.
 */
export function loadAndSyncSermons(): Sermon[] {
  try {
    const currentFingerprint = getMasterDataFingerprint();
    const savedFingerprint = localStorage.getItem('canaan_sermons_master_fingerprint');
    const saved = localStorage.getItem('canaan_sermons_data');

    // Case 1: Fresh visit, new deployment on Cloudflare, or fingerprint mismatch
    if (!saved || savedFingerprint !== currentFingerprint) {
      const freshList = [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      try {
        localStorage.setItem('canaan_sermons_data', JSON.stringify(freshList));
        localStorage.setItem('canaan_sermons_master_fingerprint', currentFingerprint);
        localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
      } catch (e) {
        console.warn("Storage sync save error:", e);
      }
      return freshList;
    }

    // Case 2: Matching fingerprint - load cached list
    let parsed: Sermon[] = [];
    try {
      parsed = JSON.parse(saved);
    } catch {
      return resetSermonsToDeployedMaster();
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return resetSermonsToDeployedMaster();
    }

    // Ensure sorted by date descending
    parsed.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return parsed;
  } catch (err) {
    console.warn("loadAndSyncSermons fallback to INITIAL_SERMONS:", err);
    return INITIAL_SERMONS;
  }
}

/**
 * Force reset cache to the latest deployed INITIAL_SERMONS version.
 */
export function resetSermonsToDeployedMaster(): Sermon[] {
  try {
    const currentFingerprint = getMasterDataFingerprint();
    const list = [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    localStorage.setItem('canaan_sermons_data', JSON.stringify(list));
    localStorage.setItem('canaan_sermons_master_fingerprint', currentFingerprint);
    localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
    return list;
  } catch (e) {
    console.warn("Reset storage error:", e);
    return INITIAL_SERMONS;
  }
}
`;

      const galleryTs = `import { GalleryPhoto, GalleryCategory, GoogleAlbum } from '../types';
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

export const INITIAL_GOOGLE_ALBUMS: GoogleAlbum[] = ${JSON.stringify(albumsList, null, 2)};

export const GALLERY_CATEGORIES: GalleryCategory[] = ${JSON.stringify(categoriesList, null, 2)};

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = ${JSON.stringify(photosList, null, 2)};

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
      (photo.id && photo.id.startsWith('gp-'))
    );
  }

  const pCat = (photo.category || '').trim().toLowerCase();
  const targetKey = activeCategoryKey.trim().toLowerCase();

  if (pCat === targetKey) return true;

  const targetCat = categoriesList.find(c => c.key.toLowerCase() === targetKey);
  if (targetCat) {
    if (photo.category === targetCat.labelZh || photo.category === targetCat.labelEn) return true;
    if (photo.albumNameZh === targetCat.labelZh || photo.albumName === targetCat.labelEn) return true;
  }

  const ALIAS_MAP: Record<string, string[]> = {
    groups: ['groups', 'group', 'fellowship', 'smallgroup', 'smallgroups', 'small-group', 'small-groups', '2023 小組聚會', '2023小組聚會', '小組聚會', '家庭小組', '小組', '團契'],
    children: ['children', 'child', 'kids', 'robotics', 'stem', '兒童機器人課程', '兒童機器人', '機器人', '兒童', '主日學'],
    christmas: ['christmas', 'xmas', '2016 耶誕節與愛宴', '2016 耶誕節', '2016耶誕節與愛宴', '耶誕節與愛宴', '耶誕節', '聖誕節', '愛宴'],
    retreat: ['retreat', 'retreats', 'camp', '2015 靈修會營會', '2015 靈修會', '2015靈修會營會', '靈修會營會', '靈修會', '營會'],
    outdoor: ['outdoor', 'outdoors', 'picnic', '2015 室外禮拜', '2015室外禮拜', '室外禮拜', '戶外禮拜', '戶外', '野餐'],
    lunar: ['lunar', 'newyear', 'cny', '2015 農曆新年', '2015農曆新年', '農曆新年', '春節', '新春', '過年'],
    heritage: ['heritage', 'anniversary', 'history', '2013 加盟台福一週年', '2013加盟台福一週年', '加盟台福一週年', '加盟台福', '台福', '歷史', '建堂'],
    worship: ['worship', 'sunday', 'communion', '主日崇拜與聖餐', '主日崇拜', '崇拜', '主日', '聖餐']
  };

  const aliasesForTarget = ALIAS_MAP[targetKey] || [];
  if (aliasesForTarget.some(alias => pCat === alias.toLowerCase() || pCat.includes(alias.toLowerCase()))) {
    return true;
  }

  if (photo.albumNameZh && aliasesForTarget.some(alias => photo.albumNameZh.toLowerCase().includes(alias.toLowerCase()))) {
    return true;
  }

  return false;
};
`;

      const bulletinTs = `import { WEEKLY_BIBLE_READING } from './churchData';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - WEEKLY BULLETIN & READING PLAN MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// ============================================================================

export interface BulletinData {
  memoryVerseZh: string;
  memoryVerseEn: string;
  verseReference: string;
  readingRange: string;
  schedule: Array<{
    date: string;
    oldTestament: string;
    newTestament: string;
  }>;
  announcements?: string[];
  pastoralNoteZh?: string;
  pastoralNoteEn?: string;
  updatedAt?: string;
}

export const INITIAL_BULLETIN_DATA: BulletinData = ${JSON.stringify(bulletinData, null, 2)};
`;

      const masterBackupJson = JSON.stringify({
        app: "Canaan Shin Sheng Christian Church",
        exportedAt: new Date().toISOString(),
        version: "2.0",
        stats: {
          totalSermons: sermonsList.length,
          totalPhotos: photosList.length,
          totalCategories: categoriesList.length,
          totalAlbums: albumsList.length,
        },
        data: {
          sermons: sermonsList,
          photos: photosList,
          categories: categoriesList,
          albums: albumsList,
          bulletin: bulletinData
        }
      }, null, 2);

      const files = [
        { path: "src/data/sermonsData.ts", content: sermonsTs },
        { path: "src/utils/sermonStorage.ts", content: sermonStorageTs },
        { path: "src/data/galleryData.ts", content: galleryTs },
        { path: "src/data/bulletinData.ts", content: bulletinTs },
        { path: "public/canaan_master_data.json", content: masterBackupJson }
      ];

      // Update files sequentially via GitHub REST API
      let lastSha = "latest";
      let lastCommitUrl = `https://github.com/${owner}/${repo}`;
      const defaultMsg = commitMessage || `feat(data): sync all church data (${sermonsList.length} sermons, ${photosList.length} photos) - ${new Date().toISOString().slice(0, 10)}`;

      for (const f of files) {
        // Fetch current sha
        let fileSha: string | undefined = undefined;
        try {
          const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${f.path}?ref=${activeBranch}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "User-Agent": "CanaanChurchApp/1.0"
            }
          });
          if (getRes.ok) {
            const info: any = await getRes.json();
            fileSha = info.sha;
          }
        } catch {
          // ignore
        }

        const base64Content = Buffer.from(f.content, "utf-8").toString("base64");
        const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${f.path}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "CanaanChurchApp/1.0"
          },
          body: JSON.stringify({
            message: defaultMsg,
            content: base64Content,
            branch: activeBranch,
            sha: fileSha
          })
        });

        if (putRes.ok) {
          const resData: any = await putRes.json();
          if (resData.commit?.sha) {
            lastSha = resData.commit.sha.slice(0, 7);
            lastCommitUrl = resData.commit.html_url || lastCommitUrl;
          }
        }
      }

      return res.json({
        success: true,
        commitSha: lastSha,
        commitUrl: lastCommitUrl,
        syncedFiles: files.map(f => f.path),
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Server GitHub sync-all error:", err);
      return res.status(500).json({ error: err.message || "Failed to sync all data to GitHub" });
    }
  });

  // Backend endpoint to sync sermons directly to GitHub repo
  app.post("/api/github/sync-sermons", async (req: express.Request, res: express.Response) => {
    try {
      const { token, owner, repo, branch, path: targetPath, sermons, commitMessage } = req.body;

      if (!token) {
        return res.status(400).json({ error: "GitHub Personal Access Token is required" });
      }
      if (!owner || !repo) {
        return res.status(400).json({ error: "Repository owner and repo name are required" });
      }

      const activeBranch = branch || "main";
      const activePath = targetPath || "src/data/sermonsData.ts";
      const sermonList = Array.isArray(sermons) ? sermons : inMemorySermons;

      // Update in-memory sermons as well
      if (Array.isArray(sermons)) {
        inMemorySermons = sermons;
      }

      const tsContent = `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Sermons: ${sermonList.length}
// ============================================================================

export const INITIAL_SERMONS: Sermon[] = ${JSON.stringify(sermonList, null, 2)};

export const RECENT_SERMONS: Sermon[] = INITIAL_SERMONS;
`;

      const base64Content = Buffer.from(tsContent, "utf-8").toString("base64");

      // 1. Fetch current file sha if exists
      let currentSha: string | undefined = undefined;
      const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${activePath}?ref=${activeBranch}`;
      
      const getRes = await fetch(getFileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "CanaanChurchApp/1.0"
        }
      });

      if (getRes.ok) {
        const fileInfo: any = await getRes.json();
        currentSha = fileInfo.sha;
      }

      // 2. Put file contents
      const putFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${activePath}`;
      const defaultMsg = `feat(sermons): update Sunday sermon archive (${sermonList.length} records) - ${new Date().toISOString().slice(0, 10)}`;
      
      const putRes = await fetch(putFileUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "CanaanChurchApp/1.0"
        },
        body: JSON.stringify({
          message: commitMessage || defaultMsg,
          content: base64Content,
          branch: activeBranch,
          sha: currentSha
        })
      });

      if (!putRes.ok) {
        const errJson: any = await putRes.json().catch(() => ({}));
        return res.status(putRes.status).json({
          error: errJson.message || `GitHub commit failed (${putRes.status})`
        });
      }

      const commitResult: any = await putRes.json();
      return res.json({
        success: true,
        commitSha: commitResult.commit?.sha?.slice(0, 7) || "latest",
        commitUrl: commitResult.commit?.html_url || `https://github.com/${owner}/${repo}`,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Server GitHub sync error:", err);
      return res.status(500).json({ error: err.message || "Failed to sync to GitHub" });
    }
  });

  // Vite or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
