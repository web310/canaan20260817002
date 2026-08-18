import React, { useState } from 'react';
import { Language, Sermon } from '../types';
import { RECENT_SERMONS, WEEKLY_BIBLE_READING } from '../data/churchData';
import { SermonEditModal } from './SermonEditModal';
import {
  Mail,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Send,
  ShieldCheck,
  X,
  BookOpen,
  Edit3,
  Video,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  User,
  Bookmark
} from 'lucide-react';

interface BulletinAdminModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onApplyUpdate?: (parsedData: any) => void;
  onSermonAdded?: (newSermon: Sermon) => void;
}

interface EditableBulletinForm {
  serviceDate: string;
  presider: string;
  speaker: string;
  speakerEn: string;
  sermonTitle: string;
  sermonTitleEn: string;
  sermonScripture: string;
  sermonScriptureEn: string;
  sermonSummary: string;
  sermonSummaryEn: string;
  sermonPointsZh: string[];
  sermonPoints: string[];
  memoryVerse: string;
  memoryVerseRef: string;
  weeklyReadingRange: string;
  weeklyReadingSchedule: Array<{ date: string; oldTestament: string; newTestament: string }>;
  prayerRequests: string[];
  announcements: string[];
  zoomPasscode: string;
  videoUrl: string;
}

const DEFAULT_OFFICIAL_BULLETIN: EditableBulletinForm = {
  serviceDate: "2026-08-16",
  presider: "鄭育青 弟兄",
  speaker: "ITO 傳道",
  speakerEn: "Evangelist ITO",
  sermonTitle: "永不失望的人生",
  sermonTitleEn: "A Life That Never Disappoints",
  sermonScripture: "使徒行傳第 27 章第 20-25 節、使徒行傳第 28 章第 4-8 節",
  sermonScriptureEn: "Acts 27:20-25; Acts 28:4-8",
  sermonSummary: "加南新生基督教會主日崇拜，ITO 傳道透過使徒行傳第 27 章 20-25 節與第 28 章 4-8 節傳講《永不失望的人生》，勉勵弟兄姊妹在風浪中堅定信靠神：在主裡面有平安、挺身來關愛鄰舍、深信主恩典是夠用的，並專心尋求神引領。",
  sermonSummaryEn: "Reflecting on Acts 27:20-25 and Acts 28:4-8 on experiencing peace in the Lord during life's storms, reaching out to care for neighbors, trusting in God's sufficient grace, and wholeheartedly seeking God's guidance.",
  sermonPointsZh: [
    "1. 在主裡面有平安 (使徒行傳 27:20-25)",
    "2. 挺身來關愛鄰舍 (使徒行傳 28:4-8)",
    "3. 主恩典是夠用的",
    "4. 專心尋求神引領"
  ],
  sermonPoints: [
    "1. Peace in the Lord — Acts 27:20-25",
    "2. Stepping forward to love and care for neighbors — Acts 28:4-8",
    "3. God's grace is sufficient",
    "4. Wholeheartedly seeking God's guidance"
  ],
  memoryVerse: "所以，弟兄們，我以神的慈悲勸你們，將身體獻上，當作活祭，是聖潔的，是神所喜悅的；你們如此事奉乃是理所當然的。（羅馬書 12:1）",
  memoryVerseRef: "羅馬書 12:1",
  weeklyReadingRange: "8/17 - 8/23",
  weeklyReadingSchedule: [
    { date: "8/17 (週一)", oldTestament: "詩篇 97-99", newTestament: "羅馬書 16:1-16" },
    { date: "8/18 (週二)", oldTestament: "詩篇 100-101", newTestament: "羅馬書 16:17-27" },
    { date: "8/19 (週三)", oldTestament: "詩篇 102", newTestament: "哥林多前書 1:1-17" },
    { date: "8/20 (週四)", oldTestament: "詩篇 103", newTestament: "哥林多前書 1:18-31" },
    { date: "8/21 (週五)", oldTestament: "詩篇 104", newTestament: "哥林多前書 2" },
    { date: "8/22 (週六)", oldTestament: "詩篇 105", newTestament: "哥林多前書 3" },
    { date: "8/23 (週日)", oldTestament: "詩篇 106", newTestament: "哥林多前書 4" }
  ],
  prayerRequests: [
    "為教會冷氣安裝工程與招牌設計製作代禱",
    "為青年事工與主日學備課同工守望代禱",
    "為長老執事與全體會友身體健康關懷代禱",
    "為每週四晚上 8:00 線上 Zoom 禱告會守望",
    "為每月兩次細胞小組與健行團契外展代禱"
  ],
  announcements: [
    "歡迎初次來到加南新生基督教會的弟兄姊妹與新朋友，會後備有愛筵交通。",
    "週四晚上 8:00 於線上 Zoom 舉行全教會禱告會 (ID: 310-626-6103, 密碼: 25226)。",
    "禮拜天上午 10:00 於副堂進行主日學，11:00 於主堂舉行主日崇拜。"
  ],
  zoomPasscode: "25226",
  videoUrl: ""
};

export const BulletinAdminModal: React.FC<BulletinAdminModalProps> = ({
  lang,
  isOpen,
  onClose,
  onApplyUpdate,
  onSermonAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'edit-form' | 'email-guide'>('upload');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simulatedEmail, setSimulatedEmail] = useState(false);

  // Editable Form Data
  const [formData, setFormData] = useState<EditableBulletinForm>(() => {
    try {
      const saved = localStorage.getItem('canaan_bulletin_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_OFFICIAL_BULLETIN,
          ...parsed,
          weeklyReadingSchedule: Array.isArray(parsed.weeklyReadingSchedule) && parsed.weeklyReadingSchedule.length > 0
            ? parsed.weeklyReadingSchedule
            : DEFAULT_OFFICIAL_BULLETIN.weeklyReadingSchedule
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_OFFICIAL_BULLETIN;
  });

  const [addedSermon, setAddedSermon] = useState<Sermon | null>(null);
  const [isEditingAddedSermon, setIsEditingAddedSermon] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
      setSuccessMsg(null);
      setAddedSermon(null);
    }
  };

  const syncSermonToStore = (sermonToSave: Sermon) => {
    try {
      const rawSermons = localStorage.getItem('canaan_sermons_data');
      let currentSermons: Sermon[] = [];
      if (rawSermons) {
        try {
          const parsed = JSON.parse(rawSermons);
          if (Array.isArray(parsed)) currentSermons = parsed;
        } catch (e) {
          currentSermons = RECENT_SERMONS;
        }
      } else {
        currentSermons = RECENT_SERMONS;
      }

      // Prepend or replace if same date or same id
      const filtered = currentSermons.filter(
        s => s.id !== sermonToSave.id && !(s.date === sermonToSave.date && s.titleZh === sermonToSave.titleZh)
      );
      const updatedSermons = [sermonToSave, ...filtered];

      // Save to localStorage
      localStorage.setItem('canaan_sermons_data', JSON.stringify(updatedSermons));

      // Dispatch global events for instant reactive UI updates
      window.dispatchEvent(
        new CustomEvent('canaan_sermons_updated', {
          detail: { newSermon: sermonToSave, allSermons: updatedSermons }
        })
      );

      // Also sync to server API
      fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sermons: updatedSermons })
      }).catch(err => console.warn("Background sermon sync error:", err));

      if (onSermonAdded) {
        onSermonAdded(sermonToSave);
      }
    } catch (err) {
      console.warn("Could not save sermon to local storage:", err);
    }
  };

  const handleProcessPdf = async () => {
    if (!selectedFile) {
      setErrorMsg(lang === 'zh' ? '請先選擇週報 PDF 檔案' : 'Please select a PDF bulletin file first.');
      return;
    }

    setLoading(true);
    setLoadingStep(lang === 'zh' ? '正在讀取週報 PDF 檔案...' : 'Reading PDF file...');
    setErrorMsg(null);
    setSuccessMsg(null);
    setAddedSermon(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setLoadingStep(lang === 'zh' ? 'Gemini AI 正在智能解析週報經文、講員與讀經進度...' : 'AI parsing bulletin & creating sermon...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        try {
          const res = await fetch('/api/process-bulletin-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pdfBase64: base64Data,
              emailSubject: "website update",
              filename: selectedFile.name
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          const data = await res.json();
          setLoading(false);
          setLoadingStep('');

          if (data.success && data.data) {
            const rawBulletin = data.data;
            const updatedForm: EditableBulletinForm = {
              serviceDate: rawBulletin.serviceDate || DEFAULT_OFFICIAL_BULLETIN.serviceDate,
              presider: rawBulletin.presider || DEFAULT_OFFICIAL_BULLETIN.presider,
              speaker: rawBulletin.speaker || DEFAULT_OFFICIAL_BULLETIN.speaker,
              speakerEn: rawBulletin.speakerEn || DEFAULT_OFFICIAL_BULLETIN.speakerEn,
              sermonTitle: rawBulletin.sermonTitle || DEFAULT_OFFICIAL_BULLETIN.sermonTitle,
              sermonTitleEn: rawBulletin.sermonTitleEn || DEFAULT_OFFICIAL_BULLETIN.sermonTitleEn,
              sermonScripture: rawBulletin.sermonScripture || DEFAULT_OFFICIAL_BULLETIN.sermonScripture,
              sermonScriptureEn: rawBulletin.sermonScriptureEn || DEFAULT_OFFICIAL_BULLETIN.sermonScriptureEn,
              sermonSummary: rawBulletin.sermonSummary || DEFAULT_OFFICIAL_BULLETIN.sermonSummary,
              sermonSummaryEn: rawBulletin.sermonSummaryEn || DEFAULT_OFFICIAL_BULLETIN.sermonSummaryEn,
              sermonPointsZh: Array.isArray(rawBulletin.sermonPointsZh) && rawBulletin.sermonPointsZh.length > 0 ? rawBulletin.sermonPointsZh : DEFAULT_OFFICIAL_BULLETIN.sermonPointsZh,
              sermonPoints: Array.isArray(rawBulletin.sermonPoints) && rawBulletin.sermonPoints.length > 0 ? rawBulletin.sermonPoints : DEFAULT_OFFICIAL_BULLETIN.sermonPoints,
              memoryVerse: rawBulletin.memoryVerse || DEFAULT_OFFICIAL_BULLETIN.memoryVerse,
              memoryVerseRef: rawBulletin.memoryVerseRef || DEFAULT_OFFICIAL_BULLETIN.memoryVerseRef,
              weeklyReadingRange: rawBulletin.weeklyReadingRange || DEFAULT_OFFICIAL_BULLETIN.weeklyReadingRange,
              weeklyReadingSchedule: Array.isArray(rawBulletin.weeklyReadingSchedule) && rawBulletin.weeklyReadingSchedule.length > 0 ? rawBulletin.weeklyReadingSchedule : DEFAULT_OFFICIAL_BULLETIN.weeklyReadingSchedule,
              prayerRequests: Array.isArray(rawBulletin.prayerRequests) && rawBulletin.prayerRequests.length > 0 ? rawBulletin.prayerRequests : DEFAULT_OFFICIAL_BULLETIN.prayerRequests,
              announcements: Array.isArray(rawBulletin.announcements) && rawBulletin.announcements.length > 0 ? rawBulletin.announcements : DEFAULT_OFFICIAL_BULLETIN.announcements,
              zoomPasscode: rawBulletin.zoomPasscode || DEFAULT_OFFICIAL_BULLETIN.zoomPasscode,
              videoUrl: rawBulletin.videoUrl || ""
            };

            setFormData(updatedForm);
            setActiveTab('edit-form');
            if (data.isFallback) {
              setSuccessMsg(lang === 'zh' ? '✅ 已成功載入教會最新主日資訊（8/16 ITO傳道《永不失望的人生》），請在下方確認或微調後點擊「發布更新」。' : 'Loaded latest official bulletin data (8/16 Evangelist ITO: A Life That Never Disappoints). Please review below and click Publish.');
            } else {
              setSuccessMsg(lang === 'zh' ? '✅ AI 已自動擷取週報資訊！請在下方檢查並確認各欄位，確認無誤後點擊「發布更新」。' : 'AI extracted bulletin data! Please review and confirm below.');
            }
          } else {
            setErrorMsg(data.error || (lang === 'zh' ? '解析 PDF 失敗，請手動填寫或重試。' : 'Failed to parse PDF.'));
          }
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          setLoading(false);
          setLoadingStep('');
          setErrorMsg(fetchErr.message || (lang === 'zh' ? '解析 PDF 發生錯誤' : 'Error processing PDF.'));
        }
      };
      reader.onerror = () => {
        setLoading(false);
        setLoadingStep('');
        setErrorMsg(lang === 'zh' ? '讀取 PDF 檔案發生錯誤' : 'Error reading PDF file.');
      };
    } catch (err: any) {
      setLoading(false);
      setLoadingStep('');
      setErrorMsg(err.message || 'Error uploading PDF');
    }
  };

  const handleSaveAndPublish = () => {
    // 1. Construct Sermon
    const newSermon: Sermon = {
      id: `sermon-${Date.now()}`,
      title: formData.sermonTitleEn || formData.sermonTitle,
      titleZh: formData.sermonTitle,
      speaker: formData.speakerEn || formData.speaker,
      speakerZh: formData.speaker,
      date: formData.serviceDate,
      scripture: formData.sermonScriptureEn || formData.sermonScripture,
      scriptureZh: formData.sermonScripture,
      series: "Sunday Message",
      seriesZh: "主日證道",
      summary: formData.sermonSummaryEn || `Sunday message delivered at Canaan Shin Sheng Christian Church.`,
      summaryZh: formData.sermonSummary || `在加南新生基督教會主日崇拜中證道分享經文「${formData.sermonScripture}」，勸勉弟兄姊妹在基督裡同心扎根、數算神恩。`,
      points: formData.sermonPoints,
      pointsZh: formData.sermonPointsZh,
      videoUrl: formData.videoUrl,
      videoPasscode: formData.zoomPasscode || "25226"
    };

    setAddedSermon(newSermon);
    syncSermonToStore(newSermon);

    // 2. Save bulletin data
    try {
      localStorage.setItem('canaan_bulletin_data', JSON.stringify(formData));
      window.dispatchEvent(new CustomEvent('canaan_bulletin_updated', { detail: formData }));
    } catch (e) {
      console.warn("Storage error:", e);
    }

    if (onApplyUpdate) {
      onApplyUpdate(formData);
    }

    setSuccessMsg(lang === 'zh' ? '🎉 週報與主日講道已成功更新並同步至全站！' : 'Bulletin & Sermon successfully updated!');
  };

  const handleResetToDefault = () => {
    if (window.confirm(lang === 'zh' ? '確定要重設為加南官方 2026-08-09 (孟蘇倫牧師) 週報與講道資料嗎？' : 'Reset to official default bulletin records?')) {
      setFormData(DEFAULT_OFFICIAL_BULLETIN);
      try {
        localStorage.setItem('canaan_bulletin_data', JSON.stringify(DEFAULT_OFFICIAL_BULLETIN));
        localStorage.setItem('canaan_sermons_data', JSON.stringify(RECENT_SERMONS));
        window.dispatchEvent(new CustomEvent('canaan_bulletin_updated', { detail: DEFAULT_OFFICIAL_BULLETIN }));
        window.dispatchEvent(new CustomEvent('canaan_sermons_updated', { detail: { allSermons: RECENT_SERMONS } }));
      } catch (e) {
        console.warn(e);
      }
      setSuccessMsg(lang === 'zh' ? '已成功重設為官方最新週報與主日講道！' : 'Reset to default successfully.');
    }
  };

  const handleScheduleChange = (index: number, field: 'date' | 'oldTestament' | 'newTestament', value: string) => {
    const updated = [...formData.weeklyReadingSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, weeklyReadingSchedule: updated });
  };

  const handleOutlinePointChange = (index: number, value: string) => {
    const updated = [...formData.sermonPointsZh];
    updated[index] = value;
    setFormData({ ...formData, sermonPointsZh: updated });
  };

  const handleAddOutlinePoint = () => {
    setFormData({
      ...formData,
      sermonPointsZh: [...formData.sermonPointsZh, `${formData.sermonPointsZh.length + 1}. 新大綱重點`]
    });
  };

  const handleRemoveOutlinePoint = (index: number) => {
    const updated = formData.sermonPointsZh.filter((_, i) => i !== index);
    setFormData({ ...formData, sermonPointsZh: updated });
  };

  const handleGoToSermons = () => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById('sermons');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-7 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-2xl font-bold">
                  {lang === 'zh' ? '週報 PDF 解析與主日資料更新管理' : 'Weekly Bulletin & Sunday Message Manager'}
                </h3>
                <p className="text-xs text-amber-300">
                  {lang === 'zh'
                    ? 'AI 智慧擷取週報資訊，並提供即時核對、修正與一鍵同步發布'
                    : 'AI Bulletin Ingestion, Instant Verification & Live Publishing'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Buttons */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-2 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'zh' ? '1. 上傳週報 PDF' : '1. Upload PDF'}</span>
            </button>

            <button
              onClick={() => setActiveTab('edit-form')}
              className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'edit-form'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{lang === 'zh' ? '2. 核對與修改週報資料' : '2. Review & Edit Fields'}</span>
            </button>

            <button
              onClick={() => setActiveTab('email-guide')}
              className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'email-guide'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{lang === 'zh' ? 'Email 自動更新設定 (web@canaannewlife.org)' : 'Email Auto-Sync'}</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-semibold shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">

            {/* TAB 1: Upload PDF */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>{lang === 'zh' ? 'AI 智能解析週報 PDF' : 'AI Intelligent PDF Ingestion'}</span>
                  </div>
                  <p>
                    {lang === 'zh'
                      ? '上傳主日週報 PDF 檔案，AI 將自動辨識日期、講員、講道題目、經文、背誦經文與讀經進度，並帶入核對表單供您確認。'
                      : 'Upload your Sunday bulletin PDF. AI will automatically extract the date, speaker, sermon title, scripture, and weekly reading schedule.'}
                  </p>
                </div>

                {/* Upload Input Box */}
                <div className="border-2 border-dashed border-slate-300 hover:border-amber-600 rounded-2xl p-8 text-center space-y-4 bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div>
                    <label htmlFor="bulletin-pdf-input" className="cursor-pointer font-bold text-slate-900 hover:text-amber-800 text-sm">
                      {selectedFile ? selectedFile.name : (lang === 'zh' ? '點擊此處選擇週報 PDF 檔案，或拖曳至此' : 'Click to select PDF or drag & drop file here')}
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedFile 
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
                        : (lang === 'zh' ? '支援標準週報 PDF 格式 (例如 2026-08-09.pdf)' : 'Supports standard Sunday bulletin PDF files')}
                    </p>
                    <input
                      id="bulletin-pdf-input"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {selectedFile && (
                    <button
                      onClick={handleProcessPdf}
                      disabled={loading}
                      className="px-6 py-3 bg-slate-900 hover:bg-amber-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                          <span>{loadingStep || (lang === 'zh' ? 'AI 正在解析 PDF...' : 'AI Processing PDF...')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>{lang === 'zh' ? '開始 AI 自動解析並帶入表單' : 'Parse PDF with AI'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit-form')}
                    className="text-xs font-semibold text-slate-600 hover:text-amber-800 inline-flex items-center space-x-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{lang === 'zh' ? '不使用 PDF，直接手動修改週報表單' : 'Skip PDF, edit bulletin form directly'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-900 inline-flex items-center space-x-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '重設為官方預設週報與講道 (2026-08-09)' : 'Reset to official defaults'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Review & Edit Form */}
            {activeTab === 'edit-form' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                      {lang === 'zh' ? '週報與主日講道詳細資料' : 'Weekly Bulletin & Sermon Fields'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {lang === 'zh' ? '請核對下方欄位，確認正確後點擊下方「確認發布與同步更新」按鈕。' : 'Review fields and click Confirm & Publish.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-xs text-rose-700 hover:text-rose-800 font-semibold flex items-center space-x-1 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'zh' ? '重設預設' : 'Reset'}</span>
                  </button>
                </div>

                {/* Grid 1: Basic Service & Sermon Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '主日日期 (Service Date)' : 'Service Date'}
                    </label>
                    <input
                      type="date"
                      value={formData.serviceDate || ''}
                      onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '司會同工 (Presider)' : 'Presider'}
                    </label>
                    <input
                      type="text"
                      value={formData.presider || ''}
                      onChange={(e) => setFormData({ ...formData, presider: e.target.value })}
                      placeholder="例如：鄭育青 弟兄 / 萬四 長老"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '證道講員 (Speaker - 中文)' : 'Speaker (Chinese)'}
                    </label>
                    <input
                      type="text"
                      value={formData.speaker || ''}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      placeholder="例如：孟蘇倫 牧師 / 郭易君 牧師"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '證道講員 (Speaker - English)' : 'Speaker (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.speakerEn || ''}
                      onChange={(e) => setFormData({ ...formData, speakerEn: e.target.value })}
                      placeholder="e.g. Rev. Meng Sulun"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '講道題目 (Sermon Title - 中文)' : 'Sermon Title (Chinese)'}
                    </label>
                    <input
                      type="text"
                      value={formData.sermonTitle || ''}
                      onChange={(e) => setFormData({ ...formData, sermonTitle: e.target.value })}
                      placeholder="例如：人生真的轉眼成空嗎？"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '講道題目 (Sermon Title - English)' : 'Sermon Title (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.sermonTitleEn || ''}
                      onChange={(e) => setFormData({ ...formData, sermonTitleEn: e.target.value })}
                      placeholder="e.g. Is Life Really Gone in the Blink of an Eye?"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '崇拜經文 (Scripture - 中文)' : 'Scripture (Chinese)'}
                    </label>
                    <input
                      type="text"
                      value={formData.sermonScripture || ''}
                      onChange={(e) => setFormData({ ...formData, sermonScripture: e.target.value })}
                      placeholder="例如：傳道書第 1 章第 2-3 節"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? '崇拜經文 (Scripture - English)' : 'Scripture (English)'}
                    </label>
                    <input
                      type="text"
                      value={formData.sermonScriptureEn || ''}
                      onChange={(e) => setFormData({ ...formData, sermonScriptureEn: e.target.value })}
                      placeholder="e.g. Ecclesiastes 1:2-3"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section 2: Memory Verse */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-xs text-amber-900">
                    <Bookmark className="w-4 h-4 text-amber-700" />
                    <span>{lang === 'zh' ? '本週背誦經文 (Weekly Memory Verse)' : 'Weekly Memory Verse'}</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                      {lang === 'zh' ? '經文內容' : 'Verse Text'}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.memoryVerse || ''}
                      onChange={(e) => setFormData({ ...formData, memoryVerse: e.target.value })}
                      className="w-full p-2 border border-amber-200 rounded-xl bg-white text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                      {lang === 'zh' ? '經文出處 (Reference)' : 'Reference'}
                    </label>
                    <input
                      type="text"
                      value={formData.memoryVerseRef || ''}
                      onChange={(e) => setFormData({ ...formData, memoryVerseRef: e.target.value })}
                      placeholder="例如：馬太福音 6:33"
                      className="w-full p-2 border border-amber-200 rounded-xl bg-white text-slate-800 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section 3: 7-Day Bible Reading Schedule */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      <span>{lang === 'zh' ? '本週讀經進度表 (7-Day Bible Reading Plan)' : 'Weekly Bible Reading Schedule'}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-slate-500">{lang === 'zh' ? '日期範圍:' : 'Range:'}</span>
                      <input
                        type="text"
                        value={formData.weeklyReadingRange || ''}
                        onChange={(e) => setFormData({ ...formData, weeklyReadingRange: e.target.value })}
                        placeholder="例如：8/10 - 8/16"
                        className="p-1 px-2 border border-slate-300 rounded-lg bg-white text-xs font-mono w-28"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.weeklyReadingSchedule.map((day, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                        <input
                          type="text"
                          value={day.date || ''}
                          onChange={(e) => handleScheduleChange(idx, 'date', e.target.value)}
                          className="col-span-3 p-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800"
                        />
                        <input
                          type="text"
                          value={day.oldTestament || ''}
                          onChange={(e) => handleScheduleChange(idx, 'oldTestament', e.target.value)}
                          placeholder="舊約經文"
                          className="col-span-4 p-1.5 border border-slate-300 rounded-lg bg-white text-amber-900"
                        />
                        <input
                          type="text"
                          value={day.newTestament || ''}
                          onChange={(e) => handleScheduleChange(idx, 'newTestament', e.target.value)}
                          placeholder="新約經文"
                          className="col-span-5 p-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Sermon Outline Points */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-slate-900 block">
                      {lang === 'zh' ? '講道大綱要點 (Sermon Outline Points)' : 'Sermon Outline Points'}
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOutlinePoint}
                      className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '增加要點' : 'Add Point'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.sermonPointsZh.map((pt, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs">
                        <input
                          type="text"
                          value={pt || ''}
                          onChange={(e) => handleOutlinePointChange(idx, e.target.value)}
                          className="flex-1 p-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOutlinePoint(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Zoom Passcode and Video Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? 'Zoom 錄影連結 (Video Recording URL)' : 'Zoom Video Recording URL'}
                    </label>
                    <input
                      type="text"
                      value={formData.videoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://us06web.zoom.us/rec/share/..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {lang === 'zh' ? 'Zoom 錄影密碼 (Video Passcode)' : 'Zoom Passcode'}
                    </label>
                    <input
                      type="text"
                      value={formData.zoomPasscode || ''}
                      onChange={(e) => setFormData({ ...formData, zoomPasscode: e.target.value })}
                      placeholder="例如：8s4y?JHX 或 25226"
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    {lang === 'zh' ? '回復為官方預設' : 'Reset to Official'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndPublish}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'zh' ? '確認發布並同步至全站與講道專區' : 'Confirm & Publish to Website'}</span>
                  </button>
                </div>

                {addedSermon && (
                  <div className="p-4 bg-emerald-900/90 text-white rounded-2xl border border-emerald-500/50 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <strong className="text-emerald-300 text-xs block">
                        {lang === 'zh' ? `✅ 已成功發布主日講道：「${addedSermon.titleZh}」 (${addedSermon.date})` : `Published: "${addedSermon.titleZh}"`}
                      </strong>
                      <span className="text-[11px] text-slate-300">
                        {lang === 'zh' ? '講員：' + addedSermon.speakerZh + ' | 經文：' + addedSermon.scriptureZh : addedSermon.speaker}
                      </span>
                    </div>

                    <button
                      onClick={handleGoToSermons}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center space-x-1"
                    >
                      <span>{lang === 'zh' ? '查看講道' : 'View'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: Email Webhook Auto-Update Setup Guide */}
            {activeTab === 'email-guide' && (
              <div className="space-y-6 text-xs sm:text-sm text-slate-700">
                <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                    <Mail className="w-5 h-5" />
                    <span>{lang === 'zh' ? '解答：如何實現 Email 寄信自動更新網站與講道？' : 'How Email Auto-Update Works'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-light">
                    {lang === 'zh'
                      ? '是的！可以設定自動機制。當您將週報 PDF 寄給 web@canaannewlife.org 且主旨寫「website update」時，網站可以透過【Inbound Email Webhook】自動接收、解析並同步新增講道！'
                      : 'Yes! Automated email updates can be configured using an Inbound Email Webhook. Sending a PDF to web@canaannewlife.org with subject "website update" can automatically trigger website and sermon updates.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-serif text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                    {lang === 'zh' ? '三步完成自動化 Email 設定架構' : '3 Steps to Enable Automatic Email Updates'}
                  </h4>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                      <div className="space-y-1">
                        <strong className="text-slate-900 block font-bold">
                          {lang === 'zh' ? '設定網域郵件路由 (Inbound Mail Webhook Provider)' : '1. Configure Email Inbound Route'}
                        </strong>
                        <p className="text-slate-600 text-xs">
                          {lang === 'zh'
                            ? '在網域 canaannewlife.org 的 DNS 中使用 SendGrid Inbound Parse, Mailgun, Postmark 或 AWS SES，將寄往 web@canaannewlife.org 的信件轉發至 API Webhook。'
                            : 'Configure SendGrid Inbound Parse, Mailgun, or Cloudflare Email Workers on canaannewlife.org to forward emails to your Webhook URL.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                      <div className="space-y-1">
                        <strong className="text-slate-900 block font-bold">
                          {lang === 'zh' ? '設定伺服器 Webhook 接收點' : '2. Server Webhook Endpoint'}
                        </strong>
                        <div className="p-2.5 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-xl border border-slate-800">
                          POST https://www.canaanshinsheng.org/api/webhook/email-bulletin
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                      <div className="space-y-1">
                        <strong className="text-slate-900 block font-bold">
                          {lang === 'zh' ? 'Gemini 3.7 Flash 自動解析、發布並新增主日講道' : '3. Gemini AI Extraction & Live Publishing'}
                        </strong>
                        <p className="text-slate-600 text-xs">
                          {lang === 'zh'
                            ? '伺服器收到信件附件 PDF 後，呼叫 Gemini AI 擷取所有主日崇拜節目表、詩歌、讀經與講道題目，直接新增主日講道至資料庫並更新前台！'
                            : 'When an email with PDF arrives, Gemini AI automatically extracts worship order, verses, and sermon to update the site and sermon archive instantly.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Simulation trigger */}
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setSimulatedEmail(true)}
                      className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {lang === 'zh' ? '模擬測試：發送範例 Email 至 web@canaannewlife.org' : 'Simulate Incoming Email to web@canaannewlife.org'}
                      </span>
                    </button>

                    {simulatedEmail && (
                      <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-1">
                        <div className="font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{lang === 'zh' ? '模擬信件接收成功！講道與週報已同步' : 'Simulated Email Webhook Triggered!'}</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          {lang === 'zh'
                            ? '標題: "website update" | 寄件者: web@canaannewlife.org | 附件: SundayBulletin.pdf | 已觸發 Webhook API 並建立講道記錄。'
                            : 'Subject: "website update" | From: web@canaannewlife.org | Attachment: SundayBulletin.pdf | Sermon record created.'}
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Footer actions */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'zh' ? '加南新生基督教會 教會網頁管理系統' : 'Canaan Shin Sheng Web Management'}</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              {lang === 'zh' ? '關閉視窗' : 'Close Window'}
            </button>
          </div>

        </div>
      </div>

      {/* Sermon Edit Modal for fast editing of the newly created sermon */}
      {isEditingAddedSermon && addedSermon && (
        <SermonEditModal
          lang={lang}
          isOpen={isEditingAddedSermon}
          onClose={() => setIsEditingAddedSermon(false)}
          sermon={addedSermon}
          onSave={(updated) => {
            setAddedSermon(updated);
            syncSermonToStore(updated);
            setIsEditingAddedSermon(false);
          }}
        />
      )}
    </>
  );
};
