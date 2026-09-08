import React, { useState } from 'react';
import { DailyDevotion } from '../data/dailyDevotionData';
import { Language } from '../types';
import {
  X,
  BookOpen,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Sparkles,
  Sun,
  Heart,
  Quote
} from 'lucide-react';

interface DailyDevotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  devotion: DailyDevotion;
  formattedDateZh: string;
  formattedDateEn: string;
  lang: Language;
}

export const DailyDevotionModal: React.FC<DailyDevotionModalProps> = ({
  isOpen,
  onClose,
  devotion,
  formattedDateZh,
  formattedDateEn,
  lang
}) => {
  const [copied, setCopied] = useState(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'huge'>('large');

  if (!isOpen) return null;

  const dateText = lang === 'zh' ? formattedDateZh : formattedDateEn;
  const title = lang === 'zh' ? (devotion.titleZh || '美好的團契') : (devotion.titleEn || 'What a Fellowship');
  const verse = lang === 'zh' ? devotion.verseZh : devotion.verseEn;
  const reference = lang === 'zh' ? devotion.referenceZh : devotion.referenceEn;
  const reading = lang === 'zh' ? (devotion.passageReadingZh || devotion.referenceZh) : (devotion.passageReadingEn || devotion.referenceEn);
  const author = lang === 'zh' ? (devotion.authorZh || '雷翠霞') : (devotion.authorEn || 'Poh Fang Chia');
  const reflection = lang === 'zh' ? devotion.reflectionZh : devotion.reflectionEn;
  const prayer = lang === 'zh' ? devotion.prayerZh : devotion.prayerEn;
  const thought = lang === 'zh' ? devotion.thoughtZh : devotion.thoughtEn;
  const content = lang === 'zh' ? devotion.contentZh : devotion.contentEn;
  const odbmUrl = devotion.sourceUrl || 'https://www.odbm.org/tc/devotionals';

  const handleCopy = () => {
    const textToCopy = lang === 'zh'
      ? `【加南今日經文靈修 • ${dateText}】\n主題：《${title}》\n讀經：${reading}\n\n📖 今日經文：\n“${verse}”（${reference}）\n\n💡 反思：\n${reflection}\n\n🙏 禱告：\n${prayer}\n\n🌱 勉勵默想：\n${thought}\n\n🌐 靈修出處：靈命日糧 (www.odbm.org/tc/devotionals)\n加南新生基督教會 祝福您！`
      : `[Canaan Daily Devotion • ${dateText}]\nTitle: "${title}"\nPassage: ${reading}\n\n📖 Today's Scripture:\n"${verse}" (${reference})\n\n💡 Reflection:\n${reflection}\n\n🙏 Prayer:\n${prayer}\n\n🌱 Devotional Thought:\n${thought}\n\n🌐 Source: Our Daily Bread (www.odbm.org)\nCanaan Shin Sheng Christian Church wishes you a blessed day!`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-amber-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/25 border border-amber-400/40 text-amber-200 tracking-wide">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'zh' ? '靈命日糧 • 今日靈修' : 'Our Daily Bread • Devotional'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 border border-emerald-400/30 text-emerald-200">
                  <Calendar className="w-3 h-3 text-emerald-300" />
                  <span>{dateText}</span>
                  <span className="text-[10px] bg-emerald-400/30 px-1.5 py-0.2 rounded font-bold ml-1">
                    {lang === 'zh' ? '今天' : 'Today'}
                  </span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-50 tracking-tight pt-1">
                {title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-amber-200/90 font-medium">
                {author && (
                  <span>
                    {lang === 'zh' ? `作者：${author}` : `Author: ${author}`}
                  </span>
                )}
                {reading && (
                  <span>
                    {lang === 'zh' ? `讀經：${reading}` : `Reading: ${reading}`}
                  </span>
                )}
              </div>
            </div>

            {/* Close & Font scaler buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setFontScale(prev => prev === 'normal' ? 'large' : prev === 'large' ? 'huge' : 'normal');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold text-amber-200 border border-white/15 transition-colors cursor-pointer"
                title={lang === 'zh' ? '切換字體大小' : 'Change font size'}
              >
                A{fontScale === 'huge' ? '++' : fontScale === 'large' ? '+' : ''}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title={lang === 'zh' ? '關閉' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 bg-stone-50/50">
          {/* Section 1: 今日經文 (Today's Scripture) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-stone-50 rounded-2xl p-5 sm:p-6 border-2 border-amber-300/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-amber-200/90 pb-2.5">
              <div className="flex items-center space-x-2 text-amber-950 font-bold text-base sm:text-lg">
                <span className="p-1 rounded-lg bg-amber-200 text-amber-900">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span>{lang === 'zh' ? '今日經文' : "Today's Scripture"}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-200/70 px-2.5 py-1 rounded-lg border border-amber-300">
                {reference}
              </span>
            </div>

            <blockquote className={`font-serif italic text-stone-900 leading-relaxed font-semibold pl-3 border-l-4 border-amber-500 ${
              fontScale === 'huge' ? 'text-2xl sm:text-3xl' : fontScale === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}>
              “{verse}”
            </blockquote>

            <div className="text-right text-xs sm:text-sm font-bold text-amber-900">
              —— {reference}
            </div>
          </div>

          {/* Section 2: 靈修信息文章 (Devotional Reflection Article) */}
          {content && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-stone-800 font-bold text-base sm:text-lg border-b border-stone-200 pb-2">
                <Quote className="w-4 h-4 text-amber-600" />
                <span>{lang === 'zh' ? '靈修信息' : 'Devotional Message'}</span>
              </div>

              <div className={`text-stone-700 leading-relaxed space-y-3.5 font-normal ${
                fontScale === 'huge' ? 'text-xl sm:text-2xl' : fontScale === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}>
                {content.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="indent-6 sm:indent-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: 反思和禱告 (Reflect and Pray) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-950 font-bold text-lg sm:text-xl border-b border-amber-200 pb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>{lang === 'zh' ? '反思和禱告' : 'Reflect & Pray'}</span>
            </div>

            {/* 反思 (Reflection) */}
            <div className="bg-amber-50/75 rounded-2xl p-5 sm:p-6 border border-amber-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-lg bg-amber-200 text-amber-950 border border-amber-300">
                  💡 {lang === 'zh' ? '反思' : 'Reflection'}
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  {lang === 'zh' ? '安靜默想・光照心靈' : 'Quiet Meditation'}
                </span>
              </div>
              <p className={`text-stone-800 font-medium leading-relaxed pt-1 ${
                fontScale === 'huge' ? 'text-xl sm:text-2xl' : fontScale === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}>
                {reflection}
              </p>
            </div>

            {/* 禱告 (Prayer) */}
            <div className="bg-emerald-50/75 rounded-2xl p-5 sm:p-6 border border-emerald-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-lg bg-emerald-200 text-emerald-950 border border-emerald-300">
                  🙏 {lang === 'zh' ? '禱告' : 'Prayer'}
                </span>
                <span className="text-xs text-emerald-800 font-medium">
                  {lang === 'zh' ? '同心祈禱・回應神恩' : 'United Prayer'}
                </span>
              </div>
              <p className={`text-stone-800 italic font-medium leading-relaxed pt-1 ${
                fontScale === 'huge' ? 'text-xl sm:text-2xl' : fontScale === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}>
                {prayer}
              </p>
            </div>
          </div>

          {/* Section 4: 今日勉勵 • 金句默想 (Takeaway Thought) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex items-start space-x-3.5">
            <span className="text-2xl shrink-0 mt-0.5">🌱</span>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-stone-900">
                {lang === 'zh' ? '今日勉勵' : "Today's Encouragement"}
              </h4>
              <p className={`text-stone-600 leading-relaxed ${
                fontScale === 'huge' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
              }`}>
                {thought}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="bg-stone-100 p-4 sm:p-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-600">
            <span>{lang === 'zh' ? '靈修出處：' : 'Source:'}</span>
            <a
              href={odbmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 hover:text-amber-950 font-bold underline underline-offset-2 inline-flex items-center gap-1"
            >
              <span>靈命日糧 (www.odbm.org)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 transition-colors shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span className="text-emerald-700">{lang === 'zh' ? '已複製到剪貼簿' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>{lang === 'zh' ? '複製分享' : 'Copy'}</span>
                </>
              )}
            </button>

            <a
              href={odbmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-md cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'zh' ? '到 odbm.org 閱讀' : 'Open odbm.org'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-85" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
