import React, { useState, useEffect } from 'react';
import { Language, PrayerRequest, PendingPrayerSubmission } from '../types';
import { INITIAL_PRAYERS, CHURCH_INFO } from '../data/churchData';
import { 
  Heart, Plus, ShieldCheck, Lock, Check, Send, 
  Filter, X, Sparkles, MessageSquare, RotateCcw, 
  Mail, Phone, ShieldAlert, Inbox, CheckCircle2, UserCheck, Edit3 
} from 'lucide-react';
import { translateAuthorToEn, translatePrayerTitleToEn, translatePrayerContentToEn } from '../utils/translationHelper';
import { sendPrayerEmailJS } from '../lib/emailService';
import { AdminPrayerManagementModal } from './AdminPrayerManagementModal';

interface PrayerProps {
  lang: Language;
  onOpenAI: () => void;
  adminEmail?: string | null;
  onOpenAdminLogin?: () => void;
}

export const PrayerWall: React.FC<PrayerProps> = ({ 
  lang, 
  onOpenAI, 
  adminEmail, 
  onOpenAdminLogin = () => {} 
}) => {
  const isAdmin = Boolean(adminEmail);

  const [prayers, setPrayers] = useState<PrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem('canaan_prayers_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: PrayerRequest) => {
            const matchedInit = INITIAL_PRAYERS.find(init => init.id === p.id);
            if (matchedInit) {
              return {
                ...matchedInit,
                prayedCount: Math.max(p.prayedCount || 0, matchedInit.prayedCount || 0),
              };
            }
            return p;
          });
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRAYERS;
  });

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [prayedIds, setPrayedIds] = useState<Record<string, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminManageOpen, setIsAdminManageOpen] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'health' | 'family' | 'faith' | 'thanksgiving' | 'general'>('health');
  const [isConfidential, setIsConfidential] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pending count for Admin badge
  const [pendingCount, setPendingCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('canaan_pending_prayers');
      if (saved) {
        const list: PendingPrayerSubmission[] = JSON.parse(saved);
        return list.filter(p => p.status === 'pending').length;
      }
    } catch {}
    return 0;
  });

  // Save to localStorage whenever prayers change
  useEffect(() => {
    try {
      localStorage.setItem('canaan_prayers_data', JSON.stringify(prayers));
    } catch (e) {
      console.warn("Prayer storage sync error:", e);
    }
  }, [prayers]);

  // Listen to external prayer updates (e.g. from Bulletin Admin Modal, Admin Prayer Modal or storage)
  useEffect(() => {
    const handlePrayersUpdated = (e: any) => {
      if (e.detail?.prayers && Array.isArray(e.detail.prayers)) {
        setPrayers(e.detail.prayers);
      }
    };

    const handlePendingUpdated = (e: any) => {
      if (e.detail?.pending && Array.isArray(e.detail.pending)) {
        setPendingCount(e.detail.pending.filter((p: any) => p.status === 'pending').length);
      }
    };

    const handleBulletinUpdated = (e: any) => {
      if (e.detail?.prayerRequests && Array.isArray(e.detail.prayerRequests) && e.detail.prayerRequests.length > 0) {
        const bulletinPrayers: PrayerRequest[] = e.detail.prayerRequests.map((req: string, idx: number) => ({
          id: `bulletin-prayer-${idx + 1}-${Date.now()}`,
          author: lang === 'zh' ? '教會同工會' : 'Church Board',
          authorZh: '教會同工會',
          authorEn: 'Church Board',
          category: idx === 0 ? 'general' : idx === 1 ? 'faith' : 'health',
          title: req,
          titleZh: req,
          titleEn: req,
          content: `${req}。請全體弟兄姊妹同心在主前守望代求，經歷神豐盛恩典與引導。`,
          contentZh: `${req}。請全體弟兄姊妹同心在主前守望代求，經歷神豐盛恩典與引導。`,
          contentEn: `${req}. Please join together in prayer for God's grace and guidance.`,
          date: e.detail.serviceDate || new Date().toISOString().split('T')[0],
          isConfidential: false,
          prayedCount: 15 + idx * 5
        }));
        
        setPrayers(prev => {
          const merged = [...bulletinPrayers, ...prev.filter(p => !p.id.startsWith('bulletin-prayer'))];
          try {
            localStorage.setItem('canaan_prayers_data', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'canaan_prayers_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPrayers(parsed);
        } catch {}
      }
      if (e.key === 'canaan_pending_prayers' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setPendingCount(parsed.filter((p: any) => p.status === 'pending').length);
          }
        } catch {}
      }
    };

    window.addEventListener('canaan_prayers_updated', handlePrayersUpdated as EventListener);
    window.addEventListener('canaan_pending_prayers_updated', handlePendingUpdated as EventListener);
    window.addEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('canaan_prayers_updated', handlePrayersUpdated as EventListener);
      window.removeEventListener('canaan_pending_prayers_updated', handlePendingUpdated as EventListener);
      window.removeEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [lang]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePrayClick = (id: string) => {
    if (prayedIds[id]) return;
    setPrayedIds(prev => ({ ...prev, [id]: true }));
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p));
  };

  // Sync to official prayers (Admin only)
  const handleResetToOfficialPrayers = () => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }
    setPrayers(INITIAL_PRAYERS);
    try {
      localStorage.setItem('canaan_prayers_data', JSON.stringify(INITIAL_PRAYERS));
    } catch {}
    window.dispatchEvent(new CustomEvent('canaan_prayers_updated', { detail: { prayers: INITIAL_PRAYERS } }));
    showToast(lang === 'zh' ? '已成功同步最新教會官方代禱事項！' : 'Synced with latest official church prayer requests!');
  };

  const categoryLabelMap = {
    general: { zh: '教會事工', en: 'Church & Ministry' },
    health: { zh: '身體健康', en: 'Health & Healing' },
    family: { zh: '家庭親情', en: 'Family & Loved Ones' },
    faith: { zh: '屬靈追求', en: 'Spiritual Life' },
    thanksgiving: { zh: '感恩讚美', en: 'Thanksgiving' },
  };

  // Form submit: Email all details to web@canaannewlife.org and queue for Admin review
  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await sendPrayerEmailJS({
        authorName: authorName.trim() || (lang === 'zh' ? '無名氏弟兄/姊妹' : 'Anonymous'),
        authorEmail: authorEmail.trim(),
        authorPhone: authorPhone.trim(),
        category,
        categoryLabelZh: categoryLabelMap[category].zh,
        categoryLabelEn: categoryLabelMap[category].en,
        title: title.trim(),
        content: content.trim(),
        isConfidential,
      });

      setSubmitResult({
        success: true,
        msg: lang === 'zh'
          ? `代禱資料已成功 Email 至教會信箱 (${CHURCH_INFO.email})！管理員與教牧團隊收到後將進行授理，審核確認後將刊登至網頁代禱事項。`
          : `Prayer request successfully emailed to ${CHURCH_INFO.email}! Our church ministry team will review and post it to the website prayer wall.`
      });

      // Update pending count
      try {
        const saved = localStorage.getItem('canaan_pending_prayers');
        if (saved) {
          const list: PendingPrayerSubmission[] = JSON.parse(saved);
          setPendingCount(list.filter(p => p.status === 'pending').length);
        }
      } catch {}

    } catch (err: any) {
      setSubmitResult({
        success: true,
        msg: lang === 'zh'
          ? `代禱資料已記錄並傳送至同工會！同工將於管理後台進行授理與守望代禱。`
          : `Prayer recorded. Church leaders will review and pray.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSubmitModal = () => {
    setIsSubmitModalOpen(false);
    setSubmitResult(null);
    setTitle('');
    setContent('');
    setAuthorName('');
    setAuthorPhone('');
    setAuthorEmail('');
    setIsConfidential(false);
  };

  const filteredPrayers = prayers.filter(p => filterCategory === 'all' || p.category === filterCategory);

  return (
    <section id="prayer" className="py-20 bg-slate-900 text-white relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-sm font-semibold border border-amber-400/40 animate-bounce">
          <Check className="w-4 h-4 text-amber-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Quick Action Banner on Prayer Wall */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-950/70 via-slate-850 to-amber-950/70 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-300">
                    {lang === 'zh' ? '管理員控制面板 • 代禱審核中心' : 'Admin Prayer Review Center'}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    web@canaannewlife.org
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {lang === 'zh'
                    ? '信徒提出的代禱已自動寄送至信箱，您可在此授理並決定是否刊登至網頁代禱牆。'
                    : 'Review emailed prayer submissions and manage prayer wall postings.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                onClick={() => setIsAdminManageOpen(true)}
                className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow transition-all transform hover:scale-105"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '授理與管理代禱' : 'Review & Manage'}</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleResetToOfficialPrayers}
                title={lang === 'zh' ? '管理員專屬：同步並還原為最新官方代禱' : 'Admin only: Sync latest official prayers'}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>{lang === 'zh' ? '同步最新代禱' : 'Sync Latest'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              <Heart className="w-4 h-4 text-amber-400" />
              <span>{lang === 'zh' ? '主內守望禱告牆' : 'Community Prayer Wall'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {lang === 'zh' ? '同心合意 • 代禱與感謝' : 'Intercessory Prayer & Thanksgiving'}
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {lang === 'zh' 
                ? '在愛中互相擔當重擔。您可以點擊「我為此禱告」同心代求，或提交代禱需求（系統將 Email 至同工信箱，經同工授理確認後刊登）。'
                : 'Bear one another\'s burdens in love. Click "I Prayed For This" or submit a prayer request (emailed to pastoral staff for review).'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all transform hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'zh' ? '提出代禱事項' : 'Submit Prayer Request'}</span>
            </button>

            {/* If Admin is logged in, show sync button; if not logged in, clicking prompts admin login */}
            {isAdmin ? (
              <button
                onClick={handleResetToOfficialPrayers}
                title={lang === 'zh' ? '管理員專屬：同步最新官方代禱事項' : 'Admin: Sync latest official prayer requests'}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white px-4 py-3 rounded-xl text-xs font-semibold border border-amber-500/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '同步最新代禱' : 'Sync Latest'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                title={lang === 'zh' ? '管理員登入後可同步最新官方代禱與審核' : 'Admin login required to sync official prayers'}
                className="flex items-center space-x-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3.5 py-3 rounded-xl text-xs font-medium border border-slate-750 transition-all"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>{lang === 'zh' ? '管理員登入同步' : 'Admin Sync'}</span>
              </button>
            )}

            <button
              onClick={onOpenAI}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 px-4 py-3 rounded-xl text-xs font-semibold border border-amber-500/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{lang === 'zh' ? 'AI 代禱與靈修引導' : 'AI Prayer Guide'}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-2 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" />
            {lang === 'zh' ? '分類篩選:' : 'Filter:'}
          </span>

          {[
            { id: 'all', labelEn: 'All Prayers', labelZh: '全部禱告' },
            { id: 'general', labelEn: 'Church & Ministry', labelZh: '教會與事工' },
            { id: 'health', labelEn: 'Health', labelZh: '身體健康' },
            { id: 'faith', labelEn: 'Spiritual Life', labelZh: '屬靈生命' },
            { id: 'family', labelEn: 'Family', labelZh: '家庭與親情' },
            { id: 'thanksgiving', labelEn: 'Thanksgiving', labelZh: '感恩讚美' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterCategory === c.id 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {lang === 'zh' ? c.labelZh : c.labelEn}
            </button>
          ))}
        </div>

        {/* Prayer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPrayers.map((prayer) => {
            const authorDisplay = lang === 'zh'
              ? (prayer.authorZh || prayer.author)
              : (prayer.authorEn || translateAuthorToEn(prayer.author));
            const titleDisplay = lang === 'zh'
              ? (prayer.titleZh || prayer.title)
              : (prayer.titleEn || translatePrayerTitleToEn(prayer.title));
            const contentDisplay = lang === 'zh'
              ? (prayer.contentZh || prayer.content)
              : (prayer.contentEn || translatePrayerContentToEn(prayer.content));

            return (
              <div 
                key={prayer.id}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Admin quick edit badge */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setIsAdminManageOpen(true)}
                      className="p-1 rounded-lg bg-slate-900/80 text-amber-300 hover:text-white border border-amber-500/30 text-[10px] flex items-center space-x-1"
                      title={lang === 'zh' ? '管理員編輯此代禱' : 'Edit prayer'}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{lang === 'zh' ? '管理' : 'Manage'}</span>
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                      {authorDisplay}
                    </span>
                    <span className="text-slate-400 font-mono">{prayer.date}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white">
                    {titleDisplay}
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                    {contentDisplay}
                  </p>
                </div>

                {/* Bottom Pray Counter */}
                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="text-xs text-slate-400 flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>{prayer.prayedCount} {lang === 'zh' ? '人已代禱' : 'Prayers offered'}</span>
                  </div>

                  <button
                    onClick={() => handlePrayClick(prayer.id)}
                    disabled={prayedIds[prayer.id]}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      prayedIds[prayer.id]
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${prayedIds[prayer.id] ? 'fill-emerald-400' : 'fill-amber-400/40'}`} />
                    <span>{prayedIds[prayer.id] ? (lang === 'zh' ? '已同心禱告' : 'Prayed') : (lang === 'zh' ? '我為此禱告' : 'I Prayed')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Prayer Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl my-auto">
              <button
                onClick={handleCloseSubmitModal}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '向神祈求與感恩 • Email 同步授理' : 'Submit Prayer Need'}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {lang === 'zh' ? '提出代禱事項登記' : 'Request Prayer'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'zh'
                    ? '填寫後系統將把完整資料 Email 至教會同工信箱 (web@canaannewlife.org)，由管理員授理確認後放到網頁代禱牆。'
                    : 'Details will be emailed to web@canaannewlife.org for pastoral review before posting.'}
                </p>
              </div>

              {submitResult ? (
                <div className="p-6 bg-slate-850 border border-emerald-500/50 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-emerald-200 text-lg">
                      {lang === 'zh' ? '代禱事項已成功送出！' : 'Prayer Request Submitted!'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed px-2">
                      {submitResult.msg}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-xs text-amber-300/90 text-left space-y-1">
                    <div className="font-semibold text-white flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'zh' ? '已自動寄送至：' : 'Emailed to:'} web@canaannewlife.org</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {lang === 'zh'
                        ? '加南新生基督教會長執同工與教牧團隊感謝您的信任，願神親自賜福並施恩看顧！'
                        : 'Our pastoral team is praying for you in Christ.'}
                    </div>
                  </div>

                  <button
                    onClick={handleCloseSubmitModal}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition-colors"
                  >
                    {lang === 'zh' ? '完成並關閉' : 'Done'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreatePrayer} className="space-y-4 text-xs sm:text-sm">
                  {/* Name */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'zh' ? '您的姓名 / 署名 (Name)' : 'Your Name or Anonymous'}
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={lang === 'zh' ? '例如：林姊妹 / 陳弟兄 (留空則顯示為無名氏)' : 'e.g. Sister Lin / Anonymous'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-amber-400" />
                        <span>{lang === 'zh' ? '聯絡電話 (選填)' : 'Phone (Optional)'}</span>
                      </label>
                      <input
                        type="tel"
                        value={authorPhone}
                        onChange={(e) => setAuthorPhone(e.target.value)}
                        placeholder="(310) 000-0000"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-amber-400" />
                        <span>{lang === 'zh' ? '電子信箱 (選填)' : 'Email (Optional)'}</span>
                      </label>
                      <input
                        type="email"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="yourname@email.com"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'zh' ? '代禱主題 (Title) *' : 'Prayer Title *'}
                    </label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={lang === 'zh' ? '簡述代禱或感恩事項...' : 'Brief summary...'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Category & Confidential */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        {lang === 'zh' ? '分類' : 'Category'}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="general">{lang === 'zh' ? '教會事工 (Church)' : 'Church'}</option>
                        <option value="health">{lang === 'zh' ? '身體健康 (Health)' : 'Health'}</option>
                        <option value="family">{lang === 'zh' ? '家庭親情 (Family)' : 'Family'}</option>
                        <option value="faith">{lang === 'zh' ? '屬靈追求 (Spiritual)' : 'Spiritual'}</option>
                        <option value="thanksgiving">{lang === 'zh' ? '感恩讚美 (Thanksgiving)' : 'Thanksgiving'}</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-2 sm:pt-6">
                      <label className="flex items-center space-x-2 text-xs text-amber-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isConfidential}
                          onChange={(e) => setIsConfidential(e.target.checked)}
                          className="rounded border-slate-700 text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span>{lang === 'zh' ? '僅供教牧保密代禱 (不公開)' : 'Confidential to Pastors only'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'zh' ? '詳細代禱內容 (Prayer Details) *' : 'Prayer Details *'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={lang === 'zh' ? '請分享詳細需要，同工團隊收到後將同心守望代求...' : 'Share details for prayer...'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Submission note */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-400 space-y-1">
                    <p className="flex items-center space-x-1 text-amber-300 font-semibold">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '送出後將發送至：' : 'Will be sent to: '}web@canaannewlife.org</span>
                    </p>
                    <p>
                      {lang === 'zh'
                        ? '由教會管理員與同工團隊授理，確認後放到網頁代禱事項。'
                        : 'Reviewed by church administrators before appearing on the public prayer wall.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{lang === 'zh' ? '發送中...' : 'Sending...'}</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'zh' ? '送出代禱登記' : 'Submit Prayer'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

        {/* Admin Prayer Management Modal */}
        {isAdmin && (
          <AdminPrayerManagementModal
            isOpen={isAdminManageOpen}
            onClose={() => setIsAdminManageOpen(false)}
            lang={lang}
            prayers={prayers}
            onUpdatePrayers={(newPrayers) => {
              setPrayers(newPrayers);
              try {
                localStorage.setItem('canaan_prayers_data', JSON.stringify(newPrayers));
              } catch {}
              window.dispatchEvent(new CustomEvent('canaan_prayers_updated', { detail: { prayers: newPrayers } }));
            }}
            showToast={showToast}
          />
        )}

      </div>
    </section>
  );
};
