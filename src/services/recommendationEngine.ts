import {
  CustomerFinancialProfile,
  Recommendation,
  ShortageRisk,
  SpendingAnomaly,
} from '../types/financial';

export function generateRecommendations(
  profile: CustomerFinancialProfile,
  risk: ShortageRisk,
  anomalies: SpendingAnomaly[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const foodAnomaly = anomalies.find((a) => a.category === 'Food' && a.isAnomaly);
  const shoppingAnomaly = anomalies.find((a) => a.category === 'Shopping' && a.isAnomaly);
  const cashOutAnomaly = anomalies.find((a) => a.category === 'Cash-out');

  // Rule 1: Food surge mitigation
  if (foodAnomaly || profile.foodSpendingRatio > 0.28) {
    const suggestedReduction = Math.round((foodAnomaly ? foodAnomaly.difference * 0.5 : 800));
    recommendations.push({
      id: 'rec_food',
      type: 'DISCRETIONARY_REDUCTION',
      priority: 'HIGH',
      title: 'Curtail Dining & Food Delivery Spikes',
      explanation: `Your food spending is currently ${foodAnomaly ? foodAnomaly.percentageChange + '%' : '32%'} above your historical baseline. Reducing restaurant delivery can conserve critical liquidity.`,
      actionText: `Aim to reduce food spending by approx ৳${suggestedReduction.toLocaleString()} over the next 10 days.`,
      quantifiedImpact: `Preserves ৳${suggestedReduction.toLocaleString()} and lifts projected month-end balance to ৳${(profile.averageMonthEndBalance + suggestedReduction).toLocaleString()}.`,
      savingsEstimated: suggestedReduction,
      projectedNewRisk: Math.max(0.2, risk.probability - 0.22),
      projectedNewMonthEndBalance: profile.averageMonthEndBalance + suggestedReduction,
    });
  }

  // Rule 2: Weekly Spending Guardrail
  if (risk.riskLevel === 'HIGH' || risk.riskLevel === 'MODERATE') {
    const safeDaily = Math.max(300, Math.floor((profile.currentBalance - 2500) / (profile.daysUntilNextIncome || 1)));
    const safeWeekly = safeDaily * 7;
    recommendations.push({
      id: 'rec_weekly_limit',
      type: 'WEEKLY_LIMIT',
      priority: 'HIGH',
      title: 'Set a Dynamic Weekly Spending Limit',
      explanation: `With ${profile.daysUntilNextIncome} days until your next income cycle, capping non-essential spending at ৳${safeWeekly.toLocaleString()}/week avoids dipping below safe thresholds.`,
      actionText: `Enable a ৳${safeWeekly.toLocaleString()}/week soft alert inside your upay wallet settings.`,
      quantifiedImpact: `Prevents an estimated ৳1,400 in impulse transactions before payday.`,
      savingsEstimated: 1400,
      projectedNewRisk: Math.max(0.18, risk.probability - 0.28),
      projectedNewMonthEndBalance: profile.averageMonthEndBalance + 1400,
    });
  }

  // Rule 3: Cash-out dependency and agent fee reduction
  if (profile.cashOutRatio > 0.2 || (cashOutAnomaly && cashOutAnomaly.currentSpending > 4000)) {
    const feeSavings = Math.round(profile.cashOutRatio * profile.averageMonthlySpending * 0.015);
    recommendations.push({
      id: 'rec_cash_out',
      type: 'CASH_OUT_ALTERNATIVE',
      priority: 'MEDIUM',
      title: 'Switch to Direct QR & In-App Merchant Payments',
      explanation: `You have made frequent cash-outs recently (${Math.round(profile.cashOutRatio * 100)}% of wallet turnover). Paying directly via upay QR or direct bill pay eliminates agent fees and prevents unmonitored cash loss.`,
      actionText: 'Use upay QR at partner grocery & retail outlets instead of withdrawing physical currency.',
      quantifiedImpact: `Avoids ~৳${(feeSavings + 600).toLocaleString()} in withdrawal fees and cash slippage.`,
      savingsEstimated: feeSavings + 600,
      projectedNewRisk: Math.max(0.15, risk.probability - 0.12),
      projectedNewMonthEndBalance: profile.averageMonthEndBalance + (feeSavings + 600),
    });
  }

  // Rule 4: Shopping / Discretionary postponement
  if (shoppingAnomaly || profile.discretionarySpendingRatio > 0.22) {
    recommendations.push({
      id: 'rec_shopping',
      type: 'DISCRETIONARY_REDUCTION',
      priority: 'MEDIUM',
      title: 'Postpone Non-Essential Shopping Purchases',
      explanation: 'Discretionary shopping items detected in recent days. Deferring optional apparel or gadget upgrades until after the salary date protects essential funds.',
      actionText: 'Apply a 48-hour cooling-off pause before confirming non-essential shopping carts.',
      quantifiedImpact: 'Saves approximately ৳1,800 to ৳3,000 this month.',
      savingsEstimated: 2200,
      projectedNewRisk: Math.max(0.15, risk.probability - 0.25),
      projectedNewMonthEndBalance: profile.averageMonthEndBalance + 2200,
    });
  }

  // Rule 5: Upcoming bill preparedness
  if (profile.upcomingExpenses.length > 0) {
    const billTotal = profile.upcomingExpenses.reduce((sum, b) => sum + b.amount, 0);
    recommendations.push({
      id: 'rec_bills',
      type: 'BILL_PREPAREDNESS',
      priority: 'HIGH',
      title: 'Pre-allocate Funds for Upcoming Utility Bills',
      explanation: `You have ৳${billTotal.toLocaleString()} in mandatory bills due before your next income date. Earmarking these funds prevents accidental overdraft.`,
      actionText: 'Lock bill funds in your upay bills reserve pocket to ensure on-time payment without late charges.',
      quantifiedImpact: 'Eliminates late fees and prevents unexpected balance depletion.',
      savingsEstimated: 350,
      projectedNewRisk: Math.max(0.1, risk.probability - 0.1),
      projectedNewMonthEndBalance: profile.averageMonthEndBalance + 350,
    });
  }

  return recommendations;
}
