import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000105); 

// 1. CÁMARA MUCHO MÁS ALEJADA (Para no chocar con el modelo)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(30, 15, 50); // Posición inicial lejana

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// 2. LUCES POTENTES
const sun = new THREE.DirectionalLight(0xffffff, 3.5);
sun.position.set(50, 50, 50);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x404040, 0.6));

// 3. TIERRA EN EL FONDO (Ubicada lejos para que no moleste)
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(15, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0x103070, roughness: 0.8 })
);
earth.position.set(0, -40, -60); // Bien abajo y al fondo
scene.add(earth);

// 4. ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<10000; i++) {
    starCoords.push((Math.random()-0.5)*10000, (Math.random()-0.5)*10000, (Math.random()-0.5)*10000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2})));

// 5. CARGA DEL SATÉLITE CON AUTO-ESCALADO
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    
    // ESTO CORRIGE EL TAMAÑO: Achica el modelo para que no ocupe toda la pantalla
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    
    const scale = 10 / size; // Forzamos un tamaño manejable
    model.scale.set(scale, scale, scale);
    model.position.x = -center.x * scale;
    model.position.y = -center.y * scale;
    model.position.z = -center.z * scale;
    
    satelliteGroup.add(model);
    console.log("Satélite escalado y centrado");
}, undefined, (error) => {
    console.error("Error cargando .glb", error);
    // Cubo de emergencia por si el archivo no está
    const box = new THREE.Mesh(new THREE.BoxGeometry(5,5,5), new THREE.MeshStandardMaterial({color: 0xffcc00}));
    satelliteGroup.add(box);
});

// 6. ANIMACIÓN Y CONTROLES
function animate() {
    requestAnimationFrame(animate);
    satelliteGroup.rotation.y += 0.003; // Rotación lenta
    earth.rotation.y += 0.0002;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
