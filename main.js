import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 
// ─── RENDERER ────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(12, 5, 20);
 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5;
controls.maxDistance = 800;
 
// ─── CLOCK ───────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
 
// ─── SUN ─────────────────────────────────────────────────────────────────────
const sunGroup = new THREE.Group();
const sunGeo  = new THREE.SphereGeometry(50, 32, 32);
const sunMat  = new THREE.MeshBasicMaterial({ color: 0xfffde0 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunGroup.add(sunMesh);
sunGroup.position.set(1200, 400, -800);
scene.add(sunGroup);
 
// Sun glow sprite
const sunGlowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128,128,0,128,128,128);
    g.addColorStop(0,   'rgba(255,253,200,0.9)');
    g.addColorStop(0.3, 'rgba(255,200,80,0.4)');
    g.addColorStop(1,   'rgba(255,140,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
    return new THREE.CanvasTexture(c);
})();
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, transparent: true, depthWrite: false }));
sunSprite.scale.set(400, 400, 1);
sunGroup.add(sunSprite);
 
const sunLight = new THREE.DirectionalLight(0xfff5e0, 4.5);
sunLight.position.copy(sunGroup.position);
scene.add(sunLight);
 
// ─── MOON ────────────────────────────────────────────────────────────────────
const moonGeo = new THREE.SphereGeometry(15, 32, 32);
const moonMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, emissive: 0x111111, roughness: 0.9 });
const moon    = new THREE.Mesh(moonGeo, moonMat);
moon.position.set(-800, 200, -1500);
scene.add(moon);
 
// ─── LIGHTING ────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x334466, 0.6));
 
const earthAlbedo = new THREE.DirectionalLight(0x4488ff, 1.5);
earthAlbedo.position.set(0, -50, 0);
scene.add(earthAlbedo);
 
const camLight = new THREE.PointLight(0xffffff, 0.8);
camera.add(camLight);
scene.add(camera);
 
// ─── STARS ───────────────────────────────────────────────────────────────────
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for (let i = 0; i < 30000; i++) {
    starCoords.push(
        (Math.random() - 0.5) * 20000,
        (Math.random() - 0.5) * 20000,
        (Math.random() - 0.5) * 20000
    );
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: true })));
 
// ─── ORBIT PATH ──────────────────────────────────────────────────────────────
// Real LEO: ~400 km altitude. Earth radius ~6371 km → ratio kept for visual clarity
const ORBIT_RADIUS = 42; // visual units
const ORBIT_TILT   = THREE.MathUtils.degToRad(51.6); // ISS inclination
 
const orbitCurve = new THREE.EllipseCurve(0, 0, ORBIT_RADIUS, ORBIT_RADIUS, 0, Math.PI * 2, false, 0);
const orbitPoints = orbitCurve.getPoints(256);
const orbitGeo    = new THREE.BufferGeometry().setFromPoints(
    orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
);
const orbitLine   = new THREE.Line(
    orbitGeo,
    new THREE.LineBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.25 })
);
orbitLine.rotation.x = ORBIT_TILT;
scene.add(orbitLine);
 
// ─── ATMOSPHERE LAYERS (didactic) ────────────────────────────────────────────
function makeAtmoRing(radius, color, opacity) {
    const g = new THREE.RingGeometry(radius - 0.3, radius + 0.3, 128);
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
}
// Troposphere, Stratosphere, Thermosphere (LEO zone) — subtle dashed rings
const atmoGroup = new THREE.Group();
atmoGroup.add(makeAtmoRing(27, 0x88ccff, 0.08));  // ~12 km troposphere
atmoGroup.add(makeAtmoRing(32, 0x44aaff, 0.06));  // ~50 km stratosphere
atmoGroup.add(makeAtmoRing(ORBIT_RADIUS, 0x0077ff, 0.12)); // LEO ~400 km
scene.add(atmoGroup);
 
// ─── EARTH ───────────────────────────────────────────────────────────────────
const gltfLoader = new GLTFLoader();
let earth;
const EARTH_SCALE = 0.22;
const EARTH_TILT  = THREE.MathUtils.degToRad(23.5);
 
gltfLoader.load('assets/Earth_1_12756.glb', (gltf) => {
    earth = gltf.scene;
    earth.scale.set(EARTH_SCALE, EARTH_SCALE, EARTH_SCALE);
    earth.position.set(0, -225, -20);
    earth.rotation.z = EARTH_TILT; // axial tilt
    scene.add(earth);
 
    // Atmosphere glow shell
    const atmoGeo = new THREE.SphereGeometry(1.04, 64, 64);
    const atmoMat = new THREE.MeshLambertMaterial({
        color: 0x4499ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
        depthWrite: false
    });
    earth.add(new THREE.Mesh(atmoGeo, atmoMat));
 
    // Subtle city-light / terminator glow on night side
    const nightGeo = new THREE.SphereGeometry(1.005, 64, 64);
    const nightMat = new THREE.MeshBasicMaterial({
        color: 0xffaa22,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
        depthWrite: false
    });
    earth.add(new THREE.Mesh(nightGeo, nightMat));
});
 
// ─── SATELLITE ───────────────────────────────────────────────────────────────
const satelliteGroup = new THREE.Group();
const satellitePivot = new THREE.Group();
satellitePivot.rotation.x = ORBIT_TILT;
satellitePivot.add(satelliteGroup);
scene.add(satellitePivot);
 
let solarPanelLeft, solarPanelRight; // for solar tracking animation
 
gltfLoader.load('assets/satellite.glb', (gltf) => {
    const model = gltf.scene;
    const box  = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const s    = 11 / size;
    model.scale.set(s, s, s);
 
    model.traverse((n) => {
        if (!n.isMesh) return;
        if (!n.material) return;
 
        // Clone material so we can mutate safely
        n.material = n.material.clone();
        n.material.metalness = 0.85;
        n.material.roughness = 0.15;
 
        const name = n.name.toLowerCase();
        if (name.includes('panel') || name.includes('solar') || name.includes('wing')) {
            n.material.color.setHex(0x001144);
            n.material.emissive = new THREE.Color(0x000822);
            n.material.roughness = 0.1;
            // Grab references for animation
            if (!solarPanelLeft)  solarPanelLeft  = n;
            else if (!solarPanelRight) solarPanelRight = n;
        } else if (name.includes('body') || name.includes('main') || name.includes('bus')) {
            n.material.color.multiplyScalar(1.5);
            // Gold MLI thermal blanket tint
            n.material.color.lerp(new THREE.Color(0xffcc44), 0.3);
        } else {
            if (n.material.color) n.material.color.multiplyScalar(1.4);
        }
        n.castShadow    = true;
        n.receiveShadow = true;
    });
 
    satelliteGroup.add(model);
 
    // Place satellite on orbit
    satelliteGroup.position.set(ORBIT_RADIUS, 0, 0);
});
 
// ─── ORBIT PROGRESS ANGLE ────────────────────────────────────────────────────
let orbitAngle = 0;
const ORBIT_SPEED = 0.18; // rad/s → ~35 min for full orbit (sped up for demo)
 
// ─── TELEMETRY DATA ──────────────────────────────────────────────────────────
const LEO_ALTITUDE_KM   = 408;
const ORBITAL_VELOCITY  = 7.66; // km/s
const ORBITAL_PERIOD_MIN = 92.68;
 
const elAlt  = document.getElementById('val-alt');
const elVel  = document.getElementById('val-vel');
const elPer  = document.getElementById('val-per');
const elLat  = document.getElementById('val-lat');
const elInc  = document.getElementById('val-inc');
const elTime = document.getElementById('val-time');
const progressBar = document.getElementById('orbit-progress');
const progressDeg = document.getElementById('orbit-deg');
 
// ─── ANNOTATION LABELS ───────────────────────────────────────────────────────
// Simple CSS labels anchored in screen space via projection
const labelData = [
    { worldPos: new THREE.Vector3(ORBIT_RADIUS + 2, 0, 0), id: 'lbl-sat' },
    { worldPos: new THREE.Vector3(0, -225, -20),            id: 'lbl-earth' },
    { worldPos: new THREE.Vector3(27, 0, 0),                id: 'lbl-tropo' },
    { worldPos: new THREE.Vector3(32, 0, 0),                id: 'lbl-strato' },
    { worldPos: new THREE.Vector3(ORBIT_RADIUS, 2, 0),     id: 'lbl-leo' },
];
 
const tempVec = new THREE.Vector3();
 
function projectToScreen(worldPos) {
    tempVec.copy(worldPos).project(camera);
    return {
        x: (tempVec.x *  0.5 + 0.5) * window.innerWidth,
        y: (tempVec.y * -0.5 + 0.5) * window.innerHeight,
        behind: tempVec.z > 1
    };
}
 
// ─── ANIMATE ─────────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
 
    // Earth slow rotation
    if (earth) earth.rotation.y += 0.00008;
 
    // Satellite orbit
    orbitAngle += ORBIT_SPEED * delta;
    satelliteGroup.position.set(
        Math.cos(orbitAngle) * ORBIT_RADIUS,
        0,
        Math.sin(orbitAngle) * ORBIT_RADIUS
    );
 
    // Keep satellite "upright" relative to Earth center (nadir pointing)
    satelliteGroup.rotation.y = -orbitAngle;
 
    // Solar panel tracking — panels always face sun direction
    if (solarPanelLeft) {
        const sunDir = new THREE.Vector3().copy(sunGroup.position).normalize();
        // Simple tilt toward sun (approximate)
        solarPanelLeft.rotation.y  = Math.sin(orbitAngle) * 0.6;
        if (solarPanelRight) solarPanelRight.rotation.y = solarPanelLeft.rotation.y;
    }
 
    // Update telemetry UI
    if (elAlt) {
        const orbitFraction = (orbitAngle % (Math.PI * 2)) / (Math.PI * 2);
        const latRad = Math.sin(orbitAngle) * ORBIT_TILT;
        const lat    = THREE.MathUtils.radToDeg(latRad).toFixed(1);
        const elapsedMin = (orbitAngle / (Math.PI * 2)) * ORBITAL_PERIOD_MIN;
        const mm = Math.floor(elapsedMin % 60).toString().padStart(2, '0');
        const ss = Math.floor((elapsedMin * 60) % 60).toString().padStart(2, '0');
 
        elAlt.textContent  = `${LEO_ALTITUDE_KM} km`;
        elVel.textContent  = `${ORBITAL_VELOCITY} km/s`;
        elPer.textContent  = `${ORBITAL_PERIOD_MIN} min`;
        elLat.textContent  = `${lat}°`;
        elInc.textContent  = `51.6°`;
        elTime.textContent = `${mm}:${ss}`;
 
        if (progressBar) progressBar.style.width = `${(orbitFraction * 100).toFixed(1)}%`;
        if (progressDeg) progressDeg.textContent  = `${(orbitFraction * 360).toFixed(0)}°`;
    }
 
    // Update annotation positions
    // Move satellite label to current satellite world pos
    const satWorldPos = new THREE.Vector3();
    satelliteGroup.getWorldPosition(satWorldPos);
    labelData[0].worldPos.copy(satWorldPos);
 
    for (const ld of labelData) {
        const el = document.getElementById(ld.id);
        if (!el) continue;
        const screen = projectToScreen(ld.worldPos);
        if (screen.behind) { el.style.display = 'none'; continue; }
        el.style.display = 'block';
        el.style.left    = screen.x + 'px';
        el.style.top     = screen.y + 'px';
    }
 
    controls.update();
    renderer.render(scene, camera);
}
animate();
 
// ─── RESIZE ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
 
// ─── CAMERA PRESETS ──────────────────────────────────────────────────────────
window.setCameraPreset = (preset) => {
    const targets = {
        overview: { pos: [12, 5, 20],     look: [0, 0, 0] },
        earth:    { pos: [0, -200, 30],   look: [0, -225, -20] },
        satellite:{ pos: [ORBIT_RADIUS + 8, 4, 4], look: [ORBIT_RADIUS, 0, 0] },
        solar:    { pos: [20, 20, 20],    look: [0, 0, 0] },
    };
    const t = targets[preset];
    if (!t) return;
    camera.position.set(...t.pos);
    controls.target.set(...t.look);
    controls.update();
 
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-preset="${preset}"]`);
    if (btn) btn.classList.add('active');
};
