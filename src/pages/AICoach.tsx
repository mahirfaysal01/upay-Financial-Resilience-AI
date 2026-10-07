import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import { buildCoachContext, askAICoach } from '../services/aiCoachEngine';
import { startSpeechListening, speakText } from '../utils/speechVoiceHelper';
import { CardSkeleton } from '../components/CardSkeleton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  model?: string;
}

export const AICoach: React.FC = () => {
  const { customer, profile, risk, forecast, anomalies, lang, formatMoney } = useFinancial();
  const { notifySuccess } = useNotification();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechActiveObj, setSpeechActiveObj] = useState<{ stop: () => void } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const daysToCritical = forecast.daysUntilCriticalBalance || profile.daysUntilNextIncome || 6;
  const initialGreeting = lang === 'bn'
    ? `আসসালামু আলাইকুম ${customer.name}! আমি আপনার উপায় এআই রেজিলিয়েন্স সহকারী (Google Gemini 2.5 Flash ও অন-ডিভাইস এমএল চালিত)। আপনার বর্তমান ওয়ালেট ব্যালেন্স ${formatMoney(profile.currentBalance)} এবং পরবর্তী বেতন আসতে এখনো ${profile.daysUntilNextIncome} দিন বাকি। আমাদের টাইম-সিরিজ পূর্বাভাস অনুযায়ী আগামী ${daysToCritical} দিনের মধ্যে আপনার তারল্য ঘাটতির ঝুঁকি ${Math.round(risk.probability * 100)}% (${risk.riskLevel === 'HIGH' ? 'উচ্চ' : risk.riskLevel === 'MODERATE' ? 'মাঝারি' : 'নিয়ন্ত্রিত'})। অপ্রয়োজনীয় ক্যাশ-আউট ফি সাশ্রয়, ইউটিলিটি বিল বাফার লক করা কিংবা উৎসবের লাল ভ্যালি সামলানো বিষয়ে আমাকে যেকোনো প্রশ্ন করতে পারেন!`
    : `Hello ${customer.name}! I am your upay AI Resilience Coach (Powered by Google Gemini 2.5 Flash with on-device ML fallback). Your wallet balance is ${formatMoney(profile.currentBalance)} and next income is expected in ${profile.daysUntilNextIncome} days. Our predictive cash-flow engine projects a ${Math.round(risk.probability * 100)}% (${risk.riskLevel}) liquidity shortage risk within ~${daysToCritical} days. Ask me how to lock your utility bill buffer, avoid costly agent cash-out fees, or absorb upcoming festival expenses!`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      text: initialGreeting,
      timestamp: 'এখনই',
      source: 'Google Gemini 2.5 Flash / On-Device Resilience Engine',
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: 'm1',
        role: 'assistant',
        text: initialGreeting,
        timestamp: 'এখনই',
        source: 'Google Gemini 2.5 Flash / On-Device Resilience Engine',
      },
    ]);
  }, [customer.customer_id, lang, profile.currentBalance, risk.probability]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    notifySuccess(
      lang === 'bn' ? 'পরামর্শ কপি করা হয়েছে' : 'Copied to Clipboard',
      lang === 'bn' ? 'এআই পরামর্শ সফলভাবে ক্লিপবোর্ডে কপি হয়েছে।' : 'AI advice copied successfully.',
      { duration: 2500 }
    );
    setTimeout(() => setCopiedId(null), 2000);
  };

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

      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await askAICoach(query, coachContext, history, lang);

      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        model: response.model,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      speechActiveObj?.stop();
      setIsListening(false);
      setSpeechActiveObj(null);
      return;
    }

    setIsListening(true);
    const listener = startSpeechListening(
      lang,
      (transcript) => {
        setInput(transcript);
        setIsListening(false);
        setSpeechActiveObj(null);
      },
      (err) => {
        console.warn('Voice error', err);
        setIsListening(false);
        setSpeechActiveObj(null);
      },
      () => {
        setIsListening(false);
        setSpeechActiveObj(null);
      }
    );

    if (listener) {
      setSpeechActiveObj(listener);
    } else {
      setIsListening(false);
    }
  };

  const suggestedPrompts = lang === 'bn'
    ? [
        'হ্যালো! আমাকে কীভাবে সাহায্য করতে পারো?',
        'আমার আর্থিক ঘাটতির ঝুঁকি কেমন?',
        'খাবারে ১৫% খরচ কমালে কী লাভ হবে?',
        'আমার ল্যাপটপ কেনার সঞ্চয় লক্ষ্য কেমন চলছে?',
        'টাকা জমানোর সহজ কিছু নিয়ম বলো',
      ]
    : [
        'Hi! How can you help me with my money?',
        'Why is my shortage risk flagged?',
        'What happens if I cut food spending by 15%?',
        'How can I save more money each month?',
        'Explain the 50/30/20 budgeting rule',
      ];

  return (
    <div className="space-y-6 route-fade-slide">
      {/* Header */}
      <div className="upay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--navy)] via-[var(--navy-2)] to-amber-500 text-[var(--yellow)] flex items-center justify-center font-black shadow-lg shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-radar-ripple pointer-events-none"></div>
            <Bot className="w-7 h-7 text-amber-300 relative z-10" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[11.5px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{lang === 'bn' ? 'মডেল: Google Gemini 2.5 Flash' : 'Model: Google Gemini 2.5 Flash'}</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                {lang === 'bn' ? 'অন-ডিভাইস এমএল ফলব্যাক অ্যাক্টিভ' : 'On-Device ML Fallback Active'}
              </span>
            </div>
            <h2 className="text-[var(--brand-primary)] text-xl font-heading font-extrabold mt-1">
              {lang === 'bn' ? 'উপায় এআই আর্থিক পরামর্শক' : 'upay AI Financial Coach'}
            </h2>
            <p className="text-caption text-[var(--muted)] max-w-xl">
              {lang === 'bn'
                ? 'আপনার ক্যাশ-ফ্লো, ইউটিলিটি বিল ও ঘাটতির ঝুঁকি বিশ্লেষণ করে সহজ ও সাবলীল বাংলায় তাৎক্ষণিক দিকনির্দেশনা।'
                : 'Translates complex cash-flow patterns and liquidity shortfalls into proactive Bengali & English coaching.'}
            </p>
          </div>
        </div>

        {/* Live Context Badge */}
        <div className="px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-caption flex items-center gap-4 shrink-0 shadow-xs">
          <div>
            <p className="text-[11px] text-[var(--muted)] font-semibold">{lang === 'bn' ? 'ওয়ালেট ব্যালেন্স' : 'Wallet Balance'}</p>
            <p className="font-heading font-extrabold text-[var(--navy)] text-[15px]">{formatMoney(profile.currentBalance)}</p>
          </div>
          <div className="border-l border-[var(--line)] pl-4">
            <p className="text-[11px] text-[var(--muted)] font-semibold">{lang === 'bn' ? 'ঘাটতির ঝুঁকি' : 'Shortage Risk'}</p>
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
                  className={`max-w-[85%] sm:max-w-[75%] rounded-[20px] p-4 text-[14px] leading-relaxed space-y-2 transition-all ${
                    msg.role === 'user'
                      ? 'bg-[var(--navy)] text-white font-medium rounded-tr-xs shadow-md'
                      : 'bg-white text-[var(--ink)] border border-[var(--line)] hover:border-amber-300/80 rounded-tl-xs shadow-xs whitespace-pre-line'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`flex items-center justify-between gap-2 text-[10.5px] pt-1 border-t ${
                      msg.role === 'user' ? 'border-white/10 text-slate-300' : 'border-slate-100 text-[var(--muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                          {lang === 'bn' ? 'উপায় এআই' : 'upay AI'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {msg.role === 'assistant' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1 rounded-md hover:bg-slate-100 text-[var(--muted)] hover:text-[var(--navy)] transition-colors cursor-pointer"
                            title={lang === 'bn' ? 'কপি করুন' : 'Copy'}
                            aria-label="Copy message"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => speakText(msg.text, lang)}
                            className="p-1 rounded-md hover:bg-slate-100 text-[var(--brand-primary)] transition-colors cursor-pointer"
                            title={lang === 'bn' ? 'ভয়েস শুনুন' : 'Read Aloud'}
                            aria-label="Read message aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
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
              <div className="flex gap-3 items-start w-full max-w-lg">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4 animate-spin text-amber-600" />
                </div>
                <div className="flex-1">
                  <CardSkeleton
                    variant="insight"
                    className="!p-4.5 !rounded-[22px] !border-amber-200/80 !bg-white/95 shadow-xs"
                    showAction={false}
                  />
                  <div className="flex items-center gap-2 mt-2 px-1 text-[11px] text-[var(--muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>
                      {lang === 'bn'
                        ? 'উপায় নিউরাল এআই আর্থিক ডেটা বিশ্লেষণ করছে...'
                        : 'upay Neural AI is evaluating cash flows...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {isListening && (
              <div className="flex gap-2.5 items-center p-3 rounded-[14px] bg-red-50 border border-red-200 text-red-800 text-[13px] font-bold animate-pulse">
                <Mic className="w-4 h-4 text-red-600 animate-bounce" />
                <span>{lang === 'bn' ? 'বাংলায় কথা বলুন... শুনছি...' : 'Listening in English... Speak now...'}</span>
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
                placeholder={
                  isListening
                    ? (lang === 'bn' ? 'শুনছি... মুখে কথা বলুন...' : 'Listening...')
                    : (lang === 'bn' ? 'আপনার ঝুঁকি বা খরচ নিয়ে প্রশ্ন করুন বা মাইকে বলুন...' : 'Ask question or speak into mic...')
                }
                className="flex-1 px-4 py-2.5 rounded-[14px] bg-white border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none placeholder:text-[var(--muted)]"
              />

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-[14px] border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-300 animate-pulse'
                    : 'bg-white hover:bg-[var(--brand-accent-soft)] text-[var(--brand-primary)] border-[var(--line)]'
                }`}
                title={lang === 'bn' ? 'মুখে বাংলায় কথা বলুন' : 'Speak into Microphone'}
                aria-label={lang === 'bn' ? 'ভয়েস ইনপুট' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

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
