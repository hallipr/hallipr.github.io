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

    getElement<T extends HTMLElement>(id: string): T | null {
        return document.getElementById(id) as T | null;
    }
}
