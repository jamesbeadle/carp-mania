import type { BuilderState } from './builderState.svelte';

const ToolsWithChoices = ['land', 'facility'];

export function wantsTheDetails(builder: BuilderState) {
	if (builder.draft || builder.swimPoint || builder.selectedSwimId) return true;
	return ToolsWithChoices.includes(builder.tool);
}
