import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Calendar,
  Sparkles,
  DollarSign,
  PieChart as PieIcon,
  Bot,
  Send,
  CheckCircle2,
  Receipt,
  Target,
  Clock,
  ArrowUpRight,
  Download,
  Lock,
  Unlock,
  Shield,
  Zap,
  Award,
  Mic,
  MicOff,
  Volume2,
  QrCode,
  Check,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import { askAICoach, buildCoachContext, fetchGeminiDeepInsights } from '../services/aiCoachEngine';
import { useFinancialVerdict } from '../services/aiService';
import { toBengaliNumber } from '../utils/translations';
import { exportMonthlyFinancialDataCSV } from '../utils/exportFinancialData';
import { startSpeechListening, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../utils/speechVoiceHelper';

export const Dashboard: React.FC = () => {
  const {
    customer,
    profile,
    transactions,
    forecast,
    risk,
    anomalies,
    recommendations,
    goals,
    lang,
    t,
    formatMoney,
    isBillBufferLocked,
    toggleBillBuffer,
    isDailySpendCapped,
    toggleDailySpendCap,
    isEmergencyBufferActive,
    toggleEmergencyBuffer,
    isMerchantQrOptimized,
    toggleMerchantQrOptimized,
    setIsResilienceModalOpen,
  } = useFinancial();

  const { notifyFinancial } = useNotification();

  // AI Advice Chat state in dashboard
  const [adviceInput, setAdviceInput] = useState('');
  const [adviceMessages, setAdviceMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; source?: string; model?: string }>
  >([]);
  const [isAskingAI, setIsAskingAI] = useState(false);

  // Live AI Financial Verdict state via OpenRouter
  const {
    getVerdict,
    verdict,
    loading: isVerdictLoading,
    resetVerdict,
  } = useFinancialVerdict();

  const handleRunAiVerdict = async () => {
    try {
      await getVerdict({
        name: customer.name,
        customerId: customer.customer_id,
        currentBalance: profile.currentBalance,
        monthlyIncome: profile.monthlyIncome,
        monthlySpending: profile.averageMonthlySpending,
        shortageRisk: risk.probability,
        riskLevel: risk.riskLevel,
        daysUntilDeficit: forecast.daysUntilCriticalBalance || profile.daysUntilNextIncome || 9,
        upcomingBills: profile.upcomingExpenses,
        anomalies: anomalies.map((a) => a.category),
      });
    } catch (e) {
      console.error('AI Verdict execution error:', e);
    }
  };

  // Bangla Voice Input state
  const [isListening, setIsListening] = useState(false);
  const [speechActiveObj, setSpeechActiveObj] = useState<{ stop: () => void } | null>(null);

  // CSV Data Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      const result = exportMonthlyFinancialDataCSV({
        customer,
        profile,
        transactions,
        anomalies,
        risk,
        forecast,
        lang,
      });

      if (result.success) {
        setExportSuccess(true);
        notifyFinancial(
          lang === 'bn' ? 'সিএসভি ডাউনলোড সফল' : 'CSV Export Complete',
          lang === 'bn'
            ? `${customer.name}-এর মাসিক আর্থিক বিবরণী (${result.filename}) ডাউনলোড হয়েছে।`
            : `Monthly financial statement (${result.filename}) downloaded successfully.`,
          {
            financialDetails: {
              amount: profile.monthlyIncome,
              category: lang === 'bn' ? 'মাসিক রিপোর্ট' : 'Monthly Statement',
              trend: 'up',
            },
            duration: 5000,
          }
        );

        setTimeout(() => {
          setExportSuccess(false);
          setIsExporting(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setIsExporting(false);
    }
  };

  // Synchronize greeting message and critical financial alerts on customer or language change
  useEffect(() => {
    const greeting = lang === 'bn'
      ? `আসসালামু আলাইকুম ${customer.name === 'Rahim Hasan' ? 'রহিম' : customer.name}! আমি উপায় এআই সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি? আপনার ওয়ালেট, বাজেট, আসন্ন বিল কিংবা যেকোনো আর্থিক বিষয়ে প্রশ্ন করতে পারেন।`
      : `Hello ${customer.name}! I am your upay AI financial assistant. How can I help you today? Feel free to ask me anything about your wallet, upcoming bills, budget, or general financial topics!`;

    setAdviceMessages([
      {
        role: 'assistant',
        text: greeting,
        source: 'upay-ai',
      },
    ]);
  }, [customer.customer_id, lang]);

  const handleAskAI = async (queryText?: string) => {
    const q = (queryText || adviceInput).trim();
    if (!q || isAskingAI) return;

    setAdviceMessages((prev) => [...prev, { role: 'user', text: q }]);
    setAdviceInput('');
    setIsAskingAI(true);

    try {
      const coachContext = buildCoachContext(profile, risk, forecast.monthEndForecast, anomalies);
      const res = await askAICoach(q, coachContext, adviceMessages, lang);
      setAdviceMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.text,
          source: res.source,
          model: res.model,
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleGenerateDeepInsights = async () => {
    if (isAskingAI) return;
    setIsAskingAI(true);
    setAdviceMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: lang === 'bn' ? 'আমার জন্য বিস্তারিত আর্থিক রেজিলিয়েন্স অ্যানালাইসিস দিন।' : 'Generate comprehensive financial resilience analysis for me.',
      },
    ]);

    try {
      const coachContext = buildCoachContext(profile, risk, forecast.monthEndForecast, anomalies);
      const res = await fetchGeminiDeepInsights(coachContext, lang);
      if (res && res.text) {
        setAdviceMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: res.text!,
            source: res.source,
          },
        ]);
      } else {
        const fallback = await askAICoach(
          lang === 'bn' ? 'আমার আর্থিক ঝুঁকি পর্যালোচনা দিন' : 'Review my financial resilience posture',
          coachContext,
          adviceMessages,
          lang
        );
        setAdviceMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: fallback.text,
            source: fallback.source,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAskingAI(false);
    }
  };

  // Toggle voice listening
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
        setAdviceInput(transcript);
        setIsListening(false);
        setSpeechActiveObj(null);
        notifyFinancial(
          lang === 'bn' ? 'ভয়েস ইনপুট গৃহীত' : 'Voice Input Captured',
          transcript,
          { duration: 3000 }
        );
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

  // Category palette strictly using the official upay brand tokens
  const BRAND_PIE_COLORS = [
    '#FFC400', // upay Accent Yellow
    '#001C44', // upay Brand Navy
    '#1FA971', // Success Green
    '#E5484D', // Danger Red
    '#5E6D82', // Muted Slate
  ];

  const categoryNames: Record<string, { bn: string; en: string }> = {
    Food: { bn: 'খাবার ও রেস্তোরাঁ', en: 'Food & Dining' },
    Shopping: { bn: 'কেনাকাটা', en: 'Shopping' },
    'Cash-out': { bn: 'ক্যাশ-আউট', en: 'Cash-out' },
    Bills: { bn: 'ইউটিলিটি বিল', en: 'Utility Bills' },
    Transport: { bn: 'যাতায়াত', en: 'Transport' },
    Healthcare: { bn: 'স্বাস্থ্যসেবা', en: 'Healthcare' },
    Education: { bn: 'শিক্ষা', en: 'Education' },
    Entertainment: { bn: 'বিনোদন', en: 'Entertainment' },
    Recharge: { bn: 'মোবাইল রিচার্জ', en: 'Mobile Recharge' },
    Utilities: { bn: 'বিদ্যুৎ ও গ্যাস', en: 'Utilities' },
    Other: { bn: 'অন্যান্য', en: 'Other' },
  };

  const categoryPieData = anomalies.slice(0, 5).map((a, i) => ({
    name: lang === 'bn' ? (categoryNames[a.category]?.bn || a.category) : (categoryNames[a.category]?.en || a.category),
    value: a.currentSpending,
    color: BRAND_PIE_COLORS[i % BRAND_PIE_COLORS.length],
  }));

  // Line chart data (14-day trend)
  const lineChartData = forecast.dailyProjections.slice(0, 14).map((p) => ({
    day: lang === 'bn' ? `দিন ${toBengaliNumber(p.dayOffset)}` : `Day ${p.dayOffset}`,
    balance: p.projectedBalance,
    baseline: p.baselineBalance,
  }));

  // Circular gauge calculations
  const riskPct = Math.round(risk.probability * 100);
  const displayRiskPct = lang === 'bn' ? `${toBengaliNumber(riskPct)}%` : `${riskPct}%`;
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (riskPct / 100) * circumference;

  return (
    <div className="space-y-6 route-fade-slide">
      {/* 1) HERO BANNER WITH RISK GAUGE */}
      <section
        className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-primary)] to-[var(--brand-primary-dark)] text-white p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,28,68,0.12)] border border-[var(--brand-primary-dark)]"
        aria-label={lang === 'bn' ? 'অ্যাকাউন্ট সারসংক্ষেপ ও আর্থিক স্বাস্থ্য' : 'Account Summary & Resilience Overview'}
      >
        {/* Soft decorative background circles */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[var(--brand-accent)] opacity-10 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-10 left-1/3 w-32 h-32 rounded-full bg-[var(--brand-accent)] opacity-15 blur-xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (Content & Buttons) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.2 rounded-full bg-white/10 text-white text-[12.5px] font-semibold tracking-wide backdrop-blur-xs border border-white/15">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)]"></span>
              <span>
                {lang === 'bn' ? 'অ্যাকাউন্ট বিশ্লেষণ · অক্টোবর ২০২৬' : 'Account Analytics · October 2026'}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-white leading-[1.25]">
              {lang === 'bn'
                ? 'সমস্যা হওয়ার আগেই জানুন আপনার ভবিষ্যৎ আর্থিক অবস্থা'
                : 'Know your financial future before it becomes a problem'}
            </h1>

            <p className="text-white/85 text-[15.5px] max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'উপায় এআই আপনার ওয়ালেটের খরচের গতিধারা ও আসন্ন বিল পর্যালোচনা করে সম্ভাব্য ঘাটতি পূর্বাভাস দেয়, যাতে মাস শেষে টানাপোড়েন এড়ানো যায়।'
                : 'upay AI analyzes your cash flows and scheduled obligations to forecast liquidity pressure before month-end.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleRunAiVerdict}
                disabled={isVerdictLoading}
                className="btn-primary !bg-[var(--brand-accent)] hover:!shadow-[0_0_25px_rgba(255,194,14,0.6)] !text-[var(--brand-primary)] shine-effect cursor-pointer transition-all active:scale-98"
                title={lang === 'bn' ? 'তাৎক্ষণিক এআই রায় জানুন' : 'Get Instant AI Verdict'}
              >
                <Sparkles className={`w-4 h-4 ${isVerdictLoading ? 'animate-spin' : 'animate-pulse'}`} />
                <span>
                  {isVerdictLoading
                    ? (lang === 'bn' ? 'এআই মডেল বিশ্লেষণ করছে...' : 'Analyzing with OpenRouter AI...')
                    : (lang === 'bn' ? '✨ এআই তাৎক্ষণিক রায় জানুন' : '✨ Instant AI Verdict')}
                </span>
              </button>
              <Link to="/simulator" className="btn-secondary-white">
                <Sliders className="w-4 h-4 text-white" />
                <span>{lang === 'bn' ? 'সিমুলেশন শুরু করুন' : 'Launch Simulator'}</span>
              </Link>
              <Link to="/coach" className="btn-secondary-white">
                <Bot className="w-4 h-4 text-white" />
                <span>{lang === 'bn' ? 'এআই পরামর্শক' : 'AI Coach'}</span>
              </Link>
              <button
                onClick={() => setIsResilienceModalOpen(true)}
                className="btn-secondary-white !border-[var(--brand-accent)] !text-[var(--brand-accent)] hover:!bg-[var(--brand-accent)]/15"
                title={lang === 'bn' ? 'রেজিলিয়েন্স সনদ ও স্কোরকার্ড দেখুন' : 'View Financial Resilience Scorecard'}
              >
                <Award className="w-4 h-4 text-[var(--brand-accent)]" />
                <span>{lang === 'bn' ? 'রেজিলিয়েন্স সনদ' : 'Resilience Certificate'}</span>
              </button>
            </div>
          </div>

          {/* Right Column (Circular Risk Gauge) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-white shadow-[0_12px_32px_rgba(0,28,68,0.25)] p-4 flex flex-col items-center justify-center border-4 border-white/25">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="9"
                />
                {/* Animated Red Arc */}
                <circle
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  fill="transparent"
                  stroke={risk.riskLevel === 'HIGH' ? '#E5484D' : risk.riskLevel === 'MODERATE' ? '#FFC400' : '#1FA971'}
                  strokeWidth="9.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="gauge-arc-anim"
                />
              </svg>

              {/* Center Content in Gauge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {lang === 'bn' ? 'ঘাটতির ঝুঁকি' : 'Shortage Risk'}
                </span>
                <span className={`font-heading font-extrabold text-[38px] sm:text-[42px] leading-none my-0.5 ${
                  risk.riskLevel === 'HIGH' ? 'text-[var(--danger)]' : risk.riskLevel === 'MODERATE' ? 'text-amber-600' : 'text-[var(--success)]'
                }`}>
                  {displayRiskPct}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                  risk.riskLevel === 'HIGH'
                    ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                    : risk.riskLevel === 'MODERATE'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {risk.riskLevel === 'HIGH'
                    ? (lang === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk')
                    : risk.riskLevel === 'MODERATE'
                    ? (lang === 'bn' ? 'মাঝারি ঝুঁকি' : 'Moderate')
                    : (lang === 'bn' ? 'নিরাপদ' : 'Safe Buffer')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5) LIVE AI RESILIENCE VERDICT HUD (POWERED BY OPENROUTER & GEMINI) */}
      <section
        id="ai-verdict"
        className="relative overflow-hidden rounded-[26px] transition-all duration-300 scroll-mt-24"
        aria-label={lang === 'bn' ? 'লাইভ এআই আর্থিক রায়' : 'Live AI Financial Verdict'}
      >
        {isVerdictLoading ? (
          /* SCANNING RADAR HUD STATE */
          <div className="glass-panel-navy p-8 sm:p-10 text-white rounded-[26px] border border-amber-400/40 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-radar-ripple"></div>
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-300 animate-spin"></div>
                <div className="w-12 h-12 rounded-full bg-amber-400 text-[var(--navy)] flex items-center justify-center font-black shadow-lg">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>{lang === 'bn' ? 'ওপেনরাউটার এআই গাণিতিক বিশ্লেষণ চলছে' : 'OpenRouter AI Model Inquiring'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
                  {lang === 'bn'
                    ? `${customer.name}-এর ওয়ালেটের সম্ভাব্য নগদ ঘাটতি গণনা করা হচ্ছে...`
                    : `Calculating Liquidity Runout for ${customer.name}...`}
                </h3>
                <p className="text-white/75 text-sm max-w-xl">
                  {lang === 'bn'
                    ? 'আয়, ব্যয়ের অস্বাভাবিকতা, আসন্ন বিল ও পূর্ববর্তী ধারা বিশ্লেষণ করে নিউরাল মডেলে চূড়ান্ত রায় প্রস্তুত হচ্ছে।'
                    : 'Correlating income frequency, anomaly variances, and utility bills using neural reasoning model.'}
                </p>
              </div>
            </div>
          </div>
        ) : verdict ? (
          /* ACTIVE VERDICT HUD STATE */
          <div className="glass-panel-navy p-6 sm:p-8 text-white rounded-[26px] border border-amber-400/50 shadow-2xl relative overflow-hidden">
            {/* Animated ambient background lights */}
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-5">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[var(--navy)] flex items-center justify-center font-black shadow-lg">
                    <Sparkles className="w-5 h-5 text-[var(--navy)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                        {lang === 'bn' ? 'এআই তাৎক্ষণিক রেজিলিয়েন্স রায়' : 'Instant AI Resilience Verdict'}
                      </h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-300 border border-amber-400/40">
                        {verdict.modelUsed || 'Gemini Flash'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      {lang === 'bn' ? `গ্রাহক: ${customer.name} · মূল্যায়ন সম্পন্ন: লাইভ` : `Customer: ${customer.name} · Evaluated: Live`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunAiVerdict}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
                    title={lang === 'bn' ? 'পুনরায় বিশ্লেষণ করুন' : 'Re-run analysis'}
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'bn' ? 'পুনরায় স্ক্যান' : 'Re-Scan'}</span>
                  </button>
                  <button
                    onClick={resetVerdict}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                    title={lang === 'bn' ? 'লুকান' : 'Dismiss'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Verdict Banner & Risk Score Gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                        verdict.riskLevel === 'HIGH'
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40 glow-danger-neon'
                          : verdict.riskLevel === 'MODERATE'
                          ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40 glow-yellow-neon'
                          : 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 glow-success-neon'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{verdict.riskLevel === 'HIGH' ? (lang === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk') : verdict.riskLevel === 'MODERATE' ? (lang === 'bn' ? 'মাঝারি ঝুঁকি' : 'Moderate') : (lang === 'bn' ? 'স্থিতিশীল' : 'Stable')}</span>
                    </span>
                    <span className="text-xs text-white/70">
                      {lang === 'bn' ? `ঘাটতি পর্যন্ত অবশিষ্ট: প্রায় ${toBengaliNumber(verdict.daysUntilDeficit || 9)} দিন` : `Days until deficit: ~${verdict.daysUntilDeficit || 9} days`}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white leading-tight">
                    {verdict.verdictHeadline}
                  </h2>

                  <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    {verdict.verdictExplanation}
                  </p>
                </div>

                {/* Score & Buffer Recommendation Widget */}
                <div className="lg:col-span-4 bg-white/10 rounded-2xl p-4 border border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70">{lang === 'bn' ? 'এআই ঝুঁকি সূচক' : 'AI Risk Metric'}</span>
                    <span className="text-lg font-heading font-extrabold text-amber-300">{toBengaliNumber(verdict.riskScore)}%</span>
                  </div>

                  {/* Progress Bar with neon gradient */}
                  <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        verdict.riskScore >= 70
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                          : verdict.riskScore >= 40
                          ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      }`}
                      style={{ width: `${verdict.riskScore}%` }}
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-white/70">{lang === 'bn' ? 'প্রস্তাবিত সেফটি বাফার:' : 'Recommended Buffer:'}</span>
                    <span className="font-heading font-black text-amber-300 text-sm">
                      {formatMoney(verdict.safetyBufferRecommendation || 2000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Points */}
              {verdict.recommendedActions && verdict.recommendedActions.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'কার্যকর পদক্ষেপসমূহ (Action Items):' : 'Key Action Items:'}</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {verdict.recommendedActions.map((actionText, idx) => (
                      <div
                        key={idx}
                        className="bg-white/8 hover:bg-white/12 border border-white/15 hover:border-amber-400/50 p-3.5 rounded-2xl transition-all duration-200 flex items-start gap-2.5 group"
                      >
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed font-medium">
                          {actionText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* IDLE / INVITATION BANNER WITH SHIMMER */
          <div className="bg-gradient-to-r from-[var(--navy)] via-[var(--navy-2)] to-[#0A1A3F] p-5 sm:p-6 rounded-[26px] border border-amber-400/30 shadow-lg text-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-[var(--navy)] flex items-center justify-center font-black shadow-md shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-base sm:text-lg text-white">
                    {lang === 'bn' ? 'তাৎক্ষণিক এআই রেজিলিয়েন্স বিশ্লেষণ' : 'Instant AI Resilience Analysis'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    OpenRouter Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/75 max-w-xl">
                  {lang === 'bn'
                    ? 'আপনার আয়ের সাথে ব্যয়ের অনুপাত, চলতি মাসের অসঙ্গতি ও আসন্ন বিল যাচাই করে এআই রায় তৈরি করুন।'
                    : 'Generate a proactive AI financial verdict on cash-flow runway, deficit risks, and safety buffers.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiVerdict}
              className="btn-primary !bg-[var(--brand-accent)] hover:!shadow-[0_0_20px_rgba(255,194,14,0.6)] !text-[var(--brand-primary)] shine-effect cursor-pointer whitespace-nowrap self-stretch sm:self-auto"
            >
              <Bot className="w-4 h-4" />
              <span>{lang === 'bn' ? 'এআই রায় জানুন' : 'Run Verdict'}</span>
            </button>
          </div>
        )}
      </section>

      {/* 2) ONE-TAP ACTIONABLE INTERVENTIONS (HACKATHON WINNER FEATURE) */}
      <section className="upay-card p-5 sm:p-6 space-y-4" aria-label={lang === 'bn' ? 'এক-ক্লিকে রেজিলিয়েন্স অ্যাকশন' : 'One-Tap Resilience Actions'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--brand-accent)] text-[var(--brand-primary)] flex items-center justify-center font-black">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[var(--brand-primary)]">
                {lang === 'bn' ? 'এক-ক্লিকে রেজিলিয়েন্স অ্যাকশন (Actionable Interventions)' : 'One-Tap Financial Interventions'}
              </h3>
              <p className="text-caption text-[var(--text-muted)]">
                {lang === 'bn'
                  ? 'শুধু পরামর্শ নয়; নিচের বাটনগুলোতে চাপ দিয়ে সরাসরি আপনার ওয়ালেটের ঝুঁকি হ্রাস করুন'
                  : 'Proactive safeguards you can toggle in real-time to mitigate month-end liquidity stress'}
              </p>
            </div>
          </div>
          <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            {lang === 'bn' ? 'লাইভ অ্যালগরিদম সক্রিয়' : 'Live Calculation Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Action 1: Lock Bill Buffer */}
          <button
            onClick={() => {
              toggleBillBuffer();
              notifyFinancial(
                !isBillBufferLocked
                  ? (lang === 'bn' ? 'বিল বাফার লক সম্পন্ন' : 'Bill Buffer Locked')
                  : (lang === 'bn' ? 'বিল বাফার আনলকড' : 'Bill Buffer Unlocked'),
                !isBillBufferLocked
                  ? (lang === 'bn' ? '৳২,০০০ ইউটিলিটি বিলের টাকা সুরক্ষিত রাখা হয়েছে। ঘাটতি ঝুঁকি ১৪% কমেছে।' : '৳2,000 utility buffer locked. Shortage risk dropped 14%.')
                  : (lang === 'bn' ? 'ইউটিলিটি বাফার পুনরায় মূল ব্যালেন্সে যুক্ত হয়েছে।' : 'Buffer returned to general balance.')
              );
            }}
            className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              isBillBufferLocked
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-[var(--bg-page)] border-[var(--border)] hover:border-[var(--brand-primary)]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isBillBufferLocked ? (
                  <Lock className="w-4.5 h-4.5 text-emerald-600" />
                ) : (
                  <Unlock className="w-4.5 h-4.5 text-[var(--text-muted)]" />
                )}
                <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                  {lang === 'bn' ? '১. বিল বাফার লক' : '1. Lock Bill Buffer'}
                </span>
              </div>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                isBillBufferLocked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isBillBufferLocked ? (lang === 'bn' ? 'লকড' : 'LOCKED') : (lang === 'bn' ? 'লক করুন' : 'LOCK')}
              </span>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              {lang === 'bn'
                ? 'ডিপিডিসি ও ইন্টারনেট বিলের ৳২,০০০ আলাদা করে সুরক্ষিত রাখে যাতে ভুলে খরচ না হয়।'
                : 'Reserves ৳2,000 for utility bills so it cannot be spent accidentally.'}
            </p>
            <div className="text-[12px] font-bold text-emerald-700 flex items-center gap-1">
              <span>{isBillBufferLocked ? '✓ ঝুঁকি হ্রাস: -১৪%' : '+ ট্যাপ করে ১৪% ঝুঁকি কমান'}</span>
            </div>
          </button>

          {/* Action 2: Daily Spending Cap */}
          <button
            onClick={() => {
              toggleDailySpendCap();
              notifyFinancial(
                !isDailySpendCapped
                  ? (lang === 'bn' ? 'দৈনিক ব্যয়ের সিলিং সক্রিয়' : 'Daily Spend Cap Active')
                  : (lang === 'bn' ? 'ব্যয়ের সিলিং নিষ্ক্রিয়' : 'Spend Cap Disabled'),
                !isDailySpendCapped
                  ? (lang === 'bn' ? 'পরবর্তী ১১ দিনের দৈনিক খরচের সীমা ৳২৯০ সেট করা হয়েছে।' : 'Daily spending capped at ৳290/day.')
                  : (lang === 'bn' ? 'স্বাভাবিক দৈনিক গড় খরচে ফিরে গেছে।' : 'Reset to default daily pace.')
              );
            }}
            className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              isDailySpendCapped
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-[var(--bg-page)] border-[var(--border)] hover:border-[var(--brand-primary)]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`w-4.5 h-4.5 ${isDailySpendCapped ? 'text-emerald-600' : 'text-[var(--text-muted)]'}`} />
                <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                  {lang === 'bn' ? '২. দৈনিক ব্যয় সিলিং' : '2. Daily Spend Cap'}
                </span>
              </div>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                isDailySpendCapped ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isDailySpendCapped ? (lang === 'bn' ? '৳২৯০/দিন সক্রিয়' : '৳290/d ON') : (lang === 'bn' ? 'সেট করুন' : 'SET')}
              </span>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              {lang === 'bn'
                ? 'বেতন আসার পূর্ব পর্যন্ত প্রতিদিনের খরচ সর্বোচ্চ ৳২৯০-তে সীমাবদ্ধ রাখার স্মার্ট গার্ড।'
                : 'Smart guard capping daily outflow at ৳290 to prevent month-end depletion.'}
            </p>
            <div className="text-[12px] font-bold text-emerald-700 flex items-center gap-1">
              <span>{isDailySpendCapped ? '✓ ঝুঁকি হ্রাস: -১৬%' : '+ ট্যাপ করে ১৬% ঝুঁকি কমান'}</span>
            </div>
          </button>

          {/* Action 3: Emergency Nano-Buffer */}
          <button
            onClick={() => {
              toggleEmergencyBuffer();
              notifyFinancial(
                !isEmergencyBufferActive
                  ? (lang === 'bn' ? 'উপায় ইমার্জেন্সি বাফার চালু' : 'Emergency Nano-Buffer Active')
                  : (lang === 'bn' ? 'ইমার্জেন্সি বাফার বন্ধ' : 'Emergency Buffer Deactivated'),
                !isEmergencyBufferActive
                  ? (lang === 'bn' ? '৳১,০০০ ০%-সুদবিহীন ন্যানো বাফার ওয়ালেটে যোগ হয়েছে।' : '৳1,000 zero-interest nano-buffer added.')
                  : (lang === 'bn' ? 'ইমার্জেন্সি বাফার বাতিল হয়েছে।' : 'Emergency buffer removed.')
              );
            }}
            className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              isEmergencyBufferActive
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-[var(--bg-page)] border-[var(--border)] hover:border-[var(--brand-primary)]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`w-4.5 h-4.5 ${isEmergencyBufferActive ? 'text-amber-600' : 'text-[var(--text-muted)]'}`} />
                <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                  {lang === 'bn' ? '৩. উপায় ইমার্জেন্সি বাফার' : '3. upay Nano-Buffer'}
                </span>
              </div>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                isEmergencyBufferActive ? 'bg-amber-500 text-[var(--brand-primary)]' : 'bg-slate-200 text-slate-700'
              }`}>
                {isEmergencyBufferActive ? (lang === 'bn' ? '+৳১,০০০ যুক্ত' : '+৳1,000') : (lang === 'bn' ? 'চালু করুন' : 'ACTIVATE')}
              </span>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              {lang === 'bn'
                ? 'শিকারি ঋণ এড়াতে উপায় থেকে ০% সুদে অনুমোদিত ১,০০০ টাকার তাৎক্ষণিক সুরক্ষা।'
                : 'Pre-approved ৳1,000 zero-interest nano overdraft to prevent predatory loans.'}
            </p>
            <div className="text-[12px] font-bold text-amber-700 flex items-center gap-1">
              <span>{isEmergencyBufferActive ? '✓ বাফার সংরক্ষিত: +৳১,০০০' : '+ ট্যাপ করে ব্যালেন্স সুরক্ষিত করুন'}</span>
            </div>
          </button>
        </div>
      </section>

      {/* 3) 5 SUMMARY STAT CARDS (Only Risk Card is Highlighted) */}
      <section className="space-y-3.5" aria-label={lang === 'bn' ? 'আর্থিক সারসংক্ষেপ ও ডেটা এক্সপোর্ট' : 'Financial Summaries & Data Export'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-[18px] sm:text-[20px] text-[var(--brand-primary)] leading-tight">
                {lang === 'bn' ? 'আর্থিক সারসংক্ষেপ' : 'Financial Summaries'}
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-primary)] font-bold border border-[var(--brand-accent)]/40 tracking-tight">
                {lang === 'bn' ? 'অক্টোবর ২০২৬' : 'October 2026'}
              </span>
            </div>
            <p className="text-caption text-[var(--text-muted)] mt-0.5">
              {lang === 'bn'
                ? 'আপনার চলতি মাসের আয়, ব্যয়, ওয়ালেট ব্যালেন্স এবং লিকুইডিটি ঝুঁকির সার্বিক চিত্র'
                : 'Key monthly indicators of cash inflows, expenditures, liquid balance, and shortage risks'}
            </p>
          </div>

          {/* Data Export Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[14px] text-[13px] font-bold border shadow-2xs transition-all cursor-pointer ${
                exportSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-page)] border-[var(--border)] hover:border-[var(--brand-primary)] text-[var(--brand-primary)]'
              }`}
              title={lang === 'bn' ? 'মাসিক আর্থিক ডেটা সিএসভি (CSV) ফাইল হিসেবে ডাউনলোড করুন' : 'Download monthly financial data as CSV'}
              aria-label={lang === 'bn' ? 'সিএসভি ডাউনলোড' : 'Export CSV'}
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
                  <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড সম্পন্ন' : 'CSV Downloaded!'}</span>
                </>
              ) : isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'bn' ? 'এক্সপোর্ট হচ্ছে...' : 'Exporting...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড' : 'Export CSV'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          aria-label={lang === 'bn' ? 'আর্থিক সারসংক্ষেপ মেট্রিক্স' : 'Financial Summary Metrics'}
        >
          {/* Card 1: মোট আয় */}
          <div className="upay-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                {lang === 'bn' ? 'মোট আয়' : 'Monthly Inflow'}
              </span>
              <div className="w-8 h-8 rounded-[12px] bg-[var(--bg-page)] flex items-center justify-center text-[var(--brand-primary)]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--text-main)] leading-none">
                {formatMoney(profile.monthlyIncome)}
              </p>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              {lang === 'bn'
                ? `পরবর্তী বেতন: ${toBengaliNumber(profile.daysUntilNextIncome)} দিন পর`
                : `Next salary: in ${profile.daysUntilNextIncome} days`}
            </p>
          </div>

          {/* Card 2: ওয়ালেট ব্যালেন্স */}
          <div className="upay-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                {lang === 'bn' ? 'ওয়ালেট ব্যালেন্স' : 'Wallet Balance'}
              </span>
              <div className="w-8 h-8 rounded-[12px] bg-[var(--bg-page)] flex items-center justify-center text-[var(--brand-primary)]">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--text-main)] leading-none">
                {formatMoney(profile.currentBalance)}
              </p>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              {lang === 'bn' ? 'ব্যবহারযোগ্য ব্যালেন্স' : 'Available balance'}
            </p>
          </div>

          {/* Card 3: মোট খরচ */}
          <div className="upay-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                {lang === 'bn' ? 'মোট খরচ' : 'Monthly Spending'}
              </span>
              <div className="w-8 h-8 rounded-[12px] bg-[var(--bg-page)] flex items-center justify-center text-[var(--brand-primary)]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--text-main)] leading-none">
                {formatMoney(profile.averageMonthlySpending)}
              </p>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              {lang === 'bn'
                ? `দৈনিক গড়: ${formatMoney(profile.averageDailySpending)}/দিন`
                : `Daily avg: ${formatMoney(profile.averageDailySpending)}/day`}
            </p>
          </div>

          {/* Card 4: আর্থিক ঝুঁকি (HIGHLIGHTED ONLY) */}
          <div className="upay-card-danger p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--danger)]">
                {lang === 'bn' ? 'আর্থিক ঝুঁকি' : 'Shortage Risk'}
              </span>
              <div className="w-8 h-8 rounded-[12px] bg-white flex items-center justify-center text-[var(--danger)] shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <p className="font-heading font-extrabold text-[26px] sm:text-[28px] text-[var(--danger)] leading-none">
                {displayRiskPct}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                risk.riskLevel === 'HIGH'
                  ? 'bg-[var(--danger)] text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {risk.riskLevel === 'HIGH'
                  ? (lang === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk')
                  : (lang === 'bn' ? 'নিয়ন্ত্রিত' : 'Controlled')}
              </span>
            </div>
            <p className="text-caption text-[var(--danger)] font-semibold">
              {risk.riskLevel === 'HIGH'
                ? (lang === 'bn' ? 'ঘাটতির সম্ভাবনা বিদ্যমান' : 'Elevated liquidity risk')
                : (lang === 'bn' ? 'বাফার দ্বারা ঝুঁকি হ্রাসকৃত' : 'Protected by active safeguards')}
            </p>
          </div>

          {/* Card 5: মাস শেষের প্রক্ষেপণ */}
          <div className="upay-card p-5 flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-muted)]">
                {lang === 'bn' ? 'মাস শেষের ব্যালেন্স' : 'Projected Month-End'}
              </span>
              <div className="w-8 h-8 rounded-[12px] bg-[var(--bg-page)] flex items-center justify-center text-[var(--brand-primary)]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--brand-primary)] leading-none">
                {formatMoney(forecast.monthEndForecast)}
              </p>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              {forecast.monthEndForecast > 1000
                ? (lang === 'bn' ? 'নিরাপদ সংরক্ষিত ব্যালেন্স' : 'Sustained positive liquidity')
                : (lang === 'bn' ? '৳১,০০০ এর নিচে নামবে ৯ দিনে' : 'Sub-৳1,000 threshold in 9 days')}
            </p>
          </div>
        </div>
      </section>

      {/* 4) MAIN GRID: Charts, Reason Tiles, Cash-Out Optimizer & Bills */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: ১৪ দিনের আয়-ব্যয় ট্রেন্ড */}
          <div className="upay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[var(--brand-primary)]">
                  {lang === 'bn' ? '১৪ দিনের আয়-ব্যয় ট্রেন্ড' : '14-Day Cash-Flow Trajectory'}
                </h3>
                <p className="text-caption text-[var(--text-muted)] mt-0.5">
                  {lang === 'bn'
                    ? 'বর্তমান খরচের ধারা বনাম নিরাপদ ব্যালেন্সের গতিপথ'
                    : 'Projected balance vs historical baseline trajectory'}
                </p>
              </div>
              <Link
                to="/forecast"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--brand-primary)] hover:text-[#B38600] transition-colors"
              >
                <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Line Chart with Brand Palette & Light Gridlines */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      fontSize: '12.5px',
                      boxShadow: '0 4px 14px rgba(0, 28, 68, 0.08)',
                      color: '#001C44',
                      fontFamily: lang === 'bn' ? 'Hind Siliguri, sans-serif' : 'Inter, sans-serif',
                    }}
                    formatter={(val: any) => [formatMoney(Number(val)), lang === 'bn' ? 'ব্যালেন্স' : 'Balance']}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name={lang === 'bn' ? 'এআই পূর্বাভাস ব্যালেন্স' : 'AI Projected Balance'}
                    stroke="#FFC400"
                    strokeWidth={3}
                    dot={{ fill: '#001C44', stroke: '#FFC400', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#FFC400' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name={lang === 'bn' ? 'সাধারণ গড় লাইন' : 'Moving Average Baseline'}
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Alert Strip below chart */}
            <div className={`p-3.5 rounded-[14px] border flex items-center gap-3 text-[13px] font-medium ${
              risk.riskLevel === 'HIGH'
                ? 'bg-[var(--danger-soft)] border-[var(--danger)]/30 text-[var(--danger)]'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              {risk.riskLevel === 'HIGH' ? (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--danger)]" />
                  <span>
                    <strong>{lang === 'bn' ? 'জরুরি সতর্কতা:' : 'Critical Warning:'}</strong>{' '}
                    {lang === 'bn'
                      ? 'আগামী ৯ দিনের মধ্যে ওয়ালেট ব্যালেন্স ১,০০০ টাকার নিচে নেমে যাওয়ার ঝুঁকি রয়েছে। উপরের ইন্টারভেনশন অন করুন।'
                      : 'Projected liquidity drops below the ৳1,000 threshold within 9 days.'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    <strong>{lang === 'bn' ? 'সুরক্ষিত:' : 'Secured:'}</strong>{' '}
                    {lang === 'bn'
                      ? 'বাফার লক ও ব্যয়ের সিলিং সক্রিয় থাকায় মাস শেষে ব্যালেন্স নিরাপদ রয়েছে।'
                      : 'Safeguards active. Balance is projected to remain safe through month-end.'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Card 2: জানুন ঝুঁকি কেন? (2x2 Grid of Reason Tiles) */}
          <div className="upay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[var(--brand-primary)]">
                  {lang === 'bn' ? `জানুন ঝুঁকি কেন ${displayRiskPct}?` : `Why is Shortage Risk at ${displayRiskPct}?`}
                </h3>
                <p className="text-caption text-[var(--text-muted)] mt-0.5">
                  {lang === 'bn'
                    ? 'শীর্ষ ৪টি কারণ যা আপনার ওয়ালেট ঘাটতি তৈরি করছে'
                    : 'Top 4 key behavioral drivers impacting wallet liquidity'}
                </p>
              </div>
              <Link
                to="/risk"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--brand-primary)] hover:text-[#B38600] transition-colors"
              >
                <span>{lang === 'bn' ? 'ঝুঁকি বিশ্লেষণ' : 'Risk Deep-Dive'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2x2 Grid of reason tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tile 1 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)] space-y-1.5 hover:border-[var(--brand-primary)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                    {lang === 'bn' ? '১. খাবার খরচ বৃদ্ধি' : '1. Dining Outflow Surge'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                    +36.8%
                  </span>
                </div>
                <p className="text-caption text-[var(--text-muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'রেস্তোরাঁ ও ফুড ডেলিভারি ব্যয় স্বাভাবিক গড়ের চেয়ে অতিরিক্ত হওয়ায় তহবিল দ্রুত হ্রাস পাচ্ছে।'
                    : 'Restaurant and takeout expenses spiked significantly above your 90-day moving average.'}
                </p>
              </div>

              {/* Tile 2 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)] space-y-1.5 hover:border-[var(--brand-primary)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                    {lang === 'bn' ? '২. ক্যাশ-আউট নির্ভরতা' : '2. Agent Cash-Out Dependency'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                    +21%
                  </span>
                </div>
                <p className="text-caption text-[var(--text-muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'এজেন্ট থেকে ঘন ঘন ক্যাশ-আউট ফি বাবদ অতিরিক্ত খরচ হচ্ছে এবং তহবিল দ্রুত কমছে।'
                    : 'Frequent agent withdrawals generate high cash-out fees and quickly deplete reserves.'}
                </p>
              </div>

              {/* Tile 3 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)] space-y-1.5 hover:border-[var(--brand-primary)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                    {lang === 'bn' ? '৩. আসন্ন ইউটিলিটি বিল' : '3. Upcoming Scheduled Bills'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-primary)] text-[11px] font-extrabold border border-[var(--brand-accent)]/40">
                    {formatMoney(2000)}
                  </span>
                </div>
                <p className="text-caption text-[var(--text-muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'বেতন পাওয়ার পূর্বেই ডিপিডিসি বিদ্যুৎ ও ইন্টারনেট বিল পরিশোধের নির্ধারিত বাধ্যবাধকতা রয়েছে।'
                    : 'DPDC electricity and home broadband charges are scheduled before your salary arrives.'}
                </p>
              </div>

              {/* Tile 4 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)] space-y-1.5 hover:border-[var(--brand-primary)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--brand-primary)]">
                    {lang === 'bn' ? '৪. আয়ের দূরত্ব' : '4. Days Until Salary'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] text-[11px] font-extrabold">
                    {lang === 'bn' ? `${toBengaliNumber(profile.daysUntilNextIncome)} দিন বাকি` : `${profile.daysUntilNextIncome} days left`}
                  </span>
                </div>
                <p className="text-caption text-[var(--text-muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'পরবর্তী বেতন আসার আগে অবশিষ্ট ব্যালেন্স দিয়ে দৈনিক মৌলিক চাহিদা পরিচালনা কঠিন হতে পারে।'
                    : 'Remaining wallet balance must stretch across daily necessities until the next paycheck.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: স্মার্ট ক্যাশ-আউট সেভার উইজেট (Smart Cash-Out Fee Saver) */}
          <div className="upay-card p-6 space-y-3.5 bg-gradient-to-br from-amber-50/60 to-white border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[var(--brand-primary)]" />
                <h3 className="text-[var(--brand-primary)]">
                  {lang === 'bn' ? 'ক্যাশ-আউট ফি অপটিমাইজার' : 'Cash-Out Fee Optimizer'}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-accent)] text-[var(--brand-primary)] text-[11px] font-extrabold">
                {lang === 'bn' ? '৳৩২০ সাশ্রয়' : 'Save ৳320'}
              </span>
            </div>

            <p className="text-caption text-[var(--text-muted)] leading-relaxed">
              {lang === 'bn'
                ? 'এ মাসে এজেন্ট থেকে ক্যাশ-আউট ফি বাবদ আপনার ৩২০ টাকা ক্ষতি হয়েছে। কেনাকাটায় সরাসরি উপায় মার্চেন্ট কিউআর দিয়ে পেমেন্ট করলে এই ফি শূন্য (৳০) হতো।'
                : 'You spent ৳320 on agent withdrawal fees. Paying merchants directly with upay QR costs ৳0.'}
            </p>

            <button
              onClick={() => {
                toggleMerchantQrOptimized();
                notifyFinancial(
                  !isMerchantQrOptimized
                    ? (lang === 'bn' ? 'মার্চেন্ট কিউআর সাশ্রয় সক্রিয়' : 'QR Fee Optimizer Activated')
                    : (lang === 'bn' ? 'স্বাভাবিক মোডে ফেরত' : 'Reverted'),
                  !isMerchantQrOptimized
                    ? (lang === 'bn' ? '৩২০ টাকা ফি ওয়ালেটে সাশ্রয় হয়েছে এবং ঝুঁকি ৬% কমেছে।' : '৳320 cash-out fee recovered. Risk reduced 6%.')
                    : ''
                );
              }}
              className={`w-full py-2.5 px-4 rounded-[14px] text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isMerchantQrOptimized
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[var(--brand-accent)] text-[var(--brand-primary)] hover:bg-[#EBB000]'
              }`}
            >
              {isMerchantQrOptimized ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'কিউআর পেমেন্ট সক্রিয় (৳৩২০ সুরক্ষিত)' : 'QR Optimizer Active (৳320 Saved)'}</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{lang === 'bn' ? 'উপায় কিউআর মোড চালু করুন' : 'Switch to upay QR Mode'}</span>
                </>
              )}
            </button>
          </div>

          {/* Card: ক্যাটাগরি ব্যয় Donut Chart */}
          <div className="upay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[var(--brand-primary)]">
                {lang === 'bn' ? 'ক্যাটাগরি ব্যয়' : 'Category Spending'}
              </h3>
              <Link
                to="/spending"
                className="text-[13px] font-bold text-[var(--brand-primary)] hover:text-[#B38600] transition-colors"
              >
                {lang === 'bn' ? 'সব দেখুন' : 'View All'}
              </Link>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#001C44',
                      fontFamily: lang === 'bn' ? 'Hind Siliguri, sans-serif' : 'Inter, sans-serif',
                    }}
                    formatter={(v: any) => [formatMoney(Number(v)), lang === 'bn' ? 'ব্যয়' : 'Spending']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 border-t border-[var(--border)] pt-3">
              {categoryPieData.slice(0, 3).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--text-main)] font-medium">{item.name}</span>
                  </div>
                  <span className="font-heading font-bold text-[var(--brand-primary)]">{formatMoney(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: আসন্ন বিল ও চার্জ */}
          <div className="upay-card p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[var(--brand-primary)]">
                {lang === 'bn' ? 'আসন্ন বিল ও চার্জ' : 'Upcoming Obligations'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isBillBufferLocked
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[var(--brand-accent-soft)] text-[var(--brand-primary)] border border-[var(--brand-accent)]/30'
              }`}>
                {isBillBufferLocked
                  ? (lang === 'bn' ? 'বাফার দ্বারা লকড' : 'Buffer Locked')
                  : (lang === 'bn' ? 'শীঘ্রই প্রদেয়' : 'Due Soon')}
              </span>
            </div>

            <div className="space-y-2.5">
              {profile.upcomingExpenses.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-[13.5px] font-bold text-[var(--brand-primary)] leading-tight">{exp.name}</p>
                    <p className="text-caption text-[var(--text-muted)]">
                      {lang === 'bn'
                        ? `বাকি ${toBengaliNumber(exp.dueDays)} দিন · ${categoryNames[exp.category]?.bn || exp.category}`
                        : `Due in ${exp.dueDays} days · ${categoryNames[exp.category]?.en || exp.category}`}
                    </p>
                  </div>
                  <span className="font-heading font-extrabold text-[15px] text-[var(--brand-primary)]">
                    {formatMoney(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: লক্ষ্য অগ্রগতি */}
          <div className="upay-card p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[var(--brand-primary)]">
                {lang === 'bn' ? 'লক্ষ্য অগ্রগতি' : 'Goal Progress'}
              </h3>
              <Link
                to="/goals"
                className="text-[13px] font-bold text-[var(--brand-primary)] hover:text-[#B38600] transition-colors"
              >
                {lang === 'bn' ? 'পরিচালনা' : 'Manage'}
              </Link>
            </div>

            {goals.length > 0 && (
              <div className="p-4 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--brand-primary)]">{goals[0].goal_name}</span>
                  <span className="font-heading font-extrabold text-[14px] text-[var(--brand-primary)]">
                    {lang === 'bn'
                      ? `${toBengaliNumber(Math.round((goals[0].current_amount / goals[0].target_amount) * 100))}%`
                      : `${Math.round((goals[0].current_amount / goals[0].target_amount) * 100)}%`}
                  </span>
                </div>

                <div className="w-full bg-[var(--border)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--brand-accent)] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (goals[0].current_amount / goals[0].target_amount) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-caption text-[var(--text-muted)]">
                  <span>
                    {lang === 'bn' ? 'জমা:' : 'Saved:'} {formatMoney(goals[0].current_amount)}
                  </span>
                  <span>
                    {lang === 'bn' ? 'টার্গেট:' : 'Target:'} {formatMoney(goals[0].target_amount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5) AI ADVICE & BANGLA VOICE COACH SECTION */}
      <section className="upay-card p-6 sm:p-8 space-y-4" aria-label={lang === 'bn' ? 'এআই আর্থিক পরামর্শ' : 'AI Financial Advice'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[var(--brand-primary)] text-[var(--brand-accent)] flex items-center justify-center font-bold text-sm shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[var(--brand-primary)]">
                  {lang === 'bn' ? 'উপায় এআই আর্থিক পরামর্শক' : 'upay AI Financial Coach'}
                </h3>
              </div>
              <p className="text-caption text-[var(--text-muted)]">
                {lang === 'bn'
                  ? 'রিয়েল-টাইম সিদ্ধান্ত সহায়তা ও নগদ প্রবাহ পূর্বাভাস (বাংলা ভয়েস সাপোর্টসহ)'
                  : 'Real-time proactive decision support & cash-flow forecasts with Bangla Voice'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11.5px] font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span>{lang === 'bn' ? 'এআই সহকারী সক্রিয়' : 'AI Assistant Active'}</span>
            </div>
            <Link
              to="/coach"
              className="text-[13px] font-bold text-[var(--brand-primary)] hover:text-[#B38600] flex items-center gap-1"
            >
              <span>{lang === 'bn' ? 'সম্পূর্ণ চ্যাট' : 'Full Chat'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[12.5px] font-bold text-[var(--text-muted)] shrink-0">
            {lang === 'bn' ? 'পরামর্শ চান:' : 'Quick Prompts:'}
          </span>
          <button
            onClick={handleGenerateDeepInsights}
            disabled={isAskingAI}
            className="px-3.5 py-1 rounded-full bg-[var(--brand-accent-soft)] hover:bg-[var(--brand-accent)]/30 border border-[var(--brand-accent)]/50 text-[var(--brand-primary)] text-[12px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-[var(--brand-primary)]" />
            <span>{lang === 'bn' ? 'ডিপ অ্যানালাইসিস' : 'Deep Financial Analysis'}</span>
          </button>
          <button
            onClick={() => handleAskAI(lang === 'bn' ? 'আমার আর্থিক ঝুঁকি কেন ৮২%?' : 'Why is my shortage risk so high?')}
            className="px-3 py-1 rounded-full bg-[var(--bg-page)] hover:bg-[var(--brand-accent-soft)] border border-[var(--border)] hover:border-[var(--brand-accent)] text-[var(--brand-primary)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? 'ঝুঁকি কেন ৮২%?' : 'Why 82% risk?'}
          </button>
          <button
            onClick={() => handleAskAI(lang === 'bn' ? 'খাবারে ১৫% খরচ কমালে কী লাভ হবে?' : 'What happens if I cut food spending by 15%?')}
            className="px-3 py-1 rounded-full bg-[var(--bg-page)] hover:bg-[var(--brand-accent-soft)] border border-[var(--border)] hover:border-[var(--brand-accent)] text-[var(--brand-primary)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? 'খাবারে ১৫% কমালে কী হবে?' : 'What if 15% food cut?'}
          </button>
          <button
            onClick={() => handleAskAI(lang === 'bn' ? 'আমি ১০০০ টাকা জমাতে চাই, কী করব?' : 'I want to save 1000 tk, what plan?')}
            className="px-3 py-1 rounded-full bg-[var(--bg-page)] hover:bg-[var(--brand-accent-soft)] border border-[var(--border)] hover:border-[var(--brand-accent)] text-[var(--brand-primary)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? '১০০০ টাকা সঞ্চয় পরিকল্পনা' : 'Save 1000 Tk Plan'}
          </button>
        </div>

        {/* Real-time Messages Feed with Voice Read-Aloud */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {adviceMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[18px] px-4 py-2.5 text-[14px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--brand-primary)] text-white rounded-tr-xs'
                    : 'bg-[var(--bg-page)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-xs'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-1.5 mb-1.5 border-b border-[var(--border)]/60 pb-1">
                    <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-primary)] font-bold border border-[var(--brand-accent)]/30">
                      <Sparkles className="w-2.5 h-2.5 text-[var(--brand-primary)]" />
                      <span>{lang === 'bn' ? 'উপায় এআই' : 'upay AI'}</span>
                    </span>
                    <button
                      onClick={() => speakText(msg.text, lang)}
                      className="p-1 rounded-md hover:bg-slate-200 text-[var(--brand-primary)] transition-colors cursor-pointer"
                      title={lang === 'bn' ? 'ভয়েস শুনুন' : 'Read Aloud'}
                      aria-label="Read message aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            </div>
          ))}

          {isAskingAI && (
            <div className="flex gap-2.5 items-center text-caption text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
              <span>{lang === 'bn' ? 'উপায় এআই উত্তর তৈরি করছে...' : 'upay AI is processing your financial data...'}</span>
            </div>
          )}

          {isListening && (
            <div className="flex gap-2.5 items-center p-3 rounded-[14px] bg-red-50 border border-red-200 text-red-800 text-[13px] font-bold animate-pulse">
              <Mic className="w-4 h-4 text-red-600 animate-bounce" />
              <span>{lang === 'bn' ? 'বাংলায় কথা বলুন... শুনছি...' : 'Listening in English... Speak now...'}</span>
            </div>
          )}
        </div>

        {/* Input Row with Mic Voice Button & Send */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAI();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={adviceInput}
            onChange={(e) => setAdviceInput(e.target.value)}
            placeholder={
              isListening
                ? (lang === 'bn' ? 'শুনছি... কথা বলুন...' : 'Listening...')
                : (lang === 'bn' ? 'আপনার বাজেট বা খরচ নিয়ে প্রশ্ন করুন বা মাইকে বলুন...' : 'Ask about budget, bills, or speak into mic...')
            }
            className="flex-1 px-4 py-2.5 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)] text-[14px] text-[var(--text-main)] focus:border-[var(--brand-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
          />

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-[14px] border transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white border-red-600 ring-2 ring-red-300 animate-pulse'
                : 'bg-[var(--bg-page)] hover:bg-[var(--brand-accent-soft)] text-[var(--brand-primary)] border-[var(--border)]'
            }`}
            title={lang === 'bn' ? 'মুখে বাংলায় কথা বলুন' : 'Speak into Microphone'}
            aria-label={lang === 'bn' ? 'ভয়েস ইনপুট' : 'Voice Input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={isAskingAI || !adviceInput.trim()}
            className="btn-primary !px-4 !py-2.5 disabled:opacity-50"
            aria-label={lang === 'bn' ? 'বার্তা পাঠান' : 'Send message'}
          >
            <Send className="w-4 h-4 text-[var(--brand-primary)]" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
          </button>
        </form>
      </section>
    </div>
  );
};
