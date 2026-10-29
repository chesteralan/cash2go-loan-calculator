import React from 'react';
import { getCurrency } from '../../utils/currencies';

interface PrincipalFieldProps {
  principal: number;
  currencyCode: string;
  onChange: (principal: number) => void;
}

export const PrincipalField: React.FC<PrincipalFieldProps> = ({
  principal,
  currencyCode,
  onChange,
}) => {
  const currency = getCurrency(currencyCode);
  const maxPrincipal = currencyCode === 'PHP' || currencyCode === 'JPY' ? 20000000 : 2000000;
  const principalStep = currencyCode === 'PHP' || currencyCode === 'JPY' ? 10000 : 1000;
  const quickPrincipalAdds =
    currencyCode === 'PHP'
      ? [50000, 100000, 300000, 500000, 1000000]
      : [10000, 25000, 50000, 100000, 250000];

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="loan-principal"
          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Loan Amount (Principal)
        </label>
        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
          {currency.symbol} {Number(principal || 0).toLocaleString()}
        </span>
      </div>

      <div className="relative mt-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-semibold">
          {currency.symbol}
        </div>
        <input
          id="loan-principal"
          type="number"
          min="1000"
          max={maxPrincipal}
          step={principalStep}
          value={principal}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-base font-semibold font-mono text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {quickPrincipalAdds.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => onChange(amt)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              principal === amt
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {currency.symbol} {amt.toLocaleString()}
          </button>
        ))}
      </div>

      <input
        type="range"
        min="10000"
        max={maxPrincipal}
        step={principalStep}
        value={principal}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-blue-600 cursor-pointer"
        aria-label="Adjust loan principal slider"
      />
    </div>
  );
};
