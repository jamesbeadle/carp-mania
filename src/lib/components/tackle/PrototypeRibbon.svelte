<script lang="ts">
	import { isPrototypeItemId, prototypeItem } from '$lib/domain/tackle/prototypes';

	let { itemIds }: { itemIds: (string | null | undefined)[] } = $props();

	const prototypeIds = $derived(itemIds.filter((itemId): itemId is string => typeof itemId === 'string' && isPrototypeItemId(itemId)));
	const prototypes = $derived(prototypeIds.flatMap((itemId) => prototypeItem(itemId) ?? []));
</script>

{#each prototypes as item (item.id)}
	<span class="rounded-full border border-warning-500/50 bg-warning-500/15 px-2 text-xs text-warning-500" title="Landed on a one-of-one">{item.label}</span>
{/each}
