import React from 'react';
import { ComputedChurchEvent } from '../utils/scheduleHelper';
import { Language } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Plus,
  Check,
  Sparkles,
  Phone,
  Navigation,
  Share2
} from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ComputedChurchEvent | null;
  lang: Language;
  onAddToCalendar?: (evt: ComputedChurchEvent) => void;
  isAddedToCal?: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  lang,
  onAddToCalendar,
  isAddedToCal
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedPhone, setCopiedPhone] = React.useState<string | null>(null);

  if (!isOpen || !event) return null;

  const desc = lang === 'zh' ? (event.descriptionZh || event.description) : (event.description || event.descriptionZh);
  const title = lang === 'zh' ? (event.titleZh || event.title) : (event.title || event.titleZh);
  const time = lang === 'zh' ? (event.timeZh || event.time) : (event.time || event.timeZh);
  const location = lang === 'zh' ? (event.locationZh || event.location) : (event.location || event.locationZh);
  const dateFormatted = lang === 'zh' ? event.dateFormattedZh : event.dateFormattedEn;
  const recurrence = lang === 'zh' ? event.recurrenceRuleZh : event.recurrenceRuleEn;

  // Helper to detect Google Maps URLs in text or location
  const extractMapUrl = (text: string): string | null => {
    const match = text.match(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps)[^\s)]+/);
    return match ? match[0] : null;
  };

  const detectedMapUrl = extractMapUrl(desc) || (location.includes('http') ? extractMapUrl(location) : null);

  // Helper to copy phone or contact
  const handleCopyPhone = (phoneNum: string) => {
    navigator.clipboard.writeText(phoneNum.replace(/[^0-9]/g, ''));
    setCopiedPhone(phoneNum);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  // Helper to share or copy event summary
  const handleShareEvent = () => {
    const shareText = `【${title}】\n📅 日期：${dateFormatted} (${event.date})\n⏰ 時間：${time}\n📍 地點：${location}\n\n${desc}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Parse text into clickable links and phone numbers
  const renderFormattedDescription = (text: string) => {
    // Split by URLs first
    const urlRegex = /(https?:\/\/[^\s\n\r)]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const isGoogleMap = part.includes('maps.app.goo.gl') || part.includes('google.com/maps');
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-900 font-bold underline underline-offset-2 px-1 py-0.5 rounded bg-amber-50 hover:bg-amber-100 transition-colors my-0.5"
          >
            {isGoogleMap ? <Navigation className="w-4 h-4 text-amber-600 inline shrink-0" /> : <ExternalLink className="w-4 h-4 text-amber-600 inline shrink-0" />}
            <span>{isGoogleMap ? (lang === 'zh' ? '📍 開啟 Google 地圖定位導航' : '📍 Open Google Maps') : part}</span>
          </a>
        );
      }

      // Check for phone numbers e.g. (310) 989-4528 or 310-989-4528
      const phoneRegex = /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g;
      const subParts = part.split(phoneRegex);

      if (subParts.length > 1) {
        return (
          <React.Fragment key={index}>
            {subParts.map((sub, sIdx) => {
              if (sub.match(phoneRegex)) {
                return (
                  <span key={sIdx} className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50/90 px-2 py-0.5 rounded-md border border-amber-200/80 mx-1">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    <a href={`tel:${sub.replace(/[^0-9]/g, '')}`} className="hover:underline">
                      {sub}
                    </a>
                  </span>
                );
              }
              return sub;
            })}
          </React.Fragment>
        );
      }

      return part;
    });
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'education':
        return { badge: 'bg-teal-100 text-teal-800 border-teal-200', label: lang === 'zh' ? '禮拜前主日學' : 'Sunday School' };
      case 'prayer':
        return { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: lang === 'zh' ? '線上禱告會' : 'Prayer Meeting' };
      case 'worship':
        return { badge: 'bg-amber-100 text-amber-900 border-amber-200', label: lang === 'zh' ? '禮拜聖會' : 'Sunday Worship' };
      case 'fellowship':
        return { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: lang === 'zh' ? '細胞小組團契' : 'Cell Fellowship' };
      case 'devotion':
        return { badge: 'bg-purple-100 text-purple-800 border-purple-200', label: lang === 'zh' ? '靈修活動 • 培靈' : 'Spiritual Devotion' };
      case 'special':
      default:
        return { badge: 'bg-rose-100 text-rose-800 border-rose-200', label: lang === 'zh' ? '特別聚會 • 特會' : 'Special Gathering' };
    }
  };

  const categoryTheme = getCategoryTheme(event.category);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50/50 p-5 sm:p-6 border-b border-stone-200 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full border shadow-xs ${categoryTheme.badge}`}>
                {categoryTheme.label}
              </span>

              {event.daysUntil !== undefined && (
                <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full border ${
                  event.isToday || event.daysUntil === 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : event.daysUntil === 1
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}>
                  {event.isToday || event.daysUntil === 0
                    ? (lang === 'zh' ? '🔥 今日舉行' : 'Today')
                    : event.daysUntil === 1
                    ? (lang === 'zh' ? '⏳ 明天舉行' : 'Tomorrow')
                    : (lang === 'zh' ? `倒數 ${event.daysUntil} 天` : `In ${event.daysUntil} days`)}
                </span>
              )}

              {event.ordinalTextZh && (
                <span className="text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  📌 {lang === 'zh' ? event.ordinalTextZh : event.ordinalTextEn}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
            title={lang === 'zh' ? '關閉' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Key Schedule Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Date Box */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center space-x-2 text-amber-800 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{lang === 'zh' ? '聚會 / 活動日期' : 'Date'}</span>
              </div>
              <div className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                {dateFormatted}
              </div>
              <div className="text-xs text-stone-500 font-mono">
                {event.date}
              </div>
            </div>

            {/* Time Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
              <div className="flex items-center space-x-2 text-stone-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{lang === 'zh' ? '活動時間' : 'Time'}</span>
              </div>
              <div className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                {time}
              </div>
              <div className="text-xs text-stone-500">
                {recurrence}
              </div>
            </div>

            {/* Location Box */}
            <div className="sm:col-span-2 bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-stone-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{lang === 'zh' ? '活動地點 / 集合處' : 'Location / Meeting Point'}</span>
                </div>

                {detectedMapUrl && (
                  <a
                    href={detectedMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-3 py-1 rounded-lg transition-colors border border-amber-300/60"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '開啟地圖導航' : 'Directions'}</span>
                  </a>
                )}
              </div>

              <div className="text-base sm:text-lg font-medium text-stone-800">
                {location}
              </div>
            </div>

            {/* Zoom Meeting Box if present */}
            {event.zoomId && (
              <div className="sm:col-span-2 bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-900 text-xs sm:text-sm font-bold">
                    <Video className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>Zoom 線上會議資訊</span>
                  </div>
                  <a
                    href={`https://zoom.us/j/${event.zoomId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors shadow-xs"
                  >
                    <span>進入 Zoom</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-4 text-sm font-mono text-indigo-950">
                  <span>Zoom ID: <strong>{event.zoomId}</strong></span>
                  {event.zoomPasscode && <span>密碼: <strong>{event.zoomPasscode}</strong></span>}
                </div>
              </div>
            )}
          </div>

          {/* Full Detailed Description Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-base sm:text-lg border-b border-stone-200 pb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>{lang === 'zh' ? '完整活動詳情與報名資訊' : 'Full Event Details & Registration'}</span>
            </div>

            <div className="bg-stone-50/70 border border-stone-200/90 rounded-2xl p-5 sm:p-6 text-stone-800 leading-relaxed text-base sm:text-lg font-normal whitespace-pre-line break-words shadow-inner">
              {renderFormattedDescription(desc)}
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareEvent}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-sm sm:text-base transition-colors shadow-xs"
              title={lang === 'zh' ? '分享或複製此活動資訊' : 'Share event'}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-700">{lang === 'zh' ? '已複製內容' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-stone-600" />
                  <span>{lang === 'zh' ? '分享活動' : 'Share'}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {onAddToCalendar && (
              <button
                type="button"
                onClick={() => onAddToCalendar(event)}
                className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shadow-md"
              >
                {isAddedToCal ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-300">{lang === 'zh' ? '已開啟日曆' : 'Opened Calendar'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'zh' ? '加到 Google 日曆' : 'Add to Google Calendar'}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm sm:text-base transition-colors"
            >
              {lang === 'zh' ? '關閉' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
