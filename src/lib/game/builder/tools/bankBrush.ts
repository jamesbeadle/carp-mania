import { spacingFor } from '$lib/domain/groundworks/shoreline/bankSpacing';
import { drawnBankOf } from '$lib/domain/groundworks/shoreline/drawnBank';
import type { BankBrush } from '$lib/domain/groundworks/shoreline/sculptBank';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { BuilderState } from '../builderState.svelte';
import { sceneDistance } from '../sceneDistance';
import { shorelineInProgress } from './shorelineInProgress';
import type { ToolContext, ToolHandlers } from './toolHandlers';

type BrushStroke = (outline: LayoutPoint[], brush: BankBrush, point: LayoutPoint) => LayoutPoint[];

function pickUpTheBank(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	const isAlreadyShaped = builder.draft?.kind === 'reshape_shoreline';
	const outline = shorelineInProgress(builder, context);
	const picked = isAlreadyShaped ? outline : drawnBankOf(outline, spacingFor(outline, sceneDistance), sceneDistance);
	builder.startDrawing({ kind: 'reshape_shoreline', outline: picked });
	builder.brushAt = point;
}

function strokeWith(stroke: BrushStroke) {
	return (builder: BuilderState, point: LayoutPoint) => {
		const draft = builder.draft;
		const brushAt = builder.brushAt;
		if (draft?.kind !== 'reshape_shoreline' || !brushAt) return;
		const brush = { at: brushAt, radiusScenePixels: builder.brushScenePixels };
		builder.draft = { ...draft, outline: stroke(draft.outline, brush, point) };
		builder.brushAt = point;
	};
}

function putDownTheBank(builder: BuilderState) {
	builder.brushAt = null;
	const draft = builder.draft;
	if (draft) builder.place(draft);
}

export function bankBrushTool(stroke: BrushStroke): ToolHandlers {
	const strokeTo = strokeWith(stroke);
	return {
		onDragStart: pickUpTheBank,
		onDrag: strokeTo,
		onDragEnd(builder, point) {
			strokeTo(builder, point);
			putDownTheBank(builder);
		}
	};
}
