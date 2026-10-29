import React from 'react';
import { CalculationResult } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';

const headCellRight = 'py-3 px-4 text-right';
const bodyCell = 'py-2.5 px-4';

export const DetailedScheduleTable: React.FC<{
  result: CalculationResult;
  rows: CalculationResult['schedule'];
}> = ({ result, rows }) => {
  const { input } = result;
  const showExtra = input.extraPaymentPerPeriod > 0;
  return (
    <table className="w-full text-left border-collapse text-xs sm:text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-semibold">
          <th scope="col" className="py-3 px-3 text-center">
            #
          </th>
          <th scope="col" className={bodyCell}>
            Payment Date
          </th>
          <th scope="col" className={headCellRight}>
            Payment
          </th>
          <th scope="col" className={headCellRight}>
            Principal
          </th>
          <th scope="col" className={headCellRight}>
            Interest
          </th>
          {showExtra && (
            <th scope="col" className={headCellRight}>
              Extra
            </th>
          )}
          <th scope="col" className={headCellRight}>
            Ending Balance
          </th>
          <th scope="col" className={headCellRight}>
            Cum. Interest
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-mono tabular-nums">
        {rows.map((row) => (
          <tr
            key={row.period}
            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
          >
            <td className="py-2.5 px-3 text-center text-slate-400 font-sans">{row.period}</td>
            <td className={`${bodyCell} font-sans text-slate-600 dark:text-slate-300`}>
              {row.date}
            </td>
            <td className={`${headCellRight} font-semibold text-slate-900 dark:text-white`}>
              {formatCurrency(row.payment, input.currencyCode)}
            </td>
            <td className={`${headCellRight} text-blue-600 dark:text-blue-400`}>
              {formatCurrency(row.principal, input.currencyCode)}
            </td>
            <td className={`${headCellRight} text-amber-600 dark:text-amber-400`}>
              {formatCurrency(row.interest, input.currencyCode)}
            </td>
            {showExtra && (
              <td
                className={`${headCellRight} text-emerald-600 dark:text-emerald-400 font-semibold`}
              >
                {row.extraPayment > 0 ? formatCurrency(row.extraPayment, input.currencyCode) : '-'}
              </td>
            )}
            <td className={`${headCellRight} font-medium`}>
              {formatCurrency(row.remainingBalance, input.currencyCode)}
            </td>
            <td className={`${headCellRight} text-slate-400`}>
              {formatCurrency(row.cumulativeInterest, input.currencyCode)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
