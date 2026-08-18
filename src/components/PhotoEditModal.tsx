import React, { useState, useEffect } from 'react';
import { GalleryPhoto, GalleryCategory } from '../types';
import {
  X,
  Edit3,
  Calendar,
  MapPin,
  Tag,
  Sparkles,
  Loader2,
  Trash2,
  Check,
  FolderHeart
} from 'lucide-react';

interface PhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: GalleryPhoto | null;
  categories: GalleryCategory[];
  lang: 'zh' | 'en';
  onSavePhoto: (updatedPhoto: GalleryPhoto) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export const PhotoEditModal: React.FC<PhotoEditModalProps> = ({
  isOpen,
  onClose,
  photo,
  categories,
  lang,
  onSavePhoto,
  onDeletePhoto
}) => {
  if (!isOpen || !photo) return null;

  const [formData, setFormData] = useState<GalleryPhoto>({ ...photo });
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sync state whenever photo prop changes
  useEffect(() => {
    if (photo) {
      setFormData({ ...photo });
    }
  }, [photo]);

  // Available selectable categories (exclude 'all')
  const selectableCategories = (categories || []).filter(c => c.key !== 'all');

  // Trigger Gemini AI to re-classify and generate captions for this photo
  const handleAiReanalyze = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/gallery/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: formData.imageUrl,
          photoContext: {
            title: formData.title,
            description: formData.description,
            currentCategory: formData.category
          }
        })
      });

      if (!res.ok) throw new Error('AI analysis request failed');
      const data = await res.json();
      const info = data.analysis || data;

      setFormData(prev => ({
        ...prev,
        titleZh: info.titleZh || prev.titleZh,
        title: info.titleEn || prev.title,
        descriptionZh: info.descriptionZh || prev.descriptionZh,
        description: info.descriptionEn || prev.description,
        category: info.category || prev.category,
        albumNameZh: info.albumNameZh || prev.albumNameZh,
        albumName: info.albumNameEn || prev.albumName,
        locationZh: info.locationZh || prev.locationZh,
        location: info.locationEn || prev.location,
        date: info.suggestedDate || prev.date
      }));

      setStatusMsg(lang === 'zh' ? '✨ Gemini AI 已自動優化分類與說明！' : '✨ Gemini AI analyzed and refined details!');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err: any) {
      console.error("AI error:", err);
      setStatusMsg(lang === 'zh' ? 'AI 分析失敗，請手動修改' : 'AI analysis failed, please edit manually');
      setTimeout(() => setStatusMsg(null), 3500);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleCategorySelect = (newCategoryKey: string) => {
    const matchedCategory = selectableCategories.find(c => c.key === newCategoryKey);
    setFormData(prev => ({
      ...prev,
      category: newCategoryKey,
      albumNameZh: matchedCategory ? matchedCategory.labelZh : prev.albumNameZh,
      albumName: matchedCategory ? matchedCategory.labelEn : prev.albumName
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePhoto(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-amber-500/40 max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white">
                {lang === 'zh' ? '管理員：修改照片資訊與調整分類' : 'Edit Photo & Adjust Category'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh' ? '調整所屬相簿分類、中英文標題、活動日期與感恩描述' : 'Update category, title, date, location, and description'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 flex-shrink-0">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Photo Preview & AI Button */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-750 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-36 h-24 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
              <img
                src={formData.imageUrl}
                alt={formData.titleZh}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (formData.fallbackImageUrl && e.currentTarget.src !== formData.fallbackImageUrl) {
                    e.currentTarget.src = formData.fallbackImageUrl;
                  }
                }}
              />
            </div>
            <div className="flex-1 text-xs space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{lang === 'zh' ? '照片 ID:' : 'Photo ID:'} <code className="text-amber-300 font-mono">{formData.id}</code></span>
                {formData.account && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-mono">
                    {formData.account}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAiReanalyze}
                disabled={isAiAnalyzing}
                className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {isAiAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>{lang === 'zh' ? 'Gemini 3.7 AI 智慧識別中...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'zh' ? '✨ Gemini AI 自動重新辨識與填寫' : '✨ Re-analyze with Gemini AI'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Selector (Primary Goal of User) */}
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'zh' ? '🎯 調整照片所屬相簿分類 (Category)' : '🎯 Select Photo Category'}</span>
              </label>
              {formData.category && (
                <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-semibold">
                  {selectableCategories.find(c => c.key === formData.category)?.labelZh || formData.category}
                </span>
              )}
            </div>
            <select
              value={formData.category || ''}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-amber-400 shadow-inner cursor-pointer"
            >
              {selectableCategories.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.labelZh} ({cat.labelEn})
                </option>
              ))}
            </select>
          </div>

          {/* Titles: Chinese & English */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'zh' ? '主題標題 (中文) *' : 'Title (Chinese) *'}
              </label>
              <input
                type="text"
                required
                value={formData.titleZh || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, titleZh: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'zh' ? '主題標題 (英文)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'zh' ? '拍攝/活動年月' : 'Date (YYYY-MM)'}</span>
              </label>
              <input
                type="text"
                value={formData.date || ''}
                placeholder="2024-05"
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'zh' ? '地點名稱 (中文)' : 'Location'}</span>
              </label>
              <input
                type="text"
                value={formData.locationZh || ''}
                placeholder="加南新生基督教會 主堂"
                onChange={(e) => setFormData(prev => ({ ...prev, locationZh: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Album Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <FolderHeart className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'zh' ? '相簿名稱 (中文標籤)' : 'Album Name'}</span>
            </label>
            <input
              type="text"
              value={formData.albumNameZh || ''}
              placeholder="例如：2023 小組聚會、兒童機器人課程"
              onChange={(e) => setFormData(prev => ({ ...prev, albumNameZh: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description Chinese */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'zh' ? '照片敘述 / 感恩紀錄 (中文)' : 'Description (Chinese)'}
            </label>
            <textarea
              rows={3}
              value={formData.descriptionZh || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionZh: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Description English */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'zh' ? '照片敘述 (英文)' : 'Description (English)'}
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {onDeletePhoto ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(lang === 'zh' ? '確定要從照片走廊移除這張照片嗎？' : 'Remove photo from gallery?')) {
                    onDeletePhoto(formData.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '刪除照片' : 'Delete'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '儲存照片修改' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
