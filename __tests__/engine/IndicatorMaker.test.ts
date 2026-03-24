import {IndicatorMaker} from '../../src/engine/IndicatorMaker';

describe('IndicatorMaker', () => {
  let indicator: IndicatorMaker;

  beforeEach(() => {
    indicator = new IndicatorMaker(20, 2);
  });

  describe('setPrices and basic indicators', () => {
    it('should calculate MA after setting prices', () => {
      const prices = Array.from({length: 20}, (_, i) => i + 1);
      indicator.setPrices(prices);
      expect(indicator.ma).toBeCloseTo(10.5, 5);
    });

    it('should calculate Bollinger Bands', () => {
      const prices = Array.from({length: 20}, (_, i) => i + 1);
      indicator.setPrices(prices);

      const stdDev = Math.sqrt(35); // ≈ 5.9161
      expect(indicator.upper()).toBeCloseTo(10.5 + 2 * stdDev, 2);
      expect(indicator.lower()).toBeCloseTo(10.5 - 2 * stdDev, 2);
    });

    it('should calculate bandwidth', () => {
      const prices = Array.from({length: 20}, (_, i) => i + 1);
      indicator.setPrices(prices);

      const stdDev = Math.sqrt(35);
      const expectedBW = (4 * stdDev) / 10.5;
      expect(indicator.getBW()).toBeCloseTo(expectedBW, 4);
    });
  });

  describe('pushPrice and touch detection', () => {
    it('should detect touchedBottom when price <= lower band', () => {
      const prices = Array.from({length: 20}, () => 100);
      indicator.setPrices(prices);

      // All same price → stdDev = 0, lower = MA = 100
      // Push a very low price
      indicator.pushPrice(50);
      expect(indicator.touchedBottom).toBe(true);
      expect(indicator.touchedTop).toBe(false);
    });

    it('should detect touchedTop when price >= upper band', () => {
      const prices = Array.from({length: 20}, () => 100);
      indicator.setPrices(prices);

      indicator.pushPrice(150);
      expect(indicator.touchedTop).toBe(true);
      expect(indicator.touchedBottom).toBe(false);
    });

    it('should reset touched flags', () => {
      indicator.touchedTop = true;
      indicator.touchedBottom = true;
      indicator.resetTouched();
      expect(indicator.touchedTop).toBe(false);
      expect(indicator.touchedBottom).toBe(false);
    });
  });

  describe('movingAverage', () => {
    it('should return short period MA', () => {
      const prices = Array.from({length: 20}, (_, i) => i + 1);
      indicator.setPrices(prices);
      // Last 6: [15,16,17,18,19,20] => 17.5
      expect(indicator.movingAverage(6)).toBeCloseTo(17.5, 5);
    });
  });
});
