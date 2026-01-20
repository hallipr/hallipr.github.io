import * as THREE from 'three';

export class ControlsHandler {
    constructor(private particles: () => THREE.Points[]) {
        this.setupToggleAll();
        this.setupSizeAttenuation();
    }

    private setupToggleAll(): void {
        const toggleAllCheckbox = document.getElementById('toggleAll');
        toggleAllCheckbox?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const checked = target.checked;
            
            document.querySelectorAll('.resourceType-toggle').forEach(checkbox => {
                (checkbox as HTMLInputElement).checked = checked;
            });
            
            this.particles().forEach(particle => {
                particle.visible = checked;
            });
        });
    }

    private setupSizeAttenuation(): void {
        const sizeAttenuationCheckbox = document.getElementById('sizeAttenuation');
        sizeAttenuationCheckbox?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.particles().forEach(particle => {
                const material = particle.material as THREE.PointsMaterial;
                material.sizeAttenuation = target.checked;
                material.size = target.checked ? 500 : 4;
                material.needsUpdate = true;
            });
        });
    }
}
