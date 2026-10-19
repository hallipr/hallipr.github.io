import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchMapImage } from '../src/map-image.js';
import { applyElevationColors } from '../src/terrain.js';
import * as THREE from 'three';

const url = new URL('https://viewer.invalid/prefix/images/map.png');

test('only HTTP 404 and 410 authorize elevation-shaded rendering', async () => {
    for (const status of [404, 410]) {
        const signal = new AbortController().signal;
        const result = await fetchMapImage(url, signal, async (requestedUrl, options) => {
            assert.equal(requestedUrl, url);
            assert.equal(options?.signal, signal);
            return new Response(null, { status });
        });
        assert.deepEqual(result, { kind: 'missing', status });
    }
    for (const status of [400, 401, 403, 429, 500, 503]) {
        await assert.rejects(
            fetchMapImage(
                url,
                new AbortController().signal,
                async () => new Response(null, { status }),
            ),
            new RegExp(`Map image: HTTP ${status}`),
        );
    }
});

test('successful image responses retain their binary data', async () => {
    const result = await fetchMapImage(
        url,
        new AbortController().signal,
        async () =>
            new Response(new Uint8Array([0, 1, 2, 255]), {
                headers: { 'Content-Type': 'image/png' },
            }),
    );
    assert.equal(result.kind, 'image');
    if (result.kind !== 'image') assert.fail('Expected an image');
    assert.deepEqual(Array.from(new Uint8Array(await result.blob.arrayBuffer())), [0, 1, 2, 255]);
});

test('network, response-body, and cancellation errors never become missing images', async () => {
    const signal = new AbortController().signal;
    await assert.rejects(
        fetchMapImage(url, signal, async () => {
            throw new TypeError('Network unavailable');
        }),
        /Network unavailable/,
    );
    const response = new Response('image');
    response.blob = async () => {
        throw new Error('Unreadable image response');
    };
    await assert.rejects(
        fetchMapImage(url, signal, async () => response),
        /Unreadable image response/,
    );
    const controller = new AbortController();
    controller.abort();
    let requests = 0;
    await assert.rejects(
        fetchMapImage(url, controller.signal, async () => {
            requests++;
            return new Response('image');
        }),
        { name: 'AbortError' },
    );
    assert.equal(requests, 0);
});

test('elevation colors preserve XYZ and use one consistent absolute height range', () => {
    const geometry = new THREE.BufferGeometry();
    const xyz = new Float32Array([10, -100, 20, 30, 0, 40, 50, 100, 60]);
    const original = Array.from(xyz);
    geometry.setAttribute('position', new THREE.BufferAttribute(xyz, 3));
    applyElevationColors(geometry, -10000, 10000);
    assert.deepEqual(Array.from(geometry.getAttribute('position').array), original);
    const colors = geometry.getAttribute('color');
    assert.equal(colors.count, 3);
    assert.notEqual(colors.getX(0), colors.getX(2));
    for (const component of colors.array)
        assert.ok(Number.isFinite(component) && component >= 0 && component <= 1);
    const otherTile = new THREE.BufferGeometry();
    otherTile.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
    applyElevationColors(otherTile, -10000, 10000);
    assert.deepEqual(
        Array.from(otherTile.getAttribute('color').array),
        Array.from(colors.array).slice(3, 6),
    );
    applyElevationColors(otherTile, 0, 0);
    assert.ok(Array.from(otherTile.getAttribute('color').array).every(Number.isFinite));
    geometry.dispose();
    otherTile.dispose();
});
