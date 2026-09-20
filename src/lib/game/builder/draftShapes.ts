import type { LabelledWork } from '$lib/contracts/MyGroundworks';
import { footprintOf } from '$lib/domain/groundworks/draftFootprint';
import { workLabelFor } from '$lib/domain/groundworks/workLabels';
import { draftOf } from '$lib/domain/groundworks/worksLedger';
import type { Lake, Swim } from '$lib/domain/types';
import type { DraftShape } from '../render/drawUnderConstruction';
import type { BuilderState } from './builderState.svelte';
import { shapeWhileDrawing } from './shapeWhileDrawing';

type Plot = Pick<Lake, 'layout' | 'plot_acres'>;

const RedrawLabel = 'New bank — click the shoreline to finish';

export function draftShapesFor(builder: BuilderState, failures: string[], lake: Plot, swims: Swim[], inProgress: LabelledWork[]): DraftShape[] {
	return [...inProgressShapesFor(inProgress, lake), ...currentDraftShapes(builder, failures, lake), ...bankPathShapes(builder), ...swimShapes(builder, swims)];
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
	if (builder.isDrawing) return shapeWhileDrawing(draft, builder.hover, workLabelFor(draft), failures);
	const footprint = footprintOf(draft, lake.layout, Number(lake.plot_acres));
	if (footprint.points.length === 0) return [];
	return [{ kind: footprint.shape, points: footprint.points, label: workLabelFor(draft), isValid: failures.length === 0 }];
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
