# ARK Resource Maps - Architecture Documentation

## Overview

The production entry point is the tiled terrain resource viewer in `src/viewer.ts`.
The former flat viewer classes remain available for shared data, clustering, and
coordinate behavior. The standalone Island demo remains at `/terrain-demo.html`.

### Production terrain viewer

`root/index.html` loads `root/index.js`, bundled from `src/main.ts`. Run
`npm run build:core` after source changes: deployment publishes `root` directly,
without a build step. `npm run typecheck`, `npm test`, and `npm run lint` provide
validation. The original `npm run build:terrain` remains independent and only
refreshes the standalone embedded Island demo.

The viewer loads `data/index.json`, the selected resource map, its image, and
`terrain/index.json`. Terrain index URLs resolve relative to that index; tile
URLs resolve relative to their per-map manifest. The version-1 manifest declares
500 cm spacing, global vertex offsets, overlapping edge vertices, float32
little-endian centimeter heights, and rows increasing in world Y. Missing NaN
samples and samples outside optional vertical layer limits (inclusive minimum,
exclusive maximum) omit affected cells.
Float32 tiles are marked binary in `.gitattributes` to prevent Git line-ending
conversion from changing their bytes.
The source data is never modified or surface-clamped. Despiking is an optional,
display-only correction and defaults off.

The main viewer no longer creates or exposes an ocean-level plane or its controls.
Existing `waterLevelCm` metadata remains accepted but unused; missing water metadata
does not produce a UI warning. The archived standalone Island demo is unchanged.

### Optional isolated-spike display correction

The checkbox enables correction of positive isolated peaks using the **original
5 m grid**, before any LOD sampling. The meter threshold defaults to **50 m** and
is adjustable from **5 to 500 m** in 5 m steps. A center is eligible only when all
eight original neighbors are finite and in the same vertical layer, it exceeds
**every neighbor by strictly more than the threshold**, and the neighbors' total
height range is at most **half the threshold**. Eligible centers display the
median of their eight neighbors. This intentionally conservative criterion
leaves connected ridges, plateaus, broad mountain tops, cliffs, high-relief
neighborhoods, holes and incomplete outer-map neighborhoods unchanged.

Neighbors across tile edges come from immutable original adjacent tile samples,
including shared four-tile corners and partial rectangular edge tiles. There is
no sequential smoothing or cascade. Raw buffers and recorded resource XYZ never
change, and disabling the checkbox exactly restores the original display samples.
Conservative hole masks and image clipping still apply after correction.

Only visible tile buffers are processed, yielding between tiles. An LRU holds at
most 32 corrected tile buffers (at most about 8.1 MiB); copies are created lazily
only when a tile changes. Threshold/toggle revisions cancel stale builds, and
completed replacements swap atomically and dispose the previous mesh geometry.

Rendering uses centered meters (world X/Y/Z become scene X/Z/Y). Texture UVs and
clipping use the resource map's exact XY image bounds, not the rounded grid edge.
Camera presets target the selected layer's elevation.
Coverage and the exporter warning count remain visible in the controls. The full
warnings, including asset paths, are accessible in a collapsed, scroll-bounded
details list; no warnings are discarded.

Map-image HTTP 404/410 responses explicitly announce an untextured,
elevation-colored terrain view. Vertex colors use the original centimeter
heights and a map-wide elevation range, so tile edges retain consistent colors.
This view preserves the sampled geometry, holes, LOD, resources, lighting and
opacity controls.
It does not invent imagery or replace terrain with a flat plane. Other image
HTTP failures, network errors, and image decoding failures remain explicit
retryable errors, as do failed terrain assets. Textured maps are unchanged.

Four tile requests run concurrently, with a 256 MiB float32 source-cache limit.
Descriptors with zero covered samples require no binary download or geometry;
their uncovered areas are still reported as gaps.
Visible tile meshes are rebuilt incrementally and swapped atomically. A common
camera-distance power-of-two stride across all tiles guarantees matching edge
vertices without cracks. Every rendered vertex comes from an original sample;
coarse cells inspect all underlying samples so holes are never bridged. A
1.5-million-triangle budget keeps the last completed coarser LOD when a finer
level is too large. Frustum selection permits full source resolution in close
views without drawing the whole map; the mesh budget automatically selects a
coarser stride when necessary. Shared source edges are verified before rendering.
Map changes abort requests, invalidate pending builds, and
dispose geometry, materials, image bitmaps, and textures.

Resources use the existing `World` clustering in original centimeter XYZ,
including per-type counts, cluster centroids, filters, and member indices.
Marker picking, glow, cave visibility, opacity, lighting, exaggeration, debug
coordinates, and oblique/north-up navigation are part of the production UI.
There is no URL-state or browser-storage contract. `window.arkApp` exposes
`switchToMap`, `getApplication`, `getAvailableMaps`, and `getCurrentMapData`
for diagnostics.

### Former viewer architecture

The original project contained two implementations:

1. **New Layered Architecture** (main) - Clean separation of concerns
2. **Legacy Implementation** - Original monolithic structure

## File Structure

```
src/
├── data/              # Data Layer - Pure data types and loading
│   ├── types.ts       # Core interfaces and enums
│   └── DataLoader.ts  # Data loading logic
├── world/             # Business Logic Layer
│   └── World.ts       # Map data management and clustering
├── rendering/         # Rendering Layer - Three.js specific
│   └── SceneManager.ts # Camera and scene management
├── ui/                # UI Layer - User interface and orchestration
│   ├── UIManager.ts   # Controls, hover, info panels
│   └── Application.ts # Main application orchestrator
├── clustering/        # Shared clustering utilities
├── legacy/            # Original implementation
└── main.ts           # New architecture entry point
```

## Build Commands

| Command                | Description                          | Output                 |
| ---------------------- | ------------------------------------ | ---------------------- |
| `npm run build`        | Build new layered architecture       | `root/index.js`        |
| `npm run build:legacy` | Build legacy implementation          | `root/index-legacy.js` |
| `npm run build:main`   | Build new architecture (alternative) | `root/main.js`         |
| `npm run dev`          | Start development server             | http://localhost:8080  |

## URLs

| URL                   | Description                                |
| --------------------- | ------------------------------------------ |
| `/`                   | New layered architecture                   |
| `/index-old.html`     | Legacy implementation                      |
| `/index-layered.html` | Alternative new architecture entry         |
| `/terrain-demo.html`  | Standalone interactive Island terrain demo |

The terrain demo is a self-contained static page with its map texture, Three.js,
and pre-sampled 129 x 129 height grid embedded. It uses approximately 54-meter
spacing and excludes obelisks. It embeds an Island resource-data snapshot, with
per-type filters, marker sizing, soft resource glows, optional terrain transparency,
and optional visibility through terrain for caves. Terrain starts fully opaque.
Resources retain their recorded XYZ and scale with vertical exaggeration.
Click a marker to see its latitude, longitude, and world XYZ.
It is published directly from `root/terrain-demo.html`; no build or terrain
re-probe is required to serve it.
An optional separate water surface uses the same texture, clipped to submerged
terrain at the measured Island water level (-144.6 meters in world coordinates).
Water opacity starts at 20 percent, with independent visibility/opacity controls.
It does not write depth, so it does not hide underwater resources.

Run `npm run build:terrain` to refresh the resource snapshot and inline demo
application from `src/terrain-demo.ts`. This preserves the existing embedded
terrain and texture, does not re-probe, and does not rebuild the main viewer.
To import an already-sampled seabed grid, run
`npm run build:terrain -- --surface path-to-surface.json`.

## Architecture Benefits

### Data Layer

- Pure data types with no dependencies
- Clean data loading with error handling
- Type-safe interfaces

### World Layer

- Business logic separation
- Clustering and spatial indexing
- Coordinate system management

### Rendering Layer

- Three.js specific logic isolated
- Camera management (2D/3D modes)
- Scene and mesh handling

### UI Layer

- User interface controls
- Application orchestration
- Event handling and callbacks

## Migration Notes

The new architecture provides:

- Better separation of concerns
- Easier testing and maintenance
- Cleaner dependency management
- Enhanced 2D/3D view capabilities
- Improved clustering controls

The legacy version is preserved for compatibility but the new layered architecture is recommended for all new development.
