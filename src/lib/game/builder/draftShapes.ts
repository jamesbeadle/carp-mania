import type { LabelledWork } from '$lib/contracts/MyGroundworks';
import { footprintOf } from '$lib/domain/groundworks/draftFootprint';
import { workLabelFor } from '$lib/domain/groundworks/workLabels';
import { draftOf } from '$lib/domain/groundworks/worksLedger';
import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import type { Lake, Swim } from '$lib/domain/types';
import { siteOf, sitesOf } from '$lib/domain/groundworks/sites/sitesOf';
import { siteLabelOf } from '../render/drawFacilities';
import type { DraftShape } from '../render/drawUnderConstruction';
import type { BuilderState } from './builderState.svelte';
import { brushRingShapes } from './brushRing';
import { draftSiteOf, siteDraftShape } from './placement/draftSite';
import { shapeWhileDrawing } from './shapeWhileDrawing';

type Plot = Pick<Lake, 'layout' | 'plot_acres'>;

const RedrawLabel = 'New bank — click the shoreline to finish';

export function draftShapesFor(builder: BuilderState, failures: string[], lake: Plot, swims: Swim[], inProgress: LabelledWork[]): DraftShape[] {
	const underWay = inProgressShapesFor(inProgress, lake, swims);
	const onTheBench = [...currentDraftShapes(builder, failures, lake, swims), ...bankPathShapes(builder), ...swimShapes(builder, swims)];
	return [...underWay, ...onTheBench, ...selectedSiteShapes(builder, lake, swims), ...brushRingShapes(builder)];
}

export function inProgressShapesFor(inProgress: LabelledWork[], lake: Plot, swims: Swim[]): DraftShape[] {
	const labelOf = (work: LabelledWork) => `${work.label} — in progress, ${work.daysLeft} ${work.daysLeft === 1 ? 'day' : 'days'}`;
	return inProgress.flatMap((work) => shapesOf(draftOf(work), lake, swims, labelOf(work), true));
}

function shapesOf(draft: WorkDraft, lake: Plot, swims: Swim[], label: string, isValid: boolean): DraftShape[] {
	const site = draftSiteOf(draft, lake, swims);
	if (site) return [siteDraftShape(site, lake, label, isValid)];
	const footprint = footprintOf(draft, lake.layout, Number(lake.plot_acres));
	return footprint.points.length > 0 ? [{ kind: footprint.shape, points: footprint.points, label, isValid }] : [];
}

function currentDraftShapes(builder: BuilderState, failures: string[], lake: Plot, swims: Swim[]): DraftShape[] {
	const draft = builder.draft;
	if (!draft) return [];
	if (builder.isDrawing) return shapeWhileDrawing(draft, builder.hover, workLabelFor(draft), failures);
	return shapesOf(draft, lake, swims, workLabelFor(draft), failures.length === 0);
}

function bankPathShapes(builder: BuilderState): DraftShape[] {
	const start = builder.bankStart;
	if (!start) return [];
	const placed = [start.point, ...builder.bankPath];
	const points = builder.hover ? [...placed, builder.hover] : placed;
	return [{ kind: 'polyline', points, label: RedrawLabel, isValid: true, isBeingDrawn: true, handles: placed.map((point) => ({ point, role: 'vertex', isSnapped: false })) }];
}

function swimShapes(builder: BuilderState, swims: Swim[]): DraftShape[] {
	if (!builder.swimPoint) return [];
	const selected = swims.find((swim) => swim.id === builder.selectedSwimId);
	const label = selected ? `Move ${selected.name} here` : 'New swim';
	return [{ kind: 'point', points: [builder.swimPoint], label, isValid: true }];
}

function selectedSiteShapes(builder: BuilderState, lake: Plot, swims: Swim[]): DraftShape[] {
	const facility = builder.selectedFacility;
	if (!facility || builder.draft) return [];
	const site = siteOf(sitesOf(lake.layout, Number(lake.plot_acres), swims), facility);
	if (!site) return [];
	return [siteDraftShape(site, lake, siteLabelOf(site), true)];
}
