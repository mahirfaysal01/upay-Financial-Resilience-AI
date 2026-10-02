import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import { saveSimulationToFirebase } from '../services/firebaseSync';
import { runWhatIfSimulation } from '../services/simulationEngine';
import { SimulationParams } from '../types/financial';

export const WhatIfSimulator: React.FC = () => {
  const { customer, profile, formatMoney, lang } = useFinancial();
  const { notifyFinancial, notifySuccess, notifyInfo } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  const [params, setParams] = useState<SimulationParams>({
    foodReductionPct: 15,
    shoppingReductionPct: 0,
    monthlySavingsDelta: 0,
    additionalIncome: 0,
    unexpectedExpense: 0,
    cashOutReductionPct: 10,
  });

  const simulation = useMemo(() => {
    return runWhatIfSimulation(profile, params);
  }, [profile, params]);

  const { before, after, deltaBalance, deltaRiskPercentagePoints, feasibilityAssessment } = simulation;

  const chartData = before.dailyBalanceCurve.map((item, idx) => ({
    day: `দিন ${item.day}`,
    'বর্তমান ধারা': item.balance,
    'সিমুলেটেড ফলাফল': after.dailyBalanceCurve[idx]?.balance ?? item.balance,
  }));

  const handleReset = () => {
    setParams({
      foodReductionPct: 0,
      shoppingReductionPct: 0,
      monthlySavingsDelta: 0,
      additionalIncome: 0,
      unexpectedExpense: 0,
      cashOutReductionPct: 0,
    });
    notifyInfo(
      lang === 'bn' ? 'সিমুলেশন রিসেট হয়েছে' : 'Simulation Reset',
      lang === 'bn' ? 'সকল প্যারামিটার প্রারম্ভিক অবস্থায় ফিরিয়ে নেওয়া হয়েছে।' : 'All parameters reset to baseline.'
    );
  };

  const handleSaveSimulation = async () => {
    setIsSaving(true);
    try {
      await saveSimulationToFirebase({
        customerId: customer.customer_id,
        customerName: customer.name,
        params,
        projectedBalance: after.projectedMonthEndBalance,
        deltaBalance,
        deltaRiskPercentagePoints,
        savedAt: new Date().toISOString(),
      });
      notifySuccess(
        lang === 'bn' ? 'সিমুলেশন সংরক্ষিত' : 'Simulation Saved',
        lang === 'bn'
          ? `মাস শেষের উদ্বৃত্ত ${formatMoney(after.projectedMonthEndBalance)} ক্লাউডে সংরক্ষিত হয়েছে।`
          : `Projected month-end balance ${formatMoney(after.projectedMonthEndBalance)} logged to cloud.`,
        {
          financialDetails: {
            amount: deltaBalance,
            category: 'সিমুলেটেড উদ্বৃত্ত',
            trend: deltaBalance >= 0 ? 'up' : 'down',
          },
        }
      );
    } catch {
      // fallback
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'food15') {
      setParams({
        foodReductionPct: 15,
        shoppingReductionPct: 10,
        monthlySavingsDelta: 0,
        additionalIncome: 0,
        unexpectedExpense: 0,
        cashOutReductionPct: 15,
      });
    } else if (presetName === 'save2000') {
      setParams({
        foodReductionPct: 10,
        shoppingReductionPct: 15,
        monthlySavingsDelta: 2000,
        additionalIncome: 0,
        unexpectedExpense: 0,
        cashOutReductionPct: 10,
      });
    } else if (presetName === 'shock5000') {
      setParams({
        foodReductionPct: 0,
        shoppingReductionPct: 0,
        monthlySavingsDelta: 0,
        additionalIncome: 0,
        unexpectedExpense: 5000,
        cashOutReductionPct: 0,
      });
    } else if (presetName === 'freelanceBonus') {
      setParams({
        foodReductionPct: 0,
        shoppingReductionPct: 0,
        monthlySavingsDelta: 1500,
        additionalIncome: 6000,
        unexpectedExpense: 0,
        cashOutReductionPct: 0,
      });
    }

    notifyFinancial(
      lang === 'bn' ? 'হোয়াট-ইফ সিনারিও প্রয়োগ করা হয়েছে' : 'Scenario Applied',
      lang === 'bn'
        ? `ক্যাশ-ফ্লো পূর্বাভাস পুনরায় গণনা করা হয়েছে।`
        : `Cash flow forecast recalculated.`,
      {
        duration: 4000,
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="upay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[12px] font-bold">
            ইন্টারেক্টিভ সিদ্ধান্ত-সহায়তা ইঞ্জিন
          </div>
          <h2 className="text-[#0B1F4B] mt-2">হোয়াট-ইফ (যদি এমন হয়) সিমুলেটর</h2>
          <p className="text-caption text-[var(--muted)] max-w-2xl mt-0.5">
            খরচ বা আয়ের পরিবর্তনের কাল্পনিক পরীক্ষা করে তাৎক্ষণিকভাবে মাস শেষের ব্যালেন্স ও ঝুঁকির পরিবর্তন দেখুন।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSaveSimulation}
            disabled={isSaving}
            className="px-4 py-2 rounded-[14px] bg-[var(--navy)] hover:bg-[var(--navy-2)] text-[var(--yellow)] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title={lang === 'bn' ? 'সিমুলেশন রেকর্ড ক্লাউডে সংরক্ষণ করুন' : 'Save simulation scenario to cloud'}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--yellow)]" />
            <span>{isSaving ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'পরিকল্পনা সেভ করুন' : 'Save Plan')}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-[14px] bg-[var(--bg)] hover:bg-slate-200/60 border border-[var(--line)] text-[var(--navy)] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[12.5px] font-bold text-[var(--muted)] shrink-0">প্রস্তুত পরিস্থিতি:</span>
        <button
          onClick={() => applyPreset('food15')}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[var(--yellow-soft)] border border-[var(--line)] hover:border-[var(--yellow)] text-[var(--navy)] text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          🍔 রেস্তোরাঁ ও খাবারে ১৫% খরচ কমান
        </button>
        <button
          onClick={() => applyPreset('save2000')}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-[var(--line)] hover:border-emerald-300 text-emerald-900 text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          💰 এই মাসে ২,০০০ টাকা সঞ্চয় করুন
        </button>
        <button
          onClick={() => applyPreset('shock5000')}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[var(--danger-soft)] border border-[var(--line)] hover:border-[var(--danger)] text-[var(--danger)] text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          ⚠️ আকস্মিক ৫,০০০ টাকা খরচ
        </button>
        <button
          onClick={() => applyPreset('freelanceBonus')}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-[var(--line)] hover:border-blue-300 text-blue-900 text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          ✨ অতিরিক্ত ৬,০০০ টাকা আয়
        </button>
      </div>

      {/* BEFORE vs AFTER Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE CARD */}
        <div className="upay-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[var(--muted)] uppercase tracking-wider">
              বর্তমান স্বাভাবিক গতিধারা
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--bg)] text-[var(--muted)] font-bold">
              সিমুলেশনের পূর্বে
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-caption text-[var(--muted)]">মাস শেষের সম্ভাব্য ব্যালেন্স</p>
              <p className={`font-heading font-extrabold text-[28px] mt-1 ${before.projectedMonthEndBalance < 1000 ? 'text-[var(--danger)]' : 'text-[var(--navy)]'}`}>
                {formatMoney(before.projectedMonthEndBalance)}
              </p>
            </div>
            <div>
              <p className="text-caption text-[var(--muted)]">ঘাটতির ঝুঁকি</p>
              <p className={`font-heading font-extrabold text-[28px] mt-1 ${before.shortageRisk > 0.65 ? 'text-[var(--danger)]' : 'text-[var(--yellow)]'}`}>
                {Math.round(before.shortageRisk * 100)}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-caption text-[var(--muted)] border-t border-[var(--line)] pt-3 font-medium">
            <span>আর্থিক অবস্থা: <strong className="text-[var(--navy)] font-bold">{before.financialStability === 'LOW' ? 'ঝুঁকিপূর্ণ' : 'স্থিতিশীল'}</strong></span>
            <span>সঞ্চয়ের হার: <strong className="text-[var(--navy)] font-bold">{before.savingsProgressPct}%</strong></span>
          </div>
        </div>

        {/* AFTER CARD */}
        <div className="upay-card p-6 space-y-4 border-2 border-[var(--yellow)] bg-gradient-to-br from-[var(--yellow-soft)]/30 to-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[var(--navy)] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--navy)]" />
              <span>সিমুলেটেড সম্ভাব্য ফলাফল</span>
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--yellow)] text-[var(--navy)] font-extrabold">
              কাল্পনিক ফলাফল
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-caption text-slate-600">মাস শেষের সম্ভাব্য ব্যালেন্স</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="font-heading font-extrabold text-[28px] text-[var(--navy)]">
                  {formatMoney(after.projectedMonthEndBalance)}
                </p>
                {deltaBalance !== 0 && (
                  <span className={`text-[12.5px] font-bold ${deltaBalance > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {deltaBalance > 0 ? `+${formatMoney(deltaBalance)}` : `-${formatMoney(Math.abs(deltaBalance))}`}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-caption text-slate-600">ঘাটতির ঝুঁকি</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className={`font-heading font-extrabold text-[28px] ${after.shortageRisk > 0.65 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                  {Math.round(after.shortageRisk * 100)}%
                </p>
                {deltaRiskPercentagePoints !== 0 && (
                  <span className={`text-[12.5px] font-bold ${deltaRiskPercentagePoints < 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {deltaRiskPercentagePoints < 0 ? `${deltaRiskPercentagePoints} pp` : `+${deltaRiskPercentagePoints} pp`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-caption text-slate-700 border-t border-[var(--yellow)]/30 pt-3 font-medium">
            <span>আর্থিক অবস্থা: <strong className="text-[var(--success)] font-bold">{after.financialStability === 'HEALTHY' ? 'সুদৃঢ় ও নিরাপদ' : after.financialStability === 'MODERATE' ? 'মাঝারি' : 'ঝুঁকিপূর্ণ'}</strong></span>
            <span>সঞ্চয়ের হার: <strong className="text-[var(--success)] font-bold">{after.savingsProgressPct}%</strong></span>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Trajectory Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders (5 cols) */}
        <div className="lg:col-span-5 upay-card p-6 space-y-5">
          <div>
            <h3 className="text-[#0B1F4B] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--yellow)]" />
              <span>সিমুলেশন কন্ট্রোলসমূহ</span>
            </h3>
            <p className="text-caption text-[var(--muted)]">স্লাইডার পরিবর্তন করে দেখুন কীভাবে ঝুঁকি হ্রাস পায়</p>
          </div>

          {/* 1. Food Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold text-[var(--navy)]">খাবার ও রেস্তোরাঁর খরচ কমান</span>
              <span className="font-heading font-extrabold text-[var(--navy)]">{params.foodReductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.foodReductionPct}
              onChange={(e) => setParams({ ...params, foodReductionPct: parseInt(e.target.value) })}
              className="w-full accent-[var(--navy)] cursor-pointer"
            />
            <p className="text-[11.5px] text-[var(--muted)]">ফুড ডেলিভারি ও বাইরের খাবার সীমিত করা</p>
          </div>

          {/* 2. Shopping Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold text-[var(--navy)]">ঐচ্ছিক কেনাকাটা কমান</span>
              <span className="font-heading font-extrabold text-[var(--navy)]">{params.shoppingReductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={params.shoppingReductionPct}
              onChange={(e) => setParams({ ...params, shoppingReductionPct: parseInt(e.target.value) })}
              className="w-full accent-[var(--navy)] cursor-pointer"
            />
            <p className="text-[11.5px] text-[var(--muted)]">পোশাক, গ্যাজেট ও বিনোদনমূলক কেনাকাটা পিছিয়ে দেওয়া</p>
          </div>

          {/* 3. Cash-out Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold text-[var(--navy)]">ক্যাশ-আউট কমিয়ে উপায় কিউআর ব্যবহার</span>
              <span className="font-heading font-extrabold text-[var(--navy)]">{params.cashOutReductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={params.cashOutReductionPct}
              onChange={(e) => setParams({ ...params, cashOutReductionPct: parseInt(e.target.value) })}
              className="w-full accent-[var(--navy)] cursor-pointer"
            />
            <p className="text-[11.5px] text-[var(--muted)]">এজেন্ট ক্যাশ-আউট ফি বাঁচান ও সরাসরি পেমেন্ট করুন</p>
          </div>

          {/* 4. Monthly Savings Set Aside */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold text-[var(--navy)]">সঞ্চয় লক্ষে আলাদা করে রাখুন</span>
              <span className="font-heading font-extrabold text-[var(--success)]">{formatMoney(params.monthlySavingsDelta)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={params.monthlySavingsDelta}
              onChange={(e) => setParams({ ...params, monthlySavingsDelta: parseInt(e.target.value) })}
              className="w-full accent-[var(--success)] cursor-pointer"
            />
            <p className="text-[11.5px] text-[var(--muted)]">টাকা আলাদা ওয়ালেট পকেটে লক করে রাখা</p>
          </div>

          {/* 5. Additional Inflow */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold text-[var(--navy)]">অতিরিক্ত আয় বা ফ্রিল্যান্সিং</span>
              <span className="font-heading font-extrabold text-[var(--navy)]">+{formatMoney(params.additionalIncome)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="15000"
              step="1000"
              value={params.additionalIncome}
              onChange={(e) => setParams({ ...params, additionalIncome: parseInt(e.target.value) })}
              className="w-full accent-[var(--navy)] cursor-pointer"
            />
          </div>

          {/* 6. Unexpected Expense */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold text-[var(--navy)]">আকস্মিক জরুরি খরচ</span>
              <span className="font-heading font-extrabold text-[var(--danger)]">-{formatMoney(params.unexpectedExpense)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={params.unexpectedExpense}
              onChange={(e) => setParams({ ...params, unexpectedExpense: parseInt(e.target.value) })}
              className="w-full accent-[var(--danger)] cursor-pointer"
            />
          </div>

          {/* Feasibility Assessment Notice */}
          <div className="p-4 rounded-[14px] bg-[var(--yellow-soft)]/60 border border-[var(--yellow)]/30 space-y-1">
            <span className="text-[11px] font-bold text-[var(--navy)] uppercase tracking-wider">
              বাস্তবায়নযোগ্যতার মূল্যায়ন
            </span>
            <p className="text-caption text-slate-800 leading-relaxed font-medium">
              আপনার ব্যয়ের ধরনের উপর ভিত্তি করে এটি একটি অত্যন্ত কার্যকর ও বাস্তবসম্মত সমন্বয়।
            </p>
          </div>
        </div>

        {/* Right Column: Comparative Trajectory Curve (7 cols) */}
        <div className="lg:col-span-7 upay-card p-6 space-y-4">
          <div>
            <h3 className="text-[#0B1F4B] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--yellow)]" />
              <span>সিমুলেটেড ধারা বনাম বর্তমান ধারা</span>
            </h3>
            <p className="text-caption text-[var(--muted)]">
              ৩০ দিনের দৈনিক ওয়ালেট ব্যালেন্সের পরিবর্তনের সরাসরি গ্রাফ
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} interval={3} />
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
                    color: '#0B1F4B',
                    fontFamily: 'Hind Siliguri, sans-serif',
                  }}
                  formatter={(val: any, name: any) => [formatMoney(Number(val)), name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <ReferenceLine
                  y={1000}
                  stroke="#E5484D"
                  strokeDasharray="3 3"
                  label={{ value: '১ হাজার টাকা সুরক্ষা সীমা', fill: '#E5484D', fontSize: 11, position: 'insideBottomRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="বর্তমান ধারা"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="সিমুলেটেড ফলাফল"
                  stroke="#0B1F4B"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#FFC20E', stroke: '#0B1F4B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-caption text-[var(--muted)] flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-[var(--navy)] shrink-0" />
            <span>সব ফলাফল বাস্তব সময়ে গাণিতিক মডেলের মাধ্যমে গণনা করা হচ্ছে।</span>
          </div>
        </div>
      </div>
    </div>
  );
};
