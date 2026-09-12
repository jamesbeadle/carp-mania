import { untrack } from 'svelte';
import type { GlobePoint } from '$lib/domain/world/greatCircle';
import type { GeoProjection } from 'd3-geo';
import type { PinMarker } from './clusterPins';
import type { GlobeArc } from './drawArcs';
import type { GlobePulse } from './drawPulses';
import { isFlightOver, startFlight, viewDuringFlight, type Flight } from './flyTo';
import { clampedZoom, decayedVelocity, isStill, rotatedView, spunView, StillVelocity, velocityAfterMove, zoomedView, type SpinVelocity } from './globeInput';
import { GlobeZoom, pointToGlobe, type GlobeView } from './projection';

const HomeView: GlobeView = { centre: { latitude: 48, longitude: 8 }, zoom: GlobeZoom.Fit };

export class GlobeState {
	view = $state<GlobeView>(HomeView);
	hoveredPinId = $state<string | null>(null);
	selectedPinId = $state<string | null>(null);
	arcs = $state<GlobeArc[]>([]);
	pulses = $state<GlobePulse[]>([]);
	markers: PinMarker[] = [];
	projection: GeoProjection | null = null;
	private flight: Flight | null = null;
	private velocity: SpinVelocity = StillVelocity;

	rotateBy(deltaXPx: number, deltaYPx: number, secondsSinceLastMove: number) {
		if (!this.projection) return;
		this.flight = null;
		const before = this.view;
		this.view = rotatedView(before, deltaXPx, deltaYPx, this.projection.scale());
		this.velocity = velocityAfterMove(this.velocity, before, this.view, secondsSinceLastMove);
	}

	zoomBy(factor: number) {
		this.flight = null;
		this.view = zoomedView(this.view, factor);
	}

	holdStill() {
		this.flight = null;
		this.velocity = StillVelocity;
	}

	flyTo(point: GlobePoint, zoom?: number) {
		this.velocity = StillVelocity;
		const from = untrack(() => $state.snapshot(this.view));
		this.flight = startFlight(from, { centre: { latitude: point.latitude, longitude: point.longitude }, zoom: clampedZoom(zoom ?? from.zoom) }, Date.now());
	}

	pointAt(x: number, y: number): GlobePoint | null {
		if (!this.projection) return null;
		return pointToGlobe(this.projection, x, y);
	}

	advance(secondsElapsed: number, now: number) {
		if (this.flight) return this.continueFlight(now);
		if (isStill(this.velocity)) return;
		this.view = spunView(this.view, this.velocity, secondsElapsed);
		this.velocity = decayedVelocity(this.velocity, secondsElapsed);
	}

	private continueFlight(now: number) {
		if (!this.flight) return;
		this.view = viewDuringFlight(this.flight, now);
		if (isFlightOver(this.flight, now)) this.flight = null;
	}
}
