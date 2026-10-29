import React from 'react';
import { AmortizationRow } from '../../types/loan';
import { formatCurrency } from '../../utils/currencies';
import { SvgLayout } from './ChartGridLines';

export interface HoverState {
  hoverIndex: number | null;
  setHoverIndex: (i: number | null) => void;
}

export const XAxisLabels: React.FC<{
  layout: SvgLayout;
  rows: AmortizationRow[];
}> = ({ layout, rows }) => {
  if (rows.length === 0) return null;
  const { height, padding, innerWidth, innerHeight } = layout;
  const labelY = height - 12;
  const labelClass = 'fill-slate-500 text-[11px] font-medium';
  return (
    <>
      <text x={padding.left} y={labelY} textAnchor="start" className={labelClass}>
        Start ({rows[0].date})
      </text>
      <text x={padding.left + innerWidth / 2} y={labelY} textAnchor="middle" className={labelClass}>
        Halfway (Period {Math.round(rows.length / 2)})
      </text>
      <text x={padding.left + innerWidth} y={labelY} textAnchor="end" className={labelClass}>
        Payoff ({rows[rows.length - 1].date})
      </text>
    </>
  );
};

export const BalanceAreaView: React.FC<{
  layout: SvgLayout;
  points: { x: number; y: number; row: AmortizationRow }[];
  hover: HoverState;
}> = ({ layout, points, hover }) => {
  const { padding, innerWidth, innerHeight } = layout;

  const balanceAreaPath = `
    M ${points[0].x} ${padding.top + innerHeight}
    ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')}
    L ${points[points.length - 1].x} ${padding.top + innerHeight}
    Z
  `;
  const balanceLinePath = `
    M ${points[0].x} ${points[0].y}
    ${points
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(' ')}
  `;

  return (
    <>
      <defs>
        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={balanceAreaPath} fill="url(#balanceGradient)" />
      <path
        d={balanceLinePath}
        fill="none"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, idx) => (
        <g key={idx}>
          <rect
            x={p.x - innerWidth / (points.length * 2)}
            y={padding.top}
            width={innerWidth / points.length}
            height={innerHeight}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => hover.setHoverIndex(idx)}
          />
          {hover.hoverIndex === idx && (
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
              <circle cx={p.x} cy={p.y} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
            </>
          )}
        </g>
      ))}
    </>
  );
};

export const BreakdownBars: React.FC<{
  layout: SvgLayout;
  rows: AmortizationRow[];
  hover: HoverState;
}> = ({ layout, rows, hover }) => {
  const { padding, innerWidth, innerHeight } = layout;
  return (
    <>
      {rows.map((row, idx) => {
        const totalBarHeight = innerHeight * 0.85;
        const totalPeriodPay = row.payment || 1;
        const principalRatio = row.principal / totalPeriodPay;
        const interestRatio = row.interest / totalPeriodPay;

        const barWidth = Math.max(3, (innerWidth / rows.length) * 0.7);
        const x = padding.left + (idx / (rows.length - 1 || 1)) * innerWidth - barWidth / 2;

        const principalH = totalBarHeight * principalRatio;
        const interestH = totalBarHeight * interestRatio;

        const baseBottom = padding.top + innerHeight;
        const principalY = baseBottom - principalH;
        const interestY = principalY - interestH;

        return (
          <g key={idx} className="cursor-pointer" onMouseEnter={() => hover.setHoverIndex(idx)}>
            <rect x={x} y={principalY} width={barWidth} height={principalH} fill="#3B82F6" rx="1" />
            <rect x={x} y={interestY} width={barWidth} height={interestH} fill="#F59E0B" rx="1" />
          </g>
        );
      })}
    </>
  );
};

export const ChartLegend: React.FC<{
  activePoint: AmortizationRow | null;
  currencyCode: string;
}> = ({ activePoint, currencyCode }) => (
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
    {activePoint && (
      <div className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        Period #{activePoint.period} ({activePoint.date}): Rem. Balance{' '}
        <span className="text-blue-600 dark:text-blue-400">
          {formatCurrency(activePoint.remainingBalance, currencyCode)}
        </span>
        {' · '}
        Prin: {formatCurrency(activePoint.principal, currencyCode)}
        {' · '}
        Int: {formatCurrency(activePoint.interest, currencyCode)}
      </div>
    )}
  </div>
);
