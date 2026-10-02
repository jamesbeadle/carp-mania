<script lang="ts">
	import type { BadgeMetal } from '$lib/domain/badges/badgeRules';
	import { BadgeMetalLabels } from '$lib/domain/badges/badgeRules';
	import { BadgePalette } from './badgePalette';

	let { name, metal, isLarge = false }: { name: string; metal: BadgeMetal; isLarge?: boolean } = $props();

	const paint = $derived(BadgePalette[metal]);
</script>

<span
	class={['pin inline-flex shrink-0 items-center justify-center rounded-full border-4 text-center font-display font-extrabold tracking-wide uppercase italic', isLarge ? 'h-20 w-20 text-xs' : 'h-14 w-14 text-[9px]']}
	style="background: {paint.face}; border-color: {paint.rim}; color: {paint.ink}"
	title="{BadgeMetalLabels[metal]} badge"
>
	<span class="px-1 leading-tight">{name}</span>
</span>

<style>
	.pin {
		box-shadow:
			inset 0 2px 0 rgba(255, 255, 255, 0.45),
			inset 0 -3px 0 rgba(0, 0, 0, 0.25),
			0 3px 6px rgba(0, 0, 0, 0.45);
	}
</style>
