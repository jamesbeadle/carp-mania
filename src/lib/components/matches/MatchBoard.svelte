<script lang="ts">
	import type { MatchPage } from '$lib/contracts/MatchPage';
	import { leadersOf } from '$lib/domain/matches/matchBoard';
	import { formatWeight } from '$lib/format/weight';

	let { page, isLive }: { page: MatchPage; isLive: boolean } = $props();

	const UnnamedFish = 'a fish nobody named';

	const leaders = $derived(leadersOf(page.board));
	const hasFish = $derived(page.board.some((placing) => placing.catches > 0));
	const isSettled = $derived(page.card.phase === 'settled');
</script>

<section class="panel">
	<div class="mb-3 flex items-baseline gap-3">
		<h2 class="text-2xl text-volt-300">{isSettled ? 'The final board' : 'The board'}</h2>
		{#if isLive}<span class="text-xs text-volt-300">live · refreshes on its own</span>{/if}
	</div>
	{#if page.board.length === 0}
		<p class="text-sm text-mist-400">No one has taken a peg yet.</p>
	{:else}
		<ol class="divide-y divide-carbon-700/60">
			{#each page.board as placing, index (placing.anglerId)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2 text-sm">
					<span class="w-6 font-display text-2xl font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
					<a href="/anglers/{placing.anglerId}" class="text-mist-100 hover:underline">{placing.anglerName}</a>
					{#if hasFish && leaders.mostCatches.has(placing.anglerId)}<span class="rounded-full bg-volt-500/15 px-2 text-xs text-volt-300">most fish</span>{/if}
					{#if hasFish && leaders.biggestFish.has(placing.anglerId)}<span class="rounded-full bg-surge-500/15 px-2 text-xs text-surge-300">biggest</span>{/if}
					<span class="ml-auto whitespace-nowrap text-volt-300">{placing.catches} fish</span>
					<span class="w-full pl-9 text-xs text-mist-400">
						{#if placing.heaviestCarpId}
							best of them <a href="/carp/{placing.heaviestCarpId}" class="hover:underline">{page.carpNames[placing.heaviestCarpId] ?? UnnamedFish}</a> at {formatWeight(placing.heaviestLb)}
						{:else}
							nothing on the mat yet
						{/if}
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
