const EARTH = 40075016.68;
const HALF_EARTH = 20037508.34;

export class SphMercProjection {
    project(lon: number, lat: number) {
        return [this.lonToSphMerc(lon), this.latToSphMerc(lat)];
    }

    unproject(projected: number[]) {
        return [this.sphMercToLon(projected[0]), this.sphMercToLat(projected[1])];
    }

    lonToSphMerc(lon: number) {
        return (lon / 180) * HALF_EARTH;
    }

    latToSphMerc(lat: number) {
        var y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
        return (y * HALF_EARTH) / 180.0;
    }

    sphMercToLon(x: number) {
        return (x / HALF_EARTH) * 180.0;
    }

    sphMercToLat(y: number) {
        var lat = (y / HALF_EARTH) * 180.0;
        lat =
            (180 / Math.PI) *
            (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
        return lat;
    }

    getID() {
        return "epsg:3857";
    }
}