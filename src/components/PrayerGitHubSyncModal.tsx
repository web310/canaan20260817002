import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  Cloud, 
  Download, 
  Copy, 
  Check, 
  Upload, 
  FileCode, 
  Database, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Layers,
  HelpCircle,
  ExternalLink,
  Key,
  GitBranch,
  FolderGit2,
  Send,
  AlertCircle,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { PrayerRequest, Language } from '../types';
import { INITIAL_PRAYERS, PRAYERS_DATA_VERSION } from '../data/prayersData';
import { deduplicatePrayers } from '../utils/prayerHelper';

interface PrayerGitHubSyncModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  prayers: PrayerRequest[];
  onUpdatePrayers: (prayers: PrayerRequest[]) => void;
  onOpenGlobalSync?: () => void;
}

export const PrayerGitHubSyncModal: React.FC<PrayerGitHubSyncModalProps> = ({
  lang,
  isOpen,
  onClose,
  prayers,
  onUpdatePrayers,
  onOpenGlobalSync
}) => {
  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'github-push' | 'export' | 'guide' | 'backup'>('github-push');

  // GitHub Direct Push Configuration
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('canaan_github_pat') || 
           localStorage.getItem('canaan_github_prayers_pat') || 
           localStorage.getItem('canaan_github_sermons_pat') || '';
  });
  const [repoOwner, setRepoOwner] = useState(() => {
    return localStorage.getItem('canaan_github_owner') || 
           localStorage.getItem('canaan_github_prayers_owner') || 'canaannewlife';
  });
  const [repoName, setRepoName] = useState(() => {
    return localStorage.getItem('canaan_github_repo') || 
           localStorage.getItem('canaan_github_prayers_repo') || 'canaan-shin-sheng-church';
  });
  const [branch, setBranch] = useState(() => {
    return localStorage.getItem('canaan_github_branch') || 
           localStorage.getItem('canaan_github_prayers_branch') || 'main';
  });
  const [filePath, setFilePath] = useState(() => {
    return localStorage.getItem('canaan_github_prayers_path') || 'src/data/prayersData.ts';
  });
  const [customCommitMsg, setCustomCommitMsg] = useState('');
  
  // Push status
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccessResult, setPushSuccessResult] = useState<{
    commitSha: string;
    commitUrl: string;
    date: string;
  } | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushStep, setPushStep] = useState<string>('');

  // Save config to localStorage
  useEffect(() => {
    if (githubToken) {
      localStorage.setItem('canaan_github_pat', githubToken.trim());
      localStorage.setItem('canaan_github_prayers_pat', githubToken.trim());
    }
    if (repoOwner) {
      localStorage.setItem('canaan_github_owner', repoOwner.trim());
      localStorage.setItem('canaan_github_prayers_owner', repoOwner.trim());
    }
    if (repoName) {
      localStorage.setItem('canaan_github_repo', repoName.trim());
      localStorage.setItem('canaan_github_prayers_repo', repoName.trim());
    }
    if (branch) {
      localStorage.setItem('canaan_github_branch', branch.trim());
      localStorage.setItem('canaan_github_prayers_branch', branch.trim());
    }
    if (filePath) {
      localStorage.setItem('canaan_github_prayers_path', filePath.trim());
    }
  }, [githubToken, repoOwner, repoName, branch, filePath]);

  if (!isOpen) return null;

  const dedupedList = deduplicatePrayers(prayers);

  // Helper to generate clean prayersData.ts file string
  const generateTypeScriptCode = () => {
    const prayersJson = JSON.stringify(dedupedList, null, 2);
    const versionStr = `version-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;

    return `import { PrayerRequest } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - PRAYER WALL MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Active Prayers: ${dedupedList.length}
// ============================================================================

export const PRAYERS_DATA_VERSION = "${versionStr}";

export const INITIAL_PRAYERS: PrayerRequest[] = ${prayersJson};
`;
  };

  const handleCopyCode = () => {
    const code = generateTypeScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedTs(true);
    setTimeout(() => setCopiedTs(false), 2500);
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(dedupedList, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleDownloadTs = () => {
    const code = generateTypeScriptCode();
    const blob = new Blob([code], { type: 'text/typescript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prayersData.ts';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(dedupedList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canaan_prayers_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Direct GitHub Push handler
  const handlePushToGitHub = async () => {
    if (!githubToken.trim()) {
      setPushError(lang === 'zh' ? '請輸入 GitHub Personal Access Token (PAT)' : 'Please enter your GitHub PAT token');
      return;
    }
    if (!repoOwner.trim() || !repoName.trim()) {
      setPushError(lang === 'zh' ? '請填寫倉庫擁有者與專案名稱' : 'Please provide repository owner and name');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushSuccessResult(null);

    const tsContent = generateTypeScriptCode();
    const defaultCommit = customCommitMsg.trim() || `feat(prayer): sync prayer wall master data (${dedupedList.length} items) - ${new Date().toISOString().slice(0, 10)}`;

    try {
      setPushStep(lang === 'zh' ? '正在嘗試透過後端 API 同步至 GitHub...' : 'Syncing via backend API...');

      // 1. Try server backend endpoint first
      const backendRes = await fetch('/api/github/sync-prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          owner: repoOwner.trim(),
          repo: repoName.trim(),
          branch: branch.trim() || 'main',
          path: filePath.trim() || 'src/data/prayersData.ts',
          prayers: dedupedList,
          commitMessage: defaultCommit
        })
      });

      if (backendRes.ok) {
        const result = await backendRes.json();
        setPushSuccessResult({
          commitSha: result.commitSha || 'latest',
          commitUrl: result.commitUrl || `https://github.com/${repoOwner.trim()}/${repoName.trim()}`,
          date: new Date().toLocaleTimeString()
        });
        setIsPushing(false);
        return;
      }

      // 2. Fallback directly to client-side GitHub REST API
      setPushStep(lang === 'zh' ? '正在直接向 GitHub REST API 提交變更...' : 'Committing directly to GitHub REST API...');

      const token = githubToken.trim();
      const owner = repoOwner.trim();
      const repo = repoName.trim();
      const targetBranch = branch.trim() || 'main';
      const targetPath = filePath.trim() || 'src/data/prayersData.ts';

      // Get current file sha if existing
      let currentSha: string | undefined = undefined;
      try {
        const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}?ref=${targetBranch}`;
        const getRes = await fetch(getUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        if (getRes.ok) {
          const fileData = await getRes.json();
          currentSha = fileData.sha;
        }
      } catch {
        // file might be new
      }

      // PUT contents to GitHub
      const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`;
      const base64Content = btoa(unescape(encodeURIComponent(tsContent)));

      const putRes = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          message: defaultCommit,
          content: base64Content,
          branch: targetBranch,
          ...(currentSha ? { sha: currentSha } : {})
        })
      });

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub API returned ${putRes.status} ${putRes.statusText}`);
      }

      const commitResult = await putRes.json();
      setPushSuccessResult({
        commitSha: commitResult.commit?.sha?.substring(0, 7) || 'latest',
        commitUrl: commitResult.commit?.html_url || `https://github.com/${owner}/${repo}`,
        date: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      console.error('GitHub Push Error:', err);
      setPushError(err.message || (lang === 'zh' ? '推送到 GitHub 失敗，請確認 Token 權限與網路狀態' : 'Push failed. Please check token permissions.'));
    } finally {
      setIsPushing(false);
      setPushStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">
                  {lang === 'zh' ? '代禱事項 GitHub 雲端同步中心' : 'Prayer Wall GitHub Sync Center'}
                </h3>
                <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                  {dedupedList.length} {lang === 'zh' ? '項代禱事項' : 'Prayers'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'zh' 
                  ? '將代禱牆最新代禱內容（已去重）同步至 GitHub 倉庫與 Cloudflare Pages' 
                  : 'Sync authoritative prayer requests to GitHub and trigger instant deployment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('github-push')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'github-push'
                ? 'border-rose-500 text-rose-400 bg-slate-900/80 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'zh' ? '一鍵推送至 GitHub (推薦)' : 'Direct GitHub Push'}</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-rose-500 text-rose-400 bg-slate-900/80 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>{lang === 'zh' ? '複製 TypeScript 代碼' : 'Copy TypeScript'}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-rose-500 text-rose-400 bg-slate-900/80 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{lang === 'zh' ? 'JSON 備份與下載' : 'Backup & JSON'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-rose-500 text-rose-400 bg-slate-900/80 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{lang === 'zh' ? '部署與同步教學' : 'Sync Guide'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: DIRECT GITHUB PUSH */}
          {activeTab === 'github-push' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start space-x-3 text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white mb-1">
                    {lang === 'zh' ? '自動推送到 GitHub & 自動觸發 Cloudflare Pages 重新建置' : 'Push to GitHub & Auto-deploy to Cloudflare Pages'}
                  </div>
                  {lang === 'zh' 
                    ? '填入一次 GitHub Personal Access Token (PAT)，後續即可在瀏覽器內直接將最新代禱事項（包含 8/24 談妮傳道手術、租約轉換、肢體康復、青年事工等）提交至 GitHub 倉庫，永久保存且永不遺失！'
                    : 'Provide your GitHub PAT once to directly commit and persist the latest deduplicated prayer list to your GitHub repo.'}
                </div>
              </div>

              {/* Status Message */}
              {pushSuccessResult && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-100 text-sm mb-1">
                        {lang === 'zh' ? '🎉 成功同步並提交至 GitHub！' : 'Successfully pushed to GitHub!'}
                      </div>
                      <p className="text-slate-300 mb-2">
                        {lang === 'zh' 
                          ? `已成功更新 ${filePath}（Commit: ${pushSuccessResult.commitSha}，時間：${pushSuccessResult.date}）。`
                          : `Updated ${filePath} at ${pushSuccessResult.date}.`}
                      </p>
                      <a
                        href={pushSuccessResult.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-100 underline"
                      >
                        <span>{lang === 'zh' ? '在 GitHub 上查看最新 Commit' : 'View Commit on GitHub'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {pushError && (
                <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-100 mb-1">{lang === 'zh' ? '同步失敗' : 'Push Error'}</div>
                    <div>{pushError}</div>
                  </div>
                </div>
              )}

              {/* Repository Parameters Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>GitHub Personal Access Token (PAT)</span>
                    </span>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=Canaan-Church-Prayer-Sync"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline text-[11px] flex items-center space-x-1"
                    >
                      <span>{lang === 'zh' ? '點此建立 Token (需要 repo 權限)' : 'Create PAT token'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={e => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === 'zh' ? 'GitHub 組織/帳號 (Owner)' : 'Repo Owner'}</span>
                  </label>
                  <input
                    type="text"
                    value={repoOwner}
                    onChange={e => setRepoOwner(e.target.value)}
                    placeholder="canaannewlife"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Github className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === 'zh' ? '倉庫名稱 (Repository)' : 'Repo Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={e => setRepoName(e.target.value)}
                    placeholder="canaan-shin-sheng-church"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'zh' ? '分支 (Branch)' : 'Branch'}</span>
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'zh' ? '目標檔案路徑' : 'File Path'}</span>
                  </label>
                  <input
                    type="text"
                    value={filePath}
                    onChange={e => setFilePath(e.target.value)}
                    placeholder="src/data/prayersData.ts"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === 'zh' ? '自訂 Commit 說明 (選填)' : 'Commit Message (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={customCommitMsg}
                    onChange={e => setCustomCommitMsg(e.target.value)}
                    placeholder={`feat(prayer): sync prayer wall (${dedupedList.length} items) - ${new Date().toISOString().slice(0, 10)}`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  {lang === 'zh' ? `將同步 ${dedupedList.length} 項代禱事項到 ${repoOwner}/${repoName}` : `Will push ${dedupedList.length} prayers`}
                </div>
                <div className="flex items-center space-x-3">
                  {onOpenGlobalSync && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenGlobalSync();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      {lang === 'zh' ? '全站一鍵同步' : 'Global Sync'}
                    </button>
                  )}
                  <button
                    onClick={handlePushToGitHub}
                    disabled={isPushing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-900/30 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPushing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{pushStep || (lang === 'zh' ? '正在推送中...' : 'Pushing...')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'zh' ? '立即推送到 GitHub' : 'Push to GitHub Now'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COPY TYPESCRIPT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {lang === 'zh' 
                    ? '可直接複製下方代碼並覆蓋至專案中的 src/data/prayersData.ts：' 
                    : 'Copy this TypeScript code directly to src/data/prayersData.ts:'}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadTs}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '下載 .ts 檔' : 'Download .ts'}</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-lg text-white flex items-center space-x-1.5 shadow-md shadow-rose-900/30"
                  >
                    {copiedTs ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTs ? (lang === 'zh' ? '已複製！' : 'Copied!') : (lang === 'zh' ? '複製代碼' : 'Copy Code')}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono max-h-80 overflow-y-auto leading-relaxed select-all">
                {generateTypeScriptCode()}
              </pre>
            </div>
          )}

          {/* TAB 3: JSON BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {lang === 'zh' 
                    ? '以 JSON 格式備份全部代禱事項，可於任何時間匯入還原：' 
                    : 'Backup all prayer items in standard JSON format:'}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadJson}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '下載 JSON 備份' : 'Download JSON'}</span>
                  </button>
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-lg text-white flex items-center space-x-1.5"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? (lang === 'zh' ? '已複製！' : 'Copied!') : (lang === 'zh' ? '複製 JSON' : 'Copy JSON')}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono max-h-80 overflow-y-auto leading-relaxed select-all">
                {JSON.stringify(dedupedList, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 4: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>{lang === 'zh' ? '代禱事項同步工作流程' : 'Prayer Sync Workflow'}</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-white">{lang === 'zh' ? '1. 瀏覽器編輯與審核' : '1. Local Review'}：</strong>
                    {lang === 'zh' 
                      ? '在「管理審核代禱」中通過審核或新增代禱事項後，所有內容會即時呈現在禱告牆上。' 
                      : 'Approve or create prayer requests in the Admin Panel.'}
                  </li>
                  <li>
                    <strong className="text-white">{lang === 'zh' ? '2. 一鍵推送至 GitHub' : '2. Direct Push'}：</strong>
                    {lang === 'zh' 
                      ? '點擊「立即推送到 GitHub」，系統會自動格式化並寫入 src/data/prayersData.ts。' 
                      : 'Click Push to commit directly to GitHub.'}
                  </li>
                  <li>
                    <strong className="text-white">{lang === 'zh' ? '3. Cloudflare Pages 自動部署' : '3. Cloudflare Auto-Deploy'}：</strong>
                    {lang === 'zh' 
                      ? 'GitHub 收到 Push 後，Cloudflare Pages 會自動偵測並重新建置網站，約 1 分鐘後正式網址全面生效。' 
                      : 'Cloudflare Pages will automatically trigger a new build and go live within 1 minute.'}
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            <span>{lang === 'zh' ? '代禱事項資料版本：' : 'Version: '}{PRAYERS_DATA_VERSION}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {lang === 'zh' ? '關閉視窗' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
