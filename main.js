import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 10000);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// GRUPOS PARA QUE NO SE SEPAREN
const earthGroup = new THREE.Group();
scene.add(earthGroup);

const satGroup = new THREE.Group();
scene.add(satGroup);

const loader = new GLTFLoader();

// Cargar Tierra
loader.load('assets/Earth_1_12756.glb', (gltf) => {
    const earth = gltf.scene;
    earth.scale.set(0.5, 0.5, 0.5);
    earthGroup.add(earth);
});

// Cargar Satélite
loader.load('assets/satellite.glb', (gltf) => {
    const sat = gltf.scene;
    sat.scale.set(0.5, 0.5, 0.5);
    satGroup.add(sat);
});

let angle = 0;
function animate() {
    requestAnimationFrame(animate);
    angle += 0.005;

    // Movimiento orbital correcto
    satGroup.position.set(Math.cos(angle) * 8, 0, Math.sin(angle) * 8);
    satGroup.lookAt(0, 0, 0); // Siempre apunta al centro (la Tierra)

    // Etiquetas (Sincronizadas)
    updateLabel('lbl-sat', satGroup.position);
    updateLabel('lbl-earth', new THREE.Vector3(0, 0, 0));

    controls.update();
    renderer.render(scene, camera);
}

function updateLabel(id, pos) {
    const el = document.getElementById(id);
    if (!el) return;
    let v = pos.clone().project(camera);
    el.style.left = (v.x * 0.5 + 0.5) * window.innerWidth + "px";
    el.style.top = (v.y * -0.5 + 0.5) * window.innerHeight + "px";
}

animate();
