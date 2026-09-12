<script lang="ts">
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';

	const Planks = [0, 1, 2, 3, 4, 5, 6];
	const Water = 'hsl(200 45% 35%)';
	const WaterLight = 'hsla(190 60% 70% / 0.35)';
</script>

<svg viewBox="0 0 160 96" class="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
	<rect x="0" y="50" width="160" height="46" fill={Water} />
	<g class="ripples" stroke={WaterLight} stroke-width="1.5" fill="none">
		<path d="M8 70c6-3 12-3 18 0M120 62c6-3 12-3 18 0M104 84c6-3 12-3 18 0" />
	</g>
	<rect x="20" y="44" width="6" height="40" fill={Paint.TimberDark} />
	<rect x="62" y="44" width="6" height="44" fill={Paint.TimberDark} />
	<rect x="104" y="44" width="6" height="48" fill={Paint.TimberDark} />
	{#each Planks as plank (plank)}
		<rect x={12 + plank * 15} y="40" width="13" height="8" fill={plank % 2 === 0 ? Paint.Timber : Paint.TimberPale} />
	{/each}
	<rect x="10" y="38" width="108" height="3" fill={Paint.TimberDark} />
	<g transform="translate(96 6)">
		<circle cx="6" cy="8" r="5" fill={Paint.Skin} />
		<path d="M0 6c0-4 3-7 6-7s6 3 6 7z" fill={Paint.Hat} />
		<path d="M1 14h10l2 18H-1z" fill={Paint.Jacket} />
		<path d="M11 18l22-14" stroke={Paint.TimberDark} stroke-width="1.6" stroke-linecap="round" />
		<path d="M33 4l4 50" stroke="hsla(192 100% 70% / 0.55)" stroke-width="0.8" />
	</g>
</svg>

<style>
	.ripples {
		animation: lap 3s ease-in-out infinite;
	}
	@keyframes lap {
		0%,
		100% {
			transform: translateX(0);
			opacity: 0.7;
		}
		50% {
			transform: translateX(3px);
			opacity: 1;
		}
	}
</style>
