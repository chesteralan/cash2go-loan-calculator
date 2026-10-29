export type LoanStructure = 'diminishing_balance' | 'fixed_addon';

export type PaymentInterval =
  'monthly' | 'semi_monthly' | 'bi_weekly' | 'weekly' | 'quarterly' | 'annually';

export type TermUnit = 'months' | 'years';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // For currency conversion
}

export interface LoanInput {
  id: string;
  title: string;
  principal: number;
  interestRate: number; // Percentage, e.g., 6.5 for 6.5%
  ratePeriod: 'annual' | 'monthly'; // 'monthly' is typical for add-on rates (e.g., 1.00% monthly)
  structure: LoanStructure;
  termValue: number;
  termUnit: TermUnit;
  paymentInterval: PaymentInterval;
  startDate: string; // YYYY-MM-DD
  extraPaymentPerPeriod: number;
  oneTimeFee: number;
  currencyCode: string;
}

export interface AmortizationRow {
  period: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface AnnualMatrixRow {
  yearIndex: number;
  calendarYear: number;
  principalPaid: number;
  interestPaid: number;
  extraPaid: number;
  totalPaid: number;
  endingBalance: number;
}

export interface CalculationResult {
  input: LoanInput;
  periodicPayment: number;
  totalPaymentPeriods: number;
  totalPrincipal: number;
  totalInterest: number;
  totalCost: number; // principal + interest + fees
  totalFees: number;
  effectiveInterestRate: number; // EIR / APR (Annualized IRR)
  nominalAnnualRate: number;
  monthlyAddOnRate?: number;
  payoffDate: string;
  schedule: AmortizationRow[];
  annualMatrix: AnnualMatrixRow[];
  savedInterestWithExtra: number;
  periodsSavedWithExtra: number;
}

export interface SavedLoanRecord {
  id: string;
  title: string;
  timestamp: number;
  input: LoanInput;
}
