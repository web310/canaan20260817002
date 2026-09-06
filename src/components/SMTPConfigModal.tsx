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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Modal Header */}
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl shadow-sm shrink-0">
              <Server className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif truncate">
                  {lang === 'zh' ? 'SMTP 郵件伺服器寄信設定' : 'SMTP Mail Server Settings'}
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {lang === 'zh' 
                  ? '教會官方信箱自動寄送留言、接送預約與事工通知' 
                  : 'Automated church notifications via dedicated SMTP'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors shrink-0 ml-2"
            title="關閉 (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-3 space-y-3 text-xs">

          {/* Not Logged In Warning */}
          {!adminEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {lang === 'zh' 
                    ? '需先登入管理員帳號方可修改 SMTP 設定。' 
                    : 'Admin login required to edit SMTP settings.'}
                </span>
              </div>
              <button
                onClick={onOpenAdminLogin}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow transition-colors shrink-0 ml-2"
              >
                {lang === 'zh' ? '登入管理員' : 'Admin Login'}
              </button>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] gap-1.5">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-slate-500">
                {lang === 'zh' ? '目前主機：' : 'Host:'}
              </span>
              <span className="font-semibold text-slate-800 truncate">
                {config.isConfigured 
                  ? `${config.host} (${config.user || '已設'})` 
                  : (lang === 'zh' ? '尚未設定' : 'Not Set')}
              </span>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              {config.hasPassword ? (
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-medium bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'zh' ? '密碼已保存' : 'Password Saved'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-amber-700 font-medium bg-amber-100/80 px-2 py-0.5 rounded-full text-[10px]">
                  <AlertCircle className="w-3 h-3" />
                  <span>{lang === 'zh' ? '密碼未設定' : 'No Password'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Provider Presets */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {lang === 'zh' ? '快速常用郵件主機預設：' : 'Quick Presets:'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('gmail')}
                className={`px-1.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  config.host === 'smtp.gmail.com'
                    ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-3 h-3 text-red-500" />
                <span className="truncate">Gmail</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('outlook')}
                className={`px-1.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  config.host === 'smtp.office365.com'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3 h-3 text-blue-500" />
                <span className="truncate">Office 365</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('custom')}
                className={`px-1.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  config.host === 'mail.canaannewlife.org'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Server className="w-3 h-3 text-amber-600" />
                <span className="truncate">加南網域</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('yahoo')}
                className={`px-1.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  config.host === 'smtp.mail.yahoo.com'
                    ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-3 h-3 text-purple-500" />
                <span className="truncate">Yahoo</span>
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <form id="smtp-config-form" onSubmit={handleSave} className="space-y-2.5">
            
            {/* Host & Port Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                  {lang === 'zh' ? '主機 (Host)' : 'Server Host'} *
                </label>
                <div className="relative">
                  <Server className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    required
                    disabled={!adminEmail}
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                  {lang === 'zh' ? '連接埠 (Port)' : 'Port'} *
                </label>
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
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60 text-center"
                />
              </div>
            </div>

            {/* Protocol / Encryption options */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                {lang === 'zh' ? '加密方式 (Protocol / TLS)' : 'Encryption Protocol'}
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center space-x-1.5 p-1.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="radio"
                    name="tlsProtocol"
                    checked={!config.secure}
                    onChange={() => setConfig({ ...config, secure: false, requireTLS: true, port: config.port === 465 ? 587 : config.port })}
                    disabled={!adminEmail}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 block">STARTTLS (587)</span>
                    <span className="text-[10px] text-slate-500 block truncate">Gmail / O365 推薦</span>
                  </div>
                </label>

                <label className="flex items-center space-x-1.5 p-1.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-amber-50/50">
                  <input
                    type="radio"
                    name="tlsProtocol"
                    checked={config.secure}
                    onChange={() => setConfig({ ...config, secure: true, port: config.port === 587 ? 465 : config.port })}
                    disabled={!adminEmail}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 block">SSL / TLS (465)</span>
                    <span className="text-[10px] text-slate-500 block truncate">直接加密通道</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                  {lang === 'zh' ? '帳號 (Username / Email)' : 'SMTP Username'} *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    required
                    disabled={!adminEmail}
                    value={config.user}
                    onChange={(e) => setConfig({ ...config, user: e.target.value })}
                    placeholder="web@canaannewlife.org"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    {lang === 'zh' ? '密碼 (Password)' : 'Password'} *
                  </label>
                  {config.hasPassword && !passwordInput && (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {lang === 'zh' ? '已存' : 'Saved'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={!adminEmail}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={config.hasPassword ? '•••••••• (已保存)' : '請輸入密碼'}
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono text-xs text-slate-800 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Google App Password Help Note */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2 text-[10.5px] text-amber-900 flex items-start space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-bold">Gmail 提示：</span>
                Google 需先開啟兩步驟驗證並生成「
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-800 underline inline-flex items-center gap-0.5 hover:text-amber-950"
                >
                  應用程式密碼
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                」(16 碼)，填入此處即可寄信。
              </div>
            </div>

            {/* Display Name & Target Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                  {lang === 'zh' ? '發信名稱 (Sender Name)' : 'From Name'}
                </label>
                <input
                  type="text"
                  disabled={!adminEmail}
                  value={config.fromName}
                  onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                  placeholder="加南新生基督教會"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 text-xs text-slate-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                  {lang === 'zh' ? '預設收件信箱 (Church Inbox)' : 'Church Inbox'}
                </label>
                <input
                  type="email"
                  disabled={!adminEmail}
                  value={config.defaultRecipient}
                  onChange={(e) => setConfig({ ...config, defaultRecipient: e.target.value })}
                  placeholder="web@canaannewlife.org"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 text-xs text-slate-800 disabled:opacity-60"
                />
              </div>
            </div>
          </form>

          {/* Test Connection Section */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <h4 className="text-[11px] font-bold text-slate-800">
                  {lang === 'zh' ? '測試 SMTP 連線發信' : 'Test SMTP Live Send'}
                </h4>
              </div>
              <span className="text-[10px] text-slate-500">
                {lang === 'zh' ? '驗證真實發信' : 'Real-time test'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="測試收件信箱 (如: web@canaannewlife.org)"
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={handleTestSend}
                disabled={isTesting || !config.host || !config.user}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-300 hover:text-white text-[11px] font-bold rounded-lg shadow transition-colors flex items-center justify-center space-x-1 shrink-0"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                    <span>{lang === 'zh' ? '測試中...' : 'Testing...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>{lang === 'zh' ? '發送測試信' : 'Send Test'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Results Display */}
            {testResult && (
              <div className={`mt-2 p-2 rounded-lg border text-[11px] leading-tight ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-start space-x-1.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{testResult.message}</div>
                    {testResult.advice && (
                      <div className="mt-1 text-[10px] text-amber-900 bg-amber-100/70 p-1.5 rounded border border-amber-200">
                        💡 <strong>建議：</strong>{testResult.advice}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sticky Modal Footer with Action Buttons */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 z-10">
          <div className="text-[11px] min-w-0 pr-2">
            {saveFeedback ? (
              <div className={`flex items-center space-x-1 font-bold truncate ${saveFeedback.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {saveFeedback.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{saveFeedback.message}</span>
              </div>
            ) : (
              <span className="text-slate-400 text-[10px] hidden sm:inline">
                {lang === 'zh' ? '設定將儲存於伺服器並同步本地' : 'Saved to server & local cache'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              {lang === 'zh' ? '關閉' : 'Close'}
            </button>

            <button
              type="submit"
              form="smtp-config-form"
              disabled={!adminEmail || isSaving}
              className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{lang === 'zh' ? '儲存中...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '儲存設定' : 'Save'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
