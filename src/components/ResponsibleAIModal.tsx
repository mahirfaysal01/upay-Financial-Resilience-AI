import React from 'react';
import { X, ShieldCheck, AlertCircle, FileText, CheckCircle2, Lock } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const ResponsibleAIModal: React.FC = () => {
  const { isResponsibleModalOpen, setIsResponsibleModalOpen } = useFinancial();

  if (!isResponsibleModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--line)] rounded-[28px] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[var(--success)] shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[var(--navy)]">
                দায়িত্বশীল এআই ও সুশাসন সনদ
              </h2>
              <p className="text-caption text-[var(--muted)]">
                ডিআইইউ সিপিসি × উপায় এআই হ্যাকাথন ২০২৬ · ট্র্যাক ০৩ নৈতিক মানদণ্ড
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsResponsibleModalOpen(false)}
            className="p-2 rounded-[14px] text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4 text-body text-[var(--ink)]">
          <div className="p-4 rounded-[16px] bg-[var(--yellow-soft)]/60 border border-[var(--yellow)]/30 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--navy)] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-heading font-bold text-[var(--navy)] text-[14px] uppercase tracking-wider">
                হ্যাকাথন প্রোটোটাইপ ও কৃত্রিম ডেটাসেট বিজ্ঞপ্তি
              </h4>
              <p className="text-caption text-[var(--ink)] mt-1 leading-relaxed font-medium">
                এই অ্যাপ্লিকেশনটি একটি একাডেমিক প্রোটোটাইপ। সকল গ্রাহক রেকর্ড, খতিয়ান লেনদেন, মার্চেন্ট পয়েন্ট এবং ভাউচার সম্পূর্ণ কৃত্রিম (Synthetic Data)। কোনো বাস্তব গ্রাহক বা কর্মচারীর তথ্য ব্যবহৃত হয়নি।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-[16px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--navy)] font-bold text-[13.5px]">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                <span>ডিটারমিনিস্টিক কোর এমএল</span>
              </div>
              <p className="text-caption text-[var(--muted)] leading-relaxed font-medium">
                সংখ্যাগত পূর্বাভাস ও ঝুঁকি স্কোর গাণিতিক পরিসংখ্যান ও টাইম-সিরিজ মডেলের মাধ্যমে গণনা করা হয়—এলএলএম নিজে থেকে কোনো সংখ্যা বানায় না।
              </p>
            </div>

            <div className="p-4 rounded-[16px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--navy)] font-bold text-[13.5px]">
                <Lock className="w-4 h-4 text-[var(--success)]" />
                <span>স্বয়ংক্রিয় কোনো ঋণ সিদ্ধান্ত নয়</span>
              </div>
              <p className="text-caption text-[var(--muted)] leading-relaxed font-medium">
                এই প্ল্যাটফর্ম শুধুমাত্র পরামর্শ ও সহায়তা প্রদান করে। এটি কোনো ঋণ অনুমোদন বা বাতিল করে না এবং গ্রাহকের সম্মতি ছাড়া কোনো লেনদেন করে না।
              </p>
            </div>

            <div className="p-4 rounded-[16px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--navy)] font-bold text-[13.5px]">
                <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
                <span>প্ররোচনাহীন ও সৎ পরামর্শ</span>
              </div>
              <p className="text-caption text-[var(--muted)] leading-relaxed font-medium">
                সুপারিশগুলো কেবল বাজেট সামলানো ও বিল প্রস্তুতের উপর জোর দেয়। কোনো উচ্চ সুদের ঋণ বা অপ্রয়োজনীয় কেনাকাটার প্রলোভন দেখায় না।
              </p>
            </div>

            <div className="p-4 rounded-[16px] bg-[var(--bg)] border border-[var(--line)] space-y-1.5">
              <div className="flex items-center gap-2 text-[var(--navy)] font-bold text-[13.5px]">
                <FileText className="w-4 h-4 text-[var(--success)]" />
                <span>স্বচ্ছ কারণ ও ব্যাখ্যা</span>
              </div>
              <p className="text-caption text-[var(--muted)] leading-relaxed font-medium">
                ঝুঁকির শতকরা হারের সাথে স্বচ্ছ কারণ (যেমন: খাবার খরচ +৩৭%, আসন্ন বিল ৳২,০০০) উল্লেখ থাকে যাতে গ্রাহক বুঝতে পারেন ঝুঁকি কেন বেড়েছে।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-blue-50/60 border border-blue-200 text-caption text-slate-800 leading-relaxed font-medium">
            <span className="font-bold text-[var(--navy)]">গ্রাহক স্বাধিকার নীতি: </span>
            গ্রাহক নিজেই তার আর্থিক জীবনের চূড়ান্ত নিয়ন্ত্রক। প্রতিটি পূর্বাভাস ও সিমুলেশন একটি সাহায্যকারী দূরবীন হিসেবে কাজ করে—গ্রাহককে স্বাবলম্বী করার জন্য।
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsResponsibleModalOpen(false)}
            className="btn-primary !px-6 !py-2.5"
          >
            আমি বুঝেছি ও একমত
          </button>
        </div>
      </div>
    </div>
  );
};
