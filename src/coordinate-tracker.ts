import * as THREE from 'three';
import { UIManager } from './ui';
import { MapController } from './map-controller';

export class CoordinateTracker {
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private groundPlane: THREE.Plane;
    private intersectionPoint: THREE.Vector3;

    constructor(
        private camera: THREE.PerspectiveCamera,
        private uiManager: UIManager,
        private mapController: MapController
    ) {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.intersectionPoint = new THREE.Vector3();

        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    private onMouseMove(event: MouseEvent): void {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.raycaster.ray.intersectPlane(this.groundPlane, this.intersectionPoint)) {
            const gameX = -this.intersectionPoint.x;
            const gameY = this.intersectionPoint.y;

            const coordinateSystem = this.mapController.getCurrentCoordinateSystem();
            if (coordinateSystem) {
                const lat = 50 + (gameY - coordinateSystem.centerY) / coordinateSystem.scaleY;
                const long = 50 + (gameX - coordinateSystem.centerX) / coordinateSystem.scaleX;
                this.uiManager.updateCoordinates(lat, long);
            } else {
                this.uiManager.clearCoordinates();
            }
        }
    }
}
