# 小板凳 · Kneehigh website

Static site served by GitHub Pages from `main` (root). Address: https://kneehigh.uzumea.com (once DNS is set), also https://jaaakoo.github.io/kneehigh-site/.

- `index.html` = 简体中文; `hant/ en/ ja/ ko/ vi/ th/ id/ ms/ es/ fr/ de/ it/ pt/` = other languages. Root sends first-time visitors to their browser language.
- Pages are generated: edit `src/` and run `node src/build.mjs`. Texts come from the App Store listing (`src/listing.json`), screenshot captions (`src/cap.json`) and `src/strings.json`.
- When the app is live, set `LIVE = true` in `src/build.mjs` and rebuild: the App Store button becomes a link.
- `privacy.html` (policy, kept at the same address) and `app/config.json` (the app's remote settings) are not generated; don't move them.
