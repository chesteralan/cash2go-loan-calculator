import React from 'react';
import { CalculationResult } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';
import { TrendingDown } from 'lucide-react';

export const ComparisonVerdict: React.FC<{
  resultA: CalculationResult;
  resultB: CalculationResult;
  interestDifference: number;
  paymentDifference: number;
  costDifference: number;
  periodsDifference: number;
}> = ({
  resultA,
  resultB,
  interestDifference,
  paymentDifference,
  costDifference,
  periodsDifference,
}) => {
  const currencyCode = resultA.input.currencyCode;
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
            VS
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {interestDifference === 0 ? (
                'Both calculations result in identical total interest expense.'
              ) : interestDifference > 0 ? (
                <>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                    Calculation B
                  </span>{' '}
                  saves you{' '}
                  <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300">
                    {formatCurrency(interestDifference, currencyCode)}
                  </span>{' '}
                  in total interest (
                  {((interestDifference / (resultA.totalInterest || 1)) * 100).toFixed(1)}%
                  savings)!
                </>
              ) : (
                <>
                  <span className="text-blue-700 dark:text-blue-400 font-extrabold">
                    Calculation A
                  </span>{' '}
                  saves you{' '}
                  <span className="font-mono font-extrabold text-blue-800 dark:text-blue-300">
                    {formatCurrency(Math.abs(interestDifference), currencyCode)}
                  </span>{' '}
                  in total interest (
                  {((Math.abs(interestDifference) / (resultB.totalInterest || 1)) * 100).toFixed(1)}
                  % savings)!
                </>
              )}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Periodic payment difference:{' '}
              <span className="font-mono font-semibold">
                {formatCurrency(Math.abs(paymentDifference), currencyCode)}
              </span>{' '}
              ({paymentDifference > 0 ? 'B has lower payments' : 'Calculation A has lower payments'}
              ).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
          <div className="rounded-lg bg-white px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-right">
            <span className="block text-[10px] font-sans text-slate-400">Total Cost Delta</span>
            <span
              className={`font-bold ${costDifference > 0 ? 'text-emerald-600' : 'text-blue-600'}`}
            >
              {costDifference > 0 ? '-' : '+'}
              {formatCurrency(Math.abs(costDifference), currencyCode)}
            </span>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-right">
            <span className="block text-[10px] font-sans text-slate-400">Time to Payoff</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {periodsDifference === 0
                ? 'Same'
                : `${Math.abs(periodsDifference)} payments ${
                    periodsDifference > 0 ? 'earlier in B' : 'earlier in A'
                  }`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
