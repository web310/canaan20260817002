export interface ComputedChurchEvent {
  id: string;
  category: 'worship' | 'prayer' | 'fellowship' | 'education';
  title: string;
  titleZh: string;
  date: string; // YYYY-MM-DD
  dateFormattedZh: string; // e.g. "8月23日 (週日)"
  dateFormattedEn: string; // e.g. "Sun, Aug 23"
  time: string;
  timeZh: string;
  location: string;
  locationZh: string;
  description: string;
  descriptionZh: string;
  recurrenceRuleZh: string;
  recurrenceRuleEn: string;
  ordinalTextZh?: string;
  ordinalTextEn?: string;
  zoomId?: string;
  zoomPasscode?: string;
  isToday?: boolean;
  daysUntil: number;
}

/**
 * Returns formatted date strings
 */
function formatDate(d: Date, lang: 'zh' | 'en'): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDaysZh = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (lang === 'zh') {
    return `${month}月${day}日 (${weekDaysZh[d.getDay()]})`;
  }
  return `${weekDaysEn[d.getDay()]}, ${monthsEn[d.getMonth()]} ${day}`;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDaysUntil(target: Date, now: Date): number {
  const oneDay = 1000 * 60 * 60 * 24;
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((targetMidnight - nowMidnight) / oneDay);
}

/**
 * 1. 禮拜聖會 (Sunday Worship Service): 每個禮拜的星期日 11:00 AM
 * If current time is past Sunday 12:30 PM, automatically advance to next Sunday.
 */
export function getNextSundayService(now: Date = new Date()): ComputedChurchEvent {
  const target = new Date(now);
  const dayOfWeek = target.getDay(); // 0 is Sunday
  
  if (dayOfWeek === 0) {
    // Today is Sunday. Check if past 12:30 PM (12 hours, 30 mins)
    const passedToday = target.getHours() > 12 || (target.getHours() === 12 && target.getMinutes() >= 30);
    if (passedToday) {
      target.setDate(target.getDate() + 7);
    }
  } else {
    // Days until next Sunday
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    target.setDate(target.getDate() + daysUntilSunday);
  }
  
  target.setHours(11, 0, 0, 0);
  const daysUntil = getDaysUntil(target, now);

  return {
    id: `worship-${toISODate(target)}`,
    category: 'worship',
    title: 'Sunday Worship Service',
    titleZh: '禮拜聖會 (主日崇拜)',
    date: toISODate(target),
    dateFormattedZh: formatDate(target, 'zh'),
    dateFormattedEn: formatDate(target, 'en'),
    time: '11:00 AM - 12:30 PM',
    timeZh: '星期日 上午 11:00 - 12:30',
    location: 'Main Worship Hall / Online Live Stream',
    locationZh: '主堂禮拜堂 (25226 S. Western Ave, Harbor City, CA 90710) / 線上禮拜',
    description: 'Weekly Sunday worship service with hymns, scripture reading, sermon, and fellowship lunch following service at 12:30 PM.',
    descriptionZh: '每週日早晨心靈敬拜、聖詩讚美、牧長證道與神的話語。崇拜後 12:30 備有聖徒交通會餐 (愛宴)。',
    recurrenceRuleZh: '每個禮拜的星期日 上午 11:00',
    recurrenceRuleEn: 'Every Sunday at 11:00 AM',
    isToday: daysUntil === 0,
    daysUntil
  };
}

/**
 * 2. 線上禱告會 (Online Zoom Prayer Meeting): 每個禮拜四 8:00 PM
 * If current time is past Thursday 9:15 PM, automatically advance to next Thursday.
 */
export function getNextThursdayPrayer(now: Date = new Date()): ComputedChurchEvent {
  const target = new Date(now);
  const dayOfWeek = target.getDay(); // 4 is Thursday
  
  if (dayOfWeek === 4) {
    // Today is Thursday. Check if past 9:15 PM (21 hours, 15 mins)
    const passedToday = target.getHours() > 21 || (target.getHours() === 21 && target.getMinutes() >= 15);
    if (passedToday) {
      target.setDate(target.getDate() + 7);
    }
  } else {
    // Days until next Thursday
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
    target.setDate(target.getDate() + daysUntilThursday);
  }
  
  target.setHours(20, 0, 0, 0);
  const daysUntil = getDaysUntil(target, now);

  return {
    id: `prayer-${toISODate(target)}`,
    category: 'prayer',
    title: 'Thursday Night Zoom Prayer Meeting',
    titleZh: '週四線上守望禱告會',
    date: toISODate(target),
    dateFormattedZh: formatDate(target, 'zh'),
    dateFormattedEn: formatDate(target, 'en'),
    time: '8:00 PM - 9:15 PM',
    timeZh: '星期四 晚上 8:00 - 9:15',
    location: 'Zoom ID: 310-626-6103 (Passcode: 25226)',
    locationZh: 'Zoom 線上會議 (ID: 310-626-6103, 密碼: 25226)',
    description: 'Weekly church-wide Zoom prayer meeting interceding for church ministry, members\' health, mission outreach, and personal needs.',
    descriptionZh: '每週四晚上透過 Zoom 線上連線，同心為教會聖工、冷氣空調修繕、青年事工、肢體健康與福音外展同心守望禱告。',
    recurrenceRuleZh: '每個禮拜四 晚上 8:00',
    recurrenceRuleEn: 'Every Thursday at 8:00 PM',
    zoomId: '3106266103',
    zoomPasscode: '25226',
    isToday: daysUntil === 0,
    daysUntil
  };
}

/**
 * Returns all Saturdays in a given month of a given year
 */
function getSaturdaysInMonth(year: number, month: number): Date[] {
  const saturdays: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 6) {
      saturdays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return saturdays;
}

/**
 * 3. 細胞小組 (Cell Group Fellowship): 每個月的第一和第三個星期六 2:00 PM
 * If current time is past the meeting time (Saturday 4:00 PM), automatically advance to the next 1st or 3rd Saturday!
 */
export function getNextCellGroupSaturday(now: Date = new Date()): ComputedChurchEvent & { ordinalTextZh: string; ordinalTextEn: string } {
  let year = now.getFullYear();
  let month = now.getMonth();
  
  // Check this month's 1st and 3rd Saturdays
  const checkMonth = (y: number, m: number) => {
    const saturdays = getSaturdaysInMonth(y, m);
    const firstSat = saturdays[0]; // 1st Saturday
    const thirdSat = saturdays[2]; // 3rd Saturday
    
    // Set meeting end time to 4:00 PM (16:00)
    if (firstSat) {
      firstSat.setHours(14, 0, 0, 0);
      const firstSatEnd = new Date(firstSat);
      firstSatEnd.setHours(16, 0, 0, 0);
      if (now <= firstSatEnd) {
        return { target: firstSat, ordinalZh: '本月第 1 個星期六', ordinalEn: '1st Saturday of the Month' };
      }
    }

    if (thirdSat) {
      thirdSat.setHours(14, 0, 0, 0);
      const thirdSatEnd = new Date(thirdSat);
      thirdSatEnd.setHours(16, 0, 0, 0);
      if (now <= thirdSatEnd) {
        return { target: thirdSat, ordinalZh: '本月第 3 個星期六', ordinalEn: '3rd Saturday of the Month' };
      }
    }

    return null;
  };

  let result = checkMonth(year, month);
  if (!result) {
    // Passed 3rd Saturday of this month, advance to next month's 1st Saturday
    const nextMonthDate = new Date(year, month + 1, 1);
    const nextMonthSats = getSaturdaysInMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth());
    const nextFirstSat = nextMonthSats[0];
    nextFirstSat.setHours(14, 0, 0, 0);
    result = {
      target: nextFirstSat,
      ordinalZh: `${nextMonthDate.getMonth() + 1}月第 1 個星期六`,
      ordinalEn: `1st Saturday of ${nextMonthDate.toLocaleString('en', { month: 'short' })}`
    };
  }

  const { target, ordinalZh, ordinalEn } = result;
  const daysUntil = getDaysUntil(target, now);

  return {
    id: `cell-${toISODate(target)}`,
    category: 'fellowship',
    title: 'Cell Group Fellowship',
    titleZh: '細胞小組團契',
    date: toISODate(target),
    dateFormattedZh: formatDate(target, 'zh'),
    dateFormattedEn: formatDate(target, 'en'),
    time: '2:00 PM - 4:00 PM',
    timeZh: '星期六 下午 2:00 - 4:00',
    location: 'Church Fellowship Hall / Member Homes',
    locationZh: '教會副堂 / 弟兄姊妹家中',
    description: 'Bi-monthly cell group fellowship featuring Bible discussion, life sharing, mutual caring, and warm fellowship.',
    descriptionZh: '每個月第 1 與第 3 個星期六舉行，深入查考聖經、分享生活點滴、彼此代禱扶持，建立緊密的屬靈家庭。',
    recurrenceRuleZh: '每個月的第一和第三個星期六 下午 2:00',
    recurrenceRuleEn: '1st & 3rd Saturday of every month at 2:00 PM',
    ordinalTextZh: ordinalZh,
    ordinalTextEn: ordinalEn,
    isToday: daysUntil === 0,
    daysUntil
  };
}

/**
 * 0. 禮拜前主日學 (Sunday School before Worship): 每個禮拜的星期日 上午 10:00 - 10:50 AM
 * If current time is past Sunday 10:50 AM, automatically advance to next Sunday.
 */
export function getNextSundaySchool(now: Date = new Date()): ComputedChurchEvent {
  const target = new Date(now);
  const dayOfWeek = target.getDay(); // 0 is Sunday
  
  if (dayOfWeek === 0) {
    // Today is Sunday. Check if past 10:50 AM (10 hours, 50 mins)
    const passedToday = target.getHours() > 10 || (target.getHours() === 10 && target.getMinutes() >= 50);
    if (passedToday) {
      target.setDate(target.getDate() + 7);
    }
  } else {
    // Days until next Sunday
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    target.setDate(target.getDate() + daysUntilSunday);
  }
  
  target.setHours(10, 0, 0, 0);
  const daysUntil = getDaysUntil(target, now);

  return {
    id: `school-${toISODate(target)}`,
    category: 'education',
    title: 'Sunday School (Adults & Children)',
    titleZh: '禮拜前主日學 (成人與兒童)',
    date: toISODate(target),
    dateFormattedZh: formatDate(target, 'zh'),
    dateFormattedEn: formatDate(target, 'en'),
    time: '10:00 AM - 10:50 AM',
    timeZh: '星期日 上午 10:00 - 10:50',
    location: 'Main Sanctuary & Classrooms',
    locationZh: '主堂與主日學教室 (25226 S. Western Ave, Harbor City, CA 90710)',
    description: 'Pre-service in-depth Bible study, doctrine foundation, and faith cultivation classes designed for adults and children.',
    descriptionZh: '禮拜聖會前的聖經真理教導、信仰根基紮根與靈命培育，分設成人主日學與兒童班級，歡迎同心研讀神的話語。',
    recurrenceRuleZh: '每個星期日的上午 10:00',
    recurrenceRuleEn: 'Every Sunday at 10:00 AM',
    isToday: daysUntil === 0,
    daysUntil
  };
}

/**
 * Returns all 4 dynamic church upcoming events in correct chronological order
 */
export function getUpcomingChurchEvents(now: Date = new Date()): ComputedChurchEvent[] {
  const sundaySchool = getNextSundaySchool(now);
  const sunday = getNextSundayService(now);
  const prayer = getNextThursdayPrayer(now);
  const cell = getNextCellGroupSaturday(now);

  const list: ComputedChurchEvent[] = [sundaySchool, sunday, prayer, cell];
  return list.sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time.includes('10:00') ? '10:00:00' : a.time.includes('11:00') ? '11:00:00' : a.time.includes('2:00') ? '14:00:00' : '20:00:00'}`).getTime();
    const timeB = new Date(`${b.date}T${b.time.includes('10:00') ? '10:00:00' : b.time.includes('11:00') ? '11:00:00' : b.time.includes('2:00') ? '14:00:00' : '20:00:00'}`).getTime();
    return timeA - timeB;
  });
}
