import React, { useState } from 'react';
import { CalculationResult } from '../types/loan';
import { formatCurrency } from '../utils/currencies';
import { AreaChart, TrendingDown, BarChart3 } from 'lucide-react';
import { TogglePill } from './ui/TogglePill';
import { makeLayout, ChartGridLines } from './amortization/ChartGridLines';
import {
  BalanceAreaView,
  BreakdownBars,
  ChartLegend,
  XAxisLabels,
} from './amortization/AmortizationChartParts';

type ChartMode = 'balance' | 'breakdown';

export const AmortizationChart: React.FC<{ result: CalculationResult }> = ({ result }) => {
  const { schedule, input, totalPrincipal } = result;
  const [chartMode, setChartMode] = useState<ChartMode>('balance');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!schedule || schedule.length === 0) {
    return null;
  }

  // Downsample if more than 120 points for smooth rendering
  const totalPoints = schedule.length;
  const sampleRate = totalPoints > 180 ? Math.ceil(totalPoints / 120) : 1;
  const displayPoints = schedule.filter(
    (_, idx) => idx % sampleRate === 0 || idx === totalPoints - 1
  );

  const layout = makeLayout(800, 300, { top: 20, right: 30, bottom: 40, left: 70 });
  const maxBalance = totalPrincipal * 1.05;

  const balancePoints = displayPoints.map((row, idx) => {
    const x = layout.padding.left + (idx / (displayPoints.length - 1)) * layout.innerWidth;
    const y =
      layout.padding.top +
      layout.innerHeight -
      (row.remainingBalance / maxBalance) * layout.innerHeight;
    return { x, y, row };
  });

  const activePoint =
    hoverIndex !== null && hoverIndex >= 0 && hoverIndex < displayPoints.length
      ? displayPoints[hoverIndex]
      : displayPoints[Math.floor(displayPoints.length / 2)];

  const hoverState = { hoverIndex, setHoverIndex };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AreaChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Interactive Amortization Trajectory</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time projection of loan balance and principal vs. interest breakdown over term.
          </p>
        </div>
        <TogglePill
          value={chartMode}
          onChange={setChartMode}
          options={[
            {
              value: 'balance',
              label: (
                <>
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Balance Payoff</span>
                </>
              ),
            },
            {
              value: 'breakdown',
              label: (
                <>
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Payment Breakdown</span>
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <ChartGridLines layout={layout} maxValue={maxBalance} />
          {chartMode === 'balance' ? (
            <BalanceAreaView layout={layout} points={balancePoints} hover={hoverState} />
          ) : (
            <BreakdownBars layout={layout} rows={displayPoints} hover={hoverState} />
          )}
          <XAxisLabels layout={layout} rows={displayPoints} />
        </svg>

        <ChartLegend activePoint={activePoint} currencyCode={input.currencyCode} />
      </div>
    </div>
  );
};
