import type { BedType, SwimFeature } from '../types';
import { waterInFrontOfSwim } from './swimRules';
import type { LakeFeature, LakeLayout, LayoutPoint } from './layoutTypes';
import { layoutScaleFor } from './layoutScale';

export const ClassicPlotAcres = 10;

export const ClassicOutline: LayoutPoint[] = [
	{ x: 0.12, y: 0.3 }, { x: 0.22, y: 0.16 }, { x: 0.4, y: 0.12 }, { x: 0.6, y: 0.18 }, { x: 0.8, y: 0.14 },
	{ x: 0.93, y: 0.3 }, { x: 0.9, y: 0.52 }, { x: 0.94, y: 0.72 }, { x: 0.8, y: 0.86 }, { x: 0.6, y: 0.84 },
	{ x: 0.45, y: 0.92 }, { x: 0.26, y: 0.86 }, { x: 0.12, y: 0.72 }, { x: 0.06, y: 0.52 }
];

export const ClassicIsland: LayoutPoint[] = [
	{ x: 0.58, y: 0.36 }, { x: 0.66, y: 0.33 }, { x: 0.72, y: 0.4 }, { x: 0.68, y: 0.48 }, { x: 0.6, y: 0.47 }
];

export interface ClassicSwimTerrain {
	name: string;
	position: LayoutPoint;
	bed: BedType;
	depthFeet: number;
	feature: SwimFeature;
}

const PatchRadius = 0.09;
const ReedSpan = 0.06;

export function classicLayout(): LakeLayout {
	return { version: 1, baseDepthFeet: 7, baseBed: 'gravel', outline: ClassicOutline, islands: [{ id: 'classic-island', name: 'The Island', points: ClassicIsland }], depthZones: [], bedPatches: [], features: [], facilities: [] };
}

export function classicLayoutWithSwimTerrain(swims: ClassicSwimTerrain[]): LakeLayout {
	const layout = classicLayout();
	const scale = layoutScaleFor(ClassicPlotAcres);
	for (const swim of swims) {
		const front = waterInFrontOfSwim(layout, scale, { position_x: swim.position.x, position_y: swim.position.y });
		const identifier = swim.name.toLowerCase().replaceAll(' ', '-');
		layout.bedPatches.push({ id: `${identifier}-bed`, points: circle(front, PatchRadius), bed: swim.bed });
		layout.depthZones.push({ id: `${identifier}-depth`, points: circle(front, PatchRadius), depthFeet: swim.depthFeet });
		const feature = classicFeature(identifier, swim, front);
		if (feature) layout.features.push(feature);
	}
	return layout;
}

function classicFeature(identifier: string, swim: ClassicSwimTerrain, front: LayoutPoint): LakeFeature | null {
	if (swim.feature === 'weed_bed') return { id: `${identifier}-weed`, kind: 'weed_bed', points: circle(front, PatchRadius * 0.8) };
	if (swim.feature === 'snag') return { id: `${identifier}-snag`, kind: 'snag', point: front, name: `${swim.name} snag` };
	if (swim.feature === 'reed_line') return { id: `${identifier}-reeds`, kind: 'reed_line', points: [{ x: front.x, y: front.y - ReedSpan }, { x: front.x, y: front.y + ReedSpan }] };
	return null;
}

export function circle(centre: LayoutPoint, radius: number, sides = 12): LayoutPoint[] {
	return Array.from({ length: sides }, (_, index) => {
		const angle = (index / sides) * Math.PI * 2;
		return { x: centre.x + Math.cos(angle) * radius, y: centre.y + Math.sin(angle) * radius * 1.5 };
	});
}
