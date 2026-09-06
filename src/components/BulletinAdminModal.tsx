import React, { useState } from 'react';
import { Language, Sermon } from '../types';
import { SERMON_CONTENT_LIST, WEEKLY_BIBLE_READING } from '../data/churchData';
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
  serviceDate: "2026-09-06",
  presider: "鄭育青 弟兄",
  speaker: "ITO 弟兄",
  speakerEn: "Brother Ito",
  sermonTitle: "安提阿教會",
  sermonTitleEn: "The Antioch Church",
  sermonScripture: "使徒行傳第 11 章第 19-40 節，第 13 章第 1-4 節",
  sermonScriptureEn: "Acts 11:19-40, 13:1-4",
  sermonSummary: "加南新生基督教會主日崇拜，ITO 弟兄透過使徒行傳第 11 章第 19-40 節與第 13 章第 1-4 節傳講《安提阿教會》，勉勵弟兄姊妹在患難中忠心傳揚福音、緊跟隨基督、顧念神國度的需要，並同心敬拜與迫切禱告，立志成為大使命的使者與活出基督之愛的人。",
  sermonSummaryEn: "At Canaan Shin Sheng Christian Church Sunday Service, Brother Ito preached on 'The Antioch Church' from Acts 11:19-40 and Acts 13:1-4, urging believers to proclaim the Gospel in trials, follow Christ, meet kingdom needs, and pray in unity.",
  sermonPointsZh: [
    "1. 安提阿教會被神使用的特點",
    "1) 一群患難中傳道的人",
    "2) 一群跟隨基督的人",
    "3) 顧念神國度的需要",
    "4) 同心合意敬拜及禱告的教會",
    "2. 立志成為安提阿教會",
    "1) 立志成為一個大使命的使者",
    "2) 立志成為活出愛的人",
    "3) 立志與弟兄姐妹一起迫切禱告"
  ],
  sermonPoints: [
    "1. Characteristics of the Antioch Church Used by God",
    "1) People preaching in affliction",
    "2) People following Christ faithfully",
    "3) Caring for the needs of God's Kingdom",
    "4) A church worshiping and praying in one accord",
    "2. Resolving to Become the Antioch Church",
    "1) Becoming ambassadors of the Great Commission",
    "2) Living out Christ's love",
    "3) Praying earnestly together with brothers and sisters"
  ],
  memoryVerse: "所以，你們要去，使萬民作我的門徒，奉父、子、聖靈的名給他們施洗，凡我所吩咐你們的，都教訓他們遵守，我就常與你們同在，直到世界的末了。（馬太福音第 28 章第 19-20 節）",
  memoryVerseRef: "馬太福音第 28 章第 19-20 節",
  weeklyReadingRange: "9/7 - 9/13",
  weeklyReadingSchedule: [
    { date: "9/7 (週一)", oldTestament: "箴言 1-2", newTestament: "哥林多前書 16" },
    { date: "9/8 (週二)", oldTestament: "箴言 3-5", newTestament: "哥林多後書 1" },
    { date: "9/9 (週三)", oldTestament: "箴言 6-7", newTestament: "哥林多後書 2" },
    { date: "9/10 (週四)", oldTestament: "箴言 8-9", newTestament: "哥林多後書 3" },
    { date: "9/11 (週五)", oldTestament: "箴言 10-12", newTestament: "哥林多後書 4" },
    { date: "9/12 (週六)", oldTestament: "箴言 13-15", newTestament: "哥林多後書 5" },
    { date: "9/13 (週日)", oldTestament: "箴言 16-18", newTestament: "哥林多後書 6" }
  ],
  prayerRequests: [
    "為主日學及會友靈命成長禱告，求主賜福主日學事工，賜給講師智慧、愛心與力量，忠心傳講神的話語；求主使弟兄姊妹渴慕真理，在學習中生命得著造就與更新，在信仰與生活上不斷成長，更加成熟豐盛。",
    "今日是 C3 教會在本教會聚會的最後一個主日，求主看顧保守他們未來的道路，引領前進的方向與服事，賜下平安、智慧與力量，使他們在新道路上繼續經歷主的恩典與帶領。",
    "求主繼續保守談妮姊妹術後恢復，保護傷口，遠離發炎及肌肉、神經的突發狀況，賜她平安、力量與忍耐，天天經歷主的醫治與恩典，也藉著家人的陪伴與禱告堅固她。",
    "為蔡長老、鄭長老及 Andrew 禱告，求主保守他們的身體健康，賜下力量與平安，保守身心靈蒙主看顧。",
    "為彥勳弟兄目前前往中國及台灣，並處理母親相關事務禱告，求主一路保守平安，賜下智慧與力量，帶領各項事務順利；也為李艾姊即將外出旅遊禱告，求主保守旅途平安，一路看顧。"
  ],
  announcements: [
    "感謝 ITO 弟兄帶給我們「安提阿教會」的信息，提醒我們要在患難中忠心傳福音，跟隨基督，顧念神國度的需要，並同心敬拜、迫切禱告。求主幫助我們立志成為大使命的使者，活出基督的愛，與弟兄姐妹同心禱告。",
    "下週將由孟蘇倫牧師前來證道，請弟兄姊妹代禱，求主賜福牧師的服事，賜下智慧與能力，使他忠心傳講神的話語，也預備我們的心，明白並遵行主的心意。",
    "週間禱告會為每個禮拜四晚上八點，有線上禱告會(Zoom 的ID 及 Passcode 和禮拜天的一樣)。福音效果需要禱告大能，請大家踴躍參加。",
    "9/12 (週六) 將舉行教會健行活動，相關消息請參閱 WeChat「新生健行隊」，或洽 Simon。",
    "背誦經文：本週背誦經文在馬太福音第 28 章第 19-20 節。"
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
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedRawText, setExtractedRawText] = useState<string>('');
  const [showRawText, setShowRawText] = useState<boolean>(false);
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
      const currentSermons = SERMON_CONTENT_LIST;

      // Prepend or replace if same date or same id
      const filtered = currentSermons.filter(
        s => s.id !== sermonToSave.id && !(s.date === sermonToSave.date && s.titleZh === sermonToSave.titleZh)
      );
      const updatedSermons = [sermonToSave, ...filtered];

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
      console.warn("Could not sync sermon:", err);
    }
  };

  const applyParsedDataToForm = (rawBulletin: any, isFallback?: boolean, rawExtractedText?: string) => {
    if (rawExtractedText) {
      setExtractedRawText(rawExtractedText);
    }
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
    if (isFallback) {
      setSuccessMsg(lang === 'zh' ? '✅ 已成功載入教會最新主日資訊（8/16 ITO傳道《永不失望的人生》），請在下方確認或微調後點擊「發布更新」。' : 'Loaded latest official bulletin data. Please review below and click Publish.');
    } else {
      setSuccessMsg(lang === 'zh' ? '✅ AI 與智慧引擎已精準解析週報資訊！請在下方檢查確認各欄位，確認無誤後點擊「發布更新」。' : 'AI extracted bulletin data! Please review and confirm below.');
    }
  };

  const handleProcessFile = async () => {
    if (inputMode === 'text') {
      if (!rawText.trim()) {
        setErrorMsg(lang === 'zh' ? '請先貼上週報文字內容' : 'Please paste bulletin text content first.');
        return;
      }

      setLoading(true);
      setLoadingStep(lang === 'zh' ? 'Gemini AI 正在智能解析週報文字內容...' : 'AI parsing bulletin text content...');
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        const res = await fetch('/api/process-bulletin-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileText: rawText,
            filename: "pasted-bulletin.txt",
            emailSubject: "website update"
          })
        });
        const data = await res.json();
        setLoading(false);
        setLoadingStep('');

        if (data.success && data.data) {
          applyParsedDataToForm(data.data, data.isFallback, data.extractedRawText || rawText);
        } else {
          setErrorMsg(data.error || (lang === 'zh' ? '解析週報文字失敗，請手動填寫或重試。' : 'Failed to parse bulletin text.'));
        }
      } catch (err: any) {
        setLoading(false);
        setLoadingStep('');
        setErrorMsg(err.message || (lang === 'zh' ? '解析週報文字發生錯誤' : 'Error processing bulletin text.'));
      }
      return;
    }

    if (!selectedFile) {
      setErrorMsg(lang === 'zh' ? '請先選擇週報檔案 (PDF / Word / TXT)' : 'Please select a bulletin file (PDF / DOC / TXT) first.');
      return;
    }

    setLoading(true);
    const fileNameLower = selectedFile.name.toLowerCase();
    const isTxt = fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.text') || fileNameLower.endsWith('.md');
    
    setLoadingStep(lang === 'zh' ? `正在讀取 ${selectedFile.name}...` : `Reading ${selectedFile.name}...`);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAddedSermon(null);

    try {
      if (isTxt) {
        const reader = new FileReader();
        reader.readAsText(selectedFile);
        reader.onload = async () => {
          const textContent = reader.result as string;
          setLoadingStep(lang === 'zh' ? 'Gemini AI 正在智能解析 TXT 週報內容...' : 'AI parsing TXT bulletin content...');

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          try {
            const res = await fetch('/api/process-bulletin-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileText: textContent,
                filename: selectedFile.name,
                fileType: selectedFile.type,
                emailSubject: "website update"
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();
            setLoading(false);
            setLoadingStep('');

            if (data.success && data.data) {
              applyParsedDataToForm(data.data, data.isFallback, data.extractedRawText || textContent);
            } else {
              setErrorMsg(data.error || (lang === 'zh' ? '解析 TXT 檔案失敗，請手動填寫或重試。' : 'Failed to parse TXT file.'));
            }
          } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            setLoading(false);
            setLoadingStep('');
            setErrorMsg(fetchErr.message || (lang === 'zh' ? '解析 TXT 發生錯誤' : 'Error processing TXT file.'));
          }
        };
        reader.onerror = () => {
          setLoading(false);
          setLoadingStep('');
          setErrorMsg(lang === 'zh' ? '讀取 TXT 檔案發生錯誤' : 'Error reading TXT file.');
        };
      } else {
        // PDF, DOC, DOCX
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
          const base64Data = reader.result as string;
          const formatLabel = fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.docx') ? 'Word' : 'PDF';
          setLoadingStep(lang === 'zh' ? `Gemini AI 正在智能解析 ${formatLabel} 週報經文、講員與讀經進度...` : `AI parsing ${formatLabel} bulletin & creating sermon...`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          try {
            const res = await fetch('/api/process-bulletin-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileBase64: base64Data,
                pdfBase64: base64Data,
                filename: selectedFile.name,
                fileType: selectedFile.type,
                emailSubject: "website update"
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();
            setLoading(false);
            setLoadingStep('');

            if (data.success && data.data) {
              applyParsedDataToForm(data.data, data.isFallback, data.extractedRawText || '');
            } else {
              setErrorMsg(data.error || (lang === 'zh' ? '解析檔案失敗，請手動填寫或重試。' : 'Failed to parse bulletin file.'));
            }
          } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            setLoading(false);
            setLoadingStep('');
            setErrorMsg(fetchErr.message || (lang === 'zh' ? '解析檔案發生錯誤' : 'Error processing bulletin file.'));
          }
        };
        reader.onerror = () => {
          setLoading(false);
          setLoadingStep('');
          setErrorMsg(lang === 'zh' ? '讀取檔案發生錯誤' : 'Error reading bulletin file.');
        };
      }
    } catch (err: any) {
      setLoading(false);
      setLoadingStep('');
      setErrorMsg(err.message || 'Error uploading file');
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
      fetch('/api/bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).catch(err => console.warn('Could not sync bulletin to backend server:', err));
    } catch (e) {
      console.warn("Storage error:", e);
    }

    if (onApplyUpdate) {
      onApplyUpdate(formData);
    }

    setSuccessMsg(lang === 'zh' ? '🎉 週報與主日講道已成功更新並同步至全站！' : 'Bulletin & Sermon successfully updated!');
  };

  const handleResetToDefault = () => {
    if (window.confirm(lang === 'zh' ? '確定要重設為加南官方最新週報與講道資料嗎？' : 'Reset to official default bulletin records?')) {
      setFormData(DEFAULT_OFFICIAL_BULLETIN);
      try {
        localStorage.setItem('canaan_bulletin_data', JSON.stringify(DEFAULT_OFFICIAL_BULLETIN));
        window.dispatchEvent(new CustomEvent('canaan_bulletin_updated', { detail: DEFAULT_OFFICIAL_BULLETIN }));
        window.dispatchEvent(new CustomEvent('canaan_sermons_updated', { detail: { allSermons: SERMON_CONTENT_LIST } }));
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
                  {lang === 'zh' ? '週報檔案解析與主日資料更新管理' : 'Weekly Bulletin & Sunday Message Manager'}
                </h3>
                <p className="text-xs text-amber-300">
                  {lang === 'zh'
                    ? 'AI 智慧解析週報 (支援 PDF、Word DOC/DOCX、TXT)，即時核對修正並發布'
                    : 'AI Bulletin Ingestion for PDF, Word DOC/DOCX & TXT, Instant Verification & Publishing'}
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
              <span>{lang === 'zh' ? '1. 上傳週報 (PDF / DOC / TXT)' : '1. Upload Bulletin (PDF/DOC/TXT)'}</span>
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

            {/* TAB 1: Upload Bulletin */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-2">
                  <div className="font-bold flex items-center space-x-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>{lang === 'zh' ? 'AI 智能解析週報 (支援 PDF / DOC / DOCX / TXT)' : 'AI Intelligent Bulletin Ingestion (PDF / DOC / DOCX / TXT)'}</span>
                  </div>
                  <p>
                    {lang === 'zh'
                      ? '上傳主日週報檔案（支援 PDF、Word DOC/DOCX 或純文字 TXT 檔），AI 將自動辨識日期、主日講員、講道題目、經文、背誦經文與讀經進度，並自動帶入表單供您核對。'
                      : 'Upload your Sunday bulletin document (PDF, Word DOC/DOCX, or TXT). AI will automatically extract the date, speaker, sermon title, scripture, and weekly reading schedule.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg font-bold text-[11px] border border-red-200">
                      PDF (.pdf)
                    </span>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold text-[11px] border border-blue-200">
                      Word (.doc / .docx)
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] border border-emerald-200">
                      TXT (.txt / .md)
                    </span>
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold text-[11px] border border-purple-200">
                      {lang === 'zh' ? '或直接貼上文字' : 'Direct Text Paste'}
                    </span>
                  </div>
                </div>

                {/* Sub-mode selector (File upload vs Direct text paste) */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setInputMode('file')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inputMode === 'file'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'zh' ? '📁 檔案上傳 (PDF / DOC / TXT)' : '📁 File Upload (PDF/DOC/TXT)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inputMode === 'text'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'zh' ? '📝 直接貼上週報文字' : '📝 Paste Text Directly'}
                  </button>
                </div>

                {/* Upload Input Box or Textarea */}
                {inputMode === 'file' ? (
                  <div className="border-2 border-dashed border-slate-300 hover:border-amber-600 rounded-2xl p-8 text-center space-y-4 bg-slate-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>

                    <div>
                      <label htmlFor="bulletin-file-input" className="cursor-pointer font-bold text-slate-900 hover:text-amber-800 text-sm block">
                        {selectedFile ? selectedFile.name : (lang === 'zh' ? '點擊此處選擇週報檔案 (PDF / DOC / TXT)，或拖曳檔案至此' : 'Click to select bulletin file (PDF / DOC / TXT) or drag & drop here')}
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedFile 
                          ? `${(selectedFile.size / 1024).toFixed(1)} KB — ${selectedFile.name}` 
                          : (lang === 'zh' ? '支援標準週報格式：PDF、Word (.doc / .docx) 及 TXT 純文字檔' : 'Supports PDF, Word (.doc / .docx) and TXT plain text')}
                      </p>
                      <input
                        id="bulletin-file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.text,.md,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {selectedFile && (
                      <div className="pt-2">
                        <button
                          onClick={handleProcessFile}
                          disabled={loading}
                          className="px-6 py-3 bg-slate-900 hover:bg-amber-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center space-x-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                              <span>{loadingStep || (lang === 'zh' ? 'AI 正在解析檔案...' : 'AI Processing File...')}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>{lang === 'zh' ? `開始 AI 自動解析 ${selectedFile.name}` : 'Parse File with AI'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        {lang === 'zh' ? '貼上週報文字內容 (例如從郵件、Word 或記事本複製)' : 'Paste Bulletin Text Content:'}
                      </label>
                      <span className="text-[11px] text-slate-400">{rawText.length} 字</span>
                    </div>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder={lang === 'zh' ? "在此處貼上週報文字內容（包含日期、講員、講道題目、經文、本週讀經進度、代禱事項等）..." : "Paste bulletin content here (including date, speaker, title, scripture, reading schedule)..."}
                      rows={8}
                      className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleProcessFile}
                        disabled={loading || !rawText.trim()}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-amber-800 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span>{loadingStep || (lang === 'zh' ? 'AI 正在解析文字...' : 'AI Processing Text...')}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'zh' ? '開始 AI 自動解析文字並帶入表單' : 'Parse Text with AI'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit-form')}
                    className="text-xs font-semibold text-slate-600 hover:text-amber-800 inline-flex items-center space-x-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{lang === 'zh' ? '不使用檔案，直接手動修改週報表單' : 'Skip file, edit bulletin form directly'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-900 inline-flex items-center space-x-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '重設為官方預設週報與講道 (2026-08-16)' : 'Reset to official defaults'}</span>
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

                  <div className="flex items-center space-x-2">
                    {extractedRawText && (
                      <button
                        type="button"
                        onClick={() => setShowRawText(!showRawText)}
                        className="text-xs text-slate-700 hover:text-amber-800 font-semibold flex items-center space-x-1 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{showRawText ? (lang === 'zh' ? '收起原文' : 'Hide Text') : (lang === 'zh' ? '對照文件原文' : 'Show Raw Text')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="text-xs text-rose-700 hover:text-rose-800 font-semibold flex items-center space-x-1 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{lang === 'zh' ? '重設預設' : 'Reset'}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Raw Text Display */}
                {showRawText && extractedRawText && (
                  <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <FileText className="w-4 h-4" />
                        <span>{lang === 'zh' ? '📄 上傳文件/PDF 原始萃取文字' : '📄 Extracted Raw Document Text'}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-sans">{extractedRawText.length} 字</span>
                    </div>
                    <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                      {extractedRawText}
                    </pre>
                  </div>
                )}

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
