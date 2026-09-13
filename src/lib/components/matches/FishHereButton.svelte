<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import GoFishingButton from '../game/GoFishingButton.svelte';

	interface Props {
		lake: Pick<Lake, 'id' | 'day_ticket_fee'>;
		runningMatch: MatchCard | null;
		isOwnWater?: boolean;
		buttonClass?: string;
	}

	let { lake, runningMatch, isOwnWater = false, buttonClass = 'button-primary' }: Props = $props();

	const isBookedOut = $derived(runningMatch !== null && !runningMatch.isEntered);
	const words = $derived(wordsFor(isOwnWater, runningMatch?.isEntered === true, Number(lake.day_ticket_fee)));

	function wordsFor(isOwn: boolean, isFishingTheMatch: boolean, fee: number) {
		if (isFishingTheMatch) return 'Fish the match';
		if (isOwn) return 'Go fishing';
		return `Fish here for ${formatMoney(fee)}`;
	}
</script>

{#if runningMatch !== null && isBookedOut}
	<a href="/matches/{runningMatch.match.id}" class="button-secondary">Booked for {runningMatch.match.title}</a>
{:else}
	<GoFishingButton lakeId={lake.id} {words} {buttonClass} />
{/if}
