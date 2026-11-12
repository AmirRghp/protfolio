# Design Document: Mobile Retro Arcade Handheld Experience

- **Date:** 2026-11-12
- **Topic:** Mobile Retro Arcade Handheld Experience (`mobile-arcade-handheld`)
- **Author:** Antigravity AI & Amirreza Gholipour
- **Status:** Draft for Review

---

## 1. Intent and the Why

The portfolio features a nocturnal 3D cyberpunk workspace with a playable retro arcade cabinet containing 5 custom Canvas mini-games (*Cyber Flappy*, *Cyber Tetris*, *Pixel Run*, *Snake Grid*, *Deparkanoid*) plus an embedded PS1 demo.

On mobile and tablet devices, the 3D room is intentionally disabled (`allowRoom3D: false`) to conserve GPU, memory, and battery, serving the 2D `FlatLanding` page directly. However, this optimization previously made the arcade machine and all 5 games completely inaccessible to mobile visitors. Furthermore, the mini-games were designed for desktop keyboards (arrow keys, WASD, spacebar).

The goal of this project is to bring the arcade games to mobile visitors via a dedicated **Retro Handheld Console** overlay accessible from the mobile flat landing, complete with responsive virtual touch controls, haptic feedback, and zero performance regression on low-power devices.

---

## 2. Goals, Non-Goals, and Anti-Goals

### 2.1. Goals
1. **Seamless Mobile Entry:** Provide an intuitive, ergonomic call-to-action on mobile (`FlatLanding`) that invites visitors to play the arcade games.
2. **Retro Handheld Aesthetic:** Deliver a nostalgic, high-polish fullscreen mobile experience inspired by classic handheld consoles (e.g. Game Boy, Neo Geo Pocket) with a mini CRT scanline screen and cyberpunk neon accents.
3. **Ergonomic Virtual Gamepad:** Provide responsive, low-latency on-screen touch controls (D-Pad + Action buttons A/B + Start/Select) that work seamlessly with one or two thumbs.
4. **Zero-Refactor Game Compatibility:** Bridge virtual touch inputs directly to standard browser `KeyboardEvent` dispatches so the existing game loops (`FlappyGame`, `TetrisGame`, `PixelRunGame`, `SnakeGame`, `Deparkanoid`) function without rewriting their core engine loops.
5. **Orientation Support:** Primarily optimize for vertical (Portrait) phone orientation (screen on top, gamepad on bottom), while gracefully adapting to horizontal (Landscape) orientation (screen in center, D-pad on left, buttons on right).
6. **Battery & Performance Friendly:** Cleanly unmount or pause the canvas rendering loop and audio synthesizers when the arcade modal is closed.

### 2.2. Non-Goals
1. **No 3D Room on Mobile:** We will not load Three.js / R3F or the 3D room mesh on mobile devices.
2. **No Crash Bandicoot Touch Emulation:** The PS1FUN iframe requires heavy desktop emulator mappings and excessive network data; it will be marked as "Desktop Only" on mobile with an optional external link fallback.
3. **No External Libraries:** No heavy gamepad or joystick NPM libraries; pure React + TypeScript + CSS modules with native touch/pointer events and `navigator.vibrate`.

### 2.3. Anti-Goals
1. **No Scroll Hijacking on Landing:** The arcade overlay must be an explicit modal/portal with body scroll lock, not an inline page section that causes accidental page scrolling while playing games.
2. **No Obscuring the Gameplay:** Virtual buttons must not be placed directly over the gameplay canvas in portrait mode; thumbs must remain in the dedicated lower chassis area.

---

## 3. Constraints

- **Platform:** Mobile and tablet viewports (`< 1024px` or `pointer: coarse`).
- **Touch Latency:** Touch events (`pointerdown`, `pointerup`, `touchstart`, `touchend`) must have zero delay, `touch-action: none` to prevent iOS/Android double-tap zoom or gesture navigation interference.
- **Audio Autoplay Policies:** Web Audio `AudioContext` requires user gesture activation before emitting sound.
- **Dependencies:** React 19, TypeScript, CSS Modules, Vite. Zero new external dependencies.

---

## 4. Approaches Considered

### Approach A: In-Page Embedded Arcade Section (Rejected)
- Add a new section in `FlatLanding.tsx` between Selected Work and Tech Stack containing an embedded canvas and game cards.
- **Tradeoffs:** High risk of accidental vertical page scrolling when swiping or tapping buttons; canvas height is restricted; breaks the focused, immersive feel of an arcade.

### Approach B: Simple Desktop ArcadeMenu Modal with Floating Buttons (Rejected)
- Render the existing desktop `ArcadeMenu` in a basic popup modal and overlay semi-transparent buttons directly on top of the 4:3 screen.
- **Tradeoffs:** Thumbs cover 40% of the active playing field; desktop menu layout looks cramped and disproportionate on tall portrait mobile screens.

### Approach C: Dedicated Fullscreen Retro Handheld Console Overlay (Selected)
- A dedicated mobile modal component (`MobileArcadeModal`) structured like a portable retro handheld gaming console:
  - Top Half: 4:3 CRT monitor with retro frame, scanlines, game selection carousel, and active canvas.
  - Bottom Half: Ergonomic physical-style gamepad (D-Pad, A/B action buttons, Pause/Select).
  - Floating CTA Pill on `FlatLanding` plus a button in the Hero section.
- **Why Picked:** Provides the highest visual polish, authentic retro nostalgia, maximum playability without thumb obstruction, and complete isolation from landing page scroll state.

---

## 5. Detailed Architecture & Design

### 5.1. Entry Points in FlatLanding (`src/features/landing/components/`)
1. **Floating Action Pill (`MobileArcadeFab`):**
   - Rendered on mobile (`device.isMobileOrTablet || !device.allowRoom3D`).
   - Position: Fixed at bottom-center / bottom-right (`bottom: max(18px, env(safe-area-inset-bottom))`), above the bottom edge.
   - Styling: Nocturnal tactile glass button with cyan/magenta neon glow: `[ 🕹️ Play Arcade · 5 Games ]`.
   - Accessible label and smooth fade-in once the intro/loader settles.
2. **Hero Secondary Action:**
   - In `FlatLanding.tsx` within `.ldActions`, add an arcade trigger button or pill alongside "See my work" and "Get in Touch".
3. **State Management:**
   - Controlled via `isMobileArcadeOpen: boolean` state inside `FlatLanding.tsx` or `App.tsx`.
   - When opened: Body scroll is locked (`overflow: hidden`), URL hash optionally set to `#arcade`, and Escape/hardware back button closes the modal.

### 5.2. Handheld Console Layout (`src/features/arcade/components/MobileArcadeModal.tsx`)
Fullscreen container (`fixed inset-0 z-50 bg-[#080614] flex flex-col`):

```text
+-------------------------------------------------------------+
| [✕ Close]              NEON HANDHELD                [🔊/🔇] | <- Header bar
+-------------------------------------------------------------+
|                                                             |
|   +-----------------------------------------------------+   |
|   | CRT Screen Frame (Scanlines, Vignette, CRT Curve)   |   | <- Top 50-55%
|   |                                                     |   |
|   |  - Selection Mode: 5-Game Carousel & Info           |   |
|   |  - Gameplay Mode: 100% Full-Bleed Canvas            |   |
|   +-----------------------------------------------------+   |
|                                                             |
+-------------------------------------------------------------+
|                                                             |
|       [▲]                             [Context Action B]    | <- Bottom 45-50%
|   [◀] [●] [▶]       [MENU]   [PAUSE]  [Context Action A]    |    Adaptive Gamepad
|       [▼]                                                   |
|                                                             |
+-------------------------------------------------------------+
```

- **Viewport Display Modes:**
  - **Carousel Mode (Menu):** Displays the swipeable 5-game selector with retro pixel icon, title, year, description, and high score.
  - **Gameplay Mode:** The active game canvas expands to 100% of the CRT frame (maintaining `object-fit: contain`). All game engines already render their own live score, levels, and state directly on canvas, maximizing vertical viewing space.

### 5.3. Adaptive Touch Gamepad & Input Bridge (`src/features/arcade/components/MobileGamepad.tsx`)
Rather than a rigid, static layout with dead buttons, `MobileGamepad` adapts its action buttons and labels dynamically based on `activeGameId`:

- **Per-Game Control Profile Registry:**
  ```ts
  export type GameControlProfile = {
    showDpad: boolean;
    actions: Array<{ id: string; label: string; key: string; code?: string; color?: string }>;
  };

  export const GAME_CONTROL_PROFILES: Record<string, GameControlProfile> = {
    flappy: {
      showDpad: false,
      actions: [{ id: "flap", label: "FLAP", key: " ", code: "Space" }],
    },
    deparkanoid: {
      showDpad: true,
      actions: [{ id: "launch", label: "LAUNCH", key: " ", code: "Space" }],
    },
    pixelrun: {
      showDpad: false,
      actions: [
        { id: "jump", label: "JUMP", key: "ArrowUp", code: "ArrowUp" },
        { id: "slide", label: "SLIDE", key: "ArrowDown", code: "ArrowDown" },
      ],
    },
    snake: {
      showDpad: true,
      actions: [{ id: "start", label: "START", key: " ", code: "Space" }],
    },
    tetris: {
      showDpad: true,
      actions: [
        { id: "rotate", label: "ROTATE", key: "ArrowUp", code: "ArrowUp" },
        { id: "drop", label: "HARD DROP", key: " ", code: "Space" },
        { id: "hold", label: "HOLD", key: "c", code: "KeyC" },
      ],
    },
  };
  ```

- **Input Normalization & Delivery:**
  - *Flappy*, *Tetris*, and *Pixel Run* already listen to `window.addEventListener("keydown")`.
  - To ensure 100% reliable input delivery without complex focus management, *SnakeGame.tsx* and *Deparkanoid.tsx* are lightly normalized to also attach a `window` listener (mirroring the other three games).
  - Virtual gamepad buttons send a single `keydown` on press and a single `keyup` on release:
    ```ts
    function pressKey(key: string, code?: string) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key, code: code ?? key, bubbles: true }));
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(10); } catch {}
      }
    }
    function releaseKey(key: string, code?: string) {
      window.dispatchEvent(new KeyboardEvent("keyup", { key, code: code ?? key, bubbles: true }));
    }
    ```

- **Direct Canvas Gestures & Scaling:**
  - Canvases maintain aspect-ratio via `object-fit: contain` and max width/height bounded by the CRT container.
  - Interactive canvas games (e.g., `Deparkanoid`) use `getBoundingClientRect()` relative coordinates, so scaling causes zero touch offset or drift.
  - *Flappy:* Tap anywhere on the CRT screen flaps.
  - *Deparkanoid:* Dragging finger across the CRT screen moves paddle via pointer events.

### 5.4. Game Selection & Mobile Carousel
- In mobile, the carousel presents the **5 native Canvas games** (Cyber Flappy, Cyber Tetris, Pixel Run, Snake Grid, Deparkanoid) cleanly matching the `[ 🕹️ Play Arcade · 5 Games ]` badge.
- *Crash Bandicoot* (PS1 emulator) is excluded from the mobile carousel to ensure 100% of the mobile experience runs at a native 60fps with zero third-party iframe friction. A small footer link or info note ("Play PS1 Crash on Desktop") is included for desktop visitors.

### 5.5. Game Compatibility Matrix
| Game | Mobile Status | Primary Touch Control | Secondary Screen Touch |
| :--- | :--- | :--- | :--- |
| **Cyber Flappy** | Full 60fps | Button A / Up | Direct screen tap |
| **Deparkanoid** | Full 60fps | D-Pad Left/Right + Button A | Direct finger drag on screen |
| **Pixel Run** | Full 60fps | Button A (Jump) + Button B (Slide) | Top/bottom screen tap |
| **Snake Grid** | Full 60fps | D-Pad (Up, Down, Left, Right) | N/A |
| **Cyber Tetris** | Full 60fps | D-Pad (Move/Soft Drop), A (Hard Drop), B (Rotate), X (Hold) | N/A |
| **Crash Bandicoot** | Desktop Only | Labeled "Desktop Only" with PS1FUN link | N/A |

### 5.5. Orientation Handling
- **Portrait (`orientation: portrait`):** Vertical stack with screen on top ($50\text{vh}$) and controls on bottom ($50\text{vh}$).
- **Landscape (`orientation: landscape`):** Split layout with D-Pad anchored to bottom-left, action buttons anchored to bottom-right, and game screen centered.

### 5.6. Audio & Mute Management
- A master mute toggle button in the header bar.
- On first user interaction with the gamepad or CTA, resume any suspended `AudioContext`.
- When closing the modal, audio synthesizers are immediately muted/stopped.

---

## 6. What's Left to the Builder

The builder has full discretion over:
1. Exact CSS styling, gradients, and neon box-shadow tokens adhering to `docs/DESIGN_SYSTEM.md`.
2. Exact component splitting (`MobileArcadeModal.tsx`, `MobileGamepad.tsx`, `MobileArcadeFab.tsx`).
3. Unit test coverage for gamepad event dispatching and modal open/close transitions.
4. Safe area inset handling (`env(safe-area-inset-bottom)`) for iPhones with Home Indicator bars.
