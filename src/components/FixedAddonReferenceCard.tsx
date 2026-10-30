import React from 'react';
import { CheckCircle2, ArrowRight, HelpCircle, Layers, Info } from 'lucide-react';
import { LoanInput } from '../types/loan';
import { FIXED_ADDON_PRESET } from '../utils/loanCalculations';

interface FixedAddonReferenceCardProps {
  onApplyPreset: (preset: LoanInput) => void;
  isActive: boolean;
}

export const FixedAddonReferenceCard: React.FC<FixedAddonReferenceCardProps> = ({
  onApplyPreset,
  isActive,
}) => {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-5 sm:p-6 shadow-sm dark:border-blue-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            <Layers className="h-4 w-4" />
            <span>Bank Installment Benchmark</span>
            <span className="text-slate-400">·</span>
            <span>Fixed Add-On Reference Model</span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Official Fixed Add-On Sample Calculation Reference
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Standard installment benchmark based on phone-in installment guidelines.
          </p>
        </div>

        <button
          onClick={() => onApplyPreset(FIXED_ADDON_PRESET)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
            isActive
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
          }`}
          aria-label="Load fixed add-on sample values into the active calculator"
        >
          {isActive ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Active in Calculator</span>
            </>
          ) : (
            <>
              <span>Load Fixed Add-On Benchmark</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Benchmark Matrix Table mimicking user's reference image */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-center border-collapse border border-blue-600 dark:border-blue-700 rounded-lg overflow-hidden text-xs sm:text-sm">
          <thead>
            <tr className="bg-blue-700 text-white font-semibold">
              <th className="py-2.5 px-3 border border-blue-600">
                Amount you pay monthly
                <br />
                <span className="font-normal text-[11px] opacity-90">(Monthly Amortization)</span>
              </th>
              <th className="py-2.5 px-3 border border-blue-600">
                Total amount to be paid back
                <br />
                <span className="font-normal text-[11px] opacity-90">(Gross Repayment)</span>
              </th>
              <th className="py-2.5 px-3 border border-blue-600">
                Total Interest Amount
                <br />
                <span className="font-normal text-[11px] opacity-90">(At 1.00% Add-On)</span>
              </th>
              <th className="py-2.5 px-3 border border-blue-600">
                Monthly Effective
                <br />
                Interest Rate (EIR)
              </th>
              <th className="py-2.5 px-3 border border-blue-600">
                Monthly Add-on
                <br />
                Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono font-medium">
            <tr>
              <td className="py-3 px-3 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-bold">
                ₱ 8,000.00
              </td>
              <td className="py-3 px-3 border border-blue-200 dark:border-slate-700">
                ₱ 480,000.00
              </td>
              <td className="py-3 px-3 border border-blue-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                ₱ 180,000.00
              </td>
              <td className="py-3 px-3 border border-blue-200 dark:border-slate-700 font-bold">
                20.310%
              </td>
              <td className="py-3 px-3 border border-blue-200 dark:border-slate-700">1.00%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Input specs & explanation */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="font-semibold text-slate-900 dark:text-white">
            Step 1: Loan Principal
          </span>
          <p className="mt-0.5 font-mono text-slate-700 dark:text-slate-300">₱ 300,000.00</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="font-semibold text-slate-900 dark:text-white">
            Step 2: Installment Term
          </span>
          <p className="mt-0.5 font-mono text-slate-700 dark:text-slate-300">60 Months (5 Years)</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="font-semibold text-slate-900 dark:text-white">Step 3: Math Formula</span>
          <p className="mt-0.5 font-mono text-slate-700 dark:text-slate-300">
            Int = P × 1.00% × 60 mos
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
        <p>
          <strong>Why is the Effective Rate 20.310% when the Add-On Rate is only 1.00%?</strong> In
          fixed add-on structures, interest is charged on the initial ₱300,000 throughout all 60
          months, even though your balance declines each month. Using the central bank Internal Rate
          of Return (IRR) standard, the true economic cost is 20.310% per annum.
        </p>
      </div>
    </div>
  );
};
