import {Price} from '../models/Price';
import {BybitApi} from '../api/BybitApi';
import {storage} from './storage';

type CacheKey = string;

export interface FetchProgress {
  loaded: number;
  estimated: number;
  percent: number;
  message: string;
  fromCache: boolean;
}

function makeCacheKey(symbol: string, interval: string): CacheKey {
  return `${symbol}:${interval}`;
}

// L1: In-memory cache for fast access within session
const memCache = new Map<CacheKey, Price[]>();

function loadFromDisk(key: CacheKey): Price[] | null {
  try {
    const json = storage.getString(key);
    if (!json) {return null;}
    return JSON.parse(json) as Price[];
  } catch {
    return null;
  }
}

function saveToDisk(key: CacheKey, prices: Price[]): void {
  try {
    storage.set(key, JSON.stringify(prices));
  } catch {
    // Disk write failure is non-critical
  }
}

function getCache(key: CacheKey): Price[] | null {
  // L1: memory
  const mem = memCache.get(key);
  if (mem && mem.length > 0) {return mem;}

  // L2: MMKV disk
  const disk = loadFromDisk(key);
  if (disk && disk.length > 0) {
    memCache.set(key, disk); // Promote to L1
    return disk;
  }

  return null;
}

function setCache(key: CacheKey, prices: Price[]): void {
  memCache.set(key, prices);
  saveToDisk(key, prices);
}

function getCachedRange(key: CacheKey): {start: number; end: number} | null {
  const data = getCache(key);
  if (!data || data.length === 0) {return null;}
  return {start: data[0].openTime, end: data[data.length - 1].openTime};
}

function mergePrices(existing: Price[], newPrices: Price[]): Price[] {
  const map = new Map<number, Price>();
  for (const p of existing) {map.set(p.openTime, p);}
  for (const p of newPrices) {map.set(p.openTime, p);}
  return Array.from(map.values()).sort((a, b) => a.openTime - b.openTime);
}

export class KlineRepository {
  static async getKlines(
    symbol: string,
    interval: string,
    start: number,
    end: number,
    onProgress?: (progress: FetchProgress) => void,
  ): Promise<Price[]> {
    const key = makeCacheKey(symbol, interval);
    const cachedRange = getCachedRange(key);

    if (!cachedRange) {
      onProgress?.({loaded: 0, estimated: 0, percent: 0, message: '데이터를 불러오는 중...', fromCache: false});
      const prices = await BybitApi.fetchAllKlines({
        symbol, interval, start, end,
        onProgress: (loaded, estimated) => {
          const percent = estimated > 0 ? Math.min(Math.round((loaded / estimated) * 100), 99) : 0;
          onProgress?.({loaded, estimated, percent, message: `${loaded.toLocaleString()} / ~${estimated.toLocaleString()} 캔들`, fromCache: false});
        },
      });
      setCache(key, mergePrices([], prices));
      onProgress?.({loaded: prices.length, estimated: prices.length, percent: 100, message: `${prices.length.toLocaleString()}개 캔들 로드 완료`, fromCache: false});
      return prices;
    }

    const gaps: Array<{start: number; end: number}> = [];
    if (start < cachedRange.start) {gaps.push({start, end: cachedRange.start});}
    if (end > cachedRange.end) {gaps.push({start: cachedRange.end + 1, end});}

    if (gaps.length > 0) {
      const existing = getCache(key) || [];
      let allNew: Price[] = [];
      let totalLoaded = 0;

      for (let i = 0; i < gaps.length; i++) {
        const gap = gaps[i];
        const prices = await BybitApi.fetchAllKlines({
          symbol, interval, start: gap.start, end: gap.end,
          onProgress: (loaded, estimated) => {
            const percent = estimated > 0 ? Math.min(Math.round(((totalLoaded + loaded) / (totalLoaded + estimated)) * 100), 99) : 0;
            onProgress?.({
              loaded: totalLoaded + loaded, estimated: totalLoaded + estimated, percent,
              message: `갭 ${i + 1}/${gaps.length}: ${(totalLoaded + loaded).toLocaleString()} 캔들`,
              fromCache: false,
            });
          },
        });
        allNew = allNew.concat(prices);
        totalLoaded += prices.length;
      }

      const merged = mergePrices(existing, allNew);
      setCache(key, merged);
      onProgress?.({loaded: merged.length, estimated: merged.length, percent: 100, message: `${merged.length.toLocaleString()}개 캔들 (${allNew.length.toLocaleString()} 신규)`, fromCache: false});
    } else {
      const cachedData = getCache(key) || [];
      const count = cachedData.filter(p => p.openTime >= start && p.openTime < end).length;
      onProgress?.({loaded: count, estimated: count, percent: 100, message: `캐시: ${count.toLocaleString()}개 캔들`, fromCache: true});
    }

    const all = getCache(key) || [];
    return all.filter(p => p.openTime >= start && p.openTime < end);
  }

  static getCacheStats(): {entries: number; totalCandles: number} {
    let totalCandles = 0;
    for (const prices of memCache.values()) {
      totalCandles += prices.length;
    }
    return {entries: memCache.size, totalCandles};
  }

  static clearCache(): void {
    memCache.clear();
    storage.clearAll();
  }
}
