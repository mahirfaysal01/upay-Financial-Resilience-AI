import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Wheat,
  ShieldCheck,
  Calendar,
  CheckCircle2,
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
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import { saveSimulationToFirebase } from '../services/firebaseSync';
import { runWhatIfSimulation } from '../services/simulationEngine';
import {
  calculateShekorVaultPlan,
  generateShekor12MonthSimulation,
  BENCHMARK_SHEKOR_PROFILES,
} from '../services/shekorEngine';
import { SimulationParams } from '../types/financial';
import { toBengaliNumber } from '../utils/translations';

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

  // 'শেকড়' (Shekor) Seasonal Income Equalizer State
  const [shekorInflow, setShekorInflow] = useState<number>(150000);
  const [shekorObligations, setShekorObligations] = useState<number>(18000);
  const [shekorBufferRatio, setShekorBufferRatio] = useState<number>(0.10);
  const [isShekorVaultActive, setIsShekorVaultActive] = useState<boolean>(true);

  const shekorPlan = useMemo(() => {
    return calculateShekorVaultPlan(shekorInflow, shekorObligations, shekorBufferRatio);
  }, [shekorInflow, shekorObligations, shekorBufferRatio]);

  const shekorSimulation = useMemo(() => {
    return generateShekor12MonthSimulation(
      shekorInflow,
      isShekorVaultActive,
      shekorBufferRatio,
      shekorObligations
    );
  }, [shekorInflow, isShekorVaultActive, shekorBufferRatio, shekorObligations]);

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
    } else if (presetName === 'samityBuffer') {
      setParams({
        foodReductionPct: 5,
        shoppingReductionPct: 5,
        monthlySavingsDelta: 1000,
        additionalIncome: 3000,
        unexpectedExpense: 0,
        cashOutReductionPct: 10,
      });
    } else if (presetName === 'salaryDelay') {
      setParams({
        foodReductionPct: 0,
        shoppingReductionPct: 0,
        monthlySavingsDelta: 0,
        additionalIncome: 0,
        unexpectedExpense: 4200,
        cashOutReductionPct: 0,
      });
    } else if (presetName === 'shekorEqualizer') {
      // 'শেকড়' (Shekor) Seasonal Income Equalizer
      // Smooths harvest surplus into steady float (+৳2,275/week) with 0% cash-out fee QR optimization
      setParams({
        foodReductionPct: 10,
        shoppingReductionPct: 10,
        monthlySavingsDelta: 2000,
        additionalIncome: 9100, // Monthly salary from UCB Micro-Vault
        unexpectedExpense: 0,
        cashOutReductionPct: 20,
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
    <div className="space-y-6 route-fade-slide">
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
        <button
          onClick={() => applyPreset('samityBuffer')}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-purple-50 border border-[var(--line)] hover:border-purple-300 text-purple-900 text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          🤝 সমিতি বা রোসা বাফার (+৳৩,০০০)
        </button>
        <button
          onClick={() => applyPreset('salaryDelay')}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-rose-50 border border-[var(--line)] hover:border-rose-300 text-rose-800 text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          ⏳ বেতন ৭ দিন দেরির স্ট্রেস টেস্ট
        </button>
        <button
          onClick={() => applyPreset('shekorEqualizer')}
          className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-[12.5px] font-bold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          🌾 ‘শেকড়’ সিজনাল সমতাকরণ (+৳৯,১০০ মাসিক ভাতা)
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

      {/* =========================================================================
          FEATURE: 'শেকড়' (Shekor) Seasonal Income Equalizer & UCB Micro-Vault
          Full interactive seasonal income equalizer for farmers, fishermen & gig workers
         ========================================================================= */}
      <div className="upay-card p-6 sm:p-8 space-y-6 border-amber-300 bg-gradient-to-b from-amber-50/50 via-white to-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-heading font-extrabold text-[12px] shadow-2xs">
                <Wheat className="w-3.5 h-3.5 text-slate-950" />
                <span>{lang === 'bn' ? 'ট্র্যাক ০৩ বিশেষ উদ্ভাবন · ‘শেকড়’ (Shekor)' : 'Track 03 Feature • Shekor Equalizer'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11.5px] font-bold border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ইউসিবি মাইক্রো-ভল্ট (৭.২৫% বার্ষিক মুনাফা)' : 'UCB Micro-Vault (7.25% p.a.)'}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[var(--navy)] mt-2">
              {lang === 'bn' ? '‘শেকড়’: অনিয়মিত ও সিজনাল আয়ের স্বয়ংক্রিয় সমতাকরণ' : '‘Shekor’: Seasonal Harvest Income Equalizer & Vault'}
            </h2>
            <p className="text-[13.5px] text-[var(--muted)] max-w-3xl mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'বাংলাদেশের কৃষক, জেলে ও সিজনাল কর্মীদের প্রধান সংকট হলো বছরে ২-৩ মাস বাম্পার আয় (যেমন: ৳১,৫০,০০০), আর বাকি ৪-৫ মাস (মঙ্গা ও অফ-সিজনে) হাত খালি থাকা। ‘শেকড়’ এই এককালীন অর্থকে ইউসিবি মাইক্রো-ভল্টে রেখে ৩৬৫ দিনের স্বয়ংক্রিয় সাপ্তাহিক বেতনে রূপান্তর করে।'
                : 'Solves the boom-and-bust cycle for farmers, fishermen, and seasonal gig-workers by smoothing lump-sum harvests into predictable weekly salaries in a high-yield UCB micro-vault.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setIsShekorVaultActive(!isShekorVaultActive)}
              className={`px-4 py-2.5 rounded-xl font-heading font-bold text-[13.5px] transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                isShekorVaultActive
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isShekorVaultActive ? (lang === 'bn' ? 'ভল্ট সক্রিয় (মঙ্গা মুক্ত)' : 'Vault Active') : (lang === 'bn' ? 'ভল্ট নিষ্ক্রিয়' : 'Vault Inactive')}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Pillars of Shekor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
            <span className="text-[12px] font-semibold text-amber-900">
              {lang === 'bn' ? '১. ফসল তোলার এককালীন আয়' : '1. Annual Harvest Inflow'}
            </span>
            <p className="font-heading font-extrabold text-2xl text-[var(--navy)]">
              {formatMoney(shekorPlan.annualInflow)}
            </p>
            <p className="text-[11px] text-amber-800">
              {lang === 'bn' ? 'বোরো ও আমন মৌসুমের আয়' : 'Boro & Aman Harvest Deposit'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
            <span className="text-[12px] font-semibold text-blue-900">
              {lang === 'bn' ? '২. ভার্চুয়াল দৈনিক ভাতা (VDA)' : '2. Virtual Daily Allowance (VDA)'}
            </span>
            <p className="font-heading font-extrabold text-2xl text-blue-950">
              {formatMoney(shekorPlan.virtualDailyAllowance)}
              <span className="text-[13px] font-normal text-blue-800"> /দিন</span>
            </p>
            <p className="text-[11px] text-blue-800 font-mono">
              VDA = (মোট আয় - স্থায়ী খরচ) ÷ ৩৬৫ × ৯০%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
            <span className="text-[12px] font-semibold text-emerald-900">
              {lang === 'bn' ? '৩. রবিবার সাপ্তাহিক বেতন' : '3. Weekly Sunday Payout'}
            </span>
            <p className="font-heading font-extrabold text-2xl text-emerald-700">
              {formatMoney(shekorPlan.weeklySundaySalary)}
              <span className="text-[13px] font-normal text-emerald-600"> /সপ্তাহ</span>
            </p>
            <p className="text-[11px] text-emerald-700">
              {lang === 'bn' ? 'সরাসরি মূল ওয়ালেটে জমা' : 'Auto-credited every Sunday'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
            <span className="text-[12px] font-semibold text-purple-900">
              {lang === 'bn' ? '৪. বার্ষিক অর্জিত সুদ' : '4. Micro-Vault Yield (7.25%)'}
            </span>
            <p className="font-heading font-extrabold text-2xl text-purple-950">
              +{formatMoney(shekorPlan.projectedAnnualYield)}
            </p>
            <p className="text-[11px] text-purple-800">
              {lang === 'bn' ? 'UCB সেভিংস ব্যালেন্সে মুনাফা' : 'UCB accrued interest'}
            </p>
          </div>
        </div>

        {/* Interactive Sliders for Customizing Farmer Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13.5px]">
              <span className="font-bold text-[var(--navy)]">{lang === 'bn' ? 'এককালীন ফসল বিক্রয়ের আয়:' : 'Harvest Inflow:'}</span>
              <span className="font-extrabold text-amber-900">{formatMoney(shekorInflow)}</span>
            </div>
            <input
              type="range"
              min="80000"
              max="300000"
              step="10000"
              value={shekorInflow}
              onChange={(e) => setShekorInflow(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[11px] text-[var(--muted)]">
              <span>৳৮০,০০০</span>
              <span>৳১,৫০,০০০</span>
              <span>৳৩,০০,০০০</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13.5px]">
              <span className="font-bold text-[var(--navy)]">{lang === 'bn' ? 'বাৎসরিক স্থায়ী ঋণ/ডিপিএস:' : 'Fixed Annual Obligations:'}</span>
              <span className="font-extrabold text-rose-800">{formatMoney(shekorObligations)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="2000"
              value={shekorObligations}
              onChange={(e) => setShekorObligations(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[11px] text-[var(--muted)]">
              <span>৳০</span>
              <span>৳১৮,০০০</span>
              <span>৳৫০,০০০</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[13.5px]">
              <span className="font-bold text-[var(--navy)]">{lang === 'bn' ? 'জরুরি সেফটি ফান্ড অনুপাত:' : 'Emergency Buffer Ratio:'}</span>
              <span className="font-extrabold text-emerald-700">{Math.round(shekorBufferRatio * 100)}% ({formatMoney(shekorPlan.bufferAmount)})</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={shekorBufferRatio}
              onChange={(e) => setShekorBufferRatio(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-[var(--muted)]">
              <span>৫%</span>
              <span>১০% (স্ট্যান্ডার্ড)</span>
              <span>২৫%</span>
            </div>
          </div>
        </div>

        {/* 12-Month Monga Season Contrast Simulation Graph */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[13px] flex-wrap gap-2">
            <div>
              <h3 className="font-heading font-extrabold text-[17px] text-[var(--navy)]">
                {lang === 'bn' ? '১২ মাসের ক্যাশ-ফ্লো: প্রচলিত সংকট বনাম ‘শেকড়’ সুরক্ষা' : '12-Month Trajectory: Traditional Deficit vs Shekor Vault'}
              </h3>
              <p className="text-[12.5px] text-[var(--muted)]">
                {lang === 'bn'
                  ? 'লাল রেখাটি দেখায় কীভাবে ৫ম-৬ষ্ঠ মাসে (আশ্বিন/কার্তিক - মঙ্গা মৌসুমে) প্রচলিতভাবে টাকা শূন্যে নেমে ঋণগ্রস্ত হতে হয়। নীল/সবুজ রেখাটি ‘শেকড়’-এর স্থায়ী স্থিতিশীলতা।'
                  : 'Notice how unmanaged cash crashes into severe debt during Monga season (Months 5-6), whereas Shekor ensures 12 months of steady float.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-rose-700 font-bold text-[12px]">
                <span className="w-3 h-1 bg-rose-500 rounded-full inline-block" />
                <span>{lang === 'bn' ? 'প্রচলিত ধারায় (৫ম মাসে মঙ্গা সংকট)' : 'Unmanaged (Monga Deficit)'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[12px]">
                <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" />
                <span>{lang === 'bn' ? '‘শেকড়’ সমতাকৃত ওয়ালেট' : 'Shekor Managed Float'}</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={shekorSimulation.points}
                margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="monthNameBn"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v) => `৳${toBengaliNumber(Math.round(v / 1000))}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [formatMoney(Number(val)), name]}
                />
                <ReferenceLine
                  y={0}
                  stroke="#E5484D"
                  strokeWidth={1.5}
                  label={{ value: 'শূন্য ব্যালেন্স / ঋণ অঞ্চল', fill: '#E5484D', fontSize: 11, position: 'insideTopLeft' }}
                />
                <Line
                  type="monotone"
                  dataKey="unmanagedBalance"
                  name={lang === 'bn' ? 'প্রচলিত ব্যালেন্স' : 'Unmanaged'}
                  stroke="#E5484D"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="shekorManagedBalance"
                  name={lang === 'bn' ? '‘শেকড়’ ওয়ালেট ব্যালেন্স' : 'Shekor Float'}
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FFC20E', stroke: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Callout on Monga Elimination */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[13px] text-emerald-950 leading-relaxed">
              <strong>{lang === 'bn' ? '‘শেকড়’ সামাজিক ও অর্থনৈতিক বিপ্লব:' : 'Economic & Social Impact:'}</strong>{' '}
              {lang === 'bn'
                ? `এই মডেলে কৃষককে মঙ্গা মৌসুমে চড়া সুদে (১০-১৫% মাসিক) মহাজন থেকে ঋণ নিতে হয় না। সারা বছরে মোট ${formatMoney(shekorSimulation.mongaDeficitPrevented)} টাকার মহাজনি ঋণ ঝুঁকি স্থায়ীভাবে দূর করা হয়েছে এবং ভল্টে সঞ্চিত উদ্বৃত্তে অতিরিক্ত ${formatMoney(shekorPlan.projectedAnnualYield)} টাকা সুদ অর্জিত হয়েছে।`
                : `Permanently eliminates seasonal predatory micro-debt while accumulating ${formatMoney(shekorPlan.projectedAnnualYield)} in interest dividends.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
