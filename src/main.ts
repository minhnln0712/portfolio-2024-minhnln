import "./style.css";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
// import {FPXLoader} from ""

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

// #region Renderer Init

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
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

const ambientLight = new THREE.AmbientLight(0xeab676, 0.1);
ambientLight.visible = true;
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.visible = true;
directionalLight.position.x = 5;
directionalLight.position.z = 5;
// directionalLight.shadow.camera.near = 0;
// directionalLight.shadow.camera.far = 100;
// directionalLight.castShadow = true;
scene.add(directionalLight);

// #endregion

// #region Character Init

const cube = new THREE.Mesh(
  new THREE.ConeGeometry(),
  new THREE.MeshStandardMaterial({ color: 0xff0001 })
);
cube.position.y = 1;
cube.castShadow = true;
scene.add(cube);
camera.lookAt(cube.position); // Make camera look at the character Ref at the first time it renders!

// #endregion

// #region Main Surface

// Add a Plane for the surface
const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
const texture = new THREE.TextureLoader().load("/public/images/testText.jpg");
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial());
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;
plane.castShadow = true;
plane.material.map = texture;
scene.add(plane);

// #endregion

function BeginPlay() {}
BeginPlay();

// #region InputKey

const keyMap: { [key: string]: boolean } = {};
const onDocumentKey = (e: KeyboardEvent) => {
  keyMap[e.code] = e.type === "keydown";
};
document.addEventListener("keydown", onDocumentKey, false);
document.addEventListener("keyup", onDocumentKey, false);

const mouse = new THREE.Vector2();
renderer.domElement.addEventListener("mousemove", (e) => {
  mouse.set(
    (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
  );

  cube.lookAt(new THREE.Vector3(mouse.y, 0, mouse.x));
  //   console.log("x: " + mouse.x);
  //   console.log("y: " + mouse.y);
  //   console.log(Math.cos(mouse.x));

  //   cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.cos(mouse.x) * 0.01);
});

// #endregion

const clock = new THREE.Clock();
let deltaTime: number;

function EventTick() {
  requestAnimationFrame(EventTick);
  deltaTime = clock.getDelta();

  if (keyMap["KeyW"] || keyMap["ArrowUp"]) {
    console.log(cube.rotation.x);
    CharacterMoveUp(20);
    // cube.rotation.x = 0.5 * Math.PI;
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
  //   cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), deltaTime * 0.5 * Math.PI);
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
