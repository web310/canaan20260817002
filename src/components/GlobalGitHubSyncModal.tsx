import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  Cloud, 
  Download, 
  Copy, 
  Check, 
  Upload, 
  FileCode, 
  Database, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Layers,
  HelpCircle,
  AlertCircle,
  FolderSync
} from 'lucide-react';
import { Language, Sermon, GalleryPhoto, GalleryCategory, GoogleAlbum } from '../types';
import { INITIAL_SERMONS } from '../data/sermonsData';
import { INITIAL_GALLERY_PHOTOS, GALLERY_CATEGORIES, INITIAL_GOOGLE_ALBUMS } from '../data/galleryData';
import { INITIAL_BULLETIN_DATA, BulletinData } from '../data/bulletinData';

interface GlobalGitHubSyncModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const GlobalGitHubSyncModal: React.FC<GlobalGitHubSyncModalProps> = ({
  lang,
  isOpen,
  onClose,
  onDataRestored
}) => {
  // State for GitHub Configuration
  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('canaan_github_pat') || 
           localStorage.getItem('canaan_github_sermons_pat') || '';
  });
  const [repoOwner, setRepoOwner] = useState<string>(() => {
    return localStorage.getItem('canaan_github_owner') || 
           localStorage.getItem('canaan_github_sermons_owner') || 'canaannewlife';
  });
  const [repoName, setRepoName] = useState<string>(() => {
    return localStorage.getItem('canaan_github_repo') || 
           localStorage.getItem('canaan_github_sermons_repo') || 'canaan-shin-sheng-church';
  });
  const [branchName, setBranchName] = useState<string>(() => {
    return localStorage.getItem('canaan_github_branch') || 
           localStorage.getItem('canaan_github_sermons_branch') || 'main';
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'sync' | 'download' | 'backup' | 'guide'>('sync');
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccessResult, setPushSuccessResult] = useState<{
    commitSha: string;
    commitUrl: string;
    filesUpdated: string[];
    syncedAt: string;
  } | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushStep, setPushStep] = useState<string>('');

  // Copy state
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // All Current Local / Memory Data Aggregation
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([]);
  const [allCategories, setAllCategories] = useState<GalleryCategory[]>([]);
  const [allAlbums, setAllAlbums] = useState<GoogleAlbum[]>([]);
  const [allBulletin, setAllBulletin] = useState<BulletinData>(INITIAL_BULLETIN_DATA);

  // Load fresh data whenever modal opens
  useEffect(() => {
    if (isOpen) {
      // 1. Sermons
      try {
        const savedSermons = localStorage.getItem('canaan_sermons_data');
        if (savedSermons) {
          const parsed = JSON.parse(savedSermons);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllSermons(parsed);
          } else {
            setAllSermons(INITIAL_SERMONS);
          }
        } else {
          setAllSermons(INITIAL_SERMONS);
        }
      } catch {
        setAllSermons(INITIAL_SERMONS);
      }

      // 2. Photos
      try {
        const savedPhotos = localStorage.getItem('canaan_gallery_photos_all') ||
                            localStorage.getItem('canaan_gallery_photos_custom');
        if (savedPhotos) {
          const parsed = JSON.parse(savedPhotos);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllPhotos(parsed);
          } else {
            setAllPhotos(INITIAL_GALLERY_PHOTOS);
          }
        } else {
          setAllPhotos(INITIAL_GALLERY_PHOTOS);
        }
      } catch {
        setAllPhotos(INITIAL_GALLERY_PHOTOS);
      }

      // 3. Categories
      try {
        const savedCats = localStorage.getItem('canaan_gallery_categories');
        if (savedCats) {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllCategories(parsed);
          } else {
            setAllCategories(GALLERY_CATEGORIES);
          }
        } else {
          setAllCategories(GALLERY_CATEGORIES);
        }
      } catch {
        setAllCategories(GALLERY_CATEGORIES);
      }

      // 4. Albums
      try {
        const savedAlbums = localStorage.getItem('canaan_google_albums');
        if (savedAlbums) {
          const parsed = JSON.parse(savedAlbums);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllAlbums(parsed);
          } else {
            setAllAlbums(INITIAL_GOOGLE_ALBUMS);
          }
        } else {
          setAllAlbums(INITIAL_GOOGLE_ALBUMS);
        }
      } catch {
        setAllAlbums(INITIAL_GOOGLE_ALBUMS);
      }

      // 5. Bulletin
      try {
        const savedBulletin = localStorage.getItem('canaan_bulletin_data');
        if (savedBulletin) {
          const parsed = JSON.parse(savedBulletin);
          setAllBulletin({ ...INITIAL_BULLETIN_DATA, ...parsed });
        } else {
          setAllBulletin(INITIAL_BULLETIN_DATA);
        }
      } catch {
        setAllBulletin(INITIAL_BULLETIN_DATA);
      }

      // Reset feedback
      setPushSuccessResult(null);
      setPushError(null);
    }
  }, [isOpen]);

  // Persist Token and Repo configuration
  const handleSaveConfig = () => {
    localStorage.setItem('canaan_github_pat', githubToken.trim());
    localStorage.setItem('canaan_github_owner', repoOwner.trim());
    localStorage.setItem('canaan_github_repo', repoName.trim());
    localStorage.setItem('canaan_github_branch', branchName.trim());
  };

  // Helper generators for files
  const generateSermonsTs = (): string => {
    const versionStr = `auto-${new Date().toISOString().slice(0, 10)}-${Date.now()}`;
    return `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Sermons: ${allSermons.length}
// ============================================================================

export const SERMONS_DATA_VERSION = "${versionStr}";

export const INITIAL_SERMONS: Sermon[] = ${JSON.stringify(allSermons, null, 2)};

export const RECENT_SERMONS: Sermon[] = INITIAL_SERMONS;
`;
  };

  const generateSermonStorageTs = (): string => {
    return `import { Sermon } from '../types';
import * as SermonsData from '../data/sermonsData';

export const INITIAL_SERMONS: Sermon[] = 
  (SermonsData as any).INITIAL_SERMONS || 
  (SermonsData as any).RECENT_SERMONS || 
  [];

export const SERMONS_DATA_VERSION: string = 
  (SermonsData as any).SERMONS_DATA_VERSION || 
  \`v-\${INITIAL_SERMONS.length}-\${INITIAL_SERMONS[0]?.date || 'master'}\`;

/**
 * Generate a deterministic fingerprint of the compiled master sermons.
 * Any change in titles, dates, speakers, scriptures, passcodes or count in code triggers an immediate refresh.
 */
export function getMasterDataFingerprint(): string {
  try {
    return \`\${SERMONS_DATA_VERSION}::\` + INITIAL_SERMONS.map(s => 
      \`\${s.id}:\${s.date}:\${s.titleZh}:\${s.speakerZh}:\${s.videoUrl || ''}:\${s.videoPasscode || ''}\`
    ).join('|');
  } catch {
    return \`\${SERMONS_DATA_VERSION}::\${INITIAL_SERMONS.length}\`;
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
`;
  };

  const generateGalleryTs = (): string => {
    return `import { GalleryPhoto, GalleryCategory, GoogleAlbum } from '../types';
import choirImg from '../assets/images/canaan_worship_choir_1786671374150.jpg';
import baptismImg from '../assets/images/canaan_baptism_service_1786671385015.jpg';
import retreatImg from '../assets/images/canaan_retreat_camp_1786671399070.jpg';
import christmasImg from '../assets/images/canaan_christmas_praise_1786671410013.jpg';
import feastImg from '../assets/images/canaan_love_feast_1786671419624.jpg';
import familyImg from '../assets/images/canaan_family_sunday_1786671430385.jpg';
import fellowshipImg from '../assets/images/canaan_fellowship_1786434097997.jpg';
import cellGroupImg from '../assets/images/chinese_fellowship_photo_1786495882516.jpg';
import churchHeroImg from '../assets/images/canaan_church_hero_1786434083190.jpg';
import outdoorImg from '../assets/images/chinese_church_hero_1786495867006.jpg';

export const GOOGLE_PHOTOS_HISTORICAL_ALBUM_URL = "https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7";
export const GOOGLE_SITES_GALLERY_URL = "https://sites.google.com/a/canaannewlife.org/cnl/%E7%85%A7%E7%89%87%E8%B5%B0%E5%BB%8A";
export const GOOGLE_PHOTOS_DEFAULT_URL = "https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7";

// Church Google Photos Albums with direct links and details
export const INITIAL_GOOGLE_ALBUMS: GoogleAlbum[] = ${JSON.stringify(allAlbums, null, 2)};

export const GALLERY_CATEGORIES: GalleryCategory[] = ${JSON.stringify(allCategories, null, 2)};

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = ${JSON.stringify(allPhotos, null, 2)};

export const isPhotoInCategory = (
  photo: GalleryPhoto,
  activeCategoryKey: string,
  categoriesList: GalleryCategory[] = []
): boolean => {
  if (!photo) return false;
  if (!activeCategoryKey || activeCategoryKey === 'all') return true;
  if (activeCategoryKey === 'google-photos') {
    return (
      photo.source === 'google-photos' ||
      photo.account === 'web@canaannewlife.org' ||
      (photo.id && photo.id.startsWith('gp-'))
    );
  }

  const pCat = (photo.category || '').trim().toLowerCase();
  const targetKey = activeCategoryKey.trim().toLowerCase();

  // 1. Direct match with target key
  if (pCat === targetKey) return true;

  // 2. Match target category label
  const targetCat = categoriesList.find(c => c.key.toLowerCase() === targetKey);
  if (targetCat) {
    if (photo.category === targetCat.labelZh || photo.category === targetCat.labelEn) return true;
    if (photo.albumNameZh === targetCat.labelZh || photo.albumName === targetCat.labelEn) return true;
  }

  // 3. Synonym dictionary matching for Canaan historical gallery categories
  const ALIAS_MAP: Record<string, string[]> = {
    groups: ['groups', 'group', 'fellowship', 'smallgroup', 'smallgroups', 'small-group', 'small-groups', '2023 小組聚會', '2023小組聚會', '小組聚會', '家庭小組', '小組', '團契'],
    children: ['children', 'child', 'kids', 'robotics', 'stem', '兒童機器人課程', '兒童機器人', '機器人', '兒童', '主日學'],
    christmas: ['christmas', 'xmas', '2016 耶誕節與愛宴', '2016 耶誕節', '2016耶誕節與愛宴', '耶誕節與愛宴', '耶誕節', '聖誕節', '愛宴'],
    retreat: ['retreat', 'retreats', 'camp', '2015 靈修會營會', '2015 靈修會', '2015靈修會營會', '靈修會營會', '靈修會', '營會'],
    outdoor: ['outdoor', 'outdoors', 'picnic', '2015 室外禮拜', '2015室外禮拜', '室外禮拜', '戶外禮拜', '戶外', '野餐'],
    lunar: ['lunar', 'newyear', 'cny', '2015 農曆新年', '2015農曆新年', '農曆新年', '春節', '新春', '過年'],
    heritage: ['heritage', 'anniversary', 'history', '2013 加盟台福一週年', '2013加盟台福一週年', '加盟台福一週年', '加盟台福', '台福', '歷史', '建堂'],
    worship: ['worship', 'sunday', 'communion', '主日崇拜與聖餐', '主日崇拜', '崇拜', '主日', '聖餐']
  };

  const aliasesForTarget = ALIAS_MAP[targetKey] || [];
  if (aliasesForTarget.some(alias => pCat === alias.toLowerCase() || pCat.includes(alias.toLowerCase()))) {
    return true;
  }

  if (photo.albumNameZh && aliasesForTarget.some(alias => photo.albumNameZh.toLowerCase().includes(alias.toLowerCase()))) {
    return true;
  }

  return false;
};
`;
  };

  const generateBulletinTs = (): string => {
    return `import { WEEKLY_BIBLE_READING } from './churchData';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - WEEKLY BULLETIN & READING PLAN MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// ============================================================================

export interface BulletinData {
  memoryVerseZh: string;
  memoryVerseEn: string;
  verseReference: string;
  readingRange: string;
  schedule: Array<{
    date: string;
    oldTestament: string;
    newTestament: string;
  }>;
  announcements?: string[];
  pastoralNoteZh?: string;
  pastoralNoteEn?: string;
  updatedAt?: string;
}

export const INITIAL_BULLETIN_DATA: BulletinData = ${JSON.stringify(allBulletin, null, 2)};
`;
  };

  const generateMasterBackupJson = (): string => {
    const payload = {
      app: "Canaan Shin Sheng Christian Church",
      exportedAt: new Date().toISOString(),
      version: "2.0",
      stats: {
        totalSermons: allSermons.length,
        totalPhotos: allPhotos.length,
        totalCategories: allCategories.length,
        totalAlbums: allAlbums.length,
      },
      data: {
        sermons: allSermons,
        photos: allPhotos,
        categories: allCategories,
        albums: allAlbums,
        bulletin: allBulletin
      }
    };
    return JSON.stringify(payload, null, 2);
  };

  // Execute Direct GitHub Multi-File Push
  const handleDirectGitHubPushAll = async () => {
    if (!githubToken.trim()) {
      setPushError(lang === 'zh' ? '請輸入 GitHub Personal Access Token (PAT)' : 'Please enter your GitHub Token');
      return;
    }
    if (!repoOwner.trim() || !repoName.trim()) {
      setPushError(lang === 'zh' ? '請填寫 GitHub 帳號 (Owner) 與專案名稱 (Repository)' : 'Please enter Repo Owner and Name');
      return;
    }

    handleSaveConfig();
    setIsPushing(true);
    setPushError(null);
    setPushSuccessResult(null);

    const filesToSync = [
      { path: 'src/data/sermonsData.ts', content: generateSermonsTs(), nameZh: '主日講道資料庫' },
      { path: 'src/utils/sermonStorage.ts', content: generateSermonStorageTs(), nameZh: '講道資料存儲與同步器' },
      { path: 'src/data/galleryData.ts', content: generateGalleryTs(), nameZh: '照片走廊與相簿' },
      { path: 'src/data/bulletinData.ts', content: generateBulletinTs(), nameZh: '主日週報與讀經靈修' },
      { path: 'public/canaan_master_data.json', content: generateMasterBackupJson(), nameZh: '全站綜合備份快照' }
    ];

    try {
      setPushStep(lang === 'zh' ? '正在呼叫同步 API 並打包全站資料...' : 'Packaging all church datasets...');

      // First try backend proxy /api/github/sync-all for highest reliability
      const backendRes = await fetch('/api/github/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          owner: repoOwner.trim(),
          repo: repoName.trim(),
          branch: branchName.trim() || 'main',
          data: {
            sermons: allSermons,
            photos: allPhotos,
            categories: allCategories,
            albums: allAlbums,
            bulletin: allBulletin
          }
        })
      });

      if (backendRes.ok) {
        const result = await backendRes.json();
        setPushSuccessResult({
          commitSha: result.commitSha || 'latest',
          commitUrl: result.commitUrl || `https://github.com/${repoOwner.trim()}/${repoName.trim()}`,
          filesUpdated: filesToSync.map(f => f.path),
          syncedAt: new Date().toLocaleTimeString()
        });
        setIsPushing(false);
        return;
      }

      // If backend was not reached or returned an error, fallback to direct GitHub REST API
      setPushStep(lang === 'zh' ? '正在直接提交至 GitHub 倉庫 (Git REST API)...' : 'Committing directly to GitHub API...');

      const token = githubToken.trim();
      const owner = repoOwner.trim();
      const repo = repoName.trim();
      const branch = branchName.trim() || 'main';

      // Push files sequentially to GitHub
      const updatedPaths: string[] = [];
      let lastCommitUrl = `https://github.com/${owner}/${repo}`;
      let lastCommitSha = 'main';

      for (let i = 0; i < filesToSync.length; i++) {
        const file = filesToSync[i];
        setPushStep(lang === 'zh' ? `正在同步 [${i + 1}/${filesToSync.length}] ${file.nameZh}...` : `Syncing ${file.path}...`);

        // 1. Get current sha if exists
        let currentSha: string | undefined = undefined;
        try {
          const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`;
          const getRes = await fetch(getUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
          if (getRes.ok) {
            const fileInfo = await getRes.json();
            currentSha = fileInfo.sha;
          }
        } catch {
          // ignore if new file
        }

        // 2. Put file contents
        const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`;
        const base64Content = btoa(unescape(encodeURIComponent(file.content)));
        const msg = `feat(data): sync all church data (${file.path}) - ${new Date().toISOString().slice(0, 10)}`;

        const putRes = await fetch(putUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify({
            message: msg,
            content: base64Content,
            branch: branch,
            sha: currentSha
          })
        });

        if (!putRes.ok) {
          const errData = await putRes.json().catch(() => ({}));
          throw new Error(errData.message || `GitHub error updating ${file.path} (${putRes.status})`);
        }

        const putData = await putRes.json();
        if (putData.commit?.sha) {
          lastCommitSha = putData.commit.sha.slice(0, 7);
          lastCommitUrl = putData.commit.html_url || lastCommitUrl;
        }
        updatedPaths.push(file.path);
      }

      setPushSuccessResult({
        commitSha: lastCommitSha,
        commitUrl: lastCommitUrl,
        filesUpdated: updatedPaths,
        syncedAt: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      console.error("Global GitHub Sync error:", err);
      setPushError(err.message || 'GitHub Sync failed. Please check token permissions (repo scope).');
    } finally {
      setIsPushing(false);
      setPushStep('');
    }
  };

  // Helper download file
  const triggerDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper copy to clipboard
  const handleCopyCode = async (key: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(key);
      setTimeout(() => setCopiedFile(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Restore from Backup JSON
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);

        const data = parsed.data || parsed;
        let restoredCount = 0;

        if (Array.isArray(data.sermons)) {
          setAllSermons(data.sermons);
          localStorage.setItem('canaan_sermons_data', JSON.stringify(data.sermons));
          window.dispatchEvent(new CustomEvent('canaan_sermons_updated', { detail: { allSermons: data.sermons } }));
          restoredCount += data.sermons.length;
        }

        if (Array.isArray(data.photos)) {
          setAllPhotos(data.photos);
          localStorage.setItem('canaan_gallery_photos_all', JSON.stringify(data.photos));
          localStorage.setItem('canaan_gallery_photos_custom', JSON.stringify(data.photos));
        }

        if (Array.isArray(data.categories)) {
          setAllCategories(data.categories);
          localStorage.setItem('canaan_gallery_categories', JSON.stringify(data.categories));
        }

        if (Array.isArray(data.albums)) {
          setAllAlbums(data.albums);
          localStorage.setItem('canaan_google_albums', JSON.stringify(data.albums));
        }

        if (data.bulletin) {
          setAllBulletin(data.bulletin);
          localStorage.setItem('canaan_bulletin_data', JSON.stringify(data.bulletin));
          window.dispatchEvent(new CustomEvent('canaan_bulletin_updated', { detail: data.bulletin }));
        }

        if (onDataRestored) {
          onDataRestored();
        }

        setRestoreStatus({
          type: 'success',
          message: lang === 'zh'
            ? `🎉 成功還原全站資料！包括 ${data.sermons?.length || 0} 篇講道、${data.photos?.length || 0} 張相片、${data.albums?.length || 0} 本相簿與週報讀經進度。`
            : `🎉 Successfully restored all church datasets!`
        });
      } catch (err: any) {
        setRestoreStatus({
          type: 'error',
          message: lang === 'zh' ? '檔案格式錯誤，請確保上傳的是正確的 JSON 備份檔案。' : 'Invalid backup JSON file format.'
        });
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/70 p-4 sm:p-6 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 rounded-xl shadow-lg ring-2 ring-amber-400/50">
              <Github className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
                  {lang === 'zh' ? '加南全站資料 • 一鍵 GitHub 同步與自動部署' : 'Canaan Master Data • One-Click GitHub Sync'}
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-amber-500/40 font-mono font-semibold">
                  Master Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {lang === 'zh'
                  ? '一鍵將「主日講道、照片走廊、相簿、主日週報與每日讀經」所有資料同步提交至 GitHub 倉庫，Cloudflare Pages 即時自動更新全站！'
                  : 'Sync all church data (sermons, photo gallery, albums, bulletin & reading plans) to GitHub in one click.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-4 pt-2 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{lang === 'zh' ? '1. 一鍵全站同步至 GitHub' : '1. One-Click GitHub Sync'}</span>
          </button>

          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'download'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'zh' ? '2. 下載 / 複製原始碼' : '2. Download & Copy Source'}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'zh' ? '3. 全站 JSON 備份與還原' : '3. JSON Backup & Restore'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'zh' ? '4. 自動部署指南' : '4. Deployment Guide'}</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: ONE-CLICK GITHUB SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              
              {/* Data Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Sermons Card */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 flex items-start space-x-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{lang === 'zh' ? '主日講道資料庫' : 'Sunday Sermons'}</div>
                    <div className="text-lg font-bold text-amber-300 mt-0.5">{allSermons.length} <span className="text-xs font-normal text-slate-400">{lang === 'zh' ? '篇講道' : 'records'}</span></div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">src/data/sermonsData.ts</div>
                  </div>
                </div>

                {/* Photo Gallery Card */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-sky-500/30 flex items-start space-x-3">
                  <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{lang === 'zh' ? '照片走廊與相簿' : 'Gallery & Albums'}</div>
                    <div className="text-lg font-bold text-sky-300 mt-0.5">{allPhotos.length} <span className="text-xs font-normal text-slate-400">{lang === 'zh' ? '張相片' : 'photos'}</span> / {allAlbums.length} <span className="text-xs font-normal text-slate-400">{lang === 'zh' ? '本相簿' : 'albums'}</span></div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">src/data/galleryData.ts</div>
                  </div>
                </div>

                {/* Bulletin & Reading Card */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 flex items-start space-x-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{lang === 'zh' ? '主日週報與讀經靈修' : 'Bulletin & Reading'}</div>
                    <div className="text-sm font-bold text-emerald-300 mt-0.5">{allBulletin.readingRange || '8/17 - 8/23'} <span className="text-xs font-normal text-slate-400">{lang === 'zh' ? '本週進度' : 'plan'}</span></div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">src/data/bulletinData.ts</div>
                  </div>
                </div>
              </div>

              {/* Push Success Box */}
              {pushSuccessResult && (
                <div className="p-4 sm:p-5 bg-emerald-950/50 border-2 border-emerald-500/60 rounded-xl space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{lang === 'zh' ? '🎉 全站所有資料已成功提交並推送至 GitHub 倉庫！' : '🎉 All Church Data Pushed to GitHub!'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                    {lang === 'zh'
                      ? `已更新：${pushSuccessResult.filesUpdated.join(', ')}。Cloudflare Pages 已收到 GitHub 推送事件，正在進行背景編譯建置，約 1~2 分鐘後全球所有人即可看見最新講道、相簿與週報！`
                      : `Updated files: ${pushSuccessResult.filesUpdated.join(', ')}. Cloudflare Pages is auto-deploying in ~1 minute.`}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={pushSuccessResult.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-400/40 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? `查看 GitHub 提交記錄 (#${pushSuccessResult.commitSha})` : `View GitHub Commit (#${pushSuccessResult.commitSha})`}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                    <span className="text-[11px] text-emerald-300/70">
                      {lang === 'zh' ? `同步時間：${pushSuccessResult.syncedAt}` : `Synced at: ${pushSuccessResult.syncedAt}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Push Error Box */}
              {pushError && (
                <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-xl flex items-start space-x-3 text-rose-200 text-xs sm:text-sm animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-rose-300">{lang === 'zh' ? '同步失敗' : 'Sync Failed'}</div>
                    <div className="font-mono text-xs">{pushError}</div>
                    <div className="text-[11px] text-rose-300/80 pt-1">
                      {lang === 'zh' ? '💡 請檢查 GitHub Token 是否具有 repo 讀寫權限，以及 Owner 與 Repository 名稱是否正確。' : '💡 Ensure your PAT has `repo` write access.'}
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub Settings Form */}
              <div className="bg-slate-950/90 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs sm:text-sm">
                    <Github className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'zh' ? 'GitHub 倉庫連接設定 (瀏覽器自動記住)' : 'GitHub Repository Settings'}</span>
                  </div>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Canaan+Church+Sync"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center"
                  >
                    <span>{lang === 'zh' ? '建立 GitHub Token (PAT)' : 'Generate GitHub Token'}</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      GitHub Personal Access Token (PAT) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={githubToken || ''}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      {lang === 'zh' ? '只需勾選 `repo` (Full control of private repositories) 權限即可。' : 'Requires `repo` permission.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        GitHub Owner / 組織
                      </label>
                      <input
                        type="text"
                        value={repoOwner || ''}
                        onChange={(e) => setRepoOwner(e.target.value)}
                        placeholder="canaannewlife"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Repository 倉庫名稱
                      </label>
                      <input
                        type="text"
                        value={repoName || ''}
                        onChange={(e) => setRepoName(e.target.value)}
                        placeholder="canaan-shin-sheng-church"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        目標分支 (Branch)
                      </label>
                      <input
                        type="text"
                        value={branchName || ''}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="main"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Big Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleDirectGitHubPushAll}
                    disabled={isPushing}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-xl transition-all ${
                      isPushing
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 hover:shadow-amber-500/25 hover:scale-[1.01]'
                    }`}
                  >
                    {isPushing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                        <span>{pushStep || (lang === 'zh' ? '正在同步提交至 GitHub 倉庫...' : 'Pushing all data to GitHub...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 fill-slate-950" />
                        <span>
                          {lang === 'zh'
                            ? `🚀 立即一鍵將全站所有資料同步至 GitHub 倉庫 (${allSermons.length} 篇講道 + ${allPhotos.length} 張相片 + 週報讀經)`
                            : `🚀 Push All Church Data to GitHub (${allSermons.length} Sermons + ${allPhotos.length} Photos)`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Workflow reminder */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-300">
                <Cloud className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">
                    {lang === 'zh' ? '全自動 Cloudflare Pages 建置流程' : 'Automated Cloudflare Pages Workflow'}
                  </div>
                  <div className="text-slate-400 leading-relaxed">
                    {lang === 'zh'
                      ? '點擊上方同步按鈕後，所有最新編輯的講道錄影密碼、相簿分類與讀經進度將立即 Push 到 GitHub 的 main 分支。Cloudflare 會在 1~2 分鐘內自動完成靜態網站打包發布，全球各地信徒重新整理網頁即可看見最新內容！'
                      : 'After pushing, Cloudflare Pages will automatically rebuild and deploy the site globally in 1-2 minutes.'}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DOWNLOAD & COPY SOURCE CODE */}
          {activeTab === 'download' && (
            <div className="space-y-5">
              <div className="text-xs text-slate-300 leading-relaxed">
                {lang === 'zh'
                  ? '您可以手動下載獨立的 TypeScript 資料模組，或直接複製代碼到本地專案 / GitHub 網頁編輯器中替換存檔：'
                  : 'Download individual TypeScript data modules or copy raw source code directly:'}
              </div>

              {/* 1. sermonsData.ts */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-xs font-bold text-amber-300">src/data/sermonsData.ts</span>
                    <span className="text-[11px] text-slate-400">({allSermons.length} 篇講道)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCode('sermons', generateSermonsTs())}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200 flex items-center space-x-1 border border-slate-700 transition-colors"
                    >
                      {copiedFile === 'sermons' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'sermons' ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '複製代碼' : 'Copy Code')}</span>
                    </button>
                    <button
                      onClick={() => triggerDownload('sermonsData.ts', generateSermonsTs(), 'text/typescript')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-xs font-semibold rounded-lg text-slate-950 flex items-center space-x-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '下載 sermonsData.ts' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. galleryData.ts */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span className="font-mono text-xs font-bold text-sky-300">src/data/galleryData.ts</span>
                    <span className="text-[11px] text-slate-400">({allPhotos.length} 張相片 / {allCategories.length} 個分類)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCode('gallery', generateGalleryTs())}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200 flex items-center space-x-1 border border-slate-700 transition-colors"
                    >
                      {copiedFile === 'gallery' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'gallery' ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '複製代碼' : 'Copy Code')}</span>
                    </button>
                    <button
                      onClick={() => triggerDownload('galleryData.ts', generateGalleryTs(), 'text/typescript')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-xs font-semibold rounded-lg text-slate-950 flex items-center space-x-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '下載 galleryData.ts' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. bulletinData.ts */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-emerald-300">src/data/bulletinData.ts</span>
                    <span className="text-[11px] text-slate-400">(週報背誦經文與讀經進度)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCode('bulletin', generateBulletinTs())}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200 flex items-center space-x-1 border border-slate-700 transition-colors"
                    >
                      {copiedFile === 'bulletin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile === 'bulletin' ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '複製代碼' : 'Copy Code')}</span>
                    </button>
                    <button
                      onClick={() => triggerDownload('bulletinData.ts', generateBulletinTs(), 'text/typescript')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg text-slate-950 flex items-center space-x-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '下載 bulletinData.ts' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MASTER JSON BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              
              {/* Feedback */}
              {restoreStatus && (
                <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs sm:text-sm ${
                  restoreStatus.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                }`}>
                  {restoreStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>{restoreStatus.message}</div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Backup Box */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'zh' ? '匯出全站總備份 (JSON)' : 'Export Master Backup (JSON)'}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'zh'
                        ? '下載包含講道大綱、Zoom 影音密碼、照片走廊、Google 相簿、週報與讀經進度的單一 JSON 備份檔案，可於任何電腦或瀏覽器一鍵還原。'
                        : 'Download a complete JSON backup containing all sermons, photos, albums, and bulletin data.'}
                    </p>
                  </div>

                  <button
                    onClick={() => triggerDownload(
                      `canaan_master_church_backup_${new Date().toISOString().slice(0, 10)}.json`,
                      generateMasterBackupJson(),
                      'application/json'
                    )}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'zh' ? '下載全站 JSON 備份檔案' : 'Download Master Backup JSON'}</span>
                  </button>
                </div>

                {/* Restore Box */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'zh' ? '從備份檔案還原 (JSON)' : 'Restore from Backup JSON'}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'zh'
                        ? '選擇先前匯出的 JSON 備份檔案，一鍵將講道記錄與相簿資料還原至當前瀏覽器中。'
                        : 'Select a previously exported JSON backup file to restore all datasets in one click.'}
                    </p>
                  </div>

                  <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs sm:text-sm rounded-lg border border-cyan-500/40 flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-md">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'zh' ? '選擇 JSON 檔案並還原' : 'Upload JSON & Restore'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJsonFile}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: DEPLOYMENT GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-300 text-sm flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'zh' ? 'Cloudflare Pages 與 GitHub 整合原理' : 'Cloudflare Pages & GitHub Workflow'}</span>
                </h4>
                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>
                    {lang === 'zh'
                      ? '1. 本站前端採用 React + Vite 架構，所有資料庫模組（講道、相簿、週報）均存放於 `src/data/` 目錄中。'
                      : '1. All church data modules are stored in `src/data/`.'}
                  </p>
                  <p>
                    {lang === 'zh'
                      ? '2. 當您在後台點擊「一鍵同步至 GitHub」時，系統會自動將您在網頁上編輯的所有講道錄影密碼、新增的相片與讀經進度推送到 GitHub 倉庫的 `main` 分支。'
                      : '2. Clicking Sync commits all datasets directly to GitHub main branch.'}
                  </p>
                  <p>
                    {lang === 'zh'
                      ? '3. GitHub 收到提交後，會自動觸發 Cloudflare Pages Webhook，並在 1~2 分鐘內完成全站自動建置與全球 CDN 部署。'
                      : '3. Cloudflare Pages detects the commit and rebuilds the site in ~1 minute.'}
                  </p>
                  <p>
                    {lang === 'zh'
                      ? '4. 您無需手動打開終端機或 Git 命令列，一切皆在網頁端一鍵完成！'
                      : '4. Fully automated without requiring command-line tools.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            {lang === 'zh'
              ? `目前全站資料：${allSermons.length} 篇講道 • ${allPhotos.length} 張相片 • ${allAlbums.length} 本相簿`
              : `Total: ${allSermons.length} sermons • ${allPhotos.length} photos • ${allAlbums.length} albums`}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              {lang === 'zh' ? '關閉' : 'Close'}
            </button>
            <button
              onClick={handleDirectGitHubPushAll}
              disabled={isPushing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-lg"
            >
              <Github className="w-4 h-4" />
              <span>{lang === 'zh' ? '一鍵同步全站至 GitHub' : 'Sync All to GitHub'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
