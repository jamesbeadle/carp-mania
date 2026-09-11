import type { GlobePoint } from '$lib/domain/world/greatCircle';
import { drawCanvasLabel } from '$lib/game/render/drawCanvasLabel';
import type { GeoProjection } from 'd3-geo';
import type { PinCluster, PinMarker, ProjectedPin } from './clusterPins';
import { GlobeFont, GlobePalette, pinColourFor } from './globePalette';
import { projectVisible, type GlobeView } from './projection';

export const PinSize = { MinimumPx: 8, MaximumPx: 16, HeaviestLbAtMaximum: 60 } as const;
export const ClusterRing = { RadiusPx: 12, RadiusPerTenPins: 1.5, MaximumRadiusPx: 20 } as const;
const PegShape = { HeightShare: 0.62, CornerRadius: 2.5, PlankSpacingShare: 0.3, EdgeWidth: 1, EmphasisedEdgeWidth: 2 } as const;
const PegShadow = { Blur: 6, OffsetY: 2 } as const;
const PlotMarkerLabel = 'Your plot';

export function pinSizeFor(heaviestLb: number) {
	const share = Math.min(1, Math.max(0, heaviestLb / PinSize.HeaviestLbAtMaximum));
	return PinSize.MinimumPx + (PinSize.MaximumPx - PinSize.MinimumPx) * share;
}

export function clusterRadiusFor(cluster: PinCluster) {
	return Math.min(ClusterRing.MaximumRadiusPx, ClusterRing.RadiusPx + (cluster.pins.length / 10) * ClusterRing.RadiusPerTenPins);
}

export function drawPinMarkers(context: CanvasRenderingContext2D, markers: PinMarker[], hoveredPinId: string | null, selectedPinId: string | null) {
	const isEmphasised = (marker: ProjectedPin) => marker.pin.id === hoveredPinId || marker.pin.id === selectedPinId;
	for (const marker of markers) {
		if (marker.kind === 'cluster') drawCluster(context, marker);
		if (marker.kind === 'pin') drawPeg(context, marker.x, marker.y, pinSizeFor(marker.pin.heaviestLb), pinColourFor(marker.pin.reputation), isEmphasised(marker));
	}
	for (const marker of markers) {
		if (marker.kind !== 'pin' || !isEmphasised(marker)) continue;
		const isSelected = marker.pin.id === selectedPinId;
		drawCanvasLabel(context, marker, marker.pin.name, isSelected ? GlobePalette.LabelSelected : GlobePalette.Label, isSelected);
	}
}

export function drawPlotMarker(context: CanvasRenderingContext2D, projection: GeoProjection, view: GlobeView, plot: GlobePoint) {
	const projected = projectVisible(projection, view, plot);
	if (!projected) return;
	drawPeg(context, projected[0], projected[1], PinSize.MaximumPx, GlobePalette.PlotMarker, true);
	drawCanvasLabel(context, { x: projected[0], y: projected[1] }, PlotMarkerLabel, GlobePalette.LabelSelected, true);
}

export function drawPeg(context: CanvasRenderingContext2D, x: number, y: number, size: number, colour: string, isEmphasised: boolean) {
	const height = size * PegShape.HeightShare;
	context.save();
	context.translate(x, y);
	context.shadowColor = GlobePalette.PinShadow;
	context.shadowBlur = PegShadow.Blur;
	context.shadowOffsetY = PegShadow.OffsetY;
	context.fillStyle = colour;
	context.beginPath();
	context.roundRect(-size / 2, -height / 2, size, height, PegShape.CornerRadius);
	context.fill();
	context.shadowColor = 'transparent';
	context.strokeStyle = isEmphasised ? GlobePalette.PinEdgeEmphasised : GlobePalette.PinEdge;
	context.lineWidth = isEmphasised ? PegShape.EmphasisedEdgeWidth : PegShape.EdgeWidth;
	context.stroke();
	drawPlanks(context, size, height);
	context.restore();
}

function drawPlanks(context: CanvasRenderingContext2D, size: number, height: number) {
	context.strokeStyle = GlobePalette.PinPlank;
	context.lineWidth = 1;
	const spacing = size * PegShape.PlankSpacingShare;
	for (let plank = -size / 2 + spacing; plank < size / 2; plank += spacing) {
		context.beginPath();
		context.moveTo(plank, -height / 2);
		context.lineTo(plank, height / 2);
		context.stroke();
	}
}

function drawCluster(context: CanvasRenderingContext2D, cluster: PinCluster) {
	const radius = clusterRadiusFor(cluster);
	context.save();
	context.beginPath();
	context.arc(cluster.x, cluster.y, radius, 0, Math.PI * 2);
	context.fillStyle = GlobePalette.ClusterFill;
	context.fill();
	context.strokeStyle = GlobePalette.ClusterRing;
	context.lineWidth = 2;
	context.stroke();
	context.fillStyle = GlobePalette.ClusterCount;
	context.font = GlobeFont.Count;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(String(cluster.pins.length), cluster.x, cluster.y);
	context.restore();
}
