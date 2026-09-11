import type { LabelledWork } from '$lib/contracts/MyGroundworks';
import { footprintOf, isBankDraft, type Footprint } from '$lib/domain/groundworks/draftFootprint';
import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import { workLabelFor } from '$lib/domain/groundworks/workLabels';
import { draftOf } from '$lib/domain/groundworks/worksLedger';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Lake, Swim } from '$lib/domain/types';
import type { DraftShape } from '../render/drawUnderConstruction';
import type { BuilderState } from './builderState.svelte';

type Plot = Pick<Lake, 'layout' | 'plot_acres'>;

export function draftShapesFor(builder: BuilderState, failures: string[], lake: Plot, swims: Swim[], inProgress: LabelledWork[]): DraftShape[] {
	return [...inProgressShapesFor(inProgress, lake), ...currentDraftShapes(builder, failures, lake), ...swimShapes(builder, swims)];
}

export function inProgressShapesFor(inProgress: LabelledWork[], lake: Plot): DraftShape[] {
	return inProgress
		.map((work) => ({ work, footprint: footprintOf(draftOf(work), lake.layout, Number(lake.plot_acres)) }))
		.filter(({ footprint }) => footprint.points.length > 0)
		.map(({ work, footprint }) => ({ kind: footprint.shape, points: footprint.points, label: `${work.label} — in progress, ${work.daysLeft} ${work.daysLeft === 1 ? 'day' : 'days'}`, isValid: true }));
}

function currentDraftShapes(builder: BuilderState, failures: string[], lake: Plot): DraftShape[] {
	const draft = builder.draft;
	if (!draft) return [];
	const footprint = builder.isDrawing ? drawingFootprint(draft, builder.hover) : footprintOf(draft, lake.layout, Number(lake.plot_acres));
	if (footprint.points.length === 0) return [];
	return [{ kind: footprint.shape, points: footprint.points, label: workLabelFor(draft), isValid: failures.length === 0 }];
}

function drawingFootprint(draft: WorkDraft, hover: LayoutPoint | null): Footprint {
	if (draft.kind === 'reshape_shoreline') return { shape: 'polygon', points: draft.outline };
	const points = 'points' in draft ? draft.points : [];
	return { shape: isBankDraft(draft) ? 'polyline' : 'polygon', points: hover ? [...points, hover] : points };
}

function swimShapes(builder: BuilderState, swims: Swim[]): DraftShape[] {
	if (!builder.swimPoint) return [];
	const selected = swims.find((swim) => swim.id === builder.selectedSwimId);
	const label = selected ? `Move ${selected.name} here` : 'New swim';
	return [{ kind: 'point', points: [builder.swimPoint], label, isValid: true }];
}
