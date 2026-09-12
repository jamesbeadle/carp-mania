import type { ToolHandlers } from './toolHandlers';

const DefaultSnagName = 'The Fallen Tree';

export const snagTool: ToolHandlers = {
	onClick(builder, point) {
		const draft = builder.draft;
		const name = draft?.kind === 'snag' ? draft.name : DefaultSnagName;
		builder.place({ kind: 'snag', point, name });
	}
};
