import React, { useState } from 'react';
import { SUPPORTED_CURRENCIES, convertAmount, formatCurrency } from '../utils/currencies';
import { clearRateOverrides, getRateOverrides, refreshLiveRates } from '../utils/liveRates';
import { CalculationResult } from '../types/loan';
import { Globe, ArrowRightLeft, X, Check } from 'lucide-react';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  onSelectCurrency: (code: string) => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
  result,
  onSelectCurrency,
}) => {
  const { input, periodicPayment, totalCost, totalPrincipal } = result;
  const [targetCode, setTargetCode] = useState('USD');
  const [rateStatus, setRateStatus] = useState<string | null>(null);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [ratesVersion, setRatesVersion] = useState(0); // triggers re-conversion after refresh

  if (!isOpen) return null;

  const principalConv = convertAmount(totalPrincipal, input.currencyCode, targetCode);
  const paymentConv = convertAmount(periodicPayment, input.currencyCode, targetCode);
  const totalCostConv = convertAmount(totalCost, input.currencyCode, targetCode);

  const rateCache = getRateOverrides();

  const handleRefreshRates = async () => {
    setFetchingRates(true);
    const res = await refreshLiveRates();
    setFetchingRates(false);
    setRateStatus(
      res.success ? 'Live rates updated (cached locally).' : res.error || 'Fetch failed'
    );
    if (res.success) setRatesVersion((v) => v + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              International Currency Converter
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close currency converter"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Currency Pair Controls */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Current Currency
              </label>
              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800">
                <span className="font-mono">{input.currencyCode}</span>
                <span className="text-xs text-slate-400">Base</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="target-currency-select"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                Target International Currency
              </label>
              <select
                id="target-currency-select"
                value={targetCode}
                onChange={(e) => setTargetCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-blue-500 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:border-blue-500 dark:bg-slate-800 dark:text-white shadow-xs"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="rounded-lg bg-blue-50 p-2.5 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-mono"
            key={ratesVersion}
          >
            Exchange rate: 1 {input.currencyCode} = {principalConv.exchangeRate.toFixed(4)}{' '}
            {targetCode}
          </div>

          {/* Opt-in live rates */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            <div className="flex items-center justify-between gap-2">
              <span>
                {rateCache
                  ? `Live rates cached ${new Date(rateCache.fetchedAt).toLocaleString()}`
                  : 'Using built-in static rates.'}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => void handleRefreshRates()}
                  disabled={fetchingRates}
                  className="rounded-lg bg-blue-600 px-2.5 py-1 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  title="Fetch fresh FX rates from a public provider (one opt-in fetch, cached in local storage)"
                >
                  {fetchingRates ? 'Fetching…' : 'Fetch Live Rates'}
                </button>
                {rateCache && (
                  <button
                    onClick={() => {
                      clearRateOverrides();
                      setRateStatus(null);
                      setRatesVersion((v) => v + 1);
                    }}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Remove cached live rates and return to static rates"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            {rateStatus && (
              <span
                className={`font-semibold ${!rateStatus.startsWith('Live') ? 'text-rose-600 dark:text-rose-400' : ''}`}
              >
                {rateStatus}
              </span>
            )}
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Only public exchange rates are downloaded — no loan data leaves your device.
            </span>
          </div>

          {/* Converted KPI Results */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Loan Principal</span>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(principalConv.converted, targetCode)}
                </span>
                <span className="ml-1 text-[11px] text-slate-400">
                  (was {formatCurrency(totalPrincipal, input.currencyCode)})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Periodic Payment</span>
              <div className="text-right">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {formatCurrency(paymentConv.converted, targetCode)}
                </span>
                <span className="ml-1 text-[11px] text-slate-400">
                  (was {formatCurrency(periodicPayment, input.currencyCode)})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Loan Cost</span>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalCostConv.converted, targetCode)}
                </span>
                <span className="ml-1 text-[11px] text-slate-400">
                  (was {formatCurrency(totalCost, input.currencyCode)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button: Apply currency */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={() => {
              onSelectCurrency(targetCode);
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            <span>Set {targetCode} as Active Currency</span>
          </button>
        </div>
      </div>
    </div>
  );
};
