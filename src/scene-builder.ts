import * as THREE from 'three';
import { CoordinateSystem, MapData, ResourceType } from './types';

export class SceneBuilder {
    private circleTexture: THREE.Texture | null = null;

    private getCircleTexture(): THREE.Texture {
        if (this.circleTexture) return this.circleTexture;

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;

        // Draw circle
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        this.circleTexture = new THREE.CanvasTexture(canvas);
        return this.circleTexture;
    }

    createTextSprite(text: string, color: string, scale: number): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 256;

        context.font = 'Bold 120px Arial';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 128, 128);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(scale, scale, 1);

        return sprite;
    }

    createCompassSprites(worldSize: number, gridSize: number): THREE.Sprite[] {
        const compassScale = worldSize * 0.05;
        const compassDistance = gridSize / 2;
        const compassHeight = worldSize * 0.01;

        const sprites: THREE.Sprite[] = [];

        const north = this.createTextSprite('N', '#ff6b6b', compassScale);
        north.position.set(0, -compassDistance, compassHeight);
        sprites.push(north);

        const south = this.createTextSprite('S', '#ffffff', compassScale);
        south.position.set(0, compassDistance, compassHeight);
        sprites.push(south);

        const east = this.createTextSprite('E', '#ffffff', compassScale);
        east.position.set(-compassDistance, 0, compassHeight);
        sprites.push(east);

        const west = this.createTextSprite('W', '#ffffff', compassScale);
        west.position.set(compassDistance, 0, compassHeight);
        sprites.push(west);

        return sprites;
    }

    createParticleSystem(
        resource: MapData['resources'][0],
        typeConfig: ResourceType,
        sizeAttenuation: boolean
    ): THREE.Points {
        const color = new THREE.Color(typeConfig.color);

        const positions = new Float32Array(resource.points.length * 3);
        resource.points.forEach((pos, i) => {
            positions[i * 3] = pos[0];
            positions[i * 3 + 1] = pos[1];
            positions[i * 3 + 2] = pos[2];
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: sizeAttenuation ? 500 : 4,
            sizeAttenuation: sizeAttenuation,
            map: this.getCircleTexture(),
            transparent: true,
            alphaTest: 0.5
        });

        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData = {
            resourceType: resource.resourceType,
            count: resource.points.length
        };

        return particleSystem;
    }

    calculateWorldBounds(coords: CoordinateSystem) {
        const worldWidth = coords.maxX - coords.minX;
        const worldHeight = coords.maxY - coords.minY;
        const worldDepth = coords.maxZ - coords.minZ;
        const worldSize = Math.max(worldWidth, worldHeight, worldDepth);

        const centerX = (coords.minX + coords.maxX) / 2;
        const centerY = (coords.minY + coords.maxY) / 2;
        const centerZ = (coords.minZ + coords.maxZ) / 2;

        return { worldSize, centerX, centerY, centerZ };
    }

    calculateCameraPosition(worldSize: number, centerX: number, centerY: number, centerZ: number, fov: number) {
        const vFOV = fov * Math.PI / 180;
        const height = worldSize;
        const cameraDistance = height / (2 * Math.tan(vFOV / 2)) * 1.2;

        return {
            x: centerX,
            y: centerY,
            z: centerZ + cameraDistance,
            targetX: centerX,
            targetY: centerY,
            targetZ: centerZ
        };
    }
}
