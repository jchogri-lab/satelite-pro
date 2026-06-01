import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(12, 8, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Mejora los colores
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ILUMINACIÓN CINEMATOGRÁFICA ---
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(20, 20, 20);
scene.add(sunLight);

const ambient = new THREE.AmbientLight(0x4040ff, 0.3); // Reflejo azul del espacio
scene.add(ambient);

// --- TIERRA CON TEXTURAS DE ALTA RESOLUCIÓN ---
const loader = new THREE.TextureLoader();
const earthGroup = new THREE.Group();
scene.add(earthGroup);

const earthMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    bumpMap: loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
    bumpScale: 0.2,
    metalness: 0.1,
    roughness: 0.8
});

const earth = new THREE.Mesh(new THREE.SphereGeometry(15, 64, 64), earthMat);
earthGroup.add(earth);

// Nubes (una capa extra sobre la tierra)
const cloudMat = new THREE.MeshLambertMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png'),
    transparent: true,
    opacity: 0.4
});
const clouds = new THREE.Mesh(new THREE.SphereGeometry(15.2, 64, 64), cloudMat);
earthGroup.add(clouds);

earthGroup.position.set(0, -35, -50);

// --- SATÉLITE CON MEJORA DE GRÁFICOS ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

new GLTFLoader().load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    
    // Ajuste de escala y centrado
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 8 / size;
    model.scale.set(scale, scale, scale);

    // Hacer que el metal del satélite sea real
    model.traverse((node) => {
        if (node.isMesh) {
            node.material.metalness = 1.0;
            node.material.roughness = 0.2;
            node.castShadow = true;
        }
    });
    
    satelliteGroup.add(model);
});

// FONDO DE ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<15000; i++) {
    starCoords.push((Math.random()-0.5)*5000, (Math.random()-0.5)*5000, (Math.random()-0.5)*5000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 1.5})));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    earth.rotation.y += 0.0005;
    clouds.rotation.y += 0.0007; // Las nubes se mueven a otra velocidad
    
    renderer.render(scene, camera);
}
animate();
