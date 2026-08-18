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

export interface ChurchEvent {
  id: string;
  title: string;
  titleZh: string;
  date: string;
  time: string;
  timeZh: string;
  location: string;
  locationZh: string;
  description: string;
  descriptionZh: string;
  category: 'worship' | 'prayer' | 'fellowship' | 'special';
  zoomId?: string;
}

export interface PrayerRequest {
  id: string;
  author: string;
  category: 'health' | 'family' | 'faith' | 'thanksgiving' | 'general';
  title: string;
  content: string;
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


