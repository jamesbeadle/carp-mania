<script lang="ts">
	import type { Trophy } from '$lib/domain/matches/matchTypes';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import { TrophyWords } from '$lib/game/matches/matchWords';

	let { trophies }: { trophies: Trophy[] } = $props();

	const featOf = (trophy: Trophy) => (trophy.kind === 'most_catches' ? `${trophy.catches} fish` : formatWeight(trophy.heaviest_lb));
</script>

<section class="panel">
	<h2 class="mb-3 text-xl text-volt-300">The trophy cabinet</h2>
	{#if trophies.length === 0}
		<p class="text-sm text-mist-400">Nothing on the shelf. Win a match and it goes here.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60">
			{#each trophies as trophy (trophy.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
					<span class="text-volt-300">🏆</span>
					<span class="text-mist-100">
						{#if trophy.match_id}<a href="/matches/{trophy.match_id}" class="hover:underline">{trophy.match_title}</a>{:else}{trophy.match_title}{/if}
					</span>
					<span class="text-mist-400">{TrophyWords[trophy.kind].toLowerCase()}, {featOf(trophy)} · {trophy.lake_name} · {formatMoney(trophy.prize)}</span>
					<span class="ml-auto text-xs text-mist-400">{formatWhen(trophy.won_at)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
