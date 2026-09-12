<script lang="ts">
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';

	let { isNight, hasBailiff }: { isNight: boolean; hasBailiff: boolean } = $props();

	const window = $derived(isNight ? Paint.WindowLit : Paint.Window);
</script>

<svg viewBox="0 0 160 96" class="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
	<g class="smoke" fill={Paint.Smoke}>
		<circle cx="118" cy="18" r="4" />
		<circle cx="123" cy="10" r="5" />
		<circle cx="130" cy="3" r="6" />
	</g>
	<rect x="112" y="18" width="9" height="16" fill={Paint.TimberDark} />
	<path d="M20 44 80 14l60 30z" fill={Paint.Roof} />
	<path d="M28 44h104v50H28z" fill={Paint.Wall} />
	<path d="M20 44h120l-4 5H24z" fill={Paint.TimberDark} />
	<rect x="40" y="56" width="20" height="16" rx="1.5" fill={window} class:lit={isNight} />
	<rect x="100" y="56" width="20" height="16" rx="1.5" fill={window} class:lit={isNight} />
	<path d="M50 56v16M40 64h20M110 56v16M100 64h20" stroke={Paint.TimberDark} stroke-width="1.5" />
	<rect x="70" y="60" width="20" height="34" rx="2" fill={Paint.TimberDark} />
	<circle cx="86" cy="78" r="1.6" fill={Paint.TimberPale} />
	<rect x="24" y="90" width="112" height="6" fill={Paint.TimberDark} />
	<g transform="translate(10 0)">
		<rect x="2" y="70" width="2.5" height="24" fill={Paint.TimberDark} />
		<rect x="0" y="62" width="6.5" height="9" rx="1" fill={Paint.Timber} />
		<circle cx="3.2" cy="66.5" r="2" fill={isNight ? Paint.WindowLit : Paint.PaperOld} class:lit={isNight} />
	</g>
	{#if hasBailiff}
		<g transform="translate(140 0)">
			<circle cx="8" cy="62" r="5" fill={Paint.Skin} />
			<path d="M2 60c0-4 3-7 6-7s6 3 6 7z" fill={Paint.Hat} />
			<rect x="0" y="58" width="16" height="3" rx="1" fill={Paint.Hat} />
			<path d="M3 68h10l2 16H1z" fill={Paint.Jacket} />
			<path d="M4 84h3v10H4zM9 84h3v10H9z" fill={Paint.TimberDark} />
		</g>
	{/if}
</svg>

<style>
	.smoke {
		animation: drift 6s ease-in-out infinite;
	}
	.lit {
		filter: drop-shadow(0 0 4px hsl(44 95% 62%));
	}
	@keyframes drift {
		0%,
		100% {
			transform: translate(0, 0);
			opacity: 0.6;
		}
		50% {
			transform: translate(4px, -5px);
			opacity: 0.3;
		}
	}
</style>
