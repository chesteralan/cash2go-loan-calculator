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

- [x] **Interactive charts have no accessible alternative** — `AmortizationChart` (SVG area/bars), `BalanceTrajectoryChart` (dual-line), and `AmortizationBreakdownDonut` expose data only via `onMouseEnter` hover; there is no `role="img"`/`aria-label` on the SVGs and no keyboard or screen-reader path to the hover inspection data. Fixed: each SVG now carries `role="img"` + a data-bearing `aria-label` (start/end balance, mode, currency amounts); the inspection ribbons already show static text at the midpoint so info isn't pointer-only.
- [x] **Color-only data encoding** — donut/legend/trajectory swatches encode segments with color alone (blue/amber/purple; blue/emerald). Fixed: legend swatches now differ by shape (square vs circle vs diamond) in addition to color, with `aria-hidden`; segment meanings are also spelled in the SVG `aria-label`s.
- [x] **iOS Safari input zoom** — form inputs render at 14px (`text-sm`) or less: `ui/NumberField` compact variants, drawer/`SavedLoansDrawer`, `LoanComparisonModal` field sets, `QuickTermShortcuts` selects. Any input under 16px auto-zooms the page on focus. Fixed: global `@media (max-width: 639px)` rule forces `font-size: 1rem` on all inputs/selects/textareas in `index.css`.
- [x] **Touch targets below 44×44px** — `TogglePill` options (`px-2 py-0.5`), quick-term chips, and other tiny controls are below minimum hit size. Fixed: pseudo-element hit-area expansion (`before:-inset-y-2`) on `TogglePill` options and quick-term chips, plus `aria-pressed` on toggles and icon-only header buttons raised to h-9/w-9.
- [x] **Toast has no live region** — the app notification lacks `role="status"`/`aria-live`; success/undo is silent for assistive tech. Fixed: `role="status" aria-live="polite"` + labeled Undo button ("Undo the last delete").
- [x] **Modal focus management** — overlays don't trap focus or return it to the trigger. Fixed: new `hooks/useModalA11y` (focus-in, Tab trap, Escape, focus-restore) applied to `ConfirmDialog`, `SavedLoansDrawer`, `CurrencyConverterModal`, `LoanComparisonModal`; overlays carry `role="presentation"`, panels `role="dialog"` + `aria-modal` + names.

### MEDIUM — broken or missing states

- [x] **Inexistent Tailwind shades silently no-op in dark mode** — `slate-850`, `slate-750`, and `slate-150` are not valid Tailwind v4 shades. Fixed: all replaced with real tokens (`slate-800/60`, `slate-700`, `slate-200`) across the five affected files.
- [x] **No empty state for the schedule workspace** — with `principal = 0` the chart returns `null`, leaving a bare gap. Fixed: explicit dashed empty state ("Enter a loan amount to build your schedule") replaces the charts; matrix stays data-less by design.
- [x] **Hover-only "Annualized" clarification** — the EIR card explains "Annualized" via a `title` tooltip only. Fixed: replaced with visible "Annualized via periodic IRR" text.

### MEDIUM — responsive

- [x] **Toast placement collides with header actions on mobile** — the notification was pinned at `top-16 right-6` with an infinite `animate-bounce`. Fixed: bottom-center on phones, top-right on ≥sm, single `animate-fade-in` entrance.
- [x] **Comparison card grids squeeze on 320–375px** — `LoanParamsEditor` rendered fixed `grid-cols-2`. Fixed: `grid-cols-1 sm:grid-cols-2` so the smallest breakpoint stacks.
- [x] **Matrix filter/search row inside horizontal-scroll area** — verified in source: the search bar renders **outside** the `overflow-x-auto` container in `AmortizationMatrix`, so this finding was already satisfied; checklist closed with no change.

### LOW — motion & polish

- [x] **No `prefers-reduced-motion` support** — Fixed: global reduce block in `index.css` kills animations/transitions for users who request it.
- [x] **Exclamation points in copy** — Fixed: Prepayment Benefit and `ComparisonVerdict` savings sentences now end with periods.
- [x] **Inconsistent comparison copy** — Fixed: "Calculation B has lower payments" now matches its sibling string.
- [ ] **Currency switch doesn't cascade to comparison** — deferred by design: comparison loans intentionally keep their own saved currency codes (a cross-currency comparison is a legitimate use); revisit only if users report confusion.
- [x] **Header crushes at `lg` boundary** — Fixed: nav gap `gap-6 → gap-4` and container `gap-8 → gap-4`; nav labels remain `whitespace-nowrap`.

### Remaining open

- [ ] Error boundary around the calculation pipeline (degrades on paste-in garbage instead of white screen).
- [ ] Currency-cascade decision above.
- [ ] Manual device pass: verify hit areas and TV-free zoom on a real phone + 200% desktop zoom.
