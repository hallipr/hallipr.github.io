import type { TerrainManifest, TerrainTile } from './terrain.js';

export interface OriginalSurface {
    tile: TerrainTile;
    heights: Float32Array;
}

export function createDespiker(
    manifest: Pick<TerrainManifest, 'columns' | 'rows' | 'tileCells'> &
        Partial<Pick<TerrainManifest, 'minHeight' | 'maxHeight'>>,
    originals: readonly OriginalSurface[],
    thresholdMeters: number,
): (surface: OriginalSurface) => Float32Array {
    if (!Number.isFinite(thresholdMeters) || thresholdMeters <= 0)
        throw new Error('The spike threshold must be a positive number of meters.');
    const cells = manifest.tileCells;
    const tileColumns = Math.ceil((manifest.columns - 1) / cells);
    const lastColumn = Math.floor((manifest.columns - 2) / cells) * cells;
    const lastRow = Math.floor((manifest.rows - 2) / cells) * cells;
    const indexed = new Map(
        originals.map((surface) => [
            (surface.tile.row / cells) * tileColumns + surface.tile.column / cells,
            surface,
        ]),
    );
    const sample = (x: number, y: number): number => {
        if (x < 0 || y < 0 || x >= manifest.columns || y >= manifest.rows) return NaN;
        const column = Math.min(Math.floor(x / cells) * cells, lastColumn);
        const row = Math.min(Math.floor(y / cells) * cells, lastRow);
        const surface = indexed.get((row / cells) * tileColumns + column / cells);
        if (!surface) return NaN;
        return surface.heights[(y - row) * surface.tile.columns + x - column];
    };
    const threshold = thresholdMeters * 100;
    const valid = (height: number): boolean =>
        Number.isFinite(height) &&
        (manifest.minHeight == null || height >= manifest.minHeight) &&
        (manifest.maxHeight == null || height < manifest.maxHeight);
    // At most 32 corrected 257x257 buffers (~8.1 MiB); original buffers are never copied eagerly.
    const cache = new Map<TerrainTile, Float32Array>();
    const neighbors = new Array<number>(8);
    return (surface) => {
        const cached = cache.get(surface.tile);
        if (cached) {
            cache.delete(surface.tile);
            cache.set(surface.tile, cached);
            return cached;
        }
        const { tile, heights } = surface;
        let display: Float32Array | undefined;
        for (let y = 0; y < tile.rows; y++)
            for (let x = 0; x < tile.columns; x++) {
                const index = y * tile.columns + x;
                const height = heights[index];
                if (!valid(height)) continue;
                let count = 0;
                let min = Infinity;
                let max = -Infinity;
                let isolated = true;
                for (let dy = -1; isolated && dy <= 1; dy++)
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const localX = x + dx;
                        const localY = y + dy;
                        const neighbor =
                            localX >= 0 &&
                            localX < tile.columns &&
                            localY >= 0 &&
                            localY < tile.rows
                                ? heights[localY * tile.columns + localX]
                                : sample(tile.column + localX, tile.row + localY);
                        // All eight original neighbors must exist and be substantially lower.
                        if (!valid(neighbor) || height - neighbor <= threshold) {
                            isolated = false;
                            break;
                        }
                        neighbors[count++] = neighbor;
                        min = Math.min(min, neighbor);
                        max = Math.max(max, neighbor);
                    }
                if (!isolated || count !== 8 || max - min > threshold / 2) continue;
                neighbors.sort((a, b) => a - b);
                display ??= heights.slice();
                display[index] = (neighbors[3] + neighbors[4]) / 2;
            }
        const result = display ?? heights;
        cache.set(tile, result);
        if (cache.size > 32) cache.delete(cache.keys().next().value!);
        return result;
    };
}
