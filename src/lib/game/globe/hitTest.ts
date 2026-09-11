import type { PinMarker } from './clusterPins';
import { clusterRadiusFor, pinSizeFor } from './drawPins';

const MinimumHitRadiusPx = 10;

export function markerAt(markers: PinMarker[], x: number, y: number): PinMarker | null {
	let nearest: PinMarker | null = null;
	let nearestDistance = Number.POSITIVE_INFINITY;
	for (const marker of markers) {
		const distance = Math.hypot(marker.x - x, marker.y - y);
		if (distance > hitRadiusOf(marker) || distance >= nearestDistance) continue;
		nearest = marker;
		nearestDistance = distance;
	}
	return nearest;
}

function hitRadiusOf(marker: PinMarker) {
	if (marker.kind === 'cluster') return clusterRadiusFor(marker);
	return Math.max(MinimumHitRadiusPx, pinSizeFor(marker.pin.heaviestLb));
}
