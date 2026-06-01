import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(15, 10, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- MÁXIMA EXPOSICIÓN ---
renderer.toneMapping = THREE.LinearToneMapping; // Cambiamos a Linear para un brillo más crudo
renderer.toneMappingExposure = 3.0; // Exposición muy alta
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- SISTEMA DE ILUMINACIÓN TOTAL ---
// 1. Luz de "Cielo": Ilumina todo parejo para que nada sea negro
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
scene.add(hemiLight);

// 2. Luz de Cámara: Un foco potente que siempre apunta a lo que mirás
const camLight = new THREE.DirectionalLight(0xffffff, 3.0);
camera.add(camLight);
scene.add(camera);

const gltfLoader = new GLTFLoader();

// --- CARGA DE LA TIERRA ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.015, 0.015, 0.015); 
    earth.position.set(0, -100, -150); 
    scene.add(earth);
}, undefined, (e) => console.error(e));

// --- CARGA DEL SATÉLITE CON FORZADO DE MATERIAL ---
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 10 / size; 
    model.scale.set(scale, scale, scale);
    
    model.traverse((n) => {
        if (n.isMesh) {
            // FORZAMOS EL MATERIAL: Lo hacemos más claro y sensible a la luz
            n.material.metalness = 0.2; // Menos metal para que no refleje el "negro" del espacio
            n.material.roughness = 0.5; // Más rugoso para que la luz rebote en todas direcciones
            if (n.material.map) n.material.map.encoding = THREE.SRGBColorSpace;
            
            // ACLARAMOS EL COLOR BASE
            n.material.color.multiplyScalar(2.0); // Duplica la claridad del color original
        }
    });
    
    satelliteGroup.add(model);
});

// ESTRELLAS (Aumentamos tamaño para que se vean más)
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<10000; i++) {
    starCoords.push((Math.random()-0.5)*10000, (Math.random()-0.5)*10000, (Math.random()-0.5)*10000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 3})));

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (earth) earth.rotation.y += 0.0002;
    satelliteGroup.rotation.y += 0.002; 
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
