// Main Application Entry Point - Connects all layers together

import { Application } from './ui/Application.js';
import { ViewMode } from './rendering/types.js';

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
                option.value = map;
                option.textContent = map;
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
            await this.loadMap(maps[0]);

            // Update the selector
            const select = document.getElementById('mapSelect') as HTMLSelectElement;
            if (select) {
                select.value = maps[0];
            }
        }
    }

    private async loadMap(mapName: string): Promise<void> {
        console.log(`Loading map: ${mapName}`);

        await this.app.loadMap(mapName);

        // Show success message or update UI as needed
        console.log(`Successfully loaded ${mapName}`);
    }

    // Public API for debugging and external access
    public getApplication(): Application {
        return this.app;
    }

    public async switchToMap(mapName: string): Promise<void> {
        return this.loadMap(mapName);
    }

    public setView(viewMode: ViewMode): void {
        this.app.setViewMode(viewMode);
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
