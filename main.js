import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(10, 6, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.2; // Exposición alta como en tus fotos
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- LUCES DE REFERENCIA (Inspiradas en tus imágenes) ---
// 1. EL SOL: Luz blanca muy potente
const sun = new THREE.DirectionalLight(0xffffff, 6);
sun.position.set(100, 30, 100);
scene.add(sun);

// 2. RESPLANDOR DE LA TIERRA: Luz azul desde abajo que baña el satélite
const earthAlbedo = new THREE.DirectionalLight(0x4488ff, 3);
earthAlbedo.position.set(0, -50, 0);
scene.add(earthAlbedo);

// 3. LUZ DE RELLENO: Para que no haya sombras negras
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const gltfLoader = new GLTFLoader();

// --- 1. LA TIERRA (Gigante y cerca, como en tus fotos) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.18, 0.18, 0.18); // Escala masiva
    earth.position.set(0, -185, -20); // El satélite vuela sobre el horizonte
    scene.add(earth);
});

// --- 2. EL SATÉLITE (Ajuste de Materiales "Gold Foil") ---
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
            // Si es metal/cuerpo, le damos el tono dorado de las fotos
            if(n.name.toLowerCase().includes('body') || n.name.toLowerCase().includes('shield')) {
                n.material.color.setHex(0xffcc44); // Oro NASA
            }
            
            n.material.metalness = 0.9; 
            n.material.roughness = 0.2; 
            
            // Forzamos un brillo base para que siempre sea visible
            n.material.emissive = n.material.color;
            n.material.emissiveIntensity = 0.15;
        }
    });
    satelliteGroup.add(model);
});

// --- 3. FONDO: ESTRELLAS Y SOL VISIBLE ---
// Creamos un Sol visual que se vea a lo lejos
const sunGeo = new THREE.SphereGeometry(20, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const sunVisual = new THREE.Mesh(sunGeo, sunMat);
sunVisual.position.set(1000, 300, 1000);
scene.add(sunVisual);

// Estrellas
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<25000; i++) {
    starCoords.push((Math.random()-0.5)*15000, (Math.random()-0.5)*15000, (Math.random()-0.5)*15000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2.5})));

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
