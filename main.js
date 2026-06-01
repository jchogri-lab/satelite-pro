}import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(15, 10, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- AJUSTE DE COLOR Y BRILLO ---
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.2; // Subimos la exposición para ver más detalle
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- SISTEMA DE ILUMINACIÓN MULTIPUNTO ---
// 1. Luz del Sol (Principal)
const sun = new THREE.DirectionalLight(0xffffff, 4);
sun.position.set(50, 50, 50);
scene.add(sun);

// 2. Luz de Relleno (Ambiental fuerte para eliminar negros totales)
const ambient = new THREE.AmbientLight(0xffffff, 1.2); 
scene.add(ambient);

// 3. Luz de la Tierra (Reflejo azulado desde abajo)
const earthLight = new THREE.PointLight(0x4488ff, 2);
earthLight.position.set(0, -50, 0);
scene.add(earthLight);

// 4. LUZ FRONTAL MÓVIL (Sigue a la cámara para que siempre veas el satélite iluminado)
const frontLight = new THREE.PointLight(0xffffff, 2.5);
camera.add(frontLight); 
scene.add(camera);

const gltfLoader = new GLTFLoader();

// --- CARGA DE LA TIERRA ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.015, 0.015, 0.015); 
    earth.position.set(0, -100, -150); 
    scene.add(earth);
}, undefined, (e) => console.error(e));

// --- CARGA DEL SATÉLITE ---
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
            // Ajuste para que el material no sea tan oscuro
            n.material.metalness = 0.4; // Menos metal = más color visible
            n.material.roughness = 0.3; // Superficie más suave para captar mejor la luz
            n.material.emissive = new THREE.Color(0x111111); // Un pequeño brillo propio para que no sea negro
        }
    });
    
    satelliteGroup.add(model);
});

// ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<15000; i++) {
    starCoords.push((Math.random()-0.5)*15000, (Math.random()-0.5)*15000, (Math.random()-0.5)*15000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2})));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (earth) earth.rotation.y += 0.0002;
    satelliteGroup.rotation.y += 0.002; 
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
