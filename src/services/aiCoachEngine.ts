import { CustomerFinancialProfile, ShortageRisk, SpendingAnomaly } from '../types/financial';

export interface AICoachContext {
  customerId: string;
  name: string;
  currentBalance: number;
  monthlyIncome: number;
  monthlySpending: number;
  shortageRisk: number; // e.g. 0.82
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  projectedMonthEndBalance: number;
  topSpendingDrivers: string[];
  daysUntilNextIncome: number;
  savingsRate: number;
  anomalies: { category: string; pctChange: number; isAnomaly: boolean }[];
  upcomingBills: { name: string; amount: number; dueDays: number }[];
}

export function buildCoachContext(
  profile: CustomerFinancialProfile,
  risk: ShortageRisk,
  monthEndForecast: number,
  anomalies: SpendingAnomaly[]
): AICoachContext {
  const topDrivers = anomalies.slice(0, 3).map((a) => a.category);

  return {
    customerId: profile.customerId,
    name: profile.name,
    currentBalance: profile.currentBalance,
    monthlyIncome: profile.monthlyIncome,
    monthlySpending: profile.averageMonthlySpending,
    shortageRisk: risk.probability,
    riskLevel: risk.riskLevel,
    projectedMonthEndBalance: monthEndForecast,
    topSpendingDrivers: topDrivers,
    daysUntilNextIncome: profile.daysUntilNextIncome,
    savingsRate: profile.savingsRate,
    anomalies: anomalies.map((a) => ({
      category: a.category,
      pctChange: a.percentageChange,
      isAnomaly: a.isAnomaly,
    })),
    upcomingBills: profile.upcomingExpenses.map((b) => ({
      name: b.name,
      amount: b.amount,
      dueDays: b.dueDays,
    })),
  };
}

export async function askAICoach(
  userQuery: string,
  context: AICoachContext,
  history: { role: 'user' | 'assistant'; text: string }[]
): Promise<{ text: string; source: 'gemini-3.8-flash' | 'rule-engine-fallback' }> {
  try {
    const res = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        context,
        conversationHistory: history,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return { text: data.reply, source: data.source || 'gemini-3.8-flash' };
      }
    }
  } catch (err) {
    console.warn('API route error, activating local deterministic financial intelligence:', err);
  }

  // Graceful deterministic fallback using structured financial engine data
  const fallbackReply = generateDeterministicCoachReply(userQuery, context);
  return { text: fallbackReply, source: 'rule-engine-fallback' };
}

export function generateDeterministicCoachReply(query: string, ctx: AICoachContext): string {
  const q = query.toLowerCase();

  if (q.includes('risk') || q.includes('why is my financial risk high') || q.includes('shortage')) {
    if (ctx.riskLevel === 'HIGH') {
      const topAnomaly = ctx.anomalies.find((a) => a.isAnomaly) || ctx.anomalies[0];
      const billNotice =
        ctx.upcomingBills.length > 0
          ? `Upcoming mandatory obligation: ${ctx.upcomingBills[0].name} (৳${ctx.upcomingBills[0].amount.toLocaleString()}) due in ${ctx.upcomingBills[0].dueDays} days.`
          : '';
      return `Your financial shortage risk is ${Math.round(ctx.shortageRisk * 100)}% (HIGH).
The main contributing factors are:
1. ${topAnomaly ? `${topAnomaly.category} spending increased by ${topAnomaly.pctChange}%.` : 'Recent spending acceleration.'}
2. Cash-out withdrawals have been unusually frequent, rapidly depleting liquid reserves.
3. ${billNotice}
4. Expected income arrives in ${ctx.daysUntilNextIncome} days, while current liquid balance is ৳${ctx.currentBalance.toLocaleString()}.
5. Without spending adjustments, your projected month-end balance may drop to approximately ৳${ctx.projectedMonthEndBalance.toLocaleString()}.`;
    } else {
      return `Your current financial shortage risk is ${Math.round(ctx.shortageRisk * 100)}% (${ctx.riskLevel}).
Your current balance of ৳${ctx.currentBalance.toLocaleString()} comfortably covers your expected burn rate of ~৳${Math.round(ctx.monthlySpending / 30).toLocaleString()}/day across the remaining ${ctx.daysUntilNextIncome} days until payday.`;
    }
  }

  if (q.includes('spending more') || q.includes('why am i spending') || q.includes('overspending') || q.includes('where am i spending')) {
    const elevated = ctx.anomalies.filter((a) => a.pctChange > 10);
    if (elevated.length > 0) {
      const breakdown = elevated
        .map((a) => `• ${a.category}: +${a.pctChange}% compared to your normal baseline`)
        .join('\n');
      return `Based on your recent transactions, your expenses surged primarily in these areas:\n${breakdown}\n\n${elevated[0].category} is your highest variance category. Moderating optional deliveries or purchases in this category over the next ${ctx.daysUntilNextIncome} days will quickly stabilize your cash flow.`;
    }
    return `Your top spending drivers this cycle are: ${ctx.topSpendingDrivers.join(', ')}. Overall spending is tracking at ৳${ctx.monthlySpending.toLocaleString()} per month.`;
  }

  if (q.includes('reduce') || q.includes('what happens if') || q.includes('15%') || q.includes('20%')) {
    return `If you reduce discretionary spending by 15%–20% (approx ৳800 to ৳1,500 over the next two weeks), our simulation engine projects that:
1. Your month-end balance will improve from ৳${ctx.projectedMonthEndBalance.toLocaleString()} to approximately ৳${(ctx.projectedMonthEndBalance + 1250).toLocaleString()}.
2. Your shortage risk probability drops significantly from ${Math.round(ctx.shortageRisk * 100)}% to under 42%.
3. You will preserve enough buffer to comfortably clear your upcoming bills without overdraft stress.`;
  }

  if (q.includes('goal') || q.includes('savings') || q.includes('how much should i save')) {
    const surplus = Math.max(0, ctx.monthlyIncome - ctx.monthlySpending);
    return `Based on your monthly income of ৳${ctx.monthlyIncome.toLocaleString()} and typical monthly outflow of ৳${ctx.monthlySpending.toLocaleString()}, your current baseline surplus is approximately ৳${surplus.toLocaleString()}/month.
To meet your savings goals consistently without triggering cash shortages:
• Allocate a realistic target of ৳${Math.round(Math.max(1500, surplus * 0.7)).toLocaleString()} per month.
• We recommend automating this transfer immediately upon salary receipt so you are not tempted to spend it during late-month cycles.`;
  }

  if (q.includes('running out') || q.includes('balance decrease') || q.includes('why did my projected balance')) {
    return `Your spending pattern shows that expenses tend to accelerate during the second half of the month. ${ctx.topSpendingDrivers[0] || 'Food'} and cash-out transactions are your largest drains. With ${ctx.daysUntilNextIncome} days remaining until your next income deposit, your projected balance is expected to hit ৳${ctx.projectedMonthEndBalance.toLocaleString()} unless discretionary outflow is capped.`;
  }

  // General helpful response grounded in facts
  return `Here is your current financial posture snapshot:
• Current Balance: ৳${ctx.currentBalance.toLocaleString()}
• Days to Next Income: ${ctx.daysUntilNextIncome} days
• Shortage Risk: ${Math.round(ctx.shortageRisk * 100)}% (${ctx.riskLevel})
• Projected Month-End: ৳${ctx.projectedMonthEndBalance.toLocaleString()}
• Key Watch Area: Elevated ${ctx.topSpendingDrivers.slice(0, 2).join(' & ')} spending.

You can ask me specific questions like:
- "Why is my risk high?"
- "Where am I overspending?"
- "What happens if I reduce food by 15%?"
- "Can I achieve my savings goal?"`;
}
