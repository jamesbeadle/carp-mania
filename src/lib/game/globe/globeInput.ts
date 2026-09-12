import { shortestTurn } from './flyTo';
import { GlobeZoom, type GlobeView } from './projection';

export interface SpinVelocity {
	latitudeDegreesPerSecond: number;
	longitudeDegreesPerSecond: number;
}

export const StillVelocity: SpinVelocity = { latitudeDegreesPerSecond: 0, longitudeDegreesPerSecond: 0 };

const DegreesPerRadian = 180 / Math.PI;
const PoleLatitude = 90;
const HalfCircleDegrees = 180;
const FullCircleDegrees = 360;
const Inertia = { KeptPerSecond: 0.03, StopBelowDegreesPerSecond: 0.4, BlendIntoPrevious: 0.6 } as const;
const WheelZoom = { PerPixel: 0.0018, PerLine: 0.06, PerPage: 0.6 } as const;
const WheelUnitsPerDeltaMode = [WheelZoom.PerPixel, WheelZoom.PerLine, WheelZoom.PerPage];

export function rotatedView(view: GlobeView, deltaXPx: number, deltaYPx: number, radiusPx: number): GlobeView {
	const degreesPerPixel = DegreesPerRadian / Math.max(1, radiusPx);
	return withCentre(view, view.centre.latitude + deltaYPx * degreesPerPixel, view.centre.longitude - deltaXPx * degreesPerPixel);
}

export function spunView(view: GlobeView, velocity: SpinVelocity, secondsElapsed: number): GlobeView {
	return withCentre(view, view.centre.latitude + velocity.latitudeDegreesPerSecond * secondsElapsed, view.centre.longitude + velocity.longitudeDegreesPerSecond * secondsElapsed);
}

export function zoomedView(view: GlobeView, factor: number): GlobeView {
	return { ...view, zoom: clampedZoom(view.zoom * factor) };
}

export function clampedZoom(zoom: number) {
	return Math.min(GlobeZoom.Maximum, Math.max(GlobeZoom.Minimum, zoom));
}

export function wheelZoomFactor(event: WheelEvent) {
	const unitsPerDelta = WheelUnitsPerDeltaMode[event.deltaMode] ?? WheelZoom.PerPixel;
	return Math.exp(-event.deltaY * unitsPerDelta);
}

export function velocityAfterMove(previous: SpinVelocity, before: GlobeView, after: GlobeView, secondsSinceLastMove: number): SpinVelocity {
	if (secondsSinceLastMove <= 0) return previous;
	const instantaneous = {
		latitudeDegreesPerSecond: (after.centre.latitude - before.centre.latitude) / secondsSinceLastMove,
		longitudeDegreesPerSecond: shortestTurn(before.centre.longitude, after.centre.longitude) / secondsSinceLastMove
	};
	return blend(previous, instantaneous, Inertia.BlendIntoPrevious);
}

export function decayedVelocity(velocity: SpinVelocity, secondsElapsed: number): SpinVelocity {
	const kept = Inertia.KeptPerSecond ** secondsElapsed;
	const decayed = { latitudeDegreesPerSecond: velocity.latitudeDegreesPerSecond * kept, longitudeDegreesPerSecond: velocity.longitudeDegreesPerSecond * kept };
	return isStill(decayed) ? StillVelocity : decayed;
}

export function isStill(velocity: SpinVelocity) {
	return Math.hypot(velocity.latitudeDegreesPerSecond, velocity.longitudeDegreesPerSecond) < Inertia.StopBelowDegreesPerSecond;
}

function withCentre(view: GlobeView, latitude: number, longitude: number): GlobeView {
	return { ...view, centre: { latitude: Math.min(PoleLatitude, Math.max(-PoleLatitude, latitude)), longitude: wrapLongitude(longitude) } };
}

function wrapLongitude(longitude: number) {
	return ((((longitude + HalfCircleDegrees) % FullCircleDegrees) + FullCircleDegrees) % FullCircleDegrees) - HalfCircleDegrees;
}

function blend(previous: SpinVelocity, next: SpinVelocity, keepShare: number): SpinVelocity {
	return {
		latitudeDegreesPerSecond: previous.latitudeDegreesPerSecond * keepShare + next.latitudeDegreesPerSecond * (1 - keepShare),
		longitudeDegreesPerSecond: previous.longitudeDegreesPerSecond * keepShare + next.longitudeDegreesPerSecond * (1 - keepShare)
	};
}
