import type { WorkKind } from '$lib/domain/groundworks/workKinds';

export type BuilderTool = 'select' | 'island' | 'bar' | 'deepen' | 'dredge' | 'shelf' | 'reeds' | 'lilies' | 'snag' | 'sanctuary' | 'swim' | 'shore' | 'extend' | 'land' | 'facility';

export interface ToolProfile {
	label: string;
	hint: string;
	kind: WorkKind | null;
}

export const ToolCatalogue: Record<BuilderTool, ToolProfile> = {
	select: { label: 'Select', hint: 'Click a swim to rename, move or take it out. Drag it, or click the bank, to choose where it moves to.', kind: null },
	island: { label: 'Island', hint: 'Click the water to place the island, then drag to turn it.', kind: 'island' },
	bar: { label: 'Bar', hint: 'Click the water to lay out the bar; click the first point again to close it.', kind: 'gravel_bar' },
	deepen: { label: 'Deepen', hint: 'Click the water to outline the hole; click the first point again to close it.', kind: 'deepen' },
	dredge: { label: 'Dredge', hint: 'Click the water to outline the silt to shift; click the first point again to close it.', kind: 'dredge' },
	shelf: { label: 'Shelf', hint: 'Click along the bank; click the last point again to finish the stretch.', kind: 'margin_shelf' },
	reeds: { label: 'Reeds', hint: 'Click along the bank; click the last point again to finish the stretch.', kind: 'reed_bed' },
	lilies: { label: 'Lilies', hint: 'Click shallow water to outline the pads; click the first point again to close it.', kind: 'lily_pads' },
	snag: { label: 'Snag', hint: 'Click the water to sink the snag.', kind: 'snag' },
	sanctuary: { label: 'Sanctuary', hint: 'Click along the bank; click the last point again to finish the stretch. No peg may sit within 60 ft of it.', kind: 'sanctuary' },
	swim: { label: 'Swim', hint: 'Click the bank to place a new peg.', kind: null },
	shore: { label: 'Shore', hint: 'Drag a point of the shoreline to move the bank.', kind: 'reshape_shoreline' },
	extend: { label: 'Extend', hint: 'Drag anywhere on the shoreline to pull out a new point.', kind: 'reshape_shoreline' },
	land: { label: 'Land', hint: 'Buy five acres next door; the plot grows around the water.', kind: null },
	facility: { label: 'Facility', hint: 'Choose what to build.', kind: null }
};

export const BuilderTools = Object.keys(ToolCatalogue) as BuilderTool[];
