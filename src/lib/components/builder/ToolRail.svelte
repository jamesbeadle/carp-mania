<script lang="ts">
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { BuilderTools, ToolCatalogue } from '$lib/game/builder/toolCatalogue';

	let { builder }: { builder: BuilderState } = $props();
</script>

<nav class="panel flex flex-row flex-wrap gap-1 p-2 lg:w-28 lg:flex-col" aria-label="Groundworks tools">
	{#each BuilderTools as tool (tool)}
		<button
			class="rounded-md px-3 py-1.5 text-left font-display text-base font-bold tracking-wide uppercase transition"
			class:bg-volt-500={builder.tool === tool}
			class:text-carbon-950={builder.tool === tool}
			class:text-mist-200={builder.tool !== tool}
			class:hover:bg-carbon-700={builder.tool !== tool}
			onclick={() => builder.choose(tool)}>{ToolCatalogue[tool].label}</button
		>
	{/each}
</nav>
