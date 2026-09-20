<script lang="ts">
	import { TackleKindLabels, type TackleKind } from '$lib/domain/tackle/kinds';
	import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
	import OwnedLine from './OwnedLine.svelte';

	let { kind, owned }: { kind: TackleKind; owned: OwnedItem[] } = $props();

	const spoiled = $derived(owned.filter((line) => line.isSpoiled));
	const fresh = $derived(owned.filter((line) => !line.isSpoiled));
</script>

<section class="panel">
	<h2 class="text-xl text-volt-300">{TackleKindLabels[kind]}</h2>
	{#if owned.length === 0}
		<p class="mt-2 text-sm text-mist-400">Nothing yet. <a href="/market" class="text-surge-400 hover:underline">The counter has some.</a></p>
	{:else}
		<ul class="mt-2">
			{#each fresh as line (line.itemId)}<OwnedLine {line} />{/each}
			{#each spoiled as line (line.itemId)}<OwnedLine {line} />{/each}
		</ul>
	{/if}
</section>
