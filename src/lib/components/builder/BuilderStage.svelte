<script lang="ts">
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import type { DraftShape } from '$lib/game/render/drawUnderConstruction';
	import { isWebGlAvailable } from '$lib/game/lake3d/lakeRenderer';
	import { stageConditionsFor } from '$lib/game/sky/stageConditions';
	import ViewToggle from '../game/ViewToggle.svelte';
	import LakeFlyover3D from '../lake3d/LakeFlyover3D.svelte';
	import BuilderCanvas from './BuilderCanvas.svelte';

	interface Props {
		builder: BuilderState;
		lake: Lake;
		sceneLake: Lake;
		swims: Swim[];
		sceneSwims: Swim[];
		carp: Carp[];
		drafts: DraftShape[];
	}

	let { builder, lake, sceneLake, swims, sceneSwims, carp, drafts }: Props = $props();

	const PlanHour = 10;
	let isIn3d = $state(false);
	let canShow3d = $state(false);
	const planLight = $derived({ ...stageConditionsFor(lake, new Date()), hour: PlanHour });

	$effect(() => void (canShow3d = isWebGlAvailable()));
</script>

<div class="relative">
	{#if isIn3d}
		<div class="relative aspect-[3/2] overflow-hidden rounded-2xl border border-carbon-700">
			<LakeFlyover3D lake={sceneLake} swims={sceneSwims} {carp} conditions={planLight} isDiorama />
		</div>
	{:else}
		<BuilderCanvas {builder} {lake} {sceneLake} {swims} {sceneSwims} {carp} {drafts} />
	{/if}
	{#if canShow3d}<ViewToggle bind:isIn3d flatLabel="Plan" />{/if}
</div>
