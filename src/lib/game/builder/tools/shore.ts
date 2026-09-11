import { dragVertex, grabVertex, releaseVertex } from './outlineDrag';
import type { ToolHandlers } from './toolHandlers';

export const shoreTool: ToolHandlers = {
	onDragStart: grabVertex,
	onDrag: dragVertex,
	onDragEnd: releaseVertex
};
