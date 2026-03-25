export class EmaCalculator {
  private readonly period: number;
  private readonly alpha: number;
  private value: number = 0;
  private count: number = 0;
  private sum: number = 0;

  constructor(period: number) {
    this.period = period;
    this.alpha = 2 / (period + 1);
  }

  push(price: number): void {
    this.count++;
    if (this.count <= this.period) {
      // Use SMA for initial seed
      this.sum += price;
      if (this.count === this.period) {
        this.value = this.sum / this.period;
      }
    } else {
      this.value = this.alpha * price + (1 - this.alpha) * this.value;
    }
  }

  getValue(): number {
    return this.value;
  }

  isReady(): boolean {
    return this.count >= this.period;
  }

  reset(): void {
    this.value = 0;
    this.count = 0;
    this.sum = 0;
  }
}
