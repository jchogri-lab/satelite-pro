import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURACIÓN BÁSICA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(15, 10, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// --- CONTROLES DE MOUSE ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suaviza el movimiento
controls.autoRotate = false;   // Dejamos que el usuario lo maneje

// --- ILUMINACIÓN ---
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(50, 50, 50);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// --- TIERRA REALISTA ---
const texLoader = new THREE.TextureLoader();
const earthGeo = new THREE.SphereGeometry(15, 64, 64);
const earthMat = new THREE.MeshStandardMaterial({
    // Textura de alta resolución (Blue Marble)
    map: texLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    bumpMap: texLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
    bumpScale: 0.15,
});

const earth = new THREE.Mesh(earthGeo, earthMat);
earth.position.set(0, -40, -60);
scene.add(earth);

// --- ESTRELLAS ---
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<12000; i++) {
    starCoords.push((Math.random()-0.5)*10000, (Math.random()-0.5)*10000, (Math.random()-0.5)*10000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 1.5})));

// --- CARGA DEL SATÉLITE ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    
    const scale = 8 / size; // Ajuste de tamaño
    model.scale.set(scale, scale, scale);
    model.position.x = -center.x * scale;
    model.position.y = -center.y * scale;
    model.position.z = -center.z * scale;
    
    satelliteGroup.add(model);
});

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    
    controls.update(); // Necesario para el movimiento del mouse
    
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
