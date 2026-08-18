import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { ChurchLogo } from './ChurchLogo';
import { Globe, Heart, Phone, MapPin, Calendar, Clock, Menu, X, Sparkles, FileText, ShieldCheck, LogOut, Lock, Github } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  onOpenGiving: () => void;
  onOpenAI: () => void;
  adminEmail?: string | null;
  onOpenAdminLogin?: () => void;
  onLogoutAdmin?: () => void;
  onOpenBulletinAdmin?: () => void;
  onOpenGlobalGitHubSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  onOpenGiving,
  onOpenAI,
  adminEmail,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenBulletinAdmin,
  onOpenGlobalGitHubSync,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#about", labelEn: "About Us", labelZh: "關於我們" },
    { href: "#sermons", labelEn: "Sermons", labelZh: "主日講道" },
    { href: "#ministries", labelEn: "Ministries", labelZh: "事工團契" },
    { href: "#events", labelEn: "Events", labelZh: "最新活動" },
    { href: "#gallery", labelEn: "Photo Gallery", labelZh: "照片走廊" },
    { href: "#giving", labelEn: "Giving", labelZh: "奉獻支持" },
    { href: "#prayer", labelEn: "Prayer Wall", labelZh: "禱告牆" },
    { href: "#contact", labelEn: "Contact", labelZh: "聯絡我們" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Banner with Quick Contact Info */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-6">
            <span className="flex items-center text-amber-300 font-medium">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              {lang === 'zh' ? '主日崇拜：每週日上午 11:00' : 'Sunday Worship: Every Sunday 11:00 AM'}
            </span>
            <a 
              href={CHURCH_INFO.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:text-white transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {CHURCH_INFO.address}
            </a>
            <a 
              href={`tel:${CHURCH_INFO.phone1}`}
              className="flex items-center hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {CHURCH_INFO.phone1}
            </a>
          </div>

          <div className="flex items-center space-x-3">
            {adminEmail ? (
              <div className="hidden md:flex items-center space-x-2">
                {onOpenGlobalGitHubSync && (
                  <button
                    onClick={onOpenGlobalGitHubSync}
                    className="flex items-center text-slate-950 hover:text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 font-bold px-3 py-1 rounded-full border border-amber-300 shadow-md hover:shadow-amber-500/20 transition-all text-xs transform hover:scale-[1.02]"
                    title="管理員：一鍵將講道、相片、週報與所有資料同步至 GitHub 並自動部署 Cloudflare"
                  >
                    <Github className="w-3.5 h-3.5 mr-1 text-slate-950" />
                    <span>{lang === 'zh' ? '🚀 一鍵和 GitHub 同步' : '🚀 Sync All to GitHub'}</span>
                  </button>
                )}
                {onOpenBulletinAdmin && (
                  <button
                    onClick={onOpenBulletinAdmin}
                    className="flex items-center text-amber-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 px-2.5 py-0.5 rounded-full border border-amber-500/40 transition-all text-xs"
                    title="週報 PDF 上傳與 Email 自動更新設定"
                  >
                    <FileText className="w-3 h-3 mr-1 text-amber-400" />
                    <span>{lang === 'zh' ? '週報 PDF / Email' : 'Bulletin Sync'}</span>
                  </button>
                )}
                <button
                  onClick={onLogoutAdmin}
                  className="flex items-center text-slate-400 hover:text-rose-300 text-[11px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 transition-colors"
                  title={lang === 'zh' ? '登出 web@canaannewlife.org' : 'Logout Admin'}
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  <span>{adminEmail}</span>
                </button>
              </div>
            ) : (
              onOpenAdminLogin && (
                <button
                  onClick={onOpenAdminLogin}
                  className="hidden md:flex items-center text-slate-300 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 transition-all text-xs"
                  title="網頁管理員登入 (web@canaannewlife.org)"
                >
                  <Lock className="w-3 h-3 mr-1 text-amber-400" />
                  <span>{lang === 'zh' ? '管理員登入' : 'Admin Login'}</span>
                </button>
              )
            )}

            <button
              onClick={onOpenAI}
              className="flex items-center text-amber-200 hover:text-white bg-amber-950/60 hover:bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-500/30 transition-all text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1 text-amber-400 animate-pulse" />
              {lang === 'zh' ? '聖經與靈修AI助手' : 'AI Bible Guide'}
            </button>
            <div className="flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                  lang === 'en' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                  lang === 'zh' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                繁體中文
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav 
        className={`transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3 text-slate-800 border-b border-slate-200/80' 
            : 'bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-transparent py-4 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Church Name */}
          <a href="#" className="flex items-center space-x-2.5 xl:space-x-3 group flex-shrink-0">
            <div className="transition-transform group-hover:scale-105 flex-shrink-0">
              <ChurchLogo size="md" lightMode={scrolled} className="rounded-xl overflow-hidden shadow-md" />
            </div>
            <div className="flex-shrink-0 whitespace-nowrap">
              <div className={`font-serif text-base sm:text-lg xl:text-xl font-bold tracking-tight leading-tight whitespace-nowrap ${
                scrolled ? 'text-slate-900' : 'text-white'
              }`}>
                {CHURCH_INFO.nameEn}
              </div>
              <div className={`text-xs font-medium tracking-wide whitespace-nowrap ${
                scrolled ? 'text-amber-800' : 'text-amber-300'
              }`}>
                {CHURCH_INFO.nameZh}
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 flex-nowrap flex-shrink-0">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  scrolled 
                    ? 'text-slate-700 hover:text-amber-700 hover:bg-slate-100' 
                    : 'text-slate-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {lang === 'zh' ? link.labelZh : link.labelEn}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            <button
              onClick={onOpenGiving}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-lg font-semibold text-xs xl:text-sm whitespace-nowrap shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex-shrink-0"
            >
              <Heart className="w-4 h-4 fill-white/20 flex-shrink-0" />
              <span className="whitespace-nowrap">{lang === 'zh' ? '奉獻支持' : 'Online Give'}</span>
            </button>

            {/* Language Switcher for mobile/tablet when top bar is hidden */}
            <div className="sm:hidden flex items-center bg-slate-800/80 rounded-lg p-0.5">
              <button
                onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                className="flex items-center text-xs font-semibold px-2 py-1 text-white"
              >
                <Globe className="w-3.5 h-3.5 mr-1" />
                {lang === 'en' ? '繁體' : 'EN'}
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden space-x-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center ${
                scrolled ? 'bg-slate-100 text-slate-800' : 'bg-white/10 text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 mr-1" />
              {lang === 'en' ? '繁體' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/98 text-white border-t border-slate-800 px-4 pt-4 pb-6 space-y-3 mt-3 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">
                {lang === 'zh' ? '選單目錄' : 'Navigation Menu'}
              </span>
              <button
                onClick={onOpenAI}
                className="flex items-center text-xs text-amber-300 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-500/30"
              >
                <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                {lang === 'zh' ? '聖經AI助手' : 'AI Scripture Guide'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors"
                >
                  {lang === 'zh' ? link.labelZh : link.labelEn}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              {adminEmail ? (
                <>
                  {onOpenGlobalGitHubSync && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenGlobalGitHubSync();
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold shadow-lg"
                    >
                      <Github className="w-4 h-4 text-slate-950" />
                      <span>{lang === 'zh' ? '🚀 一鍵和 GitHub 同步全站' : '🚀 Sync All Data to GitHub'}</span>
                    </button>
                  )}
                  {onOpenBulletinAdmin && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenBulletinAdmin();
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-300 py-2.5 rounded-xl text-xs font-bold border border-amber-500/40"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'zh' ? '週報 PDF / Email 自動更新' : 'Bulletin PDF Sync'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogoutAdmin) onLogoutAdmin();
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 bg-slate-800 text-rose-300 py-2 rounded-xl text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? `登出 (${adminEmail})` : `Logout (${adminEmail})`}</span>
                  </button>
                </>
              ) : (
                onOpenAdminLogin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-medium"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'zh' ? '管理員登入 (web@canaannewlife.org)' : 'Admin Login'}</span>
                  </button>
                )
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGiving();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold shadow-md"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                <span>{lang === 'zh' ? '線上奉獻 Online Giving' : 'Online Giving'}</span>
              </button>

              <a
                href={CHURCH_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-medium"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>25226 Western Ave, Harbor City, CA 90710</span>
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
