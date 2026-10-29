# Software Design Document — LoanMatrix

Advanced Amortization & Loan Calculator (PWA)

**Version:** 1.0
**Date:** 2026-10-29
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose

This document describes the software design of LoanMatrix, a client-side loan and mortgage amortization calculator. It covers the system architecture, calculation engine, data model, storage/sync strategy, PWA behavior, and UI composition.

### 1.2 Scope

LoanMatrix is a single-page web application (no backend at runtime) built with React 19 + TypeScript + Vite, targeting:

- **Fixed Add-On loans** (flat-rate installment loans, e.g., Metrobank Cash2Go personal loans) — rate entered as a monthly add-on rate.
- **Diminishing (Reducing) Balance loans** (mortgages, commercial loans) — rate entered as an annual APR.
- Six payment intervals (weekly → annually), extra-payment simulation, one-time fees, multi-currency support, PDF/Excel export, saved-loan management, offline PWA operation, and cross-device sync via encoded export bundles.

### 1.3 Definitions & Acronyms

| Term                   | Definition                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| EIR / APR              | Effective Interest Rate — annualized from the periodic IRR: `(1+irr)^frequency − 1`             |
| Nominal rate           | Periodic IRR × frequency (simple annualization)                                                 |
| Add-on rate            | Flat rate applied to full principal for the entire term; interest not amortized                 |
| Fixed add-on structure | `totalInterest = principal × monthlyAddOn × totalMonths`; repayment split evenly across periods |
| Diminishing balance    | Interest computed on the outstanding balance each period (standard amortization)                |
| Sync bundle            | Base64-encoded JSON payload containing all saved loans plus a device Sync ID                    |

### 1.4 References

- Metrobank Cash2Go installment loan mechanics (fixed add-on reference product)
- Central-bank disclosure rule: annualized EIR from periodic IRR
- Presets: `CASH2GO_PRESET` (₱300k, 1.00%/mo add-on, 60 mo), `STANDARD_MORTGAGE_PRESET` (₱5M, 6.75% p.a., 30 yr), `US_MORTGAGE_PRESET` ($400k USD, 30 yr)

---

## 2. System Overview

### 2.1 Architecture

Single-tier client application. All computation, persistence, and rendering happen in the browser.

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (SPA / PWA)                                         │
│                                                              │
│  App.tsx  ──── state: activeInput, savedLoans, darkMode,     │
│    │                 activeTab, modal flags, notification    │
│    │                                                          │
│    ├─► components/   Header, LoanInputForm, LoanSummaryCards,│
│    │                 AmortizationChart,                      │
│    │                 AmortizationBreakdownDonut,             │
│    │                 AmortizationMatrix, Cash2GoReferenceCard│
│    │                 modals: CurrencyConverter, CloudSync,   │
│    │                 LoanComparison, SavedLoansDrawer,       │
│    │                 OfflineIndicator                        │
│    │                                                          │
│    ├─► utils/loanCalculations.ts   ◄── pure calc engine      │
│    ├─► utils/storageAndSync.ts     ◄── localStorage + sync   │
│    ├─► utils/currencies.ts         ◄── FX table + formatting│
│    ├─► utils/exportUtils.ts        ◄── PDF (jsPDF) / Excel  │
│    └─► hooks/usePWA.ts             ◄── install prompt,      │
│                           offline detection                  │
│                                                              │
│  Persistence: localStorage (5 keys, see §5)                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer        | Choice                                     | Rationale                                             |
| ------------ | ------------------------------------------ | ----------------------------------------------------- |
| UI framework | React 19                                   | Concurrent rendering, hooks-only state                |
| Language     | TypeScript 7                               | Type-safe loan domain model                           |
| Build        | Vite 8 + @vitejs/plugin-react              | Fast SPA build, relative base path for static hosting |
| Styling      | Tailwind CSS 4 (`@tailwindcss/vite`)       | Utility-first, dark mode via class strategy           |
| Icons        | lucide-react                               | Consistent SVG iconography                            |
| Motion       | motion                                     | Micro-interactions                                    |
| Export       | jspdf + jspdf-autotable                    | Client-side PDF amortization schedules                |
| PWA          | manifest.json + usePWA hook                | Installable, offline-capable                          |
| Quality      | knip, fallow, husky, lint-staged, prettier | Dead-code detection, pre-commit hygiene               |

### 2.3 Design Principles

1. **Pure calculation core** — `loanCalculations.ts` has zero DOM/side-effect dependencies; input in, `CalculationResult` out.
2. **Derived state, not stored state** — the amortization schedule is recomputed via `useMemo` on every `activeInput` change; nothing about results is persisted.
3. **localStorage as the only store** — no backend, no network dependency at runtime; sync is achieved through exportable bundles.
4. **Graceful degradation** — storage reads wrapped in try/catch; presets used as fallbacks.

---

## 3. Functional Requirements (implemented)

| ID    | Feature                                                                                                                                            | Module(s)                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| FR-01 | Loan input form: principal, rate, rate period, structure, term (months/years), payment interval, start date, extra payment, one-time fee, currency | `LoanInputForm`                                                |
| FR-02 | Two loan structures: fixed add-on and diminishing balance                                                                                          | `loanCalculations.calculateLoan`                               |
| FR-03 | Six payment intervals with correct period counts and date stepping                                                                                 | `getIntervalFrequency`, `getTotalPeriods`, `addIntervalToDate` |
| FR-04 | Effective interest rate (annualized IRR) disclosure for fixed add-on loans                                                                         | `calculatePeriodicIRR` (Newton–Raphson)                        |
| FR-05 | Extra per-period payment simulation with interest-savings and periods-saved report                                                                 | diminishing-balance loop + baseline comparison                 |
| FR-06 | Period-by-period amortization schedule table + annual matrix grouping                                                                              | `AmortizationMatrix`, `annualMatrix`                           |
| FR-07 | Charts: balance-over-time chart + principal/interest donut                                                                                         | `AmortizationChart`, `AmortizationBreakdownDonut`              |
| FR-08 | Summary cards: periodic payment, total interest, total cost, payoff date, savings                                                                  | `LoanSummaryCards`                                             |
| FR-09 | Saved loans: create/update/delete/load, seeded with two presets                                                                                    | `storageAndSync`                                               |
| FR-10 | Loan comparison view/modal across saved loans                                                                                                      | `LoanComparisonModal`, `LoanComparisonView`                    |
| FR-11 | Multi-currency: 12-currency table, formatting, cross-currency conversion                                                                           | `currencies.ts`, `CurrencyConverterModal`                      |
| FR-12 | PDF/Excel export                                                                                                                                   | `exportUtils.ts`                                               |
| FR-13 | Cross-device sync via Sync ID + base64 bundle export/restore                                                                                       | `CloudSyncModal`, `generateSyncBundle` / `restoreSyncBundle`   |
| FR-14 | Offline PWA: manifest, install prompt, offline indicator                                                                                           | `manifest.json`, `usePWA`, `OfflineIndicator`                  |
| FR-15 | Dark mode toggle, persisted                                                                                                                        | `Header`, `DARK_MODE_KEY`                                      |
| FR-16 | Cash2Go benchmark reference card with auto-detection of the preset configuration                                                                   | `Cash2GoReferenceCard`, `isCash2GoActive`                      |

---

## 4. Calculation Engine Design

### 4.1 Module: `src/utils/loanCalculations.ts`

Public API:

- `calculateLoan(input: LoanInput): CalculationResult` — main entry
- `calculatePeriodicIRR(principal, periodicPayment, periods): number` — Newton–Raphson root of `Payment·(1−(1+r)^−N)/r − Principal = 0`, 50 iterations, convergence at `1e-8`, clamped ≥ 0
- `getIntervalFrequency(interval)` / `getTotalPeriods(termValue, termUnit, interval)`

### 4.2 Fixed Add-On Path

```
monthlyAddOn    = ratePeriod === 'monthly' ? rate : rate / 12
totalInterest   = principal × (monthly/100) × totalMonths
grossTotal      = principal + totalInterest
periodicPayment = grossTotal / scheduledPeriods          // even split
EIR             = ((1 + periodicIRR)^frequency − 1) × 100
nominal         = periodicIRR × frequency × 100
```

Note: in the true add-on model interest is **not** balance-accruing; the schedule attributes a constant `principalPerPeriod = principal / N` and `interestPerPeriod = totalInterest / N` per row. This intentionally produces a straight-line amortization schedule; the EIR/IRR pair is the disclosure-worthy figure.

### 4.3 Diminishing Balance Path

```
periodicRate    = (annualRate/100) / frequency
periodicPayment = standard annuity formula (0% guard: principal / N)
```

Simulation loop (`while balance > 0.001 && p ≤ 2×scheduledPeriods`):

- `interest = balance × periodicRate`
- `scheduledPrincipal = payment − interest`
- extra payment applied per period, with last-payment clamping (extra trimmed when it would overpay)
- rows carry `payment` (scheduled), `extraPayment`, `totalPayment` (scheduled + interest + extra)

Baseline run (no extras) is simulated to compute `savedInterestWithExtra` and `periodsSavedWithExtra`.

### 4.4 Annual Matrix

Rows are bucketed by payment count: `frequency` rows per bucket (handles the final partial bucket at `index === schedule.length - 1`). `calendarYear` derives from the start date's year + bucket index.

### 4.5 Result Contract (`CalculationResult`)

`input, periodicPayment, totalPaymentPeriods, totalPrincipal, totalInterest, totalFees, totalCost, effectiveInterestRate, nominalAnnualRate, monthlyAddOnRate?, payoffDate, schedule[], annualMatrix[], savedInterestWithExtra, periodsSavedWithExtra`

### 4.6 Date Stepping

`addIntervalToDate` steps per interval: monthly/quarterly/annually by calendar increments; semi-monthly by half-month grid (day 1 / 15); bi-weekly +14d; weekly +7d. Output format `YYYY-MM-DD` (ISO date part).

---

## 5. Data Model & Persistence (`src/types/loan.ts`, `src/utils/storageAndSync.ts`)

### 5.1 Core Types

- `LoanStructure`: `'diminishing_balance' | 'fixed_addon'`
- `PaymentInterval`: `'monthly' | 'semi_monthly' | 'bi_weekly' | 'weekly' | 'quarterly' | 'annually'`
- `LoanInput`: id, title, principal, interestRate (%), ratePeriod (`'annual' | 'monthly'`), structure, termValue/termUnit, paymentInterval, startDate (`YYYY-MM-DD`), extraPaymentPerPeriod, oneTimeFee, currencyCode
- `AmortizationRow` (period, date, payment, principal, interest, extraPayment, totalPayment, remainingBalance, cumulative*)
- `AnnualMatrixRow` (yearIndex, calendarYear, principalPaid, interestPaid, extraPaid, totalPaid, endingBalance)
- `SavedLoanRecord` (id, title, timestamp, input)
- `CurrencyConfig` (code, symbol, name, rateAgainstUSD)

### 5.2 localStorage Keys

| Key                         | Type                | Contents                                                                      |
| --------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| `loanmatrix_saved_loans_v1` | `SavedLoanRecord[]` | All saved loans, seeded with Cash2Go + standard mortgage presets on first run |
| `loanmatrix_active_loan_v1` | `LoanInput`         | Currently loaded loan                                                         |
| `loanmatrix_sync_id_v1`     | `string`            | Device Sync ID `LM-XXXXXX-…` (random + epoch36)                               |
| `loanmatrix_theme_dark`     | `boolean`           | Dark-mode preference                                                          |

### 5.3 Save/Upsert Semantics

`saveLoanToStorage` upserts by `input.id`; missing IDs are minted as `loan-<epoch>`.

### 5.4 Sync Design (offline-first)

Sync is **transport-less and user-mediated**: `SyncPayload { version: 1, syncId, timestamp, loans[] }` is JSON → UTF-8 → base64 (`generateSyncBundle`). A user copies the bundle on device A and pastes it into device B, where `restoreSyncBundle` decodes and merges/overwrites `SAVED_LOANS_KEY`. The `'version'` field supports future schema migrations. The Sync ID identifies the originating device inside the bundle. Because payloads are plain base64 (not encrypted), they carry no confidential data beyond loan figures the user typed themselves — acceptable for a client-only tool; if cloud transport is added later, encryption at rest becomes a requirement.

---

## 6. Application Layer

### 6.1 `src/App.tsx` — root container / state owner

State:

- `activeInput: LoanInput` (hydrated from storage; persisted on change)
- `savedLoans: SavedLoanRecord[]` (hydrated on mount)
- `darkMode: boolean` (persisted)
- `activeTab: 'calculator' | 'matrix' | 'benchmark' | …` (matrix/benchmark act as smooth-scroll anchors)
- Modal open flags: currency converter, cloud sync, loan comparison, saved-loans drawer
- Transient notification toast (3 s auto-dismiss)

Derived: `calculationResult = useMemo(() => calculateLoan(activeInput), [activeInput])` — the single source of truth for all downstream UI.

Handler contract: save/delete/select saved loans, apply presets, open modals.

Cash2Go detection (`isCash2GoActive`) is a value-equality check on structure/principal/term/rate, used to highlight the benchmark card.

### 6.2 Component Inventory

| Component                                    | Responsibility                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `Header`                                     | App title, tab navigation, theme toggle, currency badge, modal triggers, saved-loan count |
| `LoanInputForm`                              | All FR-01 fields; emits full `LoanInput` updates                                          |
| `LoanSummaryCards`                           | Periodic payment, total interest, total cost, payoff date, savings stats                  |
| `AmortizationChart`                          | Balance-over-time line chart                                                              |
| `AmortizationBreakdownDonut`                 | Principal-vs-interest-vs-fees donut                                                       |
| `AmortizationMatrix`                         | Annual (year-grouped) schedule table                                                      |
| `Cash2GoReferenceCard`                       | Benchmark comparison against the Cash2Go reference deal                                   |
| `CurrencyConverterModal`                     | Cross-currency conversion panel                                                           |
| `CloudSyncModal`                             | Sync ID display, bundle export/import                                                     |
| `LoanComparisonModal` / `LoanComparisonView` | Side-by-side saved-loan comparison                                                        |
| `SavedLoansDrawer`                           | List, load, delete saved loans                                                            |
| `OfflineIndicator`                           | Online/offline status pill                                                                |

### 6.3 Hooks — `src/hooks/usePWA.ts`

Wraps `beforeinstallprompt` capture, manual install trigger, and online/offline listeners consumed by `OfflineIndicator`.

---

## 7. Cross-Cutting Concerns

### 7.1 Error Handling & Resilience

- Every localStorage read/write is wrapped in `try/catch`; parse failures fall back to `[]` or preset defaults.
- IRR solver degenerates to 0 when `payment × periods ≤ principal` (loan is interest-free under add-on math) or non-convergent cases.
- Simulation loop has a hard `2 × scheduledPeriods` guard against non-termination.

### 7.2 Performance

- Single `useMemo` on the whole calculation prevents recomputation on unrelated renders.
- Schedule length is bounded by term (≤ 2× periods guard); annual grouping keeps tables small.
- All dependencies are bundled; Google Fonts links use `preconnect` + `display=swap`.

### 7.3 Accessibility & Responsiveness

Responsive layout (`sm:` breakpoints, max-width 7xl container), semantic HTML structure, dark mode via Tailwind class strategy with smooth color transitions.

### 7.4 Privacy

No telemetry, no analytics, no network calls at runtime. All user data stays in the browser's localStorage; sync bundles are generated and consumed locally.

---

## 8. Build, Quality & Deployment

- **Dev:** `bun/npm run dev` (Vite, port 3000) — HMR configurable via `DISABLE_HMR`.
- **Build:** `run build` → static `dist/`; `base` from `BASE_PATH` with `'./'` default for portable hosting (static CDNs, subpaths).
- **Type check:** `npm run lint` runs `tsc --noEmit`.
- **Dead code:** `knip` (entry `index.html`; ignores unused-but-shipped deps like `@google/genai`, `express`, `dotenv`, `motion`).
- **Pre-commit:** husky + lint-staged run Prettier on staged files.
- Alias `@` → project root.

### 8.1 Known Gaps / Future Work

1. **No unit tests** — `loanCalculations.calculateLoan` and `calculatePeriodicIRR` are pure and highly testable; recommended first target.
2. **PWA service worker** — manifest exists; offline caching strategy (e.g., vite-plugin-pwa / Workbox) not yet wired.
3. **Fixed add-on + extra payments** — extra-payment simulation and savings reporting are only implemented for the diminishing-balance path.
4. **Static FX rates** — `rateAgainstUSD` values are hardcoded; a live-rates abstraction would slot behind `convertAmount`.
5. **Cloud sync transport** — current sync is manual copy/paste; a remote backend (if added) should reuse the same `SyncPayload` shape and add `lastWriterWins` conflict resolution by `timestamp`.
6. **Rounding/tolerance** — payment figures are computed at full float precision without banker's rounding; currency display rounds but the schedule does not.

---

## 9. Traceability Summary

| Design element           | Source files                                                |
| ------------------------ | ----------------------------------------------------------- |
| Domain & calc types      | `src/types/loan.ts`                                         |
| Calculation engine       | `src/utils/loanCalculations.ts`                             |
| Persistence & sync       | `src/utils/storageAndSync.ts`                               |
| Currency domain          | `src/utils/currencies.ts`                                   |
| Export functions         | `src/utils/exportUtils.ts`                                  |
| Root state & composition | `src/App.tsx`                                               |
| Presentation             | `src/components/*.tsx`, `src/index.css`                     |
| PWA lifecycle            | `src/hooks/usePWA.ts`, `public/manifest.json`, `index.html` |
| Build/QA config          | `vite.config.ts`, `knip.json`, `package.json`               |
