import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NextServiceBanner } from './components/NextServiceBanner';
import { WeeklyBulletinHighlight } from './components/WeeklyBulletinHighlight';
import { AboutSection } from './components/AboutSection';
import { SermonArchive } from './components/SermonArchive';
import { MinistriesSection } from './components/MinistriesSection';
import { EventsCalendar } from './components/EventsCalendar';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { GivingSection } from './components/GivingSection';
import { PrayerWall } from './components/PrayerWall';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PastoralAIAssistant } from './components/PastoralAIAssistant';
import { BulletinAdminModal } from './components/BulletinAdminModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GlobalGitHubSyncModal } from './components/GlobalGitHubSyncModal';
import { Github, FileText, ShieldCheck } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('zh'); // Default to Traditional Chinese as naturally appropriate for Formosan/Chinese-American church!
  const [isGivingModalOpen, setIsGivingModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isBulletinAdminOpen, setIsBulletinAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isGlobalGitHubSyncOpen, setIsGlobalGitHubSyncOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem('canaan_admin_email');
  });

  const handleLoginSuccess = (email: string) => {
    setAdminEmail(email);
    localStorage.setItem('canaan_admin_email', email);
  };

  const handleLogout = () => {
    setAdminEmail(null);
    localStorage.removeItem('canaan_admin_email');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      {/* Sticky Header Navigation */}
      <Navbar
        lang={lang}
        setLang={setLang}
        onOpenGiving={() => setIsGivingModalOpen(true)}
        onOpenAI={() => setIsAIModalOpen(true)}
        adminEmail={adminEmail}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleLogout}
        onOpenBulletinAdmin={() => setIsBulletinAdminOpen(true)}
        onOpenGlobalGitHubSync={() => setIsGlobalGitHubSyncOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Banner */}
        <Hero
          lang={lang}
          onOpenGiving={() => setIsGivingModalOpen(true)}
          onOpenAI={() => setIsAIModalOpen(true)}
        />

        {/* Live Countdown & Weekly Gathering Schedule */}
        <NextServiceBanner lang={lang} />

        {/* Weekly Bulletin Highlights: Memory Verse, Bible Reading Plan & Member Care */}
        <WeeklyBulletinHighlight lang={lang} />

        {/* About Church & Pastor Rev. Chen Jiachang */}
        <AboutSection lang={lang} />

        {/* Sermon Audio & Video Archive */}
        <SermonArchive 
          lang={lang} 
          adminEmail={adminEmail} 
          onOpenGlobalSync={() => setIsGlobalGitHubSyncOpen(true)}
        />

        {/* Church Ministries & Groups */}
        <MinistriesSection lang={lang} />

        {/* Events & Calendar */}
        <EventsCalendar lang={lang} />

        {/* Photo Gallery & Google Photos Albums */}
        <PhotoGallerySection 
          lang={lang} 
          adminEmail={adminEmail} 
          onOpenGlobalSync={() => setIsGlobalGitHubSyncOpen(true)}
        />

        {/* Online Giving & Zelle Section */}
        <GivingSection lang={lang} />

        {/* Intercessory Prayer Wall */}
        <PrayerWall lang={lang} onOpenAI={() => setIsAIModalOpen(true)} />

        {/* Contact, Directions & Ride Request */}
        <ContactSection lang={lang} />
      </main>

      {/* Floating Admin Quick Bar when Logged In */}
      {adminEmail && (
        <aside 
          aria-label="管理員快速控制列"
          className="fixed bottom-5 right-5 z-40 bg-slate-900/95 text-white border-2 border-amber-500/60 shadow-2xl rounded-2xl p-2.5 flex items-center space-x-2.5 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-amber-500/20 rounded-lg border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">管理員已登入</span>
          </div>

          <button
            onClick={() => setIsGlobalGitHubSyncOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-lg hover:shadow-amber-500/30 transition-all transform hover:scale-105"
            title="一鍵將主日講道、相簿走廊、週報讀經等全站資料同步至 GitHub 並觸發 Cloudflare 自動建置"
          >
            <Github className="w-4 h-4 text-slate-950" />
            <span>{lang === 'zh' ? '🚀 一鍵和 GitHub 同步' : '🚀 Sync All to GitHub'}</span>
          </button>

          <button
            onClick={() => setIsBulletinAdminOpen(true)}
            className="hidden md:flex items-center space-x-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-2.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            title="週報 PDF 上傳與 Email 自動更新"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>週報</span>
          </button>
        </aside>
      )}

      {/* Footer */}
      <Footer
        lang={lang}
        onOpenGiving={() => setIsGivingModalOpen(true)}
        onOpenAI={() => setIsAIModalOpen(true)}
      />

      {/* Floating Giving Modal */}
      {isGivingModalOpen && (
        <GivingSection
          lang={lang}
          isOpenModal={true}
          onCloseModal={() => setIsGivingModalOpen(false)}
        />
      )}

      {/* AI Pastoral & Bible Companion Modal */}
      <PastoralAIAssistant
        lang={lang}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Weekly Bulletin PDF Admin / Email Update Modal */}
      <BulletinAdminModal
        lang={lang}
        isOpen={isBulletinAdminOpen}
        onClose={() => setIsBulletinAdminOpen(false)}
      />

      {/* Admin Login Modal for web@canaannewlife.org */}
      <AdminLoginModal
        lang={lang}
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Unified Master GitHub Sync Modal for ALL Church Data */}
      <GlobalGitHubSyncModal
        lang={lang}
        isOpen={isGlobalGitHubSyncOpen}
        onClose={() => setIsGlobalGitHubSyncOpen(false)}
      />
    </div>
  );
}
