// Helper functions to translate dates, scripture names, and common phrases to English

const BIBLE_BOOKS_ZH_TO_EN: Record<string, string> = {
  // Old Testament
  '創世記': 'Genesis',
  '創世紀': 'Genesis',
  '出埃及記': 'Exodus',
  '利未記': 'Leviticus',
  '民數記': 'Numbers',
  '申命記': 'Deuteronomy',
  '約書亞記': 'Joshua',
  '士師記': 'Judges',
  '路得記': 'Ruth',
  '撒母耳記上': '1 Samuel',
  '撒母耳記下': '2 Samuel',
  '列王紀上': '1 Kings',
  '列王紀下': '2 Kings',
  '歷代志上': '1 Chronicles',
  '歷代志下': '2 Chronicles',
  '以斯拉記': 'Ezra',
  '尼希米記': 'Nehemiah',
  '以斯帖記': 'Esther',
  '約伯記': 'Job',
  '詩篇': 'Psalms',
  '箴言': 'Proverbs',
  '傳道書': 'Ecclesiastes',
  '雅歌': 'Song of Songs',
  '以賽亞書': 'Isaiah',
  '耶利米書': 'Jeremiah',
  '耶利米哀歌': 'Lamentations',
  '以西結書': 'Ezekiel',
  '但以理書': 'Daniel',
  '何西阿書': 'Hosea',
  '約珥書': 'Joel',
  '阿摩司書': 'Amos',
  '俄巴底亞書': 'Obadiah',
  '約拿書': 'Jonah',
  '彌迦書': 'Micah',
  '那鴻書': 'Nahum',
  '哈巴谷書': 'Habakkuk',
  '西番雅書': 'Zephaniah',
  '哈該書': 'Haggai',
  '撒迦利亞書': 'Zechariah',
  '瑪拉基書': 'Malachi',

  // New Testament
  '馬太福音': 'Matthew',
  '馬可福音': 'Mark',
  '路加福音': 'Luke',
  '約翰福音': 'John',
  '使徒行傳': 'Acts',
  '羅馬書': 'Romans',
  '哥林多前書': '1 Corinthians',
  '哥林多後書': '2 Corinthians',
  '加拉太書': 'Galatians',
  '以弗所書': 'Ephesians',
  '腓立比書': 'Philippians',
  '歌羅西書': 'Colossians',
  '帖撒羅尼迦前書': '1 Thessalonians',
  '帖撒羅尼迦後書': '2 Thessalonians',
  '提摩太前書': '1 Timothy',
  '提摩太後書': '2 Timothy',
  '提多書': 'Titus',
  '腓利門書': 'Philemon',
  '希伯來書': 'Hebrews',
  '雅各書': 'James',
  '彼得前書': '1 Peter',
  '彼得後書': '2 Peter',
  '約翰一書': '1 John',
  '約翰二書': '2 John',
  '約翰三書': '3 John',
  '猶大書': 'Jude',
  '啟示錄': 'Revelation',
};

/**
 * Translates Chinese scripture reference string to English.
 * e.g. "詩篇 97-99" -> "Psalms 97-99"
 * e.g. "羅馬書 16:1-16" -> "Romans 16:1-16"
 * e.g. "哥林多前書 1:1-17" -> "1 Corinthians 1:1-17"
 */
export function translateScriptureToEn(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [zh, en] of Object.entries(BIBLE_BOOKS_ZH_TO_EN)) {
    if (result.includes(zh)) {
      result = result.replace(new RegExp(zh, 'g'), en);
    }
  }
  return result;
}

/**
 * Translates date string with Chinese weekday indicators to English.
 * e.g. "8/17 (週一)" -> "8/17 (Mon)"
 * e.g. "8/23 (週日)" -> "8/23 (Sun)"
 */
export function translateDateWeekdayToEn(text: string): string {
  if (!text) return '';
  return text
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/\(?週一\)?|\(?星期一\)?/g, '(Mon)')
    .replace(/\(?週二\)?|\(?星期二\)?/g, '(Tue)')
    .replace(/\(?週三\)?|\(?星期三\)?/g, '(Wed)')
    .replace(/\(?週四\)?|\(?星期四\)?/g, '(Thu)')
    .replace(/\(?週五\)?|\(?星期五\)?/g, '(Fri)')
    .replace(/\(?週六\)?|\(?星期六\)?/g, '(Sat)')
    .replace(/\(?週日\)?|\(?星期日\)?|\(?主日\)?/g, '(Sun)');
}

const COMMON_AUTHOR_MAP: Record<string, string> = {
  '教會同工會': 'Church Board',
  '教育部同工': 'Education Team',
  '關懷同工小組': 'Care Team',
  '關懷同工': 'Care Ministry',
  '教務同工': 'Pastoral Staff',
  '宣教外展組': 'Outreach Team',
  '長執同工會': 'Board of Elders & Deacons',
  '青年團契同工': 'Youth Leaders',
  '主日學同工': 'Sunday School Staff',
  '無名氏弟兄/姊妹': 'Anonymous',
};

export function translateAuthorToEn(author: string): string {
  if (!author) return 'Church Family';
  if (COMMON_AUTHOR_MAP[author]) return COMMON_AUTHOR_MAP[author];
  return author;
}

export function translatePrayerTitleToEn(title: string): string {
  if (!title) return '';
  if (title.includes('冷氣') || title.includes('招牌')) {
    return 'Prayer for Sanctuary A/C Installation & Signboard Project';
  }
  if (title.includes('青年') || title.includes('主日學')) {
    return 'Prayer for Youth Ministry & Sunday School Teachers';
  }
  if (title.includes('長老執事') || title.includes('身體健康')) {
    return 'Prayer for Elders, Deacons & Congregational Health';
  }
  if (title.includes('Zoom') || title.includes('禱告會')) {
    return 'Prayer for Thursday 8:00 PM Online Zoom Prayer Meeting';
  }
  if (title.includes('細胞小組') || title.includes('健行')) {
    return 'Prayer for Bi-weekly Cell Groups & Hiking Outreach';
  }
  return title;
}

export function translatePrayerContentToEn(content: string): string {
  if (!content) return '';
  if (content.includes('冷氣') || content.includes('招牌')) {
    return 'Thank God for His grace! Sanctuary A/C installation is smoothly completed. Exterior wall and main signboard design are underway. Pray for wisdom and safety for all designers and contractors.';
  }
  if (content.includes('青年') || content.includes('主日學')) {
    return 'May the Holy Spirit work mightily to bring more young adults and youth to root deeply in biblical truth and fellowship; and grant wisdom and love to Sunday School teachers in preparing lessons.';
  }
  if (content.includes('萬四長老') || content.includes('張文辛長老') || content.includes('馬新民執事') || content.includes('身體欠安')) {
    return 'Please pray for Elder Wan, Elder Chang, Deacon Ma, and all elderly or ailing members. May the Lord grant divine healing, extraordinary peace, strength, and joy.';
  }
  if (content.includes('Zoom') || content.includes('310-626-6103') || content.includes('週四線上禱告會')) {
    return 'Inviting all brothers and sisters to join our Thursday online prayer meeting (Zoom ID: 310-626-6103 / Passcode: 25226) to intercede for church ministries, families, and kingdom missions.';
  }
  if (content.includes('細胞小組') || content.includes('健行')) {
    return "Pray for our Saturday afternoon Cell Groups and South Bay trail hiking gatherings, reaching seekers and families with God's love and caring fellowship in nature.";
  }
  return content;
}

