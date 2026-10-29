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

## Next iteration ideas (new backlog)
