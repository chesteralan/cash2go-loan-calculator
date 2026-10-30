import React from 'react';
import { TriangleAlert } from 'lucide-react';

interface CalcErrorBoundaryProps {
  /** Invoked by the inline "Reset Inputs" recovery action. */
  onReset: () => void;
  children: React.ReactNode;
}

/*
 * Class guard for the calculation workspace: a malformed input (e.g. pasted
 * garbage in a number field) degrades to an inline recovery panel instead of a
 * blank screen. Calculation is a pure `useMemo`, so resetting the active input
 * to the presets is always a valid recovery path.
 */
export class CalcErrorBoundary extends React.Component<
  CalcErrorBoundaryProps,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-950/30"
        >
          <TriangleAlert className="mx-auto h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
            This loan configuration can't be calculated
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Some parameter combination caused an unexpected error. Resetting the inputs back to the
            fixed add-on presets is the quickest way to recover.
          </p>
          <button
            onClick={this.props.onReset}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Reset Inputs
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
