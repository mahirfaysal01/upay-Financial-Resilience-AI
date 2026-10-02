import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, TrendingUp, Award, Calendar, DollarSign, Wallet } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { UpayLogo } from './UpayLogo';
import { toBengaliNumber } from '../utils/translations';

export const ResilienceScorecardModal: React.FC = () => {
  const {
    customer,
    profile,
    risk,
    forecast,
    lang,
    formatMoney,
    isResilienceModalOpen,
    setIsResilienceModalOpen,
    isBillBufferLocked,
    isDailySpendCapped,
    isEmergencyBufferActive,
    isMerchantQrOptimized,
  } = useFinancial();

  if (!isResilienceModalOpen) return null;

  const riskPct = Math.round(risk.probability * 100);
  const resilienceScore = Math.max(350, Math.min(850, Math.round(850 - risk.probability * 380 + (isBillBufferLocked ? 40 : 0) + (isDailySpendCapped ? 35 : 0))));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scorecard-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header (Screen-only) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-page)] print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--brand-primary)]" />
            <h3 className="font-heading font-extrabold text-[16px] text-[var(--brand-primary)]" id="scorecard-title">
              {lang === 'bn' ? 'উপায় আর্থিক রেজিলিয়েন্স সনদ' : 'upay Financial Resilience Certificate'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[var(--brand-primary)] text-white text-[12.5px] font-bold hover:bg-[var(--brand-primary-dark)] transition-colors cursor-pointer"
              title={lang === 'bn' ? 'সনদ প্রিন্ট করুন' : 'Print Certificate'}
            >
              <Printer className="w-4 h-4 text-[var(--brand-accent)]" />
              <span>{lang === 'bn' ? 'প্রিন্ট / সেভ' : 'Print / Save'}</span>
            </button>
            <button
              onClick={() => setIsResilienceModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[var(--text-main)] print:p-0 print:border-none">
          {/* Certificate Header */}
          <div className="flex items-start justify-between border-b-2 border-[var(--brand-primary)] pb-5">
            <div>
              <UpayLogo height={42} alt="upay" />
              <p className="text-[12px] text-[var(--text-muted)] mt-1 font-semibold">
                {lang === 'bn'
                  ? 'ইউসিবি ফিনটেক কোম্পানি লিমিটেড (ইউনাইটেড কমার্শিয়াল ব্যাংক)'
                  : 'UCB Fintech Company Limited (United Commercial Bank PLC)'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-primary)] text-[11px] font-bold border border-[var(--brand-accent)]/40 uppercase tracking-wider">
                {lang === 'bn' ? 'যাচাইকৃত সনদ' : 'Verified Certificate'}
              </span>
              <p className="text-[11.5px] font-mono text-[var(--text-muted)] mt-1">
                ID: UPAY-RES-{customer.customer_id}-{Date.now().toString().slice(-4)}
              </p>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="text-center space-y-1">
            <h2 className="font-heading font-extrabold text-[22px] sm:text-[24px] text-[var(--brand-primary)] leading-tight">
              {lang === 'bn' ? 'আর্থিক রেজিলিয়েন্স ও সক্ষমতা সনদপত্র' : 'Financial Resilience & Solvency Scorecard'}
            </h2>
            <p className="text-[13.5px] text-[var(--text-muted)]">
              {lang === 'bn'
                ? 'রিয়েল-টাইম ক্যাশ-ফ্লো অডিট, লিকুইডিটি বাফার ও ব্যয় শৃঙ্খলা বিশ্লেষণ'
                : 'Real-time proactive cash-flow audit and liquidity risk assessment'}
            </p>
          </div>

          {/* Customer & Score Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-[18px] bg-[var(--bg-page)] border border-[var(--border)]">
            <div className="sm:col-span-7 space-y-1">
              <p className="text-[12px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                {lang === 'bn' ? 'সনদ গ্রহীতার বিবরণ' : 'Beneficiary Profile'}
              </p>
              <h4 className="font-heading font-extrabold text-[18px] text-[var(--brand-primary)]">
                {customer.name}
              </h4>
              <p className="text-[13px] text-[var(--text-muted)] font-mono">
                MFS Account: 017XXXX{customer.customer_id.replace('C', '88')}
              </p>
              <p className="text-[12.5px] text-slate-600 font-medium">
                {lang === 'bn' ? 'প্রোফাইল টাইপ:' : 'Behavioral Profile:'} {customer.financial_profile}
              </p>
            </div>

            <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-[14px] bg-white border border-[var(--border)] shadow-xs">
              <span className="text-[11.5px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {lang === 'bn' ? 'রেজিলিয়েন্স স্কোর' : 'Resilience Score'}
              </span>
              <p className="font-heading font-extrabold text-[36px] text-[var(--brand-primary)] leading-none my-1">
                {lang === 'bn' ? toBengaliNumber(resilienceScore) : resilienceScore}
                <span className="text-[15px] text-[var(--text-muted)] font-normal"> / ৮৫০</span>
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{resilienceScore > 650 ? (lang === 'bn' ? 'উচ্চ সক্ষমতা' : 'Strong Resilience') : (lang === 'bn' ? 'সন্তোষজনক' : 'Fair Standing')}</span>
              </span>
            </div>
          </div>

          {/* Verified Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)]">
              <p className="text-[11.5px] text-[var(--text-muted)] font-semibold">{lang === 'bn' ? 'মাসিক নিশ্চিত আয়' : 'Monthly Income'}</p>
              <p className="font-heading font-bold text-[16px] text-[var(--brand-primary)] mt-0.5">
                {formatMoney(profile.monthlyIncome)}
              </p>
            </div>
            <div className="p-3 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)]">
              <p className="text-[11.5px] text-[var(--text-muted)] font-semibold">{lang === 'bn' ? 'তারল্য ঘাটতি ঝুঁকি' : 'Shortage Risk'}</p>
              <p className={`font-heading font-bold text-[16px] mt-0.5 ${riskPct > 50 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                {lang === 'bn' ? `${toBengaliNumber(riskPct)}%` : `${riskPct}%`}
              </p>
            </div>
            <div className="p-3 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)]">
              <p className="text-[11.5px] text-[var(--text-muted)] font-semibold">{lang === 'bn' ? 'মাস শেষের ব্যালেন্স' : 'Projected Balance'}</p>
              <p className="font-heading font-bold text-[16px] text-[var(--brand-primary)] mt-0.5">
                {formatMoney(forecast.monthEndForecast)}
              </p>
            </div>
            <div className="p-3 rounded-[14px] bg-[var(--bg-page)] border border-[var(--border)]">
              <p className="text-[11.5px] text-[var(--text-muted)] font-semibold">{lang === 'bn' ? 'সক্রিয় বাফার গার্ড' : 'Active Safeguards'}</p>
              <p className="font-heading font-bold text-[16px] text-[var(--brand-primary)] mt-0.5">
                {lang === 'bn'
                  ? `${toBengaliNumber([isBillBufferLocked, isDailySpendCapped, isEmergencyBufferActive, isMerchantQrOptimized].filter(Boolean).length)}টি সক্রিয়`
                  : `${[isBillBufferLocked, isDailySpendCapped, isEmergencyBufferActive, isMerchantQrOptimized].filter(Boolean).length} Active`}
              </p>
            </div>
          </div>

          {/* Underwriting / Pre-Approval Banner */}
          <div className="p-4 rounded-[16px] bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[13.5px] font-bold text-emerald-950">
                {lang === 'bn' ? 'ইউসিবি ন্যানো-লোন ও উপায় ইমার্জেন্সি বাফার প্রাক-অনুমোদন' : 'Pre-Approved for UCB Nano-Credit & Emergency Buffer'}
              </p>
              <p className="text-[12px] text-emerald-800 leading-relaxed">
                {lang === 'bn'
                  ? 'গ্রাহকের ক্যাশ-ফ্লো স্বচ্ছতা ও স্বয়ংক্রিয় বাফার শৃঙ্খলার ভিত্তিতে তিনি সর্বোচ্চ ৳৫,০০০ পর্যন্ত তাৎক্ষণিক জরুরি ওভারড্রাফটের জন্য যোগ্য।'
                  : 'Based on verified transaction cash-flows and discipline, this profile qualifies for up to ৳5,000 instant overdraft.'}
              </p>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-[11.5px] text-[var(--text-muted)]">
            <div>
              <p className="font-bold text-[var(--brand-primary)]">{lang === 'bn' ? 'উপায় অ্যালগরিদম ভ্যালিডেশন' : 'upay Algorithmic Validation'}</p>
              <p>{lang === 'bn' ? 'তারিখ: অক্টোবর ২০২৬' : 'Date: October 2026'}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[var(--brand-primary)]">{lang === 'bn' ? 'ইউসিবি ফিনটেক কমপ্লায়েন্স' : 'UCB Fintech Compliance'}</p>
              <p>{lang === 'bn' ? 'ডিজিটাল সিলমোহর দ্বারা প্রত্যয়িত' : 'Digitally Certified & Sealed'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
