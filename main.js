import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); // Negro espacial profundo

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Color de cine
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// ILUMINACIÓN DE ALTO CONTRASTE (Como en el vacío)
const sun = new THREE.DirectionalLight(0xffffff, 4.0);
sun.position.set(10, 10, 10);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x404040, 0.5)); // Luz de rebote

// ESTRELLAS (Para dar profundidad)
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<10000; i++) {
    starCoords.push((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.7})));

// TIERRA (Con atmósfera Fresnel)
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(20, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0x153975, roughness: 0.7 })
);
earth.position.set(0, -35, -20);
scene.add(earth);

// CARGA DEL MODELO REAL
const satellite = new THREE.Group();
scene.add(satellite);

const gltfLoader = new GLTFLoader();
// IMPORTANTE: Asegúrate que en GitHub el archivo se llame satellite.glb (todo minúsculas)
gltfLoader.load('assets/satellite.glb', 
    (gltf) => {
        const model = gltf.scene;
        // Hacer que los materiales brillen como metal real
        model.traverse((node) => {
            if (node.isMesh) {
                node.material.envMapIntensity = 1.5;
                node.castShadow = true;
            }
        });
        satellite.add(model);
    },
    undefined,
    (err) => {
        console.error("No se encontró el .glb, mostrando cubo");
        const cube = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshStandardMaterial({color: 0xffcc00, metalness: 1}));
        satellite.add(cube);
    }
);

camera.position.set(8, 4, 12);
camera.lookAt(0,0,0);

function animate() {
    requestAnimationFrame(animate);
    satellite.rotation.y += 0.005;
    satellite.rotation.x += 0.001; // Un balanceo suave
    earth.rotation.y += 0.0005;
    renderer.render(scene, camera);
}
animate();
