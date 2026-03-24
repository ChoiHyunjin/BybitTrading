import {Price} from '../models/Price';
import {Trade} from '../models/Trade';
import {BacktestResult, calculateBacktestResult} from '../models/BacktestResult';
import {TradingStrategy} from '../strategies/TradingStrategy';

export interface BacktestConfig {
  strategy: TradingStrategy;
  initialMoney: number;
}

export class BacktestEngine {
  run(config: BacktestConfig, data: Price[]): BacktestResult {
    const {strategy, initialMoney} = config;

    let money = initialMoney;
    let amount = 0;
    let boughtPrice = 0;
    const trades: Trade[] = [];

    // Use first N prices for indicator initialization
    const initSize = 20;
    if (data.length <= initSize) {
      return calculateBacktestResult(initialMoney, money, 0, 0, []);
    }

    const initPrices = data.slice(0, initSize).map(p => p.close);
    strategy.init(initPrices);

    const tradingData = data.slice(initSize);

    for (const price of tradingData) {
      const hasPosition = amount > 0;
      const signal = strategy.onPrice(price, hasPosition);

      if (signal === 'BUY' && !hasPosition) {
        const buyAmount = Math.floor((money / price.close) * 1000) / 1000;
        if (buyAmount > 0) {
          money -= price.close * buyAmount;
          boughtPrice = price.close;
          amount = buyAmount;

          trades.push({
            action: 'BUY',
            price: price.close,
            amount: buyAmount,
            timestamp: price.openTime,
            money,
          });
        }
      } else if (signal === 'SELL' && hasPosition) {
        const sellMoney = price.close * amount;
        const pnl = (price.close - boughtPrice) * amount;
        const pnlPercent = ((price.close - boughtPrice) / boughtPrice) * 100;
        money += sellMoney;

        trades.push({
          action: 'SELL',
          price: price.close,
          amount,
          timestamp: price.openTime,
          money,
          pnl,
          pnlPercent,
        });

        amount = 0;
        boughtPrice = 0;
      }
    }

    const lastPrice = tradingData.length > 0 ? tradingData[tradingData.length - 1].close : 0;
    return calculateBacktestResult(initialMoney, money, lastPrice, amount, trades);
  }
}
