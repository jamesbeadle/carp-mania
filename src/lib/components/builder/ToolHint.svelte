<script lang="ts">
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { ToolCatalogue } from '$lib/game/builder/toolCatalogue';
	import { wantsTheDetails } from '$lib/game/builder/wantsTheDetails';

	let { builder, onDetails }: { builder: BuilderState; onDetails: () => void } = $props();

	const tool = $derived(ToolCatalogue[builder.tool]);
	const hasDetails = $derived(wantsTheDetails(builder));
</script>

<div class="mt-2 flex items-center gap-3 lg:hidden">
	<p class="min-w-0 flex-1 text-sm text-mist-200"><span class="font-display font-bold tracking-wide text-volt-300 uppercase">{tool.label}</span> · {builder.notice ?? tool.hint}</p>
	{#if hasDetails}<button class="button-primary shrink-0 px-3 py-1.5 text-base" onclick={onDetails}>Details</button>{/if}
</div>
