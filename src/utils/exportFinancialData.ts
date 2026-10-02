import {
  Customer,
  CustomerFinancialProfile,
  Transaction,
  SpendingAnomaly,
  ShortageRisk,
  CashFlowForecast,
} from '../types/financial';

interface ExportDataParams {
  customer: Customer;
  profile: CustomerFinancialProfile;
  transactions: Transaction[];
  anomalies: SpendingAnomaly[];
  risk: ShortageRisk;
  forecast?: CashFlowForecast;
  lang?: 'en' | 'bn';
}

/**
 * Escapes CSV cell value according to RFC 4180
 */
const escapeCSV = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
};

/**
 * Generates and downloads a monthly financial data CSV report
 */
export const exportMonthlyFinancialDataCSV = ({
  customer,
  profile,
  transactions,
  anomalies,
  risk,
  forecast,
  lang = 'en',
}: ExportDataParams): { success: boolean; filename: string } => {
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = `upay_monthly_financial_report_${customer.customer_id}_${currentDate}.csv`;

  const rows: string[] = [];

  // UTF-8 BOM for Microsoft Excel / Google Sheets compatibility
  rows.push('UPAY DIGITAL FINANCIAL SERVICES — MONTHLY FINANCIAL STATEMENT');
  rows.push(`Export Date,${escapeCSV(currentDate)}`);
  rows.push(`Customer ID,${escapeCSV(customer.customer_id)}`);
  rows.push(`Customer Name,${escapeCSV(customer.name)}`);
  rows.push(`Occupation,${escapeCSV(customer.occupation)}`);
  rows.push(`Location,${escapeCSV(customer.location)}`);
  rows.push(`Financial Cluster,${escapeCSV(customer.financial_profile)}`);
  rows.push(`Reporting Cycle,${escapeCSV('October 2026 (Monthly Active Cycle)')}`);
  rows.push('');

  // 1. Financial Summaries Section
  const monthEndBalance = forecast?.monthEndForecast ?? profile.averageMonthEndBalance;
  const discretionaryPct = Math.round(profile.discretionarySpendingRatio * 100);
  const essentialPct = 100 - discretionaryPct;

  rows.push('--- SECTION 1: MONTHLY FINANCIAL SUMMARY METRICS ---');
  rows.push(['Metric', 'Value', 'Unit / Currency', 'Status / Notes'].map(escapeCSV).join(','));
  rows.push(['Monthly Inflow (Income)', profile.monthlyIncome, 'BDT', 'Verified regular income'].map(escapeCSV).join(','));
  rows.push(['Current Liquid Balance', profile.currentBalance, 'BDT', 'Active wallet balance'].map(escapeCSV).join(','));
  rows.push(['Total Monthly Spending', profile.averageMonthlySpending, 'BDT', 'Cumulative monthly outflow'].map(escapeCSV).join(','));
  rows.push(['Average Daily Spending Velocity', profile.averageDailySpending.toFixed(2), 'BDT / day', 'Daily run rate'].map(escapeCSV).join(','));
  rows.push(['Days Until Next Income', profile.daysUntilNextIncome, 'Days', 'Calculated payroll arrival'].map(escapeCSV).join(','));
  rows.push(['Projected Month-End Balance', monthEndBalance, 'BDT', 'Deterministic cash-flow forecast'].map(escapeCSV).join(','));
  rows.push(['Shortage Risk Probability', `${Math.round(risk.probability * 100)}%`, '%', risk.riskLevel === 'HIGH' ? 'High Shortage Risk' : 'Moderate / Low Risk'].map(escapeCSV).join(','));
  rows.push(['Essential Expenses Ratio', `${essentialPct}%`, '%', 'Non-discretionary commitments'].map(escapeCSV).join(','));
  rows.push(['Discretionary Expenses Ratio', `${discretionaryPct}%`, '%', 'Lifestyle and flexible spending'].map(escapeCSV).join(','));
  rows.push(['Savings Rate', `${Math.round(profile.savingsRate * 100)}%`, '%', 'Net savings retained'].map(escapeCSV).join(','));
  rows.push(['Spending Volatility Level', profile.spendingVolatility, 'Rating', 'Variability of day-to-day spending'].map(escapeCSV).join(','));
  rows.push('');

  // 2. Category Spending Breakdown
  rows.push('--- SECTION 2: MONTHLY CATEGORY SPENDING BREAKDOWN ---');
  rows.push(['Category', 'Current Month Spend (BDT)', 'Normal Benchmark (BDT)', 'Variance (%)', 'Is Anomaly Flagged'].map(escapeCSV).join(','));
  if (anomalies && anomalies.length > 0) {
    anomalies.forEach((a) => {
      rows.push([
        a.category,
        a.currentSpending,
        a.normalSpending,
        `${a.percentageChange > 0 ? '+' : ''}${a.percentageChange.toFixed(1)}%`,
        a.isAnomaly ? 'YES' : 'NO',
      ].map(escapeCSV).join(','));
    });
  } else {
    rows.push(['No category breakdown available', '0', '0', '0%', 'NO'].map(escapeCSV).join(','));
  }
  rows.push('');

  // 3. Itemized Monthly Transactions
  rows.push('--- SECTION 3: ITEMIZED MONTHLY TRANSACTIONS LEDGER ---');
  rows.push([
    'Timestamp',
    'Transaction ID',
    'Type',
    'Category',
    'Merchant / Counterparty',
    'Channel',
    'Amount (BDT)',
    'Balance After (BDT)',
  ].map(escapeCSV).join(','));

  if (transactions && transactions.length > 0) {
    transactions.forEach((tx) => {
      rows.push([
        tx.timestamp,
        tx.transaction_id,
        tx.transaction_type,
        tx.category,
        tx.merchant_name || tx.note || 'N/A',
        tx.channel,
        tx.amount,
        tx.balance_after,
      ].map(escapeCSV).join(','));
    });
  } else {
    rows.push(['No transactions recorded for this cycle', '-', '-', '-', '-', '-', '0', '0'].map(escapeCSV).join(','));
  }

  // Combine with UTF-8 BOM
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Browser download trigger
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename };
};
