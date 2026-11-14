# Design System

## 1. Design Direction

- **Style:** Nocturnal Cyberpunk / Minimal Premium Optical Glass
- **Mood:** Immersive, focused, nocturnal, technologically sophisticated, tactile, and restrained. Avoids visual clutter while embracing deep dark tones and laser-sharp neon accents.
- **Design Principles:**
  1. **Depth Over Flatness:** Use real 3D camera parallax, optical glass refractions, and isometric geometry rather than artificial drop-shadows.
  2. **Tactile Responsiveness:** Every interactive element must provide immediate physical feedback (spring physics, cursor tilt, sound effects, or light bloom).
  3. **Content Inaccessibility Prohibition:** Interactive 3D graphics must never obstruct or hide textual information from screen readers or keyboard users.
  4. **Intentional Neon Restraint:** Neon cyan and magenta serve as purposeful lighting anchors, never as garish background floodlights.

---

## 2. Brand & Identity

- **Brand Name:** Amirreza Gholipour
- **Title / Role:** AI Engineer & Machine Learning Specialist
- **Tagline:** Machine Learning Engineer · M.Sc. in Artificial Intelligence & Robotics
- **Brand Voice:** Direct, technical, articulate, evidence-driven, and devoid of marketing fluff or buzzwords.

---

## 3. Color Palette

### 3.1. Foundation Neutrals (Nocturnal Surface)
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `color-bg-deep` | `#080614` | 3D room background ambient baseline |
| `color-bg-pure` | `#000000` | Flat landing black baseline and ExitBar container |
| `color-surface-card` | `#120e24` | Desktop app windows and floating cards |
| `color-surface-translucent` | `rgba(18, 14, 36, 0.75)` | Frosted glass backdrops with `backdrop-filter: blur(12px)` |
| `color-border-subtle` | `rgba(255, 255, 255, 0.08)` | Minimal dividing lines and card borders |

### 3.2. Neon Lighting Accents
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `color-neon-cyan` | `#00e5ff` | Left LED shelf light, link highlights, Wi-Fi status |
| `color-neon-magenta`| `#d946ef` | Right LED shelf light, primary CTAs, active window headers |
| `color-neon-purple` | `#e040fb` | Disco drop lighting, ambient room glow |
| `color-accent-amber`| `#f59e0b` | "Read portfolio" link, warning alerts |

### 3.3. GitHub Contribution Greens (Activity City)
| Token | Hex Value | Contribution Level |
| :--- | :--- | :--- |
| `color-gh-0` | `#161b22` | Level 0: No contributions |
| `color-gh-1` | `#0e4429` | Level 1: 1–3 contributions |
| `color-gh-2` | `#006d32` | Level 2: 4–6 contributions |
| `color-gh-3` | `#26a641` | Level 3: 7–9 contributions |
| `color-gh-4` | `#39d353` | Level 4: 10+ contributions / Best Day Callout |

### 3.4. Semantic Text
| Token | Value | Usage |
| :--- | :--- | :--- |
| `color-text-primary` | `#f8fafc` (98% white) | Primary headings and important metrics |
| `color-text-secondary` | `#94a3b8` (Slate 400) | Body paragraphs, descriptions, dates |
| `color-text-muted` | `#64748b` (Slate 500) | Microcopy, copyright, hotkeys |

---

## 4. Typography

### 4.1. Font Families
- **Display & UI Sans:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, sans-serif
- **Code & Monospace:** `JetBrains Mono`, `Fira Code`, `SF Mono`, `Menlo`, monospace
- **Dynamic Text Display:** Fluid display typography for role cycling in `DynamicText`

### 4.2. Type Scale & Hierarchy
| Style | Size / Line Height | Tracking | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `clamp(2.5rem, 6vw, 4.5rem) / 1.1` | `-0.03em` | 700 Bold | Flat hero name and main greeting |
| **Section Title**| `clamp(1.75rem, 3.5vw, 2.5rem) / 1.2` | `-0.02em` | 600 SemiBold | Tech Stack, Experience, Projects |
| **Window Header**| `0.875rem (14px) / 1.2` | `0.05em` | 600 SemiBold | Virtual desktop window titlebars |
| **Body Large** | `1.125rem (18px) / 1.6` | `-0.01em` | 400 Regular | Introductory paragraphs |
| **Body Regular** | `0.9375rem (15px) / 1.5` | `normal` | 400 Regular | Card descriptions, experience bullets |
| **Mono Micro** | `0.75rem (12px) / 1.4` | `0.1em` | 500 Medium | Tooltips, keyboard tags (`ESC`), status bar |

---

## 5. Spacing & Responsive Grid

### 5.1. Spacing Scale
Based on an 8-point harmonic grid:
- `space-1`: `4px`
- `space-2`: `8px`
- `space-3`: `12px`
- `space-4`: `16px`
- `space-6`: `24px`
- `space-8`: `32px`
- `space-12`: `48px`
- `space-16`: `64px`

### 5.2. Breakpoints & Viewport Boundaries
| Viewport | Min Width | Target Verification Behavior |
| :--- | :--- | :--- |
| **Mobile Compact** | `< 375px` (e.g. 320px) | Single-column collapse (`grid-template-columns: 1fr`) for tools and social links; stacked cards |
| **Mobile Standard** | `375px – 480px` | 2-column side-by-side grids; container width `calc(100% - 20px)`; text-overflow ellipsis |
| **Mobile Wide** | `481px – 767px` | 2-column tools, full-width touch targets (>=44px), inertia momentum scrolling |
| **Tablet** | `768px – 1023px` | 3-column tools, 3D room bypass for touch, transparent 3D Selected Work Dome with `34×34px` directional arrows & horizontal touch pan |
| **Desktop Baseline**| `1024px – 1440px`| Full 3D room hero with curved monitor; flush 1240px container alignment between Hero and sections |
| **Wide Desktop** | `1440px+` | Fixed field-of-view (`ROOM_FOV = 40`); centered 1240px column (`min(1240px, calc(100% - 48px))`) |

### 5.3. Section Padding Tokens
Standardized responsive vertical and horizontal padding across all `.ldWrap > section` and `.ldWrap > footer` containers:
- **Desktop ($\ge 1024\text{px}$):** `padding: 72px 40px`
- **Tablet ($768\text{px} - 1023\text{px}$):** `padding: 60px 32px`
- **Mobile Wide ($481\text{px} - 767\text{px}$):** `padding: 52px 24px`
- **Mobile Compact ($< 481\text{px}$):** `padding: 44px 18px`

---

## 6. Component Guidelines

### 6.1. WebGL2 Optical Glass Buttons (`TactileButton`)
- Employs physical light refraction shader with chromatic dispersion.
- Features dynamic surface normals responding to cursor hover angle.
- Renders smooth spring-damped press feedback (`scale: 0.96`).

### 6.2. Desktop OS Window (`MonitorDesktop`)
- Modern dark titlebar with traffic light control dots (`Close`, `Maximize`, `Restore`).
- Window drag initiates from header title region with pointer capture.
- Constrained strictly within virtual desktop bounds to prevent clipping.

### 6.3. Arc UI Segmented Tabs (`@uiarc/tabs`)
- Spring-physics sliding active indicator pill implemented as a single persistent DOM element inside `TabsPrimitive.List`.
- Scroll-invariant geometry calculation ($x$, $\text{width}$) derived directly from active tab's `offsetLeft` and `offsetWidth`, preventing indicator drift, jumps, or frozen transitions during mobile horizontal scrolling.
- Accessible ARIA tabs and keyboard arrow navigation.
- High-contrast hover inversion for technology badge icons.
- WebKit stacking context isolation (`isolation: isolate` on trigger, `-webkit-transform: translateZ(0)` on label) preventing indicator overlay occlusion on iOS Safari.

### 6.4. Responsive Two-Row Visual Expander (`TechStackSection`)
- Dynamic 2-row visual clamping: Items flow continuously in a single flex-wrap grid container (`.techGrid`).
- Dynamic row measurement via `useIsomorphicLayoutEffect` evaluates unique chip vertical offsets (`offsetTop`). Categories that fit within $\le 2$ rows on the active viewport require zero truncation, rendering with `.notOverflowing` (`max-height: none`, `overflow: visible`), zero blur, and no expand controls.
- Categories spanning $> 2$ rows clamp to the exact pixel boundary of Row 2 (`secondRowBottom = top + offsetHeight`, defaulting to `88px` desktop, `82px` tablet, `70px` small mobile).
- Layered `.techBlurOverlay` (`backdrop-filter: blur(10px)` with progressive vertical gradient `mask-image` matching the nocturnal `#0a0a0b` background) seamlessly dissolves the lower edge of Row 2.
- Hardware-accelerated smooth height transition (`transition: max-height 0.42s cubic-bezier(0.16, 1, 0.3, 1)`) expanding smoothly to the tab's measured `scrollHeight` without jumping or clipping lower page sections.
- Minimalist frosted glass pill button (`VIEW ALL TECHNOLOGIES (${count})` / `COLLAPSE STACK`) with rotating SVG chevron.

### 6.5. Selected Work 3D Dome, Mobile 2-to-1 Card Grid & Compact Modal (`DomeGallery` & `MobileWorkGrid`)
- **Transparent Stage & Glassmorphic Badges (`DomeGallery`):** Transparent full-section canvas (`.domeStage { background: transparent }`) revealing the underlying `LiquidGrid` backdrop, with matching frosted dark pill badges (`backdrop-filter: blur(10px)`) for the top-left `Selected Work` title badge and bottom navigation hint (`Drag to explore...` on desktop, `Swipe horizontally or use arrows...` on touch).
- **Minimalist Smoked-Glass Project Cards:** All 8 projects use consistent `#09090b` smoked-glass and brushed-metal studio WebP renders (`public/assets/projects/*.webp`) inside crisp `1px solid rgba(255, 255, 255, 0.08)` card frames.
- **Mobile 2-to-1 Grid (`< 768px` — `MobileWorkGrid`):** Uses the uppercase monospace `Selected Work` kicker (`.mobileWorkKicker`, `11px` mono with `#3b82f6` star matching `.ldKicker` in "About Me") above a 2-column grid at `375px–767px` that collapses to 1 column below `375px`. Each 3:4 card embeds title (`13px`) and `Category · Year` (`9.5px`) directly over a bottom dark gradient scrim (`linear-gradient(180deg, rgba(8, 9, 13, 0) 0%, rgba(8, 9, 13, 0.72) 48%, rgba(8, 9, 13, 0.94) 100%)`) for crisp contrast without external pop-in on modal close.
- **Responsive `ProjectModal`:** On desktop/tablet (`>= 768px`), displays a two-column frosted panel (`media` left, `copy` right with `×` in the header row and external `<CardCaption>` below). On mobile (`< 768px`), places a `34×34px` frosted circular `×` close control at the top-right corner of `.modalMedia` (`top: 12px; right: 12px`), suppresses external `<CardCaption>`, and calibrates compact spacing (`panelH <= min(vh - 24, 748)`) so the full modal reads without vertical scrolling.
- *(Note: `WorkAccordion.tsx` remains tested in the codebase as a legacy module no longer mounted in `FlatLanding`.)*

### 6.6. High-Density Mobile Pixel Tetris (`PixelTetris`)
- Circular matrix cells scale from standard $20\text{px}$ (desktop) to $10\text{px}$ (mobile).
- Expands vertical board capacity from 8 to 16 rows and horizontal capacity to 28–30 columns.
- Increases prefilled mid-game rows to 7 and stack ceiling to 9 rows, doubling active block density.

### 6.7. Optical Refractive Liquid Glass Scrolled Navbar (`glisse`)
- True physical light refraction with chromatic dispersion (`--lg-glass-bend: 0.31`, `--lg-glass-dispersion: 0.4`, `--lg-rim-shine: 0`).
- Seamless rectangular geometry (`borderRadius: 0`, `background: "none"`) mounted inside the sticky header.
- Calibrated frosted diffusion (`--lg-blur: 3px`) providing authentic Apple-grade optical blur for underlying text, ASCII room video, and cards.
- Non-isolated GPU compositor architecture (`z-index: 0` glass with `z-index: 1` interactive controls, zero `will-change`) allowing hardware-accelerated sampling over the underlying page canvas.
- Minimalist typographic identity (`.ldLogo` displaying `AG / AI Engineer` directly without decorative prefix iconography) and focused section navigation (`Work`, `Experience`, `Tech Stack`, `Activity`, `Contact`).

### 6.8. Spatial Calibration Wireframe Loader & Bidirectional Roller-Shutter Transitions (`PortfolioLoader` & `ExitBar`)
- **Nocturnal Obsidian Calibration Surface (`.plSheet`):** `#07080d` canvas with micro-dot grid ($24\text{px}$) and architectural sub-grid ($96\text{px}$) accented by cyan radial lighting (`rgba(56, 189, 248, 0.055)`).
- **Active Downward Spatial Laser Scanner Beam (`.plScanBeam`):** A razor-sharp cyan-white horizontal beam with phosphor trailing wash sweeping down the viewport ($0\% \to 100\%$) during the mapping phase.
- **Precision 1.5px L-Bracket Corner Reticles (`.corners`):** Crisp cyan L-brackets on all four corners of every scanned box (`8px × 1.5px` and `1.5px × 8px` arms).
- **Hero Banner Spatial Calibration HUD:** True pixel-aspect SVG grid inside the hero banner box with rule-of-thirds dashed lines, corner vector ticks, and a concentric circular target reticle (`<circle>`) preserving circular geometry across desktop and mobile viewports.
- **Bespoke AI/Spatial Telemetry Labels:** Specialized system labels tailored to Amirreza Gholipour's AI portfolio (`VIEWPORT // ASCII_CORE`, `IDENTITY // H1`, `ROLE // STREAM`, `NODE // 01..N`, `CTA // 01..N`, `BRAND`, `NAV // 01..N`, `SURFACE // CARD`).
- **Blur-to-Crisp Typography Lock & Spectral Reveal Wipe:** Boxes initialize with blur (`filter: blur(2.5px) -> blur(0px)`), with live DOM typography sharpening from `blur(3px)` to crisp focus at $86\%$ progress, followed by a cyan-white spectral edge (`.plEdge`) wiping open the view at $100\%$ (`cubic-bezier(0.77, 0, 0.175, 1)`).
- **Bidirectional Black Roller-Shutter Transitions (`ExitBar`):**
  - *Exit (Room $\to$ Landing):* Upward curtain sweep (`translate3d(0, 0, 0) \to translate3d(0, -100vh, 0)` with `0.68s cubic-bezier(0.76, 0, 0.24, 1)`) originating from the full-width `#000000` baseline, smoothly occluding the 3D room before unveiling the landing loader.
  - *Re-enter (Landing $\to$ Room):* Symmetric downward curtain sweep (`translate3d(0, -100vh, 0) \to translate3d(0, 0, 0)` with `0.68s cubic-bezier(0.76, 0, 0.24, 1)`), revealing the 3D room progressively from top to bottom before the bottom arch and tactile button spring into position.

### 6.9. Mobile Retro Arcade Handheld Hardware Tokens (`MobileArcadeModal` & `MobileGamepad`)
- **Industrial Chassis Finish:** Bead-blasted dark gunmetal aluminum and matte charcoal polycarbonate surface (`handheld_shell_texture_1794477536843.jpg`) over `#1c1e22` / `#212327` baseplates, eliminating garish neon AI slop in favor of authentic tactile hardware aesthetics.
- **Machined Hardware Details:** Radial-gradient recessed corner screw sockets (`#2f3339` to `#111316`), drilled 12-hole acoustic speaker grille, and high-contrast silkscreen typography (`MODEL DMG-05 · TACTILE SHELL`).
- **Recessed Tempered Glass Display Bezel:** Multi-layer optical border with `DOT MATRIX WITH STEREO SOUND` dual-color silkscreen, active red `BATTERY` power LED, and authentic 4:3 CRT scanline wash.
- **Smoked Translucent Cartridges:** Selection carousel banners feature studio macro photography of smoked dark grey cartridges with gold PCB traces and warm amber highlights (`retro_cartridge_header_1794477537457.jpg`).
- **Tactile Sculpted Controls:**
  - *D-Pad:* Molded matte dark charcoal ABS cross with concave center pivot and directional arrow debossing.
  - *System Controls:* Angled pill-shaped silicone rubber buttons for `MENU` and `PAUSE` (`#2d3139`) with $1.5\text{px}$ travel depression.
  - *Action Cluster:* High-profile molded resin spherical buttons in vermilion (`#ea580c`), burgundy (`#be123c`), and amber (`#d97706`) mounted inside recessed oval socket bezels with silkscreened letters (`A`, `B`, `C`).

---

## 7. Motion & Physics Tokens

### 7.1. Camera Motion
- **Travel Duration:** `0.7s` (`ROOM_TRANSITION_SECONDS`) between Room Overview, Monitor, and Arcade.
- **Easing Curve:** Quintic smootherstep ($6t^5 - 15t^4 + 10t^3$) guaranteeing zero second-derivative acceleration spikes ($C^2$ continuity).
- **Parallax Dampening:** Exponential easing with time constant $\tau = 0.12\text{s}$; maximum idle travel limited to $\pm 0.24$ horizontal and $\pm 0.12$ vertical world units.

### 7.2. Roller-Shutter & Loader Motion Curves
- **Roller-Shutter Upward Curtain (Exit):** $0.68\text{s}$ duration with `cubic-bezier(0.76, 0, 0.24, 1)`.
- **Roller-Shutter Downward Curtain (Re-enter):** $0.68\text{s}$ duration with `cubic-bezier(0.76, 0, 0.24, 1)`.
- **ExitBar Arch Spring Dynamics:** Tuck target at $-22\text{px}$ during shutter roll, springing back to $0\text{px}$ upon docking ($k = 0.08, d = 0.82$).
- **Loader Downward Laser Scanner Beam:** $0.0\text{s} \to 2.2\text{s}$ cubic ease-in-out sweep (`computeScannerLinePercent`).
- **Typography Sharpening Lock:** At $86\%$ progress threshold, `blur(3px) \to blur(0px)` over $0.42\text{s}$ cubic-bezier.
- **Spectral Edge Wipe:** $0.98\text{s}$ duration with `cubic-bezier(0.77, 0, 0.175, 1)`.

### 7.3. Accessibility & Reduced Motion
When `prefers-reduced-motion: reduce` is detected:
- Idle camera parallax is completely disabled.
- Camera destination transitions jump instantaneously or resolve via brief crossfade.
- `PixelTetris` canvas renders a static frame instead of a continuous animation loop.
- `DynamicText` cycles text without kinetic spring oscillations.
- `MobileArcadeModal`, `MobileArcadeFab`, and arcade canvas prompt labels (`SnakeGame`, `Deparkanoid`) disable pulsing/blinking animations and CSS transitions.
- `DomeGallery` and `ProjectModal` fall back cleanly and preserve semantic accessibility without disorienting 3D motion.

### 7.4. Selected Work Dome & Modal Morph Curves (`gsap`)
- **Card-to-Modal Morph (`CustomEase`):** `"M0,0 C0.16,1 0.3,1 1,1"` (`0.68s` open, `0.56s` close), keeping `.modalCopy` locked to its target width so multi-line descriptions and tech stack badges never reflow mid-flight.
- **Cursor-Leave Lens Settling:** `focusStrength` eases continuously toward `0` (`FOCUS_STRENGTH_OUT_LERP = 0.065`) on `pointerleave` for gradual surface relaxation.
- **Mobile Inner Overlay Sync:** On close, `.modalMediaCloseBtn` fades out immediately (`0.14s`) while the inner caption scrim fades in (`0.34s` delay `0.18s`) inside the shrinking card frame.
