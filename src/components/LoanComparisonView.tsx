import React, { useState, useMemo } from 'react';
import { LoanInput, SavedLoanRecord } from '../types/loan';
import {
  calculateLoan,
  CASH2GO_PRESET,
  STANDARD_MORTGAGE_PRESET,
  US_MORTGAGE_PRESET,
} from '../utils/loanCalculations';
import { formatCurrency, getCurrency } from '../utils/currencies';
import { exportComparisonPDF } from '../utils/exportUtils';
import {
  ArrowRightLeft,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Layers,
  Calendar,
  DollarSign,
  Percent,
} from 'lucide-react';

interface LoanComparisonViewProps {
  initialLoanA: LoanInput;
  initialLoanB?: LoanInput;
  savedLoans: SavedLoanRecord[];
  onApplyToMainCalculator: (loan: LoanInput) => void;
}

export const LoanComparisonView: React.FC<LoanComparisonViewProps> = ({
  initialLoanA,
  initialLoanB,
  savedLoans,
  onApplyToMainCalculator,
}) => {
  // Loan A state
  const [loanA, setLoanA] = useState<LoanInput>(initialLoanA);

  // Loan B state (defaults to diminishing balance counterpart or saved loan)
  const [loanB, setLoanB] = useState<LoanInput>(
    initialLoanB || {
      ...initialLoanA,
      id: `compare-b-${Date.now()}`,
      title:
        initialLoanA.structure === 'fixed_addon'
          ? 'Diminishing Balance Counterpart'
          : '15-Year Accelerated Loan',
      structure:
        initialLoanA.structure === 'fixed_addon' ? 'diminishing_balance' : 'diminishing_balance',
      interestRate: initialLoanA.structure === 'fixed_addon' ? 12.0 : 6.5,
      ratePeriod: 'annual',
      termValue:
        initialLoanA.structure === 'fixed_addon'
          ? initialLoanA.termValue
          : Math.max(12, Math.round(initialLoanA.termValue / 2)),
      termUnit: initialLoanA.termUnit,
    }
  );

  const [hoverPeriodIndex, setHoverPeriodIndex] = useState<number | null>(null);

  // Calculate results for both loans in real time
  const resultA = useMemo(() => calculateLoan(loanA), [loanA]);
  const resultB = useMemo(() => calculateLoan(loanB), [loanB]);

  // Differences
  const interestDifference = resultA.totalInterest - resultB.totalInterest;
  const paymentDifference = resultA.periodicPayment - resultB.periodicPayment;
  const costDifference = resultA.totalCost - resultB.totalCost;
  const periodsDifference = resultA.totalPaymentPeriods - resultB.totalPaymentPeriods;

  const currencyA = getCurrency(loanA.currencyCode);

  // Comparison Presets
  const applyPresetPair = (presetKey: string) => {
    if (presetKey === 'cash2go_vs_diminishing') {
      setLoanA({ ...CASH2GO_PRESET, title: 'Cash2Go 60m (1% Add-On)' });
      setLoanB({
        ...CASH2GO_PRESET,
        id: `loan-b-${Date.now()}`,
        title: 'Standard Bank Loan (12% APR Diminishing)',
        structure: 'diminishing_balance',
        ratePeriod: 'annual',
        interestRate: 12.0,
      });
    } else if (presetKey === '15_vs_30_mortgage') {
      setLoanA({
        ...STANDARD_MORTGAGE_PRESET,
        title: '30-Year Mortgage (6.75% APR)',
        termValue: 30,
        termUnit: 'years',
        extraPaymentPerPeriod: 0,
      });
      setLoanB({
        ...STANDARD_MORTGAGE_PRESET,
        id: `loan-b-${Date.now()}`,
        title: '15-Year Mortgage (6.25% APR)',
        termValue: 15,
        termUnit: 'years',
        interestRate: 6.25,
        extraPaymentPerPeriod: 0,
      });
    } else if (presetKey === 'extra_payment_impact') {
      setLoanA({
        ...STANDARD_MORTGAGE_PRESET,
        title: 'Without Extra Payments',
        extraPaymentPerPeriod: 0,
      });
      setLoanB({
        ...STANDARD_MORTGAGE_PRESET,
        id: `loan-b-${Date.now()}`,
        title: 'With +₱5,000/mo Extra Principal',
        extraPaymentPerPeriod: 5000,
      });
    } else if (presetKey === 'monthly_vs_biweekly') {
      setLoanA({
        ...STANDARD_MORTGAGE_PRESET,
        title: 'Monthly Payments',
        paymentInterval: 'monthly',
      });
      setLoanB({
        ...STANDARD_MORTGAGE_PRESET,
        id: `loan-b-${Date.now()}`,
        title: 'Bi-Weekly Payments (26x/year)',
        paymentInterval: 'bi_weekly',
      });
    }
  };

  const handleSwap = () => {
    const temp = { ...loanA };
    setLoanA({ ...loanB });
    setLoanB(temp);
  };

  // Comparative Chart Math
  const maxScheduleLength = Math.max(resultA.schedule.length, resultB.schedule.length);
  const maxPrincipal = Math.max(resultA.totalPrincipal, resultB.totalPrincipal) * 1.05;

  const chartWidth = 800;
  const chartHeight = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 70 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Downsample to at most 100 points
  const sampleSteps = maxScheduleLength > 120 ? Math.ceil(maxScheduleLength / 100) : 1;
  const sampleIndices: number[] = [];
  for (let i = 0; i < maxScheduleLength; i += sampleSteps) {
    sampleIndices.push(i);
  }
  if (!sampleIndices.includes(maxScheduleLength - 1)) {
    sampleIndices.push(maxScheduleLength - 1);
  }

  const pointsA = sampleIndices.map((idx) => {
    const x = padding.left + (idx / (maxScheduleLength - 1 || 1)) * innerWidth;
    const row =
      resultA.schedule[idx] ||
      (idx >= resultA.schedule.length ? resultA.schedule[resultA.schedule.length - 1] : null);
    const balance = row ? (idx >= resultA.schedule.length ? 0 : row.remainingBalance) : 0;
    const y = padding.top + innerHeight - (balance / maxPrincipal) * innerHeight;
    return { x, y, balance };
  });

  const pointsB = sampleIndices.map((idx) => {
    const x = padding.left + (idx / (maxScheduleLength - 1 || 1)) * innerWidth;
    const row =
      resultB.schedule[idx] ||
      (idx >= resultB.schedule.length ? resultB.schedule[resultB.schedule.length - 1] : null);
    const balance = row ? (idx >= resultB.schedule.length ? 0 : row.remainingBalance) : 0;
    const y = padding.top + innerHeight - (balance / maxPrincipal) * innerHeight;
    return { x, y, balance };
  });

  const linePathA = `M ${pointsA[0].x} ${pointsA[0].y} ${pointsA
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(' ')}`;
  const linePathB = `M ${pointsB[0].x} ${pointsB[0].y} ${pointsB
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(' ')}`;

  const activeHoverSample =
    hoverPeriodIndex !== null && hoverPeriodIndex >= 0 && hoverPeriodIndex < sampleIndices.length
      ? sampleIndices[hoverPeriodIndex]
      : Math.floor(maxScheduleLength / 2);

  const hoverRowA = resultA.schedule[activeHoverSample];
  const hoverRowB = resultB.schedule[activeHoverSample];

  return (
    <div className="space-y-6">
      {/* Top Comparison Header & Verdict Bar */}
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

          {/* Quick preset comparisons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyPresetPair('cash2go_vs_diminishing')}
              className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
            >
              Cash2Go vs Diminishing
            </button>
            <button
              onClick={() => applyPresetPair('15_vs_30_mortgage')}
              className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              15-Yr vs 30-Yr
            </button>
            <button
              onClick={() => applyPresetPair('extra_payment_impact')}
              className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Extra Payment Effect
            </button>
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Swap Calculation A and Calculation B"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Swap A ⇄ B</span>
            </button>
            <button
              onClick={() => exportComparisonPDF(resultA, resultB)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Export Comparison PDF</span>
            </button>
          </div>
        </div>

        {/* Verdict Summary Card */}
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
                VS
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {interestDifference === 0 ? (
                    'Both calculations result in identical total interest expense.'
                  ) : interestDifference > 0 ? (
                    <>
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                        Calculation B
                      </span>{' '}
                      saves you{' '}
                      <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300">
                        {formatCurrency(interestDifference, loanA.currencyCode)}
                      </span>{' '}
                      in total interest (
                      {((interestDifference / (resultA.totalInterest || 1)) * 100).toFixed(1)}%
                      savings)!
                    </>
                  ) : (
                    <>
                      <span className="text-blue-700 dark:text-blue-400 font-extrabold">
                        Calculation A
                      </span>{' '}
                      saves you{' '}
                      <span className="font-mono font-extrabold text-blue-800 dark:text-blue-300">
                        {formatCurrency(Math.abs(interestDifference), loanA.currencyCode)}
                      </span>{' '}
                      in total interest (
                      {(
                        (Math.abs(interestDifference) / (resultB.totalInterest || 1)) *
                        100
                      ).toFixed(1)}
                      % savings)!
                    </>
                  )}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Periodic payment difference:{' '}
                  <span className="font-mono font-semibold">
                    {formatCurrency(Math.abs(paymentDifference), loanA.currencyCode)}
                  </span>{' '}
                  (
                  {paymentDifference > 0
                    ? 'Calculation B has lower payments'
                    : 'Calculation A has lower payments'}
                  ).
                </p>
              </div>
            </div>

            {/* Quick KPI Delta badges */}
            <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
              <div className="rounded-lg bg-white px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-right">
                <span className="block text-[10px] font-sans text-slate-400">Total Cost Delta</span>
                <span
                  className={`font-bold ${costDifference > 0 ? 'text-emerald-600' : 'text-blue-600'}`}
                >
                  {costDifference > 0 ? '-' : '+'}
                  {formatCurrency(Math.abs(costDifference), loanA.currencyCode)}
                </span>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-right">
                <span className="block text-[10px] font-sans text-slate-400">Time to Payoff</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {periodsDifference === 0
                    ? 'Same'
                    : `${Math.abs(periodsDifference)} payments ${periodsDifference > 0 ? 'earlier in B' : 'earlier in A'}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Comparative Balance Amortization Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Comparative Balance Payoff Trajectory</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizing how each loan balance diminishes to zero over time.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              <span className="text-blue-700 dark:text-blue-400 truncate max-w-[150px]">
                {loanA.title || 'Calculation A'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">
                {loanB.title || 'Calculation B'}
              </span>
            </div>
          </div>
        </div>

        {/* SVG Comparative Chart */}
        <div className="relative mt-4 w-full">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none"
            onMouseLeave={() => setHoverPeriodIndex(null)}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + innerHeight * (1 - ratio);
              const val = maxPrincipal * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    className="dark:stroke-slate-800"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-mono tabular-nums"
                  >
                    {val >= 1000000
                      ? `${(val / 1000000).toFixed(1)}M`
                      : `${(val / 1000).toFixed(0)}k`}
                  </text>
                </g>
              );
            })}

            {/* Path A (Blue) */}
            <path
              d={linePathA}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path B (Emerald) */}
            <path
              d={linePathB}
              fill="none"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive hover columns */}
            {sampleIndices.map((idx, sampleIdx) => {
              const pA = pointsA[sampleIdx];
              return (
                <g key={idx}>
                  <rect
                    x={pA.x - innerWidth / (sampleIndices.length * 2)}
                    y={padding.top}
                    width={innerWidth / sampleIndices.length}
                    height={innerHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverPeriodIndex(sampleIdx)}
                  />
                  {hoverPeriodIndex === sampleIdx && (
                    <>
                      <line
                        x1={pA.x}
                        y1={padding.top}
                        x2={pA.x}
                        y2={padding.top + innerHeight}
                        stroke="#64748B"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={pA.x}
                        cy={pointsA[sampleIdx].y}
                        r="5"
                        fill="#2563EB"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <circle
                        cx={pA.x}
                        cy={pointsB[sampleIdx].y}
                        r="5"
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Inspection Ribbon */}
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Inspection at Payment #{activeHoverSample + 1}:
            </span>
            <div className="flex items-center gap-4 font-mono font-semibold">
              <span className="text-blue-600 dark:text-blue-400">
                Loan A Balance:{' '}
                {hoverRowA
                  ? formatCurrency(hoverRowA.remainingBalance, loanA.currencyCode)
                  : 'Paid off (0.00)'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Loan B Balance:{' '}
                {hoverRowB
                  ? formatCurrency(hoverRowB.remainingBalance, loanB.currencyCode)
                  : 'Paid off (0.00)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Detailed Parameter & Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan A Card */}
        <div className="rounded-2xl border-2 border-blue-500/80 bg-white p-5 sm:p-7 shadow-sm dark:border-blue-600 dark:bg-slate-900 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                A
              </span>
              <input
                type="text"
                value={loanA.title}
                onChange={(e) => setLoanA({ ...loanA, title: e.target.value })}
                className="text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => onApplyToMainCalculator(loanA)}
              className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
            >
              Load as Main Loan
            </button>
          </div>

          {/* Quick Select from Saved Loans */}
          {savedLoans.length > 0 && (
            <div className="mt-3">
              <label className="text-[11px] font-medium text-slate-400">
                Pick from Saved Loans:
              </label>
              <select
                onChange={(e) => {
                  const found = savedLoans.find((l) => l.id === e.target.value);
                  if (found) setLoanA(found.input);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Select a saved calculation...</option>
                {savedLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({formatCurrency(l.input.principal, l.input.currencyCode)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* KPI Output Highlights for Loan A */}
          <div className="mt-4 grid grid-cols-2 gap-3 font-mono">
            <div className="rounded-xl bg-blue-50/60 p-3 dark:bg-blue-950/30">
              <span className="block font-sans text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                Periodic Payment
              </span>
              <span className="text-lg font-extrabold text-blue-900 dark:text-blue-100">
                {formatCurrency(resultA.periodicPayment, loanA.currencyCode)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span className="block font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Total Interest Expense
              </span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                {formatCurrency(resultA.totalInterest, loanA.currencyCode)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span className="block font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Gross Repayment
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(resultA.totalCost, loanA.currencyCode)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span className="block font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Effective Rate (EIR)
              </span>
              <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                {resultA.effectiveInterestRate.toFixed(3)}%
              </span>
            </div>
          </div>

          {/* Parameter Inputs for Loan A */}
          <div className="mt-5 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Structure
              </label>
              <select
                value={loanA.structure}
                onChange={(e) =>
                  setLoanA({
                    ...loanA,
                    structure: e.target.value as any,
                    ratePeriod: e.target.value === 'fixed_addon' ? 'monthly' : 'annual',
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="fixed_addon">Fixed Rate (Add-on Flat, Cash2Go)</option>
                <option value="diminishing_balance">Diminishing Balance (Mortgage Standard)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Principal Amount
                </label>
                <input
                  type="number"
                  value={loanA.principal}
                  onChange={(e) =>
                    setLoanA({ ...loanA, principal: Math.max(0, Number(e.target.value)) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Interest Rate ({loanA.ratePeriod === 'monthly' ? 'Monthly %' : 'Annual %'})
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={loanA.interestRate}
                  onChange={(e) =>
                    setLoanA({ ...loanA, interestRate: Math.max(0, Number(e.target.value)) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Term ({loanA.termUnit})
                </label>
                <input
                  type="number"
                  value={loanA.termValue}
                  onChange={(e) =>
                    setLoanA({ ...loanA, termValue: Math.max(1, Number(e.target.value)) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Payment Interval
                </label>
                <select
                  value={loanA.paymentInterval}
                  onChange={(e) => setLoanA({ ...loanA, paymentInterval: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="monthly">Monthly (12x/yr)</option>
                  <option value="semi_monthly">Semi-Monthly (24x/yr)</option>
                  <option value="bi_weekly">Bi-Weekly (26x/yr)</option>
                  <option value="weekly">Weekly (52x/yr)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Extra Principal Payment / Period
              </label>
              <input
                type="number"
                value={loanA.extraPaymentPerPeriod}
                onChange={(e) =>
                  setLoanA({ ...loanA, extraPaymentPerPeriod: Math.max(0, Number(e.target.value)) })
                }
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Loan B Card */}
        <div className="rounded-2xl border-2 border-emerald-500/80 bg-white p-5 sm:p-7 shadow-sm dark:border-emerald-600 dark:bg-slate-900 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                B
              </span>
              <input
                type="text"
                value={loanB.title}
                onChange={(e) => setLoanB({ ...loanB, title: e.target.value })}
                className="text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 outline-none"
              />
            </div>
            <button
              onClick={() => onApplyToMainCalculator(loanB)}
              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              Load as Main Loan
            </button>
          </div>

          {/* Quick Select from Saved Loans */}
          {savedLoans.length > 0 && (
            <div className="mt-3">
              <label className="text-[11px] font-medium text-slate-400">
                Pick from Saved Loans:
              </label>
              <select
                onChange={(e) => {
                  const found = savedLoans.find((l) => l.id === e.target.value);
                  if (found) setLoanB(found.input);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Select a saved calculation...</option>
                {savedLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({formatCurrency(l.input.principal, l.input.currencyCode)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* KPI Output Highlights for Loan B */}
          <div className="mt-4 grid grid-cols-2 gap-3 font-mono">
            <div className="rounded-xl bg-emerald-50/60 p-3 dark:bg-emerald-950/30">
              <span className="block font-sans text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Periodic Payment
              </span>
              <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
                {formatCurrency(resultB.periodicPayment, loanB.currencyCode)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span className="block font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Total Interest Expense
              </span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                {formatCurrency(resultB.totalInterest, loanB.currencyCode)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span className="block font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Gross Repayment
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(resultB.totalCost, loanB.currencyCode)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span className="block font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Effective Rate (EIR)
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                {resultB.effectiveInterestRate.toFixed(3)}%
              </span>
            </div>
          </div>

          {/* Parameter Inputs for Loan B */}
          <div className="mt-5 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Structure
              </label>
              <select
                value={loanB.structure}
                onChange={(e) =>
                  setLoanB({
                    ...loanB,
                    structure: e.target.value as any,
                    ratePeriod: e.target.value === 'fixed_addon' ? 'monthly' : 'annual',
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="fixed_addon">Fixed Rate (Add-on Flat, Cash2Go)</option>
                <option value="diminishing_balance">Diminishing Balance (Mortgage Standard)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Principal Amount
                </label>
                <input
                  type="number"
                  value={loanB.principal}
                  onChange={(e) =>
                    setLoanB({ ...loanB, principal: Math.max(0, Number(e.target.value)) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Interest Rate ({loanB.ratePeriod === 'monthly' ? 'Monthly %' : 'Annual %'})
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={loanB.interestRate}
                  onChange={(e) =>
                    setLoanB({ ...loanB, interestRate: Math.max(0, Number(e.target.value)) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Term ({loanB.termUnit})
                </label>
                <input
                  type="number"
                  value={loanB.termValue}
                  onChange={(e) =>
                    setLoanB({ ...loanB, termValue: Math.max(1, Number(e.target.value)) })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Payment Interval
                </label>
                <select
                  value={loanB.paymentInterval}
                  onChange={(e) => setLoanB({ ...loanB, paymentInterval: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="monthly">Monthly (12x/yr)</option>
                  <option value="semi_monthly">Semi-Monthly (24x/yr)</option>
                  <option value="bi_weekly">Bi-Weekly (26x/yr)</option>
                  <option value="weekly">Weekly (52x/yr)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Extra Principal Payment / Period
              </label>
              <input
                type="number"
                value={loanB.extraPaymentPerPeriod}
                onChange={(e) =>
                  setLoanB({ ...loanB, extraPaymentPerPeriod: Math.max(0, Number(e.target.value)) })
                }
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono font-medium dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
