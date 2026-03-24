import {PricesManager} from '../../src/engine/PricesManager';

describe('PricesManager', () => {
  let pm: PricesManager;

  beforeEach(() => {
    pm = new PricesManager(20);
  });

  describe('pushPrice', () => {
    it('should add prices and respect max limit', () => {
      for (let i = 1; i <= 25; i++) {
        pm.pushPrice(i);
      }
      expect(pm.prices.length).toBe(20);
      expect(pm.prices[0]).toBe(6);
      expect(pm.prices[19]).toBe(25);
    });
  });

  describe('setPrices', () => {
    it('should set prices truncated to max', () => {
      const prices = Array.from({length: 30}, (_, i) => i + 1);
      pm.setPrices(prices);
      expect(pm.prices.length).toBe(20);
      expect(pm.prices[0]).toBe(11);
    });
  });

  describe('getAverage', () => {
    it('should calculate moving average for [1..20]', () => {
      for (let i = 1; i <= 20; i++) {
        pm.pushPrice(i);
      }
      expect(pm.getAverage(20)).toBeCloseTo(10.5, 5);
    });

    it('should calculate short period average', () => {
      for (let i = 1; i <= 20; i++) {
        pm.pushPrice(i);
      }
      // Last 6: [15, 16, 17, 18, 19, 20] => avg = 17.5
      expect(pm.getAverage(6)).toBeCloseTo(17.5, 5);
    });
  });

  describe('getVariance', () => {
    it('should calculate sample variance for [1..20]', () => {
      for (let i = 1; i <= 20; i++) {
        pm.pushPrice(i);
      }
      // Sample variance of 1..20 = 35
      expect(pm.getVariance(20)).toBeCloseTo(35, 5);
    });
  });

  describe('getStandardDeviation', () => {
    it('should calculate standard deviation for [1..20]', () => {
      for (let i = 1; i <= 20; i++) {
        pm.pushPrice(i);
      }
      // sqrt(35) ≈ 5.9161
      expect(pm.getStandardDeviation(20)).toBeCloseTo(5.9161, 2);
    });
  });
});
