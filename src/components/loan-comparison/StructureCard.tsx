import React from 'react';
import { CalculationResult } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';

interface StructureCardProps {
  title: string;
  eyebrow: string;
  eyebrowClass: string;
  tag: string;
  tagClass: string;
  frameClass: string;
  headerBorderClass: string;
  quotedRate: string;
  rateUnit: string;
  result: CalculationResult;
  currencyCode: string;
  paymentValueClass: string;
  eirValueClass: string;
  buttonLabel: string;
  buttonClass: string;
  onUse: () => void;
}

export const StructureCard: React.FC<StructureCardProps> = ({
  title,
  eyebrow,
  eyebrowClass,
  tag,
  tagClass,
  frameClass,
  headerBorderClass,
  quotedRate,
  rateUnit,
  result,
  currencyCode,
  paymentValueClass,
  eirValueClass,
  buttonLabel,
  buttonClass,
  onUse,
}) => {
  const rowClass = 'flex items-center justify-between';
  const rowLabelClass = 'font-sans text-slate-500 dark:text-slate-400';
  return (
    <div className={`rounded-2xl border-2 p-5 ${frameClass}`}>
      <div className={`flex items-center justify-between pb-3 border-b ${headerBorderClass}`}>
        <div>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${eyebrowClass}`}>
            {eyebrow}
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagClass}`}>
          {tag}
        </span>
      </div>

      <div className="mt-4 space-y-3 font-mono text-xs">
        <div className={rowClass}>
          <span className={rowLabelClass}>Quoted Rate:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {quotedRate} / {rateUnit}
          </span>
        </div>
        <div className={rowClass}>
          <span className={rowLabelClass}>Periodic Payment:</span>
          <span className={`font-bold text-sm ${paymentValueClass}`}>
            {formatCurrency(result.periodicPayment, currencyCode)}
          </span>
        </div>
        <div className={rowClass}>
          <span className={rowLabelClass}>Total Interest:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(result.totalInterest, currencyCode)}
          </span>
        </div>
        <div className={rowClass}>
          <span className={rowLabelClass}>Gross Repayment:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(result.totalCost, currencyCode)}
          </span>
        </div>
        <div className={`${rowClass} pt-2 border-t border-slate-200 dark:border-slate-700`}>
          <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">
            Effective Rate (EIR):
          </span>
          <span className={`font-extrabold ${eirValueClass}`}>
            {result.effectiveInterestRate.toFixed(3)}%
          </span>
        </div>
      </div>

      <button
        onClick={onUse}
        className={`mt-5 w-full rounded-xl py-2.5 text-xs font-semibold text-white shadow-sm transition-colors ${buttonClass}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
};
