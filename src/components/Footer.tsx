import React from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { ChurchLogo } from './ChurchLogo';
import { MapPin, Phone, Mail, Clock, Heart, ShieldCheck, ArrowUp } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onOpenGiving: () => void;
  onOpenAI: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenGiving, onOpenAI }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Church Branding & Pastor Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <ChurchLogo size="lg" className="rounded-xl overflow-hidden border border-amber-500/30" />
              <div>
                <div className="font-serif text-lg font-bold text-white leading-tight">
                  {CHURCH_INFO.nameEn}
                </div>
                <div className="text-xs text-amber-400 font-medium">
                  {CHURCH_INFO.nameZh}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-light">
              {lang === 'zh'
                ? '加南新生基督教會 (Canaan Shin Sheng Christian Church) 創立於 1984 年，為獨立基督教會 (Independent Christian Church)，由長執同工會與同工團隊共同帶領，致力於傳揚真理與服事 Harbor City 社區。'
                : 'Established in 1984 as an independent Christian church. Serving Harbor City, CA through faithful Bible teaching, prayer, and community fellowship.'}
            </p>

            <div className="text-xs text-amber-300 font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{CHURCH_INFO.denominationZh}</span>
            </div>
          </div>

          {/* Col 2: Service Schedule */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2">
              {lang === 'zh' ? '主日與每週聚會' : 'Worship & Gatherings'}
            </h4>
            
            <ul className="space-y-2.5">
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">{lang === 'zh' ? '主日崇拜 (Worship):' : 'Sunday Worship:'}</strong>
                  <span className="text-slate-400">{lang === 'zh' ? '每週日上午 11:00' : 'Sundays at 11:00 AM'}</span>
                </div>
              </li>

              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">{lang === 'zh' ? '主日學 (Sunday School):' : 'Sunday School:'}</strong>
                  <span className="text-slate-400">{lang === 'zh' ? '每週日上午 10:00' : 'Sundays at 10:00 AM'}</span>
                </div>
              </li>

              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">{lang === 'zh' ? '週五線上禱告會:' : 'Friday Zoom Prayer:'}</strong>
                  <span className="text-slate-400">{lang === 'zh' ? '每週五晚上 8:00 (Zoom)' : 'Fridays at 8:00 PM (Zoom)'}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Address */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2">
              {lang === 'zh' ? '會址與聯絡專線' : 'Address & Contact'}
            </h4>

            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{CHURCH_INFO.address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{CHURCH_INFO.phone1} / {CHURCH_INFO.phone2}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${CHURCH_INFO.email}`} className="text-amber-300 hover:underline">
                  {CHURCH_INFO.email}
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenGiving}
                className="w-full flex items-center justify-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>{lang === 'zh' ? '線上奉獻渠道' : 'Online Giving'}</span>
              </button>
            </div>
          </div>

          {/* Col 4: Quick Navigation & AI Tool */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-white border-b border-slate-800 pb-2">
              {lang === 'zh' ? '網站快速導覽' : 'Quick Navigation'}
            </h4>

            <div className="grid grid-cols-2 gap-1.5 text-slate-400">
              <a href="#about" className="hover:text-amber-300 transition-colors">{lang === 'zh' ? '關於我們' : 'About Us'}</a>
              <a href="#sermons" className="hover:text-amber-300 transition-colors">{lang === 'zh' ? '主日講道' : 'Sermons'}</a>
              <a href="#ministries" className="hover:text-amber-300 transition-colors">{lang === 'zh' ? '事工團契' : 'Ministries'}</a>
              <a href="#events" className="hover:text-amber-300 transition-colors">{lang === 'zh' ? '最新活動' : 'Events'}</a>
              <a href="#prayer" className="hover:text-amber-300 transition-colors">{lang === 'zh' ? '代禱牆' : 'Prayer Wall'}</a>
              <a href="#giving" className="hover:text-amber-300 transition-colors">{lang === 'zh' ? '線上奉獻' : 'Giving'}</a>
              <a href="#contact" className="hover:text-amber-300 transition-colors">{lang === 'zh' ? '聯絡導航' : 'Contact'}</a>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAI}
                className="w-full text-left text-xs text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between"
              >
                <span>{lang === 'zh' ? 'AI 聖經與靈修助手' : 'AI Bible Companion'}</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase">GEMINI AI</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {CHURCH_INFO.nameEn} ({CHURCH_INFO.nameZh}). All rights reserved. 501(c)(3) Non-Profit Religious Organization.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1 text-slate-400 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <span>{lang === 'zh' ? '回到頂部' : 'Back to Top'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
