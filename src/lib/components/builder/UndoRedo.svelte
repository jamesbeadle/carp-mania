<script lang="ts">
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';

	let { builder }: { builder: BuilderState } = $props();

	const history = $derived(builder.history);
</script>

<div class="mt-2 flex justify-end gap-2">
	<button class="button-secondary px-3 py-1 text-sm" disabled={!history.canUndo} onclick={() => builder.undo()} title="Undo (Ctrl+Z)">↶ Undo</button>
	<button class="button-secondary px-3 py-1 text-sm" disabled={!history.canRedo} onclick={() => builder.redo()} title="Redo (Ctrl+Shift+Z)">↷ Redo</button>
</div>
