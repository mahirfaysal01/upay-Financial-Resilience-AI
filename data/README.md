# Synthetic Dataset Documentation & Methodology
**Project:** upay Financial Resilience AI  
**Track:** Track 03 — Customer Innovation & Financial Independence (DIU CPC × upay AI Hackathon 2026)

## Overview
This directory contains fully synthetic, anonymized, and mathematically validated datasets representing consumer digital financial services (DFS) behaviors in Bangladesh.

> **CRITICAL ETHICAL & REGULATORY NOTICE:**
> No real upay customer or employee data was used, accessed, or inferred. All identities, names, mobile numbers, transaction histories, and merchant affiliations are generated synthetically strictly for academic, prototyping, and hackathon evaluation purposes.

## Dataset Structure
1. `customers.csv`: Fictional customer profiles representing 7 distinct behavioral clusters.
2. `transactions.csv`: Individual transactional ledger entries with timestamps, channels (app, qr, agent, ussd), categories, amounts, and mathematical balance continuity.
3. `income.csv`: Inflow history across salary, freelance, business, and allowance disbursements.
4. `goals.csv`: Targeted financial goals, deadlines, and current accumulated savings.
5. `merchants.csv`: Synthetic partner merchants across food, shopping, utilities, and agent cash-out kiosks.
6. `financial_profiles.csv`: Aggregated financial health metrics and model baseline features.

## Mathematical Balance Continuity Rule
For every transaction $t_i$:
$$\text{balance\_after}_i = \text{balance\_after}_{i-1} + \text{income}_i - \text{expense}_i$$
No negative balances or impossible balance jumps occur, ensuring data integrity across test and validation cycles.
