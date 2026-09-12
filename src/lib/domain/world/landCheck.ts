import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import landTopology from '../../data/land-110m.json' with { type: 'json' };

export const landFeature = feature(landTopology as unknown as Topology, landTopology.objects.land as GeometryCollection);

export function isOnLand(latitude: number, longitude: number) {
	return geoContains(landFeature, [longitude, latitude]);
}
