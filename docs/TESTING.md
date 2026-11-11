# Testing Strategy & Verification Guide

## 1. Testing Philosophy

The portfolio employs a **multi-tiered, evidence-driven verification strategy** to ensure visual fidelity, zero interactive regressions, and mathematical correctness across all 3D and 2D components.

Key testing principles:
1. **Mathematical Rigor Over Shallow Mocks:** Core algorithmic code—such as 3D projection homography, Euler rotation matrices, spring physics ODEs, and camera dampening—is tested against deterministic mathematical expectations rather than mocked out.
2. **Strict Test Colocation:** Unit and component tests are located directly beside their implementation files (e.g., `roomCamera.ts` and `roomCamera.test.ts`), simplifying refactoring and ensuring test visibility.
3. **Multi-Resolution E2E Coverage:** End-to-end tests verify behavior across 5 standard responsive widths: `320px`, `375px`, `768px`, `1024px`, and `1440px`.

---

## 2. Test Pyramid

```text
       ▲
      / \        E2E Tests (Playwright)
     /   \       7 spec files · 78 scenarios
    /-----\      
   /       \     Integration & Component Tests (Vitest)
  /         \    DOM testing, keyboard navigation, window drag
 /-----------\   
/             \  Unit Tests (Vitest)
/               \ 45 test files · 252 tests (3D math, audio, level data, responsive)
-----------------
```

---

## 3. Unit & Integration Testing (Vitest)

Unit testing runs via **Vitest** with in-memory DOM simulation and isolated worker threads.

### Test Suites Breakdown (45 Files, 252 Tests)
- **Device & Responsive Engine:**
  - `src/core/utils/responsive.test.ts`: Tests `useResponsiveDevice` hook, media query matching, snapshot overrides, and strict dual-condition calculation ($\text{allowRoom3D}$).
- **Landing Page & UI Components:**
  - `src/features/landing/components/FlatLanding.test.tsx`: Tests flat landing DOM structure, contact button routing, room entry suppression, sticky header with Glisse `<Glass>` liquid glass backdrop (`ldNavGlass`, `lg-glass`), `--lg-blur: 3px`, and decoupling from scrolling sections.
  - `src/App.test.tsx`: Validates root application shell, semantic owner role structure, and clean markup integration decoupled from `data-glisse-backdrop`.
  - `src/features/landing/components/TechStackSection.test.tsx`: Tests 10-item truncation thresholds, category filtering, and expand/collapse button state.
  - `src/features/landing/components/WorkAccordion.test.tsx`: Tests mobile accordion layout and circular glass close button interaction.
  - `src/features/landing/components/ProjectCarousel.test.tsx`: Tests desktop project carousel slide navigation, dot indicators, and keyboard arrow controls.
  - `src/features/landing/effects/PixelTetris.test.tsx`: Tests SSR canvas rendering and responsive `mobileCellSize`, `mobileMaxStackHeight`, and `mobilePrefillRows` props.
- **3D Room & Camera Math:**
  - `src/features/room/utils/roomCamera.test.ts`: Verifies camera poses, frustum calculations, aspect ratio scaling, and quintic smootherstep easing.
  - `src/features/room/utils/roomNavigation.test.ts`: Tests the navigation state machine and destination routing.
  - `src/features/room/utils/roomHover.test.ts`: Validates hotspot hit detection and raycasting clamp bounds.
  - `src/features/room/audio/oiiaAudio.test.ts`: Tests drop window thresholds and audio context state transitions.
- **Homography & Projection:**
  - `src/features/monitor/utils/monitorProjection.test.ts`: Validates 8-DOF homography mapping from 3D quad corners to 2D screen coordinates.
  - `src/features/arcade/utils/arcadeProjection.test.ts`: Verifies CRT screen corner projection and CSS `matrix3d` transformation.
- **Virtual Desktop & OS:**
  - `src/features/monitor/components/MonitorDesktop.test.tsx`: Tests window focus hierarchy, status bar live updates, and maximize/restore behavior.
  - `src/features/monitor/apps/ProjectApp.test.tsx`: Tests project window details, live iframe toggle, error fallback, and empty states in `AboutMeApp`.
  - `src/features/monitor/utils/desktopDrag.test.ts`: Tests pointer capture, drag bounds clamping, and threshold activations.
- **Arcade Mini-Games:**
  - `src/features/arcade/games/*/*.test.tsx`: Tests tick loops, score tracking, keyboard bindings, and reset routines for Flappy, Tetris, Pixel Run, Snake, and Deparkanoid.
- **Data & Caching:**
  - `src/data/githubContributions.test.ts`: Verifies public API querying, 4-hour `localStorage` caching, and offline fallback failover.

---

## 4. End-to-End Testing (Playwright)

End-to-end tests run headless Chromium across responsive viewport configurations to simulate real user journeys.

### E2E Test Specifications (`tests/*.spec.ts`)
| Spec File | Focus Area |
| :--- | :--- |
| `tests/entry-page.spec.ts` | Lanyard badge rendering, pull-to-enter gesture, keyboard skip |
| `tests/room-navigation.spec.ts` | Camera travel to Monitor and Arcade, ESC key return, URL query params |
| `tests/monitor.spec.ts` | Curved monitor zoom, 3D hotspot click via Three.js vector projection |
| `tests/desktop-windows.spec.ts` | Window dragging, resizing, closing, and status bar clock updates |
| `tests/about-me.spec.ts` | Opening `about-me.txt`, content readability, contact link verification |
| `tests/project-apps.spec.ts` | Project app launching, website iframe fallback, external links |
| `tests/destinations.spec.ts` | Hotspot tooltips (`USE COMPUTER`, `USE ARCADE`, `oiia ?`) and outline bloom |

---

## 5. Verification Commands

Run the following commands locally before any release or commit:

```bash
# 1. Run all 252 Vitest unit & integration tests (45 test suites)
npm run test

# 2. Verify complete TypeScript type soundness (zero emits, zero errors)
npm run typecheck

# 3. Check code style, React hooks rules, and ESLint constraints
npm run lint

# 4. Generate production bundle and verify asset chunk sizes
npm run build

# 5. Execute full Playwright E2E browser test suite
npm run test:e2e
```

---

## 6. Manual Verification & Quality Gates

Before declaring any visual or interactive feature complete, verify the following checklist:

- [ ] **Physical Display 60 FPS:** Test on a machine with a dedicated GPU and observe framerate during camera transitions.
- [ ] **Reduced Motion Support:** Enable `prefers-reduced-motion` in OS settings and confirm that camera transitions jump without disorienting motion.
- [ ] **WebGL Loss Simulation:** Force WebGL context loss via Chrome DevTools (`chrome://flags` or WebGL extension) and verify that `RoomUnavailable` renders gracefully.
- [ ] **Keyboard-Only Traversal:** Navigate the entire portfolio using only `Tab`, `Enter`, `Space`, `Escape`, `1`, `2`, `M`, and `A`.
