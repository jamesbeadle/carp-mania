import type { Lake } from '$lib/domain/types';

export interface LayerVisibility {
	depth: boolean;
	bed: boolean;
	features: boolean;
	swims: boolean;
}

export const LayerLabels: Record<keyof LayerVisibility, string> = { depth: 'depth', bed: 'bed', features: 'features', swims: 'swims' };
export const LayerNames = Object.keys(LayerLabels) as (keyof LayerVisibility)[];

export function everyLayerShown(): LayerVisibility {
	return { depth: true, bed: true, features: true, swims: true };
}

export function lakeWithLayersHidden(lake: Lake, layers: LayerVisibility): Lake {
	const layout = lake.layout;
	return {
		...lake,
		layout: {
			...layout,
			depthZones: layers.depth ? layout.depthZones : [],
			bedPatches: layers.bed ? layout.bedPatches : [],
			features: layers.features ? layout.features : []
		}
	};
}
