import React from 'react';
import { CalculationResult } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';

interface Row {
  label: string;
  a: string;
  b: string;
  delta: string;
  deltaNum: number;
  better?: 'A' | 'B' | null;
}

export const ComparisonDifferenceCard: React.FC<{
  resultA: CalculationResult;
  resultB: CalculationResult;
}> = ({ resultA, resultB }) => {
  const currencyCode = resultA.input.currencyCode;
  const money = (v: number) => formatCurrency(v, currencyCode);

  const rows: Row[] = [
    {
      label: 'Principal',
      a: money(resultA.totalPrincipal),
      b: money(resultB.totalPrincipal),
      delta: money(resultA.totalPrincipal - resultB.totalPrincipal),
      deltaNum: resultA.totalPrincipal - resultB.totalPrincipal,
      better: null,
    },
    {
      label: 'Periodic Payment',
      a: money(resultA.periodicPayment),
      b: money(resultB.periodicPayment),
      delta: money(resultA.periodicPayment - resultB.periodicPayment),
      deltaNum: resultA.periodicPayment - resultB.periodicPayment,
      better:
        resultA.periodicPayment === resultB.periodicPayment
          ? null
          : resultA.periodicPayment < resultB.periodicPayment
            ? 'A'
            : 'B',
    },
    {
      label: 'Total Interest',
      a: money(resultA.totalInterest),
      b: money(resultB.totalInterest),
      delta: money(resultA.totalInterest - resultB.totalInterest),
      deltaNum: resultA.totalInterest - resultB.totalInterest,
      better:
        resultA.totalInterest === resultB.totalInterest
          ? null
          : resultA.totalInterest < resultB.totalInterest
            ? 'A'
            : 'B',
    },
    {
      label: 'Gross Repayment',
      a: money(resultA.totalCost),
      b: money(resultB.totalCost),
      delta: money(resultA.totalCost - resultB.totalCost),
      deltaNum: resultA.totalCost - resultB.totalCost,
      better:
        resultA.totalCost === resultB.totalCost
          ? null
          : resultA.totalCost < resultB.totalCost
            ? 'A'
            : 'B',
    },
    {
      label: 'Effective Rate (EIR)',
      a: `${resultA.effectiveInterestRate.toFixed(3)}%`,
      b: `${resultB.effectiveInterestRate.toFixed(3)}%`,
      delta: `${(resultA.effectiveInterestRate - resultB.effectiveInterestRate).toFixed(3)}%`,
      deltaNum: resultA.effectiveInterestRate - resultB.effectiveInterestRate,
      better:
        resultA.effectiveInterestRate === resultB.effectiveInterestRate
          ? null
          : resultA.effectiveInterestRate < resultB.effectiveInterestRate
            ? 'A'
            : 'B',
    },
    {
      label: 'Payment Periods',
      a: String(resultA.totalPaymentPeriods),
      b: String(resultB.totalPaymentPeriods),
      delta: String(resultA.totalPaymentPeriods - resultB.totalPaymentPeriods),
      deltaNum: resultA.totalPaymentPeriods - resultB.totalPaymentPeriods,
      better:
        resultA.totalPaymentPeriods === resultB.totalPaymentPeriods
          ? null
          : resultA.totalPaymentPeriods < resultB.totalPaymentPeriods
            ? 'A'
            : 'B',
    },
    {
      label: 'Total Fees',
      a: money(resultA.totalFees),
      b: money(resultB.totalFees),
      delta: money(resultA.totalFees - resultB.totalFees),
      deltaNum: resultA.totalFees - resultB.totalFees,
      better:
        resultA.totalFees === resultB.totalFees
          ? null
          : resultA.totalFees < resultB.totalFees
            ? 'A'
            : 'B',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Calculation Difference (A − B)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Side-by-side metric comparison with the net difference.
        </p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-2 text-left font-semibold">Metric</th>
              <th className="py-2 text-right font-semibold text-blue-700 dark:text-blue-400">A</th>
              <th className="py-2 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                B
              </th>
              <th className="py-2 text-right font-semibold">Difference</th>
              <th className="py-2 text-center font-semibold">Better</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-2 text-left font-sans font-medium text-slate-700 dark:text-slate-300">
                  {row.label}
                </td>
                <td className="py-2 text-right text-slate-900 dark:text-white">{row.a}</td>
                <td className="py-2 text-right text-slate-900 dark:text-white">{row.b}</td>
                <td
                  className={`py-2 text-right font-bold ${
                    row.deltaNum === 0
                      ? 'text-slate-500'
                      : row.deltaNum < 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {row.delta}
                </td>
                <td className="py-2 text-center">
                  {row.better ? (
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                        row.better === 'A' ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}
                    >
                      {row.better}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
