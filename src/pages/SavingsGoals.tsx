import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { analyzeSavingsGoal } from '../services/savingsPlannerEngine';

export const SavingsGoals: React.FC = () => {
  const { customer, profile, goals, setIsAddGoalModalOpen, formatMoney } = useFinancial();

  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals[0]?.goal_id || 'G101'
  );

  const [customDeadlineMonths, setCustomDeadlineMonths] = useState<number>(10);
  const [customMonthlySaving, setCustomMonthlySaving] = useState<number>(4500);

  const activeGoal = goals.find((g) => g.goal_id === selectedGoalId) || goals[0];

  const analysis = activeGoal
    ? analyzeSavingsGoal(activeGoal, profile, customDeadlineMonths, customMonthlySaving)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="upay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[12px] font-bold">
            সঞ্চয় লক্ষ্য ও আর্থিক স্বাধীনতা
          </div>
          <h2 className="text-[#0B1F4B] mt-2">সঞ্চয় লক্ষ্যমাত্রা পরিকল্পনাকারী</h2>
          <p className="text-caption text-[var(--muted)] max-w-2xl mt-0.5">
            আর্থিক টানাটানিতে না পড়ে আপনি কীভাবে আপনার লক্ষ্যে পৌঁছাবেন তা হিসাব করুন।
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalModalOpen(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[var(--navy)]" />
          <span>নতুন লক্ষ্য যোগ করুন</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
          const isSelected = g.goal_id === selectedGoalId;

          return (
            <div
              key={g.goal_id}
              onClick={() => {
                setSelectedGoalId(g.goal_id);
                setCustomDeadlineMonths(10);
                setCustomMonthlySaving(Math.ceil((g.target_amount - g.current_amount) / 10));
              }}
              className={`upay-card p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-[var(--navy)] shadow-md ring-2 ring-[var(--navy)]/10'
                  : 'hover:border-[#D3DAE8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--bg)] text-[var(--navy)]">
                  {g.category}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    g.priority === 'HIGH'
                      ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                      : 'bg-[var(--yellow-soft)] text-[var(--navy)]'
                  }`}
                >
                  {g.priority === 'HIGH' ? 'উচ্চ অগ্রাধিকার' : 'মাঝারি'}
                </span>
              </div>

              <h3 className="text-[#0B1F4B] mt-3.5 truncate">{g.goal_name}</h3>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-baseline justify-between text-caption font-semibold">
                  <span className="font-heading font-extrabold text-[18px] text-[var(--navy)]">
                    {formatMoney(g.current_amount)}
                  </span>
                  <span className="text-[var(--muted)]">টার্গেট: {formatMoney(g.target_amount)}</span>
                </div>

                <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--yellow)] h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-caption text-[var(--muted)]">
                  <span className="font-bold text-[var(--navy)]">{pct}% সম্পন্ন</span>
                  <span>{g.deadline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Goal Deep Dive */}
      {analysis && (
        <div className="upay-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div>
              <span className="text-caption font-bold text-[var(--muted)] uppercase tracking-wider">
                বাস্তবায়নযোগ্যতার ব্লুপ্রিন্ট
              </span>
              <h2 className="text-[#0B1F4B] mt-0.5">{analysis.goal.goal_name}</h2>
              <p className="text-caption text-[var(--muted)] mt-0.5">
                টার্গেট: {formatMoney(analysis.goal.target_amount)} · বাকি: {formatMoney(analysis.remainingAmount)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                বাস্তবায়নযোগ্যতা: খুব সহজে অর্জনযোগ্য
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Inputs (5 cols) */}
            <div className="lg:col-span-5 space-y-4 p-5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
              <h4 className="font-heading font-bold text-[14px] text-[var(--navy)] uppercase tracking-wider">
                পরিকল্পনার মানসমূহ পরিবর্তন করুন
              </h4>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--muted)] font-medium">লক্ষ্যমাত্রা অর্জনের সময় (মাস)</span>
                  <span className="font-heading font-extrabold text-[var(--navy)]">{customDeadlineMonths} মাস</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={customDeadlineMonths}
                  onChange={(e) => {
                    const months = parseInt(e.target.value);
                    setCustomDeadlineMonths(months);
                    setCustomMonthlySaving(Math.ceil(analysis.remainingAmount / months));
                  }}
                  className="w-full accent-[var(--navy)] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--muted)] font-medium">মাসিক জমার পরিমাণ</span>
                  <span className="font-heading font-extrabold text-[var(--success)]">{formatMoney(customMonthlySaving)}/মাস</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="250"
                  value={customMonthlySaving}
                  onChange={(e) => setCustomMonthlySaving(parseInt(e.target.value))}
                  className="w-full accent-[var(--success)] cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-[var(--line)] text-caption text-[var(--muted)] space-y-1">
                <p>• মাসিক আয়: {formatMoney(profile.monthlyIncome)}</p>
                <p>• মাসিক গড় খরচ: {formatMoney(profile.averageMonthlySpending)}</p>
                <p>• অব্যবহৃত মাসিক উদ্বৃত্ত: <strong className="text-[var(--navy)] font-bold">{formatMoney(analysis.currentMonthlySurplus)}</strong></p>
              </div>
            </div>

            {/* Projected Milestone Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
                  <p className="text-caption text-[var(--muted)] font-semibold">প্রয়োজনীয় মাসিক সঞ্চয়</p>
                  <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-1">
                    {formatMoney(analysis.requiredMonthlySaving)}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">অর্জন করতে লাগবে {customDeadlineMonths} মাস</p>
                </div>

                <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
                  <p className="text-caption text-[var(--muted)] font-semibold">উদ্বৃত্তের পর্যাপ্ততা</p>
                  <p className="font-heading font-extrabold text-[20px] text-[var(--success)] mt-1">
                    পর্যাপ্ত উদ্বৃত্ত রয়েছে
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">উদ্বৃত্ত: {formatMoney(analysis.currentMonthlySurplus)}</p>
                </div>

                <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
                  <p className="text-caption text-[var(--muted)] font-semibold">সম্ভাব্য অর্জনের তারিখ</p>
                  <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-1">
                    {analysis.projectedCompletionDate}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">বর্তমান গতিতে</p>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-[14px] bg-[var(--yellow-soft)]/50 border border-[var(--yellow)]/30 space-y-2">
                <h4 className="font-heading font-bold text-[14px] text-[var(--navy)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--navy)]" />
                  <span>এই লক্ষ্যের জন্য পরামর্শকের গাইডলাইন</span>
                </h4>
                <ul className="space-y-1.5 text-[13.5px] text-[var(--navy)] font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--navy)] font-bold">✓</span>
                    <span>বেতন পাওয়ার দিনই স্বয়ংক্রিয়ভাবে {formatMoney(analysis.requiredMonthlySaving)} টাকা আলাদা ওয়ালেট পকেটে লক করে রাখুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--navy)] font-bold">✓</span>
                    <span>রেস্তোরাঁ ও অনাবশ্যক ডেলিভারি খরচ মাসে প্রায় ৮০০ টাকা কমালে এই লক্ষ্য অর্জনে কোনো ধরনের আর্থিক টানাটানি হবে না।</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
