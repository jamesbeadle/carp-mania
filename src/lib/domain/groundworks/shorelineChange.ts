import { feetToNearestEdge } from '../layout/distanceToEdge';
import { feetBetween, layoutScaleFor, type LayoutScale } from '../layout/layoutScale';
import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { waterAcres } from '../layout/waterArea';

export interface ShorelineChange {
	feetMoved: number;
	acresAdded: number;
}

export function shorelineChangeFor(oldOutline: LayoutPoint[], newOutline: LayoutPoint[], layout: LakeLayout, plotAcres: number): ShorelineChange {
	const scale = layoutScaleFor(plotAcres);
	const feetMoved = newOutline.reduce((total, vertex, index) => total + displacementFeet(oldOutline, newOutline, vertex, index, scale), 0);
	const before = waterAcres({ ...layout, outline: oldOutline }, plotAcres);
	const after = waterAcres({ ...layout, outline: newOutline }, plotAcres);
	return { feetMoved: Math.round(feetMoved), acresAdded: Math.max(0, Math.round((after - before) * 100) / 100) };
}

function displacementFeet(oldOutline: LayoutPoint[], newOutline: LayoutPoint[], vertex: LayoutPoint, index: number, scale: LayoutScale) {
	const isVertexForVertex = oldOutline.length === newOutline.length;
	if (isVertexForVertex) return feetBetween(scale, oldOutline[index], vertex);
	if (oldOutline.some((old) => old.x === vertex.x && old.y === vertex.y)) return 0;
	return feetToNearestEdge(scale, vertex, oldOutline);
}
