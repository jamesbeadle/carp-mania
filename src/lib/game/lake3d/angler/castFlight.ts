import { Vector3 } from 'three';

const Flight = { LeastSeconds: 0.8, SecondsPerMetre: 0.018, ArcShare: 0.28 } as const;

export interface CastFlight {
	from: Vector3;
	to: Vector3;
	seconds: number;
	elapsed: number;
}

export function castFlightBetween(from: Vector3, to: Vector3): CastFlight {
	const metres = from.distanceTo(to);
	return { from: from.clone(), to: to.clone(), seconds: Flight.LeastSeconds + metres * Flight.SecondsPerMetre, elapsed: 0 };
}

export function leadPositionOf(flight: CastFlight) {
	const share = Math.min(1, flight.elapsed / flight.seconds);
	const position = new Vector3().lerpVectors(flight.from, flight.to, share);
	const arc = flight.from.distanceTo(flight.to) * Flight.ArcShare;
	position.y += 4 * arc * share * (1 - share);
	return position;
}

export function hasLanded(flight: CastFlight) {
	return flight.elapsed >= flight.seconds;
}
