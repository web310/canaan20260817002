import React, { useState, useEffect } from 'react';
import { getEmailJSConfig, saveEmailJSConfig, EmailJSConfig } from '../lib/emailService';
import { CHURCH_INFO } from '../data/churchData';
import { Mail, Key, Shield, Check, X, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
}

export const EmailJSConfigModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const [config, setConfig] = useState<EmailJSConfig>({ serviceId: '', templateId: '', publicKey: '' });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getEmailJSConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmailJSConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {lang === 'zh' ? 'EmailJS 自動寄信服務設定' : 'EmailJS Auto-Email Configuration'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'zh' ? `收件目的地：${CHURCH_INFO.email}` : `Destination: ${CHURCH_INFO.email}`}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-6 text-xs text-slate-700 leading-relaxed space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-amber-900">
            <Info className="w-4 h-4 shrink-0 text-amber-800" />
            <span>{lang === 'zh' ? '系統自動寄信原理說明：' : 'How EmailJS Works:'}</span>
          </div>
          <p>
            {lang === 'zh'
              ? `設定 EmailJS 的 Service ID、Template ID 與 Public Key 後，當弟兄姊妹填寫線上事工表單，系統會直接經由背景將通知寄至 ${CHURCH_INFO.email}。`
              : `With EmailJS keys configured, form submissions will be emailed automatically to ${CHURCH_INFO.email} in the background.`}
          </p>
          <p className="text-slate-500 text-[11px]">
            {lang === 'zh' 
              ? '若尚未設定 EmailJS 金鑰，系統會安全備份資料並自動開啟預設郵件客戶端送出，不會遺失任何登記！' 
              : 'If keys are not set, submission details will still be saved locally and prepared in your email app.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>EmailJS Service ID</span>
              <span className="text-[11px] text-slate-400 font-normal">例如: service_xxxxx</span>
            </label>
            <input
              type="text"
              value={config.serviceId}
              onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
              placeholder="e.g. service_canaan123"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>EmailJS Template ID</span>
              <span className="text-[11px] text-slate-400 font-normal">例如: template_xxxxx</span>
            </label>
            <input
              type="text"
              value={config.templateId}
              onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
              placeholder="e.g. template_ministry_inquiry"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>EmailJS Public Key</span>
              <span className="text-[11px] text-slate-400 font-normal">例如: user_xxxxx 或 public_key</span>
            </label>
            <input
              type="text"
              value={config.publicKey}
              onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
              placeholder="e.g. pk_live_xxxxx"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-slate-900"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold text-center flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'zh' ? 'EmailJS 設定已成功儲存！' : 'EmailJS settings saved successfully!'}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              {lang === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {lang === 'zh' ? '儲存設定' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
