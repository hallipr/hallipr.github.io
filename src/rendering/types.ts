// Rendering Layer - Types and Interfaces

export enum ViewMode {
    VIEW_2D = '2d',
    VIEW_3D = '3d',
}

export enum CameraMode {
    ORTHOGRAPHIC_TOP_DOWN = 'orthographic-topdown',
    PERSPECTIVE = 'perspective',
}

export interface ViewConfig {
    viewMode: ViewMode;
}
