import {Price} from '../models/Price';
import {Signal, TradingStrategy} from './TradingStrategy';

export class RsiStrategy implements TradingStrategy {
  name = 'RSI Strategy';
  private readonly period: number;
  private readonly oversold: number;
  private readonly overbought: number;
  private gains: number[] = [];
  private losses: number[] = [];
  private prevClose: number = 0;

  constructor(period: number = 14, oversold: number = 30, overbought: number = 70) {
    this.period = period;
    this.oversold = oversold;
    this.overbought = overbought;
  }

  init(prices: number[]): void {
    this.gains = [];
    this.losses = [];
    this.prevClose = 0;

    for (const price of prices) {
      if (this.prevClose > 0) {
        const change = price - this.prevClose;
        this.gains.push(change > 0 ? change : 0);
        this.losses.push(change < 0 ? -change : 0);
      }
      this.prevClose = price;
    }

    // Keep only last `period` entries
    this.gains = this.gains.slice(-this.period);
    this.losses = this.losses.slice(-this.period);
  }

  onPrice(price: Price, hasPosition: boolean): Signal {
    if (this.prevClose > 0) {
      const change = price.close - this.prevClose;
      this.gains.push(change > 0 ? change : 0);
      this.losses.push(change < 0 ? -change : 0);

      if (this.gains.length > this.period) {
        this.gains.shift();
        this.losses.shift();
      }
    }
    this.prevClose = price.close;

    if (this.gains.length < this.period) {
      return 'HOLD';
    }

    const rsi = this.calculateRsi();

    if (!hasPosition && rsi <= this.oversold) {
      return 'BUY';
    }
    if (hasPosition && rsi >= this.overbought) {
      return 'SELL';
    }

    return 'HOLD';
  }

  reset(): void {
    this.gains = [];
    this.losses = [];
    this.prevClose = 0;
  }

  private calculateRsi(): number {
    const avgGain = this.gains.reduce((s, g) => s + g, 0) / this.period;
    const avgLoss = this.losses.reduce((s, l) => s + l, 0) / this.period;

    if (avgLoss === 0) {
      return 100;
    }

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
}
