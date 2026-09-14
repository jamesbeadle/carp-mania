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
		overTheSky?: Snippet;
		belowTheBank?: Snippet;
	}

	let { lake, swims, carp, conditions, showingAt = [], overTheSky, belowTheBank }: Props = $props();
</script>

<SceneStage {conditions} {overTheSky} {belowTheBank}>
	{#snippet water()}
		<LakeCanvas {lake} {swims} {carp} {showingAt} />
	{/snippet}
</SceneStage>
