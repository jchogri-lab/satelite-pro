import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
// Cámara más cerca del satélite para detalle
camera.position.set(10, 6, 15); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- LUCES MEJORADAS ---
// Sol principal
const sun = new THREE.DirectionalLight(0xffffff, 5);
sun.position.set(50, 20, 50);
scene.add(sun);

// Luz de rebote azul (desde la Tierra)
const earthGlow = new THREE.DirectionalLight(0x4488ff, 2.5);
earthGlow.position.set(0, -50, 0);
scene.add(earthGlow);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const gltfLoader = new GLTFLoader();

// --- 1. TIERRA (Ajuste de distancia y tamaño) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    // La hacemos MUCHO más grande
    earth.scale.set(0.08, 0.08, 0.08); 
    // La subimos para que esté justo "debajo" del satélite
    earth.position.set(0, -85, -20); 
    scene.add(earth);
    
    earth.traverse((n) => {
        if (n.isMesh) {
            n.material.roughness = 0.9;
            n.material.metalness = 0.1;
        }
    });
});

// --- 2. SATÉLITE (Mejora de materiales reales) ---
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
            // Si el nombre del objeto incluye "panel", le damos color azul solar
            if (n.name.toLowerCase().includes('panel') || n.name.toLowerCase().includes('solar')) {
                n.material.color.setHex(0x001133); 
                n.material.metalness = 1.0;
                n.material.roughness = 0.1;
            } else {
                // El resto del cuerpo con brillo metálico (oro/plata)
                n.material.metalness = 0.9;
                n.material.roughness = 0.2;
            }
            if (n.material.color) n.material.color.multiplyScalar(1.4);
        }
    });
    satelliteGroup.add(model);
});

// --- 3. ESTRELLAS ---
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
