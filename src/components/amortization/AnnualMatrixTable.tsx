import React from 'react';
import { CalculationResult } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';

const headCell = 'py-3 px-4';
const headCellRight = 'py-3 px-4 text-right';

export const AnnualMatrixTable: React.FC<{ result: CalculationResult }> = ({ result }) => {
  const { annualMatrix, input, totalPrincipal, totalInterest, totalCost } = result;
  return (
    <table className="w-full text-left border-collapse text-xs sm:text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-semibold">
          <th scope="col" className={headCell}>
            Year
          </th>
          <th scope="col" className={headCell}>
            Calendar Year
          </th>
          <th scope="col" className={headCellRight}>
            Principal Paid
          </th>
          <th scope="col" className={headCellRight}>
            Interest Paid
          </th>
          <th scope="col" className={headCellRight}>
            Total Paid
          </th>
          <th scope="col" className={headCellRight}>
            Ending Balance
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-mono tabular-nums">
        {annualMatrix.map((row) => (
          <tr
            key={row.yearIndex}
            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
          >
            <td className={`${headCell} font-sans font-semibold text-slate-900 dark:text-white`}>
              Year {row.yearIndex}
            </td>
            <td className={`${headCell} font-sans text-slate-500 dark:text-slate-400`}>
              {row.calendarYear}
            </td>
            <td className={`${headCellRight} text-blue-600 dark:text-blue-400 font-medium`}>
              {formatCurrency(row.principalPaid, input.currencyCode)}
            </td>
            <td className={`${headCellRight} text-amber-600 dark:text-amber-400`}>
              {formatCurrency(row.interestPaid, input.currencyCode)}
            </td>
            <td className={`${headCellRight} font-semibold text-slate-900 dark:text-white`}>
              {formatCurrency(row.totalPaid, input.currencyCode)}
            </td>
            <td className={`${headCellRight} font-medium`}>
              {formatCurrency(row.endingBalance, input.currencyCode)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white font-mono tabular-nums">
          <td className="py-3.5 px-4 font-sans" colSpan={2}>
            Total Loan Lifecycle
          </td>
          <td className={`${headCellRight} text-blue-600 dark:text-blue-400`}>
            {formatCurrency(totalPrincipal, input.currencyCode)}
          </td>
          <td className={`${headCellRight} text-amber-600 dark:text-amber-400`}>
            {formatCurrency(totalInterest, input.currencyCode)}
          </td>
          <td className={headCellRight}>{formatCurrency(totalCost, input.currencyCode)}</td>
          <td className={`${headCellRight} font-sans text-emerald-600 dark:text-emerald-400`}>
            Fully Paid (0.00)
          </td>
        </tr>
      </tfoot>
    </table>
  );
};
