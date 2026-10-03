<script lang="ts">
	import type { PortraitLook, PortraitPart } from '$lib/domain/portrait/portraitLook';
	import { Fisherman, Fisherwoman, rolledLook } from '$lib/domain/portrait/portraitPresets';
	import PartPicker from './PartPicker.svelte';
	import PortraitFrame from './PortraitFrame.svelte';
	import { PortraitPickers } from './portraitChoices';
	import StepFooter from './StepFooter.svelte';

	let { look = $bindable(), onnext, onback }: { look: PortraitLook; onnext: () => void; onback: () => void } = $props();

	let spinCount = $state(0);

	function choose(part: PortraitPart, choice: number) {
		look = { ...look, [part]: choice };
	}

	function rollTheDice() {
		look = rolledLook(Math.random);
		spinCount += 1;
	}
</script>

<section class="mx-auto grid w-full max-w-4xl items-start gap-6 md:grid-cols-[auto_1fr]">
	<div class="sticky top-0 z-10 -mx-4 flex items-center gap-4 bg-carbon-950/85 px-4 py-3 backdrop-blur md:top-6 md:mx-0 md:flex-col md:bg-transparent md:p-0 md:backdrop-blur-none">
		{#key spinCount}<div class="pop"><PortraitFrame {look} size="h-24 w-24 md:h-56 md:w-56" /></div>{/key}
		<div class="flex min-w-0 flex-1 flex-col gap-2 md:w-full">
			<div class="flex flex-wrap gap-2 md:justify-center">
				<button type="button" class="button-secondary px-3 py-1 text-sm md:text-base" onclick={() => (look = Fisherman)}>Fisherman</button>
				<button type="button" class="button-secondary px-3 py-1 text-sm md:text-base" onclick={() => (look = Fisherwoman)}>Fisherwoman</button>
			</div>
			<button type="button" class="button-primary py-1.5 text-base" onclick={rollTheDice}>🎲 Surprise me</button>
		</div>
	</div>
	<div class="panel space-y-4">
		<header>
			<p class="stat-label">Step one</p>
			<h2 class="text-3xl text-volt-300">Who's on the bank?</h2>
			<p class="text-sm text-mist-400">This face goes on your licence, the leaderboards and every catch photo.</p>
		</header>
		{#each PortraitPickers as picker (picker.part)}
			<PartPicker title={picker.title} choices={picker.choices} selected={look[picker.part]} onpick={(choice) => choose(picker.part, choice)} />
		{/each}
		<StepFooter {onback} {onnext} nextWords="That's me →" />
	</div>
</section>

<style>
	.pop {
		animation: pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes pop {
		from {
			transform: scale(0.85) rotate(-6deg);
		}
		to {
			transform: none;
		}
	}
</style>
