import {
  ShekorProfile,
  ShekorSimulationPoint,
  ShekorVaultPlan,
  CustomerFinancialProfile,
} from '../types/financial';

/**
 * UCB Micro-Vault Annual Interest Rate for Rural Seasonal Workers
 * 7.25% per annum credited daily to the farmer's liquid float
 */
export const UCB_VAULT_ANNUAL_INTEREST_RATE = 0.0725;

/**
 * Benchmark rural seasonal personas
 */
export const BENCHMARK_SHEKOR_PROFILES: Record<string, ShekorProfile> = {
  C008: {
    customerId: 'C008',
    isSeasonalWorker: true,
    occupation: 'Farmer',
    occupationBn: 'বোরো ও আমন ধান চাষী (রংপুর অঞ্চল)',
    seasonalInflowMonths: [5, 11], // Baishakh (May) and Aghrahayan (Nov)
    seasonalHarvestNames: ['বোরো ধান তোলার মৌসুম (বৈশাখ/মে)', 'আমন ধান তোলার মৌসুম (অগ্রহায়ণ/নভেম্বর)'],
    estimatedAnnualIncome: 150000,
    fixedAnnualObligations: 18000, // DPS + krishi loan installments
    emergencyBufferRatio: 0.10, // 10% safety cushion
    currentVaultBalance: 98400,
    virtualDailyAllowance: 325,
    virtualWeeklySalary: 2275,
    annualInterestEarned: 5420,
    nextSundayPayoutDate: 'আসন্ন রবিবার',
    isVaultActive: true,
    totalDisbursedSoFar: 33600,
  },
  C009: {
    customerId: 'C009',
    isSeasonalWorker: true,
    occupation: 'Fisherman',
    occupationBn: 'মেঘনা নদীর ইলিশ জেলে (চাঁদপুর অঞ্চল)',
    seasonalInflowMonths: [8, 9], // Bhadra-Ashwin (Aug-Sep Peak Hilsa)
    seasonalHarvestNames: ['ভাদ্র-আশ্বিন রূপালী ইলিশ ধরার প্রধান মৌসুম'],
    estimatedAnnualIncome: 180000,
    fixedAnnualObligations: 24000, // Boat leasing + engine installment
    emergencyBufferRatio: 0.12,
    currentVaultBalance: 122000,
    virtualDailyAllowance: 380,
    virtualWeeklySalary: 2660,
    annualInterestEarned: 6850,
    nextSundayPayoutDate: 'আসন্ন রবিবার',
    isVaultActive: true,
    totalDisbursedSoFar: 34000,
  },
};

/**
 * Calculates the Virtual Daily Allowance (VDA) and Vault Partition
 * Formula:
 * VDA = ((Total Inflow - Fixed Obligations) / 365) * (1 - BufferRatio)
 */
export function calculateShekorVaultPlan(
  annualInflow: number = 150000,
  fixedObligations: number = 18000,
  emergencyBufferRatio: number = 0.10
): ShekorVaultPlan {
  const netAfterObligations = Math.max(0, annualInflow - fixedObligations);
  const bufferAmount = Math.round(netAfterObligations * emergencyBufferRatio);
  const distributablePool = Math.max(0, netAfterObligations - bufferAmount);

  // Daily and weekly payouts
  const virtualDailyAllowance = Math.round(distributablePool / 365);
  const weeklySundaySalary = Math.round(virtualDailyAllowance * 7);

  // Compound interest on average held float (~50% average float over 12 months)
  const averageFloat = distributablePool * 0.52;
  const projectedAnnualYield = Math.round(averageFloat * UCB_VAULT_ANNUAL_INTEREST_RATE);

  const runwayMonths = 12;

  // Generate 52-week disbursement schedule preview
  const payoutSchedule = [];
  const now = new Date();
  for (let w = 1; w <= 52; w++) {
    const payDate = new Date(now.getTime() + w * 7 * 24 * 60 * 60 * 1000);
    payoutSchedule.push({
      weekNumber: w,
      date: payDate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }),
      amount: weeklySundaySalary,
      status: (w <= 12 ? 'DISBURSED' : 'SCHEDULED') as 'DISBURSED' | 'SCHEDULED',
    });
  }

  return {
    annualInflow,
    fixedObligations,
    bufferAmount,
    distributablePool,
    virtualDailyAllowance,
    weeklySundaySalary,
    projectedAnnualYield,
    runwayMonths,
    payoutSchedule,
  };
}

/**
 * Detects if a customer has experienced a sudden seasonal harvest inflow
 */
export function detectIncomeSpike(
  profile: CustomerFinancialProfile,
  latestTransactionAmount?: number
): { isSpike: boolean; multiplier: number; detectedHarvestType?: string } {
  const rollingAverage = profile.averageMonthlySpending || 15000;
  const deposit = latestTransactionAmount || profile.monthlyIncome;

  const multiplier = deposit / (rollingAverage || 1);
  if (multiplier >= 2.5) {
    return {
      isSpike: true,
      multiplier: parseFloat(multiplier.toFixed(1)),
      detectedHarvestType: 'বোরো/আমন ধান বা মৌসুমি ফসল বিক্রয়ের এককালীন অর্থ',
    };
  }
  return { isSpike: false, multiplier: 1.0 };
}

/**
 * 365-Day / 12-Month Monga Season Cash Flow Simulation
 * Demonstrates the contrast between the classic "Crash at Month 3" vs "Shekor 52-Week Stability"
 */
export function generateShekor12MonthSimulation(
  annualHarvestInflow: number = 150000,
  isVaultActive: boolean = true,
  emergencyBufferRatio: number = 0.10,
  fixedObligations: number = 18000
): {
  points: ShekorSimulationPoint[];
  unmanagedZeroMonth: number;
  totalInterestEarned: number;
  totalDisbursed: number;
  mongaDeficitPrevented: number;
} {
  const plan = calculateShekorVaultPlan(annualHarvestInflow, fixedObligations, emergencyBufferRatio);
  const points: ShekorSimulationPoint[] = [];

  const monthNamesBn = [
    'বৈশাখ (মে - ধান কাটা)',
    'জ্যৈষ্ঠ (জুন)',
    'আষাঢ় (জুলাই)',
    'শ্রাবণ (আগস্ট)',
    'ভাদ্র (সেপ্টেম্বর)',
    'আশ্বিন (অক্টোবর - মঙ্গা শুরু)',
    'কার্তিক (নভেম্বর - তীব্র মঙ্গা)',
    'অগ্রহায়ণ (ডিসেম্বর - আমন)',
    'পৌষ (জানুয়ারি)',
    'মাঘ (ফেব্রুয়ারি)',
    'ফাল্গুন (মার্চ)',
    'চৈত্র (এপ্রিল - অফ-সিজন)',
  ];

  // Unmanaged behavior:
  // Farmer receives ৳150,000. In months 1-3, heavy discretionary spend + loan payback happens.
  // By Month 5-6 (Ashwin/Kartik - Monga), cash drops to 0, forcing high-interest Mohajon borrowing!
  let unmanagedRunning = annualHarvestInflow;
  let vaultRunning = plan.distributablePool;
  let cumulativeInterest = 0;
  let cumulativeDisbursed = 0;
  let unmanagedZeroMonth = 5;

  const monthlyUnmanagedBurn = [
    52000, // Month 1: Equipment, debt payment, celebrations
    38000, // Month 2: Family shopping, repairs
    28000, // Month 3: Fertilizer, regular spend
    18000, // Month 4: Remaining depleted
    14000, // Month 5: Crashes below zero! (Borrowed at 10% monthly)
    12000, // Month 6: Deep Monga deficit (-৳24,000)
    10000, // Month 7: Acute deficit
    35000, // Month 8: Minor Aman harvest inflow (+৳35,000)
    18000, // Month 9: Absorbed by debt
    12000, // Month 10: Off-season
    11000, // Month 11: Off-season
    10000, // Month 12: Pre-harvest pinch
  ];

  for (let m = 0; m < 12; m++) {
    const isMonga = m === 5 || m === 6; // Ashwin and Kartik
    const isHarvest = m === 0 || m === 7;

    // Unmanaged curve
    if (m === 7) {
      unmanagedRunning += 35000; // Small Aman bump
    }
    unmanagedRunning = Math.max(-32000, unmanagedRunning - monthlyUnmanagedBurn[m]);
    if (unmanagedRunning <= 0 && unmanagedZeroMonth === 5 && m >= 4) {
      unmanagedZeroMonth = m + 1;
    }

    // Shekor managed curve:
    // Every month, 4.33 weeks of salary are safely distributed
    const monthlyPayout = Math.round(plan.weeklySundaySalary * 4.33);
    const monthlyInterest = isVaultActive
      ? Math.round(vaultRunning * (UCB_VAULT_ANNUAL_INTEREST_RATE / 12))
      : 0;

    cumulativeInterest += monthlyInterest;
    cumulativeDisbursed += monthlyPayout;

    if (isVaultActive) {
      vaultRunning = Math.max(0, vaultRunning - monthlyPayout + monthlyInterest);
    }

    // Shekor wallet has steady, positive liquidity + buffer
    const walletLiquidBalance = isVaultActive
      ? Math.round(monthlyPayout * 1.15 + (isMonga ? 1500 : 3000))
      : Math.max(0, unmanagedRunning);

    points.push({
      monthOffset: m + 1,
      monthName: `Month ${m + 1}`,
      monthNameBn: monthNamesBn[m],
      seasonType: isHarvest ? 'HARVEST_SURGE' : isMonga ? 'MONGA_DEFICIT' : 'LEAN_PERIOD',
      seasonTypeBn: isHarvest ? 'বাম্পার ফসল তোলা' : isMonga ? 'তীব্র মঙ্গা (খাদ্য সংকট)' : 'স্বাভাবিক মৌসুম',
      unmanagedBalance: Math.round(unmanagedRunning),
      shekorManagedBalance: walletLiquidBalance,
      weeklySalaryDisbursed: plan.weeklySundaySalary,
      vaultInterestAccrued: cumulativeInterest,
      isMongaPeriod: isMonga,
    });
  }

  return {
    points,
    unmanagedZeroMonth,
    totalInterestEarned: cumulativeInterest,
    totalDisbursed: cumulativeDisbursed,
    mongaDeficitPrevented: 32000,
  };
}
