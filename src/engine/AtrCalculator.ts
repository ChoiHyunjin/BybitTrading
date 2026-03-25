export class AtrCalculator {
  private readonly period: number;
  private trueRanges: number[] = [];
  private prevClose: number = 0;
  private atrValue: number = 0;
  private initialized: boolean = false;

  constructor(period: number = 14) {
    this.period = period;
  }

  push(high: number, low: number, close: number): void {
    let tr: number;
    if (this.prevClose === 0) {
      tr = high - low;
    } else {
      tr = Math.max(
        high - low,
        Math.abs(high - this.prevClose),
        Math.abs(low - this.prevClose),
      );
    }
    this.prevClose = close;

    if (!this.initialized) {
      this.trueRanges.push(tr);
      if (this.trueRanges.length === this.period) {
        this.atrValue = this.trueRanges.reduce((s, v) => s + v, 0) / this.period;
        this.initialized = true;
      }
    } else {
      // Wilder smoothing
      this.atrValue = (this.atrValue * (this.period - 1) + tr) / this.period;
    }
  }

  getValue(): number {
    return this.atrValue;
  }

  isReady(): boolean {
    return this.initialized;
  }

  reset(): void {
    this.trueRanges = [];
    this.prevClose = 0;
    this.atrValue = 0;
    this.initialized = false;
  }
}
