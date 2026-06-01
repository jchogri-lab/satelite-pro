import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- ESCENA Y CONFIGURACIÓN ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(15, 10, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Colores de cine
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ILUMINACIÓN DINÁMICA ---
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(50, 20, 50);
scene.add(sun);

const blueGlow = new THREE.AmbientLight(0x3344ff, 0.4); // Reflejo azul de la Tierra
scene.add(blueGlow);

// --- TIERRA FOTORREALISTA ---
const loader = new THREE.TextureLoader();
const earthGroup = new THREE.Group();
scene.add(earthGroup);

// Material con relieve y brillo en el agua
const earthMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    bumpMap: loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
    bumpScale: 0.5,
    metalness: 0.1,
    roughness: 0.7
});

const earth = new THREE.Mesh(new THREE.SphereGeometry(15, 128, 128), earthMat);
earthGroup.add(earth);

// CAPA DE NUBES (Para que se muevan lento por encima)
const cloudMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png'),
    transparent: true,
    opacity: 0.5
});
const clouds = new THREE.Mesh(new THREE.SphereGeometry(15.3, 128, 128), cloudMat);
earthGroup.add(clouds);

earthGroup.position.set(0, -30, -40);
earthGroup.rotation.z = 0.4; // Inclinación real de la Tierra

// --- SATÉLITE CON ACABADO METÁLICO ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

new GLTFLoader().load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    
    // Auto-escalado
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 8 / size;
    model.scale.set(scale, scale, scale);

    // MEJORA DE MATERIALES: Forzamos el metal real
    model.traverse((n) => {
        if (n.isMesh) {
            n.material.metalness = 0.9;
            n.material.roughness = 0.1;
            n.material.envMapIntensity = 1;
        }
    });
    
    satelliteGroup.add(model);
});

// --- ESTRELLAS ---
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<20000; i++) {
    starCoords.push((Math.random()-0.5)*8000, (Math.random()-0.5)*8000, (Math.random()-0.5)*8000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 1.2}));
scene.add(stars);

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    earth.rotation.y += 0.0004;
    clouds.rotation.y += 0.0006; // Las nubes giran más rápido que el suelo
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
