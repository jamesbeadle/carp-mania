<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import LakeCanvas from '../LakeCanvas.svelte';
	import SceneStage from './SceneStage.svelte';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		conditions: StageConditions;
		showingAt?: LayoutPoint[];
		overTheLake?: Snippet;
		overTheSky?: Snippet;
	}

	let { lake, swims, carp, conditions, showingAt = [], overTheLake, overTheSky }: Props = $props();
</script>

<SceneStage {conditions} {overTheLake} {overTheSky}>
	{#snippet water()}
		<LakeCanvas {lake} {swims} {carp} {showingAt} />
	{/snippet}
</SceneStage>
