import React, { useState } from 'react';
import { Language } from '../types';
import { Sparkles, Send, BookOpen, Heart, MessageSquare, X, RefreshCw, Church } from 'lucide-react';

interface PastoralAIProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const PastoralAIAssistant: React.FC<PastoralAIProps> = ({ lang, isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState<'scripture' | 'prayer' | 'devotional' | 'church'>('scripture');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: lang === 'zh'
        ? "平安！我是加南新生基督教會的『聖經與靈修 AI 導師』。請問今天有什麼聖經問題、靈修需求或需要為您祝福禱告的呢？"
        : "Peace be with you! I am Canaan Shin Sheng Christian Church's AI Bible & Prayer Companion. How may I encourage you with Scripture or prayer today?"
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = lang === 'zh' ? [
    "請為我提供今日平安靈修經文與金句",
    "當我面對焦慮與壓力時，聖經有何安慰？",
    "請為我的家人身體健康寫一段簡短代禱文",
    "加南新生基督教會每週主日與線上禱告會時間"
  ] : [
    "Give me a daily Bible verse for peace and strength",
    "What does Scripture say about anxiety and trusting God?",
    "Write a short prayer for family health and peace",
    "What are Canaan Shin Sheng Church service times?"
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || prompt;
    if (!textToSend.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    if (!userText) setPrompt('');
    setLoading(true);

    try {
      let aiText = '';
      const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

      // Prepare system instruction for Biblical & Pastoral AI guide
      const systemInstruction = lang === 'zh'
        ? "你是一位熱情、具備豐富聖經知識與關懷心的加南新生基督教會『聖經與靈修 AI 導師』。請用繁體中文回應，態度溫和、鼓勵人，並以聖經真理為根基解答弟兄姊妹的信仰問題與靈修疑惑。"
        : "You are an encouraging and wise Pastoral & Bible AI Companion for Canaan Shin Sheng Christian Church. Respond with warmth, pastoral care, and grounded in Biblical truth.";

      // 1. Try /api/pastoral-ai or /api/chat
      try {
        const res = await fetch('/api/pastoral-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            topic,
            language: lang,
            contents: newMsgs.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }]
            })),
            systemInstruction
          }),
        });

        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json().catch(() => null);
          if (data && (data.reply || data.text)) {
            aiText = data.reply || data.text;
          }
        }
      } catch (e) {
        console.warn("Server API call failed, attempting fallback:", e);
      }

      // 2. If server API didn't return text, try client-side Gemini API fallback if key available
      if (!aiText && clientApiKey) {
        try {
          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${clientApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: newMsgs.map(m => ({
                  role: m.role === 'user' ? 'user' : 'model',
                  parts: [{ text: m.text }]
                })),
                systemInstruction: { parts: [{ text: systemInstruction }] },
              }),
            }
          );
          if (directRes.ok) {
            const directData = await directRes.json().catch(() => null);
            aiText = directData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (clientErr) {
          console.warn("Client Gemini call failed:", clientErr);
        }
      }

      // 3. Set response or fallback scripture message
      if (aiText) {
        setMessages([...newMsgs, { role: 'ai', text: aiText }]);
      } else {
        setMessages([
          ...newMsgs,
          {
            role: 'ai',
            text: lang === 'zh'
              ? "『主是我的牧者，我必不至缺乏。』（詩篇 23:1）願上帝豐富的平安與智慧保守您！若要啟用 AI 對話，請確保在 Cloudflare / 伺服器設定 VITE_GEMINI_API_KEY。"
              : "'The LORD is my shepherd; I shall not want.' (Psalm 23:1). May God guard your heart with wisdom!"
          }
        ]);
      }
    } catch (err) {
      console.error("AI error:", err);
      setMessages([
        ...newMsgs,
        {
          role: 'ai',
          text: lang === 'zh'
            ? "『主是我的牧者，我必不至缺乏。』（詩篇 23:1）願上帝豐富的平安與智慧保守您！"
            : "'The LORD is my shepherd; I shall not want.' (Psalm 23:1). May God guard your heart with wisdom!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                <span>{lang === 'zh' ? '加南聖經與靈修 AI 導師' : 'Canaan AI Bible & Prayer Companion'}</span>
              </h3>
              <div className="text-xs text-slate-400">
                {lang === 'zh' ? '提供經文解讀 • 專屬代禱 • 靈修陪伴' : 'Scripture Insights • Personal Prayer • Daily Devotion'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-700 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none shadow-sm'
                }`}
              >
                {m.role === 'ai' && (
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs mb-1.5 border-b border-slate-700/60 pb-1">
                    <Church className="w-3.5 h-3.5" />
                    <span>{lang === 'zh' ? '聖經與靈修導師' : 'Bible & Pastoral Guide'}</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-amber-400 rounded-2xl p-4 text-xs flex items-center space-x-2 border border-slate-700">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{lang === 'zh' ? '正在查考聖經與準備靈修經文...' : 'Searching Scripture & preparing encouragement...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {quickPrompts.map((qp, qIdx) => (
              <button
                key={qIdx}
                onClick={() => handleSend(qp)}
                disabled={loading}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-200 px-3 py-1.5 rounded-full border border-slate-700 hover:border-amber-500/40 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={lang === 'zh' ? '請輸入聖經問題、靈修需求或代禱項目...' : 'Ask a Bible question or request a prayer...'}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-800 text-white p-3 rounded-xl transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
