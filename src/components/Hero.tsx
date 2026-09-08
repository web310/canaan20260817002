import React, { useState } from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { MapPin, Play, Heart, Sparkles, Clock, Sun, Copy, Check, BookOpen, ExternalLink } from 'lucide-react';
import heroImgUrl from '../assets/images/canaan_church_hero_1786434083190.jpg';
import { getTodayDevotion } from '../data/dailyDevotionData';

interface HeroProps {
  lang: Language;
  onOpenGiving: () => void;
  onOpenAI: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenGiving, onOpenAI }) => {
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [fontScale, setFontScale] = useState<'large' | 'huge'>('large');
  const todayDevotion = getTodayDevotion();

  const handleCopyVerse = () => {
    const d = todayDevotion.devotion;
    const verseText = lang === 'zh'
      ? `【加南今日經文靈修 • ${todayDevotion.formattedDateZh}】\n\n📖 靈修經文：\n“${d.verseZh}”（${d.referenceZh}）\n\n💡 今日勉勵 • 反思：\n${d.reflectionZh || d.thoughtZh}\n\n🙏 今日禱告：\n${d.prayerZh || '親愛的天父，祢是又真又活的上帝，感謝祢一直看顧我。'}\n\n🌱 靈修出處：靈命日糧 (www.odbm.org)\n加南新生基督教會 祝福您有平安喜樂的一天！`
      : `[Canaan Daily Scripture & Devotion • ${todayDevotion.formattedDateEn}]\n\n📖 Scripture:\n"${d.verseEn}" (${d.referenceEn})\n\n💡 Today's Encouragement • Reflection:\n${d.reflectionEn || d.thoughtEn}\n\n🙏 Today's Prayer:\n${d.prayerEn || 'Dear Heavenly Father, You are the true and living God. Thank You for always watching over me.'}\n\n🌱 Source: Our Daily Bread (www.odbm.org)\nCanaan Shin Sheng Christian Church wishes you a blessed day!`;
    
    navigator.clipboard.writeText(verseText);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 md:pt-36 md:pb-28 flex items-center bg-slate-950 overflow-hidden text-white">
      {/* Background Image with Warm Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImgUrl} 
          alt="Canaan Shin Sheng Christian Church Sanctuary" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 scale-105 transform filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60" />
        <div className="absolute inset-0 bg-amber-950/20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 backdrop-blur-md px-4 py-2 rounded-full text-amber-300 text-sm sm:text-base font-semibold tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              {lang === 'zh' ? '基督教會 • 創立於1984年' : 'Christian Church • Est. 1984'}
            </span>
          </div>

          {/* Main Titles */}
          <div className="space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              {lang === 'zh' ? (
                <>
                  歡迎來到 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">加南新生基督教會</span>
                </>
              ) : (
                <>
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">Canaan Shin Sheng</span>
                </>
              )}
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-amber-200 tracking-wide font-normal">
              {lang === 'zh' ? '為榮耀神而活 • 走生命的樣式 • 深化主內愛心' : 'Glorifying God • Walking in Newness of Life • Loving Community'}
            </p>
          </div>

          {/* Daily Scripture & Encouragement (今日經文靈修 - 靈命日糧 odbm.org) */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-amber-950/45 border-2 border-amber-500/50 backdrop-blur-md p-6 sm:p-7 shadow-2xl space-y-5 max-w-3xl animate-in fade-in duration-300">
            {/* Top Bar: Date + Title Badge + Font Scaler + Source Link + Copy/Share Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 pb-3.5">
              <div className="flex items-center space-x-2.5 text-amber-300 font-bold tracking-wide text-base sm:text-lg">
                <span className="p-1.5 rounded-lg bg-amber-500/25 text-amber-400 border border-amber-500/40">
                  <Sun className="w-5 h-5 text-amber-400" />
                </span>
                <span className="text-amber-200">
                  {lang === 'zh' ? '今日經文靈修' : 'Daily Scripture & Devotion'}
                </span>
                <span className="text-amber-400/60">•</span>
                <span className="text-amber-100 font-semibold">
                  {lang === 'zh' ? todayDevotion.formattedDateZh : todayDevotion.formattedDateEn}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Font Size Toggle Button */}
                <button
                  type="button"
                  onClick={() => setFontScale(prev => prev === 'large' ? 'huge' : 'large')}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base text-amber-100 hover:text-white bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/50 px-3.5 py-2 rounded-lg transition font-bold shadow-sm"
                  title={lang === 'zh' ? '調整靈修字體大小' : 'Adjust font size'}
                >
                  <span className="font-serif font-black text-base sm:text-lg">A{fontScale === 'huge' ? '++' : '+'}</span>
                  <span>{fontScale === 'huge' ? (lang === 'zh' ? '特大字體' : 'Extra Large') : (lang === 'zh' ? '大字體' : 'Large')}</span>
                </button>

                <a
                  href={todayDevotion.devotion.sourceUrl || "https://traditional-odb.org/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm sm:text-base text-amber-200 hover:text-white bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 px-3.5 py-2 rounded-lg transition font-semibold shadow-sm"
                  title={lang === 'zh' ? '前往靈命日糧網站 (www.odbm.org)' : 'Visit Our Daily Bread (www.odbm.org)'}
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'zh' ? '靈命日糧 odbm.org' : 'Our Daily Bread'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyVerse}
                  className="flex items-center space-x-2 text-sm sm:text-base text-amber-100 hover:text-white bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/50 px-4 py-2 rounded-lg transition font-bold shadow-sm"
                  title={lang === 'zh' ? '複製今日經文與靈修反思禱告' : 'Copy verse, reflection and prayer'}
                >
                  {copiedVerse ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      <span className="text-emerald-300 font-bold">{lang === 'zh' ? '已複製' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-300" />
                      <span>{lang === 'zh' ? '分享經文' : 'Share'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scripture Verse (Large & Prominent) */}
            <div className="space-y-2.5 pl-4 border-l-4 border-amber-400">
              <blockquote className={`font-serif text-amber-50 italic leading-relaxed tracking-wide font-medium ${
                fontScale === 'huge' 
                  ? 'text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem]' 
                  : 'text-xl sm:text-2xl md:text-3xl'
              }`}>
                “{lang === 'zh' ? todayDevotion.devotion.verseZh : todayDevotion.devotion.verseEn}”
              </blockquote>
              <div className={`font-bold text-amber-300 tracking-wide ${
                fontScale === 'huge'
                  ? 'text-lg sm:text-xl md:text-2xl'
                  : 'text-base sm:text-lg md:text-xl'
              }`}>
                —— {lang === 'zh' ? todayDevotion.devotion.referenceZh : todayDevotion.devotion.referenceEn}
              </div>
            </div>

            {/* Today's Encouragement: Reflection & Prayer (今日勉勵：反思與禱告) */}
            <div className="space-y-3 pt-2 border-t border-amber-500/25">
              <div className="text-sm sm:text-base md:text-lg font-bold tracking-wider uppercase text-amber-300 flex items-center space-x-2">
                <span className="text-lg">🌱</span>
                <span>{lang === 'zh' ? '今日勉勵 • 靈修默想' : "Today's Encouragement & Reflection"}</span>
              </div>

              {/* Reflection (反思) */}
              <div className="rounded-xl bg-slate-950/65 border border-amber-500/30 p-4 sm:p-5 text-slate-100 shadow-inner">
                <div className="flex items-start space-x-3">
                  <span className="text-amber-200 text-sm sm:text-base font-bold px-3 py-1 rounded-md bg-amber-500/25 border border-amber-500/45 shrink-0 mt-0.5">
                    {lang === 'zh' ? '反思' : 'Reflection'}
                  </span>
                  <p className={`text-amber-50 font-normal leading-relaxed ${
                    fontScale === 'huge' 
                      ? 'text-xl sm:text-2xl md:text-3xl' 
                      : 'text-lg sm:text-xl md:text-2xl'
                  }`}>
                    {lang === 'zh' ? todayDevotion.devotion.reflectionZh : todayDevotion.devotion.reflectionEn}
                  </p>
                </div>
              </div>

              {/* Prayer (禱告) */}
              <div className="rounded-xl bg-slate-950/65 border border-emerald-500/35 p-4 sm:p-5 text-slate-100 shadow-inner">
                <div className="flex items-start space-x-3">
                  <span className="text-emerald-200 text-sm sm:text-base font-bold px-3 py-1 rounded-md bg-emerald-500/25 border border-emerald-500/45 shrink-0 mt-0.5">
                    {lang === 'zh' ? '禱告' : 'Prayer'}
                  </span>
                  <p className={`text-emerald-50 font-normal italic leading-relaxed ${
                    fontScale === 'huge' 
                      ? 'text-xl sm:text-2xl md:text-3xl' 
                      : 'text-lg sm:text-xl md:text-2xl'
                  }`}>
                    {lang === 'zh' ? todayDevotion.devotion.prayerZh : todayDevotion.devotion.prayerEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Source Credit */}
            <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base text-slate-200 font-normal">
              <span className="flex items-center space-x-2">
                <span className="font-medium text-slate-300">靈修出處：</span>
                <a
                  href="https://traditional-odb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-100 underline underline-offset-2 transition font-bold"
                >
                  靈命日糧 Our Daily Bread (www.odbm.org)
                </a>
              </span>
              <span className="text-amber-300/80 font-medium hidden sm:inline">每日清晨更新 • 恩典同行</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-200 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl font-normal">
            {lang === 'zh' 
              ? '加南新生基督教會 (Canaan Shin Sheng Christian Church) 位於加州 Harbor City。我們竭誠歡迎您與家人參加每週日早上 11:00 的主日崇拜，感受上帝屬天更新的平安與溫馨家園！'
              : 'Located in Harbor City, CA, Canaan Shin Sheng Christian Church warmly invites you and your family to worship with us every Sunday at 11:00 AM.'
            }
          </p>

          {/* Service Time Quick Highlight */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-2xl">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base text-amber-300 font-bold uppercase tracking-wider">
                  {lang === 'zh' ? '每週主日崇拜' : 'Sunday Worship Service'}
                </div>
                <div className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                  {lang === 'zh' ? '每週日上午 11:00 主日禮拜' : 'Sundays at 11:00 AM PST'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm sm:text-base text-slate-200 font-medium">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Harbor City, CA</span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-5">
            <a
              href="#sermons"
              className="flex items-center space-x-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-7 py-4 rounded-xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-amber-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{lang === 'zh' ? '聆聽主日講道' : 'Listen to Sermons'}</span>
            </a>

            <a
              href={CHURCH_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-100 hover:text-white px-6 py-4 rounded-xl font-bold text-lg sm:text-xl border border-slate-600 transition-all"
            >
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>{lang === 'zh' ? '教會地址與地圖' : 'Get Directions'}</span>
            </a>

            <button
              onClick={onOpenGiving}
              className="flex items-center space-x-2.5 bg-amber-950/70 hover:bg-amber-900/90 text-amber-200 hover:text-white px-6 py-4 rounded-xl font-bold text-lg sm:text-xl border-2 border-amber-500/50 transition-all"
            >
              <Heart className="w-5 h-5 fill-amber-400/40 text-amber-400" />
              <span>{lang === 'zh' ? '奉獻支持' : 'Give'}</span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center space-x-2.5 bg-slate-900/95 hover:bg-slate-800 text-amber-300 hover:text-amber-200 px-5 py-4 rounded-xl font-bold text-base sm:text-lg border border-amber-500/40 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>{lang === 'zh' ? '聖經與靈修 AI 導師' : 'AI Prayer Guide'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
