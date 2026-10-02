import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  Customer,
  CustomerFinancialProfile,
  Transaction,
  CashFlowForecast,
  ShortageRisk,
  SpendingAnomaly,
  Recommendation,
  SavingsGoal,
} from '../types/financial';
import { SYNTHETIC_CUSTOMERS } from '../data/syntheticData';
import {
  calculateCustomerFinancialProfile,
  getTransactionsByCustomerId,
} from '../services/financialProfileEngine';
import { forecastCashFlow } from '../services/forecastingEngine';
import { calculateShortageRisk } from '../services/shortageRiskEngine';
import { detectSpendingAnomalies } from '../services/anomalyDetectionEngine';
import { generateRecommendations } from '../services/recommendationEngine';
import { getCustomerSavingsGoals } from '../services/savingsPlannerEngine';
import { Language, translations, formatCurrency } from '../utils/translations';

interface FinancialContextType {
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  customer: Customer;
  profile: CustomerFinancialProfile;
  transactions: Transaction[];
  forecast: CashFlowForecast;
  risk: ShortageRisk;
  anomalies: SpendingAnomaly[];
  recommendations: Recommendation[];
  goals: SavingsGoal[];
  isResponsibleModalOpen: boolean;
  setIsResponsibleModalOpen: (open: boolean) => void;
  isHowItWorksOpen: boolean;
  setIsHowItWorksOpen: (open: boolean) => void;
  isAddGoalModalOpen: boolean;
  setIsAddGoalModalOpen: (open: boolean) => void;
  addGoal: (goal: Omit<SavingsGoal, 'goal_id' | 'customer_id'>) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
  formatMoney: (amount: number) => string;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('C001');
  const [lang, setLang] = useState<Language>('bn'); // Default to Bangla as requested for full accessibility!
  const [isResponsibleModalOpen, setIsResponsibleModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [customGoals, setCustomGoals] = useState<Record<string, SavingsGoal[]>>({});

  const t = useMemo(() => {
    return translations[lang];
  }, [lang]);

  const customer = useMemo(() => {
    return (
      SYNTHETIC_CUSTOMERS.find((c) => c.customer_id === selectedCustomerId) ||
      SYNTHETIC_CUSTOMERS[0]
    );
  }, [selectedCustomerId]);

  const profile = useMemo(() => {
    return calculateCustomerFinancialProfile(selectedCustomerId);
  }, [selectedCustomerId]);

  const transactions = useMemo(() => {
    return getTransactionsByCustomerId(selectedCustomerId);
  }, [selectedCustomerId]);

  const forecast = useMemo(() => {
    return forecastCashFlow(profile);
  }, [profile]);

  const risk = useMemo(() => {
    return calculateShortageRisk(profile);
  }, [profile]);

  const anomalies = useMemo(() => {
    return detectSpendingAnomalies(profile);
  }, [profile]);

  const recommendations = useMemo(() => {
    return generateRecommendations(profile, risk, anomalies);
  }, [profile, risk, anomalies]);

  const goals = useMemo(() => {
    const baseGoals = getCustomerSavingsGoals(selectedCustomerId);
    const added = customGoals[selectedCustomerId] || [];
    return [...baseGoals, ...added];
  }, [selectedCustomerId, customGoals]);

  const addGoal = (newGoalData: Omit<SavingsGoal, 'goal_id' | 'customer_id'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      goal_id: `G_CUSTOM_${Date.now()}`,
      customer_id: selectedCustomerId,
    };
    setCustomGoals((prev) => ({
      ...prev,
      [selectedCustomerId]: [...(prev[selectedCustomerId] || []), newGoal],
    }));
  };

  const formatMoney = (amount: number) => {
    return formatCurrency(amount, lang);
  };

  return (
    <FinancialContext.Provider
      value={{
        customers: SYNTHETIC_CUSTOMERS,
        selectedCustomerId,
        setSelectedCustomerId,
        customer,
        profile,
        transactions,
        forecast,
        risk,
        anomalies,
        recommendations,
        goals,
        isResponsibleModalOpen,
        setIsResponsibleModalOpen,
        isHowItWorksOpen,
        setIsHowItWorksOpen,
        isAddGoalModalOpen,
        setIsAddGoalModalOpen,
        addGoal,
        lang,
        setLang,
        t,
        formatMoney,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
