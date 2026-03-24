import {PricesManager} from './PricesManager';

export class IndicatorMaker {
  readonly n: number;
  readonly k: number;
  readonly pricesManager: PricesManager;
  ma: number = 0;
  touchedBottom: boolean = false;
  touchedTop: boolean = false;

  constructor(n: number = 20, k: number = 2) {
    this.n = n;
    this.k = k;
    this.pricesManager = new PricesManager(n);
  }

  setPrices(prices: number[]): void {
    this.pricesManager.setPrices(prices);
    if (this.pricesManager.prices.length >= this.n) {
      this.ma = this.movingAverage(this.n);
    }
  }

  lower(): number {
    return this.ma - this.pricesManager.getStandardDeviation(this.n) * this.k;
  }

  upper(): number {
    return this.ma + this.pricesManager.getStandardDeviation(this.n) * this.k;
  }

  movingAverage(period: number): number {
    return this.pricesManager.getAverage(period);
  }

  pushPrice(price: number): void {
    this.pricesManager.pushPrice(price);
    this.ma = this.movingAverage(this.n);

    if (this.lower() >= price) {
      this.touchedBottom = true;
    } else if (this.upper() <= price) {
      this.touchedTop = true;
    }
  }

  getBW(): number {
    if (this.ma === 0) {
      return 0;
    }
    return (this.upper() - this.lower()) / this.ma;
  }

  resetTouched(): void {
    this.touchedTop = false;
    this.touchedBottom = false;
  }
}
