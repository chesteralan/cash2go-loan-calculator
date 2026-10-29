import React from 'react';
import { TermUnit, PaymentInterval } from '../../types/loan';
import { SelectField } from '../ui/SelectField';

interface QuickTermShortcutsProps {
  termValue: number;
  termUnit: TermUnit;
  onChange: (changes: { termValue: number; termUnit: TermUnit }) => void;
}

const monthShortcuts = [12, 24, 36, 48, 60];
const yearShortcuts = [10, 15, 20, 30];

export const QuickTermShortcuts: React.FC<QuickTermShortcutsProps> = ({
  termValue,
  termUnit,
  onChange,
}) => (
  <div className="flex flex-wrap items-center gap-1.5 pt-1">
    <span className="text-[11px] font-medium text-slate-400">Quick terms:</span>
    {monthShortcuts.map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => onChange({ termValue: m, termUnit: 'months' })}
        className={`relative rounded-md px-2 py-0.5 text-xs font-medium transition-colors before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] ${
          termUnit === 'months' && termValue === m
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
        }`}
      >
        {m} mos
      </button>
    ))}
    {yearShortcuts.map((y) => (
      <button
        key={y}
        type="button"
        onClick={() => onChange({ termValue: y, termUnit: 'years' })}
        className={`relative rounded-md px-2 py-0.5 text-xs font-medium transition-colors before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] ${
          termUnit === 'years' && termValue === y
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
        }`}
      >
        {y} yrs
      </button>
    ))}
  </div>
);

const paymentIntervalOptions: { value: PaymentInterval; label: string }[] = [
  { value: 'monthly', label: 'Monthly (12 payments/year)' },
  { value: 'semi_monthly', label: 'Semi-Monthly (24 payments/year, 2x/mo)' },
  { value: 'bi_weekly', label: 'Bi-Weekly (26 payments/year, every 2 wks)' },
  { value: 'weekly', label: 'Weekly (52 payments/year)' },
  { value: 'quarterly', label: 'Quarterly (4 payments/year)' },
  { value: 'annually', label: 'Annually (1 payment/year)' },
];

export const PaymentIntervalField: React.FC<{
  paymentInterval: PaymentInterval;
  onChange: (interval: PaymentInterval) => void;
}> = ({ paymentInterval, onChange }) => (
  <SelectField
    id="payment-interval"
    label="Payment Interval"
    value={paymentInterval}
    onChange={(v) => onChange(v as PaymentInterval)}
    options={paymentIntervalOptions}
  />
);

export const StartDateField: React.FC<{
  startDate: string;
  onChange: (date: string) => void;
}> = ({ startDate, onChange }) => (
  <div>
    <label
      htmlFor="start-date"
      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
    >
      First Payment Date
    </label>
    <input
      id="start-date"
      type="date"
      value={startDate}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
    />
  </div>
);
