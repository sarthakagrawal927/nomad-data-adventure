# Nomad Data Adventure

A static city explorer covering 1,383 cities, hosted on GitHub Pages.

Live product: https://sarthakagrawal927.github.io/nomad-data-adventure/

## Data and credits

City data is sourced from [Nomads.com](https://nomads.com/). Credit belongs to
Nomads.com for the source data. This is an independent explorer using a saved
snapshot; values are not live prices or conditions.

The full dataset is available at [cities.json](./cities.json) (about 1.35 MB).
It is an unchanged copy of the collected `data/nomads_cities.json` snapshot.
Attribution does not imply affiliation or a new license for the source data.

Search cities or countries, sort by cost, overall score, internet or safety,
and filter by monthly budget. Missing values remain unavailable. Cities are
shown in batches of 60, with a button to show more.

## Development

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/>. The page fetches `cities.json` from the same site,
so use an HTTP server rather than opening the HTML file directly.

## Publishing

GitHub Pages serves the repository root on `main`. The public product consists
of `index.html`, `cities.json`, and this README. There is no backend, database,
build step, package manager, or external runtime service.

`data/` remains Git-ignored for local duplicate exports, collection scripts,
state, and logs. Publish the root dataset, not the entire local data directory.
