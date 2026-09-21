<script lang="ts">
	import type { TackleKind } from '$lib/domain/tackle/kinds';
	import { ownedOfKind, type OwnedItem } from '$lib/domain/tackle/tackleBox';
	import ChoiceTile from './ChoiceTile.svelte';

	let { slot, label, box, value = $bindable() }: { slot: TackleKind; label: string; box: OwnedItem[]; value: string } = $props();

	const choices = $derived(ownedOfKind(box, slot));
	const chosen = $derived(choices.find((owned) => owned.itemId === value) ?? null);
</script>

<div class="min-w-0">
	<p class="stat-label mb-1 flex items-baseline gap-2">{label} <span class="truncate text-xs normal-case tracking-normal text-mist-300">{chosen ? chosen.item.label : 'nothing owned'}</span></p>
	<div class="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={label}>
		{#each choices as owned (owned.itemId)}
			<ChoiceTile {owned} isChosen={owned.itemId === value} onChoose={() => (value = owned.itemId)} />
		{/each}
	</div>
</div>
