import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(20, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping; // Mejora el contraste
renderer.toneMappingExposure = 2.5; 
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 1. EL SOL (Luz y Objeto) ---
const sunColor = 0xfff5e1;
const sunLight = new THREE.DirectionalLight(sunColor, 5);
sunLight.position.set(200, 100, 100);
scene.add(sunLight);

// Representación visual del Sol en el fondo
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: sunColor });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(1000, 500, 500);
scene.add(sunMesh);

// Luz ambiental suave para ver detalles en las sombras
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const gltfLoader = new GLTFLoader();

// --- 2. TU MODELO DE TIERRA ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.02, 0.02, 0.02); 
    earth.position.set(0, -150, -300); // Distancia ideal para escala planetaria
    scene.add(earth);
    
    earth.traverse((n) => {
        if (n.isMesh) {
            n.material.roughness = 0.8;
            n.material.metalness = 0.2;
        }
    });
});

// --- 3. EL SATÉLITE REALISTA ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 12 / size; 
    model.scale.set(scale, scale, scale);
    
    model.traverse((n) => {
        if (n.isMesh) {
            // AJUSTE PARA METAL REALISTA
            n.material.metalness = 0.9; // Alto metalizado
            n.material.roughness = 0.1; // Muy pulido para que brille con el sol
            
            // Si el material es muy oscuro, lo aclaramos
            if (n.material.color) {
                n.material.color.convertSRGBToLinear();
            }
        }
    });
    satelliteGroup.add(model);
});

// --- 4. ESPACIO PROFUNDO ---
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<15000; i++) {
    starCoords.push((Math.random()-0.5)*30000, (Math.random()-0.5)*30000, (Math.random()-0.5)*30000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: true });
scene.add(new THREE.Points(starGeo, starMat));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (earth) earth.rotation.y += 0.0001; // Rotación terrestre muy lenta
    satelliteGroup.rotation.y += 0.001; 
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
