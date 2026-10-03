<script lang="ts">
	import { carParkOf } from '$lib/domain/groundworks/sites/carParkOf';
	import type { CarParkSpec } from '$lib/domain/layout/facilitySite';
	import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { isPlacementDraft } from '$lib/game/builder/placement/placementDrafts';
	import CarParkControls from './CarParkControls.svelte';

	let { builder, layout }: { builder: BuilderState; layout: LakeLayout } = $props();

	const TurnStep = Math.PI / 12;
	const draft = $derived(builder.draft);

	function turn(by: number) {
		if (isPlacementDraft(draft)) builder.place({ ...draft, rotation: draft.rotation + by });
	}

	function respec(carPark: CarParkSpec) {
		if (draft?.kind === 'car_park' || draft?.kind === 'upgrade_car_park') builder.place({ ...draft, carPark });
	}
</script>

{#if isPlacementDraft(draft)}
	<div class="flex gap-2">
		<button class="button-secondary flex-1 px-2 py-1 text-base" onclick={() => turn(-TurnStep)}>⟲ Turn</button>
		<button class="button-secondary flex-1 px-2 py-1 text-base" onclick={() => turn(TurnStep)}>⟳ Turn</button>
	</div>
{/if}
{#if draft?.kind === 'car_park' && draft.carPark}
	<CarParkControls spec={draft.carPark} standing={null} onChange={respec} />
{/if}
{#if draft?.kind === 'upgrade_car_park'}
	<CarParkControls spec={draft.carPark} standing={carParkOf(layout)} onChange={respec} />
{/if}
