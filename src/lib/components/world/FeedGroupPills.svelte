<script lang="ts">
	import type { FeedGroup, FeedGroupChoice } from '$lib/domain/world/feedGroups';

	interface Props {
		groups: FeedGroupChoice[];
		chosen: FeedGroup | null;
		onChoose: (group: FeedGroup | null) => void;
	}

	let { groups, chosen, onChoose }: Props = $props();

	const Everything = { group: null, label: 'Everything' } as const;
	const choices = $derived([Everything, ...groups]);
</script>

<div class="flex flex-wrap gap-1" role="group" aria-label="Which events">
	{#each choices as choice (choice.label)}
		{@const isChosen = choice.group === chosen}
		<button
			class="rounded-full px-2.5 py-0.5 text-xs font-medium transition"
			class:bg-volt-500={isChosen}
			class:text-carbon-950={isChosen}
			class:bg-carbon-800={!isChosen}
			class:text-mist-400={!isChosen}
			class:hover:text-mist-100={!isChosen}
			aria-pressed={isChosen}
			onclick={() => onChoose(choice.group)}>{choice.label}</button
		>
	{/each}
</div>
