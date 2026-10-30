import React from 'react';
import { Calculator, Moon, Sun, Globe, BookmarkCheck, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWA';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  selectedCurrency: string;
  onOpenCurrencyConverter: () => void;
  onOpenSavedLoans: () => void;
  savedLoansCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  selectedCurrency,
  onOpenCurrencyConverter,
  onOpenSavedLoans,
  savedLoansCount,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Wordmark brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            LoanMatrix
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
              activeTab === 'calculator'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Amortization Schedule
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
              activeTab === 'benchmark'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fixed Add-On Benchmark
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 ${
              activeTab === 'comparison'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Compare Calculations
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Currency Trigger */}
          <button
            onClick={onOpenCurrencyConverter}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            title="Convert Currency"
            aria-label={`Current currency: ${selectedCurrency}. Click to convert.`}
          >
            <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span className="font-mono">{selectedCurrency}</span>
          </button>

          {/* Saved Loans */}
          <button
            onClick={onOpenSavedLoans}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            title="Saved Loan Calculations"
            aria-label={`Saved loan calculations: ${savedLoansCount}`}
          >
            <BookmarkCheck
              className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Saved</span>
            {savedLoansCount > 0 && (
              <span className="ml-0.5 rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {savedLoansCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
            )}
          </button>

          {/* In-app PWA install button if installable */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="hidden md:flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Install PWA</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
