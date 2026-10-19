import * as THREE from 'three';
import type { CoordinateSystem } from './data/types.js';

export function applyElevationColors(
    geometry: THREE.BufferGeometry,
    minZ: number,
    maxZ: number,
): void {
    const palette = ['#173b55', '#3d8275', '#90a865', '#c1ae88', '#f1f0e9'].map((color) =>
        new THREE.Color(color).convertSRGBToLinear(),
    );
    const position = geometry.getAttribute('position');
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let index = 0; index < position.count; index++) {
        const height = position.getY(index) * 100;
        const t = maxZ > minZ ? THREE.MathUtils.clamp((height - minZ) / (maxZ - minZ), 0, 1) : 0.5;
        const level = t * (palette.length - 1);
        const lower = Math.min(Math.floor(level), palette.length - 2);
        color.copy(palette[lower]).lerp(palette[lower + 1], level - lower);
        colors.set([color.r, color.g, color.b], index * 3);
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

export interface TerrainTile {
    column: number;
    row: number;
    columns: number;
    rows: number;
    url: string;
    minZ?: number | null;
    maxZ?: number | null;
    coveredSamples?: number;
}

export function visibleTiles(
    manifest: TerrainManifest,
    camera: THREE.Camera,
    exaggeration: number,
): TerrainTile[] {
    camera.updateMatrixWorld();
    const frustum = new THREE.Frustum().setFromProjectionMatrix(
        new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
    );
    const centerX = (manifest.originX + manifest.maxX) / 2;
    const centerY = (manifest.originY + manifest.maxY) / 2;
    return manifest.tiles.filter((tile) => {
        if (tile.coveredSamples === 0) return false;
        const x = (manifest.originX + tile.column * manifest.spacing - centerX) / 100;
        const z = (manifest.originY + tile.row * manifest.spacing - centerY) / 100;
        const box = new THREE.Box3(
            new THREE.Vector3(
                x,
                (Math.max(tile.minZ ?? manifest.minZ, manifest.minHeight ?? -Infinity) / 100) *
                    exaggeration,
                z,
            ),
            new THREE.Vector3(
                x + ((tile.columns - 1) * manifest.spacing) / 100,
                (Math.min(tile.maxZ ?? manifest.maxZ, manifest.maxHeight ?? Infinity) / 100) *
                    exaggeration,
                z + ((tile.rows - 1) * manifest.spacing) / 100,
            ),
        );
        // Include a small guard band to avoid exposing tile edges during damped navigation.
        box.expandByScalar(20);
        return !box.isEmpty() && frustum.intersectsBox(box);
    });
}

export interface TerrainManifest {
    version: number;
    mapKey: string;
    heightFormat: string;
    heightUnits: string;
    rowOrder: string;
    originX: number;
    originY: number;
    maxX: number;
    maxY: number;
    spacing: number;
    columns: number;
    rows: number;
    tileCells: number;
    waterLevelCm: number | null;
    minZ: number;
    maxZ: number;
    minHeight: number | null;
    maxHeight: number | null;
    coveredSamples: number;
    totalSamples: number;
    coverage: number;
    warnings: string[];
    tiles: TerrainTile[];
}

export function validateManifest(manifest: TerrainManifest, mapKey: string): void {
    if (
        manifest.version !== 1 ||
        manifest.mapKey !== mapKey ||
        manifest.heightFormat !== 'float32-le' ||
        manifest.heightUnits !== 'centimeters' ||
        manifest.rowOrder !== 'increasing-world-y' ||
        manifest.spacing !== 500 ||
        manifest.tileCells !== 256 ||
        ![
            manifest.originX,
            manifest.originY,
            manifest.maxX,
            manifest.maxY,
            manifest.minZ,
            manifest.maxZ,
        ].every(Number.isFinite) ||
        ![manifest.columns, manifest.rows].every((n) => Number.isInteger(n) && n >= 2) ||
        Math.abs(manifest.maxX - manifest.originX - (manifest.columns - 1) * 500) > 0.01 ||
        Math.abs(manifest.maxY - manifest.originY - (manifest.rows - 1) * 500) > 0.01 ||
        !Array.isArray(manifest.tiles) ||
        !Array.isArray(manifest.warnings) ||
        (manifest.waterLevelCm !== null && !Number.isFinite(manifest.waterLevelCm))
    )
        throw new Error(`Invalid terrain manifest for ${mapKey}.`);
    const keys = new Set<string>();
    for (const tile of manifest.tiles) {
        const key = `${tile.column},${tile.row}`;
        if (
            keys.has(key) ||
            ![tile.column, tile.row].every((n) => Number.isInteger(n) && n >= 0 && n % 256 === 0) ||
            tile.column >= manifest.columns - 1 ||
            tile.row >= manifest.rows - 1 ||
            tile.columns !== Math.min(257, manifest.columns - tile.column) ||
            tile.rows !== Math.min(257, manifest.rows - tile.row) ||
            typeof tile.url !== 'string' ||
            !tile.url
        )
            throw new Error(`Invalid terrain tile ${key}.`);
        keys.add(key);
    }
    const expected = Math.ceil((manifest.columns - 1) / 256) * Math.ceil((manifest.rows - 1) / 256);
    if (keys.size !== expected) throw new Error('Terrain manifest is missing tiles.');
}

export function decodeHeights(buffer: ArrayBuffer, tile: TerrainTile): Float32Array {
    if (buffer.byteLength !== tile.columns * tile.rows * 4)
        throw new Error(`Incorrect height buffer length for tile ${tile.column},${tile.row}.`);
    const view = new DataView(buffer);
    const heights = new Float32Array(tile.columns * tile.rows);
    for (let i = 0; i < heights.length; i++) {
        const height = view.getFloat32(i * 4, true);
        if (!Number.isFinite(height) && !Number.isNaN(height))
            throw new Error('Infinite terrain height.');
        heights[i] = height;
    }
    return heights;
}

export function validateTileEdges(surfaces: { tile: TerrainTile; heights: Float32Array }[]): void {
    const indexed = new Map(
        surfaces.map((surface) => [`${surface.tile.column},${surface.tile.row}`, surface]),
    );
    const same = (a: number, b: number) => a === b || (Number.isNaN(a) && Number.isNaN(b));
    for (const { tile, heights } of surfaces) {
        const right = indexed.get(`${tile.column + 256},${tile.row}`);
        const below = indexed.get(`${tile.column},${tile.row + 256}`);
        for (let row = 0; right && row < tile.rows; row++) {
            if (
                !same(
                    heights[row * tile.columns + tile.columns - 1],
                    right.heights[row * right.tile.columns],
                )
            )
                throw new Error(`Mismatched shared terrain edge at ${tile.column},${tile.row}.`);
        }
        for (let column = 0; below && column < tile.columns; column++) {
            if (!same(heights[(tile.rows - 1) * tile.columns + column], below.heights[column]))
                throw new Error(`Mismatched shared terrain edge at ${tile.column},${tile.row}.`);
        }
    }
}

export function lodStride(distance: number, span: number): number {
    return distance > span * 0.8
        ? 16
        : distance > span * 0.35
          ? 8
          : distance > span * 0.12
            ? 4
            : distance > span * 0.04
              ? 2
              : 1;
}

export function terrainGeometry(
    manifest: TerrainManifest,
    tile: TerrainTile,
    heights: Float32Array,
    bounds: CoordinateSystem,
    stride: number,
): THREE.BufferGeometry {
    if (![1, 2, 4, 8, 16].includes(stride)) throw new Error('Invalid terrain LOD stride.');
    const centerX = (manifest.originX + manifest.maxX) / 2;
    const centerY = (manifest.originY + manifest.maxY) / 2;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const xs: number[] = [];
    const ys: number[] = [];
    for (let x = 0; x < tile.columns - 1; x += stride) xs.push(x);
    for (let y = 0; y < tile.rows - 1; y += stride) ys.push(y);
    xs.push(tile.columns - 1);
    ys.push(tile.rows - 1);
    for (const y of ys)
        for (const x of xs) {
            const worldX = manifest.originX + (tile.column + x) * manifest.spacing;
            const worldY = manifest.originY + (tile.row + y) * manifest.spacing;
            const height = heights[y * tile.columns + x];
            positions.push(
                (worldX - centerX) / 100,
                Number.isFinite(height) ? height / 100 : 0,
                (worldY - centerY) / 100,
            );
            uvs.push(
                (worldX - bounds.minX) / (bounds.maxX - bounds.minX),
                1 - (worldY - bounds.minY) / (bounds.maxY - bounds.minY),
            );
        }
    for (let row = 0; row < ys.length - 1; row++)
        for (let column = 0; column < xs.length - 1; column++) {
            let valid = true;
            // A coarse triangle must never cover an unsampled hole or excluded vertical layer.
            for (let y = ys[row]; valid && y <= ys[row + 1]; y++) {
                for (let x = xs[column]; x <= xs[column + 1]; x++) {
                    const height = heights[y * tile.columns + x];
                    if (
                        !Number.isFinite(height) ||
                        (manifest.minHeight !== null && height < manifest.minHeight) ||
                        (manifest.maxHeight !== null && height >= manifest.maxHeight)
                    ) {
                        valid = false;
                        break;
                    }
                }
            }
            if (!valid) continue;
            const a = row * xs.length + column;
            const b = a + 1;
            const c = a + xs.length;
            indices.push(a, c, b, b, c, c + 1);
        }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
}
