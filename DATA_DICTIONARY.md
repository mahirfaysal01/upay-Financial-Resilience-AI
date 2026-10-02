# DATA DICTIONARY
**upay Financial Resilience AI — Hackathon Prototype Data Schema**

---

### 1. `customers.csv`
| Field | Type | Description | Values / Examples |
|---|---|---|---|
| `customer_id` | String | Unique synthetic identifier | `C001`, `C002`, ... |
| `name` | String | Synthetic Bangladeshi name | Rahim Hasan, Nusrat Jahan |
| `age` | Integer | Customer age | 24, 28, 31 |
| `occupation` | String | Employment or academic status | Student, QA Engineer, Designer |
| `monthly_income` | Float / Int | Normalized monthly income (BDT ৳) | 30000, 48000, 52000 |
| `income_frequency` | Enum | Periodicity of income deposits | `Monthly`, `Bi-weekly`, `Irregular` |
| `location` | String | Region in Bangladesh | `Dhaka`, `Chattogram`, `Rajshahi` |
| `financial_profile` | Enum | Behavioral clustering persona | `Month-End Spender`, `Stable Saver`, `High Discretionary Spender`, `Goal-Oriented Saver`, `Irregular Income User`, `Sudden Spending User`, `Cash-Out Heavy User` |

---

### 2. `transactions.csv`
| Field | Type | Description | Values / Examples |
|---|---|---|---|
| `transaction_id` | String | Unique ledger ID | `TX1001`, `TX1002` |
| `customer_id` | String | Foreign key to `customers.csv` | `C001` |
| `timestamp` | ISO-8601 | Datetime of transaction | `2026-10-01T21:15:00Z` |
| `transaction_type` | Enum | Nature of wallet flow | `payment`, `cash_out`, `transfer`, `recharge`, `bill_payment`, `income` |
| `category` | Enum | Standardized expense classification | `Food`, `Transport`, `Bills`, `Shopping`, `Education`, `Healthcare`, `Entertainment`, `Cash-out`, `Recharge`, `Utilities`, `Other` |
| `amount` | Float / Int | Value in Bangladeshi Taka (৳) | 680, 1500, 30000 |
| `merchant_id` | String | Foreign key to `merchants.csv` | `M101`, `M110` |
| `channel` | Enum | Physical/digital interaction touchpoint | `app`, `ussd`, `agent`, `qr` |
| `balance_after` | Float / Int | Wallet balance post-transaction (BDT ৳) | 8200, 9700, 30000 |

---

### 3. `income.csv`
| Field | Type | Description | Values / Examples |
|---|---|---|---|
| `income_id` | String | Unique income voucher ID | `INC101` |
| `customer_id` | String | Foreign key to `customers.csv` | `C001` |
| `date` | YYYY-MM-DD | Disbursement date | `2026-09-01` |
| `amount` | Float / Int | Credit amount in BDT (৳) | 30000 |
| `income_type` | Enum | Source channel | `salary`, `freelance`, `business`, `allowance` |

---

### 4. `goals.csv`
| Field | Type | Description | Values / Examples |
|---|---|---|---|
| `goal_id` | String | Unique savings goal ID | `G101` |
| `customer_id` | String | Foreign key to `customers.csv` | `C001` |
| `goal_name` | String | Purpose label | Laptop for Coding, Emergency Fund |
| `target_amount` | Float / Int | Target value in BDT (৳) | 60000 |
| `current_amount` | Float / Int | Accumulated balance in BDT (৳) | 15000 |
| `deadline` | YYYY-MM-DD | Target completion date | `2027-04-30` |
| `priority` | Enum | Importance weighting | `HIGH`, `MEDIUM`, `LOW` |
| `category` | String | Goal classification | Education, Travel, Emergency Fund |
