<script lang="ts">
	import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
	import { brandLabelOf, tileNameOf, tileStatOf, tileStockOf } from '$lib/game/tackle/tileWords';

	let { owned, isChosen, onChoose }: { owned: OwnedItem; isChosen: boolean; onChoose: () => void } = $props();
</script>

<button
	type="button"
	class="tile shrink-0 snap-start rounded-xl border px-3 py-2 text-left transition active:scale-95"
	class:border-volt-500={isChosen}
	class:bg-volt-500-10={isChosen}
	class:shadow-volt={isChosen}
	class:border-carbon-600={!isChosen}
	class:bg-carbon-950={!isChosen}
	aria-pressed={isChosen}
	title={owned.item.label}
	onclick={onChoose}
>
	<span class="block truncate text-[0.65rem] tracking-wide uppercase" class:text-volt-300={isChosen} class:text-mist-400={!isChosen}>{brandLabelOf(owned.item)}</span>
	<span class="block truncate font-display text-sm font-bold text-mist-100">{tileNameOf(owned.item)}</span>
	<span class="block truncate text-xs text-mist-300">{tileStatOf(owned.item)}</span>
	<span class="block truncate text-[0.65rem] text-mist-400">{tileStockOf(owned)}</span>
</button>

<style>
	.tile {
		width: 9.5rem;
	}
	.bg-volt-500-10 {
		background: color-mix(in srgb, var(--color-volt-500) 12%, var(--color-carbon-950));
	}
</style>
