<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import { isSyndicateWater } from '$lib/domain/water/syndicate';

	let { lake }: { lake: Lake } = $props();

	const isSyndicate = $derived(isSyndicateWater(lake));
</script>

<form method="POST" action="?/turnOnBooking" class="mt-4 flex items-center gap-3 text-sm text-mist-200">
	<input type="hidden" name="isBookingOn" value={lake.is_booking_on ? 'false' : 'true'} />
	<span>{lake.is_booking_on ? 'Advance booking is on: anglers book a peg and a ticket for a day.' : 'Walk-on water: anglers buy a ticket when they arrive.'}</span>
	<button class="button-secondary px-3 py-1 text-base">{lake.is_booking_on ? 'Go back to walk-on' : 'Turn on advance booking'}</button>
</form>
<form method="POST" action="?/sellSyndicate" class="mt-3 flex flex-wrap items-end gap-2 text-sm text-mist-200">
	<span class="w-full text-xs text-mist-400">{isSyndicate ? `Syndicate: ${lake.syndicate_places_for_sale} places left at £${Number(lake.syndicate_price)} a year — no day tickets while it runs.` : 'Sell a syndicate: N places at a year\'s price, sold once a fishery year. Members fish free; nobody else fishes at all.'}</span>
	<label class="text-xs text-mist-400">Places<input name="places" type="number" min="0" max="500" value={lake.syndicate_places_for_sale} class="field mt-1 w-24" /></label>
	<label class="text-xs text-mist-400">Price a year (£)<input name="price" type="number" min="0" max="50000" value={Number(lake.syndicate_price)} class="field mt-1 w-28" /></label>
	<button class="button-secondary px-3 py-1 text-base">{isSyndicate ? 'Update the syndicate' : 'Sell a syndicate'}</button>
</form>
