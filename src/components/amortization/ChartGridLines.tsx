import React from 'react';

export interface SvgLayout {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
}

export function makeLayout(
  width: number,
  height: number,
  padding: SvgLayout['padding']
): SvgLayout {
  return {
    width,
    height,
    padding,
    innerWidth: width - padding.left - padding.right,
    innerHeight: height - padding.top - padding.bottom,
  };
}

export const ChartGridLines: React.FC<{
  layout: SvgLayout;
  maxValue: number;
}> = ({ layout, maxValue }) => (
  <>
    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const y = layout.padding.top + layout.innerHeight * (1 - ratio);
      const val = maxValue * ratio;
      return (
        <g key={ratio}>
          <line
            x1={layout.padding.left}
            y1={y}
            x2={layout.width - layout.padding.right}
            y2={y}
            stroke="#E2E8F0"
            strokeDasharray="4 4"
            className="dark:stroke-slate-800"
          />
          <text
            x={layout.padding.left - 10}
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
  </>
);
