import "./style.css";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
camera.position.set(-5, 15, 0); // Camera Default Position
// camera.position.set(2, 10, 2); // Camera Default Position
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
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0xff0001 })
);
cube.position.y = 1;
// cube.castShadow = true;
scene.add(cube);

let character: THREE.Mesh;
let mixer: THREE.AnimationMixer;
let moveAnimation: THREE.AnimationAction;

new GLTFLoader().load("/public/models/cute_cat_in_cute_banana.glb", (gltf) => {
  character = gltf.scene.getObjectByName("Sketchfab_Scene") as THREE.Mesh;
  mixer = new THREE.AnimationMixer(gltf.scene);
  moveAnimation = mixer.clipAction(gltf.animations[0]);
  character.position.set(0, 1, 0);
  character.rotateY(-0.5 * Math.PI);
  scene.add(character);
  camera.lookAt(character.position);
});

// Character Movement

function CharacterMoveUp(value: number) {
  character.position.x += deltaTime * value;
  camera.position.x += deltaTime * value;
}

function CharacterMoveRight(value: number) {
  character.position.z += deltaTime * value;
  camera.position.z += deltaTime * value;
}

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

  // cube.lookAt(new THREE.Vector3(mouse.y, 0, mouse.x));
  //   console.log("x: " + mouse.x);
  //   console.log("y: " + mouse.y);
  //   console.log(Math.cos(mouse.x));

  //   cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.cos(mouse.x) * 0.01);
});

// #endregion

const clock = new THREE.Clock();
let deltaTime: number;

let nextSecond = 0;

function runCodeEachSeconds(elapsedTime: number, eachSeconds: number) {
  if (
    Math.trunc(elapsedTime) === nextSecond &&
    Math.trunc(elapsedTime) % eachSeconds === 0
  ) {
    nextSecond += eachSeconds;
    return true;
  }
  return false;
}

//#region Test Function

let group = new THREE.Group();
// group.add(cube);

const EnemyList: THREE.Mesh[] = [];

function RandomNumber(min: number, max: number) {
  return min + Math.trunc(Math.random() * max) + 1;
}

function spawnEnemy(minRange: number, maxRange: number) {
  let cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        `rgb(${RandomNumber(0, 255)}, ${RandomNumber(0, 255)}, ${RandomNumber(
          0,
          255
        )})`
      ),
    })
  );
  scene.add(cube);
  cube.matrixWorld.setPosition(
    character.position.x + RandomNumber(0, 1)
      ? RandomNumber(minRange, maxRange)
      : -RandomNumber(minRange, maxRange),
    1,
    character.position.z + RandomNumber(0, 1)
      ? RandomNumber(minRange, maxRange)
      : -RandomNumber(minRange, maxRange)
  );
  EnemyList.push(cube);
  console.log(cube.position);
}

//#endregion
// new OrbitControls(camera, renderer.domElement);

function EventTick() {
  requestAnimationFrame(EventTick);
  deltaTime = clock.getDelta();
  mixer.update(deltaTime);

  // Test
  // console.log(cube.position);

  let targetPosition = character.position;
  EnemyList.forEach((enemy) => {
    let targetNormalizedVector = new THREE.Vector3(
      targetPosition.x - enemy.position.x,
      targetPosition.y - enemy.position.y,
      targetPosition.z - enemy.position.z
    );
    targetNormalizedVector.normalize();
    enemy.translateOnAxis(targetNormalizedVector, 0.05);
  });

  if (runCodeEachSeconds(clock.getElapsedTime(), 3)) {
    spawnEnemy(0, 20);
  }
  if (keyMap["KeyW"] || keyMap["ArrowUp"]) {
    CharacterMoveUp(5);
    character.rotation.y = 0.5 * Math.PI;
  }
  if (keyMap["KeyS"] || keyMap["ArrowDown"]) {
    CharacterMoveUp(-5);
    character.rotation.y = -0.5 * Math.PI;
  }
  if (keyMap["KeyA"] || keyMap["ArrowLeft"]) {
    CharacterMoveRight(-5);
    character.rotation.y = Math.PI;
  }
  if (keyMap["KeyD"] || keyMap["ArrowRight"]) {
    CharacterMoveRight(5);
    character.rotation.y = 0;
  }
  if (keyMap["KeyZ"]) {
    // spawnEnemy(0, 10);
    console.log(RandomNumber(0, 1));
  }
  if (
    !keyMap["KeyW"] &&
    !keyMap["ArrowUp"] &&
    !keyMap["KeyS"] &&
    !keyMap["ArrowDown"] &&
    !keyMap["KeyA"] &&
    !keyMap["ArrowLeft"] &&
    !keyMap["KeyD"] &&
    !keyMap["ArrowRight"]
  ) {
    moveAnimation.stop();
  } else {
    moveAnimation.play();
  }

  stats.update();
  render();
}

EventTick();
