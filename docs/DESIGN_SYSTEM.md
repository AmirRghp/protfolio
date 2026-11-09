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
| **Tablet** | `768px – 1023px` | 3-column tools, 3D room bypass for touch, fluid project accordion columns |
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
- Spring-physics sliding active indicator pill.
- Accessible ARIA tabs and keyboard arrow navigation.
- High-contrast hover inversion for technology badge icons.

### 6.4. Progressive Tech Stack Expander (`TechStackSection`)
- Truncates initial display to first 10 items for categories with $> 10$ technologies.
- Layered `.techBlurOverlay` (`backdrop-filter: blur(4px)`) softens the lower boundary.
- Hardware-accelerated 60fps CSS Grid transition (`grid-template-rows: 0fr -> 1fr`) powered by cubic-bezier easing.
- Minimalist uppercase letter-spaced monospace button (`VIEW ALL TECHNOLOGIES (60)` / `COLLAPSE STACK`) with rotating SVG chevron.

### 6.5. Mobile Work Accordion Close Control (`WorkAccordion`)
- Circular optical glass `✕` icon button ($36\text{px}$) with $50\%$ border radius.
- Positioned in the header row directly opposite the branch title for instant thumb accessibility.
- Branch titles maintain stabilized typography (`clamp(20px, 6.4vw, 24px)`) when sibling branches expand.

### 6.6. High-Density Mobile Pixel Tetris (`PixelTetris`)
- Circular matrix cells scale from standard $20\text{px}$ (desktop) to $10\text{px}$ (mobile).
- Expands vertical board capacity from 8 to 16 rows and horizontal capacity to 28–30 columns.
- Increases prefilled mid-game rows to 7 and stack ceiling to 9 rows, doubling active block density.

---

## 7. Motion & Physics Tokens

### 7.1. Camera Motion
- **Travel Duration:** `0.7s` (`ROOM_TRANSITION_SECONDS`) between Room Overview, Monitor, and Arcade.
- **Easing Curve:** Quintic smootherstep ($6t^5 - 15t^4 + 10t^3$) guaranteeing zero second-derivative acceleration spikes ($C^2$ continuity).
- **Parallax Dampening:** Exponential easing with time constant $\tau = 0.12\text{s}$; maximum idle travel limited to $\pm 0.24$ horizontal and $\pm 0.12$ vertical world units.

### 7.2. Accessibility & Reduced Motion
When `prefers-reduced-motion: reduce` is detected:
- Idle camera parallax is completely disabled.
- Camera destination transitions jump instantaneously or resolve via brief crossfade.
- `PixelTetris` canvas renders a static frame instead of a continuous animation loop.
- `DynamicText` cycles text without kinetic spring oscillations.
