import { MathUtils, Vector3 } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { Daylight } from '$lib/domain/world/hourOfDay';
import { sunArcPosition } from '../sky/skyPalette';

const HighestSunDegrees: Record<SeasonName, number> = { winter: 16, spring: 40, summer: 58, autumn: 34 };
const Twilight = { DegreesPerHour: 8, Deepest: -18 } as const;
const DaylightHours = Daylight.SunsetAt - Daylight.SunriseAt;
const SkyDistance = 4000;
const EastAzimuthDegrees = 90;
const HalfTurnDegrees = 180;

export interface SunPlacement {
	direction: Vector3;
	elevationDegrees: number;
	isUp: boolean;
}

function belowTheHorizon(across: number) {
	const hoursAway = (across < 0 ? -across : across - 1) * DaylightHours;
	return Math.max(Twilight.Deepest, -hoursAway * Twilight.DegreesPerHour);
}

export function sunPlacementAt(hour: number, season: SeasonName): SunPlacement {
	const arc = sunArcPosition(hour);
	const elevationDegrees = arc.isUp ? arc.altitude * HighestSunDegrees[season] : belowTheHorizon(arc.across);
	const azimuthDegrees = EastAzimuthDegrees - Math.min(1, Math.max(0, arc.across)) * HalfTurnDegrees;
	const phi = MathUtils.degToRad(90 - elevationDegrees);
	const theta = MathUtils.degToRad(azimuthDegrees);
	const direction = new Vector3().setFromSphericalCoords(1, phi, theta);
	return { direction, elevationDegrees, isUp: arc.isUp };
}

export function sunSkyPositionOf(sun: SunPlacement) {
	return sun.direction.clone().multiplyScalar(SkyDistance);
}
