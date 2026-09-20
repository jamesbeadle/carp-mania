<script lang="ts">
	import { demandBandOf, demandRatioFor, DemandTerms, DemandWords, pegsPerDayFor, type DemandBand } from '$lib/domain/water/demand';
	import StatTile from '../stats/StatTile.svelte';

	let { anglersWanting, swimCount }: { anglersWanting: number; swimCount: number } = $props();

	const DemandTone: Record<DemandBand, 'mist' | 'volt' | 'warning' | 'danger'> = { quiet: 'mist', busy: 'volt', turning_away: 'warning', waiting_list: 'danger' };
	const ratio = $derived(demandRatioFor(anglersWanting, swimCount));
	const band = $derived(demandBandOf(ratio));
	const words = $derived(DemandWords[band]);
	const pegsADay = $derived(Math.round(pegsPerDayFor(swimCount)));
	const shareOfTurningAway = $derived(ratio / DemandTerms.TurningAwayBelow);
</script>

<StatTile label="Demand" value={ratio.toFixed(2)} caption={words.state} share={shareOfTurningAway} tone={DemandTone[band]} verdict={words.advice}>
	{#snippet why()}
		{anglersWanting} anglers want to fish for {pegsADay} pegs a day. Demand is the one divided by the other: quiet below {DemandTerms.QuietBelow}, busy to {DemandTerms.BusyBelow}, turning anglers away to {DemandTerms.TurningAwayBelow}, a waiting list past that.
	{/snippet}
</StatTile>
