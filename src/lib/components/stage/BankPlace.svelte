<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { BankPlace } from '$lib/game/stage/bankPlaces';
	import PlaceGlyph from './PlaceGlyph.svelte';

	interface Props {
		place: BankPlace;
		at: LayoutPoint;
		badge?: number;
		isAttentionNeeded?: boolean;
		onOpen: (place: BankPlace) => void;
	}

	let { place, at, badge = 0, isAttentionNeeded = false, onOpen }: Props = $props();

	const PercentScale = 100;
</script>

<button
	class="place group pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-none"
	style="left: {at.x * PercentScale}%; top: {at.y * PercentScale}%"
	onclick={() => onOpen(place)}
	aria-label={place.label}
>
	<span class="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-volt-300/70 bg-carbon-950/85 text-volt-300 shadow-lg shadow-carbon-950/60 backdrop-blur transition group-hover:scale-110 group-hover:border-volt-400 group-active:scale-95" class:beckoning={isAttentionNeeded}>
		<PlaceGlyph kind={place.id} />
		{#if badge > 0}
			<span class="absolute -top-1 -right-1 min-w-5 rounded-full bg-volt-500 px-1.5 py-0.5 text-center text-xs leading-none font-bold text-carbon-950">{badge}</span>
		{/if}
	</span>
	<span class="rounded-md bg-carbon-950/70 px-2 py-0.5 font-display text-[10px] font-bold tracking-wide whitespace-nowrap text-mist-100 uppercase backdrop-blur sm:text-xs">{place.label}</span>
</button>

<style>
	.place {
		-webkit-tap-highlight-color: transparent;
	}
	.beckoning {
		animation: beckon 1.8s ease-in-out infinite;
	}
	@keyframes beckon {
		0%,
		100% {
			transform: translateY(0);
			box-shadow: 0 0 0 0 rgba(62, 232, 58, 0.45);
		}
		50% {
			transform: translateY(-4px);
			box-shadow: 0 0 0 8px rgba(62, 232, 58, 0);
		}
	}
</style>
