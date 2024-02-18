import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XRSceneComponent } from './xrscene/xrscene.component';
import { XRSceneObject } from './scene';



@NgModule({
  declarations: [
    XRSceneComponent,
    XRSceneObject
  ],
  imports: [
    CommonModule
  ],
  exports: [
    XRSceneComponent,
    XRSceneObject
  ]
})
export class XRModule { }
