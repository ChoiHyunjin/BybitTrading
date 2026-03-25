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
  onProgress?: (loaded: number, estimatedTotal: number) => void;
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

function estimateTotalCandles(start: number, end: number, interval: string): number {
  const intervalMs: Record<string, number> = {
    '1': 60_000,
    '3': 180_000,
    '5': 300_000,
    '15': 900_000,
    '30': 1_800_000,
    '60': 3_600_000,
    '120': 7_200_000,
    '240': 14_400_000,
    '360': 21_600_000,
    '720': 43_200_000,
    D: 86_400_000,
    W: 604_800_000,
    M: 2_592_000_000,
  };
  const ms = intervalMs[interval] || 180_000;
  return Math.ceil((end - start) / ms);
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
    const estimated = estimateTotalCandles(params.start, params.end, params.interval);

    while (currentStart < params.end) {
      const prices = await BybitApi.fetchKlines({
        symbol: params.symbol,
        interval: params.interval,
        start: currentStart,
        limit,
      });

      if (prices.length === 0) {
        break;
      }

      const filtered = prices.filter(p => p.openTime < params.end);
      allPrices.push(...filtered);

      params.onProgress?.(allPrices.length, estimated);

      if (filtered.length < prices.length) {
        break;
      }

      const lastTime = prices[prices.length - 1].openTime;
      if (lastTime <= currentStart) {
        break;
      }
      currentStart = lastTime + 1;
    }

    return allPrices;
  }
}
