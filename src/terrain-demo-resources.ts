import * as THREE from 'three';
import { CoordinateSystem, type MapResource, type ResourceType } from './data/types.js';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Bounds {
    originX: number;
    originY: number;
    maxX: number;
    maxY: number;
}

export interface ResourceSnapshot {
    resourceTypes: ResourceType[];
    map: {
        mapKey: string;
        resources: MapResource[];
        coordinates: Omit<CoordinateSystem, 'getArkCoordinates'>;
    };
}

export interface TerrainDemo {
    ready: boolean;
    terrain: THREE.Mesh;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    metadata: Bounds;
    controls: OrbitControls;
    wire: THREE.LineSegments;
    water: THREE.Mesh;
    heights: Float32Array;
    textureSize: number[];
}

declare global {
    interface Window {
        terrainDemo?: TerrainDemo;
        terrainDemoResourcesData: ResourceSnapshot;
    }
}

export function resourcePositions(points: MapResource['points'], bounds: Bounds): Float32Array {
    const centerX = (bounds.originX + bounds.maxX) / 2;
    const centerY = (bounds.originY + bounds.maxY) / 2;
    if (![centerX, centerY].every(Number.isFinite)) {
        throw new Error('Invalid terrain bounds for resources.');
    }
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, index) => {
        if (point.length !== 3 || !point.every(Number.isFinite)) {
            throw new Error(`Invalid resource XYZ at index ${index}.`);
        }
        positions.set(
            [(point[0] - centerX) / 100, point[2] / 100, (point[1] - centerY) / 100],
            index * 3,
        );
    });
    return positions;
}

function markerTexture(color: string, glow = false): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create resource marker texture.');
    if (glow) {
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.25, `${color}bb`);
        gradient.addColorStop(1, `${color}00`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
    } else {
        context.beginPath();
        context.arc(16, 16, 12, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = '#ffffff';
        context.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

export function addResources(demo: TerrainDemo, data: ResourceSnapshot): void {
    if (data.map.mapKey !== 'TheIsland_WP')
        throw new Error('Resources must match the Island terrain.');
    const panel = document.querySelector('.panel');
    if (!panel) throw new Error('Terrain controls panel is missing.');
    const style = document.createElement('style');
    style.textContent = `
        .panel{max-height:calc(100vh - 40px);overflow-y:auto}
        #resource-controls label{margin:9px 0}
        #resource-controls h2{font-size:16px;margin:0 0 10px}
        .resource-option{display:flex;align-items:center;gap:6px}
        .resource-option .count{margin-left:auto;color:#91adb9;font-size:11px}
        .resource-swatch{width:10px;height:10px;border:1px solid #fff;border-radius:50%}
        #resource-controls .buttons{margin:12px 0}
        #resource-details{font-size:12px;line-height:1.6;color:#d0dfe4;white-space:pre-line}
        @media(max-width:650px){.panel{max-height:calc(100dvh - 20px)}}
    `;
    document.head.append(style);
    const section = document.createElement('section');
    section.id = 'resource-controls';
    section.setAttribute('aria-label', 'Resources');
    section.innerHTML = `<hr><h2>Resources</h2>
        <div id="resource-options"></div>
        <div class="buttons"><button id="resources-all">Show all</button><button id="resources-none">Hide all</button></div>
        <label>Marker size <input id="resource-size" type="range" min="2" max="12" step="1" value="5" aria-label="Resource marker size"></label>
        <label><input id="resource-glow" type="checkbox" checked>Resource glow</label>
        <label><input id="resource-through" type="checkbox" checked>Show through terrain (caves)</label>
        <label><span class="row"><span>Terrain opacity</span><output id="terrain-opacity-value">100%</output></span><input id="terrain-opacity" type="range" min="0.15" max="1" step="0.05" value="1" aria-label="Terrain opacity"></label>
        <div id="resource-summary" class="note" aria-live="polite"></div>
        <p class="note">Recorded XYZ, not surface-clamped. Vertical exaggeration applies to resources too. Click a marker for coordinates.</p>
        <div id="resource-details" aria-live="polite">No resource selected.</div>`;
    panel.append(section);
    const options = section.querySelector('#resource-options');
    const summary = section.querySelector('#resource-summary');
    const detail = section.querySelector('#resource-details');
    if (!options || !summary || !detail) throw new Error('Resource controls could not be created.');
    const group = new THREE.Group();
    group.name = 'terrain-demo-resources';
    demo.terrain.add(group);
    const layers: {
        points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
        glow: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
        resource: MapResource;
        checkbox: HTMLInputElement;
    }[] = [];
    let glowEnabled = true;
    const updateSummary = () => {
        const visible = layers.reduce(
            (sum, layer) => sum + (layer.points.visible ? layer.resource.points.length : 0),
            0,
        );
        const total = layers.reduce((sum, layer) => sum + layer.resource.points.length, 0);
        summary.textContent = `${visible.toLocaleString()} / ${total.toLocaleString()} resource points`;
        detail.textContent = 'No resource selected.';
    };
    for (const resource of data.map.resources) {
        const type = data.resourceTypes.find((type) => type.name === resource.resourceType);
        if (!type || !/^#[0-9a-f]{6}$/i.test(type.colorHex)) {
            throw new Error(`Missing or invalid color for ${resource.resourceType}.`);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(resourcePositions(resource.points, demo.metadata), 3),
        );
        geometry.computeBoundingSphere();
        const material = new THREE.PointsMaterial({
            size: 5,
            sizeAttenuation: false,
            map: markerTexture(type.colorHex),
            transparent: true,
            alphaTest: 0.2,
            depthTest: false,
            depthWrite: false,
        });
        const points = new THREE.Points(geometry, material);
        points.name = resource.resourceType;
        points.renderOrder = 10;
        const glow = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size: 12.5,
                sizeAttenuation: false,
                map: markerTexture(type.colorHex, true),
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
            }),
        );
        glow.name = `${resource.resourceType} glow`;
        glow.renderOrder = 9;
        group.add(glow, points);
        const label = document.createElement('label');
        label.className = 'resource-option';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        const swatch = document.createElement('span');
        swatch.className = 'resource-swatch';
        swatch.style.backgroundColor = type.colorHex;
        const count = document.createElement('span');
        count.className = 'count';
        count.textContent = resource.points.length.toLocaleString();
        label.append(checkbox, swatch, document.createTextNode(resource.resourceType), count);
        options.append(label);
        layers.push({ points, glow, resource, checkbox });
        checkbox.addEventListener('change', () => {
            points.visible = checkbox.checked;
            glow.visible = checkbox.checked && glowEnabled;
            updateSummary();
        });
    }
    for (const [id, visible] of [
        ['resources-all', true],
        ['resources-none', false],
    ] as const) {
        section.querySelector(`#${id}`)?.addEventListener('click', () => {
            layers.forEach((layer) => {
                layer.points.visible = layer.checkbox.checked = visible;
                layer.glow.visible = visible && glowEnabled;
            });
            updateSummary();
        });
    }
    section.querySelector('#resource-size')?.addEventListener('input', (event) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        const size = Number(event.target.value);
        layers.forEach((layer) => {
            layer.points.material.size = size;
            layer.glow.material.size = size * 2.5;
        });
    });
    section.querySelector('#resource-glow')?.addEventListener('change', (event) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        glowEnabled = event.target.checked;
        layers.forEach((layer) => {
            layer.glow.visible = layer.points.visible && glowEnabled;
        });
    });
    section.querySelector('#resource-through')?.addEventListener('change', (event) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        const through = event.target.checked;
        layers.forEach((layer) => {
            layer.points.material.depthTest = layer.glow.material.depthTest = !through;
        });
        detail.textContent = 'No resource selected.';
    });
    let opacity = 1;
    const applyOpacity = () => {
        const materials = Array.isArray(demo.terrain.material)
            ? demo.terrain.material
            : [demo.terrain.material];
        materials.forEach((material) => {
            material.opacity = opacity;
            const transparent = opacity < 1;
            if (material.transparent !== transparent) {
                material.transparent = transparent;
                material.needsUpdate = true;
            }
        });
    };
    section.querySelector('#terrain-opacity')?.addEventListener('input', (event) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        opacity = Number(event.target.value);
        applyOpacity();
        const output = section.querySelector('#terrain-opacity-value');
        if (output) output.textContent = `${Math.round(opacity * 100)}%`;
    });
    document.getElementById('shading')?.addEventListener('change', applyOpacity);
    const c = data.map.coordinates;
    const coordinates = new CoordinateSystem(
        c.minX,
        c.maxX,
        c.minY,
        c.maxY,
        c.minZ,
        c.maxZ,
        c.centerX,
        c.centerY,
        c.scaleX,
        c.scaleY,
    );
    const canvas = demo.renderer.domElement;
    let down: { x: number; y: number } | undefined;
    canvas.addEventListener('pointerdown', (event) => {
        down = event.button === 0 ? { x: event.clientX, y: event.clientY } : undefined;
    });
    canvas.addEventListener('pointerup', (event) => {
        const start = down;
        down = undefined;
        if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) return;
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, demo.camera);
        const cameraDistance = demo.camera.position.distanceTo(demo.terrain.position);
        const size = layers[0]?.points.material.size ?? 5;
        if (raycaster.params.Points) {
            raycaster.params.Points.threshold =
                (cameraDistance *
                    Math.tan(THREE.MathUtils.degToRad(demo.camera.fov / 2)) *
                    (size + 4)) /
                rect.height;
        }
        const through = layers[0]?.points.material.depthTest === false;
        const terrainDistance = through
            ? Infinity
            : (raycaster.intersectObject(demo.terrain, false)[0]?.distance ?? Infinity);
        const intersections = raycaster
            .intersectObjects(
                layers.filter((layer) => layer.points.visible).map((layer) => layer.points),
            )
            .filter((hit) => hit.distance <= terrainDistance + 0.01)
            .sort((a, b) => (a.distanceToRay ?? Infinity) - (b.distanceToRay ?? Infinity));
        const hit = intersections[0];
        const layer = hit && layers.find((layer) => layer.points === hit.object);
        if (!layer || hit.index === undefined) {
            detail.textContent = 'No resource selected.';
            return;
        }
        const point = layer.resource.points[hit.index];
        const ark = coordinates.getArkCoordinates({ x: point[0], y: point[1], z: point[2] });
        detail.textContent = `${layer.resource.resourceType}\nLat ${ark.lat.toFixed(2)} / Long ${ark.long.toFixed(2)}\nWorld XYZ (cm): ${point.join(', ')}\nHeight: ${(point[2] / 100).toFixed(1)} m`;
    });
    updateSummary();
}
