<script lang="ts">
	import { PlacePalette as Paint } from '$lib/game/scene/placePalette';

	const Arms = [
		{ y: 22, label: 'THE WORLD', isPointingRight: true },
		{ y: 40, label: 'HALL OF FAME', isPointingRight: false },
		{ y: 58, label: 'ANGLERS', isPointingRight: true }
	];
	const Arm = { Width: 70, Height: 14, Nose: 8, FontSize: 7.5, LetterSpacing: 0.3 } as const;
</script>

<svg viewBox="0 0 160 96" class="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
	<rect x="76" y="8" width="8" height="88" fill={Paint.TimberDark} />
	<circle cx="80" cy="8" r="5" fill={Paint.Timber} />
	{#each Arms as arm (arm.label)}
		{#if arm.isPointingRight}
			<path d="M80 {arm.y}h{Arm.Width}l{Arm.Nose} {Arm.Height / 2}-{Arm.Nose} {Arm.Height / 2}H80z" fill={Paint.TimberPale} stroke={Paint.TimberDark} stroke-width="1.2" />
			<text x={80 + Arm.Width / 2 + 1} y={arm.y + 10} text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size={Arm.FontSize} fill={Paint.Ink} letter-spacing={Arm.LetterSpacing}>{arm.label}</text>
		{:else}
			<path d="M80 {arm.y}H{80 - Arm.Width}l-{Arm.Nose} {Arm.Height / 2} {Arm.Nose} {Arm.Height / 2}H80z" fill={Paint.TimberPale} stroke={Paint.TimberDark} stroke-width="1.2" />
			<text x={80 - Arm.Width / 2 - 1} y={arm.y + 10} text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size={Arm.FontSize} fill={Paint.Ink} letter-spacing={Arm.LetterSpacing}>{arm.label}</text>
		{/if}
	{/each}
	<ellipse cx="80" cy="94" rx="22" ry="3" fill={Paint.Earth} opacity="0.6" />
</svg>
