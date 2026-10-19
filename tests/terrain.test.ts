import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CoordinateSystem } from '../src/data/types.js';
import {
    decodeHeights,
    lodStride,
    terrainGeometry,
    validateManifest,
    validateTileEdges,
    visibleTiles,
    type TerrainManifest,
    type TerrainTile,
} from '../src/terrain.js';

function fixture(columns = 257, rows = 257): TerrainManifest {
    const tiles: TerrainTile[] = [];
    for (let row = 0; row < rows - 1; row += 256)
        for (let column = 0; column < columns - 1; column += 256)
            tiles.push({
                column,
                row,
                columns: Math.min(257, columns - column),
                rows: Math.min(257, rows - row),
                url: `${column}-${row}.f32`,
            });
    return {
        version: 1,
        mapKey: 'synthetic',
        heightFormat: 'float32-le',
        heightUnits: 'centimeters',
        rowOrder: 'increasing-world-y',
        originX: 1000,
        originY: 2000,
        maxX: 1000 + (columns - 1) * 500,
        maxY: 2000 + (rows - 1) * 500,
        spacing: 500,
        columns,
        rows,
        tileCells: 256,
        waterLevelCm: null,
        minZ: -500,
        maxZ: 200000,
        minHeight: null,
        maxHeight: null,
        coveredSamples: columns * rows,
        totalSamples: columns * rows,
        coverage: 1,
        warnings: [],
        tiles,
    };
}

function bounds(m: TerrainManifest): CoordinateSystem {
    return new CoordinateSystem(
        m.originX,
        m.maxX - 100,
        m.originY,
        m.maxY - 200,
        m.minZ,
        m.maxZ,
        2000,
        3000,
        10000,
        10000,
    );
}

test('manifest offsets, partial edge tiles, map keys and formats are validated', () => {
    const m = fixture(300, 514);
    validateManifest(m, 'synthetic');
    assert.equal(m.tiles[1].column, 256);
    assert.equal(m.tiles[1].columns, 44);
    assert.throws(() => validateManifest(m, 'other'), /Invalid terrain manifest/);
    assert.throws(() => validateManifest({ ...m, spacing: 501 }, 'synthetic'), /Invalid terrain/);
    assert.throws(
        () => validateManifest({ ...m, tiles: m.tiles.slice(1) }, 'synthetic'),
        /missing tiles/,
    );
    assert.throws(
        () => validateManifest({ ...m, tiles: [m.tiles[0], ...m.tiles] }, 'synthetic'),
        /Invalid terrain tile/,
    );
    assert.throws(
        () => validateManifest({ ...m, maxX: m.maxX + 1 }, 'synthetic'),
        /Invalid terrain/,
    );
});

test('float32 little-endian decoding preserves negative heights and NaN holes', () => {
    const tile = { column: 0, row: 0, columns: 2, rows: 2, url: 'test.f32' };
    const buffer = new ArrayBuffer(16);
    const data = new DataView(buffer);
    [-1234.5, 150000, NaN, 33.25].forEach((height, index) =>
        data.setFloat32(index * 4, height, true),
    );
    const heights = decodeHeights(buffer, tile);
    assert.deepEqual(Array.from(heights), [-1234.5, 150000, NaN, 33.25]);
    assert.throws(() => decodeHeights(buffer.slice(1), tile), /buffer length/);
    data.setFloat32(0, Infinity, true);
    assert.throws(() => decodeHeights(buffer, tile), /Infinite/);
});

test('geometry uses original samples, increasing world Y and image bounds for UVs', () => {
    const m = fixture(3, 3);
    const heights = new Float32Array([100, 200, 300, 400, 500, 600, 700, 800, 900]);
    const geometry = terrainGeometry(m, m.tiles[0], heights, bounds(m), 1);
    const position = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    assert.equal(position.getX(0), -5);
    assert.equal(position.getZ(0), -5);
    assert.equal(position.getY(4), 5);
    assert.equal(position.getZ(8), 5);
    assert.equal(uv.getX(0), 0);
    assert.equal(uv.getY(0), 1);
    assert.ok(uv.getX(8) > 1);
    assert.ok(uv.getY(8) < 0);
    assert.equal(geometry.index?.count, 24);
    geometry.dispose();
});

test('coarse cells never bridge interior NaN holes or excluded vertical layers', () => {
    const m = fixture(5, 5);
    const heights = new Float32Array(25).fill(150001);
    heights[12] = NaN;
    let geometry = terrainGeometry(m, m.tiles[0], heights, bounds(m), 4);
    assert.equal(geometry.index?.count, 0);
    geometry.dispose();
    geometry = terrainGeometry(
        { ...m, maxHeight: 150000 },
        m.tiles[0],
        new Float32Array(25).fill(150000),
        bounds(m),
        1,
    );
    assert.equal(geometry.index?.count, 0);
    geometry.dispose();
    heights[12] = 149999;
    geometry = terrainGeometry({ ...m, minHeight: 150000 }, m.tiles[0], heights, bounds(m), 4);
    assert.equal(geometry.index?.count, 0);
    geometry.dispose();
    geometry = terrainGeometry(
        { ...m, maxHeight: 150000 },
        m.tiles[0],
        new Float32Array(25).fill(150001),
        bounds(m),
        1,
    );
    assert.equal(geometry.index?.count, 0);
    geometry.dispose();
});

test('all power-of-two LODs have identical adjoining tile edge heights and positions', () => {
    const m = fixture(514, 300);
    for (const stride of [1, 2, 4, 8, 16]) {
        const geometries = m.tiles.slice(0, 2).map((tile) => {
            const heights = new Float32Array(tile.columns * tile.rows);
            for (let row = 0; row < tile.rows; row++)
                for (let column = 0; column < tile.columns; column++)
                    heights[row * tile.columns + column] = (tile.column + column) * 13 + row * 11;
            return terrainGeometry(m, tile, heights, bounds(m), stride);
        });
        const left = geometries[0].getAttribute('position');
        const right = geometries[1].getAttribute('position');
        const width = Math.ceil(256 / stride) + 1;
        const rows = Math.ceil(256 / stride) + 1;
        for (let row = 0; row < rows; row++) {
            const a = row * width + width - 1;
            const b = row * width;
            assert.equal(left.getX(a), right.getX(b));
            assert.equal(left.getY(a), right.getY(b));
            assert.equal(left.getZ(a), right.getZ(b));
        }
        geometries.forEach((geometry) => geometry.dispose());
    }
});

test('distance LOD uses only power-of-two source strides', () => {
    assert.deepEqual(
        [1, 100, 1000, 4000, 9000].map((distance) => lodStride(distance, 10000)),
        [1, 1, 2, 8, 16],
    );
});

test('shared source edges must match, including shared NaN holes', () => {
    const m = fixture(513, 257);
    const surfaces = m.tiles.map((tile) => ({
        tile,
        heights: new Float32Array(tile.columns * tile.rows).fill(123),
    }));
    validateTileEdges(surfaces);
    surfaces[0].heights[256] = surfaces[1].heights[0] = NaN;
    validateTileEdges(surfaces);
    surfaces[1].heights[257] = 124;
    assert.throws(() => validateTileEdges(surfaces), /Mismatched shared terrain edge/);
});

test('close views select visible tiles without allocating full-map meshes', () => {
    const m = fixture(1025, 1025);
    m.minZ = m.maxZ = 160000;
    m.minHeight = 150000;
    const camera = new THREE.PerspectiveCamera(42, 1, 1, 100000);
    camera.position.set(-1800, 1650, -1800);
    camera.lookAt(-1800, 1600, -1800);
    const tiles = visibleTiles(m, camera, 1);
    assert.ok(tiles.length > 0);
    assert.ok(tiles.length < m.tiles.length);
    assert.equal(tiles[0], m.tiles[0]);
    m.tiles[0].coveredSamples = 0;
    assert.equal(visibleTiles(m, camera, 1).includes(m.tiles[0]), false);
});
