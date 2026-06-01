import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100000);
camera.position.set(20, 10, 30);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const satGroup = new THREE.Group();
scene.add(satGroup);

// Carga centralizada
const loader = new GLTFLoader();
loader.load('assets/Earth_1_12756.glb', (gltf) => {
    const earth = gltf.scene;
    earth.scale.set(0.5, 0.5, 0.5); // Tierra de tamaño fijo
    scene.add(earth);
});

loader.load('assets/satellite.glb', (gltf) => {
    const sat = gltf.scene;
    sat.scale.set(0.1, 0.1, 0.1); // Satélite pequeño y proporcionado
    satGroup.add(sat);
});

// Función de actualización de datos
function updateHUD() {
    const alt = document.getElementById('val-alt');
    if(alt) alt.textContent = "408 km"; 
    // Aquí irían tus cálculos de telemetría real
}

function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;
    satGroup.position.set(Math.cos(t)*8, 0, Math.sin(t)*8);
    satGroup.lookAt(0,0,0);
    updateHUD();
    controls.update();
    renderer.render(scene, camera);
}
animate();
