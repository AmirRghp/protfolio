# Amirreza Gholipour — 3D Cyberpunk & Flat Portfolio

An interactive, dual-experience developer portfolio for **Amirreza Gholipour**, **AI Engineer** (Machine Learning Engineer · M.Sc. in Artificial Intelligence & Robotics).

The project blends an immersive, nocturnal cyberpunk 3D workspace built with **Three.js** and **React Three Fiber** with a lightweight, high-performance, WCAG-compliant **2D Flat Landing** portfolio featuring WebGL2 refractive optical glass tactile buttons, an interactive liquid grid, and a 3D GitHub contribution city skyline.

---

## 🌟 Key Experiences

### 1. 3D Hero Room (`RoomScene`)
- **Aesthetic:** Nocturnal cyberpunk workspace (`#080614`) illuminated by cyan (`#00e5ff`) and magenta (`#d946ef`) dual under-shelf LEDs.
- **Interactive Curved Monitor:** Houses an in-engine virtual desktop OS with draggable windows, a live status bar, and a 52-week GitHub contribution ring.
- **Retro Arcade Cabinet:** Playable mini-arcade running 5 built-in Canvas mini-games (*Cyber Flappy*, *Cyber Tetris*, *Pixel Run*, *Snake Grid*, and *Deparkanoid*) plus a sandboxed external demo (*Crash Bandicoot* via PS1FUN).
- **Interactive Props:** Musical Oiia Cat, steaming coffee mug, mechanical keyboard, Batman collectible, and smooth camera navigation hot-spots with keyboard shortcuts (`1`/`M` for Monitor, `2`/`A` for Arcade, `Esc` to return).
- **Lanyard Gateway:** Interactive 3D holographic badge (`LanyardIntro`) with pull kinematics and instant skip (`Enter` / `Space` / `Esc`).

### 2. 2D Flat Landing (`FlatLanding`)
- **Instant Accessible Navigation:** Direct URL hash `#portfolio` or transition through the sleek black `ExitBar` ("Exit The Room") with WebGL2 refractive glass buttons (`TactileButton`).
- **Interactive Elements:** Nocturnal `LiquidGrid` canvas backdrop, `MagicCursor`, and dynamic role cycling.
- **GitHub Contribution Skyline:** Visualizes annual commit activity as an isometric 3D procedural skyline ("As a city") with live caching and offline fallback.
- **Categorized Showcase:** Filtered project highlights powered by Arc UI spring tabs (`@uiarc/tabs`).
- **Seamless Return:** One-click re-entry to the 3D room anytime.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Framework & Language** | React 19, TypeScript (Strict), Vite 8 |
| **3D Graphics & Physics** | Three.js 0.186, React Three Fiber 9 |
| **Animation & Motion** | Motion (`motion/react`), Spring Kinematics |
| **Tactile UI** | `tactile-glass-ui` (WebGL2 Refractive Optical Glass) |
| **Testing & Quality** | Vitest 5, Playwright 1.64, ESLint 10, TypeScript 6 |

---

## 📂 Project Architecture

The codebase follows a modular, feature-first architecture under `src/`:

```
src/
├── core/                  # Shared types, math utilities, and tactile UI primitives
│   ├── components/        # ExitBar, MagicCursor, Arc UI tabs
│   ├── types/             # Point, Dimensions, ViewportSize, RaycastTarget
│   └── utils/             # assetUrl, webglUtils, math helpers
├── data/                  # Static records and external API handlers
│   ├── content.ts         # Career records, skills, and project highlights
│   └── githubContributions.ts # 52-week GitHub API fetcher with localStorage TTL
├── features/              # Self-contained domain modules
│   ├── arcade/            # Arcade cabinet, CRT DLT projection & 5 Canvas games
│   ├── landing/           # 2D Flat landing, LiquidGrid, GitHub skyline
│   ├── lanyard/           # 3D Holographic badge and pull-to-enter gateway
│   ├── monitor/           # Virtual desktop OS, window manager & desktop apps
│   └── room/              # 3D Three.js scene, camera interpolator & props
├── App.tsx                # Dual-experience root router and hash sync
├── main.tsx               # Client entry point
└── style.css              # Global styles and design tokens
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js:** `^22.12.0`, `^24.0.0`, or `^26.0.0`
- **Package Manager:** `npm` (bundled with Node.js)

### Installation & Local Development
```sh
# Clone repository
git clone https://github.com/amirreza/portfolio.git
cd portfolio

# Install dependencies
npm ci

# Start local development server with Vite
npm run dev
```

### Production Build & Preview
```sh
# Compile TypeScript and generate optimized static build
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Verification & Testing Pipeline

To ensure maximum runtime stability, visual fidelity, and accessibility compliance, run the test and verification suites:

```sh
# 1. Run all unit and integration tests (Vitest)
npm run test

# 2. Verify complete TypeScript compilation
npm run typecheck

# 3. Lint codebase and enforce React hook rules
npm run lint

# 4. Run end-to-end browser tests across viewports (Playwright)
npm run test:e2e
```

---

## 📚 Canonical Documentation

For detailed architectural decisions, design tokens, error fallbacks, and engineering specifications, consult the canonical documentation in [`docs/`](docs/):

| Document | Purpose |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product Requirements, Core Features, Personas, and Non-Functional Specs |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System Architecture, Feature Modules, and 3D Projection Math |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Nocturnal Palette (`#080614`), Typography, Spacing, and Motion Tokens |
| [`docs/UX_FLOWS.md`](docs/UX_FLOWS.md) | Interactive State Machines, Portal Transitions, and User Journeys |
| [`docs/TESTING.md`](docs/TESTING.md) | Testing Pyramid, 40 Vitest Suites, and Playwright E2E Configurations |
| [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) | Node/Vite Configuration, Client Requirements, and GitHub API Caching |
| [`docs/ERROR_HANDLING.md`](docs/ERROR_HANDLING.md) | Resilience, WebGL Context Loss Recovery, and Iframe Fallbacks |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Static Hosting, Dynamic Code-Splitting, and GitHub Actions CI/CD |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Architecture Decision Records (ADRs 001–008) |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Semantic Release Notes and Version History |
| [`AGENTS.md`](AGENTS.md) | AI Agent Guardrails, Coding Standards, and Local Skills Directory |

---

## 📜 Attributions & Licenses

- 3D models and digital assets are properly licensed under Creative Commons or open-source licenses. Detailed sources, creator attributions, and license agreements are documented in [`public/assets/models/ATTRIBUTION.md`](public/assets/models/ATTRIBUTION.md).
- Open-source software licenses and third-party notices are maintained in [`docs/THIRD_PARTY_NOTICES.md`](docs/THIRD_PARTY_NOTICES.md).
