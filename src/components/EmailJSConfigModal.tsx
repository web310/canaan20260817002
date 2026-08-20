import React, { useState, useEffect } from 'react';
import { getEmailJSConfig, saveEmailJSConfig, resetEmailJSConfigToEnv, sendTestEmailJS, EmailJSConfig } from '../lib/emailService';
import { CHURCH_INFO } from '../data/churchData';
import { Mail, Key, ShieldCheck, Check, X, Info, Lock, Send, RefreshCw, AlertCircle, Copy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
  adminEmail: string | null;
  onOpenAdminLogin: () => void;
}

export const EmailJSConfigModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  lang,
  adminEmail,
  onOpenAdminLogin 
}) => {
  const [config, setConfig] = useState<EmailJSConfig>({ serviceId: '', templateId: '', publicKey: '' });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testEmail, setTestEmail] = useState(CHURCH_INFO.email);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getEmailJSConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;

    saveEmailJSConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleResetToEnv = () => {
    resetEmailJSConfigToEnv();
    setConfig(getEmailJSConfig());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestSend = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await sendTestEmailJS(testEmail);
    setIsTesting(false);
    setTestResult(res);
  };

  const envSample = `VITE_EMAILJS_SERVICE_ID=你的實際Service_ID\nVITE_EMAILJS_TEMPLATE_ID=你的實際Template_ID\nVITE_EMAILJS_PUBLIC_KEY=你的實際Public_Key`;

  const copyEnvSample = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-900">
                {lang === 'zh' ? 'EmailJS 自動寄信服務設定' : 'EmailJS Auto-Email Configuration'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'zh' ? `官方通知收件信箱：${CHURCH_INFO.email}` : `Official Church Inbox: ${CHURCH_INFO.email}`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs">
          <span className="text-slate-600 font-medium">{lang === 'zh' ? '當前金鑰來源：' : 'Current Key Source:'}</span>
          {config.source === 'env' ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{lang === 'zh' ? '已讀取 Cloudflare Pages 環境變數' : 'Loaded from Env Variables'}</span>
            </span>
          ) : config.source === 'custom' ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              <span>{lang === 'zh' ? '自訂本機管理員覆寫' : 'Custom Local Override'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[11px]">
              <AlertCircle className="w-3 h-3 text-slate-500" />
              <span>{lang === 'zh' ? '尚未設定 (使用預設 Mailto)' : 'Not Configured (Mailto Fallback)'}</span>
            </span>
          )}
        </div>

        {/* Security Access Control Banner */}
        {!adminEmail && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="font-bold text-amber-900">
                {lang === 'zh' ? '需要管理員登入才能更改設定' : 'Admin Login Required to Edit'}
              </div>
              <p className="text-amber-800 leading-relaxed">
                {lang === 'zh'
                  ? '為確保教會官方寄信安全，金鑰設定僅限管理員帳號 (web@canaannewlife.org) 修改。'
                  : 'To protect email credentials, only authorized church administrators can configure EmailJS keys.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs shadow-sm transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '立即登入管理員' : 'Login as Admin'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Cloudflare Pages Environment Variable Guide */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 mb-5 text-xs space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-bold">
            <span className="flex items-center space-x-1.5">
              <Info className="w-4 h-4" />
              <span>{lang === 'zh' ? 'Cloudflare Pages 環境變數標準設定' : 'Cloudflare Pages Env Variables'}</span>
            </span>
            <button
              onClick={copyEnvSample}
              className="flex items-center space-x-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded transition"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedEnv ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '複製範例' : 'Copy')}</span>
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {lang === 'zh'
              ? '將專案部署至 Cloudflare Pages 時，請在「Settings ➔ Environment variables」填入以下 3 個變數，前端將自動讀取，無需硬編碼在程式中：'
              : 'Add these 3 variables in Cloudflare Pages (Settings ➔ Environment variables). Frontend reads them automatically without hardcoding:'}
          </p>
          <pre className="p-2.5 bg-black/50 rounded-xl font-mono text-[11px] text-amber-300 overflow-x-auto leading-relaxed">
            {envSample}
          </pre>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>VITE_EMAILJS_SERVICE_ID</span>
              <span className="text-[11px] text-slate-400 font-normal">例如: service_xxxxx</span>
            </label>
            <input
              type="text"
              disabled={!adminEmail}
              value={config.serviceId}
              onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
              placeholder="e.g. service_canaan123"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-slate-900 disabled:opacity-60 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>VITE_EMAILJS_TEMPLATE_ID</span>
              <span className="text-[11px] text-slate-400 font-normal">例如: template_xxxxx</span>
            </label>
            <input
              type="text"
              disabled={!adminEmail}
              value={config.templateId}
              onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
              placeholder="e.g. template_ministry_inquiry"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-slate-900 disabled:opacity-60 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>VITE_EMAILJS_PUBLIC_KEY</span>
              <span className="text-[11px] text-slate-400 font-normal">例如: user_xxxxx 或 public_key</span>
            </label>
            <input
              type="text"
              disabled={!adminEmail}
              value={config.publicKey}
              onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
              placeholder="e.g. pk_live_xxxxx"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-slate-900 disabled:opacity-60 disabled:bg-slate-100"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold text-center flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'zh' ? 'EmailJS 設定已成功儲存！' : 'EmailJS settings saved successfully!'}</span>
            </div>
          )}

          {/* Test Email Section for Admin */}
          {adminEmail && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-slate-700 font-bold text-xs">
                {lang === 'zh' ? '🧪 測試寄送連線 (Test Connection):' : '🧪 Test Email Connection:'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  disabled={isTesting || !config.serviceId}
                  onClick={handleTestSend}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 disabled:opacity-40 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTesting ? (lang === 'zh' ? '發送中...' : 'Sending...') : (lang === 'zh' ? '發送測試信' : 'Send Test')}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                  testResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                }`}>
                  {testResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              {lang === 'zh' ? '關閉' : 'Close'}
            </button>

            {adminEmail && (
              <>
                <button
                  type="button"
                  onClick={handleResetToEnv}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-xs transition-colors"
                  title={lang === 'zh' ? '清除自訂設定，還原為 Cloudflare 環境變數' : 'Reset to Cloudflare Env Vars'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  {lang === 'zh' ? '儲存自訂設定' : 'Save Config'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

