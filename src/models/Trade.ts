export type TradeAction = 'BUY' | 'SELL';

export interface Trade {
  action: TradeAction;
  price: number;
  amount: number;
  timestamp: number;
  money: number;
  pnl?: number;
  pnlPercent?: number;
}
