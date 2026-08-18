import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { CHURCH_INFO, WEEKLY_BIBLE_READING } from '../data/churchData';
import { BookOpen, Bookmark, Phone, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface WeeklyHighlightProps {
  lang: Language;
}

export const WeeklyBulletinHighlight: React.FC<WeeklyHighlightProps> = ({ lang }) => {
  const [bulletinData, setBulletinData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('canaan_bulletin_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleBulletinUpdated = (e: any) => {
      if (e.detail) {
        setBulletinData(e.detail);
      }
    };
    window.addEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
    return () => window.removeEventListener('canaan_bulletin_updated', handleBulletinUpdated as EventListener);
  }, []);

  const memoryVerse = bulletinData?.memoryVerse || (lang === 'zh' ? WEEKLY_BIBLE_READING.memoryVerseZh : WEEKLY_BIBLE_READING.memoryVerseEn);
  const memoryVerseRef = bulletinData?.memoryVerseRef || WEEKLY_BIBLE_READING.verseReference;
  const readingSchedule = (Array.isArray(bulletinData?.weeklyReadingSchedule) && bulletinData.weeklyReadingSchedule.length > 0)
    ? bulletinData.weeklyReadingSchedule
    : WEEKLY_BIBLE_READING.schedule;
  const readingRange = bulletinData?.weeklyReadingRange || WEEKLY_BIBLE_READING.readingRange || '8/17 - 8/23';

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
            {CHURCH_INFO.annualThemeZh}
          </h2>
          <p className="text-amber-800 font-serif italic text-sm sm:text-base">
            "{CHURCH_INFO.annualThemeEn}"
          </p>
        </div>

        {/* 3 Grid Column Layout derived from the Weekly Bulletin */}
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

          {/* Card 2: Weekly Bible Reading Progress (本週讀經進度) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  {lang === 'zh' ? '【本週讀經進度】' : 'Weekly Bible Reading Plan'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium font-mono">{readingRange}</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {readingSchedule.map((day: any, idx: number) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-800 w-24 shrink-0">{day.date}</span>
                  <div className="flex items-center space-x-3 text-slate-600 font-mono">
                    <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200/80">
                      {day.oldTestament}
                    </span>
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {day.newTestament}
                    </span>
                  </div>
                </div>
              ))}
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
    </section>
  );
};
