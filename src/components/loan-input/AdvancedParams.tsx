import React from 'react';
import { NumberField } from '../ui/NumberField';
import { getCurrency } from '../../utils/currencies';

interface AdvancedParamsProps {
  extraPaymentPerPeriod: number;
  oneTimeFee: number;
  currencyCode: string;
  onChange: (changes: { extraPaymentPerPeriod?: number; oneTimeFee?: number }) => void;
}

export const AdvancedParams: React.FC<AdvancedParamsProps> = ({
  extraPaymentPerPeriod,
  oneTimeFee,
  currencyCode,
  onChange,
}) => {
  const currency = getCurrency(currencyCode);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <div>
        <NumberField
          compact
          label="Extra Principal Payment per Period"
          value={extraPaymentPerPeriod}
          step={50}
          min={0}
          prefix={currency.symbol}
          onChange={(v) => onChange({ extraPaymentPerPeriod: Math.max(0, v) })}
        />
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Accelerates debt payoff and calculates total interest saved over loan lifecycle.
        </p>
      </div>

      <div>
        <NumberField
          compact
          label="One-Time Fees / Closing Costs"
          value={oneTimeFee}
          step={100}
          min={0}
          prefix={currency.symbol}
          onChange={(v) => onChange({ oneTimeFee: Math.max(0, v) })}
        />
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Processing fees, doc stamps, or mortgage appraisal costs included in total loan expense.
        </p>
      </div>
    </div>
  );
};
