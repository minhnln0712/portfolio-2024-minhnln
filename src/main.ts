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
const clock = new THREE.Clock();
let deltaTime: number;
let bIsTriggerSurvivalMode: boolean;

// Camera
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
const CAMERA_DEFAULT_POSITION = new THREE.Vector3(-10, 10, 0);
const CAMERA_MAX_POSITION = new THREE.Vector3(-20, 20, 0);
const CAMERA_MIN_POSITION = new THREE.Vector3(-5, 5, 0);
let renderScene: RenderPass;
let bloomPass: UnrealBloomPass;
let composer: EffectComposer;
let outputPass: OutputPass;


// Character Init

const CHARACTER_MOVE_SPEED: number = 10;
const CHARACTER_HEALTH_POINT: number = 100;
let characterHP = 100;
let bIsCharacterDead = false;
const CHARACTER_SPAWN_LOCATION = new THREE.Vector3(-40, 0, -30);

let character: THREE.Mesh;
let characterMixer: THREE.AnimationMixer;
let characterIdleAnimation: THREE.AnimationAction;
let characterMoveAnimation: THREE.AnimationAction;
let characterCollision: THREE.Box3;

// Model
let menuPlane: THREE.Mesh;
let mainPlane: THREE.Mesh;
let gamePlane: THREE.Mesh;

let enemyMouse: THREE.Mesh;
let enemyMouseMixer: THREE.AnimationMixer;
let enemyMouseMoveAnimation: THREE.AnimationAction;
let enemyMouseCollision: THREE.Box3;
let enemyCockroach: THREE.Mesh;
let enemyCockroachMixer: THREE.AnimationMixer;
let enemyCockroachMoveAnimation: THREE.AnimationAction;
let enemyCockroachCollision: THREE.Box3;

let weaponBananaKatana: THREE.Mesh;
let weaponBananaKatanaCollision: THREE.Box3;
let weaponBananaGun: THREE.Mesh;
let weaponBananaGunAmmo: THREE.Mesh;
let weaponBananaGunAmmoCollision: THREE.Box3;
let weaponBananaBomb: THREE.Mesh;
let weaponBananaBombCollision: THREE.Box3;

// Light

const DIRECTIONAL_LIGHT_SPAWN_LOCATION = new THREE.Vector3(CHARACTER_SPAWN_LOCATION.x - 20, 20, CHARACTER_SPAWN_LOCATION.z - 20);
let directionalLight: THREE.DirectionalLight;


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

  // #endregion

  // #region Light Init

  // directionalLight = new THREE.DirectionalLight(0x3d77a6, 1);
  directionalLight = new THREE.DirectionalLight(0xffffff, 3);
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
  scene.add(directionalLight);

  // const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(helper);

  // #endregion

  // Model
  const loader = new GLTFLoader();

  // #region Character Init

  const characterGltf = await loader.loadAsync('/public/models/bananacat.glb');
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
  camera.lookAt(character.position);
  directionalLight.target = character;

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

  const portfolioGltf = await loader.loadAsync('/public/models/PortfolioMesh.glb');
  const portfolioModel = portfolioGltf.scene;

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

  // Enemy Model


  const enemyMouseGltf = await loader.loadAsync('/public/models/mouse (1).glb');
  enemyMouse = enemyMouseGltf.scene.getObjectByName(enemyMouseGltf.scene.name) as THREE.Mesh;
  enemyMouse.scale.set(.4, .4, .4);
  enemyMouseMixer = new THREE.AnimationMixer(enemyMouse);
  enemyMouseMoveAnimation = enemyMouseMixer.clipAction(enemyMouseGltf.animations[0]);
  enemyMouseMoveAnimation.play();

  const enemyCockroachGltf = await loader.loadAsync('/public/models/cockroach_minecraft.glb');
  enemyCockroach = enemyCockroachGltf.scene.getObjectByName(enemyCockroachGltf.scene.name) as THREE.Mesh;
  enemyCockroach.scale.set(3, 3, 3);
  enemyCockroachMixer = new THREE.AnimationMixer(enemyCockroach);
  enemyCockroachMoveAnimation = enemyCockroachMixer.clipAction(enemyCockroachGltf.animations[0]);
  enemyCockroachMoveAnimation.play();





  const weaponBananaKatanaGltf = await loader.loadAsync('/public/models/batana.glb');
  weaponBananaKatana = weaponBananaKatanaGltf.scene.getObjectByName(weaponBananaKatanaGltf.scene.name) as THREE.Mesh;
  weaponBananaKatana.position.set(CHARACTER_SPAWN_LOCATION.x,
    CHARACTER_SPAWN_LOCATION.y,
    CHARACTER_SPAWN_LOCATION.z);
  weaponBananaKatanaCollision = new THREE.Box3();
  weaponBananaKatanaCollision.setFromObject(weaponBananaKatana);
  const helper = new THREE.Box3Helper(weaponBananaKatanaCollision, 0xffff00);
  helper.updateMatrixWorld(true)
  scene.add(helper);
  scene.add(weaponBananaKatana);

  character.frustumCulled = false;
  weaponBananaKatana.frustumCulled = false;

  characterCollision = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
  const helper2 = new THREE.Box3Helper(characterCollision, 0xff0000);
  helper2.updateMatrixWorld(true)
  scene.add(helper2);


  // const weaponBananaGunGltf = await loader.loadAsync('/public/models/banana_pistol.glb');
  // weaponBananaGun = weaponBananaGunGltf.scene;
  // const weaponBananaGunAmmoGltf = await loader.loadAsync('/public/models/banana.glb');
  // weaponBananaGunAmmo = weaponBananaGunAmmoGltf.scene;
  // const weaponBananaBombGltf = await loader.loadAsync('/public/models/banana_peel_mario_kart.glb');
  // weaponBananaBomb = weaponBananaBombGltf.scene;

  // #endregion

  // #region Main Surface

  // Add a Plane for the surface
  menuPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xfdda0d })
  );
  menuPlane.rotateX(-Math.PI / 2);
  // menuPlane.position.y = -1;
  menuPlane.receiveShadow = true;
  menuPlane.castShadow = true;
  // scene.add(menuPlane);

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
  EventTick();
}

function render() {
  composer.render();
}

// #region Sound

// const listener = new THREE.AudioListener();
// camera.add(listener);
// const sound = new THREE.Audio(listener);
// const audioLoader = new THREE.AudioLoader();
// audioLoader.load("/public/sounds/BGM.ogg", function (buffer) {
//   sound.setBuffer(buffer);
//   sound.setLoop(true);
//   sound.setVolume(0.2);
//   sound.play();
// });

// #endregion

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

function CharacterTakeDamage(value: number) {
  if (characterHP > 0) {
    characterHP -= value;
  }
}

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

document.addEventListener("wheel", (e) => {
  if (e.deltaY < 0) {
    if ((camera.position.y < CAMERA_MAX_POSITION.y &&
      camera.position.y > CAMERA_MIN_POSITION.y) ||
      camera.position.y === CAMERA_MAX_POSITION.y) {
      camera.position.x += 1;
      camera.position.y -= 1;
    }
  } else {
    if ((camera.position.y < CAMERA_MAX_POSITION.y &&
      camera.position.y > CAMERA_MIN_POSITION.y) ||
      camera.position.y === CAMERA_MIN_POSITION.y) {
      camera.position.x -= 1;
      camera.position.y += 1;
    }
  }

});

// #endregion

function runCodeEachSeconds(elapsedTime: number, eachSeconds: number) {
  if (
    Math.trunc(elapsedTime) % eachSeconds === 0
  ) {
    return true;
  }
  return false;
}

//#region Test Function

let EnemyList: { mesh: THREE.Mesh, movementSpeed: number, rotateOffset: number, healthPoint: number, collision: THREE.Box3 }[] = [];

function RandomNumber(min: number, max: number) {
  return min + Math.round(Math.random() * max);
}

function spawnEnemy(minRange: number, maxRange: number, movementSpeed: number) {

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

// new OrbitControls(camera, renderer.domElement);

function EventTick() {
  requestAnimationFrame(EventTick);
  if (characterHP <= 0) bIsCharacterDead = true;
  if (keyMap["KeyX"]) {
    console.log(EnemyList);

  }
  if (keyMap["KeyR"] && bIsCharacterDead) {

    characterHP = CHARACTER_HEALTH_POINT;
    character.position.set(CHARACTER_SPAWN_LOCATION.x,
      CHARACTER_SPAWN_LOCATION.y,
      CHARACTER_SPAWN_LOCATION.z);
    camera.position.set(
      CAMERA_DEFAULT_POSITION.x + CHARACTER_SPAWN_LOCATION.x,
      CAMERA_DEFAULT_POSITION.y + CHARACTER_SPAWN_LOCATION.y,
      CAMERA_DEFAULT_POSITION.z + CHARACTER_SPAWN_LOCATION.z
    );
    directionalLight.position.set(
      DIRECTIONAL_LIGHT_SPAWN_LOCATION.x,
      DIRECTIONAL_LIGHT_SPAWN_LOCATION.y,
      DIRECTIONAL_LIGHT_SPAWN_LOCATION.z);
    weaponBananaKatana.position.set(
      CHARACTER_SPAWN_LOCATION.x,
      CHARACTER_SPAWN_LOCATION.y,
      CHARACTER_SPAWN_LOCATION.z)
    EnemyList.forEach((enemy) => {
      scene.remove(enemy.mesh);
      EnemyList.splice(EnemyList.indexOf(enemy), 1);
      if (EnemyList.length === 0) {
        bIsCharacterDead = false;
        bIsTriggerSurvivalMode = false;
      }
    });
  }
  if (!bIsCharacterDead) {
    deltaTime = clock.getDelta();
    characterMixer.update(deltaTime);
    camera.lookAt(character.position);
    if (bIsTriggerSurvivalMode) {
      enemyMouseMixer.update(deltaTime);
      enemyCockroachMixer.update(deltaTime);
      enemyCockroachMoveAnimation.play();
      weaponBananaKatana.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), .5)
      weaponBananaKatanaCollision.setFromObject(weaponBananaKatana, true);
    }
    characterCollision.setFromObject(character, true);
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
    if (keyMap["KeyZ"]) {
      // spawnEnemy(10, 50, 5);
      // played = true;
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
