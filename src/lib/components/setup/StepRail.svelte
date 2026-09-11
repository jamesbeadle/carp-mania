<script lang="ts">
	import { reachableSteps, SetupSteps, type SetupProgress, type SetupStep } from '$lib/contracts/SetupProgress';

	let { current, progress }: { current: SetupStep; progress: Pick<SetupProgress, 'step' | 'lake'> } = $props();

	const reachable = $derived(reachableSteps(progress));
	const isDone = (step: SetupStep) => step < current && !reachable.includes(step);
	const isReachable = (step: SetupStep) => reachable.includes(step) && step !== current;
	const Numerals = ['①', '②', '③', '④', '⑤', '⑥'];
</script>

<nav class="mb-6 flex flex-wrap gap-2 border-b border-carbon-700 pb-4" aria-label="Setup steps">
	{#each SetupSteps as { step, label } (step)}
		{#if isReachable(step)}
			<a href="?step={step}" class="rounded-full bg-carbon-800 px-4 py-1.5 font-display text-base font-bold tracking-wide text-mist-200 uppercase italic transition hover:text-volt-400">{Numerals[step - 1]} {label}</a>
		{:else}
			<span
				class="rounded-full px-4 py-1.5 font-display text-base font-bold tracking-wide uppercase italic"
				class:bg-volt-500={step === current}
				class:text-carbon-950={step === current}
				class:text-volt-400={isDone(step)}
				class:text-mist-400={step !== current && !isDone(step)}
				class:opacity-50={step !== current && !isDone(step)}
				aria-current={step === current ? 'step' : undefined}>{isDone(step) ? '✓' : Numerals[step - 1]} {label}</span
			>
		{/if}
	{/each}
</nav>
