import React, { useState } from 'react';
import { Language } from '../types';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, CheckCircle2, X, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  lang,
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('web@canaannewlife.org');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanPassword) {
      setErrorMsg(lang === 'zh' ? '請輸入管理員密碼。' : 'Please enter the admin password.');
      return;
    }

    // Verify allowed admin account & password
    if (cleanEmail === 'web@canaannewlife.org' || cleanEmail.endsWith('@canaannewlife.org')) {
      if (cleanPassword !== '1qazXSW@3edcVFR$25226') {
        setErrorMsg(
          lang === 'zh'
            ? '密碼錯誤！請輸入正確的管理員密碼。'
            : 'Incorrect password! Please enter the correct admin password.'
        );
        return;
      }

      setSuccessMsg(lang === 'zh' ? '登入成功！已驗證管理員身份' : 'Login successful! Admin verified.');
      setTimeout(() => {
        onLoginSuccess(cleanEmail);
        onClose();
      }, 600);
    } else {
      setErrorMsg(
        lang === 'zh'
          ? '只有 web@canaannewlife.org 或教會管理員帳號有權限開啟週報更新功能。'
          : 'Only web@canaannewlife.org or church admin accounts can access the bulletin update features.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600 rounded-2xl text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                {lang === 'zh' ? '教會網頁管理員登入' : 'Web Administrator Login'}
              </h3>
              <p className="text-xs text-amber-300">
                web@canaannewlife.org
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'zh' ? '管理員權限驗證' : 'Admin Permissions'}</span>
            </div>
            <p>
              {lang === 'zh'
                ? '請使用 web@canaannewlife.org 登入以啟用「修改/新增主日講道」、「主日講道同步至 GitHub」、「週報 PDF 上傳」與「Google 相簿分類管理」等功能。'
                : 'Log in with web@canaannewlife.org to enable editing Sunday sermons, GitHub sermon sync, PDF bulletin upload, and photo management.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'zh' ? '管理員 Email 帳號' : 'Admin Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="web@canaannewlife.org"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'zh' ? '管理員密碼' : 'Admin Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'zh' ? '請輸入管理員密碼' : 'Enter admin password'}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 text-xs font-mono"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>{lang === 'zh' ? '驗證登入' : 'Verify & Log In'}</span>
            </button>
          </form>

          {/* Security Note Footer */}
          <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {lang === 'zh' ? '受保護的管理員通道，需輸入專用密碼。' : 'Protected admin portal. Password required.'}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
