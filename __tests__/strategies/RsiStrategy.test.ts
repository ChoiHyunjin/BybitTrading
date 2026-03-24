import {RsiStrategy} from '../../src/strategies/RsiStrategy';
import {Price} from '../../src/models/Price';

function makePrice(close: number): Price {
  return {
    openTime: 0, symbol: 'BTCUSDT', interval: '3',
    open: close, high: close, low: close, close, volume: 100, turnover: 0,
  };
}

describe('RsiStrategy', () => {
  let strategy: RsiStrategy;

  beforeEach(() => {
    strategy = new RsiStrategy(14, 30, 70);
  });

  it('should return HOLD when not enough data', () => {
    strategy.init([100, 101, 102]);
    expect(strategy.onPrice(makePrice(103), false)).toBe('HOLD');
  });

  it('should BUY when RSI is oversold', () => {
    // Create a series of declining prices to push RSI below 30
    const declining = Array.from({length: 15}, (_, i) => 100 - i * 2);
    strategy.init(declining);

    // Push more declining prices
    let signal = 'HOLD';
    for (let i = 0; i < 5; i++) {
      signal = strategy.onPrice(makePrice(declining[declining.length - 1] - (i + 1) * 3), false);
      if (signal === 'BUY') { break; }
    }
    expect(signal).toBe('BUY');
  });

  it('should SELL when RSI is overbought', () => {
    // Create a series of rising prices to push RSI above 70
    const rising = Array.from({length: 15}, (_, i) => 100 + i * 2);
    strategy.init(rising);

    // Push more rising prices
    let signal = 'HOLD';
    for (let i = 0; i < 5; i++) {
      signal = strategy.onPrice(makePrice(rising[rising.length - 1] + (i + 1) * 3), true);
      if (signal === 'SELL') { break; }
    }
    expect(signal).toBe('SELL');
  });

  it('should not SELL when no position', () => {
    const rising = Array.from({length: 15}, (_, i) => 100 + i * 2);
    strategy.init(rising);

    // Even with RSI high, should not sell without position
    for (let i = 0; i < 5; i++) {
      const signal = strategy.onPrice(makePrice(rising[rising.length - 1] + (i + 1) * 3), false);
      expect(signal).not.toBe('SELL');
    }
  });

  it('should return RSI=100 when no losses', () => {
    const rising = Array.from({length: 20}, (_, i) => 100 + i);
    strategy.init(rising);
    // All gains, no losses → RSI = 100 → should SELL if holding
    const signal = strategy.onPrice(makePrice(125), true);
    expect(signal).toBe('SELL');
  });

  it('should reset cleanly', () => {
    strategy.init(Array.from({length: 20}, (_, i) => 100 + i));
    strategy.reset();
    expect(strategy.onPrice(makePrice(100), false)).toBe('HOLD');
  });
});
