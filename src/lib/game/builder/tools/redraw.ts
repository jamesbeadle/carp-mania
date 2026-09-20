import { anchorOnBank } from '$lib/domain/groundworks/bankAnchor';
import { redrawBank } from '$lib/domain/groundworks/redrawBank';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { BuilderState } from '../builderState.svelte';
import { clampToScene, sceneDistance } from '../sceneDistance';
import { VertexGrabRadius } from './outlineDrag';
import type { ToolContext, ToolHandlers } from './toolHandlers';

export const RedrawWords = { StartOnTheBank: 'Start on the shoreline — click where the new bank begins', FinishApart: 'Finish further along the shoreline, away from where you started' } as const;
const SameSpotScenePixels = VertexGrabRadius;

export const redrawTool: ToolHandlers = {
	onClick(builder, point, context) {
		const start = builder.bankStart;
		if (!start) return beginOnTheBank(builder, point, context);
		const end = anchorOnBank(context.layout.outline, point, VertexGrabRadius, sceneDistance);
		if (!end) return addAPoint(builder, point);
		if (sceneDistance(end.point, start.point) <= SameSpotScenePixels) return void (builder.notice = RedrawWords.FinishApart);
		const outline = redrawBank(context.layout.outline, start, builder.bankPath, end, sceneDistance);
		builder.bankStart = null;
		builder.bankPath = [];
		builder.notice = null;
		builder.place({ kind: 'reshape_shoreline', outline });
	}
};

function beginOnTheBank(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	const start = anchorOnBank(context.layout.outline, point, VertexGrabRadius, sceneDistance);
	if (!start) return void (builder.notice = RedrawWords.StartOnTheBank);
	builder.clear();
	builder.bankStart = start;
}

function addAPoint(builder: BuilderState, point: LayoutPoint) {
	builder.bankPath = [...builder.bankPath, clampToScene(point)];
	builder.notice = null;
}
