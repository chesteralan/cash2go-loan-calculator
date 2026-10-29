import React from 'react';
import { LoanInput, CalculationResult, SavedLoanRecord } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';
import { LoanParamsEditor } from './LoanParamsEditor';

export interface ComparisonAccent {
  cardBorder: string;
  badge: string;
  loadButton: string;
  paymentTile: string;
  paymentLabel: string;
  eirValue: string;
  titleFocus: string;
}

export const accents: Record<'blue' | 'emerald', ComparisonAccent> = {
  blue: {
    cardBorder: 'border-blue-500/80 dark:border-blue-600',
    badge: 'bg-blue-600',
    loadButton: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300',
    paymentTile: 'bg-blue-50/60 dark:bg-blue-950/30',
    paymentLabel: 'text-blue-700 dark:text-blue-400',
    eirValue: 'text-blue-700 dark:text-blue-300',
    titleFocus: 'focus:border-blue-500',
  },
  emerald: {
    cardBorder: 'border-emerald-500/80 dark:border-emerald-600',
    badge: 'bg-emerald-600',
    loadButton:
      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
    paymentTile: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    paymentLabel: 'text-emerald-700 dark:text-emerald-400',
    eirValue: 'text-emerald-700 dark:text-emerald-300',
    titleFocus: 'focus:border-emerald-500',
  },
};

export const LoanKpiGrid: React.FC<{ result: CalculationResult; accent: ComparisonAccent }> = ({
  result,
  accent,
}) => {
  const currencyCode = result.input.currencyCode;
  const metricTile = 'rounded-xl bg-slate-50 p-3 dark:bg-slate-800';
  const metricLabel =
    'block font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400';
  return (
    <div className="grid grid-cols-2 gap-3 font-mono">
      <div className={`p-3 rounded-xl ${accent.paymentTile}`}>
        <span className={`block font-sans text-[11px] font-semibold ${accent.paymentLabel}`}>
          Periodic Payment
        </span>
        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(result.periodicPayment, currencyCode)}
        </span>
      </div>
      <div className={metricTile}>
        <span className={metricLabel}>Total Interest Expense</span>
        <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
          {formatCurrency(result.totalInterest, currencyCode)}
        </span>
      </div>
      <div className={metricTile}>
        <span className={metricLabel}>Gross Repayment</span>
        <span className="text-base font-bold text-slate-900 dark:text-white">
          {formatCurrency(result.totalCost, currencyCode)}
        </span>
      </div>
      <div className={metricTile}>
        <span className={metricLabel}>Effective Rate (EIR)</span>
        <span className={`text-base font-bold ${accent.eirValue}`}>
          {result.effectiveInterestRate.toFixed(3)}%
        </span>
      </div>
    </div>
  );
};

export const SavedLoanPicker: React.FC<{
  savedLoans: SavedLoanRecord[];
  onSelect: (loan: LoanInput) => void;
}> = ({ savedLoans, onSelect }) => {
  if (savedLoans.length === 0) return null;
  return (
    <div className="mt-3">
      <label className="text-[11px] font-medium text-slate-400">Pick from Saved Loans:</label>
      <select
        onChange={(e) => {
          const found = savedLoans.find((l) => l.id === e.target.value);
          if (found) onSelect(found.input);
        }}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">Select a saved calculation...</option>
        {savedLoans.map((l) => (
          <option key={l.id} value={l.id}>
            {l.title} ({formatCurrency(l.input.principal, l.input.currencyCode)})
          </option>
        ))}
      </select>
    </div>
  );
};

export const ComparisonLoanCard: React.FC<{
  label: 'A' | 'B';
  accent: ComparisonAccent;
  result: CalculationResult;
  savedLoans: SavedLoanRecord[];
  onApplyToMainCalculator: (loan: LoanInput) => void;
  onTitleChange: (title: string) => void;
  onSelectSaved: (loan: LoanInput) => void;
  onParamChange: (changes: Partial<LoanInput>) => void;
}> = ({
  label,
  accent,
  result,
  savedLoans,
  onApplyToMainCalculator,
  onTitleChange,
  onSelectSaved,
  onParamChange,
}) => {
  const loan = result.input;
  return (
    <div
      className={`rounded-2xl border-2 ${accent.cardBorder} bg-white p-5 sm:p-7 shadow-sm dark:bg-slate-900 transition-colors`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full ${accent.badge} text-xs font-bold text-white`}
          >
            {label}
          </span>
          <input
            type="text"
            value={loan.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 ${accent.titleFocus} outline-none`}
          />
        </div>
        <button
          onClick={() => onApplyToMainCalculator(loan)}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${accent.loadButton}`}
        >
          Load as Main Loan
        </button>
      </div>

      <SavedLoanPicker savedLoans={savedLoans} onSelect={onSelectSaved} />

      <div className="mt-4">
        <LoanKpiGrid result={result} accent={accent} />
      </div>

      <div className="mt-5 text-xs">
        <LoanParamsEditor loan={loan} onChange={onParamChange} />
      </div>
    </div>
  );
};
