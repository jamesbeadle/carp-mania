<script lang="ts">
	import { AnglerName } from '$lib/domain/anglerName';
	import { rolledAnglerHandle, rolledAnglerHandles } from '$lib/domain/naming/anglerHandles';
	import type { PortraitLook } from '$lib/domain/portrait/portraitLook';
	import NameVerdict from './NameVerdict.svelte';
	import PortraitFrame from './PortraitFrame.svelte';
	import StepFooter from './StepFooter.svelte';
	import { NameCheck } from './nameCheck.svelte';

	let { name = $bindable(), look, onnext, onback }: { name: string; look: PortraitLook; onnext: () => void; onback: () => void } = $props();

	const IdeaCount = 4;
	const pattern = AnglerName.InputPattern;
	const nameCheck = new NameCheck();
	let ideas = $state(rolledAnglerHandles(Math.random, IdeaCount));

	$effect(() => {
		nameCheck.check(name);
		return () => nameCheck.cancel();
	});

	function rollIdeas() {
		ideas = rolledAnglerHandles(Math.random, IdeaCount);
	}
</script>

<section class="panel mx-auto w-full max-w-2xl space-y-5">
	<header class="flex items-center gap-4">
		<PortraitFrame {look} size="h-20 w-20" />
		<div>
			<p class="stat-label">Step two</p>
			<h2 class="text-3xl text-volt-300">What do they call you?</h2>
			<p class="text-sm text-mist-400">One name, yours alone. It's shouted across the lake when you land a big one.</p>
		</div>
	</header>
	<div class="flex gap-2">
		<input bind:value={name} minlength={AnglerName.ShortestLength} maxlength={AnglerName.LongestLength} {pattern} required autocomplete="off" autocapitalize="off" spellcheck="false" class="field font-display text-3xl font-bold italic" aria-label="Angler name" />
		<button type="button" class="button-secondary px-3 text-2xl" aria-label="Roll a name" onclick={() => (name = rolledAnglerHandle(Math.random))}>🎲</button>
	</div>
	<NameVerdict availability={nameCheck.availability} isChecking={nameCheck.isChecking} />
	<div>
		<p class="stat-label mb-1.5">Need an idea?</p>
		<div class="flex flex-wrap gap-1.5">
			{#each ideas as idea (idea)}
				<button type="button" class="rounded-full border border-carbon-600 bg-carbon-900 px-3 py-1.5 text-sm text-mist-200 transition hover:border-volt-500/60 active:scale-95" onclick={() => (name = idea)}>{idea}</button>
			{/each}
			<button type="button" class="px-2 text-sm text-surge-400 hover:underline" onclick={rollIdeas}>More ↻</button>
		</div>
	</div>
	<StepFooter {onback} {onnext} nextWords="Print my licence →" isNextBlocked={!nameCheck.isFree(name)} />
</section>
