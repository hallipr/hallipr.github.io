import * as THREE from 'three';
import { UIManager } from './ui';
import { MapController } from './map-controller';

export class CoordinateTracker {
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private groundPlane: THREE.Plane;
    private intersectionPoint: THREE.Vector3;
    private isHoveringPoint: boolean = false;

    constructor(
        private camera: THREE.PerspectiveCamera,
        private uiManager: UIManager,
        private mapController: MapController
    ) {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.intersectionPoint = new THREE.Vector3();

        // Set raycaster threshold for point detection - larger value = easier to hover
        if (this.raycaster.params.Points) {
            this.raycaster.params.Points.threshold = 2000;
        }

        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    private onMouseMove(event: MouseEvent): void {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersection with resource points first
        const particles = this.mapController.getParticles();
        const intersects = this.raycaster.intersectObjects(particles.filter(p => p.visible));

        if (intersects.length > 0) {
            const intersectedParticle = intersects[0].object as THREE.Points;
            const resourceType = intersectedParticle.userData.resourceType;
            
            // Get mouse cursor coordinates (ground plane intersection)
            const mouseGameX = -this.intersectionPoint.x;
            const mouseGameY = this.intersectionPoint.y;
            
            // Get cluster information if available
            let clusterSize: number | undefined;
            let isNoise: boolean | undefined;
            let clusterCenter: { x: number, y: number, z: number } | undefined;
            
            if (intersectedParticle.userData.isClustered && intersectedParticle.userData.clusterInfo) {
                const pointIndex = intersects[0].index || 0;
                const clusterInfo = intersectedParticle.userData.clusterInfo[pointIndex];
                if (clusterInfo) {
                    clusterSize = clusterInfo.clusterSize;
                    isNoise = clusterInfo.isNoise;
                    clusterCenter = clusterInfo.clusterCenter;
                }
            }

            const coordinateSystem = this.mapController.getCurrentCoordinateSystem();
            if (coordinateSystem && resourceType) {
                // Calculate mouse cursor lat/long
                const mouseLat = 50 + (mouseGameY - coordinateSystem.centerY) / coordinateSystem.scaleY;
                const mouseLong = 50 + (mouseGameX - coordinateSystem.centerX) / coordinateSystem.scaleX;
                
                // Calculate actual node lat/long
                let nodeLat = 50 + (mouseGameY - coordinateSystem.centerY) / coordinateSystem.scaleY;
                let nodeLong = 50 + (mouseGameX - coordinateSystem.centerX) / coordinateSystem.scaleX;
                let nodeGameZ = 0;
                
                if (clusterCenter) {
                    nodeLat = 50 + (clusterCenter.y - coordinateSystem.centerY) / coordinateSystem.scaleY;
                    nodeLong = 50 + (-clusterCenter.x - coordinateSystem.centerX) / coordinateSystem.scaleX;
                    nodeGameZ = clusterCenter.z;
                }
                
                this.uiManager.showPointHover(resourceType, mouseLat, mouseLong, nodeLat, nodeLong, nodeGameZ, clusterSize, isNoise);
                this.isHoveringPoint = true;
                return;
            }
        }

        // If not hovering over a point, show cursor coordinates
        if (this.isHoveringPoint) {
            this.uiManager.hidePointHover();
            this.isHoveringPoint = false;
        }

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
