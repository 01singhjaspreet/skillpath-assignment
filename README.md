# Skillpath Assignment

A production-ready React landing page for a fictional creator-learning platform. The
course catalog is powered by a deliberately flaky live API, so resilience and honest
fallback behavior are treated as core product features rather than afterthoughts.

The first visual scaffold was explored in Figma Make. The final implementation uses
master.dev only as an art-direction reference and is independently built for Skillpath.

## Run locally

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:8443` by default.

## Quality checks

```bash
pnpm check
```

This checks formatting, all Vitest suites, and the production build.

## How it works

- The course and country endpoints are requested concurrently with GET only.
- HTTP failures, timeouts, invalid JSON, invalid response shapes, and stale requests are
  handled explicitly.
- A course failure shows a retryable error. A country-only failure keeps the catalog
  useful, labels the USD fallback, and offers an independent region retry.
- Failed course requests recover automatically with a bounded 2s/5s/10s backoff. These
  retries fetch only the catalog, preserve a successful region result, and are cancelled
  on manual retry, replacement requests, or unmount.
- `pricePaise` and `priceUsdCents` are divided by 100 only when formatted for display.
- Search covers course names and categories. Price sorting uses the integer value for
  the currency currently shown.
- Course poster colors are derived from `courseCode`, so visual variety works for any
  catalog size without hardcoded course data.

## Site configuration

The two Framer-style controls are translated to a small JavaScript configuration in
`src/config/site.js`:

```js
export const siteConfig = {
  catalogHeading: "Choose what you’ll ship next",
  showRefundableBadges: true,
}
```

No API keys or environment variables are required. For local API substitution, set
`VITE_SKILLPATH_API_URL`.

## Deployment

`netlify.toml` defines the Node version, build command, output directory, static fallback,
and cache/security headers. Connect the repository in Netlify or run a production deploy
through the Netlify CLI.

## UI foundation

The interface is JavaScript-only. Reusable primitives live in `src/components/ui` and
follow shadcn's composition conventions: Radix Slot, `data-slot` hooks, forwarded refs,
class variants, and a `cn` utility. Skillpath's custom visual system is layered over those
primitives in `src/index.css`.

## Stack

React 19, JavaScript, shadcn-style primitives, Vite, custom CSS, Vitest, React Testing
Library, Lucide icons, and self-hosted Fontsource assets.
