import { MapInfo } from './types';

export class MapSelector {
    private selectElement: HTMLSelectElement;

    constructor(selectElementId: string) {
        this.selectElement = document.getElementById(selectElementId) as HTMLSelectElement;
    }

    populateOptions(maps: MapInfo[]): void {
        const categories: Record<string, MapInfo[]> = {};

        maps.forEach(map => {
            const modName = map.modName || '';
            if (!categories[modName]) {
                categories[modName] = [];
            }
            categories[modName].push(map);
        });

        Object.keys(categories).sort().forEach(category => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category || 'Base Game';
            categories[category].forEach(map => {
                const option = document.createElement('option');
                option.value = map.dataUrl;
                option.textContent = map.name;
                optgroup.appendChild(option);
            });
            this.selectElement.appendChild(optgroup);
        });
    }

    onChange(callback: (dataUrl: string) => void): void {
        this.selectElement.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            if (target.value) {
                callback(target.value);
            }
        });
    }
}
