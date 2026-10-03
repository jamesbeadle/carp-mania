<script lang="ts">
	let { current, steps }: { current: number; steps: string[] } = $props();
</script>

<ol class="mx-auto mb-6 flex max-w-md items-center justify-center gap-2" aria-label="Making your angler">
	{#each steps as label, index (label)}
		{@const isReached = index <= current}
		<li class="flex items-center gap-2" aria-current={index === current ? 'step' : undefined}>
			<span class="flex h-8 w-8 items-center justify-center rounded-full border-2 font-display font-bold italic transition {isReached ? 'border-volt-500 bg-volt-500 text-carbon-950' : 'border-carbon-600 text-mist-400'}">{index + 1}</span>
			<span class="hidden font-display text-sm tracking-wide whitespace-nowrap uppercase sm:inline {isReached ? 'text-volt-300' : 'text-mist-400'}">{label}</span>
			{#if index < steps.length - 1}<span class="h-0.5 w-6 rounded {index < current ? 'bg-volt-500' : 'bg-carbon-600'}"></span>{/if}
		</li>
	{/each}
</ol>
