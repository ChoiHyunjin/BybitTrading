import {Price} from '../models/Price';

export type Signal = 'BUY' | 'SELL' | 'HOLD';

export interface TradingStrategy {
  name: string;
  init(prices: number[]): void;
  onPrice(price: Price, hasPosition: boolean): Signal;
  reset(): void;
}
