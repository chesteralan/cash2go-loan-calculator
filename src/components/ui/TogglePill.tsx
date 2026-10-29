import React from 'react';

interface TogglePillProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  size?: 'sm' | 'md';
}

export function TogglePill<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
}: TogglePillProps<T>) {
  const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1.5';
  return (
    <div
      className={`flex rounded-md bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px] font-semibold`}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`${pad} rounded-md font-medium transition-colors ${
            value === o.value
              ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
