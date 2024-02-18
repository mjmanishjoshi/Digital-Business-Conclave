import { Directive, Input } from "@angular/core";

@Directive({
    selector: 'app-xrscene-object'
})
export class XRSceneObject {
    @Input()
    lat!: number;

    @Input()
    lon!: number;

    @Input()
    stlPath!: string;

    mesh!: THREE.Mesh;
}