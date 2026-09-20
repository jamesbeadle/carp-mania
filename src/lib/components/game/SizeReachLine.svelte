<script lang="ts">
	import { NeutralConditionsShare, ratingShareOf, sizeReachOf, sizeReachWords, waterShareOf } from '$lib/domain/fishing/sizeReach';
	import { matchTackleToWater } from '$lib/domain/fishing/tackleMatch';
	import type { Terrain } from '$lib/domain/layout/terrainAt';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Lake } from '$lib/domain/types';

	let { lake, rating, carpCount, terrain, setup }: { lake: Lake; rating: number; carpCount: number; terrain: Terrain; setup: RodSetup } = $props();

	const match = $derived(matchTackleToWater(setup, lake, terrain));
	const shares = $derived({ ratingShare: ratingShareOf(rating), tackleShare: match.overall, conditionsShare: NeutralConditionsShare, waterShare: waterShareOf(lake, carpCount) });
	const words = $derived(sizeReachWords(sizeReachOf(shares), shares));
</script>

<p class="mt-2 text-sm text-volt-300">{words}</p>
