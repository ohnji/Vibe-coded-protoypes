# Vibe-coded prototypes

The active prototype, connected end to end:

- **`landing-page/`** — the landing page (static HTML/CSS/JS). Clicking the
  **Watch Schedule - 82nd** workspace in the left panel opens the workspace app.
- **`watch-schedule-82nd/`** — the workspace app (Vite + React).

Earlier, unconnected UI explorations live in [`archive/`](archive/) and aren't
part of the published site.

## Published site (GitHub Pages)

The `docs/` folder is the published site and is served by GitHub Pages:

- `docs/landing-page/` — built copy of the landing page
- `docs/watch-schedule-82nd/` — production build of the workspace app
- `docs/index.html` — redirects to `landing-page/`

The landing page links to the workspace via the relative path
`../watch-schedule-82nd/`, so it works both locally and once hosted.

### Enabling Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`,
   folder **/docs**.
3. The site publishes at `https://<user>.github.io/<repo>/` (opens the landing page).

### Rebuilding `docs/` after changes

```sh
cd watch-schedule-82nd && npm install && npm run build
# from repo root:
rm -rf docs && mkdir -p docs/landing-page docs/watch-schedule-82nd
cp -R landing-page/* docs/landing-page/
cp -R watch-schedule-82nd/dist/* docs/watch-schedule-82nd/
```
