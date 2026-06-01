import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(15, 10, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.toneMappingExposure = 1.8; // Exposición alta pero controlada
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ILUMINACIÓN EQUILIBRADA ---
// Luz ambiental para que las sombras no sean negras
scene.add(new THREE.AmbientLight(0xffffff, 1.5)); 

// Luz blanca desde arriba
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(10, 20, 10);
scene.add(sun);

// Luz de cámara (para que el frente siempre tenga luz)
const camLight = new THREE.PointLight(0xffffff, 2);
camera.add(camLight);
scene.add(camera);

const gltfLoader = new GLTFLoader();

// --- CARGA DE LA TIERRA ---
let earth;
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.015, 0.015, 0.015); 
    earth.position.set(0, -120, -180); 
    scene.add(earth);
});

// --- CARGA DEL SATÉLITE (AJUSTE DE TEXTURAS) ---
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
            // REDUCIMOS EL BLANCO: Bajamos la emisión
            n.material.emissive = new THREE.Color(0xffffff);
            n.material.emissiveIntensity = 0.15; // Ya no es una lámpara, solo un refuerzo
            
            // DEVOLVEMOS EL METAL PERO SIN QUE OSCUREZCA
            n.material.metalness = 0.3; // Un poco de brillo metálico
            n.material.roughness = 0.5; // Que la luz se disperse bien
            
            // Si el modelo tiene colores, esto los resalta
            if(n.material.map) n.material.map.colorSpace = THREE.SRGBColorSpace;
        }
    });
    
    satelliteGroup.add(model);
});

// ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<10000; i++) {
    starCoords.push((Math.random()-0.5)*20000, (Math.random()-0.5)*20000, (Math.random()-0.5)*20000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2.5})));

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
