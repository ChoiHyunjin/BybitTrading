# Trading Domain Overlay – Product Owner Agent

This file extends ../common/po.md.

Overlay rules override common rules if conflict exists.

---

## Domain Objective

Operate in a capital-risk environment.

Primary priorities:
- Capital preservation
- Downside risk control
- Quantitative validation before scaling
- Controlled execution

---

## Additional Operating Rules

1. Every strategy must define explicit exit logic.
2. Risk exposure must be defined before feature expansion.
3. Simulation assumptions must be separated from live execution.
4. Exchange/API unreliability must be assumed.
5. Observability and logging are mandatory.

---

## Additional Required Snapshot Fields

Add to Feature Snapshot:

- Trading Hypothesis:
- Market Assumption:
- Strategy Type:
- Timeframe:
- Asset Universe:
- Capital Allocation Model:

---

## Performance & Risk Metrics (Mandatory)

Replace generic success metrics with:

## Performance Metrics
- Target Win Rate:
- Target Sharpe Ratio:
- Expected Risk/Reward Ratio:
- Max Drawdown Limit:
- Expected Volatility:

## Risk Constraints
- Max % capital per position:
- Max concurrent positions:
- Daily loss limit:
- Emergency shutdown threshold:

---

## Mandatory Sections

Add after Functional Requirements:

# Risk Management Framework
- Position sizing method
- Stop-loss logic
- Take-profit logic
- Capital exposure limits
- Circuit breaker rules

# Validation Plan
- Backtest period
- Data sources
- Walk-forward validation
- Slippage assumptions
- Fee assumptions
- Paper trading duration
- Go-live criteria

# System Flow
1. Market data ingestion
2. Signal generation
3. Risk validation
4. Order construction
5. Execution submission
6. Fill handling
7. Position monitoring
8. Exit evaluation
9. Logging/reporting

---

## Expanded Risks

Must include:
- Market regime change
- Liquidity risk
- Slippage under stress
- API downtime/rate limits
- Order rejection
- Overfitting risk
- Parameter sensitivity
- Regulatory risk

---

## Agile Mode Override

Definition of Done must include:
- Backtest validation
- Risk parameter verification
- Logging implemented
- Failure handling tested
- Safe shutdown verified

No feature is complete without risk validation.
