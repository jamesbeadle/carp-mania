<script lang="ts">
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';
</script>

<svg viewBox="0 0 160 96" class="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
	<path d="M4 96c10-26 40-30 60-14 8-12 26-14 36 0z" fill={Paint.Earth} />
	<g class="arm">
		<path d="M96 56 118 22" stroke={Paint.Digger} stroke-width="8" stroke-linecap="round" />
		<path d="M118 22l26 20" stroke={Paint.Digger} stroke-width="7" stroke-linecap="round" />
		<path d="M140 40c8 2 12 10 8 18l-12 4c-4-8-2-16 4-22z" fill={Paint.DiggerDark} />
	</g>
	<rect x="70" y="52" width="40" height="26" rx="4" fill={Paint.Digger} />
	<rect x="80" y="40" width="22" height="18" rx="3" fill={Paint.DiggerDark} />
	<rect x="84" y="44" width="14" height="10" rx="1.5" fill={Paint.Window} />
	<rect x="62" y="76" width="56" height="12" rx="6" fill={Paint.TimberDark} />
	<circle cx="74" cy="82" r="4" fill={Paint.Metal} />
	<circle cx="90" cy="82" r="4" fill={Paint.Metal} />
	<circle cx="106" cy="82" r="4" fill={Paint.Metal} />
	<g transform="translate(20 66)">
		<path d="M0 8h22l-3 12H4z" fill={Paint.Metal} />
		<path d="M22 8l10-6" stroke={Paint.TimberDark} stroke-width="2.5" stroke-linecap="round" />
		<circle cx="3" cy="24" r="4" fill={Paint.TimberDark} />
	</g>
	<rect x="0" y="90" width="160" height="6" fill={Paint.Earth} />
</svg>

<style>
	.arm {
		transform-origin: 96px 56px;
		animation: dig 4s ease-in-out infinite;
	}
	@keyframes dig {
		0%,
		100% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(-8deg);
		}
	}
</style>
