export type TransactionType =
  | 'payment'
  | 'cash_out'
  | 'transfer'
  | 'recharge'
  | 'bill_payment'
  | 'income';

export type SpendingCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Shopping'
  | 'Education'
  | 'Healthcare'
  | 'Entertainment'
  | 'Cash-out'
  | 'Recharge'
  | 'Utilities'
  | 'Other';

export interface Customer {
  customer_id: string;
  name: string;
  age: number;
  occupation: string;
  monthly_income: number;
  income_frequency: 'Monthly' | 'Bi-weekly' | 'Irregular';
  location: string;
  financial_profile:
    | 'Month-End Spender'
    | 'Stable Saver'
    | 'High Discretionary Spender'
    | 'Goal-Oriented Saver'
    | 'Irregular Income User'
    | 'Sudden Spending User'
    | 'Cash-Out Heavy User';
  avatar?: string;
  phoneMasked?: string;
  walletStatus?: 'Tier-2 Verified' | 'Tier-1' | 'Merchant';
}

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  timestamp: string;
  transaction_type: TransactionType;
  category: SpendingCategory;
  amount: number;
  merchant_id?: string;
  merchant_name?: string;
  channel: 'app' | 'ussd' | 'agent' | 'qr';
  balance_after: number;
  note?: string;
}

export interface IncomeRecord {
  income_id: string;
  customer_id: string;
  date: string;
  amount: number;
  income_type: 'salary' | 'freelance' | 'business' | 'allowance';
}

export interface SavingsGoal {
  goal_id: string;
  customer_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // ISO date or month string
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
}

export interface UpcomingExpense {
  name: string;
  amount: number;
  dueDays: number;
  category: SpendingCategory;
  isMandatory: boolean;
}

export interface CustomerFinancialProfile {
  customerId: string;
  name: string;
  currentBalance: number;
  monthlyIncome: number;
  averageMonthlySpending: number;
  averageDailySpending: number;
  averageWeeklySpending: number;
  savingsRate: number; // 0 to 1
  foodSpendingRatio: number;
  discretionarySpendingRatio: number;
  cashOutRatio: number;
  transactionFrequency: number; // transactions per month
  spendingVolatility: 'LOW' | 'MODERATE' | 'HIGH';
  incomeVolatility: 'LOW' | 'MODERATE' | 'HIGH';
  averageMonthEndBalance: number;
  lowestHistoricalBalance: number;
  averageTransactionAmount: number;
  upcomingExpenses: UpcomingExpense[];
  daysUntilNextIncome: number;
  nextExpectedIncomeAmount: number;
  profileType: Customer['financial_profile'];
}

export interface DailyProjection {
  dayOffset: number;
  date: string;
  dayLabel: string;
  projectedBalance: number;
  baselineBalance: number;
  upperBound: number;
  lowerBound: number;
  projectedIncome: number;
  projectedExpense: number;
  isCritical: boolean;
  notes?: string;
}

export interface CashFlowForecast {
  currentBalance: number;
  day7Forecast: number;
  day14Forecast: number;
  monthEndForecast: number;
  minProjectedBalance: number;
  daysUntilCriticalBalance: number | null;
  dailyProjections: DailyProjection[];
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
    baselineMae: number;
    testSamples: number;
  };
}

export interface RiskFactor {
  id: string;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number; // SHAP / feature attribution weight
  valueFormatted: string;
  direction: 'negative' | 'positive' | 'neutral';
  description: string;
}

export interface ShortageRisk {
  probability: number; // e.g. 0.82
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  factors: RiskFactor[];
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
    prAuc: number;
  };
}

export interface SpendingAnomaly {
  category: SpendingCategory;
  normalSpending: number;
  currentSpending: number;
  difference: number;
  percentageChange: number;
  anomalyScore: number; // 0.0 - 1.0 (Isolation Forest style)
  isAnomaly: boolean;
  explanation: string;
}

export interface Recommendation {
  id: string;
  type: 'DISCRETIONARY_REDUCTION' | 'WEEKLY_LIMIT' | 'CASH_OUT_ALTERNATIVE' | 'GOAL_ADJUSTMENT' | 'BILL_PREPAREDNESS';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  explanation: string;
  actionText: string;
  quantifiedImpact: string;
  savingsEstimated: number;
  projectedNewRisk: number;
  projectedNewMonthEndBalance: number;
}

export interface SimulationParams {
  foodReductionPct: number;
  shoppingReductionPct: number;
  monthlySavingsDelta: number;
  additionalIncome: number;
  unexpectedExpense: number;
  cashOutReductionPct: number;
}

export interface SimulationOutcome {
  projectedMonthEndBalance: number;
  shortageRisk: number;
  savingsProgressPct: number;
  financialStability: 'LOW' | 'MODERATE' | 'HEALTHY';
  dailyBalanceCurve: { day: number; date: string; balance: number }[];
}

export interface SimulationComparison {
  before: SimulationOutcome;
  after: SimulationOutcome;
  deltaBalance: number;
  deltaRiskPercentagePoints: number;
  feasibilityAssessment: string;
}

export interface GoalPlanningAnalysis {
  goal: SavingsGoal;
  remainingAmount: number;
  monthsRemaining: number;
  requiredMonthlySaving: number;
  currentMonthlySurplus: number;
  feasibility: 'HIGHLY_ACHIEVABLE' | 'ACHIEVABLE' | 'STRETCH' | 'AT_RISK';
  recommendedActions: string[];
  projectedCompletionDate: string;
}
