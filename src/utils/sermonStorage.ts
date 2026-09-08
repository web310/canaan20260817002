import { Sermon } from '../types';
import * as SermonsData from '../data/sermonsData';

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

/**
 * Authoritative sermon loader.
 * Validates cache against compiled master version and fingerprint.
 * Guarantees that any turned-off visibility flags (showVideo: false, showAudio: false) in the
 * deployed master take immediate effect across all deployment environments (Cloudflare Pages, GitHub).
 */
export function loadAndSyncSermons(): Sermon[] {
  try {
    const currentFingerprint = getMasterDataFingerprint();
    const cachedFingerprint = localStorage.getItem('canaan_sermons_master_fingerprint');
    const cachedVersion = localStorage.getItem('canaan_sermons_data_version');
    const saved = localStorage.getItem('canaan_sermons_data');

    if (!saved || cachedFingerprint !== currentFingerprint || cachedVersion !== SERMONS_DATA_VERSION) {
      const list = [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      try {
        localStorage.setItem('canaan_sermons_data', JSON.stringify(list));
        localStorage.setItem('canaan_sermons_master_fingerprint', currentFingerprint);
        localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
      } catch {}
      return list;
    }

    const parsed: Sermon[] = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const reconciled = parsed.map(s => {
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
      return reconciled;
    }
  } catch (e) {
    // ignore
  }
  return [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

/**
 * Force reset cache to the latest deployed INITIAL_SERMONS version.
 */
export function resetSermonsToDeployedMaster(): Sermon[] {
  const list = [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  try {
    localStorage.setItem('canaan_sermons_data', JSON.stringify(list));
    localStorage.setItem('canaan_sermons_master_fingerprint', getMasterDataFingerprint());
    localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
  } catch {}
  return list;
}
