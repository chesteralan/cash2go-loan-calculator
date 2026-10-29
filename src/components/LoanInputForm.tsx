import React, { useState } from 'react';
import { LoanInput, LoanStructure, PaymentInterval, TermUnit } from '../types/loan';
import { getCurrency } from '../utils/currencies';
import {
  CASH2GO_PRESET,
  STANDARD_MORTGAGE_PRESET,
  US_MORTGAGE_PRESET,
} from '../utils/loanCalculations';
import {
  Sliders,
  DollarSign,
  Percent,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  RotateCcw,
} from 'lucide-react';

interface LoanInputFormProps {
  input: LoanInput;
  onChange: (updated: LoanInput) => void;
  onSaveLoan: () => void;
  onReset: () => void;
}

export const LoanInputForm: React.FC<LoanInputFormProps> = ({
  input,
  onChange,
  onSaveLoan,
  onReset,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const currency = getCurrency(input.currencyCode);

  const updateField = <K extends keyof LoanInput>(field: K, value: LoanInput[K]) => {
    onChange({
      ...input,
      [field]: value,
    });
  };

  const handleStructureChange = (structure: LoanStructure) => {
    if (structure === 'fixed_addon') {
      onChange({
        ...input,
        structure,
        ratePeriod: 'monthly',
        interestRate: input.structure === 'fixed_addon' ? input.interestRate : 1.0,
      });
    } else {
      onChange({
        ...input,
        structure,
        ratePeriod: 'annual',
        interestRate: input.structure === 'diminishing_balance' ? input.interestRate : 6.5,
      });
    }
  };

  const maxPrincipal =
    input.currencyCode === 'PHP' || input.currencyCode === 'JPY' ? 20000000 : 2000000;
  const principalStep = input.currencyCode === 'PHP' || input.currencyCode === 'JPY' ? 10000 : 1000;

  const quickPrincipalAdds =
    input.currencyCode === 'PHP'
      ? [50000, 100000, 300000, 500000, 1000000]
      : [10000, 25000, 50000, 100000, 250000];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Loan Parameters & Structure</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure borrowing amount, repayment structure, and interest intervals.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => onChange(CASH2GO_PRESET)}
            className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
          >
            Cash2Go (₱300k)
          </button>
          <button
            type="button"
            onClick={() => onChange(STANDARD_MORTGAGE_PRESET)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            PH Mortgage (₱5M)
          </button>
          <button
            type="button"
            onClick={() => onChange(US_MORTGAGE_PRESET)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            US Mortgage ($400k)
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Loan Title */}
        <div>
          <label
            htmlFor="loan-title"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Loan Title / Description
          </label>
          <input
            id="loan-title"
            type="text"
            value={input.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g., Metrobank Cash2Go Personal Loan"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Structure Selector: Fixed Add-On vs Diminishing Balance */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Loan Amortization Structure
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleStructureChange('fixed_addon')}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                input.structure === 'fixed_addon'
                  ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  Fixed Rate (Add-on Flat)
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                  Cash2Go Style
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Interest calculated on initial principal each month. Common for personal and auto
                installment loans.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleStructureChange('diminishing_balance')}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                input.structure === 'diminishing_balance'
                  ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  Diminishing Balance (Reducing)
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Standard Mortgage
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Interest computed on remaining unpaid balance. Typical for home mortgages and
                commercial credit.
              </p>
            </button>
          </div>
        </div>

        {/* Loan Principal Input & Slider */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="loan-principal"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Loan Amount (Principal)
            </label>
            <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
              {currency.symbol} {Number(input.principal || 0).toLocaleString()}
            </span>
          </div>

          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-semibold">
              {currency.symbol}
            </div>
            <input
              id="loan-principal"
              type="number"
              min="1000"
              max={maxPrincipal}
              step={principalStep}
              value={input.principal}
              onChange={(e) => updateField('principal', Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-base font-semibold font-mono text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {quickPrincipalAdds.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => updateField('principal', amt)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  input.principal === amt
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {currency.symbol} {amt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Principal Slider */}
          <input
            type="range"
            min="10000"
            max={maxPrincipal}
            step={principalStep}
            value={input.principal}
            onChange={(e) => updateField('principal', Number(e.target.value))}
            className="mt-3 w-full accent-blue-600 cursor-pointer"
            aria-label="Adjust loan principal slider"
          />
        </div>

        {/* Interest Rate & Term Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Interest Rate */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="interest-rate"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {input.structure === 'fixed_addon'
                  ? 'Monthly Add-on Rate'
                  : 'Annual Interest Rate (APR)'}
              </label>
              {input.structure === 'fixed_addon' && (
                <div className="flex rounded-md bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => updateField('ratePeriod', 'monthly')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      input.ratePeriod === 'monthly'
                        ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Monthly %
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('ratePeriod', 'annual')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      input.ratePeriod === 'annual'
                        ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Annual %
                  </button>
                </div>
              )}
            </div>

            <div className="relative mt-2">
              <input
                id="interest-rate"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={input.interestRate}
                onChange={(e) => updateField('interestRate', Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-slate-300 bg-white pr-9 pl-3.5 py-2.5 text-base font-semibold font-mono text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 font-bold">
                %
              </div>
            </div>

            <input
              type="range"
              min={input.ratePeriod === 'monthly' ? 0.25 : 1}
              max={input.ratePeriod === 'monthly' ? 3.0 : 25}
              step="0.05"
              value={input.interestRate}
              onChange={(e) => updateField('interestRate', Number(e.target.value))}
              className="mt-2.5 w-full accent-blue-600 cursor-pointer"
              aria-label="Adjust interest rate slider"
            />
          </div>

          {/* Loan Duration / Term */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="term-value"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Loan Duration / Term
              </label>
              <div className="flex rounded-md bg-slate-100 p-0.5 dark:bg-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const months =
                      input.termUnit === 'years' ? input.termValue * 12 : input.termValue;
                    onChange({ ...input, termUnit: 'months', termValue: months });
                  }}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    input.termUnit === 'months'
                      ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Months
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const years =
                      input.termUnit === 'months'
                        ? Math.max(1, Math.round(input.termValue / 12))
                        : input.termValue;
                    onChange({ ...input, termUnit: 'years', termValue: years });
                  }}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    input.termUnit === 'years'
                      ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Years
                </button>
              </div>
            </div>

            <div className="relative mt-2">
              <input
                id="term-value"
                type="number"
                min="1"
                max={input.termUnit === 'months' ? 480 : 40}
                value={input.termValue}
                onChange={(e) => updateField('termValue', Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-slate-300 bg-white pr-16 pl-3.5 py-2.5 text-base font-semibold font-mono text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 text-xs font-semibold">
                {input.termUnit}
              </div>
            </div>

            <input
              type="range"
              min="1"
              max={input.termUnit === 'months' ? 120 : 30}
              value={input.termValue}
              onChange={(e) => updateField('termValue', Number(e.target.value))}
              className="mt-2.5 w-full accent-blue-600 cursor-pointer"
              aria-label="Adjust loan term slider"
            />
          </div>
        </div>

        {/* Quick Term Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-400">Quick terms:</span>
          {[12, 24, 36, 48, 60].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                onChange({ ...input, termUnit: 'months', termValue: m });
              }}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                input.termUnit === 'months' && input.termValue === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {m} mos
            </button>
          ))}
          {[10, 15, 20, 30].map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                onChange({ ...input, termUnit: 'years', termValue: y });
              }}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                input.termUnit === 'years' && input.termValue === y
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {y} yrs
            </button>
          ))}
        </div>

        {/* Payment Interval & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="payment-interval"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Payment Interval
            </label>
            <select
              id="payment-interval"
              value={input.paymentInterval}
              onChange={(e) => updateField('paymentInterval', e.target.value as PaymentInterval)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="monthly">Monthly (12 payments/year)</option>
              <option value="semi_monthly">Semi-Monthly (24 payments/year, 2x/mo)</option>
              <option value="bi_weekly">Bi-Weekly (26 payments/year, every 2 wks)</option>
              <option value="weekly">Weekly (52 payments/year)</option>
              <option value="quarterly">Quarterly (4 payments/year)</option>
              <option value="annually">Annually (1 payment/year)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="start-date"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              First Payment Date
            </label>
            <input
              id="start-date"
              type="date"
              value={input.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Advanced Options Accordion (Extra Payments, Fees) */}
        <div className="border-t border-slate-150 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white py-1"
          >
            <span>Advanced Parameters (Prepayment & One-Time Fees)</span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <label
                  htmlFor="extra-payment"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Extra Principal Payment per Period
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                    {currency.symbol}
                  </div>
                  <input
                    id="extra-payment"
                    type="number"
                    min="0"
                    step="50"
                    value={input.extraPaymentPerPeriod}
                    onChange={(e) =>
                      updateField('extraPaymentPerPeriod', Math.max(0, Number(e.target.value)))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs font-mono font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Accelerates debt payoff and calculates total interest saved over loan lifecycle.
                </p>
              </div>

              <div>
                <label
                  htmlFor="one-time-fee"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  One-Time Fees / Closing Costs
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                    {currency.symbol}
                  </div>
                  <input
                    id="one-time-fee"
                    type="number"
                    min="0"
                    step="100"
                    value={input.oneTimeFee}
                    onChange={(e) => updateField('oneTimeFee', Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs font-mono font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Processing fees, doc stamps, or mortgage appraisal costs included in total loan
                  expense.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Inputs</span>
          </button>

          <button
            type="button"
            onClick={onSaveLoan}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm"
          >
            <BookmarkPlus className="h-4 w-4" />
            <span>Save to My Calculations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
