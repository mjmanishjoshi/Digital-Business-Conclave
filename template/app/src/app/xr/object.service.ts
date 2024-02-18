import { Injectable, QueryList } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { XRSceneObject } from './scene';

@Injectable({
  providedIn: 'root'
})
export class ObjectService {

  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private loader!: STLLoader;

  private isDirty = false;
  private objects!: QueryList<XRSceneObject>;

  constructor() { }

  initialize(scene: THREE.Scene) {
    this.scene = scene;
    this.loader = new STLLoader();
    this.update();
  }

  setObjects(objects: QueryList<XRSceneObject>) {
    this.objects = objects;
    objects.changes.subscribe(() => {
      this.isDirty = true;
    });
    this.isDirty = true;
  }

  update() {
    if (this.isDirty && this.objects) {
      this.loadObjects();
      this.isDirty = false;
    }
  }

  private loadObjects() {
    if (this.group)
      this.scene.remove(this.group);
    this.group = new THREE.Group();
    this.objects.forEach(item => this.loadObject(item));
    this.scene.add(this.group);
  }

  loadObject(item: XRSceneObject) {
    this.loader.load(item.stlPath, (geometry) => {
      const material = new THREE.MeshPhongMaterial({ color: 0xff9c7c, specular: 0x494949, shininess: 200 });
      item.mesh = new THREE.Mesh(geometry, material);

      this.group.add(item.mesh);
      item.mesh.position.set(0, 0, 0);
      //item.mesh.scale.set(0.5, 0.5, 0.5);
      item.mesh.rotateX(-Math.PI / 2);
    });
  }
}
