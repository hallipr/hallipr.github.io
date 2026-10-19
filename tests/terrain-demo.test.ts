import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resourcePositions } from '../src/terrain-demo-resources.js';
import type { MapResource } from '../src/data/types.js';
import * as THREE from 'three';
import { createWaterGeometry } from '../src/terrain-demo-water.js';

const bounds = { originX: -342900, originY: -342900, maxX: 342900, maxY: 342900 };

test('resource positions preserve recorded heights and map Unreal XY to terrain XZ', () => {
    const points: MapResource['points'] = [
        [-10000, 20000, -15000],
        [10000, -20000, 35000],
    ];
    assert.deepEqual(
        Array.from(resourcePositions(points, bounds)),
        [-100, -150, 200, 100, 350, -200],
    );
    assert.equal(points[0][2], -15000);
});

test('resource positions account for nonzero terrain centers', () => {
    assert.deepEqual(
        Array.from(
            resourcePositions([[200, 700, 300]], {
                originX: 100,
                maxX: 500,
                originY: 200,
                maxY: 1000,
            }),
        ),
        [-1, 3, 1],
    );
});

test('invalid resource positions fail explicitly', () => {
    assert.throws(() => resourcePositions([[0, 0, NaN]], bounds), /Invalid resource XYZ/);
    assert.throws(
        () => resourcePositions([[0, 0, 0]], { ...bounds, maxX: Infinity }),
        /Invalid terrain bounds/,
    );
});

test('all Island resources retain their original XYZ, including negative heights', () => {
    const map: { resources: MapResource[] } = JSON.parse(
        readFileSync('root/data/game/TheIsland_WP.json', 'utf8'),
    );
    let total = 0;
    let negative = 0;
    for (const resource of map.resources) {
        const positions = resourcePositions(resource.points, bounds);
        assert.equal(positions.length, resource.points.length * 3);
        resource.points.forEach(([x, y, z], index) => {
            assert.equal(positions[index * 3], Math.fround(x / 100));
            assert.equal(positions[index * 3 + 1], Math.fround(z / 100));
            assert.equal(positions[index * 3 + 2], Math.fround(y / 100));
            if (z < 0) negative++;
        });
        total += resource.points.length;
    }
    assert.ok(total > 0);
    assert.ok(negative > 0);
});

function triangle(heights: [number, number, number]): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, heights[0], 0, 1, heights[1], 0, 0, heights[2], 1], 3),
    );
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
    geometry.setIndex([0, 1, 2]);
    return geometry;
}

test('water is absent above land and projects submerged triangles at sea level', () => {
    assert.equal(createWaterGeometry(triangle([1, 1, 1]), 0).getAttribute('position').count, 0);
    const water = createWaterGeometry(triangle([-2, -3, -4]), 0);
    const positions = water.getAttribute('position');
    assert.equal(positions.count, 3);
    for (let i = 0; i < positions.count; i++) assert.equal(positions.getY(i), 0);
    assert.deepEqual(Array.from(water.getAttribute('uv').array), [0, 0, 1, 0, 0, 1]);
});

test('water clips shoreline triangles and interpolates matching texture coordinates', () => {
    const water = createWaterGeometry(triangle([-1, 1, 1]), 0);
    const p = water.getAttribute('position');
    const uv = water.getAttribute('uv');
    assert.equal(p.count, 3);
    for (let i = 0; i < p.count; i++) {
        assert.equal(p.getY(i), 0);
        assert.ok(p.getX(i) + p.getZ(i) <= 0.5);
        assert.equal(p.getX(i), uv.getX(i));
        assert.equal(p.getZ(i), uv.getY(i));
    }
    assert.equal(createWaterGeometry(triangle([-1, -1, 1]), 0).getAttribute('position').count, 6);
});

test('water handles exact shoreline heights and rejects invalid inputs', () => {
    assert.equal(createWaterGeometry(triangle([0, 0, 0]), 0).getAttribute('position').count, 0);
    assert.equal(createWaterGeometry(triangle([-1, 0, 0]), 0).getAttribute('position').count, 3);
    assert.throws(() => createWaterGeometry(triangle([-1, -1, -1]), NaN), /Water masking/);
});
