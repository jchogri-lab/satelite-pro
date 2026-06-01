import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. ESCENA Y RENDERER PROFESIONAL
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000105); // Negro espacial

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping; // Evita que se vea todo blanco
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// 2. LUCES AJUSTADAS (Para que no se vea blanco liso)
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(20, 20, 20);
scene.add(sun);

const earthLight = new THREE.AmbientLight(0x4455ff, 0.4); // Reflejo azul de la tierra
scene.add(earthLight);

// 3. ESTRELLAS DE FONDO
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<8000; i++) {
    starCoords.push((Math.random()-0.5)*1000, (Math.random()-0.5)*1000, (Math.random()-0.5)*1000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.5}));
scene.add(stars);

// 4. LA TIERRA DE FONDO
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(40, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0x0a1a3a, roughness: 0.8 })
);
earth.position.set(0, -60, -50);
scene.add(earth);

// 5. CARGA DEL SATÉLITE NASA
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

const loader = new GLTFLoader();
loader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    
    // Auto-ajuste de materiales para que brillen bien
    model.traverse((node) => {
        if (node.isMesh) {
            node.material.metalness = 0.7;
            node.material.roughness = 0.3;
        }
    });
    
    satelliteGroup.add(model);
}, undefined, (error) => {
    console.error("Error:", error);
    // Cubo de emergencia más pequeño por si falla el archivo
    const box = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshStandardMaterial({color: 0xffaa00}));
    satelliteGroup.add(box);
});

// 6. POSICIÓN DE CÁMARA INICIAL (Más lejos para ver todo)
camera.position.set(10, 5, 25);
camera.lookAt(0, 0, 0);

// 7. ANIMACIÓN
function animate() {
    requestAnimationFrame(animate);
    
    satelliteGroup.rotation.y += 0.003;
    satelliteGroup.rotation.z += 0.001;
    earth.rotation.y += 0.0002;
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
