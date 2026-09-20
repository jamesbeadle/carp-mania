<script lang="ts">
	import type { Swim } from '$lib/domain/types';

	interface Props {
		swims: Swim[];
		selectedSwimId: string | null;
		isBesideTheWater: boolean;
		onPick: (swim: Swim) => void;
	}

	let { swims, selectedSwimId, isBesideTheWater, onPick }: Props = $props();

	const byName = $derived([...swims].sort((first, second) => first.name.localeCompare(second.name)));
	const columns = $derived(isBesideTheWater ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3');
</script>

<div class="grid gap-2 {columns}">
	{#each byName as swim (swim.id)}
		{@const isHere = swim.id === selectedSwimId}
		<button class="min-w-0 truncate rounded-lg border px-3 py-2 text-left font-display text-sm font-bold tracking-wide uppercase transition hover:border-volt-400 hover:text-volt-300 active:scale-95 disabled:cursor-default disabled:opacity-60" class:border-carbon-700={!isHere} class:border-volt-500={isHere} class:text-mist-100={!isHere} class:text-volt-300={isHere} disabled={isHere} onclick={() => onPick(swim)}>
			{swim.name}
		</button>
	{/each}
</div>
