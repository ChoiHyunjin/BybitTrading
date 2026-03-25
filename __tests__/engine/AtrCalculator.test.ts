import {AtrCalculator} from '../../src/engine/AtrCalculator';

describe('AtrCalculator', () => {
  it('should not be ready before period candles', () => {
    const atr = new AtrCalculator(3);
    atr.push(110, 90, 100);
    expect(atr.isReady()).toBe(false);
  });

  it('should calculate initial ATR as average of true ranges', () => {
    const atr = new AtrCalculator(3);
    // TR1 = 110-90 = 20 (no prev close)
    atr.push(110, 90, 100);
    // TR2 = max(115-95, |115-100|, |95-100|) = max(20, 15, 5) = 20
    atr.push(115, 95, 105);
    // TR3 = max(120-100, |120-105|, |100-105|) = max(20, 15, 5) = 20
    atr.push(120, 100, 110);

    expect(atr.isReady()).toBe(true);
    expect(atr.getValue()).toBeCloseTo(20, 5);
  });

  it('should apply Wilder smoothing after initialization', () => {
    const atr = new AtrCalculator(3);
    atr.push(110, 90, 100);  // TR=20
    atr.push(115, 95, 105);  // TR=20
    atr.push(120, 100, 110); // TR=20, ATR=20

    // TR4 = max(130-100, |130-110|, |100-110|) = max(30, 20, 10) = 30
    atr.push(130, 100, 115);
    // Wilder: (20 * 2 + 30) / 3 = 23.33
    expect(atr.getValue()).toBeCloseTo(23.333, 2);
  });

  it('should handle gap up correctly', () => {
    const atr = new AtrCalculator(3);
    atr.push(110, 90, 100);
    atr.push(115, 95, 105);
    atr.push(120, 100, 110);

    // Gap up: open at 130, prev close was 110
    // TR = max(135-125, |135-110|, |125-110|) = max(10, 25, 15) = 25
    atr.push(135, 125, 130);
    expect(atr.getValue()).toBeCloseTo((20 * 2 + 25) / 3, 2);
  });

  it('should reset cleanly', () => {
    const atr = new AtrCalculator(3);
    atr.push(110, 90, 100);
    atr.push(115, 95, 105);
    atr.push(120, 100, 110);
    expect(atr.isReady()).toBe(true);
    atr.reset();
    expect(atr.isReady()).toBe(false);
  });
});
