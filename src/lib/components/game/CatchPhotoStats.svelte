<script lang="ts">
	import { StrainCatalogue } from '$lib/domain/strains';
	import type { LandedFish } from '$lib/game/session/landFish';
	import { SwimFeatureLabels } from '$lib/format/labels';
	import StatRow from '../stats/StatRow.svelte';

	let { landed }: { landed: LandedFish } = $props();

	const NeverCaught = 0;
	const isNewToTheBook = $derived(!landed.carp.is_catalogued);
	const timesBefore = $derived(landed.carp.times_caught);
	const stats = $derived([
		{ label: 'Strain', value: StrainCatalogue[landed.carp.strain].label, tone: 'volt' as const },
		{ label: 'From', value: landed.swim.name },
		{ label: 'Cast to', value: SwimFeatureLabels[landed.terrain.feature], caption: `in ${landed.terrain.depthFeet} ft` },
		{ label: 'Fame', value: String(landed.carp.fame) }
	]);
	const bookWords = $derived(bookVerdict());

	function bookVerdict() {
		if (isNewToTheBook) return `Nobody had seen this fish before — it is in the book now as ${landed.carp.name}.`;
		if (timesBefore === NeverCaught) return 'First time this fish has been on the bank.';
		return `Caught ${timesBefore} ${timesBefore === 1 ? 'time' : 'times'} before.`;
	}
</script>

<StatRow {stats} />
<p class="mt-2 text-sm text-mist-200">{bookWords}</p>
