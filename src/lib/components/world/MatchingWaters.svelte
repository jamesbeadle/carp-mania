<script lang="ts">
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import { formatWeight } from '$lib/format/weight';

	interface Props {
		matches: WorldPin[];
		totalCount: number;
		selectedPinId: string | null;
		onPick: (pin: WorldPin) => void;
	}

	let { matches, totalCount, selectedPinId, onPick }: Props = $props();

	const MatchesShown = 8;

	const shown = $derived(matches.slice(0, MatchesShown));
	const headline = $derived(matches.length === totalCount ? `${totalCount} waters` : `${matches.length} of ${totalCount} waters`);
</script>

<div>
	<p class="stat-label mb-1">{headline}</p>
	<ul class="divide-y divide-carbon-700/60 text-sm">
		{#each shown as pin (pin.id)}
			<li>
				<button class="flex w-full items-baseline gap-2 py-1.5 text-left transition hover:text-volt-300" class:text-volt-300={pin.id === selectedPinId} class:text-mist-100={pin.id !== selectedPinId} onclick={() => onPick(pin)}>
					<span class="min-w-0 truncate">{pin.name}</span>
					<span class="ml-auto text-xs whitespace-nowrap text-mist-400">{Math.round(pin.reputation)} · {formatWeight(pin.heaviestLb)}</span>
				</button>
			</li>
		{/each}
	</ul>
	<a href="/lakes" class="mt-2 inline-block text-xs text-surge-400 hover:underline">All waters as a list →</a>
</div>
