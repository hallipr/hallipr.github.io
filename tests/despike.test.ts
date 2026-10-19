import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDespiker, type OriginalSurface } from '../src/despike.js';
import { terrainGeometry, type TerrainManifest } from '../src/terrain.js';
import { CoordinateSystem } from '../src/data/types.js';

function fixture(columns: number, rows: number, height: (x: number, y: number) => number) {
    const surfaces: OriginalSurface[] = [];
    for (let row = 0; row < rows - 1; row += 256) {
        for (let column = 0; column < columns - 1; column += 256) {
            const tile = {
                column,
                row,
                columns: Math.min(257, columns - column),
                rows: Math.min(257, rows - row),
                url: `${column}-${row}.f32`,
            };
            const heights = new Float32Array(tile.columns * tile.rows);
            for (let y = 0; y < tile.rows; y++)
                for (let x = 0; x < tile.columns; x++)
                    heights[y * tile.columns + x] = height(column + x, row + y);
            surfaces.push({ tile, heights });
        }
    }
    const manifest: TerrainManifest = {
        version: 1,
        mapKey: 'fixture',
        heightFormat: 'float32-le',
        heightUnits: 'centimeters',
        rowOrder: 'increasing-world-y',
        originX: 0,
        originY: 0,
        spacing: 500,
        maxX: (columns - 1) * 500,
        maxY: (rows - 1) * 500,
        columns,
        rows,
        tileCells: 256,
        minZ: -50000,
        maxZ: 100000,
        minHeight: null,
        maxHeight: null,
        waterLevelCm: null,
        coveredSamples: columns * rows,
        totalSamples: columns * rows,
        coverage: 1,
        warnings: [],
        tiles: surfaces.map((surface) => surface.tile),
    };
    return { manifest, surfaces };
}

test('despiking uses a strict meter threshold and the median of eight original neighbors', () => {
    const { manifest, surfaces } = fixture(5, 5, (x, y) => (x === 2 && y === 2 ? 6000 : 1000));
    assert.equal(createDespiker(manifest, surfaces, 50)(surfaces[0]), surfaces[0].heights);
    assert.equal(createDespiker(manifest, surfaces, 49)(surfaces[0])[12], 1000);
    const medianFixture = fixture(
        3,
        3,
        (x, y) => [100, 200, 300, 400, 20000, 500, 600, 700, 800][y * 3 + x],
    );
    assert.equal(
        createDespiker(
            medianFixture.manifest,
            medianFixture.surfaces,
            50,
        )(medianFixture.surfaces[0])[4],
        450,
    );
});

test('holes, missing neighbors, global edges, negative pits and layer exclusions are never filled', () => {
    for (const getHeight of [
        (x: number, y: number) => (x === 2 && y === 2 ? NaN : 0),
        (x: number, y: number) => (x === 2 && y === 2 ? 20000 : x === 1 && y === 1 ? NaN : 0),
        (x: number, y: number) => (x === 0 && y === 0 ? 20000 : 0),
        (x: number, y: number) => (x === 2 && y === 2 ? -20000 : 0),
    ]) {
        const { manifest, surfaces } = fixture(5, 5, getHeight);
        const original = surfaces[0].heights.slice();
        assert.deepEqual(createDespiker(manifest, surfaces, 50)(surfaces[0]), original);
    }
    const { manifest, surfaces } = fixture(5, 5, (x, y) => (x === 2 && y === 2 ? 160000 : 140000));
    assert.equal(
        createDespiker({ ...manifest, maxHeight: 150000 }, surfaces, 50)(surfaces[0]),
        surfaces[0].heights,
    );
});

test('broad mountains, plateaus, ridges, cliffs and steep local relief remain original', () => {
    for (const getHeight of [
        (x: number, y: number) => 50000 - (Math.abs(x - 3) + Math.abs(y - 3)) * 2000,
        (x: number, y: number) => (x >= 2 && x <= 4 && y >= 2 && y <= 4 ? 50000 : 0),
        (x: number) => (x === 3 ? 50000 : 0),
        (x: number) => (x >= 3 ? 50000 : 0),
        (x: number, y: number) => (x === 3 && y === 3 ? 20000 : x === 2 && y === 2 ? 3000 : 0),
    ]) {
        const { manifest, surfaces } = fixture(7, 7, getHeight);
        assert.equal(createDespiker(manifest, surfaces, 50)(surfaces[0]), surfaces[0].heights);
    }
});

test('overlapping vertices use neighboring originals, including four-way seams and rectangular edges', () => {
    const { manifest, surfaces } = fixture(260, 259, (x, y) =>
        (x === 256 && y === 256) || (x === 258 && y === 257) ? 20000 : 0,
    );
    const originals = surfaces.map((surface) => surface.heights.slice());
    const despike = createDespiker(manifest, surfaces, 50);
    const forward = surfaces.map((surface) => despike(surface));
    const reverse = [...surfaces]
        .reverse()
        .map((surface) => createDespiker(manifest, surfaces, 50)(surface))
        .reverse();
    assert.deepEqual(forward, reverse);
    surfaces.forEach(({ tile }, index) => {
        assert.deepEqual(surfaces[index].heights, originals[index]);
        const x = 256 - tile.column;
        const y = 256 - tile.row;
        if (x >= 0 && x < tile.columns && y >= 0 && y < tile.rows)
            assert.equal(forward[index][y * tile.columns + x], 0);
    });
    assert.equal(forward[3][1 * 4 + 2], 0);
    const incomplete = surfaces.filter((surface) => surface.tile.column === 0);
    assert.equal(createDespiker(manifest, incomplete, 50)(surfaces[0])[256 * 257 + 256], 20000);
});

test('display correction precedes LOD, preserves original bytes and restores exact mesh positions', () => {
    const { manifest, surfaces } = fixture(5, 5, (x, y) => (x === 2 && y === 2 ? 20000 : 0));
    const originalBytes = new Uint8Array(surfaces[0].heights.buffer).slice();
    const c = new CoordinateSystem(0, 2000, 0, 2000, -50000, 100000, 0, 0, 100, 100);
    const original = terrainGeometry(manifest, surfaces[0].tile, surfaces[0].heights, c, 2);
    const filtered = terrainGeometry(
        manifest,
        surfaces[0].tile,
        createDespiker(manifest, surfaces, 50)(surfaces[0]),
        c,
        2,
    );
    const restored = terrainGeometry(manifest, surfaces[0].tile, surfaces[0].heights, c, 2);
    assert.equal(original.getAttribute('position').getY(4), 200);
    assert.equal(filtered.getAttribute('position').getY(4), 0);
    assert.deepEqual(
        restored.getAttribute('position').array,
        original.getAttribute('position').array,
    );
    assert.deepEqual(new Uint8Array(surfaces[0].heights.buffer), originalBytes);
    original.dispose();
    filtered.dispose();
    restored.dispose();
});

test('cache eviction and different thresholds always recompute from immutable originals', () => {
    const { manifest, surfaces } = fixture(34 * 256 + 1, 3, (x, y) =>
        y === 1 && x % 256 === 128 ? 20000 : 0,
    );
    const despike = createDespiker(manifest, surfaces, 50);
    const first = despike(surfaces[0]).slice();
    surfaces.forEach(despike);
    assert.deepEqual(despike(surfaces[0]), first);
    assert.equal(createDespiker(manifest, surfaces, 500)(surfaces[0]), surfaces[0].heights);
    assert.equal(surfaces[0].heights[257 + 128], 20000);
    for (const threshold of [0, -1, NaN, Infinity])
        assert.throws(() => createDespiker(manifest, surfaces, threshold), /positive number/);
});
