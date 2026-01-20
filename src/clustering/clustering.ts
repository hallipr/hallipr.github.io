import { RBush3D, Point3D as RPoint3D } from './rbush3d';

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export interface ClusterResult {
    clusterId: number; // -1 for noise/unassigned
    pointIndex: number;
}

export class DBSCANClustering {
    private readonly index: RBush3D;
    private readonly points: Point3D[];

    constructor(index: RBush3D) {
        this.index = index;
        this.points = index.points;
    }

    cluster(epsilon: number, minPoints: number): ClusterResult[] {
        const n = this.points.length;
        const labels = new Array(n).fill(-1); // -1 = unassigned
        let clusterId = 0;

        for (let i = 0; i < n; i++) {
            if (labels[i] !== -1) continue; // Already processed

            // Find neighbors within epsilon
            const neighbors = this.getNeighbors(i, this.points, epsilon);

            if (neighbors.length < minPoints) {
                labels[i] = -1; // Mark as noise
                continue;
            }

            // Start a new cluster
            clusterId++;
            this.expandCluster(i, neighbors, clusterId, labels, this.points, epsilon, minPoints);
        }

        return labels.map((clusterId, pointIndex) => ({
            clusterId,
            pointIndex
        }));
    }

    private expandCluster(
        pointIndex: number,
        neighbors: number[],
        clusterId: number,
        labels: number[],
        points: Point3D[],
        epsilon: number,
        minPoints: number
    ): void {
        labels[pointIndex] = clusterId;

        const queue = [...neighbors];

        while (queue.length > 0) {
            const currentIndex = queue.shift()!;

            if (labels[currentIndex] === -1) {
                labels[currentIndex] = clusterId;
            }

            if (labels[currentIndex] !== -1) continue;

            labels[currentIndex] = clusterId;

            const currentNeighbors = this.getNeighbors(currentIndex, points, epsilon);

            if (currentNeighbors.length >= minPoints) {
                queue.push(...currentNeighbors);
            }
        }
    }

    private getNeighbors(
        pointIndex: number,
        points: Point3D[],
        epsilon: number
    ): number[] {
        const point = points[pointIndex];
        
        // Find all points within epsilon distance using 3D R-tree
        const candidates = this.index.searchRadius(point.x, point.y, point.z, epsilon);
        const neighbors: number[] = [];

        for (const candidate of candidates) {
            if (candidate.index === pointIndex) continue;
            neighbors.push(candidate.index);
        }

        return neighbors;
    }
}
