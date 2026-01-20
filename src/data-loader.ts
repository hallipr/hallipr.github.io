import { IndexData, MapData, MapInfo, ResourceType } from './types';

export class DataLoader {
    private indexData: IndexData | null = null;

    async loadIndex(): Promise<IndexData> {
        const response = await fetch('./data/index.json');
        if (!response.ok) {
            throw new Error(`Failed to load index.json: ${response.status} ${response.statusText}`);
        }
        this.indexData = await response.json();
        return this.indexData;
    }

    async loadMapData(dataUrl: string): Promise<MapData> {
        const response = await fetch(`./data/${dataUrl}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch map data: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    getResourceTypes(): ResourceType[] {
        return this.indexData?.resourceTypes ?? [];
    }

    getMaps(): MapInfo[] {
        return this.indexData?.maps ?? [];
    }
}
