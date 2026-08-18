import React, { useState } from 'react';
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
  ArrowRight,
  Info,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { GalleryPhoto, GalleryCategory, Language } from '../types';

interface GalleryGitHubSyncModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  photos: GalleryPhoto[];
  categories: GalleryCategory[];
  onImportBackup: (photos: GalleryPhoto[], categories?: GalleryCategory[]) => void;
}

export const GalleryGitHubSyncModal: React.FC<GalleryGitHubSyncModalProps> = ({
  lang,
  isOpen,
  onClose,
  photos,
  categories,
  onImportBackup
}) => {
  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isServerSyncing, setIsServerSyncing] = useState(false);
  const [serverSyncSuccess, setServerSyncSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'backup' | 'guide'>('export');

  if (!isOpen) return null;

  // Helper to generate clean galleryData.ts file string
  const generateTypeScriptCode = () => {
    const categoriesJson = JSON.stringify(categories, null, 2);
    const photosJson = JSON.stringify(photos, null, 2);

    return `import { GalleryCategory, GalleryPhoto } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - PHOTO GALLERY MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Photos: ${photos.length}
// ============================================================================

export const GALLERY_CATEGORIES: GalleryCategory[] = ${categoriesJson};

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = ${photosJson};

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

  // Download galleryData.ts directly
  const handleDownloadTypeScript = () => {
    const tsCode = generateTypeScriptCode();
    const blob = new Blob([tsCode], { type: 'text/typescript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'galleryData.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy TypeScript code to clipboard
  const handleCopyTypeScript = async () => {
    try {
      const tsCode = generateTypeScriptCode();
      await navigator.clipboard.writeText(tsCode);
      setCopiedTs(true);
      setTimeout(() => setCopiedTs(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Download JSON Backup
  const handleDownloadJsonBackup = () => {
    const backupData = {
      version: '2.0',
      church: 'Canaan Shin Sheng Christian Church',
      exportDate: new Date().toISOString(),
      photosCount: photos.length,
      categories,
      photos
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canaan_gallery_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    try {
      const jsonStr = JSON.stringify({ photos, categories }, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Import JSON File
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let importedPhotos: GalleryPhoto[] = [];
        let importedCategories: GalleryCategory[] | undefined = undefined;

        if (Array.isArray(parsed)) {
          importedPhotos = parsed;
        } else if (parsed && Array.isArray(parsed.photos)) {
          importedPhotos = parsed.photos;
          if (Array.isArray(parsed.categories)) {
            importedCategories = parsed.categories;
          }
        } else {
          throw new Error('Invalid JSON format');
        }

        if (importedPhotos.length === 0) {
          throw new Error('No photos found in file');
        }

        onImportBackup(importedPhotos, importedCategories);
        setImportStatus(
          lang === 'zh'
            ? `✅ 成功匯入 ${importedPhotos.length} 張相片！已即時更新走廊。`
            : `✅ Successfully imported ${importedPhotos.length} photos!`
        );
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err: any) {
        setImportStatus(lang === 'zh' ? `❌ 匯入失敗：${err.message}` : `❌ Import error: ${err.message}`);
        setTimeout(() => setImportStatus(null), 6000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Sync to Backend Server API
  const handleSyncToBackend = async () => {
    setIsServerSyncing(true);
    setServerSyncSuccess(false);
    try {
      const res = await fetch('/api/gallery/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos })
      });
      if (!res.ok) throw new Error('Failed to sync with server');
      
      await fetch('/api/gallery/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories })
      });

      setServerSyncSuccess(true);
      setTimeout(() => setServerSyncSuccess(false), 4000);
    } catch (e: any) {
      console.error(e);
      alert(lang === 'zh' ? '伺服器同步發生錯誤' : 'Server sync failed');
    } finally {
      setIsServerSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        id="gallery-github-sync-modal"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {lang === 'zh' ? 'GitHub & Cloudflare 相簿同步與匯出' : 'GitHub & Cloudflare Gallery Sync'}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {photos.length} {lang === 'zh' ? '張相片' : 'Photos'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh' 
                  ? '將網頁最新修改的相片資料與分類同步固化至 GitHub 原始碼與 Cloudflare Pages' 
                  : 'Sync and bake all current photo changes into GitHub source code for Cloudflare Pages deploy'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'export'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            {lang === 'zh' ? '1. 匯出/下載 galleryData.ts' : '1. Export galleryData.ts'}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'guide'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {lang === 'zh' ? '2. Cloudflare 自動更新原理與步驟' : '2. Cloudflare Sync Guide'}
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'backup'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            {lang === 'zh' ? '3. JSON 完整備份與還原' : '3. JSON Backup & Restore'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {importStatus && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-medium flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* TAB 1: EXPORT TYPESCRIPT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Explanation Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-800/80 to-indigo-500/10 border border-amber-500/20 text-slate-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <h4 className="font-semibold text-white">
                      {lang === 'zh' ? '為什麼 GitHub 和 Cloudflare 需要更新代碼？' : 'Why does GitHub & Cloudflare need code updates?'}
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                      {lang === 'zh' 
                        ? '當您在瀏覽器後台新增照片、透過 AI 自動分類或批次修改時，變更會即時存在您的瀏覽器與伺服器中。而 Cloudflare Pages 是透過 GitHub 倉庫源碼自動建置的，只要將包含最新相片清單的 `galleryData.ts` 放入 GitHub 倉庫，Cloudflare 就會自動 build 出包含所有相片的正式上線網站！'
                        : 'Changes made in the browser are cached locally and on the server. Cloudflare Pages builds static output directly from your GitHub repository. Updating `galleryData.ts` in GitHub triggers Cloudflare to deploy all photos automatically to all visitors.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Download className="w-4 h-4" />
                      {lang === 'zh' ? '一鍵下載 galleryData.ts 原始碼' : 'Download galleryData.ts file'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '直接下載已編譯好、包含全體相片與分類的 galleryData.ts，直接替換專案中的 `src/data/galleryData.ts`。'
                        : 'Download the compiled file containing all current photos and categories to replace in `src/data/galleryData.ts`.'}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTypeScript}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    {lang === 'zh' ? '📥 下載 galleryData.ts 檔案' : '📥 Download galleryData.ts'}
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                      <Copy className="w-4 h-4" />
                      {lang === 'zh' ? '一鍵複製 TypeScript 完整代碼' : 'Copy TypeScript Code'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '複製全部 TypeScript 原始碼到剪貼簿，可直接在 GitHub 網頁編輯器或 VS Code 中貼上存檔。'
                        : 'Copy full TypeScript code to clipboard for pasting directly in GitHub web editor or VS Code.'}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyTypeScript}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 ${
                      copiedTs
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {copiedTs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedTs 
                      ? (lang === 'zh' ? '✅ 代碼已複製到剪貼簿！' : '✅ Copied to Clipboard!')
                      : (lang === 'zh' ? '📋 複製 TypeScript 代碼' : '📋 Copy TypeScript Code')}
                  </button>
                </div>
              </div>

              {/* Server Sync Quick Trigger */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <RefreshCw className={`w-4 h-4 ${isServerSyncing ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">
                      {lang === 'zh' ? '伺服器 API 即時同步' : 'Live Server API Sync'}
                    </h5>
                    <p className="text-xs text-slate-400">
                      {lang === 'zh' 
                        ? '將目前所有相片即時儲存至後端記憶體與 API 端點 (/api/gallery/photos)' 
                        : 'Sync photos to backend API endpoint (/api/gallery/photos)'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSyncToBackend}
                  disabled={isServerSyncing}
                  className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    serverSyncSuccess 
                      ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  }`}
                >
                  {serverSyncSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {lang === 'zh' ? '已成功同步至伺服器' : 'Synced to Server!'}
                    </>
                  ) : (
                    <>
                      <RefreshCw className={`w-3.5 h-3.5 ${isServerSyncing ? 'animate-spin' : ''}`} />
                      {lang === 'zh' ? '立即同步至伺服器' : 'Sync to Server Now'}
                    </>
                  )}
                </button>
              </div>

              {/* Code Preview snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{lang === 'zh' ? '代碼預覽 (src/data/galleryData.ts)' : 'Code Preview (src/data/galleryData.ts)'}</span>
                  <span>{photos.length} items • {categories.length} categories</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto custom-scrollbar">
                  <pre>{generateTypeScriptCode().slice(0, 1200)} ...</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLOUDFLARE & GITHUB STEP-BY-STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-amber-400" />
                  {lang === 'zh' ? '三步驟將最新照片更新至 Cloudflare 上線網站' : '3-Step Guide to Update Cloudflare Website'}
                </h4>

                <div className="space-y-4 text-sm text-slate-300">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {lang === 'zh' ? '下載或複製 galleryData.ts' : 'Download or Copy galleryData.ts'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lang === 'zh'
                          ? '在上一分頁點擊「下載 galleryData.ts 檔案」取得最新檔案，或點擊「複製 TypeScript 代碼」。'
                          : 'Download the galleryData.ts file from Tab 1 or copy the TypeScript code.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {lang === 'zh' ? '替換 GitHub 專案中的檔案並 Commit & Push' : 'Replace in GitHub & Push'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lang === 'zh'
                          ? '將下載的檔案放入專案的 `src/data/galleryData.ts` 覆蓋舊檔，執行 `git add . && git commit -m "Update gallery photos" && git push`。'
                          : 'Replace `src/data/galleryData.ts` in your repo and commit: `git commit -m "Update gallery photos" && git push`.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {lang === 'zh' ? 'Cloudflare Pages 自動完成建置發布' : 'Cloudflare Pages Auto-Deploy'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lang === 'zh'
                          ? 'Cloudflare 偵測到 GitHub Push 後，會在 1~2 分鐘內自動建置完成，全球所有人即可在正式網址看到所有新增與更新的相片！'
                          : 'Cloudflare Pages detects the push and deploys the new gallery automatically in 1-2 minutes!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloudflare Env Vars Reminder */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  {lang === 'zh' ? 'Cloudflare 環境變數 (AI 牧養助理 & Gemini 相簿識別)' : 'Cloudflare Environment Variables (Gemini AI)'}
                </div>
                <p className="leading-relaxed">
                  {lang === 'zh'
                    ? '若需在 Cloudflare Pages 上使用 Gemini AI 牧養助手與相片自動辨識功能，請在 Cloudflare Pages 後台 -> Settings -> Environment Variables 新增 `VITE_GEMINI_API_KEY`。'
                    : 'To enable Gemini AI capabilities on Cloudflare Pages, add `VITE_GEMINI_API_KEY` under Cloudflare Pages Settings -> Environment Variables.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: JSON BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export JSON */}
                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                      <Download className="w-4 h-4" />
                      {lang === 'zh' ? '匯出完整 JSON 備份檔' : 'Export JSON Backup'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '下載包含所有相片中英文標題、地點、敘述、分類與相簿名稱的 JSON 檔案，方便妥善備份保存。'
                        : 'Download a complete JSON backup of all photos and metadata.'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadJsonBackup}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {lang === 'zh' ? '下載 JSON 檔案' : 'Download JSON'}
                    </button>
                    <button
                      onClick={handleCopyJson}
                      className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedJson ? 'OK' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Import JSON */}
                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Upload className="w-4 h-4" />
                      {lang === 'zh' ? '匯入 JSON 備份檔還原' : 'Import JSON Backup'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '從其他電腦或備份檔案匯入照片資料庫，一鍵在當前瀏覽器中完整還原所有相片與分類。'
                        : 'Restore photos from a JSON backup file on any device or browser.'}
                    </p>
                  </div>

                  <label className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition text-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '選擇 JSON 備份檔匯入' : 'Select JSON file to import'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJsonFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Current Stats */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <div className="text-2xl font-bold text-amber-400">{photos.length}</div>
                  <div className="text-xs text-slate-400 mt-1">{lang === 'zh' ? '目前總相片數' : 'Total Photos'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <div className="text-2xl font-bold text-indigo-400">{categories.length}</div>
                  <div className="text-xs text-slate-400 mt-1">{lang === 'zh' ? '分類主題數' : 'Categories'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <div className="text-2xl font-bold text-emerald-400">
                    {photos.filter(p => p.source === 'google-photos').length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{lang === 'zh' ? 'Google 相簿來源' : 'Google Photos'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <div className="text-2xl font-bold text-blue-400">
                    {photos.filter(p => p.source === 'local' || p.id.startsWith('custom-photo-')).length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{lang === 'zh' ? '手動新增相片' : 'Custom Uploads'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{lang === 'zh' ? '資料庫狀態：正常運作中' : 'Gallery Status: Live & Synced'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition"
            >
              {lang === 'zh' ? '關閉' : 'Close'}
            </button>
            <button
              onClick={handleDownloadTypeScript}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              {lang === 'zh' ? '下載 galleryData.ts' : 'Download galleryData.ts'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
