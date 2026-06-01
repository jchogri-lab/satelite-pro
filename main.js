import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000); // Aumentamos el rango de visión
camera.position.set(0, 20, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// LUZ SOLAR POTENTE
const sun = new THREE.DirectionalLight(0xffffff, 4);
sun.position.set(100, 100, 100);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const gltfLoader = new GLTFLoader();

// --- 1. CARGA DE LA TIERRA (Ajustando la escala) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    
    // El modelo original es enorme, lo achicamos drásticamente
    earth.scale.set(0.015, 0.015, 0.015); 
    
    // La bajamos y alejamos para que el satélite sea el protagonista
    earth.position.set(0, -100, -150); 
    
    scene.add(earth);
    console.log("Tierra cargada con éxito");
}, undefined, (e) => console.error("Error en Tierra:", e));

// --- 2. CARGA DEL SATÉLITE ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    
    // Centrar y escalar satélite
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 10 / size; 
    model.scale.set(scale, scale, scale);
    
    // Materiales metálicos
    model.traverse((n) => {
        if (n.isMesh) {
            n.material.metalness = 1;
            n.material.roughness = 0.2;
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
    
    if (earth) {
        earth.rotation.y += 0.0002; // Rotación terrestre muy lenta
    }
    
    // El satélite gira sobre su eje
    satelliteGroup.rotation.y += 0.002; 
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
