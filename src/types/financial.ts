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
  baseRate?: number;
  shapSum?: number;
  additiveEquation?: string;
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

export type FestivalSeason =
  | 'DURGA_PUJA'
  | 'EID_UL_FITR'
  | 'EID_UL_ADHA'
  | 'POHELA_BOISHAKH'
  | 'SCHOOL_ADMISSION';

export interface FestivalEvent {
  id: string;
  season: FestivalSeason;
  name: string;
  nameBn: string;
  estimatedDate: string; // e.g. '2027-03-10'
  daysAhead: number; // e.g. ~88 days
  isMoonDependent: boolean;
  typicalCostDefault: number;
  description: string;
  descriptionBn: string;
  bonusExpectedDaysBefore: number;
}

export interface FestivalSpendingItem {
  category: string;
  categoryBn: string;
  amount: number;
  timingDaysBefore: number;
  notes: string;
}

export interface UtsobShieldProfile {
  festivalId: string;
  festivalName: string;
  festivalNameBn: string;
  daysUntilFestival: number;
  totalEstimatedCost: number;
  expectedBonusAmount: number;
  bonusArrivalDaysBefore: number;
  spendingBreakdown: FestivalSpendingItem[];
  dailyPocketAmount: number; // e.g. ৳210/day
  weeklyPocketAmount: number; // e.g. ৳1,470/week
  deficitWithoutShield: number;
  deficitWithShield: number;
  shieldActive: boolean;
  accumulatedInPocket: number;
}

export interface UtsobProjectionPoint {
  dayOffset: number;
  date: string;
  dayLabel: string;
  unshieldedBalance: number;
  shieldedBalance: number;
  pocketAccumulation: number;
  eventFlag?: string;
  isEidValley: boolean;
}

export interface QurbaniSharePlan {
  shareType: 'ONE_SEVENTH_COW' | 'FULL_GOAT' | 'FULL_COW' | 'PREMIUM_BULL';
  shareTypeBn: string;
  animalCost: number;
  hasilAndTransportFee: number;
  butcherAndProcessingFee: number;
  totalTarget: number;
  currentSaved: number;
  weeksRemaining: number;
  weeklyTarget: number;
  dailyTarget: number;
  participants: { name: string; shareRatio: number; paid: number }[];
  qrMerchantReady: boolean;
}

/**
 * 'Shekor' (শেকড়) — Seasonal Income Equalizer & Micro-Vault
 * For farmers, fishermen, and seasonal gig workers with bumper harvests and dry seasons (Monga)
 */
export interface ShekorProfile {
  customerId: string;
  isSeasonalWorker: boolean;
  occupation: 'Farmer' | 'Seasonal Gig Worker' | 'Fisherman' | 'Day Laborer';
  occupationBn: string;
  seasonalInflowMonths: number[]; // e.g., [5, 11] (May for Boro, Nov for Aman)
  seasonalHarvestNames: string[];
  estimatedAnnualIncome: number; // e.g. ৳1,50,000 bumper harvest
  fixedAnnualObligations: number; // DPS, loan repayments e.g. ৳18,000
  emergencyBufferRatio: number; // Default 0.10 (10%)
  currentVaultBalance: number;
  virtualDailyAllowance: number; // VDA in BDT
  virtualWeeklySalary: number; // VDA * 7 in BDT
  annualInterestEarned: number; // UCB Micro-Vault interest (7.25% p.a.)
  nextSundayPayoutDate: string;
  isVaultActive: boolean;
  totalDisbursedSoFar: number;
}

export interface ShekorSimulationPoint {
  monthOffset: number;
  monthName: string;
  monthNameBn: string;
  seasonType: 'HARVEST_SURGE' | 'LEAN_PERIOD' | 'MONGA_DEFICIT';
  seasonTypeBn: string;
  unmanagedBalance: number; // Rapid burnout by Month 3 -> zero cliff
  shekorManagedBalance: number; // Steady, smoothed balance
  weeklySalaryDisbursed: number; // e.g. ৳2,650 every Sunday
  vaultInterestAccrued: number;
  isMongaPeriod: boolean;
}

export interface ShekorVaultPlan {
  annualInflow: number;
  fixedObligations: number;
  bufferAmount: number;
  distributablePool: number;
  virtualDailyAllowance: number;
  weeklySundaySalary: number;
  projectedAnnualYield: number;
  runwayMonths: number;
  payoutSchedule: { weekNumber: number; date: string; amount: number; status: 'DISBURSED' | 'SCHEDULED' }[];
}

