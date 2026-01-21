# ARK Resource Maps - Architecture Documentation

## Overview

This project now has two implementations:

1. **New Layered Architecture** (main) - Clean separation of concerns
2. **Legacy Implementation** - Original monolithic structure

## File Structure

```
src/
├── data/              # Data Layer - Pure data types and loading
│   ├── types.ts       # Core interfaces and enums
│   └── DataLoader.ts  # Data loading logic
├── world/             # Business Logic Layer
│   └── World.ts       # Map data management and clustering
├── rendering/         # Rendering Layer - Three.js specific
│   └── SceneManager.ts # Camera and scene management
├── ui/                # UI Layer - User interface and orchestration
│   ├── UIManager.ts   # Controls, hover, info panels
│   └── Application.ts # Main application orchestrator
├── clustering/        # Shared clustering utilities
├── legacy/            # Original implementation
└── main.ts           # New architecture entry point
```

## Build Commands

| Command                | Description                          | Output                 |
| ---------------------- | ------------------------------------ | ---------------------- |
| `npm run build`        | Build new layered architecture       | `root/index.js`        |
| `npm run build:legacy` | Build legacy implementation          | `root/index-legacy.js` |
| `npm run build:main`   | Build new architecture (alternative) | `root/main.js`         |
| `npm run dev`          | Start development server             | http://localhost:8080  |

## URLs

| URL                   | Description                        |
| --------------------- | ---------------------------------- |
| `/`                   | New layered architecture           |
| `/index-old.html`     | Legacy implementation              |
| `/index-layered.html` | Alternative new architecture entry |

## Architecture Benefits

### Data Layer

- Pure data types with no dependencies
- Clean data loading with error handling
- Type-safe interfaces

### World Layer

- Business logic separation
- Clustering and spatial indexing
- Coordinate system management

### Rendering Layer

- Three.js specific logic isolated
- Camera management (2D/3D modes)
- Scene and mesh handling

### UI Layer

- User interface controls
- Application orchestration
- Event handling and callbacks

## Migration Notes

The new architecture provides:

- Better separation of concerns
- Easier testing and maintenance
- Cleaner dependency management
- Enhanced 2D/3D view capabilities
- Improved clustering controls

The legacy version is preserved for compatibility but the new layered architecture is recommended for all new development.
