import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  PieChart,
  Calendar,
  AlertTriangle,
  Sliders,
  Target,
  Bot,
  User,
  Bell,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useNotification } from '../context/NotificationContext';
import { NotificationCenterModal } from './NotificationCenterModal';
import { UpayLogo } from './UpayLogo';

export const Navbar: React.FC = () => {
  const {
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    customer,
    risk,
    setIsResponsibleModalOpen,
    setIsHowItWorksOpen,
    lang,
    setLang,
    t,
    isFirebaseConnected,
    firebaseProjectId,
  } = useFinancial();

  const { unreadCount } = useNotification();
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t.nav.dashboard, icon: TrendingUp },
    { to: '/spending', label: t.nav.spending, icon: PieChart },
    { to: '/forecast', label: t.nav.forecast, icon: Calendar },
    {
      to: '/risk',
      label: t.nav.risk,
      icon: AlertTriangle,
      badge: risk.riskLevel === 'HIGH' ? (lang === 'bn' ? '৮২%' : '82%') : undefined,
    },
    { to: '/simulator', label: t.nav.simulator, icon: Sliders },
    { to: '/goals', label: t.nav.goals, icon: Target },
    { to: '/coach', label: t.nav.coach, icon: Bot },
    { to: '/profile', label: t.nav.profile, icon: User },
  ];

  const customerNamesBn: Record<string, { name: string; profile: string }> = {
    C001: { name: 'রহিম হাসান', profile: 'মাস-শেষের অতিরিক্ত খরচকারী' },
    C002: { name: 'নুসরাত জাহান', profile: 'নিয়মিত স্থিতিশীল সঞ্চয়ী' },
    C003: { name: 'তানভীর আহমেদ', profile: 'উচ্চ ঐচ্ছিক ব্যয়কারী' },
    C004: { name: 'সাদিয়া রহমান', profile: 'লক্ষ্যভিত্তিক সঞ্চয়ী' },
    C005: { name: 'আরিফ হোসেন', profile: 'অনিয়মিত আয়ের ফ্রিল্যান্সার' },
    C006: { name: 'ফারহান কবির', profile: 'আকস্মিক ব্যয়কারী' },
    C007: { name: 'মেহেদী জামান', profile: 'ক্যাশ-আউট নির্ভর ব্যবসায়ী' },
  };

  const displayName = lang === 'bn'
    ? (customerNamesBn[customer.customer_id]?.name || customer.name)
    : customer.name;

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--card)] border-b border-[var(--line)] shadow-[0_1px_3px_rgba(11,31,75,0.03)]">
      {/* Upper Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Left: upay official logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <NavLink to="/" className="flex items-center gap-2 group transition-transform hover:opacity-95" title="upay Financial Resilience AI">
              <img
                src="/upaymain.png"
                alt="upay Financial Resilience AI"
                className="h-10 sm:h-12 w-auto max-w-[210px] sm:max-w-[260px] object-contain"
                loading="eager"
              />
            </NavLink>
          </div>

          {/* Right: Persona Switcher, Lang Toggle, Bell & Modals */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Firebase Cloud Connection Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold tracking-tight shadow-2xs"
              title={lang === 'bn' ? `রিয়েল-টাইম ফায়ারবেস ক্লাউড সংযুক্ত (${firebaseProjectId})` : `Real-time Firebase Cloud Connected (${firebaseProjectId})`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{lang === 'bn' ? 'ফায়ারবেস লাইভ' : 'Firebase Live'}</span>
            </div>

            {/* Customer Switcher */}
            <div className="relative">
              <button
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--navy)]/30 text-[var(--navy)] text-[13px] font-semibold transition-all cursor-pointer"
                title={lang === 'bn' ? 'গ্রাহক প্রোফাইল পরিবর্তন করুন' : 'Switch Customer Profile'}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0"></span>
                <span className="max-w-[90px] sm:max-w-none truncate">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
              </button>

              {customerDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[var(--card)] border border-[var(--line)] rounded-[20px] shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-[var(--line)] text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    {lang === 'bn' ? 'টেস্ট প্রোফাইল নির্বাচন করুন' : 'Select Test Profile'}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--line)]/50">
                    {customers.map((c) => {
                      const cName = lang === 'bn' ? (customerNamesBn[c.customer_id]?.name || c.name) : c.name;
                      const cProfile = lang === 'bn' ? (customerNamesBn[c.customer_id]?.profile || c.financial_profile) : c.financial_profile;
                      const isSelected = c.customer_id === selectedCustomerId;
                      return (
                        <button
                          key={c.customer_id}
                          onClick={() => {
                            setSelectedCustomerId(c.customer_id);
                            setCustomerDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-[var(--bg)] cursor-pointer ${
                            isSelected ? 'bg-[var(--yellow-soft)]/50 border-l-4 border-[var(--yellow)]' : ''
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-[var(--navy)] text-[var(--yellow)] font-bold text-xs flex items-center justify-center shrink-0">
                            {c.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[13px] font-bold text-[var(--navy)] truncate">{cName}</p>
                              {c.customer_id === 'C001' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
                                  {lang === 'bn' ? 'ডেমো' : 'DEMO'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11.5px] text-[var(--muted)] truncate">{cProfile}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* State-Managed Bangla / English Language Toggle with Dynamic Font Switch */}
            <div
              className="flex items-center bg-[var(--bg)] border border-[var(--line)] rounded-full p-0.5 text-xs font-bold shadow-xs transition-all"
              role="group"
              aria-label="Language Toggle"
            >
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'bn'
                    ? 'bg-[var(--navy)] text-[var(--yellow)] shadow-xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--navy)] font-medium'
                }`}
                aria-pressed={lang === 'bn'}
                title="বাংলা (Hind Siliguri ফন্ট)"
              >
                <span>বাং</span>
                {lang === 'bn' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)]"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-[var(--navy)] text-[var(--yellow)] shadow-xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--navy)] font-medium'
                }`}
                aria-pressed={lang === 'en'}
                title="English (Inter font)"
              >
                <span>EN</span>
                {lang === 'en' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)]"></span>
                )}
              </button>
            </div>

            {/* Notification Bell with dynamic badge */}
            <button
              className="relative p-2 rounded-[14px] text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
              aria-label={lang === 'bn' ? 'আর্থিক বিজ্ঞপ্তি কেন্দ্র' : 'Financial Notification Center'}
              onClick={() => setIsNotificationModalOpen(true)}
              title={lang === 'bn' ? 'আর্থিক বিজ্ঞপ্তি ও সতর্কতা' : 'Financial Notifications & Alerts'}
            >
              <Bell className="w-4 h-4 text-[var(--navy)]" />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--danger)] text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pill-Style Navigation Tabs (Scrollable on mobile) */}
      <div className="border-t border-[var(--line)]/60 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.to;

              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13.5px] font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--navy)] text-white shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--bg)]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[var(--yellow)]' : 'text-[var(--muted)]'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--danger)] text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Financial Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </header>
  );
};
