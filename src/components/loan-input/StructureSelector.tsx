import React from 'react';
import { LoanStructure } from '../../types/loan';

interface StructureSelectorProps {
  active: LoanStructure;
  onChange: (structure: LoanStructure) => void;
}

const options: {
  value: LoanStructure;
  title: string;
  tag: string;
  tagClass: string;
  description: string;
}[] = [
  {
    value: 'fixed_addon',
    title: 'Fixed Rate (Add-on Flat)',
    tag: 'Cash2Go Style',
    tagClass: 'text-blue-600 dark:text-blue-400',
    description:
      'Interest calculated on initial principal each month. Common for personal and auto installment loans.',
  },
  {
    value: 'diminishing_balance',
    title: 'Diminishing Balance (Reducing)',
    tag: 'Standard Mortgage',
    tagClass: 'text-slate-400',
    description:
      'Interest computed on remaining unpaid balance. Typical for home mortgages and commercial credit.',
  },
];

export const StructureSelector: React.FC<StructureSelectorProps> = ({ active, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
          active === o.value
            ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-1 ring-blue-500'
            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-slate-900 dark:text-white">{o.title}</span>
          <span className={`text-[10px] uppercase font-bold ${o.tagClass}`}>{o.tag}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{o.description}</p>
      </button>
    ))}
  </div>
);
