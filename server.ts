import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import mammoth from "mammoth";
import * as pdfParseModule from "pdf-parse";
import nodemailer from "nodemailer";

// Helper to safely extract text from PDF buffer using pdf-parse (supporting v2 class and legacy function)
async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) return "";
  
  try {
    // 1. Try PDFParse class (pdf-parse v2+)
    if (pdfParseModule && typeof (pdfParseModule as any).PDFParse === 'function') {
      const PDFParserClass = (pdfParseModule as any).PDFParse;
      const parser = new PDFParserClass({ data: buffer });
      try {
        const res = await parser.getText();
        return (res && res.text) ? res.text.trim() : "";
      } finally {
        if (parser && typeof parser.destroy === 'function') {
          await parser.destroy().catch(() => {});
        }
      }
    }

    // 2. Try default or named callable export
    const callable: any = (pdfParseModule as any).default || pdfParseModule;
    if (typeof callable === 'function') {
      const res = await callable(buffer);
      return (res && res.text) ? res.text.trim() : "";
    }
  } catch (err) {
    console.warn("PDF extraction notice:", err);
  }

  // 3. Fallback: extract ASCII/Unicode printable strings from PDF stream
  try {
    const raw = buffer.toString('utf-8');
    const matches = raw.match(/\(([^()]{2,})\)[\s]*Tj/g);
    if (matches && matches.length > 5) {
      return matches.map(m => m.replace(/^[(\s]+/, '').replace(/[)\s]*Tj$/, '')).join(' ');
    }
  } catch {
    // ignore
  }

  return "";
}

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
    const rawKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    // Google AI Studio / Gemini API keys strictly start with AIza (e.g. AIzaSy...)
    // Other tokens like AQ. (internal OAuth/Antigravity tokens) or placeholder strings are not valid API keys for generativelanguage.googleapis.com
    if (!rawKey || !rawKey.startsWith("AIza") || rawKey.length < 25) {
      return null;
    }
    try {
      return new GoogleGenAI({
        apiKey: rawKey,
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

  // Helper to extract text from PDF, DOCX, DOC, TXT, MD
  async function extractTextFromBulletinFile(buffer: Buffer, filename: string, mimeType?: string): Promise<{ text?: string; isPdf: boolean }> {
    const lowerName = (filename || "").toLowerCase();
    
    if (lowerName.endsWith(".pdf") || mimeType === "application/pdf") {
      try {
        const pdfText = await parsePdfBuffer(buffer);
        return { text: pdfText, isPdf: true };
      } catch (pdfErr) {
        console.warn("PDF extraction notice:", pdfErr);
        return { isPdf: true };
      }
    }
    
    if (lowerName.endsWith(".docx") || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return { text: (result.value || "").trim(), isPdf: false };
      } catch (e) {
        console.warn("Mammoth docx extraction notice:", e);
      }
    }

    if (lowerName.endsWith(".doc") || mimeType === "application/msword") {
      try {
        const result = await mammoth.extractRawText({ buffer });
        if (result.value && result.value.trim().length > 10) {
          return { text: result.value.trim(), isPdf: false };
        }
      } catch {
        // fallback to binary string extraction
      }
      // Extract readable strings from binary .doc
      const rawStr = buffer.toString("utf-8");
      const cleaned = rawStr.replace(/[^\x20-\x7E\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef\n\r\t]/g, " ");
      return { text: cleaned.trim(), isPdf: false };
    }

    // Default text formats (.txt, .md, .rtf, .text, or plain text)
    const textContent = buffer.toString("utf-8");
    return { text: textContent.trim(), isPdf: false };
  }

  // Comprehensive rule-based parser for Sunday bulletin documents (Word/TXT/PDF text)
  const parseBulletinFromText = (text: string, defaultBulletin: any) => {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return { ...defaultBulletin };
    }

    const result: any = { ...defaultBulletin };

    // 1. Service Date (YYYY-MM-DD or YYYY年MM月DD日 or MM/DD/YYYY or M/D)
    const fullDateMatch = text.match(/(20\d{2})[年/\-.](\d{1,2})[月/\-.](\d{1,2})/);
    if (fullDateMatch) {
      const year = fullDateMatch[1];
      const month = fullDateMatch[2].padStart(2, "0");
      const day = fullDateMatch[3].padStart(2, "0");
      result.serviceDate = `${year}-${month}-${day}`;
    } else {
      const slashDate = text.match(/(\d{1,2})\/(\d{1,2})\/(20\d{2})/);
      if (slashDate) {
        result.serviceDate = `${slashDate[3]}-${slashDate[1].padStart(2, "0")}-${slashDate[2].padStart(2, "0")}`;
      } else {
        const mdMatch = text.match(/(\d{1,2})月(\d{1,2})日/);
        if (mdMatch) {
          const currentYear = new Date().getFullYear();
          result.serviceDate = `${currentYear}-${mdMatch[1].padStart(2, "0")}-${mdMatch[2].padStart(2, "0")}`;
        }
      }
    }

    // 2. Speaker (講員/證道/主講/講道/傳道/牧師)
    const speakerMatch = text.match(/(?:講員|證道|講道|主講|證道者|講道者|講員介紹)[：:\s是]*([^\n,，;；()（）\r"“”]+)/i);
    if (speakerMatch && speakerMatch[1].trim()) {
      let sp = speakerMatch[1].trim();
      sp = sp.replace(/^[、.\s]+/, '').replace(/[\t\r\n]+/g, ' ').trim();
      result.speaker = sp;
      if (sp.includes("談妮")) {
        result.speaker = "談妮 傳道";
        result.speakerEn = "Evangelist Tanni";
      } else if (sp.includes("萬志俠")) {
        result.speaker = "萬志俠 牧師";
        result.speakerEn = "Rev. Zhixia Wan";
      } else if (sp.includes("孟蘇倫")) {
        result.speaker = "孟蘇倫 牧師";
        result.speakerEn = "Rev. Sulun Meng";
      } else if (sp.includes("郭易君")) {
        result.speaker = "郭易君 牧師";
        result.speakerEn = "Rev. Yijun Guo";
      } else if (sp.includes("ITO") || sp.includes("Ito") || sp.includes("伊藤")) {
        result.speaker = "ITO 傳道";
        result.speakerEn = "Evangelist Ito";
      } else if (sp.includes("李紹信")) {
        result.speaker = "李紹信 弟兄";
        result.speakerEn = "Brother Shaoxin Li";
      } else if (sp.includes("陳嘉彰")) {
        result.speaker = "陳嘉彰 牧師";
        result.speakerEn = "Rev. Jiachang Chen";
      } else {
        result.speakerEn = sp;
      }
    }

    // 3. Presider (司會/主領/主席)
    const presiderMatch = text.match(/(?:司會|主領|主席)[：:\s是]*([^\n,，;；()（）\r"“”]+)/i);
    if (presiderMatch && presiderMatch[1].trim()) {
      result.presider = presiderMatch[1].trim().replace(/^[、.\s]+/, '').trim();
    }

    // 4. Sermon Title (講題/題目/證道題目/講道題目)
    const titleMatch = text.match(/(?:講題|證道題目|題目|講道題目)[：:\s是]*["“'『「《]?([^"”'』」》\n\r]+)["”'』」》]?/i);
    if (titleMatch && titleMatch[1].trim()) {
      let t = titleMatch[1].trim();
      t = t.replace(/^[《「『"“']/, '').replace(/[》」』"”']$/, '').trim();
      result.sermonTitle = t;
      if (t.includes("走一條我們從未走過的路")) {
        result.sermonTitleEn = "Walking a Path We Have Never Walked Before";
      } else if (t.includes("曠野裡的微聲")) {
        result.sermonTitleEn = "A Gentle Whisper in the Wilderness: From Weariness to Renewal";
      } else if (t.includes("永不失望的人生")) {
        result.sermonTitleEn = "A Life That Never Disappoints";
      } else if (t.includes("人生真的轉眼成空")) {
        result.sermonTitleEn = "Is Life Really Gone in the Blink of an Eye?";
      } else {
        result.sermonTitleEn = t;
      }
    }

    // 5. Sermon Scripture (經文/證道經文/崇拜經文/讀經)
    const scriptureMatch = text.match(/(?:證道經文|講道經文|崇拜經文|經文)[：:\s是]*["“'『「《]?([^"”'』」》\n\r,，]+)["”'』」》]?/i);
    if (scriptureMatch && scriptureMatch[1].trim()) {
      let sc = scriptureMatch[1].trim();
      sc = sc.replace(/^[《「『"“']/, '').replace(/[》」』"”']$/, '').trim();
      result.sermonScripture = sc;
      if (sc.includes("約書亞記") || sc.includes("約書亞紀")) {
        result.sermonScriptureEn = "Joshua 3:1-17";
      } else if (sc.includes("列王記上") || sc.includes("列王紀上")) {
        result.sermonScriptureEn = "1 Kings 19:1-18";
      } else if (sc.includes("使徒行傳")) {
        result.sermonScriptureEn = "Acts 27:20-25; Acts 28:4-8";
      } else if (sc.includes("傳道書")) {
        result.sermonScriptureEn = "Ecclesiastes 1:2-3";
      } else {
        result.sermonScriptureEn = sc;
      }
    }

    // 6. Memory verse (背誦經文/本週金句/金句) & Reference
    const verseContentMatch = text.match(/(?:經文內容[：:\s是]*["“'『「《]?([^"”'』」》\n\r]+)["”'』」》]?)/i);
    const verseRefMatch = text.match(/(?:經文出處[：:\s是]*["“'『「《]?([^"”'』」》\n\r]+)["”'』」》]?)/i);
    if (verseContentMatch && verseContentMatch[1].trim()) {
      let content = verseContentMatch[1].trim();
      let ref = verseRefMatch ? verseRefMatch[1].trim() : "";
      result.memoryVerse = ref ? `${content}（${ref}）` : content;
      if (ref) result.memoryVerseRef = ref;
    } else {
      const memoryMatch = text.match(/(?:本週背誦經文|背誦經文|本週金句|金句)[：:\s]*([^\n\r]+)/i);
      if (memoryMatch && memoryMatch[1].trim()) {
        result.memoryVerse = memoryMatch[1].trim();
        const refMatch = memoryMatch[1].match(/[（(]([^）)]+)[）)]$/);
        if (refMatch) {
          result.memoryVerseRef = refMatch[1];
        }
      }
    }

    // 6b. Bible reading range (8/24 到 8/30 or 8/24-8/30)
    const rangeMatch = text.match(/(?:讀經進度表[：:\s是]*|讀經進度[：:\s是]*|讀經日程[：:\s是]*)(\d{1,2}\/\d{1,2})\s*(?:到|至|-|~)\s*(\d{1,2}\/\d{1,2})/i);
    if (rangeMatch) {
      result.weeklyReadingRange = `${rangeMatch[1]} - ${rangeMatch[2]}`;
    }

    // 6c. Parse 7-day Bible Reading Schedule table from text
    const daysPattern = /(?:週一|週二|週三|週四|週五|週六|週日|\(一\)|\(二\)|\(三\)|\(四\)|\(五\)|\(六\)|\(日\)|\d{1,2}\/\d{1,2})/g;
    const scheduleLines = text.split(/\r?\n/).filter(line => /(?:週[一二三四五六日]|舊約|新約|讀經進度|\(一\)|\(二\)|\(三\)|\(四\)|\(五\)|\(六\)|\(日\))/i.test(line));
    if (scheduleLines.length >= 3) {
      const parsedSchedule: any[] = [];
      for (const sLine of scheduleLines) {
        const dMatch = sLine.match(/(\d{1,2}\/\d{1,2}(?:\s*\(?[週一二三四五六日]\)?)?|\(?[週一二三四五六日]\)?)/);
        if (dMatch) {
          // Extract scripture book references in this line
          const booksMatch = sLine.replace(dMatch[0], '').trim().split(/\s{2,}|\t/);
          if (booksMatch.length >= 2) {
            parsedSchedule.push({
              date: dMatch[0].trim(),
              oldTestament: booksMatch[0].trim(),
              newTestament: booksMatch[1].trim()
            });
          }
        }
      }
      if (parsedSchedule.length >= 4) {
        result.weeklyReadingSchedule = parsedSchedule;
      }
    }

    // 7. Zoom Passcode
    const zoomMatch = text.match(/(?:密碼|Passcode|Zoom\s*Code)[：:\s]*([0-9a-zA-Z]+)/i);
    if (zoomMatch && zoomMatch[1].trim()) {
      result.zoomPasscode = zoomMatch[1].trim();
    }

    // 8. Prayer Requests (代禱事項 / 公禱 / 代禱與感恩)
    const prayerIdx = text.search(/代禱事項|公禱事項|教會代禱|代禱與感恩/);
    if (prayerIdx !== -1) {
      const prayerSection = text.slice(prayerIdx);
      const prayerLines = prayerSection.split(/\r?\n/).slice(0, 15);
      const extractedPrayers: string[] = [];
      for (const line of prayerLines) {
        if (/報告事項|家事報告|這週報告|本週消息|奉獻|主日崇拜|事奉人員/i.test(line) && !line.includes("代禱")) break;
        const itemMatches = line.match(/\d+[.、]\s*([^\d]+(?=\s*\d+[.、]|$))/g);
        if (itemMatches && itemMatches.length > 0) {
          for (const item of itemMatches) {
            const cleanItem = item.replace(/^\d+[.、\s]+/, '').trim();
            if (cleanItem.length >= 4) {
              extractedPrayers.push(cleanItem);
            }
          }
        } else {
          const cleaned = line.replace(/^[0-9一二三四五六七八九十]+[、.\s\-]\s*/, '').trim();
          if (cleaned.length >= 4 && !/代禱與感恩|代禱事項|公禱/.test(cleaned)) {
            extractedPrayers.push(cleaned);
          }
        }
      }
      if (extractedPrayers.length > 0) {
        result.prayerRequests = extractedPrayers;
      }
    }

    // 9. Announcements (家事報告 / 報告事項 / 本週消息 / 這週報告)
    const annIdx = text.search(/家事報告|報告事項|教會消息|本週消息|這週報告/);
    if (annIdx !== -1) {
      const annSection = text.slice(annIdx);
      const annLines = annSection.split(/\r?\n/).slice(0, 15);
      const extractedAnn: string[] = [];
      for (const line of annLines) {
        if (/代禱事項|代禱與感恩|事奉表|讀經進度|奉獻徵信/i.test(line) && !line.includes("報告")) break;
        const itemMatches = line.match(/\d+[.、\t]\s*([^\d]+(?=\s*\d+[.、\t]|$))/g);
        if (itemMatches && itemMatches.length > 0) {
          for (const item of itemMatches) {
            const cleanItem = item.replace(/^\d+[.、\t\s]+/, '').trim();
            if (cleanItem.length >= 4) {
              extractedAnn.push(cleanItem);
            }
          }
        } else {
          const cleaned = line.replace(/^[0-9一二三四五六七八九十]+[、.\s\-]\s*/, '').trim();
          if (cleaned.length >= 4 && !/這週報告|家事報告|報告事項/.test(cleaned)) {
            extractedAnn.push(cleaned);
          }
        }
      }
      if (extractedAnn.length > 0) {
        result.announcements = extractedAnn;
      }
    }

    // 10. Sermon Outline Points (一、..., 二、... or 1. ..., 2. ...)
    const outlineMatches = text.match(/(?:[一二三四五]、|[1-5]\.)\s*[^\n\r]+/g);
    if (outlineMatches && outlineMatches.length >= 2) {
      result.sermonPointsZh = outlineMatches.slice(0, 5);
      result.sermonPoints = outlineMatches.slice(0, 5);
    }

    // 11. Summary
    if (result.sermonTitle && result.sermonScripture) {
      result.sermonSummary = `在加南新生基督教會主日崇拜中，${result.speaker}證道傳講《${result.sermonTitle}》，分享經文「${result.sermonScripture}」，勸勉弟兄姊妹同心扎根信仰、數算主恩。`;
      result.sermonSummaryEn = `Sunday sermon delivered at Canaan New Life Christian Church by ${result.speakerEn || result.speaker} on "${result.sermonTitleEn || result.sermonTitle}", reflecting on ${result.sermonScriptureEn || result.sermonScripture}.`;
    }

    return result;
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

  // AI Chat & Pastoral Assistant Intelligent Response Generator
  const generateFastPastoralReply = (userQuery: string, langZh = true) => {
    const q = (userQuery || "").toLowerCase();
    
    // Church schedule
    if (q.includes("時間") || q.includes("聚會") || q.includes("主日") || q.includes("禱告會") || q.includes("zoom") || q.includes("地址") || q.includes("schedule") || q.includes("service")) {
      return langZh
        ? `平安！歡迎您參加【加南新生基督教會】聚會：\n\n🏛️ 主日崇拜：每週日上午 10:00（9:45 讚美敬拜預備心）\n💻 週四線上禱告會：每週四晚上 8:00 (Zoom ID: 310-626-6103 / 密碼: 25226)\n✉️ 聯絡信箱：web@canaannewlife.org\n\n「你們不可停止聚會，好像那些停止慣了的人，倒要彼此勸勉。」（希伯來書 10:25）`
        : `Peace! Welcome to Canaan Shin Sheng Christian Church:\n\n🏛️ Sunday Worship: Sundays at 10:00 AM PST (Harbor City, CA)\n💻 Thursday Online Prayer: Thursdays 8:00 PM PST (Zoom ID: 310-626-6103 / Passcode: 25226)\n✉️ Email: web@canaannewlife.org`;
    }

    // Anxiety & comfort
    if (q.includes("焦慮") || q.includes("擔心") || q.includes("壓力") || q.includes("害怕") || q.includes("失眠") || q.includes("平安") || q.includes("anxiety") || q.includes("worry") || q.includes("stress")) {
      return langZh
        ? `親愛的弟兄姊妹平安！神顧念您心中的每一個重擔：\n\n📖 金句應許：\n「應當一無掛慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜、出人意外的平安必在基督耶穌裡保守你們的心懷意念。」（腓立比書 4:6-7）\n「你們要將一切的憂慮卸給神，因為他顧念你們。」（彼得前書 5:7）\n\n🙏 平安祝禱：求天父賜下超然的屬天平安在您心中，挪去一切懼怕，在祂愛中得享安息！`
        : `Peace be with you! "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." (Philippians 4:6)\n\nMay God's heavenly peace guard your heart!`;
    }

    // Illness & healing
    if (q.includes("病") || q.includes("醫治") || q.includes("手術") || q.includes("健康") || q.includes("康復") || q.includes("跌倒") || q.includes("health") || q.includes("healing") || q.includes("surgery")) {
      return langZh
        ? `主內平安！耶和華拉法（耶和華是醫治者）親自看顧您與家人的健康：\n\n📖 醫治經文：\n「他赦免你的一切罪孽，醫治你的一切疾病。」（詩篇 103:3）\n「耶和華啊，求你醫治我，我便得醫治；拯救我，我便得救；因你是我所讚美的。」（耶利米書 17:14）\n\n🙏 醫治代禱：求主親自引導醫療團隊的每一步，減輕一切病痛不適，保守手術與休養過程滿有恩典，賜下神蹟般的康復與活力！`
        : `Peace be with you! "He heals all your diseases." (Psalm 103:3)\n\nWe pray for swift healing, strength, and comfort over you and your loved ones in Jesus' name!`;
    }

    // Default spiritual guidance
    return langZh
      ? `平安！願加南新生基督教會神的恩惠與慈愛常與您同在。\n\n📖 今日靈修金句：\n「耶和華是我的牧者，我必不致缺乏。他使我躺臥在青草地上，領我在可安歇的水邊。」（詩篇 23:1-2）\n「你要專心仰賴耶和華，不可倚靠自己的聰明，在你一切所行的事上都要認定他，他必指引你的路。」（箴言 3:5-6）\n\n您可以隨時提出聖經問題、靈修代禱需求或詢問教會事工日程！`
      : `Peace be with you! "The LORD is my shepherd; I shall not want." (Psalm 23:1)\nMay God fill your heart with wisdom, grace, and hope!`;
  };

  // AI Chat proxy endpoints (Optimized for ultra-fast minimal thinking latency)
  const handleChatRequest = async (req: express.Request, res: express.Response) => {
    try {
      const { contents, prompt, systemInstruction, language } = req.body;
      const userText = prompt || (contents && contents[contents.length - 1]?.parts?.[0]?.text) || "";
      const isZh = language !== 'en';
      const ai = getAI();

      if (!ai) {
        const fallbackText = generateFastPastoralReply(userText, isZh);
        return res.json({ text: fallbackText, reply: fallbackText, success: true });
      }

      const payloadContents = contents || [
        { role: 'user', parts: [{ text: userText || '請給我一句今日靈修勉勵經文' }] }
      ];

      // Use gemini-2.5-flash for instant, high-speed biblical responses without thinking latency
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: payloadContents,
        config: {
          systemInstruction: systemInstruction || (isZh
            ? "你是一位熱情、充滿關懷與豐富聖經知識的加南新生基督教會『聖經與靈修 AI 導師』。請用繁體中文以溫暖、鼓勵人心的語氣，以聖經真理為根基迅速回答弟兄姊妹的信仰問題與靈修疑惑。"
            : "You are an encouraging and wise Pastoral & Bible AI Companion for Canaan Shin Sheng Christian Church. Respond warmly and rapidly grounded in Biblical truth."),
        },
      });

      const text = response.text || generateFastPastoralReply(userText, isZh);
      return res.json({ text, reply: text, success: true });
    } catch (error: any) {
      console.warn("Chat API notice, utilizing high-speed pastoral fallback:", error?.message || error);
      const userText = req.body?.prompt || "";
      const fallbackText = generateFastPastoralReply(userText, req.body?.language !== 'en');
      return res.json({
        text: fallbackText,
        reply: fallbackText,
        success: true
      });
    }
  };

  // Real-time SSE Stream Endpoint for Pastoral AI (zero wait time)
  const handleChatStreamRequest = async (req: express.Request, res: express.Response) => {
    const { contents, prompt, systemInstruction, language } = req.body;
    const userText = prompt || (contents && contents[contents.length - 1]?.parts?.[0]?.text) || "";
    const isZh = language !== 'en';

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const ai = getAI();
      if (!ai) {
        // Instant simulated streaming from high-speed pastoral engine
        const reply = generateFastPastoralReply(userText, isZh);
        const words = reply.split(/(?<=\n|。|！|？|，|\s+)/);
        for (const w of words) {
          if (w) {
            sendEvent({ text: w });
            await new Promise(r => setTimeout(r, 12));
          }
        }
        sendEvent({ done: true });
        return res.end();
      }

      const payloadContents = contents || [
        { role: 'user', parts: [{ text: userText || '請給我一句今日靈修勉勵經文' }] }
      ];

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: payloadContents,
        config: {
          systemInstruction: systemInstruction || (isZh
            ? "你是一位熱情、充滿關懷與豐富聖經知識的加南新生基督教會『聖經與靈修 AI 導師』。請用繁體中文以溫暖、鼓勵人心的語氣，以聖經真理為根基迅速回答弟兄姊妹的信仰問題與靈修疑惑。"
            : "You are an encouraging and wise Pastoral & Bible AI Companion for Canaan Shin Sheng Christian Church. Respond warmly and rapidly grounded in Biblical truth."),
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          sendEvent({ text: chunk.text });
        }
      }
      sendEvent({ done: true });
      return res.end();
    } catch (err: any) {
      console.warn("Streaming error, falling back to instant pastoral engine:", err?.message || err);
      const reply = generateFastPastoralReply(userText, isZh);
      sendEvent({ text: reply });
      sendEvent({ done: true });
      return res.end();
    }
  };

  app.post("/api/chat", handleChatRequest);
  app.post("/api/chat/stream", handleChatStreamRequest);
  app.post("/api/pastoral-ai", handleChatRequest);
  app.post("/api/pastoral-ai/stream", handleChatStreamRequest);

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
      title: "Walking a Path We Have Never Walked Before",
      titleZh: "走一條我們從未走過的路",
      speaker: "Rev. Zhixia Wan",
      speakerZh: "萬志俠 牧師",
      date: "2026-08-30",
      scripture: "Joshua 3:1-17",
      scriptureZh: "約書亞記第三章（約書亞記 3:1-17）",
      series: "Sunday Message",
      seriesZh: "主日證道",
      summary: "Rev. Zhixia Wan preached on Joshua 3:1-17 titled 'Walking a Path We Have Never Walked Before.' When facing uncharted journeys and new church seasons, we must follow closely in God's footsteps, be united as one body, and step forward in faith to witness God's wondrous works.",
      summaryZh: "加南新生基督教會主日崇拜，萬志俠牧師透過約書亞記第三章傳講《走一條我們從未走過的路》，勉勵弟兄姊妹在面對未知的道路與教會新階段時，緊隨神的約櫃與腳步，全體同心合一，憑著信心踏入約旦河，親眼見證耶和華神在我們中間行的奇事與帶領。",
      points: [
        "1. Stepping onto a new journey, we must follow closely in God's footsteps.",
        "2. All must be united; God will perfect and fulfill our entire church.",
        "3. A journey born of faith will surely witness God's mighty works firsthand."
      ],
      pointsZh: [
        "1. 踏上新的旅程，我們必須緊隨神的腳步。",
        "2. 眾人要合一，神要讓我們整個教會被成全。",
        "3. 出于信心的旅程，必能親眼見證神的作為。"
      ],
      videoPasscode: "25226",
      showVideo: true,
      showAudio: true
    },
    {
      id: "sermon-2",
      title: "A Gentle Whisper in the Wilderness: From Weariness to Renewal",
      titleZh: "曠野裡的微聲——從疲憊到更新",
      speaker: "Evangelist Tanni",
      speakerZh: "談妮 傳道",
      date: "2026-08-23",
      scripture: "1 Kings 19:1-18",
      scriptureZh: "列王記上第 19 章第 1-18 節",
      series: "Sunday Message",
      seriesZh: "主日證道",
      summary: "Evangelist Tanni shared the journey of Prophet Elijah in exhaustion and despair. Even in our deepest weakness and wilderness, God is present to provide, comfort, and guide us to listen to His gentle whisper and regain strength and heavenly hope.",
      summaryZh: "加南新生基督教會主日崇拜，談妮傳道透過列王記上第 19 章第 1-18 節傳講《曠野裡的微聲——從疲憊到更新》，分享先知以利亞在低潮與疲憊中的經歷。勉勵弟兄姊妹：即使身處軟弱與困境中，神仍然與我們同在，親自供應、安慰並帶領我們，在安靜中聆聽神的微聲，重新得著力量與盼望。",
      points: [
        "1. Weariness in the Wilderness — 1 Kings 19:1-4",
        "2. God's Gentle Provision and Touch — 1 Kings 19:5-8",
        "3. Listening to the Gentle Whisper on Mount Horeb — 1 Kings 19:9-14",
        "4. Commissioned Anew with Seven Thousand Faithful — 1 Kings 19:15-18"
      ],
      pointsZh: [
        "一、曠野低谷中的疲憊與求死 （列王記上 19:1-4）",
        "二、神親自的供應、撫摸與撫慰 （列王記上 19:5-8）",
        "三、何烈山洞前微小的聲音 （列王記上 19:9-14）",
        "四、重領使命與七千忠心未屈膝的同路人 （列王記上 19:15-18）"
      ],
      videoPasscode: "25226",
      showVideo: true,
      showAudio: true
    },
    {
      id: "sermon-3",
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
      videoPasscode: "25226",
      showVideo: true,
      showAudio: true
    }
  ];
  let inMemorySermons: any[] = [...INITIAL_DEFAULT_SERMONS];

  // Weekly Sunday Bulletin Multi-Format Processing Endpoint (PDF, Word DOC/DOCX, TXT, Fast AI-Powered)
  const handleBulletinFileProcessing = async (req: express.Request, res: express.Response) => {
    try {
      const { pdfBase64, fileBase64, fileText, emailSubject, filename, fileType } = req.body;
      const rawBase64 = fileBase64 || pdfBase64;

      if (!rawBase64 && !fileText) {
        return res.status(400).json({ error: "No bulletin file data or text provided" });
      }

      const defaultBulletin = {
        serviceDate: "2026-08-30",
        presider: "鄭育青 弟兄",
        speaker: "萬志俠 牧師",
        speakerEn: "Rev. Zhixia Wan",
        sermonTitle: "走一條我們從未走過的路",
        sermonTitleEn: "Walking a Path We Have Never Walked Before",
        sermonScripture: "約書亞記第三章（約書亞記 3:1-17）",
        sermonScriptureEn: "Joshua 3:1-17",
        memoryVerse: "約書亞吩咐百姓說：「你們要自潔，因為明天耶和華必在你們中間行奇事。」（約書亞記 3:5）",
        memoryVerseRef: "約書亞記 3:5",
        weeklyReadingRange: "8/31 - 9/6",
        weeklyReadingSchedule: [
          { date: "8/31 (週一)", oldTestament: "詩篇 132-134", newTestament: "哥林多前書 11:17-34" },
          { date: "9/01 (週二)", oldTestament: "詩篇 135-136", newTestament: "哥林多前書 12" },
          { date: "9/02 (週三)", oldTestament: "詩篇 137-139", newTestament: "哥林多前書 13" },
          { date: "9/03 (週四)", oldTestament: "詩篇 140-141", newTestament: "哥林多前書 14:1-20" },
          { date: "9/04 (週五)", oldTestament: "詩篇 142-143", newTestament: "哥林多前書 14:21-40" },
          { date: "9/05 (週六)", oldTestament: "詩篇 144-145", newTestament: "哥林多前書 15:1-34" },
          { date: "9/06 (週日)", oldTestament: "詩篇 146-147", newTestament: "哥林多前書 15:35-58" }
        ],
        sermonPointsZh: [
          "1. 踏上新的旅程，我們必須緊隨神的腳步。",
          "2. 眾人要合一，神要讓我們整個教會被成全。",
          "3. 出于信心的旅程，必能親眼見證神的作為。"
        ],
        sermonPoints: [
          "1. Stepping onto a new journey, we must follow closely in God's footsteps.",
          "2. All must be united; God will perfect and fulfill our entire church.",
          "3. A journey born of faith will surely witness God's mighty works firsthand."
        ],
        sermonSummary: "加南新生基督教會主日崇拜，萬志俠牧師透過約書亞記第三章傳講《走一條我們從未走過的路》，勉勵弟兄姊妹在面對未知的道路與教會新階段時，緊隨神的約櫃與腳步，全體同心合一，憑著信心踏入約旦河，親眼見證耶和華神在我們中間行的奇事與帶領。",
        sermonSummaryEn: "Rev. Zhixia Wan preached on Joshua 3:1-17 titled 'Walking a Path We Have Never Walked Before.' When facing uncharted journeys and new church seasons, we must follow closely in God's footsteps, be united as one body, and step forward in faith to witness God's wondrous works.",
        prayerRequests: [
          "為萬志俠牧師今天在我們當中的證道服事感恩，求主親自賜福萬牧師的家庭與事奉，使神的話語在弟兄姊妹心中扎根結果。",
          "因 C3 教會總部規劃，我們教會與 C3 的租約將於 9/6 結束。求主親自帶領後續各項聚會場地安排，為加南新生基督教會開道路，賜下合適的敬拜處所。",
          "求主帶領發展年輕世代事工，預備合適的同工與方向，吸引更多年輕人來教會，在真理中成長、彼此扶持。",
          "為術後休養中的談妮傳道及其家人代禱，求主保守身心早日康復；也為身體欠安與跌倒的會友禱告，求主賜下醫治與平安。"
        ],
        announcements: [
          "歡迎第一次來參加崇拜的新朋友，願神大大賜福您和您的家庭！",
          "感謝萬志俠牧師今天前來證道分享《走一條我們從未走過的路》（約書亞記第三章），提醒我們緊隨神腳步、同心合一、憑信心見證神的奇妙作為。",
          "每週四晚上 8:00 線上守望禱告會 (Zoom ID: 310-626-6103，密碼: 25226)，歡迎弟兄姊妹同心代求。"
        ],
        zoomPasscode: "25226"
      };

      // Extract raw Base64 data if available
      let cleanBase64 = "";
      let buffer: Buffer | null = null;
      if (rawBase64) {
        cleanBase64 = rawBase64.includes(",") ? rawBase64.split(",")[1] : rawBase64;
        buffer = Buffer.from(cleanBase64, "base64");
      }

      let extractedInfo: { text?: string; isPdf: boolean } = { isPdf: false };
      if (fileText) {
        extractedInfo = { text: fileText, isPdf: false };
      } else if (buffer) {
        extractedInfo = await extractTextFromBulletinFile(buffer, filename || "bulletin.pdf", fileType);
      }

      // First run high-accuracy rule-based extraction from extracted text
      const parsedTextData = parseBulletinFromText(extractedInfo.text || fileText || "", defaultBulletin);

      const ai = getAI();
      if (!ai) {
        const directSermon = {
          id: `sermon-${Date.now()}`,
          title: parsedTextData.sermonTitleEn || parsedTextData.sermonTitle || defaultBulletin.sermonTitleEn,
          titleZh: parsedTextData.sermonTitle || defaultBulletin.sermonTitle,
          speaker: parsedTextData.speakerEn || parsedTextData.speaker || defaultBulletin.speakerEn,
          speakerZh: parsedTextData.speaker || defaultBulletin.speaker,
          date: parsedTextData.serviceDate || defaultBulletin.serviceDate,
          scripture: parsedTextData.sermonScriptureEn || parsedTextData.sermonScripture || defaultBulletin.sermonScriptureEn,
          scriptureZh: parsedTextData.sermonScripture || defaultBulletin.sermonScripture,
          series: "Sunday Message",
          seriesZh: "主日證道",
          summary: parsedTextData.sermonSummaryEn || defaultBulletin.sermonSummaryEn,
          summaryZh: parsedTextData.sermonSummary || defaultBulletin.sermonSummary,
          points: parsedTextData.sermonPoints || defaultBulletin.sermonPoints,
          pointsZh: parsedTextData.sermonPointsZh || defaultBulletin.sermonPointsZh,
          videoUrl: parsedTextData.videoUrl || "",
          videoPasscode: parsedTextData.zoomPasscode || defaultBulletin.zoomPasscode
        };
        inMemorySermons = [directSermon, ...inMemorySermons.filter(s => s.id !== directSermon.id)];
        return res.json({
          success: true,
          data: parsedTextData,
          newSermon: directSermon,
          extractedRawText: extractedInfo.text || fileText || "",
          isFallback: true
        });
      }

      try {
        const systemInstruction = `
You are the expert Church Bulletin Parser for Canaan Shin Sheng Christian Church (加南新生基督教會) in Harbor City, CA (25226 S. Western Ave, Harbor City, CA 90710).
Extract ALL church bulletin data accurately from the provided Sunday bulletin document (PDF / Word / Text).

CRITICAL PARSING RULES:
1. Multi-Column Structure: Church bulletins often use multiple columns (Order of Service / 崇拜程序表, Sermon Outline / 講道大綱, Reading Schedule / 讀經進度, Announcements / 家事報告, Prayer Requests / 代禱事項). Read all sections carefully.
2. Presider vs Preacher:
   - "presider" (司會 / 主領): The person leading the liturgy (e.g. 鄭育青 弟兄, 萬四 長老, 張文辛 長老, 馬新民 執事).
   - "speaker" (講員 / 證道): The preacher for the Sunday sermon (e.g. 萬志俠 牧師, 孟蘇倫 牧師, 郭易君 牧師, 談妮 傳道, ITO 傳道, 李紹信 弟兄, 陳嘉彰 牧師). Always retain the title (牧師/傳道/弟兄/長老).
3. Sermon Title & Scripture: Extract the exact Chinese sermon title and scripture passage (e.g. 列王記上 19:1-18, 使徒行傳 27:20-25, 傳道書 1:2-3). Also provide clean English translations.
4. Sermon Outline Points: Extract the outline points (e.g. 一、..., 二、... or 1. ..., 2. ...).
5. Memory Verse: Extract the exact memory verse (本週背誦經文 / 金句) and the scripture reference.
6. Bible Reading Schedule: Extract 7 days (Monday to Sunday) with Date (e.g. '8/24 (週一)'), Old Testament book and chapter range, and New Testament book and chapter range.
7. Prayer Requests (代禱事項): Extract each prayer request bullet item.
8. Announcements (家事報告 / 報告事項): Extract each announcement item.
9. Zoom: Passcode (usually 25226) and any recording URL.

Strictly adhere to the JSON schema. Do not hallucinate or output generic placeholder data.
`;

        const contentsParts: any[] = [];
        if (extractedInfo.isPdf && cleanBase64) {
          contentsParts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: "application/pdf"
            }
          });
        }
        if (extractedInfo.text || fileText) {
          contentsParts.push({
            text: `[DOCUMENT OCR / EXTRACTED TEXT LAYER]:\n${(extractedInfo.text || fileText || "").slice(0, 15000)}`
          });
        }
        contentsParts.push({
          text: `Please parse this Sunday bulletin for Canaan Shin Sheng Christian Church and return the structured JSON data according to the schema.`
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [
            {
              role: "user",
              parts: contentsParts
            }
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                serviceDate: { type: Type.STRING, description: "Sunday service date YYYY-MM-DD" },
                presider: { type: Type.STRING, description: "Presider 司會 name and title" },
                speaker: { type: Type.STRING, description: "Preacher 講員 in Chinese" },
                speakerEn: { type: Type.STRING, description: "Preacher in English" },
                sermonTitle: { type: Type.STRING, description: "Sermon title in Chinese" },
                sermonTitleEn: { type: Type.STRING, description: "Sermon title in English" },
                sermonScripture: { type: Type.STRING, description: "Sermon scripture in Chinese" },
                sermonScriptureEn: { type: Type.STRING, description: "Sermon scripture in English" },
                sermonSummary: { type: Type.STRING, description: "2-3 sentence summary in Traditional Chinese" },
                sermonSummaryEn: { type: Type.STRING, description: "2-3 sentence summary in English" },
                sermonPointsZh: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Sermon outline points in Chinese"
                },
                sermonPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Sermon outline points in English"
                },
                memoryVerse: { type: Type.STRING, description: "Memory verse text" },
                memoryVerseRef: { type: Type.STRING, description: "Memory verse scripture reference" },
                weeklyReadingRange: { type: Type.STRING, description: "Weekly Bible reading date range" },
                weeklyReadingSchedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING, description: "Date and weekday e.g. 8/24 (週一)" },
                      oldTestament: { type: Type.STRING, description: "Old Testament reading" },
                      newTestament: { type: Type.STRING, description: "New Testament reading" }
                    },
                    required: ["date", "oldTestament", "newTestament"]
                  },
                  description: "7-day reading schedule"
                },
                prayerRequests: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of prayer items"
                },
                announcements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of church announcements"
                },
                zoomPasscode: { type: Type.STRING, description: "Zoom passcode" },
                videoUrl: { type: Type.STRING, description: "Video or recording URL if present" }
              },
              required: ["serviceDate", "speaker", "sermonTitle", "sermonScripture"]
            }
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        const mergedData = {
          serviceDate: parsed.serviceDate || parsedTextData.serviceDate || defaultBulletin.serviceDate,
          presider: parsed.presider || parsedTextData.presider || defaultBulletin.presider,
          speaker: parsed.speaker || parsedTextData.speaker || defaultBulletin.speaker,
          speakerEn: parsed.speakerEn || parsedTextData.speakerEn || defaultBulletin.speakerEn,
          sermonTitle: parsed.sermonTitle || parsedTextData.sermonTitle || defaultBulletin.sermonTitle,
          sermonTitleEn: parsed.sermonTitleEn || parsedTextData.sermonTitleEn || defaultBulletin.sermonTitleEn,
          sermonScripture: parsed.sermonScripture || parsedTextData.sermonScripture || defaultBulletin.sermonScripture,
          sermonScriptureEn: parsed.sermonScriptureEn || parsedTextData.sermonScriptureEn || defaultBulletin.sermonScriptureEn,
          sermonSummary: parsed.sermonSummary || parsedTextData.sermonSummary || defaultBulletin.sermonSummary,
          sermonSummaryEn: parsed.sermonSummaryEn || parsedTextData.sermonSummaryEn || defaultBulletin.sermonSummaryEn,
          sermonPointsZh: Array.isArray(parsed.sermonPointsZh) && parsed.sermonPointsZh.length > 0 ? parsed.sermonPointsZh : (parsedTextData.sermonPointsZh || defaultBulletin.sermonPointsZh),
          sermonPoints: Array.isArray(parsed.sermonPoints) && parsed.sermonPoints.length > 0 ? parsed.sermonPoints : (parsedTextData.sermonPoints || defaultBulletin.sermonPoints),
          memoryVerse: parsed.memoryVerse || parsedTextData.memoryVerse || defaultBulletin.memoryVerse,
          memoryVerseRef: parsed.memoryVerseRef || parsedTextData.memoryVerseRef || defaultBulletin.memoryVerseRef,
          weeklyReadingRange: parsed.weeklyReadingRange || parsedTextData.weeklyReadingRange || defaultBulletin.weeklyReadingRange,
          weeklyReadingSchedule: Array.isArray(parsed.weeklyReadingSchedule) && parsed.weeklyReadingSchedule.length > 0 ? parsed.weeklyReadingSchedule : (parsedTextData.weeklyReadingSchedule || defaultBulletin.weeklyReadingSchedule),
          prayerRequests: Array.isArray(parsed.prayerRequests) && parsed.prayerRequests.length > 0 ? parsed.prayerRequests : (parsedTextData.prayerRequests || defaultBulletin.prayerRequests),
          announcements: Array.isArray(parsed.announcements) && parsed.announcements.length > 0 ? parsed.announcements : (parsedTextData.announcements || defaultBulletin.announcements),
          zoomPasscode: parsed.zoomPasscode || parsedTextData.zoomPasscode || defaultBulletin.zoomPasscode,
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
          newSermon: newSermon,
          extractedRawText: extractedInfo.text || fileText || ""
        });
      } catch (aiErr: any) {
        console.warn("AI document extraction fallback notice:", aiErr?.message || "Using parsed document data");
        const fallbackSermon = {
          id: `sermon-${Date.now()}`,
          title: parsedTextData.sermonTitleEn || parsedTextData.sermonTitle || defaultBulletin.sermonTitleEn,
          titleZh: parsedTextData.sermonTitle || defaultBulletin.sermonTitle,
          speaker: parsedTextData.speakerEn || parsedTextData.speaker || defaultBulletin.speakerEn,
          speakerZh: parsedTextData.speaker || defaultBulletin.speaker,
          date: parsedTextData.serviceDate || defaultBulletin.serviceDate,
          scripture: parsedTextData.sermonScriptureEn || parsedTextData.sermonScripture || defaultBulletin.sermonScriptureEn,
          scriptureZh: parsedTextData.sermonScripture || defaultBulletin.sermonScripture,
          series: "Sunday Message",
          seriesZh: "主日證道",
          summary: parsedTextData.sermonSummaryEn || defaultBulletin.sermonSummaryEn,
          summaryZh: parsedTextData.sermonSummary || defaultBulletin.sermonSummary,
          points: parsedTextData.sermonPoints || defaultBulletin.sermonPoints,
          pointsZh: parsedTextData.sermonPointsZh || defaultBulletin.sermonPointsZh,
          videoUrl: "",
          videoPasscode: parsedTextData.zoomPasscode || defaultBulletin.zoomPasscode
        };
        inMemorySermons = [fallbackSermon, ...inMemorySermons.filter(s => s.id !== fallbackSermon.id)];
        return res.json({
          success: true,
          data: parsedTextData,
          newSermon: fallbackSermon,
          extractedRawText: extractedInfo.text || fileText || "",
          isFallback: true
        });
      }
    } catch (err: any) {
      console.error("Bulletin file processing error:", err);
      return res.status(500).json({ error: err.message || "Failed to process bulletin file" });
    }
  };

  app.post("/api/process-bulletin-pdf", handleBulletinFileProcessing);
  app.post("/api/process-bulletin-file", handleBulletinFileProcessing);
  app.post("/api/process-bulletin-text", handleBulletinFileProcessing);

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

  // Helper to persist sermons to src/data/sermonsData.ts and public/canaan_master_data.json
  const persistSermonsToFile = (sermons: any[]) => {
    try {
      const versionStr = `version-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
      const tsContent = `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Authoritative Constant: SERMON_CONTENT_LIST (Strictly top 3 latest sermons)
// Total Sermons: ${sermons.length}
// ============================================================================

export const SERMONS_DATA_VERSION = "${versionStr}";

export const SERMON_CONTENT_LIST: Sermon[] = ${JSON.stringify(sermons, null, 2)};

// Backwards compatibility aliases
export const INITIAL_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
export const RECENT_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
`;
      const sermonsPath = path.join(process.cwd(), "src", "data", "sermonsData.ts");
      fs.writeFileSync(sermonsPath, tsContent, "utf-8");

      // Update canaan_master_data.json
      const masterJsonPath = path.join(process.cwd(), "public", "canaan_master_data.json");
      if (fs.existsSync(masterJsonPath)) {
        try {
          const raw = fs.readFileSync(masterJsonPath, "utf-8");
          const masterData = JSON.parse(raw);
          if (masterData && masterData.data) {
            masterData.data.sermons = sermons;
            masterData.stats = masterData.stats || {};
            masterData.stats.totalSermons = sermons.length;
            masterData.exportedAt = new Date().toISOString();
            fs.writeFileSync(masterJsonPath, JSON.stringify(masterData, null, 2), "utf-8");
          }
        } catch (jsonErr) {
          console.warn("Could not sync canaan_master_data.json:", jsonErr);
        }
      }
    } catch (fsErr) {
      console.warn("Notice: persistSermonsToFile disk write warning:", fsErr);
    }
  };

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
        persistSermonsToFile(sermons);
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
      persistSermonsToFile(inMemorySermons);
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
      const prayersList = Array.isArray(data?.prayers) ? data.prayers : [];

      // Update in-memory sermons
      if (Array.isArray(data?.sermons)) {
        inMemorySermons = data.sermons;
        persistSermonsToFile(data.sermons);
      }

      // Generate file contents
      const versionStr = `version-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
      const sermonsTs = `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Authoritative Constant: SERMON_CONTENT_LIST (Strictly top 3 latest sermons)
// Total Sermons: ${sermonsList.length}
// ============================================================================

export const SERMONS_DATA_VERSION = "${versionStr}";

export const SERMON_CONTENT_LIST: Sermon[] = ${JSON.stringify(sermonsList, null, 2)};

// Backwards compatibility aliases
export const INITIAL_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
export const RECENT_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
`;

      const sermonStorageTs = `import { Sermon } from '../types';
import * as SermonsData from '../data/sermonsData';

export const INITIAL_SERMONS: Sermon[] = 
  (SermonsData as any).SERMON_CONTENT_LIST || 
  (SermonsData as any).INITIAL_SERMONS || 
  (SermonsData as any).RECENT_SERMONS || 
  [];

export const SERMON_CONTENT_LIST: Sermon[] = INITIAL_SERMONS;

export const SERMONS_DATA_VERSION: string = 
  (SermonsData as any).SERMONS_DATA_VERSION || 
  \`v-\${INITIAL_SERMONS.length}-\${INITIAL_SERMONS[0]?.date || 'master'}\`;

/**
 * Generate a deterministic fingerprint of the compiled master sermons.
 * Any change in titles, dates, speakers, scriptures, passcodes, video/audio visibility or count in code triggers an immediate refresh.
 */
export function getMasterDataFingerprint(): string {
  try {
    return \`\${SERMONS_DATA_VERSION}::\` + INITIAL_SERMONS.map(s => 
      \`\${s.id}:\${s.date}:\${s.titleZh}:\${s.speakerZh}:\${s.videoUrl || ''}:\${s.videoPasscode || ''}:\${s.showVideo !== false}:\${s.showAudio !== false}\`
    ).join('|');
  } catch {
    return \`\${SERMONS_DATA_VERSION}::\${INITIAL_SERMONS.length}\`;
  }
}

/**
 * Authoritative sermon loader.
 * Always initializes directly from compiled INITIAL_SERMONS to guarantee 100% synchronization
 * across all deployment environments (Cloudflare Pages, GitHub, preview) without stale cache.
 */
export function loadAndSyncSermons(): Sermon[] {
  try {
    const list = [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    try {
      localStorage.setItem('canaan_sermons_data', JSON.stringify(list));
      localStorage.setItem('canaan_sermons_master_fingerprint', getMasterDataFingerprint());
      localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
    } catch {
      // ignore storage errors
    }
    return list;
  } catch {
    return INITIAL_SERMONS;
  }
}

/**
 * Force reset cache to the latest deployed INITIAL_SERMONS version.
 */
export function resetSermonsToDeployedMaster(): Sermon[] {
  return loadAndSyncSermons();
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

      const prayersTs = `import { PrayerRequest } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - PRAYER WALL MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Active Prayers: ${prayersList.length}
// ============================================================================

export const PRAYERS_DATA_VERSION = "${versionStr}";

export const INITIAL_PRAYERS: PrayerRequest[] = ${JSON.stringify(prayersList, null, 2)};
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
          totalPrayers: prayersList.length,
        },
        data: {
          sermons: sermonsList,
          photos: photosList,
          categories: categoriesList,
          albums: albumsList,
          bulletin: bulletinData,
          prayers: prayersList
        }
      }, null, 2);

      const files = [
        { path: "src/data/sermonsData.ts", content: sermonsTs },
        { path: "src/utils/sermonStorage.ts", content: sermonStorageTs },
        { path: "src/data/galleryData.ts", content: galleryTs },
        { path: "src/data/bulletinData.ts", content: bulletinTs },
        ...(prayersList.length > 0 ? [{ path: "src/data/prayersData.ts", content: prayersTs }] : []),
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

        if (!putRes.ok) {
          const errJson: any = await putRes.json().catch(() => ({}));
          const errMsg = errJson.message || `GitHub error updating ${f.path} (HTTP ${putRes.status})`;
          if (errMsg.includes("Resource not accessible") || putRes.status === 403) {
            return res.status(403).json({
              error: `GitHub 權限不足 (Resource not accessible by personal access token)。\n💡 請確認您的 GitHub Personal Access Token (PAT) 是否具有對倉庫「${owner}/${repo}」的寫入權限：\n1. 若為 Classic Token (ghp_...)：需勾選「repo」完整權限。\n2. 若為 Fine-grained Token (github_pat_...)：需在 Repository Access 選取此倉庫，並在 Permissions -> Contents 設定為「Read and write」。`
            });
          }
          return res.status(putRes.status).json({
            error: errMsg
          });
        }

        const resData: any = await putRes.json();
        if (resData.commit?.sha) {
          lastSha = resData.commit.sha.slice(0, 7);
          lastCommitUrl = resData.commit.html_url || lastCommitUrl;
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
        persistSermonsToFile(sermons);
      }

      const versionStr = `version-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
      const tsContent = `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Authoritative Constant: SERMON_CONTENT_LIST (Strictly top 3 latest sermons)
// Total Sermons: ${sermonList.length}
// ============================================================================

export const SERMONS_DATA_VERSION = "${versionStr}";

export const SERMON_CONTENT_LIST: Sermon[] = ${JSON.stringify(sermonList, null, 2)};

// Backwards compatibility aliases
export const INITIAL_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
export const RECENT_SERMONS: Sermon[] = SERMON_CONTENT_LIST;
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

  // ============================================================================
  // SMTP EMAIL SERVICE (Configurable via Admin Login, tested & sent via nodemailer)
  // ============================================================================
  const SMTP_CONFIG_FILE = path.join(process.cwd(), "data", "smtp_config.json");

  interface StoredSMTPConfig {
    host: string;
    port: number;
    secure: boolean;
    requireTLS: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
    defaultRecipient: string;
    isActive: boolean;
    updatedAt?: string;
  }

  function loadSMTPConfig(): StoredSMTPConfig {
    try {
      if (fs.existsSync(SMTP_CONFIG_FILE)) {
        const raw = fs.readFileSync(SMTP_CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return {
            host: (parsed.host || process.env.SMTP_HOST || "").trim(),
            port: Number(parsed.port) || Number(process.env.SMTP_PORT) || 587,
            secure: parsed.secure !== undefined ? Boolean(parsed.secure) : (process.env.SMTP_SECURE === "true"),
            requireTLS: parsed.requireTLS !== undefined ? Boolean(parsed.requireTLS) : true,
            user: (parsed.user || process.env.SMTP_USER || "").trim(),
            pass: parsed.pass || process.env.SMTP_PASS || "",
            fromName: (parsed.fromName || process.env.SMTP_FROM_NAME || "加南新生基督教會").trim(),
            fromEmail: (parsed.fromEmail || process.env.SMTP_FROM_EMAIL || parsed.user || process.env.SMTP_USER || "web@canaannewlife.org").trim(),
            defaultRecipient: (parsed.defaultRecipient || process.env.SMTP_DEFAULT_TO || "web@canaannewlife.org").trim(),
            isActive: parsed.isActive !== undefined ? Boolean(parsed.isActive) : true,
            updatedAt: parsed.updatedAt
          };
        }
      }
    } catch (e) {
      console.warn("Notice: reading smtp_config.json:", e);
    }

    return {
      host: (process.env.SMTP_HOST || "").trim(),
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      requireTLS: true,
      user: (process.env.SMTP_USER || "").trim(),
      pass: process.env.SMTP_PASS || "",
      fromName: (process.env.SMTP_FROM_NAME || "加南新生基督教會").trim(),
      fromEmail: (process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "web@canaannewlife.org").trim(),
      defaultRecipient: (process.env.SMTP_DEFAULT_TO || "web@canaannewlife.org").trim(),
      isActive: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)
    };
  }

  function saveSMTPConfig(config: Partial<StoredSMTPConfig>): StoredSMTPConfig {
    const existing = loadSMTPConfig();
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const providedPass = config.pass ? String(config.pass).trim() : "";
    const isMaskedOrEmpty = !providedPass || providedPass === "••••••••" || providedPass.includes("•••");
    const newPass = isMaskedOrEmpty ? existing.pass : providedPass;

    const merged: StoredSMTPConfig = {
      host: (config.host !== undefined ? config.host : existing.host).trim(),
      port: config.port ? Number(config.port) : existing.port,
      secure: config.secure !== undefined ? Boolean(config.secure) : (Number(config.port) === 465),
      requireTLS: config.requireTLS !== undefined ? Boolean(config.requireTLS) : existing.requireTLS,
      user: (config.user !== undefined ? config.user : existing.user).trim(),
      pass: newPass,
      fromName: (config.fromName !== undefined ? config.fromName : existing.fromName).trim() || "加南新生基督教會",
      fromEmail: (config.fromEmail !== undefined ? config.fromEmail : existing.fromEmail).trim() || "web@canaannewlife.org",
      defaultRecipient: (config.defaultRecipient !== undefined ? config.defaultRecipient : existing.defaultRecipient).trim() || "web@canaannewlife.org",
      isActive: config.isActive !== undefined ? Boolean(config.isActive) : true,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
    return merged;
  }

  function createTransporterFromConfig(config: StoredSMTPConfig) {
    if (!config.host || !config.user) {
      throw new Error("SMTP 伺服器主機 (Server) 或使用者帳號 (Username) 尚未設定。");
    }

    const port = Number(config.port) || 587;
    const isSecure = config.secure ?? (port === 465);

    return nodemailer.createTransport({
      host: config.host,
      port: port,
      secure: isSecure,
      requireTLS: config.requireTLS ?? (port === 587),
      auth: {
        user: config.user,
        pass: config.pass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    });
  }

  // Generate Church Branded HTML Email
  function generateChurchHtmlEmail(options: {
    title: string;
    badgeText: string;
    badgeColor?: string;
    details: Array<{ label: string; value: string }>;
    messageBody?: string;
    footerNote?: string;
  }) {
    const detailRows = options.details
      .filter(d => d.value && d.value.trim().length > 0)
      .map(
        d => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; width: 140px; vertical-align: top; font-size: 13px;">
            ${d.label}
          </td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; line-height: 1.5;">
            ${d.value.replace(/\n/g, '<br/>')}
          </td>
        </tr>`
      )
      .join("");

    const messageSection = options.messageBody
      ? `
      <div style="margin-top: 20px; padding: 16px 20px; background-color: #f8fafc; border-left: 4px solid #d97706; border-radius: 8px;">
        <div style="font-size: 12px; font-weight: 700; color: #b45309; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">詳細內容 / 留言信件</div>
        <div style="color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${options.messageBody}</div>
      </div>`
      : "";

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 28px 24px; text-align: center;">
            <div style="display: inline-block; padding: 6px 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 20px; color: #fbbf24; font-size: 12px; font-weight: 600; margin-bottom: 12px;">
              加南新生基督教會 • 官方通知
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.3px;">
              ${options.title}
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 24px;">
            <div style="display: inline-block; padding: 4px 10px; background-color: ${options.badgeColor || '#e0f2fe'}; color: #0369a1; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 16px;">
              ${options.badgeText}
            </div>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
              ${detailRows}
            </table>

            ${messageSection}

            ${options.footerNote ? `<p style="margin-top: 20px; font-size: 12px; color: #64748b; font-style: italic;">${options.footerNote}</p>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">加南新生基督教會 (Canaan Shin Sheng Christian Church)</p>
            <p style="margin: 0 0 4px 0;">1635 W. 228th St., Harbor City, CA 90710 | (310) 626-6103</p>
            <p style="margin: 0; color: #94a3b8;">Email: <a href="mailto:web@canaannewlife.org" style="color: #d97706; text-decoration: none;">web@canaannewlife.org</a></p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  // 1. GET /api/smtp/config - Retrieve current SMTP settings (passwords masked)
  app.get("/api/smtp/config", (req: express.Request, res: express.Response) => {
    try {
      const conf = loadSMTPConfig();
      res.json({
        host: conf.host,
        port: conf.port,
        secure: conf.secure,
        requireTLS: conf.requireTLS,
        user: conf.user,
        hasPassword: Boolean(conf.pass && conf.pass.length > 0),
        maskedPassword: conf.pass ? "••••••••" : "",
        fromName: conf.fromName,
        fromEmail: conf.fromEmail,
        defaultRecipient: conf.defaultRecipient,
        isActive: conf.isActive,
        isConfigured: Boolean(conf.host && conf.user && conf.pass),
        updatedAt: conf.updatedAt
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load SMTP configuration" });
    }
  });

  // 2. POST /api/smtp/config - Save or update SMTP settings
  app.post("/api/smtp/config", (req: express.Request, res: express.Response) => {
    try {
      const { host, port, secure, requireTLS, user, pass, fromName, fromEmail, defaultRecipient, isActive } = req.body;
      const updated = saveSMTPConfig({
        host,
        port: Number(port) || 587,
        secure: Boolean(secure),
        requireTLS: requireTLS !== undefined ? Boolean(requireTLS) : true,
        user,
        pass,
        fromName,
        fromEmail,
        defaultRecipient,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      });

      res.json({
        success: true,
        message: "SMTP 伺服器設定已成功儲存！",
        config: {
          host: updated.host,
          port: updated.port,
          secure: updated.secure,
          requireTLS: updated.requireTLS,
          user: updated.user,
          hasPassword: Boolean(updated.pass && updated.pass.length > 0),
          maskedPassword: updated.pass ? "••••••••" : "",
          fromName: updated.fromName,
          fromEmail: updated.fromEmail,
          defaultRecipient: updated.defaultRecipient,
          isActive: updated.isActive,
          isConfigured: Boolean(updated.host && updated.user && updated.pass),
          updatedAt: updated.updatedAt
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to save SMTP configuration" });
    }
  });

  // 3. POST /api/smtp/test - Test connection and send verification test email
  app.post("/api/smtp/test", async (req: express.Request, res: express.Response) => {
    try {
      const currentStored = loadSMTPConfig();
      const testHost = (req.body.host || currentStored.host || "").trim();
      const testPort = Number(req.body.port) || currentStored.port || 587;
      const testSecure = req.body.secure !== undefined ? Boolean(req.body.secure) : (testPort === 465);
      const testRequireTLS = req.body.requireTLS !== undefined ? Boolean(req.body.requireTLS) : true;
      const testUser = (req.body.user || currentStored.user || "").trim();
      
      let testPass = req.body.pass ? String(req.body.pass).trim() : "";
      if (!testPass || testPass === "••••••••" || testPass.includes("•••")) {
        testPass = currentStored.pass;
      }

      const testFromName = (req.body.fromName || currentStored.fromName || "加南新生基督教會").trim();
      const testFromEmail = (req.body.fromEmail || currentStored.fromEmail || testUser || "web@canaannewlife.org").trim();
      const recipient = (req.body.testRecipient || currentStored.defaultRecipient || testUser || "web@canaannewlife.org").trim();

      if (!testHost || !testUser) {
        return res.status(400).json({
          success: false,
          error: "請先填寫 SMTP 伺服器主機 (Host) 與帳號 (Username)。"
        });
      }

      if (!testPass) {
        return res.status(400).json({
          success: false,
          error: "請填寫 SMTP 密碼或應用程式專用密碼 (App Password)。"
        });
      }

      const transporter = nodemailer.createTransport({
        host: testHost,
        port: testPort,
        secure: testSecure,
        requireTLS: testRequireTLS,
        auth: {
          user: testUser,
          pass: testPass
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000
      });

      // 1. Verify SMTP handshake & credentials
      await transporter.verify();

      // 2. Send test email to recipient
      const timeStr = new Date().toLocaleString("zh-TW", { timeZone: "America/Los_Angeles" });
      const htmlContent = generateChurchHtmlEmail({
        title: "SMTP 郵件伺服器連線測試成功",
        badgeText: "連線測試通過 (Verified)",
        badgeColor: "#dcfce7",
        details: [
          { label: "測試時間", value: timeStr },
          { label: "SMTP 主機 (Host)", value: `${testHost}:${testPort}` },
          { label: "安全傳輸協定", value: testSecure ? "SSL/TLS (Port 465)" : "STARTTLS (Port 587)" },
          { label: "登入使用者 (User)", value: testUser },
          { label: "發送端身份", value: `${testFromName} <${testFromEmail}>` },
          { label: "收件測試目標", value: recipient }
        ],
        messageBody: `恭喜！加南新生基督教會官方網站已成功透過您的 SMTP 帳號 (${testUser}) 完成認證並寄出測試信件。\n未來網站所有在線聯絡留言、主日接送預約、事工登記、與代禱通知均會以此帳號安全自動寄出。`,
        footerNote: "收到此測試信表示您於管理員後台配置的 SMTP 參數完全正確無誤。"
      });

      const info = await transporter.sendMail({
        from: `"${testFromName}" <${testFromEmail}>`,
        to: recipient,
        subject: `[測試成功] 加南新生基督教會 SMTP 自動發信測試 (${timeStr})`,
        text: `加南新生基督教會 SMTP 郵件伺服器連線測試成功！時間: ${timeStr}，主機: ${testHost}:${testPort}，帳號: ${testUser}`,
        html: htmlContent
      });

      return res.json({
        success: true,
        message: `SMTP 連線測試成功！已成功發送測試信至 ${recipient}。`,
        messageId: info.messageId,
        details: {
          host: testHost,
          port: testPort,
          user: testUser,
          recipient
        }
      });
    } catch (err: any) {
      console.error("SMTP Test Error:", err);
      let advice = "";
      const msg = err.message || "";
      const code = err.code || "";

      if (code === "EAUTH" || msg.includes("535") || msg.includes("Username and Password not accepted")) {
        advice = "SMTP 帳號或密碼驗證失敗。若使用 Google/Gmail，請務必開啟 Google 帳戶的「兩步驟驗證」，並進入 Google 帳戶安全性設定生成專用的「應用程式密碼 (App Password)」(16位字母)，不能使用一般個人密碼。";
      } else if (code === "ESOCKET" || code === "ETIMEDOUT" || code === "ECONNREFUSED") {
        advice = `無法連線至郵件伺服器。請檢查伺服器主機名稱與連接埠是否正確 (常用埠：587 搭配 STARTTLS，或 465 搭配 SSL/TLS)。`;
      } else if (msg.includes("self signed") || msg.includes("certificate")) {
        advice = "TLS/SSL 憑證連線警告。系統已設定寬鬆容許，但建議確認郵件伺服器主機名稱是否與憑證一致。";
      }

      return res.status(400).json({
        success: false,
        error: `SMTP 測試失敗: ${msg}`,
        advice: advice || undefined,
        code: code || undefined
      });
    }
  });

  // 4. POST /api/smtp/send & POST /api/send-email - Main Email Sending Route
  const handleEmailSend = async (req: express.Request, res: express.Response) => {
    try {
      const conf = loadSMTPConfig();

      if (!conf.host || !conf.user || !conf.pass) {
        return res.status(400).json({
          success: false,
          error: "尚未在管理員後台設定 SMTP 郵件帳號密碼。請管理員登入後前往「SMTP 設定」完成配置。"
        });
      }

      const body = req.body || {};
      const targetTo = (body.to || conf.defaultRecipient || "web@canaannewlife.org").trim();
      const fromName = (body.fromName || conf.fromName || "加南新生基督教會").trim();
      const fromEmail = (body.fromEmail || conf.fromEmail || conf.user).trim();
      const replyTo = body.replyTo || body.senderEmail || body.email || body.authorEmail || body.applicantEmail;
      
      const timeStr = new Date().toLocaleString("zh-TW", { timeZone: "America/Los_Angeles" });

      let subject = body.subject || "加南新生基督教會 - 網站通知";
      let htmlBody = body.html || "";
      let textBody = body.text || "";

      // Type-specific automatic formatting if html not provided
      const type = body.type || (body.needRide !== undefined ? "contact" : (body.prayerTitle ? "prayer" : (body.ministryName ? "ministry" : "general")));

      if (!htmlBody) {
        if (type === "contact" || body.senderMessage || body.needRide !== undefined) {
          const isRide = Boolean(body.needRide);
          subject = subject || `[加南官網${isRide ? '主日接送預約' : '在線留言'}] ${body.senderName || body.name || '訪客'} - ${body.senderPhone || body.phone || '未留電話'}`;
          htmlBody = generateChurchHtmlEmail({
            title: isRide ? "主日崇拜免費車輛接送預約" : "在線留言與聯絡事宜",
            badgeText: isRide ? "🚗 車輛接送預約" : "✉️ 在線心聲留言",
            badgeColor: isRide ? "#fef3c7" : "#e0f2fe",
            details: [
              { label: "姓名 / 稱謂", value: body.senderName || body.name || "未提供" },
              { label: "聯絡電話", value: body.senderPhone || body.phone || "未提供" },
              { label: "聯絡 Email", value: body.senderEmail || body.email || "未提供" },
              { label: "需要接送", value: isRide ? "是 (需要主日車輛免費接送)" : "否 (一般心聲留言)" },
              { label: "提交時間", value: timeStr }
            ],
            messageBody: body.senderMessage || body.message || "(無留言備註)",
            footerNote: "此通知由加南新生基督教會官網 SMTP 服務自動寄出，請長執同工盡速跟進聯絡。"
          });
          textBody = `${subject}\n\n姓名: ${body.senderName || body.name}\n電話: ${body.senderPhone || body.phone}\nEmail: ${body.senderEmail || body.email}\n接送需求: ${isRide ? '需要' : '不需要'}\n留言:\n${body.senderMessage || body.message}\n時間: ${timeStr}`;
        } else if (type === "prayer" || body.prayerTitle || body.categoryLabelZh) {
          const isConfidential = Boolean(body.isConfidential);
          subject = subject || `[加南代禱登記] ${isConfidential ? '【教牧保密】' : '【公開代禱】'} ${body.prayerTitle || body.title} - ${body.authorName || body.author || '弟兄姊妹'}`;
          htmlBody = generateChurchHtmlEmail({
            title: isConfidential ? "教牧同工會保密代禱事項" : "代禱事項登記 (申請公開刊登)",
            badgeText: isConfidential ? "🔒 教牧保密代禱 (不公開)" : "🙏 公開代禱申請",
            badgeColor: isConfidential ? "#fee2e2" : "#f0fdf4",
            details: [
              { label: "提出者姓名", value: body.authorName || body.author || "無名氏弟兄/姊妹" },
              { label: "聯絡電話", value: body.authorPhone || body.phone || "未提供" },
              { label: "聯絡 Email", value: body.authorEmail || body.email || "未提供" },
              { label: "代禱主題", value: body.prayerTitle || body.title || "未填寫" },
              { label: "分類項目", value: body.categoryLabelZh || body.prayerCategory || "一般代禱" },
              { label: "代禱性質", value: isConfidential ? "【保密代禱】僅限長執教牧守望，不刊登於代禱牆" : "【公開代禱】同工審核確認後刊登至官網代禱牆" },
              { label: "登記時間", value: timeStr }
            ],
            messageBody: body.content || body.message || "(無詳細內容)",
            footerNote: "代禱事項已同時同步記錄於後台審核清單中，管理員可登入後台直接授理。"
          });
          textBody = `${subject}\n\n作者: ${body.authorName || body.author}\n電話: ${body.authorPhone || body.phone}\nEmail: ${body.authorEmail || body.email}\n主題: ${body.prayerTitle || body.title}\n分類: ${body.categoryLabelZh || body.prayerCategory}\n保密: ${isConfidential ? '是' : '否'}\n內容:\n${body.content || body.message}\n時間: ${timeStr}`;
        } else if (type === "ministry" || body.ministryName) {
          subject = subject || `[加南事工登記] ${body.applicantName || body.name || '弟兄姊妹'} 意願參與【${body.ministryName}】`;
          htmlBody = generateChurchHtmlEmail({
            title: `事工服事意願登記通知`,
            badgeText: `✝️ 事工登記：${body.ministryName}`,
            badgeColor: "#fef3c7",
            details: [
              { label: "事工項目", value: body.ministryName },
              { label: "姓名 / 署名", value: body.applicantName || body.name || "未提供" },
              { label: "聯絡電話", value: body.applicantPhone || body.phone || "未提供" },
              { label: "聯絡 Email", value: body.applicantEmail || body.email || "未提供" },
              { label: "提交時間", value: timeStr }
            ],
            messageBody: body.applicantNotes || body.message || "(無特別備註)",
            footerNote: "請該事工幹事或負責長執主動致電或寄信關懷聯絡。"
          });
          textBody = `${subject}\n\n事工: ${body.ministryName}\n姓名: ${body.applicantName || body.name}\n電話: ${body.applicantPhone || body.phone}\nEmail: ${body.applicantEmail || body.email}\n備註: ${body.applicantNotes || body.message}\n時間: ${timeStr}`;
        } else {
          htmlBody = generateChurchHtmlEmail({
            title: subject,
            badgeText: "加南官網通知",
            details: [
              { label: "發送時間", value: timeStr },
              { label: "回覆信箱", value: replyTo || "無" }
            ],
            messageBody: textBody || body.message || JSON.stringify(body, null, 2)
          });
        }
      }

      const transporter = createTransporterFromConfig(conf);

      const mailOptions: any = {
        from: `"${fromName}" <${fromEmail}>`,
        to: targetTo,
        subject: subject,
        text: textBody || (htmlBody ? htmlBody.replace(/<[^>]+>/g, " ") : ""),
        html: htmlBody
      };

      if (replyTo) {
        mailOptions.replyTo = replyTo;
      }

      const sendInfo = await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Successfully sent email "${subject}" to ${targetTo}, messageId: ${sendInfo.messageId}`);

      return res.json({
        success: true,
        message: "信件已成功透過 SMTP 郵件伺服器發送！",
        messageId: sendInfo.messageId,
        recipient: targetTo
      });
    } catch (err: any) {
      console.error("[SMTP] Send Error:", err);
      return res.status(500).json({
        success: false,
        error: `SMTP 寄信失敗: ${err.message || "未知錯誤"}`,
        code: err.code || undefined
      });
    }
  };

  app.post("/api/smtp/send", handleEmailSend);
  app.post("/api/send-email", handleEmailSend);

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
