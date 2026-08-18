import React, { useState, useEffect } from 'react';
import { Language, Sermon } from '../types';
import { INITIAL_SERMONS, RECENT_SERMONS } from '../data/sermonsData';
import { loadAndSyncSermons, resetSermonsToDeployedMaster, getMasterDataFingerprint } from '../utils/sermonStorage';
import { SermonEditModal } from './SermonEditModal';
import { SermonGitHubSyncModal } from './SermonGitHubSyncModal';
import {
  Play,
  Video,
  Volume2,
  FileText,
  Search,
  BookOpen,
  Download,
  X,
  Sparkles,
  Share2,
  Check,
  Edit3,
  Plus,
  Trash2,
  ShieldCheck,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  GripVertical,
  Calendar,
  SlidersHorizontal,
  Github,
  Cloud,
  Lock,
  ExternalLink,
  Copy
} from 'lucide-react';

interface SermonProps {
  lang: Language;
  adminEmail?: string | null;
  onOpenGlobalSync?: () => void;
}

export const SermonArchive: React.FC<SermonProps> = ({ lang, adminEmail, onOpenGlobalSync }) => {
  // Sermons state initialized and deep-synced from compiled master & localStorage
  const [sermons, setSermons] = useState<Sermon[]>(() => loadAndSyncSermons());

  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'notes'>('video');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Admin edit & reorder modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [sermonToDelete, setSermonToDelete] = useState<Sermon | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Save to localStorage whenever sermons change
  useEffect(() => {
    localStorage.setItem('canaan_sermons_data', JSON.stringify(sermons));
  }, [sermons]);

  // Ensure state matches newly deployed release fingerprint on startup
  useEffect(() => {
    const currentFingerprint = getMasterDataFingerprint();
    const savedFingerprint = localStorage.getItem('canaan_sermons_master_fingerprint');
    if (savedFingerprint !== currentFingerprint) {
      const fresh = resetSermonsToDeployedMaster();
      setSermons(fresh);
    }
  }, []);

  // Listen to external sermon updates (e.g. from PDF Bulletin upload or other tabs)
  useEffect(() => {
    const handleSermonsUpdated = (e: any) => {
      if (e.detail?.allSermons && Array.isArray(e.detail.allSermons)) {
        setSermons(e.detail.allSermons);
        if (e.detail.newSermon) {
          setSelectedSermon(e.detail.newSermon);
          showToast(lang === 'zh' ? `已同步最新主日講道：「${e.detail.newSermon.titleZh}」` : `New sermon synced: "${e.detail.newSermon.titleZh}"`);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'canaan_sermons_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setSermons(parsed);
          }
        } catch (err) {
          console.warn("Storage sync error:", err);
        }
      }
    };

    window.addEventListener('canaan_sermons_updated', handleSermonsUpdated as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Initial check from server API
    fetch('/api/sermons')
      .then(res => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.sermons) && data.sermons.length > 0) {
          setSermons(data.sermons);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('canaan_sermons_updated', handleSermonsUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [lang]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const syncSermonList = (newList: Sermon[], msg?: string) => {
    setSermons(newList);
    try {
      localStorage.setItem('canaan_sermons_data', JSON.stringify(newList));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }

    fetch('/api/sermons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sermons: newList })
    }).catch(e => console.warn("Backend sermon sync error:", e));

    window.dispatchEvent(
      new CustomEvent('canaan_sermons_updated', {
        detail: { allSermons: newList }
      })
    );

    if (msg) {
      showToast(msg);
    }
  };

  const handleMoveSermon = (index: number, direction: 'up' | 'down' | 'top') => {
    if (index < 0 || index >= sermons.length) return;
    const updated = [...sermons];
    const item = updated[index];

    if (direction === 'top') {
      if (index === 0) return;
      updated.splice(index, 1);
      updated.unshift(item);
      syncSermonList(updated, lang === 'zh' ? `已將「${item.titleZh || item.title}」移至最頂端！` : `Moved "${item.titleZh || item.title}" to top!`);
    } else if (direction === 'up') {
      if (index === 0) return;
      const prev = updated[index - 1];
      updated[index - 1] = item;
      updated[index] = prev;
      syncSermonList(updated, lang === 'zh' ? `已將「${item.titleZh || item.title}」向前移動！` : `Moved "${item.titleZh || item.title}" up!`);
    } else if (direction === 'down') {
      if (index === updated.length - 1) return;
      const next = updated[index + 1];
      updated[index + 1] = item;
      updated[index] = next;
      syncSermonList(updated, lang === 'zh' ? `已將「${item.titleZh || item.title}」向後移動！` : `Moved "${item.titleZh || item.title}" down!`);
    }
  };

  const handleDragDropReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= sermons.length || toIndex >= sermons.length) return;
    const updated = [...sermons];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    syncSermonList(updated, lang === 'zh' ? `已更新講道順序！` : `Sermon order updated!`);
  };

  const handleSortByDate = (order: 'desc' | 'asc') => {
    const sorted = [...sermons].sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
    syncSermonList(
      sorted,
      lang === 'zh'
        ? (order === 'desc' ? '已依日期由新至舊（最新置頂）重新排列！' : '已依日期由舊至新重新排列！')
        : 'Sorted by date!'
    );
  };

  const handleSaveSermon = (savedSermon: Sermon) => {
    let updatedList: Sermon[] = [];
    setSermons(prev => {
      const exists = prev.some(s => s.id === savedSermon.id || s.date === savedSermon.date);
      if (exists) {
        updatedList = prev.map(s => (s.id === savedSermon.id || s.date === savedSermon.date) ? { ...s, ...savedSermon, id: s.id } : s);
      } else {
        // Prepend new sermon to top of list
        updatedList = [savedSermon, ...prev];
      }
      try {
        localStorage.setItem('canaan_sermons_data', JSON.stringify(updatedList));
      } catch (e) {
        console.warn("Storage sync error:", e);
      }
      return updatedList;
    });

    // Update currently viewed sermon if it's open
    if (selectedSermon && (selectedSermon.id === savedSermon.id || selectedSermon.date === savedSermon.date)) {
      setSelectedSermon(savedSermon);
    }

    // Determine updated list reliably from current sermons state
    const fullList = sermons.some(s => s.id === savedSermon.id || s.date === savedSermon.date)
      ? sermons.map(s => (s.id === savedSermon.id || s.date === savedSermon.date) ? { ...s, ...savedSermon, id: s.id } : s)
      : [savedSermon, ...sermons];

    // Sync with backend API to auto-write to src/data/sermonsData.ts on disk
    fetch('/api/sermons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sermons: fullList })
    }).catch(e => console.warn("Backend sermon sync error:", e));

    window.dispatchEvent(
      new CustomEvent('canaan_sermons_updated', {
        detail: { newSermon: savedSermon, allSermons: fullList }
      })
    );

    showToast(lang === 'zh' ? `講道「${savedSermon.titleZh || savedSermon.title}」已成功儲存並同步至代碼檔案！` : `Sermon saved and file synced!`);
  };

  const handleDeleteSermon = (sermonId: string) => {
    const remainingSermons = sermons.filter(s => s.id !== sermonId);
    
    // Update React state
    setSermons(remainingSermons);
    
    // Persist to localStorage immediately
    try {
      localStorage.setItem('canaan_sermons_data', JSON.stringify(remainingSermons));
    } catch (e) {
      console.warn("Error persisting deletion to localStorage:", e);
    }

    if (selectedSermon && selectedSermon.id === sermonId) {
      setSelectedSermon(null);
    }
    if (editingSermon && editingSermon.id === sermonId) {
      setIsEditModalOpen(false);
      setEditingSermon(null);
    }
    setSermonToDelete(null);

    // Call server DELETE endpoint
    fetch(`/api/sermons/${encodeURIComponent(sermonId)}`, {
      method: 'DELETE'
    }).catch(e => console.warn("Backend delete error:", e));

    // Also update full list on server
    fetch('/api/sermons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sermons: remainingSermons })
    }).catch(e => console.warn("Backend sermon sync error:", e));

    // Dispatch global event for other components
    window.dispatchEvent(
      new CustomEvent('canaan_sermons_updated', {
        detail: { allSermons: remainingSermons }
      })
    );

    showToast(lang === 'zh' ? '講道記錄已成功刪除！' : 'Sermon deleted successfully.');
  };

  const handleResetToDefaults = () => {
    const masterSermons = resetSermonsToDeployedMaster();
    setSermons(masterSermons);
    fetch('/api/sermons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sermons: masterSermons })
    }).catch(e => console.warn(e));

    window.dispatchEvent(
      new CustomEvent('canaan_sermons_updated', {
        detail: { allSermons: masterSermons }
      })
    );
    setIsResetModalOpen(false);
    showToast(lang === 'zh' ? '已成功同步並載入 GitHub 最新部署之講道與錄影！' : 'Reset and reloaded latest sermons from deployment.');
  };

  const filteredSermons = sermons.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.titleZh && s.titleZh.includes(q)) ||
      (s.scripture && s.scripture.toLowerCase().includes(q)) ||
      (s.scriptureZh && s.scriptureZh.includes(q)) ||
      (s.speaker && s.speaker.toLowerCase().includes(q)) ||
      (s.speakerZh && s.speakerZh.includes(q))
    );
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="sermons" className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-amber-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-300 border border-amber-400/40">
            <Check className="w-4 h-4 text-amber-200" />
            <span className="text-xs sm:text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{lang === 'zh' ? '主日講道影音' : 'Sermons & Messages'}</span>
              </div>

              {adminEmail && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40 animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'zh' ? '管理員可隨時編輯或新增講道' : 'Admin Edit Mode Enabled'}</span>
                </span>
              )}
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {lang === 'zh' ? '生命的道 • 神的話語' : 'The Word of Life & Truth'}
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {lang === 'zh' 
                ? '在線上收聽與觀看陳嘉彰牧師及主講者的證道訊息，下載講道大綱，讓神的話語成為您路上的光。'
                : 'Listen or watch past Sunday messages by Rev. Chen Jiachang. Read scriptures and download sermon outlines.'}
            </p>
          </div>

          {/* Search Box & Admin Add Sermon Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {adminEmail && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenGlobalSync) {
                      onOpenGlobalSync();
                    } else {
                      setIsGitHubModalOpen(true);
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg transition-all shrink-0 border border-amber-400"
                  title={lang === 'zh' ? '一鍵將講道、相片、週報與所有資料同步至 GitHub' : 'Sync All Church Data to GitHub'}
                >
                  <Github className="w-4 h-4 text-slate-950" />
                  <span>{lang === 'zh' ? '🚀 一鍵 GitHub 同步' : '🚀 Sync to GitHub'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSermon(null); // new sermon
                    setIsEditModalOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'zh' ? '+ 新增主日講道' : '+ Add Sermon'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(true)}
                  className="bg-indigo-600/90 hover:bg-indigo-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg transition-colors shrink-0 border border-indigo-500/40"
                  title={lang === 'zh' ? '調整講道顯示順序（拖曳/置頂/上下移動）' : 'Reorder Sermons (Drag & Drop / Move)'}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{lang === 'zh' ? '調整順序' : 'Reorder'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors border border-slate-700"
                  title={lang === 'zh' ? '恢復預設講道清單' : 'Reset to defaults'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'zh' ? '搜尋講道題目、經文或講員...' : 'Search sermon, verse, speaker...'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sermon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map((sermon) => {
            const sermonIndex = sermons.findIndex(s => s.id === sermon.id);
            const isFirst = sermonIndex === 0;
            const isLast = sermonIndex === sermons.length - 1;

            return (
              <div 
                key={sermon.id}
                className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-lg hover:border-amber-500/60 transition-all group flex flex-col justify-between relative"
              >
                {/* Admin quick reorder & edit toolbar on top corner if logged in */}
                {adminEmail && (
                  <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-xl border border-amber-500/40 shadow-xl">
                    <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 bg-amber-500/20 rounded-md border border-amber-500/30">
                      #{sermonIndex + 1}
                    </span>

                    {/* Move Up / Left */}
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMoveSermon(sermonIndex, 'up')}
                      className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-25 disabled:hover:bg-transparent rounded transition-colors"
                      title={lang === 'zh' ? '向前移動一位' : 'Move up'}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down / Right */}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMoveSermon(sermonIndex, 'down')}
                      className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-25 disabled:hover:bg-transparent rounded transition-colors"
                      title={lang === 'zh' ? '向後移動一位' : 'Move down'}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Pin to Top */}
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMoveSermon(sermonIndex, 'top')}
                      className="p-1 text-amber-300 hover:text-white hover:bg-amber-600 disabled:opacity-25 disabled:hover:bg-transparent rounded transition-colors"
                      title={lang === 'zh' ? '置頂到最前面' : 'Pin to top'}
                    >
                      <ChevronsUp className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

                    <button
                      type="button"
                      onClick={() => {
                        setEditingSermon(sermon);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 text-amber-300 hover:text-white hover:bg-amber-600 rounded transition-colors flex items-center space-x-0.5 text-xs"
                      title={lang === 'zh' ? '編輯此篇講道內容' : 'Edit sermon content'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{lang === 'zh' ? '編輯' : 'Edit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSermonToDelete(sermon)}
                      className="p-1 text-rose-400 hover:text-white hover:bg-rose-600 rounded transition-colors"
                      title={lang === 'zh' ? '刪除此講道' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Card Header & Series Badge */}
                <div className="p-6 space-y-4">
                  <div className={`flex items-center justify-between text-xs text-amber-400 font-medium ${adminEmail ? 'pr-44' : 'pr-4'}`}>
                    <span className="bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 truncate max-w-[140px]">
                      {lang === 'zh' ? sermon.seriesZh : sermon.series}
                    </span>
                    <span className="text-slate-400 text-[11px] shrink-0">{sermon.date}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {lang === 'zh' ? sermon.titleZh : sermon.title}
                    </h3>
                    <div className="text-xs text-amber-200/90 font-medium">
                      {lang === 'zh' ? sermon.speakerZh : sermon.speaker} • {lang === 'zh' ? sermon.scriptureZh : sermon.scripture}
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 font-light leading-relaxed">
                    {lang === 'zh' ? sermon.summaryZh : sermon.summary}
                  </p>

                  {/* Key Points snippet */}
                  {((sermon.pointsZh && sermon.pointsZh.length > 0) || (sermon.points && sermon.points.length > 0)) && (
                    <div className="pt-2 border-t border-slate-700/60 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {lang === 'zh' ? '證道大綱綱要' : 'Outline Highlights'}
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {((lang === 'zh' ? sermon.pointsZh : sermon.points) || []).slice(0, 2).map((pt, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-amber-400 mr-1.5">•</span>
                            <span className="truncate">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Video and Passcode Indicator Badges */}
                  {(sermon.videoUrl || sermon.videoPasscode) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/40">
                      {sermon.videoUrl?.includes('zoom.us') ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-semibold border border-blue-500/40">
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                          <span>{lang === 'zh' ? 'Zoom 錄影重播' : 'Zoom Recording'}</span>
                        </span>
                      ) : sermon.videoUrl?.includes('youtube.com') || sermon.videoUrl?.includes('youtu.be') ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/40">
                          <Video className="w-3.5 h-3.5 text-rose-400" />
                          <span>{lang === 'zh' ? 'YouTube 影音' : 'YouTube Video'}</span>
                        </span>
                      ) : sermon.videoUrl ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/40">
                          <Video className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'zh' ? '影音已就緒' : 'Video Ready'}</span>
                        </span>
                      ) : null}

                      {sermon.videoPasscode && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-300 text-[11px] font-mono border border-slate-700">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Passcode: {sermon.videoPasscode}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-850 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedSermon(sermon);
                      setActiveTab('video');
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '觀看影音' : 'Watch Video'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSermon(sermon);
                      setActiveTab('audio');
                    }}
                    className="flex items-center justify-center space-x-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-3 rounded-xl text-xs font-medium transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'zh' ? '收聽音訊' : 'Audio'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSermon(sermon);
                      setActiveTab('notes');
                    }}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
                    title="View Scripture & Notes"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sermon Player Modal */}
        {selectedSermon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
              
              {/* Modal Header */}
              <div className="p-6 pb-0 flex items-start justify-between border-b border-slate-800">
                <div>
                  <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    {lang === 'zh' ? selectedSermon.seriesZh : selectedSermon.series} • {selectedSermon.date}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {lang === 'zh' ? selectedSermon.titleZh : selectedSermon.title}
                  </h3>
                  <div className="text-sm text-slate-400 mt-1">
                    {lang === 'zh' ? selectedSermon.speakerZh : selectedSermon.speaker} | {lang === 'zh' ? selectedSermon.scriptureZh : selectedSermon.scripture}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {adminEmail && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSermon(selectedSermon);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '修改講道' : 'Edit Sermon'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSermonToDelete(selectedSermon)}
                        className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                        title={lang === 'zh' ? '刪除此講道' : 'Delete Sermon'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedSermon(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="px-6 flex space-x-2 border-b border-slate-800">
                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'video' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '影音播放' : 'Video Player'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('audio')}
                  className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'audio' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '錄音廣播' : 'Audio Stream'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'notes' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '證道講義大綱' : 'Sermon Notes'}</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 pt-2 space-y-6">
                {activeTab === 'video' && (
                  <div className="space-y-4">
                    {/* Notice for Zoom recording upload */}
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-xs text-amber-200">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-amber-300">
                          {lang === 'zh' ? '💡 如何新增或修改 Zoom 錄影影音？' : '💡 How to add or update Zoom Recordings?'}
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {lang === 'zh'
                            ? '如果您在 Zoom 雲端錄製主日講道，只需點擊右上角「修改講道」，填入 Zoom 錄影連結（或 YouTube/Vimeo 網址）及 Passcode 密碼即可！'
                            : 'Click "Edit Sermon" on top right to paste Zoom recording link or YouTube URL and passcode!'}
                        </p>
                      </div>
                    </div>

                    <div className="aspect-video min-h-[360px] w-full rounded-2xl bg-black overflow-hidden relative border border-slate-800 flex items-center justify-center p-4 sm:p-6">
                      {selectedSermon.videoUrl?.includes('youtube.com') || selectedSermon.videoUrl?.includes('youtu.be') ? (
                        <iframe 
                          className="w-full h-full rounded-xl"
                          src={selectedSermon.videoUrl.replace('watch?v=', 'embed/')}
                          title="Sermon Recording"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : selectedSermon.videoUrl?.includes('zoom.us') ? (
                        <div className="p-6 text-center space-y-4 max-w-lg w-full">
                          <div className="p-4 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 inline-block shadow-lg shadow-blue-500/10">
                            <Video className="w-10 h-10 animate-pulse" />
                          </div>
                          <div>
                            <span className="inline-block px-3 py-1 bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-semibold rounded-full mb-2">
                              Zoom Cloud Recording
                            </span>
                            <h4 className="font-serif font-bold text-white text-xl sm:text-2xl">
                              {lang === 'zh' ? selectedSermon.titleZh || selectedSermon.title : selectedSermon.title}
                            </h4>
                            <p className="text-xs text-slate-300 mt-1.5">
                              {lang === 'zh' ? '點擊下方按鈕直接在 Zoom 觀看講道錄影重播：' : 'Click below to open and stream the Zoom cloud recording:'}
                            </p>
                          </div>

                          {selectedSermon.videoPasscode && (
                            <div className="bg-slate-900/95 border border-blue-500/50 rounded-2xl p-4 text-left space-y-1.5 shadow-xl">
                              <div className="text-xs text-blue-300 font-semibold flex items-center justify-between">
                                <span className="flex items-center space-x-1.5">
                                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                                  <span>{lang === 'zh' ? '🔐 錄影觀看密碼 (Passcode)' : '🔐 Recording Passcode'}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedSermon.videoPasscode || '');
                                    setCopiedPasscode(true);
                                    setTimeout(() => setCopiedPasscode(false), 2500);
                                  }}
                                  className="text-xs text-amber-300 hover:text-amber-200 flex items-center space-x-1 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
                                >
                                  {copiedPasscode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span className="font-bold">{copiedPasscode ? (lang === 'zh' ? '已複製！' : 'Copied!') : (lang === 'zh' ? '複製密碼' : 'Copy Passcode')}</span>
                                </button>
                              </div>
                              <div className="font-mono font-bold text-white tracking-widest text-lg select-all bg-black/60 px-3.5 py-2 rounded-xl border border-slate-700 flex items-center justify-between">
                                <span>{selectedSermon.videoPasscode}</span>
                                <span className="text-[10px] text-slate-400 font-sans font-normal">{lang === 'zh' ? '點擊按鈕自動複製' : 'Auto copy on click'}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <a
                              href={selectedSermon.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                            >
                              <Video className="w-4 h-4" />
                              <span>{lang === 'zh' ? '開啟 Zoom 觀看錄影' : 'Open Zoom Recording'}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            </a>

                            {adminEmail && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSermon(selectedSermon);
                                  setIsEditModalOpen(true);
                                }}
                                className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-semibold border border-slate-700 transition-colors"
                              >
                                {lang === 'zh' ? '修改錄影連結/密碼' : 'Edit Link / Passcode'}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : selectedSermon.videoUrl ? (
                        <div className="p-6 text-center space-y-4 max-w-md w-full">
                          <div className="p-4 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 inline-block">
                            <Video className="w-10 h-10" />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-white text-xl">
                              {lang === 'zh' ? '觀看主日證道影音' : 'Watch Sunday Message'}
                            </h4>
                            <p className="text-xs text-slate-300 mt-1">
                              {lang === 'zh' ? '講道錄影已準備完成，請點擊下方開啟連結觀看：' : 'Recording available. Click below to stream:'}
                            </p>
                          </div>

                          {selectedSermon.videoPasscode && (
                            <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 text-left space-y-1">
                              <div className="text-[11px] text-amber-300 font-semibold flex items-center justify-between">
                                <span>🔐 觀看密碼 (Passcode)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedSermon.videoPasscode || '');
                                    setCopiedPasscode(true);
                                    setTimeout(() => setCopiedPasscode(false), 2000);
                                  }}
                                  className="text-xs text-amber-300 hover:text-amber-200 flex items-center space-x-1 underline"
                                >
                                  {copiedPasscode ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                                  <span>{copiedPasscode ? '已複製！' : '複製密碼'}</span>
                                </button>
                              </div>
                              <div className="font-mono font-bold text-white tracking-widest text-base select-all bg-black/50 px-2.5 py-1 rounded border border-slate-700">
                                {selectedSermon.videoPasscode}
                              </div>
                            </div>
                          )}

                          <a
                            href={selectedSermon.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-2xl text-sm shadow-xl shadow-amber-600/30 transition-all transform hover:-translate-y-0.5"
                          >
                            <Video className="w-4 h-4" />
                            <span>{lang === 'zh' ? '開啟錄影連結' : 'Watch Recording'}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                          </a>
                        </div>
                      ) : (
                        <div className="p-6 text-center space-y-4 max-w-md w-full">
                          <div className="p-4 rounded-full bg-slate-800 border border-slate-700 text-amber-400 inline-block">
                            <Video className="w-10 h-10" />
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-white text-lg">
                              {lang === 'zh' ? '主日 Zoom 崇拜與影音' : 'Sunday Zoom Worship & Video'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {lang === 'zh' ? '本篇錄影即將上傳，您可使用 Zoom ID 進入教會線上空間或貼上錄影連結：' : 'Recording processing. You can join the Zoom room or add recording link:'}
                            </p>
                          </div>

                          {selectedSermon.videoPasscode && (
                            <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 text-left space-y-1">
                              <div className="text-[11px] text-amber-300 font-semibold flex items-center justify-between">
                                <span>🔐 觀看密碼 (Passcode)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedSermon.videoPasscode || '25226');
                                    setCopiedPasscode(true);
                                    setTimeout(() => setCopiedPasscode(false), 2000);
                                  }}
                                  className="text-xs text-amber-300 hover:text-amber-200 flex items-center space-x-1 underline"
                                >
                                  {copiedPasscode ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                                  <span>{copiedPasscode ? '已複製！' : '複製密碼'}</span>
                                </button>
                              </div>
                              <div className="font-mono font-bold text-white tracking-widest text-base select-all bg-black/50 px-2.5 py-1 rounded border border-slate-700">
                                {selectedSermon.videoPasscode || "25226"}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                            <a
                              href="https://zoom.us/j/3106266103"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg transition-all"
                            >
                              <Video className="w-4 h-4" />
                              <span>{lang === 'zh' ? '進入 Zoom (ID: 310-626-6103)' : 'Join Zoom Room'}</span>
                            </a>

                            {adminEmail && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSermon(selectedSermon);
                                  setIsEditModalOpen(true);
                                }}
                                className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg"
                              >
                                {lang === 'zh' ? '📝 立即貼上 Zoom 錄影網址' : 'Paste Zoom URL'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'audio' && (
                  <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4 text-center">
                    <div className="p-4 rounded-full bg-amber-500/20 text-amber-400 inline-block border border-amber-500/30">
                      <Volume2 className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">
                        {lang === 'zh' ? selectedSermon.titleZh : selectedSermon.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {lang === 'zh' ? selectedSermon.speakerZh : selectedSermon.speaker}
                      </div>
                    </div>

                    {/* Simulated Audio Controls */}
                    <div className="max-w-md mx-auto space-y-3 pt-2">
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-1/3 transition-all duration-300" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>08:24</span>
                        <span>38:15</span>
                      </div>
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all"
                      >
                        {isPlayingAudio ? (lang === 'zh' ? '暫停播放' : 'Pause Audio') : (lang === 'zh' ? '播放廣播錄音' : 'Play Audio Stream')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sermon Notes & Outline */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{lang === 'zh' ? '經文與證道綱要' : 'Scripture & Outline'}</span>
                    </div>

                    <button
                      onClick={handleShare}
                      className="text-xs text-slate-300 hover:text-white flex items-center space-x-1 bg-slate-700 px-2.5 py-1 rounded-lg"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '分享訊息' : 'Share')}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-300">
                      {lang === 'zh' ? '核心經文：' : 'Scripture Passage:'} <span className="text-amber-300 font-bold">{lang === 'zh' ? selectedSermon.scriptureZh : selectedSermon.scripture}</span>
                    </div>
                    <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {lang === 'zh' ? selectedSermon.summaryZh : selectedSermon.summary}
                    </p>
                  </div>

                  {((selectedSermon.pointsZh && selectedSermon.pointsZh.length > 0) || (selectedSermon.points && selectedSermon.points.length > 0)) && (
                    <div className="pt-2">
                      <div className="text-xs font-bold text-slate-200 mb-2">
                        {lang === 'zh' ? '證道三大要點：' : 'Key Message Points:'}
                      </div>
                      <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside">
                        {((lang === 'zh' ? selectedSermon.pointsZh : selectedSermon.points) || []).map((pt, idx) => (
                          <li key={idx} className="pl-1">
                            <span className="font-medium">{pt}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Admin Sermon Edit Modal */}
        <SermonEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          sermon={editingSermon}
          lang={lang}
          onSaveSermon={handleSaveSermon}
          onDeleteSermon={handleDeleteSermon}
        />

        {/* Admin Sermon GitHub Sync Modal */}
        <SermonGitHubSyncModal
          lang={lang}
          isOpen={isGitHubModalOpen}
          onClose={() => setIsGitHubModalOpen(false)}
          sermons={sermons}
          onImportBackup={(imported) => {
            setSermons(imported);
            localStorage.setItem('canaan_sermons_data', JSON.stringify(imported));
            window.dispatchEvent(new CustomEvent('canaan_sermons_updated', {
              detail: { allSermons: imported }
            }));
            fetch('/api/sermons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sermons: imported })
            }).catch(() => {});
            showToast(lang === 'zh' ? `已成功還原 ${imported.length} 篇講道記錄` : `Restored ${imported.length} sermons`);
          }}
        />

        {/* Delete Sermon In-App Confirmation Modal (Safe for iFrame) */}
        {sermonToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center space-x-3 text-rose-400">
                <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/40">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {lang === 'zh' ? '確認刪除此篇主日講道？' : 'Delete Sunday Sermon?'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'zh' ? '此動作將自前台與資料庫中移除該篇講道。' : 'This will remove the sermon from website and archive.'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block">{lang === 'zh' ? '講道題目' : 'Title'}:</span>
                  <strong className="text-white text-sm font-serif">{sermonToDelete.titleZh || sermonToDelete.title}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-700/60">
                  <span>{sermonToDelete.speakerZh || sermonToDelete.speaker}</span>
                  <span className="font-mono text-amber-400">{sermonToDelete.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSermonToDelete(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteSermon(sermonToDelete.id)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{lang === 'zh' ? '確認刪除' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset to Defaults Confirmation Modal */}
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center space-x-3 text-amber-400">
                <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {lang === 'zh' ? '重設講道清單為系統預設值' : 'Reset Sermon List?'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'zh' ? '將清除自訂新增與修改的講道，恢復為初始主日講道列表。' : 'This will restore the initial default sermon records.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg"
                >
                  {lang === 'zh' ? '確認恢復預設' : 'Confirm Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sermon Order Management Modal (Drag-and-Drop & Arrow Reordering) */}
        {isReorderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">
                      {lang === 'zh' ? '調整主日講道顯示順序' : 'Reorder Sunday Sermons'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'zh' 
                        ? '可直接按住拖曳排序，或使用箭頭進行上下移動、置頂。' 
                        : 'Drag and drop rows or use arrows to rearrange the display sequence.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Auto-Sort Toolbar */}
              <div className="px-6 py-3 bg-slate-850 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <span className="text-xs text-slate-400 font-medium">
                  {lang === 'zh' ? `共 ${sermons.length} 篇講道記錄` : `Total ${sermons.length} sermons`}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSortByDate('desc')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    title="新日期排在最前"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '按日期新至舊（推薦）' : 'Date Newest First'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSortByDate('asc')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
                    title="舊日期排在最前"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '按日期舊至新' : 'Date Oldest First'}</span>
                  </button>
                </div>
              </div>

              {/* Draggable & Sortable Sermon List */}
              <div className="p-6 overflow-y-auto space-y-2 flex-1">
                {sermons.map((item, idx) => {
                  const isTop = idx === 0;
                  const isBottom = idx === sermons.length - 1;
                  const isDragging = draggedIndex === idx;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggedIndex(idx)}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null) {
                          handleDragDropReorder(draggedIndex, idx);
                          setDraggedIndex(null);
                        }
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-move select-none ${
                        isDragging
                          ? 'opacity-40 bg-indigo-950/40 border-dashed border-indigo-500'
                          : 'bg-slate-800/90 border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800'
                      }`}
                    >
                      {/* Left side: Grip, Index Badge, Title & Speaker */}
                      <div className="flex items-center space-x-3 min-w-0 pr-3">
                        <div className="text-slate-500 hover:text-slate-300">
                          <GripVertical className="w-4 h-4 shrink-0" />
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold shrink-0 ${
                          isTop 
                            ? 'bg-amber-500 text-slate-950 shadow' 
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-serif font-bold text-sm text-white truncate max-w-[260px] sm:max-w-md">
                              {item.titleZh || item.title}
                            </span>
                            {isTop && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0 font-medium">
                                {lang === 'zh' ? '目前首頁置頂' : 'Pinned Top'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center space-x-2 truncate">
                            <span>{item.speakerZh || item.speaker}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{item.date}</span>
                            {item.scriptureZh && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[140px] text-amber-200/80">{item.scriptureZh}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Reorder Actions */}
                      <div className="flex items-center space-x-1 shrink-0 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
                        {/* Pin to Top Button */}
                        <button
                          type="button"
                          disabled={isTop}
                          onClick={() => handleMoveSermon(idx, 'top')}
                          className="p-1.5 text-amber-400 hover:text-white hover:bg-amber-600 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors"
                          title={lang === 'zh' ? '直接移至第 1 位置頂' : 'Move to top'}
                        >
                          <ChevronsUp className="w-4 h-4" />
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={isTop}
                          onClick={() => handleMoveSermon(idx, 'up')}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors"
                          title={lang === 'zh' ? '向上移動一位' : 'Move up'}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={isBottom}
                          onClick={() => handleMoveSermon(idx, 'down')}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors"
                          title={lang === 'zh' ? '向下移動一位' : 'Move down'}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 bg-slate-850 border-t border-slate-800 flex items-center justify-between shrink-0">
                <span className="text-xs text-emerald-400 flex items-center space-x-1.5 font-medium">
                  <Check className="w-4 h-4" />
                  <span>{lang === 'zh' ? '排序將即時自動同步至前台與資料庫' : 'Order auto-saved and synced live'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg"
                >
                  {lang === 'zh' ? '完成' : 'Done'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
