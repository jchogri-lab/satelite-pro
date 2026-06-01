import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(10, 5, 15); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.0; // Exposición alta para resaltar detalles
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- SISTEMA DE ILUMINACIÓN PRO ---
// 1. EL SOL: Luz direccional muy fuerte desde un costado
const sun = new THREE.DirectionalLight(0xffffff, 6);
sun.position.set(100, 40, 100);
scene.add(sun);

// 2. LUZ DE CÁMARA: Para que nunca pierdas el detalle frontal
const camLight = new THREE.PointLight(0xffffff, 3);
camera.add(camLight);
scene.add(camera);

// 3. LUZ DE REBOTE DE LA TIERRA: Luz azulada desde abajo
const earthLight = new THREE.PointLight(0x4488ff, 5, 200);
earthLight.position.set(0, -30, 0);
scene.add(earthLight);

// 4. LUZ DE RELLENO ESPACIAL: Para evitar negros absolutos
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const gltfLoader = new GLTFLoader();

// --- CARGA DE LA TIERRA (Órbitando cerca) ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.12, 0.12, 0.12); 
    earth.position.set(0, -135, -20); 
    scene.add(earth);
});

// --- CARGA DEL SATÉLITE (Realismo Extremo) ---
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
            // FORZADO DE MATERIAL METÁLICO
            n.material.metalness = 0.7; // Un poco menos de 1 para que no sea un espejo negro
            n.material.roughness = 0.2; // Pulido
            
            // ACLARAMOS EL COLOR BASE PARA QUE SE VEA SIEMPRE
            if (n.material.color) {
                n.material.color.multiplyScalar(1.8);
            }
            
            // EFECTO DE LUZ PROPIA SUAVE (Para que no se apague nunca)
            n.material.emissive = new THREE.Color(0xffffff);
            n.material.emissiveIntensity = 0.1;
        }
    });
    satelliteGroup.add(model);
});

// --- DECORACIÓN ESPACIAL ---
function addPlanet(color, size, x, y, z) {
    const p = new THREE.Mesh(
        new THREE.SphereGeometry(size, 32, 32),
        new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.2 })
    );
    p.position.set(x, y, z);
    scene.add(p);
}
addPlanet(0xffaa55, 30, -800, 200, -1500); // Marte lejano
addPlanet(0xaaaaaa, 15, 400, 100, -1000);  // Luna/Planeta lejano

// ESTRELLAS
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
