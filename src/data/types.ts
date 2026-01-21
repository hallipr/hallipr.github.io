// Data Layer - Pure data types and interfaces, no logic

export interface CoordinateSystem {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    centerX: number;
    centerY: number;
    scaleX: number;
    scaleY: number;
}

export interface ResourceType {
    name: string;
    color: string;
    colorHex: string;
}

export interface MapInfo {
    name: string;
    dataUrl: string;
    modName?: string;
}

export interface MapResource {
    resourceType: string;
    points: [number, number, number][];
}

export interface MapData {
    mapName: string;
    coordinates: CoordinateSystem;
    resources: MapResource[];
    imageName?: string;
}

export interface IndexData {
    resourceTypes: ResourceType[];
    maps: MapInfo[];
}

// Raw point data from the data files
export interface RawPoint {
    x: number;
    y: number;
    z: number;
}
