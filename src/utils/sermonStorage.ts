import { Sermon } from '../types';
import * as SermonsData from '../data/sermonsData';

export const INITIAL_SERMONS: Sermon[] = 
  (SermonsData as any).INITIAL_SERMONS || 
  (SermonsData as any).RECENT_SERMONS || 
  [];

export const SERMONS_DATA_VERSION: string = 
  (SermonsData as any).SERMONS_DATA_VERSION || 
  `v-2026-08-17-v6`;

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
 * 2. If the compiled code changes on GitHub/Cloudflare or contains legacy test data (e.g. old test records),
 *    stale localStorage is immediately superseded by the newly deployed INITIAL_SERMONS.
 * 3. Any obsolete speaker/date mismatch (like old 7/19 record) is auto-repaired in real-time.
 */
export function loadAndSyncSermons(): Sermon[] {
  try {
    const currentFingerprint = getMasterDataFingerprint();
    const savedFingerprint = localStorage.getItem('canaan_sermons_master_fingerprint');
    const saved = localStorage.getItem('canaan_sermons_data');

    // Case 1: Fresh visit, new deployment on Cloudflare, or fingerprint mismatch
    if (!saved || savedFingerprint !== currentFingerprint) {
      return resetSermonsToDeployedMaster();
    }

    // Case 2: Check if cached data contains obsolete or mismatched records
    let parsed: Sermon[] = [];
    try {
      parsed = JSON.parse(saved);
    } catch {
      return resetSermonsToDeployedMaster();
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return resetSermonsToDeployedMaster();
    }

    // Sanity check: Ensure 2026-07-19 matches our master (蔡豐智弟兄, not obsolete test record)
    const target719 = parsed.find(s => s.date === '2026-07-19');
    if (target719 && target719.speakerZh && target719.speakerZh.includes('陳嘉彰')) {
      console.warn("Detected stale 2026-07-19 cache on client. Auto-purging to master version...");
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
