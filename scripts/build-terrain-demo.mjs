import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'root', 'terrain-demo.html');
const html = await readFile(target, 'utf8');
const terrainMatch = html.match(/<script>window\.terrainDemoData=([\s\S]*?);<\/script>/);
if (!terrainMatch) throw new Error('Embedded terrain data is missing.');
const terrain = JSON.parse(terrainMatch[1]);
const args = process.argv.slice(2);
if (args.length !== 0 && (args.length !== 2 || args[0] !== '--surface')) {
    throw new Error('Usage: npm run build:terrain -- [--surface path-to-surface.json]');
}
if (args.length === 2) {
    const sample = JSON.parse(await readFile(path.resolve(args[1]), 'utf8'));
    if (
        sample.mapKey !== 'TheIsland_WP' ||
        sample.heights.length !== sample.columns * sample.rows ||
        !sample.heights.every((value) => value !== null && Number.isFinite(value))
    ) {
        throw new Error('The Island surface grid contains missing or invalid heights.');
    }
    const heights = Buffer.alloc(sample.heights.length * 4);
    sample.heights.forEach((height, index) => heights.writeFloatLE(height, index * 4));
    terrain.heightsBase64 = heights.toString('base64');
    for (const key of ['columns', 'rows', 'originX', 'originY', 'maxX', 'maxY', 'spacing']) {
        terrain.metadata[key] = sample[key];
    }
}
const index = JSON.parse(await readFile(path.join(root, 'root', 'data', 'index.json'), 'utf8'));
const map = JSON.parse(
    await readFile(path.join(root, 'root', 'data', 'game', 'TheIsland_WP.json'), 'utf8'),
);
if (map.mapKey !== 'TheIsland_WP' || !Array.isArray(map.resources) || map.resources.length === 0) {
    throw new Error('Missing Island resource data.');
}
for (const resource of map.resources) {
    if (
        !Array.isArray(resource.points) ||
        !resource.points.every(
            (point) => Array.isArray(point) && point.length === 3 && point.every(Number.isFinite),
        )
    ) {
        throw new Error(`Invalid resource points: ${resource.resourceType}`);
    }
}
const resourceTypes = index.resourceTypes.filter((type) =>
    map.resources.some((resource) => resource.resourceType === type.name),
);
const data = JSON.stringify({
    resourceTypes,
    map: {
        mapKey: map.mapKey,
        coordinates: map.coordinates,
        resources: map.resources,
    },
}).replaceAll('<', '\\u003c');
const bundle = await build({
    entryPoints: [path.join(root, 'src', 'terrain-demo.ts')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2020',
    minify: true,
    legalComments: 'inline',
});
const script = bundle.outputFiles[0].text.replaceAll('</script', '<\\/script');
const marker = /<!-- TERRAIN_RESOURCES_START -->[\s\S]*?<!-- TERRAIN_RESOURCES_END -->/;
const clean = html.replace(marker, '');
const application =
    /<script>window\.terrainDemoData=[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/;
if (!application.test(clean)) throw new Error('Terrain demo application script is missing.');
const addition = `<script>window.terrainDemoData=${JSON.stringify(terrain).replaceAll('<', '\\u003c')};</script>
<!-- TERRAIN_RESOURCES_START -->
<script>window.terrainDemoResourcesData=${data};</script>
<!-- TERRAIN_RESOURCES_END -->
<script>${script}</script>`;
const output = clean.replace(application, () => addition);
await writeFile(target, output);
console.log(
    `Embedded ${map.resources.reduce((count, resource) => count + resource.points.length, 0)} points in ${map.resources.length} resource layers.`,
);
