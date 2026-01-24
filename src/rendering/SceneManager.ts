// Rendering Layer - Three.js specific rendering logic

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CoordinateSystem } from '../data/types.js';
import type { WorldPoint } from '../world/World.js';
import { CameraMode } from './types.js';
import { Point3D } from '../clustering/rbush3d.js';

export interface CameraConfiguration {
    type: 'perspective' | 'orthographic';
    position: THREE.Vector3;
    lookAt: THREE.Vector3;
    fov?: number; // For perspective
    size?: number; // For orthographic
}

export class CameraManager {
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private onZoomChange?: (zoomFactor: number) => void;
    private baseOrthographicSize: number = 1;

    constructor(
        renderer: THREE.WebGLRenderer,
        coordinates: CoordinateSystem,
        onZoomChange?: (zoomFactor: number) => void,
    ) {
        this.renderer = renderer;
        this.onZoomChange = onZoomChange;

        // Create orthographic camera
        this.camera = this.createOrthographicCamera(coordinates);

        // Store initial zoom values and base sizes
        this.baseOrthographicSize =
            Math.max(coordinates.maxX - coordinates.minX, coordinates.maxY - coordinates.minY) *
            0.6;

        // Position camera
        this.setCameraMode(CameraMode.ORTHOGRAPHIC_TOP_DOWN, coordinates);

        // Create controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
        };

        // Listen for zoom changes
        this.controls.addEventListener('change', () => this.handleZoomChange());
    }

    setCameraMode(cameraMode: CameraMode, coordinates: CoordinateSystem): void {
        const mapSize = Math.max(
            coordinates.maxX - coordinates.minX,
            coordinates.maxY - coordinates.minY,
        );
        const centerZ = (coordinates.minZ + coordinates.maxZ) / 2;
        const centerY = coordinates.centerY * -1; // Invert Y for Y-down coordinate system

        // Position orthographic camera for top-down view
        this.camera.position.set(
            coordinates.centerX,
            centerY,
            mapSize,
        );
        this.camera.lookAt(coordinates.centerX, centerY, centerZ);

        // Update controls target and refresh to ensure camera orbits around correct center
        // (controls may not exist during initial construction)
        if (this.controls) {
            this.controls.object = this.camera;
            this.controls.target.set(coordinates.centerX, centerY, centerZ);
            this.controls.update();
        }

        this.camera.updateProjectionMatrix();
    }

    private createOrthographicCamera(coordinates: CoordinateSystem): THREE.OrthographicCamera {
        const aspect = this.renderer.domElement.width / this.renderer.domElement.height;
        const mapWidth = coordinates.maxX - coordinates.minX;
        const mapHeight = coordinates.maxY - coordinates.minY;
        const size = Math.max(mapWidth, mapHeight) * 0.6;
        const far = Math.max(Math.max(mapWidth, mapHeight) * 4, 10000);

        const camera = new THREE.OrthographicCamera(
            -size * aspect,
            size * aspect,
            size,
            -size,
            0.1,
            far,
        );

        // Use Y-down coordinate system to match original
        //camera.up.set(0, -1, 0);

        // Position will be set by setCameraMode
        return camera;
    }

    getCamera(): THREE.OrthographicCamera {
        return this.camera;
    }

    updateControls(): void {
        this.controls.update();
    }

    updateProjectionMatrix(): void {
        this.camera.updateProjectionMatrix();
    }

    handleResize(width: number, height: number): void {
        const aspect = width / height;

        // Use stored base size to avoid accumulating errors
        this.camera.left = -this.baseOrthographicSize * aspect;
        this.camera.right = this.baseOrthographicSize * aspect;
        this.camera.top = this.baseOrthographicSize;
        this.camera.bottom = -this.baseOrthographicSize;
        this.camera.updateProjectionMatrix();
    }

    updateCoordinates(coordinates: CoordinateSystem): void {
        // Update camera parameters for new coordinate system
        const mapSize = Math.max(
            coordinates.maxX - coordinates.minX,
            coordinates.maxY - coordinates.minY,
        );
        const far = Math.max(mapSize * 4, 10000);
        const centerZ = (coordinates.minZ + coordinates.maxZ) / 2;
        const centerY = coordinates.centerY * -1; // Invert Y for Y-down coordinate system

        // Update orthographic camera
        const aspect = this.renderer.domElement.width / this.renderer.domElement.height;
        const size =
            Math.max(coordinates.maxX - coordinates.minX, coordinates.maxY - coordinates.minY) *
            0.6;
        this.camera.left = -size * aspect;
        this.camera.right = size * aspect;
        this.camera.top = size;
        this.camera.bottom = -size;
        this.camera.far = far;
        this.camera.position.set(coordinates.centerX, centerY, size);
        this.camera.lookAt(coordinates.centerX, centerY, centerZ);
        this.camera.updateProjectionMatrix();

        // Update controls target to new center
        this.controls.target.set(coordinates.centerX, centerY, centerZ);
        this.controls.update();
    }

    enableMouseControls(): void {
        // Allow all controls including rotation
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
        };
        this.controls.enableRotate = true;
    }

    private handleZoomChange(): void {
        if (!this.onZoomChange) return;

        // For orthographic camera, use the camera's zoom property
        const zoomFactor = Math.max(0.1, Math.min(10, this.camera.zoom));
        this.onZoomChange(zoomFactor);
    }

    positionCameraToMapBounds(coordinates: CoordinateSystem): void {
        const centerX = coordinates.centerX;
        const centerY = coordinates.centerY;
        const centerZ = (coordinates.minZ + coordinates.maxZ) / 2;
        const maxSpan = Math.max(
            coordinates.maxX - coordinates.minX,
            coordinates.maxY - coordinates.minY,
            coordinates.maxZ - coordinates.minZ,
        );

        const distance = maxSpan * 1.5;
        this.camera.position.set(centerX, centerY, centerZ + distance);
        this.camera.lookAt(centerX, centerY, centerZ);
        this.camera.updateProjectionMatrix();
    }
}

export class SceneManager {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private cameraManager?: CameraManager;
    private pointSystems: THREE.Points[] = [];
    private backgroundPlane?: THREE.Mesh;
    private gridHelper?: THREE.GridHelper;
    private circleTexture?: THREE.Texture;
    private hiddenResourceTypes = new Set<string>();
    private basePointSize: number = 7; // Base size before zoom scaling
    private currentZoomFactor: number = 1;
    private sizeAttenuation: boolean = false;

    private get effectivePointSize(): number {
        // Apply only 50% of the zoom effect for more subtle scaling
        const zoomEffect = 1 + (this.currentZoomFactor - 1) * 0.5;
        return this.basePointSize * zoomEffect;
    }

    constructor(canvas: HTMLCanvasElement) {
        // Initialize Three.js
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.renderer.setSize(canvas.width, canvas.height);
        this.renderer.setClearColor(0x2a2a2a); // Dark gray

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2a2a2a); // Dark gray background

        // Will be initialized when coordinates are available
        this.cameraManager = undefined;

        // Add lights
        this.setupLights();

        // Create circle texture for points
        this.circleTexture = this.createCircleTexture();
    }

    private createCircleTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;

        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    initializeWithCoordinates(coordinates: CoordinateSystem): void {
        if (!this.cameraManager) {
            // Create CameraManager only on first initialization with zoom callback
            this.cameraManager = new CameraManager(this.renderer, coordinates, (zoomFactor) => {
                this.handleZoomChange(zoomFactor);
            });
        } else {
            // Reuse existing CameraManager but update for new coordinates
            this.cameraManager.updateCoordinates(coordinates);
        }
        this.setupGrid(coordinates);
    }

    private setupLights(): void {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        this.scene.add(directionalLight);
    }

    private setupGrid(coordinates: CoordinateSystem): void {
        // Remove existing grid if any
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }

        // Calculate grid size based on world bounds (10% larger than map)
        const sizeX = coordinates.maxX - coordinates.minX;
        const sizeY = coordinates.maxY - coordinates.minY;
        const gridSize = Math.max(sizeX, sizeY) * 1.1;
        const divisions = 20;

        // Create grid helper (default is on XZ plane)
        this.gridHelper = new THREE.GridHelper(gridSize, divisions, 0x444444, 0x222222);

        // Rotate grid to be on XY plane (camera looks down Z axis)
        this.gridHelper.rotation.x = Math.PI / 2;

        // Position grid at minZ - 100 (behind points and background)
        const gridZ = coordinates.minZ - 100;
        const centerY = coordinates.centerY * -1; // Invert Y for Y-down coordinate system
        this.gridHelper.position.set(coordinates.centerX, centerY, gridZ);

        // Grid is always visible
        this.scene.add(this.gridHelper);
    }

    resetCamera(coordinates: CoordinateSystem): void {
        if (!this.cameraManager) {
            this.initializeWithCoordinates(coordinates);
        }

        if (!this.cameraManager) {
            return;
        }

        this.cameraManager.setCameraMode(CameraMode.ORTHOGRAPHIC_TOP_DOWN, coordinates);
        this.cameraManager.enableMouseControls();

        // Grid is always visible (shown behind background or alone)
        if (this.gridHelper) {
            this.gridHelper.visible = true;
        }

        // Background is always visible if it exists
        if (this.backgroundPlane) {
            this.backgroundPlane.visible = true;
        }
    }

    clearBackground(): void {
        if (this.backgroundPlane) {
            this.scene.remove(this.backgroundPlane);
            this.backgroundPlane = undefined;
        }
    }

    addBackgroundImage(imageName: string, coordinates: CoordinateSystem): void {
        // Remove existing background
        this.clearBackground();

        const loader = new THREE.TextureLoader();
        loader.load(
            `images/${imageName}`,
            (texture) => {
                const geometry = new THREE.PlaneGeometry(
                    coordinates.maxX - coordinates.minX,
                    coordinates.maxY - coordinates.minY,
                );
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    depthWrite: false, // Allow points to render on top
                    depthTest: true,
                });

                this.backgroundPlane = new THREE.Mesh(geometry, material);
                // Position at minZ - 100 (in front of grid, behind points)
                const centerY = coordinates.centerY * -1; // Invert Y for Y-down coordinate system
                this.backgroundPlane.position.set(coordinates.centerX, centerY, coordinates.minZ - 100);
                // Set render order to ensure it renders first
                this.backgroundPlane.renderOrder = -1;
                // Always visible
                this.backgroundPlane.visible = true;
                this.scene.add(this.backgroundPlane);
            },
            undefined,
            (error) => {
                console.warn(`Failed to load background image ${imageName}:`, error);
            },
        );
    }

    updatePoints(points: WorldPoint[]): void {
        // Clear existing point systems
        this.pointSystems.forEach((system) => this.scene.remove(system));
        this.pointSystems = [];

        if (points.length === 0) return;

        // Group points by resource type for efficient rendering
        const pointsByResource = new Map<string, WorldPoint[]>();
        points.forEach((point) => {
            const resourceType = point.resourceType;
            if (!pointsByResource.has(resourceType)) {
                pointsByResource.set(resourceType, []);
            }
            pointsByResource.get(resourceType)!.push(point);
        });

        // Create a THREE.Points system for each resource type
        for (const [resourceType, resourcePoints] of pointsByResource) {
            if (resourcePoints.length === 0) continue;

            const positions = new Float32Array(resourcePoints.length * 3);
            const colors = new Float32Array(resourcePoints.length * 3);

            resourcePoints.forEach((point, i) => {
                positions[i * 3] = point.x;
                positions[i * 3 + 1] = point.y * -1; // Invert Y for Y-down coordinate system
                // Always use natural Z coordinate
                positions[i * 3 + 2] = point.z;

                // Parse color from hex string
                const color = new THREE.Color(point.colorHex);
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            });

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: this.effectivePointSize,
                vertexColors: true,
                map: this.circleTexture,
                transparent: true,
                alphaTest: 0.5,
                sizeAttenuation: this.sizeAttenuation,
            });

            const pointSystem = new THREE.Points(geometry, material);
            pointSystem.userData.resourceType = resourceType;
            pointSystem.userData.resourcePoints = resourcePoints;

            // Check if this resource type should be visible
            pointSystem.visible = !this.hiddenResourceTypes.has(resourceType);

            this.scene.add(pointSystem);
            this.pointSystems.push(pointSystem);
        }
    }

    render(): void {
        if (this.cameraManager) {
            this.cameraManager.updateControls();
            this.renderer.render(this.scene, this.cameraManager.getCamera());
        }
    }

    setResourceVisible(resourceType: string, visible: boolean): void {
        if (visible) {
            this.hiddenResourceTypes.delete(resourceType);
        } else {
            this.hiddenResourceTypes.add(resourceType);
        }

        // Update visibility of existing point systems
        this.pointSystems.forEach((system) => {
            if (system.userData.resourceType === resourceType) {
                system.visible = visible;
            }
        });
    }

    setPointSize(size: number): void {
        this.basePointSize = size;
        this.updatePointMaterials();
    }

    private handleZoomChange(zoomFactor: number): void {
        this.currentZoomFactor = zoomFactor;
        this.updatePointMaterials();
    }

    setSizeAttenuation(enabled: boolean): void {
        this.sizeAttenuation = enabled;
        this.updatePointMaterials();
    }

    private updatePointMaterials(): void {
        this.pointSystems.forEach((system) => {
            if (system.material && 'size' in system.material) {
                (system.material as THREE.PointsMaterial).size = this.effectivePointSize;
                (system.material as THREE.PointsMaterial).sizeAttenuation = this.sizeAttenuation;
            }
        });
    }

    handleResize(width: number, height: number): void {
        this.renderer.setSize(width, height);
        if (this.cameraManager) {
            this.cameraManager.handleResize(width, height);
        }
    }

    // Raycasting for hover/click detection
    getIntersectedPoints(mouseX: number, mouseY: number): THREE.Intersection[] {
        const mouse = new THREE.Vector2(
            (mouseX / this.renderer.domElement.width) * 2 - 1,
            -(mouseY / this.renderer.domElement.height) * 2 + 1,
        );

        if (!this.cameraManager) {
            return [];
        }

        const raycaster = new THREE.Raycaster();

        const baseThreshold = 4000;
        raycaster.params.Points!.threshold = baseThreshold / Math.max(0.1, this.currentZoomFactor);
        raycaster.setFromCamera(mouse, this.cameraManager.getCamera());

        return raycaster.intersectObjects(this.pointSystems.filter((ps) => ps.visible));
    }

    getIntersectedPoint(mouseX: number, mouseY: number): THREE.Intersection | null {
        const intersections = this.getIntersectedPoints(mouseX, mouseY);
        return intersections.length > 0 ? intersections[0] : null;
    }

    screenToWorldCoordinates(
        mouseX: number,
        mouseY: number,
    ): Point3D | null {
        if (!this.cameraManager) return null;

        const mouse = new THREE.Vector2(
            (mouseX / this.renderer.domElement.width) * 2 - 1,
            -(mouseY / this.renderer.domElement.height) * 2 + 1,
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.cameraManager.getCamera());

        // Project onto ground plane or use distance-based calculation
        const target = this.cameraManager.getCamera().position.clone();
        target.add(raycaster.ray.direction.clone().multiplyScalar(1000));
        return { x: target.x, y: target.y * -1, z: target.z };
    }
}
