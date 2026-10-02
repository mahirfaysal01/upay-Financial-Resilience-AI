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
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import { askAICoach, buildCoachContext } from '../services/aiCoachEngine';
import { toBengaliNumber } from '../utils/translations';
import { exportMonthlyFinancialDataCSV } from '../utils/exportFinancialData';

export const Dashboard: React.FC = () => {
  const { customer, profile, transactions, forecast, risk, anomalies, recommendations, goals, lang, t, formatMoney } = useFinancial();
  const { notifyFinancial } = useNotification();

  // AI Advice Chat state in dashboard
  const [adviceInput, setAdviceInput] = useState('');
  const [adviceMessages, setAdviceMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [isAskingAI, setIsAskingAI] = useState(false);

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
      ? `আসসালামু আলাইকুম ${customer.name === 'Rahim Hasan' ? 'রহিম' : customer.name}! আপনার বর্তমান খরচের গতিপথ অনুযায়ী আগামী ${toBengaliNumber(profile.daysUntilNextIncome)} দিনের মধ্যে ওয়ালেট ঘাটতির ঝুঁকি রয়েছে। খাবার ও ক্যাশ-আউট খরচ কিছুটা কমিয়ে কীভাবে মাস শেষ সুরক্ষিত করবেন তা জানতে আমাকে প্রশ্ন করতে পারেন।`
      : `Hello ${customer.name}! Based on your current spending trajectory, you face a liquidity risk in the next ${profile.daysUntilNextIncome} days before your next deposit. Ask me how trimming dining or cash-out fees can help protect your month-end.`;

    setAdviceMessages([{ role: 'assistant', text: greeting }]);

    // If customer has a high shortage risk, trigger a contextual financial toast
    if (risk.riskLevel === 'HIGH' || risk.probability >= 0.7) {
      const timer = setTimeout(() => {
        notifyFinancial(
          lang === 'bn' ? 'জরুরি তারল্য ঝুঁকি সতর্কতা' : 'Critical Cashflow Risk Alert',
          lang === 'bn'
            ? `${customer.name}-এর ওয়ালেটে আগামী ${profile.daysUntilNextIncome} দিনের মধ্যে ৳১,০০০ এর নিচে নামার উচ্চ ঝুঁকি রয়েছে।`
            : `${customer.name} has a high risk of dropping below ৳1,000 threshold within ${profile.daysUntilNextIncome} days.`,
          {
            financialDetails: {
              amount: profile.currentBalance,
              category: `ঝুঁকির মাত্রা: ${Math.round(risk.probability * 100)}%`,
              trend: 'down',
            },
            duration: 6000,
          }
        );
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [customer.customer_id, lang, profile.daysUntilNextIncome, risk.riskLevel, risk.probability]);

  const handleAskAI = async (queryText?: string) => {
    const q = (queryText || adviceInput).trim();
    if (!q || isAskingAI) return;

    setAdviceMessages((prev) => [...prev, { role: 'user', text: q }]);
    setAdviceInput('');
    setIsAskingAI(true);

    try {
      const coachContext = buildCoachContext(profile, risk, forecast.monthEndForecast, anomalies);
      const instruction = lang === 'bn'
        ? `[বাংলায় সংক্ষিপ্ত ও ব্যবহারিক পরামর্শ দিন]: ${q}`
        : `[Provide concise, actionable advice in English with ৳ figures]: ${q}`;
      const res = await askAICoach(instruction, coachContext, adviceMessages);
      setAdviceMessages((prev) => [...prev, { role: 'assistant', text: res.text }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAskingAI(false);
    }
  };

  // Category palette strictly using the brand system
  const BRAND_PIE_COLORS = [
    '#FFC20E', // yellow
    '#0B1F4B', // navy
    '#E5484D', // danger
    '#1FA971', // success
    '#5B6685', // muted
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

  // Circular gauge calculations (Circumference of r=45 is 2 * PI * 45 ~= 282.74)
  const riskPct = Math.round(risk.probability * 100);
  const displayRiskPct = lang === 'bn' ? `${toBengaliNumber(riskPct)}%` : `${riskPct}%`;
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (riskPct / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 2) HERO BANNER */}
      <section
        className="relative overflow-hidden rounded-[28px] bg-[var(--navy)] text-white p-6 sm:p-10 shadow-[0_4px_24px_rgba(11,31,75,0.08)]"
        aria-label={lang === 'bn' ? 'অ্যাকাউন্ট সারসংক্ষেপ ও আর্থিক স্বাস্থ্য' : 'Account Summary & Resilience Overview'}
      >
        {/* Decorative soft circles as specified */}
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[var(--navy-2)] opacity-80 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-6 left-1/3 w-20 h-20 rounded-full bg-[var(--yellow)] opacity-90 blur-[2px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (Content & Buttons) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[12.5px] font-semibold tracking-wide backdrop-blur-xs border border-white/15">
              <span className="w-2 h-2 rounded-full bg-[var(--yellow)]"></span>
              <span>
                {lang === 'bn' ? 'অ্যাকাউন্ট বিশ্লেষণ · অক্টোবর ২০২৬' : 'Account Analytics · October 2026'}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-white leading-[1.2]">
              {lang === 'bn'
                ? 'সমস্যা হওয়ার আগেই জানুন আপনার ভবিষ্যৎ আর্থিক অবস্থা'
                : 'Know your financial future before it becomes a problem'}
            </h1>

            <p className="text-white/85 text-[15.5px] max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'উপায় এআই আপনার ওয়ালেটের খরচের গতিধারা ও আসন্ন বিল পর্যালোচনা করে সম্ভাব্য ঘাটতি পূর্বাভাস দেয়, যাতে মাস শেষে টানাপোড়েন এড়ানো যায়।'
                : 'upay AI analyzes your cash flows and scheduled obligations to forecast liquidity pressure before month-end.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to="/simulator" className="btn-primary">
                <Sliders className="w-4 h-4 text-[var(--navy)]" />
                <span>{lang === 'bn' ? 'সিমুলেশন শুরু করুন' : 'Launch Simulator'}</span>
              </Link>
              <Link to="/coach" className="btn-secondary-white">
                <Bot className="w-4 h-4 text-white" />
                <span>{lang === 'bn' ? 'এআই পরামর্শকের সাথে কথা বলুন' : 'Talk with AI Coach'}</span>
              </Link>
            </div>
          </div>

          {/* Right Column (Single Highlight: Circular Risk Gauge) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] p-4 flex flex-col items-center justify-center border-4 border-white/20">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#E4E8F2"
                  strokeWidth="9"
                />
                {/* Animated Red Arc */}
                <circle
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#E5484D"
                  strokeWidth="9.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="gauge-arc-anim"
                />
              </svg>

              {/* Center Content in Gauge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-[var(--muted)] uppercase tracking-wider">
                  {lang === 'bn' ? 'ঘাটতির ঝুঁকি' : 'Shortage Risk'}
                </span>
                <span className="font-heading font-extrabold text-[38px] sm:text-[42px] text-[var(--danger)] leading-none my-0.5">
                  {displayRiskPct}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                  {risk.riskLevel === 'HIGH'
                    ? (lang === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk')
                    : (lang === 'bn' ? 'মাঝারি ঝুঁকি' : 'Moderate Risk')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3) FINANCIAL SUMMARIES SECTION & DATA EXPORT (5 Cards) */}
      <section className="space-y-3.5" aria-label={lang === 'bn' ? 'আর্থিক সারসংক্ষেপ ও ডেটা এক্সপোর্ট' : 'Financial Summaries & Data Export'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-[18px] sm:text-[20px] text-[var(--navy)] leading-tight">
                {lang === 'bn' ? 'আর্থিক সারসংক্ষেপ' : 'Financial Summaries'}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] font-bold border border-[var(--yellow)]/30 tracking-tight">
                {lang === 'bn' ? 'অক্টোবর ২০২৬' : 'October 2026'}
              </span>
            </div>
            <p className="text-caption text-[var(--muted)] mt-0.5">
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
                  : 'bg-white hover:bg-[var(--bg)] border-[var(--line)] hover:border-[var(--navy)] text-[var(--navy)]'
              }`}
              title={lang === 'bn' ? 'মাসিক আর্থিক ডেটা সিএসভি (CSV) ফাইল হিসেবে ডাউনলোড করুন' : 'Download monthly financial data as CSV'}
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
                  <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড সম্পন্ন' : 'CSV Downloaded!'}</span>
                </>
              ) : isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--navy)] border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'bn' ? 'এক্সপোর্ট হচ্ছে...' : 'Exporting...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[var(--navy)]" />
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
            <span className="text-[13px] font-semibold text-[var(--muted)]">
              {lang === 'bn' ? 'মোট আয়' : 'Monthly Inflow'}
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--ink)] leading-none">
              {formatMoney(profile.monthlyIncome)}
            </p>
          </div>
          <p className="text-caption text-[var(--muted)]">
            {lang === 'bn'
              ? `পরবর্তী বেতন: ${toBengaliNumber(profile.daysUntilNextIncome)} দিন পর`
              : `Next salary: in ${profile.daysUntilNextIncome} days`}
          </p>
        </div>

        {/* Card 2: মাসিক বাজেট / বর্তমান ব্যালেন্স */}
        <div className="upay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--muted)]">
              {lang === 'bn' ? 'মাসিক বাজেট' : 'Wallet Balance'}
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--ink)] leading-none">
              {formatMoney(profile.currentBalance)}
            </p>
          </div>
          <p className="text-caption text-[var(--muted)]">
            {lang === 'bn' ? 'বর্তমান ওয়ালেট ব্যালেন্স' : 'Current liquid balance'}
          </p>
        </div>

        {/* Card 3: মোট খরচ */}
        <div className="upay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--muted)]">
              {lang === 'bn' ? 'মোট খরচ' : 'Monthly Spending'}
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--ink)] leading-none">
              {formatMoney(profile.averageMonthlySpending)}
            </p>
          </div>
          <p className="text-caption text-[var(--muted)]">
            {lang === 'bn'
              ? `দৈনিক গড়: ${formatMoney(profile.averageDailySpending)}/দিন`
              : `Daily avg: ${formatMoney(profile.averageDailySpending)}/day`}
          </p>
        </div>

        {/* Card 4: আর্থিক ঝুঁকি (Highlighted with danger-soft background & red badge) */}
        <div className="upay-card-danger p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[var(--danger)]">
              {lang === 'bn' ? 'আর্থিক ঝুঁকি' : 'Shortage Risk'}
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-white flex items-center justify-center text-[var(--danger)] shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <p className="font-heading font-extrabold text-[26px] sm:text-[28px] text-[var(--danger)] leading-none">
              {displayRiskPct}
            </p>
            <span className="px-2 py-0.5 rounded-full bg-[var(--danger)] text-white text-[11px] font-extrabold">
              {risk.riskLevel === 'HIGH'
                ? (lang === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk')
                : (lang === 'bn' ? 'মাঝারি' : 'Moderate')}
            </span>
          </div>
          <p className="text-caption text-[var(--danger)] font-medium">
            {lang === 'bn' ? 'ঘাটতির উচ্চ সম্ভাবনা বিদ্যমান' : 'Elevated liquidity risk'}
          </p>
        </div>

        {/* Card 5: আগামী মাসের পূর্বাভাস */}
        <div className="upay-card p-5 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--muted)]">
              {lang === 'bn' ? 'মাস শেষের ব্যালেন্স' : 'Projected Month-End'}
            </span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--danger)] leading-none">
              {formatMoney(forecast.monthEndForecast)}
            </p>
          </div>
          <p className="text-caption text-[var(--danger)] font-medium">
            {lang === 'bn' ? '৳১,০০০ এর নিচে নামবে ৯ দিনে' : 'Sub-৳1,000 threshold in 9 days'}
          </p>
        </div>
        </div>
      </section>

      {/* 4) MAIN GRID: 60/40 Columns on Desktop, Single Column on Mobile */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (60% ~ col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: ১৪ দিনের আয়-ব্যয় ট্রেন্ড */}
          <div className="upay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#0B1F4B]">
                  {lang === 'bn' ? '১৪ দিনের আয়-ব্যয় ট্রেন্ড' : '14-Day Cash-Flow Trajectory'}
                </h3>
                <p className="text-caption text-[var(--muted)] mt-0.5">
                  {lang === 'bn'
                    ? 'বর্তমান খরচের ধারা বনাম নিরাপদ ব্যালেন্সের গতিপথ'
                    : 'Projected balance vs historical baseline trajectory'}
                </p>
              </div>
              <Link
                to="/forecast"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
              >
                <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Line Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E8F2',
                      borderRadius: '14px',
                      fontSize: '12.5px',
                      boxShadow: '0 4px 12px rgba(11, 31, 75, 0.08)',
                      color: '#0B1F4B',
                      fontFamily: lang === 'bn' ? 'Hind Siliguri, sans-serif' : 'Inter, sans-serif',
                    }}
                    formatter={(val: any) => [formatMoney(Number(val)), lang === 'bn' ? 'ব্যালেন্স' : 'Balance']}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name={lang === 'bn' ? 'এআই পূর্বাভাস ব্যালেন্স' : 'AI Projected Balance'}
                    stroke="#FFC20E"
                    strokeWidth={3}
                    dot={{ fill: '#0B1F4B', stroke: '#FFC20E', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#FFC20E' }}
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

            {/* Red Alert Strip below chart as specified */}
            <div className="p-3.5 rounded-[14px] bg-[var(--danger-soft)] border border-[var(--danger)]/25 flex items-center gap-3 text-[13px] text-[var(--danger)] font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--danger)]" />
              <span>
                <strong>{lang === 'bn' ? 'জরুরি সতর্কতা:' : 'Critical Warning:'}</strong>{' '}
                {lang === 'bn'
                  ? 'আগামী ৯ দিনের মধ্যে ওয়ালেট ব্যালেন্স ১,০০০ টাকার নিচে নেমে যাওয়ার স্পষ্ট ঝুঁকি রয়েছে।'
                  : 'Projected wallet liquidity drops below the ৳1,000 threshold within 9 days.'}
              </span>
            </div>
          </div>

          {/* Card 2: জানুন ঝুঁকি কেন ৮২%? (2x2 Grid of reason tiles) */}
          <div className="upay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#0B1F4B]">
                  {lang === 'bn' ? `জানুন ঝুঁকি কেন ${displayRiskPct}?` : `Why is Shortage Risk at ${displayRiskPct}?`}
                </h3>
                <p className="text-caption text-[var(--muted)] mt-0.5">
                  {lang === 'bn'
                    ? 'গাণিতিক মডেলের শীর্ষ ৪টি কারণ যা আপনার ওয়ালেট ঘাটতি তৈরি করছে'
                    : 'Top 4 key behavioral drivers impacting wallet liquidity'}
                </p>
              </div>
              <Link
                to="/risk"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
              >
                <span>{lang === 'bn' ? 'ঝুঁকি বিশ্লেষণ' : 'Risk Deep-Dive'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2x2 Grid of reason tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tile 1 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">
                    {lang === 'bn' ? '১. খাবার খরচ বৃদ্ধি' : '1. Dining Outflow Surge'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                    +36.8%
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'রেস্তোরাঁ ও ফুড ডেলিভারি ব্যয় স্বাভাবিক গড়ের চেয়ে অতিরিক্ত হওয়ায় তহবিল দ্রুত হ্রাস পাচ্ছে।'
                    : 'Restaurant and takeout expenses spiked significantly above your 90-day moving average.'}
                </p>
              </div>

              {/* Tile 2 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">
                    {lang === 'bn' ? '২. ক্যাশ-আউট নির্ভরতা' : '2. Agent Cash-Out Dependency'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                    +21%
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'এজেন্ট থেকে ঘন ঘন ক্যাশ-আউট ফি বাবদ অতিরিক্ত খরচ হচ্ছে এবং হিসাবের অস্বচ্ছতা বাড়ছে।'
                    : 'Frequent agent withdrawals generate high cash-out fees and quickly deplete reserves.'}
                </p>
              </div>

              {/* Tile 3 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">
                    {lang === 'bn' ? '৩. আসন্ন ইউটিলিটি বিল' : '3. Upcoming Scheduled Bills'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[11px] font-extrabold">
                    {formatMoney(2000)}
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'বেতন পাওয়ার পূর্বেই ডিপিডিসি বিদ্যুৎ ও ইন্টারনেট বিল পরিশোধের নির্ধারিত বাধ্যবাধকতা রয়েছে।'
                    : 'DPDC electricity and home broadband charges are scheduled before your salary arrives.'}
                </p>
              </div>

              {/* Tile 4 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">
                    {lang === 'bn' ? '৪. আয়ের দূরত্ব' : '4. Days Until Salary'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)] text-[11px] font-extrabold">
                    {lang === 'bn' ? `${toBengaliNumber(profile.daysUntilNextIncome)} দিন বাকি` : `${profile.daysUntilNextIncome} days left`}
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  {lang === 'bn'
                    ? 'পরবর্তী বেতন আসার আগে অবশিষ্ট ব্যালেন্স দিয়ে দৈনিক মৌলিক চাহিদা পরিচালনা কঠিন হতে পারে।'
                    : 'Remaining wallet balance must stretch across daily necessities until the next paycheck.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (40% ~ col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 3: ক্যাটাগরি ব্যয় Donut Chart */}
          <div className="upay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[#0B1F4B]">
                {lang === 'bn' ? 'ক্যাটাগরি ব্যয়' : 'Category Spending'}
              </h3>
              <Link
                to="/spending"
                className="text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
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
                      border: '1px solid #E4E8F2',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#0B1F4B',
                      fontFamily: lang === 'bn' ? 'Hind Siliguri, sans-serif' : 'Inter, sans-serif',
                    }}
                    formatter={(v: any) => [formatMoney(Number(v)), lang === 'bn' ? 'ব্যয়' : 'Spending']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 border-t border-[var(--line)] pt-3">
              {categoryPieData.slice(0, 3).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--ink)] font-medium">{item.name}</span>
                  </div>
                  <span className="font-heading font-bold text-[var(--navy)]">{formatMoney(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: আসন্ন বিল ও চার্জ */}
          <div className="upay-card p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[#0B1F4B]">
                {lang === 'bn' ? 'আসন্ন বিল ও চার্জ' : 'Upcoming Obligations'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[11px] font-bold">
                {lang === 'bn' ? 'শীঘ্রই প্রদেয়' : 'Due Soon'}
              </span>
            </div>

            <div className="space-y-2.5">
              {profile.upcomingExpenses.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-[13.5px] font-bold text-[var(--navy)] leading-tight">{exp.name}</p>
                    <p className="text-caption text-[var(--muted)]">
                      {lang === 'bn'
                        ? `বাকি ${toBengaliNumber(exp.dueDays)} দিন · ${categoryNames[exp.category]?.bn || exp.category}`
                        : `Due in ${exp.dueDays} days · ${categoryNames[exp.category]?.en || exp.category}`}
                    </p>
                  </div>
                  <span className="font-heading font-extrabold text-[15px] text-[var(--navy)]">
                    {formatMoney(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: লক্ষ্য অগ্রগতি */}
          <div className="upay-card p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[#0B1F4B]">
                {lang === 'bn' ? 'লক্ষ্য অগ্রগতি' : 'Goal Progress'}
              </h3>
              <Link
                to="/goals"
                className="text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
              >
                {lang === 'bn' ? 'পরিচালনা' : 'Manage'}
              </Link>
            </div>

            {goals.length > 0 && (
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">{goals[0].goal_name}</span>
                  <span className="font-heading font-extrabold text-[14px] text-[var(--navy)]">
                    {lang === 'bn'
                      ? `${toBengaliNumber(Math.round((goals[0].current_amount / goals[0].target_amount) * 100))}%`
                      : `${Math.round((goals[0].current_amount / goals[0].target_amount) * 100)}%`}
                  </span>
                </div>

                {/* Yellow Progress Bar */}
                <div className="w-full bg-[var(--line)] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--yellow)] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (goals[0].current_amount / goals[0].target_amount) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-caption text-[var(--muted)]">
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

      {/* 5) AI ADVICE SECTION (Chat-style panel with suggestion chips and yellow send button) */}
      <section className="upay-card p-6 sm:p-8 space-y-4" aria-label={lang === 'bn' ? 'এআই আর্থিক পরামর্শ' : 'AI Financial Advice'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-[var(--yellow)] flex items-center justify-center font-bold text-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[#0B1F4B]">
                {lang === 'bn' ? 'উপায় এআই পরামর্শক' : 'upay AI Financial Coach'}
              </h3>
              <p className="text-caption text-[var(--muted)]">
                {lang === 'bn'
                  ? 'আপনার ডেটাসেটের ভিত্তিতে বাস্তবসম্মত ও নিরপেক্ষ আর্থিক পরামর্শ'
                  : 'Grounded, non-judgmental guidance based on your wallet patterns'}
              </p>
            </div>
          </div>
          <Link
            to="/coach"
            className="text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{lang === 'bn' ? 'সম্পূর্ণ চ্যাটে যান' : 'Open Full Chat'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[12.5px] font-bold text-[var(--muted)] shrink-0">
            {lang === 'bn' ? 'পরামর্শ চান:' : 'Quick Prompts:'}
          </span>
          <button
            onClick={() => handleAskAI(lang === 'bn' ? 'আমার আর্থিক ঝুঁকি কেন ৮২%?' : 'Why is my shortage risk so high?')}
            className="px-3 py-1 rounded-full bg-[var(--bg)] hover:bg-[var(--yellow-soft)] border border-[var(--line)] hover:border-[var(--yellow)] text-[var(--navy)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? 'ঝুঁকি কেন ৮২%?' : 'Why 82% risk?'}
          </button>
          <button
            onClick={() => handleAskAI(lang === 'bn' ? 'খাবারে ১৫% খরচ কমালে কী লাভ হবে?' : 'What happens if I cut food spending by 15%?')}
            className="px-3 py-1 rounded-full bg-[var(--bg)] hover:bg-[var(--yellow-soft)] border border-[var(--line)] hover:border-[var(--yellow)] text-[var(--navy)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? 'খাবারে ১৫% কমালে কী হবে?' : 'What if 15% food cut?'}
          </button>
          <button
            onClick={() => handleAskAI(lang === 'bn' ? 'আমি কি ল্যাপটপ কেনার লক্ষ্য পূরণ করতে পারব?' : 'Will I reach my laptop savings goal?')}
            className="px-3 py-1 rounded-full bg-[var(--bg)] hover:bg-[var(--yellow-soft)] border border-[var(--line)] hover:border-[var(--yellow)] text-[var(--navy)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            {lang === 'bn' ? 'ল্যাপটপের লক্ষ্য পূরণ হবে?' : 'Will I reach my goal?'}
          </button>
        </div>

        {/* Messages Feed */}
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {adviceMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[18px] px-4 py-2.5 text-[14px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--navy)] text-white rounded-tr-xs'
                    : 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-tl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isAskingAI && (
            <div className="flex gap-2.5 items-center text-caption text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--yellow)] animate-pulse"></span>
              <span>{lang === 'bn' ? 'এআই উত্তর তৈরি করছে...' : 'AI is analyzing your finances...'}</span>
            </div>
          )}
        </div>

        {/* Input Row */}
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
            placeholder={lang === 'bn' ? 'আপনার বাজেট বা খরচ নিয়ে প্রশ্ন করুন...' : 'Ask about your budget, cash-outs, or savings...'}
            className="flex-1 px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none placeholder:text-[var(--muted)]"
          />
          <button
            type="submit"
            disabled={isAskingAI || !adviceInput.trim()}
            className="btn-primary !px-4 !py-2.5 disabled:opacity-50"
            aria-label={lang === 'bn' ? 'বার্তা পাঠান' : 'Send message'}
          >
            <Send className="w-4 h-4 text-[var(--navy)]" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
          </button>
        </form>
      </section>
    </div>
  );
};
