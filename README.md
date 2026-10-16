# Nexus' Software Wiki

This repository is a static documentation and project-index site. Pages are
plain HTML; the shared presentation is in `style.css`, with browser behavior
in the repository's JavaScript files. `sitemap.html` is the page index.
Project pages cover font modding, Unicode/linguistics, RNUR, character
encodings, the portfolio, and OpenWindows-related work. Several navigation
entries are explicitly marked `IN DEV` in `index.html`.

## Preview locally

There is no package manifest or site build step. Serve the repository root
with Python:

```powershell
py -m http.server 8080
```

Open <http://localhost:8080>. The page loads Google Fonts externally, so those
fonts require network access.

### Troubleshooting: `code 400, message Bad request version`

If the browser shows nothing and the server log repeats lines like
`code 400, message Bad request version ('\x16\x03\x01...')`, the browser is
speaking **HTTPS to this plain-HTTP server** — `http.server` cannot complete a
TLS handshake, so it answers `400`. `py -m http.server` is not broken. The
upgrade comes from the browser (HTTPS-First Mode / a cached HSTS entry):

- Navigate to the explicit URL <http://localhost:8080>, including the `http://`
  scheme, rather than a bare `localhost:8080`.
- If it still upgrades, turn off **"Always use secure connections"**
  (Chrome/Edge: *Privacy and security → Security*), and clear any cached HSTS
  policy for `localhost` via `chrome://net-internals/#hsts` →
  *Delete domain security policies*.
- Firefox: set `dom.security.https_first` to `false` in `about:config`.
- Sanity check without a browser: `curl.exe http://localhost:8080/rnur.html`
  returns the page.

## GitHub Pages deployment and data sync

`.github/workflows/static.yml` publishes the entire repository root to GitHub
Pages when a commit is pushed to `main` (or the workflow is manually run).
There is no compilation or generated `dist/` directory in that workflow.

`.github/workflows/sync-unidata.yml` runs weekly or on demand. It clones
`rnur-consortium/rnur`, then invokes `scripts/sync-unidata.ps1` to update only
the `rnur/UNIDATA` mirror and opens or updates a pull request. The script is a
data mirror operation, not a build step.

## Main page groups

- `font-modding.html`, `linguistics-unicode.html`,
  `character-encodings.html`, and `rnur.html` — technical documentation.
- `my-portfolio.html`, `openwindows-related.html`, `rccr.html`, and the other
  project pages — project summaries and links.
- `rnur/` — local RNUR pages, including its index and roadmap.
- `aboutnsw.html`, `sitemap.html`, and error pages — site information and
  navigation.

No automated site test or local build command is defined in this repository.
Review links and page content in a browser before publishing.
