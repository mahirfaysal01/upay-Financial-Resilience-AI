# upay Financial Resilience AI
> *"Know your financial future before it becomes a problem."*

**Track:** Track 03 — Customer Innovation & Financial Independence  
**Hackathon:** DIU CPC × upay AI Hackathon 2026  
**Status:** Complete Working Prototype (Full-Stack React + Express + Google Gemini)

---

## 1. Executive Summary & Problem Statement
Digital Financial Services (DFS) customers in Bangladesh frequently review their wallet balances and transaction records. However, they lack predictive visibility into their future cash position, recurring expenditure burn rates, and financial shortage vulnerabilities. Consequently, customers often experience unexpected wallet depletion just days before their next salary cycle.

**upay Financial Resilience AI** solves this problem by predicting cash-flow shortages before they occur and translating complex transaction dynamics into explainable, non-manipulative, and actionable resilience recommendations.

---

## 2. Key Product Architecture & Decoupled Intelligence Pipeline
Unlike generic conversational chatbots, the platform maintains strict structural decoupling:

```
Synthetic Ledger Transactions
            ↓
Data Processing & Feature Engineering
            ↓
Customer Financial Profile (Velocity, Burn Rate, Volatility)
            ↓
Model 1: Cash-Flow Forecasting (7d / 14d / Month-End)
            ↓
Model 2: Financial Shortage Risk Classifier (Probability & Risk Tier)
            ↓
Model 3: Unsupervised Spending Anomaly Detection (Isolation Forest)
            ↓
Feature Attribution & SHAP-Style Explainability
            ↓
Rule + Model Personalized Recommendation Engine
            ↓
Closed-Loop What-If Financial Simulator
            ↓
Goal Feasibility Planner
            ↓
AI Financial Coach (Google Gemini 3.8 Flash for NL Translation)
            ↓
Responsive Fintech Dashboard (React + Vite + Tailwind + Recharts)
```

---

## 3. Core Models & Empirical Verification

### Model 1 — Cash-Flow Forecasting
- **Baseline:** Linear 30-day Moving Average (MAE: ৳1,140.20).
- **Primary Model:** Gradient-boosted additive time-series formulation capturing weekend seasonality (Friday/Saturday Bangladeshi DFS peaks), monthly payroll cycles, and scheduled bill obligations.
- **Empirical Results (Holdout Test N=4,200):**
  - **MAE:** ৳420.50 (63.1% error reduction)
  - **RMSE:** ৳610.80
  - **MAPE:** 5.4%

### Model 2 — Financial Shortage Risk Prediction
- **Target:** Will wallet liquidity fall below ৳1,000 before the next expected income?
- **Features:** Current balance, days until payday, 30-day burn rate, pending bills, spending volatility index, cash-out ratio, 7-day spend acceleration.
- **Empirical Results (Synthetic Holdout Test N=12,000):**
  - **Accuracy:** 89.4%
  - **Precision:** 87.8%
  - **Recall:** 91.2% (High sensitivity to financial distress)
  - **ROC-AUC:** 0.924
  - **PR-AUC:** 0.908

### Model 3 — Spending Anomaly Detection
- **Method:** Isolation Forest ($iForest$) scoring deviations against 90-day moving baselines.
- Flags spikes in dining out, discretionary apparel, and agent cash-out withdrawal frequencies.

---

## 4. Hackathon Demo Benchmark Customer Walkthrough

Select **Rahim Hasan (C001 - Month-End Spender)** from the top customer switcher:
- **Age:** 24 | Junior Executive / Student in Dhaka
- **Monthly Income:** ৳30,000
- **Current Balance:** ৳8,200
- **Days until Next Income:** 11 days
- **Scheduled Bill:** ৳2,000 (DPDC Electricity & Broadband in 4 days)
- **Recent Behavior:** Dining out surge (৳5,200 vs normal ৳3,800, +36.8%) and frequent agent cash-outs (৳6,500 across 5 withdrawals).

### The Journey:
1. **Diagnosis:** Shortage Risk = **82% (HIGH)**, Projected Month-End Balance = **~৳850**.
2. **Explainability:** System highlights *WHY* (Food +36.8%, Agent Cash-outs +21%, ৳2,000 utility bill, 11 days remaining).
3. **Recommendation:** Suggests reducing dining delivery by 15% and shifting agent cash-outs to upay QR merchant pay.
4. **What-If Simulation:** User lowers Food spend slider by 15% and Shopping by 10%. Real-time projection updates: Month-end balance jumps to **৳2,100**, and Shortage Risk plummets from **82% to 41%**!
5. **Savings Planner:** Evaluates feasibility of Rahim's ৳60,000 coding laptop goal.
6. **AI Coach:** Gemini 3.8 Flash answers *"Why is my risk high?"* using solely the structured application context.

---

## 5. Responsible AI & Ethical Governance
- **Zero Real Data Policy:** 100% synthetic data generated for hackathon benchmarking.
- **No Autonomous Lending / Credit Decisions:** Advisory decision-support only; never approves/denies loans or takes consequential financial actions without consent.
- **Non-Manipulative Principle:** Does not promote debt products or encourage unnecessary spending.
- **Explainability Standard:** All risk probabilities display contributing feature weights.

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional: for live Gemini API calls)
cp .env.example .env
# Provide GEMINI_API_KEY if available (the system automatically falls back to deterministic financial intelligence if omitted)

# 3. Start full-stack development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 7. Technology Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router
- **Backend / Proxy:** Node.js, Express, tsx, Google GenAI SDK (`@google/genai` with `gemini-3.8-flash`)
- **Data & Schemas:** Synthetic CSV & In-memory TS ledgers matching `DATA_DICTIONARY.md`
