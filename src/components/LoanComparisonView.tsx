import React, { useState, useMemo } from 'react';
import { LoanInput, SavedLoanRecord } from '../types/loan';
import { calculateLoan } from '../utils/loanCalculations';
import { ArrowRightLeft, FileText } from 'lucide-react';
import { comparisonPresets, currencyCounterpart } from './loan-comparison/comparisonPresets';
import { ComparisonVerdict } from './loan-comparison/ComparisonVerdict';
import { BalanceTrajectoryChart } from './loan-comparison/BalanceTrajectoryChart';
import { ComparisonLoanCard, accents } from './loan-comparison/ComparisonLoanCard';
import { ComparisonDifferenceCard } from './loan-comparison/ComparisonDifferenceCard';

interface LoanComparisonViewProps {
  initialLoanA: LoanInput;
  initialLoanB?: LoanInput;
  savedLoans: SavedLoanRecord[];
  onApplyToMainCalculator: (loan: LoanInput) => void;
}

const presetButtonClass =
  'rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors';

export const LoanComparisonView: React.FC<LoanComparisonViewProps> = ({
  initialLoanA,
  initialLoanB,
  savedLoans,
  onApplyToMainCalculator,
}) => {
  const [loanA, setLoanA] = useState<LoanInput>(initialLoanA);
  const [loanB, setLoanB] = useState<LoanInput>(initialLoanB || currencyCounterpart(initialLoanA));

  const resultA = useMemo(() => calculateLoan(loanA), [loanA]);
  const resultB = useMemo(() => calculateLoan(loanB), [loanB]);

  const applyPresetPair = (key: string) => {
    const preset = comparisonPresets.find((p) => p.key === key);
    if (!preset) return;
    const [nextA, nextB] = preset.build(Date.now().toString(36));
    setLoanA(nextA);
    setLoanB(nextB);
  };

  const handleSwap = () => {
    setLoanA({ ...loanB });
    setLoanB({ ...loanA });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Comparative Amortization Matrix</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Side-by-Side Loan Calculation Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Compare payments, interest costs, and payoff timelines between two loan structures or
              terms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyPresetPair('fixed_addon_vs_diminishing')}
              className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
            >
              {comparisonPresets[0].label}
            </button>
            {comparisonPresets.slice(1).map((preset) => (
              <button
                key={preset.key}
                onClick={() => applyPresetPair(preset.key)}
                className={presetButtonClass}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Swap Calculation A and Calculation B"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Swap A ⇄ B</span>
            </button>
            <button
              onClick={() =>
                void import('../utils/pdfExport').then((m) =>
                  m.exportComparisonPDF(resultA, resultB)
                )
              }
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Export Comparison PDF</span>
            </button>
          </div>
        </div>

        <div className="mt-5">
          <ComparisonVerdict
            resultA={resultA}
            resultB={resultB}
            interestDifference={resultA.totalInterest - resultB.totalInterest}
            paymentDifference={resultA.periodicPayment - resultB.periodicPayment}
            costDifference={resultA.totalCost - resultB.totalCost}
            periodsDifference={resultA.totalPaymentPeriods - resultB.totalPaymentPeriods}
          />
        </div>
      </div>

      <BalanceTrajectoryChart resultA={resultA} resultB={resultB} />

      <ComparisonDifferenceCard resultA={resultA} resultB={resultB} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComparisonLoanCard
          label="A"
          accent={accents.blue}
          result={resultA}
          savedLoans={savedLoans}
          onApplyToMainCalculator={onApplyToMainCalculator}
          onTitleChange={(title) => setLoanA({ ...loanA, title })}
          onSelectSaved={setLoanA}
          onParamChange={(changes) => setLoanA({ ...loanA, ...changes })}
        />
        <ComparisonLoanCard
          label="B"
          accent={accents.emerald}
          result={resultB}
          savedLoans={savedLoans}
          onApplyToMainCalculator={onApplyToMainCalculator}
          onTitleChange={(title) => setLoanB({ ...loanB, title })}
          onSelectSaved={setLoanB}
          onParamChange={(changes) => setLoanB({ ...loanB, ...changes })}
        />
      </div>
    </div>
  );
};
