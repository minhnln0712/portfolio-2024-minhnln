import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Character {
  moveSpeed: number;
  characterMesh!: THREE.Mesh;
  readonly bIsCharacter: boolean = true;
  constructor(modelSrc: string, moveSpeed: number) {
    this.moveSpeed = moveSpeed;
    new GLTFLoader().load(modelSrc, (gltf) => {
      this.characterMesh = gltf.scene.getObjectByName(
        gltf.scene.name
      ) as THREE.Mesh;
    //   mixer = new THREE.AnimationMixer(gltf.scene);
    //   moveAnimation = mixer.clipAction(gltf.animations[0]);
    //   character.position.set(0, 1, 0);
    //   character.rotateY(-0.5 * Math.PI);
    //   scene.add(character);
    //   camera.lookAt(character.position);
    });
  }
  MoveForward(value: number) {}
  MoveRight(value: number) {}
}
