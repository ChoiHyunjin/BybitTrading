import {MultiFactorStrategy} from '../../src/strategies/MultiFactorStrategy';
import {Price} from '../../src/models/Price';

function makePrice(close: number, high?: number, low?: number, volume: number = 100): Price {
  return {
    openTime: 0, symbol: 'BTCUSDT', interval: '3',
    open: close, high: high ?? close * 1.01, low: low ?? close * 0.99,
    close, volume, turnover: 0,
  };
}

describe('MultiFactorStrategy', () => {
  let strategy: MultiFactorStrategy;

  beforeEach(() => {
    strategy = new MultiFactorStrategy();
  });

  it('should HOLD when not enough data', () => {
    strategy.init(Array.from({length: 20}, () => 100));
    expect(strategy.onPrice(makePrice(100), false)).toBe('HOLD');
  });

  it('should have warmupPeriod of 50', () => {
    expect(strategy.warmupPeriod).toBe(50);
  });

  it('should implement TradingStrategy interface', () => {
    expect(strategy.name).toBe('Multi-Factor Scoring Strategy');
    expect(typeof strategy.init).toBe('function');
    expect(typeof strategy.onPrice).toBe('function');
    expect(typeof strategy.reset).toBe('function');
  });

  it('should SELL after max hold period', () => {
    const prices = Array.from({length: 50}, () => 100);
    strategy.init(prices);

    // Simulate holding for maxHoldCandles (50)
    let signal = 'HOLD';
    for (let i = 0; i < 55; i++) {
      signal = strategy.onPrice(makePrice(100, 101, 99, 100), true);
      if (signal === 'SELL') { break; }
    }
    expect(signal).toBe('SELL');
  });

  it('should reset cleanly', () => {
    strategy.init(Array.from({length: 50}, () => 100));
    strategy.reset();
    expect(strategy.onPrice(makePrice(100), false)).toBe('HOLD');
  });
});
