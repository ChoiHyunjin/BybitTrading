import {Trade} from './Trade';

export interface BacktestResult {
  initialMoney: number;
  finalMoney: number;
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  winTrades: number;
  loseTrades: number;
  trades: Trade[];
  peakMoney: number;
}

export function calculateBacktestResult(
  initialMoney: number,
  finalMoney: number,
  currentPrice: number,
  currentAmount: number,
  trades: Trade[],
): BacktestResult {
  const adjustedFinalMoney = finalMoney + currentAmount * currentPrice;
  const totalReturn = ((adjustedFinalMoney - initialMoney) / initialMoney) * 100;

  const sellTrades = trades.filter(t => t.action === 'SELL');
  const winTrades = sellTrades.filter(t => (t.pnl ?? 0) > 0).length;
  const loseTrades = sellTrades.filter(t => (t.pnl ?? 0) <= 0).length;
  const totalTrades = sellTrades.length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

  let peakMoney = initialMoney;
  let maxDrawdown = 0;
  let runningMoney = initialMoney;

  for (const trade of trades) {
    runningMoney = trade.money;
    if (trade.action === 'SELL') {
      if (runningMoney > peakMoney) {
        peakMoney = runningMoney;
      }
      const drawdown = ((peakMoney - runningMoney) / peakMoney) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return {
    initialMoney,
    finalMoney: adjustedFinalMoney,
    totalReturn,
    winRate,
    maxDrawdown,
    totalTrades,
    winTrades,
    loseTrades,
    trades,
    peakMoney,
  };
}
