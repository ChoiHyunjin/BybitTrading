import {Price} from '../models/Price';

const BASE_URL = 'https://api.bybit.com';

export interface KlineParams {
  symbol: string;
  interval: string;
  start?: number;
  end?: number;
  limit?: number;
}

export interface KlineRangeParams {
  symbol: string;
  interval: string;
  start: number;
  end: number;
}

interface BybitKlineResponse {
  retCode: number;
  retMsg: string;
  result: {
    symbol: string;
    category: string;
    list: string[][];
  };
}

function parseKlineRow(row: string[], symbol: string, interval: string): Price {
  return {
    openTime: parseInt(row[0], 10),
    symbol,
    interval,
    open: parseFloat(row[1]),
    high: parseFloat(row[2]),
    low: parseFloat(row[3]),
    close: parseFloat(row[4]),
    volume: parseFloat(row[5]),
    turnover: parseFloat(row[6]),
  };
}

export class BybitApi {
  static async fetchKlines(params: KlineParams): Promise<Price[]> {
    const query = new URLSearchParams({
      category: 'linear',
      symbol: params.symbol,
      interval: params.interval,
      ...(params.start != null && {start: params.start.toString()}),
      ...(params.end != null && {end: params.end.toString()}),
      ...(params.limit != null && {limit: params.limit.toString()}),
    });

    const url = `${BASE_URL}/v5/market/kline?${query.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.status} ${response.statusText}`);
    }

    const data: BybitKlineResponse = await response.json();

    if (data.retCode !== 0) {
      throw new Error(`Bybit API retCode: ${data.retCode}, msg: ${data.retMsg}`);
    }

    const prices = data.result.list.map(row =>
      parseKlineRow(row, params.symbol, params.interval),
    );

    // API returns newest first, reverse to chronological order
    return prices.reverse();
  }

  static async fetchAllKlines(params: KlineRangeParams): Promise<Price[]> {
    const allPrices: Price[] = [];
    const limit = 200;
    let currentStart = params.start;

    while (currentStart < params.end) {
      const prices = await BybitApi.fetchKlines({
        symbol: params.symbol,
        interval: params.interval,
        start: currentStart,
        end: params.end,
        limit,
      });

      if (prices.length === 0) {
        break;
      }

      allPrices.push(...prices);

      // Move start to after the last received candle
      const lastTime = prices[prices.length - 1].openTime;
      if (lastTime <= currentStart) {
        break; // Prevent infinite loop
      }
      currentStart = lastTime + 1;
    }

    return allPrices;
  }
}
