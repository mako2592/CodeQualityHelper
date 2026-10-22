import { describe, expect, it } from 'vitest';
import { applyDiscount, bestDiscount, isValidCode } from './discount';

// Testy celowo pomijają warunki brzegowe (minTotal, ograniczenie procentu),
// żeby część mutantów przeżyła i pojawiła się w przykładowym raporcie.
describe('discount', () => {
  const tenPercent = { code: 'SAVE10', percent: 10, minTotal: 50 };

  it('returns total without a discount', () => {
    expect(applyDiscount(80)).toBe(80);
  });

  it('applies percentage discount', () => {
    expect(applyDiscount(80, tenPercent)).toBe(72);
  });

  it('accepts a valid code', () => {
    expect(isValidCode('SAVE10')).toBe(true);
  });

  it('picks the better discount', () => {
    const twenty = { code: 'SAVE20', percent: 20, minTotal: 50 };
    expect(bestDiscount(100, [tenPercent, twenty])).toBe(twenty);
  });
});
