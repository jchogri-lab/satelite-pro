import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(10, 5, 20); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // Exposición equilibrada
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 1. EL SOL (Ahora es una fuente de luz gigante visible) ---
const sunGroup = new THREE.Group();
const sunGeo = new THREE.SphereGeometry(40, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Blanco puro brillante
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunGroup.add(sunMesh);

// Posición: Lo ponemos a la derecha y un poco atrás
sunGroup.position.set(800, 300, -600);
scene.add(sunGroup);

// Luz del Sol (Poderosa)
const sunLight = new THREE.DirectionalLight(0xffffff, 4);
sunLight.position.copy(sunGroup.position);
scene.add(sunLight);

// --- 2. LA LUNA (Visible y con textura de roca) ---
const moonGeo = new THREE.SphereGeometry(15, 32, 32);
const moonMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    emissive: 0xffffff, 
    emissiveIntensity: 0.2 // Un poquito de brillo propio para que se vea
});
const moon = new THREE.Mesh(moonGeo, moonMat);
moon.position.set(-600, 150, -1200); // En el lado opuesto al sol
scene.add(moon);

// --- 3. ILUMINACIÓN PARA EL SATÉLITE ---
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const camLight = new THREE.PointLight(0xffffff, 2);
camera.add(camLight);
scene.add(camera);

const gltfLoader = new GLTFLoader();

// --- 4. TIERRA (Inmensa y cerca) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.2, 0.2, 0.2); 
    earth.position.set(0, -210, -50); 
    scene.add(earth);
});

// --- 5. SATÉLITE (Realista y visible) ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    model.scale.set(11/size, 11/size, 11/size);
    
    model.traverse((n) => {
        if (n.isMesh) {
            n.material.metalness = 0.5;
            n.material.roughness = 0.4;
            if (n.material.color) n.material.color.multiplyScalar(1.5);
        }
    });
    satelliteGroup.add(model);
});

// ESTRELLAS (Más grandes y brillantes)
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<20000; i++) {
    starCoords.push((Math.random()-0.5)*15000, (Math.random()-0.5)*15000, (Math.random()-0.5)*15000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 3})));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (earth) earth.rotation.y += 0.0001;
    satelliteGroup.rotation.y += 0.0005; 
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
