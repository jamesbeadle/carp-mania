import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { DraftShape } from '../render/drawUnderConstruction';
import { SceneSize } from '../scene/palette';
import type { BuilderState } from './builderState.svelte';

const BankBrushTools = ['sculpt', 'smooth'];
const RingSides = 32;
const NoLabel = '';

export function brushRingShapes(builder: BuilderState): DraftShape[] {
	const centre = builder.hover;
	if (!centre || !BankBrushTools.includes(builder.tool)) return [];
	return [{ kind: 'polygon', points: ringAround(centre, builder.brushScenePixels), label: NoLabel, isValid: true }];
}

function ringAround(centre: LayoutPoint, radiusScenePixels: number): LayoutPoint[] {
	const across = radiusScenePixels / SceneSize.Width;
	const down = radiusScenePixels / SceneSize.Height;
	return Array.from({ length: RingSides }, (_, side) => {
		const angle = (side / RingSides) * Math.PI * 2;
		return { x: centre.x + Math.cos(angle) * across, y: centre.y + Math.sin(angle) * down };
	});
}
