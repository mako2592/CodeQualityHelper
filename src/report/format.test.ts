import { describe, expect, it } from 'vitest';
import { formatScore, rateScore } from './format';

const thresholds = { high: 80, low: 60 };

describe('formatScore', () => {
  it.each([
    [70, '70.00%'],
    [(7 / 9) * 100, '77.78%'],
    [(10 / 14) * 100, '71.43%'],
    [0, '0.00%'],
    [100, '100.00%'],
  ])('formatuje %d jako %s', (score, expected) => {
    expect(formatScore(score)).toBe(expected);
  });

  it('pokazuje n/d dla null', () => {
    expect(formatScore(null)).toBe('n/d');
  });
});

describe('rateScore', () => {
  it.each([
    [100, 'good'],
    [80, 'good'],
    [79.99, 'warning'],
    [70, 'warning'],
    [60, 'warning'],
    [59.99, 'bad'],
    [55, 'bad'],
    [0, 'bad'],
  ])('ocenia %d jako %s przy progach 80/60', (score, expected) => {
    expect(rateScore(score, thresholds)).toBe(expected);
  });

  it('uznaje za dobry wynik, który po zaokrągleniu jest równy progowi high', () => {
    // 79.999… wyświetla się jako 80.00%, więc ocena musi być zgodna z tym, co widzi użytkownik.
    expect(rateScore(79.999999, thresholds)).toBe('good');
  });

  it('używa przekazanych progów', () => {
    expect(rateScore(85, { high: 90, low: 50 })).toBe('warning');
  });

  it('zwraca null dla wyniku n/d', () => {
    expect(rateScore(null, thresholds)).toBeNull();
  });
});
