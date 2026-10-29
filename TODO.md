# LoanMatrix — Roadmap / TODO

> Status as of v0.1.0 (`feat/iteration-todo-doc`). Closed items from SDD §8.1:
> unit tests, PWA service worker, add-on extra payments, rounding discipline.

## Priority 1 — Engineering

- [ ] **Bundle code-splitting** — main JS chunk is ~787 kB minified (~236 kB gzip). Lazy-load heavy paths with dynamic `import()`: `jspdf` + `jspdf-autotable` + html2canvas (PDF export only), chart/modal components behind `React.lazy`.
- [ ] **Component tests** — extend the existing Vitest setup (happy-dom already installed) with `@testing-library/react`; first targets: `LoanInputForm`, `OfflineIndicator`, `usePWA` hooks.
- [ ] **Dev-dep hygiene** — knip hints leave `.css` excluded and `@types/*` removed; verify `autoprefixer`/`esbuild` roles + ESLint has no config in-tree (drop if unused). Also commit-clean `.fallow` cache bins (consider `.gitignore`).

## Priority 2 — Features

- [ ] **Live FX rates** — currently static in `src/utils/currencies.ts` (intentional choice). Add an optional live-rates provider behind `convertAmount` with a cached-fallback to the static `rateAgainstUSD` table (no API key required, e.g., exchangerate-api).
- [ ] **Real cloud sync** — replace manual base64 copy/paste with a remote transport; reuse the `SyncPayload` shape (`version`, `syncId`, `timestamp`, `loans`) from `src/utils/storageAndSync.ts` and resolve last-writer-wins by `timestamp`.

## Priority 3 — Docs & polish

- [ ] **SDD refresh** — update `docs/SDD.md` §8.1 (items 1, 2, 3, 6 closed); document the add-on extra-payment rebate model (flat interest for unpaid future periods waived) and the 2-decimal schedule rounding discipline (final row absorbs residue).
- [ ] **PWA manifest consolidation** — `public/manifest.json` (legacy) vs generated `manifest.webmanifest` (vite-plugin-pwa): remove the legacy file.
- [ ] **Favicon** — `includeAssets` references a `favicon.ico` that doesn't exist in `public/` (only `icon.svg`); add one or drop it from the config.
