# Sales CRM Dashboard — Conrad

A ClickUp-style CRM dashboard for the Sales CRM (Conrad) pipeline. React + Vite. Deploys to Cloudflare Pages free tier.

## Views
- **List** — leads grouped by stage with inline editing
- **Board** — drag-and-drop kanban
- **Dashboard** — pipeline funnel, KPIs, hot deals, overdue alerts

Everything is editable inline. Data lives in browser memory only (no backend). Each lead links out to its real ClickUp task.

---

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

Build for production:

```bash
npm run build
```

Output lands in `dist/`.

---

## Deploy to Cloudflare Pages (free)

You've got two paths. Pick one.

### Option A — Drag-and-drop the built folder (fastest)

1. Run `npm install && npm run build` locally.
2. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages → **Upload assets**.
3. Give the project a name (e.g. `sales-crm-conrad`).
4. Drag the entire `dist/` folder into the upload area.
5. Click Deploy. You get a `*.pages.dev` URL in ~30 seconds.

Every time you want to update, rebuild and re-upload `dist/`.

### Option B — Git-connected auto-deploy (recommended)

1. Push this folder to a GitHub / GitLab repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → **Connect to Git**.
3. Pick the repo.
4. Configure the build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(leave blank)*
   - **Node version:** 20 (add env var `NODE_VERSION` = `20` if it defaults lower)
5. Save and deploy.

Now every `git push` triggers a rebuild + auto-deploy. Preview deployments happen per-branch too.

---

## Custom domain

In the Cloudflare Pages project → Custom domains → Set up a domain. If your domain is on Cloudflare already, DNS is one click. Otherwise add the CNAME they show you.

---

## Cost

Free tier: 500 builds/month, unlimited requests, unlimited bandwidth. This project is well under those limits.

---

## Data persistence

Right now data is in-memory only — refreshing the page resets any edits back to the seeded ClickUp snapshot. For persistence, wire up either:

- **Cloudflare KV / D1** (still free tier) via a small Pages Function
- **Direct ClickUp API write-back** using the ClickUp v2 REST API with a personal API token — needs a proxy Function to hide the token

Ask if you want either wired up.
