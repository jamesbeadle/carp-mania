<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import { formatMoney } from '$lib/format/money';
	import { timelineOf } from '$lib/game/matches/matchWords';

	let { nextMatch, loadedAt }: { nextMatch: MatchCard | null; loadedAt: string } = $props();
</script>

<section class="panel">
	<p class="stat-label">Matches</p>
	{#if nextMatch === null}
		<p class="mt-1 text-sm text-mist-200">No match on your card. Book a water, set the pot, and see who turns up.</p>
	{:else}
		<h2 class="text-2xl text-volt-300"><a href="/matches/{nextMatch.match.id}" class="hover:underline">{nextMatch.match.title}</a></h2>
		<p class="text-sm text-mist-400">{nextMatch.isHost ? 'You are hosting' : "You're in"} · {nextMatch.lakeName} · {timelineOf(nextMatch.match, nextMatch.phase, new Date(loadedAt))} · pot {formatMoney(nextMatch.pot)}</p>
	{/if}
	<a href="/matches" class="button-secondary mt-4 block text-center">The matches noticeboard</a>
</section>
