import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DataLoader } from './data/DataLoader.js';
import { fetchMapImage } from './map-image.js';
import { MapData } from './data/types.js';
import { World, type WorldPoint } from './world/World.js';
import { createDespiker } from './despike.js';
import { resourcePositions } from './terrain-demo-resources.js';
import {
    decodeHeights,
    lodStride,
    terrainGeometry,
    validateManifest,
    validateTileEdges,
    visibleTiles,
    applyElevationColors,
    type TerrainManifest,
    type TerrainTile,
} from './terrain.js';

const el = (id: string): HTMLElement => {
    const result = document.getElementById(id);
    if (!result) throw new Error(`Missing control ${id}`);
    return result;
};
const input = (id: string): HTMLInputElement => el(id) as HTMLInputElement;
const value = (id: string): number => Number(input(id).value);
const checked = (id: string): boolean => input(id).checked;

async function json<T>(url: string, signal: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json() as Promise<T>;
}

interface Surface {
    tile: TerrainTile;
    heights: Float32Array;
}

interface MarkerLayer {
    points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
    glow: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
    nodes: WorldPoint[];
}

function dispose(group: THREE.Group): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    group.traverse((object) => {
        if (
            object instanceof THREE.Mesh ||
            object instanceof THREE.Points ||
            object instanceof THREE.LineSegments
        ) {
            geometries.add(object.geometry);
            for (const material of Array.isArray(object.material)
                ? object.material
                : [object.material]) {
                materials.add(material);
                if ('map' in material && material.map instanceof THREE.Texture)
                    textures.add(material.map);
            }
        }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    group.clear();
}

function markerTexture(glow: boolean): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');
    if (glow) {
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#ffffff00');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
    } else {
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(16, 16, 12, 0, Math.PI * 2);
        context.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

export class Viewer {
    private loader = new DataLoader();
    private world = new World();
    private scene = new THREE.Scene();
    private renderer = new THREE.WebGLRenderer({ antialias: true });
    private camera = new THREE.PerspectiveCamera(42, 1, 1, 1000000);
    private controls = new OrbitControls(this.camera, this.renderer.domElement);
    private terrain = new THREE.Group();
    private resources = new THREE.Group();
    private layers: MarkerLayer[] = [];
    private hidden = new Set<string>();
    private manifest?: TerrainManifest;
    private map?: MapData;
    private surfaces: Surface[] = [];
    private texture?: THREE.Texture;
    private abort?: AbortController;
    private requestedStride = 0;
    private rebuilding = false;
    private generation = 0;
    private selectedKey = '';
    private marker = markerTexture(false);
    private glow = markerTexture(true);
    private down?: { x: number; y: number };
    private meshes: THREE.Mesh[] = [];
    private rebuildError = false;
    private lastHover = 0;
    private lastVisibilityCheck = 0;
    private visibleKey = '';
    private displayRevision = 0;
    private requestedDisplayRevision = -1;
    private despiker?: ReturnType<typeof createDespiker>;

    getApplication(): Viewer {
        return this;
    }
    getCurrentMapData(): MapData | undefined {
        return this.map;
    }
    getAvailableMaps(): ReturnType<DataLoader['getMapList']> {
        return this.loader.getMapList();
    }
    switchToMap(key: string): Promise<void> {
        (el('mapSelect') as HTMLSelectElement).value = key;
        return this.load(key);
    }

    async start(): Promise<void> {
        this.scene.background = new THREE.Color('#14212b');
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.localClippingEnabled = true;
        el('viewport').append(this.renderer.domElement);
        this.scene.add(this.terrain, this.resources, new THREE.AmbientLight(0xffffff, 0.65));
        const sun = new THREE.DirectionalLight(0xfff3dd, 0.8);
        sun.position.set(-3000, 9000, -5000);
        this.scene.add(sun);
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = Math.PI * 0.495;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 500000;
        const resize = () => {
            const rect = el('viewport').getBoundingClientRect();
            this.renderer.setSize(rect.width, rect.height);
            this.camera.aspect = rect.width / Math.max(1, rect.height);
            this.camera.updateProjectionMatrix();
        };
        new ResizeObserver(resize).observe(el('viewport'));
        resize();
        this.bind();
        this.renderer.setAnimationLoop(() => {
            this.controls.update();
            if (
                this.manifest &&
                !this.rebuilding &&
                !this.rebuildError &&
                this.surfaces.length &&
                performance.now() - this.lastVisibilityCheck > 250
            ) {
                this.lastVisibilityCheck = performance.now();
                const span =
                    Math.max(
                        this.manifest.maxX - this.manifest.originX,
                        this.manifest.maxY - this.manifest.originY,
                    ) / 100;
                const stride = lodStride(
                    this.camera.position.distanceTo(this.controls.target),
                    span,
                );
                const tiles = visibleTiles(this.manifest, this.camera, value('exaggeration'));
                const visibleKey = tiles.map((tile) => `${tile.column},${tile.row}`).join(';');
                if (
                    stride !== this.requestedStride ||
                    visibleKey !== this.visibleKey ||
                    this.displayRevision !== this.requestedDisplayRevision
                ) {
                    const generation = this.generation;
                    const revision = this.displayRevision;
                    void this.rebuild(stride, generation, stride, revision).catch(
                        (error: unknown) => {
                            if (
                                generation === this.generation &&
                                revision === this.displayRevision
                            ) {
                                this.rebuildError = true;
                                this.error(error);
                            }
                        },
                    );
                }
            }
            this.renderer.render(this.scene, this.camera);
        });
        try {
            const maps = await this.loader.getMapList();
            const select = el('mapSelect') as HTMLSelectElement;
            for (const map of maps) select.add(new Option(map.name, map.key));
            select.addEventListener('change', () => void this.load(select.value));
            if (maps.length) {
                select.value = maps[0].key;
                await this.load(maps[0].key);
            } else throw new Error('No maps are available.');
        } catch (error) {
            this.error(error);
        }
    }

    private error(error: unknown): void {
        el('error').hidden = false;
        el('error-message').textContent = error instanceof Error ? error.message : String(error);
        el('loading').hidden = true;
    }

    private bind(): void {
        el('retry').addEventListener('click', () => {
            if (this.selectedKey) void this.load(this.selectedKey);
            else location.reload();
        });
        el('home').addEventListener('click', () => this.home(false));
        el('top').addEventListener('click', () => this.home(true));
        for (const id of ['cluster-enabled', 'cluster-radius'])
            input(id).addEventListener('input', () => {
                if (this.map) this.buildResources();
            });
        for (const id of [
            'exaggeration',
            'resource-size',
            'resource-glow',
            'resource-through',
            'size-attenuation',
            'terrain-opacity',
            'shading',
            'wireframe',
            'debug-toggle',
        ])
            input(id).addEventListener('input', () => this.appearance());
        for (const id of ['despike-enabled', 'spike-threshold']) {
            input(id).addEventListener('input', () => {
                el('spike-threshold-value').textContent = `${value('spike-threshold')} m`;
                if (id === 'spike-threshold' && !checked('despike-enabled')) return;
                this.displayRevision++;
                this.despiker = undefined;
                this.rebuildError = false;
                el('despike-status').textContent = checked('despike-enabled')
                    ? 'Updating isolated-spike display…'
                    : 'Restoring original terrain samples…';
            });
        }
        for (const [id, visible] of [
            ['resources-all', true],
            ['resources-none', false],
        ] as const) {
            el(id).addEventListener('click', () => {
                if (!this.map) return;
                for (const resource of this.map.resources) {
                    if (visible) this.hidden.delete(resource.resourceType);
                    else this.hidden.add(resource.resourceType);
                }
                this.updateVisibility();
            });
        }
        const canvas = this.renderer.domElement;
        canvas.addEventListener('pointerdown', (event) => {
            this.down = event.button === 0 ? { x: event.clientX, y: event.clientY } : undefined;
        });
        canvas.addEventListener('pointercancel', () => {
            this.down = undefined;
        });
        canvas.addEventListener('pointerup', (event) => {
            const down = this.down;
            this.down = undefined;
            if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 4)
                this.pick(event, true);
        });
        canvas.addEventListener('pointermove', (event) => {
            if (performance.now() - this.lastHover < 50) return;
            this.lastHover = performance.now();
            this.pick(event, false);
        });
        canvas.addEventListener('pointerleave', () => {
            el('coordinates').textContent = 'Cursor: —';
        });
    }

    private async load(key: string): Promise<void> {
        this.selectedKey = key;
        this.abort?.abort();
        const controller = (this.abort = new AbortController());
        const signal = controller.signal;
        const generation = ++this.generation;
        this.manifest = undefined;
        this.map = undefined;
        this.world = new World();
        this.surfaces = [];
        this.despiker = undefined;
        this.requestedDisplayRevision = -1;
        this.layers = [];
        this.meshes = [];
        dispose(this.terrain);
        dispose(this.resources);
        this.texture?.dispose();
        this.texture = undefined;
        this.marker.dispose();
        this.glow.dispose();
        this.marker = markerTexture(false);
        this.glow = markerTexture(true);
        this.requestedStride = 0;
        this.visibleKey = '';
        this.rebuildError = false;
        this.rebuilding = false;
        el('resource-options').replaceChildren();
        el('resource-details').textContent = 'No resource selected.';
        el('warning-summary').textContent = '';
        el('warning-list').replaceChildren();
        el('warning-details').hidden = true;
        (el('warning-details') as HTMLDetailsElement).open = false;
        el('image-warning').hidden = true;
        el('status').textContent = '';
        el('coordinates').textContent = 'Cursor: —';
        el('error').hidden = true;
        el('loading').hidden = false;
        el('loading').textContent = 'Loading map and terrain manifest…';
        try {
            const maps = await this.loader.getMapList();
            signal.throwIfAborted();
            const info = maps.find((map) => map.key === key);
            if (!info) throw new Error(`Unknown map ${key}`);
            const indexUrl = new URL('./terrain/index.json', document.baseURI).href;
            const index = await json<{ version: number; maps: { mapKey: string; url: string }[] }>(
                indexUrl,
                signal,
            );
            if (index.version !== 1 || !Array.isArray(index.maps))
                throw new Error('Invalid terrain index.');
            const entry = index.maps.find((map) => map.mapKey === key);
            if (!entry) throw new Error(`No terrain published for ${info.name}.`);
            const manifestUrl = new URL(entry.url, indexUrl).href;
            const manifest = await json<TerrainManifest>(manifestUrl, signal);
            validateManifest(manifest, key);
            const sampledTiles = manifest.tiles.filter((tile) => tile.coveredSamples !== 0);
            // This request is abortable, unlike the legacy DataLoader.loadMapByName path.
            const dataUrl =
                info.dataUrl.startsWith('http') || info.dataUrl.startsWith('/')
                    ? info.dataUrl
                    : `./data/${info.dataUrl.replace(/^\.\//, '')}`;
            const raw = await json<ConstructorParameters<typeof MapData>[0]>(
                new URL(dataUrl, document.baseURI).href,
                signal,
            );
            const map = new MapData(raw);
            if (map.mapKey !== key || !map.imageName)
                throw new Error('Map metadata/image is missing or mismatched.');
            const image = await fetchMapImage(
                new URL(`./images/${map.imageName}`, document.baseURI),
                signal,
            );
            if (image.kind === 'image') {
                const bitmap = await createImageBitmap(image.blob, {
                    imageOrientation: 'flipY',
                });
                if (signal.aborted) {
                    bitmap.close();
                    signal.throwIfAborted();
                }
                const texture = new THREE.Texture();
                texture.image = bitmap;
                texture.encoding = THREE.sRGBEncoding;
                texture.needsUpdate = true;
                texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                texture.addEventListener('dispose', () => bitmap.close());
                this.texture = texture;
            } else {
                el('image-warning').hidden = false;
                el('image-warning').textContent =
                    `Map image unavailable (HTTP ${image.status}: ${map.imageName}). Showing untextured elevation-shaded terrain; recorded resource positions are unchanged.`;
            }
            this.map = map;
            this.manifest = manifest;
            el('map-title').textContent = info.name;
            el('warning-summary').textContent = [
                `Terrain coverage: ${(manifest.coverage * 100).toFixed(3)}% (${manifest.coveredSamples.toLocaleString()} / ${manifest.totalSamples.toLocaleString()} samples). Missing samples remain holes.`,
                ...(sampledTiles.length !== manifest.tiles.length
                    ? [
                          `${manifest.tiles.length - sampledTiles.length} wholly uncovered tiles skipped; these areas remain gaps.`,
                      ]
                    : []),
            ].join('\n');
            el('warning-details').hidden = manifest.warnings.length === 0;
            el('warning-count').textContent =
                `${manifest.warnings.length.toLocaleString()} terrain warnings — full details`;
            const warnings = document.createDocumentFragment();
            for (const warning of manifest.warnings) {
                const item = document.createElement('li');
                item.textContent = warning;
                warnings.append(item);
            }
            el('warning-list').append(warnings);
            this.world.setMapData(map, this.loader.getResourceTypes());
            this.buildResources();
            this.home(false);
            // Float32 source cache is capped before allocating/fetching a potentially malformed manifest.
            const bytes = sampledTiles.reduce((sum, tile) => sum + tile.columns * tile.rows * 4, 0);
            if (bytes > 256 * 1024 * 1024)
                throw new Error('Terrain exceeds the 256 MiB source-cache budget.');
            let next = 0;
            let completed = 0;
            const surfaces: Surface[] = new Array(sampledTiles.length);
            const worker = async () => {
                while (next < sampledTiles.length) {
                    signal.throwIfAborted();
                    const index = next++;
                    const tile = sampledTiles[index];
                    const response = await fetch(new URL(tile.url, manifestUrl), { signal });
                    if (!response.ok)
                        throw new Error(
                            `Terrain tile ${tile.column},${tile.row}: HTTP ${response.status}`,
                        );
                    surfaces[index] = {
                        tile,
                        heights: decodeHeights(await response.arrayBuffer(), tile),
                    };
                    signal.throwIfAborted();
                    completed++;
                    el('loading').textContent =
                        `Loading covered terrain tiles: ${completed} / ${sampledTiles.length}`;
                }
            };
            await Promise.all(Array.from({ length: Math.min(4, sampledTiles.length) }, worker));
            signal.throwIfAborted();
            validateTileEdges(surfaces);
            this.surfaces = surfaces;
            await this.rebuild(16, generation);
            signal.throwIfAborted();
            el('loading').hidden = true;
        } catch (error) {
            if (generation !== this.generation) return;
            controller.abort();
            this.manifest = undefined;
            this.map = undefined;
            this.surfaces = [];
            this.layers = [];
            this.meshes = [];
            dispose(this.terrain);
            dispose(this.resources);
            this.texture?.dispose();
            this.texture = undefined;
            this.error(error);
        }
    }

    private home(top: boolean): void {
        if (!this.manifest) return;
        const m = this.manifest;
        const span = Math.max(m.maxX - m.originX, m.maxY - m.originY) / 100;
        const min = Math.max(m.minZ, m.minHeight ?? -Infinity);
        const max = Math.min(m.maxZ, m.maxHeight ?? Infinity);
        const elevation = ((min + max) / 200) * value('exaggeration');
        this.controls.target.set(0, elevation, 0);
        this.camera.position.set(
            top ? 0 : span * 0.7,
            elevation + span * (top ? 1.5 : 0.8),
            top ? 0.01 : span * 0.9,
        );
        this.controls.update();
    }

    private async rebuild(
        stride: number,
        generation: number,
        requestedStride = stride,
        revision = this.displayRevision,
    ): Promise<void> {
        const m = this.manifest;
        const map = this.map;
        const texture = this.texture;
        if (!m || !map || revision !== this.displayRevision) return;
        const despiker = checked('despike-enabled')
            ? (this.despiker ??= createDespiker(m, this.surfaces, value('spike-threshold')))
            : undefined;
        this.rebuilding = true;
        el('despike-status').textContent = despiker
            ? 'Updating isolated-spike display…'
            : 'Restoring original terrain samples…';
        const next = new THREE.Group();
        const meshes: THREE.Mesh[] = [];
        let triangles = 0;
        const c = map.coordinates;
        const centerX = (m.originX + m.maxX) / 2;
        const centerY = (m.originY + m.maxY) / 2;
        const planes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), (centerX - c.minX) / 100),
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), (c.maxX - centerX) / 100),
            new THREE.Plane(new THREE.Vector3(0, 0, 1), (centerY - c.minY) / 100),
            new THREE.Plane(new THREE.Vector3(0, 0, -1), (c.maxY - centerY) / 100),
        ];
        const visible = visibleTiles(m, this.camera, value('exaggeration'));
        const visibleKey = visible.map((tile) => `${tile.column},${tile.row}`).join(';');
        const selected = new Set(visible);
        const surfaces = this.surfaces.filter((surface) => selected.has(surface.tile));
        try {
            // One global power-of-two stride gives identical edge vertices on all adjacent tiles.
            // Build a complete replacement over animation frames, then swap atomically.
            for (let i = 0; i < surfaces.length; i++) {
                if (generation !== this.generation || revision !== this.displayRevision) return;
                const { tile } = surfaces[i];
                const heights = despiker ? despiker(surfaces[i]) : surfaces[i].heights;
                const geometry = terrainGeometry(m, tile, heights, c, stride);
                if (!texture) {
                    applyElevationColors(
                        geometry,
                        Math.max(m.minZ, m.minHeight ?? -Infinity),
                        Math.min(m.maxZ, m.maxHeight ?? Infinity),
                    );
                }
                triangles += (geometry.index?.count ?? 0) / 3;
                if (triangles > 1500000) {
                    geometry.dispose();
                    if (stride < 16) {
                        const coarser = stride * 2;
                        next.traverse((object) => {
                            if (object instanceof THREE.Mesh) {
                                object.geometry.dispose();
                                (object.material as THREE.Material).dispose();
                            }
                        });
                        next.clear();
                        meshes.length = 0;
                        return await this.rebuild(coarser, generation, requestedStride, revision);
                    }
                    throw new Error('Terrain exceeds the mesh budget.');
                }
                const material = new THREE.MeshLambertMaterial({
                    map: texture ?? null,
                    vertexColors: !texture,
                    side: THREE.DoubleSide,
                    clippingPlanes: planes,
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.userData.surface = true;
                next.add(mesh);
                meshes.push(mesh);
                if (despiker || i % 4 === 3)
                    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            }
            if (generation !== this.generation || revision !== this.displayRevision) return;
            // Textures are shared with the replacement; dispose only geometry/material here.
            this.clearSurface();
            for (const child of [...next.children]) this.terrain.add(child);
            this.meshes = meshes;
            this.requestedStride = requestedStride;
            this.requestedDisplayRevision = revision;
            this.visibleKey = visibleKey;
            this.appearance();
            el('status').textContent =
                `5 m source · ${stride * 5} m render stride · ${triangles.toLocaleString()} triangles`;
            el('despike-status').textContent = despiker
                ? `On — isolated peaks more than ${value('spike-threshold')} m above every neighbor; display only.`
                : 'Off — original terrain samples.';
        } finally {
            next.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    (object.material as THREE.Material).dispose();
                }
            });
            next.clear();
            if (generation === this.generation) this.rebuilding = false;
        }
    }

    private clearSurface(): void {
        this.terrain.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
                object.geometry.dispose();
                (object.material as THREE.Material).dispose();
            }
        });
        this.terrain.clear();
    }

    private buildResources(): void {
        if (!this.map || !this.manifest) return;
        el('resource-details').textContent = 'No resource selected.';
        // Marker textures are shared across redraws.
        this.resources.traverse((object) => {
            if (object instanceof THREE.Points) {
                object.geometry.dispose();
                (object.material as THREE.Material).dispose();
            }
        });
        this.resources.clear();
        this.layers = [];
        this.world.updateClusterConfig({
            enabled: checked('cluster-enabled'),
            radius: value('cluster-radius'),
            minClusterSize: 3,
            maxLevels: 4,
        });
        el('cluster-radius-value').textContent = `${value('cluster-radius')} cm`;
        const options = el('resource-options');
        options.replaceChildren();
        for (const [name, nodes] of Object.entries(this.world.pointsByResource)) {
            if (!nodes.length) continue;
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(
                    resourcePositions(
                        nodes.map((point) => [point.x, point.y, point.z]),
                        this.manifest,
                    ),
                    3,
                ),
            );
            geometry.computeBoundingSphere();
            const points = new THREE.Points(
                geometry,
                new THREE.PointsMaterial({
                    color: nodes[0].colorHex,
                    map: this.marker,
                    transparent: true,
                    alphaTest: 0.2,
                    depthWrite: false,
                }),
            );
            const glow = new THREE.Points(
                geometry,
                new THREE.PointsMaterial({
                    color: nodes[0].colorHex,
                    map: this.glow,
                    transparent: true,
                    opacity: 0.5,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                }),
            );
            points.renderOrder = 10;
            glow.renderOrder = 9;
            this.resources.add(glow, points);
            this.layers.push({ points, glow, nodes });
            const label = document.createElement('label');
            label.className = 'resource-option';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.resource = name;
            checkbox.checked = !this.hidden.has(name);
            const count = nodes.reduce(
                (sum, point) => sum + (point.type === 'cluster' ? point.count : 1),
                0,
            );
            const swatch = document.createElement('span');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = nodes[0].colorHex;
            label.append(
                checkbox,
                swatch,
                document.createTextNode(
                    `${name}: ${count.toLocaleString()} (${nodes.filter((point) => point.type === 'cluster').length} clusters)`,
                ),
            );
            options.append(label);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) this.hidden.delete(name);
                else this.hidden.add(name);
                this.updateVisibility();
            });
        }
        this.appearance();
    }

    private updateVisibility(clearSelection = true): void {
        let total = 0;
        let visibleCount = 0;
        for (const layer of this.layers) {
            const name = layer.nodes[0].resourceType;
            const visible = !this.hidden.has(name) && (name !== 'Debug' || checked('debug-toggle'));
            layer.points.visible = visible;
            layer.glow.visible = visible && checked('resource-glow');
            const count = layer.nodes.reduce(
                (sum, point) => sum + (point.type === 'cluster' ? point.count : 1),
                0,
            );
            total += count;
            if (visible) visibleCount += count;
        }
        el('resource-options')
            .querySelectorAll<HTMLInputElement>('input')
            .forEach((checkbox) => {
                checkbox.checked = !this.hidden.has(checkbox.dataset.resource ?? '');
                if (checkbox.dataset.resource === 'Debug' && checkbox.parentElement)
                    checkbox.parentElement.hidden = !checked('debug-toggle');
            });
        el('resource-summary').textContent =
            `${visibleCount.toLocaleString()} / ${total.toLocaleString()} resource nodes`;
        if (clearSelection) el('resource-details').textContent = 'No resource selected.';
    }

    private appearance(): void {
        this.terrain.scale.y = this.resources.scale.y = value('exaggeration');
        el('factor').textContent = `${value('exaggeration').toFixed(1)}×`;
        el('terrain-opacity-value').textContent = `${Math.round(value('terrain-opacity') * 100)}%`;
        el('debug-panel').hidden = !checked('debug-toggle');
        for (const layer of this.layers) {
            layer.points.material.size = value('resource-size');
            layer.glow.material.size = value('resource-size') * 2.5;
            layer.points.material.depthTest = layer.glow.material.depthTest =
                !checked('resource-through');
            layer.points.material.sizeAttenuation = layer.glow.material.sizeAttenuation =
                checked('size-attenuation');
        }
        this.terrain.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            if (object.userData.wireOverlay) return;
            let material = object.material as THREE.MeshLambertMaterial | THREE.MeshBasicMaterial;
            if (
                !this.texture &&
                checked('shading') !== material instanceof THREE.MeshLambertMaterial
            ) {
                const options = {
                    vertexColors: true,
                    side: THREE.DoubleSide,
                    clippingPlanes: material.clippingPlanes,
                };
                const replacement = checked('shading')
                    ? new THREE.MeshLambertMaterial(options)
                    : new THREE.MeshBasicMaterial(options);
                material.dispose();
                object.material = material = replacement;
            }
            material.opacity = value('terrain-opacity');
            material.transparent = material.opacity < 1;
            let wire = object.children.find((child) => child.userData.wireOverlay);
            if (!wire && checked('wireframe')) {
                wire = new THREE.Mesh(
                    object.geometry,
                    new THREE.MeshBasicMaterial({
                        color: '#0d202d',
                        wireframe: true,
                        transparent: true,
                        opacity: 0.35,
                        depthWrite: false,
                        clippingPlanes: material.clippingPlanes,
                    }),
                );
                wire.userData.wireOverlay = true;
                wire.renderOrder = 1;
                object.add(wire);
            }
            if (wire) wire.visible = checked('wireframe');
            material.polygonOffset = checked('wireframe');
            material.polygonOffsetFactor = 1;
            material.polygonOffsetUnits = 1;
            if (material instanceof THREE.MeshLambertMaterial) {
                const unlitTexture = !!this.texture && !checked('shading');
                material.emissive.set(unlitTexture ? '#ffffff' : '#000000');
                material.emissiveMap = unlitTexture ? this.texture! : null;
                material.color.set(unlitTexture ? '#000000' : '#ffffff');
            }
            material.needsUpdate = true;
        });
        this.updateVisibility(false);
    }

    private pick(event: PointerEvent, select: boolean): void {
        if (!this.map || !this.manifest) return;
        this.scene.updateMatrixWorld(true);
        const rect = this.renderer.domElement.getBoundingClientRect();
        const ray = new THREE.Raycaster();
        ray.setFromCamera(
            new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                (-(event.clientY - rect.top) / rect.height) * 2 + 1,
            ),
            this.camera,
        );
        const ground = ray.intersectObjects(this.meshes).find((hit) => {
            const world = this.toWorld(hit.point);
            const c = this.map!.coordinates;
            return world.x >= c.minX && world.x <= c.maxX && world.y >= c.minY && world.y <= c.maxY;
        });
        if (ground) {
            const world = this.toWorld(ground.point);
            const ark = this.map.coordinates.getArkCoordinates(world);
            el('coordinates').textContent =
                `Cursor: Lat ${ark.lat.toFixed(2)} / Long ${ark.long.toFixed(2)}`;
            const c = this.map.coordinates;
            el('debug-panel').textContent =
                `Canvas ${event.clientX - rect.left}, ${event.clientY - rect.top}\nWorld XYZ (cm): ${world.x.toFixed(0)}, ${world.y.toFixed(0)}, ${world.z.toFixed(0)}\nARK: ${ark.lat.toFixed(2)}, ${ark.long.toFixed(2)}\nBounds: ${this.map.coordinates.minX}…${this.map.coordinates.maxX} / ${this.map.coordinates.minY}…${this.map.coordinates.maxY}`;
            el('debug-panel').textContent +=
                `\nZ bounds: ${c.minZ}…${c.maxZ}\nCenter XY: ${c.centerX}, ${c.centerY}\nScale XY: ${c.scaleX}, ${c.scaleY}\nARK Z: ${ark.z.toFixed(0)}`;
        } else el('coordinates').textContent = 'Cursor: no terrain';
        if (ray.params.Points)
            ray.params.Points.threshold =
                (this.camera.position.distanceTo(this.controls.target) *
                    Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) *
                    (value('resource-size') + 4)) /
                rect.height;
        const hits = ray
            .intersectObjects(
                this.layers.filter((layer) => layer.points.visible).map((layer) => layer.points),
            )
            .filter(
                (hit) =>
                    checked('resource-through') ||
                    hit.distance <= (ground?.distance ?? Infinity) + 0.01,
            )
            .sort((a, b) => (a.distanceToRay ?? Infinity) - (b.distanceToRay ?? Infinity));
        const hit = hits[0];
        const layer = hit && this.layers.find((layer) => layer.points === hit.object);
        if (layer && hit.index !== undefined) {
            const point = layer.nodes[hit.index];
            const ark = this.map.coordinates.getArkCoordinates(point);
            const text = `${point.resourceType}${point.type === 'cluster' ? ` · ${point.count} nodes (centroid)` : ''}\nLat ${ark.lat.toFixed(2)} / Long ${ark.long.toFixed(2)}\nWorld XYZ (cm): ${point.x}, ${point.y}, ${point.z}\nHeight ${(point.z / 100).toFixed(1)} m`;
            if (select) el('resource-details').textContent = text;
            else el('coordinates').textContent += `\n${text}`;
        } else if (select) el('resource-details').textContent = 'No resource selected.';
    }

    private toWorld(point: THREE.Vector3): { x: number; y: number; z: number } {
        const m = this.manifest!;
        return {
            x: point.x * 100 + (m.originX + m.maxX) / 2,
            y: point.z * 100 + (m.originY + m.maxY) / 2,
            z: (point.y * 100) / value('exaggeration'),
        };
    }
}
