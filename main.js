import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURACIÓN DEL RENDERIZADOR ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(12, 5, 20); // Vista cercana para detalle

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4; // Balance perfecto entre brillo y detalle
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ELEMENTOS DEL SISTEMA SOLAR ---

// 1. EL SOL (Visible como estrella masiva)
const sunGroup = new THREE.Group();
const sunGeo = new THREE.SphereGeometry(50, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunGroup.add(sunMesh);
sunGroup.position.set(1200, 400, -800);
scene.add(sunGroup);

const sunLight = new THREE.DirectionalLight(0xffffff, 4.5);
sunLight.position.copy(sunGroup.position);
scene.add(sunLight);

// 2. LA LUNA
const moonGeo = new THREE.SphereGeometry(15, 32, 32);
const moonMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc,
    emissive: 0x222222 
});
const moon = new THREE.Mesh(moonGeo, moonMat);
moon.position.set(-800, 200, -1500);
scene.add(moon);

// 3. ILUMINACIÓN AMBIENTAL Y DE ALBEDO (Reflejo de la Tierra)
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const earthAlbedo = new THREE.DirectionalLight(0x4488ff, 2);
earthAlbedo.position.set(0, -50, 0); // Luz azul que sube desde el planeta
scene.add(earthAlbedo);

// Luz de relleno que sigue a la cámara (Luz de "Cámara")
const camLight = new THREE.PointLight(0xffffff, 1.2);
camera.add(camLight);
scene.add(camera);

const gltfLoader = new GLTFLoader();

// --- MODELO: TIERRA CON ATMÓSFERA ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.22, 0.22, 0.22); // Inmensa para realismo de órbita baja
    earth.position.set(0, -225, -20);
    scene.add(earth);

    // Efecto de atmósfera didáctico
    const atmoGeo = new THREE.SphereGeometry(1.03, 64, 64);
    const atmoMat = new THREE.MeshLambertMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earth.add(atmoMesh);
});

// --- MODELO: SATÉLITE (Ajuste Fotorrealista) ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    model.scale.set(11/size, 11/size, 11/size);
    
    model.traverse((n) => {
        if (n.isMesh) {
            // Material físico realista
            n.material.metalness = 0.8;
            n.material.roughness = 0.2;
            
            // Si el objeto se llama panel, le damos color azul oscuro solar
            if (n.name.toLowerCase().includes('panel')) {
                n.material.color.setHex(0x000033);
                n.material.emissive = new THREE.Color(0x000011);
            } else {
                // Aclara el resto de materiales para evitar el negro total
                if (n.material.color) n.material.color.multiplyScalar(1.4);
            }
        }
    });
    satelliteGroup.add(model);
});

// --- FONDO DE ESTRELLAS ---
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<30000; i++) {
    starCoords.push(
        (Math.random()-0.5)*20000, 
        (Math.random()-0.5)*20000, 
        (Math.random()-0.5)*20000
    );
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 2.5, sizeAttenuation: true});
scene.add(new THREE.Points(starGeo, starMat));

// --- BUCLE DE ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (earth) earth.rotation.y += 0.0001;
    satelliteGroup.rotation.y += 0.0004; // Rotación suave para ver detalles técnicos
    
    renderer.render(scene, camera);
}
animate();

// --- AJUSTE DE VENTANA ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
