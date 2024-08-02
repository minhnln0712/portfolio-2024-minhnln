import "./style.css";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Initialization
let stats: Stats;
const clock = new THREE.Clock();
let deltaTime: number;
let bIsTriggerSurvivalMode = false;
let bIsInitSurvivalMode = false;
let bIsAccessPortfolio = false;

// Camera
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
const CAMERA_DEFAULT_POSITION = new THREE.Vector3(-10, 10, 0);
// let cameraControl: OrbitControls;
let cameraControl2: TrackballControls;
let renderScene: RenderPass;
let bloomPass: UnrealBloomPass;
let composer: EffectComposer;
let outputPass: OutputPass;


// Character Init

const CHARACTER_MOVE_SPEED: number = 10;
// const CHARACTER_HEALTH_POINT: number = 100;
let characterHP = 100;
let bIsCharacterDead = false;
const CHARACTER_SPAWN_LOCATION = new THREE.Vector3(13, 0, 12);

let character: THREE.Mesh;
let characterMixer: THREE.AnimationMixer;
let characterIdleAnimation: THREE.AnimationAction;
let characterMoveAnimation: THREE.AnimationAction;
let characterCollision: THREE.Box3;

// Model
let menuPlane: THREE.Mesh;
let mainPlane: THREE.Mesh;
let gamePlane: THREE.Mesh;

let portfolioModel: THREE.Object3D;

let enemyMouse: THREE.Mesh;
let enemyMouseMixer: THREE.AnimationMixer;
let enemyMouseMoveAnimation: THREE.AnimationAction;
let enemyCockroach: THREE.Mesh;
let enemyCockroachMixer: THREE.AnimationMixer;
let enemyCockroachMoveAnimation: THREE.AnimationAction;

let weaponBananaKatana: THREE.Mesh;
let weaponBananaKatanaCollision: THREE.Box3;

let redButton: THREE.Mesh;
let redButtonCollision: THREE.Box3;

// Sound
let listener: THREE.AudioListener;

let bgmSound: THREE.Audio;
let loseSound: THREE.Audio;
let survivalSound: THREE.Audio;
let hitSound: THREE.Audio;

// Light

const DIRECTIONAL_LIGHT_SPAWN_LOCATION = new THREE.Vector3(CHARACTER_SPAWN_LOCATION.x - 20, 20, CHARACTER_SPAWN_LOCATION.z - 20);
let directionalLight: THREE.DirectionalLight;

// Assets
const progressBar = document.getElementById("progress-bar") as HTMLProgressElement;

const startButton = document.getElementById("startBtn") as HTMLButtonElement;

const loadingManager = new THREE.LoadingManager();

let numOfAssetsLoaded = 0;
const TOTAL_NUMBER_OF_ASSETS = 23;

loadingManager.onProgress = (url, loaded, total) => {
  console.log(url + total);
  numOfAssetsLoaded = loaded;
  progressBar.value = (loaded / TOTAL_NUMBER_OF_ASSETS) * 100;
}

const progressBarContainer = document.querySelector('.progress-bar-container') as HTMLDivElement;
loadingManager.onLoad = () => {
  if (numOfAssetsLoaded === TOTAL_NUMBER_OF_ASSETS) {
    progressBar.style.display = "none";
    startButton.style.display = 'block';

  }
}

startButton.addEventListener('click', () => {
  bIsAccessPortfolio = true;
  startButton.style.display = 'none';
  progressBarContainer.style.display = "none";
  bgmSound.play();
})

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.castShadow = true;

init();

async function init() {
  // Check application stats
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // #region Scene Init



  // #endregion

  // #region Camera Init

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // camera.rotation.set(
  //   CAMERA_BASE_ROTATION.x,
  //   CAMERA_BASE_ROTATION.y,
  //   CAMERA_BASE_ROTATION.z);
  camera.position.set(
    CAMERA_DEFAULT_POSITION.x + CHARACTER_SPAWN_LOCATION.x,
    CAMERA_DEFAULT_POSITION.y + CHARACTER_SPAWN_LOCATION.y,
    CAMERA_DEFAULT_POSITION.z + CHARACTER_SPAWN_LOCATION.z
  );

  // #endregion

  // #region Renderer Init

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  document.body.appendChild(renderer.domElement);

  // Bloom Effect
  renderScene = new RenderPass(scene, camera);

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), .3, 0, 0.1);

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  outputPass = new OutputPass();
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

  // cameraControl = new OrbitControls(camera, renderer.domElement);
  // cameraControl.enableDamping = true;
  // cameraControl.dampingFactor = 0.1;
  // cameraControl.enableZoom = false;
  // cameraControl.enableRotate = false;
  // cameraControl.enablePan = false;

  cameraControl2 = new TrackballControls(camera, renderer.domElement)
  cameraControl2.noPan = true;
  cameraControl2.noRotate = true;
  cameraControl2.noRoll = true;
  cameraControl2.noZoom = false;
  cameraControl2.zoomSpeed = 1.5;
  cameraControl2.noZoom = false;
  cameraControl2.minDistance = 5;
  cameraControl2.maxDistance = 30;

  // #endregion

  // #region Light Init

  // directionalLight = new THREE.DirectionalLight(0x3d77a6, 1);
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.visible = true;
  directionalLight.position.set(
    DIRECTIONAL_LIGHT_SPAWN_LOCATION.x,
    DIRECTIONAL_LIGHT_SPAWN_LOCATION.y,
    DIRECTIONAL_LIGHT_SPAWN_LOCATION.z);
  directionalLight.shadow.camera.near = 0;
  directionalLight.shadow.camera.far = 1000;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  directionalLight.shadow.mapSize = new THREE.Vector2(8192, 8192);
  directionalLight.castShadow = true;
  directionalLight.shadow.bias = -0.0001;
  scene.add(directionalLight);

  // const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(helper);

  // #endregion

  // Model
  const loader = new GLTFLoader(loadingManager);

  // #region Character Init

  const characterGltf = await loader.loadAsync('./public/models/bananacat.glb');
  character = characterGltf.scene.getObjectByName(characterGltf.scene.name) as THREE.Mesh;
  characterMixer = new THREE.AnimationMixer(character);
  characterIdleAnimation = characterMixer.clipAction(characterGltf.animations[1]);
  characterMoveAnimation = characterMixer.clipAction(characterGltf.animations[2]);
  character.position.set(CHARACTER_SPAWN_LOCATION.x,
    CHARACTER_SPAWN_LOCATION.y,
    CHARACTER_SPAWN_LOCATION.z);

  character.rotation.y = -0.75 * Math.PI;
  character.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  scene.add(character);

  directionalLight.target = character;
  characterCollision = new THREE.Box3().setFromObject(character);
  // camera.lookAt(character.position)




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
      name: "Portfolio_17", emissiveColor: "#730f01", emissiveIntensity: 4, side: THREE.FrontSide
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

  const portfolioGltf = await loader.loadAsync('./public/models/PortfolioMesh.glb');
  portfolioModel = portfolioGltf.scene;

  // (portfolioModel.getObjectByName("Portfolio_5") as THREE.Mesh).material =
  //   new THREE.MeshStandardMaterial({ emissive: 0xfdda0d, side: THREE.BackSide, emissiveIntensity: .1 });
  // (portfolioModel.getObjectByName("Portfolio_42") as THREE.Mesh).material =
  //   new THREE.MeshStandardMaterial({ color: 0xfdda0d });
  EmissiveModelTextureList.forEach(mesh => {
    (portfolioModel.getObjectByName(mesh.name) as THREE.Mesh).material =
      new THREE.MeshStandardMaterial({
        emissive: mesh.emissiveColor,
        emissiveIntensity: mesh.emissiveIntensity,
        side: mesh.side
      });
  });
  portfolioModel.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  portfolioModel.rotateY(-0.75 * Math.PI);
  scene.add(portfolioModel);

  const redButtonGltf = await loader.loadAsync('./public/models/red_button.glb');
  redButton = redButtonGltf.scene.getObjectByName(redButtonGltf.scene.name) as THREE.Mesh;
  redButton.position.set(28, 1, -25.5);
  redButton.rotateY(.25 * Math.PI);
  redButton.scale.set(5, 5, 5);
  redButtonCollision = new THREE.Box3().setFromObject(redButton);
  scene.add(redButton);


  // Enemy Model

  const enemyMouseGltf = await loader.loadAsync('./public/models/mouse (1).glb');
  enemyMouse = enemyMouseGltf.scene.getObjectByName(enemyMouseGltf.scene.name) as THREE.Mesh;
  enemyMouse.scale.set(.4, .4, .4);
  enemyMouseMixer = new THREE.AnimationMixer(enemyMouse);
  enemyMouseMoveAnimation = enemyMouseMixer.clipAction(enemyMouseGltf.animations[0]);
  enemyMouseMoveAnimation.play();

  const enemyCockroachGltf = await loader.loadAsync('./public/models/cockroach_minecraft.glb');
  enemyCockroach = enemyCockroachGltf.scene.getObjectByName(enemyCockroachGltf.scene.name) as THREE.Mesh;
  enemyCockroach.scale.set(3, 3, 3);
  enemyCockroachMixer = new THREE.AnimationMixer(enemyCockroach);
  enemyCockroachMoveAnimation = enemyCockroachMixer.clipAction(enemyCockroachGltf.animations[0]);
  enemyCockroachMoveAnimation.play();

  const weaponBananaKatanaGltf = await loader.loadAsync('./public/models/batana.glb');
  weaponBananaKatana = weaponBananaKatanaGltf.scene.getObjectByName(weaponBananaKatanaGltf.scene.name) as THREE.Mesh;
  weaponBananaKatana.position.set(CHARACTER_SPAWN_LOCATION.x,
    CHARACTER_SPAWN_LOCATION.y,
    CHARACTER_SPAWN_LOCATION.z);
  weaponBananaKatanaCollision = new THREE.Box3();
  weaponBananaKatanaCollision.setFromObject(weaponBananaKatana);

  // const weaponBananaGunGltf = await loader.loadAsync('./public/models/banana_pistol.glb');
  // weaponBananaGun = weaponBananaGunGltf.scene;
  // const weaponBananaGunAmmoGltf = await loader.loadAsync('./public/models/banana.glb');
  // weaponBananaGunAmmo = weaponBananaGunAmmoGltf.scene;
  // const weaponBananaBombGltf = await loader.loadAsync('./public/models/banana_peel_mario_kart.glb');
  // weaponBananaBomb = weaponBananaBombGltf.scene;

  // #endregion

  // #region Main Surface

  // Add a Plane for the surface
  menuPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x0080bf })
  );
  menuPlane.rotateX(-Math.PI / 2);
  menuPlane.position.y = 9;
  menuPlane.receiveShadow = true;
  menuPlane.castShadow = true;
  scene.add(menuPlane);

  mainPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x0080bf })
  );
  mainPlane.rotateX(-Math.PI / 2);
  mainPlane.receiveShadow = true;
  mainPlane.castShadow = true;
  scene.add(mainPlane);

  gamePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x0080bf })
  );
  gamePlane.rotateX(-Math.PI / 2);
  gamePlane.receiveShadow = true;
  gamePlane.castShadow = true;
  // scene.add(gamePlane);

  // #endregion

  // #region Sound

  const audioLoader = new THREE.AudioLoader(loadingManager);
  listener = new THREE.AudioListener();
  camera.add(listener);
  bgmSound = new THREE.Audio(listener);
  loseSound = new THREE.Audio(listener);
  survivalSound = new THREE.Audio(listener);
  hitSound = new THREE.Audio(listener);

  audioLoader.load("./public/sounds/BGM.ogg", function (buffer) {
    bgmSound.setBuffer(buffer);
    bgmSound.setLoop(true);
    bgmSound.setVolume(0.2);
  });

  audioLoader.load("./public/sounds/lose.ogg", function (buffer) {
    loseSound.setBuffer(buffer);
    loseSound.setLoop(false);
    loseSound.setVolume(.5);
  });

  audioLoader.load("./public/sounds/survival.ogg", function (buffer) {
    survivalSound.setBuffer(buffer);
    survivalSound.setLoop(true);
    survivalSound.setVolume(.25);
  });

  audioLoader.load("./public/sounds/hit.ogg", function (buffer) {
    hitSound.setBuffer(buffer);
    hitSound.setLoop(false);
    hitSound.setVolume(.25);
  });

  // #endregion


  EventTick();
}

function render() {
  composer.render();
}

// #region Character

// Character Movement

function CharacterMoveUp(value: number) {
  character.position.x += deltaTime * value;
  camera.position.x += deltaTime * value;
  directionalLight.position.x += deltaTime * value;
  weaponBananaKatana.position.x += deltaTime * value;
}

function CharacterMoveRight(value: number) {
  character.position.z += deltaTime * value;
  camera.position.z += deltaTime * value;
  directionalLight.position.z += deltaTime * value;
  weaponBananaKatana.position.z += deltaTime * value;
}

// Other Character Function

// function CharacterTakeDamage(value: number) {
//   if (characterHP > 0) {
//     characterHP -= value;
//   }
// }

// #endregion

function BeginPlay() { }
BeginPlay();

// #region InputKey

const keyMap: { [key: string]: boolean } = {};
const onDocumentKey = (e: KeyboardEvent) => {
  keyMap[e.code] = e.type === "keydown";
};
document.addEventListener("keydown", onDocumentKey);
document.addEventListener("keyup", onDocumentKey);

// document.addEventListener("wheel", (e) => {
//   if (e.deltaY < 0) {
//     if ((camera.position.y < CAMERA_MAX_POSITION.y &&
//       camera.position.y > CAMERA_MIN_POSITION.y) ||
//       camera.position.y === CAMERA_MAX_POSITION.y) {
//       camera.position.x += 1;
//       camera.position.y -= 1;
//     }
//   } else {
//     if ((camera.position.y < CAMERA_MAX_POSITION.y &&
//       camera.position.y > CAMERA_MIN_POSITION.y) ||
//       camera.position.y === CAMERA_MIN_POSITION.y) {
//       camera.position.x -= 1;
//       camera.position.y += 1;
//     }
//   }  
// });

// #endregion

//#region Test Function

let EnemyList: { mesh: THREE.Mesh, movementSpeed: number, rotateOffset: number, healthPoint: number, collision: THREE.Box3 }[] = [];

function RandomNumber(min: number, max: number) {
  return min + Math.round(Math.random() * max);
}

function spawnEnemy(minRange: number, maxRange: number, movementSpeed: number) {
  if (EnemyList.length > 50) return;
  const randomEnemy = RandomNumber(0, 1);
  const enemy = randomEnemy ? enemyMouse.clone() : enemyCockroach.clone();
  const rotateOffset = randomEnemy ? .5 * Math.PI : Math.PI;
  const enemyCollision = new THREE.Box3().setFromObject(enemy, true);
  enemy.position.set(
    character.position.x +
    (RandomNumber(0, 1)
      ? RandomNumber(minRange, maxRange)
      : -RandomNumber(minRange, maxRange)),
    1,
    character.position.z +
    (RandomNumber(0, 1)
      ? RandomNumber(minRange, maxRange)
      : -RandomNumber(minRange, maxRange))
  );
  EnemyList.push({ mesh: enemy, movementSpeed: movementSpeed, rotateOffset: rotateOffset, healthPoint: 10, collision: enemyCollision });
  scene.add(enemy);
}

//#endregion

function EventTick() {
  requestAnimationFrame(EventTick);
  if (characterHP <= 0) {
    bIsCharacterDead = true;
    if (survivalSound.isPlaying) survivalSound.stop();
    if (!loseSound.isPlaying) loseSound.play();
  }
  if (keyMap["KeyR"] && bIsCharacterDead) resetTheGame();
  if (!bIsCharacterDead) {
    cameraControl2.target.set(character.position.x, character.position.y, character.position.z);
    cameraControl2.update();
    deltaTime = clock.getDelta();

    if (bIsAccessPortfolio) accessPortfolio(deltaTime);

    characterMixer.update(deltaTime);
    if (bIsTriggerSurvivalMode) {
      if (bIsInitSurvivalMode) {
        RunSurvivalMode(deltaTime);
      } else {
        enemyMouseMixer.update(deltaTime);
        enemyCockroachMixer.update(deltaTime);
        enemyCockroachMoveAnimation.play();
        weaponBananaKatana.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), .5)
        weaponBananaKatanaCollision.setFromObject(weaponBananaKatana, true);
      }
    }
    characterCollision.setFromObject(character, true);
    if (!bIsTriggerSurvivalMode && characterCollision.intersectsBox(redButtonCollision)) {
      RunSurvivalMode(0);
    }
    // if (runCodeEachSeconds(clock.getElapsedTime(), 3)) {
    //   // console.log("hiii");
    //   // spawnEnemy(0, 20);
    // }

    EnemyList.forEach((enemy) => {
      if (enemy.healthPoint > 0) {
        enemy.collision.setFromObject(enemy.mesh, true);
        if (enemy.collision.intersectsBox(weaponBananaKatanaCollision)) {
          enemy.healthPoint -= .5;
        } else if (enemy.collision.intersectsBox(characterCollision)) {
          enemy.healthPoint -= 1;
          characterHP -= 1;
        }
        let targetNormalizedVector = new THREE.Vector3(
          character.position.x - enemy.mesh.position.x,
          character.position.y - enemy.mesh.position.y,
          character.position.z - enemy.mesh.position.z
        );
        targetNormalizedVector.normalize();
        enemy.mesh.lookAt(character.position);
        enemy.mesh.rotateY(enemy.rotateOffset);
        enemy.mesh.position.addScaledVector(targetNormalizedVector, .1);
      } else {
        scene.remove(enemy.mesh);
        EnemyList.splice(EnemyList.indexOf(enemy), 1);
      }
    });

    // #region Movement and Controls
    if (!bIsInitSurvivalMode && !bIsAccessPortfolio) {
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
        characterMoveAnimation.stop();
        characterIdleAnimation.play();
      }
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
      characterMoveAnimation.stop();
      characterIdleAnimation.play();
    } else {
      characterIdleAnimation.stop();
      characterMoveAnimation.play();
    }
    // #endregion
  }
  stats.update();
  render();
}

function resetTheGame() {
  // characterHP = CHARACTER_HEALTH_POINT;
  // character.position.set(CHARACTER_SPAWN_LOCATION.x,
  //   CHARACTER_SPAWN_LOCATION.y,
  //   CHARACTER_SPAWN_LOCATION.z);
  // camera.position.set(
  //   CAMERA_DEFAULT_POSITION.x + CHARACTER_SPAWN_LOCATION.x,
  //   CAMERA_DEFAULT_POSITION.y + CHARACTER_SPAWN_LOCATION.y,
  //   CAMERA_DEFAULT_POSITION.z + CHARACTER_SPAWN_LOCATION.z
  // );
  // directionalLight.position.set(
  //   DIRECTIONAL_LIGHT_SPAWN_LOCATION.x,
  //   DIRECTIONAL_LIGHT_SPAWN_LOCATION.y,
  //   DIRECTIONAL_LIGHT_SPAWN_LOCATION.z);
  // weaponBananaKatana.position.set(
  //   CHARACTER_SPAWN_LOCATION.x,
  //   CHARACTER_SPAWN_LOCATION.y,
  //   CHARACTER_SPAWN_LOCATION.z);
  // EnemyList.forEach((enemy) => {
  //   scene.remove(enemy.mesh);
  //   EnemyList.splice(EnemyList.indexOf(enemy), 1);
  //   if (EnemyList.length === 0) {
  //     bIsCharacterDead = false;
  //     bIsTriggerSurvivalMode = false;
  //   }
  // });
  location.reload();
}

function RunSurvivalMode(deltaTime: number) {
  bIsInitSurvivalMode = true;
  bIsTriggerSurvivalMode = true;
  if (bgmSound.isPlaying) bgmSound.stop();
  if (!survivalSound.isPlaying) survivalSound.play();
  if (portfolioModel.position.y > -19.9) {
    portfolioModel.position.y -= deltaTime * 3;
    redButton.position.y -= deltaTime * 3;
    if (cameraControl2.minDistance < cameraControl2.maxDistance) {
      cameraControl2.minDistance += deltaTime * 3
    }
    if (directionalLight.intensity < 5)
      directionalLight.intensity += deltaTime / 2;
  } else {

    bIsInitSurvivalMode = false;
    redButtonCollision.makeEmpty;
    scene.add(weaponBananaKatana);
    for (let i = 0; i < 10; i++) {
      setInterval(() => {
        spawnEnemy(50, 100, 10);
      }, 3000)
    }
  }
}

function accessPortfolio(deltaTime: number) {
  // if (cameraControl2.maxDistance > 15) {
  //   console.log(cameraControl2.minDistance);
  //   if (cameraControl2.minDistance > 5)
  //     cameraControl2.minDistance -= (deltaTime * 10); // reduce by lerp
  //   cameraControl2.maxDistance -= (deltaTime * 5);
  // } else {
  //   if (menuPlane.position.y < -0.9) {
  //     cameraControl2.minDistance = 5
  //     cameraControl2.maxDistance = 30;
  //     bIsAccessPortfolio = false;
  //   }
  // }
  // 

  if (menuPlane.position.y < -0.9) {
    bIsAccessPortfolio = false;
  } else { menuPlane.position.y -= deltaTime * 5; }
}