import React from 'react';
import {
  CASH2GO_PRESET,
  STANDARD_MORTGAGE_PRESET,
  US_MORTGAGE_PRESET,
} from '../../utils/loanCalculations';

interface PresetSelectorProps {
  onSelect: (preset: typeof CASH2GO_PRESET) => void;
}

const presets = [
  { preset: CASH2GO_PRESET, label: 'Cash2Go (₱300k)', activeClass: true },
  { preset: STANDARD_MORTGAGE_PRESET, label: 'PH Mortgage (₱5M)', activeClass: false },
  { preset: US_MORTGAGE_PRESET, label: 'US Mortgage ($400k)', activeClass: false },
];

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    <span className="text-[11px] font-medium text-slate-400">Presets:</span>
    {presets.map(({ preset, label, activeClass }) => (
      <button
        key={preset.id}
        type="button"
        onClick={() => onSelect(preset)}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors ${
          activeClass
            ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60'
            : 'bg-slate-100 font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);
