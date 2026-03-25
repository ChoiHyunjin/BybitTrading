import {Price} from '../models/Price';
import {EmaCalculator} from '../engine/EmaCalculator';
import {AtrCalculator} from '../engine/AtrCalculator';
import {Signal, TradingStrategy} from './TradingStrategy';

export class AtrChannelStrategy implements TradingStrategy {
  name = 'ATR Channel Breakout Strategy';
  warmupPeriod = 30; // max(emaPeriod, atrPeriod) + buffer

  private ema: EmaCalculator;
  private atr: AtrCalculator;
  private highs: number[] = [];
  private readonly emaPeriod: number;
  private readonly atrMultiplier: number;
  private readonly donchianPeriod: number;
  private entryPrice: number = 0;
  private trailingStop: number = 0;

  constructor(
    emaPeriod: number = 20,
    atrPeriod: number = 14,
    atrMultiplier: number = 2,
    donchianPeriod: number = 20,
  ) {
    this.emaPeriod = emaPeriod;
    this.ema = new EmaCalculator(emaPeriod);
    this.atr = new AtrCalculator(atrPeriod);
    this.atrMultiplier = atrMultiplier;
    this.donchianPeriod = donchianPeriod;
  }

  init(prices: number[]): void {
    for (const p of prices) {
      this.ema.push(p);
      this.atr.push(p * 1.005, p * 0.995, p); // Approximate H/L from close
      this.highs.push(p);
      if (this.highs.length > this.donchianPeriod) {
        this.highs.shift();
      }
    }
  }

  onPrice(price: Price, hasPosition: boolean): Signal {
    this.ema.push(price.close);
    this.atr.push(price.high, price.low, price.close);
    this.highs.push(price.high);
    if (this.highs.length > this.donchianPeriod) {
      this.highs.shift();
    }

    if (!this.ema.isReady() || !this.atr.isReady()) {
      return 'HOLD';
    }

    const emaValue = this.ema.getValue();
    const atrValue = this.atr.getValue();
    const upperChannel = emaValue + this.atrMultiplier * atrValue;
    const highestHigh = Math.max(...this.highs);

    // BUY: Close > upper Keltner channel AND close > Donchian high
    if (!hasPosition && price.close > upperChannel && price.close > highestHigh * 0.998) {
      this.entryPrice = price.close;
      this.trailingStop = price.close - 3 * atrValue;
      return 'BUY';
    }

    if (hasPosition) {
      // Update trailing stop
      const newStop = price.close - 3 * atrValue;
      if (newStop > this.trailingStop) {
        this.trailingStop = newStop;
      }

      // SELL: price below EMA or trailing stop hit
      if (price.close < emaValue || price.close < this.trailingStop) {
        this.entryPrice = 0;
        this.trailingStop = 0;
        return 'SELL';
      }
    }

    return 'HOLD';
  }

  reset(): void {
    this.ema.reset();
    this.atr.reset();
    this.highs = [];
    this.entryPrice = 0;
    this.trailingStop = 0;
  }
}
