// UI Layer - User interface controls and orchestration

import type { ClusterConfig } from '../world/World.js';

export interface UICallbacks {
    onClusterConfigChange: (config: ClusterConfig) => void;
    onPointSizeChange?: (size: number) => void;
    onSizeAttenuationChange?: (enabled: boolean) => void;
    onMouseMove?: (x: number, y: number) => void;
    onHoverPoint?: (pointId?: string) => void;
    onResetCamera?: () => void;
}

export class ViewControlsManager {
    private callbacks: UICallbacks;

    // DOM Elements
    private resetCameraBtnElement: HTMLButtonElement;
    private clusterEnabledElement: HTMLInputElement;
    private clusterRadiusElement: HTMLInputElement;
    private clusterRadiusValueElement: HTMLSpanElement;
    private pointSizeElement: HTMLInputElement;
    private pointSizeValueElement: HTMLSpanElement;
    private sizeAttenuationElement: HTMLInputElement;

    constructor(callbacks: UICallbacks) {
        this.callbacks = callbacks;

        // Capture all elements
        this.resetCameraBtnElement = document.querySelector(
            '#reset-camera-btn',
        ) as HTMLButtonElement;
        this.clusterEnabledElement = document.querySelector('#cluster-enabled') as HTMLInputElement;
        this.clusterRadiusElement = document.querySelector('#cluster-radius') as HTMLInputElement;
        this.clusterRadiusValueElement = document.querySelector(
            '#cluster-radius-value',
        ) as HTMLSpanElement;
        this.pointSizeElement = document.querySelector('#point-size-slider') as HTMLInputElement;
        this.pointSizeValueElement = document.querySelector('#point-size-value') as HTMLSpanElement;
        this.sizeAttenuationElement = document.querySelector(
            '#size-attenuation',
        ) as HTMLInputElement;

        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        // Reset camera button
        if (this.resetCameraBtnElement && this.callbacks.onResetCamera) {
            this.resetCameraBtnElement.addEventListener('click', () => {
                if (this.callbacks.onResetCamera) {
                    this.callbacks.onResetCamera();
                }
            });
        }

        const updateClusterConfig = () => {
            const config: ClusterConfig = {
                enabled: this.clusterEnabledElement?.checked ?? false,
                radius: parseInt(this.clusterRadiusElement?.value ?? '5000'),
                minClusterSize: 3, // Fixed value
                maxLevels: 4, // Fixed value
            };
            this.callbacks.onClusterConfigChange(config);
        };

        // Cluster control event listeners
        if (this.clusterEnabledElement) {
            this.clusterEnabledElement.addEventListener('change', updateClusterConfig);
        }
        if (this.clusterRadiusElement) {
            this.clusterRadiusElement.addEventListener('input', () => {
                if (this.clusterRadiusValueElement) {
                    this.clusterRadiusValueElement.textContent = this.clusterRadiusElement.value;
                }
                updateClusterConfig();
            });
        }

        // Point size control
        if (this.pointSizeElement) {
            this.pointSizeElement.addEventListener('input', () => {
                const size = parseInt(this.pointSizeElement.value);
                if (this.pointSizeValueElement) {
                    this.pointSizeValueElement.textContent = size.toString();
                }
                if (this.callbacks.onPointSizeChange) {
                    this.callbacks.onPointSizeChange(size);
                }
            });
        }

        // Size attenuation control
        if (this.sizeAttenuationElement) {
            this.sizeAttenuationElement.addEventListener('change', () => {
                if (this.callbacks.onSizeAttenuationChange) {
                    this.callbacks.onSizeAttenuationChange(this.sizeAttenuationElement.checked);
                }
            });
        }

        // Trigger initial cluster config to ensure UI values are applied
        updateClusterConfig();
    }

    updateClusterConfig(config: ClusterConfig): void {
        if (this.clusterEnabledElement) {
            this.clusterEnabledElement.checked = config.enabled;
        }
        if (this.clusterRadiusElement) {
            this.clusterRadiusElement.value = config.radius.toString();
        }

        // Update display values
        if (this.clusterRadiusValueElement) {
            this.clusterRadiusValueElement.textContent = config.radius.toString();
        }
    }
}

export class HoverManager {
    private canvas: HTMLCanvasElement;
    private callbacks: UICallbacks;

    constructor(canvas: HTMLCanvasElement, callbacks: UICallbacks) {
        this.canvas = canvas;
        this.callbacks = callbacks;
        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Call mouse move callback for coordinate tracking
            if (this.callbacks.onMouseMove) {
                this.callbacks.onMouseMove(x, y);
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            if (this.callbacks.onHoverPoint) {
                this.callbacks.onHoverPoint();
            }
            // Clear coordinates when mouse leaves
            this.updateCoordinateDisplay(null, null);
        });
    }

    private updateCoordinateDisplay(lat: number | null, long: number | null): void {
        const latElement = document.getElementById('coord-lat');
        const longElement = document.getElementById('coord-long');

        if (latElement) {
            latElement.textContent = lat !== null ? lat.toFixed(1) : '-';
        }
        if (longElement) {
            longElement.textContent = long !== null ? long.toFixed(1) : '-';
        }
    }
}

export class InfoPanelManager {
    private container: HTMLElement;
    private content?: HTMLElement;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;
        // Capture created elements
        this.content = this.container.querySelector('#info-content') as HTMLElement;
    }

    showPointInfo(info: {
        type: string;
        count?: number;
        position: { x: number; y: number; z: number };
    }): void {
        if (!this.content) return;

        this.content.innerHTML = `
            <strong>${info.type}</strong><br>
            ${info.count ? `Count: ${info.count}<br>` : ''}
            Position: (${info.position.x.toFixed(1)}, ${info.position.y.toFixed(1)}, ${info.position.z.toFixed(1)})
        `;

        this.container.style.display = 'block';
    }

    hideInfo(): void {
        this.container.style.display = 'none';
    }
}

export interface ResourceTypeInfo {
    name: string;
    color: string;
    colorHex: string;
    count: number;
    clusterCount: number;
}

export class ResourcePanelManager {
    private tbody: HTMLElement;
    private toggleAllCheckbox: HTMLInputElement;
    private onResourceToggle?: (resourceType: string, visible: boolean) => void;
    private visibleResources = new Set<string>();

    constructor(onResourceToggle?: (resourceType: string, visible: boolean) => void) {
        this.tbody = document.getElementById('resourceTypeTableBody')!;
        this.toggleAllCheckbox = document.getElementById('toggleAll') as HTMLInputElement;
        this.onResourceToggle = onResourceToggle;

        // Set up toggle all checkbox
        this.toggleAllCheckbox.addEventListener('change', () => {
            const checkboxes =
                this.tbody.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
            checkboxes.forEach((cb) => {
                cb.checked = this.toggleAllCheckbox.checked;
                const resourceType = cb.dataset.resourceType!;
                if (cb.checked) {
                    this.visibleResources.add(resourceType);
                } else {
                    this.visibleResources.delete(resourceType);
                }
                if (this.onResourceToggle) {
                    this.onResourceToggle(resourceType, cb.checked);
                }
            });
        });
    }

    updateResourceTypes(resources: ResourceTypeInfo[]): void {
        this.tbody.innerHTML = '';
        this.visibleResources.clear();

        resources.forEach((resource) => {
            const row = document.createElement('tr');

            // Checkbox cell
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.resourceType = resource.name;
            this.visibleResources.add(resource.name);

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.visibleResources.add(resource.name);
                } else {
                    this.visibleResources.delete(resource.name);
                }
                if (this.onResourceToggle) {
                    this.onResourceToggle(resource.name, checkbox.checked);
                }
            });

            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);

            // Resource name cell with color swatch
            const nameCell = document.createElement('td');
            const swatch = document.createElement('span');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = resource.colorHex;
            nameCell.appendChild(swatch);
            nameCell.appendChild(document.createTextNode(resource.name));
            row.appendChild(nameCell);

            // Count cell
            const countCell = document.createElement('td');
            countCell.textContent = resource.count.toString();
            row.appendChild(countCell);

            // Cluster count cell
            const clusterCell = document.createElement('td');
            clusterCell.textContent = resource.clusterCount.toString();
            row.appendChild(clusterCell);

            this.tbody.appendChild(row);
        });
    }
}
