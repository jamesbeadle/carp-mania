import { dragVertex, pullOutVertex, releaseVertex } from './outlineDrag';
import type { ToolHandlers } from './toolHandlers';

export const extendTool: ToolHandlers = {
	onDragStart: pullOutVertex,
	onDrag: dragVertex,
	onDragEnd: releaseVertex
};
