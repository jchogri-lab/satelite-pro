import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 5, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CONTROLES FORZADOS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = true;

// LUZ DESDE VARIOS ÁNGULOS
const light1 = new THREE.DirectionalLight(0xffffff, 2);
light1.position.set(10, 10, 10);
scene.add(light1);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// TIERRA "PINTADA" CON CÓDIGO (No necesita archivos externos)
const earthGeo = new THREE.SphereGeometry(15, 64, 64);
const earthMat = new THREE.MeshPhongMaterial({
    color: 0x1133aa,
    emissive: 0x051122,
    specular: 0x222222,
    shininess: 25,
    flatShading: false
});

// Le agregamos un "brillo" atmosférico para que no sea solo un círculo
const earth = new THREE.Mesh(earthGeo, earthMat);
earth.position.set(0, -35, -50);
scene.add(earth);

// FONDO DE ESTRELLAS
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<5000; i++) {
    starCoords.push((Math.random()-0.5)*2000, (Math.random()-0.5)*2000, (Math.random()-0.5)*2000);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 1})));

// CARGA DEL SATÉLITE
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    const scale = 8 / size;
    
    model.scale.set(scale, scale, scale);
    model.position.x = -center.x * scale;
    model.position.y = -center.y * scale;
    model.position.z = -center.z * scale;
    
    satelliteGroup.add(model);
});

function animate() {
    requestAnimationFrame(animate);
    
    // Si el mouse no funciona, esto hará que el satélite gire solo
    // para confirmar que el código está corriendo
    satelliteGroup.rotation.y += 0.002; 
    
    controls.update(); 
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
