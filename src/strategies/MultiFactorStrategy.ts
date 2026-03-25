import {Price} from '../models/Price';
import {EmaCalculator} from '../engine/EmaCalculator';
import {AtrCalculator} from '../engine/AtrCalculator';
import {PricesManager} from '../engine/PricesManager';
import {IndicatorMaker} from '../engine/IndicatorMaker';
import {Signal, TradingStrategy} from './TradingStrategy';

export class MultiFactorStrategy implements TradingStrategy {
  name = 'Multi-Factor Scoring Strategy';
  warmupPeriod = 50; // needs enough data for all indicators

  private rsiPeriod = 14;
  private rsiGains: number[] = [];
  private rsiLosses: number[] = [];
  private prevClose: number = 0;

  private indicatorMaker = new IndicatorMaker(20, 2);
  private shortEma = new EmaCalculator(10);
  private longEma = new EmaCalculator(30);
  private atr = new AtrCalculator(14);
  private prevAtr: number = 0;
  private volumeManager = new PricesManager(20);

  private holdingCandles: number = 0;
  private trailingStop: number = 0;
  private readonly buyThreshold: number;
  private readonly sellThreshold: number;
  private readonly maxHoldCandles: number;

  constructor(buyThreshold: number = 4, sellThreshold: number = 1, maxHoldCandles: number = 50) {
    this.buyThreshold = buyThreshold;
    this.sellThreshold = sellThreshold;
    this.maxHoldCandles = maxHoldCandles;
  }

  init(prices: number[]): void {
    for (const p of prices) {
      this.shortEma.push(p);
      this.longEma.push(p);
      this.indicatorMaker.pushPrice(p);
      this.atr.push(p * 1.005, p * 0.995, p);
      this.volumeManager.pushPrice(100); // Placeholder during init

      if (this.prevClose > 0) {
        const change = p - this.prevClose;
        this.rsiGains.push(change > 0 ? change : 0);
        this.rsiLosses.push(change < 0 ? -change : 0);
        if (this.rsiGains.length > this.rsiPeriod) {
          this.rsiGains.shift();
          this.rsiLosses.shift();
        }
      }
      this.prevClose = p;
    }
    if (this.atr.isReady()) {
      this.prevAtr = this.atr.getValue();
    }
  }

  onPrice(price: Price, hasPosition: boolean): Signal {
    // Update all indicators
    this.shortEma.push(price.close);
    this.longEma.push(price.close);
    this.indicatorMaker.pushPrice(price.close);
    this.atr.push(price.high, price.low, price.close);
    this.volumeManager.pushPrice(price.volume);

    if (this.prevClose > 0) {
      const change = price.close - this.prevClose;
      this.rsiGains.push(change > 0 ? change : 0);
      this.rsiLosses.push(change < 0 ? -change : 0);
      if (this.rsiGains.length > this.rsiPeriod) {
        this.rsiGains.shift();
        this.rsiLosses.shift();
      }
    }
    this.prevClose = price.close;

    if (!this.shortEma.isReady() || !this.longEma.isReady() || !this.atr.isReady()) {
      return 'HOLD';
    }

    const score = this.calculateScore(price);

    if (hasPosition) {
      this.holdingCandles++;
      // Update trailing stop
      const newStop = price.close - 3 * this.atr.getValue();
      if (newStop > this.trailingStop) {
        this.trailingStop = newStop;
      }

      // SELL: low score, trailing stop, or time stop
      if (score <= this.sellThreshold || price.close < this.trailingStop || this.holdingCandles >= this.maxHoldCandles) {
        this.holdingCandles = 0;
        this.trailingStop = 0;
        this.prevAtr = this.atr.getValue();
        return 'SELL';
      }
    } else {
      // BUY: high multi-factor score
      if (score >= this.buyThreshold) {
        this.trailingStop = price.close - 3 * this.atr.getValue();
        this.holdingCandles = 0;
        this.prevAtr = this.atr.getValue();
        return 'BUY';
      }
    }

    this.prevAtr = this.atr.getValue();
    return 'HOLD';
  }

  reset(): void {
    this.rsiGains = [];
    this.rsiLosses = [];
    this.prevClose = 0;
    this.indicatorMaker = new IndicatorMaker(20, 2);
    this.shortEma = new EmaCalculator(10);
    this.longEma = new EmaCalculator(30);
    this.atr = new AtrCalculator(14);
    this.prevAtr = 0;
    this.volumeManager = new PricesManager(20);
    this.holdingCandles = 0;
    this.trailingStop = 0;
  }

  private calculateScore(price: Price): number {
    let score = 0;

    // Factor 1: RSI < 40 (momentum suggests undervalued)
    const rsi = this.calculateRsi();
    if (rsi > 0 && rsi < 40) { score++; }

    // Factor 2: Price < lower Bollinger Band (statistical extreme)
    const lowerBB = this.indicatorMaker.lower();
    if (lowerBB > 0 && price.close < lowerBB) { score++; }

    // Factor 3: Short EMA > Long EMA (trend is positive)
    if (this.shortEma.getValue() > this.longEma.getValue()) { score++; }

    // Factor 4: Volume above average (participation)
    if (this.volumeManager.prices.length >= 20) {
      const avgVolume = this.volumeManager.getAverage(20);
      if (avgVolume > 0 && price.volume > avgVolume) { score++; }
    }

    // Factor 5: ATR expanding (volatility supports breakout)
    if (this.prevAtr > 0 && this.atr.getValue() > this.prevAtr) { score++; }

    return score;
  }

  private calculateRsi(): number {
    if (this.rsiGains.length < this.rsiPeriod) { return -1; }
    const avgGain = this.rsiGains.reduce((s, g) => s + g, 0) / this.rsiPeriod;
    const avgLoss = this.rsiLosses.reduce((s, l) => s + l, 0) / this.rsiPeriod;
    if (avgLoss === 0) { return 100; }
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
}
