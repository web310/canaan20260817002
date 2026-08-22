import React, { useState } from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { Heart, Mail, Smartphone, Check, Copy, X, Sparkles, MapPin, Building2, ThumbsUp, ShieldCheck, Clock } from 'lucide-react';

interface GivingProps {
  lang: Language;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const GivingSection: React.FC<GivingProps> = ({ lang, isOpenModal = false, onCloseModal }) => {
  const [copiedZelle, setCopiedZelle] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'in-person' | 'zelle' | 'check'>('in-person');

  const handleCopyZelle = () => {
    navigator.clipboard.writeText(CHURCH_INFO.zelleEmail);
    setCopiedZelle(true);
    setTimeout(() => setCopiedZelle(false), 2000);
  };

  const content = (
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider">
          <Heart className="w-4 h-4 text-amber-700 fill-amber-700/20" />
          <span>{lang === 'zh' ? '奉獻支持事工' : 'Generous Giving & Stewardship'}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {lang === 'zh' ? '甘心樂意 • 奉獻給主' : 'Cheerful Giving for God\'s Kingdom'}
        </h2>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {lang === 'zh' 
            ? '「各人要隨本心所酌定的，不要作難，不要勉強，因為捐得樂意的人是神所喜愛的。」（哥林多後書 9:7）加南新生基督教會感謝您的愛心奉獻與忠心事奉！'
            : '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." (2 Corinthians 9:7)'}
        </p>
      </div>

      {/* Giving Methods Selector */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-200/80 p-1.5 rounded-2xl mb-8">
          {/* Method 1: In-person offering box (Most Recommended) */}
          <button
            onClick={() => setActiveMethod('in-person')}
            className={`relative flex items-center justify-center space-x-2 py-3.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMethod === 'in-person' 
                ? 'bg-amber-800 text-white shadow-md' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{lang === 'zh' ? '主日現場奉獻箱' : 'Sunday In-Person'}</span>
            <span className="hidden xl:inline-block text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded-full ml-1">
              {lang === 'zh' ? '最推薦' : 'Top'}
            </span>
          </button>

          {/* Method 2: Zelle */}
          <button
            onClick={() => setActiveMethod('zelle')}
            className={`flex items-center justify-center space-x-2 py-3.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMethod === 'zelle' 
                ? 'bg-amber-800 text-white shadow-md' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="truncate">Zelle {lang === 'zh' ? '電子轉帳' : 'Transfer'}</span>
          </button>

          {/* Method 3: Check */}
          <button
            onClick={() => setActiveMethod('check')}
            className={`flex items-center justify-center space-x-2 py-3.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMethod === 'check' 
                ? 'bg-amber-800 text-white shadow-md' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{lang === 'zh' ? '郵寄支票' : 'Mailing Check'}</span>
          </button>
        </div>

        {/* Method 1 Details: In-Person Offering Box (Recommended) */}
        {activeMethod === 'in-person' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
              <div className="flex items-center space-x-3 text-amber-900">
                <div className="p-3 bg-amber-100 rounded-2xl">
                  <Building2 className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                      {lang === 'zh' ? '主日現場奉獻箱奉獻' : 'In-Person Sunday Offering Boxes'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'zh' ? '禮拜堂後方左右兩側設有專用奉獻箱' : 'Located at the back of the sanctuary on both left & right sides'}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center self-start sm:self-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '教會最鼓勵的奉獻方式' : 'Most Encouraged & Recommended'}</span>
              </div>
            </div>

            {/* In-Person Offering Box Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2.5">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{lang === 'zh' ? '奉獻箱位置與說明' : 'Offering Box Locations'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {lang === 'zh' 
                    ? '禮拜天到教會作禮拜時，在禮拜堂（大堂）的後面，左右兩側各有一個奉獻箱，您可以將奉獻（現金或支票）直接放進裡面。' 
                    : 'When you come to church for Sunday service, offering boxes are located at the back of the sanctuary on both the left and right sides. You may place your offerings (cash or checks) directly into the boxes.'}
                </p>
                <div className="text-xs text-amber-800 font-medium pt-1">
                  ✨ {lang === 'zh' ? '親自實體聚會、在敬拜中同心感恩奉獻，是教會最鼓勵弟兄姊妹參與的方式。' : 'Gathering in person and giving with a thankful heart during worship is our most encouraged practice.'}
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lang === 'zh' ? '奉獻封與抵稅收據' : 'Envelopes & Tax Receipts'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'zh'
                    ? '奉獻箱旁備有奉獻袋。若需開立年底抵稅收據，請於奉獻袋上註明您的姓名、聯絡電話及奉獻項目（如：十一奉獻、主日奉獻、宣教等）。'
                    : 'Offering envelopes are available next to the boxes. To receive an end-of-year tax receipt, please write your full name, phone number, and designation (e.g. Tithe, General, Missions).'}
                </p>
                <div className="text-xs text-slate-500 pt-1">
                  {lang === 'zh' ? '若投遞支票，抬頭請寫：' : 'If writing a check, payable to:'} <span className="font-mono font-bold text-slate-800">{CHURCH_INFO.checkPayableTo}</span>
                </div>
              </div>
            </div>

            {/* Worship Timing & Address Banner */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{lang === 'zh' ? '主日崇拜時間：每週日上午 11:00' : 'Sunday Service Time: Sundays at 11:00 AM'}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{CHURCH_INFO.address}</span>
                </div>
              </div>

              <a
                href={CHURCH_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '開啟 Google 地圖導航' : 'Open in Google Maps'}</span>
              </a>
            </div>
          </div>
        )}

        {/* Method 2: Zelle */}
        {activeMethod === 'zelle' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 text-purple-900">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Smartphone className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Zelle {lang === 'zh' ? '免手續費電子奉獻' : 'Fee-Free Giving'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'zh' ? '透過銀行 App 的 Zelle 功能，直轉至教會帳戶' : 'Direct bank transfer via your mobile banking app'}
                </p>
              </div>
            </div>

            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
              <div className="text-xs font-semibold text-purple-900 uppercase tracking-wider">
                {lang === 'zh' ? '教會 Zelle 收款帳號 (Recipient Email / Phone):' : 'Zelle Recipient Account:'}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-purple-300">
                <div className="space-y-0.5">
                  <div className="text-base font-mono font-bold text-slate-900">{CHURCH_INFO.zelleEmail}</div>
                  <div className="text-xs text-slate-500">{lang === 'zh' ? '備用電話號碼：' : 'Alt Phone:'} {CHURCH_INFO.zellePhone}</div>
                  <div className="text-xs text-slate-600 font-medium">{lang === 'zh' ? '戶名：' : 'Recipient Name:'} {CHURCH_INFO.nameEn}</div>
                </div>

                <button
                  onClick={handleCopyZelle}
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  {copiedZelle ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedZelle ? (lang === 'zh' ? '已複製 Zelle 電郵' : 'Copied!') : (lang === 'zh' ? '複製 Zelle 電郵' : 'Copy Email')}</span>
                </button>
              </div>

              <div className="text-xs text-purple-900 leading-relaxed pt-1">
                💡 <strong>{lang === 'zh' ? '備註說明：' : 'Memo Tip:'}</strong> {lang === 'zh' ? '請於 Zelle 轉帳備註欄（Memo）註明您的姓名與奉獻項目（如：十一奉獻 Tithe、主日奉獻 Sunday Offerings 或宣教奉獻 Mission），以便開立年底抵稅收據。' : 'Please include your full name and offering designation (e.g. Tithe, General, Missions) in the Zelle memo for tax receipt records.'}
              </div>
            </div>
          </div>
        )}

        {/* Method 3: Check */}
        {activeMethod === 'check' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-slate-900">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-800">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">
                  {lang === 'zh' ? '郵寄支票奉獻' : 'Mailing a Check'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'zh' ? `抬頭開立給 ${CHURCH_INFO.checkPayableTo}` : `Payable to ${CHURCH_INFO.checkPayableTo}`}
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang === 'zh' ? '支票抬頭 (Payable To):' : 'Payable To:'}</div>
                  <div className="text-base font-serif font-bold text-amber-950 font-mono mt-0.5">{CHURCH_INFO.checkPayableTo}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(CHURCH_INFO.checkPayableTo);
                  }}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-colors self-start sm:self-center"
                >
                  {lang === 'zh' ? '複製抬頭' : 'Copy Name'}
                </button>
              </div>
              <div><strong>{lang === 'zh' ? '郵寄地址 (Mailing Address):' : 'Mailing Address:'}</strong> {CHURCH_INFO.address}</div>
              <div className="text-slate-500 pt-1">
                {lang === 'zh' ? '💡 提示：請於支票左下角 Memo 備註您的奉獻項目（如：Tithe 或 General）。' : '💡 Tip: Please write your designation in the memo line.'}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 my-8 relative shadow-2xl border border-slate-200">
          <button
            onClick={onCloseModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <section id="giving" className="py-20 bg-amber-50/60 border-t border-amber-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </section>
  );
};
