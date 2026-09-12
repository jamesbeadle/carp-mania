<script lang="ts" generics="Choice extends string | number">
	interface Props {
		choices: readonly Choice[];
		chosen: Choice;
		labelFor: (choice: Choice) => string;
		onChoose: (choice: Choice) => void;
		ariaLabel: string;
	}

	let { choices, chosen, labelFor, onChoose, ariaLabel }: Props = $props();
</script>

<div class="grid gap-1 rounded-xl border border-carbon-600 bg-carbon-950 p-1" style="grid-template-columns: repeat({choices.length}, minmax(0, 1fr))" role="group" aria-label={ariaLabel}>
	{#each choices as choice (choice)}
		{@const isChosen = choice === chosen}
		<button
			type="button"
			class="rounded-lg py-2 font-display text-base font-bold tracking-wide uppercase transition active:scale-95"
			class:bg-volt-500={isChosen}
			class:text-carbon-950={isChosen}
			class:text-mist-200={!isChosen}
			aria-pressed={isChosen}
			onclick={() => onChoose(choice)}>{labelFor(choice)}</button
		>
	{/each}
</div>
