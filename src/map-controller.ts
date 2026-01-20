import * as THREE from 'three';
import { SceneManager } from './scene';
import { UIManager } from './ui';
import { DataLoader } from './data-loader';
import { SceneBuilder } from './scene-builder';
import { ResourceTableManager } from './resource-table';
import { ClusteringManager } from './clustering/clustering-manager';
import { VisualizationManager } from './visualization-manager';
import { CoordinateSystem, MapData, ResourceType } from './types';

export class MapController {
    private sceneManager: SceneManager;
    private uiManager: UIManager;
    private dataLoader: DataLoader;
    private sceneBuilder: SceneBuilder;
    private resourceTableManager: ResourceTableManager;
    private clusteringManager: ClusteringManager;
    private visualizationManager: VisualizationManager;
    private currentCoordinateSystem: CoordinateSystem | null = null;

    constructor(
        sceneManager: SceneManager,
        uiManager: UIManager,
        dataLoader: DataLoader,
        sceneBuilder: SceneBuilder,
        resourceTableManager: ResourceTableManager,
        clusteringManager: ClusteringManager,
        visualizationManager: VisualizationManager
    ) {
        this.sceneManager = sceneManager;
        this.uiManager = uiManager;
        this.dataLoader = dataLoader;
        this.sceneBuilder = sceneBuilder;
        this.resourceTableManager = resourceTableManager;
        this.clusteringManager = clusteringManager;
        this.visualizationManager = visualizationManager;

        // Set up clustering callback
        this.clusteringManager.setClusterUpdateCallback(() => this.updateClustering());

        this.updateClustering()
    }
    
    resetCamera(): void {
        this.sceneManager.resetCameraToTopDown();
    }

    private updateClustering(): void {
        if (this.clusteringManager.isEnabled()) {
            this.clusteringManager.clusterPoints(this.sceneManager.particles);
        } else {
            this.clusteringManager.resetClustering(this.sceneManager.particles);
        }
        // Update cluster counts in resource table with slight delay to ensure clustering is complete
        setTimeout(() => {
            this.resourceTableManager.updateClusterCounts(this.sceneManager.particles);
        }, 100);
    }

    getCurrentCoordinateSystem(): CoordinateSystem | null {
        return this.currentCoordinateSystem;
    }

    getParticles(): THREE.Points[] {
        return this.sceneManager.particles;
    }

    async loadMap(dataUrl: string): Promise<void> {
        this.uiManager.showLoading();

        try {
            // Clear existing scene
            this.sceneManager.clearScene();

            // Fetch map data
            const mapData = await this.dataLoader.loadMapData(dataUrl);
            this.currentCoordinateSystem = mapData.coordinates;

            // Count total points
            const totalPoints = mapData.resources.reduce((sum, r) => sum + r.points.length, 0);

            // Update UI
            this.uiManager.updateMapInfo(mapData.mapName, totalPoints);

            // Calculate world bounds
            const { worldSize, centerX, centerY, centerZ } = this.sceneBuilder.calculateWorldBounds(
                mapData.coordinates
            );

            // Calculate actual Z bounds from resource points
            let actualMinZ = Infinity;
            let actualMaxZ = -Infinity;
            mapData.resources.forEach(resource => {
                resource.points.forEach(point => {
                    const z = point[2]; // Z is the third element
                    if (z < actualMinZ) actualMinZ = z;
                    if (z > actualMaxZ) actualMaxZ = z;
                });
            });

            console.log(`Actual Z range: ${actualMinZ.toFixed(2)} to ${actualMaxZ.toFixed(2)}`);
            console.log(`Coordinate system Z range: ${mapData.coordinates.minZ} to ${mapData.coordinates.maxZ}`);

            // Create grid using actual minimum Z
            const gridSize = Math.ceil(worldSize * 1.2);
            const gridDivisions = Math.min(100, Math.max(20, Math.floor(gridSize / 100)));
            this.sceneManager.addGrid(gridSize, gridDivisions, actualMinZ);

            // Create compass
            const compassSprites = this.sceneBuilder.createCompassSprites(worldSize, gridSize);
            compassSprites.forEach(sprite => this.sceneManager.addCompassSprite(sprite));

            // Create particle systems
            const resourceTypes = this.dataLoader.getResourceTypes();
            const resourceTypeLookup: Record<string, ResourceType> = {};
            resourceTypes.forEach(type => {
                resourceTypeLookup[type.name] = type;
            });

            const sizeAttenuationCheckbox = this.uiManager.getElement<HTMLInputElement>('sizeAttenuation');
            const sizeAttenuation = sizeAttenuationCheckbox?.checked ?? true;

            mapData.resources.forEach(resource => {
                const typeConfig = resourceTypeLookup[resource.resourceType];
                if (!typeConfig) {
                    console.error('Resource type not found:', resource.resourceType);
                    return;
                }

                const particleSystem = this.sceneBuilder.createParticleSystem(
                    resource,
                    typeConfig,
                    sizeAttenuation
                );
                this.sceneManager.addParticle(particleSystem);
            });

            // Update resource table
            this.resourceTableManager.updateTable(mapData, resourceTypes, this.sceneManager.particles);

            // Give visualization manager access to particles for point size control
            this.visualizationManager.setParticles(this.sceneManager.particles);

            // Trigger clustering if enabled
            if (this.clusteringManager.isEnabled()) {
                this.updateClustering();
            }

            // Position camera
            const cameraPos = this.sceneBuilder.calculateCameraPosition(
                worldSize,
                centerX,
                centerY,
                centerZ,
                this.sceneManager.camera.fov
            );
            this.sceneManager.positionCamera(
                cameraPos.x,
                cameraPos.y,
                cameraPos.z,
                cameraPos.targetX,
                cameraPos.targetY,
                cameraPos.targetZ
            );

        } catch (error) {
            console.error('Error loading map:', error);
            alert('Failed to load map data');
        } finally {
            this.uiManager.hideLoading();
        }
    }
}
