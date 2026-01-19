// Capture console errors and display them
const originalConsoleError = console.error;
console.error = function(...args) {
    originalConsoleError.apply(console, args);
    const errorBox = document.getElementById('errorBox');
    const errorContent = document.getElementById('errorContent');
    const errorText = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    errorContent.innerHTML += '<pre>' + errorText + '</pre>';
    errorBox.style.display = 'block';
};

// Available maps - will be loaded from JSON
let availableMaps = [];

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    1,
    10000000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Global objects
let gridHelper = null;
let compassSprites = [];
let particles = [];
let coordinateSystem = null;

// Populate map selector
const mapSelect = document.getElementById('mapSelect');
let resourceTypes = null;
let maps = [];

async function loadIndex() {
    const response = await fetch('./data/index.json');
    if (!response.ok) {
        throw new Error(`Failed to load index.json: ${response.status} ${response.statusText}`);
    }
    let index = await response.json();
    resourceTypes = index.resourceTypes;
    maps = index.maps;
}

async function initializeMapSelector() {
    try {
        const categories = {};
        
        maps.forEach(map => {
            let modName = map.modName || ''; // empty string for base game maps
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
            mapSelect.appendChild(optgroup);
        });
    } catch (error) {
        console.error('Failed to load map index:', error);
        alert('Failed to load map index');
    }
}

// Initialize on load
(async () => {
    await loadIndex();
    initializeMapSelector();
})();

// Load map on selection
mapSelect.addEventListener('change', async (e) => {
    if (!e.target.value) return;
    await loadMap(e.target.value);
});

// Create compass labels as sprites
function createTextSprite(text, color, scale) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    context.font = 'Bold 120px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(scale, scale, 1);
    
    return sprite;
}

async function loadMap(dataUrl) {
    // Show loading indicator
    document.getElementById('loading').style.display = 'block';
    
    try {
        // Clear existing scene objects
        if (gridHelper) scene.remove(gridHelper);
        compassSprites.forEach(sprite => scene.remove(sprite));
        compassSprites = [];
        particles.forEach(particle => scene.remove(particle));
        particles = [];
        
        // Fetch map data
        const response = await fetch(`./data/${dataUrl}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch map data: ${response.status} ${response.statusText}`);
        }

        const mapData = await response.json();
        coordinateSystem = mapData.coordinates;
        
        // Count total points
        let totalPoints = 0;
        mapData.resources.forEach(resource => {
            totalPoints += resource.points.length;
        });
        
        // Update UI
        document.getElementById('mapName').textContent = mapData.mapName;
        document.getElementById('pointCount').textContent = totalPoints;
        
        // Use world bounds from coordinate system
        const minX = coordinateSystem.minX;
        const maxX = coordinateSystem.maxX;
        const minY = coordinateSystem.minY;
        const maxY = coordinateSystem.maxY;
        const minZ = coordinateSystem.minZ;
        const maxZ = coordinateSystem.maxZ;
        
        const worldWidth = maxX - minX;
        const worldHeight = maxY - minY;
        const worldDepth = maxZ - minZ;
        const worldSize = Math.max(worldWidth, worldHeight, worldDepth);
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;
        
        // Create grid
        const gridSize = Math.ceil(worldSize * 1.2);
        const gridDivisions = Math.min(100, Math.max(20, Math.floor(gridSize / 100)));
        gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);
        
        // Create compass
        const compassScale = worldSize * 0.05;
        const compassDistance = gridSize / 2;
        const compassHeight = worldSize * 0.01;
        
        compassSprites.push(createTextSprite('N', '#ff6b6b', compassScale));
        compassSprites[0].position.set(0, -compassDistance, compassHeight);
        scene.add(compassSprites[0]);
        
        compassSprites.push(createTextSprite('S', '#ffffff', compassScale));
        compassSprites[1].position.set(0, compassDistance, compassHeight);
        scene.add(compassSprites[1]);
        
        compassSprites.push(createTextSprite('E', '#ffffff', compassScale));
        compassSprites[2].position.set(-compassDistance, 0, compassHeight);
        scene.add(compassSprites[2]);
        
        compassSprites.push(createTextSprite('W', '#ffffff', compassScale));
        compassSprites[3].position.set(compassDistance, 0, compassHeight);
        scene.add(compassSprites[3]);
        
        // Create particle systems
        const resourceTypeLookup = {};
        resourceTypes.forEach(type => {
            resourceTypeLookup[type.name] = type;
        });

        mapData.resources.forEach((resource, index) => {
            const resourceType = resource.resourceType;
            const typeConfig = resourceTypeLookup[resourceType];
            if (!typeConfig) {
                console.error('Resource type not found:', resourceType);
                return;
            }
           
            const color = new THREE.Color(typeConfig.color);
            
            const positions = new Float32Array(resource.points.length * 3);
            resource.points.forEach((pos, i) => {
                positions[i * 3] = pos[0];
                positions[i * 3 + 1] = pos[1];
                positions[i * 3 + 2] = pos[2];
            });
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.PointsMaterial({
                color: color,
                size: 8,
                sizeAttenuation: document.getElementById('sizeAttenuation').checked
            });
            
            const particleSystem = new THREE.Points(geometry, material);
            particleSystem.userData = {
                resourceType: resourceType,
                count: resource.points.length
            };
            
            scene.add(particleSystem);
            particles.push(particleSystem);
        });
        
        // Update resource type table
        const resourceTypeTableBody = document.getElementById('resourceTypeTableBody');
        resourceTypeTableBody.innerHTML = '';

        // keep original resource type order
        resourceTypes.forEach(typeConfig => {
            const name = typeConfig.name;
            if (!mapData.resources.find(r => r.resourceType === name)) {
                return; // skip resource types not in this map
            }

            const particle = particles.find(p => p.userData.resourceType === name);
            const count = particle.userData.count;
            const hexColor = typeConfig.colorHex;
            
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
            `;
            resourceTypeTableBody.appendChild(row);
        });
        
        // Attach event listeners
        document.querySelectorAll('.resourceType-toggle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const resourceType = e.target.dataset.resourcetype;
                const checked = e.target.checked;
                particles.forEach(particle => {
                    if (particle.userData.resourceType === resourceType) {
                        particle.visible = checked;
                    }
                });
            });
        });
        
        // Attach color picker event listeners
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('input', (e) => {
                const resourceType = e.target.dataset.resourcetype;
                const newColor = e.target.value;
                
                // Update particle system color
                particles.forEach(particle => {
                    if (particle.userData.resourceType === resourceType) {
                        particle.material.color.setStyle(newColor);
                    }
                });
                
                // Update color swatch
                const swatch = document.querySelector(`.color-swatch[data-resourcetype="${resourceType}"]`);
                if (swatch) {
                    swatch.style.backgroundColor = newColor;
                }
            });
        });
        
        document.getElementById('toggleAll').checked = true;
        
        // Position camera
        camera.up.set(0, -1, 0);
        const vFOV = camera.fov * Math.PI / 180;
        const height = worldSize;
        const cameraDistance = height / (2 * Math.tan(vFOV / 2)) * 1.2;
        
        camera.position.set(centerX, centerY, centerZ + cameraDistance);
        controls.target.set(centerX, centerY, centerZ);
        controls.update();
        
    } catch (error) {
        console.error('Error loading map:', error);
        alert('Failed to load map data');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Toggle all particles
document.getElementById('toggleAll').addEventListener('change', (e) => {
    const checked = e.target.checked;
    document.querySelectorAll('.resourceType-toggle').forEach(checkbox => {
        checkbox.checked = checked;
    });
    particles.forEach(particle => {
        particle.visible = checked;
    });
});

// Size attenuation toggle
document.getElementById('sizeAttenuation').addEventListener('change', (e) => {
    particles.forEach(particle => {
        particle.material.sizeAttenuation = e.target.checked;
    });
});

// Mouse position tracking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const intersectionPoint = new THREE.Vector3();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
        const gameX = -intersectionPoint.x;
        const gameY = intersectionPoint.y;
        
        // Convert to lat/long if coordinate system is available
        if (coordinateSystem) {
            const lat = 50 + (gameY - coordinateSystem.centerY) / coordinateSystem.scaleY;
            const long = 50 + (gameX - coordinateSystem.centerX) / coordinateSystem.scaleX;
            
            document.getElementById('coord-lat').textContent = lat.toFixed(1);
            document.getElementById('coord-long').textContent = long.toFixed(1);
        } else {
            document.getElementById('coord-lat').textContent = '-';
            document.getElementById('coord-long').textContent = '-';
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
