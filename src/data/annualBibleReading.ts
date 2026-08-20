import { translateScriptureToEn, translateDateWeekdayToEn } from '../utils/translationHelper';

export interface DailyReadingItem {
  month: number;
  day: number;
  oldTestament: string;
  newTestament: string;
  oldTestamentEn?: string;
  newTestamentEn?: string;
}

export interface DayReadingDisplay {
  date: string; // e.g. "8/17 (週一)"
  dateEn: string; // e.g. "8/17 (Mon)"
  oldTestament: string;
  oldTestamentEn: string;
  newTestament: string;
  newTestamentEn: string;
  isToday?: boolean;
  rawDate: Date;
}

// 365-Day Bible Reading Plan (《靈命日糧》通讀聖經計畫)
export const ANNUAL_BIBLE_READING_RAW: DailyReadingItem[] = [
  // 一月 (January - 31 days)
  { month: 1, day: 1, oldTestament: '創世記 1-3', newTestament: '馬太福音 1' },
  { month: 1, day: 2, oldTestament: '創世記 4-6', newTestament: '馬太福音 2' },
  { month: 1, day: 3, oldTestament: '創世記 7-9', newTestament: '馬太福音 3' },
  { month: 1, day: 4, oldTestament: '創世記 10-12', newTestament: '馬太福音 4' },
  { month: 1, day: 5, oldTestament: '創世記 13-15', newTestament: '馬太福音 5:1-26' },
  { month: 1, day: 6, oldTestament: '創世記 16-17', newTestament: '馬太福音 5:27-48' },
  { month: 1, day: 7, oldTestament: '創世記 18-19', newTestament: '馬太福音 6:1-18' },
  { month: 1, day: 8, oldTestament: '創世記 20-22', newTestament: '馬太福音 6:19-34' },
  { month: 1, day: 9, oldTestament: '創世記 23-24', newTestament: '馬太福音 7' },
  { month: 1, day: 10, oldTestament: '創世記 25-26', newTestament: '馬太福音 8:1-17' },
  { month: 1, day: 11, oldTestament: '創世記 27-28', newTestament: '馬太福音 8:18-34' },
  { month: 1, day: 12, oldTestament: '創世記 29-30', newTestament: '馬太福音 9:1-17' },
  { month: 1, day: 13, oldTestament: '創世記 31-32', newTestament: '馬太福音 9:18-38' },
  { month: 1, day: 14, oldTestament: '創世記 33-35', newTestament: '馬太福音 10:1-20' },
  { month: 1, day: 15, oldTestament: '創世記 36-38', newTestament: '馬太福音 10:21-42' },
  { month: 1, day: 16, oldTestament: '創世記 39-40', newTestament: '馬太福音 11' },
  { month: 1, day: 17, oldTestament: '創世記 41-42', newTestament: '馬太福音 12:1-23' },
  { month: 1, day: 18, oldTestament: '創世記 43-45', newTestament: '馬太福音 12:24-50' },
  { month: 1, day: 19, oldTestament: '創世記 46-48', newTestament: '馬太福音 13:1-30' },
  { month: 1, day: 20, oldTestament: '創世記 49-50', newTestament: '馬太福音 13:31-58' },
  { month: 1, day: 21, oldTestament: '出埃及記 1-3', newTestament: '馬太福音 14:1-21' },
  { month: 1, day: 22, oldTestament: '出埃及記 4-6', newTestament: '馬太福音 14:22-36' },
  { month: 1, day: 23, oldTestament: '出埃及記 7-8', newTestament: '馬太福音 15:1-20' },
  { month: 1, day: 24, oldTestament: '出埃及記 9-11', newTestament: '馬太福音 15:21-39' },
  { month: 1, day: 25, oldTestament: '出埃及記 12-13', newTestament: '馬太福音 16' },
  { month: 1, day: 26, oldTestament: '出埃及記 14-15', newTestament: '馬太福音 17' },
  { month: 1, day: 27, oldTestament: '出埃及記 16-18', newTestament: '馬太福音 18:1-20' },
  { month: 1, day: 28, oldTestament: '出埃及記 19-20', newTestament: '馬太福音 18:21-35' },
  { month: 1, day: 29, oldTestament: '出埃及記 21-22', newTestament: '馬太福音 19' },
  { month: 1, day: 30, oldTestament: '出埃及記 23-24', newTestament: '馬太福音 20:1-16' },
  { month: 1, day: 31, oldTestament: '出埃及記 25-26', newTestament: '馬太福音 20:17-34' },

  // 二月 (February - 28 days)
  { month: 2, day: 1, oldTestament: '出埃及記 27-28', newTestament: '馬太福音 21:1-22' },
  { month: 2, day: 2, oldTestament: '出埃及記 29-30', newTestament: '馬太福音 21:23-46' },
  { month: 2, day: 3, oldTestament: '出埃及記 31-33', newTestament: '馬太福音 22:1-22' },
  { month: 2, day: 4, oldTestament: '出埃及記 34-35', newTestament: '馬太福音 22:23-46' },
  { month: 2, day: 5, oldTestament: '出埃及記 36-38', newTestament: '馬太福音 23:1-22' },
  { month: 2, day: 6, oldTestament: '出埃及記 39-40', newTestament: '馬太福音 23:23-39' },
  { month: 2, day: 7, oldTestament: '利未記 1-3', newTestament: '馬太福音 24:1-28' },
  { month: 2, day: 8, oldTestament: '利未記 4-5', newTestament: '馬太福音 24:29-51' },
  { month: 2, day: 9, oldTestament: '利未記 6-7', newTestament: '馬太福音 25:1-30' },
  { month: 2, day: 10, oldTestament: '利未記 8-10', newTestament: '馬太福音 25:31-46' },
  { month: 2, day: 11, oldTestament: '利未記 11-12', newTestament: '馬太福音 26:1-25' },
  { month: 2, day: 12, oldTestament: '利未記 13', newTestament: '馬太福音 26:26-50' },
  { month: 2, day: 13, oldTestament: '利未記 14', newTestament: '馬太福音 26:51-75' },
  { month: 2, day: 14, oldTestament: '利未記 15-16', newTestament: '馬太福音 27:1-26' },
  { month: 2, day: 15, oldTestament: '利未記 17-18', newTestament: '馬太福音 27:27-50' },
  { month: 2, day: 16, oldTestament: '利未記 19-20', newTestament: '馬太福音 27:51-66' },
  { month: 2, day: 17, oldTestament: '利未記 21-22', newTestament: '馬太福音 28' },
  { month: 2, day: 18, oldTestament: '利未記 23-24', newTestament: '馬可福音 1:1-22' },
  { month: 2, day: 19, oldTestament: '利未記 25', newTestament: '馬可福音 1:23-45' },
  { month: 2, day: 20, oldTestament: '利未記 26-27', newTestament: '馬可福音 2' },
  { month: 2, day: 21, oldTestament: '民數記 1-3', newTestament: '馬可福音 3' },
  { month: 2, day: 22, oldTestament: '民數記 4-6', newTestament: '馬可福音 4:1-20' },
  { month: 2, day: 23, oldTestament: '民數記 7-8', newTestament: '馬可福音 4:21-41' },
  { month: 2, day: 24, oldTestament: '民數記 9-11', newTestament: '馬可福音 5:1-20' },
  { month: 2, day: 25, oldTestament: '民數記 12-14', newTestament: '馬可福音 5:21-43' },
  { month: 2, day: 26, oldTestament: '民數記 15-16', newTestament: '馬可福音 6:1-29' },
  { month: 2, day: 27, oldTestament: '民數記 17-19', newTestament: '馬可福音 6:30-56' },
  { month: 2, day: 28, oldTestament: '民數記 20-22', newTestament: '馬可福音 7:1-13' },

  // 三月 (March - 31 days)
  { month: 3, day: 1, oldTestament: '民數記 23-25', newTestament: '馬可福音 7:14-37' },
  { month: 3, day: 2, oldTestament: '民數記 26-27', newTestament: '馬可福音 8:1-21' },
  { month: 3, day: 3, oldTestament: '民數記 28-30', newTestament: '馬可福音 8:22-38' },
  { month: 3, day: 4, oldTestament: '民數記 31-33', newTestament: '馬可福音 9:1-29' },
  { month: 3, day: 5, oldTestament: '民數記 34-36', newTestament: '馬可福音 9:30-50' },
  { month: 3, day: 6, oldTestament: '申命記 1-2', newTestament: '馬可福音 10:1-31' },
  { month: 3, day: 7, oldTestament: '申命記 3-4', newTestament: '馬可福音 10:32-52' },
  { month: 3, day: 8, oldTestament: '申命記 5-7', newTestament: '馬可福音 11:1-18' },
  { month: 3, day: 9, oldTestament: '申命記 8-10', newTestament: '馬可福音 11:19-33' },
  { month: 3, day: 10, oldTestament: '申命記 11-13', newTestament: '馬可福音 12:1-27' },
  { month: 3, day: 11, oldTestament: '申命記 14-16', newTestament: '馬可福音 12:28-44' },
  { month: 3, day: 12, oldTestament: '申命記 17-19', newTestament: '馬可福音 13:1-20' },
  { month: 3, day: 13, oldTestament: '申命記 20-22', newTestament: '馬可福音 13:21-37' },
  { month: 3, day: 14, oldTestament: '申命記 23-25', newTestament: '馬可福音 14:1-26' },
  { month: 3, day: 15, oldTestament: '申命記 26-27', newTestament: '馬可福音 14:27-53' },
  { month: 3, day: 16, oldTestament: '申命記 28-29', newTestament: '馬可福音 14:54-72' },
  { month: 3, day: 17, oldTestament: '申命記 30-31', newTestament: '馬可福音 15:1-25' },
  { month: 3, day: 18, oldTestament: '申命記 32-34', newTestament: '馬可福音 15:26-47' },
  { month: 3, day: 19, oldTestament: '約書亞記 1-3', newTestament: '馬可福音 16' },
  { month: 3, day: 20, oldTestament: '約書亞記 4-6', newTestament: '路加福音 1:1-20' },
  { month: 3, day: 21, oldTestament: '約書亞記 7-9', newTestament: '路加福音 1:21-38' },
  { month: 3, day: 22, oldTestament: '約書亞記 10-12', newTestament: '路加福音 1:39-56' },
  { month: 3, day: 23, oldTestament: '約書亞記 13-15', newTestament: '路加福音 1:57-80' },
  { month: 3, day: 24, oldTestament: '約書亞記 16-18', newTestament: '路加福音 2:1-24' },
  { month: 3, day: 25, oldTestament: '約書亞記 19-21', newTestament: '路加福音 2:25-52' },
  { month: 3, day: 26, oldTestament: '約書亞記 22-24', newTestament: '路加福音 3' },
  { month: 3, day: 27, oldTestament: '士師記 1-3', newTestament: '路加福音 4:1-30' },
  { month: 3, day: 28, oldTestament: '士師記 4-6', newTestament: '路加福音 4:31-44' },
  { month: 3, day: 29, oldTestament: '士師記 7-8', newTestament: '路加福音 5:1-16' },
  { month: 3, day: 30, oldTestament: '士師記 9-10', newTestament: '路加福音 5:17-39' },
  { month: 3, day: 31, oldTestament: '士師記 11-12', newTestament: '路加福音 6:1-26' },

  // 四月 (April - 30 days)
  { month: 4, day: 1, oldTestament: '士師記 13-15', newTestament: '路加福音 6:27-49' },
  { month: 4, day: 2, oldTestament: '士師記 16-18', newTestament: '路加福音 7:1-30' },
  { month: 4, day: 3, oldTestament: '士師記 19-21', newTestament: '路加福音 7:31-50' },
  { month: 4, day: 4, oldTestament: '路得記 1-4', newTestament: '路加福音 8:1-25' },
  { month: 4, day: 5, oldTestament: '撒母耳記上 1-3', newTestament: '路加福音 8:26-56' },
  { month: 4, day: 6, oldTestament: '撒母耳記上 4-6', newTestament: '路加福音 9:1-17' },
  { month: 4, day: 7, oldTestament: '撒母耳記上 7-9', newTestament: '路加福音 9:18-36' },
  { month: 4, day: 8, oldTestament: '撒母耳記上 10-12', newTestament: '路加福音 9:37-62' },
  { month: 4, day: 9, oldTestament: '撒母耳記上 13-14', newTestament: '路加福音 10:1-24' },
  { month: 4, day: 10, oldTestament: '撒母耳記上 15-16', newTestament: '路加福音 10:25-42' },
  { month: 4, day: 11, oldTestament: '撒母耳記上 17-18', newTestament: '路加福音 11:1-28' },
  { month: 4, day: 12, oldTestament: '撒母耳記上 19-21', newTestament: '路加福音 11:29-54' },
  { month: 4, day: 13, oldTestament: '撒母耳記上 22-24', newTestament: '路加福音 12:1-31' },
  { month: 4, day: 14, oldTestament: '撒母耳記上 25-26', newTestament: '路加福音 12:32-59' },
  { month: 4, day: 15, oldTestament: '撒母耳記上 27-29', newTestament: '路加福音 13:1-22' },
  { month: 4, day: 16, oldTestament: '撒母耳記上 30-31', newTestament: '路加福音 13:23-35' },
  { month: 4, day: 17, oldTestament: '撒母耳記下 1-2', newTestament: '路加福音 14:1-24' },
  { month: 4, day: 18, oldTestament: '撒母耳記下 3-5', newTestament: '路加福音 14:25-35' },
  { month: 4, day: 19, oldTestament: '撒母耳記下 6-8', newTestament: '路加福音 15:1-10' },
  { month: 4, day: 20, oldTestament: '撒母耳記下 9-11', newTestament: '路加福音 15:11-32' },
  { month: 4, day: 21, oldTestament: '撒母耳記下 12-13', newTestament: '路加福音 16' },
  { month: 4, day: 22, oldTestament: '撒母耳記下 14-15', newTestament: '路加福音 17:1-19' },
  { month: 4, day: 23, oldTestament: '撒母耳記下 16-18', newTestament: '路加福音 17:20-37' },
  { month: 4, day: 24, oldTestament: '撒母耳記下 19-20', newTestament: '路加福音 18:1-23' },
  { month: 4, day: 25, oldTestament: '撒母耳記下 21-22', newTestament: '路加福音 18:24-43' },
  { month: 4, day: 26, oldTestament: '撒母耳記下 23-24', newTestament: '路加福音 19:1-27' },
  { month: 4, day: 27, oldTestament: '列王紀上 1-2', newTestament: '路加福音 19:28-48' },
  { month: 4, day: 28, oldTestament: '列王紀上 3-5', newTestament: '路加福音 20:1-26' },
  { month: 4, day: 29, oldTestament: '列王紀上 6-7', newTestament: '路加福音 20:27-47' },
  { month: 4, day: 30, oldTestament: '列王紀上 8-9', newTestament: '路加福音 21:1-19' },

  // 五月 (May - 31 days)
  { month: 5, day: 1, oldTestament: '列王紀上 10-11', newTestament: '路加福音 21:20-38' },
  { month: 5, day: 2, oldTestament: '列王紀上 12-13', newTestament: '路加福音 22:1-20' },
  { month: 5, day: 3, oldTestament: '列王紀上 14-15', newTestament: '路加福音 22:21-46' },
  { month: 5, day: 4, oldTestament: '列王紀上 16-18', newTestament: '路加福音 22:47-71' },
  { month: 5, day: 5, oldTestament: '列王紀上 19-20', newTestament: '路加福音 23:1-25' },
  { month: 5, day: 6, oldTestament: '列王紀上 21-22', newTestament: '路加福音 23:26-56' },
  { month: 5, day: 7, oldTestament: '列王紀下 1-3', newTestament: '路加福音 24:1-35' },
  { month: 5, day: 8, oldTestament: '列王紀下 4-6', newTestament: '路加福音 24:36-53' },
  { month: 5, day: 9, oldTestament: '列王紀下 7-9', newTestament: '約翰福音 1:1-28' },
  { month: 5, day: 10, oldTestament: '列王紀下 10-12', newTestament: '約翰福音 1:29-51' },
  { month: 5, day: 11, oldTestament: '列王紀下 13-14', newTestament: '約翰福音 2' },
  { month: 5, day: 12, oldTestament: '列王紀下 15-16', newTestament: '約翰福音 3:1-18' },
  { month: 5, day: 13, oldTestament: '列王紀下 17-18', newTestament: '約翰福音 3:19-36' },
  { month: 5, day: 14, oldTestament: '列王紀下 19-21', newTestament: '約翰福音 4:1-30' },
  { month: 5, day: 15, oldTestament: '列王紀下 22-23', newTestament: '約翰福音 4:31-54' },
  { month: 5, day: 16, oldTestament: '列王紀下 24-25', newTestament: '約翰福音 5:1-24' },
  { month: 5, day: 17, oldTestament: '歷代志上 1-3', newTestament: '約翰福音 5:25-47' },
  { month: 5, day: 18, oldTestament: '歷代志上 4-6', newTestament: '約翰福音 6:1-21' },
  { month: 5, day: 19, oldTestament: '歷代志上 7-9', newTestament: '約翰福音 6:22-44' },
  { month: 5, day: 20, oldTestament: '歷代志上 10-12', newTestament: '約翰福音 6:45-71' },
  { month: 5, day: 21, oldTestament: '歷代志上 13-15', newTestament: '約翰福音 7:1-27' },
  { month: 5, day: 22, oldTestament: '歷代志上 16-18', newTestament: '約翰福音 7:28-53' },
  { month: 5, day: 23, oldTestament: '歷代志上 19-21', newTestament: '約翰福音 8:1-27' },
  { month: 5, day: 24, oldTestament: '歷代志上 22-24', newTestament: '約翰福音 8:28-59' },
  { month: 5, day: 25, oldTestament: '歷代志上 25-27', newTestament: '約翰福音 9:1-23' },
  { month: 5, day: 26, oldTestament: '歷代志上 28-29', newTestament: '約翰福音 9:24-41' },
  { month: 5, day: 27, oldTestament: '歷代志下 1-3', newTestament: '約翰福音 10:1-23' },
  { month: 5, day: 28, oldTestament: '歷代志下 4-6', newTestament: '約翰福音 10:24-42' },
  { month: 5, day: 29, oldTestament: '歷代志下 7-9', newTestament: '約翰福音 11:1-29' },
  { month: 5, day: 30, oldTestament: '歷代志下 10-12', newTestament: '約翰福音 11:30-57' },
  { month: 5, day: 31, oldTestament: '歷代志下 13-14', newTestament: '約翰福音 12:1-26' },

  // 六月 (June - 30 days)
  { month: 6, day: 1, oldTestament: '歷代志下 15-16', newTestament: '約翰福音 12:27-50' },
  { month: 6, day: 2, oldTestament: '歷代志下 17-18', newTestament: '約翰福音 13:1-20' },
  { month: 6, day: 3, oldTestament: '歷代志下 19-20', newTestament: '約翰福音 13:21-38' },
  { month: 6, day: 4, oldTestament: '歷代志下 21-22', newTestament: '約翰福音 14' },
  { month: 6, day: 5, oldTestament: '歷代志下 23-24', newTestament: '約翰福音 15' },
  { month: 6, day: 6, oldTestament: '歷代志下 25-27', newTestament: '約翰福音 16' },
  { month: 6, day: 7, oldTestament: '歷代志下 28-29', newTestament: '約翰福音 17' },
  { month: 6, day: 8, oldTestament: '歷代志下 30-31', newTestament: '約翰福音 18:1-18' },
  { month: 6, day: 9, oldTestament: '歷代志下 32-33', newTestament: '約翰福音 18:19-40' },
  { month: 6, day: 10, oldTestament: '歷代志下 34-36', newTestament: '約翰福音 19:1-22' },
  { month: 6, day: 11, oldTestament: '以斯拉記 1-2', newTestament: '約翰福音 19:23-42' },
  { month: 6, day: 12, oldTestament: '以斯拉記 3-5', newTestament: '約翰福音 20' },
  { month: 6, day: 13, oldTestament: '以斯拉記 6-8', newTestament: '約翰福音 21' },
  { month: 6, day: 14, oldTestament: '以斯拉記 9-10', newTestament: '使徒行傳 1' },
  { month: 6, day: 15, oldTestament: '尼希米記 1-3', newTestament: '使徒行傳 2:1-21' },
  { month: 6, day: 16, oldTestament: '尼希米記 4-6', newTestament: '使徒行傳 2:22-47' },
  { month: 6, day: 17, oldTestament: '尼希米記 7-9', newTestament: '使徒行傳 3' },
  { month: 6, day: 18, oldTestament: '尼希米記 10-11', newTestament: '使徒行傳 4:1-22' },
  { month: 6, day: 19, oldTestament: '尼希米記 12-13', newTestament: '使徒行傳 4:23-37' },
  { month: 6, day: 20, oldTestament: '以斯帖記 1-2', newTestament: '使徒行傳 5:1-21' },
  { month: 6, day: 21, oldTestament: '以斯帖記 3-5', newTestament: '使徒行傳 5:22-42' },
  { month: 6, day: 22, oldTestament: '以斯帖記 6-8', newTestament: '使徒行傳 6' },
  { month: 6, day: 23, oldTestament: '以斯帖記 9-10', newTestament: '使徒行傳 7:1-21' },
  { month: 6, day: 24, oldTestament: '約伯記 1-2', newTestament: '使徒行傳 7:22-43' },
  { month: 6, day: 25, oldTestament: '約伯記 3-4', newTestament: '使徒行傳 7:44-60' },
  { month: 6, day: 26, oldTestament: '約伯記 5-7', newTestament: '使徒行傳 8:1-25' },
  { month: 6, day: 27, oldTestament: '約伯記 8-10', newTestament: '使徒行傳 8:26-40' },
  { month: 6, day: 28, oldTestament: '約伯記 11-13', newTestament: '使徒行傳 9:1-21' },
  { month: 6, day: 29, oldTestament: '約伯記 14-16', newTestament: '使徒行傳 9:22-43' },
  { month: 6, day: 30, oldTestament: '約伯記 17-19', newTestament: '使徒行傳 10:1-23' },

  // 七月 (July - 31 days)
  { month: 7, day: 1, oldTestament: '約伯記 20-21', newTestament: '使徒行傳 10:24-48' },
  { month: 7, day: 2, oldTestament: '約伯記 22-24', newTestament: '使徒行傳 11' },
  { month: 7, day: 3, oldTestament: '約伯記 25-27', newTestament: '使徒行傳 12' },
  { month: 7, day: 4, oldTestament: '約伯記 28-29', newTestament: '使徒行傳 13:1-25' },
  { month: 7, day: 5, oldTestament: '約伯記 30-31', newTestament: '使徒行傳 13:26-52' },
  { month: 7, day: 6, oldTestament: '約伯記 32-33', newTestament: '使徒行傳 14' },
  { month: 7, day: 7, oldTestament: '約伯記 34-35', newTestament: '使徒行傳 15:1-21' },
  { month: 7, day: 8, oldTestament: '約伯記 36-37', newTestament: '使徒行傳 15:22-41' },
  { month: 7, day: 9, oldTestament: '約伯記 38-40', newTestament: '使徒行傳 16:1-21' },
  { month: 7, day: 10, oldTestament: '約伯記 41-42', newTestament: '使徒行傳 16:22-40' },
  { month: 7, day: 11, oldTestament: '詩篇 1-3', newTestament: '使徒行傳 17:1-15' },
  { month: 7, day: 12, oldTestament: '詩篇 4-6', newTestament: '使徒行傳 17:16-34' },
  { month: 7, day: 13, oldTestament: '詩篇 7-9', newTestament: '使徒行傳 18' },
  { month: 7, day: 14, oldTestament: '詩篇 10-12', newTestament: '使徒行傳 19:1-20' },
  { month: 7, day: 15, oldTestament: '詩篇 13-15', newTestament: '使徒行傳 19:21-41' },
  { month: 7, day: 16, oldTestament: '詩篇 16-17', newTestament: '使徒行傳 20:1-16' },
  { month: 7, day: 17, oldTestament: '詩篇 18-19', newTestament: '使徒行傳 20:17-38' },
  { month: 7, day: 18, oldTestament: '詩篇 20-22', newTestament: '使徒行傳 21:1-17' },
  { month: 7, day: 19, oldTestament: '詩篇 23-25', newTestament: '使徒行傳 21:18-40' },
  { month: 7, day: 20, oldTestament: '詩篇 26-28', newTestament: '使徒行傳 22' },
  { month: 7, day: 21, oldTestament: '詩篇 29-30', newTestament: '使徒行傳 23:1-15' },
  { month: 7, day: 22, oldTestament: '詩篇 31-32', newTestament: '使徒行傳 23:16-35' },
  { month: 7, day: 23, oldTestament: '詩篇 33-34', newTestament: '使徒行傳 24' },
  { month: 7, day: 24, oldTestament: '詩篇 35-36', newTestament: '使徒行傳 25' },
  { month: 7, day: 25, oldTestament: '詩篇 37-39', newTestament: '使徒行傳 26' },
  { month: 7, day: 26, oldTestament: '詩篇 40-42', newTestament: '使徒行傳 27:1-26' },
  { month: 7, day: 27, oldTestament: '詩篇 43-45', newTestament: '使徒行傳 27:27-44' },
  { month: 7, day: 28, oldTestament: '詩篇 46-48', newTestament: '使徒行傳 28' },
  { month: 7, day: 29, oldTestament: '詩篇 49-50', newTestament: '羅馬書 1' },
  { month: 7, day: 30, oldTestament: '詩篇 51-53', newTestament: '羅馬書 2' },
  { month: 7, day: 31, oldTestament: '詩篇 54-56', newTestament: '羅馬書 3' },

  // 八月 (August - 31 days)
  { month: 8, day: 1, oldTestament: '詩篇 57-59', newTestament: '羅馬書 4' },
  { month: 8, day: 2, oldTestament: '詩篇 60-62', newTestament: '羅馬書 5' },
  { month: 8, day: 3, oldTestament: '詩篇 63-65', newTestament: '羅馬書 6' },
  { month: 8, day: 4, oldTestament: '詩篇 66-67', newTestament: '羅馬書 7' },
  { month: 8, day: 5, oldTestament: '詩篇 68-69', newTestament: '羅馬書 8:1-21' },
  { month: 8, day: 6, oldTestament: '詩篇 70-71', newTestament: '羅馬書 8:22-39' },
  { month: 8, day: 7, oldTestament: '詩篇 72-73', newTestament: '羅馬書 9:1-15' },
  { month: 8, day: 8, oldTestament: '詩篇 74-76', newTestament: '羅馬書 9:16-33' },
  { month: 8, day: 9, oldTestament: '詩篇 77-78', newTestament: '羅馬書 10' },
  { month: 8, day: 10, oldTestament: '詩篇 79-80', newTestament: '羅馬書 11:1-18' },
  { month: 8, day: 11, oldTestament: '詩篇 81-83', newTestament: '羅馬書 11:19-36' },
  { month: 8, day: 12, oldTestament: '詩篇 84-86', newTestament: '羅馬書 12' },
  { month: 8, day: 13, oldTestament: '詩篇 87-88', newTestament: '羅馬書 13' },
  { month: 8, day: 14, oldTestament: '詩篇 89-90', newTestament: '羅馬書 14' },
  { month: 8, day: 15, oldTestament: '詩篇 91-93', newTestament: '羅馬書 15:1-13' },
  { month: 8, day: 16, oldTestament: '詩篇 94-96', newTestament: '羅馬書 15:14-33' },
  { month: 8, day: 17, oldTestament: '詩篇 97-99', newTestament: '羅馬書 16' },
  { month: 8, day: 18, oldTestament: '詩篇 100-102', newTestament: '哥林多前書 1' },
  { month: 8, day: 19, oldTestament: '詩篇 103-104', newTestament: '哥林多前書 2' },
  { month: 8, day: 20, oldTestament: '詩篇 105-106', newTestament: '哥林多前書 3' },
  { month: 8, day: 21, oldTestament: '詩篇 107-109', newTestament: '哥林多前書 4' },
  { month: 8, day: 22, oldTestament: '詩篇 110-112', newTestament: '哥林多前書 5' },
  { month: 8, day: 23, oldTestament: '詩篇 113-115', newTestament: '哥林多前書 6' },
  { month: 8, day: 24, oldTestament: '詩篇 116-118', newTestament: '哥林多前書 7:1-19' },
  { month: 8, day: 25, oldTestament: '詩篇 119:1-88', newTestament: '哥林多前書 7:20-40' },
  { month: 8, day: 26, oldTestament: '詩篇 119:89-176', newTestament: '哥林多前書 8' },
  { month: 8, day: 27, oldTestament: '詩篇 120-122', newTestament: '哥林多前書 9' },
  { month: 8, day: 28, oldTestament: '詩篇 123-125', newTestament: '哥林多前書 10:1-18' },
  { month: 8, day: 29, oldTestament: '詩篇 126-128', newTestament: '哥林多前書 10:19-33' },
  { month: 8, day: 30, oldTestament: '詩篇 129-131', newTestament: '哥林多前書 11:1-16' },
  { month: 8, day: 31, oldTestament: '詩篇 132-134', newTestament: '哥林多前書 11:17-34' },

  // 九月 (September - 30 days)
  { month: 9, day: 1, oldTestament: '詩篇 135-136', newTestament: '哥林多前書 12' },
  { month: 9, day: 2, oldTestament: '詩篇 137-139', newTestament: '哥林多前書 13' },
  { month: 9, day: 3, oldTestament: '詩篇 140-142', newTestament: '哥林多前書 14:1-20' },
  { month: 9, day: 4, oldTestament: '詩篇 143-145', newTestament: '哥林多前書 14:21-40' },
  { month: 9, day: 5, oldTestament: '詩篇 146-147', newTestament: '哥林多前書 15:1-28' },
  { month: 9, day: 6, oldTestament: '詩篇 148-150', newTestament: '哥林多前書 15:29-58' },
  { month: 9, day: 7, oldTestament: '箴言 1-2', newTestament: '哥林多前書 16' },
  { month: 9, day: 8, oldTestament: '箴言 3-5', newTestament: '哥林多後書 1' },
  { month: 9, day: 9, oldTestament: '箴言 6-7', newTestament: '哥林多後書 2' },
  { month: 9, day: 10, oldTestament: '箴言 8-9', newTestament: '哥林多後書 3' },
  { month: 9, day: 11, oldTestament: '箴言 10-12', newTestament: '哥林多後書 4' },
  { month: 9, day: 12, oldTestament: '箴言 13-15', newTestament: '哥林多後書 5' },
  { month: 9, day: 13, oldTestament: '箴言 16-18', newTestament: '哥林多後書 6' },
  { month: 9, day: 14, oldTestament: '箴言 19-21', newTestament: '哥林多後書 7' },
  { month: 9, day: 15, oldTestament: '箴言 22-24', newTestament: '哥林多後書 8' },
  { month: 9, day: 16, oldTestament: '箴言 25-26', newTestament: '哥林多後書 9' },
  { month: 9, day: 17, oldTestament: '箴言 27-29', newTestament: '哥林多後書 10' },
  { month: 9, day: 18, oldTestament: '箴言 30-31', newTestament: '哥林多後書 11:1-15' },
  { month: 9, day: 19, oldTestament: '傳道書 1-3', newTestament: '哥林多後書 11:16-33' },
  { month: 9, day: 20, oldTestament: '傳道書 4-6', newTestament: '哥林多後書 12' },
  { month: 9, day: 21, oldTestament: '傳道書 7-9', newTestament: '哥林多後書 13' },
  { month: 9, day: 22, oldTestament: '傳道書 10-12', newTestament: '加拉太書 1' },
  { month: 9, day: 23, oldTestament: '雅歌 1-3', newTestament: '加拉太書 2' },
  { month: 9, day: 24, oldTestament: '雅歌 4-5', newTestament: '加拉太書 3' },
  { month: 9, day: 25, oldTestament: '雅歌 6-8', newTestament: '加拉太書 4' },
  { month: 9, day: 26, oldTestament: '以賽亞書 1-2', newTestament: '加拉太書 5' },
  { month: 9, day: 27, oldTestament: '以賽亞書 3-4', newTestament: '加拉太書 6' },
  { month: 9, day: 28, oldTestament: '以賽亞書 5-6', newTestament: '以弗所書 1' },
  { month: 9, day: 29, oldTestament: '以賽亞書 7-8', newTestament: '以弗所書 2' },
  { month: 9, day: 30, oldTestament: '以賽亞書 9-10', newTestament: '以弗所書 3' },

  // 十月 (October - 31 days)
  { month: 10, day: 1, oldTestament: '以賽亞書 11-13', newTestament: '以弗所書 4' },
  { month: 10, day: 2, oldTestament: '以賽亞書 14-16', newTestament: '以弗所書 5:1-16' },
  { month: 10, day: 3, oldTestament: '以賽亞書 17-19', newTestament: '以弗所書 5:17-33' },
  { month: 10, day: 4, oldTestament: '以賽亞書 20-22', newTestament: '以弗所書 6' },
  { month: 10, day: 5, oldTestament: '以賽亞書 23-25', newTestament: '腓立比書 1' },
  { month: 10, day: 6, oldTestament: '以賽亞書 26-27', newTestament: '腓立比書 2' },
  { month: 10, day: 7, oldTestament: '以賽亞書 28-29', newTestament: '腓立比書 3' },
  { month: 10, day: 8, oldTestament: '以賽亞書 30-31', newTestament: '腓立比書 4' },
  { month: 10, day: 9, oldTestament: '以賽亞書 32-33', newTestament: '歌羅西書 1' },
  { month: 10, day: 10, oldTestament: '以賽亞書 34-36', newTestament: '歌羅西書 2' },
  { month: 10, day: 11, oldTestament: '以賽亞書 37-38', newTestament: '歌羅西書 3' },
  { month: 10, day: 12, oldTestament: '以賽亞書 39-40', newTestament: '歌羅西書 4' },
  { month: 10, day: 13, oldTestament: '以賽亞書 41-42', newTestament: '帖撒羅尼迦前書 1' },
  { month: 10, day: 14, oldTestament: '以賽亞書 43-44', newTestament: '帖撒羅尼迦前書 2' },
  { month: 10, day: 15, oldTestament: '以賽亞書 45-46', newTestament: '帖撒羅尼迦前書 3' },
  { month: 10, day: 16, oldTestament: '以賽亞書 47-49', newTestament: '帖撒羅尼迦前書 4' },
  { month: 10, day: 17, oldTestament: '以賽亞書 50-52', newTestament: '帖撒羅尼迦前書 5' },
  { month: 10, day: 18, oldTestament: '以賽亞書 53-55', newTestament: '帖撒羅尼迦後書 1' },
  { month: 10, day: 19, oldTestament: '以賽亞書 56-58', newTestament: '帖撒羅尼迦後書 2' },
  { month: 10, day: 20, oldTestament: '以賽亞書 59-61', newTestament: '帖撒羅尼迦後書 3' },
  { month: 10, day: 21, oldTestament: '以賽亞書 62-64', newTestament: '提摩太前書 1' },
  { month: 10, day: 22, oldTestament: '以賽亞書 65-66', newTestament: '提摩太前書 2' },
  { month: 10, day: 23, oldTestament: '耶利米書 1-2', newTestament: '提摩太前書 3' },
  { month: 10, day: 24, oldTestament: '耶利米書 3-5', newTestament: '提摩太前書 4' },
  { month: 10, day: 25, oldTestament: '耶利米書 6-8', newTestament: '提摩太前書 5' },
  { month: 10, day: 26, oldTestament: '耶利米書 9-11', newTestament: '提摩太前書 6' },
  { month: 10, day: 27, oldTestament: '耶利米書 12-14', newTestament: '提摩太後書 1' },
  { month: 10, day: 28, oldTestament: '耶利米書 15-17', newTestament: '提摩太後書 2' },
  { month: 10, day: 29, oldTestament: '耶利米書 18-19', newTestament: '提摩太後書 3' },
  { month: 10, day: 30, oldTestament: '耶利米書 20-21', newTestament: '提摩太後書 4' },
  { month: 10, day: 31, oldTestament: '耶利米書 22-23', newTestament: '提多書 1' },

  // 十一月 (November - 30 days)
  { month: 11, day: 1, oldTestament: '耶利米書 24-26', newTestament: '提多書 2' },
  { month: 11, day: 2, oldTestament: '耶利米書 27-29', newTestament: '提多書 3' },
  { month: 11, day: 3, oldTestament: '耶利米書 30-31', newTestament: '腓利門書' },
  { month: 11, day: 4, oldTestament: '耶利米書 32-33', newTestament: '希伯來書 1' },
  { month: 11, day: 5, oldTestament: '耶利米書 34-36', newTestament: '希伯來書 2' },
  { month: 11, day: 6, oldTestament: '耶利米書 37-39', newTestament: '希伯來書 3' },
  { month: 11, day: 7, oldTestament: '耶利米書 40-42', newTestament: '希伯來書 4' },
  { month: 11, day: 8, oldTestament: '耶利米書 43-45', newTestament: '希伯來書 5' },
  { month: 11, day: 9, oldTestament: '耶利米書 46-47', newTestament: '希伯來書 6' },
  { month: 11, day: 10, oldTestament: '耶利米書 48-49', newTestament: '希伯來書 7' },
  { month: 11, day: 11, oldTestament: '耶利米書 50', newTestament: '希伯來書 8' },
  { month: 11, day: 12, oldTestament: '耶利米書 51-52', newTestament: '希伯來書 9' },
  { month: 11, day: 13, oldTestament: '耶利米哀歌 1-2', newTestament: '希伯來書 10:1-18' },
  { month: 11, day: 14, oldTestament: '耶利米哀歌 3-5', newTestament: '希伯來書 10:19-39' },
  { month: 11, day: 15, oldTestament: '以西結書 1-2', newTestament: '希伯來書 11:1-19' },
  { month: 11, day: 16, oldTestament: '以西結書 3-4', newTestament: '希伯來書 11:20-40' },
  { month: 11, day: 17, oldTestament: '以西結書 5-7', newTestament: '希伯來書 12' },
  { month: 11, day: 18, oldTestament: '以西結書 8-10', newTestament: '希伯來書 13' },
  { month: 11, day: 19, oldTestament: '以西結書 11-13', newTestament: '雅各書 1' },
  { month: 11, day: 20, oldTestament: '以西結書 14-15', newTestament: '雅各書 2' },
  { month: 11, day: 21, oldTestament: '以西結書 16-17', newTestament: '雅各書 3' },
  { month: 11, day: 22, oldTestament: '以西結書 18-19', newTestament: '雅各書 4' },
  { month: 11, day: 23, oldTestament: '以西結書 20-21', newTestament: '雅各書 5' },
  { month: 11, day: 24, oldTestament: '以西結書 22-23', newTestament: '彼得前書 1' },
  { month: 11, day: 25, oldTestament: '以西結書 24-26', newTestament: '彼得前書 2' },
  { month: 11, day: 26, oldTestament: '以西結書 27-29', newTestament: '彼得前書 3' },
  { month: 11, day: 27, oldTestament: '以西結書 30-32', newTestament: '彼得前書 4' },
  { month: 11, day: 28, oldTestament: '以西結書 33-34', newTestament: '彼得前書 5' },
  { month: 11, day: 29, oldTestament: '以西結書 35-36', newTestament: '彼得後書 1' },
  { month: 11, day: 30, oldTestament: '以西結書 37-39', newTestament: '彼得後書 2' },

  // 十二月 (December - 31 days)
  { month: 12, day: 1, oldTestament: '以西結書 40-41', newTestament: '彼得後書 3' },
  { month: 12, day: 2, oldTestament: '以西結書 42-44', newTestament: '約翰一書 1' },
  { month: 12, day: 3, oldTestament: '以西結書 45-46', newTestament: '約翰一書 2' },
  { month: 12, day: 4, oldTestament: '以西結書 47-48', newTestament: '約翰一書 3' },
  { month: 12, day: 5, oldTestament: '但以理書 1-2', newTestament: '約翰一書 4' },
  { month: 12, day: 6, oldTestament: '但以理書 3-4', newTestament: '約翰一書 5' },
  { month: 12, day: 7, oldTestament: '但以理書 5-7', newTestament: '約翰二書' },
  { month: 12, day: 8, oldTestament: '但以理書 8-10', newTestament: '約翰三書' },
  { month: 12, day: 9, oldTestament: '但以理書 11-12', newTestament: '猶大書' },
  { month: 12, day: 10, oldTestament: '何西阿書 1-4', newTestament: '啟示錄 1' },
  { month: 12, day: 11, oldTestament: '何西阿書 5-8', newTestament: '啟示錄 2' },
  { month: 12, day: 12, oldTestament: '何西阿書 9-11', newTestament: '啟示錄 3' },
  { month: 12, day: 13, oldTestament: '何西阿書 12-14', newTestament: '啟示錄 4' },
  { month: 12, day: 14, oldTestament: '約珥書 1-3', newTestament: '啟示錄 5' },
  { month: 12, day: 15, oldTestament: '阿摩司書 1-3', newTestament: '啟示錄 6' },
  { month: 12, day: 16, oldTestament: '阿摩司書 4-6', newTestament: '啟示錄 7' },
  { month: 12, day: 17, oldTestament: '阿摩司書 7-9', newTestament: '啟示錄 8' },
  { month: 12, day: 18, oldTestament: '俄巴底亞書', newTestament: '啟示錄 9' },
  { month: 12, day: 19, oldTestament: '約拿書 1-4', newTestament: '啟示錄 10' },
  { month: 12, day: 20, oldTestament: '彌迦書 1-3', newTestament: '啟示錄 11' },
  { month: 12, day: 21, oldTestament: '彌迦書 4-5', newTestament: '啟示錄 12' },
  { month: 12, day: 22, oldTestament: '彌迦書 6-7', newTestament: '啟示錄 13' },
  { month: 12, day: 23, oldTestament: '那鴻書 1-3', newTestament: '啟示錄 14' },
  { month: 12, day: 24, oldTestament: '哈巴谷書 1-3', newTestament: '啟示錄 15' },
  { month: 12, day: 25, oldTestament: '西番雅書 1-3', newTestament: '啟示錄 16' },
  { month: 12, day: 26, oldTestament: '哈該書 1-2', newTestament: '啟示錄 17' },
  { month: 12, day: 27, oldTestament: '撒迦利亞書 1-4', newTestament: '啟示錄 18' },
  { month: 12, day: 28, oldTestament: '撒迦利亞書 5-8', newTestament: '啟示錄 19' },
  { month: 12, day: 29, oldTestament: '撒迦利亞書 9-12', newTestament: '啟示錄 20' },
  { month: 12, day: 30, oldTestament: '撒迦利亞書 13-14', newTestament: '啟示錄 21' },
  { month: 12, day: 31, oldTestament: '瑪拉基書 1-4', newTestament: '啟示錄 22' },
];

/**
 * Lookup reading item for a given month & day
 */
export function getReadingForMonthAndDay(month: number, day: number): DailyReadingItem {
  // Clamp or fallback
  const found = ANNUAL_BIBLE_READING_RAW.find(item => item.month === month && item.day === day);
  if (found) return found;

  // Leap day Feb 29 handling
  if (month === 2 && day === 29) {
    return { month: 2, day: 29, oldTestament: '民數記 20-22', newTestament: '馬可福音 7:1-13' };
  }

  // Fallback to day 1 of that month
  return ANNUAL_BIBLE_READING_RAW.find(item => item.month === month) || ANNUAL_BIBLE_READING_RAW[0];
}

const WEEKDAY_ZH = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Generates the 7-day reading schedule for any given reference date (Monday through Sunday)
 */
export function getWeekScheduleFromAnnual(targetDate: Date = new Date(), weekOffset: number = 0): {
  rangeZh: string;
  rangeEn: string;
  schedule: DayReadingDisplay[];
  isCurrentWeek: boolean;
} {
  const base = new Date(targetDate);
  if (weekOffset !== 0) {
    base.setDate(base.getDate() + weekOffset * 7);
  }

  // Calculate Monday of this week
  const dayOfWeek = base.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(base);
  monday.setDate(base.getDate() + distanceToMonday);

  const today = new Date();
  const schedule: DayReadingDisplay[] = [];

  for (let i = 0; i < 7; i++) {
    const curr = new Date(monday);
    curr.setDate(monday.getDate() + i);

    const m = curr.getMonth() + 1;
    const d = curr.getDate();
    const w = curr.getDay();

    const reading = getReadingForMonthAndDay(m, d);
    const otEn = translateScriptureToEn(reading.oldTestament);
    const ntEn = translateScriptureToEn(reading.newTestament);

    const isToday = curr.getFullYear() === today.getFullYear() &&
                    curr.getMonth() === today.getMonth() &&
                    curr.getDate() === today.getDate();

    schedule.push({
      date: `${m}/${d} (${WEEKDAY_ZH[w]})`,
      dateEn: `${m}/${d} (${WEEKDAY_EN[w]})`,
      oldTestament: reading.oldTestament,
      oldTestamentEn: otEn,
      newTestament: reading.newTestament,
      newTestamentEn: ntEn,
      isToday,
      rawDate: curr,
    });
  }

  const firstDay = schedule[0];
  const lastDay = schedule[6];
  const startM = firstDay.rawDate.getMonth() + 1;
  const startD = firstDay.rawDate.getDate();
  const endM = lastDay.rawDate.getMonth() + 1;
  const endD = lastDay.rawDate.getDate();

  const rangeZh = `${startM}/${startD} - ${endM}/${endD}`;
  const rangeEn = `${startM}/${startD} - ${endM}/${endD}`;

  return {
    rangeZh,
    rangeEn,
    schedule,
    isCurrentWeek: weekOffset === 0,
  };
}
