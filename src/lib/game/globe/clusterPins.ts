import type { WorldPin } from '$lib/contracts/WorldPin';
import type { GeoProjection } from 'd3-geo';
import { projectVisible, type GlobeView } from './projection';

export interface ProjectedPin {
	pin: WorldPin;
	x: number;
	y: number;
}

export interface PinCluster {
	pins: WorldPin[];
	x: number;
	y: number;
}

export type PinMarker = ({ kind: 'pin' } & ProjectedPin) | ({ kind: 'cluster' } & PinCluster);

export const ClusterRules = { CellPx: 28, ClusterBelowZoom: 3 } as const;

export function projectPins(projection: GeoProjection, view: GlobeView, pins: WorldPin[]): ProjectedPin[] {
	return pins.flatMap((pin) => {
		const projected = projectVisible(projection, view, pin);
		return projected ? [{ pin, x: projected[0], y: projected[1] }] : [];
	});
}

export function clusterPins(projectedPins: ProjectedPin[], zoom: number): PinMarker[] {
	if (zoom >= ClusterRules.ClusterBelowZoom) return projectedPins.map(singlePin);
	const cells = new Map<string, ProjectedPin[]>();
	for (const projectedPin of projectedPins) {
		const key = cellKeyOf(projectedPin);
		cells.set(key, [...(cells.get(key) ?? []), projectedPin]);
	}
	return [...cells.values()].map(markerForCell);
}

export function clusterCentre(cluster: PinCluster) {
	const latitude = average(cluster.pins.map((pin) => pin.latitude));
	const longitude = average(cluster.pins.map((pin) => pin.longitude));
	return { latitude, longitude };
}

function markerForCell(members: ProjectedPin[]): PinMarker {
	if (members.length === 1) return singlePin(members[0]);
	return { kind: 'cluster', pins: members.map((member) => member.pin), x: average(members.map((member) => member.x)), y: average(members.map((member) => member.y)) };
}

function singlePin(projectedPin: ProjectedPin): PinMarker {
	return { kind: 'pin', ...projectedPin };
}

function cellKeyOf(projectedPin: ProjectedPin) {
	return `${Math.floor(projectedPin.x / ClusterRules.CellPx)}:${Math.floor(projectedPin.y / ClusterRules.CellPx)}`;
}

function average(values: number[]) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
