---
name: tactile-glass-ui
description: Integrate and configure Tactile Glass UI WebGL2 optical glass components in React applications. Covers TactileButton, TactileSwitch, TactileTabs, TactilePromptInput, TactileHeading, TactileGlassWord, TactileCreditCard, TactileAudioPlayer, TactileBackground, and the TactileGlassFx wrapper. Use when building or upgrading hero CTAs, segmented navigation, toggle switches, AI prompt composers, refractive display typography, 3D tilting cards, audio players, hero section backgrounds, or custom glass surfaces.
---

# Tactile Glass UI — Agent Integration Specification

`tactile-glass-ui` is a zero-dependency React + WebGL2 component library that renders physical Snell refraction, concentric SDF bevel normals, RGB chromatic dispersion, procedural FBM liquid caustics, and interactive pointer shockwaves.

All components on a page share a single offscreen WebGL2 rendering context (`SharedCausticEngine`) and automatically pause when offscreen or when the browser tab is inactive.

---

## 1. Component Matrix

| Export | Geometry & Dimensions | Primary Role |
| :--- | :--- | :--- |
| `<TactileButton>` | `56px` capsule (`shape="pill"`) or `56×56px` circle (`shape="circle"`) | Primary call-to-action buttons and standalone circular icon triggers. |
| `<TactileSwitch>` | `104×56px` capsule with `48px` conformal thumb | Binary state toggles with independent `ON` and `OFF` refractive profiles. |
| `<TactileTabs>` | `56px` capsule bar with `48px` sliding indicator | Segmented view switchers and mode selectors with keyboard arrow navigation. |
| `<TactilePromptInput>` | Up to `580px` wide, `24px` radius, auto-expanding multiline | AI chat and agent prompt composers with `+` context button, mode pill, and submit action. |
| `<TactileHeading>` / `<TactileGlassWord>` | Fluid display typography (`edt2d` sub-pixel SDF glyph domes) | Hero `h1` headlines where a focal keyword is rendered as frameless 3D liquid glass. |
| `<TactileCreditCard>` | `444px` wide (`ISO/IEC 7810 ID-1` ratio `~1.586`), `24px` radius | Interactive 3D perspective payment, membership, or tier cards with raycast tilt. |
| `<TactileAudioPlayer>` | `480×304px` deck, `32px` radius, molded transport domes | Spatial audio player cards with 70-band live spectrum and scrubbable timeline. |
| `<TactileBackground>` | Full-width section panel (`min-height: 360px`, `16px` radius) | Hero section and feature block glass backdrop panels with perimeter bevel refraction and caustic aura. |
| `<TactileGlassFx>` | Adapts to host DOM element size and `border-radius` | Universal wrapper that applies physical glass optics to any custom React element. |

---

## 2. Spatial & Optical Placement Rules

### Focal Surface Selection
- **Hero Actions & Primary Triggers:** Use `<TactileButton shape="pill">` for the main conversion action on a screen, or `<TactileButton shape="circle">` for a floating action / directional trigger.
- **AI & Command Interfaces:** Use `<TactilePromptInput>` as the central prompt bar, or wrap a custom multi-row composer in `<TactileGlassFx>`.
- **Display Typography:** Use `<TactileHeading>` (or `<TactileGlassWord>` inline inside an existing heading) on a single high-impact keyword per hero section.
- **Navigation & State Controls:** Use `<TactileTabs>` for top-level view switching and `<TactileSwitch>` for prominent binary settings.
- **Showcase Media & Cards:** Use `<TactileCreditCard>` for billing/pass previews and `<TactileAudioPlayer>` for interactive audio previews.

### Optical Restraint Rules
- **One Focal Glass Element per Viewport Zone:** Physical refraction and chromatic dispersion command visual hierarchy. Avoid placing multiple glass components immediately adjacent to one another unless they form a single paired control (such as a pill CTA beside a circle icon button).
- **Avoid High-Density Repetition:** Do not mount WebGL glass hulls inside long data tables, virtualized lists, or repeated feed rows.
- **No Nested Glass Hulls:** Never wrap a `TactileButton` or `TactileSwitch` inside another `<TactileGlassFx>` container.
- **Dark Surface Contrast & True Alpha Transparency:** Specular bevel rims, Fresnel edge highlights, and internal caustics are calibrated for dark surfaces. When mounted standalone over any DOM layout (CSS grids, gradients, images, or text), `SharedCausticEngine` renders a genuinely transparent glass core (`darkness={0}` applies zero opaque fill), syncs native CSS `backdrop-filter: blur(...)` to the `frost` prop, and composites parent caustics automatically when nested inside `<TactileBackground>`.

---

## 3. Agent Integration Workflow

When asked to inspect a project or integrate `tactile-glass-ui`, follow this three-stage workflow:

### Stage 1: Surface Audit (When reviewing an existing codebase)
1. Verify that the target project runs React `>= 18`.
2. Scan the UI for high-leverage focal points using the **Codebase Pattern Mapping** table below.
3. Propose at most one glass component per layout region, citing the exact file path and line number (`src/components/Hero.tsx:28`) and explaining which component and optical profile fit that spot. Wait for confirmation before modifying files if the user only asked for an audit.

| Existing UI Pattern in Codebase | Tactile Glass Replacement | Recommended Configuration |
| :--- | :--- | :--- |
| Primary hero button (`btn-primary`, `Get Started`, `Launch`, `Upgrade`) | `<TactileButton>` | `shape="pill"` (or `shape="circle"` for icon-only buttons) |
| AI chat textarea or command bar (`<textarea`, `Ask...`, `Build...`, send button) | `<TactilePromptInput>` or `<TactileGlassFx>` | Full-surface glass composer with `onSubmit` wired to the chat handler |
| Landing page `<h1>` display title with an emphasized keyword | `<TactileHeading>` or `<TactileGlassWord>` | Wrap only the single focal keyword (`highlight="..."`) |
| Tab bar or segmented switcher (`role="tablist"`, `activeTab`, view pills) | `<TactileTabs>` | Pass `items`, `value`, and `onChange` |
| Prominent boolean toggle (`role="switch"`, `<Switch`, `checked`) | `<TactileSwitch>` | Pass `checked` and `onChange` |
| Static CSS glassmorphism card (`backdrop-blur`, `bg-white/10`, `border-white/20`) | `<TactileGlassFx>` | Strip CSS borders/shadows and let the WebGL hull render the bevel |
| Payment card preview or membership pass | `<TactileCreditCard>` | `tilt3d={true}` with `bankName`, `cardNumber`, `cardHolder`, `validThru` |
| Audio track preview or podcast widget | `<TactileAudioPlayer>` | Pass `tracks` array and `onPlayChange` / `onTrackChange` callbacks |

### Stage 2: Package Installation & Client Boundary
1. Detect the project's package manager from its lockfile (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, or `package-lock.json`) and install `tactile-glass-ui`:
   ```bash
   npm install tactile-glass-ui@latest
   ```
2. Design system CSS tokens are imported automatically by `'tactile-glass-ui'` — no manual stylesheet import is required.
3. In Next.js App Router or SSR environments, ensure any file rendering a `tactile-glass-ui` component declares `"use client"` at the top.

### Stage 3: Component Wiring & Optical Tuning
1. Bind the component to real application state (`onClick`, `checked`/`onChange`, `value`/`onChange`, `onSubmit`).
2. Keep the default optical preset unless the user specifies custom slider values from the playground, in which case pass those exact numeric props.

---

## 4. Component Recipes

### `<TactileButton>`
```tsx
import { TactileButton } from 'tactile-glass-ui';

// Primary capsule CTA (56px height)
<TactileButton onClick={onLaunch}>
  Launch Interface
</TactileButton>

// Circular icon button (56x56px)
<TactileButton shape="circle" aria-label="Continue">
  <ArrowRightIcon />
</TactileButton>
```

### `<TactileSwitch>`
```tsx
import { TactileSwitch } from 'tactile-glass-ui';

<TactileSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
/>
```

### `<TactileTabs>`
```tsx
import { TactileTabs } from 'tactile-glass-ui';

<TactileTabs
  items={['Code', 'Review', 'Chat']}
  value={mode}
  onChange={setMode}
/>
```

### `<TactilePromptInput>`
```tsx
import { TactilePromptInput } from 'tactile-glass-ui';

<TactilePromptInput
  placeholder="Ask anything, @ to mention, / for actions"
  agentLabel="Agent"
  onSubmit={(text) => handleSend(text)}
/>
```

### `<TactileHeading>` & `<TactileGlassWord>`
```tsx
import { TactileHeading, TactileGlassWord } from 'tactile-glass-ui';

// Standalone hero heading with automatic keyword highlighting
<TactileHeading
  title="Built for Fluid Surfaces"
  highlight="Fluid"
  highlightCycle={['Fluid', 'Tactile', 'Optical']}
/>

// Or inline inside existing heading markup
<h1 className="text-6xl font-extrabold tracking-tight text-white">
  Built for <TactileGlassWord>Fluid</TactileGlassWord> Surfaces
</h1>
```

### `<TactileCreditCard>`
```tsx
import { TactileCreditCard } from 'tactile-glass-ui';

<TactileCreditCard
  bankName="TACTILE"
  cardNumber="4829 8102 9412 8042"
  cardHolder="ALEXANDER WRIGHT"
  validThru="08 / 29"
  tilt3d={true}
  maxTilt={12}
/>
```

### `<TactileAudioPlayer>`
```tsx
import { TactileAudioPlayer } from 'tactile-glass-ui';

<TactileAudioPlayer
  defaultTrackIndex={0}
  tilt3d={true}
  maxTilt={10}
/>
```

### `<TactileBackground>`
```tsx
import { TactileBackground } from 'tactile-glass-ui';

<TactileBackground className="min-h-[480px] p-12">
  <HeroContent />
</TactileBackground>
```

### `<TactileGlassFx>` (Universal Wrapper)
```tsx
import { TactileGlassFx } from 'tactile-glass-ui';

<TactileGlassFx
  refraction={64}
  thickness={32}
  bevelWidth={4}
  frost={8}
  dispersion={96}
  className="rounded-3xl p-6"
>
  <CustomWidgetContent />
</TactileGlassFx>
```

---

## 5. Optical & Fluid Uniforms (18 Parameters)

All components and `<TactileGlassFx>` accept these 18 optical props. `<TactileSwitch>` additionally supports `*Off` props (such as `refractionOff`, `dispersionOff`, `fluidBrightnessOff`) for its resting state, and `<TactileHeading>` accepts them via `wordProps={{ ... }}`.

| Prop | Range | Button | Switch ON / OFF | Tabs | Prompt | Heading | Card | Audio | Background | Optical Effect |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `refraction` | `0 – 100` | `4` | `2` / `72` | `2` | `88` | `80` | `88` | `88` | `80` | Snell lens distortion across the curved SDF bevel. |
| `thickness` | `0 – 100` | `8` | `8` / `16` | `8` | `72` | `48` | `88` | `88` | `88` | Simulated physical depth of the glass volume. |
| `bevelWidth` | `0 – 30` | `2` | `2` / `4` | `2` | `3` | `2` | `8` | `8` | `0` | Width of the concentric curved edge bevel. |
| `frost` | `0 – 100` | `2` | `16` / `80` | `8` | `4` | `40` | `24` | `4` | `0` | Subsurface roughness and frosted backdrop blur. |
| `dispersion` | `0 – 100` | `88` | `80` / `0` | `80` | `96` | `80` | `96` | `96` | `96` | RGB prismatic separation across bevel normals. |
| `sheen` | `0 – 100` | `12` | `40` / `16` | `24` | `12` | `24` | `24` | `16` | `0` | Specular surface reflection intensity. |
| `lightAngle` | `-180 – 180` | `24` | `24` / `24` | `24` | `24` | `24` | `24` | `24` | `0` | Primary directional light angle in degrees. |
| `darkness` | `0 – 100` | `0` | `0` / `24` | `0` | `0` | `0` | `8` | `0` | `0` | Internal smoked glass absorption density. |
| `rim` | `0 – 100` | `16` | `48` / `40` | `48` | `16` | `16` | `24` | `16` | `0` | Outer edge Fresnel rim highlight intensity. |
| `fluidBrightness` | `0 – 300` | `36` | `48` / `32` | `40` | `24` | `80` | `32` | `24` | `12` | Intensity of internal procedural FBM caustics. |
| `fluidSpeed` | `0 – 300` | `80` | `80` / `0` | `80` | `64` | `80` | `88` | `64` | `40` | Temporal flow speed (%) of the caustic field. |
| `fluidScale` | `0 – 100` | `24` | `16` / `4` | `8` | `16` | `8` | `56` | `48` | `48` | Spatial frequency (%) of internal caustic ripples. |
| `fluidAuraWidth` | `0 – 96` | `8` | `12` / `32` | `12` | `16` | `2` | `28` | `40` | `64` | Inward penetration width (`px`) of the perimeter caustic aura. |
| `fluidCenter` | `0 – 100` | `32` | `0` / `96` | `0` | `0` | `8` | `0` | `32` | `12` | Colorless liquid refraction strength (%) across the central core (and interior caustic fill on typography). |
| `auroraFlow` | `0 – 100` | `100` | `0` / `0` | `64` | `100` | `0` | `100` | `100` | `100` | Directional aurora wave modulation (%) across the hull. |
| `hoverBrightness` | `0 – 300` | `264` | `256` / `144` | `256` | `200` | `96` | `200` | `144` | `128` | Specular and caustic energy boost on pointer hover. |
| `lightTrackingStrength` | `0 – 100` | `100` | `100` / `100` | `100` | `100` | `100` | `100` | `100` | `100` | Pointer-tracking responsiveness (%) for specular highlights. |
| `shockwaveStrength` | `0 – 100` | `100` | `96` / `96` | `96` | `96` | `96` | `96` | `96` | `56` | Amplitude (%) of the radial refractive wave on pointer down. |

---

## 6. Physical Glass Guardrails (Do / Don't)

- **DO NOT apply CSS `border`, `box-shadow`, `outline`, or opaque `background` to a glass hull.**
  Every glass component must remain a transparent geometric hull (`background: transparent; border: none; box-shadow: none;`). All bevel contours, specular rims, and surface fills are computed in GLSL.
- **DO maintain `borderRadius > bevelWidth` on rounded containers.**
  The SDF shader computes inner bevel isolines at `radius - bevelWidth`. Keeping the CSS `border-radius` strictly greater than `bevelWidth` prevents sharp diagonal creases in the normal field.
- **DO keep parent grids, gradients, and backgrounds visible behind the glass hull.**
  In standalone DOM mode, `SharedCausticEngine` outputs true premultiplied alpha transparency in the glass interior (controlled by `darkness`) and drives native CSS `backdrop-filter: blur(...)` from the `frost` prop so underlying page grids, typography, and imagery shine through naturally. When placed inside `<TactileBackground>`, child components automatically refract the parent WebGL canvas.
- **DO preserve accessibility attributes.**
  Always provide `aria-label` on icon-only `<TactileButton shape="circle">` instances. `<TactileSwitch>` (`role="switch"`) and `<TactileTabs>` (`role="tablist"`) include built-in keyboard navigation (`Space`/`Enter` and `ArrowLeft`/`ArrowRight`).
