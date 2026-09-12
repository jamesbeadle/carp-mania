<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import type { Profile } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import type { LakeForAnglers } from '$lib/server/queries/GetLake';

	interface Props {
		water: LakeForAnglers;
		profile: Profile;
		runningMatch: MatchCard | null;
		knownCarpCount: number;
	}

	let { water, profile, runningMatch, knownCarpCount }: Props = $props();

	const isOwnWater = $derived(water.lake.owner_id === profile.id);
	const isBookedOut = $derived(runningMatch !== null && !runningMatch.isEntered);
	const isFishingTheMatch = $derived(runningMatch !== null && runningMatch.isEntered);
	const buttonWords = $derived(isFishingTheMatch ? 'Fish the match' : isOwnWater ? 'Walk to the lake' : 'Buy a day ticket');
</script>

<h1 class="mb-1 text-4xl text-volt-300">{water.lake.name}</h1>
<p class="mb-6 text-sm text-mist-400">{water.ownerName}'s water · reputation {Math.round(Number(water.lake.reputation))} · {knownCarpCount} carp</p>
<section class="panel max-w-xl">
	{#if runningMatch !== null && isBookedOut}
		<h2 class="mb-2 text-2xl text-volt-300">Booked for {runningMatch.match.title}</h2>
		<p class="mb-4 text-mist-200">The water is closed to everyone but the entrants until the match ends. Take a peg while there is one, or come back later.</p>
		<a href="/matches/{runningMatch.match.id}" class="button-secondary inline-block">See the match</a>
	{:else}
		<h2 class="mb-2 text-2xl text-volt-300">{isFishingTheMatch ? 'Match in play' : 'Day ticket'}</h2>
		<p class="mb-4 text-mist-200">
			{#if runningMatch !== null && isFishingTheMatch}You're in {runningMatch.match.title} — no ticket needed, every fish you land counts on the board.
			{:else if isOwnWater}It's your own water — no ticket needed.
			{:else}A day here costs {formatMoney(water.lake.day_ticket_fee)}. You have {formatMoney(profile.money)}.{/if}
		</p>
		<form method="POST" action="?/buyTicket">
			<button class="button-primary px-8 py-3 text-lg">{buttonWords}</button>
		</form>
	{/if}
</section>
