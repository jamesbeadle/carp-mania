<script lang="ts">
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';

	let { words }: { words: string } = $props();
</script>

<svg viewBox="0 0 160 96" class="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
	<path d="M0 78c20-10 40-10 60-2s40 8 60 0 30-6 40 2v18H0z" fill={Paint.Hedge} />
	<rect x="76" y="20" width="6" height="76" fill={Paint.TimberDark} />
	<rect x="36" y="14" width="88" height="44" rx="2" fill={Paint.SignBoard} stroke={Paint.TimberDark} stroke-width="2" />
	<text x="80" y="34" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="15" fill={Paint.SignText} letter-spacing="1.5">FOR SALE</text>
	<text x="80" y="50" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="9" fill={Paint.Ink} letter-spacing="0.6">{words}</text>
	<circle cx="20" cy="86" r="5" fill={Paint.Hedge} />
	<circle cx="140" cy="84" r="6" fill={Paint.Hedge} />
</svg>
