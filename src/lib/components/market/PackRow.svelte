<script lang="ts">
	import type { PackOnShelf } from '$lib/contracts/FarmShelves';
	import { packFishPrice } from '$lib/domain/market/farmPacks';
	import type { Farm } from '$lib/domain/market/farms';
	import { formatMoney } from '$lib/format/money';

	interface Props {
		farm: Farm;
		pack: PackOnShelf;
		transportCost: number;
		money: number;
		isForSale?: boolean;
	}

	let { farm, pack, transportCost, money, isForSale = true }: Props = $props();

	let count = $state(1);
	const isSoldOut = $derived(pack.left === 0);
	const mostAllowed = $derived(Math.max(1, pack.left));
	const wanted = $derived(Math.min(Math.max(1, Math.floor(count)), mostAllowed));
	const total = $derived(packFishPrice(pack, wanted) + transportCost);
	const canAfford = $derived(money >= total);
	const canBuy = $derived(isForSale && !isSoldOut && canAfford);
	const buttonTitle = $derived(buttonTitleFor());
	const band = $derived(pack.band);
	const ageWords = $derived(`${band.ageYears} years old`);

	function buttonTitleFor() {
		if (!isForSale) return `${farm.name} does not sell to your water yet`;
		return canAfford ? `Buy ${wanted} from ${farm.name}` : `You need ${formatMoney(total)}`;
	}
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
	<span class="font-medium text-mist-100">{band.fromLb}–{band.toLb} lb</span>
	<span class="text-xs text-mist-400">{ageWords} · condition {pack.conditionLowest}–{pack.conditionHighest} · {formatMoney(pack.price)} a fish</span>
	<span class="text-xs" class:text-mist-400={!isSoldOut} class:text-danger-400={isSoldOut}>{isSoldOut ? 'Sold out this week' : `${pack.left} of ${pack.count} left`}</span>
	<form method="POST" action="?/buy" class="ml-auto flex items-center gap-2">
		<input type="hidden" name="farmId" value={farm.id} />
		<input type="hidden" name="packId" value={pack.id} />
		<input name="count" type="number" min="1" max={mostAllowed} step="1" bind:value={count} class="field w-20 py-1 text-sm" disabled={isSoldOut || !isForSale} aria-label="How many" />
		<button class="button-secondary px-3 py-1 text-base" disabled={!canBuy} title={buttonTitle}>Buy for {formatMoney(total)}</button>
	</form>
</li>
