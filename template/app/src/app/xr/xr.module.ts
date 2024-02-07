import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XRSceneComponent } from './xrscene/xrscene.component';



@NgModule({
  declarations: [
    XRSceneComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    XRSceneComponent
  ]
})
export class XRModule { }
