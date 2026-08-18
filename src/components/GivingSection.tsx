import React, { useState } from 'react';
import { Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { Heart, Mail, Smartphone, Check, Copy, X } from 'lucide-react';

interface GivingProps {
  lang: Language;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const GivingSection: React.FC<GivingProps> = ({ lang, isOpenModal = false, onCloseModal }) => {
  const [copiedZelle, setCopiedZelle] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'zelle' | 'check'>('zelle');

  const handleCopyZelle = () => {
    navigator.clipboard.writeText(CHURCH_INFO.zelleEmail);
    setCopiedZelle(true);
    setTimeout(() => setCopiedZelle(false), 2000);
  };

  const content = (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider">
          <Heart className="w-4 h-4 text-amber-700 fill-amber-700/20" />
          <span>{lang === 'zh' ? '奉獻支持事工' : 'Generous Giving & Stewardship'}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {lang === 'zh' ? '甘心樂意 • 奉獻給主' : 'Cheerful Giving for God\'s Kingdom'}
        </h2>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {lang === 'zh' 
            ? '「各人要隨本心所酌定的，不要作難，不要勉強，因為捐得樂意的人是神所喜愛的。」（哥林多後書 9:7）加南新生基督教會感謝您的愛心奉獻！'
            : '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." (2 Corinthians 9:7)'}
        </p>
      </div>

      {/* Giving Methods Selector */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setActiveMethod('zelle')}
            className={`flex items-center justify-center space-x-2 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMethod === 'zelle' ? 'bg-amber-800 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Zelle {lang === 'zh' ? '電子轉帳奉獻' : 'Transfer'}</span>
          </button>

          <button
            onClick={() => setActiveMethod('check')}
            className={`flex items-center justify-center space-x-2 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMethod === 'check' ? 'bg-amber-800 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{lang === 'zh' ? '郵寄支票奉獻' : 'By Check'}</span>
          </button>
        </div>

        {/* Method 1: Zelle */}
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

        {/* Method 2: Check */}
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
