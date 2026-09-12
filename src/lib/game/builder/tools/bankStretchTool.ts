import { isBankDraft, type BankDraft } from '$lib/domain/groundworks/draftFootprint';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { sceneDistance } from '../sceneDistance';
import type { ToolHandlers } from './toolHandlers';

const MinimumStretchPoints = 2;
const DuplicatePointRadius = 4;

export function bankStretchTool(createDraft: (points: LayoutPoint[]) => BankDraft): ToolHandlers {
	return {
		onClick(builder, point) {
			const draft = builder.draft;
			if (!builder.isDrawing || !draft || !isBankDraft(draft)) return builder.startDrawing(createDraft([point]));
			builder.draft = { ...draft, points: [...draft.points, point] };
		},
		onDoubleClick(builder) {
			const draft = builder.draft;
			if (!builder.isDrawing || !draft || !isBankDraft(draft)) return;
			const points = withoutTrailingDuplicates(draft.points);
			if (points.length < MinimumStretchPoints) return;
			builder.place({ ...draft, points });
		}
	};
}

function withoutTrailingDuplicates(points: LayoutPoint[]): LayoutPoint[] {
	const trimmed = [...points];
	while (trimmed.length >= 2 && sceneDistance(trimmed[trimmed.length - 1], trimmed[trimmed.length - 2]) <= DuplicatePointRadius) trimmed.pop();
	return trimmed;
}
