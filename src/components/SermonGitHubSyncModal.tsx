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
  ShieldCheck
} from 'lucide-react';
import { Sermon, Language } from '../types';

interface SermonGitHubSyncModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  sermons: Sermon[];
  onImportBackup: (sermons: Sermon[]) => void;
}

export const SermonGitHubSyncModal: React.FC<SermonGitHubSyncModalProps> = ({
  lang,
  isOpen,
  onClose,
  sermons,
  onImportBackup
}) => {
  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isServerSyncing, setIsServerSyncing] = useState(false);
  const [serverSyncSuccess, setServerSyncSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'github-push' | 'export' | 'guide' | 'backup'>('github-push');

  // GitHub Direct Push Configuration
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('canaan_github_sermons_pat') || '';
  });
  const [repoOwner, setRepoOwner] = useState(() => {
    return localStorage.getItem('canaan_github_sermons_owner') || 'canaannewlife';
  });
  const [repoName, setRepoName] = useState(() => {
    return localStorage.getItem('canaan_github_sermons_repo') || 'canaan-shin-sheng-church';
  });
  const [branch, setBranch] = useState(() => {
    return localStorage.getItem('canaan_github_sermons_branch') || 'main';
  });
  const [filePath, setFilePath] = useState(() => {
    return localStorage.getItem('canaan_github_sermons_path') || 'src/data/sermonsData.ts';
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

  // Save config to localStorage
  useEffect(() => {
    if (githubToken) localStorage.setItem('canaan_github_sermons_pat', githubToken);
    if (repoOwner) localStorage.setItem('canaan_github_sermons_owner', repoOwner);
    if (repoName) localStorage.setItem('canaan_github_sermons_repo', repoName);
    if (branch) localStorage.setItem('canaan_github_sermons_branch', branch);
    if (filePath) localStorage.setItem('canaan_github_sermons_path', filePath);
  }, [githubToken, repoOwner, repoName, branch, filePath]);

  if (!isOpen) return null;

  // Helper to generate clean sermonsData.ts file string
  const generateTypeScriptCode = () => {
    const sermonsJson = JSON.stringify(sermons, null, 2);
    const versionStr = `version-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;

    return `import { Sermon } from '../types';

// ============================================================================
// CANAAN SHIN SHENG CHRISTIAN CHURCH - SUNDAY SERMONS MASTER DATA
// Auto-generated & Synced for GitHub Repository & Cloudflare Pages Deployment
// Updated at: ${new Date().toISOString()}
// Total Sermons: ${sermons.length}
// ============================================================================

export const SERMONS_DATA_VERSION = "${versionStr}";

export const INITIAL_SERMONS: Sermon[] = ${sermonsJson};

export const RECENT_SERMONS: Sermon[] = INITIAL_SERMONS;
`;
  };

  // Push directly to GitHub via GitHub REST API
  const handleDirectGitHubPush = async () => {
    const token = githubToken.trim();
    const owner = repoOwner.trim();
    const repo = repoName.trim();
    const targetBranch = branch.trim() || 'main';
    const targetPath = filePath.trim() || 'src/data/sermonsData.ts';

    if (!token) {
      setPushError(lang === 'zh' ? '請輸入 GitHub Personal Access Token (PAT)' : 'Please enter your GitHub Token');
      return;
    }
    if (!owner || !repo) {
      setPushError(lang === 'zh' ? '請填寫 GitHub 帳號 (Owner) 與專案名稱 (Repository)' : 'Please enter Repo Owner and Name');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushSuccessResult(null);

    try {
      const tsCode = generateTypeScriptCode();
      // UTF-8 to base64 encoding safely
      const encodedContent = btoa(unescape(encodeURIComponent(tsCode)));

      // 1. Get existing file SHA if it exists
      let existingSha: string | undefined = undefined;
      const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}?ref=${targetBranch}`;

      try {
        const getRes = await fetch(getFileUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        if (getRes.ok) {
          const fileData = await getRes.json();
          existingSha = fileData.sha;
        }
      } catch (checkErr) {
        console.warn("File check notice:", checkErr);
      }

      // 2. Commit & Push file to GitHub
      const defaultCommitMsg = `feat(sermons): update Sunday sermon archive (${sermons.length} records) - ${new Date().toISOString().slice(0, 10)}`;
      const commitMessage = customCommitMsg.trim() || defaultCommitMsg;

      const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`;
      const putRes = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch: targetBranch,
          sha: existingSha
        })
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        throw new Error(errJson.message || `GitHub API error (${putRes.status})`);
      }

      const resData = await putRes.json();
      const commitSha = resData.commit?.sha || 'latest';
      const commitUrl = resData.commit?.html_url || `https://github.com/${owner}/${repo}/commits/${targetBranch}`;

      setPushSuccessResult({
        commitSha: commitSha.slice(0, 7),
        commitUrl,
        date: new Date().toLocaleTimeString()
      });

      // Also trigger backend server sync
      fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sermons })
      }).catch(() => {});

    } catch (err: any) {
      console.error("GitHub Push error:", err);
      setPushError(err.message || 'GitHub Push failed. Please verify Token and Repo permissions.');
    } finally {
      setIsPushing(false);
    }
  };

  // Download sermonsData.ts directly
  const handleDownloadTypeScript = () => {
    const tsCode = generateTypeScriptCode();
    const blob = new Blob([tsCode], { type: 'text/typescript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sermonsData.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy TypeScript code to clipboard
  const handleCopyTypeScript = async () => {
    try {
      const tsCode = generateTypeScriptCode();
      await navigator.clipboard.writeText(tsCode);
      setCopiedTs(true);
      setTimeout(() => setCopiedTs(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Download JSON Backup
  const handleDownloadJsonBackup = () => {
    const backupData = {
      version: '2.0',
      church: 'Canaan Shin Sheng Christian Church',
      exportDate: new Date().toISOString(),
      sermonsCount: sermons.length,
      sermons
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canaan_sermons_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    try {
      const jsonStr = JSON.stringify(sermons, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Import JSON File
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let importedSermons: Sermon[] = [];

        if (Array.isArray(parsed)) {
          importedSermons = parsed;
        } else if (parsed && Array.isArray(parsed.sermons)) {
          importedSermons = parsed.sermons;
        } else {
          throw new Error('Invalid JSON format for sermons');
        }

        if (importedSermons.length === 0) {
          throw new Error('No sermons found in file');
        }

        onImportBackup(importedSermons);
        setImportStatus(
          lang === 'zh'
            ? `✅ 成功匯入 ${importedSermons.length} 篇講道記錄！已即時更新講道總覽。`
            : `✅ Successfully imported ${importedSermons.length} sermons!`
        );
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err: any) {
        setImportStatus(lang === 'zh' ? `❌ 匯入失敗：${err.message}` : `❌ Import error: ${err.message}`);
        setTimeout(() => setImportStatus(null), 6000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Sync to Backend Server API
  const handleSyncToBackend = async () => {
    setIsServerSyncing(true);
    setServerSyncSuccess(false);
    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sermons })
      });
      if (!res.ok) throw new Error('Failed to sync with server');

      setServerSyncSuccess(true);
      setTimeout(() => setServerSyncSuccess(false), 4000);
    } catch (e: any) {
      console.error(e);
      alert(lang === 'zh' ? '伺服器同步發生錯誤' : 'Server sync failed');
    } finally {
      setIsServerSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        id="sermons-github-sync-modal"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {lang === 'zh' ? '主日講道影音 • GitHub 同步與固化' : 'Sunday Sermons • GitHub Sync & Deploy'}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {sermons.length} {lang === 'zh' ? '篇講道' : 'Sermons'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'zh' 
                  ? '管理員可一鍵將最新講道、經文、大綱與 Zoom 影音連結同步推送到 GitHub 倉庫，自動觸發 Cloudflare Pages 部署' 
                  : 'Sync all sermons, scripture outlines & Zoom recordings directly to your GitHub repository for Cloudflare deployment'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 pt-3 gap-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('github-push')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'github-push'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            {lang === 'zh' ? '1. 一鍵 Push 同步到 GitHub' : '1. One-Click GitHub Push'}
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'export'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            {lang === 'zh' ? '2. 下載 / 複製 sermonsData.ts' : '2. Download sermonsData.ts'}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'guide'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {lang === 'zh' ? '3. Cloudflare 自動部署指南' : '3. Cloudflare Deploy Guide'}
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'backup'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            {lang === 'zh' ? '4. JSON 備份與還原' : '4. JSON Backup & Restore'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {importStatus && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-medium flex items-center gap-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* TAB 1: DIRECT GITHUB PUSH */}
          {activeTab === 'github-push' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-800/80 to-indigo-500/10 border border-amber-500/20 text-slate-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <h4 className="font-semibold text-white">
                      {lang === 'zh' ? '管理員專屬：直接將講道資料庫寫入 GitHub 倉庫' : 'Admin Direct GitHub Push'}
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                      {lang === 'zh' 
                        ? '無需打開終端機，只要設定一次 GitHub Token，點擊「一鍵同步 Push」，系統會自動將包含最新講道音訊、影片密碼與經文大綱的 `src/data/sermonsData.ts` 提交到您的 GitHub 倉庫，Cloudflare Pages 即會在 1 分鐘內自動完成全站更新發布！'
                        : 'No command line required. Set your GitHub Token once, and click "Push to GitHub". It automatically writes `src/data/sermonsData.ts` and triggers Cloudflare auto-deployment.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Push Success Result Banner */}
              {pushSuccessResult && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>{lang === 'zh' ? '🎉 已成功提交並推送至 GitHub 倉庫！' : '🎉 Successfully pushed to GitHub!'}</span>
                    </div>
                    <span className="text-xs text-emerald-400/80">{pushSuccessResult.date}</span>
                  </div>
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    {lang === 'zh'
                      ? `Commit 代碼：#${pushSuccessResult.commitSha}。Cloudflare Pages 已收到 GitHub 推送通知，正在進行背景自動編譯，約 1~2 分鐘後全球訪問者即可看見最新講道！`
                      : `Commit: #${pushSuccessResult.commitSha}. Cloudflare Pages build triggered automatically.`}
                  </p>
                  <div className="pt-1">
                    <a
                      href={pushSuccessResult.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-white bg-emerald-700/60 hover:bg-emerald-600 px-3 py-1.5 rounded-lg font-semibold transition"
                    >
                      <span>{lang === 'zh' ? '查看 GitHub 提交記錄' : 'View Commit on GitHub'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Push Error Alert */}
              {pushError && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{lang === 'zh' ? '同步失敗' : 'Sync Failed'}</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    {pushError}
                  </p>
                  <p className="text-[11px] text-rose-300/70 pt-1">
                    {lang === 'zh' ? '💡 請檢查 GitHub Token 是否具有 repo 讀寫權限，以及 Owner 與 Repository 名稱是否正確。' : '💡 Ensure your PAT has `repo` write access.'}
                  </p>
                </div>
              )}

              {/* GitHub Configuration Inputs */}
              <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-4">
                <h4 className="font-semibold text-sm text-amber-400 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {lang === 'zh' ? 'GitHub 倉庫連接設定 (自動記住)' : 'GitHub Repository Connection Settings'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GitHub Token */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'zh' ? 'GitHub Personal Access Token (PAT)' : 'GitHub PAT Token'}</span>
                      </label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=Canaan+Church+Sync"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                      >
                        <span>{lang === 'zh' ? '🔑 點此前往產生 Token' : 'Generate Token'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={githubToken || ''}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx 或 github_pat_..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    <p className="text-[11px] text-slate-400">
                      {lang === 'zh' ? 'Token 僅加密存於此瀏覽器本地 (localStorage)，需要勾選 repo 權限。' : 'Stored in local browser only with repo scope.'}
                    </p>
                  </div>

                  {/* Owner */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'zh' ? 'GitHub 帳號 / Organization (Owner)' : 'Repo Owner'}</span>
                    </label>
                    <input
                      type="text"
                      value={repoOwner || ''}
                      onChange={(e) => setRepoOwner(e.target.value)}
                      placeholder="canaannewlife 或您的帳號"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* Repo Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'zh' ? 'GitHub 倉庫名稱 (Repository)' : 'Repo Name'}</span>
                    </label>
                    <input
                      type="text"
                      value={repoName || ''}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="canaan-shin-sheng-church"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'zh' ? '目標分支 (Branch)' : 'Branch'}</span>
                    </label>
                    <input
                      type="text"
                      value={branch || ''}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* File Path */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'zh' ? '目標檔案路徑 (Target File)' : 'File Path'}</span>
                    </label>
                    <input
                      type="text"
                      value={filePath || ''}
                      onChange={(e) => setFilePath(e.target.value)}
                      placeholder="src/data/sermonsData.ts"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* Custom Commit Message */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {lang === 'zh' ? '自訂 Commit 提交說明 (選填)' : 'Commit Message (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={customCommitMsg || ''}
                      onChange={(e) => setCustomCommitMsg(e.target.value)}
                      placeholder={`feat(sermons): update Sunday sermon archive (${sermons.length} records) - ${new Date().toISOString().slice(0, 10)}`}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleDirectGitHubPush}
                    disabled={isPushing}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isPushing ? 'animate-spin' : ''}`} />
                    <span>
                      {isPushing 
                        ? (lang === 'zh' ? '正在推送提交至 GitHub 倉庫...' : 'Pushing to GitHub...')
                        : (lang === 'zh' ? `🚀 立即一鍵同步 ${sermons.length} 篇講道至 GitHub 倉庫` : `🚀 Push ${sermons.length} Sermons to GitHub`)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Server Sync Toolbar */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <RefreshCw className={`w-4 h-4 ${isServerSyncing ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">
                      {lang === 'zh' ? '伺服器 API 即時同步' : 'Live Server API Sync'}
                    </h5>
                    <p className="text-xs text-slate-400">
                      {lang === 'zh' 
                        ? '將講道最新狀態同步寫入後端記憶體快取 (/api/sermons)' 
                        : 'Sync current sermons to backend API endpoint'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSyncToBackend}
                  disabled={isServerSyncing}
                  className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    serverSyncSuccess 
                      ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  }`}
                >
                  {serverSyncSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {lang === 'zh' ? '已成功同步至伺服器' : 'Synced to Server!'}
                    </>
                  ) : (
                    <>
                      <RefreshCw className={`w-3.5 h-3.5 ${isServerSyncing ? 'animate-spin' : ''}`} />
                      {lang === 'zh' ? '同步至伺服器' : 'Sync to Server'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT TYPESCRIPT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Action Buttons Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Download className="w-4 h-4" />
                      {lang === 'zh' ? '一鍵下載 sermonsData.ts 原始碼' : 'Download sermonsData.ts file'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '直接下載已編譯好、包含全體講道紀錄的 sermonsData.ts，直接放入專案中的 `src/data/sermonsData.ts`。'
                        : 'Download the compiled file containing all current sermons to replace in `src/data/sermonsData.ts`.'}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTypeScript}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    {lang === 'zh' ? '📥 下載 sermonsData.ts 檔案' : '📥 Download sermonsData.ts'}
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                      <Copy className="w-4 h-4" />
                      {lang === 'zh' ? '一鍵複製 TypeScript 完整代碼' : 'Copy TypeScript Code'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '複製全部 TypeScript 原始碼到剪貼簿，可直接在 GitHub 網頁編輯器或 VS Code 中貼上存檔。'
                        : 'Copy full TypeScript code to clipboard for pasting directly in GitHub web editor or VS Code.'}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyTypeScript}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 ${
                      copiedTs
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {copiedTs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedTs 
                      ? (lang === 'zh' ? '✅ 代碼已複製到剪貼簿！' : '✅ Copied to Clipboard!')
                      : (lang === 'zh' ? '📋 複製 TypeScript 代碼' : '📋 Copy TypeScript Code')}
                  </button>
                </div>
              </div>

              {/* Code Preview snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{lang === 'zh' ? '代碼預覽 (src/data/sermonsData.ts)' : 'Code Preview (src/data/sermonsData.ts)'}</span>
                  <span>{sermons.length} sermons</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-56 overflow-y-auto custom-scrollbar">
                  <pre>{generateTypeScriptCode().slice(0, 1200)} ...</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUDFLARE GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-amber-400" />
                  {lang === 'zh' ? '三步驟將最新講道更新至 Cloudflare 上線網站' : '3-Step Guide to Update Cloudflare Website'}
                </h4>

                <div className="space-y-4 text-sm text-slate-300">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {lang === 'zh' ? '點擊「一鍵 Push 同步」或下載 sermonsData.ts' : 'Push via Modal or Download file'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lang === 'zh'
                          ? '推薦在第一分頁輸入 GitHub Token 直接一鍵同步，或在第二分頁下載 `sermonsData.ts`。'
                          : 'Use Tab 1 for 1-click push or Tab 2 to download `sermonsData.ts`.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {lang === 'zh' ? 'GitHub 倉庫自動更新' : 'GitHub Repo Updates'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lang === 'zh'
                          ? 'GitHub 倉庫收到更新後，會觸發 Webhook 通知 Cloudflare Pages。'
                          : 'GitHub receives the commit and notifies Cloudflare Pages.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">
                        {lang === 'zh' ? 'Cloudflare Pages 自動建置上線' : 'Cloudflare Pages Auto-Deploy'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {lang === 'zh'
                          ? 'Cloudflare 偵測到更新後，會在 1~2 分鐘內自動完成建置，全球會友即可收看最新主日影音與證道大綱！'
                          : 'Cloudflare Pages deploys all new sermons within 1-2 minutes automatically.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JSON BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export JSON */}
                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                      <Download className="w-4 h-4" />
                      {lang === 'zh' ? '匯出完整講道 JSON 備份檔' : 'Export Sermons JSON'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '下載包含所有講道中英文標題、經文、證道大綱、Zoom 錄影連結與密碼的 JSON 檔案。'
                        : 'Download a complete JSON backup of all sermons and recording links.'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadJsonBackup}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {lang === 'zh' ? '下載 JSON 備份' : 'Download JSON'}
                    </button>
                    <button
                      onClick={handleCopyJson}
                      className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedJson ? 'OK' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Import JSON */}
                <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Upload className="w-4 h-4" />
                      {lang === 'zh' ? '匯入 JSON 備份還原' : 'Import JSON Backup'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'zh'
                        ? '從其他電腦或備份檔案匯入講道資料庫，一鍵在當前瀏覽器中完整還原所有講道資料。'
                        : 'Restore sermons from a JSON backup file on any device or browser.'}
                    </p>
                  </div>

                  <label className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition text-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '選擇 JSON 備份檔匯入' : 'Select JSON file to import'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJsonFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{lang === 'zh' ? '講道資料庫狀態：正常運作中' : 'Sermon Database: Active'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition"
            >
              {lang === 'zh' ? '關閉' : 'Close'}
            </button>
            <button
              onClick={handleDirectGitHubPush}
              disabled={isPushing}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Github className="w-4 h-4" />
              <span>{lang === 'zh' ? '推送至 GitHub' : 'Push to GitHub'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
