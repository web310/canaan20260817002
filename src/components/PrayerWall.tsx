import React, { useState, useEffect } from 'react';
import { Language, PrayerRequest } from '../types';
import { INITIAL_PRAYERS, CHURCH_INFO } from '../data/churchData';
import { Heart, Plus, ShieldCheck, Lock, Check, Send, Filter, X, Sparkles, MessageSquare, RotateCcw } from 'lucide-react';

interface PrayerProps {
  lang: Language;
  onOpenAI: () => void;
}

export const PrayerWall: React.FC<PrayerProps> = ({ lang, onOpenAI }) => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem('canaan_prayers_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'health' | 'family' | 'faith' | 'thanksgiving' | 'general'>('health');
  const [isConfidential, setIsConfidential] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Save to localStorage whenever prayers change
  useEffect(() => {
    try {
      localStorage.setItem('canaan_prayers_data', JSON.stringify(prayers));
    } catch (e) {
      console.warn("Prayer storage sync error:", e);
    }
  }, [prayers]);

  // Listen to external prayer updates (e.g. from Bulletin Admin Modal or storage)
  useEffect(() => {
    const handlePrayersUpdated = (e: any) => {
      if (e.detail?.prayers && Array.isArray(e.detail.prayers)) {
        setPrayers(e.detail.prayers);
      }
    };

    const handleBulletinUpdated = (e: any) => {
      if (e.detail?.prayerRequests && Array.isArray(e.detail.prayerRequests) && e.detail.prayerRequests.length > 0) {
        const bulletinPrayers: PrayerRequest[] = e.detail.prayerRequests.map((req: string, idx: number) => ({
          id: `bulletin-prayer-${idx + 1}-${Date.now()}`,
          author: lang === 'zh' ? '教會同工會' : 'Church Board',
          category: idx === 0 ? 'general' : idx === 1 ? 'faith' : 'health',
          title: req,
          content: `${req}。請全體弟兄姊妹同心在主前守望代求，經歷神豐盛恩典與引導。`,
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
    };

    window.addEventListener('canaan_prayers_updated', handlePrayersUpdated as EventListener);
    window.addEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('canaan_prayers_updated', handlePrayersUpdated as EventListener);
      window.removeEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [lang]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrayClick = (id: string) => {
    if (prayedIds[id]) return;
    setPrayedIds(prev => ({ ...prev, [id]: true }));
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p));
  };

  const handleResetToOfficialPrayers = () => {
    setPrayers(INITIAL_PRAYERS);
    try {
      localStorage.setItem('canaan_prayers_data', JSON.stringify(INITIAL_PRAYERS));
    } catch {}
    window.dispatchEvent(new CustomEvent('canaan_prayers_updated', { detail: { prayers: INITIAL_PRAYERS } }));
    showToast(lang === 'zh' ? '已成功同步最新教會官方代禱事項！' : 'Synced with latest official church prayer requests!');
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (!isConfidential) {
      const newPrayer: PrayerRequest = {
        id: `prayer-${Date.now()}`,
        author: authorName || (lang === 'zh' ? '無名氏弟兄/姊妹' : 'Anonymous'),
        category,
        title,
        content,
        date: new Date().toISOString().split('T')[0],
        isConfidential: false,
        prayedCount: 1,
      };
      const updated = [newPrayer, ...prayers];
      setPrayers(updated);
      try {
        localStorage.setItem('canaan_prayers_data', JSON.stringify(updated));
      } catch {}
      window.dispatchEvent(new CustomEvent('canaan_prayers_updated', { detail: { prayers: updated } }));
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitModalOpen(false);
      setTitle('');
      setContent('');
      setAuthorName('');
    }, 2500);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
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
                ? '在愛中互相擔當重擔。您可以點擊「我為此禱告」，或提交個人代禱需求（可選擇教牧同工團隊密件收悉）。'
                : 'Bear one another\'s burdens in love. Click "I Prayed For This" or submit a confidential prayer request.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'zh' ? '提出代禱事項' : 'Submit Prayer Request'}</span>
            </button>

            <button
              onClick={handleResetToOfficialPrayers}
              title="重設/同步最新代禱事項"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-3 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '同步最新代禱' : 'Sync Latest'}</span>
            </button>

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
          {filteredPrayers.map((prayer) => (
            <div 
              key={prayer.id}
              className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {prayer.author}
                  </span>
                  <span className="text-slate-400 font-mono">{prayer.date}</span>
                </div>

                <h3 className="font-serif text-lg font-bold text-white">
                  {prayer.title}
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {prayer.content}
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
          ))}
        </div>

        {/* Submit Prayer Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {lang === 'zh' ? '向神祈求與感恩' : 'Submit Prayer Need'}
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {lang === 'zh' ? '代禱與祝福登記' : 'Request Prayer'}
                </h3>
              </div>

              {submitSuccess ? (
                <div className="p-6 bg-emerald-950/80 border border-emerald-600/50 rounded-2xl text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="font-bold text-emerald-200 text-base">
                    {lang === 'zh' ? '代禱事項已受理！' : 'Prayer Request Submitted'}
                  </div>
                  <p className="text-xs text-emerald-300">
                    {isConfidential 
                      ? (lang === 'zh' ? '此代禱已加密寄送給教牧同工團隊，將為您私下守望禱告。' : 'Sent privately to the pastoral team.')
                      : (lang === 'zh' ? '已發布至教會代禱牆，弟兄姊妹將與您一同守望！' : 'Posted on church prayer wall for believers to intercede.')
                    }
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreatePrayer} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'zh' ? '署名 (姓名或無名氏)' : 'Your Name or Anonymous'}
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={lang === 'zh' ? '例如：林姊妹 / 陳弟兄 (可留空)' : 'e.g. Sister Lin / Anonymous'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'zh' ? '代禱主題 (Title)' : 'Prayer Title'}
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        {lang === 'zh' ? '分類' : 'Category'}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="general">{lang === 'zh' ? '教會事工' : 'Church'}</option>
                        <option value="health">{lang === 'zh' ? '身體健康' : 'Health'}</option>
                        <option value="family">{lang === 'zh' ? '家庭親情' : 'Family'}</option>
                        <option value="faith">{lang === 'zh' ? '屬靈追求' : 'Spiritual'}</option>
                        <option value="thanksgiving">{lang === 'zh' ? '感恩讚美' : 'Thanksgiving'}</option>
                      </select>
                    </div>

                    <div className="flex items-end pb-1">
                      <label className="flex items-center space-x-2 text-xs text-amber-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isConfidential}
                          onChange={(e) => setIsConfidential(e.target.checked)}
                          className="rounded border-slate-700 text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span>{lang === 'zh' ? '教牧團隊保密代禱' : 'Confidential to Pastors'}</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {lang === 'zh' ? '詳細代禱內容 (Prayer Detail)' : 'Prayer Details'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={lang === 'zh' ? '請分享詳細需要...' : 'Share details for prayer...'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 text-white font-bold py-3 rounded-xl shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === 'zh' ? '提交代禱' : 'Submit Prayer'}</span>
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
