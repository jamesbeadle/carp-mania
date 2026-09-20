<script lang="ts">
	import type { TackleKind } from '$lib/domain/tackle/kinds';
	import { ownedOfKind, type OwnedItem } from '$lib/domain/tackle/tackleBox';

	let { slot, label, box, value = $bindable() }: { slot: TackleKind; label: string; box: OwnedItem[]; value: string } = $props();

	const choices = $derived(ownedOfKind(box, slot));
	const chosenLabel = $derived(choices.find((owned) => owned.itemId === value)?.item.label ?? label);
</script>

<label class="block min-w-0">
	<span class="stat-label">{label}</span>
	<select bind:value class="field text-sm" title={chosenLabel}>
		{#each choices as owned (owned.itemId)}
			<option value={owned.itemId}>{owned.item.label}</option>
		{/each}
	</select>
</label>
