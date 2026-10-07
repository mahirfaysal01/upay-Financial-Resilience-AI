import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Gift,
  Coins,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Users,
  QrCode,
  Info,
  HelpCircle,
  Zap,
  ShoppingBag,
  Ticket,
  UtensilsCrossed,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import {
  FESTIVAL_CALENDAR,
  calculateUtsob90DayForecast,
} from '../services/utsobShieldEngine';

export const UtsobShield: React.FC = () => {
  const {
    customer,
    profile,
    lang,
    formatMoney,
    isUtsobShieldActive,
    toggleUtsobShield,
    utsobSavedAmount,
    withdrawUtsobPocket,
    selectedFestivalId,
    setSelectedFestivalId,
    utsobProfile,
    qurbaniPlan,
    updateQurbaniPlan,
    setSelectedCustomerId,
  } = useFinancial();

  const { notifySuccess, notifyInfo } = useNotification();
  const [activeTab, setActiveTab] = useState<'SHOCK_ABSORBER' | 'QURBANI_PLANNER'>('SHOCK_ABSORBER');
  const [qurbaniAnimal, setQurbaniAnimal] = useState<'ONE_SEVENTH_COW' | 'FULL_GOAT' | 'FULL_COW'>('ONE_SEVENTH_COW');

  // Generate 90-day forecast points reflecting live shield status
  const forecast90 = calculateUtsob90DayForecast(
    profile,
    isUtsobShieldActive,
    utsobSavedAmount
  );

  const chartData = forecast90.projections.map((p) => ({
    dayLabel: p.dayLabel,
    date: p.date,
    dayOffset: p.dayOffset,
    'সাধারণ (ভ্যালিসহ)': p.unshieldedBalance,
    'উৎসব শিল্ড সুরক্ষিত': p.shieldedBalance,
    'পকেট ফ্লোট': p.pocketAccumulation,
    eventFlag: p.eventFlag,
    isValley: p.isEidValley,
  }));

  const handleToggleShield = () => {
    const nextState = !isUtsobShieldActive;
    toggleUtsobShield();
    if (nextState) {
      notifySuccess(
        lang === 'bn' ? 'উৎসব শিল্ড সক্রিয় করা হয়েছে!' : 'Utsob Shield Activated!',
        lang === 'bn'
          ? `আজ থেকে দৈনিক ${formatMoney(utsobProfile.dailyPocketAmount)} উৎসব পকেটে জমা হবে। ৯০ দিনের গভীর ঈদ ভ্যালি সমতল করা হয়েছে!`
          : `Setting aside ${formatMoney(utsobProfile.dailyPocketAmount)}/day into your Utsob Pocket. The Eid deficit valley is now flattened!`,
        { duration: 5500 }
      );
    } else {
      notifyInfo(
        lang === 'bn' ? 'উৎসব শিল্ড নিষ্ক্রিয়' : 'Utsob Shield Paused',
        lang === 'bn'
          ? 'উৎসব পকেটের স্বয়ংক্রিয় বরাদ্দ স্থগিত করা হয়েছে।'
          : 'Automated festival pocket deductions paused.'
      );
    }
  };

  const handleWithdraw = () => {
    if (utsobSavedAmount <= 0) return;
    const amountWithdrawn = utsobSavedAmount;
    withdrawUtsobPocket();
    notifySuccess(
      lang === 'bn' ? 'টাকা মূল ওয়ালেটে স্থানান্তরিত' : 'Funds Withdrawn to Main Wallet',
      lang === 'bn'
        ? `উৎসব পকেট থেকে ${formatMoney(amountWithdrawn)} কোনো পেনাল্টি ছাড়া মূল ওয়ালেটে জমা হয়েছে।`
        : `Successfully transferred ${formatMoney(amountWithdrawn)} back to main wallet with 0% penalty.`
    );
  };

  const handleSelectAnimal = (type: 'ONE_SEVENTH_COW' | 'FULL_GOAT' | 'FULL_COW') => {
    setQurbaniAnimal(type);
    let cost = 22000;
    let typeBn = '১/৭ গরুর অংশীদারিত্ব (১ অংশ)';
    if (type === 'FULL_GOAT') {
      cost = 15000;
      typeBn = 'আস্ত খাসি / ছাগল কোরবানি';
    } else if (type === 'FULL_COW') {
      cost = 140000;
      typeBn = 'সম্পূর্ণ গরু কোরবানি';
    }
    const total = cost + qurbaniPlan.hasilAndTransportFee + qurbaniPlan.butcherAndProcessingFee;
    updateQurbaniPlan({
      shareType: type,
      shareTypeBn: typeBn,
      animalCost: cost,
      totalTarget: total,
      weeklyTarget: Math.ceil(total / qurbaniPlan.weeksRemaining),
      dailyTarget: Math.ceil(total / (qurbaniPlan.weeksRemaining * 7)),
    });
  };

  const activeFestival = FESTIVAL_CALENDAR.find((f) => f.id === selectedFestivalId) || FESTIVAL_CALENDAR[0];

  return (
    <div className="space-y-6 route-fade-slide">
      {/* Top Banner & Festival Horizon Switcher */}
      <div className="upay-card p-6 border-amber-300/60 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[12px] font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ট্র্যাক ০৩ ইনোভেশন · উৎসব শিল্ড' : 'Track 03 Innovation • Utsob Shield'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[12px] font-bold border border-[var(--brand-primary)]/20">
                <Calendar className="w-3 h-3" />
                <span>{lang === 'bn' ? '৯০ দিনের মৌসুমী পূর্বাভাস' : '90-Day Seasonal Forecast'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--navy)] mt-2">
              {lang === 'bn'
                ? 'উৎসব শিল্ড: ঈদ ও উৎসবের আর্থিক শক অ্যাবজরবার'
                : 'Utsob Shield: Eid & Festival Shock Absorber'}
            </h1>
            <p className="text-[14px] text-[var(--muted)] max-w-2xl mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'আপনার এআই ক্যাশ-ফ্লো মডেল ৯০ দিন আগেই ঈদের খরচ শনাক্ত করে এবং তা প্রতিদিন ক্ষুদ্র পরিমাণে আলাদা করে মাস শেষের ঋণমুক্ত রাখে।'
                : 'Forecasts festival expenses 90 days ahead and absorbs the shock into automated micro-amounts, preventing post-Eid liquidity deficit.'}
            </p>
          </div>

          {/* Quick Persona Demo Switcher if not Farhan */}
          {customer.customer_id !== 'C006' && (
            <button
              onClick={() => setSelectedCustomerId('C006')}
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-900 text-[12.5px] font-bold border border-amber-300 transition-all flex items-center gap-2 self-start lg:self-center shrink-0 cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4 text-amber-700" />
              <span>{lang === 'bn' ? 'ফারহান কবির (C006) প্রোফাইল দেখুন' : 'Switch to Farhan Kabir (C006)'}</span>
            </button>
          )}
        </div>

        {/* Festival Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-amber-200/60 scrollbar-none">
          {FESTIVAL_CALENDAR.map((fest) => {
            const isSelected = selectedFestivalId === fest.id;
            return (
              <button
                key={fest.id}
                onClick={() => setSelectedFestivalId(fest.id)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--navy)] text-white shadow-md scale-102'
                    : 'bg-white/80 hover:bg-white text-[var(--navy)] border border-slate-200'
                }`}
              >
                <span>{fest.season === 'EID_UL_FITR' ? '🌙' : fest.season === 'EID_UL_ADHA' ? '🐄' : fest.season === 'POHELA_BOISHAKH' ? '🌺' : '🎓'}</span>
                <span>{lang === 'bn' ? fest.nameBn : fest.name}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                  {lang === 'bn' ? `${fest.daysAhead} দিন বাকি` : `${fest.daysAhead}d ahead`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Switcher: Utsob Shock Absorber vs Qurbani Planner */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('SHOCK_ABSORBER')}
          className={`px-5 py-2.5 rounded-xl font-heading font-bold text-[14.5px] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'SHOCK_ABSORBER'
              ? 'bg-[var(--yellow)] text-[var(--navy)] shadow-md'
              : 'text-slate-600 hover:text-[var(--navy)] hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{lang === 'bn' ? 'উৎসব শক অ্যাবজরবার ও ৯০ দিনের গ্রাফ' : 'Festival Shock Absorber & 90-Day Forecast'}</span>
        </button>

        <button
          onClick={() => setActiveTab('QURBANI_PLANNER')}
          className={`px-5 py-2.5 rounded-xl font-heading font-bold text-[14.5px] transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'QURBANI_PLANNER'
              ? 'bg-[var(--yellow)] text-[var(--navy)] shadow-md'
              : 'text-slate-600 hover:text-[var(--navy)] hover:bg-slate-100'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>{lang === 'bn' ? 'কোরবানি শেয়ার প্ল্যানার (ঈদুল আজহা)' : 'Qurbani Share Planner'}</span>
        </button>
      </div>

      {activeTab === 'SHOCK_ABSORBER' ? (
        <>
          {/* Hero 60-Second Demo Section: 90-Day Forecast with Red Valley */}
          <div className="upay-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[12px] font-bold">
                  {lang === 'bn' ? '৬০-সেকেন্ড লাইভ ডেমো · লাল ঈদ ভ্যালি' : '60-Second Demo • The Red Eid Valley'}
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[var(--navy)] mt-1.5">
                  {lang === 'bn' ? '৯০ দিনের ক্যাশ-ফ্লো ও ঈদ শক সিমুলেশন' : '90-Day Cash-Flow & Festival Shock Simulation'}
                </h2>
                <p className="text-[13.5px] text-[var(--muted)] mt-0.5">
                  {lang === 'bn'
                    ? 'নিচে লক্ষ্য করুন: মার্চ মাসে ঈদের কেনাকাটা ও ট্রেনের টিকিটের কারণে লাল ভ্যালি কীভাবে শূন্যের নিচে নেমে যাচ্ছে।'
                    : 'Observe the deep red valley in March dipping below zero due to Eid shopping and advance train tickets.'}
                </p>
              </div>

              {/* 1-Tap Utsob Shield Toggle */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  onClick={handleToggleShield}
                  className={`px-5 py-3 rounded-2xl font-heading font-extrabold text-[14.5px] transition-all flex items-center gap-2.5 shadow-lg cursor-pointer transform active:scale-95 ${
                    isUtsobShieldActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-4 ring-emerald-100'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-[var(--navy)] hover:brightness-105 shadow-amber-500/30 animate-pulse'
                  }`}
                >
                  {isUtsobShieldActive ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <span>{lang === 'bn' ? 'উৎসব শিল্ড সক্রিয় (ভ্যালি সমতল)' : 'Shield Active (Valley Flattened)'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 text-[var(--navy)]" />
                      <span>
                        {lang === 'bn'
                          ? `শিল্ড চালু করুন (${formatMoney(utsobProfile.dailyPocketAmount)}/দিন)`
                          : `Start Shield (${formatMoney(utsobProfile.dailyPocketAmount)}/day)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[12.5px] font-semibold text-[var(--muted)]">
                  {lang === 'bn' ? 'ঈদের বাকি দিন' : 'Days Until Eid'}
                </span>
                <p className="font-heading font-extrabold text-2xl text-[var(--navy)] mt-1">
                  {lang === 'bn' ? `${utsobProfile.daysUntilFestival} দিন` : `${utsobProfile.daysUntilFestival} days`}
                </p>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                  {lang === 'bn' ? activeFestival.estimatedDate : activeFestival.estimatedDate}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[12.5px] font-semibold text-amber-900">
                  {lang === 'bn' ? 'উৎসবের প্রাক্কলিত ব্যয়' : 'Estimated Festival Shock'}
                </span>
                <p className="font-heading font-extrabold text-2xl text-amber-900 mt-1">
                  {formatMoney(utsobProfile.totalEstimatedCost)}
                </p>
                <p className="text-[11.5px] text-amber-800 mt-0.5">
                  {lang === 'bn' ? 'বোনাস ক্রেডিট: ' + formatMoney(utsobProfile.expectedBonusAmount) : 'Bonus: ' + formatMoney(utsobProfile.expectedBonusAmount)}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${isUtsobShieldActive ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <span className={`text-[12.5px] font-semibold ${isUtsobShieldActive ? 'text-emerald-900' : 'text-red-900'}`}>
                  {lang === 'bn' ? 'মাস শেষের ডেফিসিট ঝুঁকি' : 'Post-Eid Deficit Shock'}
                </span>
                <p className={`font-heading font-extrabold text-2xl mt-1 ${isUtsobShieldActive ? 'text-emerald-700' : 'text-red-600'}`}>
                  {isUtsobShieldActive ? (lang === 'bn' ? '৳০ (সুরক্ষিত)' : '৳0 (Safe)') : formatMoney(utsobProfile.deficitWithoutShield)}
                </p>
                <p className={`text-[11.5px] mt-0.5 ${isUtsobShieldActive ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isUtsobShieldActive ? (lang === 'bn' ? 'কোনো ধার-দেনা লাগবে না' : 'Zero debt reliance') : (lang === 'bn' ? 'ঋণ ও ক্রেডিট কার্ডের ফাঁদ' : 'Credit / debt trap')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[12.5px] font-semibold text-blue-900">
                  {lang === 'bn' ? 'উৎসব পকেট ফ্লোট' : 'Utsob Pocket Balance'}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-heading font-extrabold text-2xl text-blue-900">
                    {formatMoney(utsobSavedAmount)}
                  </p>
                  {utsobSavedAmount > 0 && (
                    <button
                      onClick={handleWithdraw}
                      title={lang === 'bn' ? 'যেকোনো মুহূর্তে ০% পেনাল্টিতে ফেরত নিন' : 'Withdraw anytime with 0% penalty'}
                      className="px-2 py-1 text-[11px] font-bold text-blue-800 bg-blue-200/80 hover:bg-blue-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'bn' ? 'উইথড্র' : 'Withdraw'}
                    </button>
                  )}
                </div>
                <p className="text-[11.5px] text-blue-700 mt-0.5">
                  {isUtsobShieldActive ? `+${formatMoney(utsobProfile.dailyPocketAmount)}/দিন` : (lang === 'bn' ? 'অপ্ট-ইন প্রয়োজন' : 'Opt-in required')}
                </p>
              </div>
            </div>

            {/* 90-Day Trajectory Chart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px] text-[var(--muted)] flex-wrap gap-2">
                <span className="font-bold text-[var(--navy)]">
                  {lang === 'bn' ? 'বহুমাত্রিক ৯০ দিনের ভবিষ্যৎ পূর্বাভাস' : '90-Day Trajectory: Unshielded vs Shielded'}
                </span>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-red-600 font-bold">
                    <span className="w-3.5 h-1 bg-red-500 rounded-full inline-block" />
                    <span>{lang === 'bn' ? 'সাধারণ ক্যাশ-ফ্লো (লাল ভ্যালি)' : 'Unshielded (Red Valley)'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="w-3.5 h-1 bg-emerald-500 rounded-full inline-block" />
                    <span>{lang === 'bn' ? 'উৎসব শিল্ড দ্বারা সমতলকৃত' : 'Utsob Shield (Flattened)'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                    <span className="w-3.5 h-1 bg-blue-500 border-dashed rounded-full inline-block" />
                    <span>{lang === 'bn' ? 'পকেট ফ্লোট সঞ্চয়' : 'Pocket Float'}</span>
                  </span>
                </div>
              </div>

              <div className="h-80 w-full bg-slate-50/50 p-2 rounded-2xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 15, left: -5, bottom: 5 }}>
                    <XAxis dataKey="dayLabel" stroke="#94A3B8" fontSize={11} interval={9} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        fontSize: '12.5px',
                        boxShadow: '0 8px 24px rgba(11, 31, 75, 0.12)',
                        color: '#0B1F4B',
                        fontFamily: 'Hind Siliguri, sans-serif',
                      }}
                      formatter={(val: any, name: any) => [formatMoney(Number(val)), name]}
                      labelFormatter={(label, payload) => {
                        const point = payload?.[0]?.payload;
                        return point?.eventFlag
                          ? `${point.date} (${label}) • ${point.eventFlag}`
                          : `${point?.date || ''} (${label})`;
                      }}
                    />

                    {/* Safety Buffer Reference Line */}
                    <ReferenceLine
                      y={1000}
                      stroke="#E5484D"
                      strokeDasharray="4 4"
                      label={{
                        value: lang === 'bn' ? '৳১,০০০ বিপদ সীমা' : '৳1,000 Safety Floor',
                        fill: '#E5484D',
                        fontSize: 11,
                        position: 'insideBottomRight',
                      }}
                    />

                    {/* Unshielded Valley Line */}
                    <Line
                      type="monotone"
                      dataKey="সাধারণ (ভ্যালিসহ)"
                      stroke="#EF4444"
                      strokeWidth={isUtsobShieldActive ? 1.5 : 3.5}
                      strokeDasharray={isUtsobShieldActive ? '4 4' : undefined}
                      dot={false}
                    />

                    {/* Shielded Safe Line */}
                    <Line
                      type="monotone"
                      dataKey="উৎসব শিল্ড সুরক্ষিত"
                      stroke="#10B981"
                      strokeWidth={isUtsobShieldActive ? 3.5 : 1}
                      dot={false}
                    />

                    {/* Pocket Float Growth Area */}
                    {isUtsobShieldActive && (
                      <Area
                        type="monotone"
                        dataKey="পকেট ফ্লোট"
                        fill="#3B82F6"
                        fillOpacity={0.12}
                        stroke="#3B82F6"
                        strokeWidth={1.5}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Callout explaining the flattening */}
              {isUtsobShieldActive ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-emerald-950 text-[14px]">
                      {lang === 'bn' ? 'উৎসবের লাল ভ্যালি পুরোপুরি সমতল করা হয়েছে!' : 'The Red Eid Valley is Completely Flattened!'}
                    </h4>
                    <p className="text-[13px] text-emerald-800 mt-0.5 leading-relaxed">
                      {lang === 'bn'
                        ? `আজ থেকে মাত্র ${formatMoney(utsobProfile.dailyPocketAmount)}/দিন আলাদা হয়ে উৎসব পকেটে জমা হচ্ছে। ফলে ঈদের কেনাকাটা ও ভ্রমণের সময় মূল অ্যাকাউন্ট ১,০০০ টাকার নিরাপদ সীমার ওপরেই থাকবে।`
                        : `By accumulating ${formatMoney(utsobProfile.dailyPocketAmount)}/day starting today, your wallet liquidity remains above safety threshold throughout the entire festival.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-bold text-red-950 text-[14px]">
                      {lang === 'bn' ? 'সতর্কতা: মার্চ মাসে গভীর ঈদ ভ্যালি ও ঘাটতি দৃশ্যমান' : 'Warning: Deep Eid Valley & Post-Festival Deficit Detected'}
                    </h4>
                    <p className="text-[13px] text-red-800 mt-0.5 leading-relaxed">
                      {lang === 'bn'
                        ? `বোনাস ঈদের ৪ দিন আগে আসার কারণে ঈদের কেনাকাটা ও ট্রেনের টিকিট কাটার সময় আপনার ব্যালেন্স ঋণাত্মক অঞ্চলে পৌঁছাবে। উপরের বাটনে চাপ দিয়ে 'উৎসব শিল্ড' সক্রিয় করুন।`
                        : `Because festival bonus arrives only 4 days before Eid, advance shopping and travel cause you to start next month in deficit. Tap 'Start Shield' above to eliminate this.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Farhan's Story & The Bonus Timing Trap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* The Bonus Timing Trap Timeline */}
            <div className="lg:col-span-7 upay-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-heading font-extrabold text-[18px] text-[var(--navy)]">
                  {lang === 'bn' ? 'ফারহানের কেস স্টাডি ও "বোনাস টাইমিং ফাঁদ"' : 'The Bonus Timing Trap: Why Eid Creates Debt'}
                </h3>
              </div>
              <p className="text-[13.5px] text-[var(--muted)] leading-relaxed">
                {lang === 'bn'
                  ? 'বাংলাদেশে ৯২% চাকুরিজীবীর বোনাস ঈদের ৩-৪ দিন আগে আসে। অথচ শপিং ও ট্রেনের অগ্রিম টিকিট কাটতে হয় ২০ দিন আগে। ফলে মানুষ ক্রেডিট কার্ড বা আত্মীয়দের চড়া ঋণে জড়িয়ে পড়ে।'
                  : '92% of salaried individuals receive bonus 3–4 days before Eid, but advance shopping and train tickets must be paid 20 days prior, forcing costly borrowing.'}
              </p>

              {/* Step Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    -২২দ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13.5px] text-[var(--navy)]">
                        {lang === 'bn' ? 'পোশাক ও পারিবারিক শপিং' : 'Eid Shopping & Attire'}
                      </span>
                      <span className="text-[12px] font-bold text-red-600">{formatMoney(8500)}</span>
                    </div>
                    <p className="text-[12px] text-[var(--muted)] mt-0.5">
                      {lang === 'bn' ? 'হাতে নগদ না থাকায় ক্রেডিট কার্ডে কেনাকাটা করা হয়।' : 'Purchased on credit because salary is not yet credited.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    -১৫দ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13.5px] text-[var(--navy)]">
                        {lang === 'bn' ? 'বাড়ি ফেরার অগ্রিম টিকিট' : 'Advance Travel Tickets'}
                      </span>
                      <span className="text-[12px] font-bold text-red-600">{formatMoney(3200)}</span>
                    </div>
                    <p className="text-[12px] text-[var(--muted)] mt-0.5">
                      {lang === 'bn' ? 'অনলাইন ট্রেনের টিকিট বা বাসের টিকিট বুকিং।' : 'Railway or intercity bus bookings.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-300">
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    -৪দ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13.5px] text-amber-950">
                        {lang === 'bn' ? 'বোনাস ক্রেডিট হয় (দেরি হয়ে গেছে!)' : 'Festival Bonus Arrives (Too Late!)'}
                      </span>
                      <span className="text-[12px] font-bold text-emerald-700">+{formatMoney(15000)}</span>
                    </div>
                    <p className="text-[12px] text-amber-900 mt-0.5">
                      {lang === 'bn' ? 'বোনাস আসার আগেই ১১,৭০০ টাকা দেনা হয়ে গেছে।' : 'Already in ৳11,700 credit debt by the time bonus lands.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    +১ম
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13.5px] text-red-950">
                        {lang === 'bn' ? 'পরবর্তী মাস শুরু হয় বিশাল ঘাটতিতে' : 'Next Month Starts in Severe Deficit'}
                      </span>
                      <span className="text-[12px] font-bold text-red-600">-{formatMoney(8200)}</span>
                    </div>
                    <p className="text-[12px] text-red-800 mt-0.5">
                      {lang === 'bn' ? 'ক্রেডিট কার্ডের বিল ও ঋণ পরিশোধে পরবর্তী মাসজুড়ে টানাপোড়েন।' : 'Struggles with credit repayments throughout the following month.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Festival Spending Breakdown */}
            <div className="lg:col-span-5 upay-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-[18px] text-[var(--navy)]">
                    {lang === 'bn' ? 'উৎসব ব্যয়ের বিশ্লেষণ' : 'Festival Spending Breakdown'}
                  </h3>
                  <p className="text-[13px] text-[var(--muted)]">
                    {lang === 'bn' ? 'বিগত উৎসবের লেনদেন থেকে সংগৃহীত' : 'Derived from verified historical spending'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 font-extrabold text-[13px] text-[var(--navy)]">
                  {formatMoney(utsobProfile.totalEstimatedCost)}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {utsobProfile.spendingBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {idx === 0 ? <ShoppingBag className="w-4 h-4 text-purple-600" /> : idx === 1 ? <Ticket className="w-4 h-4 text-blue-600" /> : idx === 2 ? <Gift className="w-4 h-4 text-amber-600" /> : <UtensilsCrossed className="w-4 h-4 text-rose-600" />}
                        <span className="font-bold text-[13.5px] text-[var(--navy)]">
                          {lang === 'bn' ? item.categoryBn : item.category}
                        </span>
                      </div>
                      <span className="font-extrabold text-[13.5px] text-[var(--navy)]">
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[var(--muted)] mt-1">
                      {item.notes}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ethics & Opt-in Guarantee */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-[12.5px] text-blue-900 leading-relaxed">
                  <strong>{lang === 'bn' ? 'নৈতিক ও শতভাগ নিরাপদ নীতি:' : 'Ethical & Transparent:'}</strong>{' '}
                  {lang === 'bn'
                    ? 'কোনো বাধ্যতামূলক লক-ইন নেই। আপনি যেকোনো সময় এক ক্লিকে সম্পূর্ণ জমানো টাকা মূল ওয়ালেটে ফেরত নিতে পারবেন।'
                    : '100% opt-in. Zero lock-in penalties. Withdraw your funds back to your wallet at any moment.'}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* TAB 2: QURBANI SHARE PLANNER */
        <div className="space-y-6">
          <div className="upay-card p-6 bg-gradient-to-r from-emerald-50/60 via-white to-amber-50/40 border-emerald-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200/60">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[12px] font-bold">
                  <span>🐄</span>
                  <span>{lang === 'bn' ? 'পবিত্র ঈদুল আজহা কোরবানি প্ল্যানার' : 'Qurbani Share Planner'}</span>
                </div>
                <h2 className="text-2xl font-heading font-extrabold text-[var(--navy)] mt-2">
                  {lang === 'bn' ? 'কোরবানি শেয়ার ক্যালকুলেটর ও গ্রুপ সঞ্চয়' : 'Livestock Share Calculator & Group Savings'}
                </h2>
                <p className="text-[13.5px] text-[var(--muted)] mt-0.5">
                  {lang === 'bn'
                    ? 'হাটে এককালীন বড় টাকার চাপ সামলাতে গরুর ১/৭ শেয়ার বা ছাগল নির্বাচনের মাধ্যমে আজ থেকেই স্বস্তিদায়ক পরিকল্পনা করুন।'
                    : 'Avoid last-minute cash crunches at cattle haats by planning your 1/7th cow share or full animal.'}
                </p>
              </div>

              <div className="text-right self-start sm:self-auto">
                <span className="text-[12px] font-semibold text-[var(--muted)]">
                  {lang === 'bn' ? 'ঈদুল আজহা বাকি' : 'Weeks to Eid-ul-Adha'}
                </span>
                <p className="font-heading font-extrabold text-2xl text-emerald-800">
                  {lang === 'bn' ? `${qurbaniPlan.weeksRemaining} সপ্তাহ (~১৫৫ দিন)` : `${qurbaniPlan.weeksRemaining} weeks`}
                </p>
              </div>
            </div>

            {/* Animal Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
              <button
                onClick={() => handleSelectAnimal('ONE_SEVENTH_COW')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  qurbaniAnimal === 'ONE_SEVENTH_COW'
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-[15px] text-[var(--navy)]">
                    {lang === 'bn' ? 'গরুর ১/৭ অংশীদারিত্ব' : '1/7th Cow Share'}
                  </span>
                  <span className="text-xl">🥩</span>
                </div>
                <p className="font-extrabold text-lg text-emerald-700 mt-1">{formatMoney(22000)}</p>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                  {lang === 'bn' ? 'পারিবারিক বা বন্ধুমহলে যৌথ ভাগে' : 'Most popular group option'}
                </p>
              </button>

              <button
                onClick={() => handleSelectAnimal('FULL_GOAT')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  qurbaniAnimal === 'FULL_GOAT'
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-[15px] text-[var(--navy)]">
                    {lang === 'bn' ? 'আস্ত খাসি / ছাগল' : 'Full Goat / Sheep'}
                  </span>
                  <span className="text-xl">🐐</span>
                </div>
                <p className="font-extrabold text-lg text-emerald-700 mt-1">{formatMoney(15000)}</p>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                  {lang === 'bn' ? 'একক পরিবারের কোরবানি' : 'Individual family sacrifice'}
                </p>
              </button>

              <button
                onClick={() => handleSelectAnimal('FULL_COW')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  qurbaniAnimal === 'FULL_COW'
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-[15px] text-[var(--navy)]">
                    {lang === 'bn' ? 'সম্পূর্ণ গরু কোরবানি' : 'Full Cow (7 Shares)'}
                  </span>
                  <span className="text-xl">🐄</span>
                </div>
                <p className="font-extrabold text-lg text-emerald-700 mt-1">{formatMoney(140000)}</p>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
                  {lang === 'bn' ? 'সম্পূর্ণ পরিবার বা বংশের পক্ষ থেকে' : 'Full animal for 7 family members'}
                </p>
              </button>
            </div>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cost Breakdown & Auto-Pocket */}
            <div className="lg:col-span-6 upay-card p-6 space-y-4">
              <h3 className="font-heading font-extrabold text-[18px] text-[var(--navy)]">
                {lang === 'bn' ? 'কোরবানির মোট খরচ বিশ্লেষণ' : 'Comprehensive Qurbani Cost Breakdown'}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[13.5px] font-bold text-[var(--navy)]">
                    {lang === 'bn' ? 'পশুর ক্রয়মূল্য' : 'Livestock Cost'}
                  </span>
                  <span className="font-extrabold text-[14px] text-[var(--navy)]">
                    {formatMoney(qurbaniPlan.animalCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[13.5px] font-bold text-[var(--navy)]">
                    {lang === 'bn' ? 'হাটের হাসিল ও পরিবহন' : 'Haat Hasil & Transport'}
                  </span>
                  <span className="font-extrabold text-[14px] text-[var(--navy)]">
                    {formatMoney(qurbaniPlan.hasilAndTransportFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[13.5px] font-bold text-[var(--navy)]">
                    {lang === 'bn' ? 'কসাই মজুরি ও প্রসেসিং ব্যাগ' : 'Butcher & Packaging'}
                  </span>
                  <span className="font-extrabold text-[14px] text-[var(--navy)]">
                    {formatMoney(qurbaniPlan.butcherAndProcessingFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-300">
                  <span className="text-[15px] font-heading font-extrabold text-amber-950">
                    {lang === 'bn' ? 'সর্বমোট লক্ষ্যমাত্রা' : 'Total Target Budget'}
                  </span>
                  <span className="text-xl font-heading font-extrabold text-amber-950">
                    {formatMoney(qurbaniPlan.totalTarget)}
                  </span>
                </div>
              </div>

              {/* Weekly/Daily Auto-Contribution */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[12px] font-bold uppercase text-blue-900">
                      {lang === 'bn' ? 'সাপ্তাহিক কিস্তি' : 'Weekly Target'}
                    </span>
                    <p className="font-heading font-extrabold text-xl text-blue-950">
                      {formatMoney(qurbaniPlan.weeklyTarget)} /সপ্তাহ
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-bold uppercase text-blue-900">
                      {lang === 'bn' ? 'দৈনিক কিস্তি' : 'Daily Micro-Target'}
                    </span>
                    <p className="font-heading font-extrabold text-xl text-blue-950">
                      {formatMoney(qurbaniPlan.dailyTarget)} /দিন
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    notifySuccess(
                      lang === 'bn' ? 'কোরবানি পকেট সক্রিয়!' : 'Qurbani Pocket Activated!',
                      lang === 'bn'
                        ? `আপনার কোরবানি অ্যাকাউন্টে প্রতি সপ্তাহে ${formatMoney(qurbaniPlan.weeklyTarget)} স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।`
                        : `Automated weekly allocation of ${formatMoney(qurbaniPlan.weeklyTarget)} set.`
                    );
                  }}
                  className="w-full py-2.5 rounded-xl bg-[var(--navy)] hover:bg-[var(--navy)]/90 text-white font-heading font-bold text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'bn' ? 'কোরবানি অটো-পকেট সক্রিয় করুন' : 'Start Automated Qurbani Pocket'}</span>
                </button>
              </div>
            </div>

            {/* Group Share Participants & QR Integration */}
            <div className="lg:col-span-6 upay-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-[18px] text-[var(--navy)]">
                    {lang === 'bn' ? 'যৌথ শেয়ার ট্র্যাকার (৭ জনের অংশ)' : 'Group Share Co-Planners (7 Shares)'}
                  </h3>
                  <p className="text-[13px] text-[var(--muted)]">
                    {lang === 'bn' ? 'পরিবার ও বন্ধুদের জমার রিয়েল-টাইম স্থিতি' : 'Live progress of group contributors'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                  {lang === 'bn' ? '৭/৭ অংশ পূর্ণ' : '7/7 Confirmed'}
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {qurbaniPlan.participants.map((person, idx) => {
                  const targetShare = Math.round(qurbaniPlan.totalTarget / 7);
                  const progressPct = Math.min(100, Math.round((person.paid / targetShare) * 100));
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-bold text-[var(--navy)]">{person.name}</span>
                        <span className="font-extrabold text-emerald-700">
                          {formatMoney(person.paid)} / {formatMoney(targetShare)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Digital Cattle Haat QR Payment Integration */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center text-[var(--navy)] shrink-0">
                    <QrCode className="w-5 h-5 text-amber-900" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[13.5px] text-amber-950">
                      {lang === 'bn' ? 'উপায় ডিজিটাল হাট কিউআর পেমেন্ট' : 'upay Digital Cattle Haat QR'}
                    </h5>
                    <p className="text-[12px] text-amber-900">
                      {lang === 'bn' ? 'পশুর হাটে নগদ উত্তোলনের খরচ ও ছিনতাইয়ের ঝুঁকি মুক্ত' : 'Zero cash-out fee at authorized digital haats'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    notifySuccess(
                      lang === 'bn' ? 'উপায় মার্চেন্ট কিউআর প্রস্তুত' : 'Merchant QR Ready',
                      lang === 'bn'
                        ? 'ডিজিটাল পশুর হাটে সরাসরি উপায় কিউআর দিয়ে পেমেন্ট করুন (০% ক্যাশ-আউট ফি)।'
                        : 'Pay directly via upay QR at verified cattle haats with 0% fee.'
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[var(--yellow)] hover:brightness-105 text-[var(--navy)] font-heading font-bold text-[12.5px] transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  {lang === 'bn' ? 'কিউআর দেখুন' : 'View QR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
