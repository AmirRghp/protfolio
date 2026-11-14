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
  - Scene anchors: Curved monitor center on a deep tabletop (`z = -0.9` to `3.8`), mechanical keyboard, optical mouse, neon-bordered mousepad, steaming coffee mug, musical Oiia Cat, Batman collectible on the lower shelf, and retro arcade machine recessed into the right desk cutout (`x = 2.96`).
  - No computer tower, floor, side walls, baseboards, chairs, desk legs, plants, or wall art.
- **Dual-Experience Flat Landing (`FlatLanding`):**
  - Reached via the sleek black `ExitBar` (`#000000`) with a WebGL2 refractive `TactileButton` ("Exit The Room") or direct `#portfolio` / `#arcade` URL hashes.
  - Features a digital laser portal transition, full-bleed ASCII room loop video (`public/assets/ascii-room.webm`), interactive nocturnal `LiquidGrid` canvas, `MagicCursor`, `DynamicText` role cycling, a responsive **Selected Work** showcase (`DomeGallery` 3D GSAP paraboloid dome on desktop/tablet `>= 768px` with touch axis-locking and top-left `Selected Work` pill badge; `MobileWorkGrid` 2-to-1 card grid on `< 768px` with inner-card captions and compact non-scrolling `ProjectModal` with top-right image close button), Arc UI spring tabs (`@uiarc/tabs`) with an **Agent Harness** category, and a 3D isometric GitHub contribution skyline ("As a city").
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

These are real copies under `.agents/skills/`, not symlinks. Open the exact local path in this table; do not assume a same-named user/plugin skill is overridden automatically. Preserve original names; select by path when duplicates appear.

| Task | Primary entrypoint | Read only when needed |
| --- | --- | --- |
| Context/handoffs | `.agents/skills/context-engineering/SKILL.md` | active plan and actual source |
| Planning | `.agents/skills/planning-and-task-breakdown/SKILL.md` | `.agents/skills/writing-plans/SKILL.md` |
| Small complete changes | `.agents/skills/ponytail/SKILL.md` | `.agents/skills/code-simplification/SKILL.md` |
| Library/API facts | `.agents/skills/source-driven-development/SKILL.md` | `.agents/skills/context7-mcp/SKILL.md` |
| UI implementation | `.agents/skills/frontend-ui-engineering/SKILL.md` | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Reference fidelity | `.agents/skills/frontend-design/SKILL.md` | `.agents/skills/impeccable/SKILL.md` |
| Interaction/motion | `.agents/skills/emil-design-eng/SKILL.md` | `.agents/skills/gsap-core/SKILL.md`, `.agents/skills/gsap-react/SKILL.md`, `.agents/skills/gsap-timeline/SKILL.md` |
| Motion review | `.agents/skills/review-animations/SKILL.md` | `.agents/skills/gsap-performance/SKILL.md` |
| Behavior/regressions | `.agents/skills/test-driven-development/SKILL.md` | `.agents/skills/verification-before-completion/SKILL.md` |
| Browser verification | `.agents/skills/browser-testing-with-devtools/SKILL.md` | available browser tools; disclose unsupported capabilities |
| Change review | `.agents/skills/code-review-and-quality/SKILL.md` | `.agents/skills/ponytail-review/SKILL.md` |
| Durable decisions/copy | `.agents/skills/documentation-and-adrs/SKILL.md` | `.agents/skills/no-ai-slop/SKILL.md` and its `eval.md` |
| Git | `.agents/skills/git-workflow-and-versioning/SKILL.md` | only authorized Git operations |
| Measured performance | `.agents/skills/performance-optimization/SKILL.md` | scene profiler and measured before/after results |
| Tactile Glass UI | `.agents/skills/tactile-glass-ui/SKILL.md` | WebGL2 refractive optical glass buttons |

### Skill Usage Rules
- Choose one primary skill and the supporting references actually needed. Load supporting references progressively. Do not invoke every skill simultaneously or duplicate planning workflows merely because a skill suggests them.
- Copied skills provide guidance, not proof that their examples or API claims match installed library versions. Always verify version-sensitive syntax against installed package declarations in `package.json`.
- In particular, `<dialog open>` is not a modal focus trap: use `showModal()` or an established accessible primitive and test focus behavior.
- Context7 and browser skills require available external tools; if a tool is unavailable, use official documentation through an available read-only tool and record the fallback.

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
