import {Price} from '../models/Price';
import {BybitApi} from '../api/BybitApi';

type CacheKey = string;

function makeCacheKey(symbol: string, interval: string): CacheKey {
  return `${symbol}:${interval}`;
}

// In-memory cache: symbol:interval → sorted Price[]
const cache = new Map<CacheKey, Price[]>();

function getCachedRange(key: CacheKey): {start: number; end: number} | null {
  const data = cache.get(key);
  if (!data || data.length === 0) {
    return null;
  }
  return {
    start: data[0].openTime,
    end: data[data.length - 1].openTime,
  };
}

function mergePrices(existing: Price[], newPrices: Price[]): Price[] {
  const map = new Map<number, Price>();
  for (const p of existing) {
    map.set(p.openTime, p);
  }
  for (const p of newPrices) {
    map.set(p.openTime, p);
  }
  return Array.from(map.values()).sort((a, b) => a.openTime - b.openTime);
}

export class KlineRepository {
  static async getKlines(
    symbol: string,
    interval: string,
    start: number,
    end: number,
    onProgress?: (message: string) => void,
  ): Promise<Price[]> {
    const key = makeCacheKey(symbol, interval);
    const cachedRange = getCachedRange(key);

    if (!cachedRange) {
      // Case 1: No cache — fetch all
      onProgress?.('데이터를 불러오는 중...');
      const prices = await BybitApi.fetchAllKlines({symbol, interval, start, end});
      cache.set(key, mergePrices([], prices));
      return prices;
    }

    const gaps: Array<{start: number; end: number}> = [];

    // Case 3: Left gap
    if (start < cachedRange.start) {
      gaps.push({start, end: cachedRange.start});
    }

    // Case 4: Right gap
    if (end > cachedRange.end) {
      gaps.push({start: cachedRange.end + 1, end});
    }

    // Fetch gaps
    if (gaps.length > 0) {
      onProgress?.(`${gaps.length}개 구간 추가 데이터 수집 중...`);
      const existing = cache.get(key) || [];
      let allNew: Price[] = [];

      for (const gap of gaps) {
        const prices = await BybitApi.fetchAllKlines({
          symbol,
          interval,
          start: gap.start,
          end: gap.end,
        });
        allNew = allNew.concat(prices);
      }

      const merged = mergePrices(existing, allNew);
      cache.set(key, merged);
    } else {
      onProgress?.('캐시에서 데이터 로드 중...');
    }

    // Return slice for requested range
    const all = cache.get(key) || [];
    return all.filter(p => p.openTime >= start && p.openTime < end);
  }

  static getCacheStats(): {entries: number; totalCandles: number} {
    let totalCandles = 0;
    for (const prices of cache.values()) {
      totalCandles += prices.length;
    }
    return {entries: cache.size, totalCandles};
  }

  static clearCache(): void {
    cache.clear();
  }
}
