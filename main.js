import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(20, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// LUCES
const sun = new THREE.DirectionalLight(0xffffff, 3.5);
sun.position.set(100, 50, 100);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const gltfLoader = new GLTFLoader();

// --- 1. CARGA DE TU NUEVA TIERRA (Earth_1_12756.glb) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    
    // Ajustamos el tamaño para que se vea como un planeta de fondo
    earth.scale.set(0.05, 0.05, 0.05); 
    earth.position.set(0, -50, -100); // La alejamos del satélite
    
    scene.add(earth);
}, undefined, (error) => console.error("Error cargando la Tierra:", error));

// --- 2. CARGA DEL SATÉLITE ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 8 / size;
    model.scale.set(scale, scale, scale);

    model.traverse((n) => {
        if (n.isMesh) {
            n.material.metalness = 1.0;
            n.material.roughness = 0.1;
        }
    });
    satelliteGroup.add(model);
});

// ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<15000; i++) {
    starCoords.push((Math.random()-0.5)*10000, (Math.random()-0.5)*10000, (Math.random()-0.5)*10000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 1.5})));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (earth) earth.rotation.y += 0.0005; // Rotación lenta de tu modelo
    satelliteGroup.rotation.y += 0.001; 
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
