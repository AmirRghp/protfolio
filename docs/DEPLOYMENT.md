# Deployment Guide & Production Operations

## 1. Deployment Architecture

The portfolio is deployed as a static Single Page Application (SPA) hosted on **GitHub Pages** (or any static hosting provider such as Vercel, Netlify, or Cloudflare Pages).

### Architecture Highlights
- **Zero Server Costs:** 100% static client-side distribution.
- **Global CDN Delivery:** Built assets are distributed via GitHub's global edge network.
- **Base Path Routing:** Configured with `base: "/protfolio/"` in `vite.config.ts` to support repository subpath hosting.

---

## 2. Production Build Pipeline

Running `npm run build` initiates the Vite production bundling process:

```bash
# Production compilation command
npm run build
```

### Build Output Structure (`dist/`)
```text
dist/
├── index.html                           # Root HTML shell
├── assets/
│   ├── index-[hash].css                 # Merged, minified styles (Tailwind / CSS Modules)
│   ├── index-[hash].js                  # Main bundle (React, Vite runtime, flat landing)
│   ├── RoomScene-[hash].js              # Asynchronously code-split 3D Three.js bundle
│   └── rolldown-runtime-[hash].js       # Chunk loader runtime
└── assets/                              # Copied static assets (GLB models, video, audio)
```

### Code Splitting Strategy
To maintain lightning-fast initial load times, the heavy Three.js room bundle (`RoomScene`) is dynamically imported (`React.lazy`). This ensures that visitors loading the site on low-bandwidth connections or deep-linking directly to `#portfolio` do not download the 3D scene until needed.

### Search Engine Optimization (SEO) & Crawler Directives
Static hosting assets include production crawler directives and rich schema metadata:
- **`public/robots.txt`**: Declares crawler permissions and points directly to the XML sitemap.
- **`public/sitemap.xml`**: Indexes canonical routes (`/protfolio/` and `/#portfolio`) with change frequencies and priority weights.
- **Structured Data (`index.html`)**: Emits JSON-LD metadata for `Person` and `WebSite` entities to optimize indexability for AI search engines and technical recruiters.

---

## 3. GitHub Actions CI/CD Pipeline

Continuous deployment is automated using GitHub Actions. Every push to the `main` branch triggers automated verification and deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy Portfolio to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Code Quality & Lint Check
        run: npm run lint

      - name: TypeScript Typecheck
        run: npm run typecheck

      - name: Run Unit Tests
        run: npm run test

      - name: Build Production Assets
        run: npm run build

      - name: Upload GitHub Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 4. Pre-Deployment Verification Checklist

Before publishing changes or tagging a new release, execute the local quality gate:

- [ ] `npm run lint` passes with 0 errors and 0 warnings.
- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm run test` executes all 40 test files (223 tests passing).
- [ ] `npm run build` completes in under 2 seconds.
- [ ] All external URLs and project GitHub repository links are verified live.
- [ ] No placeholder text, fabricated metrics, or test credentials remain in source code.
- [ ] `public/assets/` models and video files load cleanly over HTTPS without mixed-content warnings.
