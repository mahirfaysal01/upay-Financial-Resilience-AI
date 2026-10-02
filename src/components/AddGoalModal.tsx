import React, { useState } from 'react';
import { X, Target, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';

export const AddGoalModal: React.FC = () => {
  const { isAddGoalModalOpen, setIsAddGoalModalOpen, addGoal, lang } = useFinancial();
  const { notifySuccess, notifyError } = useNotification();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('45000');
  const [currentAmount, setCurrentAmount] = useState('5000');
  const [deadlineMonths, setDeadlineMonths] = useState('8');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [category, setCategory] = useState('Emergency Fund');

  if (!isAddGoalModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notifyError(
        lang === 'bn' ? 'লক্ষ্যের নাম প্রয়োজন' : 'Goal Name Required',
        lang === 'bn' ? 'অনুগ্রহ করে সঞ্চয় লক্ষ্যের একটি শিরোনাম লিখুন।' : 'Please enter a title for your savings goal.'
      );
      return;
    }

    const targetVal = parseFloat(targetAmount);
    if (isNaN(targetVal) || targetVal <= 0) {
      notifyError(
        lang === 'bn' ? 'সঠিক পরিমাণ দিন' : 'Invalid Target Amount',
        lang === 'bn' ? 'লক্ষ্যের টাকার পরিমাণ শূন্যের বেশি হতে হবে।' : 'Target amount must be greater than zero.'
      );
      return;
    }

    const targetDate = new Date('2026-10-01');
    targetDate.setMonth(targetDate.getMonth() + parseInt(deadlineMonths || '6'));

    addGoal({
      goal_name: name,
      target_amount: targetVal,
      current_amount: parseFloat(currentAmount) || 0,
      deadline: targetDate.toISOString().split('T')[0],
      priority,
      category,
    });

    notifySuccess(
      lang === 'bn' ? 'সঞ্চয় লক্ষ্য যুক্ত হয়েছে' : 'Savings Goal Created',
      lang === 'bn'
        ? `"${name}" সফলভাবে যুক্ত হয়েছে এবং ক্লাউডে সংরক্ষিত হয়েছে।`
        : `"${name}" has been created and synced with the cloud.`,
      {
        financialDetails: {
          amount: targetVal,
          category,
        },
      }
    );

    setIsAddGoalModalOpen(false);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--line)] rounded-[28px] shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[var(--navy)] text-[var(--yellow)] flex items-center justify-center font-bold text-sm shadow-2xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[#0B1F4B]">নতুন সঞ্চয় লক্ষ্য তৈরি করুন</h3>
              <p className="text-caption text-[var(--muted)]">
                লক্ষ্য নির্ধারণ করুন এবং এআই সম্ভাব্যতা গণনা করবে
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddGoalModalOpen(false)}
            className="p-2 rounded-[14px] text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--bg)] cursor-pointer transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-caption font-bold text-[var(--navy)] mb-1.5">
              লক্ষ্যের শিরোনাম / উদ্দেশ্য
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: নতুন ল্যাপটপ, জরুরি ফান্ড, ডিপোজিট"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-bold text-[var(--navy)] mb-1.5">
                মোট লক্ষ্যমাত্রা (৳ টাকা)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-caption font-bold text-[var(--navy)] mb-1.5">
                বর্তমানে জমানো টাকা (৳)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-bold text-[var(--navy)] mb-1.5">
                সময়কাল (মাস)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={deadlineMonths}
                onChange={(e) => setDeadlineMonths(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-caption font-bold text-[var(--navy)] mb-1.5">
                অগ্রাধিকার
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
              >
                <option value="HIGH">উচ্চ অগ্রাধিকার</option>
                <option value="MEDIUM">মাঝারি অগ্রাধিকার</option>
                <option value="LOW">স্বাভাবিক / কম</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-caption font-bold text-[var(--navy)] mb-1.5">
              বিভাগ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] text-[14px] text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
            >
              <option value="Education">শিক্ষা ও দক্ষতা বৃদ্ধি</option>
              <option value="Emergency Fund">জরুরি তহবিল / রিজার্ভ</option>
              <option value="Healthcare">চিকিৎসা ও পরিবার নিরাপত্তা</option>
              <option value="Travel">ভ্রমণ ও পারিবারিক অনুষ্ঠান</option>
              <option value="Business">ব্যবসা ও কর্ম সরঞ্জাম</option>
              <option value="Shopping">কেনাকাটা ও ইলেকট্রনিক্স</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => setIsAddGoalModalOpen(false)}
              className="px-5 py-2.5 rounded-[14px] bg-[var(--bg)] text-[var(--muted)] text-[13px] font-bold hover:bg-slate-200/60 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <CheckCircle2 className="w-4 h-4 text-[var(--navy)]" />
              <span>পরিকল্পনা তৈরি করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
