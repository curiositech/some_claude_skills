---
title: Investment Theory
sidebar_label: Investment Theory
sidebar_position: 1
---
# Investment Theory

## Modern Portfolio Theory (Markowitz, 1952)

```
CORE INSIGHT: Risk is not just about individual assets,
              but how they move TOGETHER.

EFFICIENT FRONTIER
├── Set of portfolios with maximum return for given risk
├── All rational investors should be on this frontier
├── Below frontier = inefficient (can do better)
└── Above frontier = impossible

PORTFOLIO VARIANCE:
σ²_p = Σᵢ Σⱼ wᵢwⱼσᵢσⱼρᵢⱼ

Where:
├── wᵢ, wⱼ = weights of assets i, j
├── σᵢ, σⱼ = standard deviations
└── ρᵢⱼ = correlation coefficient

KEY IMPLICATION:
├── Uncorrelated assets reduce portfolio risk
├── Even adding a "risky" asset can reduce total risk
└── Diversification is the "only free lunch"
```

```python
import numpy as np
from scipy.optimize import minimize

def optimize_portfolio(returns: np.ndarray, cov_matrix: np.ndarray,
                      target_return: float = None,
                      risk_free_rate: float = 0.03) -> dict:
    """
    Find optimal portfolio weights using mean-variance optimization.

    Args:
        returns: Expected returns for each asset (annual)
        cov_matrix: Covariance matrix of returns
        target_return: If specified, minimize risk for this return
        risk_free_rate: Risk-free rate for Sharpe calculation

    Returns:
        dict with optimal weights, expected return, volatility, Sharpe ratio
    """
    n_assets = len(returns)

    def portfolio_volatility(weights):
        return np.sqrt(weights @ cov_matrix @ weights)

    def portfolio_return(weights):
        return weights @ returns

    def neg_sharpe(weights):
        ret = portfolio_return(weights)
        vol = portfolio_volatility(weights)
        return -(ret - risk_free_rate) / vol

    # Constraints: weights sum to 1
    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]

    if target_return:
        constraints.append({
            'type': 'eq',
            'fun': lambda w: portfolio_return(w) - target_return
        })
        objective = portfolio_volatility
    else:
        objective = neg_sharpe

    # Bounds: 0-100% in each asset (no shorting)
    bounds = tuple((0, 1) for _ in range(n_assets))

    # Initial guess: equal weight
    init_weights = np.ones(n_assets) / n_assets

    result = minimize(objective, init_weights, method='SLSQP',
                     bounds=bounds, constraints=constraints)

    weights = result.x
    return {
        'weights': weights,
        'return': portfolio_return(weights),
        'volatility': portfolio_volatility(weights),
        'sharpe': (portfolio_return(weights) - risk_free_rate) /
                  portfolio_volatility(weights)
    }
```

## Factor Investing (Fama-French and Beyond)

```
CAPM (1964): E[Rᵢ] = Rf + βᵢ(E[Rm] - Rf)
└── Single factor: Market risk

FAMA-FRENCH 3-FACTOR (1992):
E[Rᵢ] = Rf + βᵢ(Rm - Rf) + sᵢSMB + hᵢHML
├── SMB: Small Minus Big (size premium)
└── HML: High Minus Low (value premium)

FAMA-FRENCH 5-FACTOR (2014):
Added:
├── RMW: Robust Minus Weak (profitability)
└── CMA: Conservative Minus Aggressive (investment)

MOMENTUM FACTOR (Carhart, 1997):
├── Winners continue winning short-term
├── 12-month momentum, skip most recent month
└── High turnover, tax-inefficient

FACTOR PREMIUMS (Historical, not guaranteed):
├── Market: 5-7% over risk-free
├── Size: 2-3% (small > large)
├── Value: 3-5% (cheap > expensive)
├── Momentum: 4-6% (but volatile)
├── Profitability: 2-3%
└── Low volatility: Market return at lower risk

PRACTICAL IMPLEMENTATION:
├── DFA, Avantis, AQR: Academic factor funds
├── Vanguard Value (VTV): Simple value tilt
├── iShares Small-Cap Value (IJS): Size + value
└── Dimensional US Small Cap Value (DFSV): Gold standard
```

## Sequence of Returns Risk

```
THE RETIREMENT KILLER

Two scenarios, same AVERAGE return:

SCENARIO A (Good sequence):
Year 1: +20%, Year 2: +15%, Year 3: -10%
$1M portfolio with $40K withdrawal:
├── End Y1: $1M × 1.20 - $40K = $1.16M
├── End Y2: $1.16M × 1.15 - $40K = $1.294M
├── End Y3: $1.294M × 0.90 - $40K = $1.125M
└── RESULT: $1.125M remaining

SCENARIO B (Bad sequence):
Year 1: -10%, Year 2: +15%, Year 3: +20%
├── End Y1: $1M × 0.90 - $40K = $860K
├── End Y2: $860K × 1.15 - $40K = $949K
├── End Y3: $949K × 1.20 - $40K = $1.099M
└── RESULT: $1.099M remaining

SAME AVERAGE RETURN, $26K DIFFERENCE!

Early losses + withdrawals = permanent damage

MITIGATION STRATEGIES:
├── Bond tent: Higher bonds at retirement, reduce over time
├── Bucket strategy: 2-3 years in cash/bonds
├── Dynamic withdrawal: Reduce spending in down markets
├── Part-time work: Reduce withdrawals early
└── CAPE-based withdrawal: Adjust for market valuation
```

## Emergency Fund Calculation

```
TRADITIONAL ADVICE: 3-6 months expenses

ACTUAL CALCULATION:

FACTORS TO CONSIDER:
├── Job security (industry, skills, location)
├── Income volatility (W-2 vs 1099)
├── Number of income sources
├── Fixed vs variable expenses
├── Debt obligations
├── Health/family situation
└── Risk tolerance

FORMULA:
EF = (Monthly_Essential_Expenses) ×
     (Expected_Unemployment_Duration) ×
     (Safety_Factor)

EXPECTED UNEMPLOYMENT DURATION:
├── Under $50K salary: 1 month per $10K
├── $50K-$100K: 1.5 months per $10K
├── Over $100K: 2 months per $10K
└── Add 50% if specialized field

SAFETY FACTORS:
├── Stable W-2, dual income: 1.0×
├── Single income, stable: 1.5×
├── Variable income: 2.0×
├── Self-employed: 2.5×
└── Health issues/dependents: Add 0.5×

EXAMPLE:
├── $80K salary, tech worker, single income
├── Essential expenses: $4K/month
├── Expected unemployment: 80K/10K × 1.5 = 12 months
├── Safety factor: 1.5 (single income)
├── EF = $4K × 12 × 1.5 = $72K
└── Round: $75K emergency fund
```
