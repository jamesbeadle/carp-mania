<script lang="ts">
	import type { Notification } from '$lib/domain/worldTypes';
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';
	import PinnedNote from './PinnedNote.svelte';

	let { notifications }: { notifications: Notification[] } = $props();

	const Tilts = [-1.2, 0.8, -0.6, 1.1, -0.9, 0.5];
	const tiltFor = (index: number) => Tilts[index % Tilts.length];
</script>

<section class="rounded-2xl border-8 p-4 shadow-lg shadow-carbon-950/60 sm:p-6" style="border-color: {Paint.TimberDark}; background: {Paint.Timber}">
	{#if notifications.length === 0}
		<div class="rounded-sm px-4 py-6 text-center" style="background: {Paint.PaperOld}; color: {Paint.Ink}">
			<p class="font-display text-2xl font-extrabold tracking-wide uppercase italic">Nothing pinned up</p>
			<p class="mt-1 text-sm">When you are outbid, when a fish sells or arrives, when the diggers finish, when a match is booked on your water or somebody sets a record there, a note goes up here.</p>
		</div>
	{:else}
		<ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each notifications as notification, index (notification.id)}
				<PinnedNote {notification} tilt={tiltFor(index)} />
			{/each}
		</ul>
	{/if}
</section>
