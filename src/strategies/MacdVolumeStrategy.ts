import {Price} from '../models/Price';
import {EmaCalculator} from '../engine/EmaCalculator';
import {PricesManager} from '../engine/PricesManager';
import {Signal, TradingStrategy} from './TradingStrategy';

export class MacdVolumeStrategy implements TradingStrategy {
  name = 'MACD + Volume Strategy';
  warmupPeriod = 35; // 26 (slow EMA) + 9 (signal) buffer

  private fastEma: EmaCalculator;
  private slowEma: EmaCalculator;
  private signalEma: EmaCalculator;
  private volumeManager: PricesManager;
  private prevMacdLine: number = 0;
  private macdReady: boolean = false;

  constructor(
    private fastPeriod: number = 12,
    private slowPeriod: number = 26,
    private signalPeriod: number = 9,
    private volumeMultiplier: number = 1.5,
  ) {
    this.fastEma = new EmaCalculator(fastPeriod);
    this.slowEma = new EmaCalculator(slowPeriod);
    this.signalEma = new EmaCalculator(signalPeriod);
    this.volumeManager = new PricesManager(20);
  }

  init(prices: number[]): void {
    for (const p of prices) {
      this.fastEma.push(p);
      this.slowEma.push(p);
      if (this.fastEma.isReady() && this.slowEma.isReady()) {
        const macdLine = this.fastEma.getValue() - this.slowEma.getValue();
        this.signalEma.push(macdLine);
        this.prevMacdLine = macdLine;
      }
    }
    this.macdReady = this.signalEma.isReady();
  }

  onPrice(price: Price, hasPosition: boolean): Signal {
    this.fastEma.push(price.close);
    this.slowEma.push(price.close);
    this.volumeManager.pushPrice(price.volume);

    if (!this.fastEma.isReady() || !this.slowEma.isReady()) {
      return 'HOLD';
    }

    const macdLine = this.fastEma.getValue() - this.slowEma.getValue();
    this.signalEma.push(macdLine);

    if (!this.signalEma.isReady()) {
      this.prevMacdLine = macdLine;
      return 'HOLD';
    }

    const signalLine = this.signalEma.getValue();
    const avgVolume = this.volumeManager.prices.length >= 20
      ? this.volumeManager.getAverage(20)
      : 0;
    const highVolume = avgVolume > 0 && price.volume > avgVolume * this.volumeMultiplier;

    let signal: Signal = 'HOLD';

    // BUY: MACD crosses above signal line + volume confirmation
    if (!hasPosition && this.prevMacdLine <= signalLine && macdLine > signalLine && highVolume) {
      signal = 'BUY';
    }

    // SELL: MACD crosses below signal line
    if (hasPosition && this.prevMacdLine >= signalLine && macdLine < signalLine) {
      signal = 'SELL';
    }

    this.prevMacdLine = macdLine;
    return signal;
  }

  reset(): void {
    this.fastEma.reset();
    this.slowEma.reset();
    this.signalEma.reset();
    this.volumeManager = new PricesManager(20);
    this.prevMacdLine = 0;
    this.macdReady = false;
  }
}
