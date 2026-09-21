<script lang="ts">
	import { doesKindRunOut } from '$lib/domain/tackle/kinds';
	import type { TackleItem } from '$lib/domain/tackle/tackleItem';

	let { item, isAffordable }: { item: TackleItem; isAffordable: boolean } = $props();

	const OnePack = 1;
	const MostPacks = 20;
</script>

<form method="POST" action="?/buy" class="flex items-center gap-2">
	<input type="hidden" name="itemId" value={item.id} />
	{#if doesKindRunOut(item.kind)}<input name="packs" type="number" min={OnePack} max={MostPacks} value={OnePack} class="field w-16 py-1 text-sm" aria-label="How many packs" />{:else}<input type="hidden" name="packs" value={OnePack} />{/if}
	<button class="button-primary px-4 py-1.5 text-sm" disabled={!isAffordable} title={isAffordable ? `Buy ${item.label}` : 'Not enough money'}>Buy</button>
</form>
