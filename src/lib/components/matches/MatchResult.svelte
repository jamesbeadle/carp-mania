<script lang="ts">
	import type { Trophy } from '$lib/domain/matches/matchTypes';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import { TrophyWords } from '$lib/game/matches/matchWords';

	let { trophies }: { trophies: Trophy[] } = $props();

	const featOf = (trophy: Trophy) => (trophy.kind === 'most_catches' ? `${trophy.catches} fish` : formatWeight(trophy.heaviest_lb));
</script>

<section class="panel border-volt-500/40">
	<h2 class="mb-3 text-2xl text-volt-300">The result</h2>
	<ul class="grid gap-3 sm:grid-cols-2">
		{#each trophies as trophy (trophy.id)}
			<li class="rounded-xl border border-carbon-600/80 bg-carbon-900/60 p-3">
				<p class="stat-label">{TrophyWords[trophy.kind]}</p>
				<p class="text-xl text-mist-100"><a href="/anglers/{trophy.profile_id}" class="hover:underline">{trophy.angler_name}</a></p>
				<p class="text-sm text-mist-400">{featOf(trophy)} · {formatMoney(trophy.prize)}</p>
			</li>
		{/each}
	</ul>
</section>
