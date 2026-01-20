import * as THREE from 'three';
import { DBSCANClustering, Point3D, ClusterResult } from './clustering';

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

    clusterPoints(particles: THREE.Points[]): Map<number, ClusterResult[]> {
        const allPoints: Point3D[] = [];
        const pointToParticle: number[] = [];

        // Collect all points from all particle systems
        particles.forEach((particle, particleIdx) => {
            const positions = particle.geometry.attributes.position;
            const count = positions.count;

            for (let i = 0; i < count; i++) {
                allPoints.push({
                    x: positions.getX(i),
                    y: positions.getY(i),
                    z: positions.getZ(i)
                });
                pointToParticle.push(particleIdx);
            }
        });

        console.log(`Clustering ${allPoints.length} points...`);
        const startTime = performance.now();

        // Perform clustering
        const clustering = new DBSCANClustering(this.epsilon, this.minPoints);
        const results = clustering.cluster(allPoints);

        const endTime = performance.now();
        console.log(`Clustering completed in ${(endTime - startTime).toFixed(2)}ms`);

        // Group results by particle system
        const clustersByParticle = new Map<number, ClusterResult[]>();
        
        results.forEach((result, idx) => {
            const particleIdx = pointToParticle[idx];
            if (!clustersByParticle.has(particleIdx)) {
                clustersByParticle.set(particleIdx, []);
            }
            clustersByParticle.get(particleIdx)!.push(result);
        });

        // Update stats
        const clusterIds = new Set(results.map(r => r.clusterId).filter(id => id !== -1));
        const noiseCount = results.filter(r => r.clusterId === -1).length;
        
        console.log(`Found ${clusterIds.size} clusters with ${noiseCount} noise points`);
        console.log('Cluster IDs:', Array.from(clusterIds).sort((a, b) => a - b));
        
        const statsEl = document.getElementById('clusterStats');
        if (statsEl) {
            statsEl.textContent = `Clusters: ${clusterIds.size} | Noise: ${noiseCount}`;
        }

        return clustersByParticle;
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

    isEnabled(): boolean {
        return this.enabled;
    }
}
