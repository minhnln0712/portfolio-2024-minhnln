import "./style.css";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";

// Initialization
const stats = new Stats();
document.body.appendChild(stats.dom);

// #region Scene Init
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x123456);
// #endregion

// #region Camera Init
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-5, 10, 0); // Camera Default Position
// #endregion

// #regin Renderer Init
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

function render() {
  renderer.render(scene, camera);
}
// #endregion

// #region Light Init

const ambientLight = new THREE.AmbientLight(0xeab676, 0.01);
ambientLight.visible = true;
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.visible = true;
directionalLight.position.x = 10;
directionalLight.castShadow = true;
scene.add(directionalLight);

// #endregion

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0xff0001 })
);
cube.position.y = 1;
cube.castShadow = true;
scene.add(cube);
camera.lookAt(cube.position);

function BeginPlay() {}
BeginPlay();

// Add a Plane for the surface
const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
const texture = new THREE.TextureLoader().load("/public/images/testText.jpg");
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial());
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;
plane.material.map = texture;
scene.add(plane);

const clock = new THREE.Clock();
let deltaTime: number;

// InputKey

const keyMap: { [key: string]: boolean } = {};
const onDocumentKey = (e: KeyboardEvent) => {
  keyMap[e.code] = e.type === "keydown";
};
document.addEventListener("keydown", onDocumentKey, false);
document.addEventListener("keyup", onDocumentKey, false);

function EventTick() {
  requestAnimationFrame(EventTick);
  deltaTime = clock.getDelta();

  if (keyMap["KeyW"] || keyMap["ArrowUp"]) {
    console.log("MoveUp");
    CharacterMoveUp(20);
  }
  if (keyMap["KeyS"] || keyMap["ArrowDown"]) {
    CharacterMoveUp(-20);
  }
  if (keyMap["KeyA"] || keyMap["ArrowLeft"]) {
    CharacterMoveRight(-20);
  }
  if (keyMap["KeyD"] || keyMap["ArrowRight"]) {
    CharacterMoveRight(20);
  }

  stats.update();
  render();
}

EventTick();

function CharacterMoveUp(value: number) {
  cube.position.x += deltaTime * value;
  camera.position.x += deltaTime * value;
}

function CharacterMoveRight(value: number) {
  cube.position.z += deltaTime * value;
  camera.position.z += deltaTime * value;
}
