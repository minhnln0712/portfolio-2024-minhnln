import * as THREE from "three";

export class Character {
    constructor(color:string) {
        this.color = color;
    }
this.Character = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: this.color });
cube.position.y = 2;
scene.add(cube);
camera.lookAt(cube.position);
}
