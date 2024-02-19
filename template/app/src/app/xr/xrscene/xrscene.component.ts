import {
  AfterContentInit, AfterViewInit, Component, ContentChildren,
  Directive, ElementRef, Input, NgZone, QueryList
} from '@angular/core';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { GUI } from 'dat.gui';


interface SceneObject {
  id: number,
  mesh: THREE.Object3D,//THREE.Mesh,
  color: number
}

@Component({
  selector: 'app-xrscene',
  templateUrl: './xrscene.component.html',
  styleUrls: ['./xrscene.component.scss']
})
export class XRSceneComponent implements AfterViewInit, AfterContentInit {

  private isXR = true;/*/Android|mobile|iPad|iPhone/i.test(navigator.userAgent);*/

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private controller!: THREE.XRTargetRaySpace;

  constructor(private element: ElementRef<HTMLElement>, private zone: NgZone) {
  }

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  private initialize() {
    const el = this.element.nativeElement;
    const rect = el.getBoundingClientRect();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, rect.width / rect.height, 0.01, 100);

    // Lighting - https://threejs.org/examples/webxr_ar_lighting.html
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    if (this.isXR) {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(rect.width, rect.height);
      this.renderer.xr.enabled = true;
      el.appendChild(this.renderer.domElement);
      el.appendChild(ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] }));
    }
    else {
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(rect.width, rect.height);
      el.appendChild(this.renderer.domElement);
    }

    this.initializeScene();

    if (this.isXR) {
      this.controller = this.renderer.xr.getController(0);
      this.controller.addEventListener('select', this.onSelect.bind(this));
      this.scene.add(this.controller);
    }

    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    //this.zone.runOutsideAngular(() => {
    this.renderer.setAnimationLoop(this.render.bind(this));
    //});
  }

  private onWindowResize() {
    const rect = this.element.nativeElement.getBoundingClientRect();

    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(rect.width, rect.height);
  }

  private onSelect() {
    if (this.reticle.visible)
      this.addObject();
  }

  private hitTestSource: XRHitTestSource | null = null;
  private hitTestSourceRequested = false;

  private render(time: DOMHighResTimeStamp, frame: XRFrame) {
    if (frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();
      if (session && this.hitTestSourceRequested === false) {
        session.requestReferenceSpace('viewer').then((referenceSpace) => {
          if (session.requestHitTestSource)
            session.requestHitTestSource({ space: referenceSpace })?.then((source) => {
              this.hitTestSource = source;
            });
        });

        session.addEventListener('end', () => {
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
        });

        this.hitTestSourceRequested = true;
      }

      if (referenceSpace && this.hitTestSource) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          this.reticle.visible = true;
          const pose = hit.getPose(referenceSpace)
          if (pose)
            this.reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          this.reticle.visible = false;
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  private gui!: GUI;

  private reticle!: THREE.Mesh;

  private initializeScene() {
    this.gui = new GUI();
    /*this.gui.domElement.style.visibility = 'hidden';
    const group = new InteractiveGroup(this.renderer, this.camera);
    this.scene.add(group);
    const mesh = new HTMLMesh(this.gui.domElement);
    mesh.position.x = - 0.75;
    mesh.position.y = 1.5;
    mesh.position.z = - 0.5;
    mesh.rotation.y = Math.PI / 4;
    mesh.scale.setScalar(2);
    group.add(mesh);*/
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
      new THREE.MeshBasicMaterial()
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
  }

  private nextObjectId = 0;
  private objects: SceneObject[] = [];
  //private loader = new GLTFLoader();

  private addObject() {
	// Also see this example
	// https://threejs.org/examples/?q=material#webgl_materials_car
    //this.loader.loadAsync('/assets/models/LightsPunctualLamp.glb').then((gltf) => {
      const color = Math.floor(0xffffff * Math.random());
      const object: SceneObject = {
        id: this.nextObjectId++,
        mesh: new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0),
          new THREE.MeshBasicMaterial({ color })),
        //mesh: gltf.scene,
        color
      }
      if (this.gui) {
        const cubeFolder = this.gui.addFolder(`Object ${object.id}`);
        cubeFolder.addColor(object, 'color').onChange((color) => {
          if (object.mesh instanceof THREE.Mesh) {
            const material = object.mesh.material;
            if (material instanceof THREE.MeshBasicMaterial) {
              material.color = new THREE.Color(color);
            }
          }
        });
      }
      this.objects.push(object);
      //object.mesh.position.set(0, 0, - 0.3).applyMatrix4(this.controller.matrixWorld);
      //object.mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
      let scale = new THREE.Vector3(1, 1, 1);
      this.reticle.matrix.decompose(object.mesh.position, object.mesh.quaternion, scale); //mesh.scale
      this.scene.add(object.mesh);
    //});
  }
}
