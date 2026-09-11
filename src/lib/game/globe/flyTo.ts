import type { GlobeView } from './projection';

export interface Flight {
	from: GlobeView;
	to: GlobeView;
	startedAt: number;
}

export const FlightDurationMs = 900;
const FullCircleDegrees = 360;
const HalfCircleDegrees = 180;

export function startFlight(from: GlobeView, to: GlobeView, now: number): Flight {
	return { from, to, startedAt: now };
}

export function isFlightOver(flight: Flight, now: number) {
	return now - flight.startedAt >= FlightDurationMs;
}

export function viewDuringFlight(flight: Flight, now: number): GlobeView {
	const progress = easeInOut(Math.min(1, (now - flight.startedAt) / FlightDurationMs));
	const { from, to } = flight;
	return {
		centre: {
			latitude: from.centre.latitude + (to.centre.latitude - from.centre.latitude) * progress,
			longitude: from.centre.longitude + shortestTurn(from.centre.longitude, to.centre.longitude) * progress
		},
		zoom: from.zoom * (to.zoom / from.zoom) ** progress
	};
}

export function shortestTurn(fromLongitude: number, toLongitude: number) {
	return ((toLongitude - fromLongitude + HalfCircleDegrees * 3) % FullCircleDegrees) - HalfCircleDegrees;
}

function easeInOut(share: number) {
	if (share < 0.5) return 4 * share ** 3;
	return 1 - (-2 * share + 2) ** 3 / 2;
}
