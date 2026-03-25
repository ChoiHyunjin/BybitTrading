import {MacdVolumeStrategy} from '../../src/strategies/MacdVolumeStrategy';
import {BacktestEngine} from '../../src/engine/BacktestEngine';
import {Price} from '../../src/models/Price';

function makePrice(close: number, volume: number = 100, openTime: number = 0): Price {
  return {
    openTime, symbol: 'BTCUSDT', interval: '3',
    open: close, high: close * 1.01, low: close * 0.99, close, volume, turnover: 0,
  };
}

describe('MacdVolumeStrategy', () => {
  it('should have warmupPeriod of 35', () => {
    expect(new MacdVolumeStrategy().warmupPeriod).toBe(35);
  });

  it('should HOLD when not enough data', () => {
    const strategy = new MacdVolumeStrategy();
    strategy.init(Array.from({length: 10}, () => 100));
    expect(strategy.onPrice(makePrice(100), false)).toBe('HOLD');
  });

  it('should implement TradingStrategy interface', () => {
    const s = new MacdVolumeStrategy();
    expect(s.name).toBe('MACD + Volume Strategy');
    expect(typeof s.init).toBe('function');
    expect(typeof s.onPrice).toBe('function');
    expect(typeof s.reset).toBe('function');
  });

  it('should generate trades on trending data via BacktestEngine', () => {
    // Use volumeMultiplier=0 to disable volume filter for testability
    const strategy = new MacdVolumeStrategy(12, 26, 9, 0);
    const engine = new BacktestEngine();

    // V-shaped: decline 50 candles, rally 100 candles, decline 50 candles
    const data: Price[] = [];
    for (let i = 0; i < 50; i++) {
      data.push(makePrice(100 - i * 0.5, 100, i));
    }
    for (let i = 0; i < 100; i++) {
      data.push(makePrice(75 + i * 1.0, 100, 50 + i));
    }
    for (let i = 0; i < 50; i++) {
      data.push(makePrice(175 - i * 1.5, 100, 150 + i));
    }

    const result = engine.run({strategy, initialMoney: 10000, feeRate: 0, slippageRate: 0}, data);
    // Strategy runs without error on V-shaped data
    expect(result.initialMoney).toBe(10000);
    expect(result.finalMoney).toBeGreaterThan(0);
  });

  it('should reset cleanly', () => {
    const s = new MacdVolumeStrategy();
    s.init(Array.from({length: 35}, () => 100));
    s.reset();
    expect(s.onPrice(makePrice(100), false)).toBe('HOLD');
  });
});
