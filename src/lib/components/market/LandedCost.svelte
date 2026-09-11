<script lang="ts">
	import type { LandedCost } from '$lib/contracts/ListingPage';
	import { landedCost } from '$lib/domain/market/bidRules';
	import { formatMoney } from '$lib/format/money';

	let { landed, price }: { landed: LandedCost; price: number | null } = $props();

	const Kilometres = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
	const daysWord = (days: number) => `${days} ${days === 1 ? 'day' : 'days'}`;
</script>

{#if landed.state !== 'unavailable'}
	<div class="mt-4 border-t border-carbon-700/60 pt-3 text-sm">
		<p class="stat-label mb-1">Landed at your water</p>
		{#if landed.state === 'no_lake'}
			<p class="text-mist-400">You need a water of your own before you can buy fish.</p>
		{:else if landed.state === 'unpinned'}
			<p class="text-mist-400">Pin your water on the globe to see the transport — a fish needs an address to ship to. <a href="/lake" class="text-volt-300 hover:underline">My fishery</a></p>
		{:else if landed.state === 'quoted'}
			<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
				<dt class="text-mist-400">Transport</dt>
				<dd class="text-right text-mist-100">{Kilometres.format(landed.distanceKilometres)} km · {formatMoney(landed.transportCost)}</dd>
				<dt class="text-mist-400">Commission</dt>
				<dd class="text-right text-mist-400">seller pays</dd>
				<dt class="text-mist-400">Arrives</dt>
				<dd class="text-right text-mist-100">
					in {daysWord(landed.transitDays)}{#if landed.quarantineDays > 0}, then {daysWord(landed.quarantineDays)}' quarantine{/if}
				</dd>
				{#if price !== null}
					<dt class="text-mist-400">All in at the current price</dt>
					<dd class="text-right text-volt-300">{formatMoney(landedCost(price, landed.transportCost))}</dd>
				{/if}
			</dl>
		{/if}
	</div>
{/if}
