// Rendering Layer - Three.js specific rendering logic

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CoordinateSystem } from '../data/types.js';
import type { WorldPoint } from '../world/World.js';
import { ViewMode, CameraMode } from './types.js';
import { Point3D } from '../clustering/rbush3d.js';

export interface CameraConfiguration {
    type: 'perspective' | 'orthographic';
    position: THREE.Vector3;
    lookAt: THREE.Vector3;
    fov?: number; // For perspective
    size?: number; // For orthographic
}

export class CameraManager {
    private perspectiveCamera: THREE.PerspectiveCamera;
    private orthographicCamera: THREE.OrthographicCamera;
    private currentCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private onZoomChange?: (zoomFactor: number) => void;
    private initialPerspectiveDistance: number = 1;
    private baseOrthographicSize: number = 1;

    constructor(
        renderer: THREE.WebGLRenderer,
        coordinates: CoordinateSystem,
        onZoomChange?: (zoomFactor: number) => void,
    ) {
        this.renderer = renderer;
        this.onZoomChange = onZoomChange;

        // Create cameras
        this.perspectiveCamera = this.createPerspectiveCamera(coordinates);
        this.orthographicCamera = this.createOrthographicCamera(coordinates);
        this.currentCamera = this.orthographicCamera; // Default to orthographic for 2D

        // Store initial zoom values and base sizes
        this.baseOrthographicSize =
            Math.max(coordinates.maxX - coordinates.minX, coordinates.maxY - coordinates.minY) *
            0.6;

        // Position cameras with default mode
        this.setCameraMode(CameraMode.ORTHOGRAPHIC_TOP_DOWN, coordinates);

        this.initialPerspectiveDistance = this.perspectiveCamera.position.distanceTo(
            new THREE.Vector3(coordinates.centerX, coordinates.centerY, 0),
        );

        // Create controls
        this.controls = new OrbitControls(this.currentCamera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
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

        switch (cameraMode) {
            case CameraMode.PERSPECTIVE:
                this.currentCamera = this.perspectiveCamera;
                this.perspectiveCamera.position.set(
                    coordinates.centerX,
                    coordinates.centerY,
                    mapSize * 0.8,
                );
                this.perspectiveCamera.lookAt(coordinates.centerX, coordinates.centerY, centerZ);
                break;

            case CameraMode.ORTHOGRAPHIC_TOP_DOWN:
                this.currentCamera = this.orthographicCamera;
                this.orthographicCamera.position.set(
                    coordinates.centerX,
                    coordinates.centerY,
                    mapSize,
                );
                this.orthographicCamera.lookAt(coordinates.centerX, coordinates.centerY, centerZ);
                break;
        }

        this.updateProjectionMatrix();
    }

    private createPerspectiveCamera(coordinates: CoordinateSystem): THREE.PerspectiveCamera {
        const mapSize = Math.max(
            coordinates.maxX - coordinates.minX,
            coordinates.maxY - coordinates.minY,
        );
        const far = Math.max(mapSize * 4, 10000);
        const camera = new THREE.PerspectiveCamera(
            75,
            this.renderer.domElement.width / this.renderer.domElement.height,
            0.1,
            far,
        );

        // Coordinate system should be: y increases downward, x increases rightward
        //camera.up.set(0, -1, 0);

        // Position will be set by setCameraMode
        return camera;
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

    getCamera(): THREE.Camera {
        return this.currentCamera;
    }

    updateControls(): void {
        this.controls.update();
    }

    updateProjectionMatrix(): void {
        this.currentCamera.updateProjectionMatrix();
    }

    handleResize(width: number, height: number): void {
        const aspect = width / height;

        if (this.currentCamera === this.perspectiveCamera) {
            this.perspectiveCamera.aspect = aspect;
            this.perspectiveCamera.updateProjectionMatrix();
        } else {
            // Use stored base size to avoid accumulating errors
            this.orthographicCamera.left = -this.baseOrthographicSize * aspect;
            this.orthographicCamera.right = this.baseOrthographicSize * aspect;
            this.orthographicCamera.top = this.baseOrthographicSize;
            this.orthographicCamera.bottom = -this.baseOrthographicSize;
            this.orthographicCamera.updateProjectionMatrix();
        }
    }

    updateCoordinates(coordinates: CoordinateSystem): void {
        // Update camera parameters for new coordinate system
        const mapSize = Math.max(
            coordinates.maxX - coordinates.minX,
            coordinates.maxY - coordinates.minY,
        );
        const far = Math.max(mapSize * 4, 10000);
        const centerZ = (coordinates.minZ + coordinates.maxZ) / 2;

        // Update perspective camera
        this.perspectiveCamera.far = far;
        this.perspectiveCamera.position.set(
            coordinates.centerX,
            coordinates.centerY,
            mapSize * 0.8,
        );
        this.perspectiveCamera.lookAt(coordinates.centerX, coordinates.centerY, centerZ);
        this.perspectiveCamera.updateProjectionMatrix();

        // Update orthographic camera
        const aspect = this.renderer.domElement.width / this.renderer.domElement.height;
        const size =
            Math.max(coordinates.maxX - coordinates.minX, coordinates.maxY - coordinates.minY) *
            0.6;
        this.orthographicCamera.left = -size * aspect;
        this.orthographicCamera.right = size * aspect;
        this.orthographicCamera.top = size;
        this.orthographicCamera.bottom = -size;
        this.orthographicCamera.far = far;
        this.orthographicCamera.position.set(coordinates.centerX, coordinates.centerY, size);
        this.orthographicCamera.lookAt(coordinates.centerX, coordinates.centerY, centerZ);
        this.orthographicCamera.updateProjectionMatrix();

        // Update controls target to new center
        this.controls.target.set(coordinates.centerX, coordinates.centerY, centerZ);
        this.controls.update();
    }

    setMouseControls(viewMode: ViewMode): void {
        if (viewMode === ViewMode.VIEW_2D) {
            // 2D view: only allow panning and zooming, no rotation
            this.controls.mouseButtons = {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: -1, // Disable right-click rotation
            };
            this.controls.enableRotate = false;
        } else {
            // 3D view: allow all controls including rotation
            this.controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN,
            };
            this.controls.enableRotate = true;
        }
    }

    private handleZoomChange(): void {
        if (!this.onZoomChange) return;

        let zoomFactor = 1;

        if (this.currentCamera === this.orthographicCamera) {
            // For orthographic camera, use the camera's zoom property
            zoomFactor = this.orthographicCamera.zoom;
        } else {
            // For perspective camera, calculate zoom from distance to target
            const currentDistance = this.perspectiveCamera.position.distanceTo(
                this.controls.target,
            );
            zoomFactor = this.initialPerspectiveDistance / currentDistance;
        }

        // Clamp zoom factor to reasonable range
        zoomFactor = Math.max(0.1, Math.min(10, zoomFactor));
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

        const camera = this.getCamera();
        const distance = maxSpan * 1.5;
        camera.position.set(centerX, centerY, centerZ + distance);
        camera.lookAt(centerX, centerY, centerZ);
        (camera as THREE.PerspectiveCamera | THREE.OrthographicCamera).updateProjectionMatrix();
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
    private currentViewMode: ViewMode = ViewMode.VIEW_3D;
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

        // Calculate grid size based on world bounds
        const sizeX = coordinates.maxX - coordinates.minX;
        const sizeY = coordinates.maxY - coordinates.minY;
        const gridSize = Math.max(sizeX, sizeY) * 1.3;
        const divisions = 20;

        // Create grid helper
        this.gridHelper = new THREE.GridHelper(gridSize, divisions, 0x444444, 0x222222);

        // Position grid below the world's minimum Z
        const gridZ = coordinates.minZ - 1000;
        this.gridHelper.position.set(coordinates.centerX, coordinates.centerY, gridZ);

        // Grid is visible by default, will be controlled by view mode
        this.scene.add(this.gridHelper);
    }

    setViewMode(viewMode: ViewMode, cameraMode: CameraMode, coordinates: CoordinateSystem): void {
        if (!this.cameraManager) {
            this.initializeWithCoordinates(coordinates);
        }

        if (!this.cameraManager) {
            return;
        }

        // Store current view mode
        this.currentViewMode = viewMode;

        this.cameraManager.setCameraMode(cameraMode, coordinates);
        this.cameraManager.setMouseControls(viewMode);

        // Show/hide grid based on view mode
        if (this.gridHelper) {
            this.gridHelper.visible = viewMode === '3d';
        }

        // Show/hide background based on view mode
        if (this.backgroundPlane) {
            this.backgroundPlane.visible = viewMode === '2d';
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
                // Position slightly behind points at z=-100 to ensure visibility
                this.backgroundPlane.position.set(coordinates.centerX, coordinates.centerY, -100);
                // Set render order to ensure it renders first
                this.backgroundPlane.renderOrder = -1;
                // Set visibility based on current view mode
                this.backgroundPlane.visible = this.currentViewMode === '2d';
                this.scene.add(this.backgroundPlane);
            },
            undefined,
            (error) => {
                console.warn(`Failed to load background image ${imageName}:`, error);
            },
        );
    }

    updatePoints(points: WorldPoint[], viewMode: ViewMode): void {
        // Clear existing point systems
        this.pointSystems.forEach((system) => this.scene.remove(system));
        this.pointSystems = [];

        if (points.length === 0) return;

        // Group points by resource type for efficient rendering
        const pointsByResource = new Map<string, WorldPoint[]>();
        const countByResource = new Map<string, number>();
        points.forEach((point) => {
            const resourceType = point.resourceType;
            if (!pointsByResource.has(resourceType)) {
                pointsByResource.set(resourceType, []);
                countByResource.set(resourceType, 0);
            }
            pointsByResource.get(resourceType)!.push(point);

            var count = point.type === 'cluster' ? point.count : 1;
            countByResource.set(resourceType, countByResource.get(resourceType)! + count);
        });

        const zorderByResource = new Map<string, number>();
        // Calculate render order for 2D view (abundant resources render behind)
        if (viewMode === ViewMode.VIEW_2D) {
            // Sort resources by count (most abundant first) and assign Z order, most abundant resource gets Z=100, next gets Z=200
            Array.from(countByResource.entries())
                .sort((a, b) => b[1] - a[1]) // Descending order, most abundant first
                .forEach(([resourceType], index) => {
                    zorderByResource.set(resourceType, (index + 1) * 100);
                });
        }

        // Create a THREE.Points system for each resource type
        for (const [resourceType, resourcePoints] of pointsByResource) {
            if (resourcePoints.length === 0) continue;

            const positions = new Float32Array(resourcePoints.length * 3);
            const colors = new Float32Array(resourcePoints.length * 3);

            resourcePoints.forEach((point, i) => {
                positions[i * 3] = point.x;
                positions[i * 3 + 1] = point.y * -1; // Invert Y for Y-down coordinate system
                // Position based on view mode
                // Use simple ordered Z-layering in 2d mode
                positions[i * 3 + 2] =
                    viewMode === ViewMode.VIEW_2D
                        ? zorderByResource.get(point.resourceType) || 0
                        : point.z;

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
            (mouseY / this.renderer.domElement.height) * 2 + 1,
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

        // For 2D view, intersect with the Z=0 plane
        if (this.currentViewMode === ViewMode.VIEW_2D) {
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            const intersectionPoint = new THREE.Vector3();
            if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
                return { x: intersectionPoint.x, y: intersectionPoint.y * -1, z: intersectionPoint.z };
            }
        } else {
            // For 3D view, project onto ground plane or use distance-based calculation
            const target = this.cameraManager.getCamera().position.clone();
            target.add(raycaster.ray.direction.clone().multiplyScalar(1000));
            return { x: target.x, y: target.y * -1, z: target.z };
        }

        return null;
    }
}
