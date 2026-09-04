import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import {
  Sparkles,
  Send,
  BookOpen,
  Heart,
  X,
  RefreshCw,
  Church,
  Copy,
  Check,
  RotateCcw,
  Zap,
  ChevronRight,
  Share2
} from 'lucide-react';
import { generateInstantPastoralReply } from '../utils/pastoralAI';

interface PastoralAIProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}

export const PastoralAIAssistant: React.FC<PastoralAIProps> = ({ lang, isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'scripture' | 'comfort' | 'prayer' | 'church'>('all');
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  
  const initialGreeting = lang === 'zh'
    ? "平安！我是加南新生基督教會的『聖經與靈修 AI 導師』。無論您今天面對挑戰需要經文力量、身心疲憊尋求平安代禱，或是想了解加南教會聚會與事工，我都隨時在這裡為您守望解答！"
    : "Peace be with you! I am Canaan Shin Sheng Christian Church's AI Bible & Pastoral Guide. How may I encourage you with Scripture, prayer, or church fellowship today?";

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-initial',
      role: 'ai',
      text: initialGreeting
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  if (!isOpen) return null;

  const quickCategories = lang === 'zh' ? [
    { id: 'all', label: '全部精選', icon: Sparkles },
    { id: 'scripture', label: '📖 每日經文靈修', prompt: '請為我提供今日平安靈修經文與默想金句' },
    { id: 'comfort', label: '🕊️ 平安安慰與釋放', prompt: '當我面對焦慮、擔憂與生活壓力時，聖經有何安慰？' },
    { id: 'prayer', label: '🙏 專屬健康與家庭代禱', prompt: '請為我和家人的身心靈健康、出入平安寫一段專屬代禱文' },
    { id: 'church', label: '⛪ 教會主日與禱告會', prompt: '加南新生基督教會每週主日崇拜、週四 Zoom 禱告會時間與聯絡方式' },
  ] : [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'scripture', label: '📖 Daily Devotion', prompt: 'Give me a daily Bible verse for peace and spiritual strength' },
    { id: 'comfort', label: '🕊️ Peace & Comfort', prompt: 'What does Scripture say about overcoming anxiety and finding rest in God?' },
    { id: 'prayer', label: '🙏 Family Prayer', prompt: 'Write a warm intercessory prayer for family health, peace, and protection' },
    { id: 'church', label: '⛪ Church Times', prompt: 'What are Canaan Shin Sheng Christian Church worship and Zoom prayer times?' },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearHistory = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'ai',
        text: initialGreeting
      }
    ]);
    setLoading(false);
    setStreamingMessageId(null);
  };

  // Ultra-fast streaming message sender
  const handleSend = async (userText?: string) => {
    const textToSend = (userText || prompt).trim();
    if (!textToSend || loading) return;

    // Abort previous if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    const newMsgs: MessageItem[] = [
      ...messages,
      { id: userMsgId, role: 'user', text: textToSend },
      { id: aiMsgId, role: 'ai', text: '', isStreaming: true }
    ];

    setMessages(newMsgs);
    if (!userText) setPrompt('');
    setLoading(true);
    setStreamingMessageId(aiMsgId);

    const systemInstruction = lang === 'zh'
      ? "你是一位熱情、充滿關懷與豐富聖經知識的加南新生基督教會『聖經與靈修 AI 導師』。請用繁體中文以溫暖、鼓勵人心的語氣，以聖經真理為根基迅速回答弟兄姊妹的信仰問題與靈修疑惑。"
      : "You are an encouraging and wise Pastoral & Bible AI Companion for Canaan Shin Sheng Christian Church. Respond warmly and rapidly grounded in Biblical truth.";

    let accumulatedText = '';

    const updateAiMessage = (chunk: string) => {
      accumulatedText += chunk;
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg
        )
      );
    };

    const finalizeAiMessage = (finalText?: string) => {
      const textToSet = finalText !== undefined ? finalText : accumulatedText;
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMsgId ? { ...msg, text: textToSet, isStreaming: false } : msg
        )
      );
      setLoading(false);
      setStreamingMessageId(null);
    };

    // Helper: Simulated instant streaming from local high-speed pastoral knowledge base
    const streamFromLocalEngine = async () => {
      const instantResponse = generateInstantPastoralReply(textToSend, lang);
      const fullText = instantResponse.reply;
      const tokens = fullText.split(/(?<=\n|。|！|？|，|\s+)/);

      for (const token of tokens) {
        if (abortController.signal.aborted) return;
        updateAiMessage(token);
        await new Promise(r => setTimeout(r, 12));
      }
      finalizeAiMessage(fullText);
    };

    try {
      // Set a rapid 2.8s response timeout to ensure the user NEVER waits for slow AI
      let hasReceivedFirstToken = false;
      const speedTimeoutId = setTimeout(() => {
        if (!hasReceivedFirstToken) {
          abortController.abort();
        }
      }, 2800);

      // 1. Attempt Server-Sent Events (SSE) stream for real-time tokens
      const streamRes = await fetch('/api/pastoral-ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          prompt: textToSend,
          language: lang,
          contents: newMsgs.filter(m => m.id !== aiMsgId).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          systemInstruction
        }),
        signal: abortController.signal
      }).catch(() => null);

      if (streamRes && streamRes.ok && streamRes.body) {
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.replace(/^data:\s*/, '');
              if (jsonStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) {
                  if (!hasReceivedFirstToken) {
                    hasReceivedFirstToken = true;
                    clearTimeout(speedTimeoutId);
                  }
                  updateAiMessage(parsed.text);
                }
                if (parsed.done) {
                  clearTimeout(speedTimeoutId);
                  finalizeAiMessage();
                  return;
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        clearTimeout(speedTimeoutId);
        if (accumulatedText.trim()) {
          finalizeAiMessage();
          return;
        }
      }

      clearTimeout(speedTimeoutId);

      // 2. Fallback to standard JSON endpoint if SSE stream wasn't fulfilled
      const jsonRes = await fetch('/api/pastoral-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language: lang,
          contents: newMsgs.filter(m => m.id !== aiMsgId).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          systemInstruction
        }),
        signal: abortController.signal
      }).catch(() => null);

      if (jsonRes && jsonRes.ok) {
        const data = await jsonRes.json().catch(() => null);
        if (data && (data.reply || data.text)) {
          finalizeAiMessage(data.reply || data.text);
          return;
        }
      }

      // 3. Fallback to high-speed client-side local Biblical engine
      await streamFromLocalEngine();
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn("Fast pastoral assistant notice, switching to instant engine:", err);
      await streamFromLocalEngine();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-3xl w-full h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                  {lang === 'zh' ? '加南聖經與靈修 AI 導師' : 'Canaan AI Bible & Prayer Companion'}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'zh' ? '極速模式' : 'Ultra-Fast'}</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>{lang === 'zh' ? '聖經解答 • 靈修默想 • 專屬代禱 • 教會事工' : 'Scripture Insights • Daily Devotion • Prayer Intercession'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleClearHistory}
              title={lang === 'zh' ? '重置對話' : 'Reset Chat'}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title={lang === 'zh' ? '關閉' : 'Close'}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="px-3 sm:px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto flex items-center space-x-1.5 scrollbar-none">
          {quickCategories.slice(1).map((cat) => (
            <button
              key={cat.id}
              onClick={() => cat.prompt && handleSend(cat.prompt)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap bg-slate-800/90 hover:bg-slate-700/90 active:bg-amber-900/60 text-slate-200 hover:text-amber-200 px-3 py-1.5 rounded-full border border-slate-700 hover:border-amber-500/40 transition-colors flex items-center space-x-1"
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                  m.role === 'user'
                    ? 'bg-amber-700 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800/95 text-slate-200 border border-slate-700/90 rounded-bl-none shadow-md'
                }`}
              >
                {m.role === 'ai' && (
                  <div className="flex items-center justify-between text-amber-400 font-bold text-xs mb-2 border-b border-slate-700/60 pb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Church className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '聖經與靈修 AI 導師' : 'Bible & Pastoral Guide'}</span>
                      {m.isStreaming && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <Zap className="w-2.5 h-2.5 animate-pulse" />
                          <span>{lang === 'zh' ? '即時生成中' : 'Streaming...'}</span>
                        </span>
                      )}
                    </div>

                    {!m.isStreaming && m.text && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-slate-700 transition"
                        title={lang === 'zh' ? '複製經文與禱告' : 'Copy'}
                      >
                        {copiedIdx === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{lang === 'zh' ? '已複製' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{lang === 'zh' ? '複製' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-wrap font-sans space-y-1">
                  {m.text || (m.isStreaming ? '...' : '')}
                </div>
              </div>
            </div>
          ))}

          {loading && !streamingMessageId && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-amber-300 rounded-2xl p-3 text-xs flex items-center space-x-2 border border-slate-700 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{lang === 'zh' ? '正在查考聖經真理並為您預備祝福...' : 'Preparing Biblical encouragement...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                lang === 'zh'
                  ? '請輸入聖經問題、靈修需求、為家人身體祈禱或聚會時間...'
                  : 'Ask a Bible question, request a prayer, or inquire about services...'
              }
              className="flex-1 px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
              title={lang === 'zh' ? '發送' : 'Send'}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <div className="mt-2 text-[10px] text-slate-500 text-center">
            {lang === 'zh'
              ? '加南新生基督教會 • 聖經與靈修 AI 導師提供屬靈輔助，若需牧者面對面牧養關懷歡迎隨時聯絡教會同工。'
              : 'Canaan AI Pastoral Guide provides biblical encouragement. Feel free to contact our pastoral team anytime.'}
          </div>
        </div>

      </div>
    </div>
  );
};
