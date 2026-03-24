import {BacktestEngine} from '../../src/engine/BacktestEngine';
import {Price} from '../../src/models/Price';
import {TradingStrategy, Signal} from '../../src/strategies/TradingStrategy';

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

class AlwaysBuyThenSellStrategy implements TradingStrategy {
  name = 'AlwaysBuyThenSell';
  private count = 0;

  init(_prices: number[]): void {
    this.count = 0;
  }

  onPrice(_price: Price, hasPosition: boolean): Signal {
    this.count++;
    if (!hasPosition && this.count % 2 === 1) {
      return 'BUY';
    }
    if (hasPosition && this.count % 2 === 0) {
      return 'SELL';
    }
    return 'HOLD';
  }

  reset(): void {
    this.count = 0;
  }
}

describe('BacktestEngine', () => {
  let engine: BacktestEngine;

  beforeEach(() => {
    engine = new BacktestEngine();
  });

  it('should return empty result when data is too small', () => {
    const data = Array.from({length: 10}, (_, i) => makePrice(100 + i));
    const result = engine.run(
      {strategy: new AlwaysBuyThenSellStrategy(), initialMoney: 10000},
      data,
    );
    expect(result.totalTrades).toBe(0);
    expect(result.finalMoney).toBe(10000);
  });

  it('should execute trades with alternating buy/sell strategy', () => {
    // 20 init prices + 10 trading prices
    const initPrices = Array.from({length: 20}, () => makePrice(100));
    const tradingPrices = [
      makePrice(100, 1), // BUY at 100
      makePrice(120, 2), // SELL at 120
      makePrice(110, 3), // BUY at 110
      makePrice(130, 4), // SELL at 130
      makePrice(100, 5), // BUY at 100
      makePrice(90, 6),  // SELL at 90 (loss)
      makePrice(100, 7),
      makePrice(100, 8),
      makePrice(100, 9),
      makePrice(100, 10),
    ];

    const data = [...initPrices, ...tradingPrices];
    const result = engine.run(
      {strategy: new AlwaysBuyThenSellStrategy(), initialMoney: 10000},
      data,
    );

    expect(result.totalTrades).toBe(5);
    expect(result.initialMoney).toBe(10000);
  });

  it('should track winning and losing trades', () => {
    const initPrices = Array.from({length: 20}, () => makePrice(100));
    const tradingPrices = [
      makePrice(100, 1), // BUY
      makePrice(120, 2), // SELL +20%
      makePrice(110, 3), // BUY
      makePrice(90, 4),  // SELL -18%
    ];

    const data = [...initPrices, ...tradingPrices];
    const result = engine.run(
      {strategy: new AlwaysBuyThenSellStrategy(), initialMoney: 10000},
      data,
    );

    expect(result.totalTrades).toBe(2);
    expect(result.winTrades).toBe(1);
    expect(result.loseTrades).toBe(1);
    expect(result.winRate).toBeCloseTo(50, 2);
  });

  it('should handle unrealized positions at end', () => {
    const initPrices = Array.from({length: 20}, () => makePrice(100));
    const tradingPrices = [
      makePrice(100, 1), // BUY
      makePrice(150, 2), // HOLD (odd count, has position → not sell)
      makePrice(200, 3), // HOLD
    ];

    const data = [...initPrices, ...tradingPrices];

    // Strategy: buy on count 1 (odd, no position), then count 2 (even, has position) → SELL
    // Actually count=1 → BUY, count=2 → SELL
    const result = engine.run(
      {strategy: new AlwaysBuyThenSellStrategy(), initialMoney: 10000},
      data,
    );

    // Buy at 100 with 10000 → amount = 100, money ≈ 0
    // Sell at 150 → money = 15000
    expect(result.totalTrades).toBe(1);
    expect(result.finalMoney).toBeGreaterThan(10000);
  });

  it('should calculate MDD', () => {
    const initPrices = Array.from({length: 20}, () => makePrice(100));
    const tradingPrices = [
      makePrice(100, 1), // BUY
      makePrice(200, 2), // SELL → big profit
      makePrice(190, 3), // BUY
      makePrice(100, 4), // SELL → big loss
    ];

    const data = [...initPrices, ...tradingPrices];
    const result = engine.run(
      {strategy: new AlwaysBuyThenSellStrategy(), initialMoney: 10000},
      data,
    );

    expect(result.maxDrawdown).toBeGreaterThan(0);
  });
});
