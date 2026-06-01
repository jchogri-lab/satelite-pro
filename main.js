import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(12, 8, 20); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // Bajamos la exposición para que no sea todo blanco
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 1. EL SOL (Cuerpo visible y Luz) ---
// Creamos una esfera que represente al sol
const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(1200, 400, -1000); // Posición lejana
scene.add(sunMesh);

// Luz del sol (Direccional)
const sunLight = new THREE.DirectionalLight(0xffffff, 4);
sunLight.position.copy(sunMesh.position);
scene.add(sunLight);

// --- 2. LA LUNA ---
const moonGeo = new THREE.SphereGeometry(10, 32, 32);
const moonMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 1 });
const moon = new THREE.Mesh(moonGeo, moonMat);
moon.position.set(-500, 200, -1500);
scene.add(moon);

// --- 3. ILUMINACIÓN PARA EL SATÉLITE ---
// Luz de relleno para que las sombras no sean negras
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Luz de cámara suave (ayuda a ver detalles sin quemar)
const camLight = new THREE.PointLight(0xffffff, 1.5);
camera.add(camLight);
scene.add(camera);

const gltfLoader = new GLTFLoader();

// --- 4. TIERRA (Gigante y cerca) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.18, 0.18, 0.18); 
    earth.position.set(0, -185, -20); 
    scene.add(earth);
});

// --- 5. SATÉLITE (Ajuste Final de Realismo) ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 11 / size; 
    model.scale.set(scale, scale, scale);
    
    model.traverse((n) => {
        if (n.isMesh) {
            // Quitamos el blanco total
            n.material.emissiveIntensity = 0; 
            n.material.metalness = 0.6; // Metalizado moderado
            n.material.roughness = 0.3; 
            
            // Si el modelo viene muy oscuro de fábrica, lo aclaramos un poco
            if (n.material.color) {
                n.material.color.multiplyScalar(1.2); 
            }
        }
    });
    satelliteGroup.add(model);
});

// ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<30000; i++) {
    starCoords.push((Math.random()-0.5)*20000, (Math.random()-0.5)*20000, (Math.random()-0.5)*20000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2})));

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
