import "./style.css";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Initialization
let stats: Stats;
let scene: THREE.Scene;

// Camera
let camera: THREE.PerspectiveCamera;
const CAMERA_DEFAULT_POSITION = new THREE.Vector3(-10, 10, 0);
const CAMERA_MAX_POSITION = new THREE.Vector3(-20, 20, 0);
const CAMERA_MIN_POSITION = new THREE.Vector3(-5, 5, 0);

init();

async function init() {
  // Check application stats
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // #region Scene Init

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.castShadow = true;

  // #endregion

  // #region Camera Init

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    CAMERA_DEFAULT_POSITION.x,
    CAMERA_DEFAULT_POSITION.y,
    CAMERA_DEFAULT_POSITION.z
  );

  // #endregion

  // #region Renderer Init

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ReinhardToneMapping;

  document.body.appendChild(renderer.domElement);

  function render() {
    composer.render();
  }

  // Bloom Effect
  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), .3, 0, 0.1);

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);
  composer.renderToScreen = true;

  renderer.toneMappingExposure = Math.pow(1, 4.0);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    render();
  });


  // #endregion

}

// #region Sound Init

const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load("/public/sounds/BGM.ogg", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.2);
  sound.play();
});

// #endregion

// #region Light Init

const directionalLight = new THREE.DirectionalLight(0x3d77a6, 1);
directionalLight.visible = true;
directionalLight.position.x = -20;
directionalLight.position.y = 20;
directionalLight.position.z = -5;
directionalLight.shadow.camera.near = 0;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.mapSize = new THREE.Vector2(8192, 8192);

directionalLight.castShadow = true;
scene.add(directionalLight);

// const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(helper);

const pointLight = new THREE.PointLight(0xffffff, 1000);
camera.add(pointLight);

// #endregion

// #region Character Init

const CHARACTER_MOVE_SPEED: number = 10;
let characterHP = 100;
let bIsCharacterDead = false;

let character: THREE.Mesh;
let mixer: THREE.AnimationMixer;
let idleAnimation: THREE.AnimationAction;
let moveAnimation: THREE.AnimationAction;

new GLTFLoader().load("/public/models/bananacat.glb", (gltf) => {
  character = gltf.scene.getObjectByName(gltf.scene.name) as THREE.Mesh;
  mixer = new THREE.AnimationMixer(gltf.scene);
  idleAnimation = mixer.clipAction(gltf.animations[1]);
  moveAnimation = mixer.clipAction(gltf.animations[2]);

  character.position.set(16, 0, 16);
  camera.position.set(
    camera.position.x + character.position.x,
    camera.position.y + character.position.y,
    camera.position.z + character.position.z
  );
  character.rotation.y = -0.75 * Math.PI;

  gltf.scene.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      node.castShadow = true;
    }
  });

  scene.add(character);
  camera.lookAt(character.position);
  directionalLight.target = character;
});

// Character Movement

function CharacterMoveUp(value: number) {
  character.position.x += deltaTime * value;
  camera.position.x += deltaTime * value;
  directionalLight.position.x += deltaTime * value;

}

function CharacterMoveRight(value: number) {
  character.position.z += deltaTime * value;
  camera.position.z += deltaTime * value;
  directionalLight.position.z += deltaTime * value;
}

// Other Character Function

function CharacterTakeDamage(value: number) {
  if (characterHP > 0) {
    characterHP -= value;
  }
}

// #endregion

// #region Model

const EmissiveModelTextureList = [
  {
    name: "Portfolio_2", emissiveColor: "#FE3EA5", emissiveIntensity: 5, side: THREE.FrontSide
  }, {
    name: "Portfolio_3", emissiveColor: "#FFB5DA", emissiveIntensity: 10, side: THREE.FrontSide
  }, {
    name: "Portfolio_4", emissiveColor: "#FF7DD3", emissiveIntensity: 5, side: THREE.FrontSide
  }, {
    name: "Portfolio_5", emissiveColor: "#6420AB", emissiveIntensity: .1, side: THREE.DoubleSide
  }, {
    name: "Portfolio_7", emissiveColor: "#FFFF00", emissiveIntensity: .2, side: THREE.FrontSide
  }, {
    name: "Portfolio_9", emissiveColor: "#FFF800", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_10", emissiveColor: "#1877F2", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_11", emissiveColor: "#ffffff", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_12", emissiveColor: "#ffffff", emissiveIntensity: .5, side: THREE.FrontSide
  }, {
    name: "Portfolio_13", emissiveColor: "#0077B5", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_16", emissiveColor: "#FF0000", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_17", emissiveColor: "#730901", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_18", emissiveColor: "#ffff00", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_20", emissiveColor: "#009D46", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_21", emissiveColor: "#FF2B00", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_22", emissiveColor: "#FFFF00", emissiveIntensity: 1, side: THREE.FrontSide
  }, {
    name: "Portfolio_23", emissiveColor: "#01224D", emissiveIntensity: 1, side: THREE.DoubleSide
  }, {
    name: "Portfolio_24", emissiveColor: "#9F153E", emissiveIntensity: 10, side: THREE.FrontSide
  }, {
    name: "Portfolio_25", emissiveColor: "#FF204D", emissiveIntensity: 20, side: THREE.FrontSide
  }, {
    name: "Portfolio_26", emissiveColor: "#5C0E40", emissiveIntensity: 10, side: THREE.FrontSide
  }, {
    name: "Portfolio_27", emissiveColor: "#211952", emissiveIntensity: 1, side: THREE.DoubleSide
  }, {
    name: "Portfolio_28", emissiveColor: "#826FFF", emissiveIntensity: 10, side: THREE.FrontSide
  }, {
    name: "Portfolio_29", emissiveColor: "#15F5B9", emissiveIntensity: 5, side: THREE.FrontSide
  }, {
    name: "Portfolio_42", emissiveColor: "#01224D", emissiveIntensity: 20, side: THREE.FrontSide
  },

];


new GLTFLoader().load("/public/models/PortfolioMesh.glb", (gltf) => {
  console.log(gltf.scene);
  // (gltf.scene.getObjectByName("Portfolio_5") as THREE.Mesh).material =
  //   new THREE.MeshStandardMaterial({ emissive: 0xfdda0d, side: THREE.BackSide, emissiveIntensity: .1 });
  // (gltf.scene.getObjectByName("Portfolio_42") as THREE.Mesh).material =
  //   new THREE.MeshStandardMaterial({ color: 0xfdda0d });
  EmissiveModelTextureList.forEach(mesh => {
    (gltf.scene.getObjectByName(mesh.name) as THREE.Mesh).material =
      new THREE.MeshStandardMaterial({
        emissive: mesh.emissiveColor,
        emissiveIntensity: mesh.emissiveIntensity,
        side: mesh.side
      });
  });



  gltf.scene.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  // gltf.scene.position.y = 0;
  gltf.scene.rotateY(-0.75 * Math.PI);

  scene.add(gltf.scene);
});

// #endregion

// #region Main Surface

// Add a Plane for the surface

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x0080bf })
);
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;
plane.castShadow = true;
scene.add(plane);

const plane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xfdda0d })
);
plane2.rotateX(-Math.PI / 2);
plane2.position.y = -1;
plane2.receiveShadow = true;
plane2.castShadow = true;
// scene.add(plane2);

// #endregion

function BeginPlay() { }
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

document.addEventListener("wheel", (e) => {
  if (e.deltaY < 0) {
    if (
      (camera.position.y < CAMERA_MAX_POSITION.y &&
        camera.position.y > CAMERA_MIN_POSITION.y) ||
      camera.position.y === CAMERA_MAX_POSITION.y
    ) {
      camera.position.x += 1;
      camera.position.y -= 1;
    }
  } else {
    if (
      (camera.position.y < CAMERA_MAX_POSITION.y &&
        camera.position.y > CAMERA_MIN_POSITION.y) ||
      camera.position.y === CAMERA_MIN_POSITION.y
    ) {
      camera.position.x -= 1;
      camera.position.y += 1;
    }
  }
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
  return min + Math.round(Math.random() * max);
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
  let enemyx =
    character.position.x +
    (RandomNumber(0, 1)
      ? RandomNumber(minRange, maxRange)
      : -RandomNumber(minRange, maxRange));
  cube.position.set(
    enemyx,
    1,
    character.position.z +
    (RandomNumber(0, 1)
      ? RandomNumber(minRange, maxRange)
      : -RandomNumber(minRange, maxRange))
  );
  EnemyList.push(cube);
  console.log(cube.position);
}

//#endregion

// new OrbitControls(camera, renderer.domElement);

function EventTick() {
  requestAnimationFrame(EventTick);
  if (!bIsCharacterDead) {
    deltaTime = clock.getDelta();
    mixer.update(deltaTime);
    camera.lookAt(character.position);

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
      enemy.translateOnAxis(targetNormalizedVector, 10 * deltaTime);
    });

    if (runCodeEachSeconds(clock.getElapsedTime(), 3)) {
      // spawnEnemy(0, 20);
    }

    // #region Movement and Controls
    if (keyMap["KeyW"]) {
      CharacterMoveUp(CHARACTER_MOVE_SPEED);
      character.rotation.y = 0.5 * Math.PI;
    }
    if (keyMap["KeyS"]) {
      CharacterMoveUp(-CHARACTER_MOVE_SPEED);
      character.rotation.y = -0.5 * Math.PI;
    }
    if (keyMap["KeyA"]) {
      CharacterMoveRight(-CHARACTER_MOVE_SPEED);
      character.rotation.y = Math.PI;
    }
    if (keyMap["KeyD"]) {
      CharacterMoveRight(CHARACTER_MOVE_SPEED);
      character.rotation.y = 0;
    }
    if (keyMap["KeyW"] && keyMap["KeyD"]) {
      character.rotation.y = 0.25 * Math.PI;
    }
    if (keyMap["KeyS"] && keyMap["KeyD"]) {
      character.rotation.y = -0.25 * Math.PI;
    }
    if (keyMap["KeyW"] && keyMap["KeyA"]) {
      character.rotation.y = 0.75 * Math.PI;
    }
    if (keyMap["KeyS"] && keyMap["KeyA"]) {
      character.rotation.y = -0.75 * Math.PI;
    }
    if (
      (keyMap["KeyW"] && keyMap["KeyS"]) ||
      (keyMap["KeyA"] && keyMap["KeyD"])
    ) {
      moveAnimation.stop();
      idleAnimation.play();
    }
    if (keyMap["KeyZ"]) {
      spawnEnemy(50, 100);
      console.log(character.position);
    }
    if (keyMap["KeyX"]) {
      plane2.position.y += 5 * deltaTime;
    }
    if (keyMap["KeyC"]) {
      plane2.position.y -= 5 * deltaTime;
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
      idleAnimation.play();
    } else {
      idleAnimation.stop();
      moveAnimation.play();
    }
    // #endregion
  }
  stats.update();
  render();
}

EventTick();
