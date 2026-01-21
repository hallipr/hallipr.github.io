import * as THREE from 'three';
import { PointsWithIndex } from './PointsWithIndex.js';

export class ClusteringManager {
    private epsilon: number = 1000;
    private minPoints: number = 5;
    private enabled: boolean = false;
    private debounceTimer: number | null = null;
    private onClusterUpdate: ((clusters: Map<number, THREE.Points[]>) => void) | null = null;

    constructor() {
        this.setupUI();
    }

    private setupUI(): void {
        const epsilonSlider = document.getElementById('epsilonSlider') as HTMLInputElement;
        const minPointsSlider = document.getElementById('minPointsSlider') as HTMLInputElement;
        const clusteringCheckbox = document.getElementById('clusteringEnabled') as HTMLInputElement;
        const epsilonValue = document.getElementById('epsilonValue');
        const minPointsValue = document.getElementById('minPointsValue');

        epsilonSlider?.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            this.epsilon = parseInt(value);
            if (epsilonValue) epsilonValue.textContent = value;
            this.debouncedCluster();
        });

        minPointsSlider?.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            this.minPoints = parseInt(value);
            if (minPointsValue) minPointsValue.textContent = value;
            this.debouncedCluster();
        });

        clusteringCheckbox?.addEventListener('change', (e) => {
            this.enabled = (e.target as HTMLInputElement).checked;
            if (this.enabled) {
                this.performClustering();
            } else {
                this.clearClustering();
            }
        });

        this.enabled = clusteringCheckbox?.checked || false;
    }

    private debouncedCluster(): void {
        if (!this.enabled) return;

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = window.setTimeout(() => {
            this.performClustering();
        }, 300);
    }

    setClusterUpdateCallback(callback: (clusters: Map<number, THREE.Points[]>) => void): void {
        this.onClusterUpdate = callback;
    }

    performClustering(): void {
        if (!this.enabled || !this.onClusterUpdate) return;

        console.log('Clustering with epsilon:', this.epsilon, 'minPoints:', this.minPoints);
        this.onClusterUpdate(new Map());
    }

    clusterPoints(particles: PointsWithIndex[]) {
        particles.forEach((p) => {
            p.cluster(this.epsilon, this.minPoints);
        });
    }

    private clearClustering(): void {
        const statsEl = document.getElementById('clusterStats');
        if (statsEl) {
            statsEl.textContent = '';
        }

        if (this.onClusterUpdate) {
            this.onClusterUpdate(new Map());
        }
    }

    resetClustering(particles: PointsWithIndex[]): void {
        particles.forEach((p) => {
            p.resetClustering();
        });
        this.clearClustering();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
