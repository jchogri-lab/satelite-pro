import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(10, 5, 18); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5; // Exposición muy alta para sacar el satélite de la oscuridad
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ILUMINACIÓN "SIEMPRE VISIBLE" ---
// 1. EL SOL (Luz principal)
const sun = new THREE.DirectionalLight(0xffffff, 5);
sun.position.set(100, 50, 100);
scene.add(sun);

// 2. LUZ FRONTAL (Pegada a la cámara)
// Esto garantiza que el lado que vos estás mirando NUNCA esté oscuro
const camLight = new THREE.PointLight(0xffffff, 4);
camera.add(camLight);
scene.add(camera);

// 3. LUZ AMBIENTAL FUERTE
// Esto baña toda la escena para eliminar los negros profundos
const ambient = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambient);

const gltfLoader = new GLTFLoader();

// --- TIERRA (Gigante y cerca) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.15, 0.15, 0.15); 
    earth.position.set(0, -160, -30); 
    scene.add(earth);
});

// --- SATÉLITE (Ajuste de Brillo Material) ---
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
            // Bajamos metalness para que no sea un espejo (que refleja el negro del espacio)
            n.material.metalness = 0.3; 
            n.material.roughness = 0.4; 
            
            // Forzamos un color más claro (blanco/oro)
            if (n.material.color) {
                n.material.color.multiplyScalar(2.0); 
            }
            
            // Agregamos una pequeña emisión para que el satélite "brille" un poco solo
            n.material.emissive = new THREE.Color(0xffffff);
            n.material.emissiveIntensity = 0.1;
        }
    });
    satelliteGroup.add(model);
});

// ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<20000; i++) {
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
