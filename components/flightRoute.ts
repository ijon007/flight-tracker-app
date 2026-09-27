import { airportByCode, type Airport } from './addFlightCatalog';

type Coord = { latitude: number; longitude: number };

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/**
 * Points along the great circle from a to b. MapKit fits the camera to the straight
 * bounding box of what it is given, so fitting to these keeps a long arc's bulge in view.
 */
export function greatCircle(a: Coord, b: Coord, segments = 32): Coord[] {
  const [lat1, lng1, lat2, lng2] = [rad(a.latitude), rad(a.longitude), rad(b.latitude), rad(b.longitude)];
  const h = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2;
  const d = 2 * Math.asin(Math.sqrt(h));
  if (d === 0) return [a, b];
  return Array.from({ length: segments + 1 }, (_, i) => {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    return { latitude: deg(Math.atan2(z, Math.hypot(x, y))), longitude: deg(Math.atan2(y, x)) };
  });
}

// ponytail: longitudes wrap at ±180, so a route over the antimeridian would fit the whole world.
// Unwrap the path (keep each step within 180° of the last) once the catalog has Pacific routes.
export function flightRoute(from: string, to: string): { from: Airport; to: Airport; path: Coord[] } | null {
  const a = airportByCode(from);
  const b = airportByCode(to);
  if (!a || !b) return null;
  return { from: a, to: b, path: greatCircle(a, b) };
}
