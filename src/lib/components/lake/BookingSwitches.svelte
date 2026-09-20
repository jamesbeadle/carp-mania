<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import { isSyndicateWater } from '$lib/domain/water/syndicate';
	import { formatMoney } from '$lib/format/money';

	let { lake }: { lake: Lake } = $props();

	const isSyndicate = $derived(isSyndicateWater(lake));
	const syndicateWords = $derived(isSyndicate ? `Syndicate running: ${lake.syndicate_places_for_sale} places left at ${formatMoney(lake.syndicate_price)} a year — no day tickets while it runs.` : 'A syndicate sells once a fishery year: members fish free, nobody else fishes at all.');
</script>

<form method="POST" action="?/turnOnBooking" class="mt-4 flex flex-wrap items-center gap-3 text-sm text-mist-200">
	<input type="hidden" name="isBookingOn" value={lake.is_booking_on ? 'false' : 'true'} />
	<span class="min-w-0 flex-1 basis-56">{lake.is_booking_on ? 'Advance booking is on: anglers book a peg and a ticket for a day.' : 'Walk-on water: anglers buy a ticket when they arrive.'}</span>
	<button class="button-secondary px-3 py-1 text-base whitespace-nowrap">{lake.is_booking_on ? 'Go back to walk-on' : 'Turn on advance booking'}</button>
</form>
<form method="POST" action="?/sellSyndicate" class="mt-3 flex flex-wrap items-end gap-2 text-sm text-mist-200">
	<span class="w-full text-xs text-mist-400">{syndicateWords}</span>
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Places</span>
		<input name="places" type="number" min="0" max="500" value={lake.syndicate_places_for_sale} class="field w-24" />
	</label>
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Price a year (£)</span>
		<input name="price" type="number" min="0" max="50000" value={Number(lake.syndicate_price)} class="field w-28" />
	</label>
	<button class="button-secondary px-3 py-1 text-base">{isSyndicate ? 'Update the syndicate' : 'Sell a syndicate'}</button>
</form>
