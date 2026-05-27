# CPS Dashboard

Personal command-post dashboard for tracking job applications, projects, Claude usage, and weekly trends. Built with React, Vite, Tailwind CSS, and Recharts.

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages (GitHub Auto-Deploy)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/cps-dashboard.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Select the `cps-dashboard` repository
3. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 18 (set via Environment variable `NODE_VERSION` = `18`)
4. Click **Save and Deploy**

Every push to `main` will trigger an automatic deploy. Preview URLs are generated for pull requests.

### 3. Custom Domain (optional)

In the Cloudflare Pages project settings → **Custom domains** → add your domain (e.g., `dashboard.claytonparkswim.com`). DNS is configured automatically if the domain is on Cloudflare.

## Stack

- **React 19** + **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Recharts** for bar charts
- **localStorage** for all data persistence (no backend required)
