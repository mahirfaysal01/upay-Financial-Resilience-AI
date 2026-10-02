import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Layers,
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

export const CashFlowForecast: React.FC = () => {
  const { customer, profile, forecast, formatMoney } = useFinancial();
  const [showBands, setShowBands] = useState(true);

  const forecastData = forecast.dailyProjections.map((p) => ({
    day: `দিন ${p.dayOffset}`,
    date: p.date,
    'এআই পূর্বাভাস': p.projectedBalance,
    'সাধারণ গড়': p.baselineBalance,
    'আপার কনফিডেন্স': p.upperBound,
    'লোয়ার কনফিডেন্স': p.lowerBound,
    notes: p.notes,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="upay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] text-[12px] font-bold">
            মডেল ১ · ক্যাশ-ফ্লো পূর্বাভাস ইঞ্জিন
          </div>
          <h2 className="text-[#0B1F4B] mt-2">ক্যাশ-ফ্লো গতিধারা ও ভবিষ্যৎ ব্যালেন্স</h2>
          <p className="text-caption text-[var(--muted)] max-w-2xl mt-0.5">
            সাপ্তাহিক ছুটির দিন, বেতন প্রাপ্তির দিন এবং বিলের প্রভাবসহ ৭, ১৪ এবং ৩০ দিনের নিখুঁত নগদ পূর্বাভাস।
          </p>
        </div>

        <button
          onClick={() => setShowBands(!showBands)}
          className="px-4 py-2 rounded-[14px] border border-[var(--line)] bg-[var(--bg)] hover:bg-slate-200/60 text-[var(--navy)] text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Layers className="w-4 h-4 text-[var(--navy)]" />
          <span>{showBands ? '৯৫% ত্রুটিসীমা লুকান' : 'ত্রুটিসীমা দেখান'}</span>
        </button>
      </div>

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
    </div>
  );
};
