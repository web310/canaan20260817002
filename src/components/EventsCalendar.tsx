import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { getUpcomingChurchEvents, ComputedChurchEvent } from '../utils/scheduleHelper';
import { Calendar, Clock, MapPin, Video, ExternalLink, Plus, Check, Sparkles, RefreshCw } from 'lucide-react';

interface EventsProps {
  lang: Language;
}

export const EventsCalendar: React.FC<EventsProps> = ({ lang }) => {
  const [events, setEvents] = useState<ComputedChurchEvent[]>(() => getUpcomingChurchEvents());
  const [addedCalId, setAddedCalId] = useState<string | null>(null);
  const [copiedZoom, setCopiedZoom] = useState(false);

  // Recalculate schedule every minute so when an event time passes, the next date appears automatically
  useEffect(() => {
    const updateEvents = () => {
      setEvents(getUpcomingChurchEvents());
    };
    const timer = setInterval(updateEvents, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCalendar = (evt: ComputedChurchEvent) => {
    // Generate Google Calendar Link
    const startTimeStr = evt.date.replace(/-/g, '');
    let startHour = "110000";
    let endHour = "123000";

    if (evt.category === 'education') {
      startHour = "100000";
      endHour = "105000";
    } else if (evt.category === 'prayer') {
      startHour = "200000";
      endHour = "211500";
    } else if (evt.category === 'fellowship') {
      startHour = "140000";
      endHour = "160000";
    }

    const title = encodeURIComponent(lang === 'zh' ? evt.titleZh : evt.title);
    const details = encodeURIComponent(
      (lang === 'zh' ? evt.descriptionZh : evt.description) + 
      (evt.zoomId ? `\nZoom ID: ${evt.zoomId} (Passcode: ${evt.zoomPasscode || '25226'})` : '')
    );
    const location = encodeURIComponent(lang === 'zh' ? evt.locationZh : evt.location);
    const dates = `${startTimeStr}T${startHour}/${startTimeStr}T${endHour}`;

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');

    setAddedCalId(evt.id);
    setTimeout(() => setAddedCalId(null), 3000);
  };

  const handleCopyZoom = () => {
    navigator.clipboard.writeText(CHURCH_INFO.zoomId);
    setCopiedZoom(true);
    setTimeout(() => setCopiedZoom(false), 2500);
  };

  const getDaysBadge = (days: number, isToday?: boolean) => {
    if (isToday || days === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 font-bold text-[11px] border border-rose-200">
          🔥 {lang === 'zh' ? '今日聚會' : 'Today'}
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 font-bold text-[11px] border border-amber-200">
          ⏳ {lang === 'zh' ? '明天舉行' : 'Tomorrow'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
        {lang === 'zh' ? `倒數 ${days} 天` : `In ${days} days`}
      </span>
    );
  };

  return (
    <section id="events" className="py-20 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>{lang === 'zh' ? '教會最新活動日程 (自動更新)' : 'Church Calendar & Upcoming Events'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              {lang === 'zh' ? '聚會日程 • 靈修活動' : 'Upcoming Gatherings & Events'}
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              {lang === 'zh' 
                ? '加南新生基督教會各項定期聚會日程。聚會時間過後，系統將自動推算並顯示下一次的聚會日期與詳情。'
                : 'Canaan Shin Sheng Christian Church gathering schedule. Dates automatically advance to the next upcoming session once completed.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => setEvents(getUpcomingChurchEvents())}
              className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
              title="即時更新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? '即時更新' : 'Refresh'}</span>
            </button>

            <a 
              href={`tel:${CHURCH_INFO.phone1}`}
              className="inline-flex items-center justify-center space-x-2 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-4 py-2.5 rounded-xl border border-amber-200 transition-colors"
            >
              <span>{lang === 'zh' ? '洽詢聚會: (310) 626-6103' : 'Inquiry: (310) 626-6103'}</span>
            </a>
          </div>
        </div>

        {/* Events Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {events.map((evt) => {
            const isEducation = evt.category === 'education';
            const isPrayer = evt.category === 'prayer';
            const isWorship = evt.category === 'worship';
            
            const cardTheme = isEducation 
              ? { border: 'border-teal-200/80', badge: 'bg-teal-100 text-teal-800', dateBg: 'from-teal-50/90 to-teal-50/30 border-teal-200/70', dateText: 'text-teal-950', labelText: 'text-teal-800', datePill: 'bg-teal-100/90 text-teal-800' }
              : isPrayer 
              ? { border: 'border-indigo-200/80', badge: 'bg-indigo-100 text-indigo-800', dateBg: 'from-indigo-50/90 to-indigo-50/30 border-indigo-200/70', dateText: 'text-indigo-950', labelText: 'text-indigo-800', datePill: 'bg-indigo-100/90 text-indigo-800' }
              : isWorship 
              ? { border: 'border-amber-200/80', badge: 'bg-amber-100 text-amber-900', dateBg: 'from-amber-50/90 to-amber-50/30 border-amber-200/70', dateText: 'text-amber-950', labelText: 'text-amber-800', datePill: 'bg-amber-100/90 text-amber-800' }
              : { border: 'border-emerald-200/80', badge: 'bg-emerald-100 text-emerald-800', dateBg: 'from-emerald-50/90 to-emerald-50/30 border-emerald-200/70', dateText: 'text-emerald-950', labelText: 'text-emerald-800', datePill: 'bg-emerald-100/90 text-emerald-800' };

            return (
              <div 
                key={evt.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                {/* Main Content Area */}
                <div className="space-y-4">
                  {/* Category & Days Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${cardTheme.badge}`}>
                      {isEducation ? (lang === 'zh' ? '禮拜前主日學' : 'Sunday School') :
                       isPrayer ? (lang === 'zh' ? '線上禱告會' : 'Prayer') :
                       isWorship ? (lang === 'zh' ? '禮拜聖會' : 'Worship') :
                       (lang === 'zh' ? '細胞小組' : 'Cell Group')}
                    </span>

                    {getDaysBadge(evt.daysUntil, evt.isToday)}
                  </div>

                  {/* Recurrence Rule Banner */}
                  <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 w-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{lang === 'zh' ? evt.recurrenceRuleZh : evt.recurrenceRuleEn}</span>
                  </div>

                  {/* Next Date Highlight Box - Clean Multi-row Structure */}
                  <div className={`bg-gradient-to-b ${cardTheme.dateBg} border rounded-2xl p-4 space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${cardTheme.labelText} uppercase tracking-wider flex items-center space-x-1`}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'zh' ? '下次聚會日期' : 'Next Gathering Date'}</span>
                      </span>
                      <span className={`text-[11px] font-mono font-semibold ${cardTheme.datePill} px-2 py-0.5 rounded-md`}>
                        {evt.date}
                      </span>
                    </div>

                    <div className={`text-xl font-bold ${cardTheme.dateText} font-serif tracking-tight whitespace-nowrap`}>
                      {lang === 'zh' ? evt.dateFormattedZh : evt.dateFormattedEn}
                    </div>

                    {evt.ordinalTextZh && (
                      <div className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        <span>📌</span>
                        <span>{lang === 'zh' ? evt.ordinalTextZh : evt.ordinalTextEn}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                      {lang === 'zh' ? evt.titleZh : evt.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {lang === 'zh' ? evt.descriptionZh : evt.description}
                    </p>
                  </div>

                  {/* Time & Location Details */}
                  <div className="space-y-2 text-xs text-slate-700 bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="font-semibold text-slate-800">{lang === 'zh' ? evt.timeZh : evt.time}</span>
                    </div>

                    <div className="flex items-start space-x-2">
                      {evt.zoomId ? (
                        <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      )}
                      <div className="leading-snug">
                        <div className="font-medium text-slate-800">
                          {lang === 'zh' ? evt.locationZh : evt.location}
                        </div>
                        {evt.zoomId && (
                          <div className="flex items-center space-x-2 mt-1.5">
                            <span className="text-[11px] font-mono text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              ID: {CHURCH_INFO.zoomId}
                            </span>
                            <button
                              onClick={handleCopyZoom}
                              className="text-[11px] text-indigo-700 hover:text-indigo-900 underline font-semibold flex items-center space-x-0.5"
                            >
                              {copiedZoom ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                              <span>{copiedZoom ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '複製ID' : 'Copy')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleAddToCalendar(evt)}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                  >
                    {addedCalId === evt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">{lang === 'zh' ? '已開啟日曆' : 'Opened Calendar'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-amber-300" />
                        <span>{lang === 'zh' ? '加到 Google 日曆' : 'Add to Google Cal'}</span>
                      </>
                    )}
                  </button>

                  {evt.zoomId && (
                    <a
                      href={`https://zoom.us/j/${evt.zoomId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shrink-0 shadow-sm"
                    >
                      <span>{lang === 'zh' ? 'Zoom 連線' : 'Zoom'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

