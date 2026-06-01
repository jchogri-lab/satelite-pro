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
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 4);
sun.position.set(500, 200, 500);
scene.add(sun);

// Cargar Tierra y Satélite
const loader = new GLTFLoader();
let earth, satGroup = new THREE.Group();
scene.add(satGroup);

loader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.2, 0.2, 0.2);
    earth.position.set(0, -210, 0);
    scene.add(earth);
});

loader.load('assets/satellite.glb', (gltf) => {
    satGroup.add(gltf.scene);
});

let angle = 0;
function animate() {
    requestAnimationFrame(animate);
    angle += 0.003;
    satGroup.position.set(Math.cos(angle)*48, 0, Math.sin(angle)*48);
    satGroup.lookAt(0, -210, 0);
    
    // Actualizar etiquetas
    updateLabel('lbl-sat', satGroup.position);
    updateLabel('lbl-earth', new THREE.Vector3(0, -200, 0));
    
    renderer.render(scene, camera);
}

function updateLabel(id, pos) {
    const el = document.getElementById(id);
    let v = pos.clone().project(camera);
    el.style.left = (v.x * 0.5 + 0.5) * window.innerWidth + "px";
    el.style.top = (v.y * -0.5 + 0.5) * window.innerHeight + "px";
}

animate();
