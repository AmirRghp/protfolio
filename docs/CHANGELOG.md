# Changelog

All notable changes to Amirreza Gholipour's portfolio project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-11-14

### Added & Changed
- **Selected Work Infinite 3D Dome Grid with GSAP (`src/features/landing/components/dome-gallery/`, `FlatLanding.tsx`):**
  - Replaced the `#ld-work` section in `FlatLanding.tsx` with a full-bleed, transparent-background **Infinite Dome Grid with GSAP** (`DomeGallery`) that reveals the underlying `LiquidGrid` canvas and anchors a glassmorphic `Selected Work` pill badge (`stageHeaderBadge`) at the top-left of the stage matching the bottom `Drag to explore...` hint pill.
  - Engineered the 3D concave paraboloid surface projection (`dome.ts`), 3-iteration fixed-point `screenToPlanar` cursor lens inversion (`use-pointer-focus.ts`), continuous `focus.strength` attenuation for butter-smooth cursor-leave settling (`use-infinite-drag.ts`), and coprime 2D lattice distribution (`itemIndexAt`) so all 6 projects appear across every row without adjacent duplicates.
  - Stabilized tile DOM registration in `dome-tile.tsx` via `useEffect([slot.key, registerTile])` and synchronized `style.visibility` checks in `dome-gallery.tsx` so React state re-renders (`hasInteracted`, `active`) never leave offscreen-culled tiles hidden when dragged into view.
  - Generated 6 bespoke nocturnal 3D editorial artworks tailored to each project's architecture and optimized them as lightweight WebP assets in `public/assets/projects/` (`covid-image-classification.webp`, `omnidoc-rag.webp`, `omnidoc-vision.webp`, `omniops-sre-agent.webp`, `enterprise-knowledge-copilot.webp`, `laya-finetuning-pipeline.webp`).
  - Built a zero-reflow 3D GSAP `CustomEase` card-to-panel morphing `ProjectModal` (`project-modal.tsx`, `project-modal-content.tsx`, portaled to `document.body`) that measures the clicked tile's exact projected `getBoundingClientRect()` (including corner cards), pre-locks `.modalCopy` to its final target width during the morph, and displays project index (`01 / 06`), category badge, overview, system architecture callout, complete **Technology Stack** chips, key engineering highlights, and a pinned **View on GitHub** CTA.
  - Added capture-phase `Escape` handling in `ProjectModal` to close open project details without triggering `FlatLanding` room re-entry, preserved vertical page wheel scrolling across `#ld-work`, and added an accessible `srOnly` semantic project index and unit test suite (`DomeGallery.test.tsx`, 51 suites / 298 passing tests).

## [0.8.12] - 2026-11-13

### Changed & Optimized
- **Bundle Code-Splitting & Tree-Shaking (`vite.config.ts`, `Lanyard.tsx`, `ArcadeMenu.tsx`, `MobileArcadeModal.tsx`):**
  - Replaced wildcard `import * as THREE from "three"` in `Lanyard.tsx` with explicit named imports to enable tree-shaking of unused Three.js classes.
  - Removed eager barrel re-export `export * from "./games"` in `src/features/arcade/index.ts` and code-split all 5 built-in arcade games (`Deparkanoid`, `SnakeGame`, `FlappyGame`, `TetrisGame`, `PixelRunGame`) via `React.lazy` and `<Suspense>` in `ArcadeMenu.tsx` and `MobileArcadeModal.tsx`.
  - Configured Rolldown `output.codeSplitting.groups` in `vite.config.ts` to separate `vendor-three-core`, `vendor-three-addons`, `vendor-r3f`, `vendor-motion`, and `vendor-react`, reducing the entry `index.js` chunk by **72.1%** (`2,036.02 kB` $\to$ `568.91 kB`, `581.36 kB` $\to$ `152.70 kB` gzip) and eliminating all bundler chunk-size warnings.
- **3D GLB Embedded Texture & Media Bandwidth Optimization (`public/assets/`):**
  - Optimized oversized embedded textures in `cup.glb` (`1,720.5 kB` $\to$ `123.2 kB`, **-92.8%**), `arcade-machine.glb` (`2,213.7 kB` $\to$ `966.8 kB`, **-56.3%**), `oiia-cat.glb` (`951.4 kB` $\to$ `732.3 kB`, **-23.0%**), and `compact-keyboard.glb` (`451.5 kB` $\to$ `313.3 kB`, **-30.6%**) while preserving all meshes, UV maps, material names, and morph targets.
  - Stripped embedded cover art and re-encoded `oiia-spinning-cat.mp3` (`2.69 MB` $\to$ `1.29 MB`, **-52.0%**), set `this.audio.preload = "none"` in `oiiaAudio.ts`, and changed `ascii-room.webm` in `FlatLanding.tsx` to `preload="metadata"` with deferred loading (`isOpen || isIntroDismissed`), saving **>4.2 MB** of initial network transfer on page startup.
- **Runtime WebGL & Canvas GPU/CPU Gating (`OiiaCat.tsx`, `RoomScene.tsx`, `GradientWaves.tsx`, `LiquidGrid.tsx`):**
  - Stopped `OiiaCat.tsx` idle breathing animation and `CameraFocus` pointer raycasting/idle parallax from calling `invalidate()` when the 3D room is occluded behind `FlatLanding` (`document.body.classList.contains("away")`) or during `ExitBar` shutter closure, dropping background 3D WebGL rendering from 60 FPS to **0 FPS** while browsing the 2D portfolio.
  - Memoized the `settings` object in `GradientWaves.tsx` with `useMemo`, added `[settings]` dependency array to its wakeup `useEffect`, and paused `GradientWaves` `tick` when `away` is active.
  - Added `document.hidden` visibility guards to `LiquidGrid.tsx` animation loop scheduling.

## [0.8.11] - 2026-11-13

### Fixed
- **Refresh-Rate Independent Physics Across All 5 Arcade Games (`arcadeTimeStep.ts`):**
  - Resolved high-refresh-rate gameplay speed bugs on 120Hz, 144Hz, 165Hz, 240Hz, and uncapped Linux/Chrome displays where `requestAnimationFrame` fired faster than 60Hz:
    - *Cyber Flappy (`FlappyGame.tsx`):* Replaced raw per-frame gravity (`s.birdSpeed += GRAVITY; s.birdY += s.birdSpeed`) and per-frame pylon/parallax movement (`pylon.x -= level.speed`) with 60Hz-normalized `frameScale` (`dt * 60`) and exact trapezoidal gravity integration (`integrateGravityStep`), eliminating the quadratic refresh-rate gravity acceleration ($\sim 5.76\times$ fall speed on 144Hz) and $2.4\times$ pylon speed increase.
    - *Pixel Run (`PixelRunGame.tsx`):* Fixed hybrid delta-time mismatch where horizontal obstacle scrolling used `60 * dt` while vertical raptor jump and gravity (`raptor.vy += GRAVITY; raptor.y += raptor.vy`) updated per-frame without `dt`, which previously caused jumps to snap back to the ground in $41\%$ of normal airtime on 144Hz displays. Also guarded `handleDuckPress` against OS key-repeat fast-fall impulse stacking and normalized particle/notice velocities.
    - *Deparkanoid (`Deparkanoid.tsx`):* Added `computeArcadeTimeStep` (`frameScale`) to the `requestAnimationFrame` loop and scaled paddle step (`PADDLE_STEP * frameScale`) and ball velocity (`xSpeed * frameScale`, `ySpeed * frameScale`), while keeping non-loop `draw(0)` calls (resize/font load) side-effect free.
    - *Snake Grid (`SnakeGame.tsx`) & Cyber Tetris (`TetrisGame.tsx`):* Normalized particle velocity, exponential drag (`Math.pow(0.96, frameScale)`), alpha decay, and floating score text drift with `frameScale`.
  - Added dedicated unit test suite `src/features/arcade/utils/arcadeTimeStep.test.ts` and high-refresh-rate physics regression tests in `FlappyGame.test.tsx` and `PixelRunGame.test.tsx` (50 test suites, 292 passing tests).

## [0.8.10] - 2026-11-13

### Security & Hardening
- **In-Window GitHub Repository Preview (`ProjectApp` & `githubRepoPreview`):**
  - Removed `allow-same-origin` from the `srcDoc` GitHub `<iframe>` `sandbox` (`sandbox="allow-scripts allow-popups"`), preventing embedded repository preview scripts from accessing parent origin storage or DOM while keeping external project website sandboxing intact.
  - Tightened `renderMarkdownToHtml` link sanitization to explicitly allowlist `https://`, `http://`, `mailto:`, and relative repository paths (blocking `javascript:`, `data:`, `vbscript:`, and entity-encoded schemes).
  - Enforced `event.source === window.parent` verification inside the `srcDoc` `message` listener.
  - Added an **8-second** `AbortController` timeout in `fetchGitHubRepoSnapshot` and runtime schema validation (`isValidRepoSnapshot`) when reading `localStorage` cache entries.

### Fixed & Changed
- **Arcade Font & High-Score Deduplication (`arcadeFont.ts` & `arcadeData.ts`):**
  - Extracted the duplicated `"Departure Mono Subset"` `FontFace` loader from all 5 Canvas games into `src/features/arcade/utils/arcadeFont.ts`.
  - Centralized persistent `localStorage` high-score read/write helpers in `src/features/arcade/utils/arcadeData.ts` (`ARCADE_HIGH_SCORE_KEYS`) and added persistent high-score tracking (`deparkanoid_high_score`) to `Deparkanoid.tsx`.
- **Audio, Pause & Navigation Lifecycle Fixes:**
  - Fixed `PixelRunGame.tsx` pause/unpause synth music leak via `resumeMusicOnUnpauseRef` and `stopMusic()` cleanup on `Escape` and `P` pause.
  - Added `tetrisAudio.stopMusic()` unmount cleanup and updated pause prompt text (`PRESS PAUSE OR P TO RESUME`) in `TetrisGame.tsx`.
  - Gated `MobileGamepad` `KeyP` dispatches strictly on `isPlaying` so `PAUSE` does not fire redundant keyboard events in cartridge carousel mode.
  - Reset global arcade mute state (`applyMasterMute(false)`) when `MobileArcadeModal` closes or unmounts so 3D desktop arcade audio is never left silenced.
  - Coordinated `Escape` precedence between `MobileArcadeModal` and `FlatLanding` (`defaultPrevented` / `!isMobileArcadeOpen`) so pressing `Escape` closes the mobile arcade modal without triggering 3D room re-entry, and added `#arcade` hash deep-linking in `App.tsx` and `FlatLanding.tsx`.
- **Accessibility, Reduced Motion & Touch UX:**
  - Added focus capture on open, `Tab`/`Shift+Tab` focus trapping, focus restoration on close, complete ARIA `tablist`/`tab`/`tabpanel` attributes, and horizontal touch/pointer swipe cartridge cycling to `MobileArcadeModal`.
  - Added `@media (prefers-reduced-motion: reduce)` support to `MobileArcadeModal.module.css`, `MobileArcadeFab.module.css`, `SnakeGame.tsx`, and `Deparkanoid.tsx`.
- **Cleanup & Tests:**
  - Replaced `lucide-react` chevron icons in `src/core/components/arc/tabs.tsx` with inline SVGs and removed `lucide-react` from `package.json`.
  - Removed dead `.cartridgeVisualImg` CSS rule and deleted 11 unused media artifacts under `public/assets/aistudio/`.
  - Expanded unit test coverage across `ProjectApp.test.tsx`, `MobileArcadeModal.test.tsx`, `MobileGamepad.test.tsx`, `Deparkanoid.test.tsx`, `FlatLanding.test.tsx`, and `App.test.tsx` (49 test suites, 286 passing tests).

## [0.8.9] - 2026-11-12

### Added
- **Mobile Retro Arcade Handheld Experience (`MobileArcadeModal` & `MobileGamepad`):**
  - Designed and implemented a dedicated mobile/tablet handheld gaming console modal (`NEON POCKET`), bringing the 5 native 60fps HTML5 Canvas arcade games (*Cyber Flappy*, *Cyber Tetris*, *Pixel Run*, *Snake Grid*, *Deparkanoid*) to mobile and tablet visitors (`<= 1024px`).
  - Built an iOS AssistiveTouch-inspired circular floating button (`MobileArcadeFab`) powered by `GlisseButton` (`glisse`), featuring free 2D touch dragging across the viewport, magnetic horizontal edge-snapping (`computeAssistiveSnapPosition`), idle translucency, and strict tablet/mobile-only visibility (omitted on desktop where the 3D room arcade cabinet is used).
  - Engineered full responsive layouts across small mobile (`320px`), standard mobile (`375px–414px`), phone landscape, tablet portrait (`768×1024`), and tablet landscape (`1024×768`).
  - Built an adaptive virtual touch gamepad (`MobileGamepad`) with multi-touch concurrency, tactile silicone D-Pad, angled `MENU` & `PAUSE` rubber pills, drilled 12-hole acoustic speaker grille, and context-aware action clusters with native key event dispatch and haptic pulse feedback (`navigator.vibrate(10)`).
  - Added full keyboard hotkey support (`Escape` to return/close, arrow keys to cycle carousel, `Space`/`Enter` to start, `M` for audio toggle, and `P` for pause).

### Changed & Fixed
- **Unified Game Pause Engine Across All 5 Arcade Games:**
  - Standardized the pause state machine and `'p'` / `'P'` keyboard listeners across all 5 mini-game engines:
    - *Cyber Tetris:* Pressing `PAUSE` toggles `"RUNNING"` ↔ `"PAUSED"` and suspends/resumes drop ticks and 8-bit chiptune audio; also handles instant launch from `"READY"`.
    - *Cyber Flappy:* Added `"PAUSED"` mode with canvas overlay, suspending gravity/pipe animation until unpaused or flapped.
    - *Pixel Run:* Added `"PAUSED"` mode with canvas overlay, freezing obstacles, parallax ground, and score timers.
    - *Snake Grid:* Added `"PAUSED"` mode in `snakeLevels.ts` with canvas overlay, freezing tick intervals until unpaused.
    - *Deparkanoid:* Added `"PAUSED"` mode in `deparkanoidLevels.ts` with canvas overlay, freezing paddle and ball velocities.
  - Upgraded the physical `PAUSE` button on `MobileGamepad` to trigger on `onPointerDown` with `preventDefault()` for zero-latency touch response, toggling pause in active games or launching games from the menu.
- **Cyber Tetris High-DPI Fit Scaling & Coordinate Normalization:**
  - Resolved mobile viewport zooming and board clipping in `TetrisGame.tsx` by implementing uniform fit scaling (`fitScale = Math.min(displayW / contentW, displayH / contentH)`) and centered letterbox translation with $2\times$ supersampled device pixel ratio (`dpr`).
  - Calibrated canvas click coordinates (`handleCanvasClick`) to matching scaled logical space for music toggle and state transitions.
- **Natural Industrial Hardware Console Redesign (Eliminating Neon Slop):**
  - Replaced generic neon glow styling with a bead-blasted dark gunmetal aluminum and matte charcoal polycarbonate chassis texture (`handheld_shell_texture_1794477536843.jpg`).
  - Added recessed dark tempered glass display lens with authentic `DOT MATRIX WITH STEREO SOUND` silkscreen, `BATTERY` power LED, and machined corner screws.
  - Generated macro photography banner for smoked translucent retro game cartridges showing gold PCB circuit traces (`retro_cartridge_header_1794477537457.jpg`).
  - Refined action buttons into sculpted vermilion, burgundy, and amber resin buttons with physical press travel and tactile socket bezels.

## [0.8.8] - 2026-11-11

### Added
- **Reverse Black Roller-Shutter Room Re-entry Transition (`ExitBar` & `FlatLanding`):**
  - Implemented the exact symmetric reverse roller-shutter (`کرکره برعکس`) animation when transitioning from the flat landing page back into the 3D room ("Re-enter" button in header, "Enter The Room" button in footer, `Escape` key, or browser history navigation).
  - Designed a high-performance 3-layer compositing stack (`#landing` at `z-index: 40`, `RoomPreview` elevated to `z-index: 50`, and `#exitbar` at `z-index: 99998`) ensuring the downward shutter roll reveals the 3D room progressively from top to bottom at native 60fps compositor speed with zero `clip-path` rasterization bottlenecks or Frame 0 layout teardown.
  - Synchronized `ExitBar` spring physics so the center arch stays tucked at $-22\text{px}$ throughout the descent and springs up into its resting position ($k = 0.08, d = 0.82$) as soon as the bar docks at `bottom: 0`.
  - Added unit test coverage in `ExitBar.test.tsx` and `FlatLanding.test.tsx` for `isAway` (`data-shutter-state="away"`) and `isReentering` (`data-shutter-state="opening"`, `data-transition-state="closing"`).

### Changed
- **Performance & Lifecycle Hardening During Re-entry:**
  - Suppressed `PortfolioLoader` during re-entry closing (`!isClosing`) to eliminate redundant wireframe scanner re-renders.
  - Paused `CoffeeSteam` continuous scene invalidation when `ExitBar` is in an active shutter state (`data-shutter-state !== "idle"`), reducing GPU overhead during curtain motion.

## [0.8.7] - 2026-11-11

### Added
- **Elevated Bespoke Spatial Calibration Wireframe Loader (`PortfolioLoader` & `portfolioLoaderUtils`):**
  - Transformed the wireframe loading animation from a generic replica into an original, bespoke AI/Spatial-Calibration experience matching the nocturnal cyberpunk aesthetic.
  - **Nocturnal Obsidian Calibration Canvas (`.plSheet`):** Deep `#07080d` background with integrated micro-dot matrix ($24\text{px}$), architectural sub-grid ($96\text{px}$), and subtle cyan radial glow (`rgba(56, 189, 248, 0.055)`).
  - **Active Downward Spatial Laser Scanner Beam (`.plScanBeam`):** A razor-sharp cyan-white horizontal beam with phosphor trailing wash sweeping down the viewport ($0\% \to 100\%$) during the mapping phase.
  - **Spatial-Sequential Box Materialization (`isBlueprintBoxActive`):** Combines sequential index progression ($55\%$) with vertical spatial Y-position ($45\%$), causing wireframe elements to materialize progressively in the wake of the descending laser beam.
  - **Precision 1.5px L-Bracket Corner Reticles (`.corners`) & Dimension Badges (`.dimBadge`):** Crisp cyan L-brackets on all four corners of every scanned box plus real-time `{w}×{h}` coordinate badges on larger components.
  - **Hero Banner Spatial Calibration HUD:** True pixel-aspect SVG grid inside the hero banner box with rule-of-thirds dashed lines, corner vector ticks, and a concentric circular target reticle (`<circle>`) that preserves true circular geometry on both desktop and mobile viewports.
  - **Bespoke AI/Spatial Telemetry Labels:** Specialized system labels tailored to Amirreza Gholipour's AI portfolio (`VIEWPORT // ASCII_CORE`, `IDENTITY // H1`, `ROLE // STREAM`, `NODE // 01..N`, `CTA // 01..N`, `BRAND`, `NAV // 01..N`, `SURFACE // CARD`).
  - **Blur-to-Crisp Typography Lock & Spectral Reveal Wipe:** Boxes initialize with blur (`filter: blur(2.5px) -> blur(0px)`), with live DOM typography sharpening from `blur(3px)` to crisp focus at $86\%$ progress, followed by a cyan-white spectral edge (`.plEdge`) wiping open the view at $100\%$ to reveal the flat landing.
  - **Bottom Telemetry Status HUD & Column Rulers:** Live progress telemetry (`SYS.CALIBRATE // 000%..100% · MAPPING DOM / LOCKING TYPE / REVEALING`), mini progress fill track, matrix node counter (`MATRIX {width}PX · {count} NODES`), and column coordinate rulers (`X:{coord}`).
  - **Mobile Viewport Optimization:** Calibrated minimum widths ($48\text{px}$ for brand/nav chips), relocated ruler coordinate labels above the bottom HUD bar, and dynamically computed SVG viewports to prevent distortion or overlap down to $320\text{px}$ mobile screens.

### Changed
- **Black Roller-Shutter Room-Exit Transition (`ExitBar`):**
  - Replaced the prior laser portal FLIP sweep with a sleek, cinematic vertical black roller-shutter curtain (`کرکره`) originating from the full-width black exit bar (`#000000`).
  - Implemented smooth upward wipe (`cubic-bezier(0.77, 0, 0.175, 1)`) seamlessly covering the 3D room before mounting the flat landing and initializing the spatial calibration loader.

## [0.8.6] - 2026-11-11

### Changed
- **Skill Visualization in AboutMeApp (Tag-Like Bubbles & Badges):**
  - Modernized the skill list in `AboutMeApp` under section `04. Technical Skills & Software Stack` from a single paragraph of inline text separated by middle dots into small, tag-like interactive bubbles (chips).
  - Integrated level badges (`Intermediate`, `Basic`) as styled micro-chips directly inside skill bubbles when present, featuring cyan accent styling for intermediate competencies and muted steel-blue styling for foundational skills.
  - Added hover lift states (`transform: translateY(-1px)` and subtle cyan border glow) to enhance interactivity while maintaining the nocturnal cyberpunk desktop theme.
  - Implemented responsive container query adjustments (`@container (max-width: 420px)`) with tightened padding and typography for seamless readability and visual hierarchy on mobile screens.
- **Oiia Cat Musical Drop 2 Recalibration:**
  - Recalibrated the second climactic disco drop phase from `81.0s – 105.0s` to `106.0s – 132.0s` (`01:46 – 02:12`) in `src/features/room/audio/oiiaAudio.ts` to precisely align with the climax drop of the audio track.
  - Synchronized the full room disco strobe lighting, fast spin choreography, particle effects, and beat pulses with the new drop timestamp window.
  - Updated unit test assertions in `src/features/room/audio/oiiaAudio.test.ts`.
- **Scroll-Triggered GitHub Activity 3D Skyline Animation (`GithubActivitySection`):**
  - Fixed a timing bug where `ResizeObserver` initialized `startTimeRef` on initial page load while the `#ld-activity` section was still off-screen, causing the 4.2-second rising wave and best-day pin animation to already be completed before the user scrolled down to it.
  - Extracted `resolveSkylineAnimationElapsed` so that off-screen resize events render the flat baseline grid (`0ms`) while keeping `startTimeRef` unset (`null`) until `IntersectionObserver` (bound to `#landing` at `0.25` threshold) detects the user scrolling the chart into view for the first time.

## [0.8.5] - 2026-11-11

### Fixed
- **DevOps & Cloud Ghost Expand Button & Cross-Tab State Leaks:**
  - Resolved an issue where a ghost `VIEW ALL TECHNOLOGIES (15)` button appeared on the `DevOps & Cloud` tab on desktop even though its 15 items fit within 2 visual rows. Clicking the button caused the control to disappear and leaked an uncollapsed state to other tabs (such as `All`), leaving them permanently expanded without a collapse button.
  - Root cause: Measuring logic executed outside the `<TabsContent>` lifecycle, creating stale state and cross-tab contamination when switching active tabs.
  - Resolution: Moved `<TechTabPanel>` inside `<TabsContent value={tab.id}>` to ensure clean, isolated component mounting and local state per tab.
- **Data & AI Tab Navigation Blur & Button Disappearance:**
  - Resolved an issue where visiting `Data & AI`, navigating to `Agent Harness`, and returning caused the `VIEW ALL` button and nocturnal blur overlay to vanish, showing the full expanded list prematurely.
  - Resolution: Each active tab now measures its own DOM layout on mount via `useIsomorphicLayoutEffect` and `ResizeObserver`, ensuring consistent collapsed state and clean expansion controls upon every tab return.

### Changed
- **Responsive Two-Row Visual Clamping (`TechStackSection`):**
  - Replaced the arbitrary 10-item static truncation with true responsive visual 2-row clamping based on DOM chip vertical offset (`offsetTop`) calculation.
  - Categories that fit within 1 or 2 rows on the active viewport (`Languages`, `Frontend`, `Databases`, `Agent Harness`, and `DevOps` on desktop) render cleanly with `.notOverflowing` (`max-height: none`, `overflow: visible`), displaying all items directly with zero blur overlay and zero unnecessary buttons.
  - Categories exceeding 2 rows clamp dynamically to the bottom edge of the second row (`88px` on desktop, `82px` on tablet, `70px` on small mobile), accompanied by a smooth feathered nocturnal blur overlay and a frosted glass expand button.
  - Extended responsive clamping and button styling down to $320\text{px}$ small mobile viewports, ensuring adaptive wrapping and zero overlap with the GitHub activity skyline section (`#ld-activity`).
- **Documentation & Test Suite Synchronization:**
  - Updated `docs/PRD.md`, `docs/DESIGN_SYSTEM.md`, `docs/TESTING.md`, `docs/DECISIONS.md` (ADR-016), and `src/features/landing/components/TechStackSection.test.tsx` to reflect the 2-row visual clamping architecture.

## [0.8.4] - 2026-11-11

### Added
- **In-Window GitHub Repository Viewer (`ProjectApp` & `githubRepoPreview`):**
  - Resolved `iframe` embed failures across all project apps on the monitor desktop (`github.com refused to connect`) caused by GitHub's strict `X-Frame-Options: deny` and `Content-Security-Policy: frame-ancestors 'none'` response headers.
  - Architected a native, sandboxed in-window repository viewer via `<iframe srcDoc={...}>` in `src/data/githubRepoPreview.ts` and `src/features/monitor/apps/ProjectApp.tsx`.
  - Embedded high-fidelity repository metadata, directory structure, language tags, and full Markdown `README.md` rendering directly inside the virtual desktop window without requiring external tab jumps.
  - Integrated live GitHub REST API querying (`api.github.com/repos/{owner}/{repo}/contents` and `raw.githubusercontent.com`) with a 4-hour `localStorage` cache and non-blocking asynchronous `postMessage` updates.
  - Bundled comprehensive, verified offline snapshots for all 6 projects (`COVID-19 Image Classification`, `OmniDoc RAG`, `OmniDoc-Vision`, `OmniOps SRE Agent`, `Enterprise Knowledge Copilot`, and `Laya Fine-tuning Pipeline`), ensuring zero broken screens when offline or rate-limited.
  - Added tab switching between `Code & README` and `Files`, a one-click `Copy clone command` button, and an address-bar `Summary` button to return to the project overview.
  - Expanded unit test coverage in `src/features/monitor/apps/ProjectApp.test.tsx` to 5 comprehensive tests, bringing total test count to 254 passing tests across 45 suites.

## [0.8.3] - 2026-11-11

### Changed
- **Flat Landing Header Streamlining:**
  - Removed decorative crosshair/asterisk SVG vector icon from the brand monogram link (`.ldLogo`), transitioning to a clean typographic identity (`AG / AI Engineer`).
  - Removed the "Numbers" (`#ld-numbers`) anchor link from the sticky navbar (`.ldLinks`), reducing visual clutter and prioritizing key substantive sections (`Work`, `Experience`, `Tech Stack`, `Activity`, `Contact`) while leaving the underlying key statistics section fully rendered in the page flow.

## [0.8.2] - 2026-11-11

### Fixed
- **Removal of Framed Border, Rim Outline & Box-Shadow from Scrolled Navbar:**
  - Removed all enclosing rectangular borders, outlines, bottom hairline dividers, and Glisse perimeter canvas rims from `.ldNav` and `.ldNavGlass`.
  - Suppressed `.ldNav.scrolled` bottom border (`box-shadow: none`), set `--lg-rim-shine: 0`, `--lg-edge: "transparent"`, `--lg-drop: "transparent"`, `backgroundImage: "none"`, and `box-shadow: none !important; border: none !important; outline: none !important;`.
  - The sticky navbar now floats over page content as a completely seamless, frameless, borderless liquid glass optical slab.
- **Chromium Live Optical Refraction Restoration (Scrolled Navbar):**
  - Resolved an issue on Chrome, Edge, and Android (Chromium) where the optical `bend` (refraction displacement) was inadvertently suppressed when the navbar became visible on scroll.
  - Root cause: In `flatLanding.module.css`, `.ldNavGlass.visible` previously defined an explicit `backdrop-filter: blur(var(--lg-blur, 3px)) saturate(180%)`, which overrode Glisse's internal `.lg-glass` backdrop-filter rule (`backdrop-filter: blur(var(--lg-blur, 3px)) var(--lg-filter, saturate(1.5))`). Because `--lg-filter` (which holds `url("#glisse-backdrop-N")`) was omitted from the override rule, Chromium never evaluated the SVG displacement map. Furthermore, inline `background: "none"` and CSS `background: rgba(...)` reset `background-image`, stripping Glisse's chromatic edge rim (`--lg-rim`).
  - Resolution:
    1. Updated `.ldNavGlass` in `flatLanding.module.css` to use `-webkit-backdrop-filter: blur(var(--lg-blur, 3px)) var(--lg-filter, saturate(1.8))` and `backdrop-filter: blur(var(--lg-blur, 3px)) var(--lg-filter, saturate(1.8))`, preserving `--lg-filter` on Chromium while providing a graceful hardware-accelerated `saturate(1.8)` fallback on Safari.
    2. Streamlined `.ldNavGlass.visible` to toggle only `opacity` and `visibility`, allowing Glisse's dual-engine pipeline to manage filter and rim states undisturbed.
    3. Moved the nocturnal tint to `--lg-glass: "rgba(8, 6, 20, 0.55)"` on `<Glass>`, preserving Glisse's `background-image: var(--lg-rim, none)`.
    4. Verified live optical displacement and chromatic rim reflection in real-time Chromium DevTools.

## [0.8.1] - 2026-11-10

### Fixed
- **iOS Safari Touch-Scroll Lens Drift & Disappearing Elements (Liquid Glass Navbar):**
  - Resolved an issue on iPhone (Safari WebKit) where the liquid glass refraction band drifted downward below the sticky navbar during touch scrolling and underlying page sections (work accordion, metric cards, tech stack) suddenly vanished from the screen.
  - Root causes:
    1. Attaching dynamic SVG filters (`content.style.filter = url(...)`) to scrolling page sections desynchronized from the sticky header during iOS touch scrolling, because touch scrolling runs asynchronously on WebKit's GPU compositor thread while JavaScript `requestAnimationFrame` ticks on the main thread.
    2. WebKit's software filter tile cache overflows its memory budget on high-DPI Retina screens when rendering dynamic displacement filters over large DOM trees, causing WebKit to drop the entire rendering layer.
  - Resolution:
    1. Decoupled all scrolling page sections from `data-glisse-backdrop`, adopting Glisse's authentic dual-pipeline architecture (as used on `glisse.kelvinzhang.ca`).
    2. Chromium / Android continues to receive live GPU optical refraction via `backdrop-filter: blur() url(#glisse-backdrop)`.
    3. iOS Safari receives hardware-accelerated `-webkit-backdrop-filter: blur(var(--lg-blur, 3px)) saturate(180%)` accompanied by Glisse's canvas-drawn chromatic lit rim (`--lg-rim`).
    4. Calibrated `--lg-blur` to `3px` and added a nocturnal glass tint (`rgba(8, 6, 20, 0.55)`), completely eliminating all drift, memory exhaustion, and layer dropping while delivering fluid 120 FPS scrolling.

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
