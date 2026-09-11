import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Swim } from '$lib/domain/types';
import type { BuilderState } from '../builderState.svelte';

export interface ToolContext {
	layout: LakeLayout;
	plotAcres: number;
	swims: Swim[];
}

export type ToolAction = (builder: BuilderState, point: LayoutPoint, context: ToolContext) => void;

export interface ToolHandlers {
	onClick?: ToolAction;
	onDoubleClick?: ToolAction;
	onDragStart?: ToolAction;
	onDrag?: ToolAction;
	onDragEnd?: ToolAction;
}

export const NoHandlers: ToolHandlers = {};
