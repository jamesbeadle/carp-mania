<script lang="ts">
	import { stockBySize, type SizeBandName } from '$lib/domain/stock/stockBySize';
	import type { Carp } from '$lib/domain/types';
	import { formatWeight } from '$lib/format/weight';

	interface Props {
		carp: Carp[];
		chosenBand: SizeBandName | null;
		onChoose: (band: SizeBandName | null) => void;
	}

	let { carp, chosenBand, onChoose }: Props = $props();

	const counts = $derived(stockBySize(carp));
</script>

<div class="mb-4 flex flex-wrap gap-2">
	<button class="size-pill" class:is-chosen={chosenBand === null} onclick={() => onChoose(null)}>All · {carp.length}</button>
	{#each counts as line (line.band.name)}
		<button
			class="size-pill"
			class:is-chosen={chosenBand === line.band.name}
			disabled={line.count === 0}
			title={line.count > 0 ? `Heaviest ${formatWeight(line.heaviestLb)}` : 'None in the water'}
			onclick={() => onChoose(line.band.name)}
		>
			{line.band.label} · {line.count}
		</button>
	{/each}
</div>

<style>
	.size-pill {
		border-radius: 9999px;
		padding: 0.25rem 0.75rem;
		font-size: 0.8rem;
		background: var(--color-carbon-800);
		color: var(--color-mist-200);
	}
	.size-pill:disabled {
		opacity: 0.4;
	}
	.size-pill.is-chosen {
		background: var(--color-volt-500);
		color: var(--color-carbon-950);
	}
</style>
