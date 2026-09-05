import React, { useState, useEffect } from 'react';
import { 
  SMTPConfig, 
  fetchServerSMTPConfig, 
  saveServerSMTPConfig, 
  testSMTPConnection,
  DEFAULT_SMTP_CONFIG 
} from '../lib/smtpService';
import { CHURCH_INFO } from '../data/churchData';
import { 
  Mail, 
  Server, 
  Key, 
  ShieldCheck, 
  Check, 
  X, 
  Lock, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Zap, 
  Globe, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
  adminEmail: string | null;
  onOpenAdminLogin: () => void;
}

export const SMTPConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  adminEmail,
  onOpenAdminLogin,
}) => {
  const [config, setConfig] = useState<SMTPConfig>(DEFAULT_SMTP_CONFIG);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Test state
  const [testEmail, setTestEmail] = useState(CHURCH_INFO.email);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    advice?: string;
    code?: string;
  } | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingConfig(true);
      setTestResult(null);
      setSaveFeedback(null);
      setPasswordInput('');

      fetchServerSMTPConfig().then((loaded) => {
        setConfig(loaded);
        setIsLoadingConfig(false);
        if (loaded.user && !testEmail) {
          setTestEmail(loaded.user);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Preset Providers
  const applyPreset = (type: 'gmail' | 'outlook' | 'custom' | 'yahoo') => {
    setTestResult(null);
    if (type === 'gmail') {
      setConfig((prev) => ({
        ...prev,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
      }));
    } else if (type === 'outlook') {
      setConfig((prev) => ({
        ...prev,
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        requireTLS: true,
      }));
    } else if (type === 'yahoo') {
      setConfig((prev) => ({
        ...prev,
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        requireTLS: true,
      }));
    } else if (type === 'custom') {
      setConfig((prev) => ({
        ...prev,
        host: 'mail.canaannewlife.org',
        port: 587,
        secure: false,
        requireTLS: true,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;

    setIsSaving(true);
    setSaveFeedback(null);

    const updatePayload: Partial<SMTPConfig> = {
      host: config.host,
      port: Number(config.port) || 587,
      secure: config.secure,
      requireTLS: config.requireTLS,
      user: config.user,
      fromName: config.fromName || '加南新生基督教會',
      fromEmail: config.fromEmail || config.user || 'web@canaannewlife.org',
      defaultRecipient: config.defaultRecipient || 'web@canaannewlife.org',
      isActive: config.isActive,
    };

    if (passwordInput.trim()) {
      updatePayload.pass = passwordInput.trim();
    }

    const res = await saveServerSMTPConfig(updatePayload);
    setIsSaving(false);

    if (res.success && res.config) {
      setConfig(res.config);
      setPasswordInput('');
      setSaveFeedback({ success: true, message: lang === 'zh' ? 'SMTP 設定儲存成功！' : 'SMTP settings saved successfully!' });
      setTimeout(() => {
        setSaveFeedback(null);
      }, 3000);
    } else {
      setSaveFeedback({ success: false, message: res.message || '儲存失敗' });
    }
  };

  const handleTestSend = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testPayload: Partial<SMTPConfig> = {
      host: config.host,
      port: Number(config.port) || 587,
      secure: config.secure,
      requireTLS: config.requireTLS,
      user: config.user,
      pass: passwordInput.trim() || undefined,
      fromName: config.fromName,
      fromEmail: config.fromEmail,
      defaultRecipient: config.defaultRecipient,
    };

    const res = await testSMTPConnection(testPayload, testEmail);
    setIsTesting(false);
    setTestResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-2.5 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl shadow-sm shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                  {lang === 'zh' ? 'SMTP 郵件伺服器寄信設定' : 'SMTP Mail Server Configuration'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
                {lang === 'zh' 
                  ? '以教會專用 Email 帳號發送聯絡留言、接送預約、代禱與事工通知' 
                  : 'Send automated church emails directly through your dedicated SMTP mail server'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors shrink-0 ml-2"
            title="關閉 (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5">

          {/* Not Logged In Warning */}
          {!adminEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-amber-900 text-xs">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {lang === 'zh' 
                    ? '需先登入管理員帳號 (web@canaannewlife.org) 方可修改 SMTP 伺服器設定。' 
                    : 'Please log in with admin account (web@canaannewlife.org) to edit SMTP settings.'}
                </span>
              </div>
              <button
                onClick={onOpenAdminLogin}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow transition-colors shrink-0 ml-2"
              >
                {lang === 'zh' ? '登入管理員' : 'Admin Login'}
              </button>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 font-medium">
                {lang === 'zh' ? '當前發信主機：' : 'Active Mailer:'}
              </span>
              <span className="font-bold text-slate-800">
                {config.isConfigured 
                  ? `${config.host} (${config.user || '已設定'})` 
                  : (lang === 'zh' ? '尚未設定 (請填寫下方 SMTP 參數)' : 'Not Configured')}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              {config.hasPassword ? (
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'zh' ? '密碼已安全保存' : 'Password Stored'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-full text-[11px]">
                  <AlertCircle className="w-3 h-3" />
                  <span>{lang === 'zh' ? '密碼未設定' : 'Password Missing'}</span>
                </span>
              )}
            </div>
          </div>


        {/* Quick Provider Presets */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            {lang === 'zh' ? '快速代入常用郵件主機預設：' : 'Quick Presets:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('gmail')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                config.host === 'smtp.gmail.com'
                  ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-red-500" />
              <span>Gmail / Google</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('outlook')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                config.host === 'smtp.office365.com'
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Office 365</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('custom')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                config.host === 'mail.canaannewlife.org'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-amber-600" />
              <span>加南自訂網域</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('yahoo')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                config.host === 'smtp.mail.yahoo.com'
                  ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-500" />
              <span>Yahoo</span>
            </button>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs sm:text-sm">
          
          {/* Host & Port Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'zh' ? 'SMTP 伺服器主機 (Server / Host)' : 'SMTP Server Host'} *
              </label>
              <div className="relative">
                <Server className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  disabled={!adminEmail}
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="例如：smtp.gmail.com 或 mail.canaannewlife.org"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'zh' ? '連接埠 (Port)' : 'Port'} *
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  required
                  disabled={!adminEmail}
                  value={config.port}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setConfig({
                      ...config,
                      port: p,
                      secure: p === 465,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Protocol / Encryption options */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs">
              {lang === 'zh' ? '通訊協定與加密方式 (Protocol / TLS)' : 'Encryption Protocol'}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-amber-50/50">
                <input
                  type="radio"
                  name="tlsProtocol"
                  checked={!config.secure}
                  onChange={() => setConfig({ ...config, secure: false, requireTLS: true, port: config.port === 465 ? 587 : config.port })}
                  disabled={!adminEmail}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">STARTTLS (埠 587)</span>
                  <span className="text-[10px] text-slate-500 block">Gmail / O365 推薦</span>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-amber-50/50">
                <input
                  type="radio"
                  name="tlsProtocol"
                  checked={config.secure}
                  onChange={() => setConfig({ ...config, secure: true, port: config.port === 587 ? 465 : config.port })}
                  disabled={!adminEmail}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">SSL / TLS (埠 465)</span>
                  <span className="text-[10px] text-slate-500 block">加密通道直連</span>
                </div>
              </label>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'zh' ? 'SMTP 帳號 (Username / Email)' : 'SMTP Username'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  disabled={!adminEmail}
                  value={config.user}
                  onChange={(e) => setConfig({ ...config, user: e.target.value })}
                  placeholder="例如：web@canaannewlife.org"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">
                  {lang === 'zh' ? 'SMTP 密碼 (Password)' : 'Password'} *
                </label>
                {config.hasPassword && !passwordInput && (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {lang === 'zh' ? '已儲存 (留空則維持原密碼)' : 'Saved (leave blank to keep)'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={!adminEmail}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={config.hasPassword ? '•••••••• (已保存，輸入新密碼以變更)' : '請輸入 SMTP 密碼或應用程式密碼'}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Google App Password Help Note */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Google / Gmail 發信特別提示：</span>
              若使用 Google 信箱，請先至 Google 帳戶開啟「兩步驟驗證」，並於「安全性」頁面生成專屬的「
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-800 underline inline-flex items-center gap-0.5 hover:text-amber-950 mx-0.5"
              >
                應用程式密碼 (App Password)
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              」(16 個英文小寫字母)，在此填入該密碼即可安全完成連線發信。
            </div>
          </div>

          {/* Display Name & Target Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'zh' ? '發信顯示名稱 (Sender Name)' : 'From Name'}
              </label>
              <input
                type="text"
                disabled={!adminEmail}
                value={config.fromName}
                onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                placeholder="例如：加南新生基督教會"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 text-xs text-slate-800 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'zh' ? '官方預設收件信箱 (Default Inbox)' : 'Church Inbox'}
              </label>
              <input
                type="email"
                disabled={!adminEmail}
                value={config.defaultRecipient}
                onChange={(e) => setConfig({ ...config, defaultRecipient: e.target.value })}
                placeholder="web@canaannewlife.org"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 text-xs text-slate-800 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Action Row: Save & Feedback */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              {saveFeedback && (
                <div className={`flex items-center space-x-1.5 font-bold ${saveFeedback.success ? 'text-emerald-700' : 'text-red-700'}`}>
                  {saveFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{saveFeedback.message}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!adminEmail || isSaving}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'zh' ? '正在儲存至伺服器...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{lang === 'zh' ? '儲存 SMTP 設定' : 'Save SMTP Settings'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <hr className="my-5 border-slate-200" />

        {/* Test Connection Section */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-800">
                {lang === 'zh' ? '測試 SMTP 發信連線 (Live Test)' : 'Test SMTP Connection'}
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">
              {lang === 'zh' ? '以目前輸入之設定發送真實測試信' : 'Sends real test email'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="收件測試 Email (例如: web@canaannewlife.org)"
              className="w-full flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 text-xs text-slate-800"
            />
            <button
              type="button"
              onClick={handleTestSend}
              disabled={isTesting || !config.host || !config.user}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-300 hover:text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5 flex-shrink-0"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>{lang === 'zh' ? '連線驗證中...' : 'Testing...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '立即發送測試信' : 'Send Test Email'}</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results Display */}
          {testResult && (
            <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-start space-x-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{testResult.message}</div>
                  {testResult.advice && (
                    <div className="mt-1.5 text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-200">
                      💡 <strong>排錯建議：</strong>{testResult.advice}
                    </div>
                  )}
                  {testResult.details && (
                    <div className="mt-1 text-[10px] text-slate-500 font-mono">
                      主機: {testResult.details.host}:{testResult.details.port} | 帳號: {testResult.details.user}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        </div>
      </div>
    </div>
  );
};
