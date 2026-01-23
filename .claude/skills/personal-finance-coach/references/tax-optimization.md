# Tax Optimization Strategies

## Account Location Strategy

```
ASSET LOCATION (Where to hold what)

TAX-DEFERRED (Traditional 401k/IRA):
├── Bonds and bond funds (highest tax drag)
├── REITs (dividends taxed as ordinary income)
├── High-yield bonds
├── Actively managed funds (high turnover)
└── Commodities

TAX-FREE (Roth 401k/IRA):
├── Highest expected growth assets
├── Small-cap value (highest expected return)
├── International small value
├── Anything you want to grow tax-free forever
└── Assets you'll hold longest

TAXABLE BROKERAGE:
├── Total stock market index (tax-efficient)
├── Tax-managed funds
├── Municipal bonds (if in high bracket)
├── ETFs over mutual funds (tax efficiency)
├── Assets held over 1 year (long-term rates)
└── Loss harvesting candidates

MATH EXAMPLE:
$100K bonds at 5% yield, 35% tax bracket:
├── In taxable: $5K × 0.65 = $3.25K after-tax
└── In tax-deferred: $5K grows, taxed at withdrawal

$100K stocks at 10% return:
├── In Roth: $10K growth, NEVER taxed
└── In taxable: Qualified divs at 15%, LTCG at 15%
```

## Tax-Loss Harvesting

```python
def tax_loss_harvest(positions: list[dict], threshold: float = 0.03) -> list[dict]:
    """
    Identify tax-loss harvesting opportunities.

    Args:
        positions: List of {ticker, cost_basis, current_value, purchase_date}
        threshold: Minimum loss % to harvest (transaction costs matter)

    Returns:
        List of positions to harvest with replacement suggestions
    """
    from datetime import datetime, timedelta

    harvest_candidates = []

    # Replacement map (similar but not "substantially identical")
    replacements = {
        'VTI': ['ITOT', 'SCHB', 'SPTM'],  # Total US market
        'VXUS': ['IXUS', 'SCHF', 'IEFA'],  # International
        'BND': ['AGG', 'SCHZ', 'IUSB'],    # Total bond
        'VNQ': ['SCHH', 'IYR', 'XLRE'],    # REITs
    }

    for pos in positions:
        loss_pct = (pos['current_value'] - pos['cost_basis']) / pos['cost_basis']
        days_held = (datetime.now() - pos['purchase_date']).days

        if loss_pct < -threshold:
            # Check wash sale window
            harvest_candidates.append({
                'ticker': pos['ticker'],
                'loss': pos['current_value'] - pos['cost_basis'],
                'loss_pct': loss_pct,
                'short_term': days_held < 365,
                'replacement': replacements.get(pos['ticker'], ['Cash']),
                'tax_savings_estimate': estimate_tax_savings(
                    pos['cost_basis'] - pos['current_value'],
                    days_held < 365
                )
            })

    return sorted(harvest_candidates, key=lambda x: x['tax_savings_estimate'], reverse=True)

def estimate_tax_savings(loss: float, short_term: bool,
                        income_bracket: float = 0.32,
                        ltcg_rate: float = 0.15) -> float:
    """
    Estimate tax savings from harvesting a loss.

    Short-term losses offset short-term gains (higher rate) first.
    """
    if short_term:
        return loss * income_bracket
    else:
        return loss * ltcg_rate
```

## Roth Conversion Ladder

```
FOR EARLY RETIREMENT (before 59.5)

PROBLEM: Can't access 401k/IRA without 10% penalty

SOLUTION: Roth Conversion Ladder

HOW IT WORKS:
Year 0: Retire with $1M in Traditional IRA
Year 1: Convert $50K from Traditional → Roth
        Pay taxes on $50K (no penalty for conversion)
Year 2: Convert another $50K
...
Year 6: Year 1's $50K conversion is now accessible
        (5-year seasoning rule)

ANNUAL PROCESS:
├── Convert amount needed for Year+5 spending
├── Pay taxes now at (hopefully) lower rate
├── Wait 5 years for each conversion
└── Withdraw contributions (not earnings) tax/penalty-free

TAX BRACKETS TO FILL:
2024 Single:
├── 10%: $0 - $11,600
├── 12%: $11,600 - $47,150
└── 22%: $47,150 - $100,525

STRATEGY: Fill up to 22% bracket with conversions
         while keeping total income low for ACA subsidies

EXAMPLE:
├── Spouse 1 converts $47K to fill 12% bracket
├── Spouse 2 converts $47K to fill 12% bracket
├── Total: $94K converted at 12% = $11,280 tax
├── After 5 years: Access $94K/year tax & penalty-free
└── Meanwhile: Live on taxable or Roth contributions
```
