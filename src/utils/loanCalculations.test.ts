import { describe, expect, it } from 'vitest';
import {
  calculateLoan,
  calculatePeriodicIRR,
  CASH2GO_PRESET,
  getIntervalFrequency,
  getTotalPeriods,
  STANDARD_MORTGAGE_PRESET,
  US_MORTGAGE_PRESET,
} from './loanCalculations';
import { LoanInput } from '../types/loan';

const baseAddOn: LoanInput = {
  id: 'test-addon',
  title: 'Test Add-On Loan',
  principal: 300000,
  interestRate: 1.0,
  ratePeriod: 'monthly',
  structure: 'fixed_addon',
  termValue: 24,
  termUnit: 'months',
  paymentInterval: 'monthly',
  startDate: '2026-01-15',
  extraPaymentPerPeriod: 0,
  oneTimeFee: 0,
  currencyCode: 'PHP',
};

const baseDiminishing: LoanInput = {
  id: 'test-diminishing',
  title: 'Test Diminishing Loan',
  principal: 1000000,
  interestRate: 6.5,
  ratePeriod: 'annual',
  structure: 'diminishing_balance',
  termValue: 5,
  termUnit: 'years',
  paymentInterval: 'monthly',
  startDate: '2026-01-15',
  extraPaymentPerPeriod: 0,
  oneTimeFee: 0,
  currencyCode: 'PHP',
};

describe('getIntervalFrequency', () => {
  it.each([
    ['weekly', 52],
    ['bi_weekly', 26],
    ['semi_monthly', 24],
    ['monthly', 12],
    ['quarterly', 4],
    ['annually', 1],
  ] as const)('maps %s to %i', (interval, expected) => {
    expect(getIntervalFrequency(interval)).toBe(expected);
  });
});

describe('getTotalPeriods', () => {
  it('converts years to periods', () => {
    expect(getTotalPeriods(30, 'years', 'monthly')).toBe(360);
  });

  it('converts months to periods', () => {
    expect(getTotalPeriods(24, 'months', 'monthly')).toBe(24);
  });

  it('rounds partial periods', () => {
    expect(getTotalPeriods(18, 'months', 'quarterly')).toBe(6);
  });

  it('never returns less than 1', () => {
    expect(getTotalPeriods(0, 'months', 'monthly')).toBe(1);
  });
});

describe('calculatePeriodicIRR', () => {
  it('returns 0 for invalid inputs', () => {
    expect(calculatePeriodicIRR(0, 100, 12)).toBe(0);
    expect(calculatePeriodicIRR(1000, 0, 12)).toBe(0);
    expect(calculatePeriodicIRR(1000, 100, 0)).toBe(0);
  });

  it('returns 0 when total payments do not exceed principal', () => {
    expect(calculatePeriodicIRR(1000, 50, 10)).toBe(0);
  });

  it('converges: annuity of payments equals principal discounted at solved rate', () => {
    const principal = 300000;
    const payment = 13500;
    const periods = 24;
    const r = calculatePeriodicIRR(principal, payment, periods);
    expect(r).toBeGreaterThan(0);
    const pv = (payment * (1 - Math.pow(1 + r, -periods))) / r;
    expect(pv).toBeCloseTo(principal, 6);
  });
});

describe('calculateLoan — fixed add-on', () => {
  it('computes even add-on schedule', () => {
    const result = calculateLoan(baseAddOn);

    // 1% monthly add-on over 24 months
    const expectedInterest = 300000 * 0.01 * 24;
    expect(result.totalInterest).toBeCloseTo(expectedInterest, 6);
    expect(result.periodicPayment).toBeCloseTo((300000 + expectedInterest) / 24, 6);
    expect(result.monthlyAddOnRate).toBeCloseTo(1.0, 6);
    expect(result.totalPaymentPeriods).toBe(24);
  });

  it('EIR exceeds the nominal flat rate (front-loaded true cost)', () => {
    const result = calculateLoan(baseAddOn);
    expect(result.effectiveInterestRate).toBeGreaterThan(baseAddOn.interestRate * 12);
    expect(result.nominalAnnualRate).toBeGreaterThan(0);
  });

  it('schedule sums to principal and interest exactly', () => {
    const result = calculateLoan(baseAddOn);
    const sumPrincipal = result.schedule.reduce((s, r) => s + r.principal, 0);
    const sumInterest = result.schedule.reduce((s, r) => s + r.interest, 0);
    expect(sumPrincipal).toBeCloseTo(baseAddOn.principal, 4);
    expect(sumInterest).toBeCloseTo(result.totalInterest, 4);
    const last = result.schedule[result.schedule.length - 1];
    expect(last.remainingBalance).toBe(0);
  });

  it('balances decline by even principal amounts with no gaps', () => {
    const result = calculateLoan(baseAddOn);
    const step = baseAddOn.principal / result.totalPaymentPeriods;
    result.schedule.forEach((row, i) => {
      const expectedBalance = 300000 - step * (i + 1);
      expect(row.remainingBalance).toBeCloseTo(Math.max(0, expectedBalance), 6);
      expect(row.principal).toBeCloseTo(step, 9);
    });
  });

  it('annual rate input is divided by 12 for monthly add-on', () => {
    const result = calculateLoan({ ...baseAddOn, ratePeriod: 'annual', interestRate: 12 });
    expect(result.monthlyAddOnRate).toBeCloseTo(1.0, 6);
  });

  it('respects oneTimeFee in total cost', () => {
    const result = calculateLoan({ ...baseAddOn, oneTimeFee: 5000 });
    expect(result.totalFees).toBe(5000);
    expect(result.totalCost).toBe(baseAddOn.principal + result.totalInterest + 5000);
  });

  it('populates payoff date from last schedule row', () => {
    const result = calculateLoan(baseAddOn);
    expect(result.payoffDate).toBe(result.schedule[result.totalPaymentPeriods - 1].date);
  });
});

describe('calculateLoan — fixed add-on with extra payments', () => {
  it('settles early with rebated flat interest', () => {
    const withExtra = calculateLoan({ ...baseAddOn, extraPaymentPerPeriod: 5000 });
    const without = calculateLoan(baseAddOn);

    expect(withExtra.totalPaymentPeriods).toBeLessThan(without.totalPaymentPeriods);
    expect(withExtra.totalInterest).toBeLessThan(without.totalInterest);
    expect(withExtra.savedInterestWithExtra).toBeCloseTo(
      without.totalInterest - withExtra.totalInterest,
      4
    );
    expect(withExtra.periodsSavedWithExtra).toBe(
      without.totalPaymentPeriods - withExtra.totalPaymentPeriods
    );
  });

  it('rebated schedule: scheduled payment stays flat until settlement', () => {
    const result = calculateLoan({ ...baseAddOn, extraPaymentPerPeriod: 5000 });
    const settled = result.schedule.slice(0, -1);
    expect(settled.every((row) => row.payment === result.periodicPayment)).toBe(true);
    expect(result.periodicPayment).toBeCloseTo((300000 + 72000) / 24, 6);
  });

  it('total principal still equals loan amount after extras', () => {
    const result = calculateLoan({ ...baseAddOn, extraPaymentPerPeriod: 8000 });
    const sumPrincipal = result.schedule.reduce((s, r) => s + r.principal + r.extraPayment, 0);
    expect(sumPrincipal).toBeCloseTo(baseAddOn.principal, 4);
    const last = result.schedule[result.schedule.length - 1];
    expect(last.remainingBalance).toBe(0);
  });

  it('charged interest never exceeds full flat interest', () => {
    const result = calculateLoan({ ...baseAddOn, extraPaymentPerPeriod: 3000 });
    expect(result.totalInterest).toBeLessThanOrEqual(300000 * 0.01 * 24 + 0.01);
  });
});

describe('schedule rounding', () => {
  it('all money values are rounded to 2 decimal places', () => {
    [baseAddOn, baseDiminishing, { ...baseDiminishing, extraPaymentPerPeriod: 1500 }].forEach(
      (input) => {
        const result = calculateLoan(input);
        result.schedule.forEach((row) => {
          [row.principal, row.interest, row.extraPayment, row.totalPayment].forEach((v) =>
            expect(Math.abs(v * 100 - Math.round(v * 100))).toBeLessThan(1e-6)
          );
        });
      }
    );
  });
});

describe('calculateLoan — diminishing balance', () => {
  it('computes standard annuity payment', () => {
    const result = calculateLoan(baseDiminishing);
    const r = 0.065 / 12;
    const n = 60;
    const expected =
      (baseDiminishing.principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    expect(result.periodicPayment).toBeCloseTo(expected, 6);
  });

  it('zero-rate loan has linear schedule', () => {
    const result = calculateLoan({ ...baseDiminishing, interestRate: 0 });
    expect(result.periodicPayment).toBeCloseTo(baseDiminishing.principal / 60, 6);
    expect(result.totalInterest).toBeCloseTo(0, 8);
  });

  it('interest declines monotonically; principal rises monotonically', () => {
    const result = calculateLoan(baseDiminishing);
    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].interest).toBeLessThanOrEqual(result.schedule[i - 1].interest);
      expect(result.schedule[i].principal).toBeGreaterThanOrEqual(result.schedule[i - 1].principal);
    }
  });

  it('fully amortizes: cumulative principal equals loan, final balance is zero', () => {
    const result = calculateLoan(baseDiminishing);
    const last = result.schedule[result.schedule.length - 1];
    expect(last.remainingBalance).toBeLessThanOrEqual(0.001);
    expect(last.cumulativePrincipal).toBeCloseTo(baseDiminishing.principal, 4);
    expect(result.totalPaymentPeriods).toBe(60);
  });

  it('extra payments shorten the loan and save interest', () => {
    const withExtra = calculateLoan({ ...baseDiminishing, extraPaymentPerPeriod: 2000 });
    const without = calculateLoan(baseDiminishing);

    expect(withExtra.totalPaymentPeriods).toBeLessThan(without.totalPaymentPeriods);
    expect(withExtra.totalInterest).toBeLessThan(without.totalInterest);
    expect(withExtra.savedInterestWithExtra).toBeGreaterThan(0);
    expect(withExtra.periodsSavedWithExtra).toBeGreaterThan(0);
  });

  it('annual matrix groups periods into years correctly', () => {
    const result = calculateLoan(baseDiminishing);
    expect(result.annualMatrix.length).toBe(5);
    result.annualMatrix.forEach((row, i) => {
      expect(row.calendarYear).toBe(2026 + i);
    });
    const totalMatrixPrincipal = result.annualMatrix.reduce((s, r) => s + r.principalPaid, 0);
    expect(totalMatrixPrincipal).toBeCloseTo(baseDiminishing.principal, 4);
  });
});

describe('presets', () => {
  it('Cash2Go preset produces a valid amortization', () => {
    const result = calculateLoan(CASH2GO_PRESET);
    expect(result.totalPaymentPeriods).toBe(60);
    expect(result.totalInterest).toBeCloseTo(300000 * 0.01 * 60, 6); // 1% monthly add-on over 60 months
    const reciprocalsConsistent = result.schedule.every((row) => row.payment > 0);
    expect(reciprocalsConsistent).toBe(true);
  });

  it('standard mortgage amortizes fully', () => {
    const result = calculateLoan(STANDARD_MORTGAGE_PRESET);
    expect(result.schedule[result.schedule.length - 1].remainingBalance).toBeLessThanOrEqual(0.001);
  });

  it('US mortgage with extras pays off early', () => {
    const base = calculateLoan({ ...US_MORTGAGE_PRESET, extraPaymentPerPeriod: 0 });
    const withExtra = calculateLoan(US_MORTGAGE_PRESET);
    expect(withExtra.totalPaymentPeriods).toBeLessThan(base.totalPaymentPeriods);
  });
});
