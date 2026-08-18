import React, { useState } from 'react';
import { GalleryCategory, GalleryPhoto } from '../types';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  MoveUp,
  MoveDown,
  Sparkles,
  Church,
  Heart,
  Award,
  Sun,
  History,
  Users,
  Bot,
  Gift,
  Trees,
  Utensils,
  Camera,
  Music,
  Globe,
  BookOpen,
  FolderHeart,
  Tag,
  AlertCircle
} from 'lucide-react';
import { GALLERY_CATEGORIES as DEFAULT_CATEGORIES } from '../data/galleryData';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
  categories: GalleryCategory[];
  photos: GalleryPhoto[];
  onSaveCategories: (updatedCategories: GalleryCategory[]) => void;
  onUpdatePhotoCategory?: (oldKey: string, newKey: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles, label: '閃耀/全部 (Sparkles)' },
  { name: 'Users', icon: Users, label: '小組/團契 (Users)' },
  { name: 'Bot', icon: Bot, label: '兒童/機器人 (Bot)' },
  { name: 'Gift', icon: Gift, label: '聖誕/節期 (Gift)' },
  { name: 'Sun', icon: Sun, label: '靈修/營會 (Sun)' },
  { name: 'Trees', icon: Trees, label: '戶外/自然 (Trees)' },
  { name: 'Utensils', icon: Utensils, label: '愛宴/新年 (Utensils)' },
  { name: 'History', icon: History, label: '歷史/傳承 (History)' },
  { name: 'Church', icon: Church, label: '崇拜/聖殿 (Church)' },
  { name: 'Heart', icon: Heart, label: '愛心/關懷 (Heart)' },
  { name: 'BookOpen', icon: BookOpen, label: '查經/造就 (BookOpen)' },
  { name: 'Music', icon: Music, label: '詩班/讚美 (Music)' },
  { name: 'Camera', icon: Camera, label: '攝影/相簿 (Camera)' },
  { name: 'Award', icon: Award, label: '洗禮/見證 (Award)' },
  { name: 'Globe', icon: Globe, label: '宣教/社區 (Globe)' },
  { name: 'FolderHeart', icon: FolderHeart, label: '相簿專區 (FolderHeart)' }
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  lang,
  categories = [],
  photos = [],
  onSaveCategories,
  onUpdatePhotoCategory
}) => {
  const [categoryList, setCategoryList] = useState<GalleryCategory[]>(() => categories || []);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    labelZh: string;
    labelEn: string;
    icon: string;
  }>({ labelZh: '', labelEn: '', icon: 'FolderHeart' });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCatForm, setNewCatForm] = useState<{
    key: string;
    labelZh: string;
    labelEn: string;
    icon: string;
  }>({
    key: '',
    labelZh: '',
    labelEn: '',
    icon: 'Users'
  });

  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [migrateToKey, setMigrateToKey] = useState<string>('worship');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    const item = AVAILABLE_ICONS.find(i => i.name === iconName);
    if (item) {
      const IconComponent = item.icon;
      return <IconComponent className={className} />;
    }
    return <FolderHeart className={className} />;
  };

  const countPhotosInCategory = (key: string) => {
    const safePhotos = photos || [];
    if (key === 'all') return safePhotos.length;
    return safePhotos.filter(p => p && p.category === key).length;
  };

  // Start editing a category
  const handleStartEdit = (cat: GalleryCategory) => {
    setEditingKey(cat.key);
    setEditForm({
      labelZh: cat.labelZh,
      labelEn: cat.labelEn,
      icon: cat.icon
    });
    setConfirmDeleteKey(null);
  };

  // Save edit
  const handleSaveEdit = (key: string) => {
    if (!editForm.labelZh.trim()) {
      setStatusMsg(lang === 'zh' ? '請輸入中文分類名稱' : 'Please enter Chinese label');
      return;
    }
    const updated = categoryList.map(cat => {
      if (cat.key === key) {
        return {
          ...cat,
          labelZh: editForm.labelZh.trim(),
          labelEn: editForm.labelEn.trim() || editForm.labelZh.trim(),
          icon: editForm.icon
        };
      }
      return cat;
    });

    setCategoryList(updated);
    onSaveCategories(updated);
    setEditingKey(null);
    setStatusMsg(lang === 'zh' ? '✅ 分類名稱已成功更新！' : '✅ Category updated successfully!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Move category up
  const handleMoveUp = (index: number) => {
    if (index <= 1) return; // don't move past 'all'
    const updated = [...categoryList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setCategoryList(updated);
    onSaveCategories(updated);
  };

  // Move category down
  const handleMoveDown = (index: number) => {
    if (index === 0 || index >= categoryList.length - 1) return;
    const updated = [...categoryList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setCategoryList(updated);
    onSaveCategories(updated);
  };

  // Add new custom category
  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatForm.labelZh.trim()) {
      setStatusMsg(lang === 'zh' ? '請填寫中文分類名稱' : 'Please enter Chinese label');
      return;
    }

    const generatedKey = newCatForm.key.trim()
      ? newCatForm.key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
      : 'cat_' + Date.now().toString(36);

    if (categoryList.some(c => c.key === generatedKey)) {
      setStatusMsg(lang === 'zh' ? '分類識別碼已存在，請使用不同名稱' : 'Category key already exists');
      return;
    }

    const newCategory: GalleryCategory = {
      key: generatedKey,
      labelZh: newCatForm.labelZh.trim(),
      labelEn: newCatForm.labelEn.trim() || newCatForm.labelZh.trim(),
      icon: newCatForm.icon
    };

    const updated = [...categoryList, newCategory];
    setCategoryList(updated);
    onSaveCategories(updated);
    setIsAddingNew(false);
    setNewCatForm({ key: '', labelZh: '', labelEn: '', icon: 'Users' });
    setStatusMsg(lang === 'zh' ? `✅ 已成功新增分類「${newCategory.labelZh}」！` : `✅ Added category "${newCategory.labelEn}"!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Delete category
  const handleDeleteCategory = (key: string) => {
    const photoCount = countPhotosInCategory(key);
    if (photoCount > 0 && onUpdatePhotoCategory) {
      onUpdatePhotoCategory(key, migrateToKey);
    }
    const updated = categoryList.filter(c => c.key !== key);
    setCategoryList(updated);
    onSaveCategories(updated);
    setConfirmDeleteKey(null);
    setStatusMsg(lang === 'zh' ? '✅ 分類已刪除' : '✅ Category removed');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm(lang === 'zh' ? '確定要恢復為官方 Google Sites 預設相簿分類嗎？' : 'Reset to default Google Sites categories?')) {
      setCategoryList(DEFAULT_CATEGORIES);
      onSaveCategories(DEFAULT_CATEGORIES);
      setStatusMsg(lang === 'zh' ? '✅ 已還原為官方預設分類' : '✅ Restored default categories');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-amber-500/40 max-w-3xl w-full p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white">
                {lang === 'zh' ? '管理員相簿分類與名稱管理' : 'Manage Gallery Categories'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh' ? '自由調整分類名稱、修改顯示圖示、重新排序或新增相簿專區' : 'Edit category labels, change icons, reorder, or add custom albums'}
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

        {/* Status Alert */}
        {statusMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 flex-shrink-0">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Content Body - Scrollable */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Top Actions: Add New Category & Reset Defaults */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => { setIsAddingNew(!isAddingNew); setEditingKey(null); }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'zh' ? '新增相簿分類' : 'Add New Category'}</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700 flex items-center space-x-1.5 transition-all"
              title={lang === 'zh' ? '還原為官方預設 8 大分類' : 'Restore official default categories'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'zh' ? '還原預設官方分類' : 'Reset to Defaults'}</span>
            </button>
          </div>

          {/* Add New Category Panel */}
          {isAddingNew && (
            <form onSubmit={handleAddNewCategory} className="p-4 bg-slate-800/90 rounded-2xl border border-amber-500/50 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '新增自訂相簿分類' : 'Create New Category'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'zh' ? '分類名稱 (中文) *' : 'Chinese Label *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：2026 夏令退修營、青職團契"
                    value={newCatForm.labelZh}
                    onChange={(e) => setNewCatForm(prev => ({ ...prev, labelZh: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {lang === 'zh' ? '英文名稱 (選填)' : 'English Label (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 Summer Retreat"
                    value={newCatForm.labelEn}
                    onChange={(e) => setNewCatForm(prev => ({ ...prev, labelEn: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  {lang === 'zh' ? '選擇代表圖示' : 'Select Icon'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map(item => {
                    const isSelected = newCatForm.icon === item.name;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setNewCatForm(prev => ({ ...prev, icon: item.name }))}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                          isSelected
                            ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-slate-900/60 border-slate-750 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                        title={item.label}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[9px] mt-1 truncate max-w-full">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {lang === 'zh' ? '確認新增分類' : 'Save New Category'}
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-2.5">
            {categoryList.map((cat, idx) => {
              const isAll = cat.key === 'all';
              const isEditing = editingKey === cat.key;
              const photoCount = countPhotosInCategory(cat.key);
              const isConfirmingDelete = confirmDeleteKey === cat.key;

              if (isEditing) {
                return (
                  <div key={cat.key} className="p-4 bg-slate-800/95 rounded-2xl border border-amber-500/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? `編輯「${cat.labelZh}」分類` : `Edit "${cat.labelEn}"`}</span>
                      </span>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        {lang === 'zh' ? '取消' : 'Cancel'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          {lang === 'zh' ? '中文分類名稱 *' : 'Chinese Label *'}
                        </label>
                        <input
                          type="text"
                          value={editForm.labelZh}
                          onChange={(e) => setEditForm(prev => ({ ...prev, labelZh: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          {lang === 'zh' ? '英文名稱' : 'English Label'}
                        </label>
                        <input
                          type="text"
                          value={editForm.labelEn}
                          onChange={(e) => setEditForm(prev => ({ ...prev, labelEn: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                        {lang === 'zh' ? '更改圖示' : 'Change Icon'}
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {AVAILABLE_ICONS.map(item => {
                          const isSelected = editForm.icon === item.name;
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => setEditForm(prev => ({ ...prev, icon: item.name }))}
                              className={`p-1.5 rounded-xl flex flex-col items-center justify-center transition-all border ${
                                isSelected
                                  ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                                  : 'bg-slate-900/60 border-slate-750 text-slate-400 hover:text-white'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                              <span className="text-[9px] mt-0.5 truncate">{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingKey(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                      >
                        {lang === 'zh' ? '放棄修改' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.key)}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md"
                      >
                        {lang === 'zh' ? '儲存變更' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat.key}
                  className={`p-3.5 rounded-2xl bg-slate-800/70 border ${
                    isAll ? 'border-amber-500/30 bg-amber-950/10' : 'border-slate-750'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:bg-slate-800`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Move Controls (except 'all') */}
                    {!isAll && (
                      <div className="flex flex-col space-y-0.5">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx <= 1}
                          className="p-1 rounded bg-slate-900/60 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                          title="往上移"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx >= categoryList.length - 1}
                          className="p-1 rounded bg-slate-900/60 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                          title="往下移"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-700/80 flex-shrink-0">
                      {renderIcon(cat.icon, "w-4 h-4")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white truncate">{cat.labelZh}</span>
                        <span className="text-xs text-slate-400 font-mono truncate hidden sm:inline">({cat.labelEn})</span>
                        {isAll && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                            系統預設
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>{lang === 'zh' ? `相片數量：${photoCount} 張` : `${photoCount} photos`}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-slate-500 text-[10px]">key: {cat.key}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 flex items-center space-x-1 transition-all"
                      title={lang === 'zh' ? '修改此分類名稱與圖示' : 'Edit name and icon'}
                    >
                      <Edit2 className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'zh' ? '修改名稱' : 'Edit'}</span>
                    </button>

                    {!isAll && (
                      <>
                        {isConfirmingDelete ? (
                          <div className="flex items-center space-x-1.5 p-1 bg-rose-950/80 border border-rose-600/50 rounded-xl">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 ml-1" />
                            {photoCount > 0 && (
                              <select
                                value={migrateToKey}
                                onChange={(e) => setMigrateToKey(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-white"
                              >
                                {categoryList.filter(c => c.key !== cat.key && c.key !== 'all').map(c => (
                                  <option key={c.key} value={c.key}>移至 {c.labelZh}</option>
                                ))}
                              </select>
                            )}
                            <button
                              onClick={() => handleDeleteCategory(cat.key)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg"
                            >
                              {lang === 'zh' ? '確定刪除' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteKey(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] rounded-lg"
                            >
                              {lang === 'zh' ? '取消' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteKey(cat.key)}
                            className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-rose-900/70 text-slate-400 hover:text-rose-200 border border-slate-700/60 transition-colors"
                            title={lang === 'zh' ? '刪除此分類' : 'Delete category'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <p className="text-[11px] text-slate-400">
            {lang === 'zh' ? '💡 提示：分類名稱修改後將立即套用於前台照片走廊分類標籤與 AI 自動歸類引擎。' : '💡 Category changes take effect immediately across all gallery views.'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-md"
          >
            {lang === 'zh' ? '完成管理' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
