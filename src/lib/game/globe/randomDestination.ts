import type { GlobePoint } from '$lib/domain/world/greatCircle';
import { isOnLand } from '$lib/domain/world/landCheck';

const HalfCircleDegrees = 180;
const DegreesToRadians = Math.PI / HalfCircleDegrees;
const LandSearchAttempts = 60;
const CarpLatitudes = { South: -50, North: 70 } as const;
const SomewhereFamiliar: GlobePoint = { latitude: 51.5, longitude: -0.12 };

export function randomDestination(pins: GlobePoint[]): GlobePoint {
	if (pins.length > 0) return pins[Math.floor(Math.random() * pins.length)];
	return randomLandPoint();
}

function randomLandPoint(): GlobePoint {
	for (let attempt = 0; attempt < LandSearchAttempts; attempt++) {
		const candidate = randomSurfacePoint();
		if (isOnLand(candidate.latitude, candidate.longitude)) return candidate;
	}
	return SomewhereFamiliar;
}

function randomSurfacePoint(): GlobePoint {
	const southernLimit = Math.sin(CarpLatitudes.South * DegreesToRadians);
	const northernLimit = Math.sin(CarpLatitudes.North * DegreesToRadians);
	const latitude = Math.asin(southernLimit + Math.random() * (northernLimit - southernLimit)) / DegreesToRadians;
	const longitude = Math.random() * HalfCircleDegrees * 2 - HalfCircleDegrees;
	return { latitude, longitude };
}
