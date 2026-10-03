<script lang="ts">
	import { FacilityCatalogue } from '$lib/domain/groundworks/facilities';
	import { carParkOf } from '$lib/domain/groundworks/sites/carParkOf';
	import { carParkSummary } from '$lib/domain/groundworks/sites/carParkEffects';
	import type { Facility } from '$lib/domain/layout/layoutTypes';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { startMoving, startUpgradingTheCarPark } from '$lib/game/builder/placement/placementDrafts';
	import type { ToolContext } from '$lib/game/builder/tools/toolHandlers';

	let { builder, facility, context }: { builder: BuilderState; facility: Facility; context: ToolContext } = $props();

	const profile = $derived(FacilityCatalogue[facility]);
	const carPark = $derived(facility === 'car_park' ? carParkOf(context.layout) : null);
</script>

<div class="space-y-2">
	<p class="font-display text-lg font-bold text-mist-100 uppercase">{profile.label}</p>
	{#if carPark}<p class="text-sm text-volt-300">{carParkSummary(carPark)}</p>{/if}
	<p class="text-xs text-mist-400">{profile.blurb}</p>
	<div class="flex gap-2">
		<button class="button-secondary flex-1 px-2 py-1 text-base" onclick={() => startMoving(builder, facility, context)}>Move it</button>
		{#if carPark}<button class="button-primary flex-1 px-2 py-1 text-base" onclick={() => startUpgradingTheCarPark(builder, context)}>Upgrade</button>{/if}
	</div>
</div>
