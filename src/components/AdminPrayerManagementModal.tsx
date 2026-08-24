import React, { useState, useEffect } from 'react';
import { Language, PrayerRequest, PendingPrayerSubmission } from '../types';
import { INITIAL_PRAYERS, CHURCH_INFO } from '../data/churchData';
import { deduplicatePrayers } from '../utils/prayerHelper';
import { 
  X, Check, Trash2, Edit3, ShieldAlert, Plus, 
  RotateCcw, Mail, Eye, Sparkles, Inbox, CheckCircle2, 
  Clock, AlertCircle, Phone, Lock, Globe 
} from 'lucide-react';
import { translateAuthorToEn, translatePrayerTitleToEn, translatePrayerContentToEn } from '../utils/translationHelper';

interface AdminPrayerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  prayers: PrayerRequest[];
  onUpdatePrayers: (newPrayers: PrayerRequest[]) => void;
  showToast: (msg: string) => void;
}

export const AdminPrayerManagementModal: React.FC<AdminPrayerManagementModalProps> = ({
  isOpen,
  onClose,
  lang,
  prayers,
  onUpdatePrayers,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'add_new'>('pending');
  const [pendingList, setPendingList] = useState<PendingPrayerSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('canaan_pending_prayers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Editing state for an item
  const [editingPrayer, setEditingPrayer] = useState<PrayerRequest | null>(null);
  const [editingPending, setEditingPending] = useState<PendingPrayerSubmission | null>(null);

  // New Prayer form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'health' | 'family' | 'faith' | 'thanksgiving' | 'general'>('general');

  // Load pending list on mount & listen to changes
  useEffect(() => {
    const loadPending = () => {
      try {
        const saved = localStorage.getItem('canaan_pending_prayers');
        if (saved) setPendingList(JSON.parse(saved));
      } catch {}
    };
    loadPending();

    const handlePendingUpdated = (e: any) => {
      if (e.detail?.pending) setPendingList(e.detail.pending);
    };
    window.addEventListener('canaan_pending_prayers_updated', handlePendingUpdated as EventListener);
    return () => {
      window.removeEventListener('canaan_pending_prayers_updated', handlePendingUpdated as EventListener);
    };
  }, []);

  if (!isOpen) return null;

  const savePendingList = (updated: PendingPrayerSubmission[]) => {
    setPendingList(updated);
    try {
      localStorage.setItem('canaan_pending_prayers', JSON.stringify(updated));
    } catch {}
    window.dispatchEvent(new CustomEvent('canaan_pending_prayers_updated', { detail: { pending: updated } }));
  };

  // Action: Approve pending prayer to website prayer wall
  const handleApprovePending = (item: PendingPrayerSubmission) => {
    const newPrayer: PrayerRequest = {
      id: `prayer-${Date.now()}`,
      author: item.author || (lang === 'zh' ? '主內肢體' : 'Church Member'),
      authorZh: item.author,
      authorEn: translateAuthorToEn(item.author),
      category: item.category,
      title: item.title,
      titleZh: item.title,
      titleEn: translatePrayerTitleToEn(item.title),
      content: item.content,
      contentZh: item.content,
      contentEn: translatePrayerContentToEn(item.content),
      date: new Date().toISOString().split('T')[0],
      isConfidential: false,
      prayedCount: 1,
    };

    const updatedPrayers = deduplicatePrayers([newPrayer, ...prayers]);
    onUpdatePrayers(updatedPrayers);

    // Update pending status
    const updatedPending = pendingList.map(p => 
      p.id === item.id ? { ...p, status: 'approved' as const } : p
    );
    savePendingList(updatedPending);

    showToast(lang === 'zh' ? `已核准並發布【${item.title}】至網頁代禱牆！` : `Approved and published "${item.title}" to prayer wall!`);
  };

  // Action: Mark pending prayer as pastoral handled without publishing
  const handleMarkHandled = (id: string) => {
    const updatedPending = pendingList.map(p => 
      p.id === id ? { ...p, status: 'pastoral_handled' as const } : p
    );
    savePendingList(updatedPending);
    showToast(lang === 'zh' ? '已標記為教牧同工已私下授理代禱 (不公開)' : 'Marked as handled privately');
  };

  // Action: Delete pending prayer
  const handleDeletePending = (id: string) => {
    if (!window.confirm(lang === 'zh' ? '確定要刪除這筆代禱登記紀錄嗎？' : 'Delete this pending prayer request?')) return;
    const updatedPending = pendingList.filter(p => p.id !== id);
    savePendingList(updatedPending);
    showToast(lang === 'zh' ? '已刪除代禱紀錄' : 'Deleted request');
  };

  // Action: Delete published prayer
  const handleDeletePublished = (id: string) => {
    if (!window.confirm(lang === 'zh' ? '確定要從代禱牆下架並刪除此代禱嗎？' : 'Remove this prayer from the prayer wall?')) return;
    const updatedPrayers = prayers.filter(p => p.id !== id);
    onUpdatePrayers(updatedPrayers);
    showToast(lang === 'zh' ? '已從代禱牆移除' : 'Removed from prayer wall');
  };

  // Action: Save edited published prayer
  const handleSaveEditedPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrayer) return;

    const updatedPrayers = prayers.map(p => p.id === editingPrayer.id ? editingPrayer : p);
    onUpdatePrayers(updatedPrayers);
    setEditingPrayer(null);
    showToast(lang === 'zh' ? '已儲存代禱更新！' : 'Prayer updated successfully!');
  };

  // Action: Add new official prayer
  const handleCreateOfficialPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const authorText = newAuthor.trim() || (lang === 'zh' ? '教會同工會' : 'Church Board');
    const newPrayer: PrayerRequest = {
      id: `prayer-admin-${Date.now()}`,
      author: authorText,
      authorZh: authorText,
      authorEn: translateAuthorToEn(authorText),
      category: newCategory,
      title: newTitle.trim(),
      titleZh: newTitle.trim(),
      titleEn: translatePrayerTitleToEn(newTitle.trim()),
      content: newContent.trim(),
      contentZh: newContent.trim(),
      contentEn: translatePrayerContentToEn(newContent.trim()),
      date: new Date().toISOString().split('T')[0],
      isConfidential: false,
      prayedCount: 5,
    };

    const updated = deduplicatePrayers([newPrayer, ...prayers]);
    onUpdatePrayers(updated);

    setNewAuthor('');
    setNewTitle('');
    setNewContent('');
    setActiveTab('published');
    showToast(lang === 'zh' ? '已成功發布官方代禱事項至代禱牆！' : 'Official prayer request published!');
  };

  // Action: Reset to official default prayers
  const handleResetToOfficialPrayers = () => {
    if (!window.confirm(lang === 'zh' ? '確定要將代禱牆重設為教會官方預設代禱事項嗎？' : 'Reset prayer wall to default official prayers?')) return;
    onUpdatePrayers(deduplicatePrayers(INITIAL_PRAYERS));
    showToast(lang === 'zh' ? '已成功同步最新教會官方代禱事項並完成去重！' : 'Synced with latest official church prayer requests!');
  };

  const pendingCount = pendingList.filter(p => p.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {lang === 'zh' ? '代禱事項管理與審核授理中心' : 'Prayer Request Review & Management'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {lang === 'zh' ? '管理員專用' : 'Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh' 
                  ? `收件信箱：${CHURCH_INFO.email} • 審核信徒提出之代禱，授理後刊登至網頁`
                  : `Target Email: ${CHURCH_INFO.email} • Review incoming requests & publish to wall`
                }
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => { setActiveTab('pending'); setEditingPrayer(null); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === 'pending'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>{lang === 'zh' ? '待授理代禱登記' : 'Incoming Requests'}</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-xs animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('published'); setEditingPrayer(null); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === 'published'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? '代禱牆已刊登清單' : 'Published on Wall'}</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs">
                {prayers.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('add_new'); setEditingPrayer(null); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === 'add_new'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'zh' ? '新增官方代禱' : 'Add Official'}</span>
            </button>
          </div>

          <button
            onClick={handleResetToOfficialPrayers}
            className="mb-2 text-xs text-slate-400 hover:text-amber-300 flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
            title={lang === 'zh' ? '同步並還原為最新官方代禱事項' : 'Sync latest official prayers'}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{lang === 'zh' ? '同步最新代禱' : 'Sync Latest'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PENDING REQUESTS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200/90 leading-relaxed flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">
                    {lang === 'zh' ? '代禱授理與 Email 同步說明：' : 'Prayer Processing Notice:'}
                  </span>
                  {lang === 'zh' 
                    ? `當信徒或訪客在網站填寫代禱時，系統已自動將完整內容寄至 ${CHURCH_INFO.email} 並暫存於此待審佇列。請管理員/同工評估後點選「核准刊登」發布到網頁代禱牆，或「標記為私下牧養」進行密件守望。`
                    : `Incoming requests are emailed to ${CHURCH_INFO.email}. You can review, approve, edit, or privately handle them below.`}
                </div>
              </div>

              {pendingList.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                  <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">
                    {lang === 'zh' ? '目前沒有待審核的代禱登記事項' : 'No pending prayer requests at this time.'}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {lang === 'zh' ? '當有弟兄姊妹在網頁提交代禱時，將會自動出現在此處。' : 'New submissions from the website will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingList.map((item) => {
                    const isHandled = item.status === 'approved' || item.status === 'pastoral_handled';
                    return (
                      <div 
                        key={item.id}
                        className={`border rounded-2xl p-4 sm:p-5 transition-all space-y-3 ${
                          item.status === 'pending'
                            ? 'bg-slate-800/90 border-amber-500/40 shadow-lg'
                            : 'bg-slate-850/60 border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm sm:text-base">
                              {item.author || (lang === 'zh' ? '無名氏' : 'Anonymous')}
                            </span>

                            {item.isConfidential ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <Lock className="w-3 h-3" />
                                <span>{lang === 'zh' ? '教牧保密代禱' : 'Confidential'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Globe className="w-3 h-3" />
                                <span>{lang === 'zh' ? '申請公開刊登' : 'Public Request'}</span>
                              </span>
                            )}

                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                              {item.category === 'health' ? (lang === 'zh' ? '身體健康' : 'Health') :
                               item.category === 'family' ? (lang === 'zh' ? '家庭親情' : 'Family') :
                               item.category === 'faith' ? (lang === 'zh' ? '屬靈追求' : 'Spiritual') :
                               item.category === 'thanksgiving' ? (lang === 'zh' ? '感恩讚美' : 'Thanksgiving') :
                               (lang === 'zh' ? '教會事工' : 'Church')}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.submittedAt).toLocaleString('zh-TW', { timeZone: 'America/Los_Angeles' })}</span>
                          </div>
                        </div>

                        {/* Contact info if provided */}
                        {(item.authorPhone || item.authorEmail) && (
                          <div className="flex flex-wrap items-center gap-3 text-xs text-amber-300/90 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/50">
                            {item.authorPhone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-amber-400" />
                                <span>電話: {item.authorPhone}</span>
                              </div>
                            )}
                            {item.authorEmail && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3 text-amber-400" />
                                <span>Email: {item.authorEmail}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Title & Content */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-base">
                            {item.title}
                          </h4>
                          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </div>

                        {/* Status & Actions */}
                        <div className="pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs">
                            {item.status === 'pending' && (
                              <span className="text-amber-400 font-semibold flex items-center space-x-1">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                                <span>{lang === 'zh' ? '待管理員授理中' : 'Pending Review'}</span>
                              </span>
                            )}
                            {item.status === 'approved' && (
                              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{lang === 'zh' ? '已核准並發布至代禱牆' : 'Approved & Published'}</span>
                              </span>
                            )}
                            {item.status === 'pastoral_handled' && (
                              <span className="text-purple-400 font-semibold flex items-center space-x-1">
                                <Lock className="w-3.5 h-3.5" />
                                <span>{lang === 'zh' ? '已私下牧養守望 (不公開)' : 'Handled Privately'}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprovePending(item)}
                                  className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow transition-all"
                                  title={lang === 'zh' ? '授理並刊登至網站代禱牆' : 'Approve and post to wall'}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{lang === 'zh' ? '核准刊登至代禱牆' : 'Approve to Wall'}</span>
                                </button>

                                <button
                                  onClick={() => handleMarkHandled(item.id)}
                                  className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-650 text-purple-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-500/30 transition-all"
                                  title={lang === 'zh' ? '標記為同工已私下代禱 (不發布到前台)' : 'Handled privately'}
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>{lang === 'zh' ? '私下牧養代禱' : 'Private'}</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeletePending(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title={lang === 'zh' ? '刪除此筆代禱' : 'Delete request'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PUBLISHED PRAYERS */}
          {activeTab === 'published' && (
            <div className="space-y-4">
              {editingPrayer ? (
                /* Edit Single Prayer Form */
                <form onSubmit={handleSaveEditedPrayer} className="bg-slate-800/90 border border-amber-500/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <h4 className="font-bold text-white text-base flex items-center space-x-2">
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'zh' ? '編輯已發布代禱' : 'Edit Published Prayer'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingPrayer(null)}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-700"
                    >
                      {lang === 'zh' ? '取消' : 'Cancel'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {lang === 'zh' ? '署名 / 提出者' : 'Author'}
                      </label>
                      <input
                        type="text"
                        value={editingPrayer.author}
                        onChange={(e) => setEditingPrayer({ ...editingPrayer, author: e.target.value, authorZh: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {lang === 'zh' ? '代禱分類' : 'Category'}
                      </label>
                      <select
                        value={editingPrayer.category}
                        onChange={(e) => setEditingPrayer({ ...editingPrayer, category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                      >
                        <option value="general">{lang === 'zh' ? '教會事工' : 'Church'}</option>
                        <option value="health">{lang === 'zh' ? '身體健康' : 'Health'}</option>
                        <option value="family">{lang === 'zh' ? '家庭親情' : 'Family'}</option>
                        <option value="faith">{lang === 'zh' ? '屬靈追求' : 'Spiritual'}</option>
                        <option value="thanksgiving">{lang === 'zh' ? '感恩讚美' : 'Thanksgiving'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {lang === 'zh' ? '代禱主題 (中文)' : 'Prayer Title (Zh)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPrayer.titleZh || editingPrayer.title}
                      onChange={(e) => setEditingPrayer({ ...editingPrayer, title: e.target.value, titleZh: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {lang === 'zh' ? '詳細代禱內容 (中文)' : 'Prayer Content (Zh)'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={editingPrayer.contentZh || editingPrayer.content}
                      onChange={(e) => setEditingPrayer({ ...editingPrayer, content: e.target.value, contentZh: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPrayer(null)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
                    >
                      {lang === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow"
                    >
                      {lang === 'zh' ? '儲存修改' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Published List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>{lang === 'zh' ? `共 ${prayers.length} 則已發布代禱` : `Total ${prayers.length} published prayers`}</span>
                  </div>

                  {prayers.map((p) => (
                    <div 
                      key={p.id}
                      className="bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-semibold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                            {p.authorZh || p.author}
                          </span>
                          <span className="text-slate-400 font-mono">{p.date}</span>
                          <span className="text-slate-400">
                            {p.prayedCount} {lang === 'zh' ? '人禱告' : 'Prayers'}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm sm:text-base">
                          {p.titleZh || p.title}
                        </h4>
                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                          {p.contentZh || p.content}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setEditingPrayer(p)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'zh' ? '編輯' : 'Edit'}</span>
                        </button>

                        <button
                          onClick={() => handleDeletePublished(p.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title={lang === 'zh' ? '下架並刪除' : 'Remove from wall'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW OFFICIAL PRAYER */}
          {activeTab === 'add_new' && (
            <form onSubmit={handleCreateOfficialPrayer} className="space-y-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">
                  {lang === 'zh' ? '直接發布官方代禱事項至代禱牆' : 'Post Official Church Prayer'}
                </h4>
                <p className="text-xs text-slate-400">
                  {lang === 'zh' ? '由同工會直接編寫發布，將即時顯示於官網代禱牆上供弟兄姊妹同心守望。' : 'Post directly to the public prayer wall.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'zh' ? '署名 / 發布同工' : 'Author / Department'}
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={lang === 'zh' ? '例如：教會長執同工會 / 牧者室' : 'e.g. Church Board / Pastoral Team'}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'zh' ? '代禱分類' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                  >
                    <option value="general">{lang === 'zh' ? '教會事工 (Church)' : 'Church'}</option>
                    <option value="health">{lang === 'zh' ? '身體健康 (Health)' : 'Health'}</option>
                    <option value="family">{lang === 'zh' ? '家庭親情 (Family)' : 'Family'}</option>
                    <option value="faith">{lang === 'zh' ? '屬靈追求 (Spiritual)' : 'Spiritual'}</option>
                    <option value="thanksgiving">{lang === 'zh' ? '感恩讚美 (Thanksgiving)' : 'Thanksgiving'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'zh' ? '代禱主題 (Title)' : 'Prayer Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={lang === 'zh' ? '例如：為教會冷氣安裝工程與招牌設計製作代禱' : 'e.g. Church Renovation Prayer'}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'zh' ? '詳細代禱內容 (Prayer Details)' : 'Prayer Details'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={lang === 'zh' ? '請詳述代禱事項與同心守望方向...' : 'Describe prayer request...'}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'zh' ? '發布至代禱牆' : 'Publish to Wall'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>{lang === 'zh' ? '管理者登入 Email：' : 'Admin Email: '}</span>
            <span className="text-amber-300 font-mono">web@canaannewlife.org</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors"
          >
            {lang === 'zh' ? '關閉' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
