import type { WorkKind } from '$lib/domain/groundworks/workKinds';

export type BuilderTool = 'select' | 'island' | 'bar' | 'deepen' | 'dredge' | 'shelf' | 'reeds' | 'lilies' | 'snag' | 'sanctuary' | 'swim' | 'redraw' | 'sculpt' | 'smooth' | 'land' | 'facility';

export interface ToolProfile {
	label: string;
	hint: string;
	kind: WorkKind | null;
}

export const ToolCatalogue: Record<BuilderTool, ToolProfile> = {
	select: { label: 'Select', hint: 'Click a swim to rename, move or take it out, or a building to move it or upgrade the car park. Drag a swim, or click the bank, to choose where it moves to.', kind: null },
	island: { label: 'Island', hint: 'Click the water to place the island, then drag to turn it.', kind: 'island' },
	bar: { label: 'Bar', hint: 'Click the water to lay out the bar; click the first point again to close it. Or drag to trace the outline in one go.', kind: 'gravel_bar' },
	deepen: { label: 'Deepen', hint: 'Click the water to outline the hole; click the first point again to close it. Or drag to trace the outline in one go.', kind: 'deepen' },
	dredge: { label: 'Dredge', hint: 'Click the water to outline the silt to shift; click the first point again to close it. Or drag to trace the outline in one go.', kind: 'dredge' },
	shelf: { label: 'Shelf', hint: 'Click along the bank; click the last point again to finish the stretch. Or drag along the bank to trace it.', kind: 'margin_shelf' },
	reeds: { label: 'Reeds', hint: 'Click along the bank; click the last point again to finish the stretch. Or drag along the bank to trace it.', kind: 'reed_bed' },
	lilies: { label: 'Lilies', hint: 'Click shallow water to outline the pads; click the first point again to close it. Or drag to trace the outline in one go.', kind: 'lily_pads' },
	snag: { label: 'Snag', hint: 'Click the water to sink the snag.', kind: 'snag' },
	sanctuary: { label: 'Sanctuary', hint: 'Click along the bank; click the last point again to finish the stretch. No peg may sit within 60 ft of it. Or drag along the bank to trace it.', kind: 'sanctuary' },
	swim: { label: 'Swim', hint: 'Click the bank to place a new peg.', kind: null },
	redraw: { label: 'Redraw', hint: 'Click the shoreline where the new bank starts, click along the new line (or nowhere, for a smooth curve), then click the shoreline again to finish.', kind: 'reshape_shoreline' },
	sculpt: { label: 'Sculpt', hint: 'Grab the bank and drag: out into the land to dig more water, into the lake to fill it in. The bank nearby follows smoothly.', kind: 'reshape_shoreline' },
	smooth: { label: 'Smooth', hint: 'Brush along the bank to round off kinks and sharp corners.', kind: 'reshape_shoreline' },
	land: { label: 'Land', hint: 'Buy five acres next door; the plot grows around the water.', kind: null },
	facility: { label: 'Facility', hint: 'Choose what to build; it is set out on a clear spot. Click your land or drag it to move it, and drag beside it to turn it.', kind: null }
};

export const BuilderTools = Object.keys(ToolCatalogue) as BuilderTool[];
