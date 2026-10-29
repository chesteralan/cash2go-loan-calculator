# LoanMatrix — Roadmap / TODO

> Status as of v0.1.0 (`feat/iteration-todo-doc`). Closed items from SDD §8.1:
> unit tests, PWA service worker, add-on extra payments, rounding discipline.
> **App scope decision: client-only.** All data stays in this browser's local
> storage. Cloud sync (and the base64 copy/paste sync bundle) has been removed;
> portability is provided by JSON backup file export/import instead.

## Done this iteration (v0.1.1)

- [x] **Remove cloud sync** — deleted `CloudSyncModal`, the `SyncPayload`/`getSyncID`/`generateSyncBundle`/`restoreSyncBundle` helpers, the header Sync button, and their tests. No network transport of any kind.
- [x] **Local storage hardening** — `storageAndSync.ts` renamed to `storage.ts` (`SAVED_LOANS_KEY`, `CURRENT_LOAN_KEY`, `DARK_MODE_KEY`). Corrupt-array saved-loan records now fall back to `[]`.
- [x] **JSON backup file export** — `Export Backup` in the Saved Loans drawer downloads `loanmatrix-backup-<date>.json` (`app`, `version`, `exportedAt`, `loans`).
- [x] **JSON backup file import** — `Import Backup` merges a backup file with existing loans by id, skipping invalid entries; toast confirms the count.
- [x] **Clear all saved loans** — `Clear All` wipes the saved-loans key and re-seeds the two presets.

## Priority 1 — Engineering

- [ ] **Component audit & abstraction pass** — scan all 12 `src/components/*.tsx` files, evaluate each for abstraction, and split big ones into small, single-purpose components (target ≤ ~150 lines each). Largest first:
  - `LoanComparisonView.tsx` (860 lines) — extract the comparison table rows, per-loan card, and summary column into subcomponents.
  - `LoanInputForm.tsx` (560 lines) — split into field-level subcomponents (`PrincipalField`, `TermField`, `RateField`, `ExtraPaymentField`, …) over a shared `NumberField`/`SelectField` abstraction instead of inline JSX per input.
  - `AmortizationMatrix.tsx` (333) and `AmortizationChart.tsx` (312) — extract the schedule table head/rows and chart scaffolding.
  - `LoanComparisonModal.tsx` (235) — reuse the same field components as `LoanInputForm`.
  - Rule of thumb: duplicated JSX appearing ≥ 2 places → hoist to a shared component; repeated Tailwind class strings → tiny wrapper or utility helper.
- [ ] **Bundle code-splitting** — main JS chunk is ~787 kB minified (~236 kB gzip). Lazy-load heavy paths with dynamic `import()`: `jspdf` + `jspdf-autotable` + html2canvas (PDF export only), chart/modal components behind `React.lazy`.
- [ ] **Component tests** — extend the existing Vitest setup (happy-dom already installed) with `@testing-library/react`; first targets: `LoanInputForm`, `OfflineIndicator`, `SavedLoansDrawer`, `usePWA` hooks.
- [ ] **Dev-dep hygiene** — knip hints leave `.css` excluded and `@types/*` removed; verify `autoprefixer`/`esbuild` roles + ESLint has no config in-tree (drop if unused). Also commit-clean `.fallow` cache bins (consider `.gitignore`).

## Priority 2 — Features (all local, no network)

- [ ] **Import confirmation instead of blind merge** — preview the count and diff (`new` vs `updated` vs `unchanged`) before `importLoansJson` writes to storage.
- [ ] **Delete undo toast** — after `deleteSavedLoan` / `clearAllLoans`, offer a 5-second "Undo" action in the notification toast (snapshot deleted records in state before wiping).
- [ ] **Duplicate-on-save prompt** — when `saveLoanToStorage` detects an id/title collision, ask "Overwrite" vs "Save as copy" (`loan-2`, `loan-3`, …).
- [ ] **Storage usage indicator** — show approximate bytes used by the saved-loans key in the drawer footer; warn near quota (~5 MB) and suggest exporting a backup.
- [ ] **Restore-last-session toast** — on mount, if the active loan differs from the Cash2Go preset, show "Restored your last calculation".
- [ ] **PDF export via local generation only** — confirmation that `jspdf`/html2canvas remain fully client-side when the bundle-splitting work lands.
- [ ] **Live FX rates (optional, client-side fetch)** — currently static in `src/utils/currencies.ts` (intentional choice). Add an _opt-in_ live-rates provider behind `convertAmount` with a cached-fallback to the static `rateAgainstUSD` table (no API key, e.g. exchangerate). Not required — the app stays fully functional offline.

## Priority 3 — Docs & polish

- [ ] **SDD refresh** — update `docs/SDD.md` §8.1 (items 1, 2, 3, 6 closed); document the add-on extra-payment rebate model (flat interest for unpaid future periods waived), the 2-decimal schedule rounding discipline (final row absorbs residue), and the new client-only storage/backup model (local storage keys + JSON backup export/import).
- [ ] **PWA manifest consolidation** — `public/manifest.json` (legacy) vs generated `manifest.webmanifest` (vite-plugin-pwa): remove the legacy file.
- [ ] **Favicon** — `includeAssets` references a `favicon.ico` that doesn't exist in `public/` (only `icon.svg`); add one or drop it from the config.
