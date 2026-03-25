# Trading Strategy Evaluation Report

**Date:** 2026-03-25
**Agent:** Quantitative Trading Strategist
**Codebase:** BybitTrading (BTCUSDT, Bybit)

---

## Table of Contents

1. [Interface & Infrastructure Review](#1-interface--infrastructure-review)
2. [Strategy 1: Bollinger Band Strategy](#2-strategy-1-bollinger-band-strategy)
3. [Strategy 2: SMA Crossover Strategy](#3-strategy-2-sma-crossover-strategy)
4. [Strategy 3: RSI Strategy](#4-strategy-3-rsi-strategy)
5. [Strategy Comparison Matrix](#5-strategy-comparison-matrix)
6. [Cross-Cutting Issues](#6-cross-cutting-issues)
7. [Improvement Recommendations](#7-improvement-recommendations)
8. [Recommended New Strategies](#8-recommended-new-strategies)

---

## 1. Interface & Infrastructure Review

### TradingStrategy Interface

The interface is minimal: `init(prices[])`, `onPrice(price, hasPosition) -> Signal`, `reset()`. The signal space is `BUY | SELL | HOLD` -- binary position only (long or flat). This means:

- **No short selling** is supported.
- **No partial position sizing** -- the engine goes all-in on every BUY and fully exits on every SELL.
- **No stop-loss or take-profit** at the engine level -- strategies must encode these internally via signal logic.

### BacktestEngine

- **Initialization warm-up is hardcoded to 20 candles** regardless of strategy requirements. This is problematic: the SMA Crossover needs 30 candles for its long MA, and the RSI needs 14 changes (15 candles). The Bollinger strategy needs 20 (matching the default).
- **Position sizing is 100% of capital** on every trade (line 36: `Math.floor((money / price.close) * 1000) / 1000`). No fractional allocation or risk-based sizing.
- **No slippage or fee modeling.** All trades execute at the exact close price with zero transaction costs. This inflates backtest results, especially for high-frequency strategies.
- **Drawdown calculation only considers SELL-trade snapshots**, missing intra-trade unrealized drawdowns. Peak equity is only updated on SELL events, which underestimates true maximum drawdown.

### PricesManager

- Uses a sample variance formula (`/ (period - 1)`, Bessel's correction) for standard deviation. This is statistically correct for sample estimation but differs from some charting platforms that use population variance (`/ period`). Minor impact for period >= 20.
- `getAverage()` divides by the requested `period` even if fewer prices are available. If `slice.length < period`, the average is artificially deflated. This is a **bug** when `init()` provides fewer prices than expected.

---

## 2. Strategy 1: Bollinger Band Strategy

**File:** `src/strategies/BollingerStrategy.ts`
**Dependencies:** `IndicatorMaker`, `PricesManager`

### Mathematical Basis

Bollinger Bands consist of:
- Middle band: SMA(n) where n=20 (default)
- Upper band: SMA(n) + k * sigma(n), k=2
- Lower band: SMA(n) - k * sigma(n)
- Bandwidth (BW): (Upper - Lower) / SMA(n)

The strategy uses a **squeeze-and-breakout** concept: when BW < 0.01 (bands are extremely tight), it looks for a breakout signal to enter.

### Signal Logic Analysis

**BUY Conditions (when no position):**
1. `BW < 0.01` (Bollinger squeeze active -- extremely narrow bands)
2. `touchedTop === true` (price previously touched the upper band)
3. `price <= shortMA(6)` (current price is at or below the 6-period MA)

**SELL Conditions (when holding position):**
- Path A: `BW >= 0.01` AND `shortMA(6) > longMA(20)` -- bands have expanded and short-term trend is bullish (sells into strength)
- Path B: `BW < 0.01` AND `touchedBottom === true` AND `price >= shortMA(6)` -- squeeze persists but price reversed down then bounced

### Critical Issues

1. **BW threshold of 0.01 is a magic number.** For BTCUSDT, if BTC is at $60,000, BW = 0.01 means the band width is $600. Whether this constitutes a "squeeze" depends entirely on the asset's volatility regime. This should be normalized or percentile-based.

2. **Ordering bug in `onPrice()`:** The strategy evaluates the signal BEFORE calling `pushPrice()`. This means the signal is computed on stale indicators (not including the current candle). `touchedTop`/`touchedBottom` flags reflect the state BEFORE the current price is incorporated. This creates a **one-bar lag**.

3. **`touchedTop` is sticky without decay.** Once the upper band is touched, `touchedTop` remains true indefinitely until explicitly reset by a trade. If the touch happened 100 candles ago, it still enables a BUY signal. There is no recency check.

4. **SELL Path A sells into strength** (`shortMA > longMA`), which is counter-intuitive. Selling when short-term momentum is positive means exiting before the trend exhausts.

5. **No stop-loss mechanism.** If the squeeze breakout fails, the strategy has no defined exit other than the two SELL conditions.

### Parameter Sensitivity

| Parameter | Default | Role | Sensitivity |
|-----------|---------|------|-------------|
| n (BB period) | 20 | Band calculation window | Medium |
| k (BB multiplier) | 2 | Band width | Low |
| short MA | 6 | Signal filter | **High** |
| long MA | 20 | Trend filter in sell | Medium |
| BW threshold | 0.01 | Squeeze detection | **Very High** -- asset-dependent, not adaptive |

### Suitable Market Regime

**Best:** Low-volatility consolidation followed by directional breakout.
**Worst:** Trending markets with sustained high volatility (BW rarely drops below 0.01), or choppy markets with false breakouts.

### Verdict: **4/10**

---

## 3. Strategy 2: SMA Crossover Strategy

**File:** `src/strategies/SmaCrossoverStrategy.ts`
**Dependencies:** `PricesManager`

### Mathematical Basis

Classic dual-moving-average crossover:
- Short SMA: period 10
- Long SMA: period 30
- Golden Cross (BUY): short SMA crosses above long SMA
- Death Cross (SELL): short SMA crosses below long SMA

Exploits autocorrelation of asset returns in trending markets.

### Signal Logic Analysis

**BUY:** `prevShortMA <= prevLongMA && shortMA > longMA` (crossover from below)
**SELL:** `prevShortMA >= prevLongMA && shortMA < longMA` (crossover from above)

Implementation correctly detects crossovers by comparing previous and current MA positions.

### Critical Issues

1. **Warm-up mismatch.** Engine provides 20 candles for `init()`, but strategy needs 30 (`longPeriod`). `prevShortMA/prevLongMA` remain at 0 from init, so the **first crossover detection after warm-up may produce a spurious signal** comparing real values against 0.

2. **SMA vs EMA.** SMA gives equal weight to all candles. A single old outlier dropping out of the window can cause a sudden jump, triggering a false crossover. EMA would be more robust.

3. **No trend strength filter.** A `shortMA - longMA` difference of $0.01 triggers the same as $500. Adding ADX > 25 filter would reduce whipsaws.

4. **No stop-loss.** If a golden cross occurs at a local top, the only exit is a death cross, which may come after substantial drawdown.

### Parameter Sensitivity

| Parameter | Default | Role | Sensitivity |
|-----------|---------|------|-------------|
| shortPeriod | 10 | Fast MA | **High** |
| longPeriod | 30 | Slow MA | **High** |

### Suitable Market Regime

**Best:** Strong, sustained trending markets.
**Worst:** Range-bound / sideways markets (whipsaw losses).

### Verdict: **6/10**

---

## 4. Strategy 3: RSI Strategy

**File:** `src/strategies/RsiStrategy.ts`
**Dependencies:** None (self-contained)

### Mathematical Basis

Relative Strength Index:
- `RS = avg_gain(period) / avg_loss(period)`
- `RSI = 100 - 100 / (1 + RS)`
- Oversold: RSI <= 30 (BUY), Overbought: RSI >= 70 (SELL)

### Signal Logic Analysis

**BUY:** `RSI <= 30` (oversold)
**SELL:** `RSI >= 70` (overbought)

Simple threshold-based entry and exit.

### Critical Issues

1. **SMA-based RSI vs Wilder's smoothing.** Implementation uses simple average of gains/losses. Standard RSI uses exponential smoothing: `avgGain_t = (prevAvgGain * (period-1) + currentGain) / period`. Signals will trigger at different times than on standard charting platforms.

2. **Selling at overbought is counter-trend in bull markets.** In strong uptrends, RSI can remain above 70 for extended periods. Selling at first touch of 70 exits the trend too early.

3. **No confirmation signal.** A single candle pushing RSI to 29 triggers BUY. Requiring RSI to cross back above 30 from below would reduce false signals.

4. **Symmetry assumption.** In crypto bull markets, RSI spends more time above 50. Adaptive thresholds (40/80 in uptrends, 20/60 in downtrends) would be more appropriate.

5. **No stop-loss or time-based exit.**

### Parameter Sensitivity

| Parameter | Default | Role | Sensitivity |
|-----------|---------|------|-------------|
| period | 14 | RSI lookback | Medium |
| oversold | 30 | Buy threshold | **High** |
| overbought | 70 | Sell threshold | **High** |

### Suitable Market Regime

**Best:** Range-bound markets with clear oscillation.
**Worst:** Strong trending markets where RSI stays in extreme territory.

### Verdict: **5/10**

---

## 5. Strategy Comparison Matrix

| Metric | Bollinger Band | SMA Crossover | RSI |
|--------|---------------|---------------|-----|
| **Return Potential** | Medium-High | Medium | Low-Medium |
| **Trade Frequency** | Low (squeeze rare) | Low-Medium | Medium-High |
| **Risk per Trade** | High (no stop-loss) | High (no stop-loss) | Medium |
| **Regime: Strong Trend** | Poor | Good | Poor |
| **Regime: Range-bound** | Fair | Poor (whipsaws) | Good |
| **Regime: High Volatility** | Poor | Poor (lagging) | Fair |
| **Regime: Low Volatility** | Good | Neutral | Neutral |
| **Signal Clarity** | Low (complex multi-condition) | High (single crossover) | High (single threshold) |
| **Implementation Correctness** | Issues (one-bar lag, sticky flags) | Mostly correct (warm-up bug) | Correct (SMA vs Wilder deviation) |
| **Overfitting Risk** | High (BW threshold) | Low | Low |
| **Parameters** | 4 | 2 | 3 |
| **Warm-up Needed** | 20 candles | 30 candles | 15 candles |
| **Complementarity** | Volatility-based | Trend-based | Momentum/Mean-reversion |

---

## 6. Cross-Cutting Issues

### 6.1 No Risk Management Layer

None of the three strategies implements:
- **Stop-loss** (fixed, trailing, or ATR-based)
- **Position sizing** (Kelly criterion, fixed-fraction, volatility-adjusted)
- **Maximum drawdown circuit breaker**
- **Time-based exit** (close position after N candles)

### 6.2 BacktestEngine Limitations

- Hardcoded 20-candle warm-up is insufficient for SMA Crossover (needs 30)
- 100% capital deployment per trade
- No fee/slippage modeling
- Drawdown calculation misses unrealized intra-trade drawdowns

### 6.3 Unused Price Data

All three strategies use only `close`. The `Price` interface provides `open`, `high`, `low`, `volume`, `turnover` -- enabling volume confirmation, ATR calculation, and better stop-loss placement.

### 6.4 No Regime Detection

No mechanism to detect trending vs ranging markets, switch behavior, or reduce position size in unfavorable regimes.

---

## 7. Improvement Recommendations

### 7.1 Bollinger Band Strategy

**A. Replace hardcoded BW threshold with percentile-based detection:**
```
BW_percentile = rank(current_BW, BW_history[100]) / 100
Signal squeeze when BW_percentile < 0.05  (bottom 5%)
```

**B. Add recency decay to touch flags:**
```
touchAge++; if touchAge > 5 then touchedTop = false
```

**C. Fix one-bar lag:** Call `pushPrice()` BEFORE evaluating signals.

**D. Replace sell-into-strength:** Sell when price touches opposite band, or use trailing stop at `SMA - 1*sigma`.

**E. Add ATR-based stop-loss:** `stopLoss = entryPrice - 2 * ATR(14)`

### 7.2 SMA Crossover Strategy

**A. Fix warm-up:** Strategy should declare required warm-up period.

**B. Add crossover magnitude filter:**
```
Signal valid only if |shortMA - longMA| / longMA > 0.001
```

**C. Switch to EMA:** `EMA_t = alpha * price + (1 - alpha) * EMA_{t-1}`, `alpha = 2 / (period + 1)`

**D. Add ADX filter:** `BUY only if ADX(14) > 20`

**E. Add trailing stop-loss:** `trailingStop = max(trailingStop, currentPrice - 2 * ATR(14))`

### 7.3 RSI Strategy

**A. Switch to Wilder smoothing:**
```
avgGain_t = (avgGain_{t-1} * (period - 1) + currentGain) / period
```

**B. Add confirmation via RSI crossback:**
```
BUY when RSI crosses back ABOVE 30 (after being <= 30)
SELL when RSI crosses back BELOW 70 (after being >= 70)
```

**C. Regime-adaptive thresholds:**
```
Bull regime (SMA50 > SMA200): oversold=40, overbought=80
Bear regime (SMA50 < SMA200): oversold=20, overbought=60
```

**D. Add time-based stop:** If held > 20 candles without hitting overbought, SELL.

---

## 8. Recommended New Strategies

### 8.1 MACD + Volume Confirmation

**Concept:** MACD crossover filtered by volume spike.
- MACD Line: EMA(12) - EMA(26)
- Signal Line: EMA(9) of MACD
- BUY: MACD crosses above Signal AND volume > SMA(volume, 20) * 1.5
- SELL: MACD crosses below Signal OR trailing stop hit

**Why:** Fills momentum + volume gap. Uses unused `volume` field. Works in trending and moderately volatile markets.

**Needs:** EMA utility, volume tracking.

### 8.2 ATR Channel Breakout (Keltner/Donchian Hybrid)

**Concept:** Volatility breakout with trend confirmation.
- Channel: EMA(20) +/- 2 * ATR(14) (Keltner Channel)
- BUY: Close > Upper Channel AND close > highest_high(20) (Donchian)
- SELL: Close < EMA(20) OR trailing stop at entry - 3 * ATR(14)
- Filter: ATR expanding (ATR > SMA(ATR, 50))

**Why:** Uses `high`/`low` fields. ATR-based channels more robust than BB's standard deviation. Replaces flawed Bollinger squeeze.

**Needs:** ATR calculation (high, low, close), Donchian channel.

### 8.3 Multi-Factor Scoring (Ensemble)

**Concept:** Combine uncorrelated signals with scoring.
- Score 0-5 each candle:
  - +1 if RSI(14) < 40
  - +1 if price < lower BB(20, 2)
  - +1 if EMA(10) > EMA(30)
  - +1 if volume > SMA(volume, 20)
  - +1 if ATR expanding
- BUY: Score >= 4
- SELL: Score <= 1 OR trailing stop OR time stop at 50 candles

**Why:** Diversifies across momentum, trend, volatility, volume. Requiring multi-factor consensus dramatically reduces false positives. Natural evolution beyond single-indicator strategies.

**Needs:** All existing + new EMA/ATR utilities.

---

## Priority Action Items

| Priority | Action | Impact |
|----------|--------|--------|
| **P0** | Fix BacktestEngine warm-up to be strategy-driven | Prevents incorrect results |
| **P0** | Fix Bollinger one-bar lag | Prevents stale-data signals |
| **P0** | Add fee/slippage modeling | Prevents unrealistic profit expectations |
| **P1** | Add stop-loss capability to TradingStrategy | Risk management is non-negotiable |
| **P1** | Add ATR utility (requires high/low) | Enables risk-based stops |
| **P1** | Add EMA utility | More responsive than SMA |
| **P2** | Implement multi-factor scoring strategy | Highest expected risk-adjusted return |
| **P2** | Add walk-forward validation | Prevents overfitting |
| **P3** | Add regime detection | Enables strategy switching |
