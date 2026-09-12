<script lang="ts">
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';

	let { noteCount }: { noteCount: number } = $props();

	const Notes = [
		{ x: 30, y: 24, rotate: -4, paper: Paint.Paper },
		{ x: 66, y: 22, rotate: 3, paper: Paint.PaperOld },
		{ x: 102, y: 26, rotate: -2, paper: Paint.Paper },
		{ x: 48, y: 46, rotate: 5, paper: Paint.PaperOld },
		{ x: 86, y: 48, rotate: -3, paper: Paint.Paper }
	];
	const pinned = $derived(Notes.slice(0, Math.max(1, Math.min(Notes.length, noteCount))));
</script>

<svg viewBox="0 0 160 96" class="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
	<rect x="28" y="60" width="6" height="36" fill={Paint.TimberDark} />
	<rect x="126" y="60" width="6" height="36" fill={Paint.TimberDark} />
	<rect x="14" y="10" width="132" height="60" rx="3" fill={Paint.Timber} />
	<rect x="20" y="16" width="120" height="48" rx="2" fill={Paint.TimberPale} />
	<path d="M10 10h140l-4-6H14z" fill={Paint.Roof} />
	{#each pinned as note (note.x)}
		<g transform="translate({note.x} {note.y}) rotate({note.rotate})">
			<rect x="-12" y="-9" width="26" height="20" fill={note.paper} />
			<path d="M-8 -3h18M-8 1h14M-8 5h16" stroke={Paint.Ink} stroke-width="1.2" opacity="0.6" />
			<circle cx="1" cy="-7" r="2.2" fill={Paint.Pin} />
		</g>
	{/each}
</svg>
