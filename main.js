import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- ESCENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(10, 5, 20); // Posición inicial cómoda

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- CONTROLES (ESTO PERMITE EL MOVIMIENTO) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Hace que el giro sea suave
controls.dampingFactor = 0.05;

// --- ILUMINACIÓN REALISTA ---
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(20, 20, 20);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// --- LA TIERRA MEJORADA ---
const loader = new THREE.TextureLoader();
// Intentamos cargar una textura fotorrealista
const earthTexture = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

const earthGeo = new THREE.SphereGeometry(15, 64, 64);
const earthMat = new THREE.MeshStandardMaterial({ 
    map: earthTexture,
    color: 0x2233ff, // Color de base por si la textura tarda en cargar
    roughness: 0.8
});
const earth = new THREE.Mesh(earthGeo, earthMat);
earth.position.set(0, -35, -50); 
scene.add(earth);

// --- FONDO DE ESTRELLAS ---
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<10000; i++) {
    starCoords.push((Math.random()-0.5)*5000, (Math.random()-0.5)*2000, (Math.random()-0.5)*5000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.8}));
scene.add(stars);

// --- CARGA DEL SATÉLITE ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    
    // Auto-ajuste para que se vea bien de entrada
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    const scale = 7 / size; 
    
    model.scale.set(scale, scale, scale);
    model.position.x = -center.x * scale;
    model.position.y = -center.y * scale;
    model.position.z = -center.z * scale;
    
    satelliteGroup.add(model);
}, undefined, (error) => console.error(error));

// --- BUCLE DE ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    
    // Esto es vital para que el mouse funcione
    controls.update(); 
    
    // Rotación suave de la tierra
    earth.rotation.y += 0.0005;
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
