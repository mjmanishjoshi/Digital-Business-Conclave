import { AfterContentInit, AfterViewInit, Component, ContentChildren, Directive, ElementRef, Input, NgZone, QueryList } from '@angular/core';
import * as THREE from 'three';
//import { ARButton } from 'https://unpkg.com/three/examples/jsm/webxr/ARButton.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { LocationService } from '../location.service';
import { ObjectService } from '../object.service';
import { XRSceneObject } from '../scene';

@Component({
  selector: 'app-xrscene',
  templateUrl: './xrscene.component.html',
  styleUrls: ['./xrscene.component.scss']
})
export class XRSceneComponent implements AfterViewInit, AfterContentInit {

  @ContentChildren(XRSceneObject)
  sceneObjects!: QueryList<XRSceneObject>;

  private isXR = /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private controller!: THREE.XRTargetRaySpace;

  constructor(private element: ElementRef<HTMLElement>, private zone: NgZone,
    private location: LocationService, private objects: ObjectService) {
  }

  ngAfterContentInit(): void {
    if (this.sceneObjects)
      this.objects.setObjects(this.sceneObjects);
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  private initialize() {
    const el = this.element.nativeElement;
    const rect = el.getBoundingClientRect();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, rect.width / rect.height, 0.01, 1000);
    //this.camera.position.set( 3, 0.15, 3 );

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    if (this.isXR) {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(rect.width, rect.height);
      this.renderer.xr.enabled = true;
      el.appendChild(this.renderer.domElement);
      el.appendChild(ARButton.createButton(this.renderer));
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
    this.renderer.setAnimationLoop(this.animate.bind(this));
    //});
  }

  private onWindowResize() {
    const rect = this.element.nativeElement.getBoundingClientRect();

    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(rect.width, rect.height);
  }

  private onSelect() {
    //this.mesh.position.set(0, 0, 5).applyMatrix4(this.controller.matrixWorld);
    //this.mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
  }

  private animate() {
    this.animateScene();
    this.renderer.render(this.scene, this.camera);
  }

  private mesh!: THREE.Mesh;

  private initializeScene() {
    const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    this.mesh.position.set(0, 0, -1);
    this.objects.initialize(this.scene);
  }

  private animateScene() {
    this.objects.update();
    this.location.update(this.camera, this.sceneObjects);
  }
}
