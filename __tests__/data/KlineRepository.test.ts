import {KlineRepository} from '../../src/data/KlineRepository';
import {BybitApi} from '../../src/api/BybitApi';
import {Price} from '../../src/models/Price';

// Mock MMKV
jest.mock('../../src/data/storage', () => {
  const store = new Map<string, string>();
  return {
    storage: {
      getString: (key: string) => store.get(key) ?? null,
      set: (key: string, value: string) => store.set(key, value),
      clearAll: () => store.clear(),
    },
  };
});

jest.mock('../../src/api/BybitApi');
const mockFetchAllKlines = BybitApi.fetchAllKlines as jest.MockedFunction<typeof BybitApi.fetchAllKlines>;

function makePrice(openTime: number): Price {
  return {
    openTime, symbol: 'BTCUSDT', interval: '3',
    open: 100, high: 101, low: 99, close: 100, volume: 50, turnover: 5000,
  };
}

describe('KlineRepository', () => {
  beforeEach(() => {
    KlineRepository.clearCache();
    mockFetchAllKlines.mockReset();
  });

  it('should fetch from API when cache is empty', async () => {
    const prices = [makePrice(1000), makePrice(2000), makePrice(3000)];
    mockFetchAllKlines.mockResolvedValueOnce(prices);

    const result = await KlineRepository.getKlines('BTCUSDT', '3', 1000, 4000);

    expect(result).toHaveLength(3);
    expect(mockFetchAllKlines).toHaveBeenCalledTimes(1);
  });

  it('should use cache for subset range (no new API call)', async () => {
    // Fetch 1000-5000 first
    mockFetchAllKlines.mockResolvedValueOnce([
      makePrice(1000), makePrice(2000), makePrice(3000), makePrice(4000),
    ]);
    await KlineRepository.getKlines('BTCUSDT', '3', 1000, 5000);

    // Request subset 2000-4000 → should be fully cached
    const result = await KlineRepository.getKlines('BTCUSDT', '3', 2000, 4000);

    expect(result).toHaveLength(2); // 2000, 3000 (< 4000)
    expect(mockFetchAllKlines).toHaveBeenCalledTimes(1); // No additional API call
  });

  it('should fetch only the right gap when extending range', async () => {
    mockFetchAllKlines.mockResolvedValueOnce([makePrice(1000), makePrice(2000)]);
    await KlineRepository.getKlines('BTCUSDT', '3', 1000, 3000);

    // Extend right: need 2001-6000
    mockFetchAllKlines.mockResolvedValueOnce([makePrice(3000), makePrice(4000), makePrice(5000)]);
    const result = await KlineRepository.getKlines('BTCUSDT', '3', 1000, 6000);

    expect(mockFetchAllKlines).toHaveBeenCalledTimes(2);
    // Second call should be for the gap
    expect(mockFetchAllKlines.mock.calls[1][0].start).toBe(2001);
    expect(result).toHaveLength(5);
  });

  it('should fetch only the left gap when extending backwards', async () => {
    mockFetchAllKlines.mockResolvedValueOnce([makePrice(3000), makePrice(4000)]);
    await KlineRepository.getKlines('BTCUSDT', '3', 3000, 5000);

    // Extend left: need 1000-3000
    mockFetchAllKlines
      .mockResolvedValueOnce([makePrice(1000), makePrice(2000)]) // left gap
      .mockResolvedValueOnce([]); // right gap (may be called)
    const result = await KlineRepository.getKlines('BTCUSDT', '3', 1000, 5000);

    expect(result).toHaveLength(4);
  });

  it('should keep separate caches per symbol+interval', async () => {
    mockFetchAllKlines.mockResolvedValueOnce([makePrice(1000)]);
    mockFetchAllKlines.mockResolvedValueOnce([makePrice(1000)]);

    await KlineRepository.getKlines('BTCUSDT', '3', 1000, 2000);
    await KlineRepository.getKlines('ETHUSDT', '3', 1000, 2000);

    expect(mockFetchAllKlines).toHaveBeenCalledTimes(2);
    expect(KlineRepository.getCacheStats().entries).toBe(2);
  });

  it('should clear cache', async () => {
    mockFetchAllKlines.mockResolvedValueOnce([makePrice(1000)]);
    await KlineRepository.getKlines('BTCUSDT', '3', 1000, 2000);

    KlineRepository.clearCache();
    expect(KlineRepository.getCacheStats().entries).toBe(0);
  });

  it('should call onProgress callback', async () => {
    mockFetchAllKlines.mockResolvedValueOnce([makePrice(1000)]);
    const progress: string[] = [];

    await KlineRepository.getKlines('BTCUSDT', '3', 1000, 2000, msg => progress.push(msg));

    expect(progress.length).toBeGreaterThan(0);
  });
});
