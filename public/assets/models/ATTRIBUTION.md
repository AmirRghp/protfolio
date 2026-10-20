# Model attribution and integration

## curved-monitor.glb

“Curved Monitor” by **Arnau Rocher Alcayde**
([creator](https://sketchfab.com/ArnauRocherAlcayde)), licensed under
[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: https://sketchfab.com/3d-models/curved-monitor-5aeacd0cc5f649a4b92ce90bca6917e7

Changes: orientation, uniform scale and placement baked into geometry; meshes renamed;
screen UVs remapped from the source atlas to 0–1; casing and screen materials adjusted.
The application applies its own decorative owner text to the screen. No endorsement
by the original creator is implied. This license applies to this model, not the
project-authored room furnishings or arcade cabinet.

The reviewed source GLB is 46,908 bytes, SHA-256:
`00904f31c4a942fb4fbd2f6a35b693ce39b62e055e960046c01e6982cffac8c0`.
Source metadata and the model page identified the same creator and license when
checked on 2026-10-21. Rebuild from that original download with the installed Three.js:

```sh
node scripts/prepare-curved-monitor.mjs /path/to/original/curved_monitor.glb
```

### Screen contract for R05

The local GLB has three independent meshes: `MonitorBody`, `MonitorScreen`, and
`MonitorStand`. All transforms are baked into geometry in room coordinates: +Y up,
+Z facing the viewer. The root and meshes have identity transforms. The monitor is
5.100 units wide, 2.987 high, 0.947 deep, with its base at Y = 1.900, just above the desk.
It contains 1,188 triangles and no external buffers, images or runtime downloads.

`MonitorScreen` bounds (rounded):

| | X | Y | Z |
| --- | --- | --- | --- |
| Minimum | -2.779879 | 2.373483 | -0.570256 |
| Maximum | 2.279879 | 4.865654 | 0.070261 |
| Center | -0.250000 | 3.619569 | -0.249998 |
| Size | 5.059758 | 2.492171 | 0.640517 |

The screen keeps its original curve and backward tilt; its depth bounds include
both. UV (0, 0) is bottom-left and (1, 1) is top-right, viewed from the front. R05
must measure this mesh in the current camera pose rather than treating its bounds
as a flat rectangle. R04A does not implement the interactive HTML desktop.
