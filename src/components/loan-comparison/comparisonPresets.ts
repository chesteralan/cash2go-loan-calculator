import { LoanInput } from '../../types/loan';
import { CASH2GO_PRESET, STANDARD_MORTGAGE_PRESET } from '../../utils/loanCalculations';

export interface ComparisonPreset {
  key: string;
  label: string;
  build: (idSeed: string) => [LoanInput, LoanInput];
}

export function currencyCounterpart(selectedA: LoanInput): LoanInput {
  return {
    ...selectedA,
    id: `compare-b-${Date.now()}`,
    title:
      selectedA.structure === 'fixed_addon'
        ? 'Diminishing Balance Counterpart'
        : '15-Year Accelerated Loan',
    structure: 'diminishing_balance',
    interestRate: selectedA.structure === 'fixed_addon' ? 12.0 : 6.5,
    ratePeriod: 'annual',
    termValue:
      selectedA.structure === 'fixed_addon'
        ? selectedA.termValue
        : Math.max(12, Math.round(selectedA.termValue / 2)),
    termUnit: selectedA.termUnit,
  };
}

export const comparisonPresets: ComparisonPreset[] = [
  {
    key: 'cash2go_vs_diminishing',
    label: 'Cash2Go vs Diminishing',
    build: (idSeed) => [
      { ...CASH2GO_PRESET, title: 'Cash2Go 60m (1% Add-On)' },
      {
        ...CASH2GO_PRESET,
        id: `loan-b-${idSeed}`,
        title: 'Standard Bank Loan (12% APR Diminishing)',
        structure: 'diminishing_balance',
        ratePeriod: 'annual',
        interestRate: 12.0,
      },
    ],
  },
  {
    key: '15_vs_30_mortgage',
    label: '15-Yr vs 30-Yr',
    build: (idSeed) => [
      {
        ...STANDARD_MORTGAGE_PRESET,
        title: '30-Year Mortgage (6.75% APR)',
        termValue: 30,
        termUnit: 'years',
        extraPaymentPerPeriod: 0,
      },
      {
        ...STANDARD_MORTGAGE_PRESET,
        id: `loan-b-${idSeed}`,
        title: '15-Year Mortgage (6.25% APR)',
        termValue: 15,
        termUnit: 'years',
        interestRate: 6.25,
        extraPaymentPerPeriod: 0,
      },
    ],
  },
  {
    key: 'extra_payment_impact',
    label: 'Extra Payment Effect',
    build: () => [
      { ...STANDARD_MORTGAGE_PRESET, title: 'Without Extra Payments', extraPaymentPerPeriod: 0 },
      {
        ...STANDARD_MORTGAGE_PRESET,
        title: 'With +₱5,000/mo Extra Principal',
        extraPaymentPerPeriod: 5000,
      },
    ],
  },
  {
    key: 'monthly_vs_biweekly',
    label: 'Monthly vs Bi-Weekly',
    build: () => [
      { ...STANDARD_MORTGAGE_PRESET, title: 'Monthly Payments', paymentInterval: 'monthly' },
      {
        ...STANDARD_MORTGAGE_PRESET,
        title: 'Bi-Weekly Payments (26x/year)',
        paymentInterval: 'bi_weekly',
      },
    ],
  },
];
