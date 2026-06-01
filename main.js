import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURACIÓN DE ESCENA ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(15, 12, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Look cinematográfico
renderer.toneMappingExposure = 1.5; 
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ILUMINACIÓN PROFESIONAL ---
// 1. EL SOL (Luz dura y blanca)
const sun = new THREE.DirectionalLight(0xffffff, 4);
sun.position.set(100, 50, 100);
scene.add(sun);

// 2. LUZ DE REBOTE (Azulada, como si la Tierra reflejara luz)
const earthReflect = new THREE.DirectionalLight(0x4488ff, 1.5);
earthReflect.position.set(-50, -50, -50);
scene.add(earthReflect);

// 3. LUZ AMBIENTAL (Para que las sombras no sean negras carbón)
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const gltfLoader = new GLTFLoader();

// --- CARGA DE LA TIERRA (Tu modelo GLB) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.018, 0.018, 0.018); 
    earth.position.set(0, -130, -250); // Distancia para que se vea la curvatura
    scene.add(earth);
    
    earth.traverse((n) => {
        if (n.isMesh) {
            n.material.roughness = 0.7;
            n.material.metalness = 0.1;
        }
    });
});

// --- CARGA DEL SATÉLITE (Efecto Metal Real) ---
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
            // Esto hace que el satélite brille como metal de verdad
            n.material.metalness = 0.8; 
            n.material.roughness = 0.2; 
            // Si el material es muy oscuro, le damos un empujón de brillo
            if (n.material.color) {
                n.material.color.multiplyScalar(1.5); 
            }
        }
    });
    satelliteGroup.add(model);
});

// --- ESPACIO (Estrellas más reales) ---
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<20000; i++) {
    starCoords.push((Math.random()-0.5)*40000, (Math.random()-0.5)*40000, (Math.random()-0.5)*40000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2})));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (earth) earth.rotation.y += 0.0001;
    satelliteGroup.rotation.y += 0.001; 
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
