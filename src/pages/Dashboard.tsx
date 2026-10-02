import React, { useState } from 'react';
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
import { askAICoach, buildCoachContext } from '../services/aiCoachEngine';

export const Dashboard: React.FC = () => {
  const { customer, profile, forecast, risk, anomalies, recommendations, goals, lang, t, formatMoney } = useFinancial();

  // AI Advice Chat state in dashboard
  const [adviceInput, setAdviceInput] = useState('');
  const [adviceMessages, setAdviceMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'আসসালামু আলাইকুম রহিম! আপনার বর্তমান খরচের গতিপথ অনুযায়ী আগামী ১১ দিনের মধ্যে ওয়ালেট ঘাটতির ঝুঁকি রয়েছে। খাবার ও ক্যাশ-আউট খরচ কিছুটা কমিয়ে কীভাবে মাস শেষ সুরক্ষিত করবেন তা জানতে আমাকে প্রশ্ন করতে পারেন।',
    },
  ]);
  const [isAskingAI, setIsAskingAI] = useState(false);

  const handleAskAI = async (queryText?: string) => {
    const q = (queryText || adviceInput).trim();
    if (!q || isAskingAI) return;

    setAdviceMessages((prev) => [...prev, { role: 'user', text: q }]);
    setAdviceInput('');
    setIsAskingAI(true);

    try {
      const coachContext = buildCoachContext(profile, risk, forecast.monthEndForecast, anomalies);
      const res = await askAICoach(`[বাংলায় সংক্ষিপ্ত ও ব্যবহারিক পরামর্শ দিন]: ${q}`, coachContext, adviceMessages);
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

  const categoryNamesBn: Record<string, string> = {
    Food: 'খাবার ও রেস্তোরাঁ',
    Shopping: 'কেনাকাটা',
    'Cash-out': 'ক্যাশ-আউট',
    Bills: 'ইউটিলিটি বিল',
    Transport: 'যাতায়াত',
    Healthcare: 'স্বাস্থ্যসেবা',
    Education: 'শিক্ষা',
    Entertainment: 'বিনোদন',
    Recharge: 'মোবাইল রিচার্জ',
    Utilities: 'বিদ্যুৎ ও গ্যাস',
    Other: 'অন্যান্য',
  };

  const categoryPieData = anomalies.slice(0, 5).map((a, i) => ({
    name: categoryNamesBn[a.category] || a.category,
    value: a.currentSpending,
    color: BRAND_PIE_COLORS[i % BRAND_PIE_COLORS.length],
  }));

  // Line chart data (14-day trend)
  const lineChartData = forecast.dailyProjections.slice(0, 14).map((p) => ({
    day: `দিন ${p.dayOffset}`,
    balance: p.projectedBalance,
    baseline: p.baselineBalance,
  }));

  // Circular gauge calculations (Circumference of r=42 is 2 * PI * 42 ~= 263.89)
  const riskPct = Math.round(risk.probability * 100);
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (riskPct / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 2) HERO BANNER */}
      <section
        className="relative overflow-hidden rounded-[28px] bg-[var(--navy)] text-white p-6 sm:p-10 shadow-[0_4px_24px_rgba(11,31,75,0.08)]"
        aria-label="অ্যাকাউন্ট সারসংক্ষেপ ও আর্থিক স্বাস্থ্য"
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
              <span>অ্যাকাউন্ট বিশ্লেষণ · অক্টোবর ২০২৬</span>
            </div>

            <h1 className="font-heading font-extrabold text-white leading-[1.2]">
              সমস্যা হওয়ার আগেই জানুন আপনার ভবিষ্যৎ আর্থিক অবস্থা
            </h1>

            <p className="text-white/85 text-[15.5px] max-w-2xl leading-relaxed">
              উপায় এআই আপনার ওয়ালেটের খরচের গতিধারা ও আসন্ন বিল পর্যালোচনা করে সম্ভাব্য ঘাটতি পূর্বাভাস দেয়, যাতে মাস শেষে টানাপোড়েন এড়ানো যায়।
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to="/simulator" className="btn-primary">
                <Sliders className="w-4 h-4 text-[var(--navy)]" />
                <span>সিমুলেশন শুরু করুন</span>
              </Link>
              <Link to="/coach" className="btn-secondary-white">
                <Bot className="w-4 h-4 text-white" />
                <span>এআই পরামর্শকের সাথে কথা বলুন</span>
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
                  ঘাটতির ঝুঁকি
                </span>
                <span className="font-heading font-extrabold text-[38px] sm:text-[42px] text-[var(--danger)] leading-none my-0.5">
                  {riskPct}%
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                  উচ্চ ঝুঁকি
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3) SUMMARY STATS ROW (5 Cards) */}
      <section
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        aria-label="আর্থিক সারসংক্ষেপ মেট্রিক্স"
      >
        {/* Card 1: মোট আয় */}
        <div className="upay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--muted)]">মোট আয়</span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--ink)] leading-none">
              {formatMoney(profile.monthlyIncome)}
            </p>
          </div>
          <p className="text-caption text-[var(--muted)]">পরবর্তী বেতন: ১১ দিন পর</p>
        </div>

        {/* Card 2: মাসিক বাজেট / বর্তমান ব্যালেন্স */}
        <div className="upay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--muted)]">মাসিক বাজেট</span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--ink)] leading-none">
              {formatMoney(profile.currentBalance)}
            </p>
          </div>
          <p className="text-caption text-[var(--muted)]">বর্তমান ওয়ালেট ব্যালেন্স</p>
        </div>

        {/* Card 3: মোট খরচ */}
        <div className="upay-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--muted)]">মোট খরচ</span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--ink)] leading-none">
              {formatMoney(profile.averageMonthlySpending)}
            </p>
          </div>
          <p className="text-caption text-[var(--muted)]">দৈনিক গড়: {formatMoney(profile.averageDailySpending)}/দিন</p>
        </div>

        {/* Card 4: আর্থিক ঝুঁকি (Highlighted with danger-soft background & red badge) */}
        <div className="upay-card-danger p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[var(--danger)]">আর্থিক ঝুঁকি</span>
            <div className="w-8 h-8 rounded-[14px] bg-white flex items-center justify-center text-[var(--danger)] shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <p className="font-heading font-extrabold text-[26px] sm:text-[28px] text-[var(--danger)] leading-none">
              {riskPct}%
            </p>
            <span className="px-2 py-0.5 rounded-full bg-[var(--danger)] text-white text-[11px] font-extrabold">
              উচ্চ ঝুঁকি
            </span>
          </div>
          <p className="text-caption text-[var(--danger)] font-medium">ঘাটতির উচ্চ সম্ভাবনা বিদ্যমান</p>
        </div>

        {/* Card 5: আগামী মাসের পূর্বাভাস */}
        <div className="upay-card p-5 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--muted)]">মাস শেষের ব্যালেন্স</span>
            <div className="w-8 h-8 rounded-[14px] bg-[var(--bg)] flex items-center justify-center text-[var(--navy)]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <p className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[var(--danger)] leading-none">
              {formatMoney(forecast.monthEndForecast)}
            </p>
          </div>
          <p className="text-caption text-[var(--danger)] font-medium">৳১,০০০ এর নিচে নামবে ৯ দিনে</p>
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
                <h3 className="text-[#0B1F4B]">১৪ দিনের আয়-ব্যয় ট্রেন্ড</h3>
                <p className="text-caption text-[var(--muted)] mt-0.5">
                  বর্তমান খরচের ধারা বনাম নিরাপদ ব্যালেন্সের গতিপথ
                </p>
              </div>
              <Link
                to="/forecast"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
              >
                <span>বিস্তারিত</span>
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
                      fontFamily: 'Hind Siliguri, sans-serif',
                    }}
                    formatter={(val: any) => [formatMoney(Number(val)), 'ব্যালেন্স']}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="এআই পূর্বাভাস ব্যালেন্স"
                    stroke="#FFC20E"
                    strokeWidth={3}
                    dot={{ fill: '#0B1F4B', stroke: '#FFC20E', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#FFC20E' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="সাধারণ গড় লাইন"
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
                <strong>জরুরি সতর্কতা:</strong> আগামী ৯ দিনের মধ্যে ওয়ালেট ব্যালেন্স ১,০০০ টাকার নিচে নেমে যাওয়ার স্পষ্ট ঝুঁকি রয়েছে।
              </span>
            </div>
          </div>

          {/* Card 2: জানুন ঝুঁকি কেন ৮২%? (2x2 Grid of reason tiles) */}
          <div className="upay-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#0B1F4B]">জানুন ঝুঁকি কেন {riskPct}%?</h3>
                <p className="text-caption text-[var(--muted)] mt-0.5">
                  গাণিতিক মডেলের শীর্ষ ৪টি কারণ যা আপনার ওয়ালেট ঘাটতি তৈরি করছে
                </p>
              </div>
              <Link
                to="/risk"
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
              >
                <span>ঝুঁকি বিশ্লেষণ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2x2 Grid of reason tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tile 1 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">১. খাবার খরচ বৃদ্ধি</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                    +৩৬.৮%
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  রেস্তোরাঁ ও ফুড ডেলিভারি ব্যয় স্বাভাবিক গড়ের চেয়ে অতিরিক্ত হওয়ায় তহবিল দ্রুত হ্রাস পাচ্ছে।
                </p>
              </div>

              {/* Tile 2 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">২. ক্যাশ-আউট নির্ভরতা</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] text-[11px] font-extrabold">
                    +২১%
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  এজেন্ট থেকে ঘন ঘন ক্যাশ-আউট ফি বাবদ অতিরিক্ত খরচ হচ্ছে এবং হিসাবের অস্বচ্ছতা বাড়ছে।
                </p>
              </div>

              {/* Tile 3 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">৩. আসন্ন ইউটিলিটি বিল</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[11px] font-extrabold">
                    ৳২,০০০
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  বেতন পাওয়ার পূর্বেই ডিপিডিসি বিদ্যুৎ ও ইন্টারনেট বিল পরিশোধের নির্ধারিত বাধ্যবাধকতা রয়েছে।
                </p>
              </div>

              {/* Tile 4 */}
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5 hover:border-[#D3DAE8] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">৪. আয়ের দূরত্ব</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)] text-[11px] font-extrabold">
                    ১১ দিন বাকি
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed">
                  পরবর্তী বেতন আসার আগে অবশিষ্ট ব্যালেন্স দিয়ে দৈনিক মৌলিক চাহিদা পরিচালনা কঠিন হতে পারে।
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
              <h3 className="text-[#0B1F4B]">ক্যাটাগরি ব্যয়</h3>
              <Link
                to="/spending"
                className="text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
              >
                সব দেখুন
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
                      fontFamily: 'Hind Siliguri, sans-serif',
                    }}
                    formatter={(v: any) => [formatMoney(Number(v)), 'ব্যয়']}
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
              <h3 className="text-[#0B1F4B]">আসন্ন বিল ও চার্জ</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[11px] font-bold">
                শীঘ্রই প্রদেয়
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
                    <p className="text-caption text-[var(--muted)]">বাকি {exp.dueDays} দিন · {exp.category}</p>
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
              <h3 className="text-[#0B1F4B]">লক্ষ্য অগ্রগতি</h3>
              <Link
                to="/goals"
                className="text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] transition-colors"
              >
                পরিচালনা
              </Link>
            </div>

            {goals.length > 0 && (
              <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">{goals[0].goal_name}</span>
                  <span className="font-heading font-extrabold text-[14px] text-[var(--navy)]">
                    {Math.round((goals[0].current_amount / goals[0].target_amount) * 100)}%
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
                  <span>জমা: {formatMoney(goals[0].current_amount)}</span>
                  <span>টার্গেট: {formatMoney(goals[0].target_amount)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5) AI ADVICE SECTION (Chat-style panel with suggestion chips and yellow send button) */}
      <section className="upay-card p-6 sm:p-8 space-y-4" aria-label="এআই আর্থিক পরামর্শ">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-[var(--yellow)] flex items-center justify-center font-bold text-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[#0B1F4B]">উপায় এআই পরামর্শক</h3>
              <p className="text-caption text-[var(--muted)]">
                আপনার ডেটাসেটের ভিত্তিতে বাস্তবসম্মত ও নিরপেক্ষ আর্থিক পরামর্শ
              </p>
            </div>
          </div>
          <Link
            to="/coach"
            className="text-[13px] font-bold text-[var(--navy)] hover:text-[var(--yellow)] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>সম্পূর্ণ চ্যাটে যান</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[12.5px] font-bold text-[var(--muted)] shrink-0">পরামর্শ চান:</span>
          <button
            onClick={() => handleAskAI('আমার আর্থিক ঝুঁকি কেন ৮২%?')}
            className="px-3 py-1 rounded-full bg-[var(--bg)] hover:bg-[var(--yellow-soft)] border border-[var(--line)] hover:border-[var(--yellow)] text-[var(--navy)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            ঝুঁকি কেন ৮২%?
          </button>
          <button
            onClick={() => handleAskAI('খাবারে ১৫% খরচ কমালে কী লাভ হবে?')}
            className="px-3 py-1 rounded-full bg-[var(--bg)] hover:bg-[var(--yellow-soft)] border border-[var(--line)] hover:border-[var(--yellow)] text-[var(--navy)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            খাবারে ১৫% কমালে কী হবে?
          </button>
          <button
            onClick={() => handleAskAI('আমি কি ল্যাপটপ কেনার লক্ষ্য পূরণ করতে পারব?')}
            className="px-3 py-1 rounded-full bg-[var(--bg)] hover:bg-[var(--yellow-soft)] border border-[var(--line)] hover:border-[var(--yellow)] text-[var(--navy)] text-[12.5px] font-medium transition-all shrink-0 cursor-pointer"
          >
            ল্যাপটপের লক্ষ্য পূরণ হবে?
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
              <span>এআই উত্তর তৈরি করছে...</span>
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
            placeholder="আপনার বাজেট বা খরচ নিয়ে প্রশ্ন করুন..."
            className="flex-1 px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none placeholder:text-[var(--muted)]"
          />
          <button
            type="submit"
            disabled={isAskingAI || !adviceInput.trim()}
            className="btn-primary !px-4 !py-2.5 disabled:opacity-50"
            aria-label="বার্তা পাঠান"
          >
            <Send className="w-4 h-4 text-[var(--navy)]" />
            <span className="hidden sm:inline">পাঠান</span>
          </button>
        </form>
      </section>
    </div>
  );
};
