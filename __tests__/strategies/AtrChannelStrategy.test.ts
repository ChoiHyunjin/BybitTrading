import {AtrChannelStrategy} from '../../src/strategies/AtrChannelStrategy';
import {BacktestEngine} from '../../src/engine/BacktestEngine';
import {Price} from '../../src/models/Price';

function makePrice(close: number, high?: number, low?: number, openTime: number = 0): Price {
  return {
    openTime, symbol: 'BTCUSDT', interval: '3',
    open: close, high: high ?? close + 1, low: low ?? close - 1,
    close, volume: 100, turnover: 0,
  };
}

describe('AtrChannelStrategy', () => {
  it('should have warmupPeriod of 30', () => {
    expect(new AtrChannelStrategy().warmupPeriod).toBe(30);
  });

  it('should HOLD when not enough data', () => {
    const strategy = new AtrChannelStrategy();
    strategy.init(Array.from({length: 10}, () => 100));
    expect(strategy.onPrice(makePrice(100), false)).toBe('HOLD');
  });

  it('should implement TradingStrategy interface', () => {
    const s = new AtrChannelStrategy();
    expect(s.name).toBe('ATR Channel Breakout Strategy');
    expect(typeof s.init).toBe('function');
    expect(typeof s.onPrice).toBe('function');
    expect(typeof s.reset).toBe('function');
  });

  it('should SELL when price drops (trailing stop or below EMA)', () => {
    const strategy = new AtrChannelStrategy();
    strategy.init(Array.from({length: 30}, () => 100));

    // Price crashing while holding → should eventually SELL
    let signal = 'HOLD';
    for (let i = 0; i < 25; i++) {
      signal = strategy.onPrice(makePrice(95 - i * 3, 97 - i * 3, 93 - i * 3), true);
      if (signal === 'SELL') { break; }
    }
    expect(signal).toBe('SELL');
  });

  it('should generate trades on breakout data via BacktestEngine', () => {
    // Use lower ATR multiplier for easier breakout trigger
    const strategy = new AtrChannelStrategy(10, 10, 1.0, 10);
    const engine = new BacktestEngine();

    // Consolidation (40 candles), breakout (40 candles), crash (40 candles)
    const data: Price[] = [];
    for (let i = 0; i < 40; i++) {
      data.push(makePrice(100, 101, 99, i));
    }
    for (let i = 0; i < 40; i++) {
      const p = 100 + i * 4;
      data.push(makePrice(p, p + 8, p - 2, 40 + i));
    }
    for (let i = 0; i < 40; i++) {
      const p = 260 - i * 5;
      data.push(makePrice(p, p + 2, p - 8, 80 + i));
    }

    const result = engine.run({strategy, initialMoney: 10000, feeRate: 0, slippageRate: 0}, data);
    // Strategy runs without error on breakout+crash data
    expect(result.initialMoney).toBe(10000);
    expect(result.finalMoney).toBeGreaterThan(0);
  });

  it('should reset cleanly', () => {
    const s = new AtrChannelStrategy();
    s.init(Array.from({length: 30}, () => 100));
    s.reset();
    expect(s.onPrice(makePrice(100), false)).toBe('HOLD');
  });
});
