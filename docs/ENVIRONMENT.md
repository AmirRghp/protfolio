# Environment Configuration & System Requirements

## 1. Local Development Environment

The project is configured for modern JavaScript/TypeScript runtimes with strict Node version constraints.

### Prerequisites & Supported Versions
- **Node.js:** Supported LTS versions: `^22.12.0 || ^24.0.0 || ^26.0.0`
- **Package Manager:** `npm` version 10 or newer (or compatible modern `pnpm`/`yarn`)
- **Operating System:** Cross-platform (Windows, macOS, Linux)

---

## 2. Configuration & Build Tooling

### 2.1. Vite Bundler Setup (`vite.config.ts`)
```typescript
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/protfolio/", // Matches GitHub Pages deployment repository subpath
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), // Canonical path alias for clean imports
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

### 2.2. TypeScript Strictness (`tsconfig.json`)
The project enforces strict compiler settings:
- `"strict": true` (No implicit any, strict null checks)
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`
- `"verbatimModuleSyntax": true`
- `"baseUrl": "."` with `"paths": { "@/*": ["src/*"] }`

---

## 3. Package Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on `http://localhost:5173/protfolio/` |
| `npm run build` | Compiles TypeScript and builds optimized production bundle into `dist/` |
| `npm run preview` | Locally serves the production `dist/` bundle |
| `npm run typecheck` | Executes `tsc --noEmit` to verify type safety across source and tests |
| `npm run lint` | Runs ESLint across `src/`, `tests/`, and config files |
| `npm run test` | Executes all 49 unit and integration test suites (286 tests) via Vitest |
| `npm run test:e2e` | Builds the application and executes the Playwright Chromium test suite |

---

## 4. Client Hardware & Browser Requirements

The application runs purely client-side without any backend database or microservice dependencies.

### Minimum Client Specifications
- **Display Resolution:** Responsive from `320px` up to `4K` displays (`3840px`).
- **GPU Acceleration:** Dedicated or integrated GPU supporting **WebGL2** and floating-point textures.
- **Audio:** Browser support for the **Web Audio API** (`AudioContext`).
- **Touch / Pointer:** Pointer Events API (Level 2) with support for simultaneous mouse and touch interactions.

### Browser Compatibility Matrix
| Browser | Minimum Version | Notes |
| :--- | :--- | :--- |
| **Google Chrome / Chromium** | 120+ | Recommended; optimal WebGL2 and audio performance |
| **Mozilla Firefox** | 120+ | Supported; full WebGL2 and Canvas compatibility |
| **Apple Safari** | 17+ | Supported; requires standard user gesture to unlock audio |
| **Microsoft Edge** | 120+ | Supported via Chromium engine |

---

## 5. Third-Party API & Network Constraints

### GitHub Contributions API (Public Contribution Fetcher)
- **Endpoint:** `https://github-contributions-api.jogruber.de/v4/AmirRghp?y=last`
- **Rate Limiting & Retry Cooldown:** Unauthenticated public requests are cached and protected by a 60-second failure retry cooldown (`FAILURE_RETRY_COOLDOWN_MS`) to prevent redundant network requests when offline.
- **Resilience Strategy:**
  1. Responses are cached in browser `localStorage` under `portfolio_github_contributions_v1` with a 4-hour time-to-live (TTL).
  2. If the request fails, times out, or is rate-limited, the client transparently switches to stale cache or the bundled offline fallback dataset (`src/data/githubContributionsFallback.json`).
  3. No network errors are surfaced to the user.
