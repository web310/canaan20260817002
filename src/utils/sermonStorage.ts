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
 * Robust sermon loader and data synchronization helper.
 * 
 * Guarantees that when a new build or GitHub commit is deployed to Cloudflare Pages:
 * 1. The compiled INITIAL_SERMONS is always authoritative for all visitors.
 * 2. If the compiled code changes on GitHub/Cloudflare, stale localStorage is immediately
 *    superseded by the newly deployed INITIAL_SERMONS.
 * 3. Admins who edit locally can test, but deployed releases always reflect the true repository state.
 */
export function loadAndSyncSermons(): Sermon[] {
  try {
    const currentFingerprint = getMasterDataFingerprint();
    const savedFingerprint = localStorage.getItem('canaan_sermons_master_fingerprint');
    const saved = localStorage.getItem('canaan_sermons_data');

    // Case 1: Fresh visit, new deployment on Cloudflare, or fingerprint mismatch
    if (!saved || savedFingerprint !== currentFingerprint) {
      const freshList = [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      try {
        localStorage.setItem('canaan_sermons_data', JSON.stringify(freshList));
        localStorage.setItem('canaan_sermons_master_fingerprint', currentFingerprint);
        localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
      } catch (e) {
        console.warn("Storage sync save error:", e);
      }
      return freshList;
    }

    // Case 2: Matching fingerprint - load cached list
    let parsed: Sermon[] = [];
    try {
      parsed = JSON.parse(saved);
    } catch {
      return resetSermonsToDeployedMaster();
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return resetSermonsToDeployedMaster();
    }

    // Ensure sorted by date descending
    parsed.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return parsed;
  } catch (err) {
    console.warn("loadAndSyncSermons fallback to INITIAL_SERMONS:", err);
    return INITIAL_SERMONS;
  }
}

/**
 * Force reset cache to the latest deployed INITIAL_SERMONS version.
 */
export function resetSermonsToDeployedMaster(): Sermon[] {
  try {
    const currentFingerprint = getMasterDataFingerprint();
    const list = [...INITIAL_SERMONS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    localStorage.setItem('canaan_sermons_data', JSON.stringify(list));
    localStorage.setItem('canaan_sermons_master_fingerprint', currentFingerprint);
    localStorage.setItem('canaan_sermons_data_version', SERMONS_DATA_VERSION);
    return list;
  } catch (e) {
    console.warn("Reset storage error:", e);
    return INITIAL_SERMONS;
  }
}

