import { swimAt } from '../sceneDistance';
import type { ToolHandlers } from './toolHandlers';

export const selectTool: ToolHandlers = {
	onClick(builder, point, context) {
		const swim = swimAt(context.swims, point);
		if (swim) {
			builder.selectedSwimId = swim.id;
			builder.swimPoint = null;
			return;
		}
		if (builder.selectedSwimId) builder.swimPoint = point;
	},
	onDragStart(builder, point, context) {
		const swim = swimAt(context.swims, point);
		if (swim) builder.selectedSwimId = swim.id;
	},
	onDrag(builder, point) {
		if (builder.selectedSwimId) builder.swimPoint = point;
	}
};
