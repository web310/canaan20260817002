import { PrayerRequest } from '../types';
import { INITIAL_PRAYERS } from '../data/churchData';

/**
 * Extracts a normalized grouping topic key for prayer deduplication.
 * Identical or similar prayers will share the same topic key.
 */
export function getPrayerTopicKey(p: PrayerRequest): string {
  const titleText = `${p.title || ''} ${p.titleZh || ''}`.toLowerCase();
  const contentText = `${p.content || ''} ${p.contentZh || ''}`.toLowerCase();
  const combined = `${titleText} ${contentText}`;

  // 1. Evangelist Tanni's Surgery (8/24)
  if (combined.includes('談妮') && (combined.includes('手術') || combined.includes('8/24') || combined.includes('休養') || combined.includes('無後顧之憂'))) {
    return 'topic_tanni_surgery';
  }

  // 2. Injured/Fall recovery (Lois, Tanni's mother & husband)
  if (combined.includes('跌倒') || (combined.includes('談妮') && (combined.includes('母親') || combined.includes('先生')))) {
    return 'topic_fall_recovery';
  }

  // 3. Lease transition & future venue
  if (combined.includes('租約') || combined.includes('c3') || combined.includes('9/6') || combined.includes('聚會場地與發展')) {
    return 'topic_lease_transition';
  }

  // 4. Youth / NextGen ministry
  if (combined.includes('青年') || combined.includes('年輕事工') || combined.includes('青年事工')) {
    return 'topic_youth_ministry';
  }

  // 5. Rev. Zhixia Wan preaching
  if (combined.includes('萬志俠') || combined.includes('萬牧師')) {
    return 'topic_rev_wan';
  }

  // 6. Thursday online Zoom prayer meeting
  if (combined.includes('zoom') || combined.includes('310-626-6103') || combined.includes('週四線上禱告會') || combined.includes('守望禱告會')) {
    return 'topic_thursday_prayer';
  }

  // 7. Sanctuary A/C and Signboard project
  if (combined.includes('冷氣') || combined.includes('招牌')) {
    return 'topic_ac_signboard';
  }

  // 8. Cell groups and hiking
  if (combined.includes('細胞小組') || combined.includes('健行')) {
    return 'topic_cell_group';
  }

  // Generic fallback: stripped title string
  const cleanTitle = (p.titleZh || p.title || '')
    .replace(/[為的對於在求主，。、！？（）()【】\s]/g, '')
    .slice(0, 15);

  return cleanTitle ? `title_${cleanTitle}` : `id_${p.id}`;
}

/**
 * Deduplicates prayers by grouping identical or similar items and keeping ONLY the one with the newest date.
 * If dates are identical, it prefers the official INITIAL_PRAYERS item or higher prayedCount.
 */
export function deduplicatePrayers(list: PrayerRequest[]): PrayerRequest[] {
  if (!Array.isArray(list) || list.length === 0) return [];

  const grouped = new Map<string, PrayerRequest>();

  for (const item of list) {
    if (!item) continue;
    const key = getPrayerTopicKey(item);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...item });
    } else {
      const dateExisting = existing.date || '1970-01-01';
      const dateItem = item.date || '1970-01-01';

      if (dateItem > dateExisting) {
        // Item is newer, replace existing while retaining max prayedCount
        grouped.set(key, {
          ...item,
          prayedCount: Math.max(item.prayedCount || 0, existing.prayedCount || 0)
        });
      } else if (dateItem === dateExisting) {
        // Equal date: check if item is from INITIAL_PRAYERS to preserve official copy
        const isItemInit = INITIAL_PRAYERS.some(init => init.id === item.id);
        if (isItemInit) {
          grouped.set(key, {
            ...item,
            prayedCount: Math.max(item.prayedCount || 0, existing.prayedCount || 0)
          });
        } else {
          existing.prayedCount = Math.max(existing.prayedCount || 0, item.prayedCount || 0);
        }
      } else {
        // Existing is newer, merge prayedCount
        existing.prayedCount = Math.max(existing.prayedCount || 0, item.prayedCount || 0);
      }
    }
  }

  // Sort descending by date (newest first)
  return Array.from(grouped.values()).sort((a, b) => {
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    return (b.prayedCount || 0) - (a.prayedCount || 0);
  });
}
