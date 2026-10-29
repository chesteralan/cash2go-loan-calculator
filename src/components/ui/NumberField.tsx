import React, { useId } from 'react';

const inputBaseClass =
  'w-full rounded-xl border border-slate-300 bg-white font-semibold font-mono text-slate-900 shadow-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

interface NumberFieldProps {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  compact?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  compact = false,
}) => {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className={`block font-semibold text-slate-700 dark:text-slate-300 ${
          compact ? 'text-xs' : ''
        }`}
      >
        {label}
      </label>
      <div className="relative mt-1">
        {prefix !== undefined && (
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold ${
              compact ? 'text-xs' : ''
            }`}
          >
            {prefix}
          </div>
        )}
        {suffix !== undefined && (
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 font-semibold ${
              compact ? 'text-xs' : ''
            }`}
          >
            {suffix}
          </div>
        )}
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${inputBaseClass} ${compact ? 'rounded-lg py-1.5 text-xs' : 'py-2.5 text-base'} ${
            prefix !== undefined ? 'pl-9' : 'pl-3.5'
          } ${suffix !== undefined ? 'pr-9' : 'pr-3.5'}`}
        />
      </div>
    </div>
  );
};
