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
  } = useFinancial();

  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'ড্যাশবোর্ড', icon: TrendingUp },
    { to: '/spending', label: 'খরচের বিশ্লেষণ', icon: PieChart },
    { to: '/forecast', label: 'ক্যাশ-ফ্লো পূর্বাভাস', icon: Calendar },
    {
      to: '/risk',
      label: 'আর্থিক ঝুঁকি',
      icon: AlertTriangle,
      badge: risk.riskLevel === 'HIGH' ? '৮২%' : undefined,
    },
    { to: '/simulator', label: 'হোয়াট-ইফ সিমুলেটর', icon: Sliders },
    { to: '/goals', label: 'সঞ্চয় লক্ষ্য', icon: Target },
    { to: '/coach', label: 'এআই পরামর্শক', icon: Bot },
    { to: '/profile', label: 'প্রোফাইল', icon: User },
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

  const displayName = customerNamesBn[customer.customer_id]?.name || customer.name;

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--card)] border-b border-[var(--line)] shadow-[0_1px_3px_rgba(11,31,75,0.03)]">
      {/* Upper Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Left: upay official logo + yellow-soft pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <NavLink to="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="h-10 flex items-center">
                <img
                  src="https://www.upaybd.com/images/upay-logo-2024.png"
                  alt="upay | উপায়"
                  className="h-8 sm:h-9 object-contain"
                  onError={(e) => {
                    // Fallback to stylized SVG brandmark if image fails
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.upay-logo-fallback')) {
                      const div = document.createElement('div');
                      div.className = 'upay-logo-fallback flex items-center gap-1 font-black text-2xl text-[var(--navy)]';
                      div.innerHTML = `<span style="background:var(--navy);color:var(--yellow);padding:2px 8px;border-radius:10px;font-size:20px;font-weight:900;">u</span><span style="font-weight:900;color:var(--navy);letter-spacing:-0.5px;">pay</span>`;
                      parent.appendChild(div);
                    }
                  }}
                />
              </div>
              <span className="hidden xs:inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] font-bold text-[12px] border border-[var(--yellow)]/30 tracking-tight">
                রেজিলিয়েন্স এআই
              </span>
            </NavLink>
          </div>

          {/* Right: Persona Switcher, Lang Toggle, Bell & Modals */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Switcher */}
            <div className="relative">
              <button
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--navy)]/30 text-[var(--navy)] text-[13px] font-semibold transition-all cursor-pointer"
                title="গ্রাহক প্রোফাইল পরিবর্তন করুন"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0"></span>
                <span className="max-w-[90px] sm:max-w-none truncate">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
              </button>

              {customerDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[var(--card)] border border-[var(--line)] rounded-[20px] shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-[var(--line)] text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    টেস্ট প্রোফাইল নির্বাচন করুন
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--line)]/50">
                    {customers.map((c) => {
                      const cName = customerNamesBn[c.customer_id]?.name || c.name;
                      const cProfile = customerNamesBn[c.customer_id]?.profile || c.financial_profile;
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
                                  ডেমো
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

            {/* Bangla / EN Toggle */}
            <div className="flex items-center bg-[var(--bg)] border border-[var(--line)] rounded-full p-0.5 text-xs font-bold">
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'bn'
                    ? 'bg-[var(--navy)] text-white shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--navy)]'
                }`}
              >
                বাং
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[var(--navy)] text-white shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--navy)]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Notification Bell with red dot */}
            <button
              className="relative p-2 rounded-[14px] text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
              aria-label="বিজ্ঞপ্তি"
              onClick={() => setIsHowItWorksOpen(true)}
              title="সতর্কবার্তা ও বিজ্ঞপ্তি"
            >
              <Bell className="w-4 h-4 text-[var(--navy)]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--danger)] ring-2 ring-white"></span>
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
    </header>
  );
};
