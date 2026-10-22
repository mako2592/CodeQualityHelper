import { describe, expect, it } from 'vitest';
import { retry } from './retry';

describe('retry', () => {
  it('returns the first successful result', () => {
    let calls = 0;
    const result = retry(() => {
      calls++;
      if (calls < 3) throw new Error('flaky');
      return 'ok';
    }, 5);
    expect(result).toBe('ok');
    expect(calls).toBe(3);
  });

  it('throws the last error after all attempts fail', () => {
    let calls = 0;
    expect(() =>
      retry(() => {
        calls++;
        throw new Error(`fail ${calls}`);
      }, 3),
    ).toThrow('fail 3');
    expect(calls).toBe(3);
  });
});
