# Changelog

All notable changes to Amirreza Gholipour's portfolio project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
