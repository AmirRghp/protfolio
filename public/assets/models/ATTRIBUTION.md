# Model attribution and integration

## curved-monitor.glb

“Computer Monitor Lowpoly Model” by **Marco Zakaria**
([creator](https://sketchfab.com/marcoZakaria)), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: https://sketchfab.com/3d-models/computer-monitor-lowpoly-model-1d4ee42eda804b02b05b63721921c1d7

Changes: uniformly scaled so the monitor keeps the height the room composition was built
around, placed on the desk with its display centred in front of the viewer, transforms baked
into the geometry, display UV remapped to 0–1 from the real left/right and bottom/top of the
mesh, and the display recoloured to a neutral dark panel. The physical panel is only a dark
surface; the interactive desktop is HTML projected onto it.

The reviewed source GLB is 65,056 bytes, SHA-256:
`d0d35e23ecca18038c9b9ed0ddadab2b1a849f882d0f2ddf09084871a9ac10a1`.
Source metadata and the model page identified the same creator and license when checked on
2026-10-21. Rebuild from that original download with the installed Three.js:

```sh
node scripts/prepare-curved-monitor.mjs /path/to/original/computer_monitor_lowpoly_model.glb
```

### Screen contract for R05

The local GLB has four independent meshes: `MonitorScreen`, `MonitorBody`, `MonitorStand` and
`MonitorBase`. All transforms are baked into geometry in room coordinates: +Y up, +Z facing the
viewer. The monitor is 4.361 units wide, 2.987 high and 1.261 deep, with its base at Y = 1.900,
just above the desk, and it contains 1,002 triangles with no external buffers, images or runtime
downloads.

`MonitorScreen` bounds (rounded):

| | X | Y | Z |
| --- | --- | --- | --- |
| Minimum | -2.366 | 2.686 | -0.250 |
| Maximum | 1.866 | 4.822 | -0.250 |
| Center | -0.250 | 3.754 | -0.250 |
| Size | 4.231 | 2.136 | 0.000 |

The display is a flat panel, so the desktop is projected onto it without a gap and no screen
edge dips into the overlay. UV (0, 0) is bottom-left and (1, 1) is top-right, viewed from the
front. R05 measures this mesh in the current camera pose rather than treating its bounds as a
flat rectangle. No endorsement by the original creator is implied.

## compact-keyboard.glb

“Compact Keyboard – Custom 75% Gaming Keyboard” by **Saksham Tale**
([creator](https://sketchfab.com/saksham_tale)), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: https://sketchfab.com/3d-models/compact-keyboard-custom-75-gaming-keyboard-a8393df7a4944f0680869141fcc56b86

Changes: showcase root transform cleared, scaled and angled on the desk in front of the monitor,
and unlit materials upgraded to standard PBR materials so the keycaps and case respond to the
studio lighting.

## computer-mouse.glb

“Low poly - Computer Mouse [FREE] Download” by **IQINISO**
([creator](https://sketchfab.com/iqiniso)), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: https://sketchfab.com/3d-models/low-poly-computer-mouse-free-download-c6f6d0cd408a41f58aab1837e913fa14

Changes: scaled and placed on the desk to the right of the keyboard at an inward working angle,
with body materials adjusted for dark studio lighting.

## mouse-pad.glb

“Mouse Pad / Keyboard Pad” by **mfk**
([creator](https://sketchfab.com/mfk)), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: https://sketchfab.com/3d-models/mouse-pad-keyboard-pad-7690f727d87847aaa737c8110c8e6531

Changes: scaled and positioned on the desk surface beneath the compact keyboard and computer mouse,
with dark cloth finish and accent stitching materials calibrated for studio lighting.

## arcade-machine.glb

“Arcade Machine” by **Oonie11**
([creator](https://sketchfab.com/Oonie11)), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: https://sketchfab.com/3d-models/arcade-machine-7c9a7e90089644599d9f5c2d98f9708c

Changes: rotated to face the viewer, scaled and positioned in the cut-out space beside the right
edge of the desk so its upper body and control deck align with the workstation and its lower cabinet
is clipped cleanly at the bottom boundary of the Hero section.

## cup.glb

“Cup” with custom emoji face and coffee surface, converted to standard glTF 2.0 PBR Metallic-Roughness.
Positioned on the desk to the right of the mousepad with its emoji facing the camera and animated hot steam.

## batman.glb

“Batman Pop Vinyl” collectible figurine on the lower shelf, with satin vinyl PBR standard materials reflecting shelf illumination.

## oiia-cat.glb

“Oiiaioooooiai Cat” by **Zhuier**
([creator](https://sketchfab.com/Zhuier)), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: https://sketchfab.com/3d-models/oiiaioooooiai-cat-30d27bf7fb224849b76e208a6eccdb36

Changes: position on desk between CoffeeMug and arcade cutout, custom interactive dance system with morph target tucking paws into loaf, beat-synced spin and bounce, party spotlights, desk contact shadow, and reset on navigation blur.

Audio: “Oiia Oiia (Spinning Cat)” by **W&W**
Original track used as internet meme soundtrack for non-commercial portfolio interactive showcase.

## Other third-party code

The Gradient Waves wallpaper is a TypeScript port of the React Bits component. Its copyright
and license notice are kept in `docs/THIRD_PARTY_NOTICES.md` and in the header of
`src/GradientWaves.tsx`.
