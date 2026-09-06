import React, { useState, useEffect, useCallback } from 'react';
import { ChurchEvent, Language } from '../types';
import { CHURCH_INFO } from '../data/churchData';
import { INITIAL_DEFAULT_EVENTS } from '../data/eventsData';
import { computeAllChurchEvents, ComputedChurchEvent } from '../utils/scheduleHelper';
import { AdminEventModal } from './AdminEventModal';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Plus,
  Check,
  Sparkles,
  RefreshCw,
  Edit2,
  Trash2,
  ShieldCheck,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface EventsProps {
  lang: Language;
  adminEmail?: string | null;
  onOpenAdminLogin?: () => void;
}

const STORAGE_EVENTS_KEY = 'canaan_events_data';
const STORAGE_DELETED_KEY = 'canaan_deleted_event_ids';

export const EventsCalendar: React.FC<EventsProps> = ({
  lang,
  adminEmail,
  onOpenAdminLogin
}) => {
  const [rawEvents, setRawEvents] = useState<ChurchEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_EVENTS_KEY);
      const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
      if (stored) {
        const parsed: ChurchEvent[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(e => !deletedIds.includes(e.id));
        }
      }
      return INITIAL_DEFAULT_EVENTS.filter(e => !deletedIds.includes(e.id));
    } catch {
      return INITIAL_DEFAULT_EVENTS;
    }
  });

  const [events, setEvents] = useState<ComputedChurchEvent[]>(() =>
    computeAllChurchEvents(rawEvents)
  );

  const [addedCalId, setAddedCalId] = useState<string | null>(null);
  const [copiedZoom, setCopiedZoom] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Synchronize events from server or local state
  const loadEventsFromSource = useCallback(async () => {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
      const res = await fetch('/api/events');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const filtered = json.data.filter((e: ChurchEvent) => !deletedIds.includes(e.id));
          setRawEvents(filtered);
          setEvents(computeAllChurchEvents(filtered));
          localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(filtered));
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch events from server, falling back to storage:', err);
    }

    try {
      const stored = localStorage.getItem(STORAGE_EVENTS_KEY);
      const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
      let baseList = INITIAL_DEFAULT_EVENTS;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = parsed;
        }
      }
      const filtered = baseList.filter(e => !deletedIds.includes(e.id));
      setRawEvents(filtered);
      setEvents(computeAllChurchEvents(filtered));
    } catch (localErr) {
      console.warn('Error reading events from localStorage:', localErr);
    }
  }, []);

  // Initial fetch and 1-minute time advancement ticker
  useEffect(() => {
    loadEventsFromSource();

    const interval = setInterval(() => {
      setEvents(computeAllChurchEvents(rawEvents));
    }, 60000);

    const handleCustomUpdate = () => {
      loadEventsFromSource();
    };

    window.addEventListener('canaan_events_updated', handleCustomUpdate);
    window.addEventListener('storage', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('canaan_events_updated', handleCustomUpdate);
      window.removeEventListener('storage', handleCustomUpdate);
    };
  }, [loadEventsFromSource, rawEvents]);

  // Recalculate whenever rawEvents changes
  useEffect(() => {
    setEvents(computeAllChurchEvents(rawEvents));
  }, [rawEvents]);

  // Save Event (Add or Edit)
  const handleSaveEvent = async (savedEvent: ChurchEvent) => {
    try {
      const existingIdx = rawEvents.findIndex(e => e.id === savedEvent.id);
      let updatedList: ChurchEvent[];
      if (existingIdx >= 0) {
        updatedList = [...rawEvents];
        updatedList[existingIdx] = savedEvent;
      } else {
        updatedList = [savedEvent, ...rawEvents];
      }

      // Remove from deleted list if present
      const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
      const newDeletedIds = deletedIds.filter(id => id !== savedEvent.id);
      localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(newDeletedIds));

      setRawEvents(updatedList);
      setEvents(computeAllChurchEvents(updatedList));
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(updatedList));

      // Post to Server API
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: savedEvent, events: updatedList })
      }).catch(err => console.warn('Could not post event to server:', err));

      window.dispatchEvent(new CustomEvent('canaan_events_updated'));
      showToast(
        lang === 'zh'
          ? `「${savedEvent.titleZh || savedEvent.title}」日程已成功儲存！`
          : `Gathering "${savedEvent.title || savedEvent.titleZh}" saved successfully!`
      );
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const targetEvent = rawEvents.find(e => e.id === eventId);
      const title = targetEvent ? (lang === 'zh' ? targetEvent.titleZh : targetEvent.title) : '';

      // Add to deleted blacklist in localStorage
      const deletedIds: string[] = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
      if (!deletedIds.includes(eventId)) {
        deletedIds.push(eventId);
        localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(deletedIds));
      }

      const updatedList = rawEvents.filter(e => e.id !== eventId);
      setRawEvents(updatedList);
      setEvents(computeAllChurchEvents(updatedList));
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(updatedList));

      // Call delete API
      await fetch(`/api/events/${encodeURIComponent(eventId)}`, {
        method: 'DELETE'
      }).catch(err => console.warn('Could not delete event on server:', err));

      setDeletingId(null);
      window.dispatchEvent(new CustomEvent('canaan_events_updated'));
      showToast(
        lang === 'zh'
          ? `「${title}」聚會日程已永久刪除！`
          : `Gathering "${title}" deleted permanently!`
      );
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  // Reset to Church Official Defaults
  const handleResetDefaults = async () => {
    try {
      localStorage.removeItem(STORAGE_DELETED_KEY);
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(INITIAL_DEFAULT_EVENTS));
      setRawEvents(INITIAL_DEFAULT_EVENTS);
      setEvents(computeAllChurchEvents(INITIAL_DEFAULT_EVENTS));

      await fetch('/api/events/reset', {
        method: 'POST'
      }).catch(err => console.warn('Could not reset events on server:', err));

      setIsConfirmingReset(false);
      window.dispatchEvent(new CustomEvent('canaan_events_updated'));
      showToast(
        lang === 'zh'
          ? '已重設為加南新生基督教會官方預設聚會日程！'
          : 'Reset to Canaan Shin Sheng Christian Church default schedule!'
      );
    } catch (err) {
      console.error('Error resetting defaults:', err);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadEventsFromSource();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast(lang === 'zh' ? '聚會日程已更新至最新狀態' : 'Gathering schedule refreshed');
    }, 600);
  };

  const handleAddToCalendar = (evt: ComputedChurchEvent) => {
    const startTimeStr = evt.date.replace(/-/g, '');
    let startHour = "110000";
    let endHour = "123000";

    if (evt.category === 'education') {
      startHour = "100000";
      endHour = "105000";
    } else if (evt.category === 'prayer') {
      startHour = "200000";
      endHour = "211500";
    } else if (evt.category === 'fellowship') {
      startHour = "140000";
      endHour = "160000";
    } else if (evt.category === 'devotion') {
      startHour = "193000";
      endHour = "210000";
    }

    if (evt.time.includes('8:00 PM') || evt.time.includes('20:00')) {
      startHour = "200000";
      endHour = "211500";
    } else if (evt.time.includes('7:30 PM') || evt.time.includes('19:30')) {
      startHour = "193000";
      endHour = "210000";
    } else if (evt.time.includes('10:00 AM')) {
      startHour = "100000";
      endHour = "105000";
    } else if (evt.time.includes('11:00 AM')) {
      startHour = "110000";
      endHour = "123000";
    } else if (evt.time.includes('2:00 PM') || evt.time.includes('14:00')) {
      startHour = "140000";
      endHour = "160000";
    }

    const title = encodeURIComponent(lang === 'zh' ? evt.titleZh : evt.title);
    const details = encodeURIComponent(
      (lang === 'zh' ? evt.descriptionZh : evt.description) +
      (evt.zoomId ? `\nZoom ID: ${evt.zoomId} (Passcode: ${evt.zoomPasscode || '25226'})` : '')
    );
    const location = encodeURIComponent(lang === 'zh' ? evt.locationZh : evt.location);
    const dates = `${startTimeStr}T${startHour}/${startTimeStr}T${endHour}`;

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');

    setAddedCalId(evt.id);
    setTimeout(() => setAddedCalId(null), 3000);
  };

  const handleCopyZoom = () => {
    navigator.clipboard.writeText(CHURCH_INFO.zoomId);
    setCopiedZoom(true);
    setTimeout(() => setCopiedZoom(false), 2500);
  };

  const getDaysBadge = (days: number, isToday?: boolean) => {
    if (isToday || days === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 font-bold text-[11px] border border-rose-200 shadow-xs animate-pulse">
          🔥 {lang === 'zh' ? '今日聚會' : 'Today'}
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 font-bold text-[11px] border border-amber-200 shadow-xs">
          ⏳ {lang === 'zh' ? '明天舉行' : 'Tomorrow'}
        </span>
      );
    }
    if (days < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 font-medium text-[11px]">
          {lang === 'zh' ? '已圓滿結束' : 'Ended'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
        {lang === 'zh' ? `倒數 ${days} 天` : `In ${days} days`}
      </span>
    );
  };

  const getCardTheme = (category: string) => {
    switch (category) {
      case 'education':
        return {
          border: 'border-teal-200/90',
          badge: 'bg-teal-100 text-teal-800',
          dateBg: 'from-teal-50/90 to-teal-50/30 border-teal-200/70',
          dateText: 'text-teal-950',
          labelText: 'text-teal-800',
          datePill: 'bg-teal-100/90 text-teal-800',
          labelZh: '禮拜前主日學',
          labelEn: 'Sunday School'
        };
      case 'prayer':
        return {
          border: 'border-indigo-200/90',
          badge: 'bg-indigo-100 text-indigo-800',
          dateBg: 'from-indigo-50/90 to-indigo-50/30 border-indigo-200/70',
          dateText: 'text-indigo-950',
          labelText: 'text-indigo-800',
          datePill: 'bg-indigo-100/90 text-indigo-800',
          labelZh: '線上禱告會',
          labelEn: 'Prayer'
        };
      case 'worship':
        return {
          border: 'border-amber-200/90',
          badge: 'bg-amber-100 text-amber-900',
          dateBg: 'from-amber-50/90 to-amber-50/30 border-amber-200/70',
          dateText: 'text-amber-950',
          labelText: 'text-amber-800',
          datePill: 'bg-amber-100/90 text-amber-800',
          labelZh: '禮拜聖會',
          labelEn: 'Worship'
        };
      case 'fellowship':
        return {
          border: 'border-emerald-200/90',
          badge: 'bg-emerald-100 text-emerald-800',
          dateBg: 'from-emerald-50/90 to-emerald-50/30 border-emerald-200/70',
          dateText: 'text-emerald-950',
          labelText: 'text-emerald-800',
          datePill: 'bg-emerald-100/90 text-emerald-800',
          labelZh: '細胞小組團契',
          labelEn: 'Cell Group'
        };
      case 'devotion':
        return {
          border: 'border-purple-200/90',
          badge: 'bg-purple-100 text-purple-800',
          dateBg: 'from-purple-50/90 to-purple-50/30 border-purple-200/70',
          dateText: 'text-purple-950',
          labelText: 'text-purple-800',
          datePill: 'bg-purple-100/90 text-purple-800',
          labelZh: '靈修活動 • 培靈',
          labelEn: 'Spiritual Devotion'
        };
      case 'special':
      default:
        return {
          border: 'border-rose-200/90',
          badge: 'bg-rose-100 text-rose-800',
          dateBg: 'from-rose-50/90 to-rose-50/30 border-rose-200/70',
          dateText: 'text-rose-950',
          labelText: 'text-rose-800',
          datePill: 'bg-rose-100/90 text-rose-800',
          labelZh: '特別聚會 • 特會',
          labelEn: 'Special Gathering'
        };
    }
  };

  return (
    <section id="events" className="py-20 bg-stone-50/80 text-stone-800 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center flex-wrap gap-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>{lang === 'zh' ? '教會聚會日程 • 靈修活動 (常態與特會)' : 'Gatherings & Spiritual Events'}</span>
              </div>

              {adminEmail ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold border border-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'zh' ? '管理員維護模式' : 'Admin Mode'}</span>
                </div>
              ) : null}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              {lang === 'zh' ? '聚會日程 • 靈修活動' : 'Upcoming Gatherings & Events'}
            </h2>

            <p className="text-stone-600 text-base leading-relaxed">
              {lang === 'zh'
                ? '加南新生基督教會各項定期聚會日程與靈修活動。定期聚會時間過後，系統將自動推算並顯示下一次的聚會日期與詳情。'
                : 'Canaan Shin Sheng Christian Church gatherings and spiritual activities. Dates automatically advance to the next upcoming session once completed.'}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Admin Add Button */}
            {adminEmail && (
              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'zh' ? '新增聚會 • 靈修活動' : '+ Add Gathering / Event'}</span>
              </button>
            )}

            {/* Admin Reset to Defaults Button */}
            {adminEmail && (
              isConfirmingReset ? (
                <div className="inline-flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200">
                  <span className="text-[11px] font-semibold text-red-700 px-1">
                    {lang === 'zh' ? '確認重設？' : 'Reset?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {lang === 'zh' ? '確定' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingReset(false)}
                    className="px-2 py-1 text-stone-600 hover:text-stone-800 text-xs rounded-lg transition-colors"
                  >
                    {lang === 'zh' ? '取消' : 'No'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(true)}
                  className="inline-flex items-center justify-center space-x-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 px-3 py-2.5 rounded-xl border border-stone-200 transition-colors shadow-xs"
                  title={lang === 'zh' ? '重設為官方預設聚會日程' : 'Reset to official defaults'}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === 'zh' ? '重設預設' : 'Reset Defaults'}</span>
                </button>
              )
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-xs transition-all"
              title={lang === 'zh' ? '即時更新' : 'Refresh'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span>{lang === 'zh' ? '即時更新' : 'Refresh'}</span>
            </button>

            {/* Phone contact */}
            <a
              href={`tel:${CHURCH_INFO.phone1}`}
              className="inline-flex items-center justify-center space-x-2 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-4 py-2.5 rounded-xl border border-amber-200 transition-colors"
            >
              <span>{lang === 'zh' ? '洽詢聚會: (310) 626-6103' : 'Inquiry: (310) 626-6103'}</span>
            </a>

            {/* Unobtrusive Admin Login button if not logged in */}
            {!adminEmail && onOpenAdminLogin && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="inline-flex items-center justify-center space-x-1 text-xs text-stone-400 hover:text-stone-700 bg-transparent hover:bg-stone-100 px-2.5 py-2 rounded-xl transition-colors"
                title={lang === 'zh' ? '同工管理員登入' : 'Admin Login'}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[11px]">{lang === 'zh' ? '管理員' : 'Admin'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Events Cards List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-stone-600 font-medium">
              {lang === 'zh' ? '目前沒有聚會日程。' : 'No upcoming gatherings at this moment.'}
            </p>
            {adminEmail && (
              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700"
              >
                {lang === 'zh' ? '立即新增聚會日程' : 'Add Gathering Schedule Now'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {events.map((evt) => {
              const theme = getCardTheme(evt.category);

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group"
                >
                  {/* Main Content Area */}
                  <div className="space-y-4">
                    {/* Top Row: Category Pill, Days Badge & Admin Quick Actions */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${theme.badge}`}>
                        {lang === 'zh' ? theme.labelZh : theme.labelEn}
                      </span>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {getDaysBadge(evt.daysUntil, evt.isToday)}

                        {/* Admin Action Buttons on Card */}
                        {adminEmail && (
                          <div className="flex items-center gap-1 ml-1 bg-stone-50 p-1 rounded-lg border border-stone-200">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEvent(evt);
                                setIsEventModalOpen(true);
                              }}
                              className="p-1 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                              title={lang === 'zh' ? '修改此聚會日程' : 'Edit Gathering'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {deletingId === evt.id ? (
                              <div className="flex items-center gap-1 bg-red-50 px-1 py-0.5 rounded border border-red-200">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(evt.id)}
                                  className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded"
                                >
                                  {lang === 'zh' ? '刪' : 'Del'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="text-[10px] text-stone-500 px-1"
                                >
                                  {lang === 'zh' ? '否' : 'No'}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeletingId(evt.id)}
                                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title={lang === 'zh' ? '刪除此聚會日程' : 'Delete Gathering'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recurrence Rule Banner */}
                    <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-100 w-full">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{lang === 'zh' ? evt.recurrenceRuleZh : evt.recurrenceRuleEn}</span>
                    </div>

                    {/* Next Date Highlight Box */}
                    <div className={`bg-gradient-to-b ${theme.dateBg} border rounded-2xl p-4 space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${theme.labelText} uppercase tracking-wider flex items-center space-x-1`}>
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{lang === 'zh' ? '聚會 / 活動日期' : 'Gathering Date'}</span>
                        </span>
                        <span className={`text-[11px] font-mono font-semibold ${theme.datePill} px-2 py-0.5 rounded-md`}>
                          {evt.date}
                        </span>
                      </div>

                      <div className={`text-xl font-bold ${theme.dateText} font-serif tracking-tight whitespace-nowrap`}>
                        {lang === 'zh' ? evt.dateFormattedZh : evt.dateFormattedEn}
                      </div>

                      {evt.ordinalTextZh && (
                        <div className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          <span>📌</span>
                          <span>{lang === 'zh' ? evt.ordinalTextZh : evt.ordinalTextEn}</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                        {lang === 'zh' ? evt.titleZh : evt.title}
                      </h3>
                      <p className="text-stone-600 text-xs leading-relaxed line-clamp-3">
                        {lang === 'zh' ? evt.descriptionZh : evt.description}
                      </p>
                    </div>

                    {/* Time & Location Details */}
                    <div className="space-y-2 text-xs text-stone-700 bg-stone-50/90 rounded-2xl p-3.5 border border-stone-100">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="font-semibold text-stone-800">{lang === 'zh' ? evt.timeZh : evt.time}</span>
                      </div>

                      <div className="flex items-start space-x-2">
                        {evt.zoomId ? (
                          <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        )}
                        <div className="leading-snug">
                          <div className="font-medium text-stone-800">
                            {lang === 'zh' ? evt.locationZh : evt.location}
                          </div>
                          {evt.zoomId && (
                            <div className="flex items-center space-x-2 mt-1.5">
                              <span className="text-[11px] font-mono text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                ID: {evt.zoomId}
                              </span>
                              <button
                                type="button"
                                onClick={handleCopyZoom}
                                className="text-[11px] text-indigo-700 hover:text-indigo-900 underline font-semibold flex items-center space-x-0.5"
                              >
                                {copiedZoom ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                                <span>{copiedZoom ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '複製ID' : 'Copy')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCalendar(evt)}
                      className="flex-1 flex items-center justify-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                      {addedCalId === evt.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">{lang === 'zh' ? '已開啟日曆' : 'Opened Calendar'}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          <span>{lang === 'zh' ? '加到 Google 日曆' : 'Add to Google Cal'}</span>
                        </>
                      )}
                    </button>

                    {evt.zoomId && (
                      <a
                        href={`https://zoom.us/j/${evt.zoomId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shrink-0 shadow-xs"
                      >
                        <span>{lang === 'zh' ? 'Zoom 連線' : 'Zoom'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Event Add/Edit Modal */}
      {isEventModalOpen && (
        <AdminEventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
          event={editingEvent}
          lang={lang}
          onSaveEvent={handleSaveEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}
    </section>
  );
};
