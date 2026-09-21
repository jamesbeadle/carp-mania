<script lang="ts">
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import { feedLineFor } from '$lib/game/world/feedLine';

	let { feed, onPick }: { feed: WorldActivity[]; onPick: (lakeId: string) => void } = $props();

	const LinesInTheTicker = 12;
	const lines = $derived(feed.slice(0, LinesInTheTicker));
	const isQuiet = $derived(lines.length === 0);
</script>

<div class="ticker flex items-center gap-3 overflow-hidden rounded-xl border border-carbon-700 bg-carbon-950/85 px-3 py-1.5 text-sm backdrop-blur">
	<span class="stat-label shrink-0 text-volt-300">Live</span>
	{#if isQuiet}
		<span class="text-mist-400">Quiet out there — big catches, records and new waters land here as they happen.</span>
	{:else}
		<div class="min-w-0 flex-1 overflow-hidden">
			<div class="reel flex w-max gap-8 whitespace-nowrap">
				{#each [...lines, ...lines] as activity, index (`${activity.id}-${index}`)}
					<button class="shrink-0 text-mist-100 transition hover:text-volt-300" onclick={() => onPick(activity.lakeId)}>{feedLineFor(activity)}</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.reel {
		animation: ticker 90s linear infinite;
	}
	.ticker:hover .reel {
		animation-play-state: paused;
	}
	@keyframes ticker {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.reel {
			animation: none;
		}
	}
</style>
