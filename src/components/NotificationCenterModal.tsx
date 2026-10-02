import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNotification, ToastNotification, NotificationType } from '../context/NotificationContext';
import { useFinancial } from '../context/FinancialContext';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    history,
    unreadCount,
    markAllAsRead,
    clearHistory,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyFinancial,
  } = useNotification();
  const { lang, formatMoney } = useFinancial();
  const [activeTab, setActiveTab] = useState<'all' | 'financial' | 'system'>('all');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (activeTab === 'financial') return item.type === 'financial_alert';
    if (activeTab === 'system') return item.type !== 'financial_alert';
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'financial_alert':
        return <TrendingUp className="w-4 h-4 text-[var(--navy)]" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'error':
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeStyle = (type: NotificationType) => {
    switch (type) {
      case 'financial_alert':
        return 'bg-[var(--navy)]/10 text-[var(--navy)] border-[var(--navy)]/20';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return lang === 'bn' ? 'এইমাত্র' : 'Just now';
    if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return lang === 'bn' ? `${mins} মিনিট আগে` : `${mins}m ago`;
    }
    const hours = Math.floor(diff / 3600);
    if (hours < 24) {
      return lang === 'bn' ? `${hours} ঘণ্টা আগে` : `${hours}h ago`;
    }
    return new Date(timestamp).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper test triggers for reviewer testing
  const triggerSampleAlert = (sample: 'risk' | 'goal' | 'error' | 'warning') => {
    if (sample === 'risk') {
      notifyFinancial(
        lang === 'bn' ? 'নগদ উদ্বৃত্ত সতর্কতা (Cashflow Dip)' : 'Cashflow Dip Alert',
        lang === 'bn'
          ? 'আগামী ১০ দিনের মধ্যে প্রত্যাশিত ব্যালেন্স ৳১,৫০০ এর নিচে নামতে পারে।'
          : 'Projected balance may fall below ৳1,500 within the next 10 days.',
        {
          financialDetails: { amount: 1500, category: 'Shortage Warning', trend: 'down' },
        }
      );
    } else if (sample === 'goal') {
      notifySuccess(
        lang === 'bn' ? 'সঞ্চয় লক্ষ্য অগ্রগতি' : 'Savings Goal Progress',
        lang === 'bn'
          ? 'মাসিক ডিপোজিট সফলভাবে রেকর্ড করা হয়েছে। লক্ষ্যের ৬০% অর্জিত!'
          : 'Monthly deposit logged. You reached 60% of your target!',
        {
          financialDetails: { amount: 2000, category: 'Education Fund', trend: 'up' },
        }
      );
    } else if (sample === 'error') {
      notifyError(
        lang === 'bn' ? 'পেমেন্ট ব্যর্থতা বা নেটওয়ার্ক ত্রুটি' : 'Transaction or Sync Error',
        lang === 'bn'
          ? 'ক্লাউড সিঙ্ক প্রক্রিয়াকরণে সাময়িক বিলম্ব হয়েছে। ডেটা পুনরায় যাচাই করুন।'
          : 'Temporary sync latency detected. Please verify your connection.',
        { duration: 6000 }
      );
    } else {
      notifyWarning(
        lang === 'bn' ? 'ঐচ্ছিক খরচ সীমা সতর্কতা' : 'Discretionary Spend Warning',
        lang === 'bn'
          ? 'এই সপ্তাহে রেস্তোরাঁ ও শপিং খরচ নির্ধারিত বাজেটের ৮৫% অতিক্রম করেছে।'
          : 'Dining and shopping expenses have reached 85% of your weekly budget.',
        { duration: 5500 }
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
    >
      <div className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--line)] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--line)] bg-[var(--bg)]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[14px] bg-[var(--navy)] text-[var(--yellow)] flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="notification-center-title" className="text-base font-bold text-[var(--navy)]">
                  {lang === 'bn' ? 'আর্থিক বিজ্ঞপ্তি কেন্দ্র' : 'Financial Notification Center'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--danger)] text-white text-[11px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">
                {lang === 'bn'
                  ? 'রিয়েল-টাইম ক্যাশ-ফ্লো সতর্কতা ও সিস্টেম আপডেট'
                  : 'Real-time cash flow alerts & system updates'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--line)]/50 text-[var(--muted)] hover:text-[var(--navy)] transition-colors cursor-pointer"
            aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Test Toolbar */}
        <div className="px-5 py-2.5 bg-[var(--yellow-soft)]/40 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[var(--navy)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--navy)]" />
            <span>{lang === 'bn' ? 'টেস্ট টোস্ট পাঠান:' : 'Trigger Test Toast:'}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => triggerSampleAlert('risk')}
              className="px-2 py-1 rounded-lg bg-[var(--navy)] text-[var(--yellow)] hover:bg-[var(--navy-2)] font-semibold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'ঝুঁকি' : 'Risk'}
            </button>
            <button
              type="button"
              onClick={() => triggerSampleAlert('goal')}
              className="px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'সফল' : 'Success'}
            </button>
            <button
              type="button"
              onClick={() => triggerSampleAlert('warning')}
              className="px-2 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-semibold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'সতর্কতা' : 'Warning'}
            </button>
            <button
              type="button"
              onClick={() => triggerSampleAlert('error')}
              className="px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'ত্রুটি' : 'Error'}
            </button>
          </div>
        </div>

        {/* Filter Tabs & Bulk Actions */}
        <div className="px-5 py-2 border-b border-[var(--line)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[var(--navy)] text-white'
                  : 'text-[var(--muted)] hover:bg-[var(--bg)]'
              }`}
            >
              {lang === 'bn' ? 'সকল' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('financial')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'financial'
                  ? 'bg-[var(--navy)] text-white'
                  : 'text-[var(--muted)] hover:bg-[var(--bg)]'
              }`}
            >
              {lang === 'bn' ? 'আর্থিক সতর্কতা' : 'Financial'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-[var(--navy)] text-white'
                  : 'text-[var(--muted)] hover:bg-[var(--bg)]'
              }`}
            >
              {lang === 'bn' ? 'সিস্টেম ও ক্লাউড' : 'System & Cloud'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                title={lang === 'bn' ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark all as read'}
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-red-50 transition-colors cursor-pointer"
                title={lang === 'bn' ? 'সকল নোটিফিকেশন মুছুন' : 'Clear notification history'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[var(--line)]/50">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center mx-auto mb-3 text-[var(--muted)]">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-bold text-[var(--navy)]">
                {lang === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications'}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-xs mx-auto">
                {lang === 'bn'
                  ? 'আর্থিক বিশ্লেষণ বা সিস্টেম ইভেন্ট ঘটলে আপনি এখানে তাৎক্ষণিক নোটিফিকেশন দেখতে পাবেন।'
                  : 'New cash flow alerts and system milestones will appear here.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`pt-2.5 first:pt-0 flex items-start gap-3 transition-colors rounded-xl p-2 ${
                  !item.read ? 'bg-[var(--bg)]/60' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${getBadgeStyle(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[13px] font-bold text-[var(--navy)] truncate">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-[var(--muted)] shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  {item.financialDetails && (
                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                      {item.financialDetails.amount !== undefined && (
                        <span className="font-bold text-[var(--navy)] bg-white px-2 py-0.5 rounded border border-[var(--line)]">
                          {formatMoney(item.financialDetails.amount)}
                        </span>
                      )}
                      {item.financialDetails.category && (
                        <span className="text-[var(--muted)]">
                          {item.financialDetails.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--line)] bg-[var(--bg)]/40 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            {lang === 'bn'
              ? 'ইউনিক আর্থিক স্বচ্ছতা ও নোটিফিকেশন ইঞ্জিন'
              : 'Financial Resilience Notification Engine'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-[10px] bg-[var(--navy)] text-white font-bold hover:bg-[var(--navy-2)] transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
