<script lang="ts">
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	interface Props {
		pin: WorldPin;
		x: number;
		y: number;
		isOnTheLeft: boolean;
	}

	let { pin, x, y, isOnTheLeft }: Props = $props();

	const OffsetFromPointerPx = 14;

	const shift = $derived(isOnTheLeft ? `calc(-100% - ${OffsetFromPointerPx}px)` : `${OffsetFromPointerPx}px`);
</script>

<div
	class="pointer-events-none absolute z-10 w-52 rounded-lg border border-carbon-700 bg-carbon-900/95 p-3 text-xs shadow-lg shadow-carbon-950/80"
	style="left: {x}px; top: {y}px; transform: translate({shift}, {OffsetFromPointerPx}px)"
>
	<p class="stat-label text-xs">{pin.ownerName}'s water · {RegionCatalogue[pin.region].label}</p>
	<p class="font-display text-lg font-bold text-volt-300 uppercase italic">{pin.name}</p>
	<dl class="mt-1 grid grid-cols-3 gap-1 text-mist-200">
		<div><dt class="text-mist-400">Reputation</dt><dd>{Math.round(pin.reputation)}</dd></div>
		<div><dt class="text-mist-400">Biggest</dt><dd>{formatWeight(pin.heaviestLb)}</dd></div>
		<div><dt class="text-mist-400">Day ticket</dt><dd>{formatMoney(pin.dayTicketFee)}</dd></div>
	</dl>
</div>
