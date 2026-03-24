import {Price} from '../models/Price';
import {IndicatorMaker} from '../engine/IndicatorMaker';
import {Constants} from '../constants';
import {Signal, TradingStrategy} from './TradingStrategy';

export class BollingerStrategy implements TradingStrategy {
  name = 'Bollinger Band Strategy';
  private indicatorMaker: IndicatorMaker;
  private readonly short: number;
  private readonly long: number;

  constructor(
    n: number = Constants.longer,
    k: number = 2,
    short: number = Constants.shorter,
    long: number = Constants.longer,
  ) {
    this.indicatorMaker = new IndicatorMaker(n, k);
    this.short = short;
    this.long = long;
  }

  init(prices: number[]): void {
    this.indicatorMaker.setPrices(prices);
  }

  onPrice(price: Price, hasPosition: boolean): Signal {
    const closePrice = price.close;
    let signal: Signal;

    if (hasPosition) {
      signal = this.evaluateSell(closePrice);
    } else {
      signal = this.evaluateBuy(closePrice);
    }

    this.indicatorMaker.pushPrice(closePrice);
    return signal;
  }

  reset(): void {
    this.indicatorMaker = new IndicatorMaker(this.indicatorMaker.n, this.indicatorMaker.k);
  }

  private evaluateBuy(price: number): Signal {
    const bw = this.indicatorMaker.getBW();
    if (bw < 0.01 && this.indicatorMaker.touchedTop) {
      const shortMA = this.indicatorMaker.movingAverage(this.short);
      if (price <= shortMA) {
        this.indicatorMaker.resetTouched();
        return 'BUY';
      }
    }
    return 'HOLD';
  }

  private evaluateSell(price: number): Signal {
    const bw = this.indicatorMaker.getBW();
    if (bw >= 0.01) {
      const shortMA = this.indicatorMaker.movingAverage(this.short);
      const longMA = this.indicatorMaker.movingAverage(this.long);
      if (shortMA > longMA) {
        this.indicatorMaker.resetTouched();
        return 'SELL';
      }
    } else if (this.indicatorMaker.touchedBottom) {
      const shortMA = this.indicatorMaker.movingAverage(this.short);
      if (price >= shortMA) {
        this.indicatorMaker.resetTouched();
        return 'SELL';
      }
    }
    return 'HOLD';
  }
}
