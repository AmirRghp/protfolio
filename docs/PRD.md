# Product Requirements Document (PRD)

## 1. Product Overview

- **Product Name:** Amirreza Gholipour — AI Engineer Interactive Portfolio
- **One-Line Description:** An immersive, dual-experience personal portfolio featuring a nocturnal 3D cyberpunk workspace, an interactive virtual desktop, playable retro arcade games, and a full-bleed flat landing page with isometric GitHub skyline visualization.
- **Product Type:** Interactive Web Application / Single Page Application (SPA)
- **Primary Platform:** Modern Web Browsers (Desktop, Laptop, Tablet, and Mobile with WebGL2 / HTML5 Canvas support)
- **Repository / Live URL:** Hosted via GitHub Pages at `https://amirrghp.github.io/protfolio/`

---

## 2. Problem & Value Proposition

### What problem are we solving?
Standard software engineering portfolios are static, repetitive, and fail to demonstrate real frontend engineering depth, 3D graphics competence, or interactive systems design. Traditional resume websites present walls of text that hiring managers and engineering leaders skim in seconds without engaging.

### Why does this matter?
For an AI Engineer specializing in autonomous agent harnesses, machine learning, and computer vision, presenting work through an interactive, technically sophisticated platform proves technical craft and attention to detail before an interview even begins.

### How do we solve it?
By providing a **dual-mode interactive journey**:
1. An immersive **3D Nocturnal Cyberpunk Room** powered by Three.js / React Three Fiber, allowing visitors to inspect projects on a virtual curved monitor desktop, play Canvas games on a retro arcade cabinet, and interact with physics-based props.
2. A sleek, high-performance **Flat Landing Portfolio** accessible via a cinematic black roller-shutter room-exit transition and an elevated AI spatial-calibration wireframe loader, featuring fluid liquid grid effects, an Arc UI tech stack tabbed explorer, and a 3D isometric GitHub contribution skyline.

---

## 3. Goals & Constraints

### Primary Goal
Deliver a memorable, production-grade portfolio that showcases Amirreza Gholipour's real-world artificial intelligence and software engineering expertise with zero fabricated metrics or invented results.

### Secondary Goals
- **60 FPS Performance:** Maintain smooth rendering and subtle parallax motion across viewports without dropped frames on standard hardware.
- **Universal Accessibility:** Ensure all career history, project descriptions, and GitHub links remain fully accessible through semantic HTML without requiring WebGL interaction.
- **Zero Backend Footprint:** Operate purely client-side with zero server maintenance, leveraging static bundling and browser caching.

### Core Product Guardrails
- **No Fabricated Information:** Strict adherence to real credentials (M.Sc. in AI & Robotics, past roles at Daraei360 as AI Engineer Oct 2025–May 2026 and Product Manager May–Sep 2026).
- **Legitimate Games:** Built-in original HTML5 Canvas games (Cyber Tetris, Cyber Flappy, Pixel Run, Snake Grid, Deparkanoid) without pirated ROMs.

---

## 4. Target Audience & Personas

### Persona 1: The Technical Recruiter / Talent Sourcer
- **Needs:** Fast access to candidate resume, contact details, role history, education, and GitHub profile.
- **Pain Points:** Complex 3D navigations that block access to basic information.
- **Solution:** Instant skip buttons (`Read portfolio`, keyboard `Escape`), and immediate flat portfolio view via `#portfolio` URL hash.

### Persona 2: The Engineering Director / AI Team Lead
- **Needs:** Proof of engineering maturity, code cleanliness, architecture separation, and genuine technical execution.
- **Pain Points:** Generic template portfolios with AI-generated filler text and unverifiable metrics.
- **Solution:** Interactive virtual desktop running real project apps, verifiable open-source code repositories, clean architecture, and exhaustive test coverage.

### Persona 3: Fellow Engineers & Tech Enthusiasts
- **Needs:** Delightful interactive touches, visual polish, easter eggs, and smooth physics.
- **Pain Points:** Clunky controls, audio that plays without permission, unresponsive layouts.
- **Solution:** 3D holographic lanyard badge with pull kinematics, playable arcade cabinet, musical Oiia Cat with disco drop sync, and tactile optical glass buttons.

---

## 5. User Stories

- **As a visitor**, I want to pull or skip the entry lanyard badge so that I can enter the portfolio workspace seamlessly.
- **As a recruiter**, I want to quickly read the candidate's career experience and education so that I can evaluate role fit in under 60 seconds.
- **As an engineering manager**, I want to click the curved monitor in the 3D room to examine project highlights and launch live demos inside virtual desktop windows.
- **As a visitor**, I want to play retro arcade games directly on the arcade cabinet to experience responsive Canvas rendering.
- **As a visitor**, I want to transition smoothly to the flat landing page to explore the tech stack and annual GitHub contribution city.
- **As a keyboard user**, I want full keyboard accessibility (`1`/`M` for monitor, `2`/`A` for arcade, `Escape` to go back) to navigate without a mouse.

---

## 6. Core Features Specification

### 6.1. Interactive Holographic Lanyard Badge (`LanyardIntro`)
- **Visuals:** Photorealistic 3D holographic lanyard badge (`/assets/lanyard-photo.webp`) suspended on a flexible strap with specular highlights and physics-based inertia.
- **Interaction:** Drag/pull kinematics with downward dominance calculation; auto-unlock when pulled past threshold.
- **Accessibility:** Instant bypass via click button or keyboard (`Enter`, `Space`, `Escape`).

### 6.2. 3D Nocturnal Cyberpunk Hero Room (`RoomScene`)
- **Aesthetic:** Deep nocturnal cyberpunk palette (`#080614` / `#161130`) illuminated by cyan (`#00e5ff`) and magenta (`#d946ef`) dual LED under-shelf strips.
- **Scene Anchors:**
  - Curved monitor center on a deep tabletop (`z=-0.9` to `z=3.8`).
  - Compact angled mechanical keyboard, optical mouse, and neon-rimmed mousepad.
  - Steaming coffee mug and musical Oiia Cat figure on the desk.
  - Wall shelves featuring ambient illumination and a Batman collectible figure.
  - Retro arcade machine recessed cleanly into the right desk cutout (`x = 2.96`).
- **Camera System:** Fixed overview with smooth dampened transitions to `monitor` and `arcade` destinations, subtle mouse-driven parallax, and automatic neutral recentering.

### 6.3. Virtual Monitor Desktop & OS (`features/monitor`)
- **Direct-Surface Projection:** 2D HTML/CSS desktop interface projected onto the 3D curved monitor mesh using real-time DLT homography and CSS `matrix3d`.
- **Live Status Bar:** Dynamic clock, local date, battery/wifi indicators, and volume state updating in real-time.
- **Interactive Apps:**
  - `AboutMeApp`: Monospace retro text editor displaying verified background, education, and contact links.
  - `ProjectApp`: Draggable project glyphs opening dedicated windows with feature highlights and an in-window GitHub repository viewer (`srcDoc`) featuring tabbed code/file browsing, full Markdown `README.md` rendering, one-click clone command copying, live API enrichment, and offline snapshot resilience.
  - `ContributionRing`: Radial widget displaying public GitHub contribution volume with a 4-hour `localStorage` cache and offline fallback.

### 6.4. Retro Arcade Cabinet & Playable Mini-Games (`features/arcade`)
- **Interface:** CRT-style arcade menu with scanlines, CRT curve, and game selection preview.
- **Game Suite:**
  1. *Cyber Flappy:* Obstacle avoidance game with procedural pipes and collision physics.
  2. *Cyber Tetris:* Classic tetromino block stacker with level progression, ghost piece, and audio.
  3. *Pixel Run:* Fast-paced infinite side-scroller with jump mechanics and obstacle waves.
  4. *Snake Grid:* Classic directional grid snake with neon fruit pickups and high-score tracking.
  5. *Deparkanoid:* Brick-breaker paddle game with multi-bounce trajectory calculations.
  6. *Crash Bandicoot:* Optional PS1 emulator integration via sandboxed iframe with direct fallback link.

### 6.5. Musical Oiia Cat Easter Egg (`features/room/props/OiiaCat`)
- **Interaction:** Clicking the cat triggers a 160 BPM rhythmic spin and bounce animation.
- **Disco Drop Sync:** During the music drop (seconds 33–57 and 106–132 / 01:46–02:12), the entire room shifts into dynamic disco strobe lighting, while the monitor enters Drop Sync mode with a synchronized 2D dancing cat.

### 6.6. Bidirectional Roller-Shutter Transitions, Spatial Calibration Loader & Flat Landing Page (`features/landing`)
- **Room-to-Landing Exit Transition:** Cinematic black roller-shutter curtain (`ExitBar`) sweeping smoothly upward (`translate3d(0, 0, 0) \to translate3d(0, -100vh, 0)` with `0.68s cubic-bezier(0.76, 0, 0.24, 1)`) from the full-width black baseline (`#000000`) to cover the 3D room before mounting the landing page.
- **Landing-to-Room Re-entry Transition (Reverse Roller-Shutter):** Symmetric reverse roller-shutter curtain initiated when clicking "Re-enter" in the header, "Enter The Room" in the footer, pressing `Escape`, or navigating via browser history. While in flat mode (`isAway`), the black shutter is parked at `translate3d(0, -100vh, 0)`. On re-entry (`isReentering`), the solid black curtain smoothly rolls downward (`translate3d(0, 0, 0)` with `0.68s cubic-bezier(0.76, 0, 0.24, 1)`), progressively revealing the underlying 3D room from top to bottom before the bottom arch and "Exit The Room" button spring back into resting position.
- **Bespoke Spatial Calibration Wireframe Loader (`PortfolioLoader`):** Deep obsidian canvas (`#07080d`) with micro-dot grid ($24\text{px}$) and architectural sub-grid ($96\text{px}$). Features an active downward horizontal laser scanner beam (`.plScanBeam`) sweeping $0\% \to 100\%$ with phosphor trailing wash. Boxes materialize via a hybrid spatial-sequential activation algorithm with precision 1.5px cyan L-bracket corner reticles, live component `{w}×{h}` dimension badges, bespoke AI telemetry labels (`VIEWPORT // ASCII_CORE`, `IDENTITY // H1`, `ROLE // STREAM`, `NODE // 01..N`, `CTA // 01..N`, `BRAND`, `NAV // 01..N`), and a true pixel-aspect rule-of-thirds SVG grid with a concentric target reticle. Progressively sharpens live DOM typography from blur to crisp at $86\%$ and reveals the page via a cyan-white spectral edge wipe at $100\%$. Suppressed during re-entry closing (`!isClosing`).
- **Liquid Grid & Magic Cursor:** WebGL2 ripple background canvas responsive to cursor velocity and angular rotation. Suppressed on touch devices to avoid sticky artifacts.
- **Dynamic Role Typography:** Physics-driven `DynamicText` cycling roles (`AI Engineer`, `ML Engineer`, `Software Engineer`, `Creative Developer`).
- **Tactile Glass Exit Bar:** Sleek black exit bar (`#000000`) featuring WebGL2 optical refractive `TactileButton` ("Exit The Room" / "Re-enter").
- **Optical Liquid Glass Scrolled Navbar:** Scrolled sticky header integrates Glisse's `<Glass>` with chromatic dispersion (`0.4`), optical bend (`0.31`), and calibrated diffusion (`--lg-blur: 3px`), engineered without GPU compositor layer trapping (`z-index: 0` glass under `z-index: 1` nav items) to smoothly blur passing page text and images.
- **Header Identity & Navigation:** Clean typographic brand link (`AG / AI Engineer`) without prefix vector icons, paired with direct anchor links (`Work`, `Experience`, `Tech Stack`, `Activity`, `Contact`) streamlined by removing redundant metric link anchors.
- **Unified Column Geometry:** The Hero section (`.ldHero` with `width: 100%; padding: 0;` and `.ldHeroInner` with `padding: 64px max(24px, calc((100% - 1240px) / 2)) 0`) aligns horizontally with `.ldWrap` (`width: min(1240px, calc(100% - 48px)); margin: 0 auto;`), guaranteeing flush vertical alignment across all screen sizes.
- **Selected Work Responsive Showcase (`DomeGallery` & `MobileWorkGrid`):**
  - **Desktop (`>= 1024px`) & Tablet (`768px–1023px`):** Full-bleed, transparent-background GSAP 3D concave paraboloid dome gallery (`src/features/landing/components/dome-gallery/`) that reveals the interactive `LiquidGrid` background underneath and features a glassmorphic `Selected Work` pill badge (`backdrop-filter: blur(10px)`) anchored at the top-left of the stage matching the bottom hint pill. Supports infinite mouse dragging, directional pan arrows / keyboard arrows, horizontal touch swiping while prioritizing free native vertical page scrolling on touch screens, touch-tolerant `14px` card tapping, and a Gaussian proximity lens that eases smoothly to rest on pointer leave across all 8 portfolio projects (`COVID-19 Image Classification`, `OmniDoc RAG`, `OmniDoc-Vision`, `OmniOps SRE Agent`, `Enterprise Knowledge Copilot`, `Laya Fine-tuning Pipeline`, `Video KYC`, `Kanban Studio`), each illustrated with ultra-minimal `#09090b` smoked-glass 3D WebP artwork (`public/assets/projects/*.webp`). Clicking or tapping any card (including corner/edge tiles) triggers a zero-reflow 3D GSAP `CustomEase` morph into a portaled detail modal (`ProjectModal`) displaying the project overview, architectural summary, complete Technology Stack badges, engineering highlights, and a direct "View on GitHub" CTA.
  - **Mobile (`< 768px`):** Switches cleanly via `useResponsiveDevice` to a lightweight flat `MobileWorkGrid` displaying the uppercase monospace `Selected Work` kicker (matching `.ldKicker` in "About Me") above a responsive grid (**2 columns** at `375px–767px`, **1 column** below `375px`) with 3:4 smoked-glass project cards, titles and `Category · Year` overlaid over a bottom dark gradient inside each card, unobstructed vertical scrolling, and single-tap opening into the compact non-scrolling mobile `ProjectModal` (close `×` positioned at the top-right of the modal image and synchronized inner caption fade on close).

### 6.7. Interactive Tech Stack Section (`TechStackSection`)
- **Navigation:** Spring-animated tab switcher powered by `@uiarc/tabs` featuring a single persistent indicator pill. Indicator coordinates are calculated scroll-invariantly from `offsetLeft` and `offsetWidth`, preventing position jumps or freezes during touch scrolling.
- **Agent Harness Focus:** Dedicated category showcasing AI agent harnesses (CODEX, Claude Code, Antigravity, zCode, Cursor, Open Code) with custom monochrome vector icons and reverse hover contrast.
- **iOS Safari Optimization:** Hardware-composited text promotion (`translateZ(0)`) and container stacking isolation (`isolation: isolate`) guarantee active tab titles remain fully visible above the sliding indicator pill.
- **Responsive 2-Row Visual Clamping & Row Detection:** Rather than arbitrary item-count truncation (such as slicing 10 items), items flow naturally in a unified flex grid. The section dynamically calculates visual rows via `useIsomorphicLayoutEffect` and `ResizeObserver`. Categories that fit within 1 or 2 rows (such as Languages, Frontend, Databases, Agent Harness, and DevOps on desktop) render completely with `.notOverflowing` (`max-height: none; overflow: visible;`) without blur overlays or expand controls.
- **Lifecycle-Isolated Tab Panels:** Each `<TechTabPanel>` mounts inside its corresponding `<TabsContent>`, ensuring independent state management and immediate layout measurement upon activation. Switching tabs resets expansion state cleanly and eliminates cross-tab button leakage or stuck open states.
- **Progressive Truncation & Feathered Nocturnal Blur:** When items exceed 2 visual rows (such as All with 60 items, Data & AI with 24 items, or wrapped categories on mobile viewports), the container clamps to exactly 2 rows (calculated dynamically from the second row's bottom edge: `88px` desktop, `82px` tablet, `70px` small mobile), accompanied by a feathered blur overlay (`backdrop-filter: blur(10px)` with gradient `mask-image` matching `#0a0a0b` canvas) dissolving the lower boundary without harsh rectangular edges.
- **Smooth Dynamic Expansion:** A frosted glass pill button (`VIEW ALL TECHNOLOGIES (${count})` / `COLLAPSE STACK`) smoothly transitions the container `maxHeight` to its measured `scrollHeight` over a 0.42s cubic-bezier curve, pushing lower sections (`#ld-activity`) downward in natural document flow with 0 overlap; tab switches automatically reset expansion.

### 6.8. 3D Isometric GitHub Activity Skyline (`GithubActivitySection`)
- **Visualization:** Renders annual GitHub commit activity as a 3D isometric skyline ("As a city") with 3-face shaded cubes in GitHub green tones.
- **Features:** Diagonal rising wave animation on scroll, pinned best-day callout indicator, and interactive replay control.

### 6.9. Autonomous AI Pixel Tetris Canvas (`PixelTetris`)
- **Design:** Interactive bottom-of-page canvas running an automated Tetris AI that continuously clears rows within a controlled ceiling without overflowing upwards.
- **Responsive Resolution:** Standard $20\text{px}$ circular dots on desktop; dynamically scales down to $10\text{px}$ on mobile screens ($< 768\text{px}$), doubling the board height to 16 total rows (with 8–9 rows of active stacked blocks) and expanding to 28–30 columns for a dense, retro arcade visual aesthetic.
- **Footer:** High-tracking minimalist typography with smooth "Back to Top" scrolling.

### 6.10. Responsive Device Engine & Mobile 3D Room Bypass (`src/core/utils/responsive.ts`)
- **Dual-Condition Gate:** Evaluates $\text{allowRoom3D} = \text{isDesktop} \land \text{isFine} \land \neg\text{isTouch}$ via React 19 `useSyncExternalStore`.
- **Zero-Overhead Mobile Flow:** Any touch device or viewport $< 1024\text{px}$ completely bypasses `<RoomPreview>`, freeing GPU and WebGL resources and directing users immediately to the fast, battery-efficient `FlatLanding` portfolio.
- **Adaptive Touch Controls:** Replaces room re-entry buttons with a glass pill "Get in Touch" navigation CTA, collapses capabilities and social links to 2 columns on $\ge 375\text{px}$ and 1 column on $< 375\text{px}$, swaps `#ld-work` to the 2-to-1 `MobileWorkGrid` below `768px`, and renders a frosted `34×34px` circular `×` close button on the top-right corner of the compact mobile `ProjectModal` image.

### 6.11. Mobile Retro Arcade Handheld Experience (`src/features/arcade/components/`)
- **AssistiveTouch Floating Glisse Trigger (`MobileArcadeFab`):** Strictly visible on tablet and mobile (`<= 1024px` or coarse pointer; hidden on desktop where the 3D room arcade cabinet is active). Uses the circular icon-only `<GlisseButton>` (`from "glisse"`) with an AssistiveTouch concentric orb and gamepad glyph. Supports free pointer dragging across the screen and magnetically snaps to the nearest left or right screen edge on release (`computeAssistiveSnapPosition`), while opening the handheld console on tap.
- **Physical Handheld Console Form Factor (`MobileArcadeModal`):** Structured as an authentic portable handheld console (model DMG-05) with full responsive scaling across mobile (`320px–414px`) and tablet (`768px–1024px` portrait & landscape). Features a bead-blasted dark gunmetal aluminum and matte polycarbonate chassis, a recessed dark tempered glass display lens with `DOT MATRIX WITH STEREO SOUND` silkscreen and power LED, corner screws, and a top 4:3 CRT stage.
- **Translucent Smoked Cartridge Carousel:** In carousel mode, visitors swipe or browse 5 game cartridges featuring real macro-photography artwork showing gold PCB circuit traces, retro vector badges, and persistent local high scores.
- **Adaptive Ergonomic Touch Gamepad (`MobileGamepad`):** Mounted in the lower 45–50% of the chassis. Automatically reconfigures its action buttons based on the active game (*Flappy*: FLAP; *Pixel Run*: JUMP/SLIDE; *Tetris*: ROTATE/HARD DROP/HOLD; *Snake*: START; *Deparkanoid*: LAUNCH). Includes a molded ABS D-Pad, angled silicone `MENU` and `PAUSE` pills, drilled 12-hole acoustic speaker grille, and synthetic `KeyboardEvent` bridge with haptic feedback (`navigator.vibrate(10)`).
- **Universal Game Pause Engine:** Standardized `PAUSED` state across all 5 game engines, allowing instant pause/resume via the handheld `PAUSE` button or `P` key with visual canvas pause overlays and chiptune audio suspension.
- **High-DPI Fit Scaling:** Mathematical fit scaling with $2\times$ supersampled canvas rendering ensures complex games like *Cyber Tetris* fit completely within any mobile or tablet screen ratio without clipping or zoom distortion.

---

## 7. Non-Functional Requirements

| Category | Requirement | Target Metric |
| :--- | :--- | :--- |
| **Performance** | Framerate during 3D camera travel and idle parallax | Steady 60 FPS on dedicated GPUs; >30 FPS on integrated graphics |
| **Asset Size** | 3D models and video compression | Total 3D assets under 10 MB; ASCII WebM under 3 MB |
| **Accessibility** | Semantic HTML, keyboard traps, motion sensitivity | WCAG 2.1 Level AA compliant; respects `prefers-reduced-motion` |
| **Compatibility** | Modern browser support | Chrome 120+, Safari 17+, Firefox 120+, Edge 120+ |
| **Offline Resilience**| Network disconnection handling | Bundled JSON fallback for GitHub data; cached static assets |

---

## 8. Out of Scope

- User authentication, login accounts, and private dashboards.
- Dynamic CMS or database backends (all project data is strictly version-controlled in `src/data/content.ts`).
- Commercial game ROM distribution or copyright-infringing assets.
- Free avatar walking, physics collisions outside props, or first-person controls.
