import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';

export const MetresPerFoot = 0.3048;
const PlotCentre = 0.5;

export interface WorldPoint {
	x: number;
	z: number;
}

export interface LakeFrame {
	metresAcross: number;
	metresDown: number;
}

export function lakeFrameFor(plotAcres: number): LakeFrame {
	const scale = layoutScaleFor(plotAcres);
	return { metresAcross: scale.feetAcross * MetresPerFoot, metresDown: scale.feetDown * MetresPerFoot };
}

export function worldPointOf(frame: LakeFrame, fraction: LayoutPoint): WorldPoint {
	return { x: (fraction.x - PlotCentre) * frame.metresAcross, z: (fraction.y - PlotCentre) * frame.metresDown };
}

export function fractionOf(frame: LakeFrame, point: WorldPoint): LayoutPoint {
	return { x: point.x / frame.metresAcross + PlotCentre, y: point.z / frame.metresDown + PlotCentre };
}

export function metresBetween(first: WorldPoint, second: WorldPoint) {
	return Math.hypot(first.x - second.x, first.z - second.z);
}

export function plotReachOf(frame: LakeFrame) {
	return Math.max(frame.metresAcross, frame.metresDown);
}
