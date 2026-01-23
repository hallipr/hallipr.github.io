// Application Layer - Main orchestrator that connects all layers

import type { ResourceTypeInfo } from '../ui/UIManager.js';
import type { ViewConfig } from '../rendering/types.js';
import type { ArkCoordinates, CoordinateSystem, MapData } from '../data/types.js';
import type { ClusterConfig, WorldPoint } from '../world/World.js';
import { ViewMode, CameraMode } from '../rendering/types.js';
import { DataLoader } from '../data/DataLoader.js';
import { World } from '../world/World.js';
import { SceneManager } from '../rendering/SceneManager.js';
import {
    ViewControlsManager,
    HoverManager,
    InfoPanelManager,
    ResourcePanelManager,
} from '../ui/UIManager.js';
import { Point3D, Point } from '../clustering/rbush3d.js';

export class Application {
    private dataLoader: DataLoader;
    private world: World;
    private sceneManager: SceneManager;
    private viewControls: ViewControlsManager;
    private hoverManager: HoverManager;
    private infoPanelManager: InfoPanelManager;
    private resourcePanel: ResourcePanelManager;

    private currentViewConfig: ViewConfig = {
        viewMode: ViewMode.VIEW_2D,
    };
    private currentMapData: MapData | null = null;

    constructor() {
        // Initialize core systems
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.sceneManager = new SceneManager(canvas);
        this.dataLoader = new DataLoader();
        this.world = new World();

        // Initialize UI systems
        this.viewControls = new ViewControlsManager({
            onViewConfigChange: (config) => this.handleViewConfigChange(config),
            onClusterConfigChange: (config) => this.handleClusterConfigChange(config),
            onPointSizeChange: (size) => this.handlePointSizeChange(size),
            onSizeAttenuationChange: (enabled) => this.handleSizeAttenuationChange(enabled),
            onHoverPoint: (pointId) => this.handlePointHover(pointId),
            onResetCamera: () => this.handleResetCamera(),
        });

        this.hoverManager = new HoverManager(canvas, {
            onViewConfigChange: () => {},
            onClusterConfigChange: () => {},
            onMouseMove: (x, y) => this.handleMouseMove(x, y),
            onHoverPoint: (pointId) => this.handlePointHover(pointId),
        });

        this.infoPanelManager = new InfoPanelManager('info-panel');

        this.resourcePanel = new ResourcePanelManager((resourceType, visible) => {
            this.sceneManager.setResourceVisible(resourceType, visible);
        });

        // Setup resize handling
        this.setupResizeHandler(canvas);

        // Start the render loop
        this.startRenderLoop();
    }

    async loadMap(mapName: string): Promise<void> {
        // Clear background immediately to avoid showing old map background
        this.sceneManager.clearBackground();

        // Load map data using the new API
        this.currentMapData = await this.dataLoader.loadMapByName(mapName);

        // Initialize world with the map data
        this.world.setMapData(this.currentMapData, this.dataLoader.getResourceTypes());

        // Initialize rendering with coordinate system
        this.sceneManager.initializeWithCoordinates(this.currentMapData.coordinates);

        // Add background image if available
        if (this.currentMapData.imageName) {
            this.sceneManager.addBackgroundImage(
                this.currentMapData.imageName,
                this.currentMapData.coordinates,
            );
        }

        // Apply current view configuration
        this.applyViewConfiguration();

        // Ensure clustering configuration is applied on initial map load
        this.applyInitialClusterConfig();

        // Update the rendering with current points (no camera repositioning needed)
        this.updateRendering();
    }

    private handleViewConfigChange(config: ViewConfig): void {
        this.currentViewConfig = config;
        this.applyViewConfiguration();
        this.updateRendering();
    }

    private handleClusterConfigChange(config: ClusterConfig): void {
        this.world.updateClusterConfig(config);
        this.updateRendering();
    }

    private handlePointSizeChange(size: number): void {
        this.sceneManager.setPointSize(size);
    }

    private handleSizeAttenuationChange(enabled: boolean): void {
        this.sceneManager.setSizeAttenuation(enabled);
    }

    private handleResetCamera(): void {
        if (!this.currentMapData) return;

        // Reapply the view configuration to reset the camera
        this.applyViewConfiguration();
    }

    private handlePointHover(pointId?: string): void {
        if (!pointId) {
            this.infoPanelManager.hideInfo();
            return;
        }

        // Get point information from world
        const pointInfo = this.world.getPointInfo(pointId);
        if (pointInfo) {
            this.infoPanelManager.showPointInfo(pointInfo);
        }
    }

    private handleMouseMove(mouseX: number, mouseY: number): void {
        if (!this.currentMapData) return;

        // Convert mouse coordinates to world coordinates for cursor position display
        const worldCoords = this.sceneManager.screenToWorldCoordinates(mouseX, mouseY);
        if (worldCoords) {
            const coords = this.currentMapData.coordinates;
            const cursorArkCoords = coords.getArkCoordinates(worldCoords);

            // Update debug panel with canvas and Unreal coordinates
            this.updateDebugPanel({ x: mouseX, y: mouseY}, worldCoords, coords);

            // Check for intersection with resource points using raycaster
            const intersection = this.sceneManager.getIntersectedPoint(mouseX, mouseY);

            if (intersection && intersection.object.userData.resourceType) {
                // Show hover info for the intersected point
                const resourceType = intersection.object.userData.resourceType;
                const point = intersection.point;

                // Calculate node's lat/long coordinates
                const nodeArkCoords = coords.getArkCoordinates(point);

                this.showPointHover(resourceType, cursorArkCoords, nodeArkCoords, point);
            } else {
                // Not hovering over a point, hide hover info and show cursor coordinates
                this.hidePointHover();
                this.updateCoordinateDisplay(cursorArkCoords);
            }
        }
    }

    private updateCoordinateDisplay(arkCoords: ArkCoordinates): void {
        const latElement = document.getElementById('coord-lat');
        const longElement = document.getElementById('coord-long');

        if (latElement) {
            latElement.textContent = arkCoords.lat.toFixed(1);
        }
        if (longElement) {
            longElement.textContent = arkCoords.long.toFixed(1);
        }
    }

    private updateDebugPanel(canvasCoords: Point, worldCoords: Point3D, coords: CoordinateSystem): void {
        const debugCanvas = document.getElementById('debug-canvas')!;
        const debugUnreal = document.getElementById('debug-unreal')!;
        const debugArk = document.getElementById('debug-ark')!;
        const debugSystem = document.getElementById('debug-system')!;

        const arkCoords = coords.getArkCoordinates(worldCoords);
        debugArk.innerHTML = `X: ${arkCoords.long.toFixed(1)}<br/>Y: ${arkCoords.lat.toFixed(1)}<br/>Z: ${arkCoords.z.toFixed(1)}`;
        debugCanvas.innerHTML = `X: ${canvasCoords.x}<br/>Y: ${canvasCoords.y}`;
        debugUnreal.innerHTML = `X: ${worldCoords.x.toFixed(0)}<br/>Y: ${worldCoords.y.toFixed(0)}<br/>Z: ${worldCoords.z.toFixed(0)}`;
        debugSystem.innerHTML = `
            <table>
                <tr><td /><td>min</td><td>max</td><td>center</td><td>scale</td></tr>
                <tr><td>X</td><td>${coords.minX.toFixed(0)}</td><td>${coords.maxX.toFixed(0)}</td><td>${coords.centerX.toFixed(0)}</td><td>${coords.scaleX.toFixed(2)}</td></tr>
                <tr><td>Y</td><td>${coords.minY.toFixed(0)}</td><td>${coords.maxY.toFixed(0)}</td><td>${coords.centerY.toFixed(0)}</td><td>${coords.scaleY.toFixed(2)}</td></tr>
                <tr><td>Z</td><td>${coords.minZ.toFixed(0)}</td><td>${coords.maxZ.toFixed(0)}</td><td>N/A</td><td>N/A</td></tr>
            </table>
        `;
    }

    private showPointHover(
        resourceType: string,
        cursorArkCoords: ArkCoordinates,
        nodeArkCoords: ArkCoordinates,
        nodeCoordinates: Point3D,
    ): void {
        const coordinatesEl = document.getElementById('coordinates');
        if (coordinatesEl) {
            coordinatesEl.innerHTML = `
                <strong>Point Details:</strong><br>
                Resource: <span style="color: #4fc3f7;">${resourceType}</span><br>
                Node Lat: <span style="color: #4fc3f7;">${nodeArkCoords.lat.toFixed(1)}</span><br>
                Node Long: <span style="color: #4fc3f7;">${nodeArkCoords.long.toFixed(1)}</span><br>
                Node Z: <span style="color: #4fc3f7;">${nodeCoordinates.z.toFixed(1)}</span><br>
                Node X (UE): <span style="color: #ffb74d;">${nodeCoordinates.x.toFixed(0)}</span><br>
                Node Y (UE): <span style="color: #ffb74d;">${nodeCoordinates.y.toFixed(0)}</span><br>
                <strong>Cursor Position:</strong><br>
                Lat: <span id="coord-lat">${cursorArkCoords.lat.toFixed(1)}</span><br>
                Long: <span id="coord-long">${cursorArkCoords.long.toFixed(1)}</span>
            `;
        }
    }

    private hidePointHover(): void {
        const coordinatesEl = document.getElementById('coordinates');
        if (coordinatesEl) {
            coordinatesEl.innerHTML = `
                <strong>Cursor Position:</strong><br>
                Lat: <span id="coord-lat">-</span><br>
                Long: <span id="coord-long">-</span>
            `;
        }
    }

    private applyViewConfiguration(): void {
        if (!this.currentMapData) return;

        // Determine standard camera mode based on view mode
        const cameraMode =
            this.currentViewConfig.viewMode === ViewMode.VIEW_2D
                ? CameraMode.ORTHOGRAPHIC_TOP_DOWN
                : CameraMode.PERSPECTIVE;

        this.sceneManager.setViewMode(
            this.currentViewConfig.viewMode,
            cameraMode,
            this.currentMapData.coordinates,
        );
    }

    private applyInitialClusterConfig(): void {
        // Read the current UI values and apply them to ensure clustering works on first load
        const clusterEnabledElement = document.querySelector(
            '#cluster-enabled',
        ) as HTMLInputElement;
        const clusterRadiusElement = document.querySelector('#cluster-radius') as HTMLInputElement;
        const minClusterSizeElement = document.querySelector(
            '#min-cluster-size',
        ) as HTMLInputElement;
        const maxClusterLevelElement = document.querySelector(
            '#max-cluster-level',
        ) as HTMLInputElement;

        if (
            clusterEnabledElement &&
            clusterRadiusElement &&
            minClusterSizeElement &&
            maxClusterLevelElement
        ) {
            const config: ClusterConfig = {
                enabled: clusterEnabledElement.checked,
                radius: parseInt(clusterRadiusElement.value),
                minClusterSize: parseInt(minClusterSizeElement.value),
                maxLevels: parseInt(maxClusterLevelElement.value),
            };
            this.world.updateClusterConfig(config);
        }
    }

    private updateRendering(): void {
        if (!this.currentMapData) return;

        // Get current points from world (clustered or individual)
        const points = this.world.getCurrentPoints();

        // Update scene with the points
        this.sceneManager.updatePoints(points, this.currentViewConfig.viewMode);

        // Update resource panel with resource statistics
        this.updateResourcePanel(points);
    }

    private updateResourcePanel(points: WorldPoint[]): void {
        // Group points by resource type
        const resourceStats = new Map<string, { count: number; clusterCount: number }>();

        points.forEach((point) => {
            const existing = resourceStats.get(point.resourceType) || { count: 0, clusterCount: 0 };
            if (point.type === 'cluster') {
                existing.clusterCount++;
                existing.count += point.count;
            } else {
                existing.count++;
            }
            resourceStats.set(point.resourceType, existing);
        });

        // Get resource types with colors
        const resourceTypes = this.dataLoader.getResourceTypes();
        const resourceInfo: ResourceTypeInfo[] = resourceTypes.map((rt) => {
            const stats = resourceStats.get(rt.name) || { count: 0, clusterCount: 0 };
            return {
                name: rt.name,
                color: rt.color,
                colorHex: rt.colorHex,
                count: stats.count,
                clusterCount: stats.clusterCount,
            };
        });

        this.resourcePanel.updateResourceTypes(resourceInfo);
    }

    private setupResizeHandler(canvas: HTMLCanvasElement): void {
        const handleResize = () => {
            const container = canvas.parentElement!;
            const width = container.clientWidth;
            const height = container.clientHeight;

            canvas.width = width;
            canvas.height = height;

            this.sceneManager.handleResize(width, height);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial resize
    }

    private startRenderLoop(): void {
        const animate = () => {
            this.sceneManager.render();
            requestAnimationFrame(animate);
        };
        animate();
    }

    // Public API for external control
    public getCurrentViewConfig(): ViewConfig {
        return { ...this.currentViewConfig };
    }

    public setViewMode(viewMode: ViewMode): void {
        this.currentViewConfig.viewMode = viewMode;
        this.applyViewConfiguration();
        this.updateRendering();
    }

    public getAvailableMaps(): Promise<string[]> {
        return this.dataLoader.getMapList();
    }

    public getCurrentMapData(): MapData | null {
        return this.currentMapData;
    }
}
