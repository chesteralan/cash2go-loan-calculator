# LoanMatrix — Roadmap / TODO

> Status as of v0.1.1 (`feat/iteration-todo-doc`). **All items through this
> iteration are done** — see the checked list below. ~~Struck~~ items were
> closed with implementation changes; SDD §8.1 has been refreshed to match.
> **App scope decision: client-only.** All data stays in this browser's local
> storage. Cloud sync (and the base64 copy/paste sync bundle) has been removed;
> portability is provided by JSON backup file export/import instead.

## Done this iteration (v0.1.1)

- [x] **Remove cloud sync** — deleted `CloudSyncModal`, the `SyncPayload`/`getSyncID`/`generateSyncBundle`/`restoreSyncBundle` helpers, the header Sync button, and their tests. No network transport of user data.
- [x] **Local storage hardening** — `storageAndSync.ts` renamed to `storage.ts` (`SAVED_LOANS_KEY`, `CURRENT_LOAN_KEY`, `DARK_MODE_KEY`). Corrupt-array saved-loan records now fall back to `[]`.
- [x] **JSON backup file export** — `Export Backup` in the Saved Loans drawer downloads `loanmatrix-backup-<date>.json` (`app`, `version`, `exportedAt`, `loans`).
- [x] **JSON backup file import with review** — `Import Backup` builds a `new / updated / unchanged / skipped` diff preview via `buildImportPreview`; the user confirms before `applyImport` merges.
- [x] **Clear all saved loans** — `Clear All` wipes the saved-loans key and re-seeds the two presets.
- [x] **Component audit & abstraction pass** — all 12 top-level components split into small single-purpose modules (`ui/NumberField`, `ui/SelectField`, `ui/TogglePill`, `loan-input/*`, `loan-comparison/*`, `amortization/*`); worst file went from 860 → ~130 lines. knip-clean.
- [x] **Bundle code-splitting** — jsPDF/autotable moved to `utils/pdfExport.ts` behind a dynamic import; charts, matrix and modals are `React.lazy` + Suspense. Main chunk 787 kB (~236 kB gzip) → **~305 kB (~90 kB gzip)**; the PDF chunk (435 kB) loads only on export.
- [x] **Component tests** — `@testing-library/react` + `user-event`; suites for `LoanInputForm`, `SavedLoansDrawer`, `OfflineIndicator`, `usePWA` hooks (75+ tests, all passing; `test` script forces `NODE_ENV=test` under bun).
- [x] **Dev-dep hygiene** — dropped unused `autoprefixer`, `esbuild`, `eslint` (Vite 8 rolldown build); knip ignore list pruned; `.fallow/` gitignored and untracked.
- [x] **Delete undo toast** — delete/clear-all notifications offer a 6-second **Undo** button backed by an exact-list restore (`overwriteSavedLoans`).
- [x] **Duplicate-on-save prompt** — saving under an existing title offers **Save as copy** (`<title> (copy)`) vs **Overwrite**.
- [x] **Storage usage indicator** — drawer footer shows used bytes for the loan keys with a progress bar and a warn-near-quota hint.
- [x] **Restore-last-session toast** — on mount, if the active loan isn't the Cash2Go preset, show "Restored your last calculation."
- [x] **Live FX rates (opt-in, client-side fetch)** — `utils/liveRates.ts` fetches public USD rates only on user action (open.er-api.com, no key), caches to `loanmatrix_fx_rates_v1`; `convertAmount` uses cached overrides with static-table fallback; Reset button reverts.
- [x] **PDF export via local generation only** — confirmed: PDF pieces live in `pdfExport.ts` (lazy chunk), fully client-side; no external service.
- [x] **SDD refresh** — `docs/SDD.md` updated: §8.1 marked closed, §4.3 documents the add-on extra-payment rebate model and the 2-decimal rounding discipline (final row absorbs residue), §5.4 rewritten as the client-only backup design, architecture/traceability tables reflect the new module layout.
- [x] **PWA manifest consolidation** — legacy `public/manifest.json` removed; the generated `manifest.webmanifest` (vite-plugin-pwa) is the single source.
- [x] **Favicon** — dropped the nonexistent `favicon.ico` from `includeAssets`; `icon.svg` is the single app icon.

## Done next iteration (v0.1.2, `feat/e2e-and-inapp-dialogs`)

- [x] **In-app dialog for overwrite** — replaced `window.confirm` in the save-as-copy flow with a shared `ui/ConfirmDialog` component (Escape to close, focused heading, explicit "Save as copy" / "Overwrite existing" actions).
- [x] **E2E smoke test** — Playwright (`bun run e2e`, dedicated dev-server port 4517, headless chromium): drives calculate → save → duplicate-title dialog → save-as-copy → drawer → export backup download → import with preview → apply → compare view, end to end.

## Next backlog — design gaps audit (`feat/design-gaps-audit`, Oct 29 2026)

> Full review of `LoanSummaryCards`, `Cash2GoReferenceCard`, `AmortizationBreakdownDonut`,
> the charts, header, drawer, modals, and `index.css`. Ordered by severity per item.
> Verified in source — every finding cites where it lives.

### HIGH — accessibility

- [ ] **Interactive charts have no accessible alternative** — `AmortizationChart` (SVG area/bars), `BalanceTrajectoryChart` (dual-line), and `AmortizationBreakdownDonut` expose data only via `onMouseEnter` hover; there is no `role="img"`/`aria-label` on the SVGs and no keyboard or screen-reader path to the hover inspection data. Fix: label each chart (`role="img"`, named), and add a text summary block (peak balance, payoff movement) so the info isn't pointer-only.
- [ ] **Color-only data encoding** — donut/legend/trajectory swatches encode segments with color alone (blue/amber/purple; blue/emerald). Add a secondary differentiator (pattern/shape or direct labels on segments) for colorblind users.
- [ ] **iOS Safari input zoom** — form inputs render at 14px (`text-sm`) or less: `ui/NumberField` compact variants, drawer/`SavedLoansDrawer`, `LoanComparisonModal` field sets, `QuickTermShortcuts` selects. Any input under 16px auto-zooms the page on focus. Fix: force `≥16px` (or `text-base`) for all form controls below 640px.
- [ ] **Touch targets below 44×44px** — `TogglePill` options (`px-2 py-0.5`), quick-term/principal chips, the section-view toggle strip, and icon-only header buttons (~32px) are below minimum hit size. Fix: pad hit areas (pseudo-element expansion) to ≥44px without changing visual size.
- [ ] **Toast has no live region** — the app notification (`App.tsx` fixed top-right banner, `animate-bounce`) lacks `role="status"`/`aria-live`; save/undo/undo-toast success is silent for assistive tech. The Undo button also needs `aria-label` context and shouldn't vanish scroll-triggered.
- [ ] **Modal focus management** — `ConfirmDialog` closes on Escape but doesn't trap focus or restore it to the trigger; `SavedLoansDrawer`, `CurrencyConverterModal`, `LoanComparisonModal` don't set `inert` on the background nor return focus on close. Fix: shared focus-trap helper for all four overlays.

### MEDIUM — broken or missing states

- [ ] **Inexistent Tailwind shades silently no-op in dark mode** — `slate-850`, `slate-750`, and `slate-150` are not valid Tailwind v4 shades but appear in `structure selector hover`, `LoanComparisonModal` (3×), `LoanInputForm` border, `ScheduleBars` search/filter bar, `SavedLoansDrawer` list rows, and more. Dark surfaces just drop those rules (e.g. search bar background falls back to transparent). Fix: replace with real tokens (`slate-900`/`slate-800`/`slate-200`) or define aliases in `index.css`.
- [ ] **No empty/error state for the schedule workspace** — with `principal = 0` the schedule rows are empty and the chart returns `null`, leaving a bare gap between summary and matrix with no explanation. Fix: explicit empty state ("Enter a loan amount to build your schedule") + error boundary around calculation so number-paste accidents degrade gracefully.
- [ ] **Hover-only "Annualized" clarification** — the EIR card explains "Annualized" via a `title` tooltip only, invisible on touch/keyboard. Promote to visible helper text.

### MEDIUM — responsive

- [ ] **Toast placement collides with header actions on mobile** — the notification is pinned at `top-16 right-6`, overlapping the header action cluster on narrow screens; also `animate-bounce` runs continuously. Fix: bottom-centered on small screens, single gentle entrance instead of infinite bounce.
- [ ] **Comparison card grids squeeze on 320–375px** — `ComparisonLoanCard` always renders `grid-cols-2` for its 2×2 param rows with mono values that truncate at 320px. Consider single-column on smallest breakpoint or container queries.
- [ ] **Matrix filter/search row inside horizontal-scroll area** — `ScheduleSearchBar` sits inside the `overflow-x-auto` context, so on narrow screens the count text scrolls out of reach. Move status into the sticky header row.

### LOW — motion & polish

- [ ] **No `prefers-reduced-motion` support** — donut transitions (`duration-500`), charts, `animate-bounce`, and drawer transitions have no reduced-motion guard. Add a global `@media (prefers-reduced-motion: reduce)` block in `index.css`.
- [ ] **Exclamation points in copy** — "…shortens loan term by N periods!" (Prepayment Benefit) and "…savings)!" in `ComparisonVerdict`. House copy is sentence-case/no-bang; drop them.
- [ ] **Inconsistent comparison copy** — `ComparisonVerdict` payment line reads "'B has lower payments'" while other strings spell out "Calculation A/B". Unify.
- [ ] **Currency switch doesn't cascade to comparison** — picking a currency in the converter changes the main calculator, but `LoanComparisonView` keeps A/B at their saved codes; harmless but confusing mid-flow. Consider propagating or noting per-card codes in the KPI labels.
- [ ] **Header crushes at `lg` boundary** — wordmark + 4 nav items + currency pill + saved pill + theme toggle + (conditional PWA install) is tight between 1024–1100px; test and allow the PWA button to wrap or collapse into an icon.
