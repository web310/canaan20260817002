import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { CHURCH_INFO, WEEKLY_BIBLE_READING } from '../data/churchData';
import { BookOpen, Bookmark, Phone, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Compass } from 'lucide-react';
import { translateDateWeekdayToEn, translateScriptureToEn } from '../utils/translationHelper';
import { getWeekScheduleFromAnnual } from '../data/annualBibleReading';
import { AnnualBibleReadingModal } from './AnnualBibleReadingModal';

interface WeeklyHighlightProps {
  lang: Language;
}

export const WeeklyBulletinHighlight: React.FC<WeeklyHighlightProps> = ({ lang }) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);

  const [bulletinData, setBulletinData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('canaan_bulletin_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Fetch initial master bulletin from backend if available
    fetch('/api/bulletin')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBulletinData((prev: any) => prev || data.data);
          try {
            if (!localStorage.getItem('canaan_bulletin_data')) {
              localStorage.setItem('canaan_bulletin_data', JSON.stringify(data.data));
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {});

    const handleBulletinUpdated = (e: any) => {
      if (e.detail) {
        setBulletinData(e.detail);
      }
    };
    window.addEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
    return () => window.removeEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
  }, []);

  const memoryVerse = lang === 'zh'
    ? (bulletinData?.memoryVerse || WEEKLY_BIBLE_READING.memoryVerseZh)
    : (bulletinData?.memoryVerseEn || WEEKLY_BIBLE_READING.memoryVerseEn || bulletinData?.memoryVerse);

  const memoryVerseRef = lang === 'zh'
    ? (bulletinData?.memoryVerseRef || WEEKLY_BIBLE_READING.verseReferenceZh || WEEKLY_BIBLE_READING.verseReference)
    : (bulletinData?.memoryVerseRefEn || WEEKLY_BIBLE_READING.verseReferenceEn || translateScriptureToEn(bulletinData?.memoryVerseRef || WEEKLY_BIBLE_READING.verseReference));

  // Automatically derive reading from the fixed 365-day annual schedule according to current calendar date & week offset
  const autoWeeklyPlan = getWeekScheduleFromAnnual(new Date(), weekOffset);
  const readingSchedule = autoWeeklyPlan.schedule;
  const readingRange = lang === 'zh' ? autoWeeklyPlan.rangeZh : autoWeeklyPlan.rangeEn;

  return (
    <section className="py-16 bg-gradient-to-b from-amber-50/80 via-white to-slate-50 border-y border-amber-200/60 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header with Annual Theme */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>{lang === 'zh' ? '年度主題 (Annual Theme)' : 'Annual Theme'}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-950">
            {lang === 'zh' ? CHURCH_INFO.annualThemeZh : CHURCH_INFO.annualThemeEn}
          </h2>
          <p className="text-amber-800 font-serif italic text-sm sm:text-base">
            {lang === 'zh' ? `"${CHURCH_INFO.annualThemeEn}"` : `"${CHURCH_INFO.annualThemeZh}"`}
          </p>
        </div>

        {/* 3 Grid Column Layout derived from the Weekly Bulletin & 365-Day Bible Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Card 1: Memory Verse of the Week (背誦經文) */}
          <div className="lg:col-span-4 bg-amber-900 text-amber-50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between border border-amber-800">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-600/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b border-amber-800/80 pb-3">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'zh' ? '【本週背誦經文】' : 'Weekly Memory Verse'}</span>
                </span>
                <span className="text-[11px] bg-amber-950/80 px-2.5 py-1 rounded-md text-amber-300 font-mono">
                  {memoryVerseRef}
                </span>
              </div>

              <blockquote className="font-serif text-lg sm:text-xl font-bold leading-relaxed text-amber-100 pt-2">
                "{memoryVerse}"
              </blockquote>
            </div>

            <div className="pt-6 border-t border-amber-800/60 mt-6 text-xs text-amber-300/80 flex items-center justify-between">
              <span>{lang === 'zh' ? '加南新生基督教會 週報精選' : 'Canaan Shin Sheng Bulletin'}</span>
              <span className="font-mono text-[10px]">Passcode: {CHURCH_INFO.zoomPasscode}</span>
            </div>
          </div>

          {/* Card 2: Weekly Bible Reading Progress (本週讀經進度 - 自動依 365 天進度表循環) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-700" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight">
                      {lang === 'zh' ? '【每日讀經進度】' : 'Daily Bible Reading Plan'}
                    </h3>
                    <div className="text-[10px] text-amber-800 font-medium">
                      {lang === 'zh' ? '《靈命日糧》全年通讀聖經' : 'Daily Bread 365 Plan'}
                    </div>
                  </div>
                </div>

                {/* Week Navigator */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setWeekOffset(prev => prev - 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                    title={lang === 'zh' ? '上一週' : 'Previous Week'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs text-amber-900 font-bold font-mono px-2 py-0.5 bg-amber-50 border border-amber-200/80 rounded-md">
                    {readingRange}
                  </span>

                  <button
                    onClick={() => setWeekOffset(prev => prev + 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                    title={lang === 'zh' ? '下一週' : 'Next Week'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {weekOffset !== 0 && (
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="ml-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold transition"
                      title={lang === 'zh' ? '返回本週' : 'Back to Current Week'}
                    >
                      {lang === 'zh' ? '本週' : 'Today'}
                    </button>
                  )}
                </div>
              </div>

              {/* 7-Day Reading List */}
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                {readingSchedule.map((day, idx) => {
                  const dateDisplay = lang === 'zh' ? day.date : day.dateEn;
                  const oldTestamentDisplay = lang === 'zh' ? day.oldTestament : day.oldTestamentEn;
                  const newTestamentDisplay = lang === 'zh' ? day.newTestament : day.newTestamentEn;

                  return (
                    <div
                      key={idx}
                      className={`py-2 px-2 rounded-xl flex items-center justify-between transition-colors ${
                        day.isToday ? 'bg-amber-50/90 font-medium text-amber-950 border border-amber-200/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2 w-28 shrink-0">
                        <span className={`font-bold ${day.isToday ? 'text-amber-900' : 'text-slate-800'}`}>
                          {dateDisplay}
                        </span>
                        {day.isToday && (
                          <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                            {lang === 'zh' ? '今日' : 'Today'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-slate-600 font-mono text-[11px] sm:text-xs">
                        <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80 font-medium">
                          {oldTestamentDisplay}
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-medium">
                          {newTestamentDisplay}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Button to Open Full Year 365 Days Plan */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {lang === 'zh' ? '每日同步舊約與新約' : 'Old & New Testament Daily'}
              </span>
              <button
                onClick={() => setIsAnnualModalOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '查閱全年 365 天讀經表' : 'View Full 365-Day Plan'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Member Care Contacts & Church Leadership (會友關懷與長執聯絡) */}
          <div className="lg:col-span-3 bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 text-amber-300">
                <Phone className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-base font-bold text-white">
                  {lang === 'zh' ? '會友關懷專線' : 'Member Care Contacts'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'zh'
                  ? '若有探訪、禱告、關懷需求或主日車輛接送，歡迎隨時撥打以下關懷長執專線：'
                  : 'Reach out to our elders and deacon for prayer, visitation, or transportation assistance.'}
              </p>

              <div className="space-y-3 pt-1 text-xs">
                {CHURCH_INFO.elders.map((elder, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">
                        {lang === 'zh' ? elder.nameZh : elder.nameEn}
                      </div>
                      <div className="text-[11px] text-amber-400">
                        {lang === 'zh' ? elder.titleZh : elder.titleEn}
                      </div>
                    </div>
                    <a
                      href={`tel:${elder.phone.replace(/[^0-9]/g, '')}`}
                      className="font-mono text-amber-300 font-semibold hover:underline"
                    >
                      {elder.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-950/80 border border-amber-800/60 rounded-2xl text-[11px] text-amber-200 space-y-1">
              <div className="font-bold text-amber-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'zh' ? '教會聯絡專線' : 'Church Main Line'}</span>
              </div>
              <div className="font-mono font-bold text-white">{CHURCH_INFO.phone1}</div>
            </div>
          </div>

        </div>

      </div>

      {/* Full Year 365-Day Bible Reading Modal */}
      <AnnualBibleReadingModal
        isOpen={isAnnualModalOpen}
        onClose={() => setIsAnnualModalOpen(false)}
        lang={lang}
      />
    </section>
  );
};


