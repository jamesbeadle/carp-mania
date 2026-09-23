<script lang="ts">
	import { AnglerName } from '$lib/domain/anglerName';
	import { enhance } from '$app/forms';
	import type { FishermanDiary } from '$lib/contracts/FishermanDiary';
	import { placeInTheLine } from '$lib/domain/legacy/diary';
	import PlaceSheet from '../stage/PlaceSheet.svelte';

	let { diary, lakeName, failure, isOpen, onClose }: { diary: FishermanDiary; lakeName: string; failure: string | null; isOpen: boolean; onClose: () => void } = $props();

	const pattern = AnglerName.Allowed.source.slice(1, -1);
	const old = $derived(diary.current);
</script>

<PlaceSheet title="The last cast" {isOpen} {onClose}>
	<p class="stat-label">{old.name}, {diary.age} · {placeInTheLine(old.generation)}</p>
	<p class="text-mist-100">
		The rods are packed away. {old.name} has fished {lakeName} for a lifetime and will not fish it again — the water, the money, the tackle and the book
		of fish all pass to the next of the line. The catches stay in {old.name}'s scrapbook, where they belong.
	</p>
	<p class="text-sm text-mist-400">The heir starts young, with a head start from everything the old man taught them. Their own catches, records and personal bests begin at nothing.</p>
	<form method="POST" action="/home?/nameHeir" use:enhance class="space-y-3">
		<label>
			<span class="stat-label">Name the heir</span>
			<input class="field" name="heirName" minlength={AnglerName.ShortestLength} maxlength={AnglerName.LongestLength} {pattern} placeholder="Who takes the rods? One word, like YoungTom" required autocomplete="off" />
		</label>
		{#if failure}<p class="text-sm text-danger-400">{failure}</p>{/if}
		<button class="button-primary w-full">Hand it all down</button>
	</form>
	<button class="w-full text-center text-xs text-mist-400 hover:text-mist-100" onclick={onClose}>Not yet — one more look at the water</button>
</PlaceSheet>
