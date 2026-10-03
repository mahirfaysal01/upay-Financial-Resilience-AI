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
    { to: '/dashboard', label: t.nav.dashboard, icon: TrendingUp },
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/92 border-b border-[var(--border)] shadow-[0_4px_24px_rgba(11,31,75,0.06)] transition-all">
      {/* Upper Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Left: Official upay logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <NavLink
              to="/"
              className="flex items-center gap-2 group transition-all hover:scale-102 hover:opacity-95"
              title="upay Financial Resilience AI"
            >
              <UpayLogo height={38} alt="upay" />
            </NavLink>
          </div>

          {/* Right: Persona Switcher, Lang Toggle, Bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick AI Verdict Badge Link */}
            <NavLink
              to="/dashboard#ai-verdict"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300/60 text-[var(--navy)] text-[12px] font-bold tracking-tight hover:shadow-[0_0_15px_rgba(255,194,14,0.4)] hover:border-amber-400 transition-all shine-effect cursor-pointer"
              title={lang === 'bn' ? 'তাৎক্ষণিক এআই আর্থিক রায় জানুন' : 'Instant AI Financial Verdict'}
            >
              <Bot className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>{lang === 'bn' ? 'এআই রায়' : 'AI Verdict'}</span>
            </NavLink>

            {/* Real-time Firebase Cloud Connection Indicator with Ping Animation */}
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-[11.5px] font-semibold tracking-tight shadow-xs"
              title={lang === 'bn' ? `রিয়েল-টাইম ফায়ারবেস সংযুক্ত (${firebaseProjectId})` : `Firebase Connected (${firebaseProjectId})`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{lang === 'bn' ? 'ফায়ারবেস লাইভ' : 'Firebase Live'}</span>
            </div>

            {/* Customer Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[14px] bg-[var(--bg-page)]/80 hover:bg-[var(--bg-page)] border border-[var(--border)] hover:border-[var(--brand-accent)] text-[var(--brand-primary)] text-[13px] font-semibold transition-all cursor-pointer shadow-xs hover:shadow-sm"
                title={lang === 'bn' ? 'গ্রাহক প্রোফাইল পরিবর্তন করুন' : 'Switch Customer Profile'}
                aria-label={lang === 'bn' ? 'গ্রাহক প্রোফাইল পরিবর্তন' : 'Switch Customer Profile'}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0 animate-pulse"></span>
                <span className="max-w-[85px] sm:max-w-none truncate">{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${customerDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {customerDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-[var(--border)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {lang === 'bn' ? 'টেস্ট প্রোফাইল নির্বাচন করুন' : 'Select Test Profile'}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]/60">
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
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-[var(--bg-page)] cursor-pointer ${
                            isSelected ? 'bg-[var(--brand-accent-soft)] border-l-4 border-[var(--brand-accent)]' : ''
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-[var(--brand-accent)] font-bold text-xs flex items-center justify-center shrink-0">
                            {c.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[13px] font-bold text-[var(--brand-primary)] truncate">{cName}</p>
                              {c.customer_id === 'C001' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
                                  {lang === 'bn' ? 'ডেমো' : 'DEMO'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11.5px] text-[var(--text-muted)] truncate">{cProfile}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle */}
            <div
              className="flex items-center bg-[var(--bg-page)] border border-[var(--border)] rounded-full p-0.5 text-xs font-bold shadow-2xs"
              role="group"
              aria-label="Language Toggle"
            >
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'bn'
                    ? 'bg-[var(--brand-primary)] text-[var(--brand-accent)] shadow-2xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--brand-primary)] font-medium'
                }`}
                aria-pressed={lang === 'bn'}
                title="বাংলা (Hind Siliguri)"
              >
                <span>বাং</span>
                {lang === 'bn' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-[var(--brand-primary)] text-[var(--brand-accent)] shadow-2xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--brand-primary)] font-medium'
                }`}
                aria-pressed={lang === 'en'}
                title="English (Inter)"
              >
                <span>EN</span>
                {lang === 'en' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]"></span>
                )}
              </button>
            </div>

            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-[14px] text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
              aria-label={lang === 'bn' ? 'আর্থিক বিজ্ঞপ্তি কেন্দ্র' : 'Financial Notification Center'}
              onClick={() => setIsNotificationModalOpen(true)}
              title={lang === 'bn' ? 'আর্থিক বিজ্ঞপ্তি ও সতর্কতা' : 'Financial Notifications & Alerts'}
            >
              <Bell className="w-4 h-4 text-[var(--brand-primary)]" />
              {unreadCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--danger)] text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--success)] ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Scrollable on mobile down to 360px) */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.to;

              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13.5px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20 ring-1 ring-[var(--brand-accent)]/50'
                      : 'text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isActive ? 'text-[var(--brand-accent)] scale-110' : 'text-[var(--text-muted)]'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--danger)] text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[var(--brand-accent)] rounded-full"></span>
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
