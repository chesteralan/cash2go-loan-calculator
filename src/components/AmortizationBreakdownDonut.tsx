import React from 'react';
import { CalculationResult } from '../types/loan';
import { formatCurrency } from '../utils/currencies';
import { PieChart } from 'lucide-react';

interface AmortizationBreakdownDonutProps {
  result: CalculationResult;
}

export const AmortizationBreakdownDonut: React.FC<AmortizationBreakdownDonutProps> = ({
  result,
}) => {
  const { totalPrincipal, totalInterest, totalFees, totalCost, input } = result;

  const principalRatio = totalCost > 0 ? totalPrincipal / totalCost : 1;
  const interestRatio = totalCost > 0 ? totalInterest / totalCost : 0;
  const feesRatio = totalCost > 0 ? totalFees / totalCost : 0;

  // SVG circular calculations
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const principalStroke = principalRatio * circumference;
  const interestStroke = interestRatio * circumference;
  const feesStroke = feesRatio * circumference;

  // Offsets
  const principalOffset = 0;
  const interestOffset = -principalStroke;
  const feesOffset = -(principalStroke + interestStroke);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span>Total Loan Cost Composition</span>
      </h3>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              className="dark:stroke-slate-800"
            />
            {/* Principal Arc (Blue) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#2563EB"
              strokeWidth={strokeWidth}
              strokeDasharray={`${principalStroke} ${circumference}`}
              strokeDashoffset={principalOffset}
              className="transition-all duration-500"
            />
            {/* Interest Arc (Amber) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F59E0B"
              strokeWidth={strokeWidth}
              strokeDasharray={`${interestStroke} ${circumference}`}
              strokeDashoffset={interestOffset}
              className="transition-all duration-500"
            />
            {/* Fees Arc (Purple/Indigo) */}
            {feesRatio > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#8B5CF6"
                strokeWidth={strokeWidth}
                strokeDasharray={`${feesStroke} ${circumference}`}
                strokeDashoffset={feesOffset}
                className="transition-all duration-500"
              />
            )}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Principal
            </span>
            <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
              {(principalRatio * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-500">of total cost</span>
          </div>
        </div>

        {/* Legend stats */}
        <div className="w-full space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-blue-600" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Original Principal
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalPrincipal, input.currencyCode)}
              </span>
              <span className="ml-1.5 text-slate-400">({(principalRatio * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Interest Expense
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(totalInterest, input.currencyCode)}
              </span>
              <span className="ml-1.5 text-slate-400">({(interestRatio * 100).toFixed(1)}%)</span>
            </div>
          </div>

          {totalFees > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-purple-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Fees & Closing
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalFees, input.currencyCode)}
                </span>
                <span className="ml-1.5 text-slate-400">({(feesRatio * 100).toFixed(1)}%)</span>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-semibold">
            <span className="text-slate-800 dark:text-slate-200">Gross Repayment</span>
            <span className="font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalCost, input.currencyCode)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
