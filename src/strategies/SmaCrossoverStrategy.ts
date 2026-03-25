import {Price} from '../models/Price';
import {PricesManager} from '../engine/PricesManager';
import {Signal, TradingStrategy} from './TradingStrategy';

export class SmaCrossoverStrategy implements TradingStrategy {
  name = 'SMA Crossover Strategy';
  warmupPeriod: number;
  private pricesManager: PricesManager;
  private readonly shortPeriod: number;
  private readonly longPeriod: number;
  private prevShortMA: number = 0;
  private prevLongMA: number = 0;

  constructor(shortPeriod: number = 10, longPeriod: number = 30) {
    this.shortPeriod = shortPeriod;
    this.longPeriod = longPeriod;
    this.pricesManager = new PricesManager(longPeriod);
    this.warmupPeriod = longPeriod;
  }

  init(prices: number[]): void {
    this.pricesManager.setPrices(prices);
    if (this.pricesManager.prices.length >= this.longPeriod) {
      this.prevShortMA = this.pricesManager.getAverage(this.shortPeriod);
      this.prevLongMA = this.pricesManager.getAverage(this.longPeriod);
    }
  }

  onPrice(price: Price, hasPosition: boolean): Signal {
    this.pricesManager.pushPrice(price.close);

    if (this.pricesManager.prices.length < this.longPeriod) {
      return 'HOLD';
    }

    const shortMA = this.pricesManager.getAverage(this.shortPeriod);
    const longMA = this.pricesManager.getAverage(this.longPeriod);

    let signal: Signal = 'HOLD';

    // Golden Cross: short MA crosses above long MA → BUY
    if (!hasPosition && this.prevShortMA <= this.prevLongMA && shortMA > longMA) {
      signal = 'BUY';
    }
    // Death Cross: short MA crosses below long MA → SELL
    if (hasPosition && this.prevShortMA >= this.prevLongMA && shortMA < longMA) {
      signal = 'SELL';
    }

    this.prevShortMA = shortMA;
    this.prevLongMA = longMA;

    return signal;
  }

  reset(): void {
    this.pricesManager = new PricesManager(this.longPeriod);
    this.prevShortMA = 0;
    this.prevLongMA = 0;
  }
}
