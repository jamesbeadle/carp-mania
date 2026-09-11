import { layoutScaleFor } from '../layout/layoutScale';
import type { LakeFeature, LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { polygonCentroid } from '../layout/polygonArea';
import { depthAt } from '../layout/terrainAt';
import { waterAcres } from '../layout/waterArea';
import type { BedType, Lake } from '../types';
import { clampToScale } from '../waterQuality';
import { WorkPrices } from './catalogue';
import { dredgingEffectOf } from './dredging';
import { islandPolygonFor } from './islandTemplates';
import { shelfPolygonFor } from './shelfStrip';
import type { WorkDraft } from './workKinds';

export interface AppliedWork {
	layout: LakeLayout;
	lake: Partial<Lake>;
}

export function applyCompletedWork(lake: Lake, draft: WorkDraft, workId: string): AppliedWork {
	const layout = layoutAfter(lake.layout, draft, workId, Number(lake.plot_acres));
	const water = waterChangesFor(lake, draft);
	return { layout, lake: { ...water, layout, acres: waterAcres(layout, Number(lake.plot_acres)) } };
}

function layoutAfter(layout: LakeLayout, draft: WorkDraft, id: string, plotAcres: number): LakeLayout {
	if (draft.kind === 'island') return { ...layout, islands: [...layout.islands, { id, name: draft.name, points: islandPolygonFor(draft.size, draft.centre, draft.rotation, plotAcres) }] };
	if (draft.kind === 'gravel_bar') return withFeature(withBed(withDepth(layout, id, draft.points, draft.depthFeet), id, draft.points, 'gravel'), { id, kind: 'gravel_bar', points: draft.points });
	if (draft.kind === 'deepen') return withDepth(layout, id, draft.points, draft.depthFeet);
	if (draft.kind === 'dredge') return withDepth(layout, id, draft.points, depthAt(layout, polygonCentroid(draft.points)) + WorkPrices.Dredge.depthGainedFeet);
	if (draft.kind === 'margin_shelf') return shelfAfter(layout, draft, id, plotAcres);
	if (draft.kind === 'reed_bed') return withFeature(layout, { id, kind: 'reed_line', points: draft.points });
	if (draft.kind === 'lily_pads') return withFeature(layout, { id, kind: 'lily_pads', points: draft.points });
	if (draft.kind === 'snag') return withFeature(layout, { id, kind: 'snag', point: draft.point, name: draft.name });
	if (draft.kind === 'reshape_shoreline') return { ...layout, outline: draft.outline };
	return withFacility(layout, draft.kind);
}

function shelfAfter(layout: LakeLayout, draft: Extract<WorkDraft, { kind: 'margin_shelf' }>, id: string, plotAcres: number): LakeLayout {
	const strip = shelfPolygonFor(draft.points, layout, layoutScaleFor(plotAcres));
	return withBed(withDepth(layout, id, strip, WorkPrices.MarginShelf.depthFeet), id, strip, draft.bed);
}

function withDepth(layout: LakeLayout, id: string, points: LayoutPoint[], depthFeet: number): LakeLayout {
	return { ...layout, depthZones: [...layout.depthZones, { id, points, depthFeet }] };
}

function withBed(layout: LakeLayout, id: string, points: LayoutPoint[], bed: BedType): LakeLayout {
	return { ...layout, bedPatches: [...layout.bedPatches, { id, points, bed }] };
}

function withFeature(layout: LakeLayout, feature: LakeFeature): LakeLayout {
	return { ...layout, features: [...layout.features, feature] };
}

function withFacility(layout: LakeLayout, kind: WorkDraft['kind']): LakeLayout {
	const isFacility = kind === 'car_park' || kind === 'lodge' || kind === 'aerator';
	if (!isFacility || layout.facilities.includes(kind)) return layout;
	return { ...layout, facilities: [...layout.facilities, kind] };
}

function waterChangesFor(lake: Lake, draft: WorkDraft): Partial<Lake> {
	if (draft.kind === 'reed_bed') return { weed: clampToScale(Number(lake.weed) + WorkPrices.ReedBed.weedGained) };
	if (draft.kind !== 'dredge') return {};
	const dredging = dredgingEffectOf(draft.points, lake.layout, Number(lake.plot_acres));
	return { silt: clampToScale(Number(lake.silt) - dredging.siltCleared), fertility: clampToScale(Number(lake.fertility) - dredging.fertilityLost) };
}
