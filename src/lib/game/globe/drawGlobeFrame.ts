import type { WorldPin } from '$lib/contracts/WorldPin';
import type { GlobePoint } from '$lib/domain/world/greatCircle';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { clusterPins, projectPins } from './clusterPins';
import { drawArcs } from './drawArcs';
import { drawGlobe } from './drawGlobe';
import { drawPinMarkers, drawPlotMarker } from './drawPins';
import { drawPulses } from './drawPulses';
import type { GlobeState } from './globeState.svelte';
import { projectionFor, type Viewport } from './projection';
import { drawRegionShade } from './regionOnGlobe';

export type GlobeMode = 'browse' | 'choose_plot';

export interface GlobeScene {
	pins: WorldPin[];
	mode: GlobeMode;
	region: RegionCode | null;
	plot: GlobePoint | null;
}

export function drawGlobeFrame(context: CanvasRenderingContext2D, viewport: Viewport, globe: GlobeState, scene: GlobeScene, now: number) {
	const projection = projectionFor(globe.view, viewport);
	globe.projection = projection;
	context.clearRect(0, 0, viewport.width, viewport.height);
	drawGlobe(context, projection);
	if (scene.mode === 'choose_plot' && scene.region) drawRegionShade(context, projection, scene.region);
	drawArcs(context, projection, globe.view, globe.arcs, now);
	drawPulses(context, projection, globe.view, globe.pulses, now);
	globe.markers = clusterPins(projectPins(projection, globe.view, scene.pins), globe.view.zoom);
	drawPinMarkers(context, globe.markers, globe.hoveredPinId, globe.selectedPinId);
	if (scene.plot) drawPlotMarker(context, projection, globe.view, scene.plot);
}
