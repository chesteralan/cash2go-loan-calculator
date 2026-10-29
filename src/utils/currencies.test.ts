import { describe, expect, it } from 'vitest';
import { convertAmount, formatCurrency, getCurrency, SUPPORTED_CURRENCIES } from './currencies';

describe('getCurrency', () => {
  it('returns the matching currency', () => {
    expect(getCurrency('USD')).toBe(SUPPORTED_CURRENCIES[1]);
  });

  it('falls back to PHP for unknown codes', () => {
    expect(getCurrency('XYZ').code).toBe('PHP');
  });
});

describe('formatCurrency', () => {
  it('formats with 2 decimals by default', () => {
    expect(formatCurrency(1234.5, 'PHP')).toBe('₱ 1,234.50');
  });

  it('omits decimals when asked', () => {
    expect(formatCurrency(1234.5, 'USD', false)).toBe('$ 1,235');
  });

  it('defaults to PHP', () => {
    expect(formatCurrency(10).startsWith('₱')).toBe(true);
  });
});

describe('convertAmount', () => {
  it('USD to USD is identity', () => {
    const { converted, exchangeRate } = convertAmount(100, 'USD', 'USD');
    expect(converted).toBe(100);
    expect(exchangeRate).toBe(1);
  });

  it('converts USD to PHP using static rates', () => {
    const { converted, exchangeRate } = convertAmount(100, 'USD', 'PHP');
    expect(exchangeRate).toBeCloseTo(58.5, 8);
    expect(converted).toBeCloseTo(5850, 6);
  });

  it('converts PHP to USD inversely', () => {
    const { converted, exchangeRate } = convertAmount(5850, 'PHP', 'USD');
    expect(exchangeRate).toBeCloseTo(1 / 58.5, 10);
    expect(converted).toBeCloseTo(100, 6);
  });

  it('cross-rate via USD base (EUR -> JPY)', () => {
    const { exchangeRate } = convertAmount(1, 'EUR', 'JPY');
    expect(exchangeRate).toBeCloseTo(154.2 / 0.92, 10);
  });

  it('round-trips back to the original amount', () => {
    const forth = convertAmount(777.77, 'PHP', 'EUR');
    const back = convertAmount(forth.converted, 'EUR', 'PHP');
    expect(back.converted).toBeCloseTo(777.77, 8);
  });
});
