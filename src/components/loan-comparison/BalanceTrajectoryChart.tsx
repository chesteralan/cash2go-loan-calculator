import React, { useState } from 'react';
import { CalculationResult } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';
import { TrendingDown } from 'lucide-react';

export const BalanceTrajectoryChart: React.FC<{
  resultA: CalculationResult;
  resultB: CalculationResult;
}> = ({ resultA, resultB }) => {
  const [hoverPeriodIndex, setHoverPeriodIndex] = useState<number | null>(null);

  const maxScheduleLength = Math.max(resultA.schedule.length, resultB.schedule.length);
  const maxPrincipal = Math.max(resultA.totalPrincipal, resultB.totalPrincipal) * 1.05;

  const chartWidth = 800;
  const chartHeight = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 70 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const sampleSteps = maxScheduleLength > 120 ? Math.ceil(maxScheduleLength / 100) : 1;
  const sampleIndices: number[] = [];
  for (let i = 0; i < maxScheduleLength; i += sampleSteps) {
    sampleIndices.push(i);
  }
  if (!sampleIndices.includes(maxScheduleLength - 1)) {
    sampleIndices.push(maxScheduleLength - 1);
  }

  const buildPoints = (result: CalculationResult) =>
    sampleIndices.map((idx) => {
      const x = padding.left + (idx / (maxScheduleLength - 1 || 1)) * innerWidth;
      const row = result.schedule[idx];
      const balance = row ? (idx >= result.schedule.length ? 0 : row.remainingBalance) : 0;
      const y = padding.top + innerHeight - (balance / maxPrincipal) * innerHeight;
      return { x, y, balance };
    });

  const pointsA = buildPoints(resultA);
  const pointsB = buildPoints(resultB);

  const toPath = (points: { x: number; y: number }[]) =>
    `M ${points[0].x} ${points[0].y} ${points
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(' ')}`;
  const linePathA = toPath(pointsA);
  const linePathB = toPath(pointsB);

  const activeHoverSample =
    hoverPeriodIndex !== null && hoverPeriodIndex >= 0 && hoverPeriodIndex < sampleIndices.length
      ? sampleIndices[hoverPeriodIndex]
      : Math.floor(maxScheduleLength / 2);

  const hoverRowA = resultA.schedule[activeHoverSample];
  const hoverRowB = resultB.schedule[activeHoverSample];

  return (
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
            <span className="h-3 w-3 rounded-sm bg-blue-600" aria-hidden="true" />
            <span className="text-blue-700 dark:text-blue-400 truncate max-w-[150px]">
              {resultA.input.title || 'Calculation A'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-600" aria-hidden="true" />
            <span className="text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">
              {resultB.input.title || 'Calculation B'}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-4 w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label={`Comparative balance payoff: ${resultA.input.title || 'Loan A'} (blue) versus ${resultB.input.title || 'Loan B'} (green), both declining to zero within ${Math.max(resultA.schedule.length, resultB.schedule.length)} payments.`}
          onMouseLeave={() => setHoverPeriodIndex(null)}
        >
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

          <path
            d={linePathA}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={linePathB}
            fill="none"
            stroke="#10B981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

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

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Inspection at Payment #{activeHoverSample + 1}:
          </span>
          <div className="flex items-center gap-4 font-mono font-semibold">
            <span className="text-blue-600 dark:text-blue-400">
              Loan A Balance:{' '}
              {hoverRowA
                ? formatCurrency(hoverRowA.remainingBalance, resultA.input.currencyCode)
                : 'Paid off (0.00)'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Loan B Balance:{' '}
              {hoverRowB
                ? formatCurrency(hoverRowB.remainingBalance, resultB.input.currencyCode)
                : 'Paid off (0.00)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
