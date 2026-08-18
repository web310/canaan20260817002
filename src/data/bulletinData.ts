import { WEEKLY_BIBLE_READING } from './churchData';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - WEEKLY BULLETIN & READING PLAN MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: 2026-08-16T21:20:00.000Z
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

export const INITIAL_BULLETIN_DATA: BulletinData = {
  memoryVerseZh: WEEKLY_BIBLE_READING.memoryVerseZh,
  memoryVerseEn: WEEKLY_BIBLE_READING.memoryVerseEn,
  verseReference: WEEKLY_BIBLE_READING.verseReference,
  readingRange: WEEKLY_BIBLE_READING.readingRange || "8/17 - 8/23",
  schedule: WEEKLY_BIBLE_READING.schedule,
  announcements: [
    "歡迎第一次來參加崇拜的新朋友，願神大大賜福您和您的家庭！",
    "每週四晚上 8:00 線上禱告會 (Zoom ID: 310-626-6103，密碼: 25226)，歡迎弟兄姊妹同心代求。",
    "細胞小組聚會於每月第 1 與第 3 個週六下午 2:00 舉行，歡迎報名參加。"
  ],
  updatedAt: "2026-08-16T21:20:00.000Z"
};
