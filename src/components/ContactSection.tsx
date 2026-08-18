import React, { useState } from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { sendContactEmailJS, getEmailJSConfig } from '../lib/emailService';
import { EmailJSConfigModal } from './EmailJSConfigModal';
import { ParkingMapGuide } from './ParkingMapGuide';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Navigation, Sparkles, Settings, ExternalLink, Car } from 'lucide-react';

interface ContactProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactProps> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needRide, setNeedRide] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ method: 'emailjs' | 'mailto'; message: string }>({ method: 'mailto', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const parkingMapsUrl = "https://maps.google.com/?q=W+253rd+St+%26+S+Western+Ave,+Harbor+City,+CA+90710";

  const getMailtoUrl = () => {
    const subject = `[加南網站${needRide ? '主日接送預約' : '在線留言'}] ${formData.name || '訪客'}`;
    const body = `加南新生基督教會 同工您好：

收到來自加南官方網站的最新需求，資料如下：
---------------------------------
【姓名 Name】: ${formData.name}
【電話 Phone】: ${formData.phone}
【電子郵件 Email】: ${formData.email}
【需求類別 Category】: ${needRide ? '主日車輛免費接送預約 (Sunday Ride Assistance)' : '一般心聲留言 / 信仰代禱'}
---------------------------------
【留言內容 / 接送地址 Details】:
${formData.message}

--
這是一份由加南新生基督教會官網 (web@canaannewlife.org) 自動產生的預設信件。`;

    return `mailto:web@canaannewlife.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. First try EmailJS auto-send if configured
    const emailJsRes = await sendContactEmailJS({
      senderName: formData.name,
      senderPhone: formData.phone,
      senderEmail: formData.email,
      senderMessage: formData.message,
      needRide
    });

    // 2. Log to server API
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: needRide ? '主日車輛接送預約' : '在線留言',
          message: formData.message,
          needRide
        })
      });
    } catch (err) {
      console.error('Server API email log failed:', err);
    }

    if (emailJsRes.success && emailJsRes.method === 'emailjs') {
      setSubmitResult({
        method: 'emailjs',
        message: '您的留言與接送預約已透過 EmailJS 背景自動發送至 web@canaannewlife.org！加南教會同工會盡快與您聯絡。'
      });
    } else {
      // EmailJS not configured or failed -> trigger mailto fallback
      setSubmitResult({
        method: 'mailto',
        message: '已儲存留言紀錄！點擊下方按鈕可直接啟動郵件軟體傳送至 web@canaannewlife.org'
      });
      const mailUrl = getMailtoUrl();
      try {
        window.location.href = mailUrl;
      } catch (e) {
        console.log('Mailto redirect notice:', e);
      }
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 bg-slate-100 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-amber-800" />
            <span>{lang === 'zh' ? '教會位置與聯絡方式' : 'Visit & Contact Us'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            {lang === 'zh' ? '加南新生基督教會 歡迎您' : 'We Warmly Welcome You'}
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            {lang === 'zh' 
              ? '加南新生基督教會位於加州 Harbor City Western Ave。歡迎隨時電話、電郵與我們聯繫，或預約主日接送車輛。'
              : 'Located on Western Ave in Harbor City, CA. Reach out via phone, email, or request a ride for Sunday worship.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Info Cards & Embedded Map Simulation */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-serif text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                {lang === 'zh' ? '教會聯絡資訊' : 'Church Contact Info'}
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-0.5">{lang === 'zh' ? '教會會址 (Address)' : 'Church Address'}</div>
                    <div className="text-slate-600 leading-relaxed">{CHURCH_INFO.address}</div>
                    <a 
                      href={CHURCH_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-amber-800 hover:text-amber-900 mt-1"
                    >
                      <span>{lang === 'zh' ? '開啟 Google 地圖導航' : 'Open in Google Maps'}</span>
                      <Navigation className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-0.5">{lang === 'zh' ? '電話號碼 (Telephone)' : 'Phone Numbers'}</div>
                    <div className="space-y-0.5">
                      <a href={`tel:${CHURCH_INFO.phone1}`} className="block text-slate-700 hover:text-amber-800 font-mono font-medium">
                        {CHURCH_INFO.phone1} ({lang === 'zh' ? '主要專線' : 'Main'})
                      </a>
                      <a href={`tel:${CHURCH_INFO.phone2}`} className="block text-slate-700 hover:text-amber-800 font-mono font-medium">
                        {CHURCH_INFO.phone2} ({lang === 'zh' ? '辦公室' : 'Office'})
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-0.5">{lang === 'zh' ? '電子郵件 (Email)' : 'Email Contact'}</div>
                    <a href={`mailto:${CHURCH_INFO.email}`} className="text-amber-800 hover:underline font-mono">
                      {CHURCH_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-0.5">{lang === 'zh' ? '崇拜時間' : 'Service Schedule'}</div>
                    <div className="text-slate-600">
                      {lang === 'zh' ? '每週日上午 11:00 主日崇拜' : 'Sundays at 11:00 AM PST'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accurate Parking & Navigation Map Guide */}
            <ParkingMapGuide lang={lang} />

          </div>

          {/* Right Column: Contact & Ride Request Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">
                  {lang === 'zh' ? '在線留言與主日車輛接送預約' : 'Send Message or Request Ride'}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {lang === 'zh' 
                    ? '如需了解教會、聯繫同工或主日需要車輛接送服務，請填寫下表：'
                    : 'Get in touch with our church team or let us know if you need transportation for Sunday worship.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="self-start sm:self-center inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-xs text-amber-900 font-medium transition"
                title="啟用背景自動寄信服務"
              >
                <Settings className="w-3.5 h-3.5 text-amber-800" />
                <span>{lang === 'zh' ? 'EmailJS 設定' : 'EmailJS Config'}</span>
              </button>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-emerald-950 text-xl font-serif">
                  {lang === 'zh' ? '留言與預約需求已記錄！' : 'Request & Message Recorded!'}
                </h4>
                <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                  {submitResult.message || (lang === 'zh' 
                    ? '系統已記錄您的需求，並已自動準備將信件發送至教會信箱 web@canaannewlife.org。'
                    : 'Your information has been logged and prepared for sending to web@canaannewlife.org.')}
                </p>

                {submitResult.method === 'mailto' && (
                  <div className="pt-2 p-4 bg-white rounded-xl border border-emerald-200 text-left space-y-2 text-xs text-slate-700">
                    <div className="font-bold text-slate-900 border-b pb-1 text-sm flex items-center justify-between">
                      <span>{lang === 'zh' ? '💡 如何確保信件 100% 寄達教會：' : '💡 Guaranteed Delivery Steps:'}</span>
                      <button
                        onClick={() => setShowConfigModal(true)}
                        className="text-amber-800 hover:underline text-[11px] font-normal"
                      >
                        {lang === 'zh' ? '⚙️ 設定 EmailJS 背景自動寄信' : '⚙️ Setup EmailJS Auto-Send'}
                      </button>
                    </div>
                    <p className="text-slate-600">
                      若您的手機或電腦畫面已彈出郵件應用程式 (Gmail / Outlook / Apple Mail)，請直接點擊 <span className="font-bold text-slate-900">「寄出」</span> 按鈕即可！
                    </p>
                    <p className="text-slate-600">
                      若郵件軟體未自動跳出，請點擊下方按鈕直接開啟：
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={getMailtoUrl()}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{lang === 'zh' ? '開啟 Email 應用程式寄出' : 'Open Email App to Send'}</span>
                  </a>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', message: '' });
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold text-xs transition"
                  >
                    {lang === 'zh' ? '再填寫一筆新留言' : 'Submit Another Message'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      {lang === 'zh' ? '姓名 (Name)' : 'Your Name'} <span className="text-amber-600">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={lang === 'zh' ? '請輸入姓名' : 'Full Name'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      {lang === 'zh' ? '電話 (Phone)' : 'Phone Number'} <span className="text-amber-600">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(310) 000-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'zh' ? '電子郵件 (Email)' : 'Email Address'} <span className="text-amber-600">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-medium text-slate-900"
                  />
                </div>

                {/* Ride request toggle */}
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="w-5 h-5 text-amber-800" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {lang === 'zh' ? '需要主日接送服務 (Sunday Ride Assistance)' : 'Need Sunday Worship Transportation'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lang === 'zh' ? '同工將於主日早晨前往 Harbor City / 南灣接送' : 'Available for South Bay & Harbor City residents'}
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={needRide}
                    onChange={(e) => setNeedRide(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {lang === 'zh' ? (needRide ? '接送地址與特殊需求 (Pickup Address & Details)' : '留言或需求內容 (Message)') : 'Message / Details'} <span className="text-amber-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={lang === 'zh' ? (needRide ? '請輸入完整接送地址與搭乘人數...' : '請寫下您的問題、信仰查詢或需求...') : 'Write your message or pickup address...'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-medium text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-amber-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? (lang === 'zh' ? '正在處理中...' : 'Processing...') : (lang === 'zh' ? '送出訊息' : 'Send Message')}</span>
                </button>

                <p className="text-[11px] text-center text-slate-500 pt-1">
                  {lang === 'zh' ? '點擊「送出訊息」將自動啟動信件並傳送至 web@canaannewlife.org' : 'Submitting will automatically prepare email to web@canaannewlife.org'}
                </p>
              </form>
            )}

          </div>

        </div>

      </div>

      <EmailJSConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        lang={lang}
      />
    </section>
  );
};
