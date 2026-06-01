import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURACIÓN BASE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(20, 10, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- ILUMINACIÓN PROFESIONAL ---
const sun = new THREE.DirectionalLight(0xffffff, 5);
sun.position.set(500, 200, 500); // Sol en posición real
scene.add(sun);

// Luz de Rebote (Albedo): La Tierra refleja luz azul hacia el satélite
const albedo = new THREE.PointLight(0x00f2ff, 2, 100);
albedo.position.set(0, -30, 0);
scene.add(albedo);

scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// Estrellas profundas
const stars = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<25000; i++) starPos.push((Math.random()-0.5)*18000, (Math.random()-0.5)*18000, (Math.random()-0.5)*18000);
stars.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(stars, new THREE.PointsMaterial({color: 0xffffff, size: 1.5})));

const loader = new GLTFLoader();

// --- TIERRA Y ATMÓSFERA ---
let earth;
loader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(0.2, 0.2, 0.2);
    earth.position.set(0, -210, 0);
    scene.add(earth);

    // Efecto de atmósfera visible (Halo azul)
    const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(1.04, 64, 64),
        new THREE.MeshLambertMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.15, side: THREE.BackSide })
    );
    earth.add(atmo);
});

// --- SATÉLITE NASA-SPEC ---
const satGroup = new THREE.Group();
scene.add(satGroup);

loader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const s = 12 / box.getSize(new THREE.Vector3()).length();
    model.scale.set(s, s, s);

    model.traverse(n => {
        if (n.isMesh) {
            n.material = n.material.clone();
            // Metal fotorrealista
            n.material.metalness = 0.9;
            n.material.roughness = 0.1;
            
            if (n.name.toLowerCase().includes('panel')) {
                n.material.color.setHex(0x001133);
                n.material.emissive.setHex(0x00081a);
            } else {
                // Brillo dorado de manta térmica
                n.material.color.lerp(new THREE.Color(0xffcc44), 0.3);
            }
        }
    });
    satGroup.add(model);
});

// --- ANIMACIÓN Y FÍSICA ---
let angle = 0;
const RADIUS = 48;
const vec = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);
    angle += 0.003;

    // Órbita circular con inclinación
    satGroup.position.set(Math.cos(angle)*RADIUS, Math.sin(angle/2)*5, Math.sin(angle)*RADIUS);
    
    // Apuntar instrumentos a Tierra (Nadir)
    satGroup.lookAt(0, -210, 0);

    // Etiquetas
    updateLbl('lbl-sat', satGroup.position);
    updateLbl('lbl-earth', vec.set(0, -200, 0));

    if(earth) earth.rotation.y += 0.0001;
    controls.update();
    renderer.render(scene, camera);
}

function updateLbl(id, pos) {
    const el = document.getElementById(id);
    vec.copy(pos).project(camera);
    el.style.left = (vec.x * 0.5 + 0.5) * window.innerWidth + "px";
    el.style.top = (vec.y * -0.5 + 0.5) * window.innerHeight + "px";
    el.style.display = vec.z > 1 ? 'none' : 'block';
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
