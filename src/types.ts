export type Language = 'en' | 'zh';

export interface Sermon {
  id: string;
  title: string;
  titleZh: string;
  speaker: string;
  speakerZh: string;
  date: string;
  scripture: string;
  scriptureZh: string;
  series: string;
  seriesZh: string;
  audioUrl?: string;
  videoUrl?: string;
  videoPasscode?: string;
  showVideo?: boolean; // 管理員設定：是否讓使用者看到「觀看影音」選項（預設為 true）
  showAudio?: boolean; // 管理員設定：是否讓使用者看到「收聽音訊」選項（預設為 true）
  summary: string;
  summaryZh: string;
  points: string[];
  pointsZh: string[];
}

export interface Ministry {
  id: string;
  name: string;
  nameZh: string;
  leader: string;
  leaderZh: string;
  description: string;
  descriptionZh: string;
  meetingTime: string;
  meetingTimeZh: string;
  location: string;
  locationZh: string;
  iconName: string;
  tags: string[];
}

export type EventCategory = 'worship' | 'prayer' | 'fellowship' | 'education' | 'devotion' | 'special';

export interface ChurchEvent {
  id: string;
  category: EventCategory;
  title: string;
  titleZh: string;
  date?: string; // YYYY-MM-DD
  time: string;
  timeZh: string;
  location: string;
  locationZh: string;
  description: string;
  descriptionZh: string;
  recurrenceRuleZh: string;
  recurrenceRuleEn: string;
  recurrenceType?: 'weekly' | 'biweekly_month' | 'specific_date' | 'custom';
  dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat
  zoomId?: string;
  zoomPasscode?: string;
  isCustom?: boolean;
  order?: number;
  // Computed display fields
  dateFormattedZh?: string;
  dateFormattedEn?: string;
  ordinalTextZh?: string;
  ordinalTextEn?: string;
  isToday?: boolean;
  daysUntil?: number;
}

export interface PrayerRequest {
  id: string;
  author: string;
  authorZh?: string;
  authorEn?: string;
  category: 'health' | 'family' | 'faith' | 'thanksgiving' | 'general';
  title: string;
  titleZh?: string;
  titleEn?: string;
  content: string;
  contentZh?: string;
  contentEn?: string;
  date: string;
  isConfidential: boolean;
  prayedCount: number;
}

export interface StatementOfFaith {
  title: string;
  titleZh: string;
  content: string;
  contentZh: string;
  verses: string[];
}

export interface GalleryCategory {
  key: string;
  labelZh: string;
  labelEn: string;
  icon: string;
  descriptionZh?: string;
  descriptionEn?: string;
  isSystem?: boolean;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  titleZh: string;
  category: string;
  date: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  description: string;
  descriptionZh: string;
  albumName?: string;
  albumNameZh?: string;
  location?: string;
  locationZh?: string;
  source?: string;
  account?: string;
  syncedAt?: string;
}

export interface GoogleAlbum {
  id: string;
  date: string;
  titleZh: string;
  titleEn: string;
  albumUrl: string;
  coverImageUrl?: string;
  descriptionZh?: string;
  descriptionEn?: string;
  category?: string;
  photoCount?: number;
}

export interface PendingPrayerSubmission {
  id: string;
  author: string;
  authorEmail?: string;
  authorPhone?: string;
  category: 'health' | 'family' | 'faith' | 'thanksgiving' | 'general';
  title: string;
  content: string;
  submittedAt: string;
  isConfidential: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'pastoral_handled';
  adminNotes?: string;
}


