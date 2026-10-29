# Software Design Document — LoanMatrix

Advanced Amortization & Loan Calculator (PWA)

**Version:** 1.0
**Date:** 2026-10-29
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose

This document describes the software design of LoanMatrix, a client-side loan and mortgage amortization calculator. It covers the system architecture, calculation engine, data model, local persistence & backup strategy, PWA behavior, and UI composition.

### 1.2 Scope

LoanMatrix is a single-page web application (no backend at runtime) built with React 19 + TypeScript + Vite, targeting:

- **Fixed Add-On loans** (flat-rate installment loans, e.g., Metrobank Cash2Go personal loans) — rate entered as a monthly add-on rate.
- **Diminishing (Reducing) Balance loans** (mortgages, commercial loans) — rate entered as an annual APR.
- Six payment intervals (weekly → annually), extra-payment simulation, one-time fees, multi-currency support (with optional opt-in live FX rates), PDF/Excel export, saved-loan management, offline PWA operation, and fully local JSON backup file export/import. **The app ships zero network transport of user data.**

### 1.3 Definitions & Acronyms

| Term                   | Definition                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| EIR / APR              | Effective Interest Rate — annualized from the periodic IRR: `(1+irr)^frequency − 1`             |
| Nominal rate           | Periodic IRR × frequency (simple annualization)                                                 |
| Add-on rate            | Flat rate applied to full principal for the entire term; interest not amortized                 |
| Fixed add-on structure | `totalInterest = principal × monthlyAddOn × totalMonths`; repayment split evenly across periods |
| Diminishing balance    | Interest computed on the outstanding balance each period (standard amortization)                |
| Backup file            | Local JSON file (`loanmatrix-backup-<date>.json`) carrying all saved loans for portability      |

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
│    │                 activeTab, modal flags, notification,   │
│    │                 importPreview                           │
│    │                                                          │
│    ├─► components/   Header, LoanInputForm, LoanSummaryCards,│
│    │                 AmortizationChart,                      │
│    │                 AmortizationBreakdownDonut,             │
│    │                 AmortizationMatrix, Cash2GoReferenceCard│
│    │                 modals: CurrencyConverter,              │
│    │                 LoanComparison, SavedLoansDrawer,       │
│    │                 OfflineIndicator                        │
│    │                 (charts/matrix/modals are React.lazy)   │
│    │                                                          │
│    ├─► utils/loanCalculations.ts   ◄── pure calc engine      │
│    ├─► utils/storage.ts            ◄── localStorage + backup │
│    ├─► utils/currencies.ts         ◄── FX table + live-rates │
│    ├─► utils/exportUtils.ts        ◄── CSV / Excel / PDF     │
│    │                             (pdfExport lazy chunk)     │
│    ├─► utils/liveRates.ts          ◄── opt-in FX fetch cache │
│    └─► hooks/usePWA.ts             ◄── install prompt,      │
│                           offline detection                  │
│                                                              │
│  Persistence: localStorage (4 keys, see §5)                  │
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
| PWA          | vite-plugin-pwa `manifest.webmanifest`     | Installable, offline-capable                          |
| Quality      | knip, fallow, husky, lint-staged, prettier | Dead-code detection, pre-commit hygiene               |

### 2.3 Design Principles

1. **Pure calculation core** — `loanCalculations.ts` has zero DOM/side-effect dependencies; input in, `CalculationResult` out.
2. **Derived state, not stored state** — the amortization schedule is recomputed via `useMemo` on every `activeInput` change; nothing about results is persisted.
3. **localStorage as the only store** — no backend, no runtime network transport of user data; portability is achieved through local JSON backup files.
4. **Graceful degradation** — storage reads wrapped in try/catch; presets used as fallbacks.

---

## 3. Functional Requirements (implemented)

| ID    | Feature                                                                                                                                            | Module(s)                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| FR-01 | Loan input form: principal, rate, rate period, structure, term (months/years), payment interval, start date, extra payment, one-time fee, currency | `LoanInputForm`                                                        |
| FR-02 | Two loan structures: fixed add-on and diminishing balance                                                                                          | `loanCalculations.calculateLoan`                                       |
| FR-03 | Six payment intervals with correct period counts and date stepping                                                                                 | `getIntervalFrequency`, `getTotalPeriods`, `addIntervalToDate`         |
| FR-04 | Effective interest rate (annualized IRR) disclosure for fixed add-on loans                                                                         | `calculatePeriodicIRR` (Newton–Raphson)                                |
| FR-05 | Extra per-period payment simulation with interest-savings and periods-saved report                                                                 | diminishing-balance loop + baseline comparison                         |
| FR-06 | Period-by-period amortization schedule table + annual matrix grouping                                                                              | `AmortizationMatrix`, `annualMatrix`                                   |
| FR-07 | Charts: balance-over-time chart + principal/interest donut                                                                                         | `AmortizationChart`, `AmortizationBreakdownDonut`                      |
| FR-08 | Summary cards: periodic payment, total interest, total cost, payoff date, savings                                                                  | `LoanSummaryCards`                                                     |
| FR-09 | Saved loans: create/update/delete (with undo toast)/load, save-as-copy on title collision, seeded with two presets, local storage usage meter      | `storage.ts`, `SavedLoansDrawer`, `App.tsx`                            |
| FR-10 | Loan comparison view/modal across saved loans                                                                                                      | `LoanComparisonModal`, `LoanComparisonView`                            |
| FR-11 | Multi-currency: 12-currency table, formatting, cross-currency conversion, optional opt-in live FX rates                                            | `currencies.ts`, `liveRates.ts`, `CurrencyConverterModal`              |
| FR-12 | PDF/Excel/CSV export (PDF jsPDF chunk lazily loaded, fully client-side)                                                                            | `exportUtils.ts`, `pdfExport.ts`                                       |
| FR-13 | Local JSON backup export/import with reviewed diff preview (+ deleted/clear-all undo)                                                              | `storage.ts`, `SavedLoansDrawer`, `App.tsx`                            |
| FR-14 | Offline PWA: generated manifest, install prompt, offline indicator                                                                                 | `manifest.webmanifest` (vite-plugin-pwa), `usePWA`, `OfflineIndicator` |
| FR-15 | Dark mode toggle, persisted                                                                                                                        | `Header`, `DARK_MODE_KEY`                                              |
| FR-16 | Cash2Go benchmark reference card with auto-detection of the preset configuration                                                                   | `Cash2GoReferenceCard`, `isCash2GoActive`                              |

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

**Add-on rebate model.** For `fixed_addon` loans with extra payments, interest for all future unpaid periods is calculated flat on the original principal, so paying early entitles the borrower to "rebate" the flat interest of periods that no longer occur: every short schedule consumes less flat interest, which is reported through `savedInterestWithExtra` against the baseline run.

**Rounding discipline.** Payments keep full float precision internally. The emitted schedule rounds every row to 2 decimals, absorbing any residual drift in the **final row** so the cumulative totals reconcile exactly with the reported lifespan totals; KPI/currency display rounds half-up to 2 decimals.

### 4.4 Annual Matrix

Rows are bucketed by payment count: `frequency` rows per bucket (handles the final partial bucket at `index === schedule.length - 1`). `calendarYear` derives from the start date's year + bucket index.

### 4.5 Result Contract (`CalculationResult`)

`input, periodicPayment, totalPaymentPeriods, totalPrincipal, totalInterest, totalFees, totalCost, effectiveInterestRate, nominalAnnualRate, monthlyAddOnRate?, payoffDate, schedule[], annualMatrix[], savedInterestWithExtra, periodsSavedWithExtra`

### 4.6 Date Stepping

`addIntervalToDate` steps per interval: monthly/quarterly/annually by calendar increments; semi-monthly by half-month grid (day 1 / 15); bi-weekly +14d; weekly +7d. Output format `YYYY-MM-DD` (ISO date part).

---

## 5. Data Model & Persistence (`src/types/loan.ts`, `src/utils/storage.ts`)

### 5.1 Core Types

- `LoanStructure`: `'diminishing_balance' | 'fixed_addon'`
- `PaymentInterval`: `'monthly' | 'semi_monthly' | 'bi_weekly' | 'weekly' | 'quarterly' | 'annually'`
- `LoanInput`: id, title, principal, interestRate (%), ratePeriod (`'annual' | 'monthly'`), structure, termValue/termUnit, paymentInterval, startDate (`YYYY-MM-DD`), extraPaymentPerPeriod, oneTimeFee, currencyCode
- `AmortizationRow` (period, date, payment, principal, interest, extraPayment, totalPayment, remainingBalance, cumulative*)
- `AnnualMatrixRow` (yearIndex, calendarYear, principalPaid, interestPaid, extraPaid, totalPaid, endingBalance)
- `SavedLoanRecord` (id, title, timestamp, input)
- `CurrencyConfig` (code, symbol, name, rateAgainstUSD)

### 5.2 localStorage Keys

| Key                         | Type                               | Contents                                                                      |
| --------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| `loanmatrix_saved_loans_v1` | `SavedLoanRecord[]`                | All saved loans, seeded with Cash2Go + standard mortgage presets on first run |
| `loanmatrix_active_loan_v1` | `LoanInput`                        | Currently loaded loan                                                         |
| `loanmatrix_theme_dark`     | `boolean`                          | Dark-mode preference                                                          |
| `loanmatrix_fx_rates_v1`    | `{ base:'USD', fetchedAt, rates }` | Optional cached live FX rates from the opt-in fetch                           |

### 5.3 Save/Upsert Semantics

`saveLoanToStorage` upserts by `input.id`; missing IDs are minted as `loan-<epoch>`.

### 5.4 Backup Design (client-only portability)

There is **no cross-device sync of any kind** (the earlier base64 copy/paste `SyncPayload` bundle and `CloudSyncModal` were removed in v0.1.1). Portability is achieved entirely with local JSON backup files:

- **Export** — `exportLoansJson` writes `ExportPayload { app:'loanmatrix', version:1, exportedAt, loans[] }` to a downloadable `loanmatrix-backup-<date>.json`.
- **Import (reviewed)** — the file is parsed by `buildImportPreview`, which diffs it against the saved list into `newCount / updatedCount / unchangedCount / invalidCount` records; the user reviews the counts in the drawer and confirms before `applyImport` merges by id and re-sorts by timestamp. Payloads are plain user-controlled files, so no encryption-at-rest is required; nothing from the file is transmitted anywhere.
- **Live FX (opt-in, never automatic)** — `utils/liveRates.ts` can fetch public USD-based rates (`open.er-api.com`, no API key) on explicit user action only, caching them under `loanmatrix_fx_rates_v1`. `convertAmount` reads cached overrides over the static table and the app remains fully functional offline without them.

---

## 6. Application Layer

### 6.1 `src/App.tsx` — root container / state owner

State:

- `activeInput: LoanInput` (hydrated from storage; persisted on change)
- `savedLoans: SavedLoanRecord[]` (hydrated on mount)
- `darkMode: boolean` (persisted)
- `activeTab: 'calculator' | 'matrix' | 'benchmark' | …` (matrix/benchmark act as smooth-scroll anchors)
- Modal open flags: currency converter, loan comparison, saved-loans drawer
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
| `LoanComparisonModal`                        | Uses the shared `StructureCard` to compare add-on vs diminishing; applies structure       |
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

No telemetry, no analytics, no runtime network calls for user data. All user data stays in the browser's localStorage; the only outbound request the app supports is the **explicit, user-triggered** FX rate fetch (public rates only, cached locally, §5.4). Backup files are generated and consumed locally.

---

## 8. Build, Quality & Deployment

- **Dev:** `bun/npm run dev` (Vite, port 3000) — HMR configurable via `DISABLE_HMR`.
- **Build:** `run build` → static `dist/`; `base` from `BASE_PATH` with `'./'` default for portable hosting (static CDNs, subpaths).
- **Type check:** `npm run lint` runs `tsc --noEmit`.
- **Dead code:** `knip` (entry `index.html`; ignores unused-but-shipped deps like `@google/genai`, `express`, `dotenv`, `motion`).
- **Pre-commit:** husky + lint-staged run Prettier on staged files.
- Alias `@` → project root.

### 8.1 Closed Gaps (v0.1.1)

1. ~~No unit tests~~ — closed: `loanCalculations`, `currencies`, `storage` and component/hook tests (`LoanInputForm`, `SavedLoansDrawer`, `OfflineIndicator`, `usePWA`) run under Vitest + Testing Library.
2. ~~PWA service worker~~ — closed: vite-plugin-pwa (Workbox) precaches the app; for data portability there are JSON backup files, no sync.
3. ~~Fixed add-on + extra payments~~ — closed: add-on route supports extra payments with the flat-interest rebate model documented in §4.3.
4. ~~Static FX rates~~ — closed: `utils/liveRates.ts` provides an opt-in cached live-rate fetch behind `convertAmount`, with the static table as fallback.
5. ~~Cloud sync transport~~ — closed by removal: the client-only app has no runtime network transport of user data; portability is via local JSON backup export/import with a reviewed diff (§5.4).
6. ~~Rounding/tolerance~~ — closed: 2-decimal schedule rounding with the residual absorbed in the final row (§4.3).

---

## 9. Traceability Summary

| Design element           | Source files                                                                  |
| ------------------------ | ----------------------------------------------------------------------------- |
| Domain & calc types      | `src/types/loan.ts`                                                           |
| Calculation engine       | `src/utils/loanCalculations.ts`                                               |
| Persistence & backup     | `src/utils/storage.ts`                                                        |
| Currency domain          | `src/utils/currencies.ts`                                                     |
| Export functions         | `src/utils/exportUtils.ts`                                                    |
| Root state & composition | `src/App.tsx`                                                                 |
| Presentation             | `src/components/*.tsx`, `src/index.css`                                       |
| PWA lifecycle            | `src/hooks/usePWA.ts`, `manifest.webmanifest` (vite-plugin-pwa), `index.html` |
| Build/QA config          | `vite.config.ts`, `knip.json`, `package.json`                                 |
