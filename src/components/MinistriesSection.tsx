import React, { useState } from 'react';
import { Language, Ministry } from '../types';
import { MINISTRIES, CHURCH_INFO } from '../data/churchData';
import { sendMinistryEmailJS } from '../lib/emailService';
import { EmailJSConfigModal } from './EmailJSConfigModal';
import { Users, Music, BookOpen, HeartHandshake, HandHeart, Clock, MapPin, CheckCircle, Send, X, ArrowRight, Settings, Mail, Loader2 } from 'lucide-react';

interface MinistryProps {
  lang: Language;
}

export const MinistriesSection: React.FC<MinistryProps> = ({ lang }) => {
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Form Fields State
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantNotes, setApplicantNotes] = useState('');

  const getMinistryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music': return <Music className="w-6 h-6 text-amber-600" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-amber-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6 text-amber-600" />;
      case 'Users': return <Users className="w-6 h-6 text-amber-600" />;
      default: return <HandHeart className="w-6 h-6 text-amber-600" />;
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistry) return;

    setIsSending(true);
    setSendFeedback(null);

    const ministryTitle = lang === 'zh' ? selectedMinistry.nameZh : selectedMinistry.name;

    const res = await sendMinistryEmailJS({
      ministryName: ministryTitle,
      applicantName,
      applicantPhone,
      applicantEmail,
      applicantNotes,
    });

    setIsSending(false);
    setSendFeedback(res.message);
    setJoinSubmitted(true);

    setTimeout(() => {
      setJoinSubmitted(false);
      setSelectedMinistry(null);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantEmail('');
      setApplicantNotes('');
      setSendFeedback(null);
    }, 4500);
  };

  return (
    <section id="ministries" className="py-20 bg-slate-100 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4 text-amber-800" />
            <span>{lang === 'zh' ? '加南事工與肢體團契' : 'Ministries & Small Groups'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            {lang === 'zh' ? '多樣肢體 • 同心服事' : 'Diverse Ministries • One Body in Christ'}
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            {lang === 'zh' 
              ? '加南新生基督教會提供豐富的聚會團契，讓不同世代的弟兄姊妹在真理中建立情誼、事奉主。'
              : 'Discover welcoming groups, choir worship, online prayer meetings, and local outreach serving Harbor City.'}
          </p>

          <div className="pt-1 flex items-center justify-center space-x-2 text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'zh' ? `表單意願將自動發送至：${CHURCH_INFO.email}` : `Submissions sent automatically to: ${CHURCH_INFO.email}`}</span>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-1 text-slate-400 hover:text-amber-800 transition-colors"
              title={lang === 'zh' ? 'EmailJS 設定' : 'EmailJS Settings'}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ministry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MINISTRIES.map((m) => (
            <div 
              key={m.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 group-hover:scale-110 transition-transform">
                    {getMinistryIcon(m.iconName)}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    {lang === 'zh' ? m.leaderZh : m.leader}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                    {lang === 'zh' ? m.nameZh : m.name}
                  </h3>
                  <div className="text-xs text-amber-700 font-medium flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'zh' ? m.meetingTimeZh : m.meetingTime}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {lang === 'zh' ? m.descriptionZh : m.description}
                </p>

                <div className="pt-2 flex items-center text-xs text-slate-500 space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">{lang === 'zh' ? m.locationZh : m.location}</span>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-6 border-t border-slate-100 mt-6">
                <button
                  onClick={() => setSelectedMinistry(m)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-amber-800 text-white py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  <span>{lang === 'zh' ? '加入或了解事工' : 'Get Involved'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Form for Joining Ministry */}
        {selectedMinistry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedMinistry(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  {lang === 'zh' ? '事工團契報名' : 'Get Connected'}
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  {lang === 'zh' ? selectedMinistry.nameZh : selectedMinistry.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'zh' ? selectedMinistry.meetingTimeZh : selectedMinistry.meetingTime} • {lang === 'zh' ? selectedMinistry.locationZh : selectedMinistry.location}
                </p>
                <div className="pt-1">
                  <span className="inline-block bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {lang === 'zh' ? `📍 登記事工：${selectedMinistry.nameZh}` : `📍 Selected Ministry: ${selectedMinistry.name}`}
                  </span>
                </div>
              </div>

              {joinSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                  <div className="font-bold text-emerald-900 text-base">
                    {lang === 'zh' ? '參與登記已成功送出！' : 'Thank you for connecting!'}
                  </div>
                  <p className="text-xs text-emerald-800">
                    {sendFeedback || (lang === 'zh' 
                      ? `表單資料已自動發送至 ${CHURCH_INFO.email}，教會同工或團契輔導將儘速與您聯繫！`
                      : `Your request has been emailed to ${CHURCH_INFO.email}. Our team will reach out to you shortly!`)}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      {lang === 'zh' ? '姓名 (Name)' : 'Full Name'}
                    </label>
                    <input
                      required
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder={lang === 'zh' ? '請輸入您的姓名' : 'Enter your name'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        {lang === 'zh' ? '電話 (Phone)' : 'Phone Number'}
                      </label>
                      <input
                        required
                        type="tel"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="(310) 000-0000"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        {lang === 'zh' ? '電郵 (Email)' : 'Email Address'}
                      </label>
                      <input
                        required
                        type="email"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      {lang === 'zh' ? '留言或需求備註 (Message)' : 'Notes or Questions'}
                    </label>
                    <textarea
                      rows={3}
                      value={applicantNotes}
                      onChange={(e) => setApplicantNotes(e.target.value)}
                      placeholder={lang === 'zh' ? '例如：想了解歌隊練習時間、想加入週五線上禱告會等...' : 'Let us know your interest or questions...'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'zh' ? '正在寄送 Email 給同工...' : 'Sending Email...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'zh' ? '送出參與意願 (自動 Email 給同工)' : 'Submit Connection Request'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

        {/* EmailJS Modal Config */}
        <EmailJSConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          lang={lang}
        />

      </div>
    </section>
  );
};

