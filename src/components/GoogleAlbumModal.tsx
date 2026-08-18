import React, { useState, useEffect } from 'react';
import { Language, GoogleAlbum, GalleryCategory } from '../types';
import { X, Calendar, Link as LinkIcon, FolderHeart, Image as ImageIcon, Sparkles, Check, Upload, Trash2 } from 'lucide-react';

interface GoogleAlbumModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (album: GoogleAlbum) => void;
  albumToEdit?: GoogleAlbum | null;
  categories: GalleryCategory[];
}

export const GoogleAlbumModal: React.FC<GoogleAlbumModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSave,
  albumToEdit,
  categories,
}) => {
  const [date, setDate] = useState('');
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [albumUrl, setAlbumUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [category, setCategory] = useState('fellowship');
  const [descriptionZh, setDescriptionZh] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    if (albumToEdit) {
      setDate(albumToEdit.date || '');
      setTitleZh(albumToEdit.titleZh || '');
      setTitleEn(albumToEdit.titleEn || '');
      setAlbumUrl(albumToEdit.albumUrl || '');
      setCoverImageUrl(albumToEdit.coverImageUrl || '');
      setCategory(albumToEdit.category || 'fellowship');
      setDescriptionZh(albumToEdit.descriptionZh || '');
      setDescriptionEn(albumToEdit.descriptionEn || '');
    } else {
      // Default to today's date in YYYY-MM-DD format
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
      setTitleZh('');
      setTitleEn('');
      setAlbumUrl('');
      setCoverImageUrl('');
      setCategory('fellowship');
      setDescriptionZh('');
      setDescriptionEn('');
    }
  }, [albumToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1200;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setCoverImageUrl(canvas.toDataURL('image/jpeg', 0.85));
            setIsUploadingCover(false);
            return;
          }
        }
        setCoverImageUrl(result);
        setIsUploadingCover(false);
      };
      img.onerror = () => {
        setCoverImageUrl(result);
        setIsUploadingCover(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleZh.trim()) {
      alert(lang === 'zh' ? '請輸入相簿中文名稱' : 'Please enter Chinese title');
      return;
    }
    if (!albumUrl.trim()) {
      alert(lang === 'zh' ? '請輸入 Google 相簿連結 (例如 https://photos.app.goo.gl/...)' : 'Please enter Google Photos album URL');
      return;
    }

    const newAlbum: GoogleAlbum = {
      id: albumToEdit ? albumToEdit.id : `google-album-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: date.trim() || new Date().toISOString().slice(0, 10),
      titleZh: titleZh.trim(),
      titleEn: titleEn.trim() || titleZh.trim(),
      albumUrl: albumUrl.trim(),
      coverImageUrl: coverImageUrl.trim() || undefined,
      category: category || 'fellowship',
      descriptionZh: descriptionZh.trim() || undefined,
      descriptionEn: descriptionEn.trim() || undefined,
    };

    onSave(newAlbum);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <FolderHeart className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">
                {albumToEdit 
                  ? (lang === 'zh' ? '編輯 Google 相簿' : 'Edit Google Photos Album') 
                  : (lang === 'zh' ? '新增 Google 相簿' : 'Add Google Photos Album')}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'zh' ? '填寫相簿日期、中英文名稱與 Google 相簿分享連結' : 'Enter date, Chinese & English title, and Google Photos album link'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '活動日期 (Date) *' : 'Event Date *'}</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="例如: 2015-03-21, 3/21/2015, 或 2016-11"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {lang === 'zh' ? '支援 YYYY-MM-DD 或 月/日/年 格式' : 'Supports YYYY-MM-DD or MM/DD/YYYY'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                {lang === 'zh' ? '相簿主題分類 (Category)' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {categories.filter(c => c.key !== 'all').map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {lang === 'zh' ? cat.labelZh : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Chinese Title & English Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                {lang === 'zh' ? '中文名稱 (Chinese Name) *' : 'Chinese Title *'}
              </label>
              <input
                type="text"
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                placeholder="例如: 包水餃活動, RPV 復活節野外禮拜"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                {lang === 'zh' ? '英文名稱 (English Name)' : 'English Title'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Dumpling Making Fellowship, Big Bear Retreat"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Google Photos Album Link */}
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center space-x-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? 'Google 相簿分享連結 (Google Album URL) *' : 'Google Album URL *'}</span>
            </label>
            <input
              type="url"
              value={albumUrl}
              onChange={(e) => setAlbumUrl(e.target.value)}
              placeholder="https://photos.app.goo.gl/..."
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500 font-mono text-xs"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {lang === 'zh' ? '可在 Google Photos 點擊「分享相簿」複製短網址 (https://photos.app.goo.gl/...)' : 'Paste public Google Photos album share link'}
            </span>
          </div>

          {/* Cover Image URL / Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'zh' ? '相簿封面預覽圖 (Cover Image)' : 'Cover Image'}</span>
              </span>
              <label className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center space-x-1">
                <Upload className="w-3 h-3" />
                <span>{lang === 'zh' ? '上傳本地照片' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://... 或點擊右上角「上傳本地照片」"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => setCoverImageUrl('')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                  title="清除圖片"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Image Preview Box */}
            {coverImageUrl && (
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 mt-2">
                <img
                  src={coverImageUrl}
                  alt="Album Cover Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-amber-300">
                  {lang === 'zh' ? '封面預覽' : 'Cover Preview'}
                </div>
              </div>
            )}
          </div>

          {/* Description (Zh / En) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'zh' ? '中文描述與感恩紀錄' : 'Chinese Description'}
              </label>
              <textarea
                value={descriptionZh}
                onChange={(e) => setDescriptionZh(e.target.value)}
                rows={2}
                placeholder="例如: 弟兄姊妹同心團契包水餃，數算主恩..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'zh' ? '英文描述 (English Description)' : 'English Description'}
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={2}
                placeholder="e.g. Joyful fellowship gathering in Christ..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              {lang === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUploadingCover}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-bold shadow-md shadow-amber-600/20 flex items-center space-x-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'zh' ? (albumToEdit ? '儲存更新' : '確認新增相簿') : (albumToEdit ? 'Save Changes' : 'Add Album')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
