<script lang="ts">
	import { AnglerName, anglerNameRuleWords } from '$lib/domain/anglerName';

	let { name }: { name: string } = $props();

	let isEditing = $state(false);
	const pattern = $derived(AnglerName.Allowed.source.slice(1, -1));
</script>

{#if isEditing}
	<form method="POST" action="?/rename" class="flex flex-wrap items-center gap-2">
		<input name="name" value={name} minlength={AnglerName.ShortestLength} maxlength={AnglerName.LongestLength} {pattern} required class="field font-display text-3xl" aria-label="Angler name" />
		<button class="button-primary">Fish as this</button>
		<button type="button" class="button-secondary" onclick={() => (isEditing = false)}>Cancel</button>
		<p class="basis-full text-xs text-mist-400">{anglerNameRuleWords()}. It follows you onto every catch and record.</p>
	</form>
{:else}
	<div class="flex flex-wrap items-baseline gap-3">
		<h1 class="text-4xl text-volt-300">{name}</h1>
		<button type="button" class="text-sm text-mist-400 hover:text-mist-100" onclick={() => (isEditing = true)}>Change name</button>
	</div>
{/if}
