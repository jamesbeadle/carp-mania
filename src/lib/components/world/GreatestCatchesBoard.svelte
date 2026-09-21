<script lang="ts">
	import type { HallOfFameCatch } from '$lib/contracts/HallOfFame';
	import { formatWeight } from '$lib/format/weight';

	interface Props {
		catches: HallOfFameCatch[];
		selectedLakeId: string | null;
		viewerId: string | null;
		onPick: (lakeId: string) => void;
	}

	let { catches, selectedLakeId, viewerId, onPick }: Props = $props();
</script>

<section class="flex flex-col rounded-2xl border border-carbon-700 bg-carbon-950/85 backdrop-blur">
	<div class="flex items-baseline gap-2 px-4 pt-3 pb-1">
		<h2 class="font-display text-base font-extrabold tracking-wide text-volt-300 uppercase italic">Greatest catches</h2>
		<a href="/world/hall-of-fame" class="ml-auto text-xs whitespace-nowrap text-surge-400 hover:underline">Hall of fame →</a>
	</div>
	{#if catches.length === 0}
		<p class="px-4 pb-4 text-sm text-mist-400">The first great fish is still out there.</p>
	{:else}
		<ol class="max-h-[22rem] divide-y divide-carbon-700/60 overflow-y-auto px-2 pb-2">
			{#each catches as caught, index (caught.catchId)}
				{@const isViewers = caught.anglerId === viewerId}
				{@const isSelected = caught.lakeId === selectedLakeId}
				<li>
					<button class="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-carbon-800/70" class:bg-volt-500-10={isSelected} onclick={() => onPick(caught.lakeId)}>
						<span class="w-5 shrink-0 font-display text-lg leading-tight font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
						<span class="min-w-0 flex-1">
							<span class="flex items-baseline gap-2"><span class="font-display text-base leading-tight font-bold text-volt-300 tabular-nums">{formatWeight(caught.weightLb)}</span><span class="min-w-0 truncate text-sm text-mist-100">{caught.fishName}</span></span>
							<span class="block truncate text-xs text-mist-400">{caught.anglerName}{isViewers ? ' (you)' : ''} · {caught.lakeName}</span>
						</span>
					</button>
				</li>
			{/each}
		</ol>
	{/if}
</section>

<style>
	.bg-volt-500-10 {
		background: color-mix(in srgb, var(--color-volt-500) 12%, transparent);
	}
</style>
