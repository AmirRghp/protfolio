# Third-party notices

## Gradient Waves & Lanyard (React Bits)

`src/GradientWaves.tsx` and `src/Lanyard.tsx` are TypeScript ports of the Gradient Waves
(https://reactbits.dev/backgrounds/gradient-waves, source variant `GradientWaves-JS-CSS`) and
Lanyard (https://reactbits.dev/components/lanyard, source variant `Lanyard-JS-CSS`) components
published by React Bits. Their shaders, simulation models and pointer behaviours are kept as
published; the components were rewritten in TypeScript and integrated into the monitor desktop
and entry loading screen of this project.

MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense the Software **as part of an application, website, or product**, subject
to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

### Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell,
sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported
version.**

The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic,
Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may
not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a
substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported
version.**

What you make with the tools is yours to use. You can use exported code, images, videos, and
audio files in any personal or commercial application, website, or product, including paid ones.
**You may not sell or redistribute the exports on their own, either individually or as the
product itself, such as a sound, texture, background, or template pack.**

### No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The full license text is published at
https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md.

## Liquid Grid (OriginKit)

`src/components/landing/LiquidGrid.tsx` is an integrated, strongly-typed React 19 component based on Liquid Grid (https://www.originkit.dev/components/liquid-grid) published by OriginKit. It provides an interactive 2D canvas water ripple simulation with damping and absorption algorithms, customized for the dark nocturnal portfolio background.

## Tactile Glass UI

`tactile-glass-ui` provides optical glass buttons with WebGL2 refractive shaders, chromatic dispersion, and click shockwaves. It powers `TactileButton` in `ExitBar` and `FlatLanding`.

## OriginKit Magic Cursor

src/components/originkit/MagicCursor.tsx is an integrated, responsive pointer tracker component based on Magic Cursor (https://www.originkit.dev/components/magic-cursor) published by OriginKit. It provides an interactive 25px vector arrow cursor with speed-based dynamic rotation angle and spring-physics squash/stretch animations.

## KokonutUI Dynamic Text

src/components/kokonutui/dynamic-text.tsx is an integrated spring-physics text animator based on KokonutUI (https://kokonutui.com/docs/components/text/dynamic-text). It handles smooth physics-based letter transitions between professional roles with zero external animation library dependencies.

## Arc UI Tabs

src/components/arc/tabs.tsx is a spring-physics tab navigation component based on Arc UI (@uiarc/tabs). It powers the category selection in TechStackSection with an animated sliding highlight under active triggers.

## GitHub Contribution 3D Skyline (Avi Vashishta)

`src/components/landing/GithubActivitySection.tsx` is an integrated, library-free 3D isometric GitHub contribution visualization based on the "As a city" skyline concept published by Avi Vashishta (https://www.avivashishta.com/lab/commits and https://www.avivashishta.com/blog/animate-github-contribution-graph-portfolio). It implements 3-faced cuboid projection, square root height scaling, diagonal wave rising easing, and peak day leader line callouts.

## OriginKit Pixel Tetris

`src/components/originkit/PixelTetris.tsx` is an integrated, self-playing 2D canvas Tetris component based on Pixel Tetris (https://www.originkit.dev/components/pixel-tetris?preset=base) published by OriginKit. It provides an autonomous tetromino stacking engine with circular matrix dots (`rounded: 20`), pre-filled bottom rows for active mid-game appearance, height-capping AI logic, and responsive `IntersectionObserver` pause/resume controls.

## 3D models

The 3D assets used in the room workstation and scene are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0):
- **curved-monitor.glb**: “Computer Monitor Lowpoly Model” by Marco Zakaria.
- **compact-keyboard.glb**: “Compact Keyboard – Custom 75% Gaming Keyboard” by Saksham Tale.
- **computer-mouse.glb**: “Low poly - Computer Mouse [FREE] Download” by IQINISO.
- **mouse-pad.glb**: “Mouse Pad / Keyboard Pad” by mfk.
- **arcade-machine.glb**: “Arcade Machine” by Oonie11.

Detailed attribution, creators, sources, and integration modifications are recorded in `public/assets/models/ATTRIBUTION.md`.
