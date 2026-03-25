import {EmaCalculator} from '../../src/engine/EmaCalculator';

describe('EmaCalculator', () => {
  it('should not be ready before period prices', () => {
    const ema = new EmaCalculator(5);
    ema.push(100);
    ema.push(101);
    expect(ema.isReady()).toBe(false);
  });

  it('should seed with SMA for first period', () => {
    const ema = new EmaCalculator(5);
    [100, 102, 104, 106, 108].forEach(p => ema.push(p));
    expect(ema.isReady()).toBe(true);
    expect(ema.getValue()).toBeCloseTo(104, 5); // SMA of [100,102,104,106,108]
  });

  it('should apply exponential smoothing after seed', () => {
    const ema = new EmaCalculator(5);
    [100, 102, 104, 106, 108].forEach(p => ema.push(p));
    const sma = 104;
    const alpha = 2 / 6;

    ema.push(110);
    const expected = alpha * 110 + (1 - alpha) * sma;
    expect(ema.getValue()).toBeCloseTo(expected, 5);
  });

  it('should react faster to recent prices than SMA', () => {
    const ema = new EmaCalculator(10);
    for (let i = 0; i < 10; i++) { ema.push(100); }

    // Sudden spike
    ema.push(200);
    // EMA should move toward 200 faster than SMA would
    expect(ema.getValue()).toBeGreaterThan(100);
    expect(ema.getValue()).toBeLessThan(200);
  });

  it('should reset cleanly', () => {
    const ema = new EmaCalculator(3);
    [10, 20, 30].forEach(p => ema.push(p));
    expect(ema.isReady()).toBe(true);
    ema.reset();
    expect(ema.isReady()).toBe(false);
    expect(ema.getValue()).toBe(0);
  });
});
