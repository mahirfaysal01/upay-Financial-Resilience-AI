import {
  CustomerFinancialProfile,
  GoalPlanningAnalysis,
  SavingsGoal,
} from '../types/financial';
import { SYNTHETIC_SAVINGS_GOALS } from '../data/syntheticData';

export function getCustomerSavingsGoals(customerId: string): SavingsGoal[] {
  return SYNTHETIC_SAVINGS_GOALS[customerId] || [];
}

export function analyzeSavingsGoal(
  goal: SavingsGoal,
  profile: CustomerFinancialProfile,
  customDeadlineMonths?: number,
  customMonthlySaving?: number
): GoalPlanningAnalysis {
  const remainingAmount = Math.max(0, goal.target_amount - goal.current_amount);

  // Calculate months remaining
  let monthsRemaining = 6;
  if (customDeadlineMonths !== undefined && customDeadlineMonths > 0) {
    monthsRemaining = customDeadlineMonths;
  } else if (goal.deadline) {
    const today = new Date('2026-10-01');
    const deadlineDate = new Date(goal.deadline);
    const diffMonths =
      (deadlineDate.getFullYear() - today.getFullYear()) * 12 +
      (deadlineDate.getMonth() - today.getMonth());
    monthsRemaining = Math.max(1, diffMonths);
  }

  // Required monthly savings to hit target by deadline
  const requiredMonthlySaving =
    customMonthlySaving !== undefined
      ? customMonthlySaving
      : Math.ceil(remainingAmount / monthsRemaining);

  // Current monthly surplus = income - average expenses
  const currentMonthlySurplus = Math.max(
    0,
    profile.monthlyIncome - profile.averageMonthlySpending
  );

  let feasibility: GoalPlanningAnalysis['feasibility'] = 'ACHIEVABLE';
  const surplusCoverageRatio = currentMonthlySurplus / (requiredMonthlySaving || 1);

  if (surplusCoverageRatio >= 1.5) {
    feasibility = 'HIGHLY_ACHIEVABLE';
  } else if (surplusCoverageRatio >= 0.95) {
    feasibility = 'ACHIEVABLE';
  } else if (surplusCoverageRatio >= 0.6) {
    feasibility = 'STRETCH';
  } else {
    feasibility = 'AT_RISK';
  }

  // Projected completion date
  const projectedMonthsNeeded =
    currentMonthlySurplus > 0
      ? Math.ceil(remainingAmount / Math.min(requiredMonthlySaving, currentMonthlySurplus))
      : 24;

  const targetDate = new Date('2026-10-01');
  targetDate.setMonth(targetDate.getMonth() + projectedMonthsNeeded);
  const projectedCompletionDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const recommendedActions: string[] = [];
  if (feasibility === 'AT_RISK') {
    recommendedActions.push(
      `Current monthly surplus (৳${currentMonthlySurplus.toLocaleString()}) is below required savings (৳${requiredMonthlySaving.toLocaleString()}).`
    );
    recommendedActions.push(
      `Consider extending deadline by ${Math.ceil(monthsRemaining * 1.5)} months or reallocating ৳${Math.round((requiredMonthlySaving - currentMonthlySurplus)).toLocaleString()} from discretionary dining & shopping.`
    );
  } else if (feasibility === 'STRETCH') {
    recommendedActions.push(
      `Achievable if discretionary spending is curtailed by ~৳${Math.round((requiredMonthlySaving - currentMonthlySurplus)).toLocaleString()} each month.`
    );
    recommendedActions.push('Enable upay Auto-Save lock upon every salary deposit.');
  } else {
    recommendedActions.push(
      `On track! Setting aside ৳${requiredMonthlySaving.toLocaleString()} monthly preserves a safe buffer.`
    );
    recommendedActions.push('Automate monthly deduction to stay disciplined without manual effort.');
  }

  return {
    goal,
    remainingAmount,
    monthsRemaining,
    requiredMonthlySaving,
    currentMonthlySurplus,
    feasibility,
    recommendedActions,
    projectedCompletionDate,
  };
}
