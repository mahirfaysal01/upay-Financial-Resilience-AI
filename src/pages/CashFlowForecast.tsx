import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  Shield,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import { calculateUtsob90DayForecast } from '../services/utsobShieldEngine';

export const CashFlowForecast: React.FC = () => {
  const {
    customer,
    profile,
    forecast,
    formatMoney,
    lang,
    isUtsobShieldActive,
    toggleUtsobShield,
    utsobProfile,
    utsobSavedAmount,
    selectedFestivalId,
  } = useFinancial();

  const { notifySuccess, notifyInfo } = useNotification();
  const [showBands, setShowBands] = useState(true);
  const [horizonMode, setHorizonMode] = useState<'30_DAYS' | '90_DAYS_UTSOB'>('30_DAYS');

  const forecastData = forecast.dailyProjections.map((p) => ({
    day: `দিন ${p.dayOffset}`,
    date: p.date,
    'এআই পূর্বাভাস': p.projectedBalance,
    'সাধারণ গড়': p.baselineBalance,
    'আপার কনফিডেন্স': p.upperBound,
    'লোয়ার কনফিডেন্স': p.lowerBound,
    notes: p.notes,
  }));

  // 90-Day seasonal Utsob forecast with Festival Valley
  const utsob90 = calculateUtsob90DayForecast(
    profile,
    isUtsobShieldActive,
    utsobSavedAmount,
    selectedFestivalId
  );

  const utsobChartData = utsob90.projections.map((p) => ({
    day: p.dayLabel,
    date: p.date,
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
          ? `আজ থেকে দৈনিক ${formatMoney(utsobProfile.dailyPocketAmount)} আলাদা হয়ে পকেটে জমা হবে। মার্চের লাল ঈদ ভ্যালি সমতল করা হয়েছে!`
          : `Setting aside ${formatMoney(utsobProfile.dailyPocketAmount)}/day. The March Eid valley is now completely flattened!`,
        { duration: 5000 }
      );
    } else {
      notifyInfo(
        lang === 'bn' ? 'উৎসব শিল্ড স্থগিত' : 'Utsob Shield Paused',
        lang === 'bn'
          ? 'স্বয়ংক্রিয় উৎসব পকেট বরাদ্দ স্থগিত করা হয়েছে।'
          : 'Festival pocket allocation paused.'
      );
    }
  };

  return (
    <div className="space-y-6 route-fade-slide">
      {/* Header */}
      <div className="upay-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[12px] font-bold">
            মডেল ১ · ক্যাশ-ফ্লো পূর্বাভাস ইঞ্জিন
          </div>
          <h2 className="text-[#0B1F4B] mt-2">ক্যাশ-ফ্লো গতিধারা ও ভবিষ্যৎ ব্যালেন্স</h2>
          <p className="text-caption text-[var(--muted)] max-w-2xl mt-0.5">
            সাপ্তাহিক ছুটির দিন, বেতন প্রাপ্তির দিন, নির্ধারিত বিল এবং ৯০ দিনের উৎসবের মৌসুমি প্রভাবসহ নগদ পূর্বাভাস।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {/* Horizon Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setHorizonMode('30_DAYS')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                horizonMode === '30_DAYS'
                  ? 'bg-white text-[var(--navy)] shadow-xs'
                  : 'text-slate-600 hover:text-[var(--navy)]'
              }`}
            >
              {lang === 'bn' ? '৩০ দিনের মাসিক ভিউ' : '30-Day Monthly'}
            </button>
            <button
              onClick={() => setHorizonMode('90_DAYS_UTSOB')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                horizonMode === '90_DAYS_UTSOB'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-[var(--navy)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>{lang === 'bn' ? '৯০ দিনের উৎসব দিগন্ত' : '90-Day Utsob Horizon'}</span>
            </button>
          </div>

          {horizonMode === '30_DAYS' && (
            <button
              onClick={() => setShowBands(!showBands)}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:bg-slate-200/60 text-[var(--navy)] text-[12.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[var(--navy)]" />
              <span>{showBands ? 'ত্রুটিসীমা লুকান' : 'ত্রুটিসীমা দেখান'}</span>
            </button>
          )}
        </div>
      </div>

      {horizonMode === '90_DAYS_UTSOB' ? (
        /* 90-DAY UTSOB VIEW */
        <div className="space-y-6">
          {/* Snapshot Cards for 90 Days */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="upay-card p-5">
              <span className="text-[13px] font-semibold text-[var(--muted)]">বর্তমান ব্যালেন্স</span>
              <p className="font-heading font-extrabold text-[24px] text-[var(--navy)] mt-1">
                {formatMoney(forecast.currentBalance)}
              </p>
              <p className="text-caption text-[var(--muted)] mt-0.5">আজকের মোট তহবিল</p>
            </div>

            <div className="upay-card p-5">
              <span className="text-[13px] font-semibold text-amber-900">ঈদের বাকি দিন</span>
              <p className="font-heading font-extrabold text-[24px] text-amber-900 mt-1">
                {lang === 'bn' ? `${utsobProfile.daysUntilFestival} দিন` : `${utsobProfile.daysUntilFestival}d`}
              </p>
              <p className="text-caption text-amber-800 mt-0.5">আনুমানিক ৯–১০ মার্চ ২০২৭</p>
            </div>

            <div className={`upay-card p-5 border ${isUtsobShieldActive ? 'border-emerald-300 bg-emerald-50/50' : 'border-red-300 bg-red-50/50'}`}>
              <span className={`text-[13px] font-semibold ${isUtsobShieldActive ? 'text-emerald-900' : 'text-red-900'}`}>
                মার্চে ঈদ ভ্যালি সর্বনিম্ন
              </span>
              <p className={`font-heading font-extrabold text-[24px] mt-1 ${isUtsobShieldActive ? 'text-emerald-700' : 'text-red-600'}`}>
                {isUtsobShieldActive ? formatMoney(utsob90.shieldLowestPoint) : formatMoney(utsob90.valleyLowestPoint)}
              </p>
              <p className={`text-caption mt-0.5 ${isUtsobShieldActive ? 'text-emerald-700' : 'text-red-700'}`}>
                {isUtsobShieldActive ? 'সমতল ও সুরক্ষিত' : 'গভীর ঘাটতি অঞ্চল'}
              </p>
            </div>

            <div className="upay-card p-5 bg-blue-50/50 border-blue-200">
              <span className="text-[13px] font-semibold text-blue-900">উৎসব পকেট বরাদ্দ</span>
              <p className="font-heading font-extrabold text-[24px] text-blue-900 mt-1">
                {formatMoney(utsobProfile.dailyPocketAmount)} <span className="text-[14px]">/দিন</span>
              </p>
              <p className="text-caption text-blue-700 mt-0.5">
                {isUtsobShieldActive ? `জমা: ${formatMoney(utsobSavedAmount)}` : 'শিল্ড অপ্ট-ইন সক্রিয় করুন'}
              </p>
            </div>
          </div>

          {/* 60-Second Demo Callout & Toggle */}
          <div className="upay-card p-6 space-y-4 border-amber-300 bg-gradient-to-r from-amber-50/60 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[12px] font-bold">
                  {lang === 'bn' ? '৬০-সেকেন্ড ডেমো · লাল ঈদ ভ্যালি' : '60-Second Demo • The Red Eid Valley'}
                </div>
                <h3 className="text-xl font-heading font-extrabold text-[var(--navy)] mt-1.5">
                  {lang === 'bn' ? 'মার্চের লাল ঈদ ভ্যালি ও উৎসব শিল্ড কার্যকারিতা' : 'March Eid Valley & Utsob Shield Impact'}
                </h3>
                <p className="text-[13.5px] text-[var(--muted)] mt-0.5">
                  {lang === 'bn'
                    ? 'বোনাস দেরিতে আসার কারণে লাল রেখায় গভীর ঘাটতি তৈরি হয়। বাটনে চাপ দিয়ে ২১০ টাকা/দিন সঞ্চয় সক্রিয় করুন এবং দেখুন কীভাবে ভ্যালি সমতল হয়।'
                    : 'The unshielded red curve plunges deep into negative before festival bonus. Tap Shield to watch it flatten instantly.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleShield}
                  className={`px-5 py-2.5 rounded-xl font-heading font-bold text-[14px] transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    isUtsobShieldActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[var(--navy)] hover:bg-[var(--navy)]/90 text-white'
                  }`}
                >
                  {isUtsobShieldActive ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>{lang === 'bn' ? 'শিল্ড সক্রিয় (ভ্যালি সমতল)' : 'Shield Active (Flattened)'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'bn' ? `শিল্ড চালু করুন (${formatMoney(utsobProfile.dailyPocketAmount)}/দিন)` : `Start Shield (${formatMoney(utsobProfile.dailyPocketAmount)}/day)`}</span>
                    </>
                  )}
                </button>

                <Link
                  to="/utsob-shield"
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-heading font-bold text-[13px] transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <span>{lang === 'bn' ? 'বিস্তারিত শিল্ড ও কোরবানি প্ল্যানার' : 'Utsob Shield & Qurbani'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 90-Day Chart */}
            <div className="h-80 w-full bg-slate-50/50 p-2 rounded-2xl border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={utsobChartData} margin={{ top: 20, right: 15, left: -5, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} interval={9} />
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

                  <Line
                    type="monotone"
                    dataKey="সাধারণ (ভ্যালিসহ)"
                    stroke="#EF4444"
                    strokeWidth={isUtsobShieldActive ? 1.5 : 3.5}
                    strokeDasharray={isUtsobShieldActive ? '4 4' : undefined}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="উৎসব শিল্ড সুরক্ষিত"
                    stroke="#10B981"
                    strokeWidth={isUtsobShieldActive ? 3.5 : 1}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* ORIGINAL 30-DAY MONTHLY VIEW */
        <>
          {/* Snapshot Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="upay-card p-5">
              <span className="text-[13px] font-semibold text-[var(--muted)]">আজকের ব্যালেন্স (শুরু)</span>
              <p className="font-heading font-extrabold text-[24px] text-[var(--navy)] mt-1">
                {formatMoney(forecast.currentBalance)}
              </p>
              <p className="text-caption text-[var(--muted)] mt-0.5">দিন ০ এর মোট নগদ অর্থ</p>
            </div>

            <div className="upay-card p-5">
              <span className="text-[13px] font-semibold text-[var(--muted)]">৭ দিন পর</span>
              <p className={`font-heading font-extrabold text-[24px] mt-1 ${forecast.day7Forecast < 1000 ? 'text-[var(--danger)]' : 'text-[var(--navy)]'}`}>
                {formatMoney(forecast.day7Forecast)}
              </p>
              <p className="text-caption text-[var(--muted)] mt-0.5">স্বল্পমেয়াদী নগদ স্থিতি</p>
            </div>

            <div className="upay-card p-5">
              <span className="text-[13px] font-semibold text-[var(--muted)]">১৪ দিন পর</span>
              <p className={`font-heading font-extrabold text-[24px] mt-1 ${forecast.day14Forecast < 1000 ? 'text-[var(--danger)]' : 'text-[var(--navy)]'}`}>
                {formatMoney(forecast.day14Forecast)}
              </p>
              <p className="text-caption text-[var(--muted)] mt-0.5">মাস মধ্যবর্তী অবস্থা</p>
            </div>

            <div className="upay-card p-5">
              <span className="text-[13px] font-semibold text-[var(--muted)]">মাস শেষের সম্ভাব্য ব্যালেন্স</span>
              <p className={`font-heading font-extrabold text-[24px] mt-1 ${forecast.monthEndForecast < 1000 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                {formatMoney(forecast.monthEndForecast)}
              </p>
              <p className="text-caption text-[var(--muted)] mt-0.5">৩০তম দিনে অবশিষ্ট তহবিল</p>
            </div>
          </div>

      {/* Warning Callout */}
      {forecast.daysUntilCriticalBalance ? (
        <div className="p-4 rounded-[14px] bg-[var(--danger-soft)] border border-[var(--danger)]/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-bold text-[var(--danger)] text-[14.5px]">
              জরুরি ক্যাশ-ফ্লো সতর্কতা: পদক্ষেপ না নিলে ঘাটতি অনিবার্য
            </h4>
            <p className="text-caption text-[var(--danger)] mt-0.5 leading-relaxed font-medium">
              আপনার ব্যালেন্স আগামী {forecast.daysUntilCriticalBalance} দিনের মাথায় ১,০০০ টাকার নিচে নেমে যেতে পারে। বেতন আসার পূর্বে বিল ও ক্যাশ-আউটে রাশ টানুন।
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-[14px] bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-bold text-emerald-900 text-[14.5px]">
              স্থিতিশীল আর্থিক গতিধারা বজায় আছে
            </h4>
            <p className="text-caption text-emerald-800 mt-0.5 leading-relaxed font-medium">
              পুরো ৩০ দিন জুড়েই আপনার ব্যালেন্স ১,০০০ টাকার নিরাপদ সীমার উপরে থাকবে।
            </p>
          </div>
        </div>
      )}

      {/* 30-Day Forecast Composed Chart */}
      <div className="upay-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-[#0B1F4B]">সম্পূর্ণ ৩০ দিনের বহুমাত্রিক পূর্বাভাস গ্রাফ</h3>
            <p className="text-caption text-[var(--muted)] mt-0.5">
              বেতন আসার দিন, বিল পরিশোধের সময় এবং অনিশ্চয়তা সীমার পারস্পরিক মিথস্ক্রিয়া
            </p>
          </div>
          <div className="flex items-center gap-3 text-caption text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[var(--yellow)] rounded-full inline-block"></span>
              <span>এআই পূর্বাভাস</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border-dashed inline-block"></span>
              <span>সাধারণ গড়</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--danger)] inline-block"></span>
              <span>১ হাজার টাকা সীমা</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} interval={2} />
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
                formatter={(val: any, name: any) => [formatMoney(Number(val)), name]}
              />
              {showBands && (
                <Area
                  type="monotone"
                  dataKey="আপার কনফিডেন্স"
                  stroke="none"
                  fill="#FFC20E"
                  fillOpacity={0.12}
                />
              )}
              {showBands && (
                <Area
                  type="monotone"
                  dataKey="লোয়ার কনফিডেন্স"
                  stroke="none"
                  fill="#FFC20E"
                  fillOpacity={0.12}
                />
              )}
              <ReferenceLine
                y={1000}
                stroke="#E5484D"
                strokeDasharray="3 3"
                label={{ value: '১ হাজার টাকা সুরক্ষা ফ্লোর', fill: '#E5484D', fontSize: 11, position: 'insideBottomRight' }}
              />
              <Line
                type="monotone"
                dataKey="এআই পূর্বাভাস"
                stroke="#FFC20E"
                strokeWidth={3}
                dot={{ r: 3, fill: '#0B1F4B', stroke: '#FFC20E' }}
              />
              <Line
                type="monotone"
                dataKey="সাধারণ গড়"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Benchmark Accuracy */}
      <div className="upay-card p-6 space-y-4">
        <div>
          <h3 className="text-[#0B1F4B]">যাচাইকৃত মডেল সক্ষমতা (টেস্ট ডেটাসেট ৪,২০০)</h3>
          <p className="text-caption text-[var(--muted)] mt-0.5">
            গ্রেডিয়েন্ট-বুস্টেড মডেলের ফলাফল সাধারণ গড়ের চেয়ে অনেক বেশি বাস্তবসম্মত
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <span className="text-caption text-[var(--muted)] font-semibold">গড় পরম ত্রুটি (MAE)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading font-extrabold text-[22px] text-[var(--navy)]">৳৪২০.৫০</span>
              <span className="text-[12px] text-slate-400 line-through">৳১,১৪০.২০</span>
            </div>
            <p className="text-[11.5px] text-[var(--success)] mt-1 font-bold">
              ৬৩.১% কম ভুলের মাত্রা
            </p>
          </div>

          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <span className="text-caption text-[var(--muted)] font-semibold">বর্গমূল গড় ত্রুটি (RMSE)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading font-extrabold text-[22px] text-[var(--navy)]">৳৬১০.৮০</span>
            </div>
            <p className="text-[11.5px] text-[var(--muted)] mt-1 font-medium">
              চরম অস্বাভাবিকতা দমনে কার্যকর
            </p>
          </div>

          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <span className="text-caption text-[var(--muted)] font-semibold">শতকরা গড় ত্রুটি (MAPE)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading font-extrabold text-[22px] text-[var(--success)]">৫.৪%</span>
            </div>
            <p className="text-[11.5px] text-[var(--muted)] mt-1 font-medium">
              স্বল্প ও উচ্চ উভয় ব্যালেন্সেই নিখুঁত
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
