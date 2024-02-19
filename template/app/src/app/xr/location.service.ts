import { Injectable, QueryList } from '@angular/core';
import { GUI } from 'dat.gui';
import { SphMercProjection } from './projection';
import { XRSceneObject } from './scene';
import * as THREE from 'three';

declare var AbsoluteOrientationSensor: any;

export interface Position {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface Orientation {
  alpha: number;
  beta: number;
  gamma: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private isXR = /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);

  private gui?: GUI;

  private position: Position = {
    latitude: 24.56813,
    longitude: 73.65549,
    altitude: 0.0
  };
  private orientation: Orientation = {
    alpha: 0.0,
    beta: 0.0,
    gamma: 0.0
  };

  sensor!: any;
  quaternion!: number[];

  watchPositionId: number;

  proj = new SphMercProjection();

  constructor() {
    this.watchPositionId = navigator.geolocation.watchPosition(
      this.positionUpdated.bind(this),
      this.positionUpdateFailed.bind(this),
      {
        enableHighAccuracy: true
      });
    //navigator.geolocation.clearWatch(this.watchPositionId);
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", this.orientationUpdated.bind(this), true);
    }
    // AbsoluteOrientationSensor
    this.sensor = new AbsoluteOrientationSensor({ frequency: 60, referenceFrame: "device" });
    this.sensor.addEventListener("reading", this.orientationSensorRead.bind(this));
    this.sensor.addEventListener("error", (event: any) => {
      console.log(event);
    });
    this.sensor.start();
  }

  update(camera: THREE.PerspectiveCamera, objects: QueryList<XRSceneObject>) {
    if (!this.gui) {
      this.gui = new GUI();
      /*const orientationFolder = this.gui.addFolder('Orientation')
      orientationFolder.add(this.orientation, 'alpha', 0, 360);
      orientationFolder.add(this.orientation, 'beta', 0, 360);
      orientationFolder.add(this.orientation, 'gamma', 0, 360);
      orientationFolder.open();*/
      /*const quaternionFolder = this.gui.addFolder('Quaternion')
      quaternionFolder.add(this.quaternionStr, 'str');
      quaternionFolder.open();*/
    }
    if (objects) {
      const eye = this.proj.project(this.position.longitude, this.position.latitude);
      objects.forEach(item => {
        if (item.mesh) {
          const pos = this.proj.project(item.lon, item.lat);
          item.mesh.position.set(pos[0] - eye[0], 0, -(pos[1] - eye[1]));
        }
      });
    }
    // TODO
    // https://github.com/AR-js-org/AR.js/blob/e2f2893a7e0af8853687d34ca0aee7edf5321e9b/three.js/src/location-based/js/device-orientation-controls.js#L177
    // AbsoluteOrientationSensor
    let alpha = this.orientation.alpha ? THREE.MathUtils.degToRad(this.orientation.alpha) : 0; // Z
    let beta = this.orientation.beta ? THREE.MathUtils.degToRad(this.orientation.beta) : 0; // X'
    let gamma = this.orientation.gamma ? THREE.MathUtils.degToRad(this.orientation.gamma) : 0; // Y''
    const orient = window.screen.orientation ? THREE.MathUtils.degToRad(window.screen.orientation.angle) : 0; // O
    this.setObjectQuaternion(
      camera.quaternion, alpha, beta, gamma, orient
    );
    this.gui.updateDisplay();
  }

  private positionUpdated(position: GeolocationPosition) {
    if (this.isXR) {
      this.position.latitude = position.coords.latitude;
      this.position.longitude = position.coords.longitude;
      this.position.altitude = position.coords.altitude || 0;
    }
  }

  private orientationUpdated(event: DeviceOrientationEvent) {
    if (this.isXR) {
      this.orientation.alpha = event.alpha || 0;
      this.orientation.beta = event.beta || 0;
      this.orientation.gamma = event.gamma || 0;
    }
  }

  private orientationSensorRead() {
    if (this.isXR) {
      //model.quaternion.fromArray(this.sensor.quaternion).inverse();
      if (this.sensor.quaternion) {
        this.quaternion = this.sensor.quaternion;
      }
    }
  }

  private positionUpdateFailed(error: GeolocationPositionError) {
    console.log(error);
  }

  private lonLatToWorldCoords(lon: number, lat: number) {
    const projectedPos = this.proj.project(lon, lat);
    /*if (this.initialPositionAsOrigin) {
      if (this.initialPosition) {
        projectedPos[0] -= this.initialPosition[0];
        projectedPos[1] -= this.initialPosition[1];
      } else {
        throw "Trying to use 'initial position as origin' mode with no initial position determined";
      }
    }
    return [projectedPos[0], -projectedPos[1]];*/
  }

  private _zee = new THREE.Vector3(0, 0, 1);
  private _euler = new THREE.Euler();
  private _q0 = new THREE.Quaternion();
  private _q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

  private setObjectQuaternion(
    quaternion: THREE.Quaternion,
    alpha: number,
    beta: number,
    gamma: number,
    orient: number
  ) {
    this._euler.set(beta, alpha, -gamma, "YXZ"); // 'ZXY' for the device, but 'YXZ' for us

    quaternion.setFromEuler(this._euler); // orient the device

    quaternion.multiply(this._q1); // camera looks out the back of the device, not the top

    quaternion.multiply(this._q0.setFromAxisAngle(this._zee, -orient)); // adjust for screen orientation
  };
}
