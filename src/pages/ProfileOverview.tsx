import React from 'react';
import {
  User,
  MapPin,
  Briefcase,
  Activity,
  FileSpreadsheet,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { exportMonthlyFinancialDataCSV } from '../utils/exportFinancialData';

export const ProfileOverview: React.FC = () => {
  const { customer, profile, transactions, anomalies, risk, forecast, lang, formatMoney } = useFinancial();
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportSuccess, setExportSuccess] = React.useState(false);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      const result = exportMonthlyFinancialDataCSV({
        customer,
        profile,
        transactions,
        anomalies,
        risk,
        forecast,
        lang,
      });

      if (result.success) {
        setExportSuccess(true);
        setTimeout(() => {
          setExportSuccess(false);
          setIsExporting(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to export CSV in ProfileOverview:', err);
      setIsExporting(false);
    }
  };

  const customerNamesBn: Record<string, { name: string; profile: string; occupation: string; location: string }> = {
    C001: { name: 'রহিম হাসান', profile: 'মাস-শেষের অতিরিক্ত খরচকারী', occupation: 'জুনিয়র এক্সিকিউটিভ / শিক্ষার্থী', location: 'ঢাকা, বাংলাদেশ' },
    C002: { name: 'নুসরাত জাহান', profile: 'নিয়মিত স্থিতিশীল সঞ্চয়ী', occupation: 'সফটওয়্যার কিউএ ইঞ্জিনিয়ার', location: 'ঢাকা, বাংলাদেশ' },
    C003: { name: 'তানভীর আহমেদ', profile: 'উচ্চ ঐচ্ছিক ব্যয়কারী', occupation: 'ব্র্যান্ড ডিজাইনার', location: 'চট্টগ্রাম, বাংলাদেশ' },
    C004: { name: 'সাদিয়া রহমান', profile: 'লক্ষ্যভিত্তিক সঞ্চয়ী', occupation: 'ব্যাংক কর্মকর্তা', location: 'সিলেট, বাংলাদেশ' },
    C005: { name: 'আরিফ হোসেন', profile: 'অনিয়মিত আয়ের ফ্রিল্যান্সার', occupation: 'ফ্রিল্যান্স ডেভেলপার', location: 'রাজশাহী, বাংলাদেশ' },
    C006: { name: 'ফারহান কবির', profile: 'আকস্মিক ব্যয়কারী', occupation: 'ডিজিটাল মার্কেটার', location: 'ঢাকা, বাংলাদেশ' },
    C007: { name: 'মেহেদী জামান', profile: 'ক্যাশ-আউট নির্ভর ব্যবসায়ী', occupation: 'খুচরা দোকান মালিক', location: 'খুলনা, বাংলাদেশ' },
  };

  const displayName = customerNamesBn[customer.customer_id]?.name || customer.name;
  const displayProfile = customerNamesBn[customer.customer_id]?.profile || customer.financial_profile;
  const displayOccupation = customerNamesBn[customer.customer_id]?.occupation || customer.occupation;
  const displayLocation = customerNamesBn[customer.customer_id]?.location || customer.location;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Profile Card */}
      <div className="upay-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-[var(--navy)] flex items-center justify-center text-[var(--yellow)] font-heading font-black text-[26px] shadow-sm">
            {customer.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading font-extrabold text-[24px] sm:text-[28px] text-[var(--navy)] leading-tight">
                {displayName}
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                টিয়ার-২ ভেরিফাইড
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-caption text-[var(--muted)] mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {displayOccupation} (বয়স {customer.age})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {displayLocation}
              </span>
              <span>•</span>
              <span className="text-[var(--navy)] font-bold">
                আইডি: {customer.customer_id}
              </span>
            </div>
          </div>
        </div>

        {/* Persona Pill */}
        <div className="px-4 py-3 rounded-[16px] bg-[var(--bg)] border border-[var(--line)] text-left md:text-right">
          <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider font-bold">
            আচরণগত ক্লাস্টার
          </p>
          <p className="font-heading font-extrabold text-[15px] text-[var(--navy)] mt-0.5">
            {displayProfile}
          </p>
        </div>
      </div>

      {/* Complete Financial Profile Metrics Grid */}
      <div className="upay-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--line)]">
          <div>
            <h3 className="text-[#0B1F4B] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--yellow)]" />
              <span>{lang === 'bn' ? 'গ্রাহক আর্থিক প্রোফাইল অবজেক্ট মেট্রিক্স' : 'Customer Financial Profile Metrics'}</span>
            </h3>
            <p className="text-caption text-[var(--muted)]">
              {lang === 'bn' ? 'ফাইন্যান্সিয়াল প্রোফাইল ইঞ্জিন দ্বারা গণনাকৃত বৈশিষ্ঠ্যসমূহ' : 'Computed by Deterministic Financial Profile Engine'}
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] text-[12.5px] font-bold border shadow-2xs transition-all cursor-pointer ${
              exportSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white hover:bg-[var(--bg)] border-[var(--line)] hover:border-[var(--navy)] text-[var(--navy)]'
            }`}
            title={lang === 'bn' ? 'মাসিক আর্থিক বিবরণী সিএসভি হিসেবে ডাউনলোড করুন' : 'Export monthly financial statement as CSV'}
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in" />
                <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড সম্পন্ন' : 'CSV Downloaded'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[var(--navy)]" />
                <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড' : 'Export CSV'}</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">বর্তমান ব্যালেন্স</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {formatMoney(profile.currentBalance)}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">মাসিক মোট আয়</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {formatMoney(profile.monthlyIncome)}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">মাসিক গড় ব্যয়</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {formatMoney(profile.averageMonthlySpending)}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">দৈনিক গড় খরচ</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {formatMoney(profile.averageDailySpending)}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">সাপ্তাহিক গড় ব্যয়</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {formatMoney(profile.averageWeeklySpending)}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">সঞ্চয়ের হার</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--success)] mt-0.5">
              {(profile.savingsRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">খাবারে খরচের হার</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {(profile.foodSpendingRatio * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">ঐচ্ছিক খরচের হার</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {(profile.discretionarySpendingRatio * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">ক্যাশ-আউট অনুপাত</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--danger)] mt-0.5">
              {(profile.cashOutRatio * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">লেনদেনের সংখ্যা</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {profile.transactionFrequency} টি / মাস
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">খরচের অস্থিরতা</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--danger)] mt-0.5">
              {profile.spendingVolatility === 'HIGH' ? 'উচ্চ' : 'মাঝারি'}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">আয়ের অস্থিরতা</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {profile.incomeVolatility === 'LOW' ? 'স্থিতিশীল' : 'উচ্চ'}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">মাস শেষের গড় ব্যালেন্স</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {formatMoney(profile.averageMonthEndBalance)}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">সর্বনিম্ন ব্যালেন্স</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--danger)] mt-0.5">
              {formatMoney(profile.lowestHistoricalBalance)}
            </p>
          </div>
          <div className="p-4 rounded-[14px] bg-[var(--bg)] border border-[var(--line)]">
            <p className="text-caption text-[var(--muted)] font-semibold">গড় লেনদেনের টিকিট</p>
            <p className="font-heading font-extrabold text-[17px] text-[var(--navy)] mt-0.5">
              {formatMoney(profile.averageTransactionAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="upay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#0B1F4B] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[var(--yellow)]" />
              <span>কৃত্রিম লেনদেন লেজার খতিয়ান</span>
            </h3>
            <p className="text-caption text-[var(--muted)]">
              প্রতিটি লেনদেনের পর স্বয়ংক্রিয় ব্যালেন্স সমন্বয় যাচাইকৃত
            </p>
          </div>
          <span className="text-caption text-[var(--muted)] font-mono font-medium">
            {transactions.length} টি লেনদেন লোড হয়েছে
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold uppercase tracking-wider text-[11px] bg-[var(--bg)]">
                <th className="py-3 px-3.5">তারিখ ও সময়</th>
                <th className="py-3 px-3.5">মার্চেন্ট / প্রাপক</th>
                <th className="py-3 px-3.5">বিভাগ</th>
                <th className="py-3 px-3.5">মাধ্যম</th>
                <th className="py-3 px-3.5 text-right">পরিমাণ</th>
                <th className="py-3 px-3.5 text-right">অবশিষ্ট ব্যালেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]/60 font-medium">
              {transactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-[var(--bg)]/80 transition-colors">
                  <td className="py-3.5 px-3.5 text-[var(--muted)] font-mono text-[11.5px]">
                    {new Date(tx.timestamp).toLocaleString('bn-BD')}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <p className="font-bold text-[var(--navy)]">{tx.merchant_name || 'সরাসরি ট্রান্সফার'}</p>
                    {tx.note && <p className="text-[11px] text-[var(--muted)] truncate max-w-xs">{tx.note}</p>}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--navy)] font-semibold text-[11px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 uppercase text-[10.5px] font-mono text-[var(--muted)] font-bold">
                    {tx.channel}
                  </td>
                  <td className={`py-3.5 px-3.5 text-right font-heading font-extrabold text-[14px] ${
                    tx.transaction_type === 'income' ? 'text-[var(--success)]' : 'text-[var(--ink)]'
                  }`}>
                    {tx.transaction_type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-heading font-extrabold text-[var(--navy)] text-[14px]">
                    {formatMoney(tx.balance_after)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
