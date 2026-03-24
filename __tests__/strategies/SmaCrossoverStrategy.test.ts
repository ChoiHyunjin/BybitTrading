import {SmaCrossoverStrategy} from '../../src/strategies/SmaCrossoverStrategy';
import {Price} from '../../src/models/Price';

function makePrice(close: number): Price {
  return {
    openTime: 0, symbol: 'BTCUSDT', interval: '3',
    open: close, high: close, low: close, close, volume: 100, turnover: 0,
  };
}

describe('SmaCrossoverStrategy', () => {
  let strategy: SmaCrossoverStrategy;

  beforeEach(() => {
    strategy = new SmaCrossoverStrategy(3, 5);
  });

  it('should return HOLD when not enough data', () => {
    strategy.init([100, 100, 100]);
    expect(strategy.onPrice(makePrice(100), false)).toBe('HOLD');
  });

  it('should BUY on golden cross', () => {
    // Short MA < Long MA initially (low recent prices)
    strategy.init([120, 115, 110, 105, 100]);

    // Push sharply rising prices so short(3) MA crosses above long(5) MA
    let signal: string = 'HOLD';
    const rising = [95, 100, 130, 140, 150, 160];
    for (const p of rising) {
      signal = strategy.onPrice(makePrice(p), false);
      if (signal === 'BUY') { break; }
    }
    expect(signal).toBe('BUY');
  });

  it('should SELL on death cross', () => {
    // Short MA > Long MA initially (high recent prices)
    strategy.init([80, 85, 90, 95, 100]);

    // Push sharply falling prices so short(3) MA crosses below long(5) MA
    let signal: string = 'HOLD';
    const falling = [105, 100, 70, 60, 50, 40];
    for (const p of falling) {
      signal = strategy.onPrice(makePrice(p), true);
      if (signal === 'SELL') { break; }
    }
    expect(signal).toBe('SELL');
  });

  it('should not BUY when already has position', () => {
    strategy.init([120, 115, 110, 105, 100]);
    const rising = [95, 100, 130, 140, 150, 160];
    const signals = rising.map(p => strategy.onPrice(makePrice(p), true));
    // Even if golden cross conditions, should not BUY when holding
    expect(signals.every(s => s !== 'BUY')).toBe(true);
  });

  it('should reset cleanly', () => {
    strategy.init([100, 100, 100, 100, 100]);
    strategy.onPrice(makePrice(120), false);
    strategy.reset();
    expect(strategy.onPrice(makePrice(100), false)).toBe('HOLD');
  });
});
