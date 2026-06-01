import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(15, 10, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- CONFIGURACIÓN DE BRILLO EXTREMO ---
renderer.toneMapping = THREE.NoToneMapping; // Usamos luz cruda para máximo brillo
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- SISTEMA DE LUCES "ESTUDIO ESPACIAL" ---
// 1. Luz Global Blanca (Elimina cualquier sombra negra)
const ambient = new THREE.AmbientLight(0xffffff, 2.5); 
scene.add(ambient);

// 2. Luz de "Cielo" (Ilumina arriba y abajo con fuerza)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2.0);
scene.add(hemiLight);

// 3. Luces Direccionales (Como focos de cine apuntando al centro)
const sun1 = new THREE.DirectionalLight(0xffffff, 3);
sun1.position.set(50, 50, 50);
scene.add(sun1);

const sun2 = new THREE.DirectionalLight(0xffffff, 3);
sun2.position.set(-50, -50, -50);
scene.add(sun2);

// 4. Luz pegada a la Cámara (Donde mires, habrá luz)
const camLight = new THREE.PointLight(0xffffff, 4);
camera.add(camLight);
scene.add(camera);

const gltfLoader = new GLTFLoader();

// --- CARGA DE LA TIERRA ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.015, 0.015, 0.015); 
    earth.position.set(0, -100, -150); 
    scene.add(earth);
});

// --- CARGA DEL SATÉLITE CON AUTO-ILUMINACIÓN ---
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
            // FORZAMOS QUE EL MATERIAL SEA CLARO
            n.material.metalness = 0.0; // Quitamos el metal para que no refleje el "negro"
            n.material.roughness = 1.0; // Lo hacemos mate para que atrape toda la luz
            
            // TRUCO FINAL: Hacemos que el satélite brille un poquito por sí solo
            n.material.emissive = new THREE.Color(0xffffff);
            n.material.emissiveIntensity = 0.4; // Ajustá este valor si brilla demasiado
            
            // Si tiene texturas, las aclaramos
            if (n.material.map) n.material.map.colorSpace = THREE.SRGBColorSpace;
        }
    });
    
    satelliteGroup.add(model);
});

// ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<10000; i++) {
    starCoords.push((Math.random()-0.5)*15000, (Math.random()-0.5)*15000, (Math.random()-0.5)*15000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2.5})));

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
