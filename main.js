import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. ESCENA Y RENDER (Fondo negro profundo)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000205);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// 2. LUCES (Una principal fuerte y una azulada desde abajo)
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(50, 50, 50);
scene.add(sun);

const earthGlow = new THREE.AmbientLight(0x4488ff, 0.5);
scene.add(earthGlow);

// 3. ESTRELLAS LEJANAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<15000; i++) {
    starCoords.push((Math.random()-0.5)*5000, (Math.random()-0.5)*5000, (Math.random()-0.5)*5000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 1})));

// 4. LA TIERRA (Más pequeña y más lejos)
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(15, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0x102040, roughness: 0.9 })
);
earth.position.set(0, -30, -40); // La mandamos abajo y al fondo
scene.add(earth);

// 5. CARGA Y AUTO-ESCALADO DEL SATÉLITE
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

const loader = new GLTFLoader();
loader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    
    // ESTO ES CLAVE: Ajusta el modelo al tamaño de la pantalla
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 5 / size; // Forzamos a que mida "5 unidades"
    model.scale.set(scale, scale, scale);
    
    // Mejorar materiales (Brillo metálico)
    model.traverse((n) => {
        if (n.isMesh) {
            n.material.metalness = 0.8;
            n.material.roughness = 0.2;
        }
    });

    satelliteGroup.add(model);
}, undefined, (e) => console.error("Error cargando .glb", e));

// 6. CÁMARA (Mirando al centro)
camera.position.set(10, 5, 20);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    satelliteGroup.rotation.y += 0.005; // Rotación lenta para apreciar el 3D
    earth.rotation.y += 0.0003;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
