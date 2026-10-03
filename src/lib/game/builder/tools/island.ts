import { bearingFrom } from '../bearingFrom';
import type { ToolHandlers } from './toolHandlers';

const DefaultIslandName = 'New Island';

export const islandTool: ToolHandlers = {
	onClick(builder, point) {
		const draft = builder.draft;
		if (draft?.kind === 'island') return builder.place({ ...draft, centre: point });
		builder.place({ kind: 'island', size: 'medium', centre: point, rotation: 0, name: DefaultIslandName });
	},
	onDrag(builder, point, context) {
		const draft = builder.draft;
		if (draft?.kind !== 'island') return;
		builder.draft = { ...draft, rotation: bearingFrom(draft.centre, point, context.plotAcres) };
	}
};
