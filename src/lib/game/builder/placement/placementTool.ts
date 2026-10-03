import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { siteOfMove, siteOfPlacement } from '$lib/domain/groundworks/sites/siteOfWork';
import type { BuilderState } from '../builderState.svelte';
import { bearingFrom } from '../bearingFrom';
import type { ToolContext, ToolHandlers } from '../tools/toolHandlers';
import { isPlacementDraft, type PlacementDraft } from './placementDrafts';
import { siteAt } from './siteAt';

const TurnSnap = Math.PI / 36;
const QuarterTurn = Math.PI / 2;

function siteOfDraft(draft: PlacementDraft, context: ToolContext) {
	return draft.kind === 'move_facility' ? siteOfMove(draft, context.layout) : siteOfPlacement(draft);
}

function grabOrTurn(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	const draft = builder.draft;
	if (!isPlacementDraft(draft)) return;
	const isOnTheSite = siteAt([siteOfDraft(draft, context)], point, context.plotAcres) !== null;
	builder.siteGrab = isOnTheSite ? { x: draft.centre.x - point.x, y: draft.centre.y - point.y } : null;
	builder.isTurningTheSite = !isOnTheSite;
}

function dragTheSite(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	const draft = builder.draft;
	if (!isPlacementDraft(draft)) return;
	const grab = builder.siteGrab;
	if (grab) return builder.place({ ...draft, centre: { x: point.x + grab.x, y: point.y + grab.y } });
	if (!builder.isTurningTheSite) return;
	const facing = bearingFrom(draft.centre, point, context.plotAcres) - QuarterTurn;
	builder.place({ ...draft, rotation: Math.round(facing / TurnSnap) * TurnSnap });
}

export const placementTool: ToolHandlers = {
	onClick(builder, point) {
		const draft = builder.draft;
		if (isPlacementDraft(draft)) builder.place({ ...draft, centre: point });
	},
	onDragStart: grabOrTurn,
	onDrag: dragTheSite,
	onDragEnd(builder) {
		builder.siteGrab = null;
		builder.isTurningTheSite = false;
	}
};
