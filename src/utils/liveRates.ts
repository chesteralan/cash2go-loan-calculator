/**
 * Optional client-side live FX rates.
 *
 * Only fetched when the user explicitly opts in. The app itself never talks
 * to a network on its own: rates are cached in local storage and all loan
 * math keeps working offline against the static rate table.
 */

const FX_CACHE_KEY = 'loanmatrix_fx_rates_v1';

export interface FxRateCache {
  base: 'USD';
  fetchedAt: number;
  /** Currency code -> units per 1 USD */
  rates: Record<string, number>;
}

const UNKNOWN_CODE = (c: string) => `Unknown currency code "${c}"`;

export function getRateOverrides(): FxRateCache | null {
  try {
    const raw = localStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FxRateCache;
    if (parsed?.base !== 'USD' || typeof parsed.rates !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(cache: FxRateCache): void {
  localStorage.setItem(FX_CACHE_KEY, JSON.stringify(cache));
}

export function clearRateOverrides(): void {
  localStorage.removeItem(FX_CACHE_KEY);
}

/**
 * Fetch live USD-based rates from the open exchangerate-api endpoint
 * (no API key) and cache them. Returns null on network/parse failure.
 */
export async function refreshLiveRates(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) {
      return { success: false, error: `Rate provider returned ${response.status}` };
    }
    const data = (await response.json()) as { result?: string; rates?: Record<string, number> };
    if (data.result !== 'success' || !data.rates) {
      return { success: false, error: 'Rate provider returned an invalid payload' };
    }
    writeCache({
      base: 'USD',
      fetchedAt: Date.now(),
      rates: data.rates,
    });
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reach rate provider',
    };
  }
}
