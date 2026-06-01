import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- CONFIGURACIÓN DEL RENDERIZADOR ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
document.body.appendChild(renderer.domElement);

// --- ILUMINACIÓN CINEMATOGRÁFICA ---
const sun = new THREE.DirectionalLight(0xffffff, 4.0);
sun.position.set(100, 50, 100);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x101020, 0.3));

// --- LA TIERRA (MATERIALES DE ALTA CALIDAD) ---
const loader = new THREE.TextureLoader();
const earthGroup = new THREE.Group();

// Si tienes texturas 4K locales, cambia las URLs aquí
const earthMat = new THREE.MeshStandardMaterial({
    map: loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
    bumpMap: loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
    bumpScale: 0.5,
    metalness: 0.1,
    roughness: 0.8
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(20, 128, 128), earthMat);
earthGroup.add(earth);

// Shader de Atmósfera (Fresnel)
const atmoMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    uniforms: { sunDir: { value: sun.position.clone().normalize() } },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 sunDir;
        void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
            float dotSun = max(0.0, dot(vNormal, sunDir));
            gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * (dotSun + 0.2));
        }
    `
});
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(20.6, 128, 128), atmoMat);
earthGroup.add(atmosphere);
earthGroup.position.set(0, -40, -25);
scene.add(earthGroup);

// --- CARGA DEL SATÉLITE (MODELO DE INGENIERÍA) ---
const satellite = new THREE.Group();
const gltfLoader = new GLTFLoader();

// NOTA: Para realismo total, descarga un .glb de la NASA y llámalo 'satellite.glb'
// Aquí usamos un placeholder detallado por código mientras tanto
const mliMat = new THREE.MeshStandardMaterial({ 
    color: 0xffcc33, metalness: 0.9, roughness: 0.4 
});

gltfLoader.load('./assets/satellite.glb, (gltf) => {
    satellite.add(gltf.scene);
}, undefined, (err) => {
    // Si no hay modelo externo, creamos la estructura base pro
    console.warn("Cargando estructura pro por defecto...");
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 2.5, 8), mliMat);
    satellite.add(core);
});
scene.add(satellite);

// --- ESTRELLAS ---
const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(
        Array.from({length: 15000}, () => (Math.random()-0.5)*4000), 3
    )),
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 })
);
scene.add(stars);

// --- CÁMARA Y CONTROL ---
let mode = 0;
const modes = [
    { pos: [15, 6, 15], look: satellite.position },
    { pos: [4, 1, 4], look: satellite.position },
    { pos: [2, 0.5, 2], look: satellite.position },
    { pos: [0, 10, 35], look: earth.position }
];

document.querySelectorAll('.btn').forEach(btn => {
    btn.onclick = () => {
        mode = parseInt(btn.dataset.mode);
        document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    };
});

function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.0005;

    satellite.rotation.y += 0.002;
    earth.rotation.y += 0.0005;

    const m = modes[mode];
    const tx = Math.cos(t * 0.2) * m.pos[0];
    const tz = Math.sin(t * 0.2) * m.pos[2];
    camera.position.lerp(new THREE.Vector3(tx, m.pos[1], tz), 0.05);
    camera.lookAt(m.look);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();