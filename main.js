import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
// Cambiamos el fondo a un gris oscuro momentáneo para saber si carga
scene.background = new THREE.Color(0x050505); 

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// LUZ
const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(5, 5, 5);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// TIERRA PROVISIONAL (Si falla la textura, se verá azul)
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(20, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0x112244 })
);
earth.position.set(0, -40, -25);
scene.add(earth);

// CARGA DEL SATÉLITE
const satellite = new THREE.Group();
scene.add(satellite);

const gltfLoader = new GLTFLoader();
// RUTA CORREGIDA PARA GITHUB
gltfLoader.load('assets/satellite.glb', 
    (gltf) => {
        satellite.add(gltf.scene);
        console.log("Cargado!");
    },
    undefined,
    (error) => {
        console.error(error);
        // CUBO DE EMERGENCIA: Si ves este cubo, el código está bien pero el archivo .glb no se encuentra
        const box = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshStandardMaterial({color: 0xffcc00}));
        satellite.add(box);
    }
);

camera.position.z = 15;

function animate() {
    requestAnimationFrame(animate);
    satellite.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
