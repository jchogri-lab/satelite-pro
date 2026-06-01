import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURACIÓN ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100000);
camera.position.set(12, 5, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// --- GRUPOS PARA SINCRONIZACIÓN ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

// --- CARGA DE MODELOS (Carga asíncrona fuera del loop) ---
const loader = new GLTFLoader();
loader.load('assets/Earth_1_12756.glb', (gltf) => {
    const earth = gltf.scene;
    earth.scale.set(0.22, 0.22, 0.22);
    earth.position.set(0, -225, -20);
    scene.add(earth);
});

loader.load('assets/satellite.glb', (gltf) => {
    satelliteGroup.add(gltf.scene);
});

// --- ETIQUETAS (DOM) ---
const lblSat = document.getElementById('lbl-sat');

function updateUI() {
    // Posición mundial exacta
    const vector = new THREE.Vector3();
    satelliteGroup.getWorldPosition(vector);
    
    // Proyección a pantalla
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    
    if (vector.z > 1) {
        lblSat.style.display = 'none';
    } else {
        lblSat.style.display = 'block';
        lblSat.style.transform = `translate(${x}px, ${y}px)`;
    }
}

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    
    // Movimiento orbital basado en tiempo real
    const time = Date.now() * 0.0005;
    satelliteGroup.position.set(Math.cos(time) * 42, 0, Math.sin(time) * 42);
    
    controls.update();
    updateUI(); // Se actualiza justo antes del render
    renderer.render(scene, camera);
}
animate();
