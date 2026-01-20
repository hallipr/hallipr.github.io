import * as THREE from 'three';
import { PointsWithIndex } from './clustering/PointsWithIndex';

export class VisualizationManager {
    private pointSize: number = 4;
    private particles: PointsWithIndex[] = [];

    constructor() {
        this.setupUI();
    }

    private setupUI(): void {
        const pointSizeSlider = document.getElementById('pointSizeSlider') as HTMLInputElement;
        const pointSizeValue = document.getElementById('pointSizeValue');

        pointSizeSlider?.addEventListener('input', (e) => {
            const value = parseInt((e.target as HTMLInputElement).value);
            this.pointSize = value;
            if (pointSizeValue) pointSizeValue.textContent = value.toString();
            this.updatePointSize();
        });

        // Initialize slider value
        if (pointSizeSlider) {
            pointSizeSlider.value = this.pointSize.toString();
        }
        if (pointSizeValue) {
            pointSizeValue.textContent = this.pointSize.toString();
        }
    }

    // Update point size for all particles
    private updatePointSize(): void {
        this.particles.forEach(particle => {
            if (particle.material instanceof THREE.PointsMaterial) {
                particle.material.size = this.pointSize;
                particle.material.needsUpdate = true;
            }
        });
    }

    // Set particles to control
    setParticles(particles: PointsWithIndex[]): void {
        this.particles = particles;
        // Apply current point size to new particles
        this.updatePointSize();
    }

    getPointSize(): number {
        return this.pointSize;
    }
}