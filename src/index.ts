import { SceneManager } from './scene';
import { UIManager } from './ui';
import { DataLoader } from './data-loader';
import { SceneBuilder } from './scene-builder';
import { ResourceTableManager } from './resource-table';
import { MapController } from './map-controller';
import { MapSelector } from './map-selector';
import { CoordinateTracker } from './coordinate-tracker';
import { ControlsHandler } from './controls-handler';
import { ClusteringManager } from './clustering/clustering-manager';

// Initialize all managers
const sceneManager = new SceneManager();
const uiManager = new UIManager();
const dataLoader = new DataLoader();
const sceneBuilder = new SceneBuilder();
const resourceTableManager = new ResourceTableManager();
const clusteringManager = new ClusteringManager();

const mapController = new MapController(
    sceneManager,
    uiManager,
    dataLoader,
    sceneBuilder,
    resourceTableManager,
    clusteringManager
);

const mapSelector = new MapSelector('mapSelect');
const coordinateTracker = new CoordinateTracker(sceneManager.camera, uiManager, mapController);
const controlsHandler = new ControlsHandler(() => mapController.getParticles());

// Initialize application
(async () => {
    try {
        await dataLoader.loadIndex();
        mapSelector.populateOptions(dataLoader.getMaps());
        mapSelector.onChange((dataUrl) => mapController.loadMap(dataUrl));
        
        // Check URL for initial map to load
        const mapFromUrl = mapSelector.getMapFromUrl();
        if (mapFromUrl) {
            mapSelector.setValue(mapFromUrl);
            await mapController.loadMap(mapFromUrl);
        }
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to load application');
    }
})();

// Start animation loop
sceneManager.animate();
