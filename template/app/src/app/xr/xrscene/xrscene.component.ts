import { AfterViewInit, Component, ElementRef, NgZone } from '@angular/core';
import * as THREE from 'three';
//import { ARButton } from 'https://unpkg.com/three/examples/jsm/webxr/ARButton.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';

@Component({
  selector: 'app-xrscene',
  templateUrl: './xrscene.component.html',
  styleUrls: ['./xrscene.component.scss']
})
export class XRSceneComponent implements AfterViewInit {

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private animateFn = this.animate.bind(this);

  private controller!: THREE.XRTargetRaySpace;
  private mesh!: THREE.Mesh;

  constructor(private element: ElementRef<HTMLElement>, private zone: NgZone) { }

  ngAfterViewInit(): void {
    this.initialize();
  }

  initialize() {
    const el = this.element.nativeElement;
    const rect = el.getBoundingClientRect();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, rect.width / rect.height, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.xr.enabled = true;
    el.appendChild(this.renderer.domElement);
    el.appendChild(ARButton.createButton(this.renderer));

    const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select', this.onSelect.bind(this));
    this.scene.add(this.controller);

    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    //this.camera.position.z = 5;

    this.zone.runOutsideAngular(() => {
      //this.animate();
      this.renderer.setAnimationLoop(this.animateFn);
    });
  }

  private onWindowResize() {
    const rect = this.element.nativeElement.getBoundingClientRect();

    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(rect.width, rect.height);
  }

  private onSelect() {
    this.mesh.position.set(0, 0, 5).applyMatrix4(this.controller.matrixWorld);
    this.mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
  }

  private animate() {
    //requestAnimationFrame(this.animateFn);

    /*this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;*/

    this.renderer.render(this.scene, this.camera);
  }
}
