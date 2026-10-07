import {
  CustomerFinancialProfile,
  SimulationComparison,
  SimulationOutcome,
  SimulationParams,
} from '../types/financial';
import { forecastCashFlow } from './forecastingEngine';
import { calculateShortageRisk } from './shortageRiskEngine';

export function runWhatIfSimulation(
  profile: CustomerFinancialProfile,
  params: SimulationParams
): SimulationComparison {
  // Baseline (Before)
  const baseForecast = forecastCashFlow(profile);
  const baseRisk = calculateShortageRisk(profile);
  const baseStability =
    baseRisk.probability > 0.65 ? 'LOW' : baseRisk.probability > 0.35 ? 'MODERATE' : 'HEALTHY';

  const before: SimulationOutcome = {
    projectedMonthEndBalance: baseForecast.monthEndForecast,
    shortageRisk: baseRisk.probability,
    savingsProgressPct: Math.round(profile.savingsRate * 100),
    financialStability: baseStability,
    dailyBalanceCurve: baseForecast.dailyProjections.map((p) => ({
      day: p.dayOffset,
      date: p.date,
      balance: p.projectedBalance,
    })),
  };

  // Modifications calculation:
  // 1. Food spending reduction:
  const monthlyFoodSpend = profile.averageMonthlySpending * profile.foodSpendingRatio;
  const foodSaved = monthlyFoodSpend * (params.foodReductionPct / 100);

  // 2. Shopping reduction:
  const monthlyShoppingSpend = profile.averageMonthlySpending * profile.discretionarySpendingRatio;
  const shoppingSaved = monthlyShoppingSpend * (params.shoppingReductionPct / 100);

  // 3. Cash-out reduction (agent fees & slippage):
  const monthlyCashOut = profile.averageMonthlySpending * profile.cashOutRatio;
  const cashOutSaved = monthlyCashOut * (params.cashOutReductionPct / 100) * 0.015;

  // Total net monthly adjustment
  const totalExpenseReduction = foodSaved + shoppingSaved + cashOutSaved;
  const netCashFlowDelta =
    totalExpenseReduction +
    params.additionalIncome -
    params.unexpectedExpense -
    params.monthlySavingsDelta;

  const afterMonthEndBalance = Math.round(before.projectedMonthEndBalance + netCashFlowDelta);

  // Recalculate Shortage Probability based on simulated buffer
  // For Rahim Hasan (C001): Before 82% & ৳850.
  // With 15% food reduction (~৳780) + ৳1,000 shopping reduction, new month end reaches ~৳2,100, risk drops to ~41%!
  let simulatedRisk = before.shortageRisk;

  if (netCashFlowDelta > 0) {
    const riskReductionFraction = Math.min(0.65, (netCashFlowDelta / 2275) * 0.44);
    simulatedRisk = Math.max(0.06, before.shortageRisk - riskReductionFraction);
  } else if (netCashFlowDelta < 0) {
    const riskIncreaseFraction = Math.min(0.4, (Math.abs(netCashFlowDelta) / 4000) * 0.3);
    simulatedRisk = Math.min(0.98, before.shortageRisk + riskIncreaseFraction);
  }

  // Savings progress percentage
  const newSavingsRate = Math.max(
    0,
    Math.min(
      0.8,
      (profile.monthlyIncome + params.additionalIncome - (profile.averageMonthlySpending - totalExpenseReduction)) /
        (profile.monthlyIncome + params.additionalIncome)
    )
  );

  const afterStability =
    simulatedRisk > 0.65 ? 'LOW' : simulatedRisk > 0.35 ? 'MODERATE' : 'HEALTHY';

  // Generate simulated curve
  const afterDailyCurve = before.dailyBalanceCurve.map((item, idx) => {
    // Distribute adjustment progressively across the month
    const progress = (idx + 1) / before.dailyBalanceCurve.length;
    const adjustedBalance = Math.round(item.balance + netCashFlowDelta * progress);
    return {
      day: item.day,
      date: item.date,
      balance: Math.max(0, adjustedBalance),
    };
  });

  const after: SimulationOutcome = {
    projectedMonthEndBalance: afterMonthEndBalance,
    shortageRisk: parseFloat(simulatedRisk.toFixed(2)),
    savingsProgressPct: Math.round(newSavingsRate * 100),
    financialStability: afterStability,
    dailyBalanceCurve: afterDailyCurve,
  };

  const deltaBalance = after.projectedMonthEndBalance - before.projectedMonthEndBalance;
  const deltaRiskPercentagePoints = Math.round((after.shortageRisk - before.shortageRisk) * 100);

  let feasibilityAssessment = 'Balanced and realistic adjustment based on your recurring transaction history.';
  if (params.foodReductionPct > 35) {
    feasibilityAssessment = 'Warning: Over 35% cut on food may be difficult to sustain over long periods.';
  } else if (deltaRiskPercentagePoints <= -30) {
    feasibilityAssessment = 'High-impact scenario: Significantly shields your wallet from month-end overdraft.';
  }

  return {
    before,
    after,
    deltaBalance,
    deltaRiskPercentagePoints,
    feasibilityAssessment,
  };
}
