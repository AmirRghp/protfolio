# Architecture Decision Records (ADRs)

This document records the foundational architecture decisions, trade-offs, and design rationales guiding the development of Amirreza Gholipour's portfolio.

---

## ADR-001: Pure Client-Side SPA with React 19, Vite & Three.js

- **Status:** Accepted
- **Date:** October 2026
- **Context:**
  The portfolio requires fast loading, interactive 3D WebGL scenes, complex physics animations, and zero ongoing server maintenance costs. Full-stack frameworks (such as Next.js or Remix) introduce server-side rendering (SSR) hydration complexities with Three.js canvas lifecycles and require active hosting backends.
- **Decision:**
  Build as a pure static Single Page Application (SPA) using React 19, TypeScript, Vite, Three.js, and React Three Fiber, deployed entirely on static CDN infrastructure (GitHub Pages).
- **Consequences:**
  - *Positive:* Zero server hosting fees, instant global CDN delivery, simple deployments, and zero hydration mismatches between WebGL and DOM.
  - *Negative:* Dynamic server-rendered meta tags per project route are not available; handled via static OpenGraph metadata in `index.html`.

---

## ADR-002: Feature-Driven Modular Architecture (`features/`, `core/`, `data/`)

- **Status:** Accepted
- **Date:** November 2026
- **Context:**
  The initial codebase had over 80 files dumped flat into the root of `src/`, mixing 3D room props, arcade game loops, monitor desktop apps, audio synthesizers, and landing page effects. This severely degraded maintainability and readability.
- **Decision:**
  Reorganize into a domain-driven, feature-based hierarchy (`features/arcade`, `features/monitor`, `features/room`, `features/lanyard`, `features/landing`) supported by a shared `core/` layer and isolated `data/` module. Path aliases (`@/*`) and barrel export files (`index.ts`) enforce clean module boundaries.
- **Consequences:**
  - *Positive:* High cohesion, clear domain boundaries, test colocation, and effortless future extension (e.g. adding a new mini-game or desktop app).
  - *Positive:* 100% of the 223 unit tests pass without coupling issues.

---

## ADR-003: Direct Linear Transformation (DLT) Homography for 3D Surface Projection

- **Status:** Accepted
- **Date:** October 2026
- **Context:**
  The curved monitor and arcade cabinet in the 3D room need to host interactive applications (text editor, project viewer, GitHub widget, and playable games). Rendering HTML into an offscreen 2D canvas texture in Three.js is computationally slow, breaks native browser text selection, prevents accessible screen readers, and complicates keyboard/pointer events.
- **Decision:**
  Project real DOM elements directly onto the 3D screen meshes using an 8-DOF Direct Linear Transformation (DLT) homography algorithm that computes a CSS `matrix3d(...)` transformation aligned with the 3D quad corners in camera space.
- **Consequences:**
  - *Positive:* Native browser performance, crisp vector typography, native text selection, full keyboard focus accessibility, and seamless iframe support.
  - *Negative:* Requires recalibration if the 3D monitor mesh geometry or camera pose is altered.

---

## ADR-004: In-Memory React State & LocalStorage Caching (No Global State Library)

- **Status:** Accepted
- **Date:** October 2026
- **Context:**
  Personal portfolios have localized interactive lifecycles (camera navigation, window positions, active game state). Adding global state managers like Redux, Zustand, or MobX adds unnecessary bundle weight and boilerplate.
- **Decision:**
  Use standard React `useReducer` for room navigation, local component state for windows and games, and `localStorage` with a 4-hour TTL for caching GitHub API contribution data.
- **Consequences:**
  - *Positive:* Reduced bundle size, zero external state dependencies, and clear component ownership.
  - *Negative:* State does not persist across full page reloads unless explicitly written to `localStorage` or URL hash.

---

## ADR-005: Built-in HTML5 Canvas Mini-Games Instead of Commercial ROMs

- **Status:** Accepted
- **Date:** October 2026
- **Context:**
  The retro arcade cabinet needs to be playable and engaging. Distributing copyrighted commercial game ROMs violates intellectual property laws, while third-party web emulators suffer from iframe blocking (`X-Frame-Options`) and broken audio.
- **Decision:**
  Develop 5 original, built-in HTML5 Canvas games (Cyber Flappy, Cyber Tetris, Pixel Run, Snake Grid, Deparkanoid) with self-contained synth audio engines, offering Crash Bandicoot only as an optional sandboxed demo with direct external fallback.
- **Consequences:**
  - *Positive:* 100% legal, zero external download dependencies, lightning-fast instant play, and proof of game physics programming skills.
  - *Negative:* Development effort required to maintain 5 distinct game loop implementations.

---

## ADR-006: Dual-Experience Architecture (3D Cyberpunk Room + Flat Landing)

- **Status:** Accepted
- **Date:** November 2026
- **Context:**
  While a 3D cyberpunk room is visually stunning, certain visitors (busy executive recruiters or users on low-power devices) want rapid, scrollable access to resume bullets, career history, and tech stack tabs without navigating a 3D scene.
- **Decision:**
  Implement a dual-experience architecture connected by an optical glass `ExitBar` ("Exit The Room") and a laser scanline portal transition that reveals a full-bleed flat portfolio view (`FlatLanding`) with a live ASCII room loop video.
- **Consequences:**
  - *Positive:* Satisfies both technical recruiters who want fast information access and engineering leaders who want deep interactive immersion.
  - *Negative:* Requires testing both 3D WebGL and 2D responsive layouts across all device breakpoints.

---

## ADR-007: Strict Non-Fabrication Policy for Credentials and Metrics

- **Status:** Accepted
- **Date:** October 2026
- **Context:**
  Many AI-generated portfolio templates insert placeholder statistics (e.g., "10x productivity", "99.9% accuracy", "50+ satisfied clients") or invented testimonials.
- **Decision:**
  Enforce a strict zero-fabrication policy. All role titles, dates (Daraei360 AI Engineer Oct 2025–May 2026; Product Manager May–Sep 2026), degrees (M.Sc. in AI & Robotics), and project links must reflect verifiable real-world achievements.
- **Consequences:**
  - *Positive:* Absolute professional credibility with senior engineering hiring managers.
  - *Negative:* Content must be manually updated whenever real-world accomplishments change.
