<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
	import type { Profile } from '$lib/domain/types';
	import type { LakeForAnglers } from '$lib/server/queries/GetLake';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import TicketOfficeStats from './TicketOfficeStats.svelte';
	import TicketPicker from './TicketPicker.svelte';

	interface Props {
		water: LakeForAnglers;
		profile: Profile;
		book: TicketProduct[];
		runningMatch: MatchCard | null;
		knownCarpCount: number;
		streakIfFishedToday: number;
	}

	let { water, profile, book, runningMatch, knownCarpCount, streakIfFishedToday }: Props = $props();

	const isOwnWater = $derived(water.lake.owner_id === profile.id);
	const isBookedOut = $derived(runningMatch !== null && !runningMatch.isEntered);
	const isFishingTheMatch = $derived(runningMatch !== null && runningMatch.isEntered);
	const freeWords = $derived(isFishingTheMatch ? 'Fish the match' : 'Walk to the lake');
	const noTicketWords = $derived(noTicketNeeded());

	function noTicketNeeded() {
		if (runningMatch !== null && isFishingTheMatch) return `You're in ${runningMatch.match.title} — no ticket needed, every fish you land counts on the board.`;
		if (isOwnWater) return 'Your own water — no ticket needed. Pick the hours you want to sit.';
		return null;
	}
</script>

<p class="stat-label">{water.ownerName}'s water</p>
<h1 class="mb-6 text-4xl text-volt-300">{water.lake.name}</h1>
<section class="panel max-w-xl">
	{#if runningMatch !== null && isBookedOut}
		<h2 class="mb-2 text-2xl text-volt-300">Booked for {runningMatch.match.title}</h2>
		<p class="mb-4 text-mist-200">Closed to everyone but the entrants until the match ends.</p>
		<a href="/matches/{runningMatch.match.id}" class="button-secondary inline-block">See the match</a>
	{:else}
		<h2 class="mb-4 text-2xl text-volt-300">{isFishingTheMatch ? 'Match in play' : 'The ticket office'}</h2>
		<TicketOfficeStats lake={water.lake} carp={water.carp} {knownCarpCount} money={Number(profile.money)} {streakIfFishedToday} />
		{#if noTicketWords}<p class="mt-3 text-sm text-volt-300">{noTicketWords}</p>{/if}
		{#if water.lake.is_barbed_banned}<p class="mt-3 text-sm text-warning-500">Barbless only on this water.</p>{/if}
		<div class="mt-2 border-t border-carbon-700/60">
			<TicketPicker {book} money={Number(profile.money)} isFree={isOwnWater || isFishingTheMatch} {freeWords} />
		</div>
		<div class="mt-2">
			<AboutToggle title="About the hours">First light and the evening into the dark are when the big fish feed. A day ticket runs seven till seven; a night ticket goes into the dark and out the other side; a 24-hour ticket has both magic windows in it.</AboutToggle>
		</div>
	{/if}
</section>
