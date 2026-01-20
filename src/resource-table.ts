import * as THREE from 'three';
import { MapData, ResourceType } from './types';

export class ResourceTableManager {
    updateTable(mapData: MapData, resourceTypes: ResourceType[], particles: THREE.Points[]): void {
        const resourceTypeTableBody = document.getElementById('resourceTypeTableBody');
        if (!resourceTypeTableBody) return;

        resourceTypeTableBody.innerHTML = '';

        // Keep original resource type order
        resourceTypes.forEach(typeConfig => {
            const name = typeConfig.name;
            if (!mapData.resources.find(r => r.resourceType === name)) {
                return; // skip resource types not in this map
            }

            const particle = particles.find(p => p.userData.resourceType === name);
            if (!particle) return;

            const count = particle.userData.count;
            const hexColor = typeConfig.colorHex;
            
            // Calculate cluster information
            let clusterInfo = '-';
            if (particle.userData.isClustered && particle.userData.clusterInfo) {
                const clusters = particle.userData.clusterInfo.filter((info: any) => info.clusterSize !== undefined);
                const noisePoints = particle.userData.clusterInfo.filter((info: any) => info.isNoise);
                clusterInfo = `${clusters.length}`;
                if (noisePoints.length > 0) {
                    clusterInfo += ` (+${noisePoints.length})`;
                }
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="resourceType-toggle" data-resourcetype="${name}" checked></td>
                <td>
                    <label style="cursor: pointer; display: inline-flex; align-items: center;">
                        <input type="color" class="color-picker" data-resourcetype="${name}" value="${hexColor}" 
                               style="width: 0; height: 0; padding: 0; border: 0; position: absolute; opacity: 0;">
                        <span class="color-swatch" style="background-color: ${hexColor}" data-resourcetype="${name}"></span>
                        <span style="margin-left: 6px;">${name}</span>
                    </label>
                </td>
                <td>${count}</td>
                <td><span class="cluster-count" data-resourcetype="${name}">${clusterInfo}</span></td>
            `;
            resourceTypeTableBody.appendChild(row);
        });

        this.attachEventListeners(particles);
    }
    
    updateClusterCounts(particles: THREE.Points[]): void {
        console.log('Updating cluster counts for', particles.length, 'particles');
        particles.forEach(particle => {
            const resourceType = particle.userData.resourceType;
            const clusterCountEl = document.querySelector(`[data-resourcetype="${resourceType}"].cluster-count`) as HTMLElement;
            
            console.log(`Checking particle for ${resourceType}:`, {
                isClustered: particle.userData.isClustered,
                hasClusterInfo: !!particle.userData.clusterInfo,
                clusterInfoLength: particle.userData.clusterInfo?.length,
                elementFound: !!clusterCountEl
            });
            
            if (clusterCountEl) {
                let clusterInfo = '-';
                if (particle.userData.isClustered && particle.userData.clusterInfo) {
                    const clusters = particle.userData.clusterInfo.filter((info: any) => info.clusterSize !== undefined);
                    const noisePoints = particle.userData.clusterInfo.filter((info: any) => info.isNoise);
                    clusterInfo = `${clusters.length}`;
                    if (noisePoints.length > 0) {
                        clusterInfo += ` (+${noisePoints.length})`;
                    }
                    console.log(`Setting cluster info for ${resourceType}: ${clusterInfo}`);
                }
                clusterCountEl.textContent = clusterInfo;
            } else {
                console.warn(`Could not find cluster count element for ${resourceType}`);
            }
        });
    }

    private attachEventListeners(particles: THREE.Points[]): void {
        // Resource type toggles
        document.querySelectorAll('.resourceType-toggle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const resourceType = target.dataset.resourcetype;
                const checked = target.checked;
                particles.forEach(particle => {
                    if (particle.userData.resourceType === resourceType) {
                        particle.visible = checked;
                    }
                });
            });
        });

        // Color pickers
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                const resourceType = target.dataset.resourcetype;
                const newColor = target.value;

                // Update particle system color
                particles.forEach(particle => {
                    if (particle.userData.resourceType === resourceType) {
                        (particle.material as THREE.PointsMaterial).color.setStyle(newColor);
                    }
                });

                // Update color swatch
                const swatch = document.querySelector(`.color-swatch[data-resourcetype="${resourceType}"]`) as HTMLElement;
                if (swatch) {
                    swatch.style.backgroundColor = newColor;
                }
            });
        });

        // Set toggle all checkbox state
        const toggleAllCheckbox = document.getElementById('toggleAll') as HTMLInputElement;
        if (toggleAllCheckbox) toggleAllCheckbox.checked = true;
    }
}
