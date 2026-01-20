export class UIManager {
    private loadingEl: HTMLElement | null;
    private errorBoxEl: HTMLElement | null;
    private errorContentEl: HTMLElement | null;

    constructor() {
        this.loadingEl = document.getElementById('loading');
        this.errorBoxEl = document.getElementById('errorBox');
        this.errorContentEl = document.getElementById('errorContent');
        
        this.setupErrorCapture();
    }

    private setupErrorCapture(): void {
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
            originalConsoleError.apply(console, args);
            if (!this.errorBoxEl || !this.errorContentEl) return;
            
            const errorText = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            this.errorContentEl.innerHTML += '<pre>' + errorText + '</pre>';
            this.errorBoxEl.style.display = 'block';
        };
    }

    showLoading(): void {
        if (this.loadingEl) this.loadingEl.style.display = 'block';
    }

    hideLoading(): void {
        if (this.loadingEl) this.loadingEl.style.display = 'none';
    }

    updateMapInfo(mapName: string, pointCount: number): void {
        const mapNameEl = document.getElementById('mapName');
        const pointCountEl = document.getElementById('pointCount');
        if (mapNameEl) mapNameEl.textContent = mapName;
        if (pointCountEl) pointCountEl.textContent = pointCount.toString();
    }

    updateCoordinates(lat: number, long: number): void {
        const latEl = document.getElementById('coord-lat');
        const longEl = document.getElementById('coord-long');
        if (latEl) latEl.textContent = lat.toFixed(1);
        if (longEl) longEl.textContent = long.toFixed(1);
    }

    clearCoordinates(): void {
        const latEl = document.getElementById('coord-lat');
        const longEl = document.getElementById('coord-long');
        if (latEl) latEl.textContent = '-';
        if (longEl) longEl.textContent = '-';
    }

    showPointHover(resourceType: string, mouseLat: number, mouseLong: number, nodeLat: number, nodeLong: number, nodeZ: number, clusterSize?: number, isNoise?: boolean): void {
        const coordinatesEl = document.getElementById('coordinates');
        if (coordinatesEl) {
            let clusterInfo = '';
            if (clusterSize !== undefined) {
                clusterInfo = `<br>Cluster: <span style="color: #4fc3f7;">${clusterSize} items</span>`;
            } else if (isNoise) {
                clusterInfo = `<br>Cluster: <span style="color: #ff9800;">Noise point</span>`;
            }
            
            coordinatesEl.innerHTML = `
                <strong>Point Details:</strong><br>
                Resource: <span style="color: #4fc3f7;">${resourceType}</span>${clusterInfo}<br>
                Node Lat: <span style="color: #4fc3f7;">${nodeLat.toFixed(1)}</span><br>
                Node Long: <span style="color: #4fc3f7;">${nodeLong.toFixed(1)}</span><br>
                Node Z: <span style="color: #4fc3f7;">${nodeZ.toFixed(1)}</span><br>
                <strong>Cursor Position:</strong><br>
                Lat: <span id="coord-lat">${mouseLat.toFixed(1)}</span><br>
                Long: <span id="coord-long">${mouseLong.toFixed(1)}</span>
            `;
        }
    }

    hidePointHover(): void {
        const coordinatesEl = document.getElementById('coordinates');
        if (coordinatesEl) {
            coordinatesEl.innerHTML = `
                <strong>Cursor Position:</strong><br>
                Lat: <span id="coord-lat">-</span><br>
                Long: <span id="coord-long">-</span>
            `;
        }
    }

    getElement<T extends HTMLElement>(id: string): T | null {
        return document.getElementById(id) as T | null;
    }
}
