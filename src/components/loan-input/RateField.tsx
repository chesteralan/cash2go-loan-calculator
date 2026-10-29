import React from 'react';
import { LoanInput } from '../../types/loan';
import { TogglePill } from '../ui/TogglePill';

interface RateFieldProps {
  rate: number;
  ratePeriod: LoanInput['ratePeriod'];
  isAddOn: boolean;
  onChange: (changes: { interestRate?: number; ratePeriod?: LoanInput['ratePeriod'] }) => void;
}

export const RateField: React.FC<RateFieldProps> = ({ rate, ratePeriod, isAddOn, onChange }) => {
  const sliderMin = ratePeriod === 'monthly' ? 0.25 : 1;
  const sliderMax = ratePeriod === 'monthly' ? 3.0 : 25;
  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="interest-rate"
          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {isAddOn ? 'Monthly Add-on Rate' : 'Annual Interest Rate (APR)'}
        </label>
        {isAddOn && (
          <TogglePill
            value={ratePeriod}
            onChange={(period) => onChange({ ratePeriod: period })}
            options={[
              { value: 'monthly', label: 'Monthly %' },
              { value: 'annual', label: 'Annual %' },
            ]}
          />
        )}
      </div>

      <div className="relative mt-2">
        <input
          id="interest-rate"
          type="number"
          step="0.01"
          min="0.01"
          max="100"
          value={rate}
          onChange={(e) => onChange({ interestRate: Math.max(0, Number(e.target.value)) })}
          className="w-full rounded-xl border border-slate-300 bg-white pr-9 pl-3.5 py-2.5 text-base font-semibold font-mono text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 font-bold">
          %
        </div>
      </div>

      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step="0.05"
        value={rate}
        onChange={(e) => onChange({ interestRate: Number(e.target.value) })}
        className="mt-2.5 w-full accent-blue-600 cursor-pointer"
        aria-label="Adjust interest rate slider"
      />
    </div>
  );
};
