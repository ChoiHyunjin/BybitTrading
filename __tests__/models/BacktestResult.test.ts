import {calculateBacktestResult} from '../../src/models/BacktestResult';
import {Trade} from '../../src/models/Trade';

describe('calculateBacktestResult', () => {
  it('should calculate result with winning trades', () => {
    const trades: Trade[] = [
      {action: 'BUY', price: 100, amount: 1, timestamp: 1000, money: 0},
      {action: 'SELL', price: 120, amount: 1, timestamp: 2000, money: 120, pnl: 20, pnlPercent: 20},
      {action: 'BUY', price: 110, amount: 1, timestamp: 3000, money: 10},
      {action: 'SELL', price: 130, amount: 1, timestamp: 4000, money: 140, pnl: 20, pnlPercent: 18.18},
    ];

    const result = calculateBacktestResult(100, 140, 0, 0, trades);

    expect(result.totalReturn).toBeCloseTo(40, 2);
    expect(result.winRate).toBeCloseTo(100, 2);
    expect(result.totalTrades).toBe(2);
    expect(result.winTrades).toBe(2);
    expect(result.loseTrades).toBe(0);
  });

  it('should calculate result with mixed trades', () => {
    const trades: Trade[] = [
      {action: 'BUY', price: 100, amount: 1, timestamp: 1000, money: 0},
      {action: 'SELL', price: 80, amount: 1, timestamp: 2000, money: 80, pnl: -20, pnlPercent: -20},
      {action: 'BUY', price: 70, amount: 1, timestamp: 3000, money: 10},
      {action: 'SELL', price: 120, amount: 1, timestamp: 4000, money: 130, pnl: 50, pnlPercent: 71.43},
    ];

    const result = calculateBacktestResult(100, 130, 0, 0, trades);

    expect(result.totalReturn).toBeCloseTo(30, 2);
    expect(result.winRate).toBeCloseTo(50, 2);
    expect(result.totalTrades).toBe(2);
    expect(result.winTrades).toBe(1);
    expect(result.loseTrades).toBe(1);
    expect(result.maxDrawdown).toBeGreaterThan(0);
  });

  it('should calculate MDD correctly', () => {
    const trades: Trade[] = [
      {action: 'BUY', price: 100, amount: 1, timestamp: 1000, money: 0},
      {action: 'SELL', price: 150, amount: 1, timestamp: 2000, money: 150, pnl: 50, pnlPercent: 50},
      {action: 'BUY', price: 140, amount: 1, timestamp: 3000, money: 10},
      {action: 'SELL', price: 100, amount: 1, timestamp: 4000, money: 110, pnl: -40, pnlPercent: -28.57},
    ];

    const result = calculateBacktestResult(100, 110, 0, 0, trades);

    // Peak = 150, trough = 110, MDD = (150-110)/150 = 26.67%
    expect(result.maxDrawdown).toBeCloseTo(26.67, 1);
  });

  it('should account for unrealized holdings in final money', () => {
    const trades: Trade[] = [
      {action: 'BUY', price: 100, amount: 1, timestamp: 1000, money: 0},
    ];

    // Still holding 1 coin at current price 120
    const result = calculateBacktestResult(100, 0, 120, 1, trades);

    expect(result.finalMoney).toBe(120);
    expect(result.totalReturn).toBeCloseTo(20, 2);
    expect(result.totalTrades).toBe(0); // No completed (sell) trades
  });

  it('should return 0 winRate when no trades', () => {
    const result = calculateBacktestResult(100, 100, 0, 0, []);

    expect(result.winRate).toBe(0);
    expect(result.totalTrades).toBe(0);
    expect(result.maxDrawdown).toBe(0);
  });
});
