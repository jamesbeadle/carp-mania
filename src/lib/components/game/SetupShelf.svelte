<script lang="ts">
	import { RodSetName } from '$lib/domain/tackle/rodSets';
	import { LastTimeSetId, type RodSetShelf } from '$lib/game/session/rodSetShelf.svelte';

	let { shelf, hasLastTime, onPick, onSave }: { shelf: RodSetShelf; hasLastTime: boolean; onPick: (setId: string) => void; onSave: (name: string) => void } = $props();

	let name = $state('');
	const canSave = $derived(name.trim().length >= RodSetName.ShortestLength && !shelf.isSaving);

	function save(event: SubmitEvent) {
		event.preventDefault();
		onSave(name.trim());
		name = '';
	}
</script>

<div class="space-y-2">
	<p class="stat-label">Your set-ups</p>
	<div class="flex flex-wrap gap-1.5" role="group" aria-label="Saved set-ups">
		{#if hasLastTime}
			<button type="button" class="chip" class:is-chosen={shelf.chosenId === LastTimeSetId} aria-pressed={shelf.chosenId === LastTimeSetId} onclick={() => onPick(LastTimeSetId)}>As you left them</button>
		{/if}
		{#each shelf.sets as set (set.id)}
			<span class="inline-flex items-stretch">
				<button type="button" class="chip rounded-r-none" class:is-chosen={shelf.chosenId === set.id} aria-pressed={shelf.chosenId === set.id} onclick={() => onPick(set.id)}>{set.name} <span class="opacity-60">· {set.rods.length}</span></button>
				<button type="button" class="chip rounded-l-none border-l-0 px-2 text-mist-400 hover:text-danger-400" aria-label="Drop {set.name}" title="Drop this set" onclick={() => shelf.drop(set.id)}>×</button>
			</span>
		{/each}
	</div>
	<form class="flex flex-wrap items-center gap-2" onsubmit={save}>
		<input bind:value={name} maxlength={RodSetName.LongestLength} placeholder="Save these rods as…" class="field w-52 py-1 text-sm" aria-label="Name for this set of rods" />
		<button class="button-secondary px-3 py-1 text-sm" disabled={!canSave}>Save set</button>
		{#if shelf.notice}<span class="text-xs text-volt-300">{shelf.notice}</span>{/if}
	</form>
</div>

<style>
	.chip {
		border: 1px solid var(--color-carbon-600);
		border-radius: 9999px;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		color: var(--color-mist-200);
		background: var(--color-carbon-950);
		transition: color 0.15s, border-color 0.15s;
	}
	.chip.is-chosen {
		border-color: var(--color-volt-500);
		color: var(--color-volt-300);
	}
</style>
