import {Constants} from '../constants';

export class PricesManager {
  prices: number[] = [];
  private readonly max: number;

  constructor(maxCount: number = Constants.longer) {
    this.max = maxCount;
  }

  pushPrice(price: number): void {
    this.prices.push(price);
    if (this.prices.length > this.max) {
      this.prices.shift();
    }
  }

  setPrices(prices: number[]): void {
    this.prices = prices.slice(-this.max);
  }

  getAverage(period: number): number {
    const slice = this.prices.slice(-period);
    return slice.reduce((sum, p) => sum + p, 0) / period;
  }

  getVariance(period: number): number {
    const avg = this.getAverage(period);
    const slice = this.prices.slice(-period);
    const sumSquares = slice.reduce((sum, p) => sum + (avg - p) * (avg - p), 0);
    return sumSquares / (period - 1);
  }

  getStandardDeviation(period: number): number {
    return Math.sqrt(this.getVariance(period));
  }
}
