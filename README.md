# LoanMatrix

A client-side PWA loan and mortgage amortization calculator built around fixed add-on personal loans (fixed add-on rate structure) plus generic diminishing-balance loans.

## Features

- **Loan input**: principal, rate & rate period, structure (fixed add-on / diminishing balance), term, payment interval (weekly → annually), start date, one-time fees, currency
- **Amortization engine**: schedule, annual matrix, add-on fees, effective interest rate (Newton–Raphson periodic IRR)
- **Extra payment simulation**: interest savings + periods saved, with fixed add-on-style flat-interest rebate on add-on loans
- **Charts & breakdowns**: amortization chart, composition donut, schedule matrix
- **Saved loans**: localStorage CRUD, seeded presets (fixed add-on, standard mortgage)
- **Loan comparison** view
- **Multi-currency**: 12-currency table + converter (static rates)
- **Exports**: PDF via jsPDF/autotable
- **PWA**: installable, service worker offline caching (`vite-plugin-pwa`)
- **Cross-device sync**: manual base64 export/import bundles + sync ID
- **Dark mode**

## Tech Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4, lucide-react, motion
- PWA via `vite-plugin-pwa`
- Tests via Vitest (`bun run test`)

## Getting Started

Requires [Bun](https://bun.sh/).

```bash
bun install       # install dependencies
bun run dev       # dev server on :3000
bun run test      # run unit tests
bun run lint      # typecheck
bun run format    # prettier
bun run build     # production build (dist/)
bun run preview   # serve the production build
```

## CI / CD

- **audit.yml** — security audit, typecheck, format check, unit tests, knip + fallow dead-code, production build
- **deploy.yml** — builds and deploys to GitHub Pages

## Documentation

Full software design document: [`docs/SDD.md`](./docs/SDD.md)
