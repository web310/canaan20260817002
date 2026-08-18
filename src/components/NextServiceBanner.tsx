import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { CHURCH_INFO, WEEKLY_SCHEDULE } from '../data/churchData';
import { getNextSundayService, getNextSundaySchool, getNextThursdayPrayer, getNextCellGroupSaturday } from '../utils/scheduleHelper';
import { Calendar, Clock, Video, Copy, Check, ExternalLink, MapPin, Sparkles } from 'lucide-react';

interface NextServiceProps {
  lang: Language;
}

export const NextServiceBanner: React.FC<NextServiceProps> = ({ lang }) => {
  const [copiedZoom, setCopiedZoom] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextSundayDate, setNextSundayDate] = useState(() => getNextSundayService());
  const [nextSundaySchoolDate, setNextSundaySchoolDate] = useState(() => getNextSundaySchool());
  const [nextThursdayDate, setNextThursdayDate] = useState(() => getNextThursdayPrayer());
  const [nextCellDate, setNextCellDate] = useState(() => getNextCellGroupSaturday());

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      // Calculate next Sunday 11:00 AM
      const nextSunday = new Date();
      const dayOfWeek = now.getDay();
      
      if (dayOfWeek === 0) {
        // If today is Sunday, check if before 12:30 PM
        const isPastService = now.getHours() > 12 || (now.getHours() === 12 && now.getMinutes() >= 30);
        if (isPastService) {
          nextSunday.setDate(now.getDate() + 7);
        }
      } else {
        nextSunday.setDate(now.getDate() + ((7 - dayOfWeek) % 7));
      }
      nextSunday.setHours(11, 0, 0, 0);

      const diff = Math.max(0, nextSunday.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
      setNextSundayDate(getNextSundayService(now));
      setNextSundaySchoolDate(getNextSundaySchool(now));
      setNextThursdayDate(getNextThursdayPrayer(now));
      setNextCellDate(getNextCellGroupSaturday(now));
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyZoom = () => {
    navigator.clipboard.writeText(CHURCH_INFO.zoomId);
    setCopiedZoom(true);
    setTimeout(() => setCopiedZoom(false), 2500);
  };

  const getNextDateLabel = (idx: number) => {
    if (idx === 0) {
      // 禮拜聖會
      return lang === 'zh' ? `下次: ${nextSundayDate.dateFormattedZh}` : `Next: ${nextSundayDate.dateFormattedEn}`;
    }
    if (idx === 1) {
      // 線上禱告會
      return lang === 'zh' ? `下次: ${nextThursdayDate.dateFormattedZh}` : `Next: ${nextThursdayDate.dateFormattedEn}`;
    }
    if (idx === 2) {
      // 細胞小組
      return lang === 'zh' ? `下次: ${nextCellDate.dateFormattedZh}` : `Next: ${nextCellDate.dateFormattedEn}`;
    }
    if (idx === 3) {
      // 禮拜前主日學
      return lang === 'zh' ? `下次: ${nextSundaySchoolDate.dateFormattedZh}` : `Next: ${nextSundaySchoolDate.dateFormattedEn}`;
    }
    return null;
  };

  return (
    <section className="bg-amber-900 text-amber-50 py-12 px-4 sm:px-6 lg:px-8 shadow-inner border-y border-amber-800/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Countdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2 text-amber-300 font-medium text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{lang === 'zh' ? '距離下主日崇拜倒數' : 'Countdown to Next Sunday Worship'}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {lang === 'zh' ? `主日崇拜禮拜 • ${nextSundayDate.dateFormattedZh}` : `Sunday Service • ${nextSundayDate.dateFormattedEn}`}
            </h2>

            <p className="text-amber-200/80 text-sm">
              {lang === 'zh' 
                ? '加南新生基督教會誠摯邀請您與全家一同來到主的殿中敬拜，經歷神豐盛的愛與話語。'
                : 'Join us in person or online as we lift our voices, study God\'s Word, and enjoy fellowship.'}
            </p>

            {/* Countdown Blocks */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center">
              <div className="bg-amber-950/70 border border-amber-700/50 rounded-xl p-2.5">
                <span className="block text-xl sm:text-2xl font-bold text-white font-mono">{timeLeft.days}</span>
                <span className="text-[10px] sm:text-xs text-amber-300 uppercase">{lang === 'zh' ? '天' : 'Days'}</span>
              </div>
              <div className="bg-amber-950/70 border border-amber-700/50 rounded-xl p-2.5">
                <span className="block text-xl sm:text-2xl font-bold text-white font-mono">{timeLeft.hours}</span>
                <span className="text-[10px] sm:text-xs text-amber-300 uppercase">{lang === 'zh' ? '小時' : 'Hours'}</span>
              </div>
              <div className="bg-amber-950/70 border border-amber-700/50 rounded-xl p-2.5">
                <span className="block text-xl sm:text-2xl font-bold text-white font-mono">{timeLeft.minutes}</span>
                <span className="text-[10px] sm:text-xs text-amber-300 uppercase">{lang === 'zh' ? '分' : 'Mins'}</span>
              </div>
              <div className="bg-amber-950/70 border border-amber-700/50 rounded-xl p-2.5">
                <span className="block text-xl sm:text-2xl font-bold text-white font-mono">{timeLeft.seconds}</span>
                <span className="text-[10px] sm:text-xs text-amber-300 uppercase">{lang === 'zh' ? '秒' : 'Secs'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Weekly Schedule Quick Overview */}
          <div className="lg:col-span-7 bg-amber-950/60 rounded-2xl p-6 border border-amber-700/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif text-lg font-bold text-white">
                  {lang === 'zh' ? '每週定期聚會時間表' : 'Weekly Gathering Schedule'}
                </h3>
              </div>

              {/* Thursday Zoom Prayer Copy & Join */}
              <div className="flex items-center space-x-2 bg-amber-900/80 px-3 py-1 rounded-lg border border-amber-700/60 text-xs text-amber-200">
                <Video className="w-3.5 h-3.5 text-amber-300" />
                <span>Zoom ID: <strong className="text-white font-mono">{CHURCH_INFO.zoomId}</strong></span>
                <button
                  onClick={handleCopyZoom}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy Zoom ID"
                >
                  {copiedZoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`https://zoom.us/j/${CHURCH_INFO.zoomId.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 px-2 py-0.5 bg-amber-700 hover:bg-amber-600 text-white rounded text-[11px] font-bold flex items-center space-x-1 transition-colors"
                >
                  <span>{lang === 'zh' ? '進入聚會' : 'Join'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {WEEKLY_SCHEDULE.map((item, idx) => {
                const nextDateTag = getNextDateLabel(idx);
                return (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-amber-900/40 border border-amber-800/40 hover:bg-amber-900/60 transition-colors relative"
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="text-xs text-amber-300 font-semibold truncate">
                        {lang === 'zh' ? item.eventZh : item.eventEn}
                      </div>
                      {nextDateTag && (
                        <span className="text-[10px] font-bold text-amber-100 bg-amber-800/80 px-1.5 py-0.5 rounded border border-amber-600/50 shrink-0">
                          {nextDateTag}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{lang === 'zh' ? item.timeZh : item.timeEn}</span>
                    </div>
                    <div className="text-xs text-amber-200/80 mt-1 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{lang === 'zh' ? item.locationZh : item.locationEn}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

