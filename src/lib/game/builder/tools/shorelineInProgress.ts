import type { BuilderState } from '../builderState.svelte';
import type { ToolContext } from './toolHandlers';

export function shorelineInProgress(builder: BuilderState, context: ToolContext) {
	const draft = builder.draft;
	return draft?.kind === 'reshape_shoreline' ? draft.outline : context.layout.outline;
}
