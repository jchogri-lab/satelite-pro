import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(8, 4, 12); // Cámara muy cerca del satélite

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ILUMINACIÓN CINEMATOGRÁFICA ---
const sun = new THREE.DirectionalLight(0xffffff, 4);
sun.position.set(100, 20, 100);
scene.add(sun);

// Luz de atmósfera (el brillo azul que la Tierra refleja en el satélite)
const earthAlbedo = new THREE.PointLight(0x4488ff, 3, 100);
earthAlbedo.position.set(0, -20, 0);
scene.add(earthAlbedo);

scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const gltfLoader = new GLTFLoader();

// --- 1. TIERRA EN ÓRBITA BAJA ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.15, 0.15, 0.15); // Escala masiva
    earth.position.set(0, -165, -10); // Muy cerca del satélite hacia abajo
    earth.rotation.z = 0.4;
    scene.add(earth);
    
    earth.traverse((n) => {
        if (n.isMesh) {
            n.material.roughness = 1;
            n.material.metalness = 0;
        }
    });
});

// --- 2. SENSACIÓN DE ESPACIO (Otros Planetas) ---
function createBackgroundPlanet(color, size, pos) {
    const geo = new THREE.SphereGeometry(size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 1 });
    const planet = new THREE.Mesh(geo, mat);
    planet.position.copy(pos);
    scene.add(planet);
}
// Marte a lo lejos
createBackgroundPlanet(0xff4400, 50, new THREE.Vector3(-1000, 200, -2000));
// Un planeta gigante gaseoso lejano
createBackgroundPlanet(0xffddaa, 120, new THREE.Vector3(2000, -500, -5000));

// --- 3. SATÉLITE REALISTA (Ajuste de Materiales) ---
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
            // Buscamos que el metal parezca real
            n.material.metalness = 1.0; 
            n.material.roughness = 0.1;
            
            // Si es parte del cuerpo, le damos un tono dorado NASA
            if(n.name.toLowerCase().includes('body') || n.name.toLowerCase().includes('core')) {
                n.material.color.setHex(0xffcc44);
            }
            // Si son paneles, azul profundo
            if(n.name.toLowerCase().includes('panel')) {
                n.material.color.setHex(0x111133);
                n.material.roughness = 0.05;
            }
        }
    });
    satelliteGroup.add(model);
});

// --- 4. ESTRELLAS Y NEBULOSAS ---
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<30000; i++) {
    starCoords.push((Math.random()-0.5)*20000, (Math.random()-0.5)*20000, (Math.random()-0.5)*20000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2, sizeAttenuation: true})));

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (earth) earth.rotation.y += 0.00005;
    satelliteGroup.rotation.y += 0.0003; 
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
