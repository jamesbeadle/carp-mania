<script lang="ts">
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import LicenceCard from '$lib/components/welcome/LicenceCard.svelte';
	import NamePicker from '$lib/components/welcome/NamePicker.svelte';
	import PortraitCreator from '$lib/components/welcome/PortraitCreator.svelte';
	import WelcomeIntro from '$lib/components/welcome/WelcomeIntro.svelte';
	import WelcomeProgress from '$lib/components/welcome/WelcomeProgress.svelte';
	import WelcomeScene from '$lib/components/welcome/WelcomeScene.svelte';
	import { Fisherman } from '$lib/domain/portrait/portraitPresets';

	let { data, form } = $props();

	const Stage = { Intro: 0, Look: 1, Name: 2, Licence: 3 } as const;
	const ProgressSteps = ['Your look', 'Your name', 'Your licence'];
	const StageEntrance = { Distance: 40, Milliseconds: 320 } as const;

	const draft = untrack(() => data.draft);
	const isBackFromSigning = untrack(() => Boolean(form));
	let stage = $state<number>(isBackFromSigning ? Stage.Licence : Stage.Intro);
	let look = $state(draft.look ?? Fisherman);
	let name = $state(draft.name);
	const isPastTheIntro = $derived(stage > Stage.Intro);

	function goTo(next: number) {
		stage = next;
		window.scrollTo({ top: 0 });
	}
</script>

<svelte:head><title>Welcome to the bank · Carp Mania</title></svelte:head>

<WelcomeScene>
	{#if isPastTheIntro}<WelcomeProgress current={stage - 1} steps={ProgressSteps} />{/if}
	<ActionMessage {form} />
	{#key stage}
		<div in:fly={{ x: StageEntrance.Distance, duration: StageEntrance.Milliseconds }}>
			{#if stage === Stage.Intro}
				<WelcomeIntro onbegin={() => goTo(Stage.Look)} />
			{:else if stage === Stage.Look}
				<PortraitCreator bind:look onback={() => goTo(Stage.Intro)} onnext={() => goTo(Stage.Name)} />
			{:else if stage === Stage.Name}
				<NamePicker bind:name {look} onback={() => goTo(Stage.Look)} onnext={() => goTo(Stage.Licence)} />
			{:else}
				<LicenceCard {name} {look} purse={draft.purse} onback={() => goTo(Stage.Name)} />
			{/if}
		</div>
	{/key}
</WelcomeScene>
