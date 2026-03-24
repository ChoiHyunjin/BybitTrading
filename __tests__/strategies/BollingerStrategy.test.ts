import {BollingerStrategy} from '../../src/strategies/BollingerStrategy';
import {Price} from '../../src/models/Price';

function makePrice(close: number, openTime: number = 0): Price {
  return {
    openTime,
    symbol: 'BTCUSDT',
    interval: '3',
    open: close,
    high: close,
    low: close,
    close,
    volume: 100,
    turnover: close * 100,
  };
}

describe('BollingerStrategy', () => {
  let strategy: BollingerStrategy;

  beforeEach(() => {
    strategy = new BollingerStrategy(20, 2, 6, 20);
  });

  it('should return HOLD when not initialized', () => {
    const signal = strategy.onPrice(makePrice(100), false);
    expect(signal).toBe('HOLD');
  });

  it('should return HOLD during normal conditions', () => {
    const prices = Array.from({length: 20}, () => 100);
    strategy.init(prices);

    const signal = strategy.onPrice(makePrice(100), false);
    expect(signal).toBe('HOLD');
  });

  it('should implement TradingStrategy interface', () => {
    expect(strategy.name).toBe('Bollinger Band Strategy');
    expect(typeof strategy.init).toBe('function');
    expect(typeof strategy.onPrice).toBe('function');
    expect(typeof strategy.reset).toBe('function');
  });

  it('should reset to clean state', () => {
    const prices = Array.from({length: 20}, () => 100);
    strategy.init(prices);
    strategy.onPrice(makePrice(50), false); // trigger some state
    strategy.reset();

    // After reset, should behave as fresh
    const signal = strategy.onPrice(makePrice(100), false);
    expect(signal).toBe('HOLD');
  });
});
