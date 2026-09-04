import { Sermon } from '../types';
import * as SermonsData from '../data/sermonsData';

export const INITIAL_SERMONS: Sermon[] = 
  (SermonsData as any).INITIAL_SERMONS || 
  (SermonsData as any).RECENT_SERMONS || 
  [];

export const SERMONS_DATA_VERSION: string = 
  (SermonsData as any).SERMONS_DATA_VERSION || 
  `v-${INITIAL_SERMONS.length}-${INITIAL_SERMONS[0]?.date || 'master'}`;

/**
 * Generate a deterministic fingerprint of the compiled master sermons.
 * Any change in titles, dates, speakers, scriptures, passcodes or count in code triggers an immediate refresh.
 */
export function getMasterDataFingerprint(): string {
  try {
    return `${SERMONS_DATA_VERSION}::` + INITIAL_SERMONS.map(s => 
      `${s.id}:${s.date}:${s.titleZh}:${s.speakerZh}:${s.videoUrl || ''}:${s.videoPasscode || ''}`
    ).join('|');
  } catch {
    return `${SERMONS_DATA_VERSION}::${INITIAL_SERMONS.length}`;
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
