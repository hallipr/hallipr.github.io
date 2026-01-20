import { SceneManager } from './scene';
import { UIManager } from './ui';
import { DataLoader } from './data-loader';
import { SceneBuilder } from './scene-builder';
import { ResourceTableManager } from './resource-table';
import { MapController } from './map-controller';
import { MapSelector } from './map-selector';
import { CoordinateTracker } from './coordinate-tracker';
import { ControlsHandler } from './controls-handler';

// Initialize all managers
const sceneManager = new SceneManager();
const uiManager = new UIManager();
const dataLoader = new DataLoader();
const sceneBuilder = new SceneBuilder();
const resourceTableManager = new ResourceTableManager();

const mapController = new MapController(
    sceneManager,
    uiManager,
    dataLoader,
    sceneBuilder,
    resourceTableManager
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
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to load application');
    }
})();

// Start animation loop
sceneManager.animate();
