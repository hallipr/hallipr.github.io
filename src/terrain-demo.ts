import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addResources, type TerrainDemo } from './terrain-demo-resources.js';
import { createWaterGeometry } from './terrain-demo-water.js';

interface TerrainInput {
    metadata: {
        columns: number;
        rows: number;
        spacing: number;
        originX: number;
        originY: number;
        maxX: number;
        maxY: number;
    };
    heightsBase64: string;
    textureDataUrl: string;
}

declare global {
    interface Window {
        terrainDemoData: TerrainInput;
    }
}

function element(id: string): HTMLElement {
    const result = document.getElementById(id);
    if (!result) throw new Error(`Missing demo control: ${id}`);
    return result;
}

function inputElement(id: string): HTMLInputElement {
    const result = element(id);
    if (!(result instanceof HTMLInputElement)) throw new Error(`Invalid input control: ${id}`);
    return result;
}

function cameraHome(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    topDown = false,
): void {
    controls.target.set(0, 100, 0);
    camera.position.fromArray(topDown ? [0, 11000, 1] : [6500, 5200, 8500]);
    controls.update();
}

async function start(): Promise<void> {
    const status = element('status');
    const viewport = element('viewport');
    const input = window.terrainDemoData;
    const metadata = input.metadata;
    const binary = atob(input.heightsBase64);
    if (binary.length !== metadata.columns * metadata.rows * 4) {
        throw new Error('The embedded height buffer has an unexpected size.');
    }
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const view = new DataView(bytes.buffer);
    const heights = new Float32Array(metadata.columns * metadata.rows);
    for (let i = 0; i < heights.length; i++) {
        heights[i] = view.getFloat32(i * 4, true);
        if (!Number.isFinite(heights[i]))
            throw new Error(`Missing or invalid terrain sample at index ${i}.`);
    }
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#14212b');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    viewport.append(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(42, 1, 2, 60000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 100;
    controls.maxDistance = 25000;
    controls.minPolarAngle = 0.001;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.screenSpacePanning = true;
    cameraHome(camera, controls);
    const width = (metadata.maxX - metadata.originX) / 100;
    const depth = (metadata.maxY - metadata.originY) / 100;
    const geometry = new THREE.PlaneGeometry(width, depth, metadata.columns - 1, metadata.rows - 1);
    const position = geometry.attributes.position;
    for (let row = 0; row < metadata.rows; row++) {
        for (let column = 0; column < metadata.columns; column++) {
            const index = row * metadata.columns + column;
            position.setXYZ(
                index,
                -width / 2 + (column * metadata.spacing) / 100,
                heights[index] / 100,
                -depth / 2 + (row * metadata.spacing) / 100,
            );
        }
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const texture = await new THREE.TextureLoader().loadAsync(input.textureDataUrl);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const shaded = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide });
    const unlit = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const terrain = new THREE.Mesh<
        THREE.PlaneGeometry,
        THREE.MeshLambertMaterial | THREE.MeshBasicMaterial
    >(geometry, shaded);
    scene.add(terrain);
    const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({ color: '#0d202d', transparent: true, opacity: 0.28 }),
    );
    wire.visible = false;
    wire.position.y = 0.8;
    scene.add(wire);
    // Measured collision height of the Island's SM_OceanPlane, in meters.
    const waterLevel = -144.5973535;
    const waterMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: '#a8dfff',
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(createWaterGeometry(geometry, waterLevel), waterMaterial);
    water.name = 'ocean-water-surface';
    water.renderOrder = 5;
    scene.add(water);
    const waterControls = document.createElement('div');
    waterControls.innerHTML = `<label><input id="water-visible" type="checkbox" checked>Show ocean water surface</label>
        <label><span class="row"><span>Water opacity</span><output id="water-opacity-value">20%</output></span><input id="water-opacity" type="range" min="0" max="0.8" step="0.05" value="0.2" aria-label="Water opacity"></label>`;
    status.before(waterControls);
    inputElement('water-visible').addEventListener('change', () => {
        water.visible = inputElement('water-visible').checked;
    });
    inputElement('water-opacity').addEventListener('input', () => {
        waterMaterial.opacity = Number(inputElement('water-opacity').value);
        element('water-opacity-value').textContent = `${Math.round(waterMaterial.opacity * 100)}%`;
    });
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sun = new THREE.DirectionalLight(0xfff3dd, 0.8);
    sun.position.set(-3000, 9000, -5000);
    scene.add(sun);
    const border = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-width / 2, waterLevel, -depth / 2),
            new THREE.Vector3(width / 2, waterLevel, -depth / 2),
            new THREE.Vector3(width / 2, waterLevel, depth / 2),
            new THREE.Vector3(-width / 2, waterLevel, depth / 2),
        ]),
        new THREE.LineBasicMaterial({ color: '#557382' }),
    );
    scene.add(border);
    const exaggeration = inputElement('exaggeration');
    exaggeration.addEventListener('input', () => {
        const value = Number(exaggeration.value);
        terrain.scale.y = wire.scale.y = water.scale.y = border.scale.y = value;
        element('factor').textContent = `${value.toFixed(1)}x`;
    });
    const wireframe = inputElement('wireframe');
    wireframe.addEventListener('change', () => {
        wire.visible = wireframe.checked;
    });
    const shading = inputElement('shading');
    shading.addEventListener('change', () => {
        terrain.material = shading.checked ? shaded : unlit;
    });
    element('home').addEventListener('click', () => cameraHome(camera, controls));
    element('top').addEventListener('click', () => cameraHome(camera, controls, true));
    function resize(): void {
        const { width, height } = viewport.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(viewport);
    resize();
    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    });
    if (!geometry.index) throw new Error('Terrain geometry has no triangle indices.');
    status.textContent = `${metadata.columns} x ${metadata.rows} samples | ${(metadata.spacing / 100).toFixed(1)} m spacing | ${geometry.index.count / 3} triangles`;
    const demo: TerrainDemo = {
        ready: false,
        renderer,
        camera,
        controls,
        terrain,
        wire,
        water,
        metadata,
        heights,
        textureSize: [texture.image.width, texture.image.height],
    };
    addResources(demo, window.terrainDemoResourcesData);
    demo.ready = true;
    window.terrainDemo = demo;
    element('loading').hidden = true;
}

start().catch((error: unknown) => {
    console.error('Terrain demo failed', error);
    element('status').textContent = 'Unable to initialize demo';
    const loading = element('loading');
    loading.hidden = false;
    loading.classList.add('error');
    loading.textContent = error instanceof Error ? error.message : String(error);
});
