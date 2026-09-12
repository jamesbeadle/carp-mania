<script lang="ts">
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { BuilderTools, ToolCatalogue } from '$lib/game/builder/toolCatalogue';
	import ToolGlyph from './ToolGlyph.svelte';

	let { builder }: { builder: BuilderState } = $props();
</script>

<nav class="rail panel flex flex-row gap-1 overflow-x-auto p-2 lg:w-36 lg:flex-col lg:overflow-visible" aria-label="Groundworks tools">
	{#each BuilderTools as tool (tool)}
		{@const isChosen = builder.tool === tool}
		<button
			class="flex shrink-0 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 font-display text-sm font-bold tracking-wide uppercase transition active:scale-95 lg:flex-row lg:justify-start lg:gap-2 lg:text-base"
			class:bg-volt-500={isChosen}
			class:text-carbon-950={isChosen}
			class:text-mist-200={!isChosen}
			class:hover:bg-carbon-700={!isChosen}
			aria-pressed={isChosen}
			onclick={() => builder.choose(tool)}>
			<span class="shrink-0"><ToolGlyph {tool} /></span>
			<span>{ToolCatalogue[tool].label}</span>
		</button>
	{/each}
</nav>

<style>
	.rail {
		scrollbar-width: none;
	}
	.rail::-webkit-scrollbar {
		display: none;
	}
</style>
