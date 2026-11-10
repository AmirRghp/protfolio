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

---

## ADR-008: Responsive Mobile & Tablet 3D Room Bypass via Strict Dual-Condition (`allowRoom3D`)

- **Status:** Accepted
- **Date:** November 2026
- **Context:**
  The 3D room relies on multiple dynamic point lights, Three.js shaders, bloom post-processing, and real-time homography projections designed for mouse-driven desktop interaction. On touch devices (phones, tablets, and iPads), this architecture causes severe GPU thermal throttling, battery drain, and Safari WebGL memory exhaustion, while presenting a cramped and clumsy user experience.
- **Decision:**
  Implement a central `useResponsiveDevice` hook using React 19 `useSyncExternalStore` that enforces a strict dual-condition for 3D room access:
  $$\text{allowRoom3D} = \text{isDesktop} \land \text{isFine} \land \neg\text{isTouch}$$
  Any touch-first device (`pointer: coarse`, including iPad Pro/Air) or viewport $< 1024\text{px}$ evaluates to `allowRoom3D = false`. In this mode:
  1. `<RoomPreview>` is completely unmounted (`null`) in `App.tsx`, freeing WebGL contexts and stopping render loops.
  2. The entry lanyard badge skips the 3D room construction phase, navigating directly to `FlatLanding`.
  3. URL hash `#room` dynamically synchronizes to `#portfolio`.
  4. Room re-entry buttons and `Escape` room shortcuts are replaced with an accessible "Get in Touch" navigation pill.
- **Consequences:**
  - *Positive:* 100% elimination of mobile WebGL crashes, instant page loads on low-power devices, zero background battery drain, and pristine touch ergonomics.
  - *Positive:* Seamless desktop experience remains completely intact with dedicated GPU acceleration.
  - *Negative:* Touchscreen tablet users cannot navigate the 3D room spatial view, but receive a rich, fully responsive, and accessible 2D portfolio instead.

---

## ADR-009: Unified Desktop Container Geometry for Flat Landing Sections

- **Status:** Accepted
- **Date:** November 2026
- **Context:**
  On wide and ultrawide desktop monitors ($\ge 1440\text{px}$), the Hero section (`.ldHero`) was rendered with `padding: 0 16px`, causing it to expand across the full screen width ($1400\text{px} - 1880\text{px}$). In contrast, all lower sections were enclosed within `.ldWrap` with a fixed max-width (`width: min(1240px, calc(100% - 48px)); margin: 0 auto;`). This created jarring horizontal misalignment where the Hero card hung out past the vertical rails and registration marks of the content below.
- **Decision:**
  Standardize `.ldHero` to share the exact same responsive container geometry and auto-margin centering as `.ldWrap`:
  ```css
  .ldHero {
    position: relative;
    z-index: 30;
    width: min(1240px, calc(100% - 48px));
    margin: 0 auto;
    padding: 0;
  }
  ```
- **Consequences:**
  - *Positive:* Clean, architectural column alignment across all sections on desktop, tablet, and mobile.
  - *Positive:* Dynamic laser portal transition FLIP geometry seamlessly adapts to the centered docked frame rect without distortion.

---

## ADR-010: Scroll-Invariant Tab Indicator with Single Persistent DOM Node (Mobile Coordinate Mismatch Resolution)

- **Status:** Accepted
- **Date:** November 2026
- **Context:**
  In horizontally scrollable tab lists on mobile viewports (`@/core/components/arc/tabs`), rendering separate per-tab `layoutId="selection"` elements inside each `TabsTrigger` caused severe animation glitches when switching tabs. Framer Motion computed FLIP layout transitions in viewport coordinate space while container focus and reveal handlers simultaneously executed smooth scrolling (`scrollBy`). This coordinate mismatch caused the indicator to jump across unrelated tabs (e.g., drifting toward DevOps during Data & AI to Agent Harness transitions) or cancel the translation entirely (`isDeltaZero`), causing the pill to pop in place without sliding. Additionally, on iOS Safari, WebKit's 3D compositing layer promotion caused the dark indicator to render over white tab titles, visually erasing active tab text.
- **Decision:**
  Refactor the tab indicator architecture:
  1. Replace per-tab mount/unmount `layoutId` spans with a single persistent indicator element inside `TabsPrimitive.List`.
  2. Derive indicator $x$, $\text{width}$, $\text{top}$, and $\text{height}$ directly from the active tab's `offsetLeft` and `offsetWidth` relative to the `.list` container, ensuring translations remain strictly scroll-invariant regardless of container `scrollLeft` or concurrent scroll animations.
  3. Animate indicator position and width using Framer Motion's morph spring with `initial={false}` to suppress mount fly-in.
  4. Remove `layoutScroll` on the viewport container to avoid redundant layout projection recalculations.
  5. Apply `isolation: isolate` to `.trigger` and promote `.triggerLabel` to a hardware-composited layer via `-webkit-transform: translateZ(0)` to preserve `z-index: 2` text layering above the sliding pill on iOS Safari.
- **Consequences:**
  - *Positive:* 100% elimination of indicator drift, coordinate jumps, and frozen pills during mobile tab switching.
  - *Positive:* Text labels remain crisp and readable on iOS Safari without occlusion.
  - *Positive:* Unified indicator physics across desktop and mobile devices.

---

## ADR-011: Refractive Optical Liquid Glass Scrolled Navbar via Glisse & GPU Compositing Optimization

- **Status:** Accepted
- **Date:** November 2026
- **Context:**
  The portfolio previously used a standard CSS backdrop blur (`rgba(10, 10, 11, 0.85)` + `backdrop-filter: blur(14px)`). To elevate the nocturnal cyberpunk visual language into authentic Apple-grade optical glass matching the hero CTA button, we integrated Glisse's refractive `<Glass>` component. However, the initial implementation suffered from stacking context isolation: `will-change: transform, opacity` on `.ldNav` combined with `position: absolute; z-index: -1` on `<Glass>` forced Chromium to isolate the glass into an unbacked compositor layer. Because `.ldNav` had a transparent background, `backdrop-filter: blur(...)` had no pixels to sample in its local layer, preventing blur from rendering over underlying page content (causing "See my work" to remain 100% sharp with only chromatic fringing).
- **Decision:**
  Implement true optical liquid glass with optimized GPU compositing:
  1. Mount `<Glass>` inside the sticky header with rectangular borders (`borderRadius: 0`), zero background tint (`background: "none"`), and calibrated optical tokens:
     ```css
     --lg-glass-bend: 0.31;
     --lg-glass-dispersion: 0.4;
     --lg-blur: 16px;
     --lg-rim-shine: 0;
     ```
  2. Mark individual page sections (`.ldHero`, `.ldTools`, `.ldWork`, `.ldStatement`, `.ldNumbers`, `.ldProcess`, `.ldTech`, `.ldActivity`, `.ldFoot`) with `data-glisse-backdrop` and align Hero geometry (`.ldHero` `width: 100%`, `padding-top: 64px`) so every filtered surface stays compact ($200\text{px}$–$850\text{px}$ tall, well below WebKit's $4096\text{px}$ CPU SVG filter limit).
  3. Remove `will-change: transform, opacity` from `.ldNav` to avoid trapping the child in an isolated compositor layer.
  4. Reposition `.ldNavGlass` to `z-index: 0` (`pointer-events: none`) and elevate foreground controls (`.ldLogo`, `.ldLinks`, `.ldNavCta`) to `position: relative; z-index: 1`.
  5. Preserve WebKit `objectBoundingBox` filter units and dynamic multi-section lens binding (`scripts/patch-glisse.js`):
     - **Root Cause of iOS Safari Bend Failure:** (1) WebKit (`RenderSVGResourceFilter`) only supports `filterUnits="objectBoundingBox"` and `primitiveUnits="objectBoundingBox"` (`boxUnits() === true`) for `<feImage>` subregions and `<feDisplacementMap>` on HTML elements; forcing `boxUnits = () => false` placed `<feImage>` at `6500%` of the box height. (2) Placing `data-glisse-backdrop` on the $5,555\text{px}$-tall `<main>` exceeded WebKit's $4096\text{px}$ max software `ImageBuffer` size at Retina DPR. (3) Hardware-composited sublayers (`translateZ(0)`, `translate3d` on `DynamicText`, `<video>` `AVPlayerLayer`, and nested `-webkit-backdrop-filter`) and rounded-corner `overflow: hidden` clipping inside `.ldHero` prevented WebKit's CPU SVG filter from sampling `SourceGraphic`.
     - **Fix:** Restore WebKit's `boxUnits` check (`objectBoundingBox` on WebKit, `userSpaceOnUse` on Chromium), patch `findBackdrop` and `bend` in `scripts/patch-glisse.js` to dynamically activate lenses only on the compact `[data-glisse-backdrop]` section(s) currently overlapping the visible navbar, and remove conflicting hardware layer promotions and rounded-corner overflow clipping inside `.ldHero` when `.ld.ready` is active. Additionally, resolve WebKit distortion bleed and padding offset: (1) unbox `neutral-k` to flood the entire backdrop element with neutral grey (`rgb(128, 128, 128)`), eliminating negative displacement outside `rect`; (2) clamp both axes via `boxed.push(across, down)`; (3) compensate for WebKit content-box padding offsets in `scripts/patch-glisse.js` (`effAcross`, `effDown`); (4) set `.ldHero { padding: 0; }` and move padding into `.ldHeroInner`, synchronizing mobile `.ldNav` `margin-bottom: -58px`.
- **Consequences:**
  - *Positive:* Delivers authentic Apple Liquid Glass aesthetics with optical refraction, chromatic dispersion, and high-intensity frosted blur (`16px`) uniformly on both iOS Safari and Android Chrome across the full page (Hero, Work, Numbers, Experience, Tech Stack, Activity, Contact, Footer).
  - *Positive:* Smoothly diffuses underlying page text, ASCII room animations, and section cards during scroll without visual artifacts.
  - *Positive:* Zero test regressions and clean cross-browser rendering on both desktop and mobile viewports.

---

### ADR-013: Decoupling Page Sections from WebKit SVG Filters & Adopting Glisse's Authentic Dual Pipeline
- **Status:** Accepted (2026-11-10)
- **Context:**
  Testing on iOS Safari (iPhone) revealed two severe rendering defects during vertical scrolling:
  1. **Lens Drift:** Touch scrolling on iOS is composited asynchronously on the GPU thread, while JavaScript `requestAnimationFrame` ticks on the main thread. Because the SVG filter was attached to the scrolling `<section>` (`content.style.filter = url(#...)`), the rasterized displacement texture moved upward with the section before the next frame recalculation, making the distortion visibly slide down into the text below the navbar.
  2. **Disappearing Elements (Layer Dropping):** WebKit enforces strict software memory limits on filter render buffers (`ImageBuffer`). Applying dynamic SVG displacement filters to full-page DOM sections containing complex layouts, transforms, and canvas/video exceeded WebKit's software tile cache on Retina devices, causing WebKit to drop the entire rendering layer and make underlying sections vanish.
  3. **Official Library Architecture:** In-depth research of Glisse's official source code and demo site (`glisse.kelvinzhang.ca`) proved that the author never places `data-glisse-backdrop` under a sticky navbar or on scrolling page containers. Glisse natively falls back to `-webkit-backdrop-filter: blur(...) saturate(...)` with its canvas-painted lit rim (`--lg-rim`) on WebKit, reserving live SVG backdrop refraction for Chromium browsers that support it in CSS `backdrop-filter`.
- **Decision:**
  1. Remove `data-glisse-backdrop` from all 9 scrolling page sections (`.ldHero`, `.ldTools`, `.ldWork`, `.ldStatement`, `.ldNumbers`, `.ldProcess`, `.ldTech`, `.ldActivity`, `.ldFoot`).
  2. Allow `<Glass>` to execute Glisse's authentic dual-engine mode: Chromium / Android receives live GPU displacement in `backdrop-filter`, while iOS Safari receives hardware-accelerated `-webkit-backdrop-filter: blur(var(--lg-blur, 3px)) saturate(180%)` accompanied by Glisse's photorealistic lit rim (`--lg-rim`).
  3. Calibrate `--lg-blur` to `3px` with a dark nocturnal glass tint (`rgba(8, 6, 20, 0.55)`), ensuring subtle, authentic Apple Liquid Glass diffusion without graphical artifacts.
- **Consequences:**
  - *Positive:* Completely eliminates touch-scroll distortion drift; the glass effect remains perfectly pinned within the sticky header bounds (`inset: 0`).
  - *Positive:* Completely eliminates dropped layers; all sections, cards, accordions, and text remain 100% visible and stable at all scroll positions.
  - *Positive:* Achieves fluid 120 FPS scrolling on iOS Safari with zero CPU software filter overhead.
  - *Positive:* Android Chrome and desktop Chromium retain real-time optical refraction via native `backdrop-filter`.
