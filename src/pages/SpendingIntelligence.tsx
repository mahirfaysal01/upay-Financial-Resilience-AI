import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';

const BRAND_PALETTE = ['#FFC20E', '#0B1F4B', '#E5484D', '#1FA971', '#5B6685', '#12306F', '#8B5CF6'];

export const SpendingIntelligence: React.FC = () => {
  const { customer, profile, anomalies, formatMoney } = useFinancial();
  const [viewMode, setViewMode] = useState<'categories' | 'comparison' | 'anomalies'>('categories');

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

  const comparisonData = anomalies.map((a) => ({
    category: categoryNamesBn[a.category] || a.category,
    'পূর্বের গড়': a.normalSpending,
    'চলতি মাস': a.currentSpending,
    pctChange: a.percentageChange,
    isAnomaly: a.isAnomaly,
  }));

  const pieData = anomalies.map((a, i) => ({
    name: categoryNamesBn[a.category] || a.category,
    value: a.currentSpending,
    color: BRAND_PALETTE[i % BRAND_PALETTE.length],
  }));

  const topDriver = anomalies[0];
  const topDriverName = categoryNamesBn[topDriver?.category] || topDriver?.category;

  return (
    <div className="space-y-6 route-fade-slide">
      {/* Page Title & Filter Row */}
      <div className="upay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[12px] font-bold">
            মডেল ৩ · খরচের বুদ্ধিমত্তা ও অস্বাভাবিকতা
          </div>
          <h2 className="text-[#0B1F4B] mt-2">খরচের বিশ্লেষণ ও স্মার্ট বুদ্ধিমত্তা</h2>
          <p className="text-caption text-[var(--muted)] max-w-2xl mt-0.5">
            আইসোলেশন ফরেস্ট অ্যালগরিদম আপনার বিগত ৯০ দিনের ব্যয়ের ধরণের সাথে চলতি মাসের তুলনা করে অস্বাভাবিক বৃদ্ধি চিহ্নিত করে।
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-full bg-[var(--bg)] p-1 border border-[var(--line)] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('categories')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
              viewMode === 'categories'
                ? 'bg-[var(--navy)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--navy)]'
            }`}
          >
            খাতসমূহ
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
              viewMode === 'comparison'
                ? 'bg-[var(--navy)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--navy)]'
            }`}
          >
            গড় বনাম বর্তমান
          </button>
          <button
            onClick={() => setViewMode('anomalies')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
              viewMode === 'anomalies'
                ? 'bg-[var(--navy)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--navy)]'
            }`}
          >
            অস্বাভাবিকতা
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="upay-card p-5">
          <span className="text-[13px] font-semibold text-[var(--muted)]">শীর্ষ ব্যয়ের খাত</span>
          <p className="font-heading font-extrabold text-[22px] text-[var(--navy)] mt-1">{topDriverName}</p>
          <p className="text-caption text-[var(--danger)] font-bold mt-0.5">
            {formatMoney(topDriver?.currentSpending || 0)} (+{topDriver?.percentageChange}%)
          </p>
        </div>

        <div className="upay-card p-5">
          <span className="text-[13px] font-semibold text-[var(--muted)]">ঐচ্ছিক খরচের অনুপাত</span>
          <p className="font-heading font-extrabold text-[22px] text-[var(--navy)] mt-1">
            {Math.round(profile.discretionarySpendingRatio * 100)}%
          </p>
          <p className="text-caption text-[var(--muted)] mt-0.5">মোট ব্যয়ের প্রায় এক-তৃতীয়াংশ</p>
        </div>

        <div className="upay-card p-5">
          <span className="text-[13px] font-semibold text-[var(--muted)]">ক্যাশ-আউট নির্ভরতা</span>
          <p className="font-heading font-extrabold text-[22px] text-[var(--navy)] mt-1">
            {Math.round(profile.cashOutRatio * 100)}%
          </p>
          <p className="text-caption text-[var(--muted)] mt-0.5">উপায় কিউআর ব্যবহার করে ফি সাশ্রয় সম্ভব</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Bar Comparison) */}
        <div className="lg:col-span-7 upay-card p-6 space-y-4">
          <div>
            <h3 className="text-[#0B1F4B]">ঐতিহাসিক গড় বনাম চলতি মাসের খরচের তুলনা</h3>
            <p className="text-caption text-[var(--muted)] mt-0.5">
              বিগত ৯০ দিনের সাধারণ গড় ব্যয়ের সাথে চলতি মাসের পার্থক্য
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} tickLine={false} />
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
                  formatter={(val: any) => [formatMoney(Number(val)), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="পূর্বের গড়" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="চলতি মাস" fill="#0B1F4B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (Donut Distribution) */}
        <div className="lg:col-span-5 upay-card p-6 space-y-4">
          <div>
            <h3 className="text-[#0B1F4B]">চলতি ব্যয়ের ক্যাটাগরি বিভাজন</h3>
            <p className="text-caption text-[var(--muted)] mt-0.5">মোট ব্যয়ের শতকরা হিসাব</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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

          <div className="space-y-2 border-t border-[var(--line)] pt-3 max-h-40 overflow-y-auto">
            {pieData.map((item) => (
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
      </div>

      {/* Model Anomaly Cards */}
      <div className="upay-card p-6 space-y-4">
        <div>
          <h3 className="text-[#0B1F4B]">অস্বাভাবিক ব্যয়ের স্কোর ও কারণসমূহ</h3>
          <p className="text-caption text-[var(--muted)] mt-0.5">
            স্কোর ০.৬০ এর বেশি হলে তা অস্বাভাবিক হিসেবে সতর্ক করা হয়
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anomalies.map((item) => {
            const catName = categoryNamesBn[item.category] || item.category;
            return (
              <div
                key={item.category}
                className={`p-4.5 rounded-[14px] border transition-all ${
                  item.isAnomaly
                    ? 'bg-[var(--danger-soft)] border-[var(--danger)]/30 text-[var(--danger)]'
                    : 'bg-[var(--bg)] border-[var(--line)] text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[var(--navy)]">{catName}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.isAnomaly
                        ? 'bg-[var(--danger)] text-white'
                        : 'bg-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    স্কোর: {item.anomalyScore}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between text-[12.5px] text-[var(--muted)]">
                  <span>স্বাভাবিক গড়: {formatMoney(item.normalSpending)}</span>
                  <span className="font-heading font-bold text-[var(--navy)] text-[14px]">
                    বর্তমান: {formatMoney(item.currentSpending)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold">
                  {item.percentageChange > 0 ? (
                    <span className="text-[var(--danger)] flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{item.percentageChange}% বৃদ্ধি
                    </span>
                  ) : (
                    <span className="text-[var(--success)] flex items-center">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {item.percentageChange}% হ্রাস
                    </span>
                  )}
                </div>

                <p className="mt-2 text-caption text-[var(--muted)] leading-relaxed border-t border-[var(--line)] pt-2 font-medium">
                  {item.category === 'Food'
                    ? 'রেস্তোরাঁ ও ফুড ডেলিভারি ব্যয় স্বাভাবিক গড়ের তুলনায় উল্লেখযোগ্য পরিমাণে বেশি (+৩৬.৮%)।'
                    : item.category === 'Cash-out'
                    ? 'এজেন্ট ক্যাশ-আউট বৃদ্ধি পেয়েছে। সরাসরি উপায় কিউআর বা ইউটিলিটি বিল পে করলে ক্যাশ-আউট ফি সম্পূর্ণ সাশ্রয় হবে।'
                    : 'এই খাতে ব্যয় স্বাভাবিক গতিধারার কাছাকাছি রয়েছে।'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
