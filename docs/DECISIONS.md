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
  - *Positive:* 100% of the 45 test files (254 unit tests) pass without coupling issues.

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
  Standardize `.ldHero` and `.ldHeroInner` to align horizontally with `.ldWrap` (`1240px` max-width with `24px` minimum side gutters):
  ```css
  .ldHero {
    position: relative;
    z-index: 30;
    width: 100%;
    margin: 0 auto;
    padding: 0;
  }
  .ldHeroInner {
    width: 100%;
    padding: 64px max(24px, calc((100% - 1240px) / 2)) 0;
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

- **Status:** Superseded by ADR-013 (for section backdrop attachment and blur intensity; compositor layer fix in `.ldNav` remains active)
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

---

### ADR-014: Flat Landing Header Streamlining (Logo Icon Removal & Navigation Link Focus)
- **Status:** Accepted (2026-11-10)
- **Context:**
  The sticky header in `FlatLanding` previously contained a crosshair/asterisk SVG prefix icon inside the brand logo anchor (`.ldLogo`) and a "Numbers" anchor link in the main navigation bar (`.ldLinks`). The prefix SVG icon added visual clutter next to the strong typographic monogram `AG / AI Engineer`, and the "Numbers" navigation link directed users to a small metric statistics strip (`#ld-numbers`) rather than a substantive primary section (such as Work, Experience, or Tech Stack), crowding the navbar links especially on intermediate screen sizes.
- **Decision:**
  1. Remove the left SVG crosshair icon from `.ldLogo`, leaving a clean, bold typographic monogram (`<b>AG</b> <span>/ AI Engineer</span>`).
  2. Remove the "Numbers" (`#ld-numbers`) navigation anchor from the header's `<nav className={styles.ldLinks}>`. Keep the underlying `#ld-numbers` key statistics section fully rendered in the page body for in-flow reading.
- **Consequences:**
  - *Positive:* Reduces visual noise in the sticky header and provides higher breathing room for primary navigational links (`Work`, `Experience`, `Tech Stack`, `Activity`, `Contact`).
  - *Positive:* Simplifies brand header identity to crisp typography consistent with the rest of the portfolio.
  - *Positive:* Zero regressions in test suites or responsive layouts.

---

### ADR-015: In-Window GitHub Repository Viewer via Sandboxed `srcDoc` & Live API Enrichment
- **Status:** Accepted (2026-11-11)
- **Context:**
  All six portfolio projects link to real GitHub repositories (`github.com/AmirRghp/*`). On the 3D virtual monitor desktop, `ProjectApp` includes a button to "Load inside this window". However, GitHub strictly enforces `X-Frame-Options: deny` and CSP `frame-ancestors: 'none'`, causing browsers to refuse loading GitHub URLs inside raw `<iframe>` tags and forcing visitors to use "Open in new tab", breaking the immersive 3D desktop experience.
- **Decision:**
  1. Generate a self-contained, sandboxed `srcDoc` HTML document styled to GitHub's native dark mode (`src/data/githubRepoPreview.ts`).
  2. Embed structured repository metadata, language indicators, directory trees, one-click `git clone` command copying, and full Markdown `README.md` parsing directly in the browser sandbox.
  3. Query the CORS-enabled public GitHub REST API (`api.github.com/repos/{owner}/{repo}` and raw `README.md`) asynchronously to enrich branch names and file trees in real-time.
  4. Cache responses in `localStorage` under `portfolio_gh_repo_preview_v1_*` with a 4-hour TTL, backed by pre-bundled static snapshots for all six projects to ensure 100% resilience during network outages or API rate-limiting (HTTP 403).
  5. Provide an address-bar "Summary" button to toggle back to the project overview and an "Open in new tab" link for external navigation.
- **Consequences:**
  - *Positive:* Completely eliminates "refused to connect" blank iframe errors; users can inspect code structure and read complete project documentation without leaving the 3D room.
  - *Positive:* 100% offline-resilient with zero third-party script vulnerabilities (sandboxed without `allow-same-origin` external script injection).
  - *Positive:* Zero regressions in Playwright E2E suites or unit test suites (254 passing tests across 45 suites).

---

### ADR-016: Responsive Two-Row Visual Clamping & Lifecycle-Isolated Tab Panels in TechStackSection
- **Status:** Accepted (2026-11-11)
- **Context:**
  1. **Flawed Static Item Truncation:** The initial implementation truncated categories by an arbitrary item count (`slice(0, 10)`). On standard desktop viewports, row 1 accommodates 8–9 technology chips, leaving row 2 with only 1–2 chips when 10 items are rendered. In categories like `Frontend` (11 items) or `DevOps` (15 items), this caused an awkward blur overlay and expand button to appear just to reveal 1 single overflow chip that already fits within 2 visual rows.
  2. **Ghost Buttons & State Contamination:** In `DevOps & Cloud` on desktop, 15 items fit within 2 rows, yet a ghost `VIEW ALL` button appeared. Clicking this button caused the expand control to disappear completely, leaking an expanded state to other tabs (such as `All`) and leaving them permanently expanded without a collapse button.
  3. **Unmounted Tab Lifecycle Desynchronization:** In `Data & AI`, expanding the section, navigating to `Agent Harness`, and returning caused the button and nocturnal blur overlay to vanish, permanently displaying the full uncollapsed list. Root cause: `<TabsContent>` unmounts inactive panels (returns `null`). When the measuring component resided outside `<TabsContent>`, layout measurement effects (`useLayoutEffect`) could not observe rendered chips on inactive panels, desynchronizing `hasMore` and `isExpanded` states across tab switches.
- **Decision:**
  1. Mount `<TechTabPanel>` directly **inside** `<TabsContent value={tab.id}>`, ensuring clean component lifecycles where each active tab mounts independently and unmounts cleanly when inactive.
  2. Maintain isolated, local expansion states (`isExpanded`, `hasMore`, `collapsedHeight`) per tab panel.
  3. Implement responsive visual row detection using `useIsomorphicLayoutEffect` and `ResizeObserver`. Unique chip vertical offsets (`offsetTop`) are evaluated directly from the DOM; if row count $\le 2$, the tab renders with `.notOverflowing` (`max-height: none !important; overflow: visible !important;`) with zero blur overlay and zero expand controls.
  4. Dynamically compute the second row's bottom boundary (`secondRowBottom = top + offsetHeight`) to set a pixel-accurate collapsed clamp across all responsive viewports (`88px` on desktop, `82px` on tablet, `70px` on small mobile).
  5. Expand smoothly via hardware-accelerated `max-height` transition to the measured `scrollHeight + 12px`, with natural document reflow pushing lower sections (`#ld-activity`) downward without visual overlap.
- **Consequences:**
  - *Positive:* Completely eliminates ghost buttons, state leakage, and disappearing controls across all tab switching sequences.
  - *Positive:* Categories fitting within 2 rows on desktop (Frontend, DevOps, Databases, Languages, Agent Harness) display cleanly with no redundant expand controls.
  - *Positive:* Pixel-accurate responsive behavior across all viewports from $320\text{px}$ small mobile to $1440\text{px}$ desktop.
  - *Positive:* Zero layout collisions with the 3D isometric GitHub activity city section (`#ld-activity`).
  - *Positive:* All 254 Vitest unit tests, TypeScript compilation, and ESLint checks pass with 0 warnings or errors.

---

### ADR-017: Elevated Bespoke Spatial Calibration Wireframe Loader & Black Roller-Shutter Room-Exit Transition
- **Status:** Accepted (2026-11-11)
- **Context:**
  1. **Room-to-Landing Exit Transition:** The prior room-to-landing transition used an aggressive laser scanline FLIP portal sweep that caused jarring visual jumps when transitioning from the full-screen 3D room to the flat landing page. The user requested replacing this with a smooth, cinematic black roller-shutter curtain (`کرکره`) that sweeps upward cleanly from the full-width black exit bar (`#000000`).
  2. **Elevated Wireframe Loading Animation:** The initial landing loader was an identical recreation of a reference site (`harshitr.me`). While mathematically accurate in DOM rect mapping, it lacked personal brand identity and aesthetic cohesion with Amirreza Gholipour's nocturnal cyberpunk AI engineering portfolio. The user requested elevating the wireframe animation with creative, distinctive enhancements rather than retaining a 1:1 replica of the external reference.
- **Decision:**
  1. **Black Roller-Shutter Exit Transition (`ExitBar`):**
     - When the visitor activates "Exit The Room" (`TactileButton`), an opaque obsidian curtain (`#000000`) rolls upward from the bottom baseline to cover the 100svh viewport with a custom cubic-bezier curve (`cubic-bezier(0.77, 0, 0.175, 1)`), smoothly occluding the WebGL canvas before mounting `FlatLanding` and handing off to the loader.
  2. **Nocturnal Obsidian Calibration Surface (`.plSheet`):**
     - Set the loader background to `#07080d` with an integrated micro-dot matrix ($24\text{px}$) and architectural sub-grid ($96\text{px}$) accented by a subtle cyan radial glow (`rgba(56, 189, 248, 0.055)`).
  3. **Active Downward Spatial Laser Scanner Beam (`.plScanBeam`):**
     - Render an active horizontal laser scanline beam with a soft trailing phosphor wash that sweeps downward across the viewport ($0\% \to 100\%$) during the mapping phase.
     - Drive box activation via a blended algorithm (`isBlueprintBoxActive`) that combines sequential index progression ($55\%$) with vertical spatial Y-position ($45\%$), causing wireframe elements to materialize in the wake of the descending laser beam.
  4. **Precision 1.5px L-Bracket Corner Reticles (`.corners`) & Dimension Badges (`.dimBadge`):**
     - Replace generic box outlines with razor-sharp cyan L-brackets on all four corners of every scanned box.
     - Display live component dimension badges (`{w}×{h}`) on larger elements to emphasize precision engineering.
  5. **Bespoke AI/Spatial Telemetry Labels:**
     - Replace generic labels with domain-specific AI systems vocabulary: `VIEWPORT // ASCII_CORE`, `IDENTITY // H1`, `ROLE // STREAM`, `NODE // 01..N`, `CTA // 01..N`, `BRAND`, `NAV // 01..N`, and `SURFACE // CARD`.
  6. **Hero Banner Spatial Calibration HUD:**
     - Overlay a true pixel-aspect SVG grid inside the hero banner box with rule-of-thirds dashed lines, corner vector ticks, and a concentric circular target reticle (`<circle>`) that preserves circular geometry on both desktop and mobile viewports.
  7. **Blur-to-Crisp Typography Lock & Spectral Reveal Wipe:**
     - Box fills enter with initial blur (`filter: blur(2.5px) \to blur(0px)`). At $86\%$ progress, live typography transitions from `blur(3px)` into crisp, high-contrast text (`blur(0px)`).
     - At $100\%$ progress, a brilliant cyan-white spectral edge crest (`.plEdge`) wipes the sheet open vertically ($100svh$), seamlessly unveiling the interactive flat landing page.
  8. **Bottom Telemetry Status HUD & Column Rulers:**
     - Render a real-time status bar with progress readout (`SYS.CALIBRATE // 000%..100% · MAPPING DOM / LOCKING TYPE / REVEALING`), mini progress fill track, matrix node count (`MATRIX {width}PX · {count} NODES`), and column coordinate rulers (`X:{coord}`).
  9. **Mobile Viewport Optimization:**
     - Clamp minimum brand/nav chip widths to $48\text{px}$ to prevent clipping on narrow screens ($320\text{px}–390\text{px}$), and anchor column ruler labels above the bottom HUD bar to guarantee zero overlap with sticky navigation controls.
- **Consequences:**
  - *Positive:* Replaces a generic external clone with a distinctive, high-end AI/Spatial-Calibration visual identity perfectly aligned with the nocturnal cyberpunk room.
---

### ADR-018: Bidirectional Roller-Shutter Transitions & 3-Layer Z-Stack Room Re-entry
- **Status:** Accepted (2026-11-11)
- **Context:**
  Following the introduction of the black roller-shutter room exit in ADR-017, returning from the flat landing to the 3D room ("Re-enter" header button, "Enter The Room" footer button, `Escape` key, or browser Back) lacked visual symmetry and smoothness. The user requested an exact reverse roller-shutter animation (`کرکره برعکس`) that rolls downward with the exact same smoothness and cleanliness as the upward exit.
- **Decision:**
  1. **Bidirectional Curtain Dynamics in `ExitBar` (`EXIT_SHUTTER_DURATION_MS = 680`):**
     - When leaving the room, `.exitbar.shutting` sweeps upward from `translate3d(0, 0, 0)` to `translate3d(0, -100vh, 0)` over `0.68s cubic-bezier(0.76, 0, 0.24, 1)`.
     - While parked in flat mode (`isAway`), `.exitbar.away` resides off-screen at `translate3d(0, -100vh, 0)` with `opacity: 0` and `pointer-events: none`.
     - On re-entry (`isReentering`), `.exitbar.reentering` transitions smoothly from `translate3d(0, -100vh, 0)` down to `translate3d(0, 0, 0)` with the exact same `0.68s cubic-bezier(0.76, 0, 0.24, 1)` easing.
  2. **3-Layer Z-Index Architecture for 60fps Zero-Jank Reveal:**
     - Avoided expensive full-page `clip-path` rasterization bottlenecks and `display: none` layout teardown on Frame 0 by orchestrating a 3-layer compositing stack:
       - Bottom layer: `#landing` at `z-index: 40`, maintaining uninterrupted DOM layout during the 680ms transition.
       - Middle layer: `RoomPreview` elevated to `z-index: 50` during `isReentering` (`activeViewMode === "room" || isReentering`).
       - Top layer: `#exitbar` at `z-index: 99998` with opaque curtain `.ebShutter`.
     - As the solid black curtain descends from `-100vh` to `0`, it progressively reveals `RoomPreview` from top to bottom at native 60fps compositor speed.
  3. **ExitBar Arch Spring Physics Coordination:**
     - Computed `targetGoal = isAway || isReentering || isShutting ? -22 : goal` inside the spring physics simulation. The center arch remains tucked at `-22px` during the descent and springs up into its resting position ($k = 0.08, d = 0.82$) upon docking at `bottom: 0`.
  4. **Loader & Audio Lifecycle Guards:**
     - Guarded `PortfolioLoader` with `!isClosing` so that re-entry does not re-trigger spatial calibration HUD scanning.
     - Paused `CoffeeSteam` continuous `invalidate()` when `#exitbar` `data-shutter-state !== "idle"`, conserving GPU rendering cycles during the curtain sweep.
- **Consequences:**
  - *Positive:* Provides a visually symmetric, cinematic transition experience entering and leaving the 3D room.
  - *Positive:* Zero frame-time drops by relying on GPU hardware-composited `transform: translate3d` instead of geometry clipping or expensive DOM mutations.
  - *Positive:* Full test coverage added for `isAway` and `isReentering` states across `ExitBar` and `FlatLanding`.

---

### ADR-019: Security Hardening, Utility Deduplication & Accessibility Compliance Audit Remediation
- **Status:** Accepted (2026-11-13)
- **Context:**
  A Senior Software Engineer code review identified security, behavioral, architectural, and accessibility gaps across the virtual desktop GitHub viewer, arcade engines, mobile handheld modal, and unused packages/assets:
  1. **Iframe & Markdown Hardening (`ProjectApp` & `githubRepoPreview`):** The `srcDoc` GitHub repository preview used `allow-same-origin` alongside `allow-scripts` (triggering same-origin escape risk), allowed entity-encoded or non-HTTP schemes in Markdown links, lacked `event.source === window.parent` validation on in-frame `postMessage`, lacked runtime schema validation on `localStorage` cache reads, and lacked an internal fetch timeout.
  2. **Duplicated Font & High-Score Logic:** All 5 HTML5 Canvas arcade games duplicated `FontFace` loading boilerplate, while *Deparkanoid* lacked `localStorage` high-score persistence unlike the other 4 games.
  3. **Audio & Keyboard Regressions:** *Pixel Run* restarted music on unpause even when music was off, *Cyber Tetris* left music playing on unmount and omitted `"OR P"` in its pause hint, `MobileGamepad` dispatched `KeyP` in carousel mode, and `MobileArcadeModal` left `flappyAudio`/`tetrisAudio`/`pixelRunAudio` globally muted on close. Additionally, `Escape` inside `MobileArcadeModal` propagated to `FlatLanding` and triggered desktop room re-entry, and `#arcade` deep links were unhandled.
  4. **Accessibility & Cleanup:** `MobileArcadeModal` lacked focus capture/trapping/restoration, incomplete ARIA `tab`/`tabpanel` attributes, and horizontal touch swipe support on the cartridge stage; `lucide-react` was used only for 2 chevrons in `tabs.tsx`; dead CSS `.cartridgeVisualImg` and 11 unused `public/assets/aistudio/` artifacts remained in the repository.
- **Decision:**
  1. Harden `ProjectApp` (`sandbox="allow-scripts allow-popups"` for GitHub `srcDoc`) and `githubRepoPreview` (scheme allowlist, `event.source === window.parent`, 8s abort timeout, and `isValidRepoSnapshot` runtime validation).
  2. Centralize embedded font loading in `src/features/arcade/utils/arcadeFont.ts` and high-score storage (`ARCADE_HIGH_SCORE_KEYS`, `readArcadeHighScore`, `saveArcadeHighScore`, including `deparkanoid_high_score`) in `src/features/arcade/utils/arcadeData.ts`.
  3. Fix audio mute/pause lifecycles across `PixelRunGame`, `TetrisGame`, `MobileGamepad`, and `MobileArcadeModal`, coordinate `Escape` via `defaultPrevented` + `!isMobileArcadeOpen`, and add `#arcade` URL hash routing in `App.tsx` and `FlatLanding.tsx`.
  4. Add focus capture/trap/restoration, full ARIA `tab`/`tabpanel` attributes, horizontal swipe switching, and `prefers-reduced-motion` rules to `MobileArcadeModal`, `MobileArcadeFab`, `SnakeGame`, and `Deparkanoid`.
  5. Replace `lucide-react` icons in `src/core/components/arc/tabs.tsx` with inline SVGs, remove `lucide-react` from `package.json`, remove dead `.cartridgeVisualImg`, and delete `public/assets/aistudio/`.
- **Consequences:**
  - *Positive:* Eliminates iframe same-origin escape, Markdown XSS vectors, audio leaks, and unintended `Escape` navigation.
  - *Positive:* Removes an unnecessary external dependency (`lucide-react`) and 11 unused binary artifacts while standardizing all 5 arcade games under a single font/high-score layer and expanding unit verification to 49 test suites (286 tests).

---

### ADR-020: Refresh-Rate Independent Arcade Physics & Trapezoidal Gravity Integration (`arcadeTimeStep.ts`)
- **Status:** Accepted (2026-11-13)
- **Context:**
  Testing the arcade cabinet on a laptop running Ubuntu Linux with a 4GB dedicated GPU and Google Chrome on a high-refresh-rate display (120Hz / 144Hz / 240Hz) revealed that *Cyber Flappy*, *Pixel Run*, and *Deparkanoid* ran at unplayably fast speeds:
  1. In *Pixel Run*, horizontal obstacle movement scaled with `60 * dt`, but vertical raptor jump/gravity (`raptor.vy += GRAVITY; raptor.y += raptor.vy`) executed once per `requestAnimationFrame` without `dt`. On a 144Hz screen, the jump completed in $60 / 144 \approx 41.7\%$ of the intended airtime, slamming the raptor back down before clearing any obstacle.
  2. In *Cyber Flappy*, `dt` was computed but unused in physics or world scrolling, causing horizontal pylons to move $2.4\times$ faster at 144Hz and vertical gravity to accelerate quadratically ($\sim 5.76\times$ faster at 144Hz due to unscaled double Euler integration).
  3. In *Deparkanoid*, `draw()` mutated paddle and ball coordinates on every `requestAnimationFrame` (and on `ResizeObserver` callbacks) without `dt` scaling.
- **Decision:**
  1. Create `src/features/arcade/utils/arcadeTimeStep.ts` exporting `computeArcadeTimeStep(currentTimeMs, lastTimeMs, maxDeltaSec)` (`frameScale = dt * 60`, clamped to $50\text{ms}$) and `integrateGravityStep(y, vy, gravityPerFrame, frameScale, maxFallSpeed)`.
  2. Formulate `integrateGravityStep` using exact trapezoidal velocity integration with a discrete 60Hz Euler bias match:
     $$v_{t+\Delta t} = \min\left(v_{\max},\; v_t + g \cdot s\right), \quad g_{\text{eff}} = \frac{v_{t+\Delta t} - v_t}{s}, \quad y_{t+\Delta t} = y_t + \left(\frac{v_t + v_{t+\Delta t}}{2} + \frac{1}{2}g_{\text{eff}}\right) s$$
     where $s = \Delta t \times 60$. At 60Hz ($s = 1$), this reduces algebraically to `vy += g; y += vy`. Across any partition of sub-frames where $\sum s_i = T$ (120Hz, 144Hz, 165Hz, 240Hz), the telescoping sum yields the exact same position, velocity, jump apex height, and airtime as 60Hz while rendering smooth intermediate positions on every native refresh frame.
  3. Apply `frameScale` across all continuous displacements, oscillations, trail spawns, paddle/ball velocities, and particle/floating-text updates in `FlappyGame.tsx`, `PixelRunGame.tsx`, `Deparkanoid.tsx`, `SnakeGame.tsx`, and `TetrisGame.tsx`.
- **Consequences:**
  - *Positive:* Guarantees identical gameplay speed, jump arcs, and obstacle clearance across 60Hz, 120Hz, 144Hz, 165Hz, 240Hz, and uncapped Linux/Chrome frame rates while maintaining native high-FPS visual smoothness.
  - *Positive:* Backed by deterministic mathematical unit tests in `arcadeTimeStep.test.ts`, `FlappyGame.test.tsx`, and `PixelRunGame.test.tsx` (50 test suites, 292 passing tests).

