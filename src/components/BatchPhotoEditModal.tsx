import React, { useState } from 'react';
import { GalleryPhoto, GalleryCategory } from '../types';
import {
  X,
  Sparkles,
  Loader2,
  Trash2,
  Check,
  Tag,
  Calendar,
  MapPin,
  FolderHeart,
  SlidersHorizontal,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  Wand2,
  CheckCircle2,
  Info
} from 'lucide-react';

interface BatchPhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: GalleryPhoto[];
  categories: GalleryCategory[];
  lang: 'zh' | 'en';
  onSaveBatchPhotos?: (updatedPhotos: GalleryPhoto[]) => void;
  onSaveBatch?: (updatedPhotos: GalleryPhoto[]) => void;
  onDeleteBatchPhotos?: (photoIds: string[]) => void;
  onDeleteBatch?: (photoIds: string[]) => void;
}

export const BatchPhotoEditModal: React.FC<BatchPhotoEditModalProps> = ({
  isOpen,
  onClose,
  selectedPhotos,
  categories,
  lang,
  onSaveBatchPhotos,
  onSaveBatch,
  onDeleteBatchPhotos,
  onDeleteBatch
}) => {
  if (!isOpen || selectedPhotos.length === 0) return null;

  // Local state copy of all selected photos being edited
  const [photoList, setPhotoList] = useState<GalleryPhoto[]>(() =>
    selectedPhotos.map(p => ({ ...p }))
  );

  // Active view tab: 'bulk' (unified apply), 'list' (individual fine-tune), 'ai' (batch AI auto-categorization)
  const [activeTab, setActiveTab] = useState<'bulk' | 'list'>('bulk');

  // Fields to bulk apply
  const [bulkCategory, setBulkCategory] = useState<string>(
    categories.find(c => c.key !== 'all')?.key || 'worship'
  );
  const [applyCategory, setApplyCategory] = useState<boolean>(true);

  const [bulkAlbumZh, setBulkAlbumZh] = useState<string>('');
  const [applyAlbumZh, setApplyAlbumZh] = useState<boolean>(false);

  const [bulkDate, setBulkDate] = useState<string>(new Date().toISOString().slice(0, 7));
  const [applyDate, setApplyDate] = useState<boolean>(false);

  const [bulkLocationZh, setBulkLocationZh] = useState<string>('加南新生基督教會');
  const [applyLocationZh, setApplyLocationZh] = useState<boolean>(false);

  const [bulkTitleMode, setBulkTitleMode] = useState<'replace' | 'prefix'>('replace');
  const [bulkTitleZh, setBulkTitleZh] = useState<string>('');
  const [bulkTitlePrefix, setBulkTitlePrefix] = useState<string>('');
  const [applyTitleZh, setApplyTitleZh] = useState<boolean>(false);

  const [bulkTitleEnMode, setBulkTitleEnMode] = useState<'replace' | 'prefix'>('replace');
  const [bulkTitleEn, setBulkTitleEn] = useState<string>('');
  const [bulkTitleEnPrefix, setBulkTitleEnPrefix] = useState<string>('');
  const [applyTitleEn, setApplyTitleEn] = useState<boolean>(false);

  const [bulkDescriptionZh, setBulkDescriptionZh] = useState<string>('');
  const [applyDescriptionZh, setApplyDescriptionZh] = useState<boolean>(false);

  const [bulkDescriptionEn, setBulkDescriptionEn] = useState<string>('');
  const [applyDescriptionEn, setApplyDescriptionEn] = useState<boolean>(false);

  // Gemini AI Batch Analysis State
  const [isBatchAiRunning, setIsBatchAiRunning] = useState<boolean>(false);
  const [aiProgress, setAiProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [analyzingSingleId, setAnalyzingSingleId] = useState<string | null>(null);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const selectableCategories = (categories || []).filter(c => c.key !== 'all');

  // Apply chosen bulk settings to all photos in the working list
  const handleApplyBulkSettings = () => {
    let appliedCount = 0;
    const updated = photoList.map((photo, index) => {
      const next = { ...photo };

      if (applyCategory && bulkCategory) {
        next.category = bulkCategory;
        const matched = categories.find(c => c.key === bulkCategory);
        if (matched && (!applyAlbumZh || !bulkAlbumZh.trim())) {
          next.albumNameZh = matched.labelZh;
          next.albumName = matched.labelEn;
        }
      }

      if (applyAlbumZh && bulkAlbumZh.trim()) {
        next.albumNameZh = bulkAlbumZh.trim();
        next.albumName = bulkAlbumZh.trim();
      }

      if (applyDate && bulkDate) {
        next.date = bulkDate;
      }

      if (applyLocationZh && bulkLocationZh.trim()) {
        next.locationZh = bulkLocationZh.trim();
      }

      if (applyTitleZh) {
        if (bulkTitleMode === 'replace' && bulkTitleZh.trim()) {
          next.titleZh = bulkTitleZh.trim();
        } else if (bulkTitleMode === 'prefix' && bulkTitlePrefix.trim()) {
          const cleanTitle = next.titleZh || next.title || '';
          if (!cleanTitle.startsWith(bulkTitlePrefix.trim())) {
            next.titleZh = `${bulkTitlePrefix.trim()} ${cleanTitle}`.trim();
          }
        }
      }

      if (applyTitleEn) {
        if (bulkTitleEnMode === 'replace' && bulkTitleEn.trim()) {
          next.title = bulkTitleEn.trim();
        } else if (bulkTitleEnMode === 'prefix' && bulkTitleEnPrefix.trim()) {
          const cleanTitle = next.title || '';
          if (!cleanTitle.startsWith(bulkTitleEnPrefix.trim())) {
            next.title = `${bulkTitleEnPrefix.trim()} ${cleanTitle}`.trim();
          }
        }
      }

      if (applyDescriptionZh && bulkDescriptionZh.trim()) {
        next.descriptionZh = bulkDescriptionZh.trim();
      }

      if (applyDescriptionEn && bulkDescriptionEn.trim()) {
        next.description = bulkDescriptionEn.trim();
      }

      return next;
    });

    setPhotoList(updated);
    appliedCount = updated.length;

    setStatusMsg(
      lang === 'zh'
        ? `✅ 已將勾選的設定統一套用至全部 ${appliedCount} 張照片！可於下方清單確認或直接儲存。`
        : `✅ Bulk settings applied to all ${appliedCount} photos! Review below or save.`
    );
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Update a single photo's property in the list
  const handleUpdateItem = (id: string, updates: Partial<GalleryPhoto>) => {
    setPhotoList(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Remove photo from current batch selection
  const handleRemoveFromBatch = (id: string) => {
    setPhotoList(prev => prev.filter(p => p.id !== id));
  };

  // Run Gemini AI on a single photo
  const handleRunAiForSingle = async (photo: GalleryPhoto) => {
    setAnalyzingSingleId(photo.id);
    try {
      const res = await fetch('/api/gallery/ai-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: photo.imageUrl.startsWith('data:') ? undefined : photo.imageUrl,
          imageBase64: photo.imageUrl.startsWith('data:') ? photo.imageUrl : undefined,
          photoContext: {
            title: photo.titleZh || photo.title,
            description: photo.descriptionZh || photo.description,
            account: 'web@canaannewlife.org',
            currentDate: photo.date
          }
        })
      });

      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      const analysis = data.analysis || data;

      setPhotoList(prev =>
        prev.map(p =>
          p.id === photo.id
            ? {
                ...p,
                titleZh: analysis.titleZh || p.titleZh,
                title: analysis.titleEn || p.title,
                category: analysis.category || p.category,
                descriptionZh: analysis.descriptionZh || p.descriptionZh,
                description: analysis.descriptionEn || p.description,
                albumNameZh: analysis.albumNameZh || p.albumNameZh,
                albumName: analysis.albumNameEn || p.albumName,
                locationZh: analysis.locationZh || p.locationZh,
                date: analysis.suggestedDate || p.date
              }
            : p
        )
      );

      setStatusMsg(lang === 'zh' ? `✨ 已由 Gemini AI 完成「${photo.titleZh || photo.title}」之分類與圖說辨識！` : '✨ AI analysis completed!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert(lang === 'zh' ? `AI 分析失敗: ${err.message}` : `AI analysis error: ${err.message}`);
    } finally {
      setAnalyzingSingleId(null);
    }
  };

  // Run Gemini AI for all photos in batch
  const handleRunBatchAiAll = async () => {
    if (photoList.length === 0) return;
    setIsBatchAiRunning(true);
    setAiProgress({ current: 0, total: photoList.length });

    const updated = [...photoList];
    for (let i = 0; i < updated.length; i++) {
      setAiProgress({ current: i + 1, total: updated.length });
      const photo = updated[i];

      try {
        const res = await fetch('/api/gallery/ai-categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: photo.imageUrl.startsWith('data:') ? undefined : photo.imageUrl,
            imageBase64: photo.imageUrl.startsWith('data:') ? photo.imageUrl : undefined,
            photoContext: {
              title: photo.titleZh || photo.title,
              description: photo.descriptionZh || photo.description,
              account: 'web@canaannewlife.org',
              currentDate: photo.date
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const analysis = data.analysis || data;
          if (analysis) {
            updated[i] = {
              ...photo,
              titleZh: analysis.titleZh || photo.titleZh,
              title: analysis.titleEn || photo.title,
              category: analysis.category || photo.category,
              descriptionZh: analysis.descriptionZh || photo.descriptionZh,
              description: analysis.descriptionEn || photo.description,
              albumNameZh: analysis.albumNameZh || photo.albumNameZh,
              albumName: analysis.albumNameEn || photo.albumName,
              locationZh: analysis.locationZh || photo.locationZh,
              date: analysis.suggestedDate || photo.date
            };
            setPhotoList([...updated]);
          }
        }
      } catch (err) {
        console.warn(`Batch AI error on photo #${i + 1}`, err);
      }
    }

    setIsBatchAiRunning(false);
    setStatusMsg(
      lang === 'zh'
        ? `✨ Gemini AI 已全部完成 ${updated.length} 張照片的智慧辨識與分類！`
        : `✨ Gemini AI completed classification for all ${updated.length} photos!`
    );
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Submit and save batch changes
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoList.length === 0) {
      onClose();
      return;
    }
    const saveFn = onSaveBatchPhotos || onSaveBatch;
    if (saveFn) {
      saveFn(photoList);
    }
    onClose();
  };

  // Batch delete all selected photos
  const handleDeleteBatch = () => {
    if (
      window.confirm(
        lang === 'zh'
          ? `確定要從照片走廊中刪除這 ${photoList.length} 張相片嗎？此操作無法復原。`
          : `Are you sure you want to remove these ${photoList.length} photos from the gallery?`
      )
    ) {
      const deleteFn = onDeleteBatchPhotos || onDeleteBatch;
      if (deleteFn) {
        deleteFn(photoList.map(p => p.id));
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl border border-amber-500/50 max-w-5xl w-full p-5 sm:p-7 shadow-2xl text-white my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center space-x-2">
                <span>{lang === 'zh' ? '管理員：批次修改多張照片資訊與分類' : 'Batch Edit Photo Information & Categories'}</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-sans px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  {photoList.length} {lang === 'zh' ? '張照片' : 'photos selected'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh'
                  ? '可一次將多張照片變更至指定分類、活動相簿或日期，亦可個別快速微調與一鍵 Gemini AI 辨識'
                  : 'Bulk update categories, albums, and dates, or fine-tune individually with Gemini AI auto-classification.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Message */}
        {statusMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 flex-shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Tab Switcher & Batch AI Button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bulk'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{lang === 'zh' ? '⚡ 統一批量設定 (快速套用)' : '⚡ Bulk Settings (Apply All)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'zh' ? `📝 清單快速個別微調 (${photoList.length})` : `📝 Fine-Tune List (${photoList.length})`}</span>
            </button>
          </div>

          {/* One-Click Batch AI Auto-Fill */}
          <button
            type="button"
            onClick={handleRunBatchAiAll}
            disabled={isBatchAiRunning || photoList.length === 0}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition-all disabled:opacity-50"
            title="由 Gemini AI 自動辨識全部相片內容與填寫分類"
          >
            {isBatchAiRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                <span>
                  {lang === 'zh'
                    ? `AI 辨識中 (${aiProgress.current}/${aiProgress.total})...`
                    : `AI Analyzing (${aiProgress.current}/${aiProgress.total})...`}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'zh' ? '✨ Gemini AI 一鍵自動分類全部' : '✨ Gemini AI Auto-Classify All'}</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <form onSubmit={handleSaveAll} className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* Selected Photos Thumbnails Strip */}
          <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-750 flex items-center gap-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap pl-1">
              {lang === 'zh' ? '已選照片縮圖：' : 'Selected Thumbnails:'}
            </span>
            {photoList.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 group"
                title={photo.titleZh || photo.title}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.titleZh}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFromBatch(photo.id)}
                  className="absolute inset-0 bg-slate-950/80 text-rose-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="從批次修改中移除"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="absolute bottom-0 right-0 bg-slate-900/90 text-[9px] text-amber-300 font-bold px-1 rounded-tl">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* TAB 1: BULK SETTINGS (Unified Apply to all selected photos) */}
          {activeTab === 'bulk' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">
                      {lang === 'zh' ? '設定欲統一修改的欄位 (勾選欲套用的項目)：' : 'Choose Fields to Bulk Apply to All Selected Photos:'}
                    </h4>
                  </div>
                  <span className="text-xs text-amber-300">
                    {lang === 'zh' ? '可單選一項（如僅改分類）或多項組合' : 'Select one or more fields'}
                  </span>
                </div>

                {/* 1. Category Field */}
                <div className={`p-3.5 rounded-xl border transition-all ${applyCategory ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={applyCategory}
                        onChange={(e) => setApplyCategory(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'zh' ? '🎯 統一變更所屬分類 (Category)' : '🎯 Change Category'}</span>
                      </span>
                    </label>

                    <select
                      disabled={!applyCategory}
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="flex-1 max-w-xs sm:max-w-md bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-amber-400 disabled:opacity-40"
                    >
                      {selectableCategories.map(cat => (
                        <option key={cat.key} value={cat.key}>
                          {cat.labelZh} ({cat.labelEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Album Name Field */}
                <div className={`p-3.5 rounded-xl border transition-all ${applyAlbumZh ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={applyAlbumZh}
                        onChange={(e) => setApplyAlbumZh(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                        <FolderHeart className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'zh' ? '📁 統一所屬相簿名稱 (Album Name)' : '📁 Album Name'}</span>
                      </span>
                    </label>

                    <input
                      type="text"
                      disabled={!applyAlbumZh}
                      placeholder={lang === 'zh' ? '例如：2026 夏令營、2025 浸禮特輯' : 'e.g. 2026 Summer Retreat'}
                      value={bulkAlbumZh}
                      onChange={(e) => setBulkAlbumZh(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* 3. Date & Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Date */}
                  <div className={`p-3.5 rounded-xl border transition-all ${applyDate ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={applyDate}
                          onChange={(e) => setApplyDate(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-white flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'zh' ? '統一活動年月' : 'Date'}</span>
                        </span>
                      </label>

                      <input
                        type="month"
                        disabled={!applyDate}
                        value={bulkDate}
                        onChange={(e) => setBulkDate(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className={`p-3.5 rounded-xl border transition-all ${applyLocationZh ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={applyLocationZh}
                          onChange={(e) => setApplyLocationZh(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-white flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'zh' ? '統一行動地點' : 'Location'}</span>
                        </span>
                      </label>

                      <input
                        type="text"
                        disabled={!applyLocationZh}
                        placeholder="加南新生基督教會 主堂"
                        value={bulkLocationZh}
                        onChange={(e) => setBulkLocationZh(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Title (Chinese) Field with Full Replace or Prefix Mode */}
                <div className={`p-3.5 rounded-xl border transition-all ${applyTitleZh ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={applyTitleZh}
                          onChange={(e) => setApplyTitleZh(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {lang === 'zh' ? '🏷️ 統一主題標題 (中文)' : '🏷️ Bulk Title (Chinese)'}
                        </span>
                      </label>

                      {/* Mode Toggle: Full Replace or Prefix */}
                      <div className="flex items-center space-x-2 text-xs">
                        <button
                          type="button"
                          disabled={!applyTitleZh}
                          onClick={() => setBulkTitleMode('replace')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            bulkTitleMode === 'replace' 
                              ? 'bg-amber-500 text-slate-950 shadow-sm' 
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          } disabled:opacity-40`}
                        >
                          {lang === 'zh' ? '完整取代標題' : 'Replace Title'}
                        </button>
                        <button
                          type="button"
                          disabled={!applyTitleZh}
                          onClick={() => setBulkTitleMode('prefix')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            bulkTitleMode === 'prefix' 
                              ? 'bg-amber-500 text-slate-950 shadow-sm' 
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          } disabled:opacity-40`}
                        >
                          {lang === 'zh' ? '僅加標題前綴' : 'Add Prefix'}
                        </button>
                      </div>
                    </div>

                    {bulkTitleMode === 'replace' ? (
                      <input
                        type="text"
                        disabled={!applyTitleZh}
                        placeholder={lang === 'zh' ? '例如：2026 主日崇拜與聖餐記念' : 'Title in Chinese'}
                        value={bulkTitleZh}
                        onChange={(e) => setBulkTitleZh(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    ) : (
                      <input
                        type="text"
                        disabled={!applyTitleZh}
                        placeholder={lang === 'zh' ? '例如：【小組聚會】 或 【2026 夏令營】' : 'Title prefix'}
                        value={bulkTitlePrefix}
                        onChange={(e) => setBulkTitlePrefix(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    )}
                  </div>
                </div>

                {/* 5. Title (English) Field with Full Replace or Prefix Mode */}
                <div className={`p-3.5 rounded-xl border transition-all ${applyTitleEn ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2.5 cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={applyTitleEn}
                          onChange={(e) => setApplyTitleEn(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {lang === 'zh' ? '🏷️ 統一主題標題 (英文)' : '🏷️ Bulk Title (English)'}
                        </span>
                      </label>

                      {/* Mode Toggle: Full Replace or Prefix */}
                      <div className="flex items-center space-x-2 text-xs">
                        <button
                          type="button"
                          disabled={!applyTitleEn}
                          onClick={() => setBulkTitleEnMode('replace')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            bulkTitleEnMode === 'replace' 
                              ? 'bg-amber-500 text-slate-950 shadow-sm' 
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          } disabled:opacity-40`}
                        >
                          {lang === 'zh' ? '完整取代標題' : 'Replace Title'}
                        </button>
                        <button
                          type="button"
                          disabled={!applyTitleEn}
                          onClick={() => setBulkTitleEnMode('prefix')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            bulkTitleEnMode === 'prefix' 
                              ? 'bg-amber-500 text-slate-950 shadow-sm' 
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          } disabled:opacity-40`}
                        >
                          {lang === 'zh' ? '僅加標題前綴' : 'Add Prefix'}
                        </button>
                      </div>
                    </div>

                    {bulkTitleEnMode === 'replace' ? (
                      <input
                        type="text"
                        disabled={!applyTitleEn}
                        placeholder={lang === 'zh' ? '例如：Sunday Worship & Holy Communion Service' : 'Title in English'}
                        value={bulkTitleEn}
                        onChange={(e) => setBulkTitleEn(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    ) : (
                      <input
                        type="text"
                        disabled={!applyTitleEn}
                        placeholder={lang === 'zh' ? '例如：[Fellowship] or [Summer Camp 2026]' : 'English Title prefix'}
                        value={bulkTitleEnPrefix}
                        onChange={(e) => setBulkTitleEnPrefix(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    )}
                  </div>
                </div>

                {/* 6. Description / Thanksgiving Record Field (Chinese) */}
                <div className={`p-3.5 rounded-xl border transition-all ${applyDescriptionZh ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyDescriptionZh}
                        onChange={(e) => setApplyDescriptionZh(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {lang === 'zh' ? '✍️ 統一照片敘述 / 感恩紀錄 (中文)' : '✍️ Bulk Description / Thanksgiving Record (Chinese)'}
                      </span>
                    </label>

                    <textarea
                      rows={2}
                      disabled={!applyDescriptionZh}
                      placeholder={lang === 'zh' ? '輸入欲統一套用至所有照片的屬靈感言、主的恩典或聚會紀錄 (中文)...' : 'Enter Chinese description or thanksgiving record...'}
                      value={bulkDescriptionZh}
                      onChange={(e) => setBulkDescriptionZh(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40 leading-relaxed"
                    />
                  </div>
                </div>

                {/* 7. Description Field (English) */}
                <div className={`p-3.5 rounded-xl border transition-all ${applyDescriptionEn ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/60'}`}>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyDescriptionEn}
                        onChange={(e) => setApplyDescriptionEn(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-600 cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {lang === 'zh' ? '✍️ 統一照片敘述 (英文)' : '✍️ Bulk Description (English)'}
                      </span>
                    </label>

                    <textarea
                      rows={2}
                      disabled={!applyDescriptionEn}
                      placeholder={lang === 'zh' ? '輸入欲統一套用至所有照片的英文照片敘述與說明...' : 'Enter English description for all photos...'}
                      value={bulkDescriptionEn}
                      onChange={(e) => setBulkDescriptionEn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-40 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Trigger Bulk Apply Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyBulkSettings}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg flex items-center space-x-2 transition-all"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>
                      {lang === 'zh'
                        ? `⚡ 立即套用勾選設定至 ${photoList.length} 張相片`
                        : `Apply Settings to All ${photoList.length} Photos`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INDIVIDUAL FINE-TUNE LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-750 text-xs text-slate-300 flex items-center justify-between">
                <span>
                  {lang === 'zh'
                    ? `可在下方直接逐張修改中英文標題、分類、相簿與中英文敘述，或個別點擊「AI 辨識」`
                    : 'Edit each photo directly (Chinese/English title & description) or trigger AI analysis.'}
                </span>
                <span className="font-semibold text-amber-300">共 {photoList.length} 張</span>
              </div>

              {photoList.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col sm:flex-row gap-4 relative group hover:border-amber-500/40 transition-all"
                >
                  {/* Thumbnail & Quick Remove */}
                  <div className="relative w-full sm:w-36 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 self-start">
                    <img
                      src={photo.imageUrl}
                      alt={photo.titleZh}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (photo.fallbackImageUrl && e.currentTarget.src !== photo.fallbackImageUrl) {
                          e.currentTarget.src = photo.fallbackImageUrl;
                        }
                      }}
                    />
                    <span className="absolute top-1.5 left-1.5 bg-slate-900/85 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromBatch(photo.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/90 text-rose-300 hover:text-white hover:bg-rose-600 transition-colors"
                      title={lang === 'zh' ? '從批次清單中移除' : 'Remove from batch'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Form fields for this photo */}
                  <div className="flex-1 space-y-2.5 text-xs">
                    {/* Chinese & English Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-0.5">
                          {lang === 'zh' ? '主題標題 (中文)' : 'Title (Chinese)'}
                        </label>
                        <input
                          type="text"
                          value={photo.titleZh || ''}
                          onChange={(e) => handleUpdateItem(photo.id, { titleZh: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-0.5">
                          {lang === 'zh' ? '主題標題 (英文)' : 'Title (English)'}
                        </label>
                        <input
                          type="text"
                          value={photo.title || ''}
                          onChange={(e) => handleUpdateItem(photo.id, { title: e.target.value })}
                          placeholder="English title"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Category, Album Name, Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-0.5">
                          {lang === 'zh' ? '相片分類 (Category)' : 'Category'}
                        </label>
                        <select
                          value={photo.category}
                          onChange={(e) => handleUpdateItem(photo.id, { category: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                        >
                          {selectableCategories.map(cat => (
                            <option key={cat.key} value={cat.key}>
                              {cat.labelZh} ({cat.labelEn})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-0.5">
                          {lang === 'zh' ? '所屬相簿名稱' : 'Album Name'}
                        </label>
                        <input
                          type="text"
                          value={photo.albumNameZh || ''}
                          onChange={(e) => handleUpdateItem(photo.id, { albumNameZh: e.target.value })}
                          placeholder="例如: 2026 夏令營"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-0.5">
                          {lang === 'zh' ? '活動年月 (YYYY-MM)' : 'Date'}
                        </label>
                        <input
                          type="month"
                          value={photo.date || ''}
                          onChange={(e) => handleUpdateItem(photo.id, { date: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Chinese & English Descriptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[11px] text-slate-400 font-semibold">
                            {lang === 'zh' ? '照片敘述 / 感恩紀錄 (中文)' : 'Description (Chinese)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRunAiForSingle(photo)}
                            disabled={analyzingSingleId === photo.id}
                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold disabled:opacity-50"
                          >
                            {analyzingSingleId === photo.id ? (
                              <>
                                <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-300" />
                                <span>辨識中...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                <span>{lang === 'zh' ? '✨ AI 重新辨識' : '✨ AI Analyze'}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={photo.descriptionZh || ''}
                          onChange={(e) => handleUpdateItem(photo.id, { descriptionZh: e.target.value })}
                          placeholder="聚會回憶、主的恩典與事奉感動..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 font-semibold mb-0.5">
                          {lang === 'zh' ? '照片敘述 (英文)' : 'Description (English)'}
                        </label>
                        <input
                          type="text"
                          value={photo.description || ''}
                          onChange={(e) => handleUpdateItem(photo.id, { description: e.target.value })}
                          placeholder="English description..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Bottom Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
            {/* Delete Batch Option */}
            {onDeleteBatchPhotos ? (
              <button
                type="button"
                onClick={handleDeleteBatch}
                className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                title="刪除全部選取的照片"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? `批次刪除 (${photoList.length} 張)` : `Delete Selected (${photoList.length})`}</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={photoList.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 disabled:opacity-40"
              >
                <Check className="w-4 h-4" />
                <span>
                  {lang === 'zh'
                    ? `儲存全部修改 (${photoList.length} 張相片)`
                    : `Save All Changes (${photoList.length} Photos)`}
                </span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
