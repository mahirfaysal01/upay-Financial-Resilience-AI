import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
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
import {
  subscribeToFirebaseGoals,
  addGoalToFirebase,
} from '../services/firebaseSync';

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
  isResilienceModalOpen: boolean;
  setIsResilienceModalOpen: (open: boolean) => void;
  addGoal: (goal: Omit<SavingsGoal, 'goal_id' | 'customer_id'>) => Promise<void>;
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: typeof translations.en;
  formatMoney: (amount: number) => string;
  isFirebaseConnected: boolean;
  firebaseProjectId: string;

  // Next-Level Actionable Interventions
  isBillBufferLocked: boolean;
  toggleBillBuffer: () => void;
  isDailySpendCapped: boolean;
  toggleDailySpendCap: () => void;
  isEmergencyBufferActive: boolean;
  toggleEmergencyBuffer: () => void;
  isMerchantQrOptimized: boolean;
  toggleMerchantQrOptimized: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('C001');
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('upay_app_lang');
      if (saved === 'en' || saved === 'bn') return saved;
    } catch {
      // ignore
    }
    return 'bn'; // Default to Bangla as requested
  });
  const [isResponsibleModalOpen, setIsResponsibleModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isResilienceModalOpen, setIsResilienceModalOpen] = useState(false);

  // Next-Level Interventions State
  const [isBillBufferLocked, setIsBillBufferLocked] = useState(false);
  const [isDailySpendCapped, setIsDailySpendCapped] = useState(false);
  const [isEmergencyBufferActive, setIsEmergencyBufferActive] = useState(false);
  const [isMerchantQrOptimized, setIsMerchantQrOptimized] = useState(false);

  const [customGoals, setCustomGoals] = useState<Record<string, SavingsGoal[]>>({});
  const [firebaseLiveGoals, setFirebaseLiveGoals] = useState<Record<string, SavingsGoal[]>>({});
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const firebaseProjectId = "upay-financial-resilience-ai";

  // Reset or adapt interventions on customer switch
  useEffect(() => {
    setIsBillBufferLocked(false);
    setIsDailySpendCapped(false);
    setIsEmergencyBufferActive(false);
    setIsMerchantQrOptimized(false);
  }, [selectedCustomerId]);

  // Sync document language attribute and font stylesheet
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    try {
      localStorage.setItem('upay_app_lang', lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Real-time Firebase Firestore Subscription alongside demo data
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseGoals(
      selectedCustomerId,
      (liveGoals) => {
        setFirebaseLiveGoals((prev) => ({
          ...prev,
          [selectedCustomerId]: liveGoals,
        }));
        setIsFirebaseConnected(true);
      },
      () => {
        setIsFirebaseConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedCustomerId]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const toggleBillBuffer = () => setIsBillBufferLocked((prev) => !prev);
  const toggleDailySpendCap = () => setIsDailySpendCapped((prev) => !prev);
  const toggleEmergencyBuffer = () => setIsEmergencyBufferActive((prev) => !prev);
  const toggleMerchantQrOptimized = () => setIsMerchantQrOptimized((prev) => !prev);

  const t = useMemo(() => {
    return translations[lang];
  }, [lang]);

  const customer = useMemo(() => {
    return (
      SYNTHETIC_CUSTOMERS.find((c) => c.customer_id === selectedCustomerId) ||
      SYNTHETIC_CUSTOMERS[0]
    );
  }, [selectedCustomerId]);

  const baseProfile = useMemo(() => {
    return calculateCustomerFinancialProfile(selectedCustomerId);
  }, [selectedCustomerId]);

  // Dynamic profile adjusted by active interventions
  const profile = useMemo(() => {
    let adjustedBalance = baseProfile.currentBalance;
    let adjustedDailySpending = baseProfile.averageDailySpending;

    if (isEmergencyBufferActive) {
      adjustedBalance += 1000;
    }
    if (isMerchantQrOptimized) {
      adjustedBalance += 320; // Savings from avoided agent cash-out fees
    }
    if (isDailySpendCapped) {
      adjustedDailySpending = Math.min(adjustedDailySpending, 290);
    }

    return {
      ...baseProfile,
      currentBalance: adjustedBalance,
      averageDailySpending: adjustedDailySpending,
    };
  }, [baseProfile, isEmergencyBufferActive, isMerchantQrOptimized, isDailySpendCapped]);

  const transactions = useMemo(() => {
    return getTransactionsByCustomerId(selectedCustomerId);
  }, [selectedCustomerId]);

  const baseForecast = useMemo(() => {
    return forecastCashFlow(profile);
  }, [profile]);

  // Dynamic forecast with adjusted month-end balances
  const forecast = useMemo(() => {
    let bonusAtEnd = 0;
    if (isEmergencyBufferActive) bonusAtEnd += 1000;
    if (isMerchantQrOptimized) bonusAtEnd += 320;
    if (isDailySpendCapped) bonusAtEnd += 750; // cumulative daily savings

    const adjustedDaily = baseForecast.dailyProjections.map((p, idx) => ({
      ...p,
      projectedBalance: p.projectedBalance + Math.round((bonusAtEnd * (idx + 1)) / 14),
    }));

    return {
      ...baseForecast,
      monthEndForecast: baseForecast.monthEndForecast + bonusAtEnd,
      dailyProjections: adjustedDaily,
    };
  }, [baseForecast, isEmergencyBufferActive, isMerchantQrOptimized, isDailySpendCapped]);

  const baseRisk = useMemo(() => {
    return calculateShortageRisk(profile);
  }, [profile]);

  // Dynamic risk calculation reflecting real-time interventions
  const risk = useMemo(() => {
    let reduction = 0;
    if (isBillBufferLocked) reduction += 0.14; // Utility bills protected
    if (isDailySpendCapped) reduction += 0.16; // Spend cap enforced
    if (isEmergencyBufferActive) reduction += 0.10; // Emergency buffer available
    if (isMerchantQrOptimized) reduction += 0.06; // Cash-out fee avoided

    const newProbability = Math.max(0.12, baseRisk.probability - reduction);
    const newRiskLevel: 'HIGH' | 'MODERATE' | 'LOW' =
      newProbability > 0.6 ? 'HIGH' : newProbability > 0.3 ? 'MODERATE' : 'LOW';

    return {
      ...baseRisk,
      probability: newProbability,
      riskLevel: newRiskLevel,
    };
  }, [baseRisk, isBillBufferLocked, isDailySpendCapped, isEmergencyBufferActive, isMerchantQrOptimized]);

  const anomalies = useMemo(() => {
    return detectSpendingAnomalies(profile);
  }, [profile]);

  const recommendations = useMemo(() => {
    return generateRecommendations(profile, risk, anomalies);
  }, [profile, risk, anomalies]);

  // Merge base synthetic goals, custom added goals, and real-time Firebase goals
  const goals = useMemo(() => {
    const baseGoals = getCustomerSavingsGoals(selectedCustomerId);
    const addedLocal = customGoals[selectedCustomerId] || [];
    const addedLive = firebaseLiveGoals[selectedCustomerId] || [];

    const map = new Map<string, SavingsGoal>();
    baseGoals.forEach((g) => map.set(g.goal_id, g));
    addedLocal.forEach((g) => map.set(g.goal_id, g));
    addedLive.forEach((g) => map.set(g.goal_id, g));

    return Array.from(map.values());
  }, [selectedCustomerId, customGoals, firebaseLiveGoals]);

  const addGoal = async (newGoalData: Omit<SavingsGoal, 'goal_id' | 'customer_id'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      goal_id: `G_CUSTOM_${Date.now()}`,
      customer_id: selectedCustomerId,
    };

    setCustomGoals((prev) => ({
      ...prev,
      [selectedCustomerId]: [...(prev[selectedCustomerId] || []), newGoal],
    }));

    try {
      await addGoalToFirebase(newGoal);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Real-time Firebase write fallback', err);
    }
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
        isResilienceModalOpen,
        setIsResilienceModalOpen,
        addGoal,
        lang,
        setLang,
        toggleLang,
        t,
        formatMoney,
        isFirebaseConnected,
        firebaseProjectId,

        // Actions
        isBillBufferLocked,
        toggleBillBuffer,
        isDailySpendCapped,
        toggleDailySpendCap,
        isEmergencyBufferActive,
        toggleEmergencyBuffer,
        isMerchantQrOptimized,
        toggleMerchantQrOptimized,
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
