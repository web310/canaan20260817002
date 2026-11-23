import { Sermon } from '../types';
import * as SermonsData from '../data/sermonsData';

/**
 * Strict Church Policy:
 * 主日講道永遠保留最後時間（最新日期由新至舊排序）的 9 個，嚴格排重（同一主日僅一筆，依最新日期保留）。
 */
export const MAX_SERMONS = 9;

export const INITIAL_SERMONS: Sermon[] = 
  (SermonsData as any).SERMON_CONTENT_LIST || 
  (SermonsData as any).INITIAL_SERMONS || 
  (SermonsData as any).RECENT_SERMONS || 
  [];

export const SERMON_CONTENT_LIST: Sermon[] = INITIAL_SERMONS;

export const SERMONS_DATA_VERSION: string = 
  (SermonsData as any).SERMONS_DATA_VERSION || 
  `v-${INITIAL_SERMONS.length}-${INITIAL_SERMONS[0]?.date || 'master'}`;

/**
 * Enforces strict sorting descending by date, deduplication by date/id,
 * and limits strictly to the 9 most recent sermons.
 */
export function sanitizeAndLimitSermons(sermons: Sermon[]): Sermon[] {
  if (!Array.isArray(sermons)) return [];

  // 1. Filter valid entries and sort descending by date (latest first)
  const valid = sermons.filter(s => s && typeof s === 'object');
  const sorted = [...valid].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // 2. Strict deduplication by date, then ID
  const seenDates = new Set<string>();
  const seenIds = new Set<string>();
  const deduped: Sermon[] = [];

  for (const s of sorted) {
    const dateKey = s.date?.trim();
    const idKey = s.id?.trim();
    if (dateKey && seenDates.has(dateKey)) continue;
    if (idKey && seenIds.has(idKey)) continue;
    if (dateKey) seenDates.add(dateKey);
    if (idKey) seenIds.add(idKey);
    deduped.push(s);
    if (deduped.length >= MAX_SERMONS) break;
  }

  return deduped;
}

/**
 * Generate a deterministic fingerprint of the compiled master sermons.
 * Any change in titles, dates, speakers, scriptures, passcodes, video/audio visibility or count in code triggers an immediate refresh.
 */
export function getMasterDataFingerprint(): string {
  try {
    return `${SERMONS_DATA_VERSION}::` + INITIAL_SERMONS.map(s => 
      `${s.id}:${s.date}:${s.titleZh}:${s.speakerZh}:${s.videoUrl || ''}:${s.videoPasscode || ''}:${s.showVideo !== false}:${s.showAudio !== false}`
    ).join('|');
  } catch {
    return `${SERMONS_DATA_VERSION}::${INITIAL_SERMONS.length}`;
  }
}

export const USER_CUSTOM_SERMONS_KEY = 'canaan_user_custom_sermons';
export const DELETED_SERMONS_KEY = 'canaan_deleted_sermon_keys';

function getDeletedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_SERMONS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.filter(Boolean));
    }
  } catch {}
  return new Set();
}

export function getCustomSermonsBackup(): Sermon[] {
  try {
    const raw = localStorage.getItem(USER_CUSTOM_SERMONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(s => s && typeof s === 'object' && s.date);
    }
  } catch {}
  return [];
}

export function saveCustomSermonToBackup(sermon: Sermon): void {
  if (!sermon || !sermon.date) return;
  try {
    const existing = getCustomSermonsBackup().filter(
      s => s.id !== sermon.id && s.date !== sermon.date
    );
    const updated = sanitizeAndLimitSermons([sermon, ...existing]);
    localStorage.setItem(USER_CUSTOM_SERMONS_KEY, JSON.stringify(updated));

    // Remove from deleted set if re-uploaded/re-saved
    const deleted = getDeletedKeys();
    if (sermon.id) deleted.delete(sermon.id);
    if (sermon.date) deleted.delete(sermon.date);
    localStorage.setItem(DELETED_SERMONS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

export function markSermonDeletedInBackup(sermonId: string, sermonDate?: string): void {
  try {
    const remaining = getCustomSermonsBackup().filter(
      s => s.id !== sermonId && (!sermonDate || s.date !== sermonDate)
    );
    localStorage.setItem(USER_CUSTOM_SERMONS_KEY, JSON.stringify(remaining));

    const deleted = getDeletedKeys();
    if (sermonId) deleted.add(sermonId);
    if (sermonDate) deleted.add(sermonDate);
    localStorage.setItem(DELETED_SERMONS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

/**
 * If the user uploaded/published a newer Sunday bulletin (stored in canaan_bulletin_data),
 * reconstruct its Sermon record so it is never lost when sermon cache refreshes.
 */
export function recoverSermonFromSavedBulletin(): Sermon | null {
  try {
    const raw = localStorage.getItem('canaan_bulletin_data');
    if (!raw) return null;
    const b = JSON.parse(raw);
    if (!b || !b.serviceDate || !b.sermonTitle) return null;
    const dateStr = String(b.serviceDate).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;

    const deleted = getDeletedKeys();
    const id = `sermon-${dateStr.replace(/-/g, '')}`;
    if (deleted.has(id) || deleted.has(dateStr)) return null;

    const latestMasterDate = INITIAL_SERMONS[0]?.date || '';
    const existsInMaster = INITIAL_SERMONS.some(m => m.date === dateStr);
    // Only synthesize if it is newer than master or not in master
    if (existsInMaster || (latestMasterDate && dateStr < latestMasterDate)) {
      return null;
    }

    return {
      id,
      title: b.sermonTitleEn || b.sermonTitle,
      titleZh: b.sermonTitle,
      speaker: b.speakerEn || b.speaker || 'Speaker',
      speakerZh: b.speaker || '講員',
      date: dateStr,
      scripture: b.sermonScriptureEn || b.sermonScripture || '',
      scriptureZh: b.sermonScripture || '',
      series: 'Sunday Message',
      seriesZh: '主日證道',
      summary:
        b.sermonSummaryEn ||
        `Sunday sermon delivered at Canaan Shin Sheng Christian Church on ${dateStr}.`,
      summaryZh:
        b.sermonSummary ||
        `加南新生基督教會主日崇拜，${b.speaker || '講員'}證道傳講《${b.sermonTitle}》，經文取自「${b.sermonScripture || ''}」。`,
      points: Array.isArray(b.sermonPoints) ? b.sermonPoints : [],
      pointsZh: Array.isArray(b.sermonPointsZh) ? b.sermonPointsZh : [],
      videoUrl: b.videoUrl || '',
      videoPasscode: b.zoomPasscode || '25226',
      showVideo: Boolean(b.videoUrl),
      showAudio: false
    };
  } catch {
    return null;
  }
}

/**
 * Authoritative sermon loader.
 * Validates cache against compiled master version and fingerprint, while ALWAYS preserving
 * any newer user-uploaded/custom sermons from localStorage or saved bulletin data.
 */
export function loadAndSyncSermons(): Sermon[] {
  try {
    const currentFingerprint = getMasterDataFingerprint();
    const cachedFingerprint = localStorage.getItem('canaan_sermons_master_fingerprint');
    const cachedVersion = localStorage.getItem('canaan_sermons_data_version');
    const saved = localStorage.getItem('canaan_sermons_data');
    const deleted = getDeletedKeys();
    const customBackup = getCustomSermonsBackup();
    const bulletinRecovered = recoverSermonFromSavedBulletin();
    const latestMasterDate = INITIAL_SERMONS[0]?.date || '';

    let parsedSaved: Sermon[] = [];
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) parsedSaved = p;
      } catch {}
    }

    const newerFromSaved = parsedSaved.filter(
      s =>
        s &&
        s.date &&
        latestMasterDate &&
        s.date > latestMasterDate &&
        !deleted.has(s.id) &&
        !deleted.has(s.date)
    );

    const extraUserSermons: Sermon[] = [
      ...customBackup,
      ...newerFromSaved,
      ...(bulletinRecovered ? [bulletinRecovered] : [])
    ];

    if (!saved || cachedFingerprint !== currentFingerprint || cachedVersion !== SERMONS_DATA_VERSION) {
      const merged = sanitizeAndLimitSermons([
        ...extraUserSermons,
        ...INITIAL_SERMONS.filter(m => !deleted.has(m.id) && !deleted.has(m.date))
      ]);
      try {
        localStorage.setItem('canaan_sermons_data', JSON.stringify(merged));
        localStorage.setItem('canaan_sermons_master_fingerprint', currentFingerprint);
        localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
      } catch {}
      return merged;
    }

    if (parsedSaved.length > 0 || extraUserSermons.length > 0) {
      const reconciled = [...extraUserSermons, ...parsedSaved].map(s => {
        const master = INITIAL_SERMONS.find(m => m.id === s.id || m.date === s.date);
        if (master) {
          return {
            ...s,
            showVideo: master.showVideo === false ? false : s.showVideo,
            showAudio: master.showAudio === false ? false : s.showAudio
          };
        }
        return s;
      });
      return sanitizeAndLimitSermons(
        reconciled.filter(s => !deleted.has(s.id) && !deleted.has(s.date))
      );
    }
  } catch (e) {
    // ignore
  }
  return sanitizeAndLimitSermons(INITIAL_SERMONS);
}

/**
 * Force reset cache to the latest deployed INITIAL_SERMONS version.
 */
export function resetSermonsToDeployedMaster(): Sermon[] {
  const list = sanitizeAndLimitSermons(INITIAL_SERMONS);
  try {
    localStorage.removeItem(USER_CUSTOM_SERMONS_KEY);
    localStorage.removeItem(DELETED_SERMONS_KEY);
    localStorage.setItem('canaan_sermons_data', JSON.stringify(list));
    localStorage.setItem('canaan_sermons_master_fingerprint', getMasterDataFingerprint());
    localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
  } catch {}
  return list;
}


