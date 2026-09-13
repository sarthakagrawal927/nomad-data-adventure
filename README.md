# Nomad Atlas · Nomad Data Adventure

**Status: completed experiment · shareable.** The static explorer and saved
dataset are the finished product. There is no active collection or expansion roadmap.

A static city explorer hosted on Cloudflare Pages.

Live: https://nomad.significanthobbies.com/

 The interface presents 1,374
terrestrial places across 205 source country/territory labels. The original
1,383-record JSON also preserves nine source novelty entries in the Space region.

## Capabilities

- Search names and countries, including accent-insensitive matches.
- Region and country filters; nomad, expat, local and family cost profiles.
- Budget, internet, safety, visa, lifestyle, inclusion and snapshot weather filters.
- Card and table views, sorting, pagination and shareable filter URLs.
- Full city details and side-by-side comparison of up to three places across 22 metrics.
- Original JSON download and filtered JSON/CSV exports with every source field.

## Data

City data is credited to [Nomads.com](https://nomads.com/). This independent
explorer uses a saved snapshot, not live prices, visa information or conditions.
The original `cities.json` remains byte-identical to `data/nomads_cities.json`.
Unknown values stay missing. Unusual costs are flagged, not silently rewritten.
The alternative local exports contain the same records, not additional datasets.

## Development and checks

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run check
```

Open http://127.0.0.1:4173/. Runtime code is HTML, CSS and browser JavaScript.
Wrangler is a development-only dependency for Cloudflare deployment.

## Cloudflare Pages deployment

`pnpm run build` copies an explicit public-file allowlist into `dist/` and fails
if unexpected files are present. `data/`, logs, scripts and local dependencies
are never uploaded. There are no Functions, Workers, APIs or databases.

After committing and pushing, wait for the exact commit's Static product checks
workflow, then run `pnpm run deploy`. This runs checks, the Fleet deployment guard
and `wrangler pages deploy dist --project-name nomad-data-adventure --branch main`.
The project already exists on Pages, so Wrangler deploys directly to Pages.
GitHub is used for source history and tests; production hosting is Cloudflare Pages.
