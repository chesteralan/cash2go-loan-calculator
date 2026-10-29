import React from 'react';
import { CalculationResult } from '../types/loan';
import { formatCurrency } from '../utils/currencies';
import { DollarSign, Percent, Calendar, Sparkles, TrendingDown, ShieldAlert } from 'lucide-react';

interface LoanSummaryCardsProps {
  result: CalculationResult;
}

export const LoanSummaryCards: React.FC<LoanSummaryCardsProps> = ({ result }) => {
  const {
    input,
    periodicPayment,
    totalPaymentPeriods,
    totalPrincipal,
    totalInterest,
    totalCost,
    totalFees,
    effectiveInterestRate,
    nominalAnnualRate,
    monthlyAddOnRate,
    payoffDate,
    savedInterestWithExtra,
    periodsSavedWithExtra,
  } = result;

  const paymentLabel = (() => {
    switch (input.paymentInterval) {
      case 'semi_monthly':
        return 'Semi-Monthly Payment';
      case 'bi_weekly':
        return 'Bi-Weekly Payment';
      case 'weekly':
        return 'Weekly Payment';
      case 'quarterly':
        return 'Quarterly Payment';
      case 'annually':
        return 'Annual Payment';
      default:
        return 'Monthly Amortization';
    }
  })();

  return (
    <div className="space-y-4">
      {/* Primary KPI Hero Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Periodic Payment */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-xs dark:border-blue-900/60 dark:from-slate-900 dark:to-slate-900/80">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            {paymentLabel}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-blue-900 dark:text-blue-100 tabular-nums">
            {formatCurrency(periodicPayment, input.currencyCode)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{totalPaymentPeriods} total payments</span>
            <span>·</span>
            <span>{input.paymentInterval.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Card 2: Total Gross Repayment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Amount to be Paid Back
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(totalCost, input.currencyCode)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Principal: {formatCurrency(totalPrincipal, input.currencyCode, false)}</span>
            {totalFees > 0 && (
              <>
                <span>·</span>
                <span>Fees: {formatCurrency(totalFees, input.currencyCode, false)}</span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Total Interest */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Interest Expense
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {formatCurrency(totalInterest, input.currencyCode)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {((totalInterest / (totalPrincipal || 1)) * 100).toFixed(1)}% of original principal
            </span>
          </div>
        </div>

        {/* Card 4: Effective Interest Rate (EIR / APR) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Effective Interest Rate (EIR / APR)
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {effectiveInterestRate.toFixed(3)}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {input.structure === 'fixed_addon' && monthlyAddOnRate !== undefined ? (
              <span>Add-on: {monthlyAddOnRate.toFixed(2)}%/mo</span>
            ) : (
              <span>Nominal APR: {nominalAnnualRate.toFixed(2)}%</span>
            )}
            <span>·</span>
            <span>Annualized via periodic IRR</span>
          </div>
        </div>
      </div>

      {/* Prepayment Savings Alert (if extra payment entered) */}
      {savedInterestWithExtra > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Prepayment Benefit:</strong> Extra payment of{' '}
              {formatCurrency(input.extraPaymentPerPeriod, input.currencyCode)} saves{' '}
              <strong>{formatCurrency(savedInterestWithExtra, input.currencyCode)}</strong> in
              interest and shortens loan term by <strong>{periodsSavedWithExtra} periods</strong>.
            </span>
          </div>
          <span className="hidden sm:inline font-mono font-bold text-emerald-700 dark:text-emerald-300">
            Payoff: {payoffDate}
          </span>
        </div>
      )}
    </div>
  );
};
