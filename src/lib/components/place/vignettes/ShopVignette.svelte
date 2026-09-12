<script lang="ts">
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';

	let { isNight }: { isNight: boolean } = $props();

	const Stripes = [0, 1, 2, 3, 4, 5, 6];
	const window = $derived(isNight ? Paint.WindowLit : Paint.Window);
</script>

<svg viewBox="0 0 160 96" class="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
	<rect x="18" y="20" width="124" height="76" fill={Paint.Wall} />
	<rect x="14" y="14" width="132" height="14" rx="2" fill={Paint.SignBoard} />
	<text x="80" y="25" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="11" fill={Paint.Ink} letter-spacing="1.5">TACKLE &amp; BAIT</text>
	<g>
		{#each Stripes as stripe (stripe)}
			<rect x={16 + stripe * 18.3} y="30" width="18.3" height="12" fill={stripe % 2 === 0 ? Paint.Awning : Paint.AwningStripe} />
			<path d="M{16 + stripe * 18.3} 42h18.3l-9.15 6z" fill={stripe % 2 === 0 ? Paint.Awning : Paint.AwningStripe} />
		{/each}
	</g>
	<rect x="26" y="52" width="60" height="34" rx="1.5" fill={window} class:lit={isNight} />
	<path d="M30 84 44 58M40 84 54 58M50 84 64 58" stroke={Paint.TimberDark} stroke-width="1.6" />
	<rect x="98" y="52" width="26" height="42" rx="2" fill={Paint.TimberDark} />
	<circle cx="118" cy="74" r="1.6" fill={Paint.TimberPale} />
	<rect x="98" y="60" width="26" height="10" fill={window} opacity="0.7" />
	<rect x="18" y="90" width="124" height="6" fill={Paint.TimberDark} />
	<rect x="132" y="48" width="8" height="46" fill={Paint.TimberDark} />
	<rect x="20" y="48" width="8" height="46" fill={Paint.TimberDark} />
</svg>

<style>
	.lit {
		filter: drop-shadow(0 0 5px hsl(44 95% 62%));
	}
</style>
