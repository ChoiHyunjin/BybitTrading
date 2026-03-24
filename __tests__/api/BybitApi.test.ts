import {BybitApi} from '../../src/api/BybitApi';

// Mock fetch globally
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

function makeMockResponse(list: string[][]) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        retCode: 0,
        retMsg: 'OK',
        result: {
          symbol: 'BTCUSDT',
          category: 'linear',
          list,
        },
      }),
  };
}

describe('BybitApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchKlines', () => {
    it('should fetch and parse kline data in chronological order', async () => {
      // API returns newest first
      mockFetch.mockResolvedValueOnce(
        makeMockResponse([
          ['1700002000', '37000', '37500', '36500', '37200', '100', '3700000'],
          ['1700001000', '36000', '36500', '35500', '36200', '90', '3240000'],
        ]),
      );

      const prices = await BybitApi.fetchKlines({
        symbol: 'BTCUSDT',
        interval: '3',
      });

      expect(prices).toHaveLength(2);
      // Should be reversed to chronological order
      expect(prices[0].openTime).toBe(1700001000);
      expect(prices[1].openTime).toBe(1700002000);
      expect(prices[0].close).toBe(36200);
      expect(prices[1].close).toBe(37200);
      expect(prices[0].symbol).toBe('BTCUSDT');
    });

    it('should include query parameters in URL', async () => {
      mockFetch.mockResolvedValueOnce(makeMockResponse([]));

      await BybitApi.fetchKlines({
        symbol: 'ETHUSDT',
        interval: '5',
        start: 1000,
        end: 2000,
        limit: 100,
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('symbol=ETHUSDT');
      expect(calledUrl).toContain('interval=5');
      expect(calledUrl).toContain('start=1000');
      expect(calledUrl).toContain('end=2000');
      expect(calledUrl).toContain('limit=100');
    });

    it('should throw on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        BybitApi.fetchKlines({symbol: 'BTCUSDT', interval: '3'}),
      ).rejects.toThrow('Bybit API error: 500');
    });

    it('should throw on API retCode error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            retCode: 10001,
            retMsg: 'params error',
            result: {list: []},
          }),
      });

      await expect(
        BybitApi.fetchKlines({symbol: 'BTCUSDT', interval: '3'}),
      ).rejects.toThrow('retCode: 10001');
    });
  });

  describe('fetchAllKlines', () => {
    it('should paginate through all data', async () => {
      // First page
      mockFetch.mockResolvedValueOnce(
        makeMockResponse([
          ['2000', '100', '110', '90', '105', '50', '5000'],
          ['1000', '100', '110', '90', '100', '50', '5000'],
        ]),
      );
      // Second page
      mockFetch.mockResolvedValueOnce(
        makeMockResponse([
          ['3000', '100', '110', '90', '108', '50', '5000'],
        ]),
      );
      // Empty page → stop
      mockFetch.mockResolvedValueOnce(makeMockResponse([]));

      const prices = await BybitApi.fetchAllKlines({
        symbol: 'BTCUSDT',
        interval: '3',
        start: 1000,
        end: 4000,
      });

      expect(prices).toHaveLength(3);
      expect(prices[0].openTime).toBe(1000);
      expect(prices[2].openTime).toBe(3000);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should stop on empty response', async () => {
      mockFetch.mockResolvedValueOnce(makeMockResponse([]));

      const prices = await BybitApi.fetchAllKlines({
        symbol: 'BTCUSDT',
        interval: '3',
        start: 1000,
        end: 4000,
      });

      expect(prices).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
