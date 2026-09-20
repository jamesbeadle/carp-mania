<script lang="ts">
	import type { Carp } from '$lib/domain/types';
	import StockRow from './StockRow.svelte';

	interface Props {
		carp: Carp[];
		chosenIds: string[];
		onChosen: (ids: string[]) => void;
		limit?: number;
	}

	let { carp, chosenIds, onChosen, limit = 25 }: Props = $props();

	let isShowingAll = $state(false);
	const visibleCarp = $derived(isShowingAll ? carp : carp.slice(0, limit));
	const isEveryVisibleChosen = $derived(visibleCarp.length > 0 && visibleCarp.every(isChosen));

	function isChosen(fish: Carp) {
		return chosenIds.includes(fish.id);
	}

	function toggle(fish: Carp) {
		const isChosen = chosenIds.includes(fish.id);
		onChosen(isChosen ? chosenIds.filter((id) => id !== fish.id) : [...chosenIds, fish.id]);
	}

	function toggleAllVisible() {
		if (isEveryVisibleChosen) return onChosen(chosenIds.filter((id) => !visibleCarp.some((fish) => fish.id === id)));
		onChosen([...new Set([...chosenIds, ...visibleCarp.map((fish) => fish.id)])]);
	}
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm">
		<thead class="text-left text-mist-400">
			<tr>
				<th class="py-2 pr-3"><input type="checkbox" checked={isEveryVisibleChosen} onchange={toggleAllVisible} aria-label="Choose every fish shown" /></th>
				<th class="py-2 pr-3 font-medium">Name</th>
				<th class="py-2 pr-3 font-medium">Strain</th>
				<th class="py-2 pr-3 font-medium">Weight</th>
				<th class="py-2 pr-3 font-medium">Age</th>
				<th class="py-2 pr-3 font-medium">Condition</th>
				<th class="py-2 pr-3 font-medium">Guide price</th>
				<th class="py-2 font-medium">Caught</th>
			</tr>
		</thead>
		<tbody>
			{#each visibleCarp as fish (fish.id)}
				<StockRow {fish} isChosen={chosenIds.includes(fish.id)} onToggle={toggle} />
			{/each}
		</tbody>
	</table>
</div>
{#if carp.length > limit}
	<button class="mt-3 text-sm text-volt-300 hover:underline" onclick={() => (isShowingAll = !isShowingAll)}>
		{isShowingAll ? 'Show fewer' : `Show all ${carp.length} fish`}
	</button>
{/if}
