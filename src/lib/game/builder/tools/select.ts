import { builtSitesOf, isPlacementDraft } from '../placement/placementDrafts';
import { placementTool } from '../placement/placementTool';
import { siteAt } from '../placement/siteAt';
import { swimAt } from '../sceneDistance';
import type { BuilderState } from '../builderState.svelte';
import type { ToolAction, ToolHandlers } from './toolHandlers';

const swimSelection: ToolHandlers = {
	onClick(builder, point, context) {
		const swim = swimAt(context.swims, point);
		const site = swim ? null : siteAt(builtSitesOf(context), point, context.plotAcres);
		if (swim || site) builder.clear();
		if (swim) builder.selectedSwimId = swim.id;
		if (site) builder.selectedFacility = site.facility;
		if (!swim && !site && builder.selectedSwimId) builder.swimPoint = point;
	},
	onDragStart(builder, point, context) {
		const swim = swimAt(context.swims, point);
		if (swim) builder.selectedSwimId = swim.id;
	},
	onDrag(builder, point) {
		if (builder.selectedSwimId) builder.swimPoint = point;
	}
};

function handlersFor(builder: BuilderState) {
	return isPlacementDraft(builder.draft) ? placementTool : swimSelection;
}

function delegate(gesture: keyof ToolHandlers): ToolAction {
	return (builder, point, context) => handlersFor(builder)[gesture]?.(builder, point, context);
}

export const selectTool: ToolHandlers = {
	onClick: delegate('onClick'),
	onDragStart: delegate('onDragStart'),
	onDrag: delegate('onDrag'),
	onDragEnd: delegate('onDragEnd')
};
