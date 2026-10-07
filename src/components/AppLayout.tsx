import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useFinancial } from '../context/FinancialContext';
import { Navbar } from './Navbar';
import { ResponsibleAIModal } from './ResponsibleAIModal';
import { HowItWorksModal } from './HowItWorksModal';
import { AddGoalModal } from './AddGoalModal';
import { ResilienceScorecardModal } from './ResilienceScorecardModal';
import { UpayLogo } from './UpayLogo';
import { PhoneCall, ShieldCheck, HeartHandshake } from 'lucide-react';

import { HomePage } from '../pages/HomePage';
import { Dashboard } from '../pages/Dashboard';
import { SpendingIntelligence } from '../pages/SpendingIntelligence';
import { CashFlowForecast } from '../pages/CashFlowForecast';
import { UtsobShield } from '../pages/UtsobShield';
import { FinancialRisk } from '../pages/FinancialRisk';
import { WhatIfSimulator } from '../pages/WhatIfSimulator';
import { SavingsGoals } from '../pages/SavingsGoals';
import { AICoach } from '../pages/AICoach';
import { ProfileOverview } from '../pages/ProfileOverview';

export const AppLayout: React.FC = () => {
  const { lang, setIsResponsibleModalOpen, setIsHowItWorksOpen } = useFinancial();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) {
    return (
      <div key="home" className={`route-fade-slide min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col ${lang === 'bn' ? 'lang-bn' : 'lang-en'}`}>
        <HomePage />
        {/* Modals */}
        <ResponsibleAIModal />
        <HowItWorksModal />
        <AddGoalModal />
        <ResilienceScorecardModal />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col ${lang === 'bn' ? 'lang-bn' : 'lang-en'}`}>
      <Navbar />

      <main key={location.pathname} className="route-fade-slide flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/spending" element={<SpendingIntelligence />} />
          <Route path="/forecast" element={<CashFlowForecast />} />
          <Route path="/utsob-shield" element={<UtsobShield />} />
          <Route path="/risk" element={<FinancialRisk />} />
          <Route path="/simulator" element={<WhatIfSimulator />} />
          <Route path="/goals" element={<SavingsGoals />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/profile" element={<ProfileOverview />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Official upay Website Styled Deep Navy Footer */}
      <footer className="bg-[var(--brand-primary-dark)] text-white mt-14 border-t border-[var(--brand-primary)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between pb-8 border-b border-white/10">
            {/* Left: Brand Identity */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <UpayLogo height={42} variant="light" alt="upay" />
              </div>
              <p className="text-white/80 text-[14px] leading-relaxed max-w-sm">
                {lang === 'bn'
                  ? 'উপায় ফাইন্যান্সিয়াল রেজিলিয়েন্স এআই — সমস্যা তৈরি হওয়ার আগেই আপনার আর্থিক ভবিষ্যৎ পূর্বাভাস ও সিদ্ধান্ত সহায়তায় নিবেদিত।'
                  : 'upay Financial Resilience AI — proactive liquidity forecasting and decision support.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[var(--brand-accent)] text-[12px] font-bold border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'নিরাপদ ও নির্ভরযোগ্য' : 'Secure & Proactive'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[12px] font-bold border border-white/15">
                  <PhoneCall className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  <span>১৬২৬৮</span>
                </span>
              </div>
            </div>

            {/* Middle: Quick Links */}
            <div className="md:col-span-4 space-y-2">
              <h4 className="text-[var(--brand-accent)] font-heading font-bold text-[14px] uppercase tracking-wider">
                {lang === 'bn' ? 'গুরুত্বপূর্ণ সংযোগ' : 'Quick Navigation'}
              </h4>
              <ul className="space-y-2 text-[13.5px] text-white/80">
                <li>
                  <button
                    onClick={() => setIsResponsibleModalOpen(true)}
                    className="hover:text-[var(--brand-accent)] transition-colors cursor-pointer text-left"
                  >
                    {lang === 'bn' ? 'দায়িত্বশীল এআই সনদ (Charter)' : 'Responsible AI Charter'}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsHowItWorksOpen(true)}
                    className="hover:text-[var(--brand-accent)] transition-colors cursor-pointer text-left"
                  >
                    {lang === 'bn' ? 'সিস্টেম কীভাবে কাজ করে' : 'How the System Works'}
                  </button>
                </li>
                <li>
                  <Link to="/simulator" className="hover:text-[var(--brand-accent)] transition-colors">
                    {lang === 'bn' ? 'হোয়াট-ইফ সিমুলেটর' : 'What-If Cashflow Simulator'}
                  </Link>
                </li>
                <li>
                  <Link to="/coach" className="hover:text-[var(--brand-accent)] transition-colors">
                    {lang === 'bn' ? 'এআই আর্থিক কোচ' : 'upay AI Coach'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right: Partner / Bank info */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="text-[var(--brand-accent)] font-heading font-bold text-[14px] uppercase tracking-wider">
                {lang === 'bn' ? 'প্রতিষ্ঠান' : 'Company'}
              </h4>
              <p className="text-white/70 text-[13px] leading-relaxed">
                {lang === 'bn'
                  ? 'ইউসিবি ফিনটেক কোম্পানি লিমিটেড (উপায়)'
                  : 'UCB Fintech Company Limited (upay)'}
              </p>
              <p className="text-white/60 text-[12px] leading-relaxed">
                {lang === 'bn'
                  ? 'ইউনাইটেড কমার্শিয়াল ব্যাংক পিএলসি (UCB)-এর একটি সহযোগী প্রতিষ্ঠান।'
                  : 'A subsidiary of United Commercial Bank PLC (UCB).'}
              </p>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-white/60">
            <p>
              {lang === 'bn'
                ? '© ২০২৬ উপায় (ইউসিবি ফিনটেক কোম্পানি লিমিটেড)। সর্বস্বত্ব সংরক্ষিত।'
                : '© 2026 upay (UCB Fintech Company Limited). All rights reserved.'}
            </p>
            <div className="flex items-center gap-4">
              <span>{lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</span>
              <span>·</span>
              <span>{lang === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ResponsibleAIModal />
      <HowItWorksModal />
      <AddGoalModal />
      <ResilienceScorecardModal />
    </div>
  );
};
