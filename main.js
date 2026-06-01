import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(12, 5, 18); // Cámara más cerca del satélite

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- SOL POTENTE (ILUMINACIÓN LATERAL) ---
const sunLight = new THREE.DirectionalLight(0xffffff, 5);
sunLight.position.set(100, 20, 100);
scene.add(sunLight);

// Luz azulada que viene desde abajo (Reflejo de la Tierra)
const earthBounce = new THREE.DirectionalLight(0x4488ff, 2);
earthBounce.position.set(-10, -50, -10);
scene.add(earthBounce);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const gltfLoader = new GLTFLoader();

// --- 1. TIERRA (Más cerca y grande para realismo de órbita) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    // Aumentamos escala y la acercamos
    earth.scale.set(0.04, 0.04, 0.04); 
    earth.position.set(0, -55, -40); // El satélite vuela "sobre" ella
    scene.add(earth);
    
    earth.traverse((n) => {
        if (n.isMesh) {
            n.material.roughness = 0.8;
            n.material.metalness = 0.1;
        }
    });
});

// --- 2. SATÉLITE (Ajuste de Materiales) ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 10 / size; 
    model.scale.set(scale, scale, scale);
    
    model.traverse((n) => {
        if (n.isMesh) {
            // Hacemos que brille como metal real
            n.material.metalness = 1.0; 
            n.material.roughness = 0.15;
            // Reforzamos el color para que no se vea gris
            if (n.material.color) n.material.color.multiplyScalar(1.2);
        }
    });
    satelliteGroup.add(model);
});

// --- 3. FONDO ESPACIAL (Nebulosas y Estrellas) ---
// Agregamos una "Skybox" negra con estrellas para que no sea solo puntos
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<20000; i++) {
    starCoords.push((Math.random()-0.5)*8000, (Math.random()-0.5)*8000, (Math.random()-0.5)*8000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 1.5})));

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (earth) {
        earth.rotation.y += 0.0001; // Rotación lenta
    }
    
    // El satélite gira suavemente para mostrar todos los lados
    satelliteGroup.rotation.y += 0.0005; 
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
