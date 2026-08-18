import React, { useState, useEffect } from 'react';
import { Language, Sermon } from '../types';
import {
  X,
  BookOpen,
  Calendar,
  User,
  Video,
  Lock,
  Volume2,
  FileText,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Check,
  Tag,
  AlertCircle
} from 'lucide-react';

interface SermonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: Sermon | null; // null means adding a new sermon
  lang: Language;
  onSaveSermon: (sermon: Sermon) => void;
  onDeleteSermon?: (sermonId: string) => void;
}

const COMMON_SPEAKERS = [
  { zh: "陳嘉彰 牧師", en: "Rev. Jiachang Chen" },
  { zh: "孟蘇倫 牧師", en: "Rev. Meng Sulun" },
  { zh: "郭易君 牧師", en: "Rev. Yijun Guo" },
  { zh: "Ito 傳道", en: "Evangelist Ito" },
  { zh: "李紹信 弟兄", en: "Brother Shaoxin Li" },
];

const COMMON_SERIES = [
  { zh: "主日證道", en: "Sunday Message" },
  { zh: "主日崇拜", en: "Sunday Worship" },
  { zh: "下主日證道預告", en: "Upcoming Sunday Message" },
  { zh: "主日學真理講座", en: "Sunday School Seminar" },
  { zh: "培靈與特會證道", en: "Spiritual Renewal Message" }
];

export const SermonEditModal: React.FC<SermonEditModalProps> = ({
  isOpen,
  onClose,
  sermon,
  lang,
  onSaveSermon,
  onDeleteSermon
}) => {
  // Always initialize hooks unconditionally
  const [formData, setFormData] = useState<Sermon>({
    id: sermon?.id || `sermon-${Date.now()}`,
    title: sermon?.title || '',
    titleZh: sermon?.titleZh || '',
    speaker: sermon?.speaker || 'Rev. Jiachang Chen',
    speakerZh: sermon?.speakerZh || '陳嘉彰 牧師',
    date: sermon?.date || new Date().toISOString().slice(0, 10),
    scripture: sermon?.scripture || '',
    scriptureZh: sermon?.scriptureZh || '',
    series: sermon?.series || 'Sunday Message',
    seriesZh: sermon?.seriesZh || '主日證道',
    videoUrl: sermon?.videoUrl || '',
    videoPasscode: sermon?.videoPasscode || '',
    audioUrl: sermon?.audioUrl || '',
    summary: sermon?.summary || '',
    summaryZh: sermon?.summaryZh || '',
    points: sermon?.points ? [...sermon.points] : ['', '', ''],
    pointsZh: sermon?.pointsZh ? [...sermon.pointsZh] : ['', '', '']
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'outline'>('basic');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
    if (sermon) {
      setFormData({
        id: sermon.id || `sermon-${Date.now()}`,
        title: sermon.title || '',
        titleZh: sermon.titleZh || '',
        speaker: sermon.speaker || 'Rev. Jiachang Chen',
        speakerZh: sermon.speakerZh || '陳嘉彰 牧師',
        date: sermon.date || new Date().toISOString().slice(0, 10),
        scripture: sermon.scripture || '',
        scriptureZh: sermon.scriptureZh || '',
        series: sermon.series || 'Sunday Message',
        seriesZh: sermon.seriesZh || '主日證道',
        videoUrl: sermon.videoUrl || '',
        videoPasscode: sermon.videoPasscode || '',
        audioUrl: sermon.audioUrl || '',
        summary: sermon.summary || '',
        summaryZh: sermon.summaryZh || '',
        points: sermon.points ? [...sermon.points] : ['', '', ''],
        pointsZh: sermon.pointsZh ? [...sermon.pointsZh] : ['', '', '']
      });
    } else {
      // Default template for new sermon
      setFormData({
        id: `sermon-${Date.now()}`,
        title: '',
        titleZh: '',
        speaker: 'Rev. Jiachang Chen',
        speakerZh: '陳嘉彰 牧師',
        date: new Date().toISOString().slice(0, 10),
        scripture: '',
        scriptureZh: '',
        series: 'Sunday Message',
        seriesZh: '主日證道',
        videoUrl: '',
        videoPasscode: '',
        audioUrl: '',
        summary: '',
        summaryZh: '',
        points: ['', '', ''],
        pointsZh: ['', '', '']
      });
    }
  }, [sermon, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(sermon && sermon.id);

  // AI Assist: generate outline, summary, and English translations
  const handleAiAssist = async () => {
    if (!formData.titleZh && !formData.scriptureZh) {
      setStatusMsg(lang === 'zh' ? '請先填寫「講道題目」或「核心經文」，以便 AI 為您生成大綱' : 'Please enter title or scripture first.');
      return;
    }

    setIsAiGenerating(true);
    setStatusMsg(lang === 'zh' ? 'AI 正在分析經文並生成講道大綱與雙語翻譯...' : 'AI generating sermon outline & translations...');

    try {
      const res = await fetch('/api/sermons/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleZh: formData.titleZh,
          scriptureZh: formData.scriptureZh,
          speakerZh: formData.speakerZh,
          date: formData.date
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const aiRes = data.data;
        setFormData(prev => ({
          ...prev,
          title: prev.title || aiRes.title,
          titleZh: prev.titleZh || aiRes.titleZh,
          speaker: prev.speaker || aiRes.speaker,
          speakerZh: prev.speakerZh || aiRes.speakerZh,
          scripture: prev.scripture || aiRes.scripture,
          scriptureZh: prev.scriptureZh || aiRes.scriptureZh,
          series: prev.series || aiRes.series,
          seriesZh: prev.seriesZh || aiRes.seriesZh,
          summary: prev.summary || aiRes.summary,
          summaryZh: prev.summaryZh || aiRes.summaryZh,
          points: (aiRes.points && aiRes.points.length > 0) ? aiRes.points : prev.points,
          pointsZh: (aiRes.pointsZh && aiRes.pointsZh.length > 0) ? aiRes.pointsZh : prev.pointsZh
        }));
        setStatusMsg(lang === 'zh' ? '✨ AI 智能大綱與雙語翻譯生成完成！' : '✨ AI outline & translations generated!');
      } else {
        setStatusMsg(lang === 'zh' ? 'AI 生成遇到問題，請手動填寫。' : 'AI generation error, please fill manually.');
      }
    } catch (err: any) {
      console.warn("AI assist failed:", err);
      setStatusMsg(err.message || 'AI request failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handlePointChange = (index: number, val: string, isZh: boolean) => {
    if (isZh) {
      const newPointsZh = [...formData.pointsZh];
      newPointsZh[index] = val;
      setFormData(prev => ({ ...prev, pointsZh: newPointsZh }));
    } else {
      const newPoints = [...formData.points];
      newPoints[index] = val;
      setFormData(prev => ({ ...prev, points: newPoints }));
    }
  };

  const handleAddPoint = () => {
    setFormData(prev => ({
      ...prev,
      pointsZh: [...prev.pointsZh, ''],
      points: [...prev.points, '']
    }));
  };

  const handleRemovePoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pointsZh: prev.pointsZh.filter((_, i) => i !== index),
      points: prev.points.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleZh.trim()) {
      setStatusMsg(lang === 'zh' ? '請填寫講道題目 (中文)' : 'Please enter Chinese sermon title');
      return;
    }

    // Clean up empty points
    const cleanedData: Sermon = {
      ...formData,
      title: formData.title.trim() || formData.titleZh,
      speaker: formData.speaker.trim() || formData.speakerZh,
      scripture: formData.scripture.trim() || formData.scriptureZh,
      series: formData.series.trim() || formData.seriesZh,
      summary: formData.summary.trim() || formData.summaryZh,
      points: formData.points.filter(p => p.trim().length > 0),
      pointsZh: formData.pointsZh.filter(p => p.trim().length > 0)
    };

    onSaveSermon(cleanedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/40 p-5 flex items-center justify-between border-b border-slate-700/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600 rounded-2xl text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                <span>{isEditing ? (lang === 'zh' ? '編輯主日講道內容' : 'Edit Sunday Sermon') : (lang === 'zh' ? '新增主日講道記錄' : 'Add New Sunday Sermon')}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {lang === 'zh' ? '管理員專屬' : 'Admin'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                web@canaannewlife.org • {formData.date}
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

        {/* AI Assist Action Bar */}
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{lang === 'zh' ? '可輸入題目與經文，一鍵讓 AI 輔助生成大綱與英譯' : 'Enter title & scripture, click AI to generate outline'}</span>
          </div>

          <button
            type="button"
            onClick={handleAiAssist}
            disabled={isAiGenerating}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow transition-colors text-xs"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'zh' ? 'AI 生成中...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>{lang === 'zh' ? '✨ AI 智能大綱與英譯' : '✨ AI Auto Outline'}</span>
              </>
            )}
          </button>
        </div>

        {/* Status / Alert Banner */}
        {statusMsg && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-2 text-xs text-amber-300 flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg(null)} className="text-amber-400 hover:text-amber-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabs for Organization */}
        <div className="px-5 pt-3 border-b border-slate-800 flex space-x-2 bg-slate-900/60">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'basic'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '基本資料與經文' : 'Basic & Scripture'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'outline'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '講道大綱要點 (Outline)' : 'Sermon Outline'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'media'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? 'Zoom/YouTube 影音與密碼' : 'Video & Audio Links'}</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: BASIC */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Title Zh & En */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    {lang === 'zh' ? '講道題目 (中文) *' : 'Sermon Title (Chinese) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.titleZh || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleZh: e.target.value }))}
                    placeholder="例如：人生真的轉眼成空嗎？"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'zh' ? '講道題目 (英文 / English Title)' : 'English Title'}
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Is Life Really Gone in the Blink of an Eye?"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Speaker with Quick Select */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    {lang === 'zh' ? '證道講員 (Speaker)' : 'Speaker'}
                  </label>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {COMMON_SPEAKERS.map((spk, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, speakerZh: spk.zh, speaker: spk.en }))}
                        className="bg-slate-800 hover:bg-amber-600/40 text-slate-300 hover:text-amber-200 px-2 py-0.5 rounded-md border border-slate-700 transition-colors"
                      >
                        {spk.zh}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.speakerZh || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, speakerZh: e.target.value }))}
                    placeholder="講員中文 (例如: 陳嘉彰 牧師)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={formData.speaker || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}
                    placeholder="Speaker in English (e.g. Rev. Jiachang Chen)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Date & Series */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'zh' ? '證道日期 (Date)' : 'Service Date'}</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'zh' ? '證道系列 (Series)' : 'Sermon Series'}</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.seriesZh || ''}
                      onChange={(e) => {
                        const matched = COMMON_SERIES.find(s => s.zh === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          seriesZh: e.target.value,
                          series: matched ? matched.en : prev.series
                        }));
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {COMMON_SERIES.map((s, idx) => (
                        <option key={idx} value={s.zh}>{s.zh} ({s.en})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Scripture Zh & En */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    {lang === 'zh' ? '核心經文 (中文)' : 'Scripture (Chinese)'}
                  </label>
                  <input
                    type="text"
                    value={formData.scriptureZh || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, scriptureZh: e.target.value }))}
                    placeholder="例如：傳道書第 1 章第 2-3 節"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'zh' ? '核心經文 (英文 / English Scripture)' : 'Scripture (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.scripture || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, scripture: e.target.value }))}
                    placeholder="e.g. Ecclesiastes 1:2-3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Summary Zh & En */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'zh' ? '證道內容簡述 / 摘要 (中文)' : 'Sermon Summary (Chinese)'}
                </label>
                <textarea
                  rows={3}
                  value={formData.summaryZh || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, summaryZh: e.target.value }))}
                  placeholder="請輸入講道簡介、經文要義與勉勵的話語..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {lang === 'zh' ? '證道摘要 (英文 / English Summary)' : 'English Summary'}
                </label>
                <textarea
                  rows={2}
                  value={formData.summary || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="English summary of the sermon message..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: OUTLINE POINTS */}
          {activeTab === 'outline' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 flex items-start space-x-2">
                <FileText className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p>
                  {lang === 'zh'
                    ? '講道三大要點將完整呈現在影音大綱與講義中。您可自由新增、修改或刪除要點。'
                    : 'Key message outline points will be displayed in the sermon notes modal.'}
                </p>
              </div>

              <div className="space-y-3">
                {formData.pointsZh.map((ptZh, idx) => (
                  <div key={idx} className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>{lang === 'zh' ? `講道要點 ${idx + 1}` : `Key Point #${idx + 1}`}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={ptZh}
                        onChange={(e) => handlePointChange(idx, e.target.value, true)}
                        placeholder={`要點 ${idx + 1} (中文，例：一、日光之下的虛空 — 傳道書 1:2-3)`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.points[idx] || ''}
                        onChange={(e) => handlePointChange(idx, e.target.value, false)}
                        placeholder={`Point ${idx + 1} (English, e.g. 1. Vanity under the sun — Ecclesiastes 1:2-3)`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddPoint}
                className="w-full py-2 border border-dashed border-slate-600 hover:border-amber-500/80 hover:bg-slate-800 rounded-2xl text-xs font-bold text-slate-300 hover:text-amber-300 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'zh' ? '+ 新增講道要點 (Add Point)' : '+ Add Another Outline Point'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: MEDIA & ZOOM */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-200 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-blue-300">
                  <Video className="w-4 h-4" />
                  <span>{lang === 'zh' ? 'Zoom 錄影與 YouTube 影音播放設定' : 'Video Recording Settings'}</span>
                </div>
                <p className="text-slate-300">
                  {lang === 'zh'
                    ? '支援 Zoom 雲端錄影連結（包含密碼自動複製）、YouTube 影片連結（可直接嵌入播放）或自訂錄影連結。'
                    : 'Supports Zoom cloud recording links with passcode or direct YouTube embed URLs.'}
                </p>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center space-x-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '影片連結 (Zoom Recording / YouTube URL)' : 'Video Recording URL'}</span>
                </label>
                <input
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://us06web.zoom.us/rec/share/... 或 https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Video Passcode */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'zh' ? 'Zoom 錄影密碼 (Passcode)' : 'Zoom Passcode (if any)'}</span>
                </label>
                <input
                  type="text"
                  value={formData.videoPasscode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoPasscode: e.target.value }))}
                  placeholder="例如：8s4y?JHX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                />
              </div>

              {/* Audio URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'zh' ? '廣播錄音 / 音訊連結 (Audio Stream URL)' : 'Audio Stream URL (Optional)'}</span>
                </label>
                <input
                  type="url"
                  value={formData.audioUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                  placeholder="https://example.com/sermon.mp3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {isEditing && onDeleteSermon ? (
              isConfirmingDelete ? (
                <div className="flex items-center space-x-2 bg-rose-950/80 border border-rose-500/60 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-rose-200 font-bold">
                    {lang === 'zh' ? '確定刪除此篇講道？' : 'Delete this sermon?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteSermon(formData.id);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors shadow"
                  >
                    {lang === 'zh' ? '確認刪除' : 'Yes, Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    {lang === 'zh' ? '取消' : 'Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'zh' ? '刪除此講道' : 'Delete Sermon'}</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'zh' ? '儲存講道內容' : 'Save Sermon'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
