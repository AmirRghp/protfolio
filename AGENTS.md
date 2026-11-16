# Portfolio Project Instructions & AI Agent Guidelines

## 1. Start Here

1. **Read this file first** and inspect the actual `git status --short --branch`.
2. **Consult the canonical documentation in `docs/`:**
   - [`docs/PRD.md`](docs/PRD.md): Product Requirements, Core Features, Personas, and Non-Functional Specs.
   - [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md): Visual Language, Nocturnal Palette, Typography, and Motion Tokens.
   - [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): System Architecture, Feature Modules, and 3D Projection Math.
   - [`docs/TESTING.md`](docs/TESTING.md): Testing Pyramid, Vitest Suites, and Playwright E2E Configurations.
   - [`docs/UX_FLOWS.md`](docs/UX_FLOWS.md): Interactive State Machines, Portal Transitions, and User Journeys.
   - [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md): Node/Vite Configuration, Client Requirements, and GitHub API Caching.
   - [`docs/ERROR_HANDLING.md`](docs/ERROR_HANDLING.md): Resilience, WebGL Context Loss, and Iframe Fallbacks.
   - [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): Static Hosting, CI/CD Actions Workflow, and Code-Splitting.
   - [`docs/DECISIONS.md`](docs/DECISIONS.md): Architecture Decision Records (ADRs).
   - [`docs/CHANGELOG.md`](docs/CHANGELOG.md): Historical Release Notes & Version Log.
3. Read only the source files, tests, and local skill entrypoints relevant to your specific scoped task.

---

## 2. Product Decisions & Core Guardrails

- **Candidate Identity & Role:** English personal portfolio for **Amirreza Gholipour**, current role **AI Engineer** (Machine Learning Engineer · M.Sc. in Artificial Intelligence & Robotics).
- **Strict Non-Fabrication Rule:** Absolutely no fabricated metrics, invented project outcomes, or simulated testimonials.
- **Daraei360 Past Roles:**
  - *AI Engineer:* October 2025 – May 2026.
  - *Product Manager:* May 2026 – September 2026.
  - *Crucial:* Do **not** present either past role as current.
- **Entry Lanyard Gateway (`LanyardIntro`):** Interactive 3D holographic lanyard badge (`/assets/lanyard-photo.webp`) featuring downward pull kinematics and instant keyboard/button skips (`Enter`, `Space`, `Escape`).
- **3D Hero Room (`RoomScene`):**
  - Full-screen Hero (`100svh`, `overflow: hidden`) featuring a nocturnal cyberpunk aesthetic (`#080614`) with cyan (`#00e5ff`) and magenta (`#d946ef`) dual under-shelf LED illumination.
  - Scene anchors: Curved monitor center on a deep tabletop (`z = -0.9` to `3.8`), mechanical keyboard, optical mouse, neon-bordered mousepad, steaming coffee mug, musical Oiia Cat, Batman collectible on the lower shelf, and retro arcade machine positioned beside the right desk edge (`x = 4.495`).
  - No computer tower, floor, side walls, baseboards, chairs, desk legs, plants, or wall art.
- **Dual-Experience Flat Landing (`FlatLanding`):**
  - Reached via the sleek black `ExitBar` (`#000000`) with a WebGL2 refractive `TactileButton` ("Exit The Room") or direct `#portfolio` / `#arcade` URL hashes.
  - Features a digital laser portal transition, full-bleed ASCII room loop video (`public/assets/ascii-room.webm`), interactive nocturnal `LiquidGrid` 2D wave-solver canvas, `MagicCursor`, `DynamicText` role cycling, a responsive **Selected Work** showcase (`DomeGallery` 3D GSAP paraboloid dome on desktop/tablet `>= 768px` with touch axis-locking and top-left `Selected Work` pill badge; `MobileWorkGrid` 2-to-1 card grid on `< 768px` with inner-card captions and compact non-scrolling `ProjectModal` with top-right image close button), Arc UI spring tabs (`@radix-ui/react-tabs` + `motion/react`) with an **Agent Harness** category, and a 3D isometric GitHub contribution skyline ("As a city").
  - Seamless re-entry to the 3D room via "Re-enter" and "Enter The Room" glass buttons.
- **Arcade Cabinet & Playable Mini-Games:**
  - 5 built-in original HTML5 Canvas games: *Cyber Flappy*, *Cyber Tetris*, *Pixel Run*, *Snake Grid*, and *Deparkanoid*.
  - *Crash Bandicoot:* Sandboxed demo via PS1FUN iframe with an 8-second timeout, direct external fallback link, and exit button permanently positioned outside the frame. Never copy commercial ROMs.

---

## 3. Technology Stack & Code Organization

- **Stack:** React 19 + TypeScript + Vite 8 + Three.js 0.186 + React Three Fiber 9.
- **State Architecture:** Pure client-side React state and reducers. No Redux, Zustand, router packages, or runtime backend. Local project data in `src/data/content.ts` and public GitHub contribution stats in `src/data/githubContributions.ts` (cached in `localStorage` with a 4-hour TTL and bundled offline fallback).
- **Directory Structure:**
  - `src/core/`: Canonical types (`Point`, `Dimensions`, `ViewportSize`), pure utilities (`assetUrl`, `webglUtils`, `utils`), and shared UI primitives.
  - `src/data/`: Content records, resume items, and GitHub API handlers.
  - `src/features/arcade/`: Arcade cabinet interface and isolated mini-games.
  - `src/features/monitor/`: Virtual desktop OS, window manager, and desktop applications.
  - `src/features/room/`: 3D scene graph, camera interpolator, props, and ambient audio.
  - `src/features/lanyard/`: Holographic badge and pull-to-enter gateway.
  - `src/features/landing/`: 2D flat landing portfolio, liquid grid, and GitHub skyline.
- **Path Aliasing:** Use the `@/*` alias for all cross-module imports (mapped to `src/*`).

---

## 4. Repository-Local Skills

These 25 skills are verbatim copies under `.agents/skills/` (not symlinks). Open the exact local path below; do not assume a same-named user/plugin skill overrides them automatically.

### Vendored Skills Inventory

| Skill | Path | Role in This Project |
| --- | --- | --- |
| `context-engineering` | `.agents/skills/context-engineering/SKILL.md` | Curate session context across `AGENTS.md`, `docs/`, and active feature modules without context bloat |
| `concise-planning` | `.agents/skills/concise-planning/SKILL.md` | Turn non-trivial tasks into atomic, scope-bounded checklists with explicit verification steps |
| `codebase-design` | `.agents/skills/codebase-design/SKILL.md` | Keep `src/core/`, `src/data/`, and `src/features/*` cleanly decoupled via deep modules and seams |
| `react-best-practices` | `.agents/skills/react-best-practices/SKILL.md` | Optimize React 19 re-renders, transient `useRef` values, passive listeners, and dynamic imports (ignore `server-*` rules; client-only SPA) |
| `typescript-pro` | `.agents/skills/typescript-pro/SKILL.md` | Enforce strict TypeScript 6 types, generics, and contracts across 3D math, Canvas games, and React props |
| `frontend-design` | `.agents/skills/frontend-design/SKILL.md` | Craft distinctive UI free of generic AI tropes while adhering to `docs/DESIGN_SYSTEM.md` |
| `better-accessibility` | `.agents/skills/better-accessibility/SKILL.md` | WCAG 2.2 AA compliance: `320px` reflow, APG keyboard/focus traps, single-pointer drag alternatives, `prefers-reduced-motion` |
| `3d-web-experience` | `.agents/skills/3d-web-experience/SKILL.md` | Three.js / R3F scenes, GLB compression, GSAP + 3D integration, mobile DPR budgeting, and WebGL fallbacks |
| `emil-design-eng` | `.agents/skills/emil-design-eng/SKILL.md` | Spring physics, pointer-capture drag, GPU-only transforms, Safari blur caveats, and motion review |
| `shader-programming-glsl` | `.agents/skills/shader-programming-glsl/SKILL.md` | Vertex/fragment GLSL shaders for `GradientWaves`, `Lanyard`, and optical WebGL effects |
| `web-games` | `.agents/skills/web-games/SKILL.md` | HTML5 Canvas game loops, hybrid DOM + Canvas handheld UI (`MobileArcadeModal`), Web Audio unlock, and teardown |
| `tactile-glass-ui` | `.agents/skills/tactile-glass-ui/SKILL.md` | WebGL2 refractive optical glass `TactileButton` integration in `ExitBar` and `FlatLanding` |
| `test-driven-development` | `.agents/skills/test-driven-development/SKILL.md` | Red-green-refactor workflow and regression tests for Vitest suites |
| `browser-automation` | `.agents/skills/browser-automation/SKILL.md` | Reliable `@playwright/test` E2E checks using semantic locators and bounded waits across target viewports |
| `browser-testing-with-devtools` | `.agents/skills/browser-testing-with-devtools/SKILL.md` | Live DOM, console, network, screenshot, and performance trace verification via `chrome-devtools-mcp` |
| `diagnosing-bugs` | `.agents/skills/diagnosing-bugs/SKILL.md` | Tight feedback-loop root-cause debugging for WebGL, compositor, and state-machine regressions |
| `verification-before-completion` | `.agents/skills/verification-before-completion/SKILL.md` | Require fresh command evidence (`test`, `typecheck`, `lint`, `build`) before claiming completion |
| `clean-code-guard` | `.agents/skills/clean-code-guard/SKILL.md` | SOLID, DRY, KISS, YAGNI, and LLM-failure-mode guard pass on generated or modified code |
| `andrej-karpathy` | `.agents/skills/andrej-karpathy/SKILL.md` | Surgical diffs, surfacing assumptions, and preventing speculative abstractions or overengineering |
| `five-axis-code-review` | `.agents/skills/five-axis-code-review/SKILL.md` | Line-referenced diff review across correctness, security, readability, performance, and tests |
| `security-best-practices` | `.agents/skills/security-best-practices/SKILL.md` | React/TS client security (`srcDoc` iframe sandboxing, Markdown sanitization, `postMessage` origin checks) |
| `web-performance-optimization` | `.agents/skills/web-performance-optimization/SKILL.md` | Core Web Vitals (LCP/INP/CLS), Vite bundle splitting, caching, and media/asset optimization |
| `git-workflow-and-versioning` | `.agents/skills/git-workflow-and-versioning/SKILL.md` | Atomic commits, safe branching, and clean diff hygiene (only when Git actions are authorized) |
| `documentation-and-adrs` | `.agents/skills/documentation-and-adrs/SKILL.md` | Capture architectural *why* and trade-offs in `docs/DECISIONS.md` and keep `docs/` synced with code |
| `writing-for-agents` | `.agents/skills/writing-for-agents/SKILL.md` | Keep `AGENTS.md` and technical documentation concise, high-signal, and free of filler |

### Task-to-Skill Decision Matrix

| Task Type | Primary Skill | Supporting Skills (Load Only When Needed) |
| --- | --- | --- |
| **Planning** | `.agents/skills/concise-planning/SKILL.md` | `.agents/skills/codebase-design/SKILL.md`, `.agents/skills/context-engineering/SKILL.md` |
| **Implementation (React / TS)** | `.agents/skills/react-best-practices/SKILL.md` | `.agents/skills/typescript-pro/SKILL.md`, `.agents/skills/andrej-karpathy/SKILL.md` |
| **Implementation (UI / Motion)** | `.agents/skills/emil-design-eng/SKILL.md` | `.agents/skills/frontend-design/SKILL.md`, `.agents/skills/better-accessibility/SKILL.md`, `.agents/skills/tactile-glass-ui/SKILL.md` |
| **Implementation (3D / Games / Shaders)** | `.agents/skills/3d-web-experience/SKILL.md` | `.agents/skills/shader-programming-glsl/SKILL.md`, `.agents/skills/web-games/SKILL.md` |
| **Debugging** | `.agents/skills/diagnosing-bugs/SKILL.md` | `.agents/skills/browser-testing-with-devtools/SKILL.md` |
| **Testing & Browser Checks** | `.agents/skills/test-driven-development/SKILL.md` | `.agents/skills/browser-automation/SKILL.md`, `.agents/skills/browser-testing-with-devtools/SKILL.md`, `.agents/skills/verification-before-completion/SKILL.md` |
| **Review, Security & Perf** | `.agents/skills/five-axis-code-review/SKILL.md` | `.agents/skills/clean-code-guard/SKILL.md`, `.agents/skills/security-best-practices/SKILL.md`, `.agents/skills/web-performance-optimization/SKILL.md` |
| **Docs & Git** | `.agents/skills/documentation-and-adrs/SKILL.md` | `.agents/skills/writing-for-agents/SKILL.md`, `.agents/skills/git-workflow-and-versioning/SKILL.md` |

### Precedence, Progressive Disclosure & Guardrails
- **Progressive Disclosure:** Read a vendored skill's `SKILL.md` (and only the specific companion files needed) *only* when executing a matching task — never preload all 25 skills on session start.
- **Precedence Rules:**
  1. Project rules in `AGENTS.md` and canonical specs in `docs/` always override generic skill defaults (e.g., ignore SSR/Next.js guidance in `react-best-practices`).
  2. `better-accessibility` and `security-best-practices` override aesthetic novelty; `tactile-glass-ui` governs refractive `TactileButton` usage over generic button styling.
  3. `andrej-karpathy` and `clean-code-guard` govern scope and surgical simplicity over speculative abstractions.
- **Anti-Hallucination, Anti-Slop & Verification:** Inspect `docs/ARCHITECTURE.md` and `package.json` before designing or editing; never invent library APIs, metrics, or test results; avoid generic AI UI/copy tropes; run the Section 6 verification pipeline before claiming completion.
- **Browser & Focus Discipline:** `<dialog open>` is not a modal focus trap — use `showModal()`, Radix primitives, or `src/core/utils/focusTrap.ts` and verify focus behavior. Browser skills require available tools (`@playwright/test` or `chrome-devtools-mcp`); disclose any unrun check explicitly.

---

## 5. Quality, Permissions & Engineering Standards

- **Read Before Modifying:** Read callers and related tests before altering shared interfaces or behavior. Finish complete scoped tasks; avoid speculative, unrelated refactors.
- **Prefer Existing Dependencies:** Solve tasks using platform features, React built-ins, and installed dependencies. Do not install new packages without explicit user authorization.
- **Accessibility & Fallbacks:** Keep textual content fully accessible via semantic HTML without navigating the 3D scene. Ensure the external return button remains reachable when focus is trapped in an embedded frame. Respect `prefers-reduced-motion`.
- **Responsive Target Widths:** Test and verify layouts across 5 primary viewports: `320px`, `375px`, `768px`, `1024px`, and `1440px`.
- **Git & Safety Boundaries:** Do not commit, push, create remotes, publish, modify global configuration, or execute external side-effectful workflows without explicit user consent. Work in this checkout as approved.

---

## 6. Verification Pipeline

Before completing any task, execute and confirm the full verification suite:

```bash
# 1. Run all unit and integration tests (must pass with 0 failures)
npm run test

# 2. Verify complete TypeScript compilation soundness
npm run typecheck

# 3. Check code style, React hook dependencies, and ESLint rules
npm run lint

# 4. Verify production bundle build and code splitting
npm run build
```

Every claim that work is complete must be backed by actual command execution logs.
