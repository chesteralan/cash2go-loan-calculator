import React from 'react';
import { LoanInput } from '../types/loan';
import { calculateLoan } from '../utils/loanCalculations';
import { formatCurrency } from '../utils/currencies';
import { ArrowRightLeft, HelpCircle, X } from 'lucide-react';
import { StructureCard } from './loan-comparison/StructureCard';
import { useModalA11y } from '../hooks/useModalA11y';

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
  const panelRef = useModalA11y<HTMLDivElement>(isOpen ? onClose : undefined);

  if (!isOpen) return null;

  const scenarios: {
    structure: 'fixed_addon' | 'diminishing_balance';
    result: ReturnType<typeof calculateLoan>;
    quotedRate: string;
  }[] = [
    {
      structure: 'fixed_addon',
      result: calculateLoan({
        ...activeInput,
        structure: 'fixed_addon',
        ratePeriod: 'monthly',
        interestRate: activeInput.structure === 'fixed_addon' ? activeInput.interestRate : 1.0,
      }),
      quotedRate:
        String(
          (activeInput.structure === 'fixed_addon' ? activeInput.interestRate : 1.0).toFixed(2)
        ) + '%',
    },
    {
      structure: 'diminishing_balance',
      result: calculateLoan({
        ...activeInput,
        structure: 'diminishing_balance',
        ratePeriod: 'annual',
        interestRate:
          activeInput.structure === 'diminishing_balance' ? activeInput.interestRate : 12.0,
      }),
      quotedRate:
        String(
          (activeInput.structure === 'diminishing_balance'
            ? activeInput.interestRate
            : 12.0
          ).toFixed(2)
        ) + '% APR',
    },
  ];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Structure Comparison"
        tabIndex={-1}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
      >
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StructureCard
            headerBorderClass="border-blue-100 dark:border-slate-800"
            frameClass="border-blue-200 bg-blue-50/30 dark:border-blue-900/60 dark:bg-slate-800/60"
            eyebrow="Structure A (Fixed Add-On Model)"
            eyebrowClass="text-blue-700 dark:text-blue-400"
            title="Fixed Rate (Add-on Flat)"
            tag="Flat Int."
            tagClass="bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
            quotedRate={scenarios[0].quotedRate}
            rateUnit="month"
            result={scenarios[0].result}
            currencyCode={activeInput.currencyCode}
            paymentValueClass="text-blue-600 dark:text-blue-400"
            eirValueClass="text-blue-700 dark:text-blue-300"
            buttonLabel="Use Fixed Add-On Structure"
            buttonClass="bg-blue-600 hover:bg-blue-700"
            onUse={() => {
              onApplyStructure('fixed_addon');
              onClose();
            }}
          />
          <StructureCard
            headerBorderClass="border-slate-100 dark:border-slate-800"
            frameClass="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/60"
            eyebrow="Structure B (Standard Mortgage)"
            eyebrowClass="text-slate-500 dark:text-slate-400"
            title="Diminishing Balance (Reducing)"
            tag="Declining Int."
            tagClass="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            quotedRate={scenarios[1].quotedRate}
            rateUnit="year"
            result={scenarios[1].result}
            currencyCode={activeInput.currencyCode}
            paymentValueClass="text-blue-600 dark:text-blue-400"
            eirValueClass="text-blue-700 dark:text-blue-300"
            buttonLabel="Use Diminishing Structure"
            buttonClass="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            onUse={() => {
              onApplyStructure('diminishing_balance');
              onClose();
            }}
          />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                How to choose the best structure for your goals:
              </p>
              <p className="mt-1">
                <strong>Fixed Add-On (Flat Rate)</strong> offers simple, predictable installments
                commonly found in consumer electronics, salary advances, and personal cash
                installment products (like fixed add-on loans). However, because you pay interest on
                the original loan amount even after paying down half the principal, the Effective
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
