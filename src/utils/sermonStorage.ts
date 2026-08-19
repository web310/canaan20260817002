import { Sermon } from '../types';
import { SERMON_CONTENT_LIST, SERMONS_DATA_VERSION } from '../data/sermonsData';

export { SERMON_CONTENT_LIST, SERMONS_DATA_VERSION };

/**
 * Authoritative sermon loader.
 * Always returns the static SERMON_CONTENT_LIST directly with zero LocalStorage or IndexedDB caching,
 * ensuring 100% data consistency across Cloudflare Pages, GitHub, and preview.
 */
export function getAuthoritativeSermons(): Sermon[] {
  return [...SERMON_CONTENT_LIST];
}

export function loadAndSyncSermons(): Sermon[] {
  return [...SERMON_CONTENT_LIST];
}

export function resetSermonsToDeployedMaster(): Sermon[] {
  return [...SERMON_CONTENT_LIST];
}
