import React, { useState } from 'react';
import { Language } from '../types';
import { ANNUAL_BIBLE_READING_RAW, DailyReadingItem } from '../data/annualBibleReading';
import { translateScriptureToEn } from '../utils/translationHelper';
import { X, BookOpen, Calendar, Search, ChevronRight, Bookmark } from 'lucide-react';

interface AnnualReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialMonth?: number;
}

const MONTH_NAMES_ZH = [
  '一月 (Jan)', '二月 (Feb)', '三月 (Mar)', '四月 (Apr)',
  '五月 (May)', '六月 (Jun)', '七月 (Jul)', '八月 (Aug)',
  '九月 (Sep)', '十月 (Oct)', '十一月 (Nov)', '十二月 (Dec)'
];

export const AnnualBibleReadingModal: React.FC<AnnualReadingModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMonth = new Date().getMonth() + 1,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // Filter items
  const filteredItems = ANNUAL_BIBLE_READING_RAW.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const otEn = translateScriptureToEn(item.oldTestament).toLowerCase();
      const ntEn = translateScriptureToEn(item.newTestament).toLowerCase();
      return (
        item.oldTestament.toLowerCase().includes(q) ||
        item.newTestament.toLowerCase().includes(q) ||
        otEn.includes(q) ||
        ntEn.includes(q) ||
        `${item.month}/${item.day}`.includes(q)
      );
    }
    return item.month === selectedMonth;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-850 to-slate-900 text-white p-6 relative flex items-center justify-between border-b border-amber-800">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-700/50">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '《靈命日糧》全年通讀聖經進度表' : 'Annual Bible Reading Plan (365 Days)'}</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-50">
              {lang === 'zh' ? '每日讀經與靈修計畫' : 'Daily Bible Reading & Devotional Plan'}
            </h3>
            <p className="text-xs text-amber-200/80">
              {lang === 'zh' ? '一年讀完整本聖經（舊約與新約每日雙軌進度）' : 'Read through the entire Old & New Testament in one year'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-amber-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar: Month Tabs & Search */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* Month Selector Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {MONTH_NAMES_ZH.map((mName, idx) => {
              const mNum = idx + 1;
              const isSelected = !searchQuery && selectedMonth === mNum;
              const isCurrent = currentMonth === mNum;

              return (
                <button
                  key={mNum}
                  onClick={() => {
                    setSelectedMonth(mNum);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-amber-800 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{mName}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'zh' ? '搜尋書卷或章節 (例如: 創世記, 詩篇, 羅馬書, Matthew...)' : 'Search scripture (e.g. Genesis, Psalms, Matthew...)'}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {lang === 'zh' ? '查無符合的讀經進度，請嘗試其他關鍵字。' : 'No matching reading schedule found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item, idx) => {
                const isToday = currentMonth === item.month && currentDay === item.day;
                const otEn = translateScriptureToEn(item.oldTestament);
                const ntEn = translateScriptureToEn(item.newTestament);

                return (
                  <div
                    key={`${item.month}-${item.day}-${idx}`}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isToday
                        ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-1 ring-amber-400/50'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                        isToday ? 'bg-amber-800 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <span className="text-[10px] uppercase font-mono opacity-80">{item.month}月</span>
                        <span className="text-base leading-tight font-serif">{item.day}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
                            {lang === 'zh' ? `${item.month}月${item.day}日` : `${item.month}/${item.day}`}
                          </span>
                          {isToday && (
                            <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                              {lang === 'zh' ? '今日' : 'Today'}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            {lang === 'zh' ? item.oldTestament : otEn}
                          </span>
                          <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-medium">
                            {lang === 'zh' ? item.newTestament : ntEn}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{lang === 'zh' ? '加南新生基督教會 · 每日靈糧通讀計畫' : 'Canaan Shin Sheng Christian Church Daily Bible Plan'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition"
          >
            {lang === 'zh' ? '關閉視窗' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
