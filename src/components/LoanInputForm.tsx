import React, { useState } from 'react';
import { LoanInput, LoanStructure } from '../types/loan';
import { Sliders, ChevronDown, ChevronUp, BookmarkPlus, RotateCcw } from 'lucide-react';
import { PresetSelector } from './loan-input/PresetSelector';
import { StructureSelector } from './loan-input/StructureSelector';
import { PrincipalField } from './loan-input/PrincipalField';
import { RateField } from './loan-input/RateField';
import { TermField } from './loan-input/TermField';
import {
  QuickTermShortcuts,
  PaymentIntervalField,
  StartDateField,
} from './loan-input/QuickTermShortcuts';
import { AdvancedParams } from './loan-input/AdvancedParams';

interface LoanInputFormProps {
  input: LoanInput;
  onChange: (updated: LoanInput) => void;
  onSaveLoan: () => void;
  onReset: () => void;
}

export const LoanInputForm: React.FC<LoanInputFormProps> = ({
  input,
  onChange,
  onSaveLoan,
  onReset,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (changes: Partial<LoanInput>) => onChange({ ...input, ...changes });

  const handleStructureChange = (structure: LoanStructure) => {
    if (structure === 'fixed_addon') {
      update({
        structure,
        ratePeriod: 'monthly',
        interestRate: input.structure === 'fixed_addon' ? input.interestRate : 1.0,
      });
    } else {
      update({
        structure,
        ratePeriod: 'annual',
        interestRate: input.structure === 'diminishing_balance' ? input.interestRate : 6.5,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Loan Parameters &amp; Structure</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure borrowing amount, repayment structure, and interest intervals.
          </p>
        </div>
        <PresetSelector onSelect={(preset) => onChange(preset)} />
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="loan-title"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Loan Title / Description
          </label>
          <input
            id="loan-title"
            type="text"
            value={input.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g., Metrobank Cash2Go Personal Loan"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Loan Amortization Structure
          </label>
          <StructureSelector active={input.structure} onChange={handleStructureChange} />
        </div>

        <PrincipalField
          principal={input.principal}
          currencyCode={input.currencyCode}
          onChange={(principal) => update({ principal })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <RateField
            rate={input.interestRate}
            ratePeriod={input.ratePeriod}
            isAddOn={input.structure === 'fixed_addon'}
            onChange={update}
          />
          <TermField termValue={input.termValue} termUnit={input.termUnit} onChange={update} />
        </div>

        <QuickTermShortcuts
          termValue={input.termValue}
          termUnit={input.termUnit}
          onChange={update}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PaymentIntervalField
            paymentInterval={input.paymentInterval}
            onChange={(paymentInterval) => update({ paymentInterval })}
          />
          <StartDateField
            startDate={input.startDate}
            onChange={(startDate) => update({ startDate })}
          />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white py-1"
          >
            <span>Advanced Parameters (Prepayment &amp; One-Time Fees)</span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3">
              <AdvancedParams
                extraPaymentPerPeriod={input.extraPaymentPerPeriod}
                oneTimeFee={input.oneTimeFee}
                currencyCode={input.currencyCode}
                onChange={update}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Inputs</span>
          </button>

          <button
            type="button"
            onClick={onSaveLoan}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm"
          >
            <BookmarkPlus className="h-4 w-4" />
            <span>Save to My Calculations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
