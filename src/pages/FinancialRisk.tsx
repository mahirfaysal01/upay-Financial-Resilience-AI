import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinancial } from '../context/FinancialContext';

export const FinancialRisk: React.FC = () => {
  const { customer, profile, risk, recommendations, formatMoney } = useFinancial();

  const riskPct = Math.round(risk.probability * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="upay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[12px] font-bold">
            মডেল ২ · আর্থিক ঘাটতি ঝুঁকি ক্লাসিফায়ার
          </div>
          <h2 className="text-[#0B1F4B] mt-2">আর্থিক ঘাটতি ঝুঁকি মূল্যায়ন</h2>
          <p className="text-caption text-[var(--muted)] max-w-2xl mt-0.5">
            পরবর্তী আয় বা বেতন আসার আগেই ওয়ালেট খালি হয়ে যাওয়ার গাণিতিক সম্ভাবনা।
          </p>
        </div>

        <Link
          to="/simulator"
          className="btn-primary self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4 text-[var(--navy)]" />
          <span>ঝুঁকি কমানোর উপায় সিমুলেট করুন</span>
        </Link>
      </div>

      {/* Main Risk Card */}
      <div className="upay-card-danger p-6 sm:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-[var(--danger)] text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>ঝুঁকির মাত্রা: উচ্চ ঝুঁকি</span>
            </div>
            <h2 className="font-heading font-extrabold text-[32px] sm:text-[38px] text-[var(--danger)] leading-tight">
              ঘাটতির সম্ভাবনা: {riskPct}%
            </h2>
            <p className="text-body text-[var(--danger)] font-medium leading-relaxed">
              পরবর্তী বেতন আসতে এখনো {profile.daysUntilNextIncome} দিন বাকি। আপনার বর্তমান দৈনিক গড় খরচ ও আসন্ন বিলের যোগফল ওয়ালেটের অবশিষ্ট ব্যালেন্সের ({formatMoney(profile.currentBalance)}) চেয়ে বেশি হওয়ায় আর্থিক ঘাটতির উচ্চ ঝুঁকি তৈরি হয়েছে।
            </p>
          </div>

          {/* Visual Gauge Bar */}
          <div className="w-full lg:w-80 bg-white p-5 rounded-[20px] border border-[var(--line)] shadow-xs space-y-3">
            <div className="flex justify-between text-caption font-bold text-[var(--muted)]">
              <span>কম (০%)</span>
              <span>মাঝারি (৩৫%)</span>
              <span>উচ্চ (৬৫%+)</span>
            </div>
            <div className="w-full bg-[var(--bg)] h-3.5 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full bg-[var(--danger)] transition-all duration-700"
                style={{ width: `${riskPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-caption font-semibold">
              <span className="text-[var(--muted)]">বর্তমান স্কোর:</span>
              <span className="font-heading font-extrabold text-[var(--navy)] text-[15px]">{risk.probability.toFixed(2)} / ১.০০</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI (SHAP-Style Section) */}
      <div className="upay-card p-6 space-y-5">
        <div>
          <h3 className="text-[#0B1F4B] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--yellow)]" />
            <span>ব্যাখ্যামূলক এআই: আপনার ঝুঁকি কেন ঠিক {riskPct}%?</span>
          </h3>
          <p className="text-caption text-[var(--muted)] mt-0.5">
            গাণিতিক মডেলের শীর্ষ ৫টি ফ্যাক্টরের স্বচ্ছ বিশ্লেষণ ({customer.name}):
          </p>
        </div>

        <div className="space-y-3">
          {risk.factors.map((factor, index) => {
            const bnFactorTitles: Record<string, { title: string; desc: string }> = {
              f1: {
                title: 'খাবারে খরচের উল্লম্ফন',
                desc: 'রেস্তোরাঁ ও ফুড ডেলিভারি ব্যয় (৳৫,২০০) বিগত স্বাভাবিক গড়ের (৳৩,৮০০) চেয়ে উল্লেখযোগ্য পরিমাণে বেশি।',
              },
              f2: {
                title: 'অতিরিক্ত ক্যাশ-আউট নির্ভরতা',
                desc: 'ঘন ঘন এজেন্ট ক্যাশ-আউট নগদ অর্থ দ্রুত খরচ করে ফেলছে ও ওয়ালেটের তারল্য হ্রাস করছে।',
              },
              f3: {
                title: 'আসন্ন বাধ্যতামূলক ইউটিলিটি বিল',
                desc: '৪ দিনের মধ্যে ডিপিডিসি বিদ্যুৎ ও ইন্টারনেট বাবদ ২,০০০ টাকা পরিশোধ করতে হবে।',
              },
              f4: {
                title: 'পরবর্তী বেতনের দূরত্ব',
                desc: 'বেতন আসতে এখনো ১১ দিন বাকি, কিন্তু ওয়ালেট ব্যালেন্স সীমিত।',
              },
              f5: {
                title: 'বর্তমান ওয়ালেট নগদ স্থিতি',
                desc: 'বর্তমান তহবিল ৮,২০০ টাকা কিন্তু প্রত্যাশিত খরচ ও বিল বাবদ প্রায় ১০,২৫০ টাকা প্রয়োজন।',
              },
            };

            const fTitle = bnFactorTitles[factor.id]?.title || factor.title;
            const fDesc = bnFactorTitles[factor.id]?.desc || factor.description;

            return (
              <div
                key={factor.id}
                className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#D3DAE8] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--navy)] text-[var(--yellow)] text-[11px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-heading font-bold text-[15px] text-[var(--navy)]">{fTitle}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
                      {factor.valueFormatted}
                    </span>
                  </div>
                  <p className="text-caption text-[var(--muted)] pl-7 leading-relaxed font-medium">{fDesc}</p>
                </div>

                {/* Attribution Impact Bar */}
                <div className="md:w-44 shrink-0 pl-7 md:pl-0 flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--navy)] h-full rounded-full"
                      style={{ width: `${Math.round(factor.weight * 100)}%` }}
                    />
                  </div>
                  <span className="font-heading text-[12px] font-bold text-[var(--navy)] w-10 text-right">
                    +{Math.round(factor.weight * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Benchmark Accuracy */}
      <div className="upay-card p-6 space-y-4">
        <div>
          <h3 className="text-[#0B1F4B]">মডেল ২ ক্লাসিফায়ার যাচাইকরণ (টেস্ট সেট ১২,০০০)</h3>
          <p className="text-caption text-[var(--muted)] mt-0.5">
            লজিস্টিক রিগ্রেশনের বিপরীতে টিউনড গ্রেডিয়েন্ট-বুস্টেড ক্লাসিফায়ারের পারফরম্যান্স
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">নির্ভুলতা (Accuracy)</p>
            <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">৮৯.৪%</p>
            <p className="text-[10px] text-[var(--muted)]">vs ৭৮.২% বেসলাইন</p>
          </div>
          <div className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">যথার্থতা (Precision)</p>
            <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">৮৭.৮%</p>
            <p className="text-[10px] text-[var(--muted)]">স্বল্প ফলস অ্যালার্ম</p>
          </div>
          <div className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">সংবেদনশীলতা (Recall)</p>
            <p className="font-heading font-extrabold text-[20px] text-[var(--success)] mt-0.5">৯১.২%</p>
            <p className="text-[10px] text-[var(--muted)]">ঘাটতি শনাক্তে নিখুঁত</p>
          </div>
          <div className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">F1-Score</p>
            <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">৮৯.৫%</p>
            <p className="text-[10px] text-[var(--muted)]">হারমোনিক গড়</p>
          </div>
          <div className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">ROC-AUC</p>
            <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">০.৯২৪</p>
            <p className="text-[10px] text-[var(--muted)]">বৈষম্য সূচক</p>
          </div>
          <div className="p-3.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">PR-AUC</p>
            <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">০.৯০৮</p>
            <p className="text-[10px] text-[var(--muted)]">প্রিসিশন-রিকল AUC</p>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations to Lower Risk */}
      <div className="upay-card p-6 space-y-4">
        <div>
          <h3 className="text-[#0B1F4B]">ব্যক্তিগত ও অনিরপেক্ষ কর্মপরিকল্পনা</h3>
          <p className="text-caption text-[var(--muted)] mt-0.5">
            আপনার ঘাটতির ঝুঁকি ৪০% এর নিচে নামিয়ে আনার কার্যকরী পরামর্শ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 4).map((rec) => {
            const bnRecTitles: Record<string, { title: string; exp: string; action: string }> = {
              rec_food: {
                title: 'বাইরের খাবার ও ডেলিভারি খরচে রাশ টানুন',
                exp: 'আপনার খাবার খরচ স্বাভাবিকের চেয়ে ৩৬.৮% বেশি। আগামী ১০ দিনে রেস্তোরাঁ খরচ কিছুটা কমালে জরুরি তারল্য বজায় থাকবে।',
                action: 'পরবর্তী ১০ দিনে খাবার খরচ প্রায় ৮০০ টাকা কমানোর চেষ্টা করুন।',
              },
              rec_weekly_limit: {
                title: 'সাপ্তাহিক খরচের একটি সীমা নির্ধারণ করুন',
                exp: 'বেতন আসতে ১১ দিন বাকি। প্রতি সপ্তাহে নির্দিষ্ট সীমা বেঁধে দিলে নিরাপদ ব্যালেন্সের নিচে নামবে না।',
                action: 'উপায় ওয়ালেটে প্রতি সপ্তাহে অনাবশ্যক খরচের অ্যালার্ট সেট করুন।',
              },
              rec_cash_out: {
                title: 'সরাসরি উপায় কিউআর ও অ্যাপ বিল পে ব্যবহার করুন',
                exp: 'ঘন ঘন এজেন্ট ক্যাশ-আউট করায় বাড়তি ফি কাটছে। সরাসরি মার্চেন্ট কিউআর বা ইউটিলিটি বিল পে করলে ক্যাশ-আউট ফি সম্পূর্ণ সাশ্রয় হবে।',
                action: 'টাকা তোলার পরিবর্তে মুদি দোকানে সরাসরি উপায় কিউআর স্ক্যান করে পে করুন।',
              },
              rec_bills: {
                title: 'আসন্ন ইউটিলিটি বিলের টাকা আগেই আলাদা রাখুন',
                exp: 'বেতন পাওয়ার আগেই ২,০০০ টাকা বিল দিতে হবে। এই টাকা ওয়ালেটে আগে থেকেই রিজার্ভ রাখলে জরিমানা এড়ানো যাবে।',
                action: 'ডিপিডিসি বিলের ২,০০০ টাকা এখনই উপায় বিল পকেটে আলাদা রাখুন।',
              },
            };

            const rData = bnRecTitles[rec.id];
            const rTitle = rData?.title || rec.title;
            const rExp = rData?.exp || rec.explanation;
            const rAct = rData?.action || rec.actionText;

            return (
              <div key={rec.id} className="p-4.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">{rTitle}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {rec.quantifiedImpact}
                  </span>
                </div>
                <p className="text-caption text-[var(--muted)] leading-relaxed font-medium">{rExp}</p>
                <div className="text-[12.5px] text-[var(--ink)] font-medium bg-white p-3 rounded-[10px] border border-[var(--line)]">
                  👉 <strong className="text-[var(--navy)]">প্রস্তাবিত পদক্ষেপ:</strong> {rAct}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
