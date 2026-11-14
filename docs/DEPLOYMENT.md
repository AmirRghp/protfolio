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
├── index.html                                # Root HTML shell
├── assets/
│   ├── index-[hash].css                      # Merged, minified styles (Tailwind / CSS Modules)
│   ├── index-[hash].js                       # Main application bundle (~594 kB / ~161 kB gzip)
│   ├── vendor-react-[hash].js                # React 19 & React DOM vendor chunk (~401 kB / ~122 kB gzip)
│   ├── vendor-three-core-[hash].js           # Tree-shaken Three.js core engine (~737 kB / ~187 kB gzip)
│   ├── vendor-r3f-[hash].js                  # React Three Fiber reconciler (~324 kB / ~98 kB gzip)
│   ├── vendor-motion-[hash].js               # Motion & GSAP animation engines (~219 kB / ~79 kB gzip)
│   ├── vendor-three-addons-[hash].js         # Three.js loaders & post-processing (~72 kB / ~19 kB gzip)
│   ├── RoomScene-[hash].js                   # Asynchronously code-split 3D room scene (~59 kB / ~16 kB gzip)
│   ├── pixel-run-[hash].js                   # Lazy-loaded Pixel Run arcade cartridge (~33 kB / ~10 kB gzip)
│   ├── cyber-flappy-[hash].js                # Lazy-loaded Cyber Flappy arcade cartridge (~27 kB / ~8 kB gzip)
│   ├── cyber-tetris-[hash].js                # Lazy-loaded Cyber Tetris arcade cartridge (~23 kB / ~7 kB gzip)
│   ├── snake-grid-[hash].js                  # Lazy-loaded Snake Grid arcade cartridge (~16 kB / ~6 kB gzip)
│   ├── deparkanoid-[hash].js                 # Lazy-loaded Deparkanoid arcade cartridge (~14 kB / ~5 kB gzip)
│   ├── arcadeTimeStep-[hash].js              # Shared refresh-rate-invariant physics helper (~2.4 kB)
│   └── rolldown-runtime-[hash].js            # Chunk loader runtime
└── assets/                                   # Optimized static assets (GLB models, WebP project art, WebM video, MP3 audio)
```

### Code Splitting & Asset Optimization Strategy
1. **Granular Vendor & Feature Chunking (`vite.config.ts`):** Rolldown `output.codeSplitting.groups` isolates long-lived vendor dependencies (`vendor-react`, `vendor-three-core`, `vendor-r3f`, `vendor-motion` including Motion & GSAP, `vendor-three-addons`) from application logic, keeping the entry `index-[hash].js` chunk well under the `800 kB` threshold (`~594 kB` / `~161 kB` gzip) and maximizing browser HTTP cache hit rates across deployments.
2. **Lazy 3D Scene & Arcade Cartridges (`React.lazy`):** Both the 3D room scene (`RoomScene`) and all 5 built-in HTML5 Canvas arcade games (`Deparkanoid`, `SnakeGame`, `FlappyGame`, `TetrisGame`, `PixelRunGame`) are dynamically imported on demand. Visitors browsing the portfolio never download arcade game engines until they launch a cartridge.
3. **Tree-Shaken Three.js Imports:** `Lanyard.tsx` and `RoomScene.tsx` use explicit named imports from `"three"` rather than wildcard namespace imports (`import * as THREE`), enabling dead-code elimination of unused Three.js geometries, loaders, and helpers.
4. **Compressed GLB Embedded Textures & Deferred Media Preloading:** Oversized embedded textures inside `.glb` assets (`arcade-machine.glb`, `cup.glb`, `oiia-cat.glb`, `compact-keyboard.glb`) are compressed and Downsampled to match their in-scene screen footprint, cutting total 3D model payload by **3.27 MB** (`6.76 MB` $\to$ `3.49 MB`). Furthermore, `oiia-spinning-cat.mp3` (`2.6 MB` $\to$ `1.3 MB`) uses `preload="none"` and `ascii-room.webm` uses deferred `preload="metadata"`, saving over **4.2 MB** of initial network bandwidth on first page load.

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
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 4. Pre-Deployment Verification Checklist

Before publishing changes or tagging a new release, execute the local quality gate:

- [ ] `npm run lint` passes with 0 errors and 0 warnings.
- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm run test` executes all 51 test files (300 tests passing).
- [ ] `npm run build` completes in under 2 seconds.
- [ ] All external URLs and project GitHub repository links are verified live.
- [ ] No placeholder text, fabricated metrics, or test credentials remain in source code.
- [ ] `public/assets/` models and video files load cleanly over HTTPS without mixed-content warnings.
