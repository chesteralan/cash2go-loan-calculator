import React from 'react';
import { TermUnit } from '../../types/loan';
import { TogglePill } from '../ui/TogglePill';

interface TermFieldProps {
  termValue: number;
  termUnit: TermUnit;
  onChange: (changes: { termValue?: number; termUnit?: TermUnit }) => void;
}

export const TermField: React.FC<TermFieldProps> = ({ termValue, termUnit, onChange }) => (
  <div>
    <div className="flex items-center justify-between">
      <label
        htmlFor="term-value"
        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
      >
        Loan Duration / Term
      </label>
      <TogglePill
        value={termUnit}
        onChange={(unit) =>
          onChange({
            termUnit: unit,
            termValue:
              unit === 'months'
                ? termUnit === 'years'
                  ? termValue * 12
                  : termValue
                : termUnit === 'months'
                  ? Math.max(1, Math.round(termValue / 12))
                  : termValue,
          })
        }
        options={[
          { value: 'months', label: 'Months' },
          { value: 'years', label: 'Years' },
        ]}
        size="sm"
      />
    </div>

    <div className="relative mt-2">
      <input
        id="term-value"
        type="number"
        min="1"
        max={termUnit === 'months' ? 480 : 40}
        value={termValue}
        onChange={(e) => onChange({ termValue: Math.max(1, Number(e.target.value)) })}
        className="w-full rounded-xl border border-slate-300 bg-white pr-16 pl-3.5 py-2.5 text-base font-semibold font-mono text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 text-xs font-semibold">
        {termUnit}
      </div>
    </div>

    <input
      type="range"
      min="1"
      max={termUnit === 'months' ? 120 : 30}
      value={termValue}
      onChange={(e) => onChange({ termValue: Number(e.target.value) })}
      className="mt-2.5 w-full accent-blue-600 cursor-pointer"
      aria-label="Adjust loan term slider"
    />
  </div>
);
