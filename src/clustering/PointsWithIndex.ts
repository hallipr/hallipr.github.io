import * as THREE from 'three';
import { RBush3D } from './rbush3d.js';
import type { Point3D } from './rbush3d.js';
import { cluster } from './clustering.js';

// Extend THREE.Points with cached spatial index and clustering results
export class PointsWithIndex extends THREE.Points {
    public spatialIndex: RBush3D;
    public points: Point3D[];

    constructor(spatialIndex: RBush3D, material?: THREE.PointsMaterial) {
        const positions = new Float32Array(spatialIndex.length * 3);
        spatialIndex.points.forEach((pos, i) => {
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        super(geometry, material);
        this.spatialIndex = spatialIndex;
        this.points = spatialIndex.points;
    }

    cluster(epsilon: number, minPoints: number) {
        console.log(`Clustering ${this.spatialIndex.points.length} points...`);
        const startTime = performance.now();

        // Perform clustering
        const results = cluster(this.spatialIndex, epsilon, minPoints);

        const endTime = performance.now();
        console.log(`Clustering completed in ${(endTime - startTime).toFixed(2)}ms`);

        const clusters = new Map<number, Point3D[]>();
        results.forEach((x) => {
            if (x.clusterId !== -1) {
                if (!clusters.has(x.clusterId)) {
                    clusters.set(x.clusterId, []);
                }
                clusters.get(x.clusterId)!.push(this.points[x.pointIndex]);
            }
        });

        // clusterIDs are zero based.  Create an array of Point3D arrays, one per cluster
        const clusterIds = Array.from(clusters.keys());

        // Update stats
        const noiseIds = results.filter((r) => r.clusterId === -1).map((x) => x.pointIndex);

        console.log(`Found ${clusters.size} clusters with ${noiseIds.length} noise points`);

        const statsEl = document.getElementById('clusterStats');
        if (statsEl) {
            statsEl.textContent = `Clusters: ${clusters.size} | Noise: ${noiseIds.length}`;
        }

        // we should update the geometry with just 1 point per cluster, preferably a centroid
        const positions = new Float32Array((clusterIds.length + noiseIds.length) * 3);
        const clusterInfo: {
            clusterSize?: number;
            clusterCenter?: { x: number; y: number; z: number };
            isNoise?: boolean;
        }[] = [];

        for (let i = 0; i < clusterIds.length; i++) {
            const clusterId = clusterIds[i];
            const points = clusters.get(clusterId)!;
            // calculate centroid
            const centroid = points.reduce(
                (acc, p) => {
                    acc.x += p.x;
                    acc.y += p.y;
                    acc.z += p.z;
                    return acc;
                },
                { x: 0, y: 0, z: 0 },
            );
            centroid.x /= points.length;
            centroid.y /= points.length;
            centroid.z /= points.length;

            const offset = i * 3;
            positions[offset] = centroid.x;
            positions[offset + 1] = centroid.y;
            positions[offset + 2] = centroid.z;

            clusterInfo.push({ clusterSize: points.length, clusterCenter: centroid });
        }

        for (let i = 0; i < noiseIds.length; i++) {
            const pointIndex = noiseIds[i];
            const point = this.points[pointIndex];

            const offset = (clusterIds.length + i) * 3;
            positions[offset] = point.x;
            positions[offset + 1] = point.y;
            positions[offset + 2] = point.z;

            clusterInfo.push({ isNoise: true, clusterCenter: point });
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Store cluster information in userData
        this.userData.clusterInfo = clusterInfo;
        this.userData.isClustered = true;
    }

    resetClustering(): void {
        // Reset to original points
        const positions = new Float32Array(this.points.length * 3);
        this.points.forEach((pos, i) => {
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        });

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.userData.clusterInfo = undefined;
        this.userData.isClustered = false;
    }
}
