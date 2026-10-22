import { describe, expect, it } from 'vitest';
import { formatPrice } from './legacy';

describe('legacy', () => {
  it('formats price in Polish style', () => {
    expect(formatPrice(12.5)).toBe('12,50 zł');
  });
});
