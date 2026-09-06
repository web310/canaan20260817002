import React, { useState, useEffect } from 'react';
import { ChurchEvent, EventCategory, Language } from '../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  Repeat,
  Info
} from 'lucide-react';

interface AdminEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ChurchEvent | null; // null means adding a new event
  lang: Language;
  onSaveEvent: (event: ChurchEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

const CATEGORY_OPTIONS: { key: EventCategory; labelZh: string; labelEn: string; color: string; descZh: string }[] = [
  {
    key: 'worship',
    labelZh: '禮拜聖會',
    labelEn: 'Sunday Worship',
    color: 'border-amber-500 bg-amber-50 text-amber-800',
    descZh: '主日崇拜、節慶感恩禮拜'
  },
  {
    key: 'prayer',
    labelZh: '線上禱告會',
    labelEn: 'Prayer Meeting',
    color: 'border-indigo-500 bg-indigo-50 text-indigo-800',
    descZh: '週四 Zoom 線上守望禱告會'
  },
  {
    key: 'fellowship',
    labelZh: '小組團契',
    labelEn: 'Cell Fellowship',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    descZh: '細胞小組、弟兄姊妹家庭聚會'
  },
  {
    key: 'education',
    labelZh: '主日學教育',
    labelEn: 'Sunday School',
    color: 'border-teal-500 bg-teal-50 text-teal-800',
    descZh: '成人/兒童主日學真理教導'
  },
  {
    key: 'devotion',
    labelZh: '靈修活動 • 培靈',
    labelEn: 'Spiritual Devotion',
    color: 'border-purple-500 bg-purple-50 text-purple-800',
    descZh: '靈修操練、晨更禱告、培靈退修會'
  },
  {
    key: 'special',
    labelZh: '特別特會 • 節慶',
    labelEn: 'Special Gathering',
    color: 'border-rose-500 bg-rose-50 text-rose-800',
    descZh: '洗禮聖會、福音茶會、宣教特會'
  },
];

const WEEKDAY_OPTIONS = [
  { day: 0, labelZh: '星期日 (週日)', labelEn: 'Sunday' },
  { day: 1, labelZh: '星期一 (週一)', labelEn: 'Monday' },
  { day: 2, labelZh: '星期二 (週二)', labelEn: 'Tuesday' },
  { day: 3, labelZh: '星期三 (週三)', labelEn: 'Wednesday' },
  { day: 4, labelZh: '星期四 (週四)', labelEn: 'Thursday' },
  { day: 5, labelZh: '星期五 (週五)', labelEn: 'Friday' },
  { day: 6, labelZh: '星期六 (週六)', labelEn: 'Saturday' },
];

const QUICK_LOCATIONS = [
  {
    zh: '主堂禮拜堂 (25226 S. Western Ave, Harbor City, CA 90710) / 線上禮拜',
    en: 'Main Worship Hall / Online Live Stream'
  },
  {
    zh: 'Zoom 線上會議 (ID: 310-626-6103, 密碼: 25226)',
    en: 'Zoom ID: 310-626-6103 (Passcode: 25226)'
  },
  {
    zh: '教會副堂 / 團契活動廳',
    en: 'Church Fellowship Hall'
  },
  {
    zh: '主堂與主日學教室 (25226 S. Western Ave, Harbor City, CA 90710)',
    en: 'Main Sanctuary & Classrooms'
  },
  {
    zh: '弟兄姊妹家中 (輪流舉行)',
    en: 'Member Homes (Rotating)'
  }
];

export const AdminEventModal: React.FC<AdminEventModalProps> = ({
  isOpen,
  onClose,
  event,
  lang,
  onSaveEvent,
  onDeleteEvent
}) => {
  const isEditing = !!event;

  const [formData, setFormData] = useState<ChurchEvent>({
    id: event?.id || `event-${Date.now()}`,
    category: event?.category || 'worship',
    title: event?.title || '',
    titleZh: event?.titleZh || '',
    date: event?.date || '',
    time: event?.time || '11:00 AM - 12:30 PM',
    timeZh: event?.timeZh || '星期日 上午 11:00 - 12:30',
    location: event?.location || 'Main Worship Hall / Online Live Stream',
    locationZh: event?.locationZh || '主堂禮拜堂 (25226 S. Western Ave, Harbor City, CA 90710) / 線上禮拜',
    description: event?.description || '',
    descriptionZh: event?.descriptionZh || '',
    recurrenceRuleZh: event?.recurrenceRuleZh || '每個禮拜的星期日 上午 11:00',
    recurrenceRuleEn: event?.recurrenceRuleEn || 'Every Sunday at 11:00 AM',
    recurrenceType: event?.recurrenceType || 'weekly',
    dayOfWeek: event?.dayOfWeek ?? 0,
    zoomId: event?.zoomId || '',
    zoomPasscode: event?.zoomPasscode || '',
    isCustom: event?.isCustom ?? true,
    order: event?.order ?? 99
  });

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setFormData({ ...event });
      } else {
        setFormData({
          id: `event-${Date.now()}`,
          category: 'devotion',
          title: '',
          titleZh: '',
          date: new Date().toISOString().split('T')[0],
          time: '7:30 PM - 9:00 PM',
          timeZh: '晚上 7:30 - 9:00',
          location: '主堂禮拜堂 / 線上直播',
          locationZh: '主堂禮拜堂 / 線上直播',
          description: '',
          descriptionZh: '',
          recurrenceRuleZh: '特別聚會日程',
          recurrenceRuleEn: 'Special Gathering Schedule',
          recurrenceType: 'specific_date',
          dayOfWeek: 0,
          zoomId: '',
          zoomPasscode: '',
          isCustom: true,
          order: 10
        });
      }
      setIsConfirmingDelete(false);
      setErrorMsg('');
    }
  }, [isOpen, event]);

  if (!isOpen) return null;

  // Simple automated English translation assistant for quick and consistent translations
  const handleAutoTranslate = () => {
    setIsTranslating(true);
    try {
      let enTitle = formData.title;
      let enDesc = formData.description;
      let enRule = formData.recurrenceRuleEn;

      if (!enTitle.trim() && formData.titleZh.trim()) {
        const titleZh = formData.titleZh;
        if (titleZh.includes('禱告')) enTitle = 'Prayer Meeting & Intercession';
        else if (titleZh.includes('崇拜') || titleZh.includes('主日')) enTitle = 'Sunday Worship Service';
        else if (titleZh.includes('主日學')) enTitle = 'Sunday School Truth Class';
        else if (titleZh.includes('小組') || titleZh.includes('團契')) enTitle = 'Cell Group Fellowship';
        else if (titleZh.includes('培靈') || titleZh.includes('退修') || titleZh.includes('靈修')) enTitle = 'Spiritual Devotion & Retreat';
        else if (titleZh.includes('洗禮')) enTitle = 'Baptism Thanksgiving Service';
        else enTitle = titleZh;
      }

      if (!enRule.trim() || enRule === 'Special Gathering Schedule') {
        if (formData.recurrenceType === 'weekly') {
          const dayName = WEEKDAY_OPTIONS.find(d => d.day === formData.dayOfWeek)?.labelEn || 'Sunday';
          enRule = `Every ${dayName}`;
        } else if (formData.recurrenceType === 'biweekly_month') {
          enRule = '1st & 3rd Saturday of each month';
        } else if (formData.date) {
          enRule = `Date: ${formData.date}`;
        }
      }

      if (!enDesc.trim() && formData.descriptionZh.trim()) {
        enDesc = formData.descriptionZh
          .replace(/每週日/g, 'Every Sunday ')
          .replace(/禮拜/g, 'worship service ')
          .replace(/崇拜/g, 'worship ')
          .replace(/聖經/g, 'Holy Bible ')
          .replace(/禱告/g, 'prayer ')
          .replace(/團契/g, 'fellowship ')
          .replace(/靈修/g, 'spiritual devotion ')
          .replace(/愛宴/g, 'fellowship meal ')
          .replace(/歡迎/g, 'welcome to join ');
      }

      setFormData(prev => ({
        ...prev,
        title: enTitle,
        description: enDesc,
        recurrenceRuleEn: enRule
      }));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleZh.trim() && !formData.title.trim()) {
      setErrorMsg(lang === 'zh' ? '請輸入聚會活動名稱 (中文或英文)' : 'Please enter event title (Chinese or English)');
      return;
    }
    if (!formData.timeZh.trim() && !formData.time.trim()) {
      setErrorMsg(lang === 'zh' ? '請輸入聚會時間' : 'Please enter event time');
      return;
    }

    // Auto-fill fallback English title if left blank
    const finalizedEvent: ChurchEvent = {
      ...formData,
      title: formData.title.trim() || formData.titleZh.trim(),
      titleZh: formData.titleZh.trim() || formData.title.trim(),
      time: formData.time.trim() || formData.timeZh.trim(),
      timeZh: formData.timeZh.trim() || formData.time.trim(),
      location: formData.location.trim() || formData.locationZh.trim(),
      locationZh: formData.locationZh.trim() || formData.location.trim(),
      description: formData.description.trim() || formData.descriptionZh.trim(),
      descriptionZh: formData.descriptionZh.trim() || formData.description.trim(),
      recurrenceRuleZh: formData.recurrenceRuleZh.trim() || (formData.recurrenceType === 'weekly' ? '每週固定定期聚會' : '特定日程聚會'),
      recurrenceRuleEn: formData.recurrenceRuleEn.trim() || 'Church Gathering Schedule',
      isCustom: true
    };

    onSaveEvent(finalizedEvent);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteEvent && formData.id) {
      onDeleteEvent(formData.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl my-8 overflow-hidden transform transition-all flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {isEditing
                  ? (lang === 'zh' ? '編輯聚會日程 • 靈修活動' : 'Edit Gathering / Event')
                  : (lang === 'zh' ? '新增聚會日程 • 靈修活動' : 'Add Gathering / Event')}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'zh' ? '設定教會常態聚會或靈修特會活動' : 'Configure church regular service or spiritual retreats'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              {lang === 'zh' ? '聚會活動分類 *' : 'Event Category *'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = formData.category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        category: cat.key,
                        // Set sensible defaults if user picked devotion
                        recurrenceType: cat.key === 'devotion' || cat.key === 'special' ? 'specific_date' : prev.recurrenceType
                      }));
                    }}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${cat.color} font-bold ring-2 ring-amber-500 shadow-sm`
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/80 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      {lang === 'zh' ? cat.labelZh : cat.labelEn}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                      {cat.descZh}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Titles */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                {lang === 'zh' ? '活動中文名稱 *' : 'Event Title (Chinese) *'}
              </label>
              <input
                type="text"
                value={formData.titleZh}
                onChange={(e) => setFormData({ ...formData, titleZh: e.target.value })}
                placeholder="例如：週四線上守望禱告會 / 全教會靈修退修會"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  {lang === 'zh' ? '活動英文名稱' : 'Event Title (English)'}
                </label>
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={isTranslating}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  {lang === 'zh' ? '自動輔助翻譯' : 'Auto Translate'}
                </button>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Thursday Night Zoom Prayer Meeting"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 3. Recurrence & Date Settings */}
          <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-amber-600" />
                {lang === 'zh' ? '活動規律與日期設定' : 'Recurrence & Date Calculation'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'weekly' }))}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition-all text-center ${
                  formData.recurrenceType === 'weekly'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {lang === 'zh' ? '每週固定定期' : 'Weekly Recurring'}
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'biweekly_month' }))}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition-all text-center ${
                  formData.recurrenceType === 'biweekly_month'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {lang === 'zh' ? '每月雙週 (如第1與第3週六)' : '1st & 3rd Saturday'}
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'specific_date' }))}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition-all text-center ${
                  formData.recurrenceType === 'specific_date'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {lang === 'zh' ? '特定單次日期 / 特會' : 'Specific Date / Event'}
              </button>
            </div>

            {/* If weekly, choose day of week */}
            {formData.recurrenceType === 'weekly' && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  {lang === 'zh' ? '每週舉行星期' : 'Day of Week'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {WEEKDAY_OPTIONS.map((w) => (
                    <button
                      key={w.day}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          dayOfWeek: w.day,
                          recurrenceRuleZh: `每個禮拜${w.labelZh.replace('星期', '').replace(' (週', '').replace(')', '')}`,
                          recurrenceRuleEn: `Every ${w.labelEn}`
                        }));
                      }}
                      className={`py-2 px-1 text-xs rounded-lg border font-medium transition-all text-center ${
                        formData.dayOfWeek === w.day
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {lang === 'zh' ? w.labelZh.split(' ')[0] : w.labelEn.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If specific date, date picker */}
            {formData.recurrenceType === 'specific_date' && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  {lang === 'zh' ? '特會 / 活動日期 (YYYY-MM-DD)' : 'Event Date'}
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            )}

            {/* Recurrence Rule Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-200/60">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  {lang === 'zh' ? '規律說明 (中文顯示)' : 'Recurrence Note (Zh)'}
                </label>
                <input
                  type="text"
                  value={formData.recurrenceRuleZh}
                  onChange={(e) => setFormData({ ...formData, recurrenceRuleZh: e.target.value })}
                  placeholder="例如：每個禮拜的星期日 上午 11:00"
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  {lang === 'zh' ? '規律說明 (英文顯示)' : 'Recurrence Note (En)'}
                </label>
                <input
                  type="text"
                  value={formData.recurrenceRuleEn}
                  onChange={(e) => setFormData({ ...formData, recurrenceRuleEn: e.target.value })}
                  placeholder="e.g. Every Sunday at 11:00 AM"
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                {lang === 'zh' ? '聚會時間 (中文) *' : 'Event Time (Chinese) *'}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.timeZh}
                  onChange={(e) => setFormData({ ...formData, timeZh: e.target.value })}
                  placeholder="例如：星期日 上午 11:00 - 12:30"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                {lang === 'zh' ? '聚會時間 (英文)' : 'Event Time (English)'}
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 11:00 AM - 12:30 PM"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 5. Location */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  {lang === 'zh' ? '聚會地點 (中文)' : 'Location (Chinese)'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.locationZh}
                    onChange={(e) => setFormData({ ...formData, locationZh: e.target.value })}
                    placeholder="例如：主堂禮拜堂 / 線上直播"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  {lang === 'zh' ? '聚會地點 (英文)' : 'Location (English)'}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Main Worship Hall / Online"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Quick location presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400 self-center mr-1">
                {lang === 'zh' ? '常用地點：' : 'Presets:'}
              </span>
              {QUICK_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, locationZh: loc.zh, location: loc.en }))}
                  className="text-[11px] px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                >
                  {loc.zh.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Zoom Meeting Details */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-indigo-600" />
              {lang === 'zh' ? 'Zoom 線上會議資訊 (可選)' : 'Zoom Online Meeting Details (Optional)'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-700 mb-1">
                  {lang === 'zh' ? 'Zoom 會議 ID' : 'Zoom Meeting ID'}
                </label>
                <input
                  type="text"
                  value={formData.zoomId || ''}
                  onChange={(e) => setFormData({ ...formData, zoomId: e.target.value })}
                  placeholder="e.g. 3106266103"
                  className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-indigo-700 mb-1">
                  {lang === 'zh' ? 'Zoom 會議密碼' : 'Zoom Passcode'}
                </label>
                <input
                  type="text"
                  value={formData.zoomPasscode || ''}
                  onChange={(e) => setFormData({ ...formData, zoomPasscode: e.target.value })}
                  placeholder="e.g. 25226"
                  className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 7. Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                {lang === 'zh' ? '活動內容詳細說明 (中文)' : 'Description (Chinese)'}
              </label>
              <textarea
                rows={3}
                value={formData.descriptionZh}
                onChange={(e) => setFormData({ ...formData, descriptionZh: e.target.value })}
                placeholder="例如：敬拜聖詩、經文研讀、牧者證道，會後備有愛宴交通。"
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                {lang === 'zh' ? '活動內容說明 (英文)' : 'Description (English)'}
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Weekly worship service with hymns, scripture reading, sermon, and fellowship."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between gap-3 sticky bottom-0 z-10">
          <div>
            {isEditing && onDeleteEvent && (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-semibold">
                    {lang === 'zh' ? '確定刪除？' : 'Confirm?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    {lang === 'zh' ? '確定刪除' : 'Yes, Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1.5 text-stone-500 hover:text-stone-700 text-xs rounded-lg transition-colors"
                  >
                    {lang === 'zh' ? '取消' : 'Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{lang === 'zh' ? '刪除此日程' : 'Delete Event'}</span>
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 text-sm font-medium hover:bg-stone-100 rounded-xl transition-colors"
            >
              {lang === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              <span>
                {isEditing
                  ? (lang === 'zh' ? '儲存修改' : 'Save Changes')
                  : (lang === 'zh' ? '新增日程' : 'Create Event')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
