import * as THREE from 'three';

interface Vertex {
    x: number;
    y: number;
    z: number;
    u: number;
    v: number;
}

export function createWaterGeometry(
    terrain: THREE.BufferGeometry,
    level: number,
): THREE.BufferGeometry {
    const position = terrain.getAttribute('position');
    const uv = terrain.getAttribute('uv');
    const indices = terrain.getIndex();
    if (!Number.isFinite(level) || !indices || !position || !uv) {
        throw new Error('Water masking requires a finite level and indexed terrain positions/UVs.');
    }
    const positions: number[] = [];
    const uvs: number[] = [];
    const vertex = (index: number): Vertex => ({
        x: position.getX(index),
        y: position.getY(index),
        z: position.getZ(index),
        u: uv.getX(index),
        v: uv.getY(index),
    });
    for (let index = 0; index < indices.count; index += 3) {
        const triangle = [
            vertex(indices.getX(index)),
            vertex(indices.getX(index + 1)),
            vertex(indices.getX(index + 2)),
        ];
        const submerged: Vertex[] = [];
        // Clip each seabed triangle at sea level before projecting the submerged polygon upward.
        for (let edge = 0; edge < 3; edge++) {
            const a = triangle[(edge + 2) % 3];
            const b = triangle[edge];
            if (a.y < level !== b.y < level) {
                const t = (level - a.y) / (b.y - a.y);
                submerged.push({
                    x: a.x + t * (b.x - a.x),
                    y: level,
                    z: a.z + t * (b.z - a.z),
                    u: a.u + t * (b.u - a.u),
                    v: a.v + t * (b.v - a.v),
                });
            }
            if (b.y < level) submerged.push(b);
        }
        for (let corner = 1; corner + 1 < submerged.length; corner++) {
            for (const point of [submerged[0], submerged[corner], submerged[corner + 1]]) {
                positions.push(point.x, level, point.z);
                uvs.push(point.u, point.v);
            }
        }
    }
    const water = new THREE.BufferGeometry();
    water.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    water.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    water.computeBoundingSphere();
    return water;
}
