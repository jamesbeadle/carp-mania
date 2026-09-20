<script lang="ts">
	import { doesKindRunOut, UnitWords } from '$lib/domain/tackle/kinds';
	import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
	import { keepingWordsFor, statsWordsFor } from './itemWords';

	let { line }: { line: OwnedItem } = $props();

	const kind = $derived(line.item.kind);
	const quantityWords = $derived(doesKindRunOut(kind) ? `${Math.round(line.quantity)} ${UnitWords[kind]}` : `× ${line.quantity}`);
	const keepingWords = $derived(keepingWordsFor(line));
</script>

<li class="flex flex-wrap items-center gap-x-3 border-t border-carbon-700 py-2 text-sm first:border-t-0">
	<div class="min-w-0 flex-1">
		<p class="font-medium text-mist-100">{line.item.label}</p>
		<p class="text-xs text-mist-400">{statsWordsFor(line.item)}</p>
	</div>
	<span class:text-volt-300={!line.isSpoiled} class:text-danger-400={line.isSpoiled}>{quantityWords}{keepingWords}</span>
</li>
