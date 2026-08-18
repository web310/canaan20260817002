import React from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { Calendar, MapPin, Play, Heart, ArrowRight, Video, Sparkles, Clock } from 'lucide-react';
import heroImgUrl from '../assets/images/canaan_church_hero_1786434083190.jpg';

interface HeroProps {
  lang: Language;
  onOpenGiving: () => void;
  onOpenAI: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenGiving, onOpenAI }) => {

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
          <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-amber-300 text-xs sm:text-sm font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              {lang === 'zh' ? '獨立基督教會 • 創立於1984年' : 'Independent Christian Church • Est. 1984'}
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
            <p className="text-lg sm:text-2xl font-serif text-amber-200/90 tracking-wide font-normal">
              {lang === 'zh' ? '為榮耀神而活 • 走生命的樣式 • 深化主內愛心' : 'Glorifying God • Walking in Newness of Life • Loving Community'}
            </p>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
            {lang === 'zh' 
              ? '加南新生基督教會 (Canaan Shin Sheng Christian Church) 位於加州 Harbor City。我們竭誠歡迎您與家人參加每週日早上 11:00 的主日崇拜，感受上帝屬天更新的平安與溫馨家園！'
              : 'Located in Harbor City, CA, Canaan Shin Sheng Christian Church warmly invites you and your family to worship with us every Sunday at 11:00 AM.'
            }
          </p>

          {/* Service Time Quick Highlight */}
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                  {lang === 'zh' ? '每週主日崇拜' : 'Sunday Worship Service'}
                </div>
                <div className="text-white font-bold text-base sm:text-lg">
                  {lang === 'zh' ? '每週日上午 11:00 主日禮拜' : 'Sundays at 11:00 AM PST'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Harbor City, CA</span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#sermons"
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-amber-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{lang === 'zh' ? '聆聽主日講道' : 'Listen to Sermons'}</span>
            </a>

            <a
              href={CHURCH_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-800 text-slate-100 hover:text-white px-5 py-3.5 rounded-xl font-semibold text-base border border-slate-700 transition-all"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{lang === 'zh' ? '教會地址與地圖' : 'Get Directions'}</span>
            </a>

            <button
              onClick={onOpenGiving}
              className="flex items-center space-x-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 hover:text-white px-5 py-3.5 rounded-xl font-semibold text-base border border-amber-500/40 transition-all"
            >
              <Heart className="w-4 h-4 fill-amber-400/30 text-amber-400" />
              <span>{lang === 'zh' ? '線上奉獻' : 'Online Giving'}</span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-amber-300 px-4 py-3.5 rounded-xl font-medium text-sm border border-amber-500/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{lang === 'zh' ? '聖經與靈修 AI 導師' : 'AI Prayer Guide'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
