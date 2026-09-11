import { landFeature } from '$lib/domain/world/landCheck';
import { geoGraticule10, type GeoSphere } from 'd3-geo';

export { landFeature };

export const graticule = geoGraticule10();

export const Sphere: GeoSphere = { type: 'Sphere' };
