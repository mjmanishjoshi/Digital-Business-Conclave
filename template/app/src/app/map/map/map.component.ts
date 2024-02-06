import { AfterViewInit, Component, ElementRef } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  private map!: L.Map;

  constructor(private element: ElementRef<any>) { }

  ngAfterViewInit(): void {
    this.map = L.map(this.element.nativeElement, {
      center: [24.59926, 73.77602],
      zoom: 16
    });
    const marker = L.marker([24.59926, 73.77602], {
      icon: new L.Icon({
        iconUrl: '/assets/leaflet/marker-icon.png',
        shadowUrl: '/assets/leaflet/marker-shadow.png'
       })
    }).addTo(this.map);
    marker.bindPopup("<b>Hello world!</b><br>Pacific University").openPopup();
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tiles.addTo(this.map);
  }
}
