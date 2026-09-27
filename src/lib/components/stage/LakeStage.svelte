<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { isWebGlAvailable } from '$lib/game/lake3d/lakeRenderer';
	import ViewToggle from '../game/ViewToggle.svelte';
	import LakeCanvas from '../LakeCanvas.svelte';
	import LakeFlyover3D from '../lake3d/LakeFlyover3D.svelte';
	import SceneStage from './SceneStage.svelte';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		conditions: StageConditions;
		showingAt?: LayoutPoint[];
		overTheSky?: Snippet;
		belowTheBank?: Snippet;
	}

	let { lake, swims, carp, conditions, showingAt = [], overTheSky, belowTheBank }: Props = $props();

	let isIn3d = $state(false);
	let canShow3d = $state(false);

	$effect(() => {
		canShow3d = isWebGlAvailable();
		isIn3d = canShow3d;
	});
</script>

<SceneStage {conditions} {overTheSky} {belowTheBank} isImmersive={isIn3d}>
	{#snippet water()}
		{#if isIn3d}
			<LakeFlyover3D {lake} {swims} {carp} {conditions} {showingAt} />
		{:else}
			<LakeCanvas {lake} {swims} {carp} {showingAt} />
		{/if}
		{#if canShow3d}<ViewToggle bind:isIn3d />{/if}
	{/snippet}
</SceneStage>
