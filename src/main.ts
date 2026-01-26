// Main Application Entry Point - Connects all layers together

import { Application } from './ui/Application.js';

declare global {
    interface Window {
        arkApp?: MainApplication;
    }
}

class MainApplication {
    private app: Application;

    constructor() {
        // Don't replace the HTML - use existing structure
        // The HTML already has all necessary elements

        this.app = new Application();
        this.setupUI();
        this.setupDebugToggle();
        this.loadInitialMap();
    }

    private setupUI(): void {
        // Add map selector
        this.createMapSelector();
    }

    private async createMapSelector(): Promise<void> {
        // Use the existing mapSelect dropdown in the HTML
        const select = document.getElementById('mapSelect') as HTMLSelectElement;

        if (!select) {
            console.error('mapSelect element not found');
            return;
        }

        try {
            const maps = await this.app.getAvailableMaps();

            // Clear existing options except the first placeholder
            select.innerHTML = '<option value="">-- Choose a map --</option>';

            // Add map options
            maps.forEach((map) => {
                const option = document.createElement('option');
                option.value = map.key;
                option.textContent = map.name;
                select.appendChild(option);
            });

            select.addEventListener('change', (event) => {
                const target = event.target as HTMLSelectElement;
                if (target.value) {
                    this.loadMap(target.value);
                }
            });
        } catch (error) {
            console.error('Error loading map list:', error);
        }
    }

    private async loadInitialMap(): Promise<void> {
        // Try to load the first available map
        const maps = await this.app.getAvailableMaps();
        if (maps.length > 0) {
            await this.loadMap(maps[0].key);

            // Update the selector
            const select = document.getElementById('mapSelect') as HTMLSelectElement;
            if (select) {
                select.value = maps[0].key;
            }
        }
    }

    private setupDebugToggle(): void {
        const debugToggle = document.getElementById('debug-toggle') as HTMLInputElement;
        const debugPanel = document.getElementById('debug-panel') as HTMLElement;

        if (!debugToggle || !debugPanel) {
            console.error('Debug toggle or panel element not found');
            return;
        }

        debugToggle.addEventListener('change', () => {
            const isDebugEnabled = debugToggle.checked;
            
            // Toggle debug panel visibility
            debugPanel.style.display = isDebugEnabled ? 'block' : 'none';
            
            // Toggle debug resource type visibility
            this.toggleDebugResourceType(isDebugEnabled);
        });
    }

    private toggleDebugResourceType(visible: boolean): void {
        // Find the debug resource type checkbox in the resource panel
        const resourceTable = document.getElementById('resourceTypeTableBody');
        if (!resourceTable) return;

        // Look for the debug resource type row
        const rows = resourceTable.querySelectorAll('tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const resourceName = row.querySelector('td:nth-child(2)');
            if (resourceName && resourceName.textContent === 'Debug') {
                const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
                if (checkbox) {
                    checkbox.checked = visible;
                    checkbox.dispatchEvent(new Event('change'));
                }
                // Also toggle row visibility
                (row as HTMLElement).style.display = visible ? '' : 'none';
                break;
            }
        }
    }

    private async loadMap(mapKey: string): Promise<void> {
        console.log(`Loading map: ${mapKey}`);

        await this.app.loadMap(mapKey);

        // Show success message or update UI as needed
        console.log(`Successfully loaded ${mapKey}`);
    }

    // Public API for debugging and external access
    public getApplication(): Application {
        return this.app;
    }

    public async switchToMap(mapKey: string): Promise<void> {
        return this.loadMap(mapKey);
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing ARK Resource Map Application...');

    try {
        const mainApp = new MainApplication();

        // Make it available globally for debugging
        window.arkApp = mainApp;

        console.log('Application initialized successfully');
        console.log('Use window.arkApp to access the application in the console');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
});

// Export for module usage
export { MainApplication };
