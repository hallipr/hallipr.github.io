import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class SceneManager {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    gridHelper: THREE.GridHelper | null = null;
    compassSprites: THREE.Sprite[] = [];
    particles: THREE.Points[] = [];

    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            10000000
        );

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    clearScene(): void {
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper = null;
        }
        
        this.compassSprites.forEach(sprite => this.scene.remove(sprite));
        this.compassSprites = [];
        
        this.particles.forEach(particle => this.scene.remove(particle));
        this.particles = [];
    }

    addGrid(size: number, divisions: number): void {
        this.gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
        this.gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(this.gridHelper);
    }

    addCompassSprite(sprite: THREE.Sprite): void {
        this.compassSprites.push(sprite);
        this.scene.add(sprite);
    }

    addParticles(particles: THREE.Points): void {
        this.particles.push(particles);
        this.scene.add(particles);
    }

    positionCamera(x: number, y: number, z: number, targetX: number, targetY: number, targetZ: number): void {
        this.camera.up.set(0, -1, 0);
        this.camera.position.set(x, y, z);
        this.controls.target.set(targetX, targetY, targetZ);
        this.controls.update();
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(): void {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
