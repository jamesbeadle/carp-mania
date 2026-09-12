import type { ToolHandlers } from './toolHandlers';

export const swimTool: ToolHandlers = {
	onClick(builder, point) {
		builder.selectedSwimId = null;
		builder.swimPoint = point;
	}
};
