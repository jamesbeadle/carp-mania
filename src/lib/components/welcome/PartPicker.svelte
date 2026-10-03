<script lang="ts">
	import type { PartChoice } from './portraitChoices';

	let { title, choices, selected, onpick }: { title: string; choices: PartChoice[]; selected: number; onpick: (choice: number) => void } = $props();
</script>

<fieldset class="min-w-0">
	<legend class="stat-label mb-1.5">{title}</legend>
	<div class="flex flex-wrap gap-1.5">
		{#each choices as choice, index (choice.label)}
			{@const isChosen = index === selected}
			{#if choice.swatch}
				<button type="button" class="h-9 w-9 rounded-full border-2 transition active:scale-90 {isChosen ? 'scale-110 border-volt-400 shadow-volt' : 'border-carbon-600'}" style="background: {choice.swatch}" aria-label={choice.label} aria-pressed={isChosen} onclick={() => onpick(index)}></button>
			{:else}
				<button type="button" class="rounded-full border px-3 py-1.5 font-display text-sm font-bold tracking-wide uppercase italic transition active:scale-95 {isChosen ? 'border-volt-500 bg-volt-500 text-carbon-950' : 'border-carbon-600 bg-carbon-900 text-mist-200 hover:border-volt-500/60'}" aria-pressed={isChosen} onclick={() => onpick(index)}>{choice.label}</button>
			{/if}
		{/each}
	</div>
</fieldset>
