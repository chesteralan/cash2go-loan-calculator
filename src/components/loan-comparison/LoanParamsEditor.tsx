import React from 'react';
import { LoanInput } from '../../types/loan';
import { SelectField } from '../ui/SelectField';
import { NumberField } from '../ui/NumberField';

const CompactNumber: React.FC<{
  label: React.ReactNode;
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}> = (props) => <NumberField compact {...props} />;

const compactClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium dark:border-slate-700 dark:bg-slate-800';

export const LoanParamsEditor: React.FC<{
  loan: LoanInput;
  onChange: (changes: Partial<LoanInput>) => void;
}> = ({ loan, onChange }) => (
  <div className="space-y-3.5">
    <div>
      <label
        htmlFor="structure-select"
        className="block font-semibold text-slate-700 dark:text-slate-300"
      >
        Structure
      </label>
      <select
        id="structure-select"
        value={loan.structure}
        onChange={(e) =>
          onChange({
            structure: e.target.value as LoanInput['structure'],
            ratePeriod: e.target.value === 'fixed_addon' ? 'monthly' : 'annual',
          })
        }
        className={compactClass}
      >
        <option value="fixed_addon">Fixed Rate (Add-on Flat)</option>
        <option value="diminishing_balance">Diminishing Balance (Mortgage Standard)</option>
      </select>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <CompactNumber
        label="Principal Amount"
        value={loan.principal}
        min={0}
        onChange={(principal) => onChange({ principal })}
      />
      <CompactNumber
        label={`Interest Rate (${loan.ratePeriod === 'monthly' ? 'Monthly %' : 'Annual %'})`}
        value={loan.interestRate}
        min={0}
        step={0.05}
        onChange={(interestRate) => onChange({ interestRate })}
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <CompactNumber
        label={`Term (${loan.termUnit})`}
        value={loan.termValue}
        min={1}
        onChange={(termValue) => onChange({ termValue })}
      />
      <SelectField
        label="Payment Interval"
        value={loan.paymentInterval}
        onChange={(v) => onChange({ paymentInterval: v as LoanInput['paymentInterval'] })}
        options={[
          { value: 'monthly', label: 'Monthly (12x/yr)' },
          { value: 'semi_monthly', label: 'Semi-Monthly (24x/yr)' },
          { value: 'bi_weekly', label: 'Bi-Weekly (26x/yr)' },
          { value: 'weekly', label: 'Weekly (52x/yr)' },
        ]}
      />
    </div>

    <CompactNumber
      label="Extra Principal Payment / Period"
      value={loan.extraPaymentPerPeriod}
      min={0}
      onChange={(extraPaymentPerPeriod) => onChange({ extraPaymentPerPeriod })}
    />
  </div>
);
