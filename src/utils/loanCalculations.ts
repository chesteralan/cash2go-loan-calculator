import {
  AmortizationRow,
  AnnualMatrixRow,
  CalculationResult,
  LoanInput,
  PaymentInterval,
} from '../types/loan';

// fallow-ignore-next-line unused-export
export function getIntervalFrequency(interval: PaymentInterval): number {
  switch (interval) {
    case 'weekly':
      return 52;
    case 'bi_weekly':
      return 26;
    case 'semi_monthly':
      return 24;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'annually':
      return 1;
    default:
      return 12;
  }
}

// fallow-ignore-next-line unused-export
export function getTotalPeriods(
  termValue: number,
  termUnit: 'months' | 'years',
  interval: PaymentInterval
): number {
  const months = termUnit === 'years' ? termValue * 12 : termValue;
  const years = months / 12;
  const freq = getIntervalFrequency(interval);
  return Math.max(1, Math.round(years * freq));
}

/** Currency-grade rounding for display values (avoids float drift in schedules). */
function mathRound2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Solve for periodic IRR using Newton-Raphson
 * Cash flow: -Principal at t=0, +Payment at t=1..N
 */
export function calculatePeriodicIRR(
  principal: number,
  periodicPayment: number,
  periods: number
): number {
  if (principal <= 0 || periodicPayment <= 0 || periods <= 0) return 0;
  if (periodicPayment * periods <= principal) return 0; // Negative or 0 interest

  // Initial guess
  let r = (periodicPayment * periods - principal) / (principal * periods);
  if (r <= 0) r = 0.01;

  for (let i = 0; i < 50; i++) {
    // f(r) = Payment * [1 - (1+r)^(-N)] / r - Principal
    const factor = Math.pow(1 + r, -periods);
    const f = (periodicPayment * (1 - factor)) / r - principal;

    // Derivative f'(r)
    const df =
      (-periodicPayment * (1 - factor)) / (r * r) +
      (periodicPayment * periods * Math.pow(1 + r, -periods - 1)) / r;

    if (Math.abs(df) < 1e-12) break;

    const nextR = r - f / df;
    if (Math.abs(nextR - r) < 1e-8) {
      return Math.max(0, nextR);
    }
    r = nextR > 0 ? nextR : r / 2;
  }

  return Math.max(0, r);
}

/**
 * Standard date increment based on payment interval
 */
function addIntervalToDate(
  dateStr: string,
  periodIndex: number,
  interval: PaymentInterval
): string {
  const base = new Date(dateStr || Date.now());
  const date = new Date(base.getTime());

  if (interval === 'monthly') {
    date.setMonth(date.getMonth() + periodIndex);
  } else if (interval === 'semi_monthly') {
    const totalHalfMonths = periodIndex;
    const months = Math.floor(totalHalfMonths / 2);
    const half = totalHalfMonths % 2;
    date.setMonth(date.getMonth() + months);
    date.setDate(half === 0 ? 1 : 15);
  } else if (interval === 'bi_weekly') {
    date.setDate(date.getDate() + periodIndex * 14);
  } else if (interval === 'weekly') {
    date.setDate(date.getDate() + periodIndex * 7);
  } else if (interval === 'quarterly') {
    date.setMonth(date.getMonth() + periodIndex * 3);
  } else if (interval === 'annually') {
    date.setFullYear(date.getFullYear() + periodIndex);
  }

  return date.toISOString().split('T')[0];
}

export function calculateLoan(input: LoanInput): CalculationResult {
  const {
    principal,
    interestRate,
    ratePeriod,
    structure,
    termValue,
    termUnit,
    paymentInterval,
    startDate,
    extraPaymentPerPeriod = 0,
    oneTimeFee = 0,
  } = input;

  const totalMonths = termUnit === 'years' ? termValue * 12 : termValue;
  const frequency = getIntervalFrequency(paymentInterval);
  const scheduledPeriods = getTotalPeriods(termValue, termUnit, paymentInterval);

  let periodicPayment = 0;
  let totalInterest = 0;
  let totalPrincipal = principal;
  let effectiveInterestRate = 0;
  let nominalAnnualRate = 0;
  let monthlyAddOnRate = 0;
  let fullFlatInterest = 0;

  const schedule: AmortizationRow[] = [];

  if (structure === 'fixed_addon') {
    // Fixed Add-On Rate structure (e.g., Personal Installment Loans)
    // Rate is entered either as monthly add-on (e.g. 1.00%) or annual flat rate
    monthlyAddOnRate = ratePeriod === 'monthly' ? interestRate : interestRate / 12;
    const totalFlatInterestRate = (monthlyAddOnRate / 100) * totalMonths;
    totalInterest = principal * totalFlatInterestRate;
    fullFlatInterest = totalInterest;
    const grossTotal = principal + totalInterest;

    // In fixed add-on loans, total repayment is divided evenly over the periods
    periodicPayment = grossTotal / scheduledPeriods;

    // Periodic IRR to calculate true Effective Interest Rate (EIR / APR)
    // As per central bank rules: Annualized EIR = (1 + periodicIRR)^frequency - 1
    const periodicIRR = calculatePeriodicIRR(principal, periodicPayment, scheduledPeriods);
    effectiveInterestRate = (Math.pow(1 + periodicIRR, frequency) - 1) * 100;
    nominalAnnualRate = periodicIRR * frequency * 100;

    const principalPerPeriod = principal / scheduledPeriods;
    const interestPerPeriod = totalInterest / scheduledPeriods;

    let balance = principal;
    let cumPrincipal = 0;
    let cumInterest = 0;

    for (let p = 1; p <= scheduledPeriods; p++) {
      let pPrincipal = principalPerPeriod + extraPaymentPerPeriod;
      let periodInterest = interestPerPeriod;
      let boilsDownToSettlement = false;

      if (pPrincipal >= balance) {
        // Early settlement: pay the remaining principal now; flat interest for
        // every future period is rebated (fixed add-on-style), so only this period's
        // share of the flat interest is charged.
        pPrincipal = balance;
        boilsDownToSettlement = true;
      }

      balance = Math.max(0, balance - pPrincipal);
      const aboveSchedule = Math.max(0, pPrincipal - principalPerPeriod);
      const shownExtra = mathRound2(aboveSchedule);
      let shownPrincipal = mathRound2(pPrincipal - aboveSchedule);
      const shownInterest = mathRound2(periodInterest);
      if (boilsDownToSettlement) {
        // Final row absorbs the accumulated rounding residue so the
        // cumulative principal lands exactly on the loan amount.
        shownPrincipal = mathRound2(mathRound2(principal) - cumPrincipal - shownExtra);
      }
      cumPrincipal += shownPrincipal + shownExtra;
      cumInterest += shownInterest;

      schedule.push({
        period: p,
        date: addIntervalToDate(startDate, p, paymentInterval),
        payment: mathRound2(periodicPayment),
        principal: shownPrincipal,
        interest: shownInterest,
        extraPayment: shownExtra,
        totalPayment: mathRound2(pPrincipal + periodInterest),
        remainingBalance: mathRound2(Math.max(0, balance)),
        cumulativePrincipal: mathRound2(cumPrincipal),
        cumulativeInterest: mathRound2(cumInterest),
      });

      if (balance <= 0) break;
    }

    totalPrincipal = cumPrincipal;
    totalInterest = cumInterest;
  } else {
    // Diminishing Balance / Reducing Balance Loan Structure (Mortgage / Commercial)
    // Rate is always annual percentage rate (e.g. 6.5% per annum)
    const annualRate = ratePeriod === 'annual' ? interestRate : interestRate * 12;
    nominalAnnualRate = annualRate;
    const periodicRate = annualRate / 100 / frequency;

    if (periodicRate === 0) {
      periodicPayment = principal / scheduledPeriods;
    } else {
      periodicPayment =
        (principal * (periodicRate * Math.pow(1 + periodicRate, scheduledPeriods))) /
        (Math.pow(1 + periodicRate, scheduledPeriods) - 1);
    }

    effectiveInterestRate = (Math.pow(1 + periodicRate, frequency) - 1) * 100;

    let balance = principal;
    let cumPrincipal = 0;
    let cumInterest = 0;
    let p = 1;

    // Simulation loop with support for extra payments
    while (balance > 0.001 && p <= scheduledPeriods * 2) {
      const interestForPeriod = balance * periodicRate;
      let scheduledPrincipal = periodicPayment - interestForPeriod;
      let extra = extraPaymentPerPeriod;

      if (scheduledPrincipal + extra > balance) {
        // Last payment adjustment
        const needed = balance;
        if (scheduledPrincipal >= needed) {
          scheduledPrincipal = needed;
          extra = 0;
        } else {
          extra = needed - scheduledPrincipal;
        }
      }

      const totalPrincipalPaid = scheduledPrincipal + extra;
      balance = Math.max(0, balance - totalPrincipalPaid);
      const settledNow = balance <= 0.001;
      const shownExtra = mathRound2(extra);
      let shownPrincipal = mathRound2(scheduledPrincipal);
      const shownInterest = mathRound2(interestForPeriod);
      if (settledNow) {
        // Final row absorbs the accumulated rounding residue so the
        // cumulative principal lands exactly on the loan amount.
        shownPrincipal = mathRound2(principal) - cumPrincipal - shownExtra;
        shownPrincipal = mathRound2(shownPrincipal);
      }
      cumPrincipal += shownPrincipal + shownExtra;
      cumInterest += shownInterest;

      schedule.push({
        period: p,
        date: addIntervalToDate(startDate, p, paymentInterval),
        payment: mathRound2(scheduledPrincipal + interestForPeriod),
        principal: shownPrincipal,
        interest: shownInterest,
        extraPayment: shownExtra,
        totalPayment: mathRound2(scheduledPrincipal + interestForPeriod + extra),
        remainingBalance: mathRound2(Math.max(0, balance)),
        cumulativePrincipal: mathRound2(cumPrincipal),
        cumulativeInterest: mathRound2(cumInterest),
      });

      p++;
    }

    totalInterest = cumInterest;
    totalPrincipal = cumPrincipal;
  }

  // Calculate baseline interest without extra payments to determine savings
  let baselineTotalInterest = totalInterest;
  if (extraPaymentPerPeriod > 0 && structure === 'fixed_addon') {
    // Baseline = the full pre-rebate flat interest
    baselineTotalInterest = fullFlatInterest;
  } else if (extraPaymentPerPeriod > 0 && structure === 'diminishing_balance') {
    const annualRate = ratePeriod === 'annual' ? interestRate : interestRate * 12;
    const periodicRate = annualRate / 100 / frequency;
    let bBalance = principal;
    let bCumInterest = 0;
    for (let bp = 1; bp <= scheduledPeriods; bp++) {
      const bInt = bBalance * periodicRate;
      const bPrin = periodicPayment - bInt;
      bBalance = Math.max(0, bBalance - bPrin);
      bCumInterest += bInt;
    }
    baselineTotalInterest = bCumInterest;
  }

  const savedInterest = Math.max(0, baselineTotalInterest - totalInterest);
  const periodsSaved = Math.max(0, scheduledPeriods - schedule.length);

  // Group into annual matrix
  const annualMatrix: AnnualMatrixRow[] = [];
  const startYear = new Date(startDate || Date.now()).getFullYear();

  let currentYearIndex = 1;
  let yearPrincipal = 0;
  let yearInterest = 0;
  let yearExtra = 0;
  let yearTotal = 0;
  let lastEndingBalance = principal;

  schedule.forEach((row, index) => {
    yearPrincipal += row.principal;
    yearInterest += row.interest;
    yearExtra += row.extraPayment;
    yearTotal += row.totalPayment;
    lastEndingBalance = row.remainingBalance;

    const isYearEnd = (index + 1) % frequency === 0 || index === schedule.length - 1;
    if (isYearEnd) {
      annualMatrix.push({
        yearIndex: currentYearIndex,
        calendarYear: startYear + currentYearIndex - 1,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        extraPaid: yearExtra,
        totalPaid: yearTotal,
        endingBalance: lastEndingBalance,
      });

      currentYearIndex++;
      yearPrincipal = 0;
      yearInterest = 0;
      yearExtra = 0;
      yearTotal = 0;
    }
  });

  const lastRow = schedule[schedule.length - 1];

  return {
    input,
    periodicPayment,
    totalPaymentPeriods: schedule.length,
    totalPrincipal,
    totalInterest,
    totalFees: oneTimeFee,
    totalCost: totalPrincipal + totalInterest + oneTimeFee,
    effectiveInterestRate,
    nominalAnnualRate,
    monthlyAddOnRate: structure === 'fixed_addon' ? monthlyAddOnRate : undefined,
    payoffDate: lastRow ? lastRow.date : startDate,
    schedule,
    annualMatrix,
    savedInterestWithExtra: savedInterest,
    periodsSavedWithExtra: periodsSaved,
  };
}

export const FIXED_ADDON_PRESET: LoanInput = {
  id: 'fixed-addon-preset',
  title: 'Fixed Add-On Installment',
  principal: 300000,
  interestRate: 1.0,
  ratePeriod: 'monthly',
  structure: 'fixed_addon',
  termValue: 60,
  termUnit: 'months',
  paymentInterval: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  extraPaymentPerPeriod: 0,
  oneTimeFee: 0,
  currencyCode: 'PHP',
};

export const STANDARD_MORTGAGE_PRESET: LoanInput = {
  id: 'standard-mortgage-preset',
  title: '30-Year Home Mortgage',
  principal: 5000000,
  interestRate: 6.75,
  ratePeriod: 'annual',
  structure: 'diminishing_balance',
  termValue: 30,
  termUnit: 'years',
  paymentInterval: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  extraPaymentPerPeriod: 0,
  oneTimeFee: 15000,
  currencyCode: 'PHP',
};

export const US_MORTGAGE_PRESET: LoanInput = {
  id: 'us-mortgage-preset',
  title: 'US 30-Year Fixed Mortgage',
  principal: 400000,
  interestRate: 6.5,
  ratePeriod: 'annual',
  structure: 'diminishing_balance',
  termValue: 30,
  termUnit: 'years',
  paymentInterval: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  extraPaymentPerPeriod: 100,
  oneTimeFee: 2500,
  currencyCode: 'USD',
};
