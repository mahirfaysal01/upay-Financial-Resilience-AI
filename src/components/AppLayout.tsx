import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useFinancial } from '../context/FinancialContext';
import { Navbar } from './Navbar';
import { ResponsibleAIModal } from './ResponsibleAIModal';
import { HowItWorksModal } from './HowItWorksModal';
import { AddGoalModal } from './AddGoalModal';

import { Dashboard } from '../pages/Dashboard';
import { SpendingIntelligence } from '../pages/SpendingIntelligence';
import { CashFlowForecast } from '../pages/CashFlowForecast';
import { FinancialRisk } from '../pages/FinancialRisk';
import { WhatIfSimulator } from '../pages/WhatIfSimulator';
import { SavingsGoals } from '../pages/SavingsGoals';
import { AICoach } from '../pages/AICoach';
import { ProfileOverview } from '../pages/ProfileOverview';

export const AppLayout: React.FC = () => {
  const { lang, setIsResponsibleModalOpen, setIsHowItWorksOpen } = useFinancial();

  return (
    <div className={`min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col ${lang === 'bn' ? 'lang-bn' : 'lang-en'}`}>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/spending" element={<SpendingIntelligence />} />
          <Route path="/forecast" element={<CashFlowForecast />} />
          <Route path="/risk" element={<FinancialRisk />} />
          <Route path="/simulator" element={<WhatIfSimulator />} />
          <Route path="/goals" element={<SavingsGoals />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/profile" element={<ProfileOverview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 6) SLIM BRAND FOOTER */}
      <footer className="border-t border-[var(--line)] bg-[var(--card)] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: upay logo + name */}
          <div className="flex items-center gap-3">
            <img
              src="https://www.upaybd.com/images/upay-logo-2024.png"
              alt="upay"
              className="h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-heading font-extrabold text-[14.5px] text-[var(--navy)]">
              upay Financial Resilience AI
            </span>
          </div>

          {/* Right: Small Muted Links */}
          <div className="flex flex-wrap items-center gap-4 text-caption text-[var(--muted)]">
            <button
              onClick={() => setIsResponsibleModalOpen(true)}
              className="hover:text-[var(--navy)] transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'দায়িত্বশীল এআই সনদ' : 'Responsible AI Charter'}
            </button>
            <span>·</span>
            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="hover:text-[var(--navy)] transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'কীভাবে কাজ করে' : 'How it Works'}
            </button>
            <span>·</span>
            <Link to="/simulator" className="hover:text-[var(--navy)] transition-colors">
              {lang === 'bn' ? 'সিমুলেটর' : 'Simulator'}
            </Link>
            <span>·</span>
            <span className="text-[12px] text-[var(--muted)]/80">
              {lang === 'bn' ? '© ২০২৬ উপায় (ইউসিবি ফিনটেক কোম্পানি লিমিটেড)' : '© 2026 upay (UCB Fintech Company Limited)'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ResponsibleAIModal />
      <HowItWorksModal />
      <AddGoalModal />
    </div>
  );
};
