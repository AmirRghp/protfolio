# Changelog

All notable changes to Amirreza Gholipour's portfolio project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.0] - 2026-11-09

### Added
- **Refractive Optical Liquid Glass Scrolled Navbar (`FlatLanding` & `glisse`):**
  - Replaced the static CSS blurred backdrop (`rgba(10, 10, 11, 0.85)` + `backdrop-filter: blur(14px)`) on the scrolled sticky header with true optical refractive `<Glass>` from `glisse`.
  - Configured authentic Apple-grade optical tokens: `--lg-glass-bend: 0.31`, `--lg-glass-dispersion: 0.4`, `--lg-blur: 16px`, `--lg-rim-shine: 0`, `borderRadius: 0`, and `background: "none"`.
  - Bound `data-glisse-backdrop` onto `<main>` and coordinated layout geometry (`.ldNav` height $64\text{px}$, `margin-bottom: -64px`, `.ldPage` `padding-top: 64px`) so Glisse's bounding-box detection couples with scrolling page content.
- **Scroll-Invariant Arc UI Tab Indicator (`@/core/components/arc/tabs`):**
  - Replaced per-tab `layoutId="selection"` spans with a single persistent indicator element inside `TabsPrimitive.List`.
  - Derived indicator `x`, `width`, `top`, and `height` dynamically from `target.offsetLeft` and `target.offsetWidth`, rendering coordinate calculations strictly scroll-invariant regardless of container `scrollLeft` or concurrent smooth `scrollBy` animations on touch viewports.
  - Animated indicator geometry with Framer Motion spring physics using `initial={false}` to suppress mount fly-in artifacts.

### Fixed
- **Safari Distortion Bleed and Padding Shift in Scrolled Navbar (`FlatLanding` & `glisse`):**
  - Resolved an issue on iOS Safari where the optical liquid glass refraction bent text outside the navbar boundaries, bleeding into the hero bio content below.
  - Root causes: (1) Glisse's `neutral-k` (`feFlood flood-color="rgb(128, 128, 128)"`) was placed inside `part.boxed`, restricting the flood to the lens `rect` and leaving the rest of the backdrop transparent black ($R=0$), which `feDisplacementMap` (`down`) interpreted as maximum negative displacement ($\Delta Y = -0.5 \times \text{scale}$); (2) `down` was missing from `boxed.push`, leaving it unbounded; (3) WebKit's `objectBoundingBox` calculation on HTML elements with CSS `padding-top` anchors $(0, 0)$ to the content-box rather than the border-box, causing a $64\text{px}$ downward shift of the lens on `.ldHero`; (4) on mobile viewports, `.ldNav` had `height: 58px` but inherited `margin-bottom: -64px`, creating a $6\text{px}$ vertical misalignment.
  - Resolution: (1) Unboxed `neutral-k` so it floods the entire backdrop with neutral grey ($128, 128, 128$), guaranteeing zero displacement everywhere outside `rect`; (2) added `down` to `boxed.push(across, down)` to strictly clamp both displacement axes to `rect`; (3) compensated for WebKit's content-box padding offset in `scripts/patch-glisse.js` (`effAcross` and `effDown`); (4) removed padding from `.ldHero` (`padding: 0`), moving layout padding to an inner wrapper (`.ldHeroInner`), and synchronized mobile `.ldNav` `margin-bottom: -58px`.
- **iOS Safari / WebKit SVG Filter Refraction in Glisse Optical Liquid Glass (`FlatLanding`):**
  - Resolved an issue where the liquid glass `bend` (optical displacement refraction) rendered visibly on Android (Chromium) and on `glisse.kelvinzhang.ca`, but failed on iPhone (iOS / Safari WebKit).
  - Root causes: (1) WebKit only renders HTML SVG filters (`feImage` subregions and `feDisplacementMap`) in `objectBoundingBox` units (`boxUnits() === true`), so forcing `boxUnits = () => false` placed the lens at `6500%` of the element height; (2) placing `data-glisse-backdrop` on the $5,555\text{px}$-tall `<main>` container exceeded WebKit's $4096\text{px}$ CPU software `ImageBuffer` limit at Retina DPR; (3) rounded-corner `overflow: hidden` clipping and hardware-composited sublayers (`translateZ(0)`, `translate3d`, `<video>`, and nested `-webkit-backdrop-filter`) inside the Hero prevented WebKit's CPU SVG filter from sampling `SourceGraphic`.
  - Restored WebKit `objectBoundingBox` filter units in `scripts/patch-glisse.js` and patched `findBackdrop` / `bend` to dynamically track multiple compact section-level `[data-glisse-backdrop]` elements ($200\text{px}$–$850\text{px}$ tall), activating the SVG filter only on the section(s) currently overlapping the visible sticky navbar.
  - Eliminated conflicting hardware compositing layers and corner-clipping inside `.ldHero` once `.ld.ready` is active, and updated automated regression tests in `src/features/landing/utils/glisseSafariPatch.test.ts`.
- **GPU Compositor Layer Isolation on Scrolled Navbar:**
  - Resolved an issue where `--lg-blur` on `<Glass>` failed to blur page elements passing beneath (causing text like "See my work" to remain sharp with chromatic-only fringing).
  - Removed `will-change: transform, opacity` from `.ldNav` to prevent Chromium/Blink from trapping the header in an isolated compositor layer.
  - Repositioned `.ldNavGlass` to `z-index: 0` and elevated interactive header children (`.ldLogo`, `.ldLinks`, `.ldNavCta`) to `position: relative; z-index: 1`, allowing `backdrop-filter: blur(16px)` to sample and diffuse the underlying page canvas.
- **Active Tab Label Occlusion on iOS Safari:**
  - Resolved WebKit 3D layer promotion bug where Framer Motion's active tab background indicator rendered over the white text label on iOS Safari.
  - Applied `isolation: isolate` on `.trigger` to enforce an isolated local stacking context.
  - Promoted `.triggerLabel` to a hardware-composited layer via `-webkit-transform: translateZ(0)` to preserve `z-index: 2` layering above the sliding pill.
  - Added `pointer-events: none` to the selection indicator to prevent event interception during animations.

---

## [0.7.0] - 2026-11-09

### Added
- **Responsive Mobile & Tablet 3D Room Bypass (`useResponsiveDevice`):**
  - Added React 19 `useSyncExternalStore` hook enforcing strict dual-condition for 3D room access: $\text{allowRoom3D} = \text{isDesktop} \land \text{isFine} \land \neg\text{isTouch}$ (viewport $\ge 1024\text{px}$ AND pointer: fine).
  - Touch devices (phones, iPads, tablets) and viewports $< 1024\text{px}$ completely unmount `<RoomPreview>`, freeing GPU resources, releasing WebGL contexts, and eliminating background Three.js render loops.
  - Holographic lanyard badge (`LanyardIntro`) navigates directly into `FlatLanding` on mobile/tablet upon pull or skip.
  - URL hash synchronization: `#room` automatically updates to `#portfolio` on mobile devices via `window.history.replaceState`.
  - Replaced room re-entry buttons on mobile/tablet with an accessible glass pill **"Get in Touch"** button linked directly to `#ld-contact`.
  - Suppressed custom `MagicCursor` and room `Escape` hotkey on touch screens to prevent sticky hover artifacts.
- **Search Engine Optimization (SEO) & Structured Data:**
  - Added comprehensive metadata, OpenGraph tags, and Twitter Cards to `index.html`.
  - Implemented JSON-LD structured data schemas (`Person`, `WebSite`) highlighting Amirreza Gholipour's AI/ML engineering role and verified credentials.
  - Generated static crawler directives (`public/robots.txt`) and sitemap (`public/sitemap.xml`).
- **Tech Stack Truncation & Smooth Height Expansion (`TechStackSection`):**
  - Truncated initial list view to the first 10 items for categories with $> 10$ technologies.
  - Added `.techBlurOverlay` (`backdrop-filter: blur(4px)`) and uppercase monospace `VIEW ALL TECHNOLOGIES (60)` / `COLLAPSE STACK` text button matching footer styling.
  - Implemented 60fps CSS Grid height transition (`grid-template-rows: 0fr -> 1fr`) with rotating chevron; tab switches automatically reset expansion state.
- **High-Density Mobile Pixel Tetris (`PixelTetris`):**
  - Scaled mobile cell size down from $20\text{px}$ to $10\text{px}$ (`mobileCellSize={10}`).
  - Increased board resolution from 8 rows / 16 cols to **16 total rows** and **28–30 columns** on mobile devices.
  - Adjusted prefilled rows to 7 (`mobilePrefillRows={7}`) and stack ceiling to 9 (`mobileMaxStackHeight={9}`), doubling the active Tetris block height from 4 rows to 8–9 rows of organic shapes.
  - Dynamically distributed hole spacing across columns (`numHoles = Math.max(2, Math.floor(cols / 8))`) to prevent premature line clears at startup.

### Changed
- **Desktop Hero Container Alignment (`flatLanding.module.css`):**
  - Unified `.ldHero` width and margins to match `.ldWrap` (`width: min(1240px, calc(100% - 48px)); margin: 0 auto; padding: 0;`), fixing wide-screen misalignment where the hero frame expanded to full viewport width.
  - Flush vertical alignment across all breakpoints between `.ldHero` and `.ldWrap` ($1240\text{px}$ desktop, $\text{calc}(100\% - 48\text{px})$ tablet, $\text{calc}(100\% - 20\text{px})$ mobile).
- **Unified Responsive Section Padding Tokens:**
  - Removed hardcoded section padding overrides on `.ldTech`, `.ldActivity`, `.ldFoot`, and `.ldStatement`, standardizing all `.ldWrap > section` and `.ldWrap > footer` to responsive tokens: Desktop ($72\text{px}\;40\text{px}$), Tablet ($60\text{px}\;32\text{px}$), Mobile Wide ($52\text{px}\;24\text{px}$), and Mobile Compact ($44\text{px}\;18\text{px}$).
- **Responsive Grid Breakpoints for Capabilities & Social Links:**
  - Viewports $\ge 375\text{px}$: Formatted into balanced **2-column** grids (`.ldTools` 2 cols $\times$ 3 rows, `.ldSocial` 2 cols $\times$ 2 rows with ellipsis handle truncation).
  - Viewports $< 375\text{px}$ (e.g. $320\text{px}$ iPhone SE): Automatically collapse into **1 single column** (`grid-template-columns: 1fr`) with stacked rows.
- **Work Accordion Header & Mobile Experience Spacing (`WorkAccordion.tsx`):**
  - Replaced text close button with a circular glass `✕` icon button ($36\text{px}$) aligned at top-right opposite the branch title.
  - Stabilized closed accordion branch title typography across mobile/tablet to prevent font shrinkage when adjacent branches open.
  - Replaced $0\text{px}$ padding on mobile experience items with symmetric $18\text{px}$ horizontal padding, aligning text with section headers while maintaining wall-to-wall dividers.
- **Test Suite Expansion:**
  - Expanded test coverage from 40 files / 223 tests to **42 files / 243 tests**, adding unit tests for `responsive.ts`, `FlatLanding.tsx`, `TechStackSection.tsx`, `WorkAccordion.tsx`, and `PixelTetris.tsx`.

---

## [0.6.0] - 2026-11-08

### Added
- **Feature-Driven Architecture:** Complete modular restructuring of `src/` into encapsulated domain directories (`features/arcade`, `features/monitor`, `features/room`, `features/lanyard`, `features/landing`).
- **Canonical Core Foundation:** Established `src/core/` for shared coordinate types (`Point`, `Dimensions`, `ViewportSize`), pure utilities (`assetUrl`, `webglUtils`, `utils`), and shared UI primitives.
- **Path Aliasing (`@/*`):** Configured clean path alias mappings across `tsconfig.json` and `vite.config.ts`.
- **Comprehensive Technical JSDoc:** Documented mathematical formulas for 3D projection homography, Euler rotation matrices, spring physics ODEs, and quintic smootherstep easing.
- **Full Blueprint Documentation Suite:** Replaced obsolete planning files and screenshots with 10 structured documentation guides in `docs/` according to the Vibe Coding Blueprint.

### Changed
- Refactored all 40 test suites and 223 unit tests to colocate directly adjacent to their target feature components.
- Standardized top-level imports in `App.tsx` and test helper scripts (`tests/testHelpers.ts`, `tests/monitor.spec.ts`).

---

## [0.5.0] - 2026-11-07

### Added
- **Dual-Experience Flat Landing (`FlatLanding`):** Accessible full-bleed flat portfolio view reachable via `#portfolio` hash or the "Exit The Room" button.
- **Digital Laser Portal Transition:** Cinematic vertical scanline transition with video loop reveal (`ascii-room.webm`).
- **Interactive Tech Stack Section (`TechStackSection`):** Tabbed technology showcase with spring-animated Arc UI tabs (`@uiarc/tabs`) and a dedicated **Agent Harness** category.
- **3D Isometric GitHub Activity City (`GithubActivitySection`):** Visualizes annual GitHub contributions as a 3D isometric skyline with diagonal wave animations and best-day callouts.
- **OriginKit Pixel Tetris Floor (`PixelTetris`):** Automated autonomous AI Tetris canvas in the footer constrained to a 6-row ceiling.
- **Refractive Optical Glass Buttons:** Integrated WebGL2 `TactileButton` from `tactile-glass-ui`.

---

## [0.4.0] - 2026-10-22

### Added
- **Musical Oiia Cat Prop (`OiiaCat`):** Interactive 3D cat figure with 160 BPM spinning and loaf animations.
- **Disco Drop Sync:** Room strobe lighting and synchronized 2D dancing cat on the monitor during musical drop phases (seconds 33–57 and 81–105).
- **Physical Desk Props:** High-fidelity 3D models for steaming coffee mug (`cup.glb`) and lower-shelf Batman collectible figure (`batman.glb`).
- **Deep Tabletop Geometry:** Expanded desk depth (`z=-0.9` to `z=3.8`) with recessed arcade machine cutout (`x=2.96`).

---

## [0.3.0] - 2026-10-21

### Added
- **Virtual Monitor Desktop OS (`MonitorDesktop`):** Direct-surface 2D HTML projection onto the 3D curved monitor mesh via DLT homography.
- **Draggable Desktop Window Manager:** Floating, draggable, maximizable, and closable windows with pointer capture and boundary clamping.
- **Retro Text Editor App (`AboutMeApp`):** Monospace editor displaying candidate background, contact details, and education.
- **Project Inspector App (`ProjectApp`):** Interactive project cards with highlight tags and live demo loading buttons.
- **GitHub Contribution Radial Ring (`ContributionRing`):** Live contributor widget with 4-hour `localStorage` caching and bundled offline fallback.

---

## [0.2.0] - 2026-10-20

### Added
- **3D Nocturnal Cyberpunk Hero Room:** Implemented Three.js / React Three Fiber scene with deep nocturnal palette (`#080614`).
- **Dual LED Shelf Strips:** Ambient and specular shelf lighting with cyan (`#00e5ff`) to magenta (`#d946ef`) color gradients.
- **Smooth Camera Interpolation:** Quintic smootherstep easing for camera transitions between room overview and focused targets.
- **Interactive 3D Holographic Lanyard Badge (`LanyardIntro`):** Pull-to-enter gateway with downward dominance physics and instant skip shortcuts.

---

## [0.1.0] - 2026-10-18

### Added
- Initial project scaffolding using React 19, TypeScript, and Vite.
- Base test configuration with Vitest and Playwright.
- Project content data structure in `src/data/content.ts`.
