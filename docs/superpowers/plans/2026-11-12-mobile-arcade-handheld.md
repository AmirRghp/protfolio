# Mobile Retro Arcade Handheld Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an ergonomic, nostalgic retro handheld arcade console for mobile visitors on `FlatLanding`, running 5 native Canvas mini-games with responsive touch controls, CRT styling, and zero WebGL overhead.

**Architecture:** A floating glass CTA (`MobileArcadeFab`) and hero button trigger a dedicated fullscreen modal (`MobileArcadeModal`) split into a top 4:3 CRT monitor (game carousel + gameplay canvas) and a bottom adaptive touch controller (`MobileGamepad`). The gamepad synthesizes native keyboard events (`keydown`/`keyup`) with haptic feedback, while `SnakeGame` and `Deparkanoid` listeners are normalized to `window` for unified input delivery.

**Tech Stack:** React 19, TypeScript, CSS Modules, HTML5 Canvas, Web Audio API, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-12-mobile-arcade-handheld-design.md`](file:///d:/Work/protfolio/docs/superpowers/specs/2026-11-12-mobile-arcade-handheld-design.md)

---

## Global Constraints

- **Device Boundary:** Zero WebGL / Three.js loaded for this feature; purely Canvas 2D + DOM overlay.
- **Dependencies:** React 19, TypeScript, Vite, CSS Modules. Zero new npm packages.
- **Touch Responsiveness:** Virtual buttons must use `touch-action: none` and avoid 300ms mobile click delay.
- **Lifecycle Cleanup:** Audio synthesizers, animation frame loops, and body scroll lock must reliably reset when exiting a game or closing the modal.
- **Crash Bandicoot:** Excluded from the mobile 5-game carousel to guarantee 100% 60fps native Canvas performance.

---

## Review Focus

1. **Multi-Touch Concurrency:** Pressing a D-Pad direction with left thumb while tapping an action button with right thumb must not cancel or drop either pointer event.
2. **Body Scroll Restoration:** Closing the modal via Close button, Escape key, or browser back button must always restore `document.body` scrolling.
3. **Audio Autoplay Permission:** First touch on the modal or gamepad must resume any suspended `AudioContext` without unhandled Promise rejections.
4. **Touch Drift & Scaling:** Pointer-driven gameplay (e.g. `Deparkanoid` paddle) must maintain zero offset when the canvas is scaled down to mobile screen width.
5. **Safe-Area Insets:** Controls and close buttons must respect `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)` on modern iPhones.

---

## Task Decomposition

### Task 1: Input Listener Normalization for Snake & Deparkanoid

**Files:**
- Modify: `src/features/arcade/games/snake-grid/SnakeGame.tsx:758-795`
- Modify: `src/features/arcade/games/deparkanoid/Deparkanoid.tsx:645-675`
- Modify: `src/features/arcade/games/snake-grid/SnakeGame.test.tsx`
- Modify: `src/features/arcade/games/deparkanoid/Deparkanoid.test.tsx`

**Interfaces:**
- Consumes: Standard browser `window.addEventListener("keydown" | "keyup")`.
- Produces: `SnakeGame` and `Deparkanoid` responding seamlessly to global window keyboard events while running, matching *Flappy*, *Tetris*, and *Pixel Run*.

- [ ] **Step 1: Write failing tests for global window keyboard dispatch**
  Add test cases in `SnakeGame.test.tsx` and `Deparkanoid.test.tsx` that dispatch `window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))` and verify game state reacts.
- [ ] **Step 2: Run tests to verify failure**
  Run: `npm run test -- src/features/arcade/games/snake-grid/SnakeGame.test.tsx src/features/arcade/games/deparkanoid/Deparkanoid.test.tsx`
  Expected: FAIL because both games currently listen solely on their local wrapper `<div>`.
- [ ] **Step 3: Implement window event listeners in SnakeGame and Deparkanoid**
  In `SnakeGame.tsx` and `Deparkanoid.tsx`, attach a `window.addEventListener("keydown")` and `window.addEventListener("keyup")` inside `useEffect` during active gameplay, forwarding to their respective key handlers.
- [ ] **Step 4: Run tests to verify pass**
  Run: `npm run test -- src/features/arcade/games/snake-grid/SnakeGame.test.tsx src/features/arcade/games/deparkanoid/Deparkanoid.test.tsx`
  Expected: PASS.

---

### Task 2: Adaptive Touch Gamepad Component (`MobileGamepad`)

**Files:**
- Create: `src/features/arcade/components/MobileGamepad.tsx`
- Create: `src/features/arcade/components/MobileGamepad.module.css`
- Create: `src/features/arcade/components/MobileGamepad.test.tsx`
- Modify: `src/features/arcade/components/index.ts` (if exists) or `src/features/arcade/index.ts`

**Interfaces:**
- Consumes: `activeGameId: string`, `onSelectMenu: () => void`, `onTogglePause?: () => void`.
- Produces: `MobileGamepad` component rendering an ergonomic D-Pad and adaptive action buttons (e.g. JUMP/SLIDE for `pixelrun`, ROTATE/DROP/HOLD for `tetris`, FLAP for `flappy`), emitting synthetic keyboard events with haptic feedback.

- [ ] **Step 1: Write failing unit tests for MobileGamepad**
  Create `MobileGamepad.test.tsx` testing:
  - Renders directional buttons when `showDpad: true` (e.g., `tetris`, `snake`).
  - Adapts action buttons according to `GAME_CONTROL_PROFILES[activeGameId]`.
  - Dispatches `keydown` on pointerdown / touchstart and `keyup` on pointerup / touchend.
  - Calls `navigator.vibrate` when available.
- [ ] **Step 2: Run test to verify failure**
  Run: `npm run test -- src/features/arcade/components/MobileGamepad.test.tsx`
  Expected: FAIL (module not found).
- [ ] **Step 3: Implement MobileGamepad and CSS Module**
  Implement `MobileGamepad.tsx` and `MobileGamepad.module.css`:
  - D-Pad with Up, Down, Left, Right buttons (`touch-action: none`).
  - Action button cluster with high-contrast neon borders, tactile feedback, and clear uppercase labels.
  - Menu / Pause helper buttons in center.
  - `pressKey` and `releaseKey` bridge dispatching `KeyboardEvent` to `window`.
- [ ] **Step 4: Run test to verify pass**
  Run: `npm run test -- src/features/arcade/components/MobileGamepad.test.tsx`
  Expected: PASS with 100% assertions green.

---

### Task 3: Mobile Handheld Arcade Modal (`MobileArcadeModal`)

**Files:**
- Create: `src/features/arcade/components/MobileArcadeModal.tsx`
- Create: `src/features/arcade/components/MobileArcadeModal.module.css`
- Create: `src/features/arcade/components/MobileArcadeModal.test.tsx`
- Modify: `src/features/arcade/index.ts`

**Interfaces:**
- Consumes: `isOpen: boolean`, `onClose: () => void`, `ARCADE_GAMES` (filtered to 5 Canvas games).
- Produces: `MobileArcadeModal` component featuring:
  - Header: Close button, title ("NEON POCKET"), master Mute toggle.
  - Top CRT Monitor: Scanline texture, game selection carousel mode with high scores, and 100% full-bleed Canvas mode when a game is started.
  - Bottom Chassis: Embedded `MobileGamepad` synchronized with active game.
  - Safe-area insets & orientation CSS (portrait stacked, landscape split).

- [ ] **Step 1: Write failing tests for MobileArcadeModal**
  Create `MobileArcadeModal.test.tsx` testing:
  - Does not render when `isOpen: false`.
  - Displays the 5 canvas games in carousel mode when open.
  - Switches to gameplay mode when a game is selected and started.
  - Invokes `onClose` when the close button is clicked or `Escape` is pressed.
  - Mute button toggles audio state.
- [ ] **Step 2: Run test to verify failure**
  Run: `npm run test -- src/features/arcade/components/MobileArcadeModal.test.tsx`
  Expected: FAIL (module not found).
- [ ] **Step 3: Implement MobileArcadeModal component and CSS**
  Implement `MobileArcadeModal.tsx` and `MobileArcadeModal.module.css` with CRT scanlines, game carousel, game mounting, and audio cleanup on exit.
- [ ] **Step 4: Run test to verify pass**
  Run: `npm run test -- src/features/arcade/components/MobileArcadeModal.test.tsx`
  Expected: PASS.

---

### Task 4: Mobile Arcade FAB & FlatLanding Integration

**Files:**
- Create: `src/features/landing/components/MobileArcadeFab.tsx`
- Create: `src/features/landing/components/MobileArcadeFab.module.css`
- Create: `src/features/landing/components/MobileArcadeFab.test.tsx`
- Modify: `src/features/landing/components/FlatLanding.tsx`
- Modify: `src/features/landing/components/FlatLanding.test.tsx`

**Interfaces:**
- Consumes: `useResponsiveDevice()` (`isMobileOrTablet` or `!allowRoom3D`).
- Produces:
  - `MobileArcadeFab` button positioned at bottom-right of mobile screen (`[ 🕹️ Play Arcade · 5 Games ]`).
  - Secondary Hero trigger button inside `.ldActions`.
  - State management (`isArcadeModalOpen`) and body scroll locking in `FlatLanding.tsx`.

- [ ] **Step 1: Write failing tests for MobileArcadeFab and FlatLanding integration**
  Create `MobileArcadeFab.test.tsx` verifying FAB render and click handler. Add tests in `FlatLanding.test.tsx` verifying the mobile arcade modal opens when triggered on mobile.
- [ ] **Step 2: Run test to verify failure**
  Run: `npm run test -- src/features/landing/components/MobileArcadeFab.test.tsx`
  Expected: FAIL.
- [ ] **Step 3: Implement MobileArcadeFab and integrate into FlatLanding**
  - Implement `MobileArcadeFab.tsx` with nocturnal tactile glass styling and safe area padding.
  - In `FlatLanding.tsx`, render `MobileArcadeFab` when `!allowRoom3D`.
  - Render `MobileArcadeModal` connected to state `isMobileArcadeOpen`.
  - Add secondary trigger button in Hero section.
- [ ] **Step 4: Run tests to verify pass**
  Run: `npm run test -- src/features/landing/components/MobileArcadeFab.test.tsx src/features/landing/components/FlatLanding.test.tsx`
  Expected: PASS.

---

### Task 5: Full Verification Suite & Performance Audit

**Files:**
- Test: All unit and integration test suites
- Command: `npm run test`
- Command: `npm run typecheck`
- Command: `npm run lint`
- Command: `npm run build`

**Interfaces:**
- Consumes: Entire workspace code.
- Produces: 0 TypeScript errors, 0 ESLint errors, 0 Vitest test failures, and clean production build bundle.

- [ ] **Step 1: Run complete Vitest suite**
  Run: `npm run test`
  Expected: All test files PASS with 0 failures.
- [ ] **Step 2: Run TypeScript compiler**
  Run: `npm run typecheck`
  Expected: Clean exit code 0 (`tsc --noEmit`).
- [ ] **Step 3: Run ESLint**
  Run: `npm run lint`
  Expected: Clean exit code 0.
- [ ] **Step 4: Run Vite Production Build**
  Run: `npm run build`
  Expected: Successful bundle generation with chunk size optimization.
