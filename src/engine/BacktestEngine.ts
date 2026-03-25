import {Price} from '../models/Price';
import {Trade} from '../models/Trade';
import {BacktestResult, calculateBacktestResult} from '../models/BacktestResult';
import {TradingStrategy} from '../strategies/TradingStrategy';

export interface BacktestConfig {
  strategy: TradingStrategy;
  initialMoney: number;
  feeRate?: number; // e.g., 0.001 = 0.1% per trade (taker fee)
  slippageRate?: number; // e.g., 0.0005 = 0.05% slippage
}

const DEFAULT_FEE_RATE = 0.001; // 0.1% Bybit taker fee
const DEFAULT_SLIPPAGE_RATE = 0.0005; // 0.05% slippage

export class BacktestEngine {
  run(config: BacktestConfig, data: Price[]): BacktestResult {
    const {strategy, initialMoney} = config;
    const feeRate = config.feeRate ?? DEFAULT_FEE_RATE;
    const slippageRate = config.slippageRate ?? DEFAULT_SLIPPAGE_RATE;

    let money = initialMoney;
    let amount = 0;
    let boughtPrice = 0;
    const trades: Trade[] = [];

    // Use strategy's declared warm-up period
    const initSize = strategy.warmupPeriod;
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
        // Apply slippage: buy at slightly higher price
        const execPrice = price.close * (1 + slippageRate);
        const fee = money * feeRate;
        const availableMoney = money - fee;
        const buyAmount = Math.floor((availableMoney / execPrice) * 1000) / 1000;

        if (buyAmount > 0) {
          money -= execPrice * buyAmount + fee;
          boughtPrice = execPrice;
          amount = buyAmount;

          trades.push({
            action: 'BUY',
            price: execPrice,
            amount: buyAmount,
            timestamp: price.openTime,
            money,
          });
        }
      } else if (signal === 'SELL' && hasPosition) {
        // Apply slippage: sell at slightly lower price
        const execPrice = price.close * (1 - slippageRate);
        const sellMoney = execPrice * amount;
        const fee = sellMoney * feeRate;
        const pnl = (execPrice - boughtPrice) * amount - fee;
        const pnlPercent = ((execPrice - boughtPrice) / boughtPrice) * 100;
        money += sellMoney - fee;

        trades.push({
          action: 'SELL',
          price: execPrice,
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
