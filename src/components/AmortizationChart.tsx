import React, { useState } from 'react';
import { CalculationResult } from '../types/loan';
import { formatCurrency } from '../utils/currencies';
import { AreaChart, BarChart3, TrendingDown } from 'lucide-react';

interface AmortizationChartProps {
  result: CalculationResult;
}

export const AmortizationChart: React.FC<AmortizationChartProps> = ({ result }) => {
  const { schedule, input, totalPrincipal, totalInterest } = result;
  const [chartMode, setChartMode] = useState<'balance' | 'breakdown'>('balance');
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

  // SVG dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 70 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Max balance for scale
  const maxBalance = totalPrincipal * 1.05;

  // Balance Area Coordinates
  const balancePoints = displayPoints.map((row, idx) => {
    const x = padding.left + (idx / (displayPoints.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (row.remainingBalance / maxBalance) * innerHeight;
    return { x, y, row };
  });

  const balanceAreaPath = `
    M ${balancePoints[0].x} ${padding.top + innerHeight}
    ${balancePoints.map((p) => `L ${p.x} ${p.y}`).join(' ')}
    L ${balancePoints[balancePoints.length - 1].x} ${padding.top + innerHeight}
    Z
  `;

  const balanceLinePath = `
    M ${balancePoints[0].x} ${balancePoints[0].y}
    ${balancePoints
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(' ')}
  `;

  // Active hover point
  const activePoint =
    hoverIndex !== null && hoverIndex >= 0 && hoverIndex < displayPoints.length
      ? displayPoints[hoverIndex]
      : displayPoints[Math.floor(displayPoints.length / 2)];

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

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setChartMode('balance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              chartMode === 'balance'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Balance Payoff</span>
          </button>
          <button
            onClick={() => setChartMode('breakdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              chartMode === 'breakdown'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Payment Breakdown</span>
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio);
            const val = maxBalance * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
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
                    : val >= 1000
                      ? `${(val / 1000).toFixed(0)}k`
                      : val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {chartMode === 'balance' ? (
            /* Balance Line & Area */
            <>
              <path d={balanceAreaPath} fill="url(#balanceGradient)" />
              <path
                d={balanceLinePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & hover triggers */}
              {balancePoints.map((p, idx) => (
                <g key={idx}>
                  <rect
                    x={p.x - innerWidth / (displayPoints.length * 2)}
                    y={padding.top}
                    width={innerWidth / displayPoints.length}
                    height={innerHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(idx)}
                  />
                  {hoverIndex === idx && (
                    <>
                      <line
                        x1={p.x}
                        y1={padding.top}
                        x2={p.x}
                        y2={padding.top + innerHeight}
                        stroke="#2563EB"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill="#2563EB"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </g>
              ))}
            </>
          ) : (
            /* Principal vs Interest Bars Breakdown */
            <>
              {displayPoints.map((row, idx) => {
                const totalBarHeight = innerHeight * 0.85;
                const totalPeriodPay = row.payment || 1;
                const principalRatio = row.principal / totalPeriodPay;
                const interestRatio = row.interest / totalPeriodPay;

                const barWidth = Math.max(3, (innerWidth / displayPoints.length) * 0.7);
                const x =
                  padding.left +
                  (idx / (displayPoints.length - 1 || 1)) * innerWidth -
                  barWidth / 2;

                const principalH = totalBarHeight * principalRatio;
                const interestH = totalBarHeight * interestRatio;

                const baseBottom = padding.top + innerHeight;
                const principalY = baseBottom - principalH;
                const interestY = principalY - interestH;

                return (
                  <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoverIndex(idx)}>
                    {/* Principal portion (Blue) */}
                    <rect
                      x={x}
                      y={principalY}
                      width={barWidth}
                      height={principalH}
                      fill="#3B82F6"
                      rx="1"
                    />
                    {/* Interest portion (Amber) */}
                    <rect
                      x={x}
                      y={interestY}
                      width={barWidth}
                      height={interestH}
                      fill="#F59E0B"
                      rx="1"
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* X Axis Timeline Labels */}
          {displayPoints.length > 0 && (
            <>
              <text
                x={padding.left}
                y={height - 12}
                textAnchor="start"
                className="fill-slate-500 text-[11px] font-medium"
              >
                Start ({displayPoints[0].date})
              </text>
              <text
                x={padding.left + innerWidth / 2}
                y={height - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-medium"
              >
                Halfway (Period {Math.round(displayPoints.length / 2)})
              </text>
              <text
                x={width - padding.right}
                y={height - 12}
                textAnchor="end"
                className="fill-slate-500 text-[11px] font-medium"
              >
                Payoff ({displayPoints[displayPoints.length - 1].date})
              </text>
            </>
          )}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300 px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-600" />
              <span>Principal Balance / Equity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              <span>Interest Paid</span>
            </div>
          </div>

          {/* Live hover inspection banner */}
          {activePoint && (
            <div className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              Period #{activePoint.period} ({activePoint.date}): Rem. Balance{' '}
              <span className="text-blue-600 dark:text-blue-400">
                {formatCurrency(activePoint.remainingBalance, input.currencyCode)}
              </span>
              {' · '}
              Prin: {formatCurrency(activePoint.principal, input.currencyCode)}
              {' · '}
              Int: {formatCurrency(activePoint.interest, input.currencyCode)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
