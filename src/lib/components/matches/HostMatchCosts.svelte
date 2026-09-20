<script lang="ts">
	import { formatMoney } from '$lib/format/money';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import StatRow from '../stats/StatRow.svelte';

	interface Props {
		lastsHours: number;
		bookingFee: number;
		hostStake: number;
		cost: number;
		fullHouse: number;
		pegs: number;
		money: number;
		isOwnWater: boolean;
	}

	let { lastsHours, bookingFee, hostStake, cost, fullHouse, pegs, money, isOwnWater }: Props = $props();

	const stats = $derived([
		{ label: 'To pay now', value: formatMoney(cost), caption: `you have ${formatMoney(money)}`, tone: 'volt' as const },
		{ label: 'Booking the water', value: isOwnWater ? 'Nothing' : formatMoney(bookingFee), caption: `for ${lastsHours} hours` },
		{ label: 'Your stake', value: formatMoney(hostStake), caption: 'into the pot' },
		{ label: 'Full-house pot', value: formatMoney(fullHouse), caption: `with all ${pegs} pegs taken` }
	]);
</script>

<div class="rounded-xl border border-carbon-600/80 bg-carbon-900/60 p-3">
	<StatRow {stats} />
	<div class="mt-3">
		<AboutToggle title="About the fee">
			{#if isOwnWater}Your own anglers stay away while the match runs, so the day tickets you would have sold are the price.{:else}The owner gets the booking fee — six anglers' tickets an hour — and their water is closed to everyone but your entrants.{/if}
		</AboutToggle>
	</div>
</div>
