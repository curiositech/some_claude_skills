# Withdrawal Mathematics

## The Trinity Study (Updated Research)

```
ORIGINAL TRINITY STUDY (Cooley, Hubbard, Walz, 1998):
├── Analyzed 1926-1995 data
├── 30-year retirement periods
├── Various stock/bond allocations
└── Conclusion: 4% withdrawal rate had ~95% success

UPDATED RESEARCH (Bengen, Kitces, ERN, etc.):

VARIABLE SWR BY STARTING VALUATION:
├── CAPE under 12: 5.0%+ SWR historically safe
├── CAPE 12-18: 4.0% SWR historically safe
├── CAPE 18-25: 3.5% SWR more prudent
├── CAPE over 25: 3.0-3.5% SWR recommended
└── Current CAPE (2024): ~33 → Be conservative

DYNAMIC WITHDRAWAL STRATEGIES:

1. GUYTON-KLINGER GUARDRAILS:
   ├── Start at 4-5%
   ├── If withdrawal rate rises 20% above initial: cut 10%
   ├── If withdrawal rate falls 20% below initial: raise 10%
   └── Higher initial rate, but flexibility required

2. VPW (Variable Percentage Withdrawal):
   ├── Recalculate each year based on:
   │   remaining_years = life_expectancy - current_age
   │   withdrawal = portfolio / remaining_years
   ├── Adjusts for portfolio performance
   └── Never runs out, but income varies

3. CAPE-BASED WITHDRAWAL:
   ├── SWR = 1 / (CAPE × 0.5)
   ├── When CAPE = 20: SWR = 1 / 10 = 10%... too high
   ├── Better: SWR = min(5%, 1/CAPE + 1%)
   └── Adjusts to market valuation
```

## Monte Carlo Retirement Simulation

```python
def simulate_retirement(portfolio: float, allocation: tuple,
                       withdrawal_rate: float, years: int = 30,
                       simulations: int = 10000) -> dict:
    """
    Monte Carlo retirement simulation.

    Args:
        portfolio: Starting portfolio value
        allocation: (stocks_pct, bonds_pct)
        withdrawal_rate: Initial withdrawal as % of portfolio
        years: Retirement length
        simulations: Number of Monte Carlo runs

    Returns:
        Success rate, median ending value, percentiles
    """
    import numpy as np

    # Historical parameters (adjust for expectations)
    stock_return = 0.07  # Real return
    stock_vol = 0.18
    bond_return = 0.02   # Real return
    bond_vol = 0.06
    correlation = 0.0    # Stock-bond correlation

    stock_pct, bond_pct = allocation
    initial_withdrawal = portfolio * withdrawal_rate

    results = []

    for _ in range(simulations):
        value = portfolio
        withdrawal = initial_withdrawal

        for year in range(years):
            # Generate correlated returns
            z1 = np.random.normal()
            z2 = correlation * z1 + np.sqrt(1 - correlation**2) * np.random.normal()

            stock_r = stock_return + stock_vol * z1
            bond_r = bond_return + bond_vol * z2

            portfolio_return = stock_pct * stock_r + bond_pct * bond_r

            # Beginning of year withdrawal
            value -= withdrawal
            if value <= 0:
                value = 0
                break

            # Growth
            value *= (1 + portfolio_return)

            # Inflation adjustment (withdrawal grows with inflation)
            withdrawal *= 1.03  # 3% inflation assumption

        results.append(value)

    results = np.array(results)
    success_rate = np.mean(results > 0)

    return {
        'success_rate': success_rate,
        'median_ending': np.median(results[results > 0]) if success_rate > 0 else 0,
        'percentile_10': np.percentile(results, 10),
        'percentile_25': np.percentile(results, 25),
        'percentile_75': np.percentile(results, 75),
        'percentile_90': np.percentile(results, 90),
        'failures': int((1 - success_rate) * simulations)
    }

# Example usage:
# result = simulate_retirement(
#     portfolio=1_000_000,
#     allocation=(0.6, 0.4),
#     withdrawal_rate=0.04,
#     years=30
# )
# print(f"Success rate: {result['success_rate']:.1%}")
# print(f"Median ending: ${result['median_ending']:,.0f}")
```

## FIRE Calculations

```
FINANCIAL INDEPENDENCE NUMBER

STANDARD: Annual Expenses × 25
(Assumes 4% SWR)

CONSERVATIVE: Annual Expenses × 33
(Assumes 3% SWR, more appropriate today)

FAT FIRE: Annual Expenses × 33 + Buffer
├── Includes luxury spending
├── Healthcare buffer
├── "Nice to have" budget
└── Typically $2.5M+

LEAN FIRE: Minimal Expenses × 25
├── Bare bones budget
├── Geographic arbitrage
├── $500K - $1M range
└── Less margin for error

COAST FIRE:
├── Save enough that growth alone funds retirement
├── Formula: FI_number / (1 + growth_rate)^years_to_retirement
├── Example: Need $2M at 65, currently 35
│   └── Coast number: $2M / 1.07^30 = $263K
└── After hitting coast number, can reduce savings rate

BARISTA FIRE:
├── Enough to part-time work for benefits
├── Portfolio covers most expenses
├── Job covers health insurance + discretionary
└── Common: $500K-$1M + part-time income
```
