import React from 'react';
import { LoanInput } from '../types/loan';
import { calculateLoan } from '../utils/loanCalculations';
import { formatCurrency } from '../utils/currencies';
import { ArrowRightLeft, CheckCircle2, AlertCircle, X, HelpCircle } from 'lucide-react';

interface LoanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeInput: LoanInput;
  onApplyStructure: (structure: 'fixed_addon' | 'diminishing_balance') => void;
}

export const LoanComparisonModal: React.FC<LoanComparisonModalProps> = ({
  isOpen,
  onClose,
  activeInput,
  onApplyStructure,
}) => {
  if (!isOpen) return null;

  // Calculate Fixed Add-on Scenario
  const fixedInput: LoanInput = {
    ...activeInput,
    structure: 'fixed_addon',
    ratePeriod: 'monthly',
    interestRate: activeInput.structure === 'fixed_addon' ? activeInput.interestRate : 1.0,
  };
  const fixedResult = calculateLoan(fixedInput);

  // Calculate Diminishing Balance Scenario
  const diminishingInput: LoanInput = {
    ...activeInput,
    structure: 'diminishing_balance',
    ratePeriod: 'annual',
    interestRate: activeInput.structure === 'diminishing_balance' ? activeInput.interestRate : 12.0,
  };
  const diminishingResult = calculateLoan(diminishingInput);

  const interestDiff = Math.abs(fixedResult.totalInterest - diminishingResult.totalInterest);
  const fixedIsMoreExpensive = fixedResult.totalInterest > diminishingResult.totalInterest;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ArrowRightLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Structure Comparison: Fixed Add-On vs. Diminishing Balance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing both loan structures using Principal{' '}
                {formatCurrency(activeInput.principal, activeInput.currencyCode)} over{' '}
                {activeInput.termValue} {activeInput.termUnit}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close comparison"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Fixed Add-On Rate */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5 dark:border-blue-900/60 dark:bg-slate-850">
            <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Structure A (Cash2Go Model)
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Fixed Rate (Add-on Flat)
                </h4>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/80 dark:text-blue-200">
                Flat Int.
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">Quoted Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {fixedInput.interestRate.toFixed(2)}% / month
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">
                  Periodic Payment:
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {formatCurrency(fixedResult.periodicPayment, activeInput.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">
                  Total Interest:
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(fixedResult.totalInterest, activeInput.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">
                  Gross Repayment:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(fixedResult.totalCost, activeInput.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">
                  Effective Rate (EIR):
                </span>
                <span className="font-extrabold text-blue-700 dark:text-blue-300">
                  {fixedResult.effectiveInterestRate.toFixed(3)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onApplyStructure('fixed_addon');
                onClose();
              }}
              className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Use Fixed Add-On Structure
            </button>
          </div>

          {/* Column 2: Diminishing Balance */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-850">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Structure B (Standard Mortgage)
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Diminishing Balance (Reducing)
                </h4>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Declining Int.
              </span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">Quoted Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {diminishingInput.interestRate.toFixed(2)}% APR / year
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">
                  Periodic Payment:
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {formatCurrency(diminishingResult.periodicPayment, activeInput.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">
                  Total Interest:
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(diminishingResult.totalInterest, activeInput.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-slate-500 dark:text-slate-400">
                  Gross Repayment:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(diminishingResult.totalCost, activeInput.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">
                  Effective Rate (EIR):
                </span>
                <span className="font-extrabold text-blue-700 dark:text-blue-300">
                  {diminishingResult.effectiveInterestRate.toFixed(3)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onApplyStructure('diminishing_balance');
                onClose();
              }}
              className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
            >
              Use Diminishing Structure
            </button>
          </div>
        </div>

        {/* Financial Wisdom Note */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                How to choose the best structure for your goals:
              </p>
              <p className="mt-1">
                <strong>Fixed Add-On (Flat Rate)</strong> offers simple, predictable installments
                commonly found in consumer electronics, salary advances, and personal cash
                installment products (like Cash2Go). However, because you pay interest on the
                original loan amount even after paying down half the principal, the Effective
                Interest Rate (EIR) is roughly double the stated nominal rate.
              </p>
              <p className="mt-1">
                <strong>Diminishing Balance</strong> charges interest only on what you still owe
                each month. As you pay down principal, interest payments decrease, making it much
                more economical for long-term borrowings like mortgages and vehicle financing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
