<script lang="ts">
	import type { Notification } from '$lib/domain/worldTypes';
	import { formatWhen } from '$lib/format/dates';
	import { humanise } from '$lib/format/labels';
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';

	let { notification, tilt, markReadAction }: { notification: Notification; tilt: number; markReadAction: string } = $props();

	const isUnread = $derived(notification.read_at === null);
	const paper = $derived(isUnread ? Paint.Paper : Paint.PaperOld);
</script>

<li class="note relative flex flex-col gap-2 rounded-sm px-4 pt-6 pb-4 shadow-lg shadow-carbon-950/70" style="background: {paper}; color: {Paint.Ink}; --tilt: {tilt}deg" class:opacity-80={!isUnread}>
	<span class="pin absolute top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full" style="background: {Paint.Pin}" aria-hidden="true"></span>
	<p class="font-display text-xs font-bold tracking-widest uppercase opacity-70">{humanise(notification.kind)} · {formatWhen(notification.created_at)}</p>
	<h2 class="font-display text-2xl leading-tight font-extrabold tracking-wide uppercase italic">{notification.title}</h2>
	<p class="text-sm">{notification.body}</p>
	<div class="mt-auto flex items-center gap-3 pt-2">
		<a href={notification.link} class="rounded-md bg-carbon-950 px-3 py-1 font-display text-base font-bold tracking-wide text-mist-100 uppercase italic transition hover:bg-carbon-800 active:scale-95">Open</a>
		{#if isUnread}
			<form method="POST" action={markReadAction}>
				<input type="hidden" name="notificationId" value={notification.id} />
				<button class="text-sm underline opacity-70 hover:opacity-100">Take it down</button>
			</form>
		{/if}
	</div>
</li>

<style>
	.note {
		transform: rotate(var(--tilt));
		transition: transform 0.15s ease-out;
	}
	.note:hover {
		transform: rotate(0deg) scale(1.02);
	}
	.pin {
		box-shadow:
			inset -1px -1px 2px rgba(0, 0, 0, 0.35),
			0 2px 3px rgba(0, 0, 0, 0.45);
	}
</style>
