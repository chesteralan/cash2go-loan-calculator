import { CurrencyConfig } from '../types/loan';
import { getRateOverrides } from './liveRates';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateAgainstUSD: 58.5 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateAgainstUSD: 154.2 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateAgainstUSD: 1.39 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateAgainstUSD: 1.52 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateAgainstUSD: 1.34 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateAgainstUSD: 3.67 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateAgainstUSD: 84.3 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateAgainstUSD: 0.88 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rateAgainstUSD: 7.78 },
];

export function getCurrency(code: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'PHP',
  showDecimals = true
): string {
  const currency = getCurrency(currencyCode);
  const formattedNumber = amount.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return `${currency.symbol} ${formattedNumber}`;
}

export function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string
): { converted: number; exchangeRate: number } {
  const from = getCurrency(fromCode);
  const to = getCurrency(toCode);

  // Effective USD cross-rates: cached live rates are used when the user has
  // fetched them; otherwise fall back to the static table.
  const overrides = getRateOverrides()?.rates;
  const fromUsd = from.code === 'USD' ? 1 : (overrides?.[from.code] ?? from.rateAgainstUSD);
  const toUsd = to.code === 'USD' ? 1 : (overrides?.[to.code] ?? to.rateAgainstUSD);

  // rate = (to / USD) / (from / USD); rates are units-per-1-USD
  const rate = toUsd / fromUsd;
  const converted = amount * rate;

  return { converted, exchangeRate: rate };
}
