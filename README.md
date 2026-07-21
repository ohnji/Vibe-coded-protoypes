# Vibe-coded prototypes

A set of UI prototypes. The two connected here:

- **`ops-workspace-agent/`** — the landing page (static HTML/CSS/JS). Clicking the
  **Watch Schedule - 82nd** workspace in the left panel opens the workspace app.
- **`ops-workspace-blueprint/`** — the workspace app (Vite + React).

## Published site (GitHub Pages)

The `docs/` folder is the published site and is served by GitHub Pages:

- `docs/agent/` — built copy of the landing page
- `docs/blueprint/` — production build of the workspace app
- `docs/index.html` — redirects to `agent/`

The landing page links to the workspace via the relative path `../blueprint/`, so
it works both locally and once hosted.

### Enabling Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`,
   folder **/docs**.
3. The site publishes at `https://<user>.github.io/<repo>/` (opens the landing page).

### Rebuilding `docs/` after changes

```sh
cd ops-workspace-blueprint && npm install && npm run build
# from repo root:
rm -rf docs && mkdir -p docs/agent docs/blueprint
cp -R ops-workspace-agent/* docs/agent/
cp -R ops-workspace-blueprint/dist/* docs/blueprint/
```
