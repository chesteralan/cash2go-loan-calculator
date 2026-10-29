import React, { useState, useEffect, useMemo } from 'react';
import { LoanInput, SavedLoanRecord } from './types/loan';
import { calculateLoan, CASH2GO_PRESET } from './utils/loanCalculations';
import {
  clearAllLoans,
  exportLoansJson,
  getActiveLoanFromStorage,
  getSavedLoans,
  getStoredDarkMode,
  importLoansJson,
  saveLoanToStorage,
  deleteSavedLoan,
  setActiveLoanToStorage,
  setStoredDarkMode,
} from './utils/storage';
import { Header } from './components/Header';
import { Cash2GoReferenceCard } from './components/Cash2GoReferenceCard';
import { LoanInputForm } from './components/LoanInputForm';
import { LoanSummaryCards } from './components/LoanSummaryCards';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationBreakdownDonut } from './components/AmortizationBreakdownDonut';
import { AmortizationMatrix } from './components/AmortizationMatrix';
import { CurrencyConverterModal } from './components/CurrencyConverterModal';
import { LoanComparisonModal } from './components/LoanComparisonModal';
import { LoanComparisonView } from './components/LoanComparisonView';
import { SavedLoansDrawer } from './components/SavedLoansDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ArrowUpDown, HelpCircle, Shield, FileCheck, Layers, ArrowRightLeft } from 'lucide-react';

export default function App() {
  const [activeInput, setActiveInput] = useState<LoanInput>(getActiveLoanFromStorage);
  const [savedLoans, setSavedLoans] = useState<SavedLoanRecord[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(getStoredDarkMode);
  const [activeTab, setActiveTab] = useState<string>('calculator');

  // Modals state
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [savedLoansDrawerOpen, setSavedLoansDrawerOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize theme & storage
  useEffect(() => {
    setStoredDarkMode(darkMode);
  }, [darkMode]);

  useEffect(() => {
    setSavedLoans(getSavedLoans());
  }, []);

  // Save active loan changes to storage
  useEffect(() => {
    setActiveLoanToStorage(activeInput);
  }, [activeInput]);

  // Real-time Amortization Calculation
  const calculationResult = useMemo(() => {
    return calculateLoan(activeInput);
  }, [activeInput]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveCurrentLoan = () => {
    const updated = saveLoanToStorage(activeInput);
    setSavedLoans(updated);
    showNotification(`Saved "${activeInput.title || 'Loan'}" to your calculations.`);
  };

  const handleDeleteSavedLoan = (id: string) => {
    const updated = deleteSavedLoan(id);
    setSavedLoans(updated);
  };

  const handleClearAllLoans = () => {
    const updated = clearAllLoans();
    setSavedLoans(updated);
    showNotification('All saved loan calculations removed.');
  };

  const handleExportLoans = () => {
    exportLoansJson();
    showNotification('Backup file downloaded.');
  };

  const handleImportLoans = (file: File) => {
    file
      .text()
      .then((text) => {
        const res = importLoansJson(text);
        if (res.success) {
          setSavedLoans(getSavedLoans());
          showNotification(`Imported ${res.count} calculation(s).`);
        } else {
          showNotification(res.error || 'Import failed.');
        }
      })
      .catch(() => showNotification('Could not read the selected file.'));
  };

  const handleSelectSavedLoan = (loan: LoanInput) => {
    setActiveInput(loan);
    showNotification(`Loaded "${loan.title}".`);
  };

  const handleApplyPreset = (preset: LoanInput) => {
    setActiveInput(preset);
    showNotification(`Loaded "${preset.title}".`);
  };

  const isCash2GoActive =
    activeInput.structure === 'fixed_addon' &&
    activeInput.principal === 300000 &&
    activeInput.termValue === 60 &&
    activeInput.termUnit === 'months' &&
    activeInput.interestRate === 1.0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'matrix') {
            const el = document.getElementById('amortization-schedule-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'benchmark') {
            const el = document.getElementById('cash2go-benchmark-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        selectedCurrency={activeInput.currencyCode}
        onOpenCurrencyConverter={() => setCurrencyModalOpen(true)}
        onOpenSavedLoans={() => setSavedLoansDrawerOpen(true)}
        savedLoansCount={savedLoans.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Banner notification toast */}
        {notification && (
          <div className="fixed top-16 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl dark:bg-blue-600 transition-all animate-bounce">
            {notification}
          </div>
        )}

        {/* Navigation Mode Banner */}
        <div className="flex items-center justify-between rounded-xl bg-white p-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'calculator' || activeTab === 'matrix' || activeTab === 'benchmark'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Single Loan Calculator
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'comparison'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Side-by-Side Comparison</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>
              Currency: <strong>{activeInput.currencyCode}</strong>
            </span>
            <span>·</span>
            <span>
              Structure:{' '}
              <strong>
                {activeInput.structure === 'fixed_addon' ? 'Fixed Add-On' : 'Diminishing'}
              </strong>
            </span>
          </div>
        </div>

        {activeTab === 'comparison' ? (
          /* COMPARISON WORKSPACE VIEW */
          <section id="comparison-view-section">
            <LoanComparisonView
              initialLoanA={activeInput}
              savedLoans={savedLoans}
              onApplyToMainCalculator={(loan) => {
                setActiveInput(loan);
                setActiveTab('calculator');
                showNotification(`Applied "${loan.title}" as main calculation.`);
              }}
            />
          </section>
        ) : (
          /* SINGLE LOAN CALCULATOR VIEW */
          <>
            {/* Section 1: Cash2Go Benchmark Card (Reference to user's uploaded sample) */}
            <section id="cash2go-benchmark-section" aria-labelledby="benchmark-heading">
              <Cash2GoReferenceCard onApplyPreset={handleApplyPreset} isActive={isCash2GoActive} />
            </section>

            {/* Quick Compare Callout Strip */}
            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs">
              <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
                <ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  <strong>Want to compare this calculation?</strong> Evaluate against a second loan
                  scenario (e.g. 15-yr vs 30-yr, or Add-On vs Diminishing balance).
                </span>
              </div>
              <button
                onClick={() => setActiveTab('comparison')}
                className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
              >
                Compare Now
              </button>
            </div>

            {/* Section 2: Core Calculator Workspace (Split Grid) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (5 cols): Parameter Controls */}
              <div className="lg:col-span-5 space-y-6">
                <LoanInputForm
                  input={activeInput}
                  onChange={setActiveInput}
                  onSaveLoan={handleSaveCurrentLoan}
                  onReset={() => setActiveInput(CASH2GO_PRESET)}
                />
              </div>

              {/* Right Column (7 cols): KPI Summaries & Real-Time Amortization Charts */}
              <div className="lg:col-span-7 space-y-6">
                {/* KPI Metrics */}
                <LoanSummaryCards result={calculationResult} />

                {/* Visual Charts Split */}
                <div className="grid grid-cols-1 gap-6">
                  <AmortizationChart result={calculationResult} />
                  <AmortizationBreakdownDonut result={calculationResult} />
                </div>
              </div>
            </section>

            {/* Section 3: Comprehensive Amortization Schedule & Annual Matrix */}
            <section id="amortization-schedule-section" className="pt-2">
              <AmortizationMatrix result={calculationResult} />
            </section>
          </>
        )}

        {/* Section 4: Financial Education & Disclosures */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Calculation Methodology & Legal Disclosures</span>
          </h4>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Effective Interest Rate (EIR / APR)
              </span>
              <p className="mt-1">
                Calculated strictly in accordance with central bank Truth in Lending Act standards
                using the Newton-Raphson Internal Rate of Return (IRR) on all periodic cash flows.
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Rounding & Billing Variations
              </span>
              <p className="mt-1">
                *Monthly amortization amount may not be exactly equal to the actual billing amount
                due to cents rounding or specific bank day-count conventions (30/360 vs Actual/365).
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Offline PWA & Privacy First
              </span>
              <p className="mt-1">
                All financial calculations are processed client-side. No loan data, credit amounts,
                or personal numbers are ever transmitted to a third-party server.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>LoanMatrix</span>
            <span>·</span>
            <span>Professional Multi-Currency Amortization Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>ISO 4217 Currency Standards</span>
            <span>·</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>·</span>
            <span>Offline PWA Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <CurrencyConverterModal
        isOpen={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
        result={calculationResult}
        onSelectCurrency={(code) => {
          setActiveInput((prev) => ({ ...prev, currencyCode: code }));
          showNotification(`Active currency updated to ${code}.`);
        }}
      />

      <LoanComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        activeInput={activeInput}
        onApplyStructure={(struct) => {
          setActiveInput((prev) => ({
            ...prev,
            structure: struct,
            ratePeriod: struct === 'fixed_addon' ? 'monthly' : 'annual',
          }));
          showNotification(
            `Switched structure to ${struct === 'fixed_addon' ? 'Fixed Add-On' : 'Diminishing Balance'}.`
          );
        }}
      />

      <SavedLoansDrawer
        isOpen={savedLoansDrawerOpen}
        onClose={() => setSavedLoansDrawerOpen(false)}
        savedLoans={savedLoans}
        onSelectLoan={handleSelectSavedLoan}
        onDeleteLoan={handleDeleteSavedLoan}
        onClearAllLoans={handleClearAllLoans}
        onExportLoans={handleExportLoans}
        onImportLoans={handleImportLoans}
        activeLoanId={activeInput.id}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
