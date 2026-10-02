import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { buildCoachContext, askAICoach } from '../services/aiCoachEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'rule-engine-fallback' | string;
}

export const AICoach: React.FC = () => {
  const { customer, profile, risk, forecast, anomalies, lang, formatMoney } = useFinancial();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = `আসসালামু আলাইকুম ${customer.name}! আমি আপনার উপায় ফাইন্যান্সিয়াল রেজিলিয়েন্স এআই পরামর্শক। 
আপনার সাম্প্রতিক লেনদেন, আসন্ন বিল এবং আগামী দিনগুলোর খরচের গতিধারা বিশ্লেষণ করেছি।

বর্তমানে আপনার ওয়ালেট ব্যালেন্স ${formatMoney(profile.currentBalance)} এবং পরবর্তী বেতন আসতে এখনো ${profile.daysUntilNextIncome} দিন বাকি। বর্তমান গতিধারায় আপনার আর্থিক ঘাটতির ঝুঁকি ${Math.round(risk.probability * 100)}% (${risk.riskLevel === 'HIGH' ? 'উচ্চ' : risk.riskLevel === 'MODERATE' ? 'মাঝারি' : 'কম'})।

আপনার আর্থিক ব্যবস্থাপনা ও সঞ্চয় সুরক্ষিত রাখতে আজ আমি কীভাবে সাহায্য করতে পারি?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      text: initialGreeting,
      timestamp: 'এখনই',
      source: 'gemini-3.8-flash',
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: 'm1',
        role: 'assistant',
        text: initialGreeting,
        timestamp: 'এখনই',
        source: 'gemini-3.8-flash',
      },
    ]);
  }, [customer.customer_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const coachContext = buildCoachContext(
        profile,
        risk,
        forecast.monthEndForecast,
        anomalies
      );

      const promptQuery = lang === 'bn'
        ? `[Respond in Bengali / বাংলায় সহজ ভাষায় উত্তর দিন]: ${query}`
        : `[Respond in English with practical financial advice]: ${query}`;
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await askAICoach(promptQuery, coachContext, history, lang);

      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    'আমার আর্থিক ঝুঁকি কেন বেশি?',
    'চলতি মাসে কোন খাতে বেশি খরচ হয়েছে?',
    'খাবারে ১৫% খরচ কমালে কী লাভ হবে?',
    'আমি কি আমার ল্যাপটপের লক্ষ্য পূরণ করতে পারব?',
    'মাস শেষে কেন টাকা ফুরিয়ে যাওয়ার আশঙ্কা তৈরি হয়েছে?',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="upay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[12px] font-bold">
            জেনারেটিভ এআই অনুবাদক স্তর
          </div>
          <h2 className="text-[#0B1F4B] mt-2">উপায় এআই আর্থিক পরামর্শক</h2>
          <p className="text-caption text-[var(--muted)] max-w-2xl mt-0.5">
            গুগল জেমিনাই ৩.৮ ফ্ল্যাশ দ্বারা চালিত। আপনার ক্যাশ-ফ্লো ও ঝুঁকির জটিল উপাত্তকে সহজ ও মানবিক ভাষায় বুঝিয়ে দেয়।
          </p>
        </div>

        {/* Live Context Badge */}
        <div className="px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-caption flex items-center gap-4">
          <div>
            <p className="text-[11px] text-[var(--muted)] font-semibold">ওয়ালেট ব্যালেন্স</p>
            <p className="font-heading font-extrabold text-[var(--navy)] text-[15px]">{formatMoney(profile.currentBalance)}</p>
          </div>
          <div className="border-l border-[var(--line)] pl-4">
            <p className="text-[11px] text-[var(--muted)] font-semibold">ঘাটতির ঝুঁকি</p>
            <p className={`font-heading font-extrabold text-[15px] ${risk.riskLevel === 'HIGH' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
              {Math.round(risk.probability * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Context Inspector (4 cols) */}
        <div className="lg:col-span-4 upay-card p-5 space-y-4">
          <div>
            <h3 className="text-[13px] font-bold text-[var(--navy)] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
              <span>যাচাইকৃত মডেল উপাত্ত</span>
            </h3>
            <p className="text-[11.5px] text-[var(--muted)] mt-0.5 font-medium">
              এআই কেবল এই বাস্তব তথ্যের ভিত্তিতে উত্তর দেয়
            </p>
          </div>

          <div className="space-y-2 text-[13px]">
            <div className="p-3 rounded-[12px] bg-[var(--bg)] border border-[var(--line)] flex justify-between">
              <span className="text-[var(--muted)]">মাসিক মোট আয়</span>
              <span className="font-heading font-bold text-[var(--navy)]">{formatMoney(profile.monthlyIncome)}</span>
            </div>
            <div className="p-3 rounded-[12px] bg-[var(--bg)] border border-[var(--line)] flex justify-between">
              <span className="text-[var(--muted)]">মাসিক গড় খরচ</span>
              <span className="font-heading font-bold text-[var(--navy)]">{formatMoney(profile.averageMonthlySpending)}</span>
            </div>
            <div className="p-3 rounded-[12px] bg-[var(--bg)] border border-[var(--line)] flex justify-between">
              <span className="text-[var(--muted)]">বেতন আসতে বাকি</span>
              <span className="font-heading font-bold text-[var(--navy)]">{profile.daysUntilNextIncome} দিন</span>
            </div>
            <div className="p-3 rounded-[12px] bg-[var(--bg)] border border-[var(--line)] flex justify-between">
              <span className="text-[var(--muted)]">মাস শেষের প্রজেকশন</span>
              <span className="font-heading font-bold text-[var(--danger)]">{formatMoney(forecast.monthEndForecast)}</span>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-3">
            <h4 className="text-[11.5px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">
              প্রস্তাবিত প্রশ্নাবলী
            </h4>
            <div className="space-y-1.5">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2.5 rounded-[12px] bg-[var(--bg)] hover:bg-[var(--yellow-soft)] text-[12.5px] text-[var(--ink)] hover:text-[var(--navy)] transition-colors border border-[var(--line)] cursor-pointer font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Chat Feed (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[560px] upay-card overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-[var(--yellow)] flex items-center justify-center shrink-0 font-black text-sm shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-[18px] p-4 text-[14px] leading-relaxed space-y-1.5 ${
                    msg.role === 'user'
                      ? 'bg-[var(--navy)] text-white font-medium rounded-tr-xs shadow-xs'
                      : 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-tl-xs whitespace-pre-line'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`flex items-center justify-between gap-2 text-[10px] ${
                      msg.role === 'user' ? 'text-slate-300' : 'text-[var(--muted)]'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        msg.source.includes('gemini')
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                          : 'bg-white border border-[var(--line)] text-[var(--muted)]'
                      }`}>
                        {msg.source.includes('gemini') ? `✨ Google ${msg.source}` : '⚡ Deterministic Fallback'}
                      </span>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--yellow)] text-[var(--navy)] flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-[var(--yellow-soft)] flex items-center justify-center text-[var(--navy)] shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-[18px] bg-[var(--bg)] border border-[var(--line)] text-caption text-[var(--muted)] flex items-center gap-2 font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-[var(--yellow)] animate-pulse"></span>
                  <span>জেমিনাই দিয়ে তথ্য বিশ্লেষণ করা হচ্ছে...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-[var(--bg)] border-t border-[var(--line)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="আপনার ঝুঁকি, অস্বাভাবিক খরচ বা সঞ্চয় পরিকল্পনা নিয়ে প্রশ্ন করুন..."
                className="flex-1 px-4 py-2.5 rounded-[14px] bg-white border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none placeholder:text-[var(--muted)]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary !px-5 !py-2.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[var(--navy)]" />
                <span className="hidden sm:inline">জিজ্ঞাসা করুন</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
