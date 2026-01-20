import * as THREE from 'three';
import { SceneManager } from './scene';

export class KeyboardControls {
    private keys: Set<string> = new Set();
    private sceneManager: SceneManager;
    private moveSpeed: number = 50000; // Units per second
    private rotateSpeed: number = 1.0; // Radians per second
    private lastTime: number = 0;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key.toLowerCase());
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });
    }

    update(currentTime: number): void {
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            return;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        const camera = this.sceneManager.camera;
        const controls = this.sceneManager.controls;
        
        // Check if shift is held for acceleration
        const shiftMultiplier = this.keys.has('shift') ? 3.0 : 1.0;
        
        // Calculate movement delta
        const moveDelta = this.moveSpeed * deltaTime * shiftMultiplier;
        const rotateDelta = this.rotateSpeed * deltaTime;
        const spinDelta = this.rotateSpeed * deltaTime * shiftMultiplier;

        // Get camera direction vectors
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; // Keep movement horizontal
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();

        // WASD - Pan camera (move camera and target together)
        if (this.keys.has('w')) {
            camera.position.addScaledVector(forward, moveDelta);
            controls.target.addScaledVector(forward, moveDelta);
        }
        if (this.keys.has('s')) {
            camera.position.addScaledVector(forward, -moveDelta);
            controls.target.addScaledVector(forward, -moveDelta);
        }
        if (this.keys.has('a')) {
            camera.position.addScaledVector(right, -moveDelta);
            controls.target.addScaledVector(right, -moveDelta);
        }
        if (this.keys.has('d')) {
            camera.position.addScaledVector(right, moveDelta);
            controls.target.addScaledVector(right, moveDelta);
        }

        // Calculate the vector from target to camera for orbital rotations
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        let needsUpdate = false;

        // Q/E - Orbit camera around world Z axis (spin the map)
        if (this.keys.has('q')) {
            offset.applyAxisAngle(new THREE.Vector3(0, 0, 1), spinDelta);
            needsUpdate = true;
        }
        if (this.keys.has('e')) {
            offset.applyAxisAngle(new THREE.Vector3(0, 0, 1), -spinDelta);
            needsUpdate = true;
        }

        if (needsUpdate) {
            camera.position.copy(controls.target).add(offset);
        }

        // Arrow keys - Rotate camera view direction (yaw/pitch)
        // Get current camera direction
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        
        const verticalAxis = new THREE.Vector3(0, -1, 0); // Camera up direction
        
        if (this.keys.has('arrowleft')) {
            // Yaw left - rotate view direction around vertical axis
            direction.applyAxisAngle(verticalAxis, rotateDelta);
            const newTarget = new THREE.Vector3().addVectors(camera.position, direction.multiplyScalar(offset.length()));
            controls.target.copy(newTarget);
        }
        if (this.keys.has('arrowright')) {
            // Yaw right - rotate view direction around vertical axis
            direction.applyAxisAngle(verticalAxis, -rotateDelta);
            const newTarget = new THREE.Vector3().addVectors(camera.position, direction.multiplyScalar(offset.length()));
            controls.target.copy(newTarget);
        }
        
        if (this.keys.has('arrowup')) {
            // Pitch up - rotate view direction around horizontal axis
            camera.getWorldDirection(direction);
            const right = new THREE.Vector3();
            right.crossVectors(direction, verticalAxis).normalize();
            direction.applyAxisAngle(right, rotateDelta);
            const newTarget = new THREE.Vector3().addVectors(camera.position, direction.multiplyScalar(offset.length()));
            controls.target.copy(newTarget);
        }
        if (this.keys.has('arrowdown')) {
            // Pitch down - rotate view direction around horizontal axis
            camera.getWorldDirection(direction);
            const right = new THREE.Vector3();
            right.crossVectors(direction, verticalAxis).normalize();
            direction.applyAxisAngle(right, -rotateDelta);
            const newTarget = new THREE.Vector3().addVectors(camera.position, direction.multiplyScalar(offset.length()));
            controls.target.copy(newTarget);
        }

        controls.update();
    }
}
