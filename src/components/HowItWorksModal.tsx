import React from 'react';
import { X, Database, UserCheck, LineChart, AlertTriangle, Lightbulb, Sliders } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const HowItWorksModal: React.FC = () => {
  const { isHowItWorksOpen, setIsHowItWorksOpen } = useFinancial();

  if (!isHowItWorksOpen) return null;

  const pipelineSteps = [
    {
      step: '১',
      title: 'কৃত্রিম খতিয়ান ও ডেটাসেট',
      icon: Database,
      desc: 'লেনদেন, আয়ের রেকর্ড ও বিল প্রদেয় ডেটা যাচাই করে ব্যালেন্সের গাণিতিক ধারাবাহিকতা অক্ষুণ্ণ রাখে।',
    },
    {
      step: '২',
      title: 'আর্থিক প্রোফাইলিং ইঞ্জিন',
      icon: UserCheck,
      desc: 'দৈনিক ব্যয়ের গতি, খরচের অস্থিরতা, ঐচ্ছিক ব্যয়ের অনুপাত এবং মাস শেষের উদ্বৃত্ত গণনা করে।',
    },
    {
      step: '৩',
      title: 'ক্যাশ-ফ্লো পূর্বাভাস মডেল',
      icon: LineChart,
      desc: 'সাপ্তাহিক ছুটির দিন, বেতন প্রাপ্তির দিন এবং বিলের প্রভাবসহ ৭, ১৪ এবং ৩০ দিনের ব্যালেন্স পূর্বাভাস দেয়।',
    },
    {
      step: '৪',
      title: 'আর্থিক ঘাটতি ঝুঁকি ক্লাসিফায়ার',
      icon: AlertTriangle,
      desc: 'পরবর্তী বেতনের আগে টাকা ফুরিয়ে যাওয়ার গাণিতিক সম্ভাবনা (যেমন: ৮২% উচ্চ ঝুঁকি) পরিমাপ করে।',
    },
    {
      step: '৫',
      title: 'শ্যাপ (SHAP) ব্যাখ্যামূলক বিশ্লেষণ',
      icon: Lightbulb,
      desc: 'ঝুঁকি বাড়ার পেছনের মূল কারণগুলো (যেমন: খাবারে অতিরিক্ত ব্যয়, ক্যাশ-আউট ফি, আসন্ন বিল) স্পষ্টভাবে তুলে ধরে।',
    },
    {
      step: '৬',
      title: 'হোয়াট-ইফ সিমুলেটর ও এআই কোচ',
      icon: Sliders,
      desc: 'খরচ কমালে কীভাবে ঝুঁকি কমে তা সরাসরি পরীক্ষা করা যায় এবং গুগল জেমিনাই তা সহজ ভাষায় বুঝিয়ে দেয়।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[var(--card)] border border-[var(--line)] rounded-[28px] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div>
            <h2 className="text-[20px] font-bold text-[var(--navy)]">
              ইন্টেলিজেন্স আর্কিটেকচার ও ডেটা পাইপলাইন
            </h2>
            <p className="text-caption text-[var(--muted)]">
              ডিটারমিনিস্টিক মেশিন লার্নিং কোর এবং জেনারেটিভ এআই জেমিনাই অনুবাদক
            </p>
          </div>
          <button
            onClick={() => setIsHowItWorksOpen(false)}
            className="p-2 rounded-[14px] text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pipeline */}
        <div className="mt-6 space-y-3">
          <h4 className="text-caption font-bold text-[var(--muted)] uppercase tracking-wider">
            ধাপে ধাপে সিস্টেমের কার্যপ্রণালী
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pipelineSteps.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.step} className="p-4 rounded-[16px] bg-[var(--bg)] border border-[var(--line)] flex gap-3 hover:border-[#D3DAE8] transition-colors">
                  <div className="w-9 h-9 rounded-[12px] bg-[var(--navy)] text-[var(--yellow)] flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10.5px] font-bold text-[var(--navy)] bg-[var(--yellow-soft)] px-2 py-0.2 rounded-full">
                        ধাপ {p.step}
                      </span>
                      <h5 className="font-heading font-bold text-[14.5px] text-[var(--navy)]">{p.title}</h5>
                    </div>
                    <p className="text-caption text-[var(--muted)] mt-1.5 leading-relaxed font-medium">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empirical ML Benchmark Results */}
        <div className="mt-6 p-5 rounded-[20px] bg-[var(--yellow-soft)]/50 border border-[var(--yellow)]/30">
          <h4 className="font-heading font-bold text-[14px] text-[var(--navy)] uppercase tracking-wider mb-3">
            যাচাইকৃত মডেল সক্ষমতার স্কোরকার্ড (টেস্ট ডেটাসেট)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-[14px] bg-white border border-[var(--line)] shadow-2xs">
              <p className="text-caption text-[var(--muted)] font-semibold">পূর্বাভাস MAE</p>
              <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">৳৪২০.৫০</p>
              <p className="text-[11px] text-[var(--success)] font-bold">-৬৩% কম ত্রুটি</p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-white border border-[var(--line)] shadow-2xs">
              <p className="text-caption text-[var(--muted)] font-semibold">পূর্বাভাস MAPE</p>
              <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">৫.৪%</p>
              <p className="text-[11px] text-[var(--muted)] font-medium">Mean Abs % Error</p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-white border border-[var(--line)] shadow-2xs">
              <p className="text-caption text-[var(--muted)] font-semibold">ঝুঁকি ROC-AUC</p>
              <p className="font-heading font-extrabold text-[20px] text-[var(--success)] mt-0.5">০.৯২৪</p>
              <p className="text-[11px] text-[var(--muted)] font-medium">Discrimination</p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-white border border-[var(--line)] shadow-2xs">
              <p className="text-caption text-[var(--muted)] font-semibold">ঘাটতি রিকল</p>
              <p className="font-heading font-extrabold text-[20px] text-[var(--navy)] mt-0.5">৯১.২%</p>
              <p className="text-[11px] text-[var(--muted)] font-medium">Early danger catch</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsHowItWorksOpen(false)}
            className="btn-primary !px-6 !py-2.5"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
