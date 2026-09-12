# Nomad Data Adventure · synthetic demo

This directory is the standalone, shareable demo for Nomad Data Adventure. It
contains one static HTML file with three fictional city records, local CSS, and
local JavaScript controls. It does not include the owner’s collected dataset,
collection scripts, logs, credentials, or generated data.

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

## Rights boundary

Every city and value is fictional and authored for this demo. The page makes no
claim about real locations and contains no third-party dataset. The original
Nomad Data Adventure checkout remains separate and private because its collected
data has no verified redistribution rights.

## Publication allowlist

Publish only `index.html` and this `README.md` from this directory. No build,
package manager, external service, or deployment configuration is required.
