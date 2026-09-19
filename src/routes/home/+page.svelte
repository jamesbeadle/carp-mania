<script lang="ts">
	import BailiffNote from '$lib/components/hub/BailiffNote.svelte';
	import HubCaption from '$lib/components/hub/HubCaption.svelte';
	import HubNav from '$lib/components/hub/HubNav.svelte';
	import LastCastSheet from '$lib/components/hub/LastCastSheet.svelte';
	import LakeStage from '$lib/components/stage/LakeStage.svelte';
	import { ambientSceneFor } from '$lib/game/sound/ambience/ambientScene';
	import { sound } from '$lib/game/sound/soundEngine.svelte';
	import { stageConditionsFor } from '$lib/game/sky/stageConditions';
	import { AmbientRises } from '$lib/game/stage/ambientRises.svelte';
	import { StageClock } from '$lib/game/stage/stageClock.svelte';

	let { data, form } = $props();

	const clock = new StageClock();
	const rises = new AmbientRises();
	let isNoteOpen = $state(data.whileAway.daysSimulated > 0 && !data.diary.isRetirementDue);
	let isLastCastOpen = $state(data.diary.isRetirementDue);

	const lake = $derived(data.fishery.lake);
	const conditions = $derived(stageConditionsFor(lake, clock.now));

	$effect(() => clock.start());
	$effect(() => rises.start(lake.layout));
	$effect(() => sound.startAmbience(ambientSceneFor(conditions)));
	$effect(() => () => sound.stopAmbience());

	function close() {
		isNoteOpen = false;
		isLastCastOpen = false;
		sound.play('close');
	}
</script>

<svelte:head><title>{lake.name} · Carp Mania</title></svelte:head>

<div class="h-full">
	<LakeStage {lake} swims={data.fishery.swims} carp={data.fishery.carp} {conditions} showingAt={rises.points}>
		{#snippet overTheSky()}
			<HubCaption profile={data.profile} {lake} {conditions} diary={data.diary} waters={data.waters} biggestFish={data.biggestFish} />
		{/snippet}
		{#snippet belowTheBank()}
			<HubNav {lake} worksInProgress={data.worksInProgress} />
		{/snippet}
	</LakeStage>
</div>

<BailiffNote summary={data.whileAway} isOpen={isNoteOpen} onClose={close} />
<LastCastSheet diary={data.diary} lakeName={lake.name} failure={form?.message ?? null} isOpen={isLastCastOpen} onClose={close} />
