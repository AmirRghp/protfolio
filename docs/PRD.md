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
2. A sleek, high-performance **Flat Landing Portfolio** accessible via a digital laser scanline portal transition, featuring fluid liquid grid effects, an Arc UI tech stack tabbed explorer, and a 3D isometric GitHub contribution skyline.

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
- **Disco Drop Sync:** During the music drop (seconds 33–57 and 81–105), the entire room shifts into dynamic disco strobe lighting, while the monitor enters Drop Sync mode with a synchronized 2D dancing cat.

### 6.6. Digital Laser Portal Transition & Flat Landing Page (`features/landing`)
- **Transition:** Seamless portal sweep with vertical laser scanlines transitioning from the 3D room to a full-bleed ASCII room loop video (`ascii-room.webm`).
- **Liquid Grid & Magic Cursor:** WebGL2 ripple background canvas responsive to cursor velocity and angular rotation. Suppressed on touch devices to avoid sticky artifacts.
- **Dynamic Role Typography:** Physics-driven `DynamicText` cycling roles (`AI Engineer`, `ML Engineer`, `Software Engineer`, `Creative Developer`).
- **Tactile Glass Exit Bar:** Sleek black exit bar (`#000000`) featuring WebGL2 optical refractive `TactileButton` ("Exit The Room" / "Re-enter").
- **Optical Liquid Glass Scrolled Navbar:** Scrolled sticky header integrates Glisse's `<Glass>` with chromatic dispersion (`0.4`), optical bend (`0.31`), and calibrated diffusion (`--lg-blur: 3px`), engineered without GPU compositor layer trapping (`z-index: 0` glass under `z-index: 1` nav items) to smoothly blur passing page text and images.
- **Header Identity & Navigation:** Clean typographic brand link (`AG / AI Engineer`) without prefix vector icons, paired with direct anchor links (`Work`, `Experience`, `Tech Stack`, `Activity`, `Contact`) streamlined by removing redundant metric link anchors.
- **Unified Column Geometry:** The Hero section (`.ldHero` with `width: 100%; padding: 0;` and `.ldHeroInner` with `padding: 64px max(24px, calc((100% - 1240px) / 2)) 0`) aligns horizontally with `.ldWrap` (`width: min(1240px, calc(100% - 48px)); margin: 0 auto;`), guaranteeing flush vertical alignment across all screen sizes.

### 6.7. Interactive Tech Stack Section (`TechStackSection`)
- **Navigation:** Spring-animated tab switcher powered by `@uiarc/tabs` featuring a single persistent indicator pill. Indicator coordinates are calculated scroll-invariantly from `offsetLeft` and `offsetWidth`, preventing position jumps or freezes during touch scrolling.
- **Agent Harness Focus:** Dedicated category showcasing AI agent harnesses (CODEX, Claude Code, Antigravity, zCode, Cursor, Open Code) with custom monochrome vector icons and reverse hover contrast.
- **iOS Safari Optimization:** Hardware-composited text promotion (`translateZ(0)`) and container stacking isolation (`isolation: isolate`) guarantee active tab titles remain fully visible above the sliding indicator pill.
- **Progressive Truncation & Blur:** Displays the first 10 items initially for categories with $> 10$ technologies, accompanied by a soft frosted blur overlay (`backdrop-filter: blur(4px)`).
- **Smooth Expand/Collapse:** A letter-spaced monospace button (`VIEW ALL TECHNOLOGIES (60)` / `COLLAPSE STACK`) triggers a hardware-accelerated 60fps CSS Grid transition (`grid-template-rows: 0fr -> 1fr`) with rotating chevron; tab switches automatically reset expansion.

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
- **Adaptive Touch Controls:** Replaces room re-entry buttons with a glass pill "Get in Touch" navigation CTA, collapses capabilities and social links to 2 columns on $\ge 375\text{px}$ and 1 column on $< 375\text{px}$, and includes a circular glass ✕ close button on the Work accordion.

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
