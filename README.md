# Nomad Data Adventure

This is the single workspace folder for Nomad Data Adventure:

- `index.html` — public static demo with three fictional city records.
- `data/` — collected city datasets, collection scripts, and collection logs.
  This directory is Git-ignored and is not part of the public repository or a
  publication artifact.

Live demo: https://sarthakagrawal927.github.io/nomad-data-adventure/

## Run offline

From this directory, use any static-file server:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/>. Use **Sort by** to compare overall score, cost,
internet, or safety. Move **Maximum monthly estimate** to filter the shortlist.
The page has no external font, image, script, stylesheet, or API request.

The files can also be opened directly as `index.html`, though a local server is
the reproducible path used for verification.

## Collected data

The retained files include `data/nomads_cities.json`, compact JSON and JavaScript
exports, the collection state and sitemap, and `data/cities-atlas.json` preserved
from the former local app. Collection scripts and logs remain alongside the data.
There is no separate local Astro app or local demo to maintain.

## Rights boundary

Every city and value in the root demo is fictional. The page makes no claim
about real locations and contains no third-party dataset. The collected dataset
in `data/` has no verified redistribution rights and remains local.

## Publication allowlist

Publish only the root `index.html` and this `README.md`. Never upload the entire
workspace directory or `data/`. The public demo needs no build, package manager,
external service, or deployment configuration.
