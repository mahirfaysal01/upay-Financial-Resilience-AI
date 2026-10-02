# SYNTHETIC DATA GENERATION ASSUMPTIONS
**upay Financial Resilience AI — DIU CPC × upay AI Hackathon 2026**

### 1. Zero Real-Data Grounding Rule
This prototype operates exclusively on synthetically simulated datasets. Under no condition were real customer records, upay operational databases, or personal financial details utilized. All names, mobile numbers, and merchant associations are fictional.

### 2. Behavioral Persona Distributions
The synthetic generation process utilizes parametric distributions conditioned on real-world DFS usage patterns in urban and suburban Bangladesh:

1. **Stable Saver (e.g. Nusrat Jahan, C002):**
   - Income: Fixed monthly salary (৳48,000) on Day 1.
   - Spending Profile: Low volatility, steady daily essentials (~৳950/day), savings rate ~40.6%.
   - Shortage Probability: Low (<10%).

2. **Month-End Spender (Demo Benchmark: Rahim Hasan, C001):**
   - Income: Fixed entry salary (৳30,000) on Day 1.
   - Behavioral Trait: Accelerated restaurant dining (+36.8% food spike) and frequent cash withdrawals via agents.
   - Status at Day 20: Balance ৳8,200, upcoming ৳2,000 bill in 4 days, 11 days until payday.
   - Projected Month-End: Drops to ~৳850.
   - Shortage Probability: 82% (HIGH).

3. **High Discretionary Spender (Tanvir Ahmed, C003):**
   - High allocation toward lifestyle e-commerce, cinema, and branded apparel (>42% discretionary ratio).

4. **Irregular Income User (Arif Hossain, C005):**
   - Variable frequency freelance disbursements (Day 8, Day 18, Day 28) with high income variance.

5. **Goal-Oriented Saver (Sadia Rahman, C004):**
   - Automated allocations to education certifications and family emergency pools.

6. **Sudden Spending User (Farhan Kabir, C006):**
   - Baseline stability interrupted by unexpected medical diagnostic tests (৳5,400) and vehicle repairs (৳4,200).

7. **Cash-Out Heavy User (Mehedi Zaman, C007):**
   - Relies on agent cash withdrawals for 44% of wallet turnover, incurring heavy transaction friction.

### 3. Ledger Continuity & Anomaly Injections
- **Ledger Invariance:** Every record satisfies $\text{Balance}_{t} = \text{Balance}_{t-1} + \text{Inflow} - \text{Outflow}$.
- **Temporal Realism:** Weekend (Friday/Saturday) transaction volumes are modeled with a 25% variance boost.
- **Anomaly Scoring:** Anomaly spikes are modeled as Gaussian deviations exceeding $2.5\sigma$ from the cluster moving average.
