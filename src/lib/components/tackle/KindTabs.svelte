<script lang="ts">
	import { TackleKindLabels, TackleKinds, type TackleKind } from '$lib/domain/tackle/kinds';

	let { chosen, countOf, onChoose }: { chosen: TackleKind; countOf: (kind: TackleKind) => number; onChoose: (kind: TackleKind) => void } = $props();
</script>

<nav class="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1" aria-label="Kind of tackle">
	{#each TackleKinds as kind (kind)}
		{@const isChosen = kind === chosen}
		<button
			type="button"
			class="shrink-0 rounded-full px-4 py-1.5 font-display text-sm font-bold tracking-wide uppercase transition active:scale-95"
			class:bg-volt-500={isChosen}
			class:text-carbon-950={isChosen}
			class:bg-carbon-800={!isChosen}
			class:text-mist-200={!isChosen}
			aria-pressed={isChosen}
			onclick={() => onChoose(kind)}>{TackleKindLabels[kind]} <span class="text-xs font-normal opacity-70">{countOf(kind)}</span></button
		>
	{/each}
</nav>
