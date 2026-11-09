# Error Handling & Resilience Strategy

## 1. Resilience Philosophy

The portfolio follows a strict **Fail-Open & Graceful Degradation** philosophy:
> *No hardware limitation, network outage, or third-party failure should ever produce an unhandled exception, a blank screen, or block access to the candidate's core credentials.*

---

## 2. WebGL Context Loss & GPU Deprivation

WebGL applications can lose their rendering context when system GPU resources are exhausted, devices sleep, or drivers reset.

```mermaid
flowchart TD
    WebGLActive[Active 3D Canvas Context] --> LossEvent[webglcontextlost event triggered]
    LossEvent --> PreventDefault[event.preventDefault: prevent browser default crash]
    LossEvent --> CancelLoops[Cancel requestAnimationFrame render loops]
    LossEvent --> RenderFallback[Mount RoomUnavailable component]
    
    RenderFallback --> UserExperience[Show 2D CSS nocturnal gradient backdrop]
    UserExperience --> ContentSafe[Semantic HTML navigation & flat landing stay fully reachable]
    
    WebGLActive --> RestoreEvent[webglcontextrestored event triggered]
    RestoreEvent --> ReloadAssets[Re-initialize Three.js renderer and textures]
    RestoreEvent --> ResumeScene[Unmount RoomUnavailable & restore 3D Room]
```

### Fallback Implementation (`src/features/room/components/RoomUnavailable.tsx`)
When WebGL is unavailable or the context cannot be restored:
- A clean, accessible fallback component is displayed informing the user of the hardware state.
- An instant button to switch directly to the **Flat Landing Portfolio** is presented.
- The CSS nocturnal wallpaper remains visible so the visual aesthetic is preserved.

### Proactive GPU Deprivation Bypass on Mobile & Touch Devices
Rather than relying on reactive context recovery after a mobile device experiences thermal throttling or Out-Of-Memory (OOM) browser crashes, the application proactively assesses device capabilities via `useResponsiveDevice`:
- On any touch-first device (`pointer: coarse`, including iPads) or screen $< 1024\text{px}$, `<RoomPreview>` is strictly not rendered in the DOM (`null`).
- This completely prevents WebGL context allocation, halts all requestAnimationFrame loops, and redirects the user directly into `FlatLanding`.

---

## 3. Sandboxed Iframe & Third-Party Embed Blocking

The Arcade cabinet includes an option to load a PS1 emulator game via an external provider (PS1FUN).

### Failure Modes & Protections
1. **`X-Frame-Options` / `frame-ancestors` Header Rejections:** Many third-party sites disallow iframe embedding.
2. **Network Timeouts & Mixed-Content Blocks:** If an embedded game fails to complete loading within **8 seconds**:
   - An accessible alert (`role="status"`) replaces the unresponsive frame.
   - A direct external link opens the destination cleanly in a new browser tab.
   - The **"Exit Game"** button resides permanently *outside* the iframe DOM, ensuring keyboard and mouse users are never trapped inside an unresponsive embed.

---

## 4. Web Audio Autoplay & Gesture Unlocking

Modern browsers (Chrome, Safari, Firefox) prohibit web applications from generating audio prior to an explicit user interaction.

### Handling Strategy (`src/features/room/audio/oiiaAudio.ts` & Arcade Synthesizers)
- All audio graphs remain completely dormant during initial page load.
- Clicking the Oiia Cat or starting an arcade game triggers `audioContext.resume()` within the verified user event loop.
- If audio initialization is denied or throws a permission error (e.g. strict enterprise policies), the error is caught silently; animations and gameplay proceed smoothly without audio.

---

## 5. Viewport Resize & Window Boundary Clamping

In the virtual monitor desktop, resizing the browser window could cause floating windows to get pushed off-screen.

### Clamping Strategy (`src/features/monitor/utils/desktopDrag.ts`)
- Window coordinates ($x, y$) and dimensions ($w, h$) are continuously bounded:
  $$x_{\text{clamped}} = \max\left(0, \min(x, W_{\text{desktop}} - w)\right)$$
  $$y_{\text{clamped}} = \max\left(H_{\text{statusbar}}, \min(y, H_{\text{desktop}} - h)\right)$$
- If the browser window shrinks, all open windows and draggable desktop icons are automatically pulled back inside the safe desktop bounds.

---

## 6. Network Resilience & Rate Limiting

### GitHub API Failover Pipeline
```text
[Fetch GitHub Events]
       │
       ├──► Success: Save to localStorage (TTL = 4 hours) ──► Render Contribution Ring
       │
       └──► Failure (Offline / HTTP 403 Rate Limit / Timeout):
                   │
                   ▼
            Read localStorage Cache
                   │
                   ├──► Cache Valid: Render Cached Stats
                   │
                   └──► Cache Empty / Expired:
                               │
                               ▼
                       Load Bundled Fallback
                 (githubContributionsFallback.json)
                               │
                               ▼
                    Render Fallback Stats
```
- No red error banners or broken widgets are ever displayed.
- The UI maintains visual completeness at all times.

---

## 7. GPU Compositor Layer Isolation & Stacking Context Traps

Modern browser engines (Chromium Blink, WebKit) utilize hardware-accelerated compositing layers for CSS transforms and animations. Improper layering configurations can cause severe visual bugs:

### 1. Compositor Layer Trapping with `backdrop-filter`
- **Failure Mode:** Combining `will-change: transform` on a parent (`.ldNav`) with `position: absolute; z-index: -1` on a child element containing `backdrop-filter: blur(...)` isolates the filter to the parent's unbacked compositor layer. Because the parent background is transparent, the GPU samples zero pixels, causing `backdrop-filter` to completely skip rendering over underlying page content.
- **Resolution:** Eliminate `will-change: transform` from `.ldNav`, set the glass element (`.ldNavGlass`) to `z-index: 0`, and elevate interactive foreground controls (`.ldLogo`, `.ldLinks`, `.ldNavCta`) to `position: relative; z-index: 1`. This allows the GPU compositor to sample and blur the underlying page layers directly.

### 2. WebKit 3D Composited Layer Promotion Occlusion (iOS Safari)
- **Failure Mode:** In WebKit, Framer Motion layout transitions promote the active tab indicator (`.selection`) into a hardware-accelerated 3D compositing layer. WebKit paints 3D composited layers over flat 2D siblings regardless of CSS `z-index`, causing dark indicator pills to render over white text labels.
- **Resolution:** Apply `isolation: isolate` to the trigger container to enforce an isolated local stacking context, and promote `.triggerLabel` to a composited layer via `-webkit-transform: translateZ(0)` so its `z-index: 2` is honored. Add `pointer-events: none` to the indicator to avoid event capture.

### 3. WebKit SVG Filter Scale Diminution in Full-Page Glass Refraction (iOS Safari)
- **Failure Mode:** When applying SVG refraction filters (`feDisplacementMap`) across a full-page scroll container (`data-glisse-backdrop` on `<main>`, height $5,555\text{px}$), Glisse's internal WebKit user-agent check switched SVG filters to `objectBoundingBox` and divided displacement scale by container height (`reach / down`). Because WebKit treats displacement scale in CSS user pixels, dividing by $5,555\text{px}$ reduced displacement to $\approx 0.0035\text{px}$ (sub-pixel noise), resulting in zero visible optical bend on iPhone Safari while Android Chrome retained the full $19.8\text{px}$ distortion.
- **Resolution:** Automated `postinstall` patch script (`scripts/patch-glisse.js`) forcing `boxUnits = () => false`. This unifies all browsers into `userSpaceOnUse` with raw pixel coordinates and displacement scales ($19.8\text{px}$–$21.4\text{px}$) across the entire page (Hero to Footer). Added `-webkit-transform: translateZ(0); transform: translateZ(0); will-change: filter;` to `.ld main.intro` to guarantee hardware-composited GPU stability during touch scrolling on iOS.
