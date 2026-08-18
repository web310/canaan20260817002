import React, { useState, useEffect } from 'react';
import { Language, GalleryPhoto } from '../types';
import { 
  Sparkles, 
  Images, 
  Check, 
  X, 
  Loader2, 
  Share2, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Calendar,
  MapPin,
  FolderHeart,
  ChevronRight,
  Sliders,
  LogIn,
  Key,
  ShieldCheck
} from 'lucide-react';

interface GooglePhotosAISyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onImportPhotos: (importedPhotos: GalleryPhoto[]) => void;
}

interface GoogleMediaItem {
  id: string;
  description?: string;
  baseUrl: string;
  mimeType: string;
  filename: string;
  mediaMetadata?: {
    creationTime?: string;
    width?: string;
    height?: string;
  };
}

interface AnalyzedPhotoItem {
  id: string;
  rawUrl: string;
  selected: boolean;
  isAnalyzing: boolean;
  analyzed: boolean;
  error?: string;
  category: GalleryPhoto['category'];
  categoryConfidence?: number;
  categoryNameZh?: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  albumNameZh: string;
  albumNameEn: string;
  locationZh: string;
  locationEn: string;
  suggestedDate: string;
  detectedTags?: string[];
}

export const GooglePhotosAISyncModal: React.FC<GooglePhotosAISyncModalProps> = ({
  isOpen,
  onClose,
  lang,
  onImportPhotos,
}) => {
  const [accessToken, setAccessToken] = useState<string>(() => {
    return localStorage.getItem('canaan_gp_token') || '';
  });
  const [accountEmail, setAccountEmail] = useState<string>('web@canaannewlife.org');
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaItems, setMediaItems] = useState<GoogleMediaItem[]>([]);
  const [analyzedList, setAnalyzedList] = useState<AnalyzedPhotoItem[]>([]);
  const [step, setStep] = useState<'connect' | 'select' | 'review'>('connect');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Custom Google Client ID state (optional if webmaster configured one in Google Cloud)
  const [customClientId, setCustomClientId] = useState<string>(() => {
    return localStorage.getItem('canaan_gp_custom_client_id') || '';
  });
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);

  // Album URL direct import state
  const [albumUrl, setAlbumUrl] = useState<string>('');
  const [isSyncingAlbumUrl, setIsSyncingAlbumUrl] = useState(false);

  // Custom photo URL / Sample list helper for quick import
  const [customPhotoUrls, setCustomPhotoUrls] = useState<string>('');

  useEffect(() => {
    if (accessToken) {
      setStep('select');
      fetchGooglePhotos(accessToken);
    }
  }, []);

  if (!isOpen) return null;

  // Handle Shared Album Link Directly with Server & Gemini AI
  const handleSyncAlbumUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!albumUrl.trim()) {
      alert(lang === 'zh' ? '請輸入 Google 相簿公開分享連結 (如 https://photos.app.goo.gl/...)' : 'Please paste Google Photos shared album URL');
      return;
    }

    setIsSyncingAlbumUrl(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gallery/google-photos/sync-album-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumUrl: albumUrl.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '無法讀取該相簿，請確認連結是否公開分享');
      }

      const data = await res.json();
      const newPhotos: GalleryPhoto[] = data.photos || [];

      if (newPhotos.length > 0) {
        onImportPhotos(newPhotos);
        onClose();
      } else {
        throw new Error(lang === 'zh' ? '未從相簿中找到照片' : 'No photos found in album');
      }
    } catch (err: any) {
      console.error("Shared album sync error:", err);
      setErrorMessage(err.message || '無法從 Google 相簿分享連結讀取相片');
    } finally {
      setIsSyncingAlbumUrl(false);
    }
  };

  // Initialize GSI Token Client if a valid custom Client ID exists
  const handleGoogleSignIn = () => {
    try {
      setErrorMessage(null);
      if (!customClientId.trim()) {
        setShowAdvancedAuth(true);
        setErrorMessage(
          lang === 'zh'
            ? '💡 Google OAuth 官方登入需要您在 Google Cloud Console (console.cloud.google.com) 建立的專屬 Client ID。推薦使用上方「方式 1：Google 相簿分享連結」，完全免任何設定即可一秒同步！'
            : '💡 Google OAuth requires a registered Client ID from Google Cloud Console. We recommend using Method 1 (Shared Album URL) above for instant zero-configuration sync!'
        );
        return;
      }

      // @ts-ignore
      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        // @ts-ignore
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: customClientId.trim(),
          scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
          hint: accountEmail,
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              const token = tokenResponse.access_token;
              setAccessToken(token);
              localStorage.setItem('canaan_gp_token', token);
              localStorage.setItem('canaan_gp_custom_client_id', customClientId.trim());
              setStep('select');
              fetchGooglePhotos(token);
            } else if (tokenResponse.error) {
              console.warn("GSI error:", tokenResponse);
              setErrorMessage(
                lang === 'zh' 
                  ? `Google 授權未完成: ${tokenResponse.error}。建議使用上方「相簿分享連結」進行同步！`
                  : `Google OAuth did not complete: ${tokenResponse.error}. Please try the Shared Album URL method.`
              );
            }
          },
        });
        client.requestAccessToken();
      } else {
        const manualToken = prompt(
          lang === 'zh'
            ? '請輸入 Google Photos OAuth Access Token：'
            : 'Please paste Google Photos Access Token:'
        );
        if (manualToken) {
          setAccessToken(manualToken);
          localStorage.setItem('canaan_gp_token', manualToken);
          setStep('select');
          fetchGooglePhotos(manualToken);
        }
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setErrorMessage(err.message || 'Google Sign-in failed');
    }
  };

  const fetchGooglePhotos = async (token: string) => {
    setIsLoadingMedia(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/gallery/google-photos/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pageSize: 20 }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const items: GoogleMediaItem[] = data.mediaItems || [];
      setMediaItems(items);

      // Convert to Analyzed items
      const initialAnalyzed: AnalyzedPhotoItem[] = items.map((m) => ({
        id: m.id,
        rawUrl: `${m.baseUrl}=w1200-h800`,
        selected: true,
        isAnalyzing: false,
        analyzed: false,
        category: 'worship',
        titleZh: m.filename || '加南聚會照片',
        titleEn: m.filename || 'Church Photo',
        descriptionZh: m.description || '',
        descriptionEn: m.description || '',
        albumNameZh: '加南 Google 相簿精選',
        albumNameEn: 'Canaan Google Photos',
        locationZh: '加南新生基督教會',
        locationEn: 'Canaan Shin Sheng Christian Church',
        suggestedDate: m.mediaMetadata?.creationTime ? m.mediaMetadata.creationTime.slice(0, 7) : new Date().toISOString().slice(0, 7),
      }));

      setAnalyzedList(initialAnalyzed);
      setStep('select');
    } catch (err: any) {
      console.warn("Could not list Google Photos directly with token:", err.message);
      setErrorMessage(
        lang === 'zh'
          ? `無法自動讀取 Google Photos API (${err.message})。您可以直接貼上 Google 相簿照片網址，由 Gemini AI 自動進行智慧場景識別與分類！`
          : `Google Photos API could not be read directly (${err.message}). You can paste photo URLs for instant Gemini AI classification!`
      );
    } finally {
      setIsLoadingMedia(false);
    }
  };

  // Analyze single photo with Gemini AI
  const analyzeSinglePhoto = async (index: number) => {
    const item = analyzedList[index];
    if (!item) return;

    setAnalyzedList((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], isAnalyzing: true, error: undefined };
      return clone;
    });

    try {
      const res = await fetch('/api/gallery/ai-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: item.rawUrl,
          photoContext: {
            account: accountEmail,
            suggestedDate: item.suggestedDate,
            initialName: item.titleZh,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'AI analysis failed');
      }

      const { analysis } = await res.json();

      setAnalyzedList((prev) => {
        const clone = [...prev];
        clone[index] = {
          ...clone[index],
          isAnalyzing: false,
          analyzed: true,
          category: analysis.category || 'worship',
          categoryConfidence: analysis.categoryConfidence,
          categoryNameZh: analysis.categoryNameZh,
          titleZh: analysis.titleZh || clone[index].titleZh,
          titleEn: analysis.titleEn || clone[index].titleEn,
          descriptionZh: analysis.descriptionZh || clone[index].descriptionZh,
          descriptionEn: analysis.descriptionEn || clone[index].descriptionEn,
          albumNameZh: analysis.albumNameZh || clone[index].albumNameZh,
          albumNameEn: analysis.albumNameEn || clone[index].albumNameEn,
          locationZh: analysis.locationZh || clone[index].locationZh,
          locationEn: analysis.locationEn || clone[index].locationEn,
          suggestedDate: analysis.suggestedDate || clone[index].suggestedDate,
          detectedTags: analysis.detectedTags || [],
        };
        return clone;
      });
    } catch (err: any) {
      console.error("AI analysis error:", err);
      setAnalyzedList((prev) => {
        const clone = [...prev];
        clone[index] = {
          ...clone[index],
          isAnalyzing: false,
          error: err.message || 'AI 分析失敗',
        };
        return clone;
      });
    }
  };

  // Run Batch AI Categorization on all selected items
  const handleBatchAICategorization = async () => {
    setIsBatchAnalyzing(true);
    const selectedIndices = analyzedList
      .map((item, idx) => (item.selected ? idx : -1))
      .filter((idx) => idx !== -1);

    setBatchProgress({ current: 0, total: selectedIndices.length });

    for (let i = 0; i < selectedIndices.length; i++) {
      const idx = selectedIndices[i];
      setBatchProgress({ current: i + 1, total: selectedIndices.length });
      await analyzeSinglePhoto(idx);
    }

    setIsBatchAnalyzing(false);
    setStep('review');
  };

  // Process custom URLs directly
  const handleAddCustomUrls = () => {
    if (!customPhotoUrls.trim()) return;
    const urls = customPhotoUrls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http') || u.startsWith('data:'));

    if (urls.length === 0) {
      alert(lang === 'zh' ? '請輸入有效的照片網址（每行一個）' : 'Please enter valid image URLs (one per line)');
      return;
    }

    const newItems: AnalyzedPhotoItem[] = urls.map((url, i) => ({
      id: `custom-gp-${Date.now()}-${i}`,
      rawUrl: url,
      selected: true,
      isAnalyzing: false,
      analyzed: false,
      category: 'worship',
      titleZh: `Google 相簿相片 ${i + 1}`,
      titleEn: `Google Photos Image ${i + 1}`,
      descriptionZh: '加南新生基督教會聚會感恩紀錄',
      descriptionEn: 'Canaan Shin Sheng Christian Church moment of grace',
      albumNameZh: '加南 Google 相簿精選',
      albumNameEn: 'Canaan Google Photos',
      locationZh: '加南新生基督教會',
      locationEn: 'Canaan Shin Sheng Christian Church',
      suggestedDate: new Date().toISOString().slice(0, 7),
    }));

    setAnalyzedList((prev) => [...newItems, ...prev]);
    setCustomPhotoUrls('');
    setStep('select');
  };

  // Final Import
  const handleConfirmImport = () => {
    const toImport: GalleryPhoto[] = analyzedList
      .filter((item) => item.selected)
      .map((item) => ({
        id: `custom-photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: item.titleEn || item.titleZh,
        titleZh: item.titleZh || item.titleEn,
        category: item.category,
        date: item.suggestedDate || new Date().toISOString().slice(0, 7),
        imageUrl: item.rawUrl,
        description: item.descriptionEn || item.descriptionZh,
        descriptionZh: item.descriptionZh || item.descriptionEn,
        albumName: item.albumNameEn || 'Google Photos Album',
        albumNameZh: item.albumNameZh || 'Google 相簿集',
        location: item.locationEn,
        locationZh: item.locationZh,
      }));

    if (toImport.length === 0) {
      alert(lang === 'zh' ? '請至少勾選一張要匯入的照片！' : 'Please select at least one photo to import.');
      return;
    }

    onImportPhotos(toImport);
    onClose();
  };

  const getCategoryColor = (cat: GalleryPhoto['category']) => {
    switch (cat) {
      case 'worship': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'fellowship': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'celebration': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'retreat': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'heritage': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-600 text-white shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  {lang === 'zh' ? 'Google Photos 帳號直接複製與 AI 智慧分類' : 'Google Photos Direct Copy & AI Auto-Classifier'}
                </h3>
                <span className="bg-blue-500/20 text-blue-300 text-[11px] px-2 py-0.5 rounded-full border border-blue-500/30">
                  {accountEmail}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh'
                  ? '一鍵從 web@canaannewlife.org 讀取相簿照片，透過 Gemini 2.5/3.7 Vision 視覺 AI 辨識場景並自動分類存入照片走廊'
                  : 'Directly copy photos and let Gemini AI auto-classify into church worship, fellowship, retreats, and celebrations.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <span className={`flex items-center space-x-1.5 ${step === 'connect' ? 'text-amber-400 font-bold' : analyzedList.length > 0 ? 'text-emerald-400' : ''}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
              <span>{lang === 'zh' ? '連結 Google 帳號' : 'Connect Account'}</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className={`flex items-center space-x-1.5 ${step === 'select' ? 'text-amber-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
              <span>{lang === 'zh' ? '選取相片 & AI 智慧分析' : 'Select & AI Analyze'}</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className={`flex items-center space-x-1.5 ${step === 'review' ? 'text-amber-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
              <span>{lang === 'zh' ? '檢視分類與儲存' : 'Review & Save'}</span>
            </span>
          </div>

          {analyzedList.length > 0 && (
            <span className="text-slate-300 font-medium hidden sm:inline">
              {lang === 'zh' ? `已載入 ${analyzedList.length} 張相片` : `${analyzedList.length} Photos Loaded`}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-300">{errorMessage}</p>
                <p className="text-[11px] text-rose-200/80 mt-1">
                  {lang === 'zh' ? '💡 您也可以在下方直接貼上 Google 相簿照片網址或上傳檔案，一樣享有 Gemini 智慧場景分類功能！' : 'Tip: You can also paste image URLs directly below for full AI categorization.'}
                </p>
              </div>
            </div>
          )}

          {/* Method 1: Google Photos Shared Album URL (RECOMMENDED & ZERO BARRIER) */}
          <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border-2 border-blue-500/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {lang === 'zh' ? '推薦 • 100% 成功免設定' : 'Recommended • Instant Sync'}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {lang === 'zh' ? '方式 1：Google 相簿公開分享連結 (Shared Album)' : 'Method 1: Google Photos Shared Album Link'}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'zh'
                    ? '只需在 Google 相簿 App 或網頁版（photos.google.com）打開相簿，點擊「分享」複製相簿連結，貼在下方即可一鍵由 Gemini AI 自動抓取並智慧五大分類！'
                    : 'Open any album in Google Photos, click Share -> Create Link, and paste it below. Gemini AI will auto-ingest and categorize all photos!'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSyncAlbumUrl} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="url"
                value={albumUrl}
                onChange={(e) => setAlbumUrl(e.target.value)}
                placeholder={lang === 'zh' ? '貼上 Google 相簿分享連結 (例如 https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7)' : 'Paste Google Photos Album Link (e.g. https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7)'}
                className="flex-1 bg-slate-900/90 border border-blue-400/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
              />
              <button
                type="submit"
                disabled={isSyncingAlbumUrl || !albumUrl.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2 flex-shrink-0"
              >
                {isSyncingAlbumUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{lang === 'zh' ? 'Gemini AI 解析相簿中...' : 'Analyzing Album...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'zh' ? '⚡ 立即匯入與 AI 分類' : '⚡ Sync & AI Classify'}</span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-300">
              <span>{lang === 'zh' ? '教會歷年相簿：' : 'Church Archive Album:'}</span>
              <button
                type="button"
                onClick={() => setAlbumUrl('https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7')}
                className="text-amber-400 hover:text-amber-300 underline font-mono text-left truncate"
              >
                https://photos.app.goo.gl/S4i2xq8Ghh5QwdYg7
              </button>
            </div>
          </div>

          {/* Method 2: Direct Image URLs & Bulk Upload */}
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'zh' ? '方式 2：貼上單張或多張相片網址' : 'Method 2: Paste Direct Image URLs (One per line)'}
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                rows={2}
                placeholder="https://lh3.googleusercontent.com/... 或相片網址 (每行一個)"
                value={customPhotoUrls}
                onChange={(e) => setCustomPhotoUrls(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={handleAddCustomUrls}
                className="sm:w-36 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
              >
                <Images className="w-4 h-4" />
                <span>{lang === 'zh' ? '加入分析列表' : 'Add to List'}</span>
              </button>
            </div>
          </div>

          {/* Method 3: Advanced Google Cloud OAuth Client ID (Optional) */}
          <div className="bg-slate-850/60 rounded-2xl p-4 border border-slate-700/40">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-300">
                  {lang === 'zh' ? '方式 3 (進階同工)：自訂 Google Cloud OAuth Client ID 官方授權' : 'Method 3 (Advanced): Custom Google Cloud OAuth Client ID'}
                </span>
              </div>
              <span className="text-xs text-amber-400 underline">
                {showAdvancedAuth ? (lang === 'zh' ? '收起' : 'Hide') : (lang === 'zh' ? '展開設定' : 'Configure')}
              </span>
            </div>

            {showAdvancedAuth && (
              <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {lang === 'zh'
                    ? '若需使用 Google 官方授權彈窗，請至 Google Cloud Console 建立 OAuth 2.0 Client ID (Web Application)，並將本站網址加入授權來源。'
                    : 'To use Google OAuth Pop-up, create an OAuth 2.0 Web Client ID in Google Cloud Console and add this app URL to authorized origins.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="e.g. xxxxxxxx.apps.googleusercontent.com"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    onClick={handleGoogleSignIn}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '以自訂 ID 登入' : 'Login with ID'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Batch Action Toolbar */}
          {analyzedList.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const allSelected = analyzedList.every((i) => i.selected);
                    setAnalyzedList((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
                >
                  {analyzedList.every((i) => i.selected) 
                    ? (lang === 'zh' ? '取消全選' : 'Deselect All') 
                    : (lang === 'zh' ? '全選照片' : 'Select All')}
                </button>

                <span className="text-xs text-slate-400">
                  {lang === 'zh' 
                    ? `已勾選 ${analyzedList.filter((i) => i.selected).length} / ${analyzedList.length} 張`
                    : `${analyzedList.filter((i) => i.selected).length} / ${analyzedList.length} Selected`}
                </span>
              </div>

              {/* AI Auto-Classify Batch Button */}
              <button
                onClick={handleBatchAICategorization}
                disabled={isBatchAnalyzing || analyzedList.filter((i) => i.selected).length === 0}
                className={`inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all ${
                  isBatchAnalyzing
                    ? 'bg-amber-800 text-amber-200 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white hover:scale-[1.02]'
                }`}
              >
                {isBatchAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>
                      {lang === 'zh'
                        ? `Gemini AI 辨識中 (${batchProgress.current}/${batchProgress.total})...`
                        : `Gemini AI Analyzing (${batchProgress.current}/${batchProgress.total})...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>{lang === 'zh' ? '✨ Gemini AI 一鍵智慧分類與生成說明' : '✨ Gemini AI Auto-Classify & Generate'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Photos Grid with AI Card Status */}
          {isLoadingMedia ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-slate-300 text-sm">{lang === 'zh' ? '正在讀取 Google Photos 相簿照片...' : 'Loading Google Photos library...'}</p>
            </div>
          ) : analyzedList.length === 0 ? (
            <div className="py-16 text-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-800">
              <Images className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {lang === 'zh' ? '尚未載入照片。請點選上方「授權連線 Google Photos」或「貼上照片網址」。' : 'No photos loaded yet. Click Authorize Google Photos or paste URLs above.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {analyzedList.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-slate-800 rounded-2xl border transition-all p-4 flex flex-col justify-between ${
                    item.selected ? 'border-amber-500/60 shadow-lg shadow-amber-950/30' : 'border-slate-700/60 opacity-60'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox & Thumbnail */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                      <img
                        src={item.rawUrl}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // fallback placeholder
                          (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80');
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setAnalyzedList((prev) => {
                            const clone = [...prev];
                            clone[idx] = { ...clone[idx], selected: val };
                            return clone;
                          });
                        }}
                        className="absolute top-2 left-2 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />

                      {item.isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-amber-400 p-2 text-center">
                          <Loader2 className="w-5 h-5 animate-spin mb-1" />
                          <span className="text-[10px] font-semibold">{lang === 'zh' ? 'AI 分析中' : 'Analyzing'}</span>
                        </div>
                      )}
                    </div>

                    {/* Meta & AI Badges */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Category Badge & Confidence */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${getCategoryColor(item.category)}`}>
                            <Tag className="w-3 h-3" />
                            <span>
                              {item.categoryNameZh || (
                                item.category === 'worship' ? '主日崇拜與聖餐' :
                                item.category === 'fellowship' ? '團契生活與愛宴' :
                                item.category === 'celebration' ? '節期慶典與洗禮' :
                                item.category === 'retreat' ? '退修會與戶外' : '歷史足跡與同工'
                              )}
                            </span>
                          </span>

                          {item.categoryConfidence && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                              {Math.round(item.categoryConfidence * 100)}% 信心度
                            </span>
                          )}
                        </div>

                        {/* Title input / display */}
                        <input
                          type="text"
                          value={lang === 'zh' ? item.titleZh : item.titleEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAnalyzedList((prev) => {
                              const clone = [...prev];
                              clone[idx] = lang === 'zh' ? { ...clone[idx], titleZh: val } : { ...clone[idx], titleEn: val };
                              return clone;
                            });
                          }}
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                          placeholder="照片標題"
                        />

                        {/* AI Generated Description */}
                        <textarea
                          rows={2}
                          value={lang === 'zh' ? item.descriptionZh : item.descriptionEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAnalyzedList((prev) => {
                              const clone = [...prev];
                              clone[idx] = lang === 'zh' ? { ...clone[idx], descriptionZh: val } : { ...clone[idx], descriptionEn: val };
                              return clone;
                            });
                          }}
                          className="mt-1.5 w-full bg-slate-900/60 border border-slate-750 rounded-lg p-2 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
                          placeholder="AI 自動生成之屬靈短文與聚會回憶..."
                        />
                      </div>

                      {/* Detected Tags & Location */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {item.detectedTags && item.detectedTags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-slate-750 text-slate-300 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Category Selector & Individual AI Trigger */}
                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400">{lang === 'zh' ? '分類：' : 'Category:'}</span>
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setAnalyzedList((prev) => {
                            const clone = [...prev];
                            clone[idx] = { ...clone[idx], category: val };
                            return clone;
                          });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-amber-300 focus:outline-none"
                      >
                        <option value="groups">2023 小組聚會</option>
                        <option value="children">兒童機器人課程</option>
                        <option value="christmas">2016 耶誕節與愛宴</option>
                        <option value="retreat">2015 靈修會營會</option>
                        <option value="outdoor">2015 室外禮拜</option>
                        <option value="lunar">2015 農曆新年</option>
                        <option value="heritage">2013 加盟台福一週年</option>
                        <option value="worship">主日崇拜與聖餐</option>
                      </select>
                    </div>

                    <button
                      onClick={() => analyzeSinglePhoto(idx)}
                      disabled={item.isAnalyzing}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{item.analyzed ? (lang === 'zh' ? '重新 AI 分析' : 'Re-analyze') : (lang === 'zh' ? '單張 AI 分析' : 'AI Analyze')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            {lang === 'zh'
              ? '✨ 匯入後照片將自動同步至加南照片走廊與所屬分類相簿中'
              : '✨ Photos will be organized into respective categories and albums.'}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              {lang === 'zh' ? '取消' : 'Cancel'}
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={analyzedList.filter((i) => i.selected).length === 0}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {lang === 'zh'
                  ? `確認匯入 ${analyzedList.filter((i) => i.selected).length} 張照片至走廊`
                  : `Import ${analyzedList.filter((i) => i.selected).length} Photos`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
